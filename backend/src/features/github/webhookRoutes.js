import express from 'express';
import crypto from 'crypto';
import { prisma } from '../prisma/client.js';

const router = express.Router();

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
    const fullName = repository?.full_name || '';
    const ownerFromFullName = fullName.includes('/') ? fullName.split('/')[0] : undefined;
    const repoOwner = repository?.owner?.login || repository?.owner?.name || ownerFromFullName;
    const repoName = repository?.name;
    

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
    const fullName = repository?.full_name || '';
    const ownerFromFullName = fullName.includes('/') ? fullName.split('/')[0] : undefined;
    const repoOwner = repository?.owner?.login || repository?.owner?.name || ownerFromFullName;
    const repoName = repository?.name;
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

  res.status(200).json({ ok: true });
});

export default router;
