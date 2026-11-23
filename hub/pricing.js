/* Round 10 pricing component (compare page, intake, hub). Data comes from template/pricing.json, inlined at build time by generator/pricing.py.
   Monthly / yearly toggle, Gold highlighted as "Most popular". Payment happens on Whop; nothing here takes money (test mode: no live checkout). */
(function () {
  var D = {"currency": "USD", "popular": "gold", "yearlyLabel": "2 months free", "tiers": {"bronze": {"monthly": 9, "yearly": 90, "label": "Bronze", "tagline": "Clean, still preset", "save": 18, "highlights": ["Art-matched hero (cover, title, artist)", "Smart links to every streaming app", "Social icon row", "QR code for the page (posters, merch tables)"]}, "silver": {"monthly": 19, "yearly": 190, "label": "Silver", "tagline": "Polished motion preset", "save": 38, "highlights": ["Everything in Bronze", "Tabbed sections (preset)", "Embedded video / music players", "Project ecosystem: tracklist + more releases", "Release countdown that flips to OUT NOW"]}, "gold": {"monthly": 29, "yearly": 290, "label": "Gold", "tagline": "Custom experience", "save": 58, "highlights": ["Everything in Silver", "Merch / beats showcase + store buttons (link out to their Shopify, BeatStars...)", "Tour & show dates", "Tip buttons to their own Cash App / PayPal / Ko-fi", "Credits"]}}, "diamond": {"suggested": true, "status": "Suggested prices, pending JB's approval. Not for sale yet; no checkout exists.", "kind": "one-time", "label": "Diamond", "tagline": "Done for you", "requires": "gold", "firstMonthIncluded": true, "cta": "Book a design call", "packages": [{"id": "touch", "label": "Custom Touch", "price": 99, "days": "3–5", "revisions": 1, "sections": 0, "pages": 1, "includes": ["Custom colors + font pairing", "Custom hero treatment", "1 revision round"]}, {"id": "diamond", "label": "Diamond", "price": 299, "days": "5–10", "revisions": 2, "sections": 2, "pages": 1, "standard": true, "includes": ["Full custom theme on every section", "Moodboard + 2 revision rounds", "Up to 2 custom sections you edit in the hub", "Motion presets"]}, {"id": "plus", "label": "Diamond+", "price": 499, "days": "7–10", "revisions": 2, "sections": 5, "pages": 3, "includes": ["Everything in Diamond", "Up to 5 custom sections", "Up to 3 linked pages", "Custom animation (allowed presets)"]}], "addons": [{"id": "revision", "label": "Extra revision round", "price": 49}, {"id": "section", "label": "Extra custom section", "price": 59}, {"id": "page", "label": "Extra linked page (Diamond+)", "price": 99}, {"id": "rush", "label": "Rush: live in 3 business days", "price": 99}, {"id": "motion", "label": "Motion on more sections", "price": 39}, {"id": "domain", "label": "Connect a domain you own", "price": 29}, {"id": "refresh", "label": "Seasonal refresh (new theme version)", "price": 79}], "deposit": {"suggested": true, "upfrontPct": 50, "beforeLaunchPct": 50, "refundable": "until design starts (moodboard approved)", "paidOn": "off the page (Whop or invoice)"}}};
  if (!D || window.CPPricing) return;
  var T = ['bronze', 'silver', 'gold'];
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var money = function (n) { var s = '$' + (Math.round(n * 100) / 100).toFixed(2); return s.replace(/\.00$/, ''); };
  var perMonth = function (y) { var m = y / 12, c = Math.round(m * 100); return Math.abs(m * 100 - c) < 1e-9 && c % 50 === 0 ? money(m) : '≈ ' + money(Math.round(m)); };
  var price = function (t, per) { var p = D.tiers[t]; return per === 'yearly' ? { big: money(p.yearly), unit: '/yr', sub: perMonth(p.yearly) + '/mo · save ' + money(p.save) } : { big: money(p.monthly), unit: '/mo', sub: 'or ' + money(p.yearly) + '/yr · ' + D.yearlyLabel }; };
  var label = function (t, per) { var p = price(t, per || 'monthly'); return p.big + p.unit; };
  var CSS = '.cpp{--cpp-card:var(--card,#17121a);--cpp-text:var(--text,#f4eef1);--cpp-muted:var(--muted,#a2949a);--cpp-line:var(--line,rgba(255,255,255,.12));color:var(--cpp-text);font-family:inherit}' +
    '.cpp-top{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:14px}.cpp-h{font-weight:800;font-size:18px;margin:0}' +
    '.cpp-tg{display:inline-flex;padding:4px;border-radius:99px;background:rgba(255,255,255,.06);border:1px solid var(--cpp-line)}' +
    '.cpp-tg button{min-height:40px;padding:0 16px;border:0;border-radius:99px;background:transparent;color:var(--cpp-muted);font-weight:700;font-size:14px;line-height:1;font-family:inherit;cursor:pointer;display:inline-flex;align-items:center;gap:6px}' +
    '.cpp-tg button[aria-checked=true]{background:var(--cpp-text);color:#120d10}.cpp-tg .cpp-save{font-size:11px;font-weight:800;padding:3px 7px;border-radius:99px;background:#2fd28a;color:#06120b}' +
    '.cpp-grid{display:grid;gap:12px;grid-template-columns:1fr}@media(min-width:720px){.cpp-grid{grid-template-columns:repeat(3,1fr);align-items:stretch}.cpp-card.cpp-pop{transform:translateY(-6px)}}' +
    '@media(max-width:719px){.cpp-card.cpp-pop{order:-1}}' +
    '.cpp-card{position:relative;display:flex;flex-direction:column;gap:6px;padding:18px 16px 16px;border-radius:18px;background:var(--cpp-card);border:1px solid var(--cpp-line);text-align:left}' +
    '.cpp-card h3{margin:0;font-weight:800;font-size:17px;letter-spacing:.01em}.cpp-bronze h3{color:#e7a372}.cpp-silver h3{color:#dfe5ec}.cpp-gold h3{color:#f5cf5a}' +
    '.cpp-tag{margin:0;color:var(--cpp-muted);font-size:13px}.cpp-price{display:flex;align-items:baseline;gap:3px;margin-top:6px}.cpp-price b{font-size:34px;line-height:1;font-weight:800;letter-spacing:-.02em}.cpp-price span{color:var(--cpp-muted);font-weight:600}' +
    '.cpp-sub{font-size:12.5px;color:var(--cpp-muted);min-height:1.3em}.cpp-card ul{margin:8px 0 4px;padding:0;list-style:none;display:grid;gap:5px;font-size:13.5px}.cpp-card li{padding-left:20px;position:relative}.cpp-card li:before{content:"✓";position:absolute;left:0;color:#2fd28a;font-weight:800}' +
    '.cpp-card.cpp-pop{border:2px solid transparent;background:linear-gradient(var(--cpp-card),var(--cpp-card)) padding-box,linear-gradient(135deg,#fff1b8,#d4a537 50%,#fbe08a) border-box;box-shadow:0 18px 50px -18px rgba(245,207,90,.55),0 0 0 1px rgba(245,207,90,.15)}' +
    '.cpp-badge{position:absolute;top:-11px;left:50%;transform:translateX(-50%);white-space:nowrap;font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;padding:5px 11px;border-radius:99px;color:#1a1208;background:linear-gradient(135deg,#fff1b8,#d4a537 50%,#fbe08a);box-shadow:0 4px 14px -4px rgba(245,207,90,.7)}' +
    '.cpp-cur{align-self:flex-start;font-size:11px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;padding:4px 9px;border-radius:99px;border:1px solid var(--cpp-line);color:var(--cpp-muted)}' +
    '.cpp-cta{margin-top:auto;padding-top:10px}.cpp-btn{width:100%;min-height:44px;border-radius:12px;border:1px solid var(--cpp-line);background:rgba(255,255,255,.06);color:var(--cpp-text);font-weight:700;font-size:14.5px;font-family:inherit;cursor:pointer}' +
    '.cpp-pop .cpp-btn{background:linear-gradient(135deg,#fff1b8,#d4a537 50%,#fbe08a);color:#1a1208;border:0}.cpp-btn[aria-pressed=true]{outline:3px solid #2fd28a;outline-offset:2px}.cpp-btn:disabled{opacity:.55;cursor:default}' +
    '.cpp-card.cpp-sel{box-shadow:0 0 0 3px #2fd28a}.cpp-note{margin:12px 0 0;font-size:12px;color:var(--cpp-muted)}' +
    '.cpp.compact .cpp-card ul{display:none}.cpp.compact .cpp-price b{font-size:26px}';
  function css() { if (document.getElementById('cpp-css')) return; var s = document.createElement('style'); s.id = 'cpp-css'; s.textContent = CSS; document.head.appendChild(s); }
  function render(o) {
    o = o || {}; var per = o.period || 'monthly';
    var cards = T.map(function (t) {
      var p = D.tiers[t], pr = price(t, per), pop = D.popular === t, cur = o.current === t, sel = o.selected === t;
      var cta = o.cta ? o.cta(t, per, { current: cur, selected: sel }) : o.mode === 'pick' ? '<button type="button" class="cpp-btn" data-cpp-pick="' + t + '" aria-pressed="' + sel + '">' + (sel ? '✓ ' + esc(p.label) + ' selected' : 'Choose ' + esc(p.label)) + '</button>' : '';
      return '<div class="cpp-card cpp-' + t + (pop ? ' cpp-pop' : '') + (sel ? ' cpp-sel' : '') + '" data-tier="' + t + '">' + (pop ? '<span class="cpp-badge">Most popular</span>' : '') +
        '<h3>' + esc(p.label) + '</h3><p class="cpp-tag">' + esc(p.tagline) + '</p>' + (cur ? '<span class="cpp-cur">Your plan</span>' : '') +
        '<div class="cpp-price"><b>' + pr.big + '</b><span>' + pr.unit + '</span></div><div class="cpp-sub">' + esc(pr.sub) + '</div>' +
        (o.compact ? '' : '<ul>' + p.highlights.map(function (h) { return '<li>' + esc(h) + '</li>'; }).join('') + '</ul>') + (cta ? '<div class="cpp-cta">' + cta + '</div>' : '') + '</div>';
    }).join('');
    return '<div class="cpp' + (o.compact ? ' compact' : '') + '" data-period="' + per + '"><div class="cpp-top">' + (o.heading ? '<p class="cpp-h">' + esc(o.heading) + '</p>' : '<span></span>') +
      '<div class="cpp-tg" role="radiogroup" aria-label="Billing period"><button type="button" role="radio" data-cpp-per="monthly" aria-checked="' + (per === 'monthly') + '">Monthly</button>' +
      '<button type="button" role="radio" data-cpp-per="yearly" aria-checked="' + (per === 'yearly') + '">Yearly <span class="cpp-save">' + esc(D.yearlyLabel) + '</span></button></div></div>' +
      '<div class="cpp-grid">' + cards + '</div>' + (o.note === false ? '' : '<p class="cpp-note">' + esc(o.note || 'Prices in USD. Membership and billing happen on Whop.') + '</p>') + '</div>';
  }
  function mount(el, o) {
    o = Object.assign({ period: (function () { try { return sessionStorage.getItem('cp-period') || 'monthly'; } catch (e) { return 'monthly'; } })() }, o || {}); css();
    var draw = function () { el.innerHTML = render(o); };
    el.addEventListener('click', function (e) {
      var b = e.target.closest('[data-cpp-per]'); if (b) { o.period = b.dataset.cppPer; try { sessionStorage.setItem('cp-period', o.period); } catch (x) {} draw(); if (o.onPeriod) o.onPeriod(o.period); var f = el.querySelector('[data-cpp-per="' + o.period + '"]'); if (f) f.focus(); return; }
      var p = e.target.closest('[data-cpp-pick]'); if (p && !p.disabled) { o.selected = p.dataset.cppPick; draw(); if (o.onPick) o.onPick(o.selected, o.period); }
    });
    draw(); return { set: function (k) { Object.assign(o, k); draw(); }, get: function () { return o; } };
  }
  /* Round 11: Diamond, the done-for-you design service. One-time, prices are SUGGESTIONS pending JB's approval (pricing.json "diamond").
     The CTA only links to the design-call request form; there is no checkout, deposit or payment on any page. */
  var DCSS = '.cpd{--cpd-ice:#bfe9ff;--cpd-vio:#c9b8ff;position:relative;overflow:hidden;border-radius:22px;padding:22px 18px 18px;color:#eef6ff;font-family:inherit;' +
    'background:radial-gradient(120% 90% at 100% 0%,rgba(191,233,255,.18),transparent 55%),radial-gradient(90% 80% at 0% 100%,rgba(201,184,255,.16),transparent 60%),linear-gradient(160deg,#0d1424,#121a30 55%,#0b1020);' +
    'border:2px solid transparent;background-clip:padding-box;box-shadow:0 0 0 1px rgba(191,233,255,.35),0 24px 60px -24px rgba(150,200,255,.55)}' +
    '.cpd:before{content:"";position:absolute;inset:0;pointer-events:none;opacity:.5;background:conic-gradient(from 210deg at 85% 10%,transparent 0 20deg,rgba(255,255,255,.10) 20deg 26deg,transparent 26deg 60deg,rgba(191,233,255,.12) 60deg 64deg,transparent 64deg 120deg,rgba(201,184,255,.10) 120deg 126deg,transparent 126deg)}' +
    '.cpd:after{content:"";position:absolute;top:-40%;left:-60%;width:40%;height:180%;transform:rotate(18deg);background:linear-gradient(90deg,transparent,rgba(255,255,255,.12),transparent);animation:cpd-sweep 6s ease-in-out infinite;pointer-events:none}' +
    '@keyframes cpd-sweep{0%,55%{left:-60%}100%{left:130%}}@media (prefers-reduced-motion:reduce){.cpd:after{animation:none;display:none}}' +
    '.cpd>*{position:relative}.cpd-top{display:flex;align-items:center;gap:12px;flex-wrap:wrap}.cpd-gem{width:44px;height:44px;flex:none;filter:drop-shadow(0 4px 14px rgba(191,233,255,.6))}' +
    '.cpd h3{margin:0;font-size:22px;font-weight:800;letter-spacing:.02em;background:linear-gradient(90deg,#fff,var(--cpd-ice) 40%,var(--cpd-vio));-webkit-background-clip:text;background-clip:text;color:transparent}' +
    '.cpd-line{margin:2px 0 0;font-weight:800;font-size:15px;color:#fff}.cpd-tagl{margin:2px 0 0;font-size:13px;color:#b9c7dc}' +
    '.cpd-sugg{margin-left:auto;font-size:10.5px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;padding:5px 9px;border-radius:99px;border:1px dashed rgba(191,233,255,.6);color:var(--cpd-ice)}' +
    '.cpd-pk{display:grid;gap:10px;margin:16px 0 4px;grid-template-columns:1fr}@media(min-width:720px){.cpd-pk{grid-template-columns:repeat(3,1fr)}}' +
    '.cpd-p{padding:14px 14px 12px;border-radius:14px;background:rgba(255,255,255,.05);border:1px solid rgba(191,233,255,.22)}.cpd-p.std{border-color:rgba(191,233,255,.7);box-shadow:inset 0 0 0 1px rgba(191,233,255,.25)}' +
    '.cpd-p b{display:block;font-size:14px}.cpd-p .amt{display:flex;align-items:baseline;gap:4px;margin:4px 0 2px}.cpd-p .amt strong{font-size:26px;font-weight:800;letter-spacing:-.02em}.cpd-p .amt span{font-size:12px;color:#b9c7dc}' +
    '.cpd-p small{display:block;font-size:12px;color:#b9c7dc}.cpd-p ul{margin:8px 0 0;padding:0;list-style:none;display:grid;gap:4px;font-size:12.5px}.cpd-p li{padding-left:16px;position:relative}.cpd-p li:before{content:"◆";position:absolute;left:0;font-size:9px;top:3px;color:var(--cpd-ice)}' +
    '.cpd-req{margin:12px 0 0;font-size:13px;color:#dbe7f7}.cpd-req b{color:#f5cf5a}.cpd-cta{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:14px}' +
    '.cpd-btn{display:inline-grid;place-items:center;min-height:46px;padding:0 20px;border-radius:12px;font-weight:800;font-size:15px;text-decoration:none;color:#0b1020;background:linear-gradient(135deg,#ffffff,#bfe9ff 45%,#c9b8ff);box-shadow:0 10px 30px -10px rgba(191,233,255,.8)}' +
    '.cpd-fine{font-size:11.5px;color:#9fb0c8;margin:0}.cpd.compact .cpd-p ul{display:none}';
  var GEM = '<svg class="cpd-gem" viewBox="0 0 48 48" aria-hidden="true"><defs><linearGradient id="cpdg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".5" stop-color="#bfe9ff"/><stop offset="1" stop-color="#9f8bff"/></linearGradient></defs>' +
    '<path d="M12 6h24l9 12-21 25L3 18z" fill="url(#cpdg)"/><path d="M3 18h42M12 6l6 12 6-12 6 12 6-12M18 18l6 25 6-25" fill="none" stroke="#0d1424" stroke-opacity=".35" stroke-width="1.2"/></svg>';
  function diamond(o) {
    o = o || {}; var X = D.diamond; if (!X) return '';
    if (!document.getElementById('cpd-css')) { var st = document.createElement('style'); st.id = 'cpd-css'; st.textContent = DCSS; document.head.appendChild(st); }
    var P = X.packages, lo = P[0].price, std = (P.filter(function (p) { return p.standard; })[0] || P[1] || P[0]).price, gold = D.tiers[X.requires] || D.tiers.gold;
    var pk = P.map(function (p) { return '<div class="cpd-p' + (p.standard ? ' std' : '') + '" data-pkg="' + esc(p.id) + '"><b>' + esc(p.label) + (p.standard ? ' · standard' : '') + '</b><div class="amt"><strong>' + money(p.price) + '</strong><span>one-time · suggested</span></div>' +
      '<small>About ' + esc(p.days) + ' business days · ' + p.revisions + ' revision round' + (p.revisions === 1 ? '' : 's') + '</small><ul>' + p.includes.map(function (i) { return '<li>' + esc(i) + '</li>'; }).join('') + '</ul></div>'; }).join('');
    return '<div class="cpd' + (o.compact ? ' compact' : '') + '" data-tier="diamond"><div class="cpd-top">' + GEM + '<div><h3>' + esc(X.label) + '</h3><p class="cpd-line">' + esc(X.tagline) + ' · from ' + money(lo) + '/' + money(std) + ' + Gold</p>' +
      '<p class="cpd-tagl">JB (with Duke) designs your page 1:1. Messages, bookings, alerts, analytics and your hub stay exactly the same.</p></div>' + (X.suggested ? '<span class="cpd-sugg">Suggested prices · pending approval</span>' : '') + '</div>' +
      '<div class="cpd-pk">' + pk + '</div><p class="cpd-req">Requires <b>Gold</b> (' + money(gold.monthly) + '/mo) to keep the custom design live' + (X.firstMonthIncluded ? '. <b>First month of Gold included.</b>' : '.') + '</p>' +
      '<div class="cpd-cta"><a class="cpd-btn" href="' + esc(o.href || 'diamond/') + '">' + esc(X.cta || 'Book a design call') + ' →</a><p class="cpd-fine">Sends a request to JB. No payment on this site; quotes and deposits are handled after the call.</p></div></div>';
  }
  window.CPPricing = { data: D, money: money, perMonth: perMonth, price: price, label: label, render: render, mount: mount, css: css, diamond: diamond };
})();
