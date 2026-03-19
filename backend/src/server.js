import dotenv from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
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
const isDirectRun =
  process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;

if (isDirectRun) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
