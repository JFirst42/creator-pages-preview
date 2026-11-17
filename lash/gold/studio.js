/* Round 5 · Studio modules + Looks. Loaded before app.js; app.js calls these renderers.
   Looks (Gold): 'art' = art-matched theme + Studio modules in it; 'studio' = boutique template (preset per vertical);
   'brand' = their own logo/header/graphics + curated fonts. Cards and flyers are HTML/CSS made from their info + palette,
   so every word, price and policy stays real, editable text. Silver may preview 'studio' (locked ribbon). */
window.CPStudio = (function () {
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const WGHT = new Set(['Cormorant Garamond', 'Montserrat', 'Jost', 'DM Sans', 'Inter', 'Poppins', 'Playfair Display', 'Lora', 'Oswald', 'Orbitron', 'Bodoni Moda', 'Caveat']);
  const fam = f => `family=${f.replace(/ /g, '+')}${WGHT.has(f) ? ':wght@400;500;600;700' : ''}`;
  let C = null; // resolved context

  function preset(cfg) {
    const S = cfg.studio || {}; const P = S.presets || {};
    const id = P[S.preset] ? S.preset : Object.keys(P)[0];
    return Object.assign({ id }, P[id] || {});
  }
  /* theme for the current look: returns the vars + fonts actually used */
  function theme(cfg, look) {
    const S = cfg.studio || {}, B = cfg.brand || {};
    if (look === 'brand') {
      const p = preset(cfg), bc = B.colors || {};
      const t = Object.assign({}, p, { id: 'brand', label: 'My brand', orn: 'none', wm: 'logo' }, bc);
      const f = B.fonts || {}; if (f.display) { t.script = f.display; t.head = f.display; } if (f.body) t.body = f.body;
      return t;
    }
    const t = preset(cfg); const f = S.fonts || {};
    if (f.display) { t.script = f.display; t.head = f.head || t.head; } if (f.body) t.body = f.body;
    return Object.assign(t, S.colors || {});
  }
  function apply(cfg, root, look) {
    const t = theme(cfg, look); C = { cfg, look, t };
    const set = (k, v) => v && root.style.setProperty(k, v);
    set('--bg', t.bg); set('--bg2', t.bg2); set('--fade', t.bg); set('--text', t.text); set('--muted', t.muted); set('--line', t.line);
    set('--card', t.card); set('--card-solid', t.card); set('--acc', t.acc); set('--acc2', t.acc2); set('--on-acc', t.on);
    set('--st-script', `'${t.script}'`); set('--st-head', `'${t.head}'`); set('--font-display', `'${t.head}'`); set('--font-body', `'${t.body}'`);
    root.dataset.look = look; root.dataset.preset = t.id; root.dataset.orn = t.orn || 'none'; root.dataset.wm = t.wm || 'script';
    root.dataset.theme = t.mode === 'dark' ? 'dark' : 'light'; if (t.mode === 'dark') delete root.dataset.theme;
    root.style.colorScheme = t.mode === 'dark' ? 'dark' : 'light';
    const fams = [...new Set([t.script, t.head, t.body].filter(Boolean))];
    const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = `https://fonts.googleapis.com/css2?${fams.map(fam).join('&')}&display=swap`; document.head.appendChild(l);
    const g = document.querySelector('link[href="gold.css"]'); if (g) g.disabled = true; // the cinematic layer is the Art look only
    const mc = document.querySelector('meta[name=theme-color]'); if (mc) mc.content = t.bg;
    return t;
  }

  /* ---------- wordmark + header banner ---------- */
  function wordmark(cfg, look) {
    const B = cfg.brand || {};
    if (look === 'brand' && B.logo) return `<h1 class="st-h1"><img class="st-logo" src="${esc(B.logo)}" alt="${esc(String(cfg.title || '').replace(/\s*\((sample|demo)\)\s*$/i, ''))}" width="600" height="600"></h1>`;
    const sub = cfg.studio && cfg.studio.subline || cfg.vertical_label || '';
    return `<div class="st-wm"><h1 class="st-wm-t">${esc(cfg.studio && cfg.studio.wordmark || String(cfg.title || '').replace(/\s*\((sample|demo)\)\s*$/i, ''))}</h1>${sub ? `<span class="st-wm-s">${esc(sub)}</span>` : ''}</div>`;
  }
  function hero(x) {
    const { cfg, look, heroCTA, PORT } = x; const B = cfg.brand || {}, S = cfg.studio || {};
    const photo = look === 'brand' && B.header ? B.header : (S.banner_photo || cfg.cover || 'cover.jpg');
    const brandHeader = look === 'brand' && B.header;
    const meta = [PORT ? (cfg.availability || 'Books open') : (cfg.kind_label || ''), (cfg.location || {}).area || ''].filter(Boolean).join(' · ');
    return `<header class="st-hero">
      <div class="st-banner${brandHeader ? ' is-upload' : ''}${S.banner_plain && !brandHeader && !S.banner_photo ? ' is-plain' : ''}" style="--ph:url('${esc(photo)}')">${brandHeader ? '' : '<div class="st-orn" aria-hidden="true"></div>'}
        ${brandHeader ? '' : `<div class="st-mark">${wordmark(cfg, look)}</div>`}${look === 'brand' ? '<span class="st-up">Your header image</span>' : ''}</div>${brandHeader ? `<div class="st-mark st-mark-up">${wordmark(cfg, look)}</div>` : ''}
      <div class="st-under">${cfg.tagline ? `<p class="st-tag">${esc(cfg.tagline)}</p>` : ''}${meta ? `<p class="st-meta"><i></i>${esc(meta)}<i></i></p>` : ''}${heroCTA()}</div>
    </header>`;
  }
  /* section frame used by the Studio + My brand looks */
  function frame(name, inner, id, i) {
    return `<section class="st-sec" data-sec="${esc(id || '')}" data-name="${esc(name)}"><div class="st-sec-h"><span class="st-orn-s" aria-hidden="true"></span><h2>${esc(name)}</h2><span class="st-orn-s" aria-hidden="true"></span></div>${inner}</section>`;
  }

  /* ---------- modules (also used in the Art look, styled by the art theme) ---------- */
  function drop(x) {
    const { cfg } = x; const d = (cfg.studio || {}).drop || cfg.drop; if (!d || d.on === false || d.off) return '';
    const ph = d.photo || ((cfg.gallery || [])[1] || {}).src || cfg.cover || 'cover.jpg';
    const ends = d.ends ? new Date(d.ends) : null;
    return `<div class="st-drop" data-edit="drop"><div class="st-drop-ph" style="--ph:url('${esc(ph)}')"></div><div class="st-drop-in">
      <span class="st-drop-k">${esc(d.kicker || 'Flash Sale')}</span><b class="st-drop-t">${esc(d.title || '')}</b>${d.sub ? `<span class="st-drop-s">${esc(d.sub)}</span>` : ''}
      ${ends && ends > Date.now() ? `<span class="st-drop-c" data-countdown="${esc(d.ends)}"><span><b data-u="d">0</b>d</span><span><b data-u="h">00</b>h</span><span><b data-u="m">00</b>m</span><span><b data-u="s">00</b>s</span></span>` : ''}
      <button class="st-drop-go" ${cfg.booking_url && x.PORT ? 'data-book="' + esc(x.provider(cfg.booking_url).id) + '"' : 'data-act="scroll-book"'}>${esc(d.cta || (x.PORT ? 'Book the deal' : 'Get it'))}</button></div>
      <span class="st-gen">Auto-made from your info · edit in the hub</span></div>`;
  }
  function cats(cfg) {
    const S = cfg.studio || {}, svc = cfg.services || [], C2 = S.categories || [];
    if (S.flyers && S.flyers.length) return S.flyers;
    const used = new Set(); const out = C2.map(c => { const items = svc.filter((s, i) => !used.has(i) && c.match.some(m => s.name.toLowerCase().includes(m)) && used.add(i)); return { name: c.name, items }; }).filter(c => c.items.length);
    const rest = svc.filter((s, i) => !used.has(i)); if (rest.length) out.push({ name: out.length ? 'More' : 'Services', items: rest });
    return out;
  }
  const num = p => { const m = String(p || '').match(/\$\s?(\d+)/); return m ? +m[1] : null; };
  function flyers(x) {
    const { cfg } = x; const g = (cfg.gallery || []).map(i => i.src).concat([cfg.cover || 'cover.jpg']);
    let list;
    if (x.PORT) list = cats(cfg).map((c, i) => { const ps = c.items.map(s => num(s.price)).filter(v => v !== null); const lo = ps.length ? Math.min(...ps) : null;
      return { name: c.name, photo: c.photo || g[(i + 1) % g.length], badge: lo !== null ? `from $${lo}` : (c.items[0] || {}).price || '', items: c.items }; });
    else list = (cfg.studio || {}).flyers || musicFlyers(cfg, g);
    if (!list.length) return '';
    return `<div class="st-flyers"><nav class="st-fnav">${list.map((f, i) => `<a href="#fly-${i}">${esc(f.name)}</a>`).join('')}</nav>
      ${list.map((f, i) => `<article class="st-fly" id="fly-${i}" data-edit="flyer-${i}"><div class="st-fly-ph" style="--ph:url('${esc(f.photo)}')"><span class="st-fly-n">${esc(f.name)}</span>${f.badge ? `<span class="st-fly-b">${esc(f.badge)}</span>` : ''}</div>
        <ul class="st-fly-l">${(f.items || []).map(s => `<li><span><b>${esc(s.name)}</b>${s.time ? `<small>${esc(s.time)}${s.note ? ' · ' + esc(s.note) : ''}</small>` : s.note ? `<small>${esc(s.note)}</small>` : ''}</span><em>${esc(s.price || '')}</em>${x.PORT ? `<button class="st-fly-bk" data-book="${esc(x.provider(s.book_url || cfg.booking_url).id)}" aria-label="Book ${esc(s.name)}">Book</button>` : s.url ? `<a class="st-fly-bk" href="${esc(s.url)}" data-link="${esc(s.platform || 'link')}">${esc(s.cta || 'Open')}</a>` : ''}</li>`).join('')}</ul></article>`).join('')}</div>`;
  }
  const PN = { spotify: 'Spotify', apple_music: 'Apple Music', youtube: 'YouTube', amazon_music: 'Amazon Music', tidal: 'TIDAL', soundcloud: 'SoundCloud', twitch: 'Twitch', kick: 'Kick', bandcamp: 'Bandcamp', audiomack: 'Audiomack', deezer: 'Deezer' };
  function musicFlyers(cfg, g) {
    const out = [];
    if (cfg.release || cfg.featured) out.push({ name: cfg.layout === 'streamer' ? 'Watch live' : (cfg.featured || {}).type === 'video' ? 'Latest video' : 'New release', photo: cfg.cover || g[0], badge: (cfg.featured || {}).kicker || 'Out now', items: (cfg.links || []).slice(0, 3).map(l => ({ name: l.label || PN[l.platform] || l.platform, url: l.url, platform: l.platform, cta: 'Listen' })) });
    if ((cfg.merch || []).length) out.push({ name: 'Merch', photo: g[0], badge: 'Shop', items: cfg.merch.slice(0, 3).map(m => ({ name: m.name, note: m.kind, url: (cfg.store || {}).url || '#', platform: (cfg.store || {}).platform || 'shop', cta: 'Shop' })) });
    if ((cfg.shows || []).length) out.push({ name: 'Shows', photo: g[0], badge: `${cfg.shows.length} dates`, items: cfg.shows.slice(0, 3).map(s => ({ name: `${s.city || ''} · ${s.venue || ''}`, note: s.date, url: s.url || s.tickets || cfg.page_url || 'https://example.com/placeholder-tickets', platform: 'tickets', cta: 'Tickets' })) });
    if ((cfg.schedule || []).length) out.push({ name: 'This week', photo: g[0], badge: 'Schedule', items: cfg.schedule.filter(s => !s.off).slice(0, 4).map(s => ({ name: `${s.day} · ${s.title}`, note: s.time })) });
    if (cfg.takes_bookings) out.push({ name: cfg.layout === 'streamer' ? 'Sponsors' : 'Features & shows', photo: g[0], badge: 'Book me', items: [{ name: cfg.layout === 'streamer' ? 'Brand partnership' : 'Feature verse / hook', note: 'Send the details' }, { name: cfg.layout === 'streamer' ? 'Sponsored stream' : 'Live show', note: 'Use the Book me form' }] });
    return out;
  }
  function infocards(x) {
    const { cfg } = x; const L = (cfg.studio || {}).cards || []; if (!L.length) return '';
    return `<div class="st-cards" role="list">${L.map((c, i) => `<article class="st-card" role="listitem" data-edit="card-${i}"><div class="st-card-h"><span class="st-card-o" aria-hidden="true"></span><h3>${esc(c.title)}</h3><span class="st-card-rule" aria-hidden="true"></span></div>
      ${c.qa ? `<dl>${c.qa.map(q => `<dt>${esc(q[0])}</dt><dd>${esc(q[1])}</dd>`).join('')}</dl>` : `<ul>${(c.items || []).map(t => `<li>${esc(t)}</li>`).join('')}</ul>`}</article>`).join('')}</div>
      <div class="st-dots" aria-hidden="true">${L.map((_, i) => `<i${i ? '' : ' class="on"'}></i>`).join('')}</div>`;
  }
  function brandblocks(x) {
    const G = ((x.cfg.brand || {}).graphics || []).filter(g => g && g.src); if (!G.length) return '';
    return `<div class="st-gfx">${G.map(g => `<figure class="st-gfx-i">${g.link ? `<a href="${esc(g.link)}" data-link="link">` : ''}<img src="${esc(g.src)}" alt="${esc(g.alt || 'Graphic')}" loading="lazy">${g.link ? '</a>' : ''}${g.caption ? `<figcaption>${esc(g.caption)}</figcaption>` : ''}</figure>`).join('')}</div>`;
  }
  function wire() {
    document.querySelectorAll('.st-cards').forEach(row => { const dots = row.nextElementSibling; if (!dots) return;
      row.addEventListener('scroll', () => { const i = Math.round(row.scrollLeft / (row.firstElementChild.offsetWidth + 12)); [...dots.children].forEach((d, k) => d.classList.toggle('on', k === i)); }, { passive: true }); });
    document.querySelectorAll('.st-fnav a').forEach(a => a.addEventListener('click', e => { e.preventDefault(); const t = document.querySelector(a.getAttribute('href')); t && t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }));
  }
  return { apply, theme, preset, hero, frame, drop, flyers, infocards, brandblocks, wire, wordmark };
})();
