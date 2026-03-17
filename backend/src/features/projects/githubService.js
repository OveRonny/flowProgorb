import { Octokit } from '@octokit/rest';
import { createAppAuth } from '@octokit/auth-app';
import { prisma } from '../prisma/client.js';

function createHttpError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function getAppCredentials() {
  const appId = process.env.GITHUB_APP_ID;
  const privateKey = (process.env.GITHUB_PRIVATE_KEY || '').replace(/\\n/g, '\n');
  if (!appId || !privateKey) {
    throw createHttpError('Missing GITHUB_APP_ID or GITHUB_PRIVATE_KEY in backend environment', 500);
  }
  return { appId, privateKey };
}

// JWT-only client — used to look up installation IDs (no installationId needed)
function getAppOctokit() {
  const { appId, privateKey } = getAppCredentials();
  return new Octokit({
    authStrategy: createAppAuth,
    auth: { appId, privateKey },
  });
}

// Installation-level client — looks up the installation for the given repo dynamically
async function getInstallationClient(owner, repo) {
  const { appId, privateKey } = getAppCredentials();
  const appOctokit = getAppOctokit();

  let installationId;
  try {
    const { data } = await appOctokit.apps.getRepoInstallation({ owner, repo });
    installationId = data.id;
  } catch (err) {
    if (err.status === 404) {
      throw createHttpError(
        `GitHub App is not installed on ${owner}/${repo}. Install the app on that repo first.`,
        400
      );
    }
    throw err;
  }

  return new Octokit({
    authStrategy: createAppAuth,
    auth: { appId, privateKey, installationId },
  });
}

function parseRepoUrl(repoUrl) {
  try {
    const normalized = repoUrl.endsWith('.git') ? repoUrl.slice(0, -4) : repoUrl;
    const url = new URL(normalized);
    const parts = url.pathname.split('/').filter(Boolean);
    if (parts.length < 2) {
      throw new Error('Invalid GitHub repository URL');
    }
    return { owner: parts[0], repo: parts[1] };
  } catch {
    throw createHttpError('Invalid repoUrl. Expected format: https://github.com/<owner>/<repo>', 400);
  }
}

async function getProjectWithRepo(projectId) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      githubOwner: true,
      githubRepoName: true,
      githubRepoUrl: true,
      githubRepoId: true,
      githubDefaultBranch: true
    }
  });

  if (!project) {
    throw createHttpError('Project not found', 404);
  }

  if (!project.githubOwner || !project.githubRepoName) {
    throw createHttpError('Project is not connected to a GitHub repository', 400);
  }

  return project;
}

export async function connectProjectGithubRepoService(projectId, data) {
  let owner = data.owner;
  let repo = data.repo;
  if (data.repoUrl) {
    const parsed = parseRepoUrl(data.repoUrl);
    owner = parsed.owner;
    repo = parsed.repo;
  }

  if (!owner || !repo) {
    throw createHttpError('Provide repoUrl or both owner and repo', 400);
  }

  const octokit = await getInstallationClient(owner, repo);
  const response = await octokit.repos.get({ owner, repo });
  const ghRepo = response.data;

  return prisma.project.update({
    where: { id: projectId },
    data: {
      githubOwner: ghRepo.owner?.login ?? owner,
      githubRepoName: ghRepo.name,
      githubRepoId: ghRepo.id,
      githubDefaultBranch: ghRepo.default_branch,
      githubRepoUrl: ghRepo.html_url
    },
    select: {
      id: true,
      name: true,
      githubOwner: true,
      githubRepoName: true,
      githubRepoId: true,
      githubDefaultBranch: true,
      githubRepoUrl: true
    }
  });
}

export async function getProjectGithubRepoService(projectId) {
  const project = await getProjectWithRepo(projectId);
  const octokit = await getInstallationClient(project.githubOwner, project.githubRepoName);

  const [repoResponse, branchesResponse] = await Promise.all([
    octokit.repos.get({ owner: project.githubOwner, repo: project.githubRepoName }),
    octokit.repos.listBranches({ owner: project.githubOwner, repo: project.githubRepoName, per_page: 100 })
  ]);

  return {
    project,
    repo: {
      id: repoResponse.data.id,
      name: repoResponse.data.name,
      fullName: repoResponse.data.full_name,
      private: repoResponse.data.private,
      defaultBranch: repoResponse.data.default_branch,
      htmlUrl: repoResponse.data.html_url
    },
    branches: branchesResponse.data.map((branch) => ({
      name: branch.name,
      protected: branch.protected
    }))
  };
}

export async function createFeatureGithubIssueService(projectId, featureId, data) {
  const project = await getProjectWithRepo(projectId);
  const octokit = await getInstallationClient(project.githubOwner, project.githubRepoName);

  const feature = await prisma.feature.findFirst({
    where: { id: featureId, projectId },
    select: { id: true, name: true, description: true }
  });

  if (!feature) {
    throw createHttpError('Feature not found for this project', 404);
  }

  const issueTitle = data.title || feature.name;
  const issueBody = data.body || feature.description || '';

  const issueResponse = await octokit.issues.create({
    owner: project.githubOwner,
    repo: project.githubRepoName,
    title: issueTitle,
    body: issueBody,
    labels: Array.isArray(data.labels) ? data.labels : undefined
  });

  const issue = issueResponse.data;

  await prisma.feature.update({
    where: { id: featureId },
    data: {
      githubIssueId: issue.number,
      githubIssueUrl: issue.html_url,
      githubIssueState: issue.state,
      githubSyncedAt: new Date()
    }
  });

  return {
    featureId,
    issue: {
      id: issue.id,
      number: issue.number,
      title: issue.title,
      state: issue.state,
      htmlUrl: issue.html_url
    }
  };
}

export async function syncFeatureGithubIssueService(projectId, featureId) {
  const project = await getProjectWithRepo(projectId);
  const octokit = await getInstallationClient(project.githubOwner, project.githubRepoName);

  const feature = await prisma.feature.findFirst({
    where: { id: featureId, projectId },
    select: {
      id: true,
      githubIssueId: true
    }
  });

  if (!feature) {
    throw createHttpError('Feature not found for this project', 404);
  }

  if (!feature.githubIssueId) {
    throw createHttpError('Feature has no linked GitHub issue', 400);
  }

  const issueResponse = await octokit.issues.get({
    owner: project.githubOwner,
    repo: project.githubRepoName,
    issue_number: feature.githubIssueId
  });

  const issue = issueResponse.data;

  await prisma.feature.update({
    where: { id: featureId },
    data: {
      githubIssueUrl: issue.html_url,
      githubIssueState: issue.state,
      githubSyncedAt: new Date()
    }
  });

  return {
    featureId,
    issue: {
      number: issue.number,
      title: issue.title,
      state: issue.state,
      htmlUrl: issue.html_url
    }
  };
}