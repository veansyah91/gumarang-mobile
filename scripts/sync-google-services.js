// Node script to copy google-services.json from project root into android/app

const fs = require('fs');
const path = require('path');

const rootFile = path.resolve(process.cwd(), 'google-services.json');
const destDir = path.resolve(process.cwd(), 'android', 'app');
const destFile = path.join(destDir, 'google-services.json');

function main() {
  if (!fs.existsSync(rootFile)) {
    console.log('No google-services.json found in project root. Skipping sync.');
    process.exit(0);
  }

  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  try {
    fs.copyFileSync(rootFile, destFile);
    console.log(`Copied google-services.json to ${destFile}`);
  } catch (err) {
    console.error('Failed to copy google-services.json:', err);
    process.exit(2);
  }
}

main();
