/* Creator Pages runtime. Reads the inlined config JSON and renders the page.
   All feature gating comes from cfg.features (resolved from tiers.json by the generator). */
(function () {
  const cfg = JSON.parse(document.getElementById('config').textContent);
  const F = cfg.features || {};
  const qs = new URLSearchParams(location.search);
  const EXPAND = qs.has('expand');          // render every tab panel stacked (for review/screenshots)
  const STATIC = qs.has('static');          // freeze motion (for still screenshots)
  const root = document.documentElement;
  if (F.motionBackground && cfg.motion !== 'off') root.dataset.motion = '1';
  if (cfg.motion) root.dataset.intensity = cfg.motion;
  if (STATIC) root.classList.add('freeze', 'noreveal');
  if (EXPAND) root.classList.add('noreveal');
  root.style.setProperty('--art', `url("${cfg.cover || 'cover.jpg'}")`);
  const GOLD = !!F.cinematicHero;
  const T = cfg.theme || {}; const WM = T.wordmark || {};
  if (GOLD && WM.font) { root.style.setProperty('--wm-font', `'${WM.font}'`); root.style.setProperty('--wm-fill', WM.fill); root.style.setProperty('--wm-stroke', WM.stroke); root.style.setProperty('--wm-depth', WM.depth); root.style.setProperty('--wm-weight', WM.weight || 400); root.style.setProperty('--wm-case', WM.case || 'none'); root.style.setProperty('--wm-track', WM.tracking || '0'); }
  const isLive = F.liveTakeover && cfg.layout === 'streamer' && cfg.live && cfg.live.is_live;
  if (isLive) root.dataset.live = '1';
  window.CP = { cfg, F, STATIC, EXPAND, qs };

  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const icon = (k, fill) => {
    const i = (window.ICONS || {})[k];
    if (!i) return `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="${fill || 'currentColor'}"/></svg>`;
    return `<svg viewBox="0 0 24 24" role="img" aria-label="${esc(i.title)}"><path d="${i.path}"${fill ? ` fill="${fill}"` : ''}/></svg>`;
  };
  const NAMES = { spotify: 'Spotify', apple_music: 'Apple Music', youtube: 'YouTube', amazon_music: 'Amazon Music', tidal: 'TIDAL', soundcloud: 'SoundCloud', twitch: 'Twitch', kick: 'Kick', tiktok: 'TikTok', instagram: 'Instagram', x: 'X', discord: 'Discord', cashapp: 'Cash App', paypal: 'PayPal', kofi: 'Ko-fi', shop: 'Merch store', shopify: 'Shopify', beatstars: 'BeatStars', bandcamp: 'Bandcamp' };
  const VERB = { spotify: 'Play', apple_music: 'Play', youtube: 'Watch', amazon_music: 'Play', tidal: 'Play', soundcloud: 'Play', twitch: 'Watch', kick: 'Watch', tiktok: 'Follow', discord: 'Join', shop: 'Shop', shopify: 'Shop', beatstars: 'Beats', bandcamp: 'Shop', cashapp: 'Tip', paypal: 'Tip', kofi: 'Tip' };
  const toast = msg => { const t = document.getElementById('toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('on'), 2600); };
  const reveal = F.microInteractions ? ' reveal' : '';
  const ph = cfg.sample ? '' : '';

  /* ---------- pieces ---------- */
  function topbar() {
    const t = cfg.tierMeta || { label: cfg.tier };
    return `<div class="topbar">
      <div class="top-actions"><span class="tier-pill ${esc(cfg.tier)}"><span class="medal"></span>${esc(t.label)} tier</span>
      ${cfg.sample ? '<span class="sample-pill">Sample data</span>' : '<span class="sample-pill">Demo</span>'}</div>
      ${F.shareCard ? `<button class="icon-btn" data-act="share" aria-label="Share"><svg viewBox="0 0 24 24"><path d="M12 3v13M7 8l5-5 5 5M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"/></svg></button>` : ''}
    </div>`;
  }

  function releaseState() {
    if (!cfg.release || !cfg.release.date) return null;
    const d = new Date(cfg.release.date);
    return { date: d, future: d.getTime() > Date.now() };
  }

  const letters = (s) => [...String(s)].map((c, i) => `<span class="ch" style="--i:${i}">${esc(c)}</span>`).join('');
  function wordmark(text, extra) { return `<h1 class="wm fx-${esc(WM.effect || 'sticker')}" data-text="${esc(text)}" ${extra || ''}>${letters(text)}</h1>`; }
  /* ---------- hero CTA: the creator's real platform links for whatever they chose to "feature first" ---------- */
  const FEATURE = cfg.feature_first || (cfg.layout === 'streamer' ? 'live' : 'release');
  const CTA_SETS = {
    release: ['spotify', 'apple_music', 'youtube_music', 'amazon_music', 'tidal', 'soundcloud', 'deezer', 'audiomack', 'bandcamp', 'youtube'],
    video: ['youtube', 'tiktok', 'instagram', 'twitch', 'kick'],
    live: ['twitch', 'kick', 'youtube'],
    merch: ['shopify', 'shop', 'beatstars', 'bandcamp'],
    booking: ['booking', 'calendly', 'email']
  };
  const CTA_VERB = { release: 'Listen on', video: 'Watch on', live: 'Watch live on', merch: 'Shop on', booking: 'Book on' };
  const CTA_SHORT = { apple_music: 'Apple', amazon_music: 'Amazon', youtube_music: 'YT Music', instagram: 'Reels', shop: 'Store' };
  function heroLinks() {
    const set = CTA_SETS[FEATURE] || []; const seen = new Set(); const pool = [];
    const add = (l, src) => { if (!l || !l.url || seen.has(l.url) || !set.includes(l.platform)) return; seen.add(l.url); pool.push(Object.assign({ src }, l)); };
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
      if (FEATURE === 'booking') return `<div class="hcta"><a class="hcta-main" href="#" data-act="scroll-book"><span class="hi" style="background:var(--acc)"><svg viewBox="0 0 24 24"><path d="M4 6h16v12H4z M4 7l8 6 8-6" fill="none" stroke="#fff" stroke-width="2"/></svg></span><span class="ht"><small>Booking</small>Book ${esc(cfg.artist || cfg.title)}</span><span class="hgo">→</span></a></div>`;
      return '';
    }
    const ib = p => { const I = (window.ICONS || {})[p]; if (!I) return { bg: 'var(--acc)', ico: `<b style="color:#fff">${esc((p || '?')[0].toUpperCase())}</b>` }; const n = parseInt(I.hex, 16); const dark = (((n >> 16) & 255) * .299 + ((n >> 8) & 255) * .587 + (n & 255) * .114) < 40; return { bg: dark ? '#fff' : '#' + I.hex, fg: dark ? '#000' : '#fff', ico: icon(p) }; };
    const name = l => l.label && !['Merch store'].includes(l.label) ? l.label : (NAMES[l.platform] || l.platform);
    const [p, ...rest] = L; const a = ib(p.platform);
    const main = `<a class="hcta-main" href="${esc(p.url)}" target="_blank" rel="noopener" data-link="${esc(p.platform)}"><span class="hi" style="background:${a.bg};--ico:${a.fg || '#fff'}">${a.ico}</span><span class="ht"><small>${esc(CTA_VERB[FEATURE] || 'Open')}</small>${esc(name(p))}</span><span class="hgo">${FEATURE === 'merch' ? '↗' : '▶'}</span></a>`;
    const chips = rest.length ? `<div class="hcta-row">${rest.map(l => { const c = ib(l.platform); return `<a class="hcta-chip" href="${esc(l.url)}" target="_blank" rel="noopener" data-link="${esc(l.platform)}"><span class="hi" style="background:${c.bg};--ico:${c.fg || '#fff'}">${c.ico}</span><span>${esc(CTA_SHORT[l.platform] || name(l))}</span></a>`; }).join('')}</div>` : '';
    return `<div class="hcta${reveal}" data-feature="${esc(FEATURE)}">${main}${chips}</div>`;
  }

  function audioMini(what) { return `<button class="g-audio" data-act="preview" aria-label="Play beat preview"><b></b><span>Preview ${esc(what || 'beat')}</span><em>${esc((cfg.audio || {}).label || 'placeholder')}</em></button>`; }
  function goldHero() {
    const L = cfg.layers || {};
    const rs = releaseState();
    if (cfg.layout === 'streamer') {
      const chat = (cfg.live_chat || []).slice(0, 3).map(m => `<p><b>${esc(m[0])}</b> ${esc(m[1])}</p>`).join('');
      return `<section class="g-hero streamer">
        <div class="g-frame"><div class="feed"></div><div class="scan"></div>
          <div class="chip">${isLive ? `<span>● LIVE</span>${cfg.live.viewers ? `<span>${esc(cfg.live.viewers)} watching</span>` : ''}` : '<span>OFFLINE</span>'}</div>
          <div class="chat">${chat}</div><span class="embedlbl">Player embed slot</span></div>
        <div class="g-avatar"></div>
        <div class="g-copy"><div class="g-kicker"><i></i>${isLive ? esc(cfg.live.title || 'Live now') : 'Streamer'}<i></i></div>
          ${wordmark(cfg.title)}
          ${cfg.tagline ? `<p class="g-sub">${esc(cfg.tagline)}</p>` : ''}
          <div class="g-actions">${heroCTA()}</div>${audioMini('intro theme')}</div>
        <canvas class="g-viz"></canvas></section>`;
    }
    const state = rs && F.countdown ? (rs.future ? `Drops <span data-rel-short></span>` : 'Out now') : (cfg.kind_label || '');
    return `<section class="g-hero"><div class="g-stage">
        <div class="g-layer bg" data-depth="-0.5"></div><div class="g-halo"></div>
        <div class="g-layer mid" data-depth="0.25"><img src="${esc(L.mid || cfg.cover || 'cover.jpg')}" alt=""></div>
        ${L.fg ? `<div class="g-layer fg" data-depth="0.9"><img src="${esc(L.fg)}" alt=""></div>` : ''}
        <div class="g-shade"></div></div>
      <div class="g-copy"><div class="g-kicker"><i></i>${esc(cfg.artist)}${cfg.feat ? ' · feat. ' + esc(cfg.feat) : ''}<i></i></div>
        ${wordmark(cfg.title)}
        <p class="g-sub">${state}${cfg.kind_label ? ' · ' + esc(cfg.kind_label) : ''}</p>
        <div class="g-actions">${heroCTA() || `<button class="g-play" data-act="preview"><b></b><span>Play preview<small>${esc((cfg.audio || {}).label || 'placeholder beat')}</small></span></button>`}</div>
        ${HERO_LINKS.length ? audioMini() : ''}</div>
      <canvas class="g-viz"></canvas><div class="g-scrollhint">Scroll</div></section>`;
  }
  function hero() {
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
    } else if (!streamer && cfg.kind_label) {
      status = `<div class="status soft">New ${esc(cfg.kind_label.toLowerCase())}</div>`;
    }
    const viz = F.visualizer ? `<div class="viz">${Array.from({ length: 28 }, (_, i) => `<i style="animation-delay:${(-(i * 137) % 1100) / 1000}s;animation-duration:${0.7 + ((i * 53) % 60) / 100}s"></i>`).join('')}</div>` : '';
    return `<header class="hero">
      <div class="cover-wrap${reveal}">${streamer ? '<div class="ring"></div>' : ''}
        <div class="cover ${F.microInteractions && streamer ? 'tilt' : ''}"><img src="${esc(cfg.cover || 'cover.jpg')}" alt="${esc(cfg.title)} artwork"><div class="glare"></div></div>
      </div>
      ${viz}
      ${status}
      <h1 class="title">${esc(cfg.title)}${cfg.feat ? `<span class="feat">feat. ${esc(cfg.feat)}</span>` : ''}</h1>
      ${streamer ? (cfg.tagline ? `<p class="tagline">${esc(cfg.tagline)}</p>` : '') : `<p class="byline">by <b>${esc(cfg.artist)}</b></p>${cfg.tagline ? `<p class="tagline">${esc(cfg.tagline)}</p>` : ''}`}
      ${cfg.kind_label && !streamer ? `<p class="meta">${esc(cfg.kind_label)}${cfg.genre ? ' · ' + esc(cfg.genre) : ''}</p>` : ''}
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

  function eras() {
    const g = T.grades || [];
    const list = [{ title: cfg.title, sub: cfg.layout === 'streamer' ? 'Latest highlight' : 'Out now', art: 'cover.jpg' }, ...(cfg.releases || [])];
    return `<div class="eras">${list.map((r, i) => `<a class="era" href="#" style="--ec:${g[(i + 1) % g.length] || 'var(--acc)'};--ec2:${g[(i + 2) % g.length] || 'var(--acc2)'}">
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
        return `<a class="rel" href="#"><div class="art" style="position:relative;background:linear-gradient(150deg,${hue},var(--bg));${r.art ? `background-image:url('${esc(r.art)}');background-size:cover;` : ''}">${r.art ? '' : esc(r.title)}</div><p>${esc(r.title)}</p><small>${esc(r.sub || '')}</small></a>`;
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
      <input class="in" name="contact" type="email" placeholder="you@email.com" autocomplete="off" required>
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
    if (F.merch3D) return goldShop();
    return sec(esc(cfg.merch_heading || 'Merch'), esc(cfg.merch_note || `Opens ${storeName()}`), `<div class="grid2">${cfg.merch.map((m, i) => `<a class="prod" href="${esc(storeUrl(m))}" target="_blank" rel="noopener" data-link="${esc((cfg.store && cfg.store.platform) || 'shop')}"><div class="pimg" style="background:linear-gradient(160deg,${['var(--dom)', 'var(--acc2)', 'var(--acc)', 'var(--bg2)'][i % 4]},var(--bg))">${m.tag ? `<span class="tag">${esc(m.tag)}</span>` : ''}<img src="${esc(cfg.cover || 'cover.jpg')}" alt=""></div><div class="pinfo"><p>${esc(m.name)}</p><div><span class="view">View ↗</span></div></div></a>`).join('')}</div>${storeButtons()}`);
  }

  /* Support = outbound buttons to the creator's own Cash App / PayPal / Ko-fi. No amounts, no payment UI. */
  function tips() {
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
    if (!F.booking) return '';
    const b = cfg.booking || {};
    const types = b.types || ['Feature', 'Show', 'Sponsor'];
    return sec(esc(b.heading || 'Book / work with me'), 'Goes straight to your inbox', `<div class="card"><form class="form" data-form="book">
      <div class="seg">${types.map((t, i) => `<button type="button" class="${i ? '' : 'on'}" data-bt="${esc(t)}">${esc(t)}</button>`).join('')}</div>
      <div class="row"><input class="in" placeholder="Name" required><input class="in" type="email" placeholder="Email" required></div>
      <select class="in"><option>Budget: under $500</option><option>$500 – $2K</option><option>$2K+</option></select>
      <textarea class="in" placeholder="What are you thinking?"></textarea>
      <button class="btn" type="submit">Send request</button><p class="fine">Demo form · nothing is sent</p></form></div>`);
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
    if (F.badge) f += `<a class="made" href="#"><i></i>Made with ${esc(cfg.brand_name || 'CreatorPages')} · ${esc((cfg.tierMeta || {}).label || '')}</a>`;
    f += `<p class="legal">${esc(cfg.footer_note || '')}</p>`;
    return `<footer class="foot">${f}</footer>`;
  }

  /* ---------- tabs ---------- */
  function panelsFor() {
    const streamer = cfg.layout === 'streamer';
    const P = [];
    if (streamer) {
      P.push(['Schedule', scheduleBlock()]);
      P.push(['Clips', videoBlock() + ecosystem()]);
      P.push(['Support', tips() + merch()]);
      P.push(['Partner', epk() + booking()]);
      P.push(['Join', fanCapture() + exportBlock() + shareCard()]);
    } else {
      P.push(['Music', playerBlock() + ecosystem() + lyrics() + credits()]);
      P.push(['Video', videoBlock()]);
      P.push(['Merch', merch() + tips()]);
      P.push(['Shows', shows()]);
      P.push(['Press', epk() + booking()]);
      P.push(['Join', fanCapture() + exportBlock() + shareCard()]);
    }
    let out = P.filter(p => p[1].trim());
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
    return `<a class="feat-card ${esc(f.type)}" href="${esc(f.url || '#')}" ${f.url ? `data-link="${esc(k || 'link')}"` : 'data-act="scroll-book"'}>
      <span class="fc-ico" style="background:${brand ? '#' + brand : 'var(--acc)'}">${k && window.ICONS[k] ? icon(k) : '<svg viewBox="0 0 24 24"><path d="M4 6h16v12H4z M4 7l8 6 8-6" fill="none" stroke="#fff" stroke-width="2"/></svg>'}</span>
      <span class="fc-txt"><small>${esc(f.kicker || '')}</small><b>${esc(f.title || '')}</b>${f.sub ? `<em>${esc(f.sub)}</em>` : ''}</span><span class="fc-go">${esc(f.cta || 'Open')}</span></a>`;
  }

  function tabbed() {
    const P = panelsFor();
    if (!P.length) return '';
    if (F.sceneTransitions) {
      const g = T.grades || [];
      return P.map((p, i) => `<section class="scene" data-name="${esc(p[0])}" data-grade="${g[i % g.length] || ''}" data-grade2="${g[(i + 2) % g.length] || ''}" style="--scene-c:${g[i % g.length] || 'var(--acc)'}">
        <div class="scene-h"><span class="num">${String(i + 1).padStart(2, '0')}</span><h2>${esc(p[0])}</h2></div>${p[1]}</section>`).join('');
    }
    if (EXPAND || !F.tabs) return P.map(p => `<div class="panel on">${EXPAND && F.tabs ? `<div class="eyebrow" style="margin:28px 2px -4px">${esc(p[0])} tab</div>` : ''}${p[1]}</div>`).join('');
    return `<div class="tabs" role="tablist">${P.map((p, i) => `<button role="tab" aria-selected="${i === 0}" data-tab="${i}">${esc(p[0])}</button>`).join('')}</div>
      ${P.map((p, i) => `<div class="panel${i === 0 ? ' on' : ''}" data-panel="${i}">${p[1]}</div>`).join('')}`;
  }

  /* ---------- render ---------- */
  const app = document.getElementById('app');
  const goldChrome = GOLD ? `<div class="g-chapter"><b>01</b><span>Music</span><div class="bar"><i></i></div></div>` : '';
  const goldOuter = GOLD ? `<div class="g-grade"></div><canvas class="g-fx"></canvas>${(T.signature === 'glitch') ? '<div class="g-scan"></div>' : ''}<div class="g-cursor"></div>
    ${isLive ? `<div class="g-live"><span class="dot"></span><span class="mq"><span>LIVE NOW · ${esc(cfg.live.title || '')}${cfg.live.viewers ? ` · ${esc(cfg.live.viewers)} watching` : ''} · tap to jump in ·</span></span><a href="#" data-link="twitch">Watch</a></div>` : ''}
    <div class="g-intro"><div>${wordmark(cfg.title, 'aria-hidden="true"')}<small>${esc(T.intro_line || 'loading the world')}</small></div></div>` : '';
  if (goldOuter) document.body.insertAdjacentHTML('afterbegin', goldOuter);
  if (cfg.demo_banner) document.body.insertAdjacentHTML('afterbegin', `<div class="demo-banner">${esc(cfg.demo_banner)}</div>`);
  app.innerHTML = goldChrome + topbar() + hero() + featured() + links() + socials() + countdownCard() + tabbed() + qrCard() + analytics() + footer();
  // Bronze: QR sits right after links (it's the only extra). Above order already handles that.

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
    if (act === 'scroll-book') { const b = document.querySelector('[data-form=book]'); b ? b.scrollIntoView({ behavior: 'smooth' }) : toast('Booking: add a contact link to enable'); }
    if (act === 'tix') toast('Ticket link: placeholder (demo)');
    if (act === 'owner') { const s = document.querySelector('.analytics'); s.classList.toggle('on'); a.textContent = s.classList.contains('on') ? 'Hide owner view' : 'Owner view · analytics'; }
    if (act === 'epk') { const e2 = cfg.epk || {}; download(`${cfg.slug}-press-kit.txt`, `${cfg.artist || cfg.title} | Press kit\n\n${e2.bio}\n\nStats\n${(e2.stats || []).map(s => `- ${s.l}: ${s.v}`).join('\n')}\n\nContact: use the booking form on the page.\n(Demo export, sample data)`, 'text/plain'); toast('Press kit downloaded'); }
    if (act === 'share' || act === 'story') makeStory();
  });

  // story card (canvas → PNG)
  function makeStory() {
    const c = document.createElement('canvas'); c.width = 1080; c.height = 1920; const x = c.getContext('2d');
    const css = getComputedStyle(root);
    const g = x.createLinearGradient(0, 0, 0, 1920); g.addColorStop(0, css.getPropertyValue('--dom').trim()); g.addColorStop(1, css.getPropertyValue('--bg').trim());
    x.fillStyle = g; x.fillRect(0, 0, 1080, 1920);
    const img = new Image(); img.onload = () => {
      x.save(); x.shadowColor = 'rgba(0,0,0,.5)'; x.shadowBlur = 60; x.drawImage(img, 140, 380, 800, 800); x.restore();
      x.fillStyle = css.getPropertyValue('--text').trim(); x.textAlign = 'center';
      x.font = `800 84px ${css.getPropertyValue('--font-display')}`; x.fillText(cfg.title, 540, 1340, 960);
      x.font = `600 44px ${css.getPropertyValue('--font-body')}`; x.fillStyle = css.getPropertyValue('--muted').trim(); x.fillText(cfg.artist || cfg.tagline || '', 540, 1420, 960);
      x.fillStyle = css.getPropertyValue('--acc').trim(); x.beginPath(); x.roundRect(300, 1540, 480, 110, 55); x.fill();
      x.fillStyle = css.getPropertyValue('--on-acc').trim(); x.font = `800 44px ${css.getPropertyValue('--font-body')}`; x.fillText('LINK IN BIO', 540, 1612);
      try { c.toBlob(b => { const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `${cfg.slug}-story.png`; a.click(); toast('Story card downloaded'); }); }
      catch (err) { toast('Serve over http to download (file:// blocks canvas export)'); }
    };
    img.src = cfg.cover || 'cover.jpg';
  }

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
