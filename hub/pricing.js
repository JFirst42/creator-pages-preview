/* Round 10 pricing component (compare page, intake, hub). Data comes from template/pricing.json, inlined at build time by generator/pricing.py.
   Monthly / yearly toggle, Gold highlighted as "Most popular". Payment happens on Whop; nothing here takes money (test mode: no live checkout). */
(function () {
  var D = {"currency": "USD", "popular": "gold", "yearlyLabel": "2 months free", "tiers": {"bronze": {"monthly": 9, "yearly": 90, "label": "Bronze", "tagline": "Clean, still preset", "save": 18, "highlights": ["Art-matched hero (cover, title, artist)", "Smart links to every streaming app", "Social icon row", "QR code for the page (posters, merch tables)"]}, "silver": {"monthly": 19, "yearly": 190, "label": "Silver", "tagline": "Polished motion preset", "save": 38, "highlights": ["Everything in Bronze", "Tabbed sections (preset)", "Embedded video / music players", "Project ecosystem: tracklist + more releases", "Release countdown that flips to OUT NOW"]}, "gold": {"monthly": 29, "yearly": 290, "label": "Gold", "tagline": "Custom experience", "save": 58, "highlights": ["Everything in Silver", "Merch / beats showcase + store buttons (link out to their Shopify, BeatStars...)", "Tour & show dates", "Tip buttons to their own Cash App / PayPal / Ko-fi", "Credits"]}}};
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
  window.CPPricing = { data: D, money: money, perMonth: perMonth, price: price, label: label, render: render, mount: mount, css: css };
})();
