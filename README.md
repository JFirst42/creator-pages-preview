# Creator pages preview (demo)

Private-style **demo preview** of a Holy Hails “No Heart” landing page at three tiers (Bronze, Silver, Gold), plus a Gold variant with “latest video” featured first.

This is **not** a production product. Streaming, merch, tip, and social links are **placeholders**. Do not treat this as a live artist site.

The preview is marked `noindex` and `robots.txt` disallows all crawlers.

## View it

After GitHub Pages is enabled, the site root opens the **Gold** page full-screen. A floating control at the bottom switches tiers instantly:

- Bronze
- Silver
- Gold
- Gold·Video (same Gold layout, feature-first = latest video)

Use **Compare side by side** to see all four phones on one page.

## Local files

- `index.html` — Gold full-screen landing (assets loaded from `gold/`)
- `bronze/`, `silver/`, `gold/`, `gold-video/` — each tier
- `compare.html` — side-by-side comparison
- `switcher.js` / `switcher.css` — the persistent tier switcher
