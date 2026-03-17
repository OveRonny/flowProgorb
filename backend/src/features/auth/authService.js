import { prisma } from '../prisma/client.js'; 
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { getJwtSecret, JWT_EXPIRES_IN } from './authConfig.js';

export function signAuthToken(user) {
  return jwt.sign(
    { userId: user.id, email: user.email },
    getJwtSecret(),
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export async function registerUser({ email, password }) {    

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    const err = new Error('User already exists');
    err.status = 409;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword   
    },
  });

  const token = signAuthToken(user);

  return { token, user: { id: user.id, email: user.email } };
}

export async function loginUser({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('Invalid email or password');

  const passwordValid = await bcrypt.compare(password, user.password);
  if (!passwordValid) throw new Error('Invalid email or password');

  const token = signAuthToken(user);

  return { token, user: { id: user.id, email: user.email } };
}

export async function githubOAuthLoginService(code) {
  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  const tokenData = await tokenRes.json();
  if (tokenData.error) {
    const err = new Error(tokenData.error_description || tokenData.error);
    err.status = 401;
    throw err;
  }

  const accessToken = tokenData.access_token;

  const [userRes, emailsRes] = await Promise.all([
    fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}`, 'User-Agent': 'FlowProgorb' },
    }),
    fetch('https://api.github.com/user/emails', {
      headers: { Authorization: `Bearer ${accessToken}`, 'User-Agent': 'FlowProgorb' },
    }),
  ]);

  const githubUser = await userRes.json();
  const emailsList = await emailsRes.json();

  const primaryEmail =
    (Array.isArray(emailsList)
      ? emailsList.find((e) => e.primary && e.verified)?.email
      : null) || githubUser.email;

  if (!primaryEmail) {
    const err = new Error('GitHub account has no verified primary email');
    err.status = 400;
    throw err;
  }

  let user = await prisma.user.findUnique({ where: { email: primaryEmail } });
  if (!user) {
    const randomPass = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10);
    user = await prisma.user.create({ data: { email: primaryEmail, password: randomPass } });
  }

  const token = signAuthToken(user);
  return { token, user: { id: user.id, email: user.email } };
}
