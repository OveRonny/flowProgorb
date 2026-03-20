import express from 'express';
import cors from 'cors';
import authRoutes from './features/auth/authRoutes.js';
import projectRoutes from './features/projects/projectRoutes.js';
import taskRoutes from './features/tasks/taskRoutes.js';
import moduleRoutes from './features/modules/moduleRoutes.js';
import featureRoutes from './features/features/featureRoutes.js';
import technologyRoutes from './features/technologies/routes.js';
import githubRoutes from './features/github/webhookRoutes.js';

export function createApp() {
  const app = express();

  const allowedOrigins = new Set([
    'http://localhost:5173',
    'https://flow.progorb.no',
    process.env.FRONTEND_URL,
  ]);

  function isAllowedOrigin(origin) {
    if (!origin) {
      return true;
    }

    if (allowedOrigins.has(origin)) {
      return true;
    }

    try {
      const { hostname } = new URL(origin);
      return hostname === 'progorb.no' || hostname.endsWith('.progorb.no');
    } catch {
      return false;
    }
  }

  app.use(
    cors({
      origin(origin, callback) {
        if (isAllowedOrigin(origin)) {
          callback(null, true);
        } else {
          callback(null, false);
        }
      },
      credentials: true,
    })
  );

  // GitHub webhook MUST be registered before express.json() so it receives the raw Buffer
  // (express.raw() is applied per-route inside webhookRoutes.js for HMAC verification)
  app.use('/github', githubRoutes);

  app.use(express.json());

  app.use('/api/auth', authRoutes);
  // Also mount at /auth so GitHub OAuth redirect URI (/auth/callback) resolves correctly
  app.use('/auth', authRoutes);
  app.use('/api/projects', projectRoutes);
  app.use('/api/features/:featureId/tasks', taskRoutes);
  app.use('/api/modules', moduleRoutes);
  app.use('/api/projects/:projectId/features', featureRoutes);
  app.use('/api/technologies', technologyRoutes);

  return app;
}