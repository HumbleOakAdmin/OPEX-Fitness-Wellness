/**
 * Fix GitHub Pages paths and localize CSS background-image URLs.
 */
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// GitHub project site base; use '' or '/' when hosting at custom domain root only
const BASE = '/OPEX-Fitness-Wellness';
const CDN = 'https://cdn.prod.website-files.com/690932ef2235c6427d9f2e0b/';
const CLOUDFRONT_SVG =
  'https://d3e54v103j8qbb.cloudfront.net/static/custom-checkbox-checkmark.589d534424.svg';

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
          return reject(new Error(`${res.statusCode} ${url}`));
        }
        const c = [];
        res.on('data', (d) => c.push(d));
        res.on('end', () => resolve(Buffer.concat(c)));
      })
      .on('error', reject);
  });
}

function walkHtml(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, ent.name);
    if (ent.isDirectory() && !['scripts', '.git', 'node_modules'].includes(ent.name))
      walkHtml(f, out);
    else if (ent.name === 'index.html') out.push(f);
  }
  return out;
}

function prefixRootPaths(html) {
  let out = html;
  out = out.replace(
    /(<link[^>]+rel="stylesheet"[^>]+)\s+integrity="[^"]*"\s+crossorigin="[^"]*"/gi,
    '$1'
  );
  out = out.replace(/\s+integrity="[^"]*"\s+crossorigin="[^"]*"/gi, '');
  out = out.replace(/(href|src)="\/(?!\/)/g, `$1="${BASE}/`);
  out = out.replace(/srcset="([^"]*)"/g, (_, inner) => {
    const fixed = inner.replace(/(^|,\s*)\/(?!\/)/g, `$1${BASE}/`);
    return `srcset="${fixed}"`;
  });
  return out;
}

async function fixCss() {
  const cssPath = path.join(ROOT, 'assets/css/opex-abbotsford.webflow.shared.2508f7def.css');
  let css = fs.readFileSync(cssPath, 'utf8');
  const urls = [
    ...new Set([...css.matchAll(new RegExp(CDN.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[^")\\s]+', 'g'))].map((m) => m[0])),
  ];
  console.log(`CSS references ${urls.length} CDN assets`);
  for (const url of urls) {
    const name = decodeURIComponent(url.slice(CDN.length).split('?')[0]);
    const local = `${BASE}/images/${path.basename(name)}`;
    const disk = path.join(ROOT, 'images', path.basename(name));
    if (!fs.existsSync(disk)) {
      try {
        fs.writeFileSync(disk, await fetchUrl(url));
        console.log('  downloaded', path.basename(name));
      } catch (e) {
        console.warn('  failed', name, e.message);
      }
    }
    css = css.split(url).join(local);
    const enc = url.replace(/ /g, '%20');
    css = css.split(enc).join(local);
  }
  // Cloudfront checkbox icon
  const cfLocal = `${BASE}/images/custom-checkbox-checkmark.svg`;
  const cfDisk = path.join(ROOT, 'images', 'custom-checkbox-checkmark.svg');
  if (!fs.existsSync(cfDisk)) {
    try {
      fs.writeFileSync(cfDisk, await fetchUrl(CLOUDFRONT_SVG));
      console.log('  downloaded checkbox svg');
    } catch (e) {
      console.warn('  checkbox svg failed', e.message);
    }
  }
  css = css.split(CLOUDFRONT_SVG).join(cfLocal);

  fs.writeFileSync(cssPath, css, 'utf8');
  console.log('CSS updated');
}

async function main() {
  const htmlFiles = walkHtml(ROOT);
  for (const file of htmlFiles) {
    let html = fs.readFileSync(file, 'utf8');
    html = prefixRootPaths(html);
    fs.writeFileSync(file, html, 'utf8');
  }
  console.log(`Updated ${htmlFiles.length} HTML files with base path ${BASE}`);
  await fixCss();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
