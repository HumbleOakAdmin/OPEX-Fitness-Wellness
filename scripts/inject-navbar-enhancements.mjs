import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const NAV_CSS =
  '<link href="/OPEX-Fitness-Wellness/assets/css/navbar-enhancements.css" rel="stylesheet" type="text/css"/>';
const POLISH_CSS =
  '<link href="/OPEX-Fitness-Wellness/assets/css/site-polish.css" rel="stylesheet" type="text/css"/>';
const JS =
  '<script src="/OPEX-Fitness-Wellness/assets/js/navbar-enhancements.js" type="text/javascript"></script>';
const WHATSAPP_JS =
  '<script src="/OPEX-Fitness-Wellness/assets/js/whatsapp-widget.js?v=1" type="text/javascript"></script>';

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
  if (!html.includes('navbar-enhancements.css')) {
    html = html.replace(
      /(<link href="\/OPEX-Fitness-Wellness\/assets\/css\/opex-abbotsford\.webflow\.shared[^"]+\.css" rel="stylesheet" type="text\/css"\/>)/,
      `$1${NAV_CSS}`
    );
  }
  if (!html.includes('site-polish.css')) {
    html = html.replace(
      /(<link href="\/OPEX-Fitness-Wellness\/assets\/css\/navbar-enhancements\.css[^"]*" rel="stylesheet" type="text\/css"\/>)/,
      `$1${POLISH_CSS}`
    );
  }
  if (!html.includes('navbar-enhancements.js')) {
    html = html.replace(/<\/body>/, `${JS}${WHATSAPP_JS}</body>`);
  } else if (!html.includes('whatsapp-widget.js')) {
    html = html.replace(
      /<script src="\/OPEX-Fitness-Wellness\/assets\/js\/navbar-enhancements\.js"[^>]*><\/script>/,
      `$&${WHATSAPP_JS}`
    );
  }
  fs.writeFileSync(file, html, 'utf8');
  console.log('Updated', path.relative(ROOT, file));
}
