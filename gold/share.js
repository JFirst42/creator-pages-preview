/* Share studio: fan picks WHAT to share + HOW it looks, sees a live canvas preview, then shares the image
   (Web Share API with files -> phone share sheet -> Instagram/Facebook Story composer), downloads it,
   copies the link, or opens X / Facebook / WhatsApp / Threads.
   Tiers: Bronze = basic (copy link + one default card) · Silver = studio + templates ·
          Gold = branded templates (wordmark, link-sticker callout, animated story via MediaRecorder) + analytics hooks.
   Instagram does not let a web page attach a clickable link to a Story; the flow is image share + link sticker. */
(function () {
  const { cfg, F } = window.CP; const T = cfg.theme || {}; const P = T.palette || {}; const WM = T.wordmark || {};
  const tier = cfg.tier; const STUDIO = !!F.shareStudio; const BRAND = !!F.shareBranded;
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const BASE_URL = (cfg.share_url || (location.origin + location.pathname)).replace(/index\.html$/, '');
  const DOMAIN = BASE_URL.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const css = getComputedStyle(document.documentElement);
  const FD = (css.getPropertyValue('--font-display') || 'sans-serif').trim(), FB = (css.getPropertyValue('--font-body') || 'sans-serif').trim();
  const WMF = WM.font ? `'${WM.font}'` : FD;
  const track = (ev, data) => {  // analytics hook (Gold): wire to your analytics; demo keeps a local count
    if (!BRAND) return; const d = Object.assign({ page: cfg.slug, tier, ts: Date.now() }, data);
    (window.dataLayer = window.dataLayer || []).push({ event: 'cp_' + ev, ...d });
    document.dispatchEvent(new CustomEvent('cp:share', { detail: { ev, ...d } }));
    try { const k = 'cp-share-' + cfg.slug, n = JSON.parse(localStorage.getItem(k) || '{}'); n[ev] = (n[ev] || 0) + 1; localStorage.setItem(k, JSON.stringify(n)); } catch (e) {}
  };

  /* ---------- what can be shared on this page ---------- */
  const listen = (cfg.links || []).filter(l => ['spotify', 'apple_music', 'youtube_music', 'amazon_music', 'tidal', 'soundcloud', 'youtube'].includes(l.platform));
  const show = (cfg.shows || [])[0];
  const isStreamer = cfg.layout === 'streamer';
  const WHAT = [
    !isStreamer && cfg.title && { id: 'release', label: 'Release', kicker: cfg.kind_label ? `New ${cfg.kind_label.toLowerCase()} · out now` : 'Out now', title: cfg.title, sub: [cfg.artist, cfg.feat && 'ft. ' + cfg.feat].filter(Boolean).join(' '), cta: 'Listen now', hash: 'music', icons: listen.map(l => l.platform) },
    cfg.video && { id: 'video', label: 'Latest video', kicker: 'New video', title: (cfg.video.title || cfg.title || '').replace(/\s*\(.*?\)\s*$/, ''), sub: cfg.artist || cfg.title, cta: 'Watch now', hash: 'video', icons: ['youtube'], play: true },
    (isStreamer || cfg.live) && { id: 'live', label: 'Live stream', kicker: cfg.live && cfg.live.is_live ? '● Live now' : 'Next stream', title: cfg.title, sub: cfg.live && cfg.live.is_live ? (cfg.live.title || 'Live now') : (cfg.next_stream_label || 'See the schedule'), cta: 'Watch live', hash: 'live', icons: (cfg.links || []).map(l => l.platform).filter(p => ['twitch', 'kick', 'youtube'].includes(p)), live: true },
    show && { id: 'show', label: 'Show date', kicker: new Date(show.date + 'T12:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase(), title: show.city, sub: show.venue || '', cta: show.cta || 'Get tickets', hash: 'shows', icons: [] },
    { id: 'page', label: 'Whole page', kicker: 'All my links', title: cfg.artist || cfg.title, sub: isStreamer ? (cfg.tagline || 'Streams · clips · community') : `Music · video · merch · shows`, cta: 'Tap the link', hash: '', icons: [...new Set((cfg.links || []).concat(cfg.socials || []).map(l => l.platform))].slice(0, 6) }
  ].filter(Boolean);
  const HOW = [
    { id: 'story', label: 'Story', w: 1080, h: 1920, note: '9:16 · IG / FB / TikTok story' },
    STUDIO && { id: 'post', label: 'Post', w: 1080, h: 1080, note: '1:1 · feed post' },
    STUDIO && { id: 'link', label: 'Link preview', w: 1200, h: 630, note: 'link card · DMs, X, Facebook' },
    BRAND && { id: 'sticker', label: 'Branded story', w: 1080, h: 1920, note: 'wordmark + link-sticker callout' }
  ].filter(Boolean);
  const S = { what: STUDIO ? (WHAT.find(w => w.id === (cfg.feature_first === 'video' ? 'video' : isStreamer ? 'live' : 'release')) || WHAT[0]).id : 'page', how: BRAND ? 'sticker' : 'story' };
  const linkFor = w => BASE_URL + (w && w.hash ? '#' + w.hash : '');

  /* ---------- assets ---------- */
  const cover = new Image(); cover.src = cfg.cover || 'cover.jpg';
  const ready = Promise.all([new Promise(r => { if (cover.complete && cover.naturalWidth) r(); else { cover.onload = r; cover.onerror = r; } }),
    document.fonts ? document.fonts.ready : Promise.resolve(),
    document.fonts ? Promise.all([`800 80px ${FD}`, `700 40px ${FB}`, `400 120px ${WMF}`].map(f => document.fonts.load(f).catch(() => 0))) : 0]);

  /* ---------- drawing helpers ---------- */
  const rr = (x, X, Y, W, H, R) => { x.beginPath(); x.roundRect(X, Y, W, H, R); };
  function coverFit(x, X, Y, W, H, R, z = 1) {
    x.save(); rr(x, X, Y, W, H, R); x.clip();
    const s = Math.max(W / cover.naturalWidth, H / cover.naturalHeight) * z, dw = cover.naturalWidth * s, dh = cover.naturalHeight * s;
    if (cover.naturalWidth) x.drawImage(cover, X + (W - dw) / 2, Y + (H - dh) / 2, dw, dh); x.restore();
  }
  function bg(x, W, H, t = 0) {
    const g = x.createLinearGradient(0, 0, W * .3, H); g.addColorStop(0, P.dom || '#333'); g.addColorStop(.55, P.bg2 || '#111'); g.addColorStop(1, P.bg || '#000');
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    // blurred cover wash
    x.save(); x.globalAlpha = .35; x.filter = `blur(${Math.round(W / 18)}px)`; const z = 1.4 + Math.sin(t / 1800) * .04; coverFit(x, -W * .2, -H * .1, W * 1.4, H * 1.2, 0, z); x.restore();
    const r = x.createRadialGradient(W * .8, H * .15, 0, W * .8, H * .15, W); r.addColorStop(0, (P.acc || '#f0f') + '55'); r.addColorStop(1, 'transparent'); x.fillStyle = r; x.fillRect(0, 0, W, H);
    const v = x.createLinearGradient(0, H * .45, 0, H); v.addColorStop(0, 'transparent'); v.addColorStop(1, 'rgba(0,0,0,.55)'); x.fillStyle = v; x.fillRect(0, 0, W, H);
  }
  function fitText(x, txt, font, max, size) { let s = size; do { x.font = font.replace('$', s); s -= 4; } while (x.measureText(txt).width > max && s > 20); return s + 4; }
  function wordmark(x, txt, cx, y, max, size) {  // Gold: the page's own wordmark (font, fill, outline, depth)
    const s = fitText(x, txt, `${WM.weight || 400} $px ${WMF}`, max, size); x.font = `${WM.weight || 400} ${s}px ${WMF}`; x.textAlign = 'center'; x.lineJoin = 'round';
    const t = (WM.case === 'uppercase') ? txt.toUpperCase() : txt;
    x.save(); x.translate(cx, y); if (cfg.theme.signature === 'hearts' || WM.effect === 'sticker') x.rotate(-.05);
    x.fillStyle = WM.depth || '#000'; x.fillText(t, 0, s * .09);
    x.strokeStyle = WM.stroke || '#fff'; x.lineWidth = s * .14; x.strokeText(t, 0, 0);
    x.fillStyle = WM.fill || P.acc; x.fillText(t, 0, 0); x.restore();
  }
  function plainTitle(x, txt, cx, y, max, size, color) { const s = fitText(x, txt, `800 $px ${FD}`, max, size); x.fillStyle = color || P.text || '#fff'; x.textAlign = 'center'; x.font = `800 ${s}px ${FD}`; x.fillText(txt, cx, y); return s; }
  function icons(x, list, cx, y, d) {
    const L = list.filter(p => (window.ICONS || {})[p]).slice(0, 6); const gap = d * .35, W = L.length * d + (L.length - 1) * gap; let X = cx - W / 2;
    L.forEach(p => { const I = window.ICONS[p]; const n = parseInt(I.hex, 16); const dark = (((n >> 16) & 255) * .299 + ((n >> 8) & 255) * .587 + (n & 255) * .114) < 40;
      x.fillStyle = dark ? '#fff' : '#' + I.hex; x.beginPath(); x.arc(X + d / 2, y + d / 2, d / 2, 0, 7); x.fill();
      x.save(); x.translate(X + d * .22, y + d * .22); x.scale(d * .56 / 24, d * .56 / 24); x.fillStyle = dark ? '#000' : '#fff'; x.fill(new Path2D(I.path)); x.restore(); X += d + gap; });
  }
  function pill(x, txt, cx, y, h, fill, color, font) { x.font = font; const w = x.measureText(txt).width + h * 1.1; x.fillStyle = fill; rr(x, cx - w / 2, y, w, h, h / 2); x.fill(); x.fillStyle = color; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(txt, cx, y + h / 2 + 2); x.textBaseline = 'alphabetic'; return w; }
  function linkSticker(x, cx, y, s, t = 0) {  // Gold: IG-style link sticker callout
    x.save(); x.translate(cx, y); x.rotate(-.04 + Math.sin(t / 500) * .015);
    const txt = DOMAIN.toUpperCase(); const fs = fitText(x, txt, `800 $px ${FB}`, 900 - s * 1.6, s * .42); x.font = `800 ${fs}px ${FB}`; const w = Math.min(x.measureText(txt).width + s * 1.6, 960);
    x.shadowColor = 'rgba(0,0,0,.35)'; x.shadowBlur = s * .5; x.shadowOffsetY = s * .12; x.fillStyle = '#fff'; rr(x, -w / 2, 0, w, s, s * .28); x.fill(); x.shadowColor = 'transparent';
    x.strokeStyle = P.acc; x.lineWidth = s * .09; x.beginPath(); const lx = -w / 2 + s * .55, ly = s / 2; x.arc(lx - s * .08, ly, s * .14, Math.PI * .5, Math.PI * 1.5); x.moveTo(lx - s * .1, ly); x.lineTo(lx + s * .12, ly); x.arc(lx + s * .12, ly, s * .14, Math.PI * 1.5, Math.PI * .5); x.stroke();
    x.font = `800 ${fs}px ${FB}`; x.fillStyle = '#111'; x.textAlign = 'left'; x.textBaseline = 'middle'; x.fillText(txt, -w / 2 + s * .95, s / 2 + 2); x.restore();
    x.save(); x.fillStyle = 'rgba(255,255,255,.85)'; x.font = `700 ${s * .34}px ${FB}`; x.textAlign = 'center'; x.fillText('↑ tap the link sticker', cx, y + s * 1.75); x.restore();
  }
  function hearts(x, W, H, t) { if (!BRAND || cfg.theme.signature !== 'hearts') return; for (let i = 0; i < 14; i++) { const p = (i * 0.137 + t / 9000) % 1; const X = ((i * 0.618) % 1) * W, Y = H - p * H * 1.1; const s = W * (.025 + (i % 4) * .01); x.globalAlpha = .55; x.fillStyle = [P.acc, WM.stroke, '#fff'][i % 3]; x.beginPath(); x.moveTo(X, Y + s * .3); x.bezierCurveTo(X, Y, X - s * .5, Y, X - s * .5, Y + s * .3); x.bezierCurveTo(X - s * .5, Y + s * .6, X, Y + s * .8, X, Y + s); x.bezierCurveTo(X, Y + s * .8, X + s * .5, Y + s * .6, X + s * .5, Y + s * .3); x.bezierCurveTo(X + s * .5, Y, X, Y, X, Y + s * .3); x.fill(); } x.globalAlpha = 1; }
  function badge(x, w, cx, y, s) { if (w.live) pill(x, w.kicker.toUpperCase(), cx, y, s, '#ff2d55', '#fff', `800 ${s * .42}px ${FB}`); else pill(x, w.kicker.toUpperCase(), cx, y, s, 'rgba(0,0,0,.35)', '#fff', `800 ${s * .4}px ${FB}`); }
  function playBtn(x, cx, cy, r) { x.fillStyle = 'rgba(0,0,0,.45)'; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill(); x.fillStyle = '#fff'; x.beginPath(); x.moveTo(cx - r * .3, cy - r * .45); x.lineTo(cx + r * .5, cy); x.lineTo(cx - r * .3, cy + r * .45); x.fill(); }

  /* ---------- templates ---------- */
  function render(c, what, how, t = 0) {
    const w = WHAT.find(v => v.id === what) || WHAT[0]; const H0 = { story: { w: 1080, h: 1920 }, sticker: { w: 1080, h: 1920 }, post: { w: 1080, h: 1080 }, link: { w: 1200, h: 630 } }[how] || { w: 1080, h: 1920 };
    const W = c.width = H0.w, H = c.height = H0.h; const x = c.getContext('2d'); x.clearRect(0, 0, W, H); bg(x, W, H, t);
    const title = w.id === 'page' ? (cfg.artist || cfg.title) : w.title;
    if (how === 'story' || how === 'sticker') {
      const z = how === 'sticker' ? 1 + Math.sin(t / 1400) * .015 : 1; const S0 = 760; const cy = how === 'sticker' ? 330 : 300;
      x.save(); x.shadowColor = 'rgba(0,0,0,.55)'; x.shadowBlur = 70; x.shadowOffsetY = 30; x.fillStyle = '#000'; rr(x, (W - S0) / 2, cy, S0, S0, 36); x.fill(); x.restore();
      coverFit(x, (W - S0) / 2, cy, S0, S0, 36, z); if (w.play) playBtn(x, W / 2, cy + S0 / 2, 90);
      hearts(x, W, H, t);
      badge(x, w, W / 2, cy + S0 + 70, 70);
      if (how === 'sticker') wordmark(x, title, W / 2, cy + S0 + 300, 960, 190); else plainTitle(x, title, W / 2, cy + S0 + 270, 960, 120);
      x.fillStyle = P.muted || '#ccc'; x.textAlign = 'center'; x.font = `600 46px ${FB}`; x.fillText(w.id === 'page' ? w.sub : w.sub, W / 2, cy + S0 + 370, 960);
      icons(x, w.icons, W / 2, cy + S0 + 430, 84);
      if (how === 'sticker') linkSticker(x, W / 2, H - 330, 110, t);
      else { pill(x, (w.cta || 'Open').toUpperCase(), W / 2, H - 300, 104, P.acc, P.on_acc || '#fff', `800 42px ${FB}`); x.fillStyle = 'rgba(255,255,255,.85)'; x.textAlign = 'center'; fitText(x, DOMAIN, `700 $px ${FB}`, W - 160, 38); x.fillText(DOMAIN, W / 2, H - 140); }
      if (tier !== 'gold') { x.fillStyle = 'rgba(255,255,255,.5)'; x.font = `600 28px ${FB}`; x.textAlign = 'center'; x.fillText(`Made with ${cfg.brand_name || 'CreatorPages'}`, W / 2, H - 70); }
    } else if (how === 'post') {
      coverFit(x, 0, 0, W, H, 0); const g = x.createLinearGradient(0, H * .35, 0, H); g.addColorStop(0, 'transparent'); g.addColorStop(1, 'rgba(0,0,0,.85)'); x.fillStyle = g; x.fillRect(0, 0, W, H);
      if (w.play) playBtn(x, W / 2, H * .4, 90);
      x.textAlign = 'left';
      x.font = `800 34px ${FB}`; const kw = x.measureText(w.kicker.toUpperCase()).width + 60; x.fillStyle = w.live ? '#ff2d55' : P.acc; rr(x, 60, H - 330, kw, 64, 32); x.fill(); x.fillStyle = w.live ? '#fff' : (P.on_acc || '#fff'); x.textBaseline = 'middle'; x.fillText(w.kicker.toUpperCase(), 90, H - 296); x.textBaseline = 'alphabetic';
      const s = fitText(x, title, `800 $px ${BRAND ? WMF : FD}`, W - 120, 110); x.font = `${BRAND ? WM.weight || 400 : 800} ${s}px ${BRAND ? WMF : FD}`; x.lineJoin = 'round';
      if (BRAND) { x.strokeStyle = WM.stroke; x.lineWidth = s * .12; x.strokeText(title, 60, H - 160); x.fillStyle = WM.fill; } else x.fillStyle = '#fff'; x.fillText(title, 60, H - 160);
      x.fillStyle = 'rgba(255,255,255,.8)'; x.font = `600 40px ${FB}`; x.fillText(`${w.sub}  ·  ${DOMAIN}`, 60, H - 90, W - 120);
    } else if (how === 'link') {
      x.fillStyle = 'rgba(0,0,0,.25)'; x.fillRect(0, 0, W, H); coverFit(x, 50, 50, 530, 530, 28); if (w.play) playBtn(x, 315, 315, 70);
      x.textAlign = 'left'; x.font = `800 30px ${FB}`; x.fillStyle = w.live ? '#ff5577' : (WM.stroke || P.acc); x.fillText(w.kicker.toUpperCase(), 630, 150);
      const s = fitText(x, title, `800 $px ${BRAND ? WMF : FD}`, 520, 96); x.font = `${BRAND ? WM.weight || 400 : 800} ${s}px ${BRAND ? WMF : FD}`; x.fillStyle = BRAND ? WM.fill : '#fff';
      if (BRAND) { x.lineJoin = 'round'; x.strokeStyle = WM.stroke; x.lineWidth = s * .12; x.strokeText(title, 630, 150 + s * 1.05); } x.fillText(title, 630, 150 + s * 1.05);
      x.font = `600 34px ${FB}`; x.fillStyle = P.muted || '#ccc'; x.fillText(w.sub, 630, 250 + s * .8, 520);
      icons(x, w.icons, 630 + Math.min(w.icons.length, 6) * 34, 360, 58);
      x.fillStyle = 'rgba(255,255,255,.12)'; rr(x, 630, 500, 520, 80, 40); x.fill(); x.fillStyle = '#fff'; x.font = `700 32px ${FB}`; x.fillText('🔗 ' + DOMAIN, 660, 552, 470);
    }
    return c;
  }
  window.CPShare = { render, WHAT, HOW, linkFor, open: () => open() };

  /* ---------- sheet UI ---------- */
  let sheet, pv, busy = false;
  function chips(list, key) { return list.map(v => `<button type="button" class="sh-chip${S[key] === v.id ? ' on' : ''}" data-${key}="${v.id}">${esc(v.label)}</button>`).join(''); }
  function build() {
    sheet = document.createElement('div'); sheet.className = 'sh-wrap'; sheet.innerHTML = `<div class="sh-back" data-close></div>
      <div class="sh" role="dialog" aria-modal="true" aria-label="Share"><div class="sh-grab"></div>
        <div class="sh-h"><b>${STUDIO ? 'Share studio' : 'Share'}</b><span class="sh-tier">${esc((cfg.tierMeta || {}).label || '')}</span><button class="sh-x" data-close aria-label="Close">✕</button></div>
        ${STUDIO ? `<div class="sh-l">What</div><div class="sh-row" data-g="what">${chips(WHAT, 'what')}</div><div class="sh-l">Look</div><div class="sh-row" data-g="how">${chips(HOW, 'how')}</div>` : ''}
        <div class="sh-pv"><canvas></canvas><span class="sh-note"></span></div>
        <div class="sh-acts">
          <button class="sh-btn main" data-do="share">Share image…</button>
          ${BRAND ? '<button class="sh-btn" data-do="anim">Animated story</button>' : ''}
          <button class="sh-btn" data-do="download">Download</button>
          <button class="sh-btn" data-do="copy">Copy link</button>
        </div>
        <div class="sh-soc">
          <a data-soc="x" target="_blank" rel="noopener">X</a><a data-soc="facebook" target="_blank" rel="noopener">Facebook</a><a data-soc="whatsapp" target="_blank" rel="noopener">WhatsApp</a><a data-soc="threads" target="_blank" rel="noopener">Threads</a>
        </div>
        <p class="sh-ig"><b>Instagram / Facebook Story:</b> tap <i>Share image</i>, pick Instagram or Facebook, choose Story, then add a <b>Link sticker</b> (the link is already copied). Instagram doesn't let a web page put a tappable link into a Story on its own.</p>
        ${tier === 'bronze' ? '<p class="sh-up">Silver unlocks share templates (post, link card, pick what to share). Gold adds branded + animated stories.</p>' : ''}
      </div>`;
    document.body.appendChild(sheet); pv = sheet.querySelector('.sh-pv canvas');
    sheet.addEventListener('click', e => {
      if (e.target.closest('[data-close]')) return close();
      const c = e.target.closest('[data-what],[data-how]'); if (c) { const k = c.dataset.what ? 'what' : 'how'; S[k] = c.dataset[k]; sheet.querySelectorAll(`[data-${k}]`).forEach(b => b.classList.toggle('on', b === c)); track('template', { what: S.what, how: S.how }); return draw(); }
      const d = e.target.closest('[data-do]'); if (d) act(d.dataset.do);
      const so = e.target.closest('[data-soc]'); if (so) track('social', { to: so.dataset.soc, what: S.what });
    });
  }
  function socials() {
    const w = WHAT.find(v => v.id === S.what); const u = encodeURIComponent(linkFor(w)); const txt = encodeURIComponent(`${w.id === 'page' ? cfg.artist || cfg.title : w.title}${w.id === 'release' ? ' by ' + cfg.artist : ''}: ${w.cta}`);
    const H = { x: `https://twitter.com/intent/tweet?text=${txt}&url=${u}`, facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`, whatsapp: `https://wa.me/?text=${txt}%20${u}`, threads: `https://www.threads.net/intent/post?text=${txt}%20${u}` };
    sheet.querySelectorAll('[data-soc]').forEach(a => a.href = H[a.dataset.soc]);
  }
  let raf;
  function draw() {
    cancelAnimationFrame(raf); const h = HOW.find(v => v.id === S.how);
    sheet.querySelector('.sh-note').textContent = `${h.w}×${h.h} · ${h.note}`; pv.dataset.how = S.how;
    ready.then(() => { const loop = t => { render(pv, S.what, S.how, t); if (BRAND && S.how === 'sticker' && !document.documentElement.classList.contains('freeze')) raf = requestAnimationFrame(loop); }; loop(0); });
    socials();
  }
  const fname = ext => `${cfg.slug}-${S.what}-${S.how}.${ext}`;
  const toBlob = c => new Promise(r => c.toBlob(r, 'image/png'));
  async function copyLink(quiet) { const u = linkFor(WHAT.find(v => v.id === S.what)); try { await navigator.clipboard.writeText(u); } catch (e) { const i = document.createElement('input'); i.value = u; document.body.appendChild(i); i.select(); document.execCommand('copy'); i.remove(); } if (!quiet) toast('Link copied'); return u; }
  function dl(blob, name) { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); }
  async function shareFile(blob, name, type) {
    const w = WHAT.find(v => v.id === S.what); const url = await copyLink(true); const file = new File([blob], name, { type });
    const data = { files: [file], title: w.title, text: `${w.title} · ${url}` };
    if (navigator.canShare && navigator.canShare(data)) { try { await navigator.share(data); track('share', { what: S.what, how: S.how, via: 'webshare' }); return; } catch (e) { if (e.name === 'AbortError') return; } }
    if (navigator.share) { try { await navigator.share({ title: w.title, url }); } catch (e) {} }
    dl(blob, name); toast('Image saved + link copied (this browser can\'t share files)'); track('share', { what: S.what, how: S.how, via: 'download-fallback' });
  }
  async function act(k) {
    if (busy) return;
    if (k === 'copy') { await copyLink(); track('copy', { what: S.what }); return; }
    const c = document.createElement('canvas'); await ready; render(c, S.what, S.how, 0); const blob = await toBlob(c);
    if (k === 'download') { dl(blob, fname('png')); toast('Card downloaded'); track('download', { what: S.what, how: S.how }); }
    if (k === 'share') shareFile(blob, fname('png'), 'image/png');
    if (k === 'anim') anim();
  }
  async function anim() {  // Gold: 4s animated story recorded from the canvas
    if (!window.MediaRecorder || !HTMLCanvasElement.prototype.captureStream) return toast('Animated story needs a newer browser');
    busy = true; const b = sheet.querySelector('[data-do=anim]'); b.textContent = 'Recording… 4s';
    const c = document.createElement('canvas'); c.width = 1080; c.height = 1920; await ready;
    const type = ['video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm'].find(t => MediaRecorder.isTypeSupported(t)) || 'video/webm';
    const rec = new MediaRecorder(c.captureStream(30), { mimeType: type, videoBitsPerSecond: 6e6 }); const parts = []; rec.ondataavailable = e => e.data.size && parts.push(e.data);
    const t0 = performance.now(); const how = S.how === 'post' || S.how === 'link' ? 'sticker' : 'sticker';
    rec.start(); (function f() { const t = performance.now() - t0; render(c, S.what, how, t * 2.2); if (t < 4000) requestAnimationFrame(f); else rec.stop(); })();
    await new Promise(r => rec.onstop = r); busy = false; b.textContent = 'Animated story';
    const ext = type.includes('mp4') ? 'mp4' : 'webm'; const blob = new Blob(parts, { type: type.split(';')[0] }); window.CPShare.lastVideo = blob;
    track('animated', { what: S.what, ext, bytes: blob.size }); shareFile(blob, fname(ext), blob.type);
  }
  function toast(m) { const t = document.getElementById('toast'); if (!t) return; t.textContent = m; t.classList.add('on'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('on'), 2600); }
  function open() { if (!sheet) build(); sheet.classList.add('on'); document.documentElement.classList.add('sh-open'); draw(); track('open', {}); }
  function close() { sheet.classList.remove('on'); document.documentElement.classList.remove('sh-open'); cancelAnimationFrame(raf); }
  addEventListener('keydown', e => { if (e.key === 'Escape' && sheet && sheet.classList.contains('on')) close(); });
  if (new URLSearchParams(location.search).get('share')) setTimeout(open, 600);
})();
