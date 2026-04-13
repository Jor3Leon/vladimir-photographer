const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const sourceDir = path.join(root, 'frontend', 'dist');
const targetDir = path.join(root, 'backend', 'dist');

function removeDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

function copyDir(source, target) {
  if (!fs.existsSync(source)) {
    throw new Error(`Missing build output: ${source}`);
  }

  removeDir(target);
  fs.mkdirSync(target, { recursive: true });
  fs.cpSync(source, target, { recursive: true });
}

try {
  copyDir(sourceDir, targetDir);
  console.log(`Copied ${sourceDir} -> ${targetDir}`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
