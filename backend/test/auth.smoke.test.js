import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/flowdb';
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const [{ createApp }, authService, authConfig, authMiddlewareModule] = await Promise.all([
  import('../src/app.js'),
  import('../src/features/auth/authService.js'),
  import('../src/features/auth/authConfig.js'),
  import('../src/features/auth/authMiddleware.js'),
]);

const { signAuthToken } = authService;
const { getJwtSecret } = authConfig;
const { authMiddleware } = authMiddlewareModule;

async function withServer(run) {
  const server = createServer(createApp());
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');

  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    await run(baseUrl);
  } finally {
    server.close();
    await once(server, 'close');
  }
}

test('getJwtSecret returns configured secret', () => {
  assert.equal(getJwtSecret(), process.env.JWT_SECRET);
});

test('authMiddleware accepts tokens signed with the configured secret', async () => {
  const token = signAuthToken({ id: 42, email: 'smoke@example.com' });
  const req = {
    headers: {
      authorization: `Bearer ${token}`,
    },
  };
  const res = {
    status() {
      throw new Error('status should not be called for a valid token');
    },
  };

  await new Promise((resolve, reject) => {
    authMiddleware(req, res, (error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });

  assert.deepEqual(req.user, { userId: 42, email: 'smoke@example.com', iat: req.user.iat, exp: req.user.exp });
  assert.equal(req.user.userId, 42);
  assert.equal(req.user.email, 'smoke@example.com');
});

test('protected project route rejects requests without a token', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/projects`);
    const body = await response.json();

    assert.equal(response.status, 401);
    assert.deepEqual(body, { message: 'No token' });
  });
});

test('protected project route rejects invalid tokens', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/projects`, {
      headers: {
        Authorization: 'Bearer invalid-token',
      },
    });
    const body = await response.json();

    assert.equal(response.status, 401);
    assert.deepEqual(body, { message: 'Invalid token' });
  });
});

test('github oauth callback redirects to login when code is missing', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/auth/callback`, {
      redirect: 'manual',
    });

    assert.equal(response.status, 302);
    assert.equal(response.headers.get('location'), 'http://localhost:5173/login?error=missing_code');
  });
});
