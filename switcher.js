/* Preview-only switcher: vertical row (Music | Tattoo | Lash | Hub) + tier row (Bronze | Silver | Gold | Compare). */
(function () {
  if (window !== window.top) return;
  var s = document.querySelector('script[src*="switcher.js"]'); if (!s) return;
  var ROOT = new URL('.', s.src), rel = location.pathname.replace(/index\.html$/, '').slice(new URL(ROOT).pathname.length);
  var vert = /^tattoo/.test(rel) ? 'tattoo' : /^lash/.test(rel) ? 'lash' : /^hub/.test(rel) ? 'hub' : 'music';
  var sub = vert === 'music' ? rel : rel.replace(/^[a-z]+\//, '');
  var cur = /^bronze/.test(sub) ? 'bronze' : /^silver/.test(sub) ? 'silver' : /^compare/.test(sub) ? 'compare' : /^gold/.test(sub) ? 'gold' : (vert === 'lash' ? 'silver' : 'gold');
  var nav = document.createElement('nav'); nav.className = 'tier-switcher'; nav.setAttribute('aria-label', 'Preview');
  var mk = function (cls) { var d = document.createElement('div'); d.className = cls; nav.appendChild(d); return d; };
  var vrow = mk('tier-switcher-seg vrow');
  [['music', 'Music', 'gold/'], ['tattoo', 'Tattoo', 'tattoo/gold/'], ['lash', 'Lash', 'lash/silver/'], ['hub', 'Hub', 'hub/']].forEach(function (v) {
    var a = document.createElement('a'); a.href = new URL(v[2] + (v[0] === 'hub' ? '' : '?nointro=1'), ROOT).href; a.textContent = v[1]; a.dataset.v = v[0];
    if (vert === v[0]) a.setAttribute('aria-current', 'page'); vrow.appendChild(a); });
  if (vert !== 'hub') {
    var seg = mk('tier-switcher-seg'); seg.setAttribute('role', 'tablist');
    var pre = vert === 'music' ? '' : vert + '/';
    [['bronze', 'Bronze'], ['silver', 'Silver'], ['gold', 'Gold']].forEach(function (t) {
      var a = document.createElement('a'); a.href = new URL(pre + t[0] + '/?nointro=1', ROOT).href; a.textContent = t[1]; a.dataset.tier = t[0]; a.setAttribute('role', 'tab');
      a.setAttribute('aria-selected', String(cur === t[0])); if (cur === t[0]) a.setAttribute('aria-current', 'page');
      a.addEventListener('click', function () { try { sessionStorage.setItem('hh-preview-scroll', String(scrollY || 0)); } catch (e) {} });
      seg.appendChild(a); });
    var cmp = document.createElement('a'); cmp.className = 'tier-switcher-seg-cmp'; cmp.href = new URL('compare.html', ROOT).href; cmp.textContent = 'Compare'; if (cur === 'compare') cmp.setAttribute('aria-current', 'page');
    seg.appendChild(cmp);
  }
  document.body.appendChild(nav); document.body.classList.add('has-tier-switcher');
  var sync = function () { document.documentElement.style.setProperty('--tier-switch-h', Math.ceil(nav.getBoundingClientRect().height) + 'px'); }; sync(); addEventListener('resize', sync);
  try { var r = sessionStorage.getItem('hh-preview-scroll'); if (r !== null && cur !== 'compare') { var y = +r || 0; [0, 60, 300].forEach(function (d) { setTimeout(function () { scrollTo(0, y); }, d); }); sessionStorage.removeItem('hh-preview-scroll'); } } catch (e) {}
})();
