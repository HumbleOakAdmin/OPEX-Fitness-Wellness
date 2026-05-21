import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          res.resume();
          return resolve(fetchUrl(new URL(res.headers.location, url).href));
        }
        if (res.statusCode !== 200) {
          res.resume();
          return reject(new Error(`${res.statusCode}`));
        }
        const c = [];
        res.on('data', (d) => c.push(d));
        res.on('end', () => resolve(Buffer.concat(c)));
      })
      .on('error', reject);
  });
}

const html = (
  await fetchUrl('https://opexabbotsford.com/contact-us')
).toString('utf8');
const re =
  /https:\/\/cdn\.prod\.website-files\.com\/690932ef2235c6427d9f2e0b\/6912bfa[^"']+/g;
const urls = [...new Set(html.match(re) || [])];
console.log('Found', urls.length, 'URLs');
for (const url of urls) {
  const name = decodeURIComponent(url.split('/').pop());
  const out = path.join(ROOT, 'contact-us', 'images', name);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  try {
    const buf = await fetchUrl(url);
    fs.writeFileSync(out, buf);
    console.log('OK', name);
  } catch (e) {
    console.warn('SKIP', name, e.message);
    continue;
  }
  for (const file of walkHtml(ROOT)) {
    let h = fs.readFileSync(file, 'utf8');
    if (!h.includes(url)) continue;
    h = h.split(url).join(`/contact-us/images/${name}`);
    fs.writeFileSync(file, h);
  }
}

function walkHtml(dir) {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, ent.name);
    if (ent.isDirectory() && !['scripts', '.git'].includes(ent.name)) out.push(...walkHtml(f));
    else if (ent.name.endsWith('.html') && !ent.name.startsWith('_')) out.push(f);
  }
  return out;
}
