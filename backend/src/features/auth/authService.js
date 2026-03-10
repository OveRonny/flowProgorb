import { prisma } from '../prisma/client.js'; 
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function registerUser({ email, password }) {    

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error('User already exists'); }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword   
    },
  });

  return user;
}

export async function loginUser({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('Invalid email or password');

  const passwordValid = await bcrypt.compare(password, user.password);
  if (!passwordValid) throw new Error('Invalid email or password');

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET || 'supersecret', 
    { expiresIn: '1h' }
  );

  return { token, user: { id: user.id, email: user.email } };
}
