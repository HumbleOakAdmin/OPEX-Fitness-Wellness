/**
 * Mirror opexabbotsford.com (Webflow) to local static site for GitHub Pages.
 * Downloads all pages and assets; rewrites Webflow CDN URLs to local paths.
 */
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://opexabbotsford.com';
const CDN_PREFIX = 'https://cdn.prod.website-files.com/690932ef2235c6427d9f2e0b/';
const CLOUDFRONT_JQUERY =
  'https://d3e54v103j8qbb.cloudfront.net/js/jquery-3.5.1.min.dc5e7f18c8.js?site=690932ef2235c6427d9f2e0b';

const SEED_PATHS = [
  '/',
  '/community',
  '/personal-training',
  '/remote-personal-training',
  '/fitness-consult',
  '/what-is-opex',
  '/how-it-works',
  '/meet-the-team',
  '/chiropractor',
  '/prenatal-chiropractor',
  '/active-rehab',
  '/acupuncture',
  '/abbotsford-counselling',
  '/abbotsford-massage',
  '/contact-us',
  '/faq',
];

const downloaded = new Map(); // url -> localPath (posix, web-relative)

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(
      url,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; OPEX-Mirror/1.0)',
          Accept: '*/*',
        },
      },
      (res) => {
        if (
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location
        ) {
          const next = new URL(res.headers.location, url).href;
          res.resume();
          return resolve(fetchUrl(next));
        }
        if (res.statusCode !== 200) {
          res.resume();
          return reject(new Error(`${url} => ${res.statusCode}`));
        }
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => resolve(Buffer.concat(chunks)));
      }
    );
    req.on('error', reject);
    req.setTimeout(120000, () => {
      req.destroy();
      reject(new Error(`Timeout: ${url}`));
    });
  });
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function slugFromPath(urlPath) {
  if (urlPath === '/' || urlPath === '') return 'home';
  return urlPath.replace(/^\//, '').replace(/\/$/, '');
}

function pageDir(slug) {
  if (slug === 'home') return ROOT;
  return path.join(ROOT, slug);
}

function extractInternalPaths(html) {
  const paths = new Set();
  const re = /href="(\/[^"#?]*?)"/g;
  let m;
  while ((m = re.exec(html))) {
    const p = m[1].split('#')[0].split('?')[0];
    if (p && !p.includes('.') && p.startsWith('/')) paths.add(p);
  }
  return paths;
}

function extractAssetUrls(html) {
  const urls = new Set();
  const patterns = [
    /https:\/\/cdn\.prod\.website-files\.com\/690932ef2235c6427d9f2e0b\/[^"']+/g,
    /https:\/\/d3e54v103j8qbb\.cloudfront\.net\/[^"'\s)]+/g,
  ];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(html))) {
      let u = m[0];
      u = u.replace(/&amp;/g, '&');
      urls.add(u.split(/[\s"')]+/)[0]);
    }
  }
  // srcset comma lists
  const srcsetRe = /srcset="([^"]+)"/g;
  let srcsetMatch;
  while ((srcsetMatch = srcsetRe.exec(html))) {
    for (const part of srcsetMatch[1].split(',')) {
      const u = part.trim().split(/\s+/)[0];
      if (u.startsWith('https://cdn.prod.website-files.com/690932ef2235c6427d9f2e0b/'))
        urls.add(u);
    }
  }
  return urls;
}

function assetLocalPath(assetUrl, pageSlug) {
  if (assetUrl.startsWith(CDN_PREFIX)) {
    const rel = decodeURIComponent(assetUrl.slice(CDN_PREFIX.length).split('?')[0]);
    const ext = path.extname(rel).toLowerCase();
    const isImage = ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif', '.avif'].includes(ext);
    if (isImage && pageSlug !== 'home') {
      return `/${pageSlug}/images/${path.basename(rel)}`;
    }
    if (isImage) {
      return `/images/${path.basename(rel)}`;
    }
    if (rel.startsWith('css/')) {
      return `/assets/css/${path.basename(rel)}`;
    }
    if (rel.startsWith('js/')) {
      return `/assets/js/${path.basename(rel)}`;
    }
    return `/assets/${rel.replace(/\//g, '_')}`;
  }
  if (assetUrl.includes('cloudfront.net') && assetUrl.includes('jquery')) {
    return '/assets/js/jquery-3.5.1.min.js';
  }
  return null;
}

function diskPathFromWeb(webPath) {
  const rel = webPath.replace(/^\//, '').replace(/\//g, path.sep);
  return path.join(ROOT, rel);
}

async function downloadAsset(assetUrl, pageSlug) {
  if (downloaded.has(assetUrl)) return downloaded.get(assetUrl);
  const webPath = assetLocalPath(assetUrl, pageSlug);
  if (!webPath) return assetUrl;
  const disk = diskPathFromWeb(webPath);
  ensureDir(path.dirname(disk));
  try {
    const buf = await fetchUrl(assetUrl);
    fs.writeFileSync(disk, buf);
    downloaded.set(assetUrl, webPath);
    console.log(`  asset: ${webPath}`);
    return webPath;
  } catch (e) {
    console.warn(`  WARN asset failed: ${assetUrl} — ${e.message}`);
    return assetUrl;
  }
}

function rewriteHtml(html, pageSlug) {
  let out = html;
  // Sort by URL length descending to avoid partial replacements
  const entries = [...downloaded.entries()].sort((a, b) => b[0].length - a[0].length);
  for (const [remote, local] of entries) {
    const enc = remote.replace(/&/g, '&amp;');
    out = out.split(remote).join(local);
    out = out.split(enc).join(local);
  }
  // Root-relative internal links stay as-is for GitHub Pages
  return out;
}

async function mirrorPage(urlPath, allPaths) {
  const slug = slugFromPath(urlPath);
  const url = urlPath === '/' ? SITE + '/' : SITE + urlPath;
  console.log(`\nPage: ${urlPath} (${slug})`);
  const htmlBuf = await fetchUrl(url);
  let html = htmlBuf.toString('utf8');
  if (html.includes('Page not found') && html.includes('404')) {
    console.warn(`  SKIP 404: ${urlPath}`);
    return;
  }

  for (const p of extractInternalPaths(html)) allPaths.add(p);

  const assets = extractAssetUrls(html);
  for (const assetUrl of assets) {
    await downloadAsset(assetUrl, slug);
  }
  // Page-specific: also pull linked CSS/JS from head (shared assets use home slug for /assets)
  html = rewriteHtml(html, slug);

  const dir = pageDir(slug);
  ensureDir(dir);
  if (slug !== 'home') ensureDir(path.join(dir, 'images'));

  const outFile =
    slug === 'home' ? path.join(ROOT, 'index.html') : path.join(dir, 'index.html');
  fs.writeFileSync(outFile, html, 'utf8');
  console.log(`  wrote: ${path.relative(ROOT, outFile)}`);
}

async function downloadSharedCssFromHome() {
  const home = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const cssMatch = home.match(
    /href="(https:\/\/cdn\.prod\.website-files\.com\/690932ef2235c6427d9f2e0b\/css\/[^"]+)"/
  );
  if (cssMatch) await downloadAsset(cssMatch[1], 'home');
  const scripts = home.matchAll(
    /src="(https:\/\/cdn\.prod\.website-files\.com\/690932ef2235c6427d9f2e0b\/js\/[^"]+)"/g
  );
  for (const m of scripts) await downloadAsset(m[1], 'home');
  await downloadAsset(CLOUDFRONT_JQUERY, 'home');
  const favicon = home.match(
    /href="(https:\/\/cdn\.prod\.website-files\.com\/690932ef2235c6427d9f2e0b\/[^"]+\.png)"/
  );
  if (favicon) await downloadAsset(favicon[1], 'home');
}

