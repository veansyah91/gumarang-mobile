// One-time cleanup script: remove dead/conflicting routes before production build
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

const deadFiles = [
  'app/(app)/gold-list-temp.tsx',
  'app/(app)/purchase-member/[gold-id].tsx',
];

let removed = 0;
for (const rel of deadFiles) {
  const full = path.join(root, rel);
  if (fs.existsSync(full)) {
    fs.unlinkSync(full);
    console.log(`Removed: ${rel}`);
    removed++;
  } else {
    console.log(`Already gone: ${rel}`);
  }
}
console.log(`\nDone. ${removed} file(s) removed.`);
