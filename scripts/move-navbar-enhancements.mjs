import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Script tag that injection appended near </body>
const TAG =
  '<script src="/OPEX-Fitness-Wellness/assets/js/navbar-enhancements.js" type="text/javascript"></script>';

function walkHtml(dir) {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, ent.name);
    if (ent.isDirectory() && !['scripts', '.git', 'assets'].includes(ent.name)) out.push(...walkHtml(f));
    else if (ent.isFile() && ent.name === 'index.html') out.push(f);
  }
  return out;
}

for (const file of walkHtml(ROOT)) {
  let html = fs.readFileSync(file, 'utf8');

  if (!html.includes(TAG)) continue;

  // Remove existing tag
  html = html.replace(TAG, '');

  // Insert right before </head>
  if (!html.includes('</head>')) {
    console.warn('No </head> in', file);
    continue;
  }
  html = html.replace('</head>', `${TAG}\n</head>`);

  fs.writeFileSync(file, html, 'utf8');
  console.log('Moved:', path.relative(ROOT, file));
}

console.log('Done.');

