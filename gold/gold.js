/* GOLD experience layer: intro, depth parallax, Web Audio preview + reactive visuals,
   scroll scenes + section grading, era coverflow, 3D merch, tap/cursor effects, signature motion. */
(function () {
  const CP = window.CP; if (!CP) return;
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
    if (chapter) { chapter.classList.toggle('on', hero && y > hero.offsetHeight * 0.6 && !STATIC); chapter.style.setProperty('--prog', Math.min(1, y / (document.body.scrollHeight - vh))); }
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

  /* ---------- audio: placeholder beat (Web Audio) or licensed preview ---------- */
  const A = cfg.audio || {}; const BPM = A.bpm || 92; const STYLE = A.style || 'bounce';
  let ctx, analyser, data, playing = false, nextT = 0, step = 0, timer;
  const ROOTS = { bounce: [57, 53, 60, 55], electro: [45, 45, 48, 43], trap: [41, 41, 44, 39], soul: [50, 55, 48, 53] }[STYLE] || [57, 53, 60, 55];
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
  function voice(t, type, f0, f1, dur, gain, dest) {
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.setValueAtTime(f0, t); if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g).connect(dest); o.start(t); o.stop(t + dur + .02);
  }
  let noiseBuf;
  function noise(t, dur, gain, hp, dest) {
    const s = ctx.createBufferSource(); s.buffer = noiseBuf; const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = hp; const g = ctx.createGain();
    g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(f).connect(g).connect(dest); s.start(t); s.stop(t + dur);
  }
  function schedule() {
    const spb = 60 / BPM / 4;
    while (nextT < ctx.currentTime + 0.12) {
      const s = step % 16, bar = Math.floor(step / 16) % 4, t = nextT, out = ctx._bus;
      const kick = STYLE === 'electro' ? s % 4 === 0 : [0, 6, 8, 11].includes(s);
      if (kick) voice(t, 'sine', 150, 42, .32, .9, out);
      if (s === 4 || s === 12) noise(t, .18, .45, 1500, out);
      if (s % 2 === 0 || STYLE === 'trap') noise(t, .04, s % 4 === 2 ? .16 : .08, 7000, out);
      if (s === 0 || s === 8 || (STYLE === 'electro' && s % 4 === 2)) voice(t, STYLE === 'electro' ? 'sawtooth' : 'triangle', mtof(ROOTS[bar] - 12), 0, spb * 3.5, .28, out);
      if (s === 0) [0, 3, 7, 10].forEach((iv, k) => voice(t + k * .01, 'triangle', mtof(ROOTS[bar] + 12 + (STYLE === 'bounce' ? [0, 4, 7, 11][k] : iv)), 0, spb * 14, .045, out));
      if (STYLE === 'bounce' && (s === 3 || s === 10 || s === 14)) voice(t, 'square', mtof(ROOTS[bar] + 24 + [7, 4, 12][[3, 10, 14].indexOf(s)]), 0, .12, .035, out);
      nextT += spb; step++;
    }
  }
  function startAudio() {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    if (!analyser) {
      analyser = ctx.createAnalyser(); analyser.fftSize = 128; data = new Uint8Array(analyser.frequencyBinCount);
      const master = ctx.createGain(); master.gain.value = .55; master.connect(analyser).connect(ctx.destination);
      const comp = ctx.createDynamicsCompressor(); comp.connect(master); ctx._bus = comp;
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate * .5, ctx.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      if (A.preview_url) { const el = new Audio(A.preview_url); el.crossOrigin = 'anonymous'; el.loop = true; ctx._el = el; ctx.createMediaElementSource(el).connect(master); }
    }
    ctx.resume(); playing = true;
    if (ctx._el) ctx._el.play(); else { nextT = ctx.currentTime + .05; step = 0; timer = setInterval(schedule, 25); }
  }
  function stopAudio() { playing = false; clearInterval(timer); if (ctx && ctx._el) ctx._el.pause(); }
  document.querySelectorAll('[data-act=preview]').forEach(b => b.addEventListener('click', e => {
    e.stopPropagation();
    if (playing) { stopAudio(); b.classList.remove('on'); b.querySelector('span').firstChild.textContent = b.classList.contains('g-audio') ? 'Preview beat' : 'Play preview'; }
    else { startAudio(); b.classList.add('on'); b.querySelector('span').firstChild.textContent = 'Pause preview'; }
  }));

  /* simulated groove when no audio is playing (keeps the page breathing; also used for stills) */
  function simLevels(t) {
    const beat = (t / 1000) * BPM / 60; const ph = beat % 1; const kickEnv = Math.exp(-ph * 5.5);
    const out = new Array(48);
    for (let i = 0; i < 48; i++) { const f = i / 48; out[i] = Math.max(0, Math.min(1, (1 - f) * kickEnv * .9 + .25 * Math.abs(Math.sin(t / 260 + i * 0.7)) * (0.4 + f * .6) + .12 * Math.sin(t / 900 + i))); }
    return { bars: out, low: kickEnv };
  }
  function levels(t) {
    if (playing && analyser) { analyser.getByteFrequencyData(data); const bars = [...data].slice(0, 48).map(v => v / 255); const low = (bars[1] + bars[2] + bars[3]) / 3; return { bars, low }; }
    return simLevels(STATIC ? 640 : t);
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
  const N = sig === 'hearts' ? 16 : 18;
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
    if (wm) wm.style.transform = `${sig === 'hearts' ? 'rotate(-4deg) ' : ''}translate3d(${(tx * -6).toFixed(2)}px, ${(sy * -0.12).toFixed(1)}px, 0) scale(${(1 + L.low * .035).toFixed(3)})`;
    drawViz(L); drawFx(t, L);
    if (live) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

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
