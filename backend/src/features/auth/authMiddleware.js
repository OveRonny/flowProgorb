import jwt from 'jsonwebtoken';
import { getJwtSecret } from './authConfig.js';
import { prisma } from '../prisma/client.js';

export async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token' });

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, getJwtSecret());

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true }
    });

    if (!user) {
      return res.status(401).json({ message: 'User not found. Please log in again.' });
    }

    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}