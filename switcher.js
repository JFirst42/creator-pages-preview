(function () {
  if (window !== window.top) return;

  var script = document.querySelector('script[src*="switcher.js"]');
  if (!script || !script.src) return;
  var ROOT = new URL('.', script.src);
  var path = location.pathname.replace(/index\.html$/, '');
  var current = 'gold';
  if (/\/gold-video\/?$/.test(path)) current = 'gold-video';
  else if (/\/gold\/?$/.test(path)) current = 'gold';
  else if (/\/silver\/?$/.test(path)) current = 'silver';
  else if (/\/bronze\/?$/.test(path)) current = 'bronze';
  else if (/compare(\.html)?\/?$/.test(path)) current = 'compare';

  var TIERS = [
    { id: 'bronze', label: 'Bronze' },
    { id: 'silver', label: 'Silver' },
    { id: 'gold', label: 'Gold' },
    { id: 'gold-video', label: 'Gold·Video' }
  ];
  var SCROLL_KEY = 'hh-preview-scroll';

  var nav = document.createElement('nav');
  nav.className = 'tier-switcher';
  nav.setAttribute('aria-label', 'Preview tier');

  var seg = document.createElement('div');
  seg.className = 'tier-switcher-seg';
  seg.setAttribute('role', 'tablist');
  TIERS.forEach(function (t) {
    var a = document.createElement('a');
    a.href = new URL(t.id + '/?nointro=1', ROOT).href;
    a.textContent = t.label;
    a.dataset.tier = t.id;
    a.setAttribute('role', 'tab');
    if (current === t.id) {
      a.setAttribute('aria-current', 'page');
      a.setAttribute('aria-selected', 'true');
    } else {
      a.setAttribute('aria-selected', 'false');
    }
    a.addEventListener('click', function () {
      try { sessionStorage.setItem(SCROLL_KEY, String(window.scrollY || 0)); } catch (e) {}
    });
    seg.appendChild(a);
    try {
      var hint = document.createElement('link');
      hint.rel = 'prefetch';
      hint.href = new URL(t.id + '/', ROOT).href;
      document.head.appendChild(hint);
    } catch (e) {}
  });

  var compare = document.createElement('a');
  compare.className = 'tier-switcher-compare';
  compare.href = new URL('compare.html', ROOT).href;
  compare.textContent = 'Compare side by side';
  if (current === 'compare') compare.setAttribute('aria-current', 'page');
  nav.appendChild(seg);
  nav.appendChild(compare);
  document.body.appendChild(nav);
  document.body.classList.add('has-tier-switcher');

  function sync() {
    var h = Math.ceil(nav.getBoundingClientRect().height);
    document.documentElement.style.setProperty('--tier-switch-h', h + 'px');
  }
  sync();
  window.addEventListener('resize', sync);
  if (window.visualViewport) window.visualViewport.addEventListener('resize', sync);

  try {
    var raw = sessionStorage.getItem(SCROLL_KEY);
    if (raw !== null && current !== 'compare') {
      var top = Number(raw) || 0;
      var apply = function () { window.scrollTo(0, top); };
      apply();
      requestAnimationFrame(apply);
      setTimeout(apply, 60);
      setTimeout(apply, 300);
      sessionStorage.removeItem(SCROLL_KEY);
    }
  } catch (e) {}
})();
