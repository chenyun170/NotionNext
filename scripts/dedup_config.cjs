const fs = require('fs');
const fp = 'D:\\26210\\NotionNext\\next.config.js';
let c = fs.readFileSync(fp, 'utf-8');
const orig = c;

// Remove duplicate hasCustomPageId block (the second one with CRLF + NBSP)
const dupIdx = c.indexOf('// 警告', 200);
if (dupIdx > 0) {
  const dupEnd = c.indexOf('\n', dupIdx);
  // Find where this duplicate block ends (the 4th line after it)
  let end = dupIdx;
  for (let i = 0; i < 4; i++) {
    end = c.indexOf('\n', end + 1);
    if (end < 0) break;
  }
  const dupBlock = c.slice(dupIdx, end + 1);
  c = c.replace(dupBlock, '');
  console.log('Removed duplicate block at', dupIdx);
}

fs.writeFileSync(fp, c, 'utf-8');

// Verify
console.log('hasCustomPageId count:', (c.match(/hasCustomPageId/g) || []).length);
