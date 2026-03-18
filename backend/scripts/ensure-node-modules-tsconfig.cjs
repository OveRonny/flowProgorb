const fs = require('node:fs');
const path = require('node:path');

const targetPath = path.resolve(__dirname, '..', 'node_modules', 'tsconfig.json');

const content = JSON.stringify(
  {
    compilerOptions: {
      skipLibCheck: true,
    },
  },
  null,
  2
) + '\n';

try {
  if (!fs.existsSync(targetPath)) {
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.writeFileSync(targetPath, content, 'utf8');
    console.log('Created node_modules/tsconfig.json for editor compatibility');
  }
} catch (error) {
  console.warn('Could not ensure node_modules/tsconfig.json:', error.message);
}
