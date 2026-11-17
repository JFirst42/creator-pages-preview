/* Preview-only switcher (round 6): one compact row = Trade dropdown + Bronze | Silver | Gold + Compare; Look row only on Silver/Gold. 44px targets. */
(function () {
  if (window !== window.top) return;
  var s = document.querySelector('script[src*="switcher.js"]'); if (!s) return;
  var ROOT = new URL('.', s.src), rel = location.pathname.replace(/index\.html$/, '').slice(new URL(ROOT).pathname.length);
  var TRADES = [['music', 'Music'], ['tattoo', 'Tattoo'], ['lash', 'Lash'], ['barber', 'Barber'], ['hair', 'Hair'], ['nail', 'Nails'], ['painter', 'Painter'], ['streamer', 'Streamer'], ['hub', 'Creator hub']];
  var first = rel.split('/')[0]; var vert = TRADES.some(function (t) { return t[0] === first && t[0] !== 'music'; }) ? first : 'music';
  var sub = vert === 'music' ? rel : rel.replace(/^[a-z]+\//, '');
  var cur = /^bronze/.test(sub) ? 'bronze' : /^silver/.test(sub) ? 'silver' : /^compare/.test(sub) ? 'compare' : 'gold';
  var nav = document.createElement('nav'); nav.className = 'tier-switcher'; nav.setAttribute('aria-label', 'Preview switcher');
  var mk = function (cls) { var d = document.createElement('div'); d.className = cls; nav.appendChild(d); return d; };
  var pre = vert === 'music' ? '' : vert + '/';
  var looks = (document.documentElement.dataset.looks || '').split(',').filter(Boolean);
  if (vert !== 'hub' && (cur === 'gold' || cur === 'silver')) {
    var now = document.documentElement.dataset.lookNow || 'art';
    var lrow = mk('tier-switcher-seg lrow'); var lb = document.createElement('span'); lb.textContent = 'Look'; lb.setAttribute('aria-hidden', 'true'); lrow.appendChild(lb);
    [['art', 'Art'], ['studio', 'Studio'], ['brand', 'My brand']].forEach(function (l) {
      var ok = looks.indexOf(l[0]) >= 0; var a = document.createElement('a'); var q = new URLSearchParams(location.search); q.set('look', l[0]); q.set('nointro', '1');
      a.href = ok ? location.pathname + '?' + q.toString() : new URL(pre + 'gold/?look=' + l[0] + '&nointro=1', ROOT).href; a.dataset.look = l[0];
      a.textContent = l[1] + (ok ? (cur === 'silver' && l[0] !== 'art' ? ' 🔒' : '') : ' · Gold'); a.setAttribute('aria-label', 'Look: ' + a.textContent);
      if (now === l[0]) a.setAttribute('aria-current', 'page'); lrow.appendChild(a); });
  }
  var row = mk('tier-switcher-row');
  var wrap = document.createElement('label'); wrap.className = 'ts-trade';
  var sel = document.createElement('select'); sel.setAttribute('aria-label', 'Trade (sample page)');
  TRADES.forEach(function (t) { var o = document.createElement('option'); o.value = t[0]; o.textContent = t[1]; if (t[0] === vert) o.selected = true; sel.appendChild(o); });
  sel.addEventListener('change', function () { var v = sel.value; location.href = new URL(v === 'hub' ? 'hub/' : (v === 'music' ? '' : v + '/') + (cur === 'compare' ? 'gold' : cur) + '/?nointro=1', ROOT).href; });
  var tl = document.createElement('span'); tl.className = 'ts-k'; tl.textContent = 'Trade'; tl.setAttribute('aria-hidden', 'true');
  wrap.appendChild(tl); wrap.appendChild(sel); row.appendChild(wrap);
  if (vert !== 'hub') {
    var seg = document.createElement('div'); seg.className = 'tier-switcher-seg tiers'; row.appendChild(seg);
    [['bronze', 'Bronze'], ['silver', 'Silver'], ['gold', 'Gold']].forEach(function (t) {
      var a = document.createElement('a'); a.href = new URL(pre + t[0] + '/?nointro=1', ROOT).href; a.textContent = t[1]; a.dataset.tier = t[0];
      if (cur === t[0]) a.setAttribute('aria-current', 'page');
      a.addEventListener('click', function () { try { sessionStorage.setItem('hh-preview-scroll', String(scrollY || 0)); } catch (e) {} });
      seg.appendChild(a); });
  }
  var cmp = document.createElement('a'); cmp.className = 'ts-cmp'; cmp.href = new URL('compare.html', ROOT).href; cmp.textContent = 'Compare'; if (cur === 'compare') cmp.setAttribute('aria-current', 'page');
  row.appendChild(cmp);
  document.body.appendChild(nav); document.body.classList.add('has-tier-switcher');
  var sync = function () { document.documentElement.style.setProperty('--tier-switch-h', Math.ceil(nav.getBoundingClientRect().height) + 'px'); }; sync(); addEventListener('resize', sync);
  try { var r = sessionStorage.getItem('hh-preview-scroll'); if (r !== null && cur !== 'compare') { var y = +r || 0; [0, 60, 300].forEach(function (d) { setTimeout(function () { scrollTo(0, y); }, d); }); sessionStorage.removeItem('hh-preview-scroll'); } } catch (e) {}
})();
