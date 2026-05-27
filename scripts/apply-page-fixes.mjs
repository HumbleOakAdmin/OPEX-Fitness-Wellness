import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FAQ_CSS =
  '<link href="/OPEX-Fitness-Wellness/assets/css/faq-enhancements.css?v=1" rel="stylesheet" type="text/css"/>';
const FAQ_JS =
  '<script src="/OPEX-Fitness-Wellness/assets/js/faq-enhancements.js?v=1" type="text/javascript"></script>';

const HERO_IFRAME_OLD =
  "width: 177.78vh; /* 16:9 aspect ratio fill */ height: 100vh;";
const HERO_IFRAME_NEW =
  "width: 100vw; height: 56.25vw; min-width: 177.78vh; min-height: 100%;";

function walkHtml(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, ent.name);
    if (ent.isDirectory() && !["scripts", ".git", "assets"].includes(ent.name)) {
      walkHtml(f, out);
    } else if (ent.name === "index.html") out.push(f);
  }
  return out;
}

for (const file of walkHtml(ROOT)) {
  let html = fs.readFileSync(file, "utf8");
  let changed = false;

  if (html.includes(HERO_IFRAME_OLD)) {
    html = html.replace(HERO_IFRAME_OLD, HERO_IFRAME_NEW);
    changed = true;
  }

  if (html.includes("site-polish.css?v=1")) {
    html = html.replaceAll("site-polish.css?v=1", "site-polish.css?v=2");
    changed = true;
  } else if (
    html.includes("site-polish.css") &&
    !html.includes("site-polish.css?v=")
  ) {
    html = html.replaceAll(
      "site-polish.css",
      "site-polish.css?v=2"
    );
    changed = true;
  }

  const isFaq = file.replace(/\\/g, "/").endsWith("faq/index.html");
  if (isFaq) {
    if (!html.includes("faq-enhancements.css")) {
      html = html.replace(
        /(<link href="\/OPEX-Fitness-Wellness\/assets\/css\/site-polish\.css[^"]*" rel="stylesheet" type="text\/css"\/>)/,
        `$1${FAQ_CSS}`
      );
      changed = true;
    }
    if (!html.includes("faq-enhancements.js")) {
      html = html.replace(
        /<script src="\/OPEX-Fitness-Wellness\/assets\/js\/navbar-enhancements\.js"[^>]*><\/script>/,
        `$&${FAQ_JS}`
      );
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(file, html, "utf8");
    console.log("Updated", path.relative(ROOT, file));
  }
}

console.log("Page fixes applied.");
