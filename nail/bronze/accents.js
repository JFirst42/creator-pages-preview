/* Theme motion accents: shown instead of sound bars when a page has no music.
   Usage: <canvas data-accent="lashline"> anywhere; colors come from CSS vars (--acc, --acc2, --text).
   Silver gets its vertical's default; Gold picks one of 3+ per vertical (or none); Bronze gets none.
   window.CPAccents.draw(canvas, id, t) is also used by the hub to render live previews. */
(function () {
  const TAU = Math.PI * 2;
  const css = (el, v, d) => (getComputedStyle(el).getPropertyValue(v) || '').trim() || d;
  const sparkle = (x, cx, cy, r) => { x.beginPath(); x.moveTo(cx, cy - r); x.quadraticCurveTo(cx, cy, cx + r, cy); x.quadraticCurveTo(cx, cy, cx, cy + r); x.quadraticCurveTo(cx, cy, cx - r, cy); x.quadraticCurveTo(cx, cy, cx, cy - r); x.fill(); };
  const cl = v => Math.min(1, Math.max(0, v));
  const rnd = i => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
  const A = {
    waveform(x, W, H, t, c) { x.lineWidth = 2.2 * c.d; for (let k = 0; k < 3; k++) { x.strokeStyle = [c.acc, c.acc2, c.text][k]; x.globalAlpha = [.95, .6, .3][k]; x.beginPath();
      for (let i = 0; i <= W; i += 3) { const f = i / W, env = Math.sin(f * Math.PI); const y = H / 2 + env * H * .36 * Math.sin(f * (9 + k * 3) + t / (420 + k * 140)) * (0.6 + .4 * Math.sin(t / 900 + k)); i ? x.lineTo(i, y) : x.moveTo(i, y); } x.stroke(); } },
    lashline(x, W, H, t, c) { // an eyelid curve with lashes that flutter
      const cx = W / 2, w = Math.min(W * .78, H * 7), y0 = H * .32; x.strokeStyle = c.acc; x.lineCap = 'round';
      const blink = Math.max(0, Math.sin(t / 1300)) ** 24; // occasional flutter
      x.lineWidth = 2.4 * c.d; x.beginPath(); for (let i = 0; i <= 40; i++) { const f = i / 40, px = cx - w / 2 + f * w, py = y0 + Math.sin(f * Math.PI) * H * .3; i ? x.lineTo(px, py) : x.moveTo(px, py); } x.stroke();
      for (let i = 1; i < 34; i++) { const f = i / 34, px = cx - w / 2 + f * w, py = y0 + Math.sin(f * Math.PI) * H * .3;
        const len = H * (.22 + .3 * Math.sin(f * Math.PI)) * (1 - blink * .55), ang = Math.PI / 2 + (f - .5) * 1.5 + Math.sin(t / 380 + i * .6) * .07;
        x.lineWidth = 1.4 * c.d; x.globalAlpha = .55 + .45 * Math.sin(f * Math.PI); x.beginPath(); x.moveTo(px, py);
        x.quadraticCurveTo(px + Math.cos(ang) * len * .6, py + Math.sin(ang) * len * .5, px + Math.cos(ang - .5 * Math.sign(f - .5 || 1)) * len, py + Math.sin(ang) * len * .9 - len * .25); x.stroke(); }
      x.globalAlpha = 1; },
    shimmer(x, W, H, t, c) { for (let i = 0; i < 26; i++) { const a = Math.max(0, Math.sin(t / 520 + i * 1.7)); x.globalAlpha = a; x.fillStyle = i % 3 ? c.acc : c.text; sparkle(x, rnd(i) * W, (.2 + rnd(i + 9) * .6) * H, (3 + rnd(i + 3) * 6) * c.d * a); } x.globalAlpha = 1; },
    curl(x, W, H, t, c) { x.strokeStyle = c.acc; x.lineCap = 'round'; for (let i = 0; i < 9; i++) { const px = ((i / 9) * W + t / 40 * c.d) % (W + 40) - 20, r = H * (.18 + .1 * rnd(i));
      x.globalAlpha = .4 + .5 * rnd(i + 2); x.lineWidth = 2 * c.d; x.beginPath(); x.arc(px, H / 2, r, Math.PI * .9, Math.PI * 2.2 + Math.sin(t / 600 + i) * .3); x.stroke(); } x.globalAlpha = 1; },
    gloss(x, W, H, t, c) { const n = 5, w = Math.min(W / (n + 1), H * .5), gap = (W - n * w) / (n + 1);
      for (let i = 0; i < n; i++) { const px = gap + i * (w + gap), h = H * .7, py = H * .15; x.fillStyle = [c.acc, c.acc2][i % 2]; x.beginPath(); x.roundRect(px, py, w, h, [w / 2, w / 2, w * .2, w * .2]); x.fill();
        const s = ((t / 1600 + i * .12) % 1.6) - .3; const g = x.createLinearGradient(px, py, px + w, py + h); g.addColorStop(cl(s - .1), 'rgba(255,255,255,0)'); g.addColorStop(cl(s), 'rgba(255,255,255,.7)'); g.addColorStop(cl(s + .1), 'rgba(255,255,255,0)'); x.fillStyle = g; x.fill(); } },
    drip(x, W, H, t, c) { x.fillStyle = c.acc; x.fillRect(0, 0, W, H * .14); for (let i = 0; i < 9; i++) { const px = (i + .5) / 9 * W, ph = ((t / (1800 + rnd(i) * 1400)) + rnd(i)) % 1, len = H * .55 * Math.min(1, ph * 1.6), r = (4 + rnd(i) * 3) * c.d;
      x.beginPath(); x.moveTo(px - r * .6, H * .12); x.lineTo(px - r * .3, H * .12 + len); x.arc(px, H * .12 + len, r * .6, Math.PI, 0, true); x.lineTo(px + r * .6, H * .12); x.fill();
      if (ph > .62) { x.globalAlpha = 1 - (ph - .62) / .38; x.beginPath(); x.arc(px, H * .12 + len + (ph - .62) * H * 1.2, r * .7, 0, TAU); x.fill(); x.globalAlpha = 1; } } },
    inkline(x, W, H, t, c) { // a botanical line drawing itself, then fading, on loop
      const p = (t / 4200) % 1, draw = Math.min(1, p / .7), fade = p > .85 ? 1 - (p - .85) / .15 : 1; x.strokeStyle = c.text; x.globalAlpha = .9 * fade; x.lineWidth = 1.8 * c.d; x.lineCap = 'round';
      const pts = []; for (let i = 0; i <= 120; i++) { const f = i / 120; pts.push([W * (.08 + .84 * f), H * (.5 + .28 * Math.sin(f * TAU * 1.5) * Math.sin(f * Math.PI))]); }
      const n = Math.floor(pts.length * draw); x.beginPath(); pts.slice(0, n).forEach((q, i) => i ? x.lineTo(q[0], q[1]) : x.moveTo(q[0], q[1])); x.stroke();
      for (let k = 8, j = 0; k < n - 1; k += 11, j++) { const [qx, qy] = pts[k], [rx, ry] = pts[k + 1], ta = Math.atan2(ry - qy, rx - qx), sd = j % 2 ? 1 : -1, a = ta + sd * .9, L = (12 + 4 * Math.sin(k)) * c.d;
        const tx = qx + Math.cos(a) * L, ty = qy + Math.sin(a) * L, nx = Math.cos(a + Math.PI / 2) * L * .32, ny = Math.sin(a + Math.PI / 2) * L * .32, mx = (qx + tx) / 2, my = (qy + ty) / 2;
        x.beginPath(); x.moveTo(qx, qy); x.quadraticCurveTo(mx + nx, my + ny, tx, ty); x.quadraticCurveTo(mx - nx, my - ny, qx, qy); x.stroke(); x.beginPath(); x.moveTo(qx, qy); x.lineTo(mx, my); x.globalAlpha *= .6; x.stroke(); x.globalAlpha = .9 * fade; }
      if (n > 1 && draw < 1) { const [qx, qy] = pts[n - 1]; x.fillStyle = c.acc; x.globalAlpha = 1; x.beginPath(); x.arc(qx, qy, 3.2 * c.d, 0, TAU); x.fill(); } x.globalAlpha = 1; },
    needle(x, W, H, t, c) { const p = (t / 3000) % 1, hx = W * (.06 + .88 * p); x.fillStyle = c.text;
      for (let i = 0; i < 160; i++) { const f = i / 160; if (W * (.06 + .88 * f) > hx) break; const px = W * (.06 + .88 * f) + (rnd(i) - .5) * 3 * c.d, py = H / 2 + Math.sin(f * 12) * H * .18 + (rnd(i + 5) - .5) * H * .25 * (1 - Math.abs(Math.sin(f * 12)));
        x.globalAlpha = .35 + rnd(i + 2) * .6; x.beginPath(); x.arc(px, py, (.8 + rnd(i + 7) * 1.3) * c.d, 0, TAU); x.fill(); }
      const hy = H / 2 + Math.sin(p * 12) * H * .18; x.globalAlpha = 1; x.strokeStyle = c.acc; x.lineWidth = 2 * c.d; x.beginPath(); x.moveTo(hx, hy); x.lineTo(hx + 10 * c.d, hy - H * .4); x.stroke(); x.fillStyle = c.acc; x.beginPath(); x.arc(hx, hy, 2.5 * c.d, 0, TAU); x.fill(); },
    flash(x, W, H, t, c) { const shapes = [r => { x.moveTo(0, -r); for (let i = 1; i <= 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; x.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } },
      r => { x.moveTo(0, r * .7); x.bezierCurveTo(-r * 1.3, -r * .1, -r * .5, -r * 1.1, 0, -r * .4); x.bezierCurveTo(r * .5, -r * 1.1, r * 1.3, -r * .1, 0, r * .7); },
      r => { x.moveTo(0, -r); x.lineTo(r * .7, 0); x.lineTo(0, r); x.lineTo(-r * .7, 0); x.closePath(); }, r => { x.arc(0, 0, r * .8, Math.PI * .3, Math.PI * 1.7); x.arc(r * .35, 0, r * .62, Math.PI * 1.6, Math.PI * .4, true); }];
      const n = 4, r = Math.min(H * .34, W / n * .3); x.lineWidth = 1.8 * c.d; x.lineJoin = 'round';
      for (let i = 0; i < n; i++) { const p = Math.min(1, Math.max(0, ((t / 900) % (n + 2)) - i)); x.save(); x.translate((i + .5) / n * W, H / 2); x.rotate(Math.sin(t / 1500 + i) * .08);
        x.setLineDash([400 * c.d]); x.lineDashOffset = 400 * c.d * (1 - p); x.strokeStyle = i % 2 ? c.acc : c.text; x.beginPath(); shapes[i](r); x.stroke(); x.restore(); } x.setLineDash([]); },
    strand(x, W, H, t, c) { for (let k = 0; k < 6; k++) { x.strokeStyle = k % 2 ? c.acc2 : c.acc; x.globalAlpha = .25 + k * .12; x.lineWidth = (1.2 + k * .35) * c.d; x.beginPath();
      for (let i = 0; i <= W; i += 4) { const f = i / W, y = H / 2 + Math.sin(f * 5 + t / 900 + k * .45) * H * .26 * Math.sin(f * Math.PI + .3) + (k - 2.5) * 2 * c.d; i ? x.lineTo(i, y) : x.moveTo(i, y); } x.stroke(); } x.globalAlpha = 1; },
    shine(x, W, H, t, c) { A.strand(x, W, H, t, c); const s = (t / 2200) % 1.4 - .2; const g = x.createLinearGradient(0, 0, W, 0); g.addColorStop(cl(s - .08), 'rgba(255,255,255,0)'); g.addColorStop(cl(s), 'rgba(255,255,255,.55)'); g.addColorStop(cl(s + .08), 'rgba(255,255,255,0)'); x.globalCompositeOperation = 'source-atop'; x.fillStyle = g; x.fillRect(0, 0, W, H); x.globalCompositeOperation = 'source-over'; },
    pole(x, W, H, t, c) { const h = H * .46, y = (H - h) / 2, w = Math.min(W * .8, 380 * c.d), x0 = (W - w) / 2; x.save(); x.beginPath(); x.roundRect(x0, y, w, h, h / 2); x.clip();
      x.fillStyle = '#f4f1ea'; x.fillRect(x0, y, w, h); const sw = h * .9, off = (t / 18 * c.d) % (sw * 3);
      for (let i = -3; i < w / sw + 3; i++) { x.fillStyle = [c.acc, '#f4f1ea', '#1f3c88'][((i % 3) + 3) % 3]; x.beginPath(); const bx = x0 + i * sw + off - sw * 3; x.moveTo(bx, y + h); x.lineTo(bx + sw, y + h); x.lineTo(bx + sw * 1.8, y); x.lineTo(bx + sw * .8, y); x.fill(); }
      const g = x.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, 'rgba(255,255,255,.45)'); g.addColorStop(.5, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(0,0,0,.25)'); x.fillStyle = g; x.fillRect(x0, y, w, h); x.restore(); },
    fade(x, W, H, t, c) { const n = 34, p = (t / 2600) % 1; for (let i = 0; i < n; i++) { const f = i / n, h = H * (.12 + .7 * Math.pow(f, 1.6)) * (0.85 + .15 * Math.sin(t / 500 + i)); x.fillStyle = c.text; x.globalAlpha = .15 + .7 * f;
      x.fillRect(f * W, H - h, W / n * .55, h); } x.globalAlpha = 1; const cx = W * p; x.fillStyle = c.acc; x.beginPath(); x.roundRect(cx - 10 * c.d, H * .1, 20 * c.d, H * .8, 5 * c.d); x.fill(); },
    razor(x, W, H, t, c) { const p = (t / 1700) % 1, cx = W * p; x.strokeStyle = c.text; x.globalAlpha = .25; x.lineWidth = 1 * c.d; x.beginPath(); x.moveTo(0, H / 2); x.lineTo(W, H / 2); x.stroke();
      x.globalAlpha = 1; x.strokeStyle = c.acc; x.lineWidth = 3 * c.d; x.beginPath(); x.moveTo(Math.max(0, cx - W * .35), H / 2); x.lineTo(cx, H / 2); x.stroke(); x.fillStyle = c.text; for (let i = 0; i < 5; i++) { x.globalAlpha = .8 - i * .15; sparkle(x, cx + i * 6 * c.d, H / 2 - (rnd(i + Math.floor(t / 90)) - .5) * H * .5, (5 - i) * c.d); } x.globalAlpha = 1; },
    brush(x, W, H, t, c) { const p = (t / 3600) % 1, reveal = Math.min(1, p / .6), fade = p > .85 ? 1 - (p - .85) / .15 : 1, end = W * (.06 + .88 * reveal);
      for (let b = 0; b < 26; b++) { x.strokeStyle = b % 5 ? c.acc : c.acc2; x.globalAlpha = (.18 + rnd(b) * .5) * fade; x.lineWidth = (1 + rnd(b + 1) * 2.6) * c.d; x.beginPath();
        for (let px = W * .06; px <= end; px += 6) { const f = px / W, y = H / 2 + (b - 13) * H * .022 + Math.sin(f * 6 + b * .1) * H * .12 + (rnd(b * 99 + Math.floor(px)) - .5) * .8; px === W * .06 ? x.moveTo(px, y) : x.lineTo(px, y); } x.stroke(); } x.globalAlpha = 1; },
    splatter(x, W, H, t, c) { for (let i = 0; i < 22; i++) { const life = ((t / 2400) + rnd(i)) % 1, s = Math.min(1, life * 6), a = life > .7 ? 1 - (life - .7) / .3 : 1; x.globalAlpha = a * .85; x.fillStyle = [c.acc, c.acc2, c.text][i % 3];
      const cx = rnd(i + 1) * W, cy = (.2 + rnd(i + 2) * .6) * H, r = (3 + rnd(i + 3) * 8) * c.d * s; x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.fill(); for (let k = 0; k < 4; k++) { const a2 = rnd(i * 7 + k) * TAU; x.beginPath(); x.arc(cx + Math.cos(a2) * r * 1.8, cy + Math.sin(a2) * r * 1.8, r * .25, 0, TAU); x.fill(); } } x.globalAlpha = 1; },
    palette(x, W, H, t, c) { const cols = [c.acc, c.acc2, c.text, c.acc, c.acc2]; cols.forEach((col, i) => { x.fillStyle = col; x.globalAlpha = .9; x.beginPath(); x.arc((i + .5) / cols.length * W, H / 2 + Math.sin(t / 500 + i) * H * .14, H * .17, 0, TAU); x.fill(); }); x.globalAlpha = 1; }
  };
  const LABELS = { waveform: 'Waveform', lashline: 'Fluttering lash line', shimmer: 'Shimmer sparkles', curl: 'Lash curls', gloss: 'Gloss sweep', drip: 'Polish drip', inkline: 'Ink line drawing', needle: 'Needle stroke', flash: 'Flash outlines',
    strand: 'Flowing strand', shine: 'Hair shine sweep', pole: 'Barber pole', fade: 'Clipper fade', razor: 'Razor line', brush: 'Brush stroke reveal', splatter: 'Paint splatter', palette: 'Palette dots', none: 'None' };
  function draw(cv, id, t) {
    const f = A[id]; if (!f) return; const d = Math.min(2, devicePixelRatio || 1), r = cv.getBoundingClientRect();
    if (cv.width !== Math.round(r.width * d) || cv.height !== Math.round(r.height * d)) { cv.width = Math.round(r.width * d); cv.height = Math.round(r.height * d); }
    const x = cv.getContext('2d'); x.clearRect(0, 0, cv.width, cv.height); x.save();
    f(x, cv.width, cv.height, t, { acc: css(cv, '--acc', '#ff4f9a'), acc2: css(cv, '--acc2', '#7c5cff'), text: css(cv, '--text', '#fff'), d }); x.restore();
  }
  let running = false;
  function run() { // one loop; re-queries each frame so canvases added later (hub re-renders) animate too
    if (running) return; running = true;
    const still = /[?&]static/.test(location.search) || matchMedia('(prefers-reduced-motion: reduce)').matches;
    const loop = t => { document.querySelectorAll('canvas[data-accent]').forEach(cv => { const r = cv.getBoundingClientRect(); if (r.bottom > -50 && r.top < innerHeight + 50 && r.width) draw(cv, cv.dataset.accent, still ? 1800 : t); }); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  }
  window.CPAccents = { draw, ids: Object.keys(A), labels: LABELS, run };
  if (document.readyState !== 'loading') run(); else document.addEventListener('DOMContentLoaded', run);
})();
