export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d';

export function getJwtSecret() {
  const jwtSecret = process.env.JWT_SECRET?.trim();

  if (!jwtSecret) {
    throw new Error('Missing required environment variable JWT_SECRET');
  }

  return jwtSecret;
}

export function assertRequiredAuthEnv() {
  getJwtSecret();
}