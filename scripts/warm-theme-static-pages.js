const fs = require('fs');
const path = require('path');
const files = ['about.html','customs-data-skill.html','customs-data.html','faq.html','oraskl.html','skill-stats.html','tools.html'];
const map = {
  '#2563eb': '#b97a52',
  '#1d4ed8': '#a0653f',
  '#3b82f6': '#b97a52',
  '#0891b2': '#d29a63',
  '#0ea5e9': '#d29a63',
  '#0e7490': '#b98249',
  '#eff6ff': '#faf3ea',
  '#bfdbfe': '#e7d2bd',
  '#a5f3fc': '#ecdcc4',
  '#f8fbff': '#faf6f0',
  '#eef6ff': '#fdf4ea',
  '#dbeafe': '#ecdcc4',
  'rgba(37, 99, 235,': 'rgba(185, 122, 82,',
  'rgba(37,99,235,': 'rgba(185,122,82,',
  '#0f172a': '#3d3229',
  '#111827': '#3d3229',
  '#475569': '#6f6154',
  '#64748b': '#8a7a6b'
};
for (const f of files) {
  const p = path.join('D:/26210/NotionNext/public', f);
  let c = fs.readFileSync(p, 'utf8');
  const orig = c;
  for (const [k, v] of Object.entries(map)) c = c.split(k).join(v);
  if (c !== orig) {
    fs.writeFileSync(p, c, 'utf8');
    console.log('OK', f);
  } else {
    console.log('NOCHANGE', f);
  }
}
