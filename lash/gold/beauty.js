/* Round 7 · Beauty Pro templates for lash / hair / nail Gold pages (look id "pro").
   Templates: clean (Clean Pro, default), luxe (Soft Luxe), editorial (Modern Editorial). Each one is tuned per trade.
   Motion: calm (default, near-static), lively (fades, soft parallax, shimmer), dynamic (Ken Burns hero, trade accent, scroll scenes).
   Everything is real text from the config. Booking buttons link out to the creator's own booking app; nothing books or pays here. */
window.CPBeauty = (function () {
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const TEMPLATES = {
    clean: { label: 'Clean Pro', sub: 'Airy, straight to the point', head: 'Playfair Display', body: 'Inter', script: '',
      base: { bg: '#fbfaf7', bg2: '#f3efe9', card: '#ffffff', text: '#1d1b19', muted: '#5c5753', line: '#e7e1d9', on: '#ffffff' },
      acc: { lash: '#7d4f42', hair: '#6a4a2e', nail: '#94384f' } },
    luxe: { label: 'Soft Luxe', sub: 'Warm neutrals, script accent', head: 'Cormorant Garamond', body: 'Jost', script: 'Pinyon Script',
      base: { bg: '#f6efe8', bg2: '#eee2d6', card: '#fffaf5', text: '#2d231f', muted: '#66574f', line: '#e3d4c6', on: '#ffffff' },
      acc: { lash: '#94535a', hair: '#82543a', nail: '#9c4560' } },
    editorial: { label: 'Modern Editorial', sub: 'Magazine layout, full-bleed photos', head: 'Bodoni Moda', body: 'DM Sans', script: '',
      base: { bg: '#f4f2ef', bg2: '#e9e5df', card: '#ffffff', text: '#121212', muted: '#4f4b47', line: '#d9d3cb', on: '#ffffff' },
      acc: { lash: '#6f3b2c', hair: '#5a3d24', nail: '#7f2d45' } }
  };
  const MOTIONS = { calm: { label: 'Calm', sub: 'Near-static, subtle hover' }, lively: { label: 'Lively', sub: 'Soft fades + parallax' }, dynamic: { label: 'Dynamic', sub: 'Motion hero + scroll scenes' } };
  const TRADE = { lash: { menu: 'Lash menu', noun: 'set', accent: 'lashline' }, hair: { menu: 'Services', noun: 'appointment', accent: 'strand' }, nail: { menu: 'Nail menu', noun: 'set', accent: 'gloss' } };
  let S = null;
  function pick(cfg, qs) {
    const P = cfg.pro || {};
    const tpl = TEMPLATES[qs.get('tpl')] ? qs.get('tpl') : TEMPLATES[P.template] ? P.template : 'clean';
    const motion = MOTIONS[qs.get('motion')] ? qs.get('motion') : MOTIONS[P.motion] ? P.motion : 'calm';
    return { tpl, motion };
  }
  function apply(cfg, root, qs) {
    const { tpl, motion } = pick(cfg, qs); const T = TEMPLATES[tpl]; const v = TRADE[cfg.vertical] ? cfg.vertical : 'lash';
    const c = Object.assign({}, T.base, { acc: (cfg.pro || {}).accent || T.acc[v] });
    const set = (k, x) => root.style.setProperty(k, x);
    set('--bg', c.bg); set('--bg2', c.bg2); set('--card', c.card); set('--card-solid', c.card); set('--text', c.text); set('--muted', c.muted); set('--line', c.line);
    set('--acc', c.acc); set('--acc2', c.acc); set('--on-acc', c.on); set('--fade', c.bg);
    set('--bp-head', `'${T.head}'`); set('--bp-body', `'${T.body}'`); set('--bp-script', `'${T.script || T.head}'`); set('--font-body', `'${T.body}'`); set('--font-display', `'${T.head}'`);
    root.dataset.look = 'pro'; root.dataset.bp = tpl; root.dataset.motionLevel = motion; root.dataset.theme = 'light'; root.style.colorScheme = 'light';
    delete root.dataset.motion;
    const g = document.querySelector('link[href="gold.css"]'); if (g) g.disabled = true;
    const mc = document.querySelector('meta[name=theme-color]'); if (mc) mc.content = c.bg;
    const fams = [T.head + ':ital,wght@0,400;0,500;0,600;0,700;1,400', T.body + ':wght@400;500;600;700'].concat(T.script ? [T.script] : []);
    const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?' + fams.map(f => 'family=' + f.replace(/ /g, '+')).join('&') + '&display=swap'; document.head.appendChild(l);
    S = { cfg, tpl, motion, v, T };
    return S;
  }
  const clean = t => String(t || '').replace(/\s*\((sample|demo)\)\s*$/i, '');
  /* ---------- pieces ---------- */
  function bookBtn(x, url, label, cls) { const pv = x.provider(url || x.cfg.booking_url || ''); return `<a class="bp-btn ${cls || ''}" href="${esc(url || x.cfg.booking_url || '#services')}" target="_blank" rel="noopener" data-book="${esc(pv.id)}">${esc(label || 'Book now')}</a>`; }
  function header(x) {
    const cfg = x.cfg;
    return `<header class="bp-bar"><a class="bp-name" href="#top">${esc(clean(cfg.title))}</a><span class="bp-tag">Sample</span>
      <nav class="bp-nav" aria-label="Page"><a href="#services">Services</a><a href="#info">Policies</a><a href="#visit">Visit</a></nav>
      <button class="bp-icon" data-act="share" aria-label="Share"><svg viewBox="0 0 24 24"><path d="M12 3v13M7 8l5-5 5 5M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"/></svg></button>${bookBtn(x, null, 'Book', 'sm')}</header>`;
  }
  function hero(x) {
    const cfg = x.cfg, P = cfg.pro || {}, ph = (P.heroes || {})[x.tpl] || P.hero || cfg.cover; const pv = x.provider(cfg.booking_url || '');
    const meta = [cfg.availability, (cfg.location || {}).area && cfg.location.area.split('·')[0].trim()].filter(Boolean).join(' · ');
    const acc = x.motion === 'dynamic' ? `<canvas class="bp-accent" data-accent="${esc(P.accent_motion || TRADE[x.v].accent)}" aria-hidden="true"></canvas>` : '';
    const img = `<img class="bp-hero-img" src="${esc(ph)}" alt="${esc(P.hero_alt || '')}" fetchpriority="high" decoding="async" width="1000" height="1250">`;
    const script = x.tpl === 'luxe' ? `<span class="bp-script" aria-hidden="true">${esc(P.script_word || 'welcome')}</span>` : '';
    return `<section class="bp-hero" id="top"><div class="bp-hero-ph">${img}${acc}</div>
      <div class="bp-hero-tx">${script}<p class="bp-kicker">${esc(P.kicker || cfg.studio_subline || '')}</p><h1 class="bp-h1">${esc(clean(cfg.title))}</h1>
        <p class="bp-lede">${esc(P.lede || cfg.tagline || '')}</p>${meta ? `<p class="bp-meta">${esc(meta)}</p>` : ''}
        <div class="bp-cta">${bookBtn(x, null, 'Book now', 'lg')}<a class="bp-btn ghost lg" href="#services">Services &amp; prices</a></div><p class="bp-via">Booking opens ${esc(pv.name)}</p>
        ${P.rating ? `<p class="bp-rate"><span aria-hidden="true">★★★★★</span> ${esc(P.rating)}</p>` : ''}</div></section>`;
  }
  function menu(x) {
    const cfg = x.cfg, M = ((cfg.pro || {}).menu || [{ cat: 'Services', items: cfg.services || [] }]).filter(c => (c.items || []).length);
    if (!M.length) return sec(x, 'services', TRADE[x.v].menu, '', `<p class="bp-note">Services, prices and open times are on ${esc(x.provider(cfg.booking_url || '').name)}.</p><div class="bp-cta">${bookBtn(x, null, 'See services & book', 'lg')}</div>`);
    const tabs = M.length > 1 ? `<div class="bp-cats" role="group" aria-label="Service categories">${M.map((c, i) => `<button type="button" data-bpcat="${i}" aria-pressed="${i === 0}">${esc(c.cat)}</button>`).join('')}</div>` : '';
    const groups = M.map((c, i) => `<div class="bp-group${i === 0 ? ' on' : ''}" data-bpgroup="${i}"><h3 class="bp-gh">${esc(c.cat)}</h3>${c.note ? `<p class="bp-note">${esc(c.note)}</p>` : ''}
      <ul class="bp-items">${c.items.map(s => `<li class="bp-item"><div class="bp-it"><b>${esc(s.name)}</b>${s.desc ? `<span>${esc(s.desc)}</span>` : s.note ? `<span>${esc(s.note)}</span>` : ''}<small>${esc([s.time, s.price].filter(Boolean).join(' · '))}</small></div>${bookBtn(x, s.book_url, 'Book', 'sm out')}</li>`).join('')}</ul></div>`).join('');
    return sec(x, 'services', TRADE[x.v].menu, (cfg.services_note || 'Sample prices') + ' · booking opens their booking page', tabs + `<div class="bp-menu">${groups}</div>`);
  }
  function sec(x, id, title, sub, inner, cls) {
    const num = x.tpl === 'editorial' ? `<span class="bp-num">${String((x.n = (x.n || 0) + 1)).padStart(2, '0')}</span>` : '';
    return `<section class="bp-sec ${cls || ''}" id="${id}"><div class="bp-sh">${num}<h2>${esc(title)}</h2>${sub ? `<p>${esc(sub)}</p>` : ''}</div>${inner}</section>`;
  }
  function about(x) {
    const A = (x.cfg.pro || {}).about; if (!A) return '';
    return sec(x, 'about', A.heading || 'Hi, I\'m ' + (A.name || ''), '', `<div class="bp-about">${A.photo ? `<img src="${esc(A.photo)}" alt="${esc(A.alt || '')}" loading="lazy" decoding="async" width="600" height="750">` : ''}<div><p>${esc(A.text)}</p>${A.creds ? `<ul class="bp-creds">${A.creds.map(c => `<li>${esc(c)}</li>`).join('')}</ul>` : ''}</div></div>`);
  }
  function gallery(x) {
    const G = ((x.cfg.pro || {}).gallery || x.cfg.gallery || []).slice(0, x.tpl === 'editorial' ? 7 : 6); if (!G.length) return '';
    return sec(x, 'work', (x.cfg.pro || {}).gallery_heading || 'Recent work', 'Sample photos', `<div class="bp-gal">${G.map((g, i) => `<figure class="g${i}"><img src="${esc(g.src)}" alt="${esc(g.alt || g.cap || '')}" loading="lazy" decoding="async" width="600" height="600">${g.cap ? `<figcaption>${esc(g.cap)}</figcaption>` : ''}</figure>`).join('')}</div>`, 'bleed');
  }
  function reviews(x) {
    const R = x.cfg.testimonials || []; if (!R.length) return '';
    return sec(x, 'reviews', 'Kind words', 'Sample reviews', `<div class="bp-revs">${R.map(r => `<blockquote class="bp-rev"><p>“${esc(r.text)}”</p><footer>${esc(r.name)}${r.what ? ` · ${esc(r.what)}` : ''}</footer></blockquote>`).join('')}</div>`);
  }
  function info(x) {
    const cfg = x.cfg, P = cfg.pro || {};
    const acc = (t, body, open) => `<details class="bp-acc"${open ? ' open' : ''}><summary>${esc(t)}</summary><div>${body}</div></details>`;
    const pol = (cfg.policies || []).map(p => `<p><b>${esc(p.title)}.</b> ${esc(p.text)}</p>`).join('');
    const prep = (P.prep || []).length ? `<ul class="bp-check">${P.prep.map(t => `<li>${esc(t)}</li>`).join('')}</ul>` : '';
    const faq = (cfg.faq || []).map(q => `<p><b>${esc(q.q)}</b><br>${esc(q.a)}</p>`).join('');
    return sec(x, 'info', 'Good to know', 'Read before you book', `<div class="bp-accs">${prep ? acc('Before your appointment', prep, x.tpl !== 'clean') : ''}${pol ? acc('Booking policies', pol) : ''}${faq ? acc('FAQ', faq) : ''}</div>`);
  }
  function visit(x) {
    const L = x.cfg.location || {}; if (!L.label && !L.hours) return '';
    const q = encodeURIComponent(L.map_query || L.area || '');
    return sec(x, 'visit', 'Visit', L.note || '', `<div class="bp-visit"><div><b>${esc(clean(L.label || ''))}</b><p>${esc(L.area || '')}</p>
      <a class="bp-link" href="https://www.google.com/maps/search/?api=1&query=${q}" target="_blank" rel="noopener" data-link="googlemaps">Open in Maps ↗</a></div>
      <dl class="bp-hours">${(L.hours || []).map(h => `<dt>${esc(h[0])}</dt><dd>${esc(h[1])}</dd>`).join('')}</dl></div>`);
  }
  function closing(x) {
    const cfg = x.cfg; const tip = x.tipChip ? x.tipChip() : '';
    return `<section class="bp-close"><h2>${esc((cfg.pro || {}).closing || 'Ready when you are')}</h2><div class="bp-cta">${bookBtn(x, null, 'Book now', 'lg')}</div>
      <div class="bp-row">${tip}<button class="bp-btn ghost" data-act="share">Share this page</button>${(cfg.socials || []).map(s => `<a class="bp-soc" href="${esc(s.url)}" data-link="${esc(s.platform)}" aria-label="${esc(x.names[s.platform] || s.platform)}">${x.icon(s.platform)}</a>`).join('')}</div>${(cfg.pro || {}).credits ? `<p class="bp-credit"><a href="CREDITS.md" target="_blank" rel="noopener">Photo credits</a> · CC0 natural photography</p>` : ''}</section>`;
  }
  function render(ctx) {
    const x = Object.assign({}, ctx, S, { n: 0 });
    const order = { clean: [menu, info, about, reviews, gallery, visit], luxe: [about, menu, gallery, reviews, info, visit], editorial: [gallery, menu, about, reviews, info, visit] }[x.tpl];
    return header(x) + `<div class="bp-main">` + hero(x) + order.map(f => f(x)).join('') + closing(x) + `</div>` + ctx.footer();
  }
  function wire() {
    if (!S) return;
    document.querySelectorAll('[data-bpcat]').forEach(b => b.addEventListener('click', () => {
      const i = b.dataset.bpcat; document.querySelectorAll('[data-bpcat]').forEach(y => y.setAttribute('aria-pressed', String(y === b)));
      document.querySelectorAll('[data-bpgroup]').forEach(g => g.classList.toggle('on', g.dataset.bpgroup === i)); }));
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('freeze');
    if (S.motion === 'calm' || reduce) return;
    const secs = [...document.querySelectorAll('.bp-sec,.bp-close')]; secs.forEach(s => s.classList.add('bp-rv'));
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('bp-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
    secs.forEach(s => io.observe(s));
    const img = document.querySelector('.bp-hero-img'); let tk = false;
    const par = () => { tk = false; const y = Math.min(scrollY, 900); if (img) img.style.transform = `translate3d(0,${(y * (S.motion === 'dynamic' ? .22 : .12)).toFixed(1)}px,0)`;
      if (S.motion === 'dynamic') document.documentElement.style.setProperty('--bp-scroll', (Math.min(scrollY, 1200) / 1200).toFixed(3)); };
    addEventListener('scroll', () => { if (!tk) { tk = true; requestAnimationFrame(par); } }, { passive: true });
  }
  return { TEMPLATES, MOTIONS, pick, apply, render, wire };
})();
