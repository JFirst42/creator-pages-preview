/* Creator hub DEMO. No real auth: "Continue as ..." just picks a sample account. No passwords are asked for or stored.
   Edits are saved to localStorage (cp-hub-<account>) and the phone preview loads the real page with ?hub=1, which applies them.
   All analytics, fans and requests are generated SAMPLE data. See README "Creator hub: architecture" for the real version. */
(function () {
  const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const toast = m => { const t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('on'), 2600); };
  const qs = new URLSearchParams(location.search);
  const TIERS = ['bronze', 'silver', 'gold'], TL = { bronze: 'Bronze', silver: 'Silver', gold: 'Gold' };
  const rank = t => TIERS.indexOf(t);
  let D, S = { acct: null, tier: 'gold', tab: 'editor', range: 30 };
  try { S = Object.assign(S, JSON.parse(sessionStorage.getItem('cp-hub-ui') || '{}')); } catch (e) {}
  if (qs.get('acct')) S.acct = qs.get('acct'); if (qs.get('tier')) S.tier = qs.get('tier'); if (qs.get('tab')) S.tab = qs.get('tab');
  if (qs.has('logout')) S.acct = null;
  const saveUI = () => sessionStorage.setItem('cp-hub-ui', JSON.stringify(S));
  const A = () => D.accounts[S.acct];
  const F = () => D.tierFeatures[S.tier];
  const KEY = () => 'cp-hub-' + S.acct;
  const loadEdits = () => { try { return JSON.parse(localStorage.getItem(KEY()) || 'null'); } catch (e) { return null; } };
  const cur = () => Object.assign({}, JSON.parse(JSON.stringify(A().base)), loadEdits() || {});
  const lockBox = (need, what) => `<div class="lock"><span>${what}</span><button data-up="${need}">Upgrade to ${TL[need]}</button></div>`;

  fetch('data.json').then(r => r.json()).then(d => { D = d; if (S.acct && !D.accounts[S.acct]) S.acct = null; render(); });

  function render() {
    saveUI();
    const root = $('#hub');
    if (!S.acct) { root.innerHTML = login(); return; }
    const a = A();
    const showReq = a.service || a.takes_bookings;
    if (S.tab === 'requests' && !showReq) S.tab = 'editor';
    const newReq = (reqState().filter(r => r.status === 'new')).length;
    root.innerHTML = `<div class="wrap"><div class="hd"><div class="who"><img src="${esc(a.avatar)}" alt=""><div><b>${esc(a.label)}</b><small>${esc(a.sub)} · demo account</small></div></div>
      <div class="tseg" role="group" aria-label="Plan (demo switcher)">${TIERS.map(t => `<button data-t="${t}" class="${S.tier === t ? 'on' : ''}">${TL[t]}</button>`).join('')}</div>
      <button class="out" data-act="logout">Log out (demo)</button></div>
      <nav class="tabs">${[['editor', 'Page editor'], ['analytics', 'Analytics'], ...(showReq ? [['requests', 'Requests']] : []), ['fans', 'Fans'], ['billing', 'Plan & billing']].map(([k, l]) => `<button data-tab="${k}" class="${S.tab === k ? 'on' : ''}">${l}${k === 'requests' && newReq && rank(S.tier) >= 1 ? `<span class="n">${newReq}</span>` : ''}</button>`).join('')}</nav>
      <section id="pane">${({ editor, analytics, requests, fans, billing })[S.tab]()}</section></div>`;
    wire();
  }

  function login() {
    const a = D.accounts['holy-hails'];
    return `<div class="login"><div class="box"><div class="logo">Creator<i>Pages</i> hub</div><div class="badge">Demo · no real login</div>
      <p>This is a clickable demo of the logged-in dashboard. There is no password and nothing is checked. Your edits stay in this browser.</p>
      <button class="bigbtn" data-login="holy-hails"><img src="${esc(a.avatar)}" alt="">Continue as Holy Hails (demo)</button>
      <div class="alt">Sample accounts: <button data-login="marrow-ink">Marrow &amp; Ink (tattoo)</button>·<button data-login="lash-nia">Lash Studio by Nia</button></div>
      <p class="fine" style="margin:16px 0 0">Real version: sign in with your Whop membership (no separate password here).</p></div></div>`;
  }

  /* ---------------- editor ---------------- */
  function editor() {
    const a = A(), c = cur(), f = F();
    const isPort = a.layout === 'portfolio';
    const FEAT = isPort ? [['book', 'Book now']] : a.layout === 'streamer' ? [['live', 'Live stream'], ['video', 'Latest video'], ['merch', 'Merch / beats link']] : [['release', 'New release'], ['video', 'Latest video'], ['live', 'Live stream'], ['merch', 'Merch / beats link']];
    const PLAT = ['spotify', 'apple_music', 'youtube', 'soundcloud', 'tidal', 'amazon_music', 'bandcamp', 'tiktok', 'instagram', 'twitch', 'kick', 'discord', 'x', 'shopify', 'beatstars'];
    const links = (c.links || []).map((l, i) => `<div class="row" style="margin-bottom:6px"><select class="in" data-li="${i}" data-k="platform" style="flex:0 0 118px">${[...new Set([l.platform, ...PLAT])].map(p => `<option ${p === l.platform ? 'selected' : ''}>${esc(p)}</option>`).join('')}</select><input class="in" type="url" data-li="${i}" data-k="url" value="${esc(l.url)}" placeholder="https://..."><button class="mini" data-act="rmlink" data-i="${i}" aria-label="Remove">✕</button></div>`).join('');
    return `<div class="ed"><div class="pv"><div class="phone"><iframe id="pvf" title="Live preview" src="${esc(a.pages[S.tier])}?hub=1&nointro=1"></iframe></div>
        <div class="pv-side"><b>Live preview</b><span>${TL[S.tier]} page · updates as you type</span><span class="pill">Preview only</span><span>Edits apply only in this browser's preview (?hub=1). The public page doesn't change in the demo.</span><button class="mini" data-act="reset">Reset edits</button><a class="mini" style="display:grid;place-items:center;text-decoration:none;color:var(--text)" href="${esc(a.pages[S.tier])}?hub=1" target="_blank">Open full page ↗</a></div></div>
      <div style="display:grid;gap:12px">
      <div class="box"><h3>Text</h3><div class="f"><label>Page title</label><input class="in" data-k="title" value="${esc(c.title)}"></div><div class="f"><label>Tagline <small>pick a preset</small></label><select class="in" data-k="tagline">${[...new Set([c.tagline || '', ...a.taglines])].map(t => `<option value="${esc(t)}" ${t === (c.tagline || '') ? 'selected' : ''}>${esc(t || 'No tagline')}</option>`).join('')}</select></div><p class="fine">Structured on purpose: name and links are typed, everything else is picked. Gold can ask for more in the review note.</p></div>
      <div class="box"><h3>Featured first <small>drives the hero buttons</small></h3><div class="f"><select class="in" data-k="feature_first">${FEAT.map(([v, l]) => `<option value="${v}" ${c.feature_first === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
        ${isPort ? `<p class="fine">Book-now uses your booking link: ${esc(a.booking_label || '')}</p>` : `<div class="f"><label>Featured item</label><select class="in" data-fk="title">${[...new Set([(c.featured || {}).title || '', ...a.featureTitles])].filter(Boolean).map(t => `<option ${t === (c.featured || {}).title ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select></div><div class="f"><label>Featured link <small>URL</small></label><input class="in" type="url" data-fk="url" value="${esc((c.featured || {}).url || '')}"></div>`}</div>
      <div class="box"><h3>Links <small>${(c.links || []).length} links</small></h3>${links}<button class="mini" data-act="addlink">+ Add link</button></div>
      <div class="box"><h3>Sections <small>${S.tier === 'gold' ? 'drag to reorder · toggle on/off' : S.tier === 'silver' ? 'preset · a few show/hide toggles' : 'fixed preset'}</small></h3>${sectionsUI(c)}</div>
      <div class="box"><h3>Theme <small>auto-matched to your art</small></h3>${rank(S.tier) >= 1 ? `<div class="colors"><label><input type="color" data-pal="acc" value="${esc((c.palette_override || {}).acc || a.palette.acc)}">Accent</label><label><input type="color" data-pal="acc2" value="${esc((c.palette_override || {}).acc2 || a.palette.acc2)}">Accent 2</label><button class="mini" data-act="palreset">Use art colors</button></div>` : lockBox('silver', 'Palette tweaks are Silver+. Bronze uses the colors from your art.')}</div>
      <div class="box"><h3>Hero background</h3>${f.heroVideoBg ? `<div class="row">${[['art3d', '3D art'], ['video', 'Video loop']].map(([v, l]) => `<label class="sw-row" style="flex:1"><input type="radio" name="herobg" value="${v}" ${(c.hero_bg || 'art3d') === v ? 'checked' : ''}> ${l}</label>`).join('')}</div><p class="fine">Fans can still flip it with the small toggle on the hero.</p>` : lockBox('gold', 'The 3D art / video hero is Gold.')}</div>
      <div class="box"><h3>Tip button <small>links out · no payments on the page</small></h3>${f.tipButton ? tipUI(c) : lockBox('silver', 'The Tip button is Silver and Gold.')}</div>
      </div></div>`;
  }
  function sectionsUI(c) {
    const a = A(), names = D.sections, rel = a.relevant;
    const allowed = new Set([...rel.core, ...rel.optional, ...(a.takes_bookings ? rel.bookings || [] : [])]);
    if (S.tier === 'bronze') return `<p class="fine" style="margin-bottom:8px">Bronze shows: ${esc(a.bronzeShows)}</p>` + lockBox('silver', 'Show/hide sections on Silver; add, remove and reorder any section on Gold.');
    if (S.tier === 'silver') {
      const tg = D.silverToggles[a.layout] || [], st = c.section_toggles || {};
      return tg.filter(id => allowed.has(id)).map(id => `<div class="sw-row"><b>${esc(names[id])}</b><span class="sw"><input type="checkbox" data-tg="${id}" ${st[id] === false ? '' : 'checked'}><i></i></span></div>`).join('') + lockBox('gold', 'Reorder, add and remove any section with Gold.');
    }
    const list = (c.sections || []).filter(s => allowed.has(s.id));
    const unused = [...allowed].filter(id => !list.some(s => s.id === id));
    const tag = id => rel.core.includes(id) ? '' : rel.optional.includes(id) ? '<small>optional</small>' : '<small>bookings</small>';
    return `<div class="secs" id="secs">${list.map((s, i) => `<div class="sr" draggable="true" data-i="${i}" data-id="${s.id}"><span class="grip" aria-hidden="true">⠿</span><b>${esc(names[s.id])}${tag(s.id)}</b><span class="ud"><button data-mv="-1" data-i="${i}" aria-label="Move up">↑</button><button data-mv="1" data-i="${i}" aria-label="Move down">↓</button></span><span class="sw"><input type="checkbox" data-son="${i}" ${s.on !== false ? 'checked' : ''} aria-label="Show ${esc(names[s.id])}"><i></i></span></div>`).join('')}</div>
      ${unused.length ? `<div class="add"><select class="in" id="addsec">${unused.map(id => `<option value="${id}">${esc(names[id])}${rel.core.includes(id) ? '' : ' (optional)'}</option>`).join('')}</select><button class="mini acc" data-act="addsec">Add more</button></div>` : ''}
      <p class="fine" style="margin-top:8px">Only sections that fit a ${esc(a.verticalLabel)} are listed${a.service ? '' : (a.takes_bookings ? ' (bookings on)' : '. Booking appears if you turn on "I take bookings / features"')}.</p>`;
  }
  const TIPM = [['cashapp', 'Cash App', '$cashtag'], ['paypal', 'PayPal.me', 'username'], ['venmo', 'Venmo', '@username'], ['zelle', 'Zelle', 'email or phone (shown + copy)'], ['kofi', 'Ko-fi', 'username'], ['bmc', 'Buy Me a Coffee', 'username'], ['stripe', 'Stripe payment link', 'https://buy.stripe.com/...']];
  function tipUI(c) {
    const m = c.tip_methods || [];
    return TIPM.map(([t, l, ph]) => { const x = m.find(y => y.type === t); return `<div class="row" style="margin-bottom:6px"><span class="sw"><input type="checkbox" data-tipon="${t}" ${x && x.on !== false ? 'checked' : ''}><i></i></span><b style="flex:0 0 112px;font-size:12.5px">${l}</b><input class="in" data-tiph="${t}" placeholder="${esc(ph)}" value="${esc(x ? x.handle : '')}"></div>`; }).join('') + '<p class="fine">Fans see a small Tip chip that opens these. Clicks are tracked per app.</p>';
  }
  let pvT;
  function save(patch, now) {
    const e = Object.assign(loadEdits() || {}, patch); localStorage.setItem(KEY(), JSON.stringify(e));
    clearTimeout(pvT); pvT = setTimeout(() => { const f = $('#pvf'); if (f) { const y = (() => { try { return f.contentWindow.scrollY; } catch (x) { return 0; } })(); f.onload = () => { try { f.contentWindow.scrollTo(0, y); } catch (x) {} }; f.contentWindow.location.reload(); } }, now ? 0 : 450);
  }

  /* ---------------- analytics (SAMPLE) ---------------- */
  function rng(seed) { let s = 0; for (const ch of seed) s = (s * 31 + ch.charCodeAt(0)) >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
  function sample() {
    const r = rng(S.acct), a = A(), days = 30;
    const daily = Array.from({ length: days }, (_, i) => Math.round((a.service ? 90 : 260) * (0.6 + i / days * 0.7) * (0.75 + r() * 0.5) * (i === a.spikeDay ? 2.4 : 1)));
    const views = daily.reduce((x, y) => x + y, 0), clicks = Math.round(views * (0.38 + r() * .1));
    const pick = (arr, tot) => { const w = arr.map(() => r() + .25), sm = w.reduce((x, y) => x + y); return arr.map((n, i) => [n, Math.round(tot * w[i] / sm)]).sort((x, y) => y[1] - x[1]); };
    return {
      daily, views, clicks, fans: Math.round(views * .045), ctr: Math.round(clicks / views * 100),
      links: pick(a.topLinks, clicks), sources: pick(['Instagram', 'TikTok', 'Direct', 'QR code', 'X', 'Google'], views),
      sections: pick(a.sectionIds.map(id => D.sections[id]), views).map(([n, v]) => [n, v, Math.round(8 + r() * 40)]),
      depth: [[25, 92], [50, 71], [75, 48], [100, 29]].map(([d, p]) => [d, Math.round(p * (0.9 + r() * .15))]),
      share: pick(['Story 9:16', 'Post 1:1', 'Link card', 'Sticker', 'Animated story'], Math.round(views * .03)), storyShares: Math.round(views * .018),
      tips: pick(a.tipMethods.length ? a.tipMethods : ['Cash App', 'PayPal'], Math.round(views * .012)),
      cities: pick(a.cities, views), countries: pick(['United States', 'Canada', 'United Kingdom', 'Germany', 'Brazil'], views),
      devices: pick(['iPhone', 'Android', 'Desktop', 'iPad'], views), refs: pick(['instagram.com', 'tiktok.com', 'l.facebook.com', 't.co (X)', 'google.com', 'linktr.ee'], views),
      qr: Math.round(views * .06), hours: Array.from({ length: 24 }, (_, h) => Math.max(.05, Math.sin((h - 8) / 24 * Math.PI * 2 - .9) * .5 + .5 + r() * .15)),
      release: Array.from({ length: 24 }, (_, h) => Math.round((h < 1 ? 380 : 600 * Math.exp(-h / 6)) * (0.8 + r() * .4)))
    };
  }
  function bars(rows, fmt) { const mx = Math.max(...rows.map(x => x[1]), 1); return `<div class="bars">${rows.map(x => `<div class="bar"><span>${esc(x[0])}</span><i style="width:${Math.max(4, x[1] / mx * 100)}%"></i><b>${fmt ? fmt(x) : x[1].toLocaleString()}</b></div>`).join('')}</div>`; }
  function line(data) { const W = 600, H = 130, mx = Math.max(...data) * 1.1, st = W / (data.length - 1); const pts = data.map((v, i) => `${(i * st).toFixed(1)},${(H - v / mx * H).toFixed(1)}`).join(' ');
    return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><defs><linearGradient id="lg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#ffd23f" stop-opacity=".45"/><stop offset="1" stop-color="#ffd23f" stop-opacity="0"/></linearGradient></defs><polygon points="0,${H} ${pts} ${W},${H}" fill="url(#lg)"/><polyline points="${pts}" fill="none" stroke="#ffd23f" stroke-width="2.5" vector-effect="non-scaling-stroke"/></svg>`; }
  function card(title, need, body, right) {
    const locked = rank(S.tier) < rank(need);
    return `<div class="c${locked ? ' locked' : ''}"><h4>${title}${right ? `<small>${right}</small>` : ''}</h4><div class="body">${body}</div>${locked ? `<div class="up">🔒 <span><b>${TL[need]}</b> shows ${title.toLowerCase()}</span><button class="mini acc" data-up="${need}" style="margin-left:auto">Upgrade</button></div>` : ''}</div>`;
  }
  function analytics() {
    const x = sample(), a = A(), rngd = rank(S.tier) >= 1 ? S.range : 30, d = x.daily.slice(-rngd), v = d.reduce((p, q) => p + q, 0);
    let local = {}; try { local = JSON.parse(localStorage.getItem('cp-stats-' + S.acct) || '{}'); } catch (e) {}
    const lk = Object.entries(local);
    return `<div class="toolbar"><span class="sample">Sample data</span>${rank(S.tier) >= 1 ? `<div class="rng">${[7, 30].map(n => `<button data-rng="${n}" class="${S.range === n ? 'on' : ''}">${n} days</button>`).join('')}</div>` : '<span class="fine">Last 30 days</span>'}${S.tier === 'gold' ? '<button class="mini acc" data-act="csv">Export CSV</button>' : ''}</div>
      <div class="kp"><div class="k"><b>${v.toLocaleString()}</b><small>Total views</small><em>▲ 18%</em></div><div class="k"><b>${Math.round(v * x.ctr / 100).toLocaleString()}</b><small>Total clicks</small><em>▲ 9%</em></div>
      ${rank(S.tier) >= 1 ? `<div class="k"><b>${Math.round(x.fans * rngd / 30).toLocaleString()}</b><small>Fan signups</small><em>▲ 31%</em></div><div class="k"><b>${x.ctr}%</b><small>Click-through</small></div>` : ''}</div>
      ${S.tier === 'bronze' ? `<div class="lock" style="margin-bottom:12px"><span>Bronze shows total views and clicks. Silver adds top links, sources, a 7/30-day chart and fan signups; Gold shows everything.</span><button data-up="silver">See Silver</button></div>` : ''}
      <div class="grid">
      ${card('Views over time', 'silver', `<div class="chart">${line(d)}</div>`, `${rngd} days`)}
      ${card('Top links', 'silver', bars(x.links))}
      ${card('Traffic sources', 'silver', bars(x.sources))}
      ${card('Fan signups', 'silver', `<div class="chart">${line(d.map(n => Math.round(n * .045)))}</div>`, `${Math.round(x.fans * rngd / 30)} new`)}
      ${card('Per-section engagement', 'gold', bars(x.sections, r => `${r[2]}s`), 'avg time in view')}
      ${card('Scroll depth', 'gold', bars(x.depth.map(([dd, p]) => [`Reached ${dd}%`, p]), r => r[1] + '%'))}
      ${card('Share studio by template', 'gold', bars(x.share), `${x.storyShares} story shares`)}
      ${card('Tip clicks by app', 'gold', bars(x.tips))}
      ${card('Top cities', 'gold', bars(x.cities))}
      ${card('Countries', 'gold', bars(x.countries))}
      ${card('Devices', 'gold', bars(x.devices))}
      ${card('Referrers', 'gold', bars(x.refs), 'incl. IG + TikTok')}
      ${card('QR scans', 'gold', `<div class="k" style="border:0;padding:0"><b>${x.qr.toLocaleString()}</b><small>scans from posters, merch tables, studio cards</small></div>`)}
      ${card('Peak hours', 'gold', `<div class="heat">${x.hours.map(h => `<i style="opacity:${(.15 + h * .85).toFixed(2)}"></i>`).join('')}</div><div class="heatl"><span>12a</span><span>6a</span><span>12p</span><span>6p</span><span>11p</span></div>`, 'ET')}
      ${card(a.service ? 'Booking-link day breakdown' : 'Release-day breakdown', 'gold', `<div class="chart">${line(x.release)}</div><p class="fine">${a.service ? 'Views by hour on the day the flash drop / opening went live' : 'Views by hour, first 24h after release'}</p>`)}
      ${card('Live hooks from this browser', 'gold', lk.length ? bars(lk.slice(0, 8)) : '<p class="fine">Click things on the preview page (tip, links, share, sections) and they show up here. These are the real event hooks, counted locally in the demo.</p>', 'not sample')}
      </div>`;
  }
  function csv() {
    const x = sample(), rows = [['metric', 'key', 'value']];
    x.daily.forEach((v, i) => rows.push(['views_daily', `day_${i + 1}`, v]));
    [['top_links', x.links], ['sources', x.sources], ['section_views', x.sections], ['share_templates', x.share], ['tip_clicks', x.tips], ['cities', x.cities], ['countries', x.countries], ['devices', x.devices], ['referrers', x.refs]].forEach(([m, L]) => L.forEach(r => rows.push([m, r[0], r[1]])));
    x.depth.forEach(r => rows.push(['scroll_depth_pct', r[0], r[1]])); rows.push(['qr_scans', 'total', x.qr]);
    dl(`${S.acct}-analytics-SAMPLE.csv`, rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')); toast('Sample analytics CSV downloaded');
  }
  const dl = (name, text, type) => { const l = document.createElement('a'); l.href = URL.createObjectURL(new Blob([text], { type: type || 'text/csv' })); l.download = name; l.click(); };

  /* ---------------- requests inbox (SAMPLE) ---------------- */
  function reqState() { const a = A(); let st = {}; try { st = JSON.parse(localStorage.getItem('cp-hub-req-' + S.acct) || '{}'); } catch (e) {} return (a.requests || []).map(r => Object.assign({}, r, st[r.id] || {})); }
  function setReq(id, patch) { let st = {}; try { st = JSON.parse(localStorage.getItem('cp-hub-req-' + S.acct) || '{}'); } catch (e) {} st[id] = Object.assign(st[id] || {}, patch); localStorage.setItem('cp-hub-req-' + S.acct, JSON.stringify(st)); }
  function requests() {
    const a = A(), L = reqState();
    if (S.tier === 'bronze') return lockBox('silver', a.service ? 'Bronze sends people to your booking app (Book now button). Request forms are Silver; the full intake + this inbox are Gold.' : 'Booking requests are Silver+; the inbox with accept / decline / propose is Gold.');
    const full = S.tier === 'gold';
    return `<div class="toolbar"><span class="sample">Sample requests</span><span class="fine">${full ? 'Accept sends a confirmation + .ics; nothing is booked on Booksy/Square for you.' : 'Silver: short requests land here and in your email.'}</span></div>
      ${full ? '' : lockBox('gold', 'Accept / decline / propose a time, confirmation emails and .ics invites are Gold.')}
      <div class="rq" style="margin-top:10px">${L.map(r => `<article class="r" data-rid="${r.id}"><div class="r-h"><div><b>${esc(r.name)}</b><small>${esc(r.service)} · received ${esc(r.received)}</small></div><span class="st ${r.status}">${r.status}${r.proposed ? ' · ' + esc(r.proposed) : ''}</span></div>
        <dl>${r.fields.filter(f => full || f[2] !== 'gold').map(f => `<dt>${esc(f[0])}</dt><dd>${esc(f[1])}</dd>`).join('')}</dl>
        ${full && r.refs && r.refs.length ? `<div class="refs">${r.refs.map(s => `<img src="${esc(s)}" alt="Reference">`).join('')}</div>` : ''}
        ${full ? `<div class="acts"><button class="mini ok" data-ra="accept">Accept</button><button class="mini" data-ra="propose">Propose time</button><button class="mini no" data-ra="decline">Decline</button>${r.status === 'accepted' ? '<button class="mini" data-ra="ics">.ics</button>' : ''}</div>
        <div class="prop"><input class="in" type="datetime-local" value="${esc(r.suggest)}"><button class="mini acc" data-ra="send-prop">Send</button></div>` : ''}</article>`).join('')}</div>`;
  }
  function ics(r) {
    const s = (r.when || r.suggest).replace(/[-:]/g, '') + '00', d = new Date(r.when || r.suggest); const e = new Date(d.getTime() + (r.hours || 2) * 36e5);
    const f = x => `${x.getFullYear()}${String(x.getMonth() + 1).padStart(2, '0')}${String(x.getDate()).padStart(2, '0')}T${String(x.getHours()).padStart(2, '0')}${String(x.getMinutes()).padStart(2, '0')}00`;
    return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//CreatorPages demo//EN', 'BEGIN:VEVENT', `UID:${r.id}@creatorpages.example`, `DTSTAMP:${f(new Date())}`, `DTSTART;TZID=America/Detroit:${s.slice(0, 15)}`, `DTEND;TZID=America/Detroit:${f(e)}`, `SUMMARY:${r.service} with ${A().label} (SAMPLE)`, `DESCRIPTION:Demo invite. Deposit is paid on the artist's booking page.`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  }
  function mail(to, subject, body) {
    document.body.insertAdjacentHTML('beforeend', `<div class="modal" data-close="1"><div class="mc"><div class="row" style="justify-content:space-between;margin-bottom:8px"><b>Email preview</b><button class="mini" data-close="1">Close</button></div>
      <div class="mail-h"><small>From</small> ${esc(A().label)} via CreatorPages<br><small>To</small> ${esc(to)}<br><small>Subject</small> ${esc(subject)}</div><div class="mail-b">${body}</div><p class="fine">Demo preview · no email was sent</p></div></div>`);
  }

  /* ---------------- fans ---------------- */
  function fans() {
    if (S.tier === 'bronze') return lockBox('silver', 'Fan email/SMS capture and CSV export are Silver and Gold.');
    const a = A(), r = rng(S.acct + 'f'); const first = ['ari', 'bri', 'cam', 'dee', 'eli', 'fay', 'gio', 'hana', 'ivy', 'jules', 'kai', 'lu', 'mo', 'nia'];
    let local = []; try { local = JSON.parse(localStorage.getItem('cp_fans_' + a.slugs[S.tier]) || '[]'); } catch (e) {}
    const rows = [...local.map(f => [f.contact, f.channel, f.at.slice(0, 10), 'this browser']), ...first.map((n, i) => [i % 4 === 3 ? `(555) 555-01${String(10 + i)}` : `${n}${Math.floor(r() * 90 + 10)}@example.com`, i % 4 === 3 ? 'sms' : 'email', `2026-11-${String(16 - i).padStart(2, '0')}`, ['Instagram', 'TikTok', 'QR code', 'Direct'][i % 4]])];
    window._fans = rows;
    return `<div class="toolbar"><span class="sample">Sample list</span><span class="fine">${rows.length} contacts · consent + unsubscribe in the real version</span><button class="mini acc" data-act="fancsv">Export CSV</button></div>
      <div class="box" style="padding:4px 10px;overflow-x:auto"><table><thead><tr><th>Contact</th><th>Channel</th><th>Joined</th><th>Source</th></tr></thead><tbody>${rows.map(x => `<tr>${x.map(c => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  }
  /* ---------------- billing ---------------- */
  function billing() {
    const names = D.featureNames, tf = D.tierFeatures;
    const top = t => Object.keys(tf[t]).filter(k => tf[t][k] === true && (t === 'bronze' || tf[TIERS[rank(t) - 1]][k] !== true) && names[k]).slice(0, 7).map(k => names[k][0]);
    return `<div class="box" style="margin-bottom:12px"><h3>Your plan: ${TL[S.tier]} <small>demo</small></h3><p class="fine" style="margin-bottom:10px">Membership, payment and invoices live on Whop. This hub never sees your card.</p><button class="bigbtn" data-act="whop" style="height:46px;font-size:14px">Manage plan on Whop ↗</button></div>
      <div class="plans">${TIERS.map(t => `<div class="plan${t === S.tier ? ' cur' : ''}"><h4>${TL[t]}</h4><span class="fine">${esc(D.tierTaglines[t])}</span><ul>${(t === 'bronze' ? [] : [`Everything in ${TL[TIERS[rank(t) - 1]]}`]).concat(top(t)).map(x => `<li>${esc(x)}</li>`).join('')}</ul>${t === S.tier ? '<span class="pill">Current plan</span>' : `<button class="mini acc" data-up="${t}">${rank(t) > rank(S.tier) ? 'Upgrade' : 'Switch'} on Whop</button>`}</div>`).join('')}</div>
      <p class="fine" style="margin-top:10px">Prices are set on Whop (placeholder: no live Whop link in this demo).</p>`;
  }

  /* ---------------- wiring ---------------- */
  function wire() {
    const P = $('#pane');
    P.addEventListener('input', e => {
      const t = e.target, c = cur();
      if (t.type === 'url') { const okU = !t.value || /^(https:\/\/[^\s]+|#placeholder[\w-]*)$/i.test(t.value); t.style.borderColor = okU ? '' : '#ff6b6b'; if (!okU) return; }
      if (t.tagName === 'SELECT' && t.dataset.k === 'tagline') return;
      if (t.dataset.k && !t.dataset.li) save({ [t.dataset.k]: t.value });
      if (t.dataset.fk) save({ featured: Object.assign({}, c.featured || {}, { [t.dataset.fk]: t.value }) });
      if (t.dataset.li) { const L = JSON.parse(JSON.stringify(c.links || [])); L[+t.dataset.li][t.dataset.k] = t.value; save({ links: L }); }
      if (t.dataset.pal) save({ palette_override: Object.assign({}, c.palette_override || {}, { [t.dataset.pal]: t.value }) });
      if (t.dataset.tiph !== undefined && t.dataset.tiph) { const m = (c.tip_methods || []).filter(x => x.type !== t.dataset.tiph); if (t.value) m.push({ type: t.dataset.tiph, handle: t.value, on: true }); save({ tip_methods: m }); const cb = $(`[data-tipon=${t.dataset.tiph}]`); if (cb) cb.checked = !!t.value; }
    });
    P.addEventListener('change', e => {
      const t = e.target, c = cur();
      if (t.dataset.tg) save({ section_toggles: Object.assign({}, c.section_toggles || {}, { [t.dataset.tg]: t.checked }) }, true);
      if (t.dataset.son !== undefined) { const L = c.sections.filter(s => allowedSet().has(s.id)); L[+t.dataset.son].on = t.checked; save({ sections: L }, true); }
      if (t.name === 'herobg') save({ hero_bg: t.value }, true);
      if (t.dataset.tipon) { const m = (c.tip_methods || []).map(x => x.type === t.dataset.tipon ? Object.assign({}, x, { on: t.checked }) : x); if (t.checked && !m.some(x => x.type === t.dataset.tipon)) { toast('Add a handle to turn this on'); t.checked = false; } save({ tip_methods: m }, true); }
      if (t.dataset.k === 'feature_first') save({ feature_first: t.value }, true);
      if (t.dataset.k === 'tagline') save({ tagline: t.value }, true);
      if (t.dataset.fk === 'title') save({ featured: Object.assign({}, c.featured || {}, { title: t.value }) }, true);
    });
    P.addEventListener('click', e => {
      const b = e.target.closest('button,[data-ra]'); if (!b) return; const c = cur();
      if (b.dataset.mv) { const L = c.sections.filter(s => allowedSet().has(s.id)), i = +b.dataset.i, j = i + +b.dataset.mv; if (j < 0 || j >= L.length) return; [L[i], L[j]] = [L[j], L[i]]; save({ sections: L }, true); render(); }
      if (b.dataset.act === 'addsec') { const id = $('#addsec').value, L = c.sections.filter(s => allowedSet().has(s.id)); L.push({ id, on: true }); save({ sections: L }, true); render(); toast(`${D.sections[id]} added`); }
      if (b.dataset.act === 'addlink') { save({ links: [...(c.links || []), { platform: 'instagram', url: 'https://instagram.com/PLACEHOLDER' }] }, true); render(); }
      if (b.dataset.act === 'rmlink') { const L = [...c.links]; L.splice(+b.dataset.i, 1); save({ links: L }, true); render(); }
      if (b.dataset.act === 'palreset') { save({ palette_override: null }, true); render(); }
      if (b.dataset.act === 'reset') { localStorage.removeItem(KEY()); render(); toast('Edits cleared'); }
      if (b.dataset.act === 'csv') csv();
      if (b.dataset.act === 'fancsv') { dl(`${S.acct}-fans-SAMPLE.csv`, [['contact', 'channel', 'joined', 'source'], ...window._fans].map(r => r.map(x => `"${x}"`).join(',')).join('\n')); toast('Fan list CSV downloaded'); }
      if (b.dataset.act === 'whop') toast('Placeholder: opens the creator\'s Whop membership page');
      if (b.dataset.rng) { S.range = +b.dataset.rng; render(); }
      const ra = b.dataset.ra; if (ra) {
        const id = b.closest('[data-rid]').dataset.rid, r = reqState().find(x => x.id === id);
        if (ra === 'accept') { setReq(id, { status: 'accepted', when: r.suggest, proposed: '' }); render(); mail(r.email, `Booked: ${r.service} (request accepted)`, `<p>Hi ${esc(r.name.split(' ')[0])},</p><p>Your request is accepted for <b>${esc(new Date(r.suggest).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }))} ET</b>. A calendar invite (.ics) is attached.</p><p>To hold the spot, pay the deposit on ${esc(A().booking_label)} (link). Nothing is charged by this page.</p><p>Reminders: 2 days and 2 hours before${r.remind ? '' : ' (they opted out)'}.</p>`); }
        if (ra === 'decline') { setReq(id, { status: 'declined', proposed: '' }); render(); mail(r.email, 'About your request', `<p>Hi ${esc(r.name.split(' ')[0])},</p><p>Thanks for reaching out. I can't take this one right now. Watch the page for the next opening.</p>`); }
        if (ra === 'propose') b.closest('.r').querySelector('.prop').classList.toggle('on');
        if (ra === 'send-prop') { const v = b.previousElementSibling.value; setReq(id, { status: 'proposed', proposed: new Date(v).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric' }), suggest: v }); render(); mail(r.email, 'New time for your request', `<p>Hi ${esc(r.name.split(' ')[0])},</p><p>Could you do <b>${esc(new Date(v).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }))} ET</b>? Reply yes and I'll send the confirmation and the deposit link.</p>`); }
        if (ra === 'ics') { dl(`${id}.ics`, ics(r), 'text/calendar'); toast('.ics downloaded (sample)'); }
      }
    });
    // drag reorder (Gold) — pointer events so it works on touch too
    const box = $('#secs'); if (box) {
      let drag = null;
      box.addEventListener('pointerdown', e => { const g = e.target.closest('.grip'); if (!g) return; drag = g.closest('.sr'); drag.classList.add('drag'); box.setPointerCapture(e.pointerId); e.preventDefault(); });
      box.addEventListener('pointermove', e => { if (!drag) return; const over = document.elementFromPoint(e.clientX, e.clientY); const t = over && over.closest('.sr'); $$('.sr', box).forEach(x => x.classList.toggle('over', x === t && x !== drag));
        if (t && t !== drag) { const r = t.getBoundingClientRect(); box.insertBefore(drag, e.clientY < r.top + r.height / 2 ? t : t.nextSibling); } });
      const end = () => { if (!drag) return; drag.classList.remove('drag'); $$('.sr', box).forEach(x => x.classList.remove('over')); const c = cur(), L = c.sections.filter(s => allowedSet().has(s.id));
        const order = $$('.sr', box).map(x => x.dataset.id); save({ sections: order.map(id => L.find(s => s.id === id)) }, true); drag = null; render(); };
      box.addEventListener('pointerup', end); box.addEventListener('pointercancel', end);
      box.addEventListener('dragstart', e => e.preventDefault());
    }
  }
  function allowedSet() { const a = A(), rel = a.relevant; return new Set([...rel.core, ...rel.optional, ...(a.takes_bookings ? rel.bookings || [] : [])]); }
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-login],[data-t],[data-tab],[data-act=logout],[data-up],[data-close]'); if (!b) return;
    if (b.dataset.close && e.target !== b && !e.target.closest('button[data-close]')) return;
    if (b.dataset.close) { b.closest('.modal').remove(); return; }
    if (b.dataset.login) { S.acct = b.dataset.login; S.tier = D.accounts[S.acct].defaultTier; S.tab = 'editor'; render(); toast('Signed in (demo, no real login)'); }
    if (b.dataset.t) { S.tier = b.dataset.t; render(); }
    if (b.dataset.tab) { S.tab = b.dataset.tab; render(); }
    if (b.dataset.act === 'logout') { S.acct = null; render(); }
    if (b.dataset.up) { S.tier = b.dataset.up; render(); toast(`Previewing ${TL[b.dataset.up]} (demo). Real upgrades happen on Whop.`); }
  });
})();
