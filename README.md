# Creator pages preview (demo)

Demo preview of a Holy Hails "No Heart" landing page at three tiers: **Bronze, Silver, Gold**. Not a production site. All streaming, merch, tip and social links are placeholders. Every page is `noindex`, `robots.txt` blocks all crawlers, and each page carries a "Demo / preview" banner.

- `/` opens Gold full screen. The bottom switcher goes to Bronze | Silver | Gold | Compare.
- **Video is a Gold option, not a tier.** The Gold hero has a 3D art | Video toggle; `?bg=video` opens it in video mode. `/gold-video/` redirects to `/gold/?bg=video`.
- **Share** (top right on every page) opens the share sheet:
  - Bronze: copy link, social links and one default story card.
  - Silver: the share studio (choose what to share + story / post / link-card templates).
  - Gold: branded templates, an animated story video and analytics hooks.
- Instagram doesn't let a web page put a tappable link into a Story. The flow is: share the image to your Story, then add a Link sticker (the page copies the link for you).
- Each tier has Open Graph / Twitter meta and a pre-rendered `og.png` (1200x630), so pasted links show a card.

Built from `/workspace/creator-pages` with `generator/build_preview.py`.
