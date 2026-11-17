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
  let D, S = { acct: null, tier: 'gold', tab: 'editor', range: 30, mode: 'simple', pvLook: '' };
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
      <nav class="tabs">${[['editor', 'Page editor'], ['analytics', 'Analytics'], ...(showReq ? [['requests', 'Requests']] : []), ['fans', 'Fans'], ['billing', 'Plan & billing']].map(([k, l]) => `<button data-tab="${k}" class="${S.tab === k ? 'on' : ''}"${S.tab === k ? ' aria-current="page"' : ''}${k === 'requests' && newReq && rank(S.tier) >= 1 ? ` aria-label="Requests, ${newReq} new"` : ''}>${l}${k === 'requests' && newReq && rank(S.tier) >= 1 ? `<span class="n" aria-hidden="true">${newReq}</span>` : ''}</button>`).join('')}</nav>
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
    const adv = f.hubAdvanced && S.mode === 'advanced', simple = f.hubAdvanced && !adv;
    const pvq = S.pvLook ? '&look=' + S.pvLook : '';
    return `<div class="ed"><div class="pv"><div class="phone"><iframe id="pvf" title="Live preview" src="${esc(a.pages[S.tier])}?hub=1&nointro=1${pvq}"></iframe></div>
        <div class="pv-side"><b>Live preview</b><span>${TL[S.tier]} page · updates as you type</span><span class="pill">Preview only</span><span>Edits apply only in this browser's preview (?hub=1). The public page doesn't change in the demo.</span><button class="mini" data-act="reset">Reset edits</button><a class="mini" style="display:grid;place-items:center;text-decoration:none;color:var(--text)" href="${esc(a.pages[S.tier])}?hub=1" target="_blank">Open full page ↗</a></div></div>
      <div style="display:grid;gap:12px">
      ${f.hubAdvanced ? `<div class="modeseg" role="group" aria-label="Editor mode"><button data-mode="simple" class="${simple ? 'on' : ''}"><b>Simple</b><small>Look, style, photos</small></button><button data-mode="advanced" class="${adv ? 'on' : ''}"><b>Advanced</b><small>Fonts, colors, cards, order, blocks</small></button></div>` : ''}
      <div class="box"><h3>Look <small>${f.looks ? 'how your whole page is dressed' : 'Gold option'}</small></h3>${lookUI(c)}</div>
      ${f.looks && lookNow(c) === 'studio' ? `<div class="box"><h3>Style <small>${esc(A().verticalLabel)} presets</small></h3>${presetUI(c)}</div>` : ''}
      ${f.looks && lookNow(c) === 'pro' && ST().pro ? `<div class="box"><h3>Template &amp; motion <small>pick one of each</small></h3>${proUI(c)}</div>` : ''}
      ${f.looks ? `<div class="box"><h3>Photos <small>tap a slot to swap</small></h3>${photosUI(c)}</div>` : ''}
      ${f.looks && lookNow(c) === 'brand' && simple ? `<div class="box"><h3>My brand kit <small>logo · header · graphics</small></h3>${brandUI(c, false)}</div>` : ''}
      ${simple ? `<div class="box"><h3>Text</h3><div class="f"><label>Page title</label><input class="in" data-k="title" value="${esc(c.title)}"></div><div class="f"><label>Tagline <small>pick a preset</small></label><select class="in" data-k="tagline">${[...new Set([c.tagline || '', ...a.taglines])].map(t => `<option value="${esc(t)}" ${t === (c.tagline || '') ? 'selected' : ''}>${esc(t || 'No tagline')}</option>`).join('')}</select></div></div>
      <div class="box simple-more"><b>That's it for a quick setup.</b><p class="fine">Your cards, flyers, policies and FAQ were filled from your info. Want to change fonts, colors, card text, section order or add your own blocks?</p><button class="mini" data-mode="advanced">Switch to Advanced</button></div>` : ''}
      ${adv && lookNow(c) !== 'art' ? `<div class="box"><h3>Fonts &amp; colors <small>curated list</small></h3>${fontsUI(c)}</div>
      <div class="box"><h3>Info cards <small>Good to know · edit the text</small></h3>${cardsUI(c)}</div>
      <div class="box"><h3>${A().layout === 'portfolio' ? 'Flash sale / drop card' : 'Drop card'} <small>auto-made · edit it</small></h3>${dropUI(c)}</div>
      ${A().layout === 'portfolio' ? `<div class="box"><h3>Flyers <small>service categories</small></h3>${flyersUI(c)}</div>` : ''}` : ''}
      ${adv ? `<div class="box"><h3>My brand kit <small>logo · header · Canva/Etsy graphics as image blocks</small></h3>${brandUI(c, true)}</div>` : ''}
      ${simple ? '' : `<div class="box"><h3>Text</h3><div class="f"><label>Page title</label><input class="in" data-k="title" value="${esc(c.title)}"></div><div class="f"><label>Tagline <small>pick a preset</small></label><select class="in" data-k="tagline">${[...new Set([c.tagline || '', ...a.taglines])].map(t => `<option value="${esc(t)}" ${t === (c.tagline || '') ? 'selected' : ''}>${esc(t || 'No tagline')}</option>`).join('')}</select></div><p class="fine">Structured on purpose: name and links are typed, everything else is picked. Gold can ask for more in the review note.</p></div>
      <div class="box"><h3>Featured first <small>drives the hero buttons</small></h3><div class="f"><select class="in" data-k="feature_first">${FEAT.map(([v, l]) => `<option value="${v}" ${c.feature_first === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
        ${isPort ? `<p class="fine">Book-now uses your booking link: ${esc(a.booking_label || '')}</p>` : `<div class="f"><label>Featured item</label><select class="in" data-fk="title">${[...new Set([(c.featured || {}).title || '', ...a.featureTitles])].filter(Boolean).map(t => `<option ${t === (c.featured || {}).title ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select></div><div class="f"><label>Featured link <small>URL</small></label><input class="in" type="url" data-fk="url" value="${esc((c.featured || {}).url || '')}"></div>`}</div>
      <div class="box"><h3>Links <small>${(c.links || []).length} links</small></h3>${links}<button class="mini" data-act="addlink">+ Add link</button></div>
      <div class="box"><h3>Sections <small>${S.tier === 'gold' ? 'drag to reorder · toggle on/off' : S.tier === 'silver' ? 'preset · a few show/hide toggles' : 'fixed preset'}</small></h3>${sectionsUI(c)}</div>
      <div class="box"><h3>Theme <small>auto-matched to your art</small></h3>${rank(S.tier) >= 1 ? `<div class="colors"><label><input type="color" data-pal="acc" value="${esc((c.palette_override || {}).acc || a.palette.acc)}">Accent</label><label><input type="color" data-pal="acc2" value="${esc((c.palette_override || {}).acc2 || a.palette.acc2)}">Accent 2</label><button class="mini" data-act="palreset">Use art colors</button></div>` : lockBox('silver', 'Palette tweaks are Silver+. Bronze uses the colors from your art.')}</div>
      <div class="box"><h3>Hero background</h3>${f.heroVideoBg ? `<div class="row">${[['art3d', '3D art'], ['video', 'Video loop']].map(([v, l]) => `<label class="sw-row" style="flex:1"><input type="radio" name="herobg" value="${v}" ${(c.hero_bg || 'art3d') === v ? 'checked' : ''}> ${l}</label>`).join('')}</div><p class="fine">Fans can still flip it with the small toggle on the hero.</p>` : lockBox('gold', 'The 3D art / video hero is Gold.')}</div>
      <div class="box"><h3>Music <small>optional · no music = no sound bars</small></h3>${musicUI(c)}</div>
      <div class="box"><h3>Hero accent <small>${f.accentPicker ? 'pick one for your trade' : f.accentDefault ? 'default for your trade' : ''}</small></h3>${accentUI(c)}</div>
      <div class="box"><h3>Tip button <small>links out · no payments on the page</small></h3>${f.tipButton ? tipUI(c) : lockBox('silver', 'The Tip button is Silver and Gold.')}</div>`}
      </div></div>`;
  }

  /* ---------------- round 5: Looks (Art | Studio | My brand) ---------------- */
  const ST = () => A().studio || {};
  const lookNow = c => (F().looks ? (c.look || ST().look || 'art') : 'art');
  const stNow = c => Object.assign({}, { preset: ST().preset }, c.studio || {});
  const saveSt = (c, patch, now) => save({ studio: Object.assign({}, stNow(c), patch) }, now);
  const brandNow = c => Object.assign({}, ST().brand || {}, c.brand || {});
  const presetObj = id => (ST().presets || []).find(p => p.id === id) || (ST().presets || [])[0] || {};
  const imgUrl = v => !v ? '' : v.startsWith('local:') ? (localStorage.getItem('cp-hub-img-' + S.acct + '-' + v.slice(6)) || '') : v.startsWith('data:') ? v : ST().photoBase + v;
  let fontsLoaded = {};
  function loadFonts(list) { const need = list.filter(f => f && !fontsLoaded[f]); if (!need.length) return; need.forEach(f => fontsLoaded[f] = 1);
    const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?' + need.map(f => 'family=' + f.replace(/ /g, '+')).join('&') + '&display=swap'; document.head.appendChild(l); }
  function lookUI(c) {
    const f = F(), st = ST(), now = lookNow(c), p = presetObj(stNow(c).preset), b = brandNow(c), a = A();
    loadFonts([p.script, p.head]);
    const card = (id, title, sub, inner, lock) => `<button type="button" class="lk${now === id ? ' on' : ''}${lock ? ' locked' : ''}" ${lock ? `data-lkprev="${id}"` : `data-look="${id}"`}><div class="lk-pv">${inner}</div><b>${title}${lock ? ' 🔒' : ''}${st.bestLook === id && !lock ? ' <em>best for you</em>' : ''}</b><small>${sub}</small></button>`;
    const art = `<div class="lk-art" style="background-image:url('${esc(a.avatar)}')"><span style="background:${esc(a.palette.acc)}"></span></div>`;
    const studio = `<div class="lk-st" style="background:${esc(p.bg)};color:${esc(p.text)}"><i style="font-family:'${esc(p.script)}',cursive;color:${esc(p.acc)}">${esc((c.title || a.label).split(/[(·]/)[0].trim())}</i><span>${[p.acc, p.acc2, p.card].map(x => `<u style="background:${esc(x)}"></u>`).join('')}</span></div>`;
    const brand = `<div class="lk-br" style="background-image:url('${esc(imgUrl(b.header) || a.avatar)}')">${b.logo ? `<img src="${esc(imgUrl(b.logo))}" alt="">` : '<span>Your logo</span>'}</div>`;
    if (!f.studioPreview) return `<div class="lks">${card('art', 'Art-matched', 'Colors from your art', art)}</div>${lockBox('gold', 'Studio templates and bring-your-own-brand Looks are Gold. Silver can preview Studio.')}`;
    if (!f.looks) return `<div class="lks">${card('art', 'Art-matched', 'Colors from your art', art)}${card('studio', 'Studio', 'Boutique template · preview', studio, true)}${card('brand', 'My brand', 'Your logo + graphics', brand, true)}</div>
      <p class="fine" style="margin-top:8px">${S.pvLook ? 'Previewing the Studio Look (locked). <button class="linkb" data-lkprev="">Back to my page</button>' : 'Tap Studio to preview it in the phone. It can\'t be published on Silver.'}</p>${lockBox('gold', 'Use Studio or My brand on your live page with Gold.')}`;
    if (st.pro) { const T = BP_T[(c.pro || {}).template || st.pro.template] || BP_T.clean; loadFonts([T.head]);
      const pro = `<div class="lk-pro" style="background:${T.bg};color:${T.text}"><img src="${esc(imgUrl(st.pro.hero))}" alt=""><i style="font-family:'${T.head}',serif">${esc((c.title || a.label).split(/[(·]/)[0].trim())}</i><u style="background:${T.acc}">Book</u></div>`;
      return `<div class="lks lks4">${card('pro', 'Pro templates', 'Clean, natural, straight to the point', pro)}${card('studio', 'Studio', 'Boutique template for your trade', studio)}${card('brand', 'My brand', 'Your logo, header + graphics', brand)}${card('art', 'Art-matched', 'Theme from your art', art)}</div>
      <p class="fine" style="margin-top:8px">Services, prices and policies stay real text in every Look.</p>`; }
    return `<div class="lks">${card('art', 'Art-matched', 'Theme from your art + the modules', art)}${card('studio', 'Studio', 'Boutique template for your trade', studio)}${card('brand', 'My brand', 'Your logo, header + graphics', brand)}</div>
      <p class="fine" style="margin-top:8px">Services, prices and policies stay real text in every Look. Cards and flyers are drawn from your info, so edits show up everywhere.</p>`;
  }
  /* round 7: Beauty Pro templates (mirrors beauty.js TEMPLATES / MOTIONS; lash palette shown) */
  const BP_T = { clean: { label: 'Clean Pro', sub: 'Airy and straight to the point: services + Book on the first screen', head: 'Playfair Display', bg: '#fbfaf7', text: '#1d1b19', acc: '#7d4f42' },
    luxe: { label: 'Soft Luxe', sub: 'Warm neutrals, script accent, rounded cards', head: 'Cormorant Garamond', bg: '#f6efe8', text: '#2d231f', acc: '#94535a' },
    editorial: { label: 'Modern Editorial', sub: 'Magazine layout, full-bleed photo grid', head: 'Bodoni Moda', bg: '#121212', text: '#ffffff', acc: '#ffffff' } };
  const BP_M = { calm: ['Calm', 'Near-static, subtle hover'], lively: ['Lively', 'Soft fades, parallax, shimmer'], dynamic: ['Dynamic', 'Motion hero, trade accent, scroll scenes'] };
  const proNow = c => Object.assign({}, ST().pro || {}, c.pro || {});
  function proUI(c) {
    const P = proNow(c); loadFonts(Object.values(BP_T).map(t => t.head));
    return `<div class="bpt" role="group" aria-label="Template">${Object.entries(BP_T).map(([id, t]) => `<button type="button" class="bpt-c${P.template === id ? ' on' : ''}" data-bptpl="${id}" aria-pressed="${P.template === id}"><span class="bpt-pv" style="background:${t.bg};color:${t.text}"><i style="font-family:'${t.head}',serif">Aa</i><u style="background:${t.acc}"></u></span><b>${t.label}${id === 'clean' ? ' <em>default</em>' : ''}</b><small>${t.sub}</small></button>`).join('')}</div>
      <div class="modeseg bpm" role="group" aria-label="Motion">${Object.entries(BP_M).map(([id, m]) => `<button type="button" data-bpmo="${id}" class="${P.motion === id ? 'on' : ''}" aria-pressed="${P.motion === id}"><b>${m[0]}</b><small>${m[1]}</small></button>`).join('')}</div>
      <p class="fine" style="margin-top:8px">Calm is the default. Every template keeps your services, prices, policies and FAQ as real text, and Book opens your own booking app.</p>`;
  }
  function presetUI(c) {
    const cur = stNow(c).preset; const P = ST().presets || []; loadFonts(P.map(p => p.script));
    return `<div class="presets">${P.map(p => `<button type="button" class="pre${p.id === cur ? ' on' : ''}" data-preset="${esc(p.id)}" style="background:${esc(p.bg)};color:${esc(p.text)};border-color:${esc(p.line)}"><i style="font-family:'${esc(p.script)}',cursive;color:${esc(p.acc)}">${esc(p.label.split(' ')[0])}</i><span>${[p.bg2, p.acc, p.acc2].map(x => `<u style="background:${esc(x)}"></u>`).join('')}</span><small>${esc(p.label)}</small></button>`).join('')}</div>`;
  }
  function photosUI(c) {
    const st = ST(), P = c.photos || {}, lib = st.photoLib || [], n = Math.min(st.galleryCount || 0, 6);
    const slot = (k, label, v, def) => `<button type="button" class="ps" data-slot="${k}"><span style="background-image:url('${esc(imgUrl(v) || imgUrl(def))}')"></span><small>${label}</small></button>`;
    const slots = [slot('banner', 'Header banner', P.banner, lib[0]), slot('cover', 'Cover / art', P.cover, lib[0])];
    for (let i = 0; i < n; i++) slots.push(slot('g' + i, 'Gallery ' + (i + 1), (P.gallery || [])[i], lib.filter(x => x.startsWith('img/'))[i] || lib[i]));
    return `<div class="pslots">${slots.join('')}</div><div class="plib" id="plib" hidden><div class="plib-h"><b id="plibt">Choose a photo</b><button class="mini" data-act="plibx">Done</button></div><div class="plib-g">${lib.map(x => `<button type="button" data-pick="${esc(x)}" style="background-image:url('${esc(imgUrl(x))}')" aria-label="${esc(x)}"></button>`).join('')}<label class="plib-up">+ Upload<input type="file" accept="image/*" data-upimg></label></div><p class="fine">Uploads are shrunk and kept in this browser only (demo). The real version stores them with your page.</p></div>`;
  }
  function fontsUI(c) {
    const st = stNow(c), FL = ST().fonts || {}, p = presetObj(st.preset), fo = st.fonts || {}, co = st.colors || {};
    const sel = (k, label, list, v) => `<div class="f"><label>${label}</label><select class="in" data-font="${k}">${['', ...list].map(x => `<option value="${esc(x)}" ${x === (v || '') ? 'selected' : ''}>${esc(x || 'Preset default')}</option>`).join('')}</select></div>`;
    const col = (k, label) => `<label><input type="color" data-scol="${k}" value="${esc(co[k] || p[k] || '#888888')}">${label}</label>`;
    return `<div class="rowx">${sel('display', 'Wordmark / script', [...(FL.script || []), ...(FL.display || [])], fo.display)}${sel('head', 'Headings', [...(FL.serif || []), ...(FL.display || [])], fo.head)}${sel('body', 'Body text', FL.body || [], fo.body)}</div>
      <div class="colors" style="margin-top:8px">${col('bg', 'Background')}${col('card', 'Cards')}${col('acc', 'Accent')}${col('text', 'Text')}<button class="mini" data-act="streset">Preset colors + fonts</button></div>`;
  }
  function cardsUI(c) {
    const L = stNow(c).cards || ST().cards || [];
    return L.map((k, i) => `<div class="cardx"><input class="in" data-card="${i}" data-ck="title" value="${esc(k.title)}" maxlength="40">
      <textarea class="in" data-card="${i}" data-ck="${k.qa ? 'qa' : 'items'}" rows="${Math.min(6, (k.items || k.qa || []).length + 1)}">${esc(k.qa ? k.qa.map(q => (q[0] ?? q.q) + ' | ' + (q[1] ?? q.a)).join('\n') : (k.items || []).join('\n'))}</textarea></div>`).join('') + `<p class="fine">One line per point${L.some(k => k.qa) ? ' · FAQ lines are "question | answer"' : ''}. Plain text only.</p>`;
  }
  function dropUI(c) {
    const d = Object.assign({}, ST().drop || {}, stNow(c).drop || {}); const end = d.ends ? d.ends.slice(0, 16) : '';
    return `<div class="rowx"><div class="f"><label>Label</label><input class="in" data-drop="kicker" value="${esc(d.kicker)}" maxlength="24"></div><div class="f"><label>Title</label><input class="in" data-drop="title" value="${esc(d.title)}" maxlength="40"></div></div>
      <div class="rowx"><div class="f"><label>Line</label><input class="in" data-drop="sub" value="${esc(d.sub)}" maxlength="60"></div><div class="f"><label>Ends (ET)</label><input class="in" type="datetime-local" data-drop="ends" value="${esc(end)}"></div></div>
      <div class="rowx"><div class="f"><label>Button</label><input class="in" data-drop="cta" value="${esc(d.cta)}" maxlength="24"></div><label class="sw-row" style="align-self:end"><input type="checkbox" data-drop="off" ${d.off ? 'checked' : ''}> Hide the card</label></div>`;
  }
  function flyersUI(c) {
    const L = stNow(c).categories || ST().categories || [];
    return L.map((k, i) => `<div class="row" style="margin-bottom:6px"><input class="in" data-cat="${i}" value="${esc(k.name)}" maxlength="28"><button class="mini" data-slot="f${i}">Photo</button></div>`).join('') + '<p class="fine">Services are sorted into these flyers by name. Prices stay real text on each flyer.</p>';
  }
  function brandUI(c, full) {
    const b = brandNow(c), FL = ST().fonts || {}, G = b.graphics || [];
    const up = (k, label) => `<label class="bup"><span style="background-image:url('${esc(imgUrl(b[k]))}')">${b[k] ? '' : '+'}</span><small>${label}</small><input type="file" accept="image/*" data-brandimg="${k}"></label>`;
    return `<div class="bups">${up('logo', 'Logo')}${up('header', 'Header image')}</div>
      <div class="f" style="margin-top:8px"><label>Graphics <small>Canva / Etsy flyers as image blocks</small></label><div class="bgfx">${G.map((g, i) => `<div><span style="background-image:url('${esc(imgUrl(g.src))}')"></span><button class="mini" data-rmgfx="${i}" aria-label="Remove">✕</button></div>`).join('')}<label class="bup sm"><span>+</span><input type="file" accept="image/*" data-brandimg="gfx"></label></div></div>
      ${full ? `<div class="rowx"><div class="f"><label>Display font</label><select class="in" data-bfont="display">${['', ...(FL.script || []), ...(FL.display || []), ...(FL.serif || [])].map(x => `<option value="${esc(x)}" ${x === ((b.fonts || {}).display || '') ? 'selected' : ''}>${esc(x || 'Auto')}</option>`).join('')}</select></div><div class="f"><label>Body font</label><select class="in" data-bfont="body">${['', ...(FL.body || [])].map(x => `<option value="${esc(x)}" ${x === ((b.fonts || {}).body || '') ? 'selected' : ''}>${esc(x || 'Auto')}</option>`).join('')}</select></div></div>` : ''}
      <p class="fine">Shows when the Look is "My brand". Colors are picked from your logo/header. Prices and policies are still typed text, not baked into images.</p>`;
  }
  function shrink(file, max, cb) { const rd = new FileReader(); rd.onload = () => { const im = new Image(); im.onload = () => { const k = Math.min(1, max / Math.max(im.width, im.height)); const cv = document.createElement('canvas'); cv.width = Math.round(im.width * k); cv.height = Math.round(im.height * k); const x = cv.getContext('2d'); x.drawImage(im, 0, 0, cv.width, cv.height); cb(cv.toDataURL(/png/.test(file.type) ? 'image/png' : 'image/jpeg', .82)); }; im.src = rd.result; }; rd.readAsDataURL(file); }
  function putImg(slot, data) { try { localStorage.setItem('cp-hub-img-' + S.acct + '-' + slot, data); return 'local:' + slot; } catch (e) { toast('That image is too big for this browser-only preview'); return null; } }
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
  /* round 4: custom tip saying (typed like name; 40 chars, emoji OK, links + profanity filtered: same rules as the page and the intake server) */
  const LEET = { 0: 'o', 1: 'i', 3: 'e', 4: 'a', 5: 's', 7: 't', '@': 'a', $: 's' };
  function checkSaying(v) {
    const s = String(v || '').replace(/\s+/g, ' ').trim(); if (!s) return [''];
    if (/(https?:\/\/|www\.|@|\b[\w-]+\.(com|net|org|io|co|me|ly|gg|app|link|xyz|shop|store|tv|fm)\b)/i.test(s)) return [null, "Links and handles aren't allowed here."];
    if (s.split(' ').some(w => { const n = w.toLowerCase().replace(/[013457@$]/g, c => LEET[c]).replace(/[^a-z]/g, ''); return /^(fuck|shit|bitch|cunt|dick|pussy|asshole|nigger|nigga|fag|faggot|slut|whore|retard|cock)s?$/.test(n) || /(fuck|shit|cunt|nigg)/.test(n); })) return [null, "That word can't be shown on the page."];
    if ([...s].length > 40) return [null, 'Keep it to 40 characters.'];
    return [s]; }
  function tipUI(c) {
    const m = c.tip_methods || [], a = A(), say = c.tip_saying || '';
    const sayBox = F().tipSaying ? `<div class="f say"><label for="tipsay">Tip button saying <small><span id="saycount">${[...say].length}</span>/40 · emoji OK</small></label>
      <input class="in" id="tipsay" data-say maxlength="40" value="${esc(say)}" placeholder="Tip" autocomplete="off">
      <div class="qp" role="group" aria-label="Quick picks">${(a.tipSayings || []).map(x => `<button type="button" class="qchip${x === say ? ' on' : ''}" data-sayp="${esc(x)}">${esc(x)}</button>`).join('')}</div>
      <p class="fine" id="saymsg">Shows on the Tip chip and at the top of the tip sheet. No links; a small word filter applies.</p></div>` : '';
    return sayBox + `<div class="tiprows">${TIPM.map(([t, l, ph]) => { const x = m.find(y => y.type === t); return `<div class="tiprow"><label class="tl"><span class="sw"><input type="checkbox" data-tipon="${t}" ${x && x.on !== false ? 'checked' : ''} aria-label="Show ${esc(l)}"><i></i></span><b>${l}</b></label><input class="in" data-tiph="${t}" placeholder="${esc(ph)}" value="${esc(x ? x.handle : '')}" aria-label="${esc(l)} handle"></div>`; }).join('')}</div>` + '<p class="fine">Fans see a small Tip chip that opens these. Clicks are tracked per app.</p>';
  }
  /* round 4: music picker. Silver = link embed; Gold = upload (30s loop, visualizer follows it) or link. Bronze = none. */
  const MPROV = [['spotify', 'Spotify', /open\.spotify\.com\/(intl-[a-z]+\/)?(track|album|playlist|artist|episode)\//i], ['apple', 'Apple Music', /music\.apple\.com\//i], ['soundcloud', 'SoundCloud', /soundcloud\.com\//i], ['youtube', 'YouTube', /(youtube\.com\/(watch|shorts|embed)|youtu\.be\/|music\.youtube\.com\/)/i], ['audiomack', 'Audiomack', /audiomack\.com\//i]];
  const mprov = u => /^https:\/\/[^\s]+$/.test(u || '') ? (MPROV.find(p => p[2].test(u)) || null) : null;
  const AKEY = () => 'cp-hub-audio-' + S.acct;
  function musicNow(c) { const e = loadEdits() || {}; return e.music || (A().musicByTier || {})[S.tier] || c.music || { mode: 'none' }; }
  function musicUI(c) {
    const f = F(); if (!f.musicLink && !f.musicUpload) return lockBox('silver', 'Add music by link on Silver; upload your own track on Gold.');
    const m = musicNow(c), mode = m.mode === 'upload' && !f.musicUpload ? 'none' : (m.mode || 'none'), p = mprov(m.url);
    const seg = [['none', 'No music'], ['upload', 'Upload my own'], ['link', 'Use a link']].map(([v, l]) => `<button type="button" data-mmode="${v}" class="${mode === v ? 'on' : ''}" ${v === 'upload' && !f.musicUpload ? 'disabled title="Gold"' : ''}>${l}${v === 'upload' && !f.musicUpload ? ' 🔒' : ''}</button>`).join('');
    let local = null; try { local = localStorage.getItem(AKEY()) ? 1 : null; } catch (e) {}
    const body = mode === 'upload' ? `<div class="f"><label>Your audio file <small>mp3 or m4a · we use a 30s loop</small></label><label class="file"><input type="file" id="mfile" accept=".mp3,.m4a,audio/mpeg,audio/mp4,audio/x-m4a"><span>${m.local && local ? esc(m.fname || 'Your upload') + ' · in this browser' : m.src ? 'Current: ' + esc(m.title || m.src) : 'Choose a file'}</span></label></div>
        <div class="row2"><div class="f"><label>Loop starts at</label><select class="in" data-mstart>${[0, 15, 30, 45, 60, 90].map(v => `<option value="${v}" ${(+m.start || 0) === v ? 'selected' : ''}>${v}s</option>`).join('')}</select></div><div class="f"><label>Track title</label><input class="in" data-mtitle maxlength="60" value="${esc(m.title || '')}" placeholder="Track name"></div></div>
        <p class="fine">Plays only after a fan taps play (browser rule). Volume + mute on the page. Gold's visualizer follows your track.</p>`
      : mode === 'link' ? `<div class="f"><label>Music link <small id="mprov">${p ? '✓ ' + p[1] : 'Spotify, Apple Music, SoundCloud, YouTube or Audiomack'}</small></label><input class="in" type="url" data-murl value="${esc(m.url || '')}" placeholder="https://open.spotify.com/track/..."></div>
        <div class="f"><label>Title on the player <small>optional</small></label><input class="in" data-mtitle maxlength="60" value="${esc(m.title || '')}" placeholder="Track name"></div>
        <p class="fine">Uses the platform's official player, loaded only when a fan taps Play.${f.musicUpload ? ' Link players can\'t drive the visualizer (cross-origin), so your hero keeps its accent.' : ''}</p>`
      : `<p class="fine">No music: the page shows no sound bars. Your hero uses the motion accent below instead.</p>`;
    return `<div class="seg3" role="group" aria-label="Music">${seg}</div>${body}${!f.musicUpload ? lockBox('gold', 'Upload your own track (with a visualizer that follows it) on Gold.') : ''}`;
  }
  function accentUI(c) {
    const f = F(), a = A(), ac = a.accents || { default: null, options: [] }, L = (window.CPAccents || {}).labels || {};
    const pal = `--acc:${a.palette.acc};--acc2:${a.palette.acc2};--text:#f4eef6`;
    const card = (id, on, dis) => `<button type="button" class="acard${on ? ' on' : ''}" ${dis ? 'disabled' : `data-acc="${id}"`} style="${pal}">${id === 'none' ? '<span class="anone">None</span>' : `<canvas data-accent="${id}" aria-hidden="true"></canvas>`}<small>${esc(L[id] || id)}</small></button>`;
    if (!f.accentDefault) return lockBox('silver', 'A motion accent for your trade is Silver; pick from 3+ on Gold.');
    const m = musicNow(c), up = f.musicUpload && m.mode === 'upload';
    if (!f.accentPicker) return `<div class="agrid">${card(ac.default, true, true)}</div>${lockBox('gold', 'Pick from ' + ac.options.length + ' accents for your trade (or none) on Gold.')}`;
    const sel = c.accent || ac.default;
    return `${up ? '<p class="fine" style="margin-bottom:8px">You uploaded a track, so the hero shows the visualizer. The accent is used if you switch music off.</p>' : ''}<div class="agrid">${[...ac.options, 'none'].map(id => card(id, sel === id)).join('')}</div>`;
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
      if (t.dataset.card !== undefined) { const L = JSON.parse(JSON.stringify(stNow(c).cards || ST().cards || [])), k = L[+t.dataset.card], v = t.value;
        if (t.dataset.ck === 'title') k.title = v.slice(0, 40); else if (t.dataset.ck === 'qa') k.qa = v.split('\n').filter(x => x.trim()).map(x => { const [q, ...r] = x.split('|'); return [q.trim(), r.join('|').trim()]; }); else k.items = v.split('\n').filter(x => x.trim()).slice(0, 8);
        saveSt(c, { cards: L }); return; }
      if (t.dataset.drop && t.type !== 'checkbox') { const d = Object.assign({}, ST().drop || {}, stNow(c).drop || {}); d[t.dataset.drop] = t.dataset.drop === 'ends' ? (t.value ? t.value + ':00-05:00' : '') : t.value; saveSt(c, { drop: d }); return; }
      if (t.dataset.cat !== undefined) { const L = JSON.parse(JSON.stringify(stNow(c).categories || ST().categories || [])); L[+t.dataset.cat].name = t.value.slice(0, 28); saveSt(c, { categories: L }); return; }
      if (t.dataset.scol) { saveSt(c, { colors: Object.assign({}, stNow(c).colors || {}, { [t.dataset.scol]: t.value }) }); return; }
      if (t.dataset.k && !t.dataset.li) save({ [t.dataset.k]: t.value });
      if (t.dataset.fk) save({ featured: Object.assign({}, c.featured || {}, { [t.dataset.fk]: t.value }) });
      if (t.dataset.li) { const L = JSON.parse(JSON.stringify(c.links || [])); L[+t.dataset.li][t.dataset.k] = t.value; save({ links: L }); }
      if (t.dataset.pal) save({ palette_override: Object.assign({}, c.palette_override || {}, { [t.dataset.pal]: t.value }) });
      if (t.dataset.say !== undefined) { const [v, err] = checkSaying(t.value); $('#saycount').textContent = [...t.value].length; const msg = $('#saymsg'); msg.textContent = err || 'Shows on the Tip chip and at the top of the tip sheet. No links; a small word filter applies.'; msg.classList.toggle('bad', !!err); t.style.borderColor = err ? '#ff6b6b' : ''; if (v !== null) { save({ tip_saying: v }); $$('[data-sayp]').forEach(b => b.classList.toggle('on', b.dataset.sayp === v)); } return; }
      if (t.dataset.murl !== undefined) { const p = mprov(t.value); $('#mprov').textContent = p ? '✓ ' + p[1] : (t.value ? 'Not a supported music link' : 'Spotify, Apple Music, SoundCloud, YouTube or Audiomack'); t.style.borderColor = t.value && !p ? '#ff6b6b' : ''; if (p) save({ music: Object.assign({}, musicNow(c), { mode: 'link', url: t.value }) }); return; }
      if (t.dataset.mtitle !== undefined) { save({ music: Object.assign({}, musicNow(c), { title: t.value.slice(0, 60) }) }); return; }
      if (t.dataset.tiph !== undefined && t.dataset.tiph) { const m = (c.tip_methods || []).filter(x => x.type !== t.dataset.tiph); if (t.value) m.push({ type: t.dataset.tiph, handle: t.value, on: true }); save({ tip_methods: m }); const cb = $(`[data-tipon=${t.dataset.tiph}]`); if (cb) cb.checked = !!t.value; }
    });
    P.addEventListener('change', e => {
      const t = e.target, c = cur();
      if (t.dataset.font) { const fo = Object.assign({}, stNow(c).fonts || {}); if (t.value) fo[t.dataset.font] = t.value; else delete fo[t.dataset.font]; saveSt(c, { fonts: fo }, true); return; }
      if (t.dataset.bfont) { const b = brandNow(c), fo = Object.assign({}, b.fonts || {}); if (t.value) fo[t.dataset.bfont] = t.value; else delete fo[t.dataset.bfont]; save({ brand: Object.assign({}, b, { fonts: fo }) }, true); return; }
      if (t.dataset.drop === 'off') { const d = Object.assign({}, ST().drop || {}, stNow(c).drop || {}, { off: t.checked }); saveSt(c, { drop: d }, true); return; }
      if (t.dataset.upimg !== undefined && t.files[0]) { const slot = S.slot; shrink(t.files[0], 1100, d => { const v = putImg(slot + '-up', d); if (v) pickPhoto(slot, v); }); return; }
      if (t.dataset.brandimg && t.files[0]) { const k = t.dataset.brandimg; shrink(t.files[0], k === 'logo' ? 500 : 1100, d => { const b = brandNow(c);
          if (k === 'gfx') { const n = (b.graphics || []).length; const v = putImg('gfx' + n + '-' + Date.now() % 1e5, d); if (v) save({ brand: Object.assign({}, b, { graphics: [...(b.graphics || []), { src: v, alt: 'Uploaded graphic', caption: 'Your upload' }] }) }, true); }
          else { const v = putImg('brand-' + k, d); if (v) save({ brand: Object.assign({}, b, { [k]: v }) }, true); }
          render(); toast('Added to the preview (stays in this browser)'); }); return; }
      if (t.dataset.tg) save({ section_toggles: Object.assign({}, c.section_toggles || {}, { [t.dataset.tg]: t.checked }) }, true);
      if (t.dataset.son !== undefined) { const L = c.sections.filter(s => allowedSet().has(s.id)); L[+t.dataset.son].on = t.checked; save({ sections: L }, true); }
      if (t.name === 'herobg') save({ hero_bg: t.value }, true);
      if (t.dataset.mstart !== undefined) save({ music: Object.assign({}, musicNow(c), { start: +t.value }) }, true);
      if (t.id === 'mfile' && t.files[0]) { const fl = t.files[0];
        if (!/\.(mp3|m4a)$/i.test(fl.name) && !/^audio\/(mpeg|mp4|x-m4a|mp3)$/.test(fl.type)) { toast('Use an mp3 or m4a file'); t.value = ''; return; }
        if (fl.size > 8 * 1024 * 1024) { toast('Max 8 MB. The real upload trims it to a 30s loop.'); t.value = ''; return; }
        const rd = new FileReader(); rd.onload = () => { try { localStorage.setItem(AKEY(), rd.result); } catch (x) { toast('Too big for this browser-only preview (about 3 MB max here). The real upload trims it on the server.'); return; }
          save({ music: Object.assign({}, musicNow(c), { mode: 'upload', local: true, fname: fl.name.slice(0, 60), title: musicNow(c).title || fl.name.replace(/\.[^.]+$/, '').slice(0, 60) }) }, true); render(); toast('Track added to the preview (stays in this browser)'); }; rd.readAsDataURL(fl); }
      if (t.dataset.tipon) { const m = (c.tip_methods || []).map(x => x.type === t.dataset.tipon ? Object.assign({}, x, { on: t.checked }) : x); if (t.checked && !m.some(x => x.type === t.dataset.tipon)) { toast('Add a handle to turn this on'); t.checked = false; } save({ tip_methods: m }, true); }
      if (t.dataset.k === 'feature_first') save({ feature_first: t.value }, true);
      if (t.dataset.k === 'tagline') save({ tagline: t.value }, true);
      if (t.dataset.fk === 'title') save({ featured: Object.assign({}, c.featured || {}, { title: t.value }) }, true);
    });
    P.addEventListener('click', e => {
      const b = e.target.closest('button,[data-ra]'); if (!b) return; const c = cur();
      if (b.dataset.look) { save({ look: b.dataset.look }, true); S.pvLook = ''; render(); toast(b.dataset.look === 'art' ? 'Art-matched Look' : b.dataset.look === 'pro' ? 'Pro templates · pick a template and motion below' : b.dataset.look === 'studio' ? 'Studio Look · pick a style below' : 'My brand Look · add your logo and header'); return; }
      if (b.dataset.bptpl || b.dataset.bpmo) { const P = proNow(c); if (b.dataset.bptpl) P.template = b.dataset.bptpl; else P.motion = b.dataset.bpmo; save({ pro: { template: P.template, motion: P.motion }, look: 'pro' }, true); render(); toast((BP_T[P.template] || {}).label + ' · ' + BP_M[P.motion][0] + ' motion'); return; }
      if (b.dataset.lkprev !== undefined) { S.pvLook = b.dataset.lkprev; render(); return; }
      if (b.dataset.preset) { saveSt(c, { preset: b.dataset.preset }, true); $$('.pre').forEach(x => x.classList.toggle('on', x === b)); render(); return; }
      if (b.dataset.slot) { S.slot = b.dataset.slot; const L = $('#plib'); if (L) { L.hidden = false; $('#plibt').textContent = 'Choose a photo for: ' + (b.querySelector('small') ? b.querySelector('small').textContent : 'flyer ' + (+b.dataset.slot.slice(1) + 1)); L.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } return; }
      if (b.dataset.pick) { pickPhoto(S.slot, b.dataset.pick); return; }
      if (b.dataset.act === 'plibx') { $('#plib').hidden = true; return; }
      if (b.dataset.rmgfx !== undefined) { const bb = brandNow(c), G = [...(bb.graphics || [])]; G.splice(+b.dataset.rmgfx, 1); save({ brand: Object.assign({}, bb, { graphics: G }) }, true); render(); return; }
      if (b.dataset.act === 'streset') { saveSt(c, { colors: null, fonts: null }, true); render(); return; }
      if (b.dataset.mv) { const L = c.sections.filter(s => allowedSet().has(s.id)), i = +b.dataset.i, j = i + +b.dataset.mv; if (j < 0 || j >= L.length) return; [L[i], L[j]] = [L[j], L[i]]; save({ sections: L }, true); render(); }
      if (b.dataset.act === 'addsec') { const id = $('#addsec').value, L = c.sections.filter(s => allowedSet().has(s.id)); L.push({ id, on: true }); save({ sections: L }, true); render(); toast(`${D.sections[id]} added`); }
      if (b.dataset.act === 'addlink') { save({ links: [...(c.links || []), { platform: 'instagram', url: 'https://instagram.com/PLACEHOLDER' }] }, true); render(); }
      if (b.dataset.act === 'rmlink') { const L = [...c.links]; L.splice(+b.dataset.i, 1); save({ links: L }, true); render(); }
      if (b.dataset.sayp) { $('#tipsay').value = b.dataset.sayp; $('#tipsay').dispatchEvent(new Event('input', { bubbles: true })); }
      if (b.dataset.mmode) { const m = musicNow(c), base = (A().musicByTier || {})[S.tier] || {}; const nm = Object.assign({}, m, { mode: b.dataset.mmode });
        if (b.dataset.mmode === 'upload' && !nm.src && !nm.local && base.src) nm.src = base.src;
        if (b.dataset.mmode === 'upload' && !nm.src && !nm.local) { save({ music: nm }, true); render(); toast('Choose an mp3 or m4a to hear it on the page'); return; }
        if (b.dataset.mmode === 'link' && !nm.url) nm.url = base.url || ''; save({ music: nm }, true); render(); }
      if (b.dataset.acc) { save({ accent: b.dataset.acc }, true); $$('.acard').forEach(x => x.classList.toggle('on', x === b)); }
      if (b.dataset.act === 'palreset') { save({ palette_override: null }, true); render(); }
      if (b.dataset.act === 'reset') { localStorage.removeItem(KEY()); try { localStorage.removeItem(AKEY()); } catch (x) {} render(); toast('Edits cleared'); }
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
  function pickPhoto(slot, v) {
    const c = cur(); if (!slot) return;
    if (slot[0] === 'f' && slot !== 'cover') { const L = JSON.parse(JSON.stringify(stNow(c).categories || ST().categories || [])); const i = +slot.slice(1); if (L[i]) { L[i].photo = v; saveSt(c, { categories: L }, true); } }
    else { const P = Object.assign({}, c.photos || {}); if (slot[0] === 'g') { const G = [...(P.gallery || [])]; G[+slot.slice(1)] = v; P.gallery = G; } else P[slot] = v; save({ photos: P }, true); }
    render(); toast('Photo swapped'); }
  function allowedSet() { const a = A(), rel = a.relevant; return new Set([...rel.core, ...rel.optional, ...(a.takes_bookings ? rel.bookings || [] : [])]); }
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-login],[data-t],[data-tab],[data-act=logout],[data-up],[data-close],[data-mode]'); if (!b) return;
    if (b.dataset.mode) { S.mode = b.dataset.mode; render(); return; }
    if (b.dataset.close && e.target !== b && !e.target.closest('button[data-close]')) return;
    if (b.dataset.close) { b.closest('.modal').remove(); return; }
    if (b.dataset.login) { S.acct = b.dataset.login; S.tier = D.accounts[S.acct].defaultTier; S.tab = 'editor'; render(); toast('Signed in (demo, no real login)'); }
    if (b.dataset.t) { S.tier = b.dataset.t; render(); }
    if (b.dataset.tab) { S.tab = b.dataset.tab; render(); }
    if (b.dataset.act === 'logout') { S.acct = null; render(); }
    if (b.dataset.up) { S.tier = b.dataset.up; render(); toast(`Previewing ${TL[b.dataset.up]} (demo). Real upgrades happen on Whop.`); }
  });
})();
