import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const POLISH_CSS =
  '<link href="/OPEX-Fitness-Wellness/assets/css/site-polish.css?v=3" rel="stylesheet" type="text/css"/>';

function walkHtml(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, ent.name);
    if (ent.isDirectory() && !['scripts', '.git', 'assets'].includes(ent.name)) walkHtml(f, out);
    else if (ent.name === 'index.html') out.push(f);
  }
  return out;
}

function dedupeGtag(html) {
  const multiline =
    /<!-- Google tag \(gtag\.js\) -->\s*<script async src="https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=G-CKHK9K718C"><\/script>\s*<script>[\s\S]*?gtag\('config', 'G-CKHK9K718C'\);\s*<\/script>\s*/;
  const inline =
    /<script async="" src="https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=G-CKHK9K718C"><\/script><script type="text\/javascript">window\.dataLayer[\s\S]*?gtag\('config', 'G-CKHK9K718C'\);<\/script>/;
  if (inline.test(html) && multiline.test(html)) {
    html = html.replace(multiline, '');
  }
  return html;
}

for (const file of walkHtml(ROOT)) {
  let html = fs.readFileSync(file, 'utf8');
  let changed = false;

  if (!html.includes('site-polish.css')) {
    html = html.replace(
      /(<link href="\/OPEX-Fitness-Wellness\/assets\/css\/navbar-enhancements\.css[^"]*" rel="stylesheet" type="text\/css"\/>)/,
      `$1${POLISH_CSS}`
    );
    changed = true;
  }

  const beforeGtag = html;
  html = dedupeGtag(html);
  if (html !== beforeGtag) changed = true;

  if (html.includes('href="https://ope"')) {
    html = html.replace(
      'href="https://ope"',
      'href="/OPEX-Fitness-Wellness/fitness-consult"'
    );
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, html, 'utf8');
    console.log('Updated', path.relative(ROOT, file));
  }
}

console.log('Housekeeping complete.');
