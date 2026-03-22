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

async function getProjectWithRepo(projectId, userId) {
  if (!userId) {
    throw createHttpError('Project not found', 404);
  }

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      members: {
        some: {
          userId
        }
      }
    },
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

export async function connectProjectGithubRepoService(projectId, data, userId) {
  if (!userId) {
    throw createHttpError('Project not found', 404);
  }

  const accessibleProject = await prisma.project.findFirst({
    where: {
      id: projectId,
      members: {
        some: {
          userId
        }
      }
    },
    select: { id: true }
  });

  if (!accessibleProject) {
    throw createHttpError('Project not found', 404);
  }

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

export async function getProjectGithubRepoService(projectId, userId) {
  const project = await getProjectWithRepo(projectId, userId);
  const octokit = await getInstallationClient(project.githubOwner, project.githubRepoName);

  const [repoResponse, branchesResponse] = await Promise.all([
    octokit.repos.get({ owner: project.githubOwner, repo: project.githubRepoName }),
    octokit.repos.listBranches({ owner: project.githubOwner, repo: project.githubRepoName, per_page: 100 })
  ]);

  let latestRelease = null;
  try {
    const { data } = await octokit.repos.getLatestRelease({
      owner: project.githubOwner,
      repo: project.githubRepoName
    });

    latestRelease = {
      id: data.id,
      tagName: data.tag_name,
      name: data.name,
      prerelease: Boolean(data.prerelease),
      htmlUrl: data.html_url,
      createdAt: data.created_at,
      publishedAt: data.published_at
    };
  } catch (err) {
    // 404 means no release exists yet.
    if (err?.status !== 404) {
      throw err;
    }
  }

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
    })),
    latestRelease
  };
}

export async function publishProjectGithubReleaseService(projectId, data, userId) {
  const project = await getProjectWithRepo(projectId, userId);
  const octokit = await getInstallationClient(project.githubOwner, project.githubRepoName);

  const tagName = String(data?.tagName || '').trim();
  if (!tagName) {
    throw createHttpError('tagName is required (example: v1.0.0)', 400);
  }

  const releaseName = String(data?.name || tagName).trim();
  const targetCommitish = String(data?.targetCommitish || project.githubDefaultBranch || 'main').trim();

  const releaseResponse = await octokit.repos.createRelease({
    owner: project.githubOwner,
    repo: project.githubRepoName,
    tag_name: tagName,
    target_commitish: targetCommitish,
    name: releaseName,
    body: typeof data?.body === 'string' ? data.body : '',
    prerelease: Boolean(data?.prerelease),
    generate_release_notes: Boolean(data?.generateReleaseNotes)
  });

  const release = releaseResponse.data;
  return {
    id: release.id,
    tagName: release.tag_name,
    name: release.name,
    prerelease: Boolean(release.prerelease),
    htmlUrl: release.html_url,
    createdAt: release.created_at,
    publishedAt: release.published_at,
    targetCommitish
  };
}

async function getTaskWithRepo(featureId, taskId, userId) {
  if (!userId) {
    throw createHttpError('Task not found', 404);
  }

  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      featureId,
      feature: {
        project: {
          members: {
            some: {
              userId
            }
          }
        }
      }
    },
    select: {
      id: true,
      title: true,
      description: true,
      githubIssueId: true,
      feature: {
        select: {
          projectId: true
        }
      }
    }
  });

  if (!task) {
    throw createHttpError('Task not found', 404);
  }

  const project = await getProjectWithRepo(task.feature.projectId, userId);
  return { task, project };
}

export async function createTaskGithubIssueService(featureId, taskId, data, userId) {
  const { task, project } = await getTaskWithRepo(featureId, taskId, userId);
  const octokit = await getInstallationClient(project.githubOwner, project.githubRepoName);

  const issueResponse = await octokit.issues.create({
    owner: project.githubOwner,
    repo: project.githubRepoName,
    title: data.title || task.title,
    body: data.body || task.description || '',
    labels: Array.isArray(data.labels) ? data.labels : undefined
  });

  const issue = issueResponse.data;

  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: {
      githubIssueId: issue.number,
      githubIssueUrl: issue.html_url,
      githubIssueState: issue.state,
      githubIssueSyncedAt: new Date()
    },
    include: {
      feature: true,
      timeLogs: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  return updatedTask;
}

export async function syncGithubCollaboratorsService(projectId, userId) {
  const project = await getProjectWithRepo(projectId, userId);
  const octokit = await getInstallationClient(project.githubOwner, project.githubRepoName);

  const { data: collaborators } = await octokit.repos.listCollaborators({
    owner: project.githubOwner,
    repo: project.githubRepoName,
    per_page: 100,
  });

  const logins = collaborators.map((c) => c.login).filter(Boolean);

  const users = await prisma.user.findMany({
    where: { githubLogin: { in: logins } },
    select: { id: true, githubLogin: true },
  });

  const added = [];
  for (const user of users) {
    await prisma.projectMember.upsert({
      where: { userId_projectId: { userId: user.id, projectId } },
      update: {},
      create: { userId: user.id, projectId, role: 'MEMBER' },
    });
    added.push(user.githubLogin);
  }

  return { synced: added.length, logins: added };
}

export async function syncTaskGithubIssueService(featureId, taskId, userId) {
  const { task, project } = await getTaskWithRepo(featureId, taskId, userId);
  const octokit = await getInstallationClient(project.githubOwner, project.githubRepoName);

  if (!task.githubIssueId) {
    throw createHttpError('Task has no linked GitHub issue', 400);
  }

  const issueResponse = await octokit.issues.get({
    owner: project.githubOwner,
    repo: project.githubRepoName,
    issue_number: task.githubIssueId
  });

  const issue = issueResponse.data;

  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: {
      githubIssueUrl: issue.html_url,
      githubIssueState: issue.state,
      githubIssueSyncedAt: new Date()
    },
    include: {
      feature: true,
      timeLogs: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  return updatedTask;
}