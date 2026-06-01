import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const WHATSAPP_JS =
  '<script src="/OPEX-Fitness-Wellness/assets/js/whatsapp-widget.js?v=1" type="text/javascript"></script>';

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

  if (!html.includes("whatsapp-widget.js")) {
    if (html.includes("navbar-enhancements.js")) {
      html = html.replace(
        /<script src="\/OPEX-Fitness-Wellness\/assets\/js\/navbar-enhancements\.js"[^>]*><\/script>/,
        `$&${WHATSAPP_JS}`
      );
    } else {
      html = html.replace(/<\/body>/, `${WHATSAPP_JS}</body>`);
    }
    changed = true;
  }

  if (html.includes("site-polish.css?v=3")) {
    html = html.replaceAll("site-polish.css?v=3", "site-polish.css?v=4");
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, html, "utf8");
    console.log("Updated", path.relative(ROOT, file));
  }
}
