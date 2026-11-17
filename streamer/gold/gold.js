/* GOLD experience layer: intro, depth parallax, Web Audio preview + reactive visuals,
   scroll scenes + section grading, era coverflow, 3D merch, tap/cursor effects, signature motion. */
(function () {
  const CP = window.CP; if (!CP) return;
  if (CP.LOOK && CP.LOOK !== 'art') return; // Studio / My brand looks are calm boutique skins: no cinematic layer
  const { cfg, STATIC, EXPAND } = CP;
  const root = document.documentElement;
  const sig = cfg.theme.signature || 'sparkle';
  const pal = cfg.theme.palette;
  document.body.classList.add('sig-' + sig);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const live = !STATIC && !reduce;

  /* ---------- section grading + chapter bar + scroll scenes ---------- */
  const scenes = [...document.querySelectorAll('.scene')];
  const hero = document.querySelector('.g-hero');
  const chapter = document.querySelector('.g-chapter');
  root.style.setProperty('--grade', pal.acc); root.style.setProperty('--grade2', pal.acc2);
  let lastCh = -2, chT, chOn = false;
  function onScroll() {
    const vh = innerHeight, y = scrollY;
    let cur = -1;
    scenes.forEach((s, i) => {
      const r = s.getBoundingClientRect();
      const p = Math.max(0, Math.min(1, (vh - r.top) / (vh * 0.55)));
      if (!EXPAND && !STATIC) s.style.setProperty('--p', p.toFixed(3));
      if (r.top < vh * 0.5) cur = i;
    });
    if (cur >= 0) {
      const s = scenes[cur]; root.style.setProperty('--grade', s.dataset.grade); root.style.setProperty('--grade2', s.dataset.grade2 || pal.acc2);
      if (chapter) { chapter.querySelector('b').textContent = String(cur + 1).padStart(2, '0'); chapter.querySelector('span').textContent = s.dataset.name; }
    } else { root.style.setProperty('--grade', pal.acc); root.style.setProperty('--grade2', pal.acc2); }
    if (chapter) { // round 4: the chapter pill only flashes on a chapter change (1.6s), and never while a form is in view, so it can't cover content
      const past = hero && y > hero.offsetHeight * 0.6 && !STATIC;
      const formNear = [...document.querySelectorAll('form, .intake, [data-form]')].some(f => { const r = f.getBoundingClientRect(); return r.top < 110 && r.bottom > 40; });
      if (cur !== lastCh) { lastCh = cur; clearTimeout(chT); chOn = true; chT = setTimeout(() => { chOn = false; chapter.classList.remove('on'); }, 1600); }
      chapter.classList.toggle('on', past && chOn && !formNear && !(document.activeElement && document.activeElement.closest && document.activeElement.closest('form')));
      chapter.style.setProperty('--prog', Math.min(1, y / (document.body.scrollHeight - vh))); }
    eras();
  }
  addEventListener('scroll', onScroll, { passive: true });

  /* ---------- era coverflow ---------- */
  const rail = document.querySelector('.eras');
  function eras() {
    if (!rail) return; const c = rail.getBoundingClientRect(); const mid = c.left + c.width / 2;
    rail.querySelectorAll('.era').forEach(e => { const r = e.getBoundingClientRect(); const d = (r.left + r.width / 2 - mid) / c.width; e.style.setProperty('--ry', `${(-d * 38).toFixed(1)}deg`); e.style.setProperty('--sc', (1 - Math.min(.14, Math.abs(d) * .16)).toFixed(3)); });
  }
  rail && rail.addEventListener('scroll', eras, { passive: true });

  /* ---------- audio: the creator's own uploaded track (round 4) ----------
     app.js owns the <audio> element + controls (CP.music); on the first tap we route it through an analyser so the
     visualizer reads the real track. No music = no visualizer at all (the hero shows the trade's motion accent instead). */
  const BPM = (cfg.audio || {}).bpm || 90;
  let ctx, analyser, data, playing = false;
  document.addEventListener('cp:music', e => {
    const M = CP.music; if (!M) return;
    if (e.detail && e.detail.playing) {
      try {
        ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
        if (!analyser) { analyser = ctx.createAnalyser(); analyser.fftSize = 128; analyser.smoothingTimeConstant = .72; data = new Uint8Array(analyser.frequencyBinCount);
          ctx.createMediaElementSource(M.el).connect(analyser); analyser.connect(ctx.destination); }
        ctx.resume();
      } catch (err) { /* analyser unavailable: audio still plays, bars fall back to the idle groove */ }
      playing = true;
    } else playing = false;
  });

  /* idle groove for the bars while the track is paused (only exists when a track was uploaded); also used for stills */
  function simLevels(t, amt) {
    const beat = (t / 1000) * BPM / 60; const ph = beat % 1; const kickEnv = Math.exp(-ph * 5.5);
    const out = new Array(48);
    for (let i = 0; i < 48; i++) { const f = i / 48; out[i] = amt * Math.max(0, Math.min(1, (1 - f) * kickEnv * .9 + .25 * Math.abs(Math.sin(t / 260 + i * 0.7)) * (0.4 + f * .6) + .12 * Math.sin(t / 900 + i))); }
    return { bars: out, low: kickEnv * amt };
  }
  const HAS_TRACK = !!CP.music;
  function levels(t) {
    if (playing && analyser) { analyser.getByteFrequencyData(data); const bars = [...data].slice(0, 48).map(v => v / 255); const low = (bars[1] + bars[2] + bars[3]) / 3; return { bars, low }; }
    if (HAS_TRACK) return simLevels(STATIC ? 640 : t, STATIC ? 1 : .35);
    return { bars: [], low: .06 + .05 * Math.sin(t / 1700) }; // no music: slow breathing only, no beat
  }

  /* ---------- visualizer ---------- */
  const viz = document.querySelector('.g-viz'); const vx = viz && viz.getContext('2d');
  const DPR = Math.min(2, devicePixelRatio || 1);
  function sizeViz() { if (!viz) return; viz.width = viz.clientWidth * DPR; viz.height = viz.clientHeight * DPR; }
  sizeViz(); addEventListener('resize', sizeViz);
  function drawViz(L) {
    if (!vx) return; const W = viz.width, H = viz.height; vx.clearRect(0, 0, W, H);
    const n = 40, gap = 3 * DPR, bw = (W - gap * (n - 1)) / n;
    const g = vx.createLinearGradient(0, H, 0, 0); g.addColorStop(0, pal.acc); g.addColorStop(1, cfg.theme.wordmark.stroke || pal.acc2);
    vx.fillStyle = g;
    for (let i = 0; i < n; i++) {
      const k = Math.abs(i - n / 2) / (n / 2); const v = L.bars[Math.floor(k * 30)] || 0; const h = Math.max(3 * DPR, v * H * .92);
      const x = i * (bw + gap); vx.globalAlpha = .55 + v * .45; vx.beginPath(); vx.roundRect(x, H - h, bw, h, bw / 2); vx.fill();
    }
    vx.globalAlpha = 1;
  }

  /* ---------- depth parallax (pointer / device tilt / scroll / idle sway) ---------- */
  const layers = [...document.querySelectorAll('.g-layer')].map(el => ({ el, d: +el.dataset.depth || 0 }));
  const wm = document.querySelector('.g-hero .wm');
  let px = 0, py = 0, tx = 0, ty = 0, lastInput = -1e9;
  addEventListener('pointermove', e => { px = (e.clientX / innerWidth - .5) * 2; py = (e.clientY / innerHeight - .5) * 2; lastInput = performance.now(); }, { passive: true });
  addEventListener('deviceorientation', e => { if (e.gamma == null) return; px = Math.max(-1, Math.min(1, e.gamma / 25)); py = Math.max(-1, Math.min(1, (e.beta - 40) / 25)); lastInput = performance.now(); });

  /* ---------- signature ambient canvas ---------- */
  const fx = document.querySelector('.g-fx'); const fxx = fx && fx.getContext('2d'); let parts = [];
  function sizeFx() { if (!fx) return; fx.width = innerWidth * DPR; fx.height = innerHeight * DPR; }
  sizeFx(); addEventListener('resize', sizeFx);
  const heart = (c, x, y, s) => { c.beginPath(); c.moveTo(x, y + s * .3); c.bezierCurveTo(x, y, x - s * .5, y, x - s * .5, y + s * .3); c.bezierCurveTo(x - s * .5, y + s * .6, x, y + s * .8, x, y + s); c.bezierCurveTo(x, y + s * .8, x + s * .5, y + s * .6, x + s * .5, y + s * .3); c.bezierCurveTo(x + s * .5, y, x, y, x, y + s * .3); c.fill(); };
  const N = sig === 'none' ? 0 : sig === 'hearts' ? 16 : 18; // portfolio pages: no floating particles
  for (let i = 0; i < N; i++) parts.push({ x: Math.random(), y: Math.random(), s: (sig === 'hearts' ? 8 + Math.random() * 12 : 1 + Math.random() * 2) * DPR, v: .0004 + Math.random() * .0008, p: Math.random() * 6.28, c: [pal.acc, cfg.theme.wordmark.stroke || pal.acc2, pal.text][i % 3] });
  /* extra effects requested in the intake ("add falling hearts", "make it rainy") */
  const EFFECTS = cfg.effects || []; const SPEED = cfg.motion === 'high' ? 1.8 : cfg.motion === 'low' ? .5 : 1;
  if (EFFECTS.includes('glitch') && !document.querySelector('.g-scan')) { document.body.insertAdjacentHTML('afterbegin', '<div class="g-scan"></div>'); }
  const fxParts = [];
  EFFECTS.forEach(e => { const n = { rain: 90, hearts: 24, sparkles: 26 }[e] || 0; for (let i = 0; i < n; i++) fxParts.push({ e, x: Math.random(), y: Math.random(), v: e === 'rain' ? .012 + Math.random() * .01 : .0012 + Math.random() * .0016, s: e === 'rain' ? (14 + Math.random() * 18) * DPR : (10 + Math.random() * 12) * DPR, p: Math.random() * 6.28, c: [pal.acc, cfg.theme.wordmark.stroke || pal.acc2, '#ffffff'][i % 3] }); });
  function drawEffects(t, L) {
    if (!fxParts.length) return; const W = fx.width, H = fx.height;
    for (const q of fxParts) {
      if (live) { q.y += q.v * SPEED; if (q.e === 'rain') q.x -= q.v * .18 * SPEED; if (q.y > 1.05) { q.y = -.05; q.x = Math.random() * 1.1; } }
      const x = q.x * W, y = q.y * H;
      if (q.e === 'rain') { fxx.strokeStyle = 'rgba(200,220,255,.35)'; fxx.lineWidth = 1.2 * DPR; fxx.beginPath(); fxx.moveTo(x, y); fxx.lineTo(x - q.s * .18, y + q.s); fxx.stroke(); }
      else if (q.e === 'hearts') { fxx.globalAlpha = .8; fxx.fillStyle = q.c; heart(fxx, x + Math.sin(t / 600 + q.p) * 10 * DPR, y, q.s * 1.3); fxx.globalAlpha = 1; }
      else if (q.e === 'sparkles') { const a = Math.max(0, Math.sin(t / 400 + q.p)); fxx.globalAlpha = a; fxx.fillStyle = '#fff'; fxx.beginPath(); const r = q.s * .6 * a; fxx.moveTo(x, y - r); fxx.lineTo(x + r * .25, y - r * .25); fxx.lineTo(x + r, y); fxx.lineTo(x + r * .25, y + r * .25); fxx.lineTo(x, y + r); fxx.lineTo(x - r * .25, y + r * .25); fxx.lineTo(x - r, y); fxx.lineTo(x - r * .25, y - r * .25); fxx.fill(); fxx.globalAlpha = 1; }
    }
  }
  function drawFx(t, L) {
    if (!fxx) return; const W = fx.width, H = fx.height; fxx.clearRect(0, 0, W, H);
    for (const p of parts) {
      if (live) { p.y -= p.v * (1 + L.low * 2); if (p.y < -.05) { p.y = 1.05; p.x = Math.random(); } }
      const x = (p.x + Math.sin(t / 1800 + p.p) * .02) * W, y = p.y * H;
      fxx.globalAlpha = sig === 'hearts' ? .22 + .2 * Math.sin(t / 700 + p.p) : .35 + .5 * Math.abs(Math.sin(t / 300 + p.p));
      fxx.fillStyle = p.c;
      if (sig === 'hearts') heart(fxx, x, y, p.s * (1 + L.low * .15)); else { const q = p.s * (sig === 'glitch' ? 2.2 : 1); fxx.shadowColor = p.c; fxx.shadowBlur = 8 * DPR; fxx.fillRect(x, y, q, q); fxx.shadowBlur = 0; }
    }
    fxx.globalAlpha = 1;
    drawEffects(t, L);
    if ((sig === 'glitch' || EFFECTS.includes('glitch')) && live && (Math.floor(t / 100) % 37 === 0)) { // occasional screen tear
      document.body.style.transform = `translateX(${(Math.random() - .5) * 6}px)`; setTimeout(() => document.body.style.transform = '', 70);
    }
  }

  /* ---------- main loop ---------- */
  function frame(t) {
    const L = levels(t);
    root.style.setProperty('--beat', L.low.toFixed(3));
    if (performance.now() - lastInput > 2500) { px = Math.sin(t / 2300) * .55; py = Math.cos(t / 2900) * .35; }
    tx += (px - tx) * .08; ty += (py - ty) * .08;
    const sy = Math.min(scrollY, 900);
    layers.forEach(({ el, d }) => {
      const s = el.classList.contains('bg') ? 1 + L.low * .04 : el.classList.contains('fg') ? 1.03 + L.low * .025 : 1.02;
      el.style.transform = `translate3d(${(tx * 22 * d).toFixed(2)}px, ${(ty * 16 * d + sy * d * .35).toFixed(2)}px, 0) rotateY(${(tx * 5 * d).toFixed(2)}deg) rotateX(${(-ty * 4 * d).toFixed(2)}deg) scale(${s.toFixed(3)})`;
    });
    if (wm) wm.style.transform = `${sig === 'hearts' ? 'rotate(-4deg) ' : ''}translate3d(${(tx * -6).toFixed(2)}px, ${(sy * -0.03).toFixed(1)}px, 0) scale(${(1 + L.low * .035).toFixed(3)})`;
    drawViz(L); drawFx(t, L);
    if (live) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);


  /* ---------- hero background option: cover art 3D (depth layers) vs video / animated canvas loop ---------- */
  (function heroBg() {
    const box = document.querySelector('.g-vid'); if (!box) return;
    const btns = document.querySelectorAll('.g-bgt [data-bg]'); const vid = box.querySelector('video'); const cv = box.querySelector('canvas');
    const img = new Image(); img.src = cfg.cover || 'cover.jpg'; let on = false, raf = 0;
    const g = (cfg.theme.grades || [pal.acc, pal.acc2]);
    function frame(t) {
      if (!on) return; const r = box.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 1.5);
      if (cv.width !== Math.round(r.width * d)) { cv.width = Math.round(r.width * d); cv.height = Math.round(r.height * d); }
      const x = cv.getContext('2d'), W = cv.width, H = cv.height, b = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--beat')) || 0;
      x.fillStyle = pal.bg; x.fillRect(0, 0, W, H);
      if (img.naturalWidth) {  // slow push-in + pan, like a music-video loop
        const z = 1.18 + .1 * Math.sin(t / 5200) + b * .03, s = Math.max(W / img.naturalWidth, H * .78 / img.naturalHeight) * z;
        const dw = img.naturalWidth * s, dh = img.naturalHeight * s, px = (W - dw) / 2 + Math.sin(t / 3900) * W * .06, py = (H * .74 - dh) / 2 + Math.cos(t / 4700) * H * .025;
        x.drawImage(img, px, py, dw, dh);
        for (let i = 0; i < 3; i++) {  // beat glitch slices
          if (Math.sin(t / 90 + i * 7) > .93 - b * .25) { const y = (Math.sin(t / 310 + i * 3) * .5 + .5) * H * .7, h = H * (.01 + .02 * Math.abs(Math.sin(t / 50 + i))); x.drawImage(cv, 0, y, W, h, (Math.sin(t + i) * .5) * W * .04, y, W, h); }
        }
      }
      x.globalCompositeOperation = 'screen';
      for (let i = 0; i < 3; i++) {  // light leaks in the art's palette
        const cx = W * (.5 + .55 * Math.sin(t / (2600 + i * 900) + i * 2)), cy = H * (.3 + .3 * Math.cos(t / (3100 + i * 700) + i));
        const rg = x.createRadialGradient(cx, cy, 0, cx, cy, W * .7); rg.addColorStop(0, g[i % g.length] + '66'); rg.addColorStop(1, 'transparent'); x.fillStyle = rg; x.fillRect(0, 0, W, H);
      }
      x.globalCompositeOperation = 'source-over'; x.fillStyle = 'rgba(0,0,0,.18)'; for (let y = (t / 40) % 4; y < H; y += 4 * d) x.fillRect(0, y, W, d * .6);
      if (live) raf = requestAnimationFrame(frame);
    }
    function set(mode, user) {
      on = mode === 'video'; document.documentElement.dataset.herobg = on ? 'video' : 'art3d';
      btns.forEach(b => b.classList.toggle('on', b.dataset.bg === (on ? 'video' : 'art3d')));
      cancelAnimationFrame(raf); if (vid) { on ? vid.play().catch(() => {}) : vid.pause(); } else if (on) { img.complete ? frame(performance.now()) : (img.onload = () => frame(performance.now())); }
      if (user) { try { sessionStorage.setItem('cp-herobg-' + cfg.slug, document.documentElement.dataset.herobg); } catch (e) {} }
    }
    btns.forEach(b => b.addEventListener('click', () => set(b.dataset.bg, true)));
    let start = CP.qs.get('bg'); try { start = start || sessionStorage.getItem('cp-herobg-' + cfg.slug); } catch (e) {}
    set(start || cfg.hero_bg || 'art3d');
  })();

  /* ---------- 3D merch cards ---------- */
  document.querySelectorAll('.g-prod').forEach((c, i) => {
    c.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; c.style.setProperty('--ry', `${x * 18}deg`); c.style.setProperty('--rx', `${-y * 14}deg`); c.style.setProperty('--sx', `${(x + .5) * 100}%`); c.style.setProperty('--sy', `${(y + .5) * 100}%`); c._h = performance.now(); });
    c.addEventListener('pointerleave', () => { c._h = 0; });
    if (live) (function sway(t) { if (!c._h || performance.now() - c._h > 1500) { const a = Math.sin(t / 1400 + i * 1.3); c.style.setProperty('--ry', `${a * 8}deg`); c.style.setProperty('--rx', `${Math.cos(t / 1700 + i) * 5}deg`); c.style.setProperty('--sx', `${50 + a * 40}%`); } requestAnimationFrame(sway); })(0);
  });

  /* ---------- tap bursts + cursor ---------- */
  const glyph = sig === 'hearts' ? ['❤', '💖', '❤', '✦'] : sig === 'glitch' ? ['⚡', '▮', '✦', '⚡'] : ['✦', '✧', '•'];
  addEventListener('pointerdown', e => {
    for (let i = 0; i < 8; i++) {
      const s = document.createElement('span'); s.className = 'g-burst'; s.textContent = glyph[i % glyph.length];
      const a = (i / 8) * Math.PI * 2 + Math.random() * .4, r = 40 + Math.random() * 40;
      s.style.cssText = `--x0:${e.clientX - 9}px;--y0:${e.clientY - 12}px;--x1:${e.clientX - 9 + Math.cos(a) * r}px;--y1:${e.clientY - 12 + Math.sin(a) * r - 20}px;--r:${(Math.random() - .5) * 90}deg;color:${i % 2 ? pal.acc : (cfg.theme.wordmark.stroke || pal.acc2)}`;
      document.body.appendChild(s); setTimeout(() => s.remove(), 950);
    }
  });
  const cur = document.querySelector('.g-cursor');
  if (cur) addEventListener('pointermove', e => { cur.style.transform = `translate(${e.clientX}px,${e.clientY}px)`; const hot = e.target.closest('a,button'); cur.style.width = cur.style.height = hot ? '54px' : '34px'; cur.style.margin = hot ? '-27px 0 0 -27px' : '-17px 0 0 -17px'; });

  /* ---------- live chat ticker (streamer frame) ---------- */
  const chat = document.querySelector('.g-frame .chat');
  if (chat && live) { const msgs = cfg.live_chat || []; let k = 3; setInterval(() => { const m = msgs[k++ % msgs.length]; if (!m) return; const p = document.createElement('p'); p.innerHTML = `<b>${m[0]}</b> ${m[1]}`; chat.appendChild(p); while (chat.children.length > 3) chat.firstElementChild.remove(); }, 1400); }

  /* ---------- themed intro ---------- */
  const intro = document.querySelector('.g-intro');
  if (intro) { if (!live || EXPAND || CP.qs.has('nointro')) intro.remove(); else { setTimeout(() => intro.classList.add('out'), 1500); setTimeout(() => intro.remove(), 2600); } }

  /* ---------- fit wordmarks to width ---------- */
  function fit() { document.querySelectorAll('.wm').forEach(el => { el.style.fontSize = ''; const max = Math.min((el.closest('.g-copy') || document.body).clientWidth, innerWidth) - 24; let fs = parseFloat(getComputedStyle(el).fontSize); while (el.offsetWidth > max && fs > 22) { fs -= 2; el.style.fontSize = fs + 'px'; } }); }
  fit(); document.fonts && document.fonts.ready.then(fit); addEventListener('resize', fit);
  const im = new Image(); im.onload = () => root.style.setProperty('--art-ar', (im.naturalWidth / im.naturalHeight).toFixed(4)); im.src = cfg.cover || 'cover.jpg';
  onScroll();
})();