async function main() {
  ensureDir(path.join(ROOT, 'assets', 'css'));
  ensureDir(path.join(ROOT, 'assets', 'js'));
  ensureDir(path.join(ROOT, 'images'));
  ensureDir(path.join(ROOT, 'scripts'));

  const allPaths = new Set(SEED_PATHS);
  const queue = [...SEED_PATHS];
  const done = new Set();

  while (queue.length) {
    const p = queue.shift();
    if (done.has(p)) continue;
    done.add(p);
    try {
      const before = allPaths.size;
      await mirrorPage(p, allPaths);
      for (const np of allPaths) {
        if (!done.has(np) && !queue.includes(np)) queue.push(np);
      }
      if (allPaths.size > before) console.log(`  discovered ${allPaths.size - before} new path(s)`);
    } catch (e) {
      console.error(`  ERROR ${p}: ${e.message}`);
    }
  }

  // Re-download shared assets map and re-rewrite all pages with full asset table
  const pages = [...allPaths].filter((p) => done.has(p));
  for (const p of pages) {
    const slug = slugFromPath(p);
    const file =
      slug === 'home'
        ? path.join(ROOT, 'index.html')
        : path.join(pageDir(slug), 'index.html');
    if (!fs.existsSync(file)) continue;
    let html = fs.readFileSync(file, 'utf8');
    // Re-fetch raw and rewrite with complete downloaded map
    const url = p === '/' ? SITE + '/' : SITE + p;
    try {
      html = (await fetchUrl(url)).toString('utf8');
      const assets = extractAssetUrls(html);
      for (const a of assets) await downloadAsset(a, slug);
      html = rewriteHtml(html, slug);
      fs.writeFileSync(file, html, 'utf8');
    } catch (_) {}
  }

  await downloadSharedCssFromHome();

  // Final rewrite pass on all HTML files
  const htmlFiles = [];
  function walk(d) {
    for (const ent of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, ent.name);
      if (ent.isDirectory() && ent.name !== 'scripts' && ent.name !== '.git')
        walk(full);
      else if (ent.name === 'index.html') htmlFiles.push(full);
    }
  }
  walk(ROOT);
  for (const file of htmlFiles) {
    const rel = path.relative(ROOT, file);
    const slug =
      rel === 'index.html' ? 'home' : rel.split(path.sep)[0];
    let html = fs.readFileSync(file, 'utf8');
    // If still has CDN refs, extract and download
    for (const a of extractAssetUrls(html)) await downloadAsset(a, slug);
    html = rewriteHtml(html, slug);
    fs.writeFileSync(file, html, 'utf8');
  }

  const manifest = {
    mirroredAt: new Date().toISOString(),
    source: SITE,
    pages: pages.map((p) => ({ path: p, slug: slugFromPath(p) })),
    assetsDownloaded: downloaded.size,
  };
  fs.writeFileSync(
    path.join(ROOT, 'manifest.json'),
    JSON.stringify(manifest, null, 2)
  );
  console.log(`\nDone. ${pages.length} pages, ${downloaded.size} assets.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
