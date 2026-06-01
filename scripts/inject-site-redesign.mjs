import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const REDESIGN_CSS =
  '<link href="/OPEX-Fitness-Wellness/assets/css/site-redesign.css?v=1" rel="stylesheet" type="text/css"/>';

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
  if (html.includes("site-redesign.css")) continue;

  if (html.includes("faq-enhancements.css")) {
    html = html.replace(
      /(<link href="\/OPEX-Fitness-Wellness\/assets\/css\/faq-enhancements\.css[^"]*" rel="stylesheet" type="text\/css"\/>)/,
      `$1${REDESIGN_CSS}`
    );
  } else if (html.includes("site-polish.css")) {
    html = html.replace(
      /(<link href="\/OPEX-Fitness-Wellness\/assets\/css\/site-polish\.css[^"]*" rel="stylesheet" type="text\/css"\/>)/,
      `$1${REDESIGN_CSS}`
    );
  } else if (html.includes("navbar-enhancements.css")) {
    html = html.replace(
      /(<link href="\/OPEX-Fitness-Wellness\/assets\/css\/navbar-enhancements\.css[^"]*" rel="stylesheet" type="text\/css"\/>)/,
      `$1${REDESIGN_CSS}`
    );
  } else {
    continue;
  }

  fs.writeFileSync(file, html, "utf8");
  console.log("Updated", path.relative(ROOT, file));
}

console.log("Site redesign CSS injected.");
