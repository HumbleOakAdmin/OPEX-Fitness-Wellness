# OPEX Fitness & Wellness — Static Site

Lift-and-shift mirror of [opexabbotsford.com](https://opexabbotsford.com/) from Webflow for GitHub Pages hosting.

## Structure

- `index.html` — Home page
- `assets/` — Shared CSS and JavaScript (Webflow bundles, jQuery)
- `images/` — Shared images (logo, icons, homepage imagery)
- `<page-slug>/index.html` — Each site page
- `<page-slug>/images/` — Images used only on that page
- `scripts/mirror-site.mjs` — Tool used to download and rewrite assets from the live site

## Pages (16)

Home, Community, Personal Training, Remote Personal Training, Fitness Consult, What Is OPEX, How It Works, Meet the Team, Chiropractor, Prenatal Chiropractor, Active Rehab, Acupuncture, Abbotsford Counselling, Abbotsford Massage, Contact Us, FAQ

## GitHub Pages

1. Push this folder to `HumbleOakAdmin/OPEX-Fitness-Wellness` on the `main` branch.
2. In repo **Settings → Pages**, set source to **Deploy from branch** → `main` → `/ (root)`.
3. Site URL: `https://humbleoakadmin.github.io/OPEX-Fitness-Wellness/`

Asset paths are prefixed with `/OPEX-Fitness-Wellness/` so CSS, JS, and images load on the GitHub project URL. After mirroring from Webflow, run:

```bash
node scripts/fix-paths-and-css.mjs
node scripts/strip-sri.mjs
```

If you point a **custom domain** at this repo (e.g. `opexabbotsford.com`), set `BASE = ''` in `scripts/fix-paths-and-css.mjs` and re-run that script.

External services (Jane App booking, WhatsApp, YouTube, Google Maps, analytics) remain linked to their original URLs as on the Webflow site.

## Re-mirror from Webflow

```bash
node scripts/mirror-site.mjs
```
