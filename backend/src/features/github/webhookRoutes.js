import express from 'express';
import crypto from 'crypto';
import { prisma } from '../prisma/client.js';

const router = express.Router();

function getRepoIdentity(repository) {
  const fullName = repository?.full_name || '';
  const ownerFromFullName = fullName.includes('/') ? fullName.split('/')[0] : undefined;
  return {
    repoOwner: repository?.owner?.login || repository?.owner?.name || ownerFromFullName,
    repoName: repository?.name,
  };
}

function normalizeText(value) {
  return String(value || '').toLowerCase();
}

function extractClosingIssueNumbers(text) {
  const issueNumbers = new Set();
  const pattern = /(close[sd]?|fix(?:e[sd])?|resolve[sd]?)\s+#(\d+)/gi;

  for (const match of text.matchAll(pattern)) {
    issueNumbers.add(Number(match[2]));
  }

  return [...issueNumbers].filter(Number.isInteger);
}

function taskMatchesText(task, text) {
  const titleLower = normalizeText(task.title);
  const mentionedByTitle = titleLower.length > 0 && text.includes(titleLower);
  const mentionedById = new RegExp(`(^|\\s|#|task[-_ ]?)${task.id}(\\b|$)`, 'i').test(text);
  return mentionedByTitle || mentionedById;
}

async function findProjectByRepository(repository) {
  const { repoOwner, repoName } = getRepoIdentity(repository);
  if (!repoOwner || !repoName) {
    return null;
  }

  const project = await prisma.project.findFirst({
    where: { githubOwner: repoOwner, githubRepoName: repoName },
    select: { id: true },
  });

  if (!project) {
    return null;
  }

  return {
    projectId: project.id,
    repoOwner,
    repoName,
  };
}

async function syncPullRequestEvent(payload) {
  const { action, pull_request: pullRequest, repository } = payload;
  if (!pullRequest) {
    return;
  }

  const projectContext = await findProjectByRepository(repository);
  if (!projectContext) {
    return;
  }

  const projectId = projectContext.projectId;
  const branchName = pullRequest.head?.ref || null;
  const prNumber = pullRequest.number;
  const prState = pullRequest.merged ? 'merged' : pullRequest.state;
  const prUrl = pullRequest.html_url || null;
  const prText = [pullRequest.title, pullRequest.body].filter(Boolean).join('\n').trim();
  const closingIssueNumbers = extractClosingIssueNumbers(prText);

  let feature = null;

  if (branchName) {
    feature = await prisma.feature.findFirst({
      where: { projectId, githubBranchName: branchName },
      include: { tasks: true },
    });
  }

  if (!feature && closingIssueNumbers.length > 0) {
    feature = await prisma.feature.findFirst({
      where: {
        projectId,
        githubIssueId: { in: closingIssueNumbers },
      },
      include: { tasks: true },
    });
  }

  if (feature) {
    const featureStatus = pullRequest.merged
      ? 'DONE'
      : ['opened', 'reopened', 'ready_for_review', 'synchronize'].includes(action) && feature.status === 'PLANNED'
        ? 'IN_PROGRESS'
        : undefined;

    await prisma.feature.update({
      where: { id: feature.id },
      data: {
        status: featureStatus,
        githubBranchName: branchName ?? undefined,
        githubPRId: prNumber,
        githubPRUrl: prUrl,
        githubPRState: prState,
        githubSyncedAt: new Date(),
      },
    });
  }

  const tasks = feature?.tasks ?? await prisma.task.findMany({
    where: { feature: { projectId } },
    select: { id: true, title: true, status: true, githubPRId: true },
  });

  const matchedTasks = tasks.filter((task) => {
    if (task.githubPRId === prNumber) {
      return true;
    }

    if (!prText) {
      return false;
    }

    return taskMatchesText(task, prText);
  });

  for (const task of matchedTasks) {
    const nextStatus = pullRequest.merged
      ? 'DONE'
      : ['opened', 'reopened', 'ready_for_review', 'synchronize'].includes(action) && task.status === 'PENDING'
        ? 'IN_PROGRESS'
        : undefined;

    await prisma.task.update({
      where: { id: task.id },
      data: {
        status: nextStatus,
        completedAt: pullRequest.merged ? new Date() : undefined,
        githubPRId: prNumber,
        githubUrl: prUrl,
      },
    });
  }
}

function verifySignature(rawBody, signature) {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret) return true; // skip verification if not configured (dev only)
  if (!signature) return false;

  const expected =
    'sha256=' +
    crypto.createHmac('sha256', secret).update(rawBody).digest('hex');

  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

