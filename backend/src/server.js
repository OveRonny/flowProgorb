import dotenv from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp } from './app.js';
import { assertRequiredAuthEnv } from './features/auth/authConfig.js';

const currentFilePath = fileURLToPath(import.meta.url);
const currentDirPath = dirname(currentFilePath);
dotenv.config({
  path: resolve(currentDirPath, '../.env'),
  override: process.env.NODE_ENV !== 'production',
});

assertRequiredAuthEnv();

const app = createApp();
const PORT = process.env.PORT || 3000;

if (process.argv[1] === currentFilePath) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
