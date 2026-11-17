/* Creator Pages runtime. Reads the inlined config JSON and renders the page.
   All feature gating comes from cfg.features (resolved from tiers.json by the generator). */
(function () {
  const cfg = JSON.parse(document.getElementById('config').textContent);
  const F = cfg.features || {};
  const qs = new URLSearchParams(location.search);
  /* Creator hub live preview (?hub=1): the hub editor writes overrides to localStorage; only whitelisted content keys apply.
     Tier features (cfg.features) can never be changed from here. */
  const HUB = qs.has('hub');
  const HUB_KEYS = ['title', 'tagline', 'links', 'feature_first', 'featured', 'sections', 'section_toggles', 'tip_methods', 'hero_bg', 'story', 'custom', 'faq', 'testimonials', 'palette_override', 'fan_capture', 'tip_saying', 'music', 'accent', 'look', 'studio', 'brand', 'drop', 'photos'];
  if (HUB) { try { const o = JSON.parse(localStorage.getItem('cp-hub-' + (cfg.hub_key || cfg.slug)) || 'null'); if (o) HUB_KEYS.forEach(k => { if (o[k] !== undefined && o[k] !== null) cfg[k] = (k === 'studio' || k === 'brand') && cfg[k] ? Object.assign({}, cfg[k], o[k]) : o[k]; }); } catch (e) {} }
  /* hub photo swaps: 'local:<slot>' points at a downscaled upload kept in this browser (demo); anything else is a page-relative path */
  const HKEY = cfg.hub_key || cfg.slug; const resImg = v => typeof v === 'string' && v.startsWith('local:') ? (localStorage.getItem('cp-hub-img-' + HKEY + '-' + v.slice(6)) || '') : v;
  if (HUB) { const P = cfg.photos || {}; if (P.cover) cfg.cover = resImg(P.cover) || cfg.cover; if (P.banner) cfg.studio = Object.assign({}, cfg.studio, { banner_photo: resImg(P.banner) });
    if (P.gallery && cfg.gallery) cfg.gallery = cfg.gallery.map((g, i) => P.gallery[i] ? Object.assign({}, g, { src: resImg(P.gallery[i]) || g.src }) : g);
    if (cfg.brand) ['logo', 'header'].forEach(k => { if (cfg.brand[k]) cfg.brand = Object.assign({}, cfg.brand, { [k]: resImg(cfg.brand[k]) }); });
    if (cfg.studio && cfg.studio.categories) cfg.studio = Object.assign({}, cfg.studio, { categories: cfg.studio.categories.map(k => k.photo ? Object.assign({}, k, { photo: resImg(k.photo) }) : k) });
    if (cfg.brand && cfg.brand.graphics) cfg.brand = Object.assign({}, cfg.brand, { graphics: cfg.brand.graphics.map(g => Object.assign({}, g, { src: resImg(g.src) })) }); }
  const EXPAND = qs.has('expand');          // render every tab panel stacked (for review/screenshots)
  const STATIC = qs.has('static');          // freeze motion (for still screenshots)
  const root = document.documentElement;
  if (F.motionBackground && cfg.motion !== 'off') root.dataset.motion = '1';
  if (cfg.motion) root.dataset.intensity = cfg.motion;
  if (STATIC) root.classList.add('freeze', 'noreveal');
  if (EXPAND) root.classList.add('noreveal');
  root.style.setProperty('--art', `url("${cfg.cover || 'cover.jpg'}")`);
  if (cfg.palette_override) { const po = cfg.palette_override; ['acc', 'acc2'].forEach(k => { if (/^#[0-9a-f]{6}$/i.test(po[k] || '')) root.style.setProperty('--' + k, po[k]); });
    if (po.acc) { const n = parseInt(po.acc.slice(1), 16), L = (((n >> 16) & 255) * .299 + ((n >> 8) & 255) * .587 + (n & 255) * .114); root.style.setProperty('--on-acc', L > 150 ? '#0b0b0f' : '#ffffff'); } }
  if (cfg.theme_mode === 'light') root.dataset.theme = 'light';
  if (cfg.vertical) root.dataset.vertical = cfg.vertical;
  /* ---------- round 5: Looks. Gold: art | studio | brand. Silver: may preview studio (locked). ?look= is the demo switcher. ---------- */
  const LOOKS = F.looks ? ['art', 'studio', 'brand'] : F.studioPreview ? ['art', 'studio'] : ['art'];
  let LOOK = LOOKS.includes(cfg.look) ? cfg.look : 'art'; if (LOOKS.includes(qs.get('look'))) LOOK = qs.get('look');
  const SKIN = LOOK !== 'art' && !!window.CPStudio; const STUDIO_LOCKED = SKIN && !F.looks;
  root.dataset.looks = LOOKS.join(','); root.dataset.lookNow = LOOK;
  if (SKIN) window.CPStudio.apply(cfg, root, LOOK); else root.dataset.look = 'art';
  const GOLD = !!F.cinematicHero && !SKIN;
  /* ---------- round 4: music (none | upload | link), theme motion accent, custom tip saying ----------
     No music = no sound bars anywhere: the hero gets a motion accent that fits the trade instead (accents.js). */
  if (HUB && cfg.music && cfg.music.mode === 'upload' && cfg.music.local) { try { const d = localStorage.getItem('cp-hub-audio-' + (cfg.hub_key || cfg.slug)); if (d) cfg.music.src = d; } catch (e) {} }
  const MPROV = [['spotify', 'Spotify', /open\.spotify\.com\/(intl-[a-z]+\/)?(track|album|playlist|artist|episode)\//i], ['apple', 'Apple Music', /music\.apple\.com\//i], ['soundcloud', 'SoundCloud', /soundcloud\.com\//i],
    ['youtube', 'YouTube', /(youtube\.com\/(watch|shorts|embed)|youtu\.be\/|music\.youtube\.com\/)/i], ['audiomack', 'Audiomack', /audiomack\.com\//i]];
  const mprov = u => /^https:\/\/[^\s]+$/.test(u || '') ? (MPROV.find(p => p[2].test(u)) || null) : null;
  const MUSIC = (() => { const m = cfg.music || {};
    if (m.mode === 'upload' && F.musicUpload && m.src) return { mode: 'upload', src: m.src, title: m.title || 'My track', start: Math.max(0, +m.start || 0) };
    const p = mprov(m.url);
    if ((m.mode === 'link' || m.mode === 'upload') && F.musicLink && p) return { mode: 'link', url: m.url, prov: p, title: m.title || '' };
    return { mode: 'none' }; })();
  const HAS_AUDIO = MUSIC.mode === 'upload';
  const ACC = cfg.accents || { default: null, options: [] };
  const ACCENT = (HAS_AUDIO && GOLD) ? null : F.accentPicker ? (cfg.accent === 'none' ? null : (ACC.options || []).includes(cfg.accent) ? cfg.accent : ACC.default) : F.accentDefault ? ACC.default : null;
  const LEET = { 0: 'o', 1: 'i', 3: 'e', 4: 'a', 5: 's', 7: 't', '@': 'a', $: 's' };
  function cleanSaying(v) { // same rules as generator/saying.py: 40 chars, emoji OK, no links/handles, small profanity list
    const s = String(v || '').replace(/\s+/g, ' ').trim(); if (!s) return '';
    if (/(https?:\/\/|www\.|@|\b[\w-]+\.(com|net|org|io|co|me|ly|gg|app|link|xyz|shop|store|tv|fm)\b)/i.test(s)) return '';
    if (s.split(' ').some(w => { const n = w.toLowerCase().replace(/[013457@$]/g, c => LEET[c]).replace(/[^a-z]/g, ''); return /^(fuck|shit|bitch|cunt|dick|pussy|asshole|nigger|nigga|fag|faggot|slut|whore|retard|cock)s?$/.test(n) || /(fuck|shit|cunt|nigg)/.test(n); })) return '';
    return [...s].slice(0, 40).join('').trim(); }
  const TIP_SAYING = F.tipSaying ? cleanSaying(cfg.tip_saying) : '';
  const T = cfg.theme || {}; const WM = T.wordmark || {};
  if (GOLD && WM.font) { root.style.setProperty('--wm-font', `'${WM.font}'`); root.style.setProperty('--wm-fill', WM.fill); root.style.setProperty('--wm-stroke', WM.stroke); root.style.setProperty('--wm-depth', WM.depth); root.style.setProperty('--wm-weight', WM.weight || 400); root.style.setProperty('--wm-case', WM.case || 'none'); root.style.setProperty('--wm-track', WM.tracking || '0'); }
  const isLive = F.liveTakeover && cfg.layout === 'streamer' && cfg.live && cfg.live.is_live;
  if (isLive) root.dataset.live = '1';
  /* analytics hook: every interaction goes through CP.track → dataLayer (GTM/Plausible-style), a DOM event, and a local counter (demo).
     The real version posts these to a privacy-friendly endpoint (see README "Creator hub: architecture"). */
  const track = (ev, data) => { const d = Object.assign({ event: 'cp_' + ev, page: cfg.slug, tier: cfg.tier, t: Date.now() }, data || {});
    try { (window.dataLayer = window.dataLayer || []).push(d); document.dispatchEvent(new CustomEvent('cp:track', { detail: d }));
      const k = 'cp-stats-' + (cfg.hub_key || cfg.slug), st = JSON.parse(localStorage.getItem(k) || '{}'), key = ev + (data && (data.method || data.id || data.platform) ? ':' + (data.method || data.id || data.platform) : '');
      st[key] = (st[key] || 0) + 1; localStorage.setItem(k, JSON.stringify(st)); } catch (e) {} };
  window.CP = { cfg, F, STATIC, EXPAND, qs, track, MUSIC, ACCENT, cleanSaying, LOOK };

  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const icon = (k, fill) => {
    const i = (window.ICONS || {})[k];
    if (!i) return `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="${fill || 'currentColor'}"/></svg>`;
    return `<svg viewBox="0 0 24 24" role="img" aria-label="${esc(i.title)}"><path d="${i.path}"${fill ? ` fill="${fill}"` : ''}/></svg>`;
  };
  const NAMES = { spotify: 'Spotify', apple_music: 'Apple Music', youtube: 'YouTube', amazon_music: 'Amazon Music', tidal: 'TIDAL', soundcloud: 'SoundCloud', twitch: 'Twitch', kick: 'Kick', tiktok: 'TikTok', instagram: 'Instagram', x: 'X', discord: 'Discord', cashapp: 'Cash App', paypal: 'PayPal', kofi: 'Ko-fi', shop: 'Merch store', shopify: 'Shopify', beatstars: 'BeatStars', bandcamp: 'Bandcamp', venmo: 'Venmo', zelle: 'Zelle', buymeacoffee: 'Buy Me a Coffee', stripe: 'Stripe', booksy: 'Booksy', square: 'Square', vagaro: 'Vagaro', glossgenius: 'GlossGenius', calendly: 'Calendly', googlemaps: 'Google Maps', email: 'Email', release: 'Release', clip: 'Clip' };
  const VERB = { spotify: 'Play', apple_music: 'Play', youtube: 'Watch', amazon_music: 'Play', tidal: 'Play', soundcloud: 'Play', twitch: 'Watch', kick: 'Watch', tiktok: 'Follow', discord: 'Join', shop: 'Shop', shopify: 'Shop', beatstars: 'Beats', bandcamp: 'Shop', cashapp: 'Tip', paypal: 'Tip', kofi: 'Tip', booksy: 'Book', square: 'Book', vagaro: 'Book', glossgenius: 'Book', calendly: 'Book', googlemaps: 'Map' };
  const toast = msg => { const t = document.getElementById('toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('on'), 2600); };
  const reveal = F.microInteractions ? ' reveal' : '';
  const ph = cfg.sample ? '' : '';

  /* ---------- pieces ---------- */
  function topbar() {
    const t = cfg.tierMeta || { label: cfg.tier };
    return `<div class="topbar">
      <div class="top-actions"><span class="tier-pill ${esc(cfg.tier)}"><span class="medal"></span>${esc(t.label)} tier</span>
      ${cfg.sample ? '<span class="sample-pill">Sample data</span>' : '<span class="sample-pill">Demo</span>'}</div>
      <div class="top-actions">${tipChip()}${F.shareBasic !== false ? `<button class="icon-btn" data-act="share" aria-label="Share"><svg viewBox="0 0 24 24"><path d="M12 3v13M7 8l5-5 5 5M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"/></svg></button>` : ''}</div>
    </div>`;
  }

  function releaseState() {
    if (!cfg.release || !cfg.release.date) return null;
    const d = new Date(cfg.release.date);
    return { date: d, future: d.getTime() > Date.now() };
  }

  const letters = (s) => [...String(s)].map((c, i) => `<span class="ch" style="--i:${i}">${esc(c)}</span>`).join('');
  function wordmark(text, extra, tag) { tag = tag || 'h1'; return `<${tag} class="wm fx-${esc(WM.effect || 'sticker')}" data-text="${esc(text)}" ${extra || ''}>${letters(text)}</${tag}>`; }
  /* ---------- hero CTA: the creator's real platform links for whatever they chose to "feature first" ---------- */
  const PROVIDERS = [
    ['booksy', /booksy\.com/, 'Booksy', '#00a3ad', false], ['fresha', /fresha\.com/, 'Fresha', '#0e0e0e', false],
    ['square', /(squareup\.com|square\.site|book\.squareup)/, 'Square Appointments', '#3e4348', true], ['calendly', /calendly\.com/, 'Calendly', '#006bff', true],
    ['vagaro', /vagaro\.com/, 'Vagaro', '#f15a29', true], ['vgen', /vgen\.co/, 'VGen', '#5b4cff', false], ['acuity', /(acuityscheduling\.com|as\.me)/, 'Acuity', '#ff6b3d', true],
    ['setmore', /setmore\.com/, 'Setmore', '#1f8bf0', true], ['schedulicity', /schedulicity\.com/, 'Schedulicity', '#00a6e0', true], ['glossgenius', /glossgenius\.com/, 'GlossGenius', '#111111', false],
    ['styleseat', /styleseat\.com/, 'StyleSeat', '#7b2cbf', false], ['instagram', /(instagram\.com|ig\.me)/, 'Instagram DM', '#E4405F', false], ['email', /^mailto:/, 'Email', '#555', false]
  ];
  const provider = url => { const u = String(url || ''); const m = PROVIDERS.find(p => p[1].test(u)); return m ? { id: m[0], name: m[2], color: m[3], embed: m[4] } : { id: 'link', name: (u.match(/^https?:\/\/(?:www\.)?([^/]+)/) || [, 'their booking page'])[1], color: 'var(--acc)', embed: false }; };
  const PORT = cfg.layout === 'portfolio';
  const FEATURE = cfg.feature_first || (cfg.layout === 'streamer' ? 'live' : PORT ? 'book' : 'release');
  const CTA_SETS = {
    release: ['spotify', 'apple_music', 'youtube_music', 'amazon_music', 'tidal', 'soundcloud', 'deezer', 'audiomack', 'bandcamp', 'youtube'],
    video: ['youtube', 'tiktok', 'instagram', 'twitch', 'kick'],
    live: ['twitch', 'kick', 'youtube'],
    merch: ['shopify', 'shop', 'beatstars', 'bandcamp'],
    booking: ['booking', 'calendly', 'email'],
    book: ['booksy', 'square', 'vagaro', 'glossgenius', 'calendly', 'instagram', 'booking', 'email']
  };
  const CTA_VERB = { release: 'Listen on', video: 'Watch on', live: 'Watch live on', merch: 'Shop on', booking: 'Book on', book: 'Book now on' };
  const CTA_SHORT = { apple_music: 'Apple', amazon_music: 'Amazon', youtube_music: 'YT Music', instagram: 'Reels', shop: 'Store' };
  function heroLinks() {
    const set = CTA_SETS[FEATURE] || []; const seen = new Set(); const pool = [];
    const add = (l, src) => { if (!l || !l.url || seen.has(l.url) || !set.includes(l.platform)) return; seen.add(l.url); pool.push(Object.assign({ src }, l)); };
    if (FEATURE === 'book' && cfg.booking_url) { const pv = provider(cfg.booking_url); pool.push({ platform: pv.id, url: cfg.booking_url, label: pv.name, primary: true, src: 'booking', color: pv.color }); seen.add(cfg.booking_url); }
    (cfg.links || []).forEach(l => add(l, 'links'));
    if (FEATURE === 'merch') (cfg.store_links || (cfg.store ? [cfg.store] : [])).forEach(l => add(Object.assign({ platform: 'shop' }, l), 'store'));
    if (FEATURE === 'video' || FEATURE === 'live') (cfg.socials || []).forEach(l => add(l, 'socials'));
    pool.sort((a, b) => (b.primary ? 1 : 0) - (a.primary ? 1 : 0) || set.indexOf(a.platform) - set.indexOf(b.platform));
    return pool.slice(0, 6);
  }
  const HERO_LINKS = heroLinks();
  const HERO_URLS = new Set(HERO_LINKS.filter(l => l.src === 'links').map(l => l.url));
  function heroCTA() {
    const L = HERO_LINKS;
    if (!L.length) {
      if (FEATURE === 'booking') return `<div class="hcta"><a class="hcta-main" href="#book" data-act="scroll-book"><span class="hi" style="background:var(--acc)"><svg viewBox="0 0 24 24"><path d="M4 6h16v12H4z M4 7l8 6 8-6" fill="none" stroke="#fff" stroke-width="2"/></svg></span><span class="ht"><small>Booking</small>Book ${esc(cfg.artist || cfg.title)}</span><span class="hgo">→</span></a></div>`;
      return '';
    }
    const ib = p => { const I = (window.ICONS || {})[p]; const pc = (L.find(x => x.platform === p) || {}).color; if (!I) return { bg: pc || 'var(--acc)', ico: `<b style="color:#fff">${esc((p || '?')[0].toUpperCase())}</b>` }; const n = parseInt(I.hex, 16); const dark = (((n >> 16) & 255) * .299 + ((n >> 8) & 255) * .587 + (n & 255) * .114) < 40; return { bg: dark ? '#fff' : '#' + I.hex, fg: dark ? '#000' : '#fff', ico: icon(p) }; };
    const name = l => l.label && !['Merch store'].includes(l.label) ? l.label : (NAMES[l.platform] || l.platform);
    const [p, ...rest] = L; const a = ib(p.platform);
    const main = `<a class="hcta-main" href="${esc(p.url)}" target="_blank" rel="noopener" data-link="${esc(p.platform)}"><span class="hi" style="background:${a.bg};--ico:${a.fg || '#fff'}">${a.ico}</span><span class="ht"><small>${esc(CTA_VERB[FEATURE] || 'Open')}</small>${esc(name(p))}</span><span class="hgo">${FEATURE === 'merch' || FEATURE === 'book' ? '↗' : '▶'}</span></a>`;
    const chips = rest.length ? `<div class="hcta-row">${rest.map(l => { const c = ib(l.platform); return `<a class="hcta-chip" href="${esc(l.url)}" target="_blank" rel="noopener" data-link="${esc(l.platform)}"><span class="hi" style="background:${c.bg};--ico:${c.fg || '#fff'}">${c.ico}</span><span>${esc((FEATURE === 'book' && l.label) ? l.label : (CTA_SHORT[l.platform] || name(l)))}</span></a>`; }).join('')}</div>` : '';
    return `<div class="hcta${reveal}" data-feature="${esc(FEATURE)}">${main}${chips}</div>`;
  }

  function audioMini() { return HAS_AUDIO ? `<button class="g-audio" data-act="music" aria-label="Play ${esc(MUSIC.title)}"><b></b><span>Play</span><em>${esc(MUSIC.title)}</em></button>` : ''; }
  // Gold hero bottom strip: real-audio visualizer only when an uploaded track exists; otherwise the trade's motion accent (or nothing)
  const gStrip = () => HAS_AUDIO ? '<canvas class="g-viz" aria-hidden="true"></canvas>' : ACCENT ? `<canvas class="g-accent" data-accent="${esc(ACCENT)}" aria-hidden="true"></canvas>` : '';
  const gMode = HAS_AUDIO ? 'has-viz' : ACCENT ? 'has-accent' : 'no-strip';
  function goldHero() {
    const L = cfg.layers || {};
    const rs = releaseState();
    if (cfg.layout === 'streamer') {
      const chat = (cfg.live_chat || []).slice(0, 3).map(m => `<p><b>${esc(m[0])}</b> ${esc(m[1])}</p>`).join('');
      return `<section class="g-hero streamer ${gMode}">
        <div class="g-frame"><div class="feed"></div><div class="scan"></div>
          <div class="chip">${isLive ? `<span>● LIVE</span>${cfg.live.viewers ? `<span>${esc(cfg.live.viewers)} watching</span>` : ''}` : '<span>OFFLINE</span>'}</div>
          <div class="chat">${chat}</div><span class="embedlbl">Player embed slot</span></div>
        <div class="g-avatar"></div>
        <div class="g-copy"><div class="g-kicker"><i></i>${isLive ? esc(cfg.live.title || 'Live now') : 'Streamer'}<i></i></div>
          ${wordmark(cfg.title)}
          ${cfg.tagline ? `<p class="g-sub">${esc(cfg.tagline)}</p>` : ''}
          <div class="g-actions">${heroCTA()}</div>${audioMini()}</div>
        ${gStrip()}</section>`;
    }
    const state = PORT ? esc(cfg.availability || 'Books open') : rs && F.countdown ? (rs.future ? `Drops <span data-rel-short></span>` : 'Out now') : (cfg.kind_label || '');
    const cta = heroCTA();
    return `<section class="g-hero ${gMode}"><div class="g-stage">
        <div class="g-layer bg" data-depth="-0.5"></div><div class="g-halo"></div>
        <div class="g-layer mid" data-depth="0.25"><img src="${esc(L.mid || cfg.cover || 'cover.jpg')}" alt="" fetchpriority="high" decoding="async" width="1100" height="1100"></div>
        ${L.fg ? `<div class="g-layer fg" data-depth="0.9"><img data-src="${esc(L.fg)}" alt="" decoding="async" width="1100" height="1100"></div>` : ''}
        ${F.heroVideoBg ? `<div class="g-vid">${cfg.hero_video ? `<video src="${esc(cfg.hero_video)}" muted loop playsinline preload="none" poster="${esc(cfg.cover || 'cover.jpg')}"></video>` : '<canvas></canvas>'}<span class="g-vidlbl">${cfg.hero_video ? 'Video loop' : 'Animated loop · video slot'}</span></div>` : ''}
        <div class="g-shade"></div></div>
      ${F.heroVideoBg ? `<div class="g-bgt" role="group" aria-label="Hero background"><button type="button" data-bg="art3d">3D art</button><button type="button" data-bg="video">Video</button></div>` : ''}
      <div class="g-copy"><div class="g-kicker"><i></i>${esc(cfg.artist)}${cfg.feat ? ' · feat. ' + esc(cfg.feat) : ''}<i></i></div>
        ${wordmark(cfg.title)}
        <p class="g-sub">${state}${cfg.kind_label ? ' · ' + esc(cfg.kind_label) : ''}</p>
        <div class="g-actions">${cta || (HAS_AUDIO ? `<button class="g-play" data-act="music"><b></b><span>Play<small>${esc(MUSIC.title)}</small></span></button>` : '')}</div>
        ${cta ? audioMini() : ''}</div>
      ${gStrip()}<div class="g-scrollhint">Scroll</div></section>`;
  }
  /* music dock: upload = tap-to-play 30s loop with volume/mute; link = official embed, loaded only after a tap */
  function musicDock() {
    if (MUSIC.mode === 'none') return '';
    const I = MUSIC.mode === 'link' ? (window.ICONS || {})[MUSIC.prov[0] === 'apple' ? 'apple_music' : MUSIC.prov[0]] : null;
    const spk = '<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z"/><path class="w" d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
    if (MUSIC.mode === 'upload') return `<div class="mdock${reveal}" data-mode="upload"><button class="md-play" data-act="music" aria-label="Play ${esc(MUSIC.title)}"><svg viewBox="0 0 24 24" class="pl"><path d="M8 5v14l11-7z"/></svg><svg viewBox="0 0 24 24" class="pa"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg></button>
      <div class="md-t"><b>${esc(MUSIC.title)}</b><small>${GOLD ? 'Visualizer follows the track · ' : ''}30s loop · tap to play</small><div class="md-bar"><i></i></div></div>
      <button class="md-mute" data-act="mute" aria-label="Mute">${spk}</button><input class="md-vol" type="range" min="0" max="1" step="0.05" value="0.8" aria-label="Volume"></div>`;
    const P = MUSIC.prov;
    return `<div class="mdock${reveal}" data-mode="link"><span class="md-ico" style="background:${I ? '#' + I.hex : 'var(--acc)'}">${I ? `<svg viewBox="0 0 24 24" fill="#fff"><path d="${I.path}"/></svg>` : '♪'}</span>
      <div class="md-t"><b>${esc(MUSIC.title || 'Listen')}</b><small>${esc(P[1])} · official player</small></div><button class="btn sm md-load" data-act="music-embed">Play</button></div><div class="md-embed" hidden></div>`;
  }
  function embedSrc(u, p) {
    try { const x = new URL(u);
      if (p === 'spotify') return [`https://open.spotify.com/embed${x.pathname.replace(/^\/intl-[a-z]+/, '')}?utm_source=generator`, 152];
      if (p === 'apple') return [`https://embed.music.apple.com${x.pathname}${x.search}`, 175];
      if (p === 'soundcloud') return [`https://w.soundcloud.com/player/?url=${encodeURIComponent(u)}&visual=false&auto_play=true`, 166];
      if (p === 'youtube') { const id = x.hostname.includes('youtu.be') ? x.pathname.slice(1) : x.searchParams.get('v') || x.pathname.split('/').pop(); return [`https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1`, 210]; }
      if (p === 'audiomack') { const [a, kind, slug] = x.pathname.split('/').filter(Boolean); return [`https://audiomack.com/embed/${kind}/${a}/${slug}`, 252]; }
    } catch (e) {} return [null, 0];
  }
  function hero() {
    if (SKIN) return window.CPStudio.hero({ cfg, look: LOOK, heroCTA, PORT, provider });
    if (GOLD) return goldHero();
    const rs = releaseState();
    const streamer = cfg.layout === 'streamer';
    let status = '';
    if (streamer && F.liveBadge && cfg.live && cfg.live.is_live) {
      status = `<div class="status live"><span class="dot"></span>Live now${cfg.live.viewers ? ` · ${esc(cfg.live.viewers)} watching` : ''}</div>`;
    } else if (streamer && F.schedule && cfg.next_stream) {
      status = `<div class="status soft">Next stream · <span data-next-short></span></div>`;
    } else if (!streamer && rs && F.countdown) {
      status = rs.future ? `<div class="status soft">Drops <span data-rel-short></span></div>` : `<div class="status"><span class="dot"></span>Out now</div>`;
    } else if (PORT) {
      status = `<div class="status"><span class="dot"></span>${esc(cfg.availability || 'Books open')}</div>`;
    } else if (!streamer && cfg.kind_label) {
      status = `<div class="status soft">New ${esc(cfg.kind_label.toLowerCase())}</div>`;
    }
    const viz = ACCENT ? `<canvas class="accent-strip" data-accent="${esc(ACCENT)}" aria-hidden="true"></canvas>` : '';
    return `<header class="hero">
      <div class="cover-wrap${reveal}">${streamer ? '<div class="ring"></div>' : ''}
        <div class="cover ${F.microInteractions && streamer ? 'tilt' : ''}"><img src="${esc(cfg.cover || 'cover.jpg')}" alt="${esc(cfg.title)} artwork"><div class="glare"></div></div>
      </div>
      ${viz}
      ${status}
      <h1 class="title">${esc(cfg.title)}${cfg.feat ? `<span class="feat">feat. ${esc(cfg.feat)}</span>` : ''}</h1>
      ${PORT ? `<p class="byline">${esc(cfg.artist || '')}</p>${cfg.tagline ? `<p class="tagline">${esc(cfg.tagline)}</p>` : ''}` : streamer ? (cfg.tagline ? `<p class="tagline">${esc(cfg.tagline)}</p>` : '') : `<p class="byline">by <b>${esc(cfg.artist)}</b></p>${cfg.tagline ? `<p class="tagline">${esc(cfg.tagline)}</p>` : ''}`}
      ${cfg.kind_label && !streamer && !PORT ? `<p class="meta">${esc(cfg.kind_label)}${cfg.genre ? ' · ' + esc(cfg.genre) : ''}</p>` : ''}
      ${heroCTA()}
    </header>`;
  }

  function linkBtn(l, extra = '') {
    const known = !!(window.ICONS || {})[l.platform];
    const brand = known ? window.ICONS[l.platform].hex : 'ffffff';
    const n = parseInt(brand, 16), dark = !known || (((n >> 16) & 255) * .299 + ((n >> 8) & 255) * .587 + (n & 255) * .114) < 40;
    const ico = known ? icon(l.platform) : l.icon ? `<img src="${esc(l.icon)}" alt="" style="width:20px;height:20px;border-radius:4px">` : `<b style="color:#111;font-size:16px">${esc((l.label || l.host || '?')[0].toUpperCase())}</b>`;
    return `<a class="link${l.primary ? ' primary' : ''}${extra}${reveal}" href="${esc(l.url || '#')}" target="_blank" rel="noopener" data-link="${esc(l.platform)}" style="--ico-bg:${dark ? '#fff' : '#' + brand};--ico:${dark ? '#000' : '#fff'}">
        <span class="ico">${ico}</span>
        <span class="lbl">${esc(l.label || NAMES[l.platform] || l.platform)}${l.sub ? `<small>${esc(l.sub)}</small>` : ''}</span>
        <span class="go">${esc(l.cta || VERB[l.platform] || 'Open')}${l.out ? ' ↗' : ''}</span></a>`;
  }
  function links() {
    const L = (cfg.links || []).filter(l => !HERO_URLS.has(l.url)); if (!L.length) return '';
    return `<nav class="links" aria-label="Links">${L.map(l => linkBtn(Object.assign({}, l, { primary: false }))).join('')}</nav>`;
  }

  function socials() {
    if (!F.socials || !cfg.socials) return '';
    return `<div class="socials${reveal}">${cfg.socials.map(s => `<a href="${esc(s.url || '#')}" aria-label="${esc(NAMES[s.platform] || s.platform)}">${icon(s.platform)}</a>`).join('')}</div>`;
  }

  function countdownCard() {
    if (!F.countdown) return '';
    const streamer = cfg.layout === 'streamer';
    const target = streamer ? cfg.next_stream : (cfg.release && cfg.release.date);
    if (!target) return '';
    const fut = new Date(target).getTime() > Date.now();
    if (!fut && !streamer) {
      return `<div class="card countdown${reveal}"><div class="eyebrow">Release day hit</div><div class="outnow" style="margin-top:8px">It's <span class="flip">Out now</span></div><p class="fine" style="margin-top:8px">Auto-flipped from countdown at release time · no manual update</p></div>`;
    }
    if (!fut && streamer && F.liveBadge && cfg.live && cfg.live.is_live) return '';
    return `<div class="card countdown${reveal}" data-countdown="${esc(target)}">
      <div class="eyebrow">${streamer ? 'Next stream starts in' : 'Drops in'}</div>
      <div class="cd-grid"><div><b data-u="d">0</b><small>Days</small></div><div><b data-u="h">0</b><small>Hrs</small></div><div><b data-u="m">0</b><small>Min</small></div><div><b data-u="s">0</b><small>Sec</small></div></div>
      <p class="fine" style="margin-top:10px">${streamer ? esc(cfg.next_stream_label || '') : 'Flips to OUT NOW automatically on release day'}</p></div>`;
  }

  function sec(title, right, inner, cls) {
    return `<section class="sec${reveal} ${cls || ''}"><div class="sec-h"><h2>${title}</h2>${right ? `<span>${right}</span>` : ''}</div>${inner}</section>`;
  }

  function videoBlock() {
    const v = cfg.video; if (!F.video || !v) return '';
    const inner = v.id && v.provider === 'youtube'
      ? `<iframe src="https://www.youtube-nocookie.com/embed/${esc(v.id)}" title="${esc(v.title)}" allow="encrypted-media; picture-in-picture" allowfullscreen loading="lazy"></iframe>`
      : `<img src="${esc(v.poster || cfg.cover || 'cover.jpg')}" alt=""><div class="play"><i></i></div><span class="vbadge">${esc(v.badge || 'Video embed slot')}</span><div class="vcap"><span>${esc(v.title)}</span><span>${esc(v.duration || '')}</span></div>`;
    return sec(esc(v.heading || 'Watch'), esc(v.provider_label || ''), `<div class="video">${inner}</div>`);
  }

  function playerBlock() {
    if (!F.video || cfg.layout === 'streamer') return '';
    return sec('Listen here', 'Spotify / Apple embed slot', `<div class="card"><div class="player"><img src="${esc(cfg.cover || 'cover.jpg')}" alt=""><div class="bar"><b style="font-size:14px">${esc(cfg.title)}</b><div class="muted" style="font-size:12px;margin:0">${esc(cfg.artist)}${cfg.feat ? ', ' + esc(cfg.feat) : ''}</div><div><i></i></div></div><span class="pbtn"></span></div></div>`);
  }

  /* release / clip cards link to the release's own URL, else the creator's main link (placeholder in demos); never href="#" */
  function relUrl(r) { const L = cfg.links || []; return r.url || (L.find(l => l.primary) || L[0] || {}).url || cfg.page_url || 'https://example.com/placeholder'; }
  function eras() {
    const g = T.grades || [];
    const list = [{ title: cfg.title, sub: cfg.layout === 'streamer' ? 'Latest highlight' : 'Out now', art: cfg.cover || 'cover.jpg' }, ...(cfg.releases || [])];
    return `<div class="eras">${list.map((r, i) => `<a class="era" href="${esc(relUrl(r))}" target="_blank" rel="noopener" data-link="${cfg.layout === 'streamer' ? 'clip' : 'release'}" style="--ec:${g[(i + 1) % g.length] || 'var(--acc)'};--ec2:${g[(i + 2) % g.length] || 'var(--acc2)'}">
      <div class="eart${r.art ? '' : ' gen'}" ${r.art ? `style="background-image:url('${esc(r.art)}')"` : `data-t="${esc(r.title)}"`}></div><span class="eplay"></span>
      <div class="einfo"><small>${cfg.layout === 'streamer' ? 'Clip' : 'Era'} ${String(i + 1).padStart(2, '0')}${i === 0 ? ' · now' : ''}</small><h3>${esc(r.title)}</h3><p>${esc(r.sub || '')}</p></div></a>`).join('')}</div>`;
  }
  function ecosystem() {
    if (!F.ecosystem) return '';
    if (F.eraCarousel && cfg.releases && cfg.releases.length) {
      return sec(esc(cfg.releases_heading || 'The eras'), 'Swipe →', eras()) + (cfg.tracks && cfg.tracks.length ? '' : '');
    }
    let out = '';
    if (cfg.tracks && cfg.tracks.length) {
      out += sec(esc(cfg.tracks_heading || 'The project'), `${cfg.tracks.length} tracks`, `<div class="card" style="padding:6px 16px"><ol class="tracks">${cfg.tracks.map((t, i) => `<li class="${t.current ? 'cur' : ''}"><span class="n">${t.current ? '▶' : i + 1}</span><span class="t">${esc(t.title)}${t.feat ? `<small>feat. ${esc(t.feat)}</small>` : ''}</span><span class="d">${esc(t.dur || '')}</span></li>`).join('')}</ol></div>`);
    }
    if (cfg.releases && cfg.releases.length) {
      out += sec(esc(cfg.releases_heading || `More from ${cfg.artist}`), 'Swipe →', `<div class="rail">${cfg.releases.map((r, i) => {
        const hue = ['var(--acc)', 'var(--acc2)', 'var(--dom)', 'var(--bg2)'][i % 4];
        return `<a class="rel" href="${esc(relUrl(r))}" target="_blank" rel="noopener" data-link="release"><div class="art" style="position:relative;background:linear-gradient(150deg,${hue},var(--bg));${r.art ? `background-image:url('${esc(r.art)}');background-size:cover;` : ''}">${r.art ? '' : esc(r.title)}</div><p>${esc(r.title)}</p><small>${esc(r.sub || '')}</small></a>`;
      }).join('')}</div>`);
    }
    return out;
  }

  function scheduleBlock() {
    if (!F.schedule || !cfg.schedule) return '';
    const today = new Date().toLocaleDateString('en-US', { weekday: 'short' });
    return sec('Stream schedule', esc(cfg.schedule_tz || ''), `<div class="sched">${cfg.schedule.map(d => `<div class="day${d.off ? ' off' : ''}${d.day === today ? ' today' : ''}"><b>${esc(d.day)}</b><span>${esc(d.title)}</span><em>${esc(d.time || '')}</em></div>`).join('')}</div>`);
  }

  function fanCapture() {
    if (!F.fanCapture) return '';
    const fc = cfg.fan_capture || {};
    return sec(esc(fc.heading || 'Get the drop first'), 'Fans stay yours', `<div class="card"><form class="form" data-form="fans">
      <div class="seg" role="tablist"><button type="button" class="on" data-ch="email">Email</button><button type="button" data-ch="sms">Text me</button></div>
      <input aria-label="you@email.com" class="in" name="contact" type="email" placeholder="you@email.com" autocomplete="off" required>
      <button class="btn" type="submit">${esc(fc.cta || 'Notify me')}</button>
      <p class="fine">Demo form · saved only in this browser · real version syncs to your list with consent + unsubscribe</p>
    </form></div>`);
  }

  function shareCard() {
    if (!F.shareCard) return '';
    return sec('Share to your story', '', `<div class="card share"><div class="story"><img src="${esc(cfg.cover || 'cover.jpg')}" alt=""><b>${esc(cfg.title)}</b><small>${esc(cfg.layout === 'streamer' ? (cfg.page_url_display || '') : (cfg.artist || ''))}</small></div>
      <div class="txt"><h3>Auto-made story card</h3><p class="muted" style="font-size:13px;margin-bottom:12px">9:16, in the page's colors, with a link sticker spot.</p><button class="btn sm" data-act="story">Download card</button></div></div>`);
  }

  const PROD = {
    tee: c => `<svg viewBox="0 0 200 200"><path d="M62 28 86 18q14 14 28 0l24 10 38 30-20 28-14-8v104H58V78l-14 8-20-28z" fill="${c}"/><path d="M86 18q14 14 28 0" fill="none" stroke="rgba(0,0,0,.25)" stroke-width="3"/><image href="cover.jpg" x="74" y="64" width="52" height="52" preserveAspectRatio="xMidYMid slice"/></svg>`,
    hoodie: c => `<svg viewBox="0 0 200 200"><path d="M70 30q30-26 60 0l40 26-18 34-12-8v100H60V82l-12 8-18-34z" fill="${c}"/><path d="M78 34q22 26 44 0" fill="rgba(0,0,0,.28)"/><path d="M92 50v30M108 50v30" stroke="rgba(255,255,255,.6)" stroke-width="2"/><image href="cover.jpg" x="78" y="96" width="44" height="44" preserveAspectRatio="xMidYMid slice"/><rect x="76" y="148" width="48" height="22" rx="6" fill="rgba(0,0,0,.18)"/></svg>`,
    print: c => `<svg viewBox="0 0 200 200"><rect x="40" y="22" width="120" height="156" rx="4" fill="#f4efe8"/><image href="cover.jpg" x="52" y="34" width="96" height="96" preserveAspectRatio="xMidYMid slice"/><path d="M60 150q20-14 40 0t40 0" fill="none" stroke="#222" stroke-width="2.5"/><text x="100" y="168" font-size="8" text-anchor="middle" fill="#666" font-family="sans-serif">SIGNED · LIMITED</text></svg>`,
    vinyl: c => `<svg viewBox="0 0 200 200"><rect x="22" y="40" width="120" height="120" rx="6" fill="${c}"/><image href="cover.jpg" x="28" y="46" width="108" height="108" preserveAspectRatio="xMidYMid slice"/><g class="spin" style="transform-origin:130px 100px"><circle cx="130" cy="100" r="58" fill="#111"/><circle cx="130" cy="100" r="44" fill="none" stroke="#2a2a2a" stroke-width="1"/><circle cx="130" cy="100" r="34" fill="none" stroke="#2a2a2a" stroke-width="1"/><circle cx="130" cy="100" r="20" fill="${c}"/><circle cx="130" cy="100" r="3" fill="#000"/></g></svg>`
  };
  /* No on-page sales: products are showcase cards that link out to the creator's own store (Shopify, BeatStars...). */
  const storeUrl = m => m.url || (cfg.store && cfg.store.url) || '#';
  const storeName = () => (cfg.store && (cfg.store.label || NAMES[cfg.store.platform])) || 'store';
  function goldShop() {
    const g = T.grades || [];
    return sec(esc(cfg.merch_heading || 'Merch'), esc(cfg.merch_note || `Opens ${storeName()}`), `<div class="g-shop">${cfg.merch.map((m, i) => { const c = g[i % g.length] || 'var(--acc)'; const kind = m.kind || ['tee', 'print', 'hoodie', 'vinyl'][i % 4];
      return `<a class="g-prod" href="${esc(storeUrl(m))}" target="_blank" rel="noopener" data-link="${esc((cfg.store && cfg.store.platform) || 'shop')}" style="--pc:${c}">${m.tag ? `<span class="tag">${esc(m.tag)}</span>` : ''}<div class="pv">${PROD[kind](c)}</div><div class="shine"></div><div class="pi"><p>${esc(m.name)}</p><div><span class="view">View ↗</span></div></div></a>`; }).join('')}</div>${storeButtons()}`);
  }
  function storeButtons() {
    const L = cfg.store_links || (cfg.store ? [cfg.store] : []);
    return L.length ? `<nav class="links store-links">${L.map(l => linkBtn(Object.assign({ cta: 'Shop', out: true, primary: true }, l))).join('')}</nav>` : '';
  }
  function merch() {
    if (!F.merch || !cfg.merch) return F.merch ? storeButtons() : '';
    if (F.merch3D && !SKIN) return goldShop();
    return sec(esc(cfg.merch_heading || 'Merch'), esc(cfg.merch_note || `Opens ${storeName()}`), `<div class="grid2">${cfg.merch.map((m, i) => `<a class="prod" href="${esc(storeUrl(m))}" target="_blank" rel="noopener" data-link="${esc((cfg.store && cfg.store.platform) || 'shop')}"><div class="pimg" style="background:linear-gradient(160deg,${['var(--dom)', 'var(--acc2)', 'var(--acc)', 'var(--bg2)'][i % 4]},var(--bg))">${m.tag ? `<span class="tag">${esc(m.tag)}</span>` : ''}<img src="${esc(cfg.cover || 'cover.jpg')}" alt=""></div><div class="pinfo"><p>${esc(m.name)}</p><div><span class="view">View ↗</span></div></div></a>`).join('')}</div>${storeButtons()}`);
  }

  /* Tips = links out to the creator's own Cash App / PayPal / Venmo / Ko-fi / Buy Me a Coffee / Stripe link; Zelle shows a handle to copy.
     No amounts, no payment UI on the page. Silver + Gold only (F.tipButton). */
  const TIP = {
    cashapp: { name: 'Cash App', icon: 'cashapp', show: h => '$' + h.replace(/^\$/, ''), url: h => `https://cash.app/$${encodeURIComponent(h.replace(/^\$/, ''))}` },
    paypal: { name: 'PayPal', icon: 'paypal', show: h => 'paypal.me/' + h, url: h => `https://paypal.me/${encodeURIComponent(h)}` },
    venmo: { name: 'Venmo', icon: 'venmo', show: h => '@' + h.replace(/^@/, ''), url: h => `https://venmo.com/u/${encodeURIComponent(h.replace(/^@/, ''))}` },
    zelle: { name: 'Zelle', icon: 'zelle', show: h => h, copy: true },
    kofi: { name: 'Ko-fi', icon: 'kofi', show: h => 'ko-fi.com/' + h, url: h => `https://ko-fi.com/${encodeURIComponent(h)}` },
    bmc: { name: 'Buy Me a Coffee', icon: 'buymeacoffee', show: h => 'buymeacoffee.com/' + h, url: h => `https://buymeacoffee.com/${encodeURIComponent(h)}` },
    stripe: { name: 'Stripe link', icon: 'stripe', show: h => h.replace(/^https?:\/\//, ''), url: h => /^https:\/\//.test(h) ? h : `https://buy.stripe.com/${encodeURIComponent(h)}` }
  };
  const tipList = () => (cfg.tip_methods || []).filter(m => TIP[m.type] && m.handle && m.on !== false);
  function tipChip() { return F.tipButton && tipList().length ? `<button class="tip-chip" data-act="tip" aria-label="Tip ${esc(cfg.artist || cfg.title)}"><svg viewBox="0 0 24 24"><path d="M12 21s-7-4.4-9.3-8.6C1.1 9.3 2.8 5.5 6.4 5.5c2.1 0 3.6 1.4 4.3 2.6h2.6c.7-1.2 2.2-2.6 4.3-2.6 3.6 0 5.3 3.8 3.7 6.9C19 16.6 12 21 12 21z"/></svg><span class="tc-t">${esc(TIP_SAYING || 'Tip')}</span></button>` : ''; }
  function tipRows() {
    return tipList().map(m => { const T2 = TIP[m.type], I = (window.ICONS || {})[T2.icon]; const bg = I ? '#' + I.hex : 'var(--acc)';
      const ico = I ? icon(T2.icon, '#fff') : `<b>${esc(T2.name[0])}</b>`;
      return T2.copy
        ? `<div class="tip-row" data-tipm="${m.type}"><span class="ti" style="background:${bg}">${ico}</span><span class="tt"><b>${T2.name}</b><small>${esc(T2.show(m.handle))}</small></span><button class="tip-go" data-act="tip-copy" data-h="${esc(m.handle)}" data-m="${m.type}">Copy</button></div>`
        : `<a class="tip-row" href="${esc(T2.url(m.handle))}" target="_blank" rel="noopener" data-tip="${m.type}"><span class="ti" style="background:${bg}">${ico}</span><span class="tt"><b>${T2.name}</b><small>${esc(T2.show(m.handle))}</small></span><span class="tip-go">Open ↗</span></a>`; }).join('');
  }
  function tips() {
    if (!F.tipButton && !F.tips) return '';
    if (tipList().length) return sec(esc((cfg.tips || {}).heading || 'Show love'), 'Goes straight to them', `<div class="card tip-list">${tipRows()}<p class="fine">Opens their own app. No payment happens on this page.</p></div>`);
    if (!F.tips || !cfg.tips || !(cfg.tips.links || []).length) return '';
    return sec(esc(cfg.tips.heading || 'Show love'), 'Goes straight to them', `<nav class="links">${cfg.tips.links.map(l => linkBtn(Object.assign({ cta: 'Tip', out: true }, l))).join('')}</nav>`);
  }

  function shows() {
    if (!F.shows || !cfg.shows) return '';
    return sec('Shows', esc(cfg.shows_note || ''), `<div class="card" style="padding:4px 16px">${cfg.shows.map(s => { const d = new Date(s.date + 'T12:00:00'); return `<div class="show"><div class="date"><small>${d.toLocaleDateString('en-US', { month: 'short' })}</small><b>${d.getDate()}</b></div><div class="info"><p>${esc(s.city)}</p><small>${esc(s.venue)}</small></div><button class="tix" data-act="tix">${esc(s.cta || 'Tickets')}</button></div>`; }).join('')}</div>`);
  }

  function credits() {
    if (!F.credits || !cfg.credits) return '';
    return sec('Credits', '', `<div class="card"><div class="credits">${cfg.credits.map(c => `<div><small>${esc(c.role)}</small><p>${esc(c.name)}</p></div>`).join('')}</div></div>`);
  }

  function lyrics() {
    if (!F.lyrics) return '';
    const l = cfg.lyrics || {};
    const body = l.lines && l.lines.length ? l.lines.map(x => `<div>${esc(x)}</div>`).join('') : `<p class="ph" style="font-family:var(--font-body)">Lyrics slot · artist-supplied (placeholder lines below)</p>${'<span class="bl" style="width:88%"></span><span class="bl" style="width:72%"></span><span class="bl" style="width:80%"></span><span class="bl" style="width:64%"></span><span class="bl" style="width:76%"></span>'}`;
    return sec('Lyrics', 'Synced in the real version', `<div class="card"><div class="lyrics">${body}</div></div>`);
  }

  function epk() {
    if (!F.epk || !cfg.epk) return '';
    const e = cfg.epk;
    return sec('Press kit', 'EPK', `<div class="card stack"><div class="epk-photos"><div style="background-image:var(--art);background-position:30% 40%"></div><div style="background-image:var(--art);background-position:80% 60%;background-size:220%"></div><div style="background-image:var(--art);background-position:20% 90%;background-size:260%"></div></div>
      <p style="font-size:14px">${esc(e.bio)}</p>
      <div class="stats">${(e.stats || []).map(s => `<div><b>${esc(s.v)}</b><small>${esc(s.l)}</small></div>`).join('')}</div>
      ${e.stats_note ? `<p class="fine">${esc(e.stats_note)}</p>` : ''}
      <button class="btn ghost sm" data-act="epk">Download press kit</button></div>`);
  }

  function booking() {
    if (!F.booking || !cfg.takes_bookings) return '';
    const b = cfg.booking || {};
    const types = b.types || ['Feature', 'Show', 'Sponsor'];
    return sec(esc(b.heading || 'Book / work with me'), 'Goes straight to your inbox', `<div class="card"><form class="form" data-form="book">
      <div class="seg">${types.map((t, i) => `<button type="button" class="${i ? '' : 'on'}" data-bt="${esc(t)}">${esc(t)}</button>`).join('')}</div>
      <div class="row"><input aria-label="Name" class="in" placeholder="Name" required><input aria-label="Email" class="in" type="email" placeholder="Email" required></div>
      <input aria-label="Date / city (if it's a show)" class="in" placeholder="Date / city (if it's a show)">
      <textarea aria-label="What are you thinking? (feature, show, collab)" class="in" placeholder="What are you thinking? (feature, show, collab)"></textarea>
      <button class="btn" type="submit">Send request</button><p class="fine">Demo form · nothing is sent · a request, not a confirmed booking</p></form></div>`);
  }

  function qrCard() {
    if (!F.qrCode || !cfg.qr_svg) return '';
    return sec('Scan to open', '', `<div class="card qr"><div class="code">${cfg.qr_svg}</div><div><h3>Page QR code</h3><p>Print it on flyers, merch tables and stream overlays.</p><p class="ph" style="margin-top:4px">${esc(cfg.page_url_display || '')}</p></div></div>`);
  }

  function exportBlock() {
    if (!F.fanExport) return '';
    return `<div class="row" style="margin-top:10px"><button class="btn ghost sm" data-act="export">Export fan list (CSV) · <span data-fancount>0</span></button></div>`;
  }

  function analytics() {
    if (!F.analytics) return '';
    const a = cfg.analytics_sample || {};
    const bars = a.bars || [22, 30, 26, 41, 38, 55, 49, 62, 58, 74, 69, 88, 80, 96];
    const src = a.sources || [['Instagram', 46], ['TikTok', 27], ['QR scans', 14], ['Direct', 13]];
    return `<button class="btn ghost sm owner-toggle" style="width:auto;padding:0 16px" data-act="owner">Owner view · analytics</button>
    <section class="sec analytics${EXPAND ? ' on' : ''}"><div class="card"><div class="sec-h" style="margin:0"><h2>Analytics</h2><span>Sample numbers · owner-only</span></div>
      <div class="kpis"><div><b>${esc(a.views || '12.4K')}</b><small>Page views</small><br><em>▲ 18%</em></div><div><b>${esc(a.clicks || '5.1K')}</b><small>Link clicks</small><br><em>▲ 9%</em></div><div><b>${esc(a.fans || '842')}</b><small>Fans captured</small><br><em>▲ 31%</em></div></div>
      <div class="eyebrow">Last 14 days</div><div class="bars">${bars.map(h => `<i style="height:${h}%"></i>`).join('')}</div>
      <div class="src">${src.map(([n, v]) => `<div><span>${esc(n)}</span><i style="width:${v * 2}px"></i><b>${v}%</b></div>`).join('')}</div></div></section>`;
  }

  /* intake preview only (?preview=1): what the "Anything else?" line changed, and what was noted for review */
  function reviewBox() {
    const w = cfg.intake && cfg.intake.wish; if (!qs.get('preview') || !w || !w.input) return '';
    return `<aside class="review-box"><div class="rb-h">Your note: <q>${esc(w.input)}</q></div>
      ${w.applied.length ? `<p class="rb-ok"><b>Applied</b> ${w.applied.map(esc).join(' · ')}</p>` : ''}
      ${w.skipped.length ? `<div class="rb-skip"><b>Noted for review</b><ul>${w.skipped.map(x => `<li>“${esc(x.wish)}”: ${esc(x.reason)}</li>`).join('')}</ul></div>` : ''}</aside>`;
  }
  function footer() {
    let f = reviewBox();
    if (F.customDomain) f += `<div class="domain"><svg viewBox="0 0 24 24"><path d="M5 12l5 5L20 7"/></svg>Served on <b>${esc(cfg.domain_display || 'your-own-domain.com')}</b> · no third-party branding</div>`;
    if (F.badge) f += `<a class="made" href="${esc(cfg.made_url || 'https://creatorpages.example/?ref=made-with')}" target="_blank" rel="noopener" data-link="CreatorPages"><i></i>Made with ${esc(cfg.brand_name || 'CreatorPages')} · ${esc((cfg.tierMeta || {}).label || '')}</a>`;
    f += `<p class="legal">${esc(cfg.footer_note || '')}</p>`;
    return `<footer class="foot">${f}</footer>`;
  }

  /* ---------- extra sections (Gold section builder) + portfolio / visual-work sections ---------- */
  const demoNote = t => `<p class="fine">${t}</p>`;
  function story() {
    const s2 = cfg.story || {}; if (!s2.text && !F.sectionBuilder) return '';
    return sec(esc(s2.heading || 'The story'), '', `<div class="card story-card">${s2.text ? `<p>${esc(s2.text)}</p>` : '<p class="ph">Your story goes here: where you came from, what this era is about.</p>'}${s2.sig ? `<p class="sig">${esc(s2.sig)}</p>` : ''}</div>`);
  }
  function customBlock() {
    const c = cfg.custom || {};
    const emb = c.embed_url && /^https:\/\/(www\.)?(youtube(-nocookie)?\.com|open\.spotify\.com|player\.vimeo\.com|w\.soundcloud\.com)\//.test(c.embed_url)
      ? `<div class="video"><iframe src="${esc(c.embed_url)}" title="${esc(c.title || 'Embed')}" loading="lazy" allow="encrypted-media"></iframe></div>` : c.embed_label ? `<div class="embed-slot">${esc(c.embed_label)}</div>` : '';
    return sec(esc(c.title || 'More'), esc(c.right || 'Custom block'), `<div class="card stack">${c.text ? `<p>${esc(c.text)}</p>` : '<p class="ph">Custom text or an embed (YouTube, Spotify, Vimeo, SoundCloud).</p>'}${emb}</div>`);
  }
  function faq() {
    const L = cfg.faq || []; if (!L.length && !F.sectionBuilder) return '';
    const items = L.length ? L : [{ q: 'Question', a: 'Answer (add yours in the hub).' }];
    return sec('FAQ', '', `<div class="card faq">${items.map(x => `<details><summary>${esc(x.q)}</summary><p>${esc(x.a)}</p></details>`).join('')}</div>`);
  }
  function testimonials() {
    const L = cfg.testimonials || []; if (!L.length) return '';
    if (PORT && !F.reviews) return '';
    return sec(esc(cfg.testimonials_heading || 'Reviews'), cfg.sample ? 'Sample reviews' : '', `<div class="revs">${L.map(r => `<figure class="rev"><div class="stars">${'★'.repeat(r.stars || 5)}</div><blockquote>${esc(r.text)}</blockquote><figcaption>${esc(r.name)}${r.what ? ` · <span>${esc(r.what)}</span>` : ''}</figcaption></figure>`).join('')}</div>`);
  }
  // portfolio
  function portfolio() {
    const G = cfg.gallery || []; if (!G.length) return '';
    const lim = F.galleryLimit || 0, list = lim ? G.slice(0, lim) : G;
    const cats = [...new Set(list.map(g => g.cat).filter(Boolean))];
    const chips = F.galleryFilters && cats.length > 1 ? `<div class="gfilter" role="group" aria-label="Filter by style"><button type="button" class="on" data-gf="*">All</button>${cats.map(c => `<button type="button" data-gf="${esc(c)}">${esc(c)}</button>`).join('')}</div>` : '';
    return sec(esc(cfg.gallery_heading || 'Work'), `${list.length} pieces`, `${chips}<div class="masonry">${list.map((g, i) => `<figure class="gi" data-cat="${esc(g.cat || '')}" style="--ar:${g.ar || 1}"><img src="${esc(g.src)}" alt="${esc(g.alt || g.cat || 'Portfolio piece')}" loading="lazy">${g.cap ? `<figcaption>${esc(g.cap)}</figcaption>` : ''}</figure>`).join('')}</div>${lim && G.length > lim ? demoNote(`Bronze shows up to ${lim} photos · Silver and Gold are unlimited`) : ''}`);
  }
  function services() {
    const L = cfg.services || []; if (!L.length) return '';
    return sec(esc(cfg.services_heading || 'Services & prices'), esc(cfg.services_note || ''), `<div class="card svc">${L.map(x => `<div class="svc-row"><div><b>${esc(x.name)}</b>${x.note ? `<small>${esc(x.note)}</small>` : ''}</div><span class="svc-t">${esc(x.time || '')}</span><span class="svc-p">${esc(x.price || '')}</span>${x.book_url && BK ? `<a class="svc-b" href="${esc(x.book_url)}" target="_blank" rel="noopener" data-book="${esc(provider(x.book_url).id)}">Book</a>` : ''}</div>`).join('')}${bookButton()}${demoNote(`Prices are a text menu. Booking${BK ? ' happens on ' + esc(BK.name) : ''}; no payment on this page.`)}</div>`);
  }
  function beforeAfter() {
    if (!F.beforeAfter) return ''; const L = cfg.before_after || []; if (!L.length) return '';
    return sec('Before / after', 'Drag the line', L.map(b => `<div class="ba" style="--pos:50%"><img src="${esc(b.before)}" alt="Before"><div class="ba-after"><img src="${esc(b.after)}" alt="After"></div><span class="ba-l">Before</span><span class="ba-r">After</span><i class="ba-handle"></i><input type="range" min="0" max="100" value="50" aria-label="Before and after slider"></div>${b.label ? `<p class="fine" style="margin-top:6px">${esc(b.label)}</p>` : ''}`).join(''));
  }
  function flash() {
    if (!F.flashDrop) return ''; const fl = cfg.flash; if (!fl || !(fl.items || []).length) return '';
    const fut = fl.drop_date && new Date(fl.drop_date).getTime() > Date.now();
    return sec(esc(fl.heading || 'Flash drop'), fut ? 'Drop countdown' : 'Available now', `${fut ? `<div class="card countdown" data-countdown="${esc(fl.drop_date)}"><div class="eyebrow">${esc(fl.drop_label || 'Next flash drop in')}</div><div class="cd-grid"><div><b data-u="d">0</b><small>Days</small></div><div><b data-u="h">0</b><small>Hrs</small></div><div><b data-u="m">0</b><small>Min</small></div><div><b data-u="s">0</b><small>Sec</small></div></div></div>` : ''}
      <div class="flash">${fl.items.map(it => `<div class="fl${it.status === 'claimed' ? ' claimed' : ''}"><img src="${esc(it.src)}" alt="${esc(it.name)}" loading="lazy"><div class="fl-i"><b>${esc(it.name)}</b><small>${esc(it.size || '')}</small></div>${it.status === 'claimed' ? '<span class="fl-tag">Claimed</span>' : `<button class="fl-claim" data-act="claim" data-name="${esc(it.name)}">Claim</button>`}</div>`).join('')}</div>${demoNote('One of one: each design is tattooed once. Claim opens the booking request.')}`);
  }
  function locationBlock() {
    const l = cfg.location; if (!l || !F.location) return '';
    const map = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(l.map_query || l.label || '');
    return sec('Visit', esc(l.note || ''), `<div class="card loc"><div class="loc-a"><b>${esc(l.label)}</b><small>${esc(l.area || '')}</small><a class="btn ghost sm" href="${esc(map)}" target="_blank" rel="noopener" data-link="googlemaps">Open map ↗</a></div><div class="hours">${(l.hours || []).map(h => `<div><span>${esc(h[0])}</span><b>${esc(h[1])}</b></div>`).join('')}</div></div>`);
  }
  function policies() {
    const L = cfg.policies || []; if (!L.length || !F.location) return '';
    return `<div id="policies"></div>` + sec('Policies', '', `<div class="card faq">${L.map(x => `<details${x.open ? ' open' : ''}><summary>${esc(x.title)}</summary><p>${esc(x.text)}</p>${x.url ? `<a class="pol-link" href="${esc(x.url)}" target="_blank" rel="noopener" data-book="${esc(provider(x.url).id)}">${esc(x.link_label || 'Details')} ↗</a>` : ''}</details>`).join('')}</div>`);
  }
  function igFeed() {
    if (!F.igGrid) return ''; const L = cfg.ig_feed || []; if (!L.length) return '';
    const ig = (cfg.links || []).find(l => l.platform === 'instagram');
    return sec('Instagram', ig ? `<a href="${esc(ig.url)}" data-link="instagram">${esc(cfg.ig_handle || 'Open')} ↗</a>` : '', `<div class="igg">${L.slice(0, 9).map((src, i) => `<a href="${esc(ig ? ig.url : '#instagram')}" data-link="instagram" aria-label="Instagram post ${i + 1}"><img src="${esc(src)}" alt="" loading="lazy" width="300" height="300"></a>`).join('')}</div>${demoNote('Feed-style grid from their uploads (a live IG feed needs their Instagram login in the real version)')}`);
  }
  /* ---------- booking (portfolio / service pros) ----------
     Bronze: a Book-now button from a pasted URL (provider auto-detected, deep link per service), hours, cancellation + deposit note (links out).
     Silver: the provider's official embed where they allow one, or a short request form ("request received, not yet booked").
     Gold:   a full intake form + confirmation email + optional reminders; the creator accepts/declines/proposes in the hub (.ics after accept).
     Never: deposits taken here, or claims about live availability on Booksy/Vagaro/etc. */
  const BK = cfg.booking_url ? provider(cfg.booking_url) : null;
  const provIco = (pv, sz) => (window.ICONS || {})[pv.id] ? icon(pv.id, '#fff') : `<b style="color:#fff;font-size:${sz || 15}px">${esc(pv.name[0])}</b>`;
  function bookButton() {
    if (!BK || !F.bookButton) return '';
    return `<a class="bk-btn${reveal}" href="${esc(cfg.booking_url)}" target="_blank" rel="noopener" data-book="${esc(BK.id)}" style="--pc:${BK.color}"><span class="bk-ico">${provIco(BK)}</span><span class="bk-t"><small>Book now on</small>${esc(BK.name)}</span><span class="bk-go">↗</span></a>`;
  }
  function bookingBlock() {
    if (!PORT || !BK || !(F.bookingEmbed || F.bookingForm)) return '';   // Bronze: Book-now button in hero + services only
    let inner = '';
    if (F.bookingForm) inner = intakeForm();
    else if (F.bookingEmbed) {
      inner = BK.embed
        ? `<div class="card bk-embed"><div class="bk-embed-h"><span class="bk-ico" style="--pc:${BK.color}">${provIco(BK, 13)}</span><b>${esc(BK.name)} booking</b><span class="fine">Official embed</span></div><div class="bk-embed-slot"><div class="sk"></div><div class="sk"></div><div class="sk s"></div><p>${esc(BK.name)}'s own booking widget loads here (their live times, their checkout).</p></div><p class="fine">This page doesn't show or promise availability; the widget is ${esc(BK.name)}'s.</p></div>`
        : `<div class="card"><p class="fine" style="text-align:left">${esc(BK.name)} doesn't offer an embed, so the page uses the Book-now button plus a short request form.</p></div>`;
      inner += `<details class="card bk-req"${BK.embed ? '' : ' open'}><summary>Prefer to ask first? Send a quick request</summary>${shortForm()}</details>`;
    }
    return sec(esc((cfg.booking_form || {}).heading || 'Book'), F.bookingForm ? 'Request · not instant booking' : esc(BK.name), (F.bookingForm ? '' : bookButton()) + inner);
  }
  function shortForm() {
    return `<form class="form" data-form="bookreq" data-mode="short"><div class="row"><input aria-label="Name" class="in" name="name" placeholder="Name" required><input aria-label="Email" class="in" name="email" type="email" placeholder="Email" required></div>
      <select aria-label="Service" class="in" name="service">${(cfg.services || []).map(x => `<option>${esc(x.name)}</option>`).join('')}</select><input aria-label="Days / times that work" class="in" name="when" placeholder="Days / times that work">
      <button class="btn" type="submit">Send request</button><p class="fine">Demo · nothing is sent. You'd get a "request received, not yet booked" email.</p></form>`;
  }
  function intakeForm() {
    const b = cfg.booking_form || {}; const v = cfg.vertical;
    const svc = (cfg.services || []).map((x, i) => `<label class="pick"><input type="radio" name="service" value="${esc(x.name)}"${i ? '' : ' checked'}><span><b>${esc(x.name)}</b><small>${esc([x.time, x.price].filter(Boolean).join(' · '))}</small></span></label>`).join('');
    const dep = b.deposit || {};
    return `<div class="card"><form class="form intake" data-form="bookreq" data-mode="full">
      <div class="fs"><div class="fs-h">1 · Service</div><div class="picks">${svc}</div></div>
      <div class="fs"><div class="fs-h">2 · Preferred dates & times</div><div class="row"><input class="in" type="date" name="d1" aria-label="First choice date"><input class="in" type="date" name="d2" aria-label="Second choice date"></div>
        <div class="seg chips" data-multi="1">${['Morning', 'Afternoon', 'Evening', 'Weekend'].map((t, i) => `<button type="button" class="${i === 1 ? 'on' : ''}" data-v="${t}">${t}</button>`).join('')}</div></div>
      ${v === 'tattoo' ? `<div class="fs"><div class="fs-h">3 · Placement & size</div><div class="row"><select class="in" name="placement" aria-label="Placement">${['Forearm', 'Upper arm', 'Calf', 'Thigh', 'Back', 'Ribs', 'Other'].map(x => `<option>${x}</option>`).join('')}</select><select class="in" name="size" aria-label="Size">${['Palm-size (2–3")', '4–6"', 'Half sleeve', 'Large / multi-session'].map(x => `<option>${x}</option>`).join('')}</select></div><label class="chk"><input type="checkbox" name="color"> Color (otherwise black & grey)</label></div>` : ''}
      ${v === 'lash' ? `<div class="fs"><div class="fs-h">3 · Patch test</div><label class="chk"><input type="checkbox" name="patch"> I'll book a patch test 24–48h before (required for first-time clients)</label><label class="chk"><input type="checkbox" name="lenses"> I wear contact lenses</label></div>` : ''}
      <div class="fs"><div class="fs-h">${v === 'tattoo' || v === 'lash' ? '4' : '3'} · Your idea + reference photos</div><textarea class="in" name="idea" aria-label="Your idea" placeholder="${esc(b.idea_placeholder || 'Tell me your idea')}"></textarea>
        <label class="in file">Add reference photos <input aria-label="Reference photos" type="file" accept="image/*" multiple data-refs></label><div class="refs"></div></div>
      <div class="fs"><div class="fs-h">Contact</div><div class="row"><input aria-label="Name" class="in" name="name" placeholder="Name" required><input aria-label="Email" class="in" name="email" type="email" placeholder="Email" required></div>
        <label class="chk"><input type="checkbox" name="remind" checked> Send me reminders (email/text) once it's booked</label></div>
      <div class="fs dep"><div class="fs-h">Deposit</div><p>${esc(dep.text || 'A deposit holds your spot once the artist accepts. It is paid on their booking/payment page, never on this site.')}</p>${dep.url ? `<a class="btn ghost sm" href="${esc(dep.url)}" target="_blank" rel="noopener" data-book="${esc(provider(dep.url).id)}">Deposit instructions on ${esc(provider(dep.url).name)} ↗</a>` : ''}</div>
      <label class="chk req"><input type="checkbox" name="ack" required> I've read the <a href="#policies" data-act="show-policies">booking, cancellation and aftercare policies</a></label>
      <button class="btn" type="submit">Send booking request</button>
      <p class="fine">Demo · nothing is sent or uploaded. This is a request, not a confirmed booking; no live availability is shown.</p></form></div>`;
  }
  function emailPreview(kind, d) {
    const who = cfg.artist || cfg.title;
    const body = kind === 'full'
      ? `<p>Hi ${esc(d.name || 'there')},</p><p>Thanks! ${esc(who)} got your request for <b>${esc(d.service || '')}</b>${d.d1 ? ` (first choice ${esc(d.d1)}${d.times ? ', ' + esc(d.times) : ''})` : ''}.</p><p><b>This is not booked yet.</b> You'll hear back within ${esc((cfg.booking_form || {}).reply_time || '2 business days')} with an accept, a different time, or questions. Once accepted you'll get a calendar invite (.ics) and the deposit link${d.remind ? ', plus reminders' : ''}.</p>`
      : `<p>Hi ${esc(d.name || 'there')},</p><p>Your request for <b>${esc(d.service || '')}</b> reached ${esc(who)}. <b>Request received, not yet booked.</b> They'll reply with a time, or you can book directly on ${esc(BK ? BK.name : 'their booking page')}.</p>`;
    document.body.insertAdjacentHTML('beforeend', `<div class="tip-sheet on mail-prev" role="dialog" aria-modal="true"><div class="ts-back" data-act="mail-close"></div><div class="ts-card"><div class="ts-h"><b>Email preview</b><button class="icon-btn" data-act="mail-close" aria-label="Close">✕</button></div>
      <div class="mail"><div class="mail-h"><small>From</small> ${esc(who)} via ${esc(cfg.brand_name || 'CreatorPages')}<br><small>To</small> ${esc(d.email || 'you@example.com')}<br><small>Subject</small> Request received, not yet booked</div><div class="mail-b">${body}</div></div>
      <p class="fine">Demo preview only · no email was sent</p></div></div>`);
  }

  /* ---------- tabs ---------- */
  /* Section registry. ids are what the page config ("sections") and the hub editor use. */
  const SEC = {
    music: ['Music', () => playerBlock() + ecosystem()],
    videos: [cfg.layout === 'streamer' ? 'Clips' : 'Video', () => videoBlock() + (cfg.layout === 'streamer' ? ecosystem() : '')],
    merch: ['Merch', () => merch()],
    tip: ['Support', () => tips()],
    shows: ['Shows', () => shows()],
    story: ['Story', () => story()],
    schedule: ['Schedule', () => scheduleBlock()],
    booking: ['Booking', () => booking()],
    presskit: ['Press', () => epk()],
    lyrics: ['Lyrics', () => lyrics()],
    credits: ['Credits', () => credits()],
    fans: ['Join', () => fanCapture() + exportBlock() + shareCard()],
    custom: [(cfg.custom || {}).title || 'More', () => customBlock()],
    faq: ['FAQ', () => faq()],
    testimonials: ['Reviews', () => testimonials()],
    portfolio: ['Work', () => portfolio()],
    services: ['Services', () => services()],
    beforeafter: ['Before / after', () => beforeAfter()],
    flash: ['Flash', () => flash()],
    location: ['Visit', () => locationBlock() + policies()],
    igfeed: ['Instagram', () => igFeed()],
    bookform: ['Book', () => bookingBlock()],
    drop: [((cfg.drop || (cfg.studio || {}).drop || {}).kicker) || 'Drop', () => S5('drop')],
    flyers: [PORT ? 'Menu' : 'Spotlight', () => S5('flyers')],
    infocards: ['Good to know', () => S5('infocards')],
    brandblocks: ['From the studio', () => S5('brandblocks')]
  };
  function S5(k) { return F.studioModules && window.CPStudio ? window.CPStudio[k]({ cfg, look: LOOK, PORT, provider }) : ''; }
  /* Bronze + Silver use a fixed preset (tabs group several sections). Silver may hide a couple (SILVER_TOGGLES). Gold: cfg.sections. */
  const PRESETS = {
    single: [['Music', ['music', 'lyrics', 'credits']], ['Video', ['videos']], ['Merch', ['merch', 'tip']], ['Shows', ['shows']], ['Press', ['presskit', 'booking']], ['Join', ['fans']]],
    streamer: [['Schedule', ['schedule']], ['Clips', ['videos']], ['Support', ['tip', 'merch']], ['Partner', ['presskit', 'booking']], ['Join', ['fans']]],
    portfolio: [['Work', ['portfolio']], ['Services', ['services']], ['Before / after', ['beforeafter']], ['Reviews', ['testimonials']], ['Book', ['bookform']], ['Visit', ['location']], ['Instagram', ['igfeed']], ['Support', ['tip']]]
  };
  const SILVER_TOGGLES = { single: ['videos', 'tip', 'fans'], streamer: ['videos', 'tip', 'fans'], portfolio: ['beforeafter', 'testimonials', 'igfeed'] };
  /* Relevance rule (JB): service sections (booking, services menu, before/after, policies/deposit, patch test, hours/location, flash)
     only exist for service verticals, or when a musician/streamer/creator ticks "I take bookings / features / commissions"
     (then they get a simple "Book me" request form). The hub + section builder list only these ids. Mirrors tiers.json "verticals". */
  const VERT = PORT ? (cfg.vertical || 'tattoo') : cfg.layout === 'streamer' ? 'streamer' : (cfg.creator_type || 'music');
  const RELEVANT = {
    music: { core: ['music', 'videos', 'merch', 'tip', 'shows', 'fans', 'presskit'], optional: ['lyrics', 'credits', 'story', 'faq', 'testimonials', 'custom'], bookings: ['booking'] },
    creator: { core: ['videos', 'merch', 'tip', 'fans'], optional: ['story', 'presskit', 'faq', 'testimonials', 'custom', 'music'], bookings: ['booking'] },
    streamer: { core: ['schedule', 'videos', 'tip', 'merch', 'fans'], optional: ['presskit', 'story', 'faq', 'testimonials', 'custom'], bookings: ['booking'] },
    tattoo: { core: ['portfolio', 'flash', 'services', 'bookform', 'location', 'testimonials', 'igfeed', 'tip'], optional: ['story', 'faq', 'custom', 'videos', 'merch'] },
    nail: { core: ['portfolio', 'beforeafter', 'services', 'bookform', 'location', 'testimonials', 'igfeed', 'tip'], optional: ['story', 'faq', 'custom', 'videos'] },
    lash: { core: ['portfolio', 'beforeafter', 'services', 'bookform', 'location', 'testimonials', 'igfeed', 'tip'], optional: ['story', 'faq', 'custom', 'videos'] },
    hair: { core: ['portfolio', 'beforeafter', 'services', 'bookform', 'location', 'testimonials', 'igfeed', 'tip'], optional: ['story', 'faq', 'custom', 'videos', 'merch'] },
    barber: { core: ['portfolio', 'beforeafter', 'services', 'bookform', 'location', 'testimonials', 'igfeed', 'tip'], optional: ['story', 'faq', 'custom', 'videos', 'merch'] },
    art: { core: ['portfolio', 'igfeed', 'tip', 'testimonials'], optional: ['story', 'faq', 'custom', 'videos', 'merch', 'shows'], bookings: ['services', 'bookform', 'location'] }
  };
  const REL = RELEVANT[VERT] || RELEVANT.music;
  const ALLOWED = new Set([...REL.core, ...REL.optional, ...(cfg.takes_bookings ? (REL.bookings || []) : []), ...(F.studioModules ? ['drop', 'flyers', 'infocards', 'brandblocks'] : [])]);
  window.CP_SECTIONS = { relevant: RELEVANT, vertical: VERT, allowed: [...ALLOWED], ids: Object.keys(SEC), names: Object.fromEntries(Object.entries(SEC).map(([k, v]) => [k, v[0]])), presets: PRESETS, silverToggles: SILVER_TOGGLES };
  function panelsFor() {
    const lay = PRESETS[cfg.layout] ? cfg.layout : 'single';
    let out;
    if (F.sectionBuilder && Array.isArray(cfg.sections) && cfg.sections.length) {
      out = cfg.sections.filter(x => x && x.on !== false && SEC[x.id] && ALLOWED.has(x.id)).map(x => [x.label || SEC[x.id][0], SEC[x.id][1](), x.id]);
      return out.filter(p => p[1].trim());   // creator's own order wins on Gold
    }
    const hide = new Set();
    if (F.sectionToggles && cfg.section_toggles) (SILVER_TOGGLES[lay] || []).forEach(id => { if (cfg.section_toggles[id] === false) hide.add(id); });
    out = PRESETS[lay].map(([name, ids]) => { const parts = ids.filter(id => !hide.has(id) && ALLOWED.has(id)).map(id => [id, SEC[id][1]()]).filter(x => x[1].trim());
      if (!parts.length) return null; const nm = parts[0][0] === ids[0] ? name : SEC[parts[0][0]][0];
      return [nm, parts.map(x => x[1]).join(''), parts[0][0]]; }).filter(Boolean);
    // creator's "feature first" answer + any order wishes ("put the music video second")
    const FF = { release: ['Music'], video: ['Video', 'Clips'], live: ['Schedule'], merch: ['Merch', 'Support'], booking: ['Press', 'Partner'] };
    const want = [...(cfg.section_order || [])];
    if (cfg.feature_first && FF[cfg.feature_first]) want.unshift({ name: FF[cfg.feature_first], pos: 0 });
    want.forEach(w => { const names = [].concat(w.name); const i = out.findIndex(p => names.includes(p[0])); if (i < 0) return; const [x] = out.splice(i, 1); const pos = w.pos === 'last' ? out.length : Math.min(w.pos, out.length); out.splice(pos, 0, x); });
    return out;
  }

  /* featured card: whatever the creator picked to "feature first" sits right under the hero */
  function featured() {
    const f = cfg.featured; if (!f) return '';
    if (f.type !== 'video' && (HERO_LINKS.length || f.type === 'booking')) return '';
    if (f.type === 'video' && F.video && cfg.video) return videoBlock();
    if (f.type === 'live' && F.liveTakeover) return '';
    const ICO = { live: f.platform || 'twitch', merch: f.platform, video: 'youtube', booking: null, release: f.platform };
    const k = ICO[f.type]; const brand = k && (window.ICONS[k] || {}).hex;
    return `<a class="feat-card ${esc(f.type)}" href="${esc(f.url || '#book')}" ${f.url ? `data-link="${esc(k || 'link')}"` : 'data-act="scroll-book"'}>
      <span class="fc-ico" style="background:${brand ? '#' + brand : 'var(--acc)'}">${k && window.ICONS[k] ? icon(k) : '<svg viewBox="0 0 24 24"><path d="M4 6h16v12H4z M4 7l8 6 8-6" fill="none" stroke="#fff" stroke-width="2"/></svg>'}</span>
      <span class="fc-txt"><small>${esc(f.kicker || '')}</small><b>${esc(f.title || '')}</b>${f.sub ? `<em>${esc(f.sub)}</em>` : ''}</span><span class="fc-go">${esc(f.cta || 'Open')}</span></a>`;
  }

  function tabbed() {
    const P = panelsFor();
    if (!P.length) return '';
    if (SKIN) return P.map((p, i) => window.CPStudio.frame(p[0], p[1], p[2], i)).join('');
    if (F.sceneTransitions) {
      const g = T.grades || [];
      return P.map((p, i) => `<section class="scene" data-name="${esc(p[0])}" data-sec="${esc(p[2] || '')}" data-grade="${g[i % g.length] || ''}" data-grade2="${g[(i + 2) % g.length] || ''}" style="--scene-c:${g[i % g.length] || 'var(--acc)'}">
        <div class="scene-h"><span class="num">${String(i + 1).padStart(2, '0')}</span><h2>${esc(p[0])}</h2></div>${p[1]}</section>`).join('');
    }
    if (EXPAND || !F.tabs) return P.map(p => `<div class="panel on">${EXPAND && F.tabs ? `<div class="eyebrow" style="margin:28px 2px -4px">${esc(p[0])} tab</div>` : ''}${p[1]}</div>`).join('');
    return `<div class="tabs" role="tablist">${P.map((p, i) => `<button role="tab" aria-selected="${i === 0}" data-tab="${i}">${esc(p[0])}</button>`).join('')}</div>
      ${P.map((p, i) => `<div class="panel${i === 0 ? ' on' : ''}" data-panel="${i}" data-sec="${esc(p[2] || '')}">${p[1]}</div>`).join('')}`;
  }

  /* ---------- render ---------- */
  const app = document.getElementById('app');
  const goldChrome = GOLD ? `<div class="g-chapter"><b>01</b><span>${esc((panelsFor()[0] || ['Intro'])[0])}</span><div class="bar"><i></i></div></div>` : '';
  const goldOuter = GOLD ? `<div class="g-grade"></div><canvas class="g-fx"></canvas>${(T.signature === 'glitch') ? '<div class="g-scan"></div>' : ''}<div class="g-cursor"></div>
    ${isLive ? `<div class="g-live"><span class="dot"></span><span class="mq"><span>LIVE NOW · ${esc(cfg.live.title || '')}${cfg.live.viewers ? ` · ${esc(cfg.live.viewers)} watching` : ''} · tap to jump in ·</span></span><a href="${esc(((cfg.links || []).find(l => l.platform === 'twitch') || (cfg.links || [])[0] || {}).url || 'https://twitch.tv/placeholder')}" target="_blank" rel="noopener" data-link="twitch">Watch</a></div>` : ''}
    <div class="g-intro"><div>${wordmark(cfg.title, 'aria-hidden="true"', 'div')}<small>${esc(T.intro_line || 'loading the world')}</small></div></div>` : '';
  if (goldOuter) document.body.insertAdjacentHTML('afterbegin', goldOuter);
  if (STUDIO_LOCKED) document.body.insertAdjacentHTML('afterbegin', '<div class="st-lock">Studio Looks are a&nbsp;<b>Gold</b>&nbsp;option · preview only</div>');
  /* round 6 (LCP): the depth cut-out loads after first paint so the hero's mid layer wins the bandwidth */
  const lazyFg = () => document.querySelectorAll('.g-layer.fg img[data-src]').forEach(i => { i.src = i.dataset.src; i.removeAttribute('data-src'); });
  if (document.readyState === 'complete') setTimeout(lazyFg, 50); else addEventListener('load', () => setTimeout(lazyFg, 50), { once: true });
  /* round 6: the demo label is a thin in-flow strip at the very top (scrolls away, never covers content); the SAMPLE pill + footer note stay as persistent labels */
  if (cfg.demo_banner) { document.body.insertAdjacentHTML('afterbegin', `<div class="demo-banner" role="note">${esc(cfg.demo_banner)}${HUB ? ' · hub preview' : ''}</div>`); root.style.setProperty('--demo-h', '18px');
    const gl = document.querySelector('.g-live'); if (gl) { const f = () => { gl.style.top = Math.max(0, 18 - scrollY) + 'px'; }; f(); addEventListener('scroll', f, { passive: true }); } }
  app.innerHTML = goldChrome + topbar() + hero() + musicDock() + featured() + links() + socials() + countdownCard() + tabbed() + qrCard() + analytics() + footer();
  // Bronze: QR sits right after links (it's the only extra). Above order already handles that.

  if (window.CPStudio) window.CPStudio.wire();
  if (qs.get('scroll')) requestAnimationFrame(() => scrollTo(0, +qs.get('scroll')));
  /* ---------- behaviors ---------- */
  // countdowns
  const pad = n => String(n).padStart(2, '0');
  function tick() {
    document.querySelectorAll('[data-countdown]').forEach(el => {
      let ms = Math.max(0, new Date(el.dataset.countdown).getTime() - Date.now());
      const d = Math.floor(ms / 864e5), h = Math.floor(ms / 36e5) % 24, m = Math.floor(ms / 6e4) % 60, s = Math.floor(ms / 1e3) % 60;
      el.querySelector('[data-u=d]').textContent = d; el.querySelector('[data-u=h]').textContent = pad(h);
      el.querySelector('[data-u=m]').textContent = pad(m); el.querySelector('[data-u=s]').textContent = pad(s);
    });
    const short = t => { const d = new Date(t), ms = d.getTime() - Date.now(); if (ms <= 0) return 'now'; const h = ms / 36e5;
      if (h < 24) return `in ${Math.ceil(h)}h`;
      if (h < 24 * 7) return d.toLocaleString('en-US', { weekday: 'short', hour: 'numeric', minute: d.getMinutes() ? '2-digit' : undefined });
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); };
    document.querySelectorAll('[data-rel-short]').forEach(e => e.textContent = short(cfg.release.date));
    document.querySelectorAll('[data-next-short]').forEach(e => e.textContent = short(cfg.next_stream));
  }
  tick(); if (!STATIC) setInterval(tick, 1000);

  // tabs
  document.querySelectorAll('[data-tab]').forEach(b => b.addEventListener('click', () => {
    document.querySelectorAll('[data-tab]').forEach(x => x.setAttribute('aria-selected', x === b));
    document.querySelectorAll('[data-panel]').forEach(p => p.classList.toggle('on', p.dataset.panel === b.dataset.tab));
    observeReveal();
  }));
  if (qs.get('tab') && !EXPAND) { const b = document.querySelector(`[data-tab="${qs.get('tab')}"]`); b && b.click(); }

  // segmented controls
  document.querySelectorAll('.seg').forEach(seg => seg.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    seg.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
    if (b.dataset.ch) { const inp = seg.parentElement.querySelector('input[name=contact]'); inp.type = b.dataset.ch === 'sms' ? 'tel' : 'email'; inp.placeholder = b.dataset.ch === 'sms' ? '(555) 555-0123' : 'you@email.com'; }
  }));

  // fan capture + CSV export (demo-functional, localStorage only)
  const KEY = 'cp_fans_' + (cfg.slug || 'page');
  const fans = () => JSON.parse(localStorage.getItem(KEY) || '[]');
  const updCount = () => document.querySelectorAll('[data-fancount]').forEach(e => e.textContent = fans().length);
  updCount();
  document.querySelectorAll('[data-form=fans]').forEach(f => f.addEventListener('submit', e => {
    e.preventDefault(); const inp = f.querySelector('input'); const ch = f.querySelector('.seg .on').dataset.ch;
    const list = fans(); list.push({ contact: inp.value, channel: ch, at: new Date().toISOString(), source: 'page' }); localStorage.setItem(KEY, JSON.stringify(list));
    inp.value = ''; updCount(); toast("You're on the list (demo: saved in this browser only)");
  }));
  const download = (name, text, type) => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; a.click(); };

  document.querySelectorAll('[data-form=book]').forEach(f => f.addEventListener('submit', e => { e.preventDefault(); toast('Request captured (demo, nothing sent)'); f.reset(); }));

  document.addEventListener('click', e => {
    const a = e.target.closest('[data-act],[data-link]'); if (!a) return;
    if (a.dataset.link) { e.preventDefault(); toast(`${NAMES[a.dataset.link] || a.dataset.link}: opens their own page (placeholder link in this demo)`); return; }
    const act = a.dataset.act;
    if (act === 'export') { const rows = [['contact', 'channel', 'signed_up_at', 'source'], ...fans().map(f => [f.contact, f.channel, f.at, f.source])]; download(`${cfg.slug}-fans.csv`, rows.map(r => r.map(x => `"${String(x).replace(/"/g, '""')}"`).join(',')).join('\n'), 'text/csv'); toast('Fan list exported'); }
    if (act === 'scroll-book') { e.preventDefault(); const b = document.querySelector('[data-form=book]'); b ? b.scrollIntoView({ behavior: 'smooth' }) : toast('Booking: add a contact link to enable'); }
    if (act === 'tix') toast('Ticket link: placeholder (demo)');
    if (act === 'owner') { const s = document.querySelector('.analytics'); s.classList.toggle('on'); a.textContent = s.classList.contains('on') ? 'Hide owner view' : 'Owner view · analytics'; }
    if (act === 'epk') { const e2 = cfg.epk || {}; download(`${cfg.slug}-press-kit.txt`, `${cfg.artist || cfg.title} | Press kit\n\n${e2.bio}\n\nStats\n${(e2.stats || []).map(s => `- ${s.l}: ${s.v}`).join('\n')}\n\nContact: use the booking form on the page.\n(Demo export, sample data)`, 'text/plain'); toast('Press kit downloaded'); }
    if (act === 'share' || act === 'story') makeStory();
  });

  /* ---------- music player (uploaded track): 30s loop from cfg.music.start, tap to play, volume + mute; never autoplays ---------- */
  const MP = HAS_AUDIO ? (() => {
    const el = new Audio(); el.preload = 'none'; el.src = MUSIC.src; el.volume = .8; let S = MUSIC.start; const LEN = 30;
    el.addEventListener('loadedmetadata', () => { if (el.duration && S > el.duration - 1) S = 0; if (el.currentTime < S) el.currentTime = S; });
    el.addEventListener('timeupdate', () => { if (el.currentTime >= S + LEN || el.currentTime < S - .5) el.currentTime = S; const p = Math.max(0, Math.min(1, (el.currentTime - S) / LEN)); document.querySelectorAll('.md-bar i').forEach(i => i.style.width = (p * 100).toFixed(1) + '%'); });
    el.addEventListener('ended', () => { el.currentTime = S; el.play().catch(() => {}); });
    const api = { el, playing: false,
      set(on) { api.playing = on; if (on) { el.play().catch(() => { api.playing = false; ui(); }); } else el.pause(); ui(); document.dispatchEvent(new CustomEvent('cp:music', { detail: { playing: on } })); track(on ? 'music_play' : 'music_pause'); },
      toggle() { api.set(!api.playing); } };
    function ui() { document.querySelectorAll('[data-act=music]').forEach(b => { b.classList.toggle('on', api.playing); const sp = b.querySelector('span'); if (sp && sp.firstChild) sp.firstChild.textContent = api.playing ? 'Pause' : 'Play'; });
      document.querySelectorAll('.mdock').forEach(d => d.classList.toggle('playing', api.playing)); document.querySelectorAll('.md-mute').forEach(b => b.classList.toggle('muted', el.muted)); }
    document.addEventListener('visibilitychange', () => { if (document.hidden && api.playing) api.set(false); });
    return api; })() : null;
  window.CP.music = MP;
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-act=music],[data-act=mute],[data-act=music-embed]'); if (!b) return;
    e.preventDefault(); e.stopPropagation();
    if (b.dataset.act === 'music' && MP) MP.toggle();
    if (b.dataset.act === 'mute' && MP) { MP.el.muted = !MP.el.muted; b.classList.toggle('muted', MP.el.muted); b.setAttribute('aria-label', MP.el.muted ? 'Unmute' : 'Mute'); }
    if (b.dataset.act === 'music-embed') {
      const box = b.closest('.mdock').nextElementSibling; if (!box) return; const open = box.hidden; box.hidden = !open; b.textContent = open ? 'Hide' : 'Play';
      if (open && !box.firstChild) { const [src, h] = embedSrc(MUSIC.url, MUSIC.prov[0]);
        box.innerHTML = /PLACEHOLDER/i.test(MUSIC.url) || !src ? `<div class="md-slot">${esc(MUSIC.prov[1])} official player loads here.<small>Placeholder link in this demo, so no player is loaded.</small></div>`
          : `<iframe src="${esc(src)}" height="${h}" loading="lazy" allow="autoplay; encrypted-media; clipboard-write; fullscreen; picture-in-picture" title="${esc(MUSIC.prov[1])} player"></iframe>`; }
      track('music_embed', { provider: MUSIC.prov[0] });
    }
  }, true);
  document.addEventListener('input', e => { if (e.target.classList.contains('md-vol') && MP) { MP.el.volume = +e.target.value; if (MP.el.muted && +e.target.value > 0) { MP.el.muted = false; document.querySelectorAll('.md-mute').forEach(x => x.classList.remove('muted')); } } });

  /* ---------- tip sheet ---------- */
  function openTips() {
    let sh = document.querySelector('.tip-sheet');
    if (!sh) { document.body.insertAdjacentHTML('beforeend', `<div class="tip-sheet" role="dialog" aria-modal="true" aria-label="Tip"><div class="ts-back" data-act="tip-close"></div><div class="ts-card"><div class="ts-h"><b>${TIP_SAYING ? `${esc(TIP_SAYING)}<small class="ts-to">Tip ${esc(cfg.artist || cfg.title)}</small>` : `Tip ${esc(cfg.artist || cfg.title)}`}</b><button class="icon-btn" data-act="tip-close" aria-label="Close">✕</button></div><p class="fine">Pick an app. It opens their own page; nothing is paid here.</p><div class="tip-list">${tipRows()}</div></div></div>`); sh = document.querySelector('.tip-sheet'); }
    requestAnimationFrame(() => sh.classList.add('on')); track('tip_open');
  }
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-tip],[data-act^=tip],[data-act=claim],[data-act=book-now],[data-book],[data-act=mail-close],[data-act=show-policies]'); if (!t) return;
    if (t.dataset.book) { e.preventDefault(); e.stopPropagation(); track('book_click', { platform: t.dataset.book }); const pv = PROVIDERS.find(p => p[0] === t.dataset.book); toast(`${pv ? pv[2] : 'Booking page'}: opens their own booking page (placeholder link in this demo)`); return; }
    if (t.dataset.act === 'mail-close') { t.closest('.mail-prev').remove(); return; }
    if (t.dataset.act === 'show-policies') { e.preventDefault(); const pd = document.querySelector('#policies'); pd && pd.nextElementSibling && (pd.nextElementSibling.querySelectorAll('details').forEach(d => d.open = true), pd.nextElementSibling.scrollIntoView({ behavior: 'smooth' })); return; }
    if (t.dataset.tip) { e.preventDefault(); e.stopPropagation(); track('tip_click', { method: t.dataset.tip }); toast(`${TIP[t.dataset.tip].name}: opens their own page (placeholder handle in this demo)`); return; }
    const act = t.dataset.act;
    if (act === 'tip') openTips();
    if (act === 'tip-close') document.querySelector('.tip-sheet').classList.remove('on');
    if (act === 'tip-copy') { track('tip_click', { method: t.dataset.m }); (navigator.clipboard ? navigator.clipboard.writeText(t.dataset.h) : Promise.reject()).then(() => toast('Zelle handle copied'), () => toast('Zelle: ' + t.dataset.h)); t.textContent = 'Copied'; }
    if (act === 'claim') { track('flash_claim', { id: t.dataset.name }); const f = document.querySelector('[data-form=bookreq]'); if (f) { f.querySelector('textarea').value = 'Flash: ' + t.dataset.name; f.scrollIntoView({ behavior: 'smooth', block: 'center' }); } toast(`Claim “${t.dataset.name}”: fill the request (demo)`); }
    if (act === 'book-now') { e.preventDefault(); const L = HERO_LINKS[0]; track('book_click', { platform: L ? L.platform : 'none' }); toast(L ? `${NAMES[L.platform] || L.platform}: opens their booking page (placeholder link in this demo)` : 'Booking link goes here'); }
  }, true);
  document.addEventListener('click', e => { const l = e.target.closest('[data-link]'); if (l) track('link_click', { platform: l.dataset.link }); }, true);

  // gallery filter
  document.querySelectorAll('.gfilter').forEach(gf => gf.addEventListener('click', e => { const b = e.target.closest('[data-gf]'); if (!b) return;
    gf.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); const c = b.dataset.gf;
    gf.parentElement.querySelectorAll('.gi').forEach(g => g.hidden = !(c === '*' || g.dataset.cat === c)); track('gallery_filter', { id: c }); }));
  // before / after slider
  document.querySelectorAll('.ba input').forEach(r => r.addEventListener('input', () => r.parentElement.style.setProperty('--pos', r.value + '%')));
  document.querySelectorAll('[data-form=bookreq]').forEach(f => f.addEventListener('submit', e => { e.preventDefault();
    const fd = new FormData(f), d = Object.fromEntries(fd.entries()); d.times = [...f.querySelectorAll('.chips .on')].map(b => b.dataset.v).join(', ');
    track('booking_request', { id: f.dataset.mode }); emailPreview(f.dataset.mode, d); f.reset(); const r = f.querySelector('.refs'); if (r) r.innerHTML = ''; }));
  document.querySelectorAll('.chips[data-multi]').forEach(c => c.addEventListener('click', e => { const b = e.target.closest('button'); if (b) { e.stopImmediatePropagation(); b.classList.toggle('on'); } }, true));
  document.querySelectorAll('[data-refs]').forEach(inp => inp.addEventListener('change', () => { const box = inp.closest('.fs').querySelector('.refs'); box.innerHTML = '';
    [...inp.files].slice(0, 6).forEach(fl => { const im = document.createElement('img'); im.src = URL.createObjectURL(fl); im.alt = 'Reference (stays on this device)'; box.appendChild(im); }); }));

  // section views + scroll depth (Gold analytics hooks)
  if (F.analytics && 'IntersectionObserver' in window) {
    const seen = new Set();
    const io2 = new IntersectionObserver(es => es.forEach(en => { const id = en.target.dataset.sec; if (en.isIntersecting && id && !seen.has(id)) { seen.add(id); track('section_view', { id }); } }), { threshold: .35 });
    document.querySelectorAll('[data-sec]').forEach(el => el.dataset.sec && io2.observe(el));
    const marks = [25, 50, 75, 100], hit = new Set();
    addEventListener('scroll', () => { const pct = (scrollY + innerHeight) / document.documentElement.scrollHeight * 100; marks.forEach(m => { if (pct >= m - 1 && !hit.has(m)) { hit.add(m); track('scroll_depth', { id: String(m) }); } }); }, { passive: true });
  }
  track('page_view', { id: qs.get('src') || (document.referrer ? new URL(document.referrer).hostname : 'direct') });
  if (qs.get('src') === 'qr') track('qr_scan');

  // story card (canvas → PNG)
  function makeStory() { if (window.CPShare) window.CPShare.open(); }

  // scroll reveal (gold)
  function observeReveal() {
    if (!F.microInteractions) return;
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('shown'); io.unobserve(en.target); } }), { threshold: .12 });
    document.querySelectorAll('.reveal:not(.shown)').forEach((el, i) => { el.style.transitionDelay = `${Math.min(i, 6) * 60}ms`; io.observe(el); });
  }
  observeReveal();

  // 3D tilt + glare (gold): follows pointer, idles with a slow sway
  if (F.microInteractions && !STATIC) (function () {
    const cv = document.querySelector('.cover.tilt'); if (!cv) return; let px = 0, py = 0, last = 0;
    addEventListener('pointermove', e => { px = (e.clientX / innerWidth - .5) * 2; py = (e.clientY / innerHeight - .5) * 2; last = performance.now(); });
    (function loop(t) {
      let x = px, y = py;
      if (t - last > 2500) { x = Math.sin(t / 1600) * .7; y = Math.cos(t / 2100) * .5; }
      cv.style.transform = `rotateY(${x * 10}deg) rotateX(${-y * 8}deg)`;
      cv.style.setProperty('--gx', `${50 + x * 40}%`); cv.style.setProperty('--gy', `${40 + y * 40}%`);
      requestAnimationFrame(loop);
    })(0);
  })();

  // particles (silver+)
  if (F.particles && cfg.motion !== 'off') {
    const c = document.querySelector('.bg-particles'), x = c.getContext('2d');
    const css = getComputedStyle(root); const cols = ['--acc', '--acc2', '--text'].map(v => css.getPropertyValue(v).trim());
    let W, H, P = []; const DPR = Math.min(2, devicePixelRatio || 1);
    const size = () => { W = c.width = innerWidth * DPR; H = c.height = innerHeight * DPR; };
    size(); addEventListener('resize', size);
    const N = cfg.motion === 'high' ? 48 : cfg.motion === 'low' ? 12 : 28;
    for (let i = 0; i < N; i++) P.push({ x: Math.random() * W, y: Math.random() * H, r: (Math.random() * 1.8 + .6) * DPR, v: (Math.random() * .35 + .12) * DPR, c: cols[i % 3], a: Math.random() * .6 + .2, p: Math.random() * 6.28 });
    const draw = t => {
      x.clearRect(0, 0, W, H);
      for (const p of P) {
        if (!STATIC) { p.y -= p.v; p.x += Math.sin(t / 2000 + p.p) * .25 * DPR; if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; } }
        x.globalAlpha = p.a * (F.microInteractions ? (.6 + .4 * Math.sin(t / 500 + p.p)) : 1);
        x.fillStyle = p.c; x.beginPath(); x.arc(p.x, p.y, p.r, 0, 6.283); x.fill();
      }
      if (!STATIC) requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  }
})();