// Use express.raw() per-route so the raw body is available for HMAC verification
router.post('/webhook', express.raw({ type: '*/*' }), async (req, res) => {
  const sig = req.headers['x-hub-signature-256'];
  const event = req.headers['x-github-event'];
 

  if (!verifySignature(req.body, sig)) {
    console.warn('[Webhook] signature verification FAILED');
    return res.status(401).json({ message: 'Invalid webhook signature' });
  }

  let payload;
  try {
    payload = JSON.parse(req.body.toString('utf8'));
  } catch {
    return res.status(400).json({ message: 'Invalid JSON payload' });
  }

  if (event === 'issues') {
    const { action, issue, repository } = payload;
    const { repoOwner, repoName } = getRepoIdentity(repository);
    

    if (['opened', 'edited', 'closed', 'reopened'].includes(action)) {
      try {
        const feature = await prisma.feature.findFirst({
          where: {
            githubIssueId: issue.number,
            project: {
              githubOwner: repoOwner,
              githubRepoName: repoName,
            },
          },
        });

        if (feature) {
          await prisma.feature.update({
            where: { id: feature.id },
            data: {
              githubIssueState: issue.state,
              githubIssueUrl: issue.html_url,
              githubSyncedAt: new Date(),
            },
          });
         
        }
      } catch (err) {
        console.error('[Webhook] sync error:', err.message);
      }
    }
  }

  if (event === 'push') {
    const { ref, commits = [], repository } = payload;
    const { repoOwner, repoName } = getRepoIdentity(repository);
    const branch = ref?.replace('refs/heads/', ''); 
    
    commits.forEach(c => console.log(`  commit: "${c.message}"`));

    try {
    
      const project = await prisma.project.findFirst({
        where: { githubOwner: repoOwner, githubRepoName: repoName },
        select: { id: true },
      });    

      if (project) {
        
        if (branch) {
          const feature = await prisma.feature.findFirst({
            where: { projectId: project.id, githubBranchName: branch },
          });

          if (!feature) {
            console.log(`[Webhook] no feature with githubBranchName="${branch}" in project ${project.id}`);
          } else {
            console.log(`[Webhook] matched feature ${feature.id} by branch "${branch}"`);
          }

          if (feature && feature.status !== 'IN_PROGRESS') {
            await prisma.feature.update({
              where: { id: feature.id },
              data: { status: 'IN_PROGRESS' },
            });
            
          }
        }

        
        const allMessages = commits.map((c) => c.message?.toLowerCase() || '');
        if (allMessages.length > 0) {
          const tasks = await prisma.task.findMany({
            where: { feature: { projectId: project.id } },
            select: { id: true, title: true, status: true },
          });

          let matchedTasks = 0;

          for (const task of tasks) {
            const titleLower = task.title.toLowerCase();
            const mentionedByTitle = allMessages.some((msg) => msg.includes(titleLower));
            const mentionedById = allMessages.some((msg) => {
              const idPattern = new RegExp(`(^|\\s|#|task[-_ ]?)${task.id}(\\b|$)`);
              return idPattern.test(msg);
            });
            const mentioned = mentionedByTitle || mentionedById;
            if (mentioned && task.status === 'PENDING') {
              await prisma.task.update({
                where: { id: task.id },
                data: { status: 'IN_PROGRESS' },
              });
              matchedTasks += 1;
              console.log(`[Webhook] task ${task.id} "${task.title}" → IN_PROGRESS (commit mention)`);
            }
          
            const closePatterns = ['close', 'closes', 'fix', 'fixes', 'resolve', 'resolves'];
            const closeMentioned = allMessages.some((msg) => {
              const hasKeyword = closePatterns.some((p) => msg.includes(p));
              return hasKeyword && msg.includes(titleLower);
            });
            if (closeMentioned && task.status !== 'DONE') {
              await prisma.task.update({
                where: { id: task.id },
                data: { status: 'DONE', completedAt: new Date() },
              });
              matchedTasks += 1;
              console.log(`[Webhook] task ${task.id} "${task.title}" → DONE (commit close keyword)`);
            }
          }

          if (matchedTasks === 0) {
            console.log(
              `[Webhook] no task match in project ${project.id}. ` +
                'Use commit messages containing task title or task id (example: "fix task 12" or "closes #12").'
            );
          }
        }
      }
    } catch (err) {
      console.error('[Webhook] push sync error:', err.message);
    }
  }

  if (event === 'pull_request') {
    try {
      await syncPullRequestEvent(payload);
    } catch (err) {
      console.error('[Webhook] pull_request sync error:', err.message);
    }
  }

  if (event === 'member') {
    const { action, member, repository } = payload;
    if (action === 'added' && member?.login) {
      try {
        const projectContext = await findProjectByRepository(repository);
        if (projectContext) {
          const user = await prisma.user.findUnique({ where: { githubLogin: member.login } });
          if (user) {
            await prisma.projectMember.upsert({
              where: { userId_projectId: { userId: user.id, projectId: projectContext.projectId } },
              update: {},
              create: { userId: user.id, projectId: projectContext.projectId, role: 'MEMBER' },
            });
            console.log(`[Webhook] GitHub collaborator @${member.login} added to project ${projectContext.projectId}`);
          } else {
            console.log(`[Webhook] GitHub collaborator @${member.login} added but has no FlowProgorb account yet`);
          }
        }
      } catch (err) {
        console.error('[Webhook] member sync error:', err.message);
      }
    }
  }

  res.status(200).json({ ok: true });
});

export default router;
