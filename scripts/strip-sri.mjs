import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function walkHtml(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, ent.name);
    if (ent.isDirectory() && !['scripts', '.git'].includes(ent.name)) walkHtml(f, out);
    else if (ent.name === 'index.html') out.push(f);
  }
  return out;
}

for (const file of walkHtml(ROOT)) {
  let html = fs.readFileSync(file, 'utf8');
  const next = html.replace(/\s+integrity="[^"]*"\s+crossorigin="[^"]*"/gi, '');
  if (next !== html) fs.writeFileSync(file, next, 'utf8');
}
console.log('Stripped SRI from scripts');
