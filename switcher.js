/* Preview-only tier switcher: Bronze | Silver | Gold + Compare. Video is a Gold option (toggle on the Gold hero). */
(function () {
  if (window !== window.top) return;
  var s = document.querySelector('script[src*="switcher.js"]'); if (!s) return;
  var ROOT = new URL('.', s.src), path = location.pathname.replace(/index\.html$/, ''), rel = path.slice(new URL(ROOT).pathname.length);
  var cur = /^bronze/.test(rel) ? 'bronze' : /^silver/.test(rel) ? 'silver' : /^compare/.test(rel) ? 'compare' : 'gold';
  var nav = document.createElement('nav'); nav.className = 'tier-switcher'; nav.setAttribute('aria-label', 'Preview tier');
  var seg = document.createElement('div'); seg.className = 'tier-switcher-seg'; seg.setAttribute('role', 'tablist');
  [['bronze', 'Bronze'], ['silver', 'Silver'], ['gold', 'Gold']].forEach(function (t) {
    var a = document.createElement('a'); a.href = new URL(t[0] + '/?nointro=1', ROOT).href; a.textContent = t[1]; a.dataset.tier = t[0]; a.setAttribute('role', 'tab');
    a.setAttribute('aria-selected', String(cur === t[0])); if (cur === t[0]) a.setAttribute('aria-current', 'page');
    a.addEventListener('click', function () { try { sessionStorage.setItem('hh-preview-scroll', String(scrollY || 0)); } catch (e) {} });
    seg.appendChild(a);
  });
  var cmp = document.createElement('a'); cmp.className = 'tier-switcher-seg-cmp'; cmp.href = new URL('compare.html', ROOT).href; cmp.textContent = 'Compare'; if (cur === 'compare') cmp.setAttribute('aria-current', 'page');
  seg.appendChild(cmp); nav.appendChild(seg); document.body.appendChild(nav); document.body.classList.add('has-tier-switcher');
  var sync = function () { document.documentElement.style.setProperty('--tier-switch-h', Math.ceil(nav.getBoundingClientRect().height) + 'px'); }; sync(); addEventListener('resize', sync);
  try { var r = sessionStorage.getItem('hh-preview-scroll'); if (r !== null && cur !== 'compare') { var y = +r || 0; [0, 60, 300].forEach(function (d) { setTimeout(function () { scrollTo(0, y); }, d); }); sessionStorage.removeItem('hh-preview-scroll'); } } catch (e) {}
})();
