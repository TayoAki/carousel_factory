// ================================================================== SLIDES — "Pick Your Social"
// One can of Teazy travels across a Southern golden-hour evening. At the end of every loop each
// slide's can whips into the next slide (whip / arrive), so the strip reads as one journey.

// ---------------------------------------------------------------- shared timing helpers
const WHIP0 = 7.3, WHIP1 = 7.9;
const POSE = [
  { x: 540, y: FLOOR, s: 0.84 }, { x: 540, y: FLOOR, s: 1.0 }, { x: 540, y: FLOOR, s: 0.92 },
  { x: 380, y: FLOOR, s: 0.92 }, { x: 540, y: FLOOR, s: 1.22 }, { x: 290, y: FLOOR, s: 0.9 },
];
function whip(k, t) {
  const P0 = POSE[k], o = { x: P0.x, y: P0.y, s: P0.s, sq: 0, lean: 0, u: 0 };
  if (k < N - 1) {
    const P1 = POSE[k + 1], u = seg(t, WHIP0, WHIP1); o.u = u;
    if (u > 0) {
      const p = E.ioBack(u, 1.1);
      o.x = lerp(P0.x, W + P1.x, p); o.s = lerp(P0.s, P1.s, clamp(p));
      o.y = P0.y - 120 * Math.sin(PI * clamp(p));          // a little hop across the seam
      o.lean = 0.22 * Math.sin(PI * u) * (u < 0.5 ? 1 : 0.6); o.sq = -0.06 * Math.sin(PI * u);
      if (u >= 1) { const a = arrive(t); o.lean = a.lean; o.sq = a.sq; o.y = P1.y; }
    }
  }
  if (k > 0 && t < WHIP0) { const a = arrive(t); o.lean += a.lean; o.sq += a.sq; }
  return o;
}
function arrive(t) { // settle after landing from a whip (wraps over the loop start)
  const dt = wrapT(t - WHIP1);
  return dt < 1.4 ? { lean: -0.06 * kick(dt, 11, 5), sq: 0.12 * damp(dt, 22, 7) } : { lean: 0, sq: 0 };
}
const beat = (t, off = 0) => decay(frac(t - off), 6.5); // every second (8 per loop)
const hop = (t, t0, d, h) => { const u = seg(t, t0, t0 + d); return u > 0 && u < 1 ? h * 4 * u * (1 - u) : 0; };

// ---------------------------------------------------------------- labels, chrome, styles
function pill(text, size = 22) {
  const track = 2.4; SCR.font = fstr(FONT.mono, size);
  let tw = 0; for (const ch of text) tw += SCR.measureText(ch).width + track; tw -= track;
  const padL = 46, padR = 24, h = size + 28, w = tw + padL + padR;
  const c = mk(w + 8, h + 8), g = c.getContext('2d'); g.translate(4, 4);
  g.beginPath(); rrect(g, 0, 0, w, h, h / 2); g.fillStyle = 'rgba(42,16,28,0.9)'; g.fill();
  g.strokeStyle = 'rgba(255,226,170,0.95)'; g.lineWidth = 2; g.stroke();
  g.save(); g.translate(25, h / 2); g.rotate(-0.6); leafPath(g, 9); g.fillStyle = '#9cd35a'; g.fill(); g.restore();
  g.font = SCR.font; g.fillStyle = '#fff4dc'; g.textBaseline = 'middle';
  let x = padL; for (const ch of text) { g.fillText(ch, x, h / 2 + 1); x += SCR.measureText(ch).width + track; }
  c.pw = w; c.ph = h; return c;
}
function drawLabel(g, t, P, t0, t1, ax, ay) {
  const sOut = seg(t, t1, t1 + 0.22);
  const s = E.outBack(seg(t, t0, t0 + 0.42), 2.6) * (1 - E.inBack(sOut, 2)); if (s <= 0.002) return;
  const x = P.x, y = P.y + 5 * Math.sin(t * OM(2) + P.x * 0.013);
  const lp = E.outC(seg(t, t0 + 0.14, t0 + 0.6)) * (1 - E.outC(sOut));
  if (lp > 0.001 && ax != null) {
    const sy = ay > y ? y + P.c.ph / 2 : y - P.c.ph / 2;
    g.save(); g.strokeStyle = 'rgba(255,244,220,0.95)'; g.lineWidth = 2.5; g.lineCap = 'round';
    g.beginPath(); g.moveTo(x, sy); g.lineTo(lerp(x, ax, lp), lerp(sy, ay, lp)); g.stroke();
    if (lp > 0.9) {
      const q = frac(t / 0.8);
      g.fillStyle = '#ffd36a'; g.beginPath(); g.arc(ax, ay, 7, 0, TAU); g.fill();
      g.strokeStyle = `rgba(255,230,160,${(1 - q) * 0.9})`; g.lineWidth = 2; g.beginPath(); g.arc(ax, ay, 8 + 16 * q, 0, TAU); g.stroke();
    }
    g.restore();
  }
  g.save(); g.translate(x, y); g.scale(s, s); g.drawImage(P.c, -P.c.width / 2, -P.c.height / 2); g.restore();
}
const CH = {};
function buildChrome() {
  const size = 22, track = 6, text = PROJECT.mark; SCR.font = fstr(FONT.mono, size);
  let tw = 0; for (const ch of text) tw += SCR.measureText(ch).width + track;
  const c = mk(tw + 70, 48), g = c.getContext('2d');
  g.save(); g.translate(20, 24); g.rotate(-0.7); leafPath(g, 15); g.fillStyle = '#9cd35a'; g.fill(); g.restore();
  g.font = SCR.font; g.textBaseline = 'alphabetic'; g.shadowColor = 'rgba(40,10,20,0.6)'; g.shadowBlur = 6;
  g.fillStyle = '#fff4dc';
  let x = 42; for (const ch of text) { g.fillText(ch, x, 32); x += SCR.measureText(ch).width + track; }
  CH.mark = c;
  const pad = (n) => String(n).padStart(2, '0');
  CH.count = PROJECT.counters.map((nm, k) => {
    const s = `${pad(k + 1)} / ${pad(N)}  ·  ${nm}`; SCR.font = fstr(FONT.mono, 20);
    let w = 0; for (const ch of s) w += SCR.measureText(ch).width + 3;
    const cc = mk(w + 10, 36), gg = cc.getContext('2d'); gg.font = SCR.font; gg.fillStyle = 'rgba(255,240,220,0.8)';
    let xx = 2; for (const ch of s) { gg.fillText(ch, xx, 26); xx += SCR.measureText(ch).width + 3; }
    return cc;
  });
}
function chrome(g, k, t, a = 1) {
  if (!vis(0, 520)) return;
  g.save(); g.globalAlpha = a * 0.95; g.drawImage(CH.mark, 56, 62);
  g.globalAlpha = a; g.drawImage(CH.count[k], 72, 1268); g.restore();
}
const ST = {
  cream: { fill: [[0, '#fffaf0'], [1, '#ffe2b0']], ext: [11, '#4a1a2a'], shine: 0.2 },
  peach: { fill: [[0, '#fff1c8'], [0.45, '#ffb067'], [1, '#ff6a4a']], ext: [15, '#4a1426'], shine: 0.35 },
  leaf: { fill: [[0, '#f6ffe0'], [1, '#cfe89a']], ext: [12, '#14301e'], shine: 0.25 },
  honey: { fill: [[0, '#fff8e6'], [1, '#ffe0a8']], ext: [11, '#5a2410'] },
  plum: { fill: [[0, '#6a2352'], [1, '#3c0f2e']], ext: [10, '#fff0c8'], extX: -0.2 },
  sun: { fill: [[0, '#fffbe8'], [0.5, '#ffd47a'], [1, '#ff9a4a']], ext: [16, '#3a1030'], shine: 0.3 },
  ink: { fill: '#3a1430' },
};
const sparkle = (g, t, te, x, y, n, seed, col = 'rgba(255,240,190,1)') =>
  burst(g, t, te, { n, seed, x, y, sx: 40, sy: 40, ang: [-PI, PI], spd: [200, 900], life: [0.3, 0.8], g: 300, drag: 2.2, size: [2, 4.5], kind: 'spark', color: col, wrap: false });

// ---------------------------------------------------------------- the world sun (lives in slide 1, spills into 2)
function sunY(t) { return 1010 - 170 * E.outC(seg(t, 0.05, 2.3)) + 170 * E.ioS(seg(t, 6.9, 7.98)); }
function drawSun(g, t) {
  const x = 540, y = sunY(t), pulse = 0.22 * decay(t - 5.0, 3) * (t >= 5.0 ? 1 : 0);
  g.save(); g.globalCompositeOperation = 'lighter';
  g.globalAlpha = 0.55 + pulse; g.drawImage(SPR.gold, x - 900, y - 700, 1800, 1400);
  // rotating rays: one ray spacing per loop (16-fold symmetric, so it loops exactly)
  const rot = (t / LOOP) * (TAU / 16);
  g.globalAlpha = 0.09 + pulse * 0.6; g.fillStyle = '#fff0c0';
  g.beginPath();
  for (let i = 0; i < 16; i++) { const a = rot + (i / 16) * TAU; g.moveTo(x, y); g.arc(x, y, 1500, a, a + TAU / 64); g.lineTo(x, y); }
  g.fill();
  g.restore();
  g.save();
  g.fillStyle = RG(g, 'sunDisc', x, -60, 10, x, 0, 170, [[0, '#fffbe6'], [0.55, '#ffe59a'], [0.9, '#ffb85a'], [1, 'rgba(255,170,80,0)']]);
  g.translate(0, y); g.beginPath(); g.arc(x, 0, 170 * (1 + pulse * 0.3), 0, TAU); g.fill();
  g.restore();
}

// ================================================================== 01 · HOOK — "IT'S TEAZY TIME"
const S1 = {
  shakes: [[1.15, 10], [2.95, 14], [5.0, 6]],
  zooms: [[1.15, 0.02], [2.95, 0.03], [5.0, 0.015]],
  flashes: [[1.15, 0.22, '255,220,160'], [2.95, 0.35, '255,236,190'], [5.0, 0.22, '255,210,140']],
  lines: [320, 555, 705],
};
S1.build = () => {
  const s0 = 150, sB = fitSize('TEAZY', FONT.wide, 270, 900, 6);
  S1.A = word("IT'S", FONT.anton, s0, ST.cream, 8);
  S1.B = word('TEAZY', FONT.wide, sB, ST.sun, 6);
  S1.C = word('TIME', FONT.anton, s0, ST.cream, 8);
  S1.tag = word('THE NEW SOUTHERN RITUAL', FONT.mono, 30, { fill: '#fff4dc' }, 3);
  S1.swipe = word('SWIPE', FONT.mono, 26, { fill: '#fff4dc' }, 7);
};
S1.T = [(i) => 0.35 + i * 0.07, (i) => 0.85 + i * 0.06, (i) => 1.45 + i * 0.07];
S1.rise = (g, t, Wd, base, ts, ln) => {
  const left = 540 - Wd.width / 2;
  g.save(); g.beginPath(); g.rect(0, 0, W, base + 16); g.clip();
  Wd.items.forEach((it, i) => {
    if (!it.g) return;
    const t0 = ts(i); if (t < t0) return;
    const u = seg(t, t0, t0 + 0.55);
    let dy = (1 - E.outBack(u, 2.2)) * (Wd.cap + 40);
    dy += -10 * Math.sin(t * OM(4) + i * 0.8 + ln) * seg(t, t0 + 0.6, t0 + 1.2);   // gentle bob
    dy -= 34 * Math.max(0, kick(t - 5.0 - i * 0.03, 14, 6));                       // second beat
    const to = 6.7 + i * 0.04 + ln * 0.08; dy += E.inBack(seg(t, to, to + 0.45), 1.8) * (Wd.cap + 60);
    const sq = 0.12 * damp(t - t0 - 0.3, 20, 7);
    drawLetter(g, it, left, base, { dy, sx: 1 + sq * 0.5, sy: 1 - sq, piv: 1 });
  });
  g.restore();
};
S1.can = (t) => {
  const P = whip(0, t), u = seg(t, 2.4, 2.95);
  const rise = u >= 1 ? 0 : (1 - E.outBack(u, 1.4)) * 520;
  const sq = 0.16 * damp(t - 2.95, 22, 6) + P.sq;
  return { ...P, y: P.y + rise, sq, rot: 0, fl: 'peach', rim: 0.9, glint: seg(t, 3.1, 3.8), vis: t >= 2.4, rise };
};
S1.back = (g, t) => {
  if (!vis(-300, W + 300)) return;
  // halo behind TEAZY
  const a = seg(t, 0.85, 1.4) * (1 - seg(t, 6.8, 7.2));
  if (a > 0) { g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.35 * a; g.drawImage(SPR.gold, 40, 300, 1000, 420); g.restore(); }
};
S1.mid = (g, t) => {
  const C = S1.can(t); if (!C.vis || !canBox(C)) return;
  g.save(); if (C.rise > 1) { g.beginPath(); g.rect(-W, -400, W * 4, FLOOR + 400); g.clip(); }
  canShadow(g, C, C.rise > 0 ? 400 : 0, 0.5); drawCan(g, C, t); g.restore();
};
S1.front = (g, t) => {
  const inView = vis(0, W);
  if (inView) {
    S1.rise(g, t, S1.A, S1.lines[0], S1.T[0], 0);
    S1.rise(g, t, S1.B, S1.lines[1], S1.T[1], 1);
    S1.rise(g, t, S1.C, S1.lines[2], S1.T[2], 2);
    // tagline types on
    const tg = S1.tag, n = Math.floor(seg(t, 1.9, 2.9) * tg.items.length + 0.001), out = 1 - seg(t, 6.6, 6.9);
    tg.items.forEach((it, i) => { if (i < n) drawLetter(g, it, 540 - tg.width / 2, 122, { alpha: out }); });
    if (n < tg.items.length && t > 1.9 && frac(t * 2) < 0.6) { g.fillStyle = '#fff4dc'; const it = tg.items[n]; g.fillRect(540 - tg.width / 2 + it.pen, 96, 14, 28); }
    // TEAZY lands: shimmer ring + sparkles
    ring(g, t, 1.15, 540, 460, { r0: 120, r1: 760, dur: 0.7, w: 10, color: 'rgba(255,236,190,1)', alpha: 0.6, flat: 0.45 });
    sparkle(g, t, 1.15, 540, 470, 40, 11);
    // can pops up through the porch
    ring(g, t, 2.95, 540, FLOOR, { r0: 60, r1: 900, flat: 0.16, dur: 0.8, w: 16, color: 'rgba(255,230,170,1)', soft: true });
    burst(g, t, 2.95, { n: 40, seed: 31, x: 540, y: FLOOR - 340, sx: 160, ang: [-PI, 0], spd: [300, 1100], life: [0.5, 1.1], g: 500, drag: 1.6, size: [5, 12], spr: SPR.firefly, wrap: false });
  }
  // swipe cue + a lemon wheel rolling across the edge into slide 2
  const aa = seg(t, 3.5, 3.9) * (1 - seg(t, 6.8, 7.15));
  if (aa > 0) {
    if (vis(640, W)) {
      const sw = S1.swipe, sl = 830 - sw.width;
      sw.items.forEach((it, i) => drawLetter(g, it, sl, 1232, { alpha: seg(t, 3.5 + i * 0.05, 3.6 + i * 0.05) * aa }));
      g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
      for (let i = 0; i < 3; i++) {
        const p = Math.max(0, Math.sin(TAU * (t * 1.25 - i * 0.17))) ** 2, x = 862 + i * 44 + 8 * p, y = 1222;
        g.globalAlpha = aa * (0.35 + 0.65 * p); g.strokeStyle = '#fff1c0'; g.lineWidth = 8;
        g.beginPath(); g.moveTo(x - 12, y - 20); g.lineTo(x + 8, y); g.lineTo(x - 12, y + 20); g.stroke();
      }
      g.restore();
    }
    const q = frac(t / 2), lx = lerp(560, W + 420, E.inQ(q) * 0.4 + q * 0.6), r = 46;
    drawIng(g, 'lemon', lx, 1160 - hop(q, 0.55, 0.3, 40), (r * 2) / 240, (lx - 560) / r, aa * Math.sin(PI * q) ** 0.4);
  }
  chrome(g, 0, t, seg(t, 0.3, 0.7) * (1 - seg(t, 7.3, 7.7)));
};

// ================================================================== 02 · NOT TIRED. NOT WIRED.
const S2 = {
  SPARK: 1.6, HOP: 4.6,
  shakes: [[1.6, 16], [5.25, 8]],
  zooms: [[1.6, 0.03], [5.25, 0.015]],
  flashes: [[1.6, 0.4, '255,240,200']],
};
S2.build = () => {
  const sA = fitSize('NOT TIRED.', FONT.anton, 190, 880, 6), sB = fitSize('NOT WIRED.', FONT.wide, 150, 900, 4);
  S2.A = word('NOT TIRED.', FONT.anton, sA, ST.cream, 6);
  S2.B = word('NOT WIRED.', FONT.wide, sB, ST.peach, 4);
  S2.sub = word('A SPARK, NOT A JOLT', FONT.mono, 32, { fill: '#3a1430' }, 4);
  S2.l1 = { c: pill('50MG NATURAL CAFFEINE'), x: 250, y: 720 };
  S2.l2 = { c: pill('TEA + YERBA MATE'), x: 840, y: 880 };
};
S2.can = (t) => {
  const P = whip(1, t), s = P.s;
  const jump = hop(t, S2.HOP, 0.65, 170);
  const sq = P.sq + 0.1 * damp(t - S2.SPARK, 24, 7) + 0.18 * damp(t - S2.HOP - 0.65, 22, 6) - 0.1 * Math.sin(PI * seg(t, S2.HOP, S2.HOP + 0.65));
  return { ...P, y: P.y - jump, sq, rot: 0.25 * Math.sin(TAU * seg(t, S2.HOP, S2.HOP + 0.65)), fl: 'peach', rim: 0.7, glint: seg(t, S2.SPARK, S2.SPARK + 0.6), jump };
};
S2.back = (g, t) => {
  if (!vis(-300, W + 300)) return;
  // calm ripples breathing out from the can (period 2 s → loops)
  g.save();
  for (let i = 0; i < 4; i++) {
    const q = frac(t / 2 + i / 4), r = 120 + 620 * q;
    g.globalAlpha = 0.22 * (1 - q); g.strokeStyle = '#fff2d8'; g.lineWidth = 5;
    g.beginPath(); g.arc(540, FLOOR - 200, r, 0, TAU); g.stroke();
  }
  g.restore();
};
S2.mid = (g, t) => {
  const C = S2.can(t); if (!canBox(C)) return;
  canShadow(g, C, C.jump || 0, 0.5); drawCan(g, C, t);
};
S2.front = (g, t) => {
  const inView = vis(0, W);
  if (inView) {
    // NOT TIRED. — heavy, sleepy letters that sag, then perk up at the spark
    const A = S2.A, la = 540 - A.width / 2;
    A.items.forEach((it, i) => {
      if (!it.g) return; const t0 = 0.15 + i * 0.05; if (t < t0) return;
      const u = seg(t, t0, t0 + 0.45);
      let dy = -620 * (1 - u * u), sy = 1, sx = 1, rot = 0;
      if (u >= 1) { const q = damp(t - t0 - 0.45, 18, 6); sy = 1 - 0.3 * q; sx = 1 + 0.2 * q; }
      const sleepy = seg(t, 0.9, 1.3) * (1 - E.outBack(seg(t, S2.SPARK, S2.SPARK + 0.35), 3));
      sy *= 1 - 0.22 * sleepy; rot += 0.12 * sleepy * (hash(i, 3) - 0.5) * 2; dy += 10 * sleepy;
      dy -= 36 * Math.max(0, kick(t - S2.HOP - 0.65 - i * 0.02, 15, 6));
      const to = 6.85 + i * 0.03; if (t > to) { const v = t - to; dy += 3200 * v * v; rot += (hash(i, 9) - 0.5) * 5 * v; }
      drawLetter(g, it, la, 300, { dy, sx, sy, rot, piv: 1, alpha: 1 - seg(t, to + 0.3, to + 0.45) });
    });
    // NOT WIRED. — jittery until the spark lands, then calm
    const B = S2.B, lb = 540 - B.width / 2;
    B.items.forEach((it, i) => {
      if (!it.g) return; const t0 = 0.75 + i * 0.04; if (t < t0) return;
      const pin = E.outBack(seg(t, t0, t0 + 0.3), 2.5);
      const jit = (1 - seg(t, S2.SPARK, S2.SPARK + 0.25)) * 14;
      const f = Math.floor(t * 24);
      let dx = jit * (hash(i, f) - 0.5) * 2, dy = jit * (hash(i + 40, f) - 0.5) * 2, rot = jit * 0.008 * (hash(i + 80, f) - 0.5) * 2;
      dy += 10 * damp(t - S2.SPARK, 16, 5) * (t >= S2.SPARK ? 1 : 0);
      dy -= 30 * Math.max(0, kick(t - S2.HOP - 0.7 - i * 0.02, 15, 6));
      const to = 6.95 + i * 0.03; let alpha = 1; if (t > to) { const v = t - to; dy += 3200 * v * v; alpha = 1 - seg(t, to + 0.3, to + 0.45); }
      drawLetter(g, it, lb, 490, { dx, dy, rot, s: pin, alpha });
    });
    // sub line wipes in
    const sb = S2.sub, sw = seg(t, 2.2, 2.9), so = 1 - seg(t, 6.8, 7.0);
    if (sw > 0) {
      g.save(); g.beginPath(); g.rect(540 - sb.width / 2 - 20, 520, (sb.width + 40) * E.outC(sw), 60); g.clip();
      g.fillStyle = `rgba(255,240,215,${0.85 * so})`; g.beginPath(); rrect(g, 540 - sb.width / 2 - 20, 528, sb.width + 40, 50, 25); g.fill();
      sb.items.forEach((it) => drawLetter(g, it, 540 - sb.width / 2, 566, { alpha: so }));
      g.restore();
    }
    drawLabel(g, t, S2.l1, 2.6, 6.8, 470, 900);
    drawLabel(g, t, S2.l2, 3.1, 6.85, 625, 960);
  }
  // the spark: a falling star that lands on the lid
  const C = S2.can(Math.min(t, 7.2)), lidY = FLOOR - 392 * C.s;
  if (inView && t > 0.9 && t < S2.SPARK) {
    const u = E.inQ(seg(t, 0.9, S2.SPARK)), x = lerp(900, 540, u), y = lerp(-40, lidY, u);
    g.save(); g.globalCompositeOperation = 'lighter';
    for (let k = 0; k < 10; k++) { const v = Math.max(0, u - k * 0.025), tx = lerp(900, 540, v), ty = lerp(-40, lidY, v), s = 26 * (1 - k / 10); g.globalAlpha = 0.8 * (1 - k / 10); g.drawImage(SPR.firefly, tx - s, ty - s, s * 2, s * 2); }
    g.globalAlpha = 1; g.drawImage(SPR.glow, x - 40, y - 40, 80, 80); g.restore();
  }
  if (inView) {
    ring(g, t, S2.SPARK, 540, lidY, { r0: 30, r1: 520, dur: 0.6, w: 10, color: 'rgba(255,244,200,1)', alpha: 0.9 });
    sparkle(g, t, S2.SPARK, 540, lidY, 46, 21);
    ring(g, t, S2.HOP + 0.65, 540, FLOOR, { r0: 80, r1: 700, flat: 0.16, dur: 0.6, w: 10, color: 'rgba(255,240,200,1)', alpha: 0.7 });
    burst(g, t, S2.HOP + 0.65, { n: 18, seed: 25, x: 540, y: FLOOR - 6, sx: 260, ang: [-PI, 0], spd: [80, 300], life: [0.5, 1.0], g: 120, drag: 2, size: [40, 80], kind: 'puff', sprites: SPR.steam, comp: 'source-over', alpha: 0.3, grow: 1.4, wrap: false });
  }
  chrome(g, 1, t);
};

// ================================================================== 03 · WHAT'S INSIDE — ingredients orbit the can
const S3 = {
  IN: 1.25, OUT: 6.9,
  shakes: [[1.25, 14], [4.6, 6]],
  zooms: [[1.25, 0.025]],
  flashes: [[1.25, 0.3, '230,255,200']],
  orb: [['peach', 0.9], ['leaf', 0.85], ['lemon', 0.75], ['ginger', 0.8], ['leaf', 0.6], ['peach', 0.6], ['lemon', 0.55], ['leaf', 0.7]],
  ALPHA: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
};
S3.build = () => {
  const s = fitSize('NO FAKE', FONT.wide, 170, 900, 6);
  S3.A = word('NO FAKE', FONT.wide, s, ST.leaf, 6);
  S3.B = word('STUFF.', FONT.wide, s, ST.leaf, 6);
  S3.scr = {}; const sc = word(S3.ALPHA, FONT.wide, s, { fill: [[0, '#ffffff'], [1, '#e8ffb0']], ext: [12, '#14301e'] }, 0);
  sc.items.forEach((it) => { S3.scr[it.ch] = it.g; });
  S3.sub = word('CALM. FOCUSED. PRESENT.', FONT.mono, 30, { fill: '#f6ffe0' }, 3);
  S3.l1 = { c: pill("250MG LION'S MANE"), x: 255, y: 640 };
  S3.l2 = { c: pill('200MG L-THEANINE'), x: 815, y: 700 };
  S3.l3 = { c: pill('REAL INGREDIENTS'), x: 600, y: 1205 };
};
S3.can = (t) => {
  const P = whip(2, t);
  return { ...P, sq: P.sq + 0.08 * damp(t - S3.IN, 20, 6), rot: 0, fl: 'peach', rim: 0.8, glint: seg(t, 4.6, 5.3) };
};
S3.orbit = (t, i) => {
  const ang = (i / S3.orb.length) * TAU + t * OM(1) + TAU * E.ioS(seg(t, 4.4, 5.6));
  const r = 1 + 2.4 * (1 - E.outBack(seg(t, 0.8 + i * 0.03, S3.IN + i * 0.03), 1.3)) + 2.4 * E.inBack(seg(t, S3.OUT + i * 0.02, S3.OUT + 0.4 + i * 0.02), 1.4);
  const rx = 340 * r, ry = 80 * r, x = 540 + Math.cos(ang) * rx, z = Math.sin(ang), y = FLOOR - 230 + z * ry + 30 * Math.sin(t * OM(2) + i);
  return { x, y, z, s: S3.orb[i][1] * (0.8 + 0.25 * z), rot: ang * 1.3 + i, a: t > 0.8 ? 1 : 0 };
};
S3.drawOrbit = (g, t, front) => {
  S3.orb.forEach(([key], i) => {
    const o = S3.orbit(t, i); if ((o.z >= 0) !== front || o.a <= 0) return;
    if (o.x < VIS.x0 - 200 || o.x > VIS.x1 + 200) return;
    drawIng(g, key, o.x, o.y, o.s * 0.75, o.rot, 1);
  });
};
S3.back = (g, t) => {
  if (!vis(-400, W + 400)) return;
  // orbit trail ring
  const a = seg(t, S3.IN, S3.IN + 0.4) * (1 - seg(t, S3.OUT, S3.OUT + 0.3));
  if (a > 0) {
    g.save(); g.globalAlpha = 0.35 * a; g.strokeStyle = '#f6ffe0'; g.lineWidth = 3; g.setLineDash([4, 18]); g.lineDashOffset = -t * 40;
    g.beginPath(); g.ellipse(540, FLOOR - 230, 340, 80, 0, 0, TAU); g.stroke(); g.restore();
  }
  S3.drawOrbit(g, t, false);
};
S3.mid = (g, t) => {
  const C = S3.can(t); if (!canBox(C)) return;
  canShadow(g, C, 0, 0.5); drawCan(g, C, t);
};
S3.decode = (g, t, Wd, base, t0, ln) => {
  const left = 540 - Wd.width / 2;
  Wd.items.forEach((it, i) => {
    if (!it.g) return;
    const ts = t0 + i * 0.03, tl = t0 + 0.35 + i * 0.09; if (t < ts) return;
    const to = 6.7 + i * 0.03 + ln * 0.1;
    if (t >= tl && t < to) {
      const p = seg(t, tl, tl + 0.3), s = 1 + 0.35 * (1 - E.outBack(p, 3));
      drawLetter(g, it, left, base, { s, dy: -18 * Math.max(0, kick(t - 4.6 - i * 0.03, 14, 6)) });
    } else {
      if (t >= to + 0.4) return;
      const f = Math.floor(t * 18), ch = S3.ALPHA[Math.floor(hash(i + ln * 20, f) * 26)];
      drawLetter(g, it, left, base, { spr: S3.scr[ch], alpha: t >= to ? 1 - seg(t, to, to + 0.4) : 0.85 });
    }
  });
};
S3.front = (g, t) => {
  S3.drawOrbit(g, t, true);
  const inView = vis(0, W);
  if (inView) {
    S3.decode(g, t, S3.A, 300, 0.15, 0);
    S3.decode(g, t, S3.B, 470, 0.45, 1);
    const sb = S3.sub, n = Math.floor(seg(t, 1.8, 2.7) * sb.items.length + 0.001), so = 1 - seg(t, 6.7, 6.95);
    sb.items.forEach((it, i) => { if (i < n) drawLetter(g, it, 540 - sb.width / 2, 548, { alpha: so, dy: -6 * (1 - seg(t, 1.8 + i * 0.04, 1.9 + i * 0.04)) }); });
    drawLabel(g, t, S3.l1, 2.3, 6.75, 470, 820);
    drawLabel(g, t, S3.l2, 2.8, 6.8, 610, 860);
    drawLabel(g, t, S3.l3, 3.3, 6.85, 560, 1100);
    ring(g, t, S3.IN, 540, FLOOR - 230, { r0: 200, r1: 900, flat: 0.24, dur: 0.7, w: 14, color: 'rgba(230,255,200,1)', soft: true });
    burst(g, t, S3.IN, { n: 36, seed: 33, x: 540, y: FLOOR - 230, sx: 600, sy: 120, ang: [-PI, PI], spd: [200, 700], life: [0.5, 1.1], g: 200, drag: 2, size: [5, 11], spr: SPR.firefly, wrap: false });
  }
  chrome(g, 2, t);
};

// ================================================================== 04 · STILL. NOT FIZZY. — the pour
const S4 = {
  GLASS: 0.7, ICE: [1.0, 1.14, 1.28], LIFT: [1.55, 2.15], POUR: [2.15, 4.5], BACK: [4.5, 5.15], LEMON: 5.6, GOUT: 6.55,
  shakes: [[0.7, 10], [5.15, 12], [5.6, 6]],
  zooms: [[0.7, 0.015], [5.15, 0.02]],
  flashes: [[5.15, 0.25, '255,230,170']],
  gx: 740, gw: 230, gh: 300,
};
S4.build = () => {
  const s = fitSize('STILL.', FONT.wide, 250, 860, 6);
  S4.still = glyph('STILL.', FONT.wide, s, { fill: '#fff' });
  S4.stillO = glyph('STILL.', FONT.wide, s, { stroke: ['#fff8ea', 7], ext: [10, '#5a2410'] });
  S4.mask = mk(S4.still.c.width, S4.still.c.height); S4.mg = S4.mask.getContext('2d');
  const s2 = fitSize('NOT FIZZY.', FONT.anton, 150, 820, 8);
  S4.B = word('NOT FIZZY.', FONT.anton, s2, ST.honey, 8);
  S4.sub = word('ZERO ALCOHOL · ZERO THC', FONT.mono, 28, { fill: '#fff8e6' }, 3);
  S4.l1 = { c: pill('NO CARBONATION'), x: 830, y: 690 };
  S4.l2 = { c: pill('NO BLOAT'), x: 890, y: 1200 };
};
S4.can = (t) => {
  const P = whip(3, t);
  const up = E.ioBack(seg(t, S4.LIFT[0], S4.LIFT[1]), 1.2) * (1 - E.ioS(seg(t, S4.BACK[0], S4.BACK[1])));
  const tilt = 1.95 * E.ioBack(seg(t, S4.LIFT[0] + 0.1, S4.LIFT[1]), 1.1) * (1 - E.ioBack(seg(t, S4.BACK[0], S4.BACK[1] - 0.1), 1.1));
  const pourWob = 0.04 * Math.sin(t * OM(16)) * seg(t, S4.POUR[0], S4.POUR[0] + 0.3) * (1 - seg(t, S4.POUR[1] - 0.3, S4.POUR[1]));
  const land = S4.BACK[1];
  const sq = P.sq + 0.18 * damp(t - land, 22, 6);
  return { ...P, x: P.x + 90 * up, y: P.y - 310 * up, tilt: tilt + pourWob, sq, rot: 0, fl: 'peach', rim: 0.8, glint: seg(t, 5.2, 5.9), up };
};
S4.mouth = (C) => { const th = C.tilt, s = C.s, cx = C.x, cy = C.y - 196 * s; return { x: cx + s * (-26 * Math.cos(th) + 196 * Math.sin(th)), y: cy + s * (-26 * Math.sin(th) - 196 * Math.cos(th)) }; };
S4.level = (t) => 0.82 * E.ioS(seg(t, S4.POUR[0] + 0.2, S4.POUR[1] + 0.2)) + 0.05 * seg(t, S4.LEMON, S4.LEMON + 0.3);
S4.glassY = (t) => {
  const f = t < S4.GLASS ? -1200 * (1 - E.inQ(seg(t, 0.25, S4.GLASS))) : 0;
  const out = -1300 * E.inBack(seg(t, S4.GOUT, S4.GOUT + 0.55), 1.6);
  return { dy: (t < 0.25 ? -1300 : f) + out + 14 * Math.max(0, kick(t - S4.GLASS, 18, 7)), sq: 0.12 * damp(t - S4.GLASS, 24, 7) };
};
S4.drawGlass = (g, t, part) => {
  const { dy, sq } = S4.glassY(t); if (dy < -1250) return;
  const x = S4.gx, w = S4.gw, h = S4.gh, base = FLOOR + dy, top = base - h, bw = w * 0.82;
  g.save(); g.translate(x, base); g.scale(1 + sq * 0.5, 1 - sq); g.translate(-x, -base);
  const path = () => { g.beginPath(); g.moveTo(x - w / 2, top); g.lineTo(x - bw / 2, base - 8); g.quadraticCurveTo(x, base + 8, x + bw / 2, base - 8); g.lineTo(x + w / 2, top); };
  if (part === 'back') {
    if (dy === 0 || dy > -40) canShadow(g, { x, y: FLOOR, s: 1 }, 0, 0.35);
    path(); g.closePath(); g.fillStyle = 'rgba(255,250,240,0.16)'; g.fill();
    // tea inside
    const L = S4.level(t);
    if (L > 0.002) {
      const ly = base - 10 - (h - 20) * L, wob = 8 * Math.sin(t * OM(12)) * (seg(t, S4.POUR[0], S4.POUR[0] + 0.3) * (1 - seg(t, S4.POUR[1], S4.POUR[1] + 1)) + decay(t - S4.LEMON, 3) * (t > S4.LEMON ? 1 : 0));
      g.save(); path(); g.closePath(); g.clip();
      g.beginPath(); g.moveTo(x - w, ly - wob); g.quadraticCurveTo(x, ly + wob * 2, x + w, ly - wob); g.lineTo(x + w, base + 20); g.lineTo(x - w, base + 20); g.closePath();
      g.fillStyle = LG(g, 'tea', 0, top, 0, base, [[0, '#f0a24a'], [0.5, '#c8682a'], [1, '#8a3a18']]); g.fill();
      g.fillStyle = 'rgba(255,230,170,0.5)'; g.fillRect(x - w, ly - 4, w * 2, 5);
      g.restore();
    }
    // ice cubes (land at the bottom, then float up with the tea)
    S4.ICE.forEach((ti, i) => {
      if (t < ti - 0.35) return;
      const fall = 1 - E.inQ(seg(t, ti - 0.35, ti)), restY = base - 46 - i * 40, fl = Math.min(restY, base - 10 - (h - 20) * L * 0.98 + 24 + i * 22);
      const y = lerp(L > 0.15 ? fl : restY, top - 500, fall) + dy * 0;
      drawIng(g, 'ice', x - 50 + i * 50, y, 0.62, 0.3 * i + 0.1 * Math.sin(t * OM(2) + i), 1);
    });
    if (t > S4.LEMON - 0.4) { const fall = 1 - E.inQ(seg(t, S4.LEMON - 0.4, S4.LEMON)); drawIng(g, 'lemon', x + 30, lerp(base - 10 - (h - 20) * L + 20, top - 600, fall), 0.42, 1.2 + 0.1 * Math.sin(t * OM(2)), 1); }
  } else {
    path(); g.strokeStyle = 'rgba(255,255,255,0.85)'; g.lineWidth = 6; g.stroke();
    g.beginPath(); g.ellipse(x, top, w / 2, 12, 0, 0, TAU); g.strokeStyle = 'rgba(255,255,255,0.9)'; g.lineWidth = 4; g.stroke();
    g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(x - w / 2 + 22, top + 20, 16, h - 60); g.restore();
  }
  g.restore();
};
S4.back = (g, t) => {
  if (!vis(-300, W + 300)) return;
  // warm sun-pool on the porch
  g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.35; g.drawImage(SPR.gold, 200, FLOOR - 300, 760, 420); g.restore();
};
S4.mid = (g, t) => {
  const inView = vis(-200, W + 200);
  if (inView) S4.drawGlass(g, t, 'back');
  const C = S4.can(t);
  // tea stream
  if (inView && t > S4.POUR[0] - 0.05 && t < S4.POUR[1] + 0.15) {
    const m = S4.mouth(C), L = S4.level(t), ty = FLOOR - 10 - (S4.gh - 20) * L;
    const a0 = seg(t, S4.POUR[0] - 0.05, S4.POUR[0] + 0.15), a1 = seg(t, S4.POUR[1] - 0.05, S4.POUR[1] + 0.15);
    const y0 = lerp(m.y, ty, a1), y1 = lerp(m.y, ty, a0);
    const cxp = lerp(m.x, S4.gx, 0.7) + 30;
    g.save(); g.lineCap = 'round';
    const pt = (u) => ({ x: (1 - u) * (1 - u) * m.x + 2 * u * (1 - u) * cxp + u * u * (S4.gx - 10), y: (1 - u) * (1 - u) * m.y + 2 * u * (1 - u) * (m.y + 20) + u * u * ty });
    const u0 = clamp((y0 - m.y) / (ty - m.y)), u1 = clamp((y1 - m.y) / (ty - m.y));
    g.beginPath(); for (let k = 0; k <= 20; k++) { const u = lerp(u0, u1, k / 20), p = pt(u); const wx = 3 * Math.sin(t * OM(40) + u * 12); k ? g.lineTo(p.x + wx, p.y) : g.moveTo(p.x + wx, p.y); }
    g.strokeStyle = '#c8682a'; g.lineWidth = 18; g.stroke(); g.strokeStyle = 'rgba(255,214,150,0.7)'; g.lineWidth = 5; g.stroke();
    g.restore();
    if (a0 > 0.9 && a1 < 0.1) burst(g, t, t - frac(t * 4) / 4, { n: 8, seed: 40 + Math.floor(t * 4), x: S4.gx - 10, y: ty, sx: 30, ang: [-PI * 0.9, -PI * 0.1], spd: [120, 360], life: [0.2, 0.3], g: 1400, drag: 1, size: [3, 6], kind: 'drop', color: '#d47a34', hi: 'rgba(255,240,200,0.7)', comp: 'source-over', wrap: false });
  }
  if (canBox(C) || (C.x > -300 && C.x < VIS.x1 + 300)) { canShadow(g, C, 310 * (C.up || 0), 0.5); drawCan(g, C, t); }
  if (inView) S4.drawGlass(g, t, 'front');
};
S4.front = (g, t) => {
  const inView = vis(0, W);
  if (inView) {
    // STILL. — glass letters fill with sloshing tea
    const G = S4.still, M = S4.mg, lvl = E.ioS(seg(t, 0.4, 3.0)), drain = E.inQ(seg(t, 6.6, 7.1)), Lf = lvl * (1 - drain);
    const cap0 = G.cy - G.cap / 2 - 8, cap1 = G.cy + G.cap / 2 + 8, ly = lerp(cap1, cap0, Lf);
    M.globalCompositeOperation = 'source-over'; M.clearRect(0, 0, S4.mask.width, S4.mask.height); M.drawImage(G.c, 0, 0);
    M.globalCompositeOperation = 'source-in';
    M.beginPath(); M.moveTo(0, S4.mask.height);
    for (let x = 0; x <= S4.mask.width; x += 16) M.lineTo(x, ly + 10 * Math.sin(x / 70 + t * OM(6)) * (0.4 + 0.6 * Math.sin(PI * lvl)) + 6 * Math.sin(x / 31 - t * OM(9)));
    M.lineTo(S4.mask.width, S4.mask.height); M.closePath();
    const lg = M.createLinearGradient(0, cap0, 0, cap1); lg.addColorStop(0, '#ffcf7a'); lg.addColorStop(0.5, '#e08a3a'); lg.addColorStop(1, '#9a4a1c'); M.fillStyle = lg; M.fill();
    const pop = 1 + 0.25 * (1 - E.outBack(seg(t, 0.15, 0.5), 2.5)), al = seg(t, 0.15, 0.3) * (1 - seg(t, 7.0, 7.2));
    drawSprite(g, S4.stillO, 540, 320, { s: pop, alpha: al });
    g.save(); g.globalAlpha = al; g.translate(540, 320 - G.cap / 2); g.scale(pop, pop); g.drawImage(S4.mask, -G.cx, -G.cy); g.restore();
    // NOT FIZZY. — slot-roll letters
    const B = S4.B, lb = 540 - B.width / 2, bb = 495;
    g.save(); g.beginPath(); g.rect(0, bb - B.cap - 30, W, B.cap + 50); g.clip();
    B.items.forEach((it, i) => {
      if (!it.g) return; const t0 = 0.9 + i * 0.06; if (t < t0) return;
      let dy = (1 - E.outBack(seg(t, t0, t0 + 0.4), 2)) * (B.cap + 60);
      const to = 6.75 + i * 0.03; dy -= E.inBack(seg(t, to, to + 0.35), 2) * (B.cap + 80);
      drawLetter(g, it, lb, bb, { dy });
    });
    g.restore();
    const sb = S4.sub, n = Math.floor(seg(t, 2.6, 3.6) * sb.items.length + 0.001), so = 1 - seg(t, 6.7, 6.95);
    sb.items.forEach((it, i) => { if (i < n) drawLetter(g, it, 540 - sb.width / 2, 565, { alpha: so }); });
    drawLabel(g, t, S4.l1, 2.8, 6.4, S4.gx + 60, 860);
    drawLabel(g, t, S4.l2, 3.3, 6.45, S4.gx + 40, 1040);
    // impacts
    ring(g, t, S4.GLASS, S4.gx, FLOOR, { r0: 60, r1: 500, flat: 0.16, dur: 0.6, w: 10, color: 'rgba(255,240,200,1)', alpha: 0.8 });
    S4.ICE.forEach((ti, i) => burst(g, t, ti, { n: 10, seed: 50 + i, x: S4.gx, y: FLOOR - 60, sx: 80, ang: [-PI * 0.85, -PI * 0.15], spd: [200, 600], life: [0.3, 0.6], g: 1500, drag: 1, size: [3, 6], kind: 'drop', color: 'rgba(230,250,255,0.8)', comp: 'source-over', wrap: false }));
    ring(g, t, S4.BACK[1], 380, FLOOR, { r0: 60, r1: 700, flat: 0.16, dur: 0.7, w: 12, color: 'rgba(255,240,200,1)', alpha: 0.8 });
    burst(g, t, S4.LEMON, { n: 26, seed: 57, x: S4.gx, y: FLOOR - 270, sx: 100, ang: [-PI * 0.9, -PI * 0.1], spd: [300, 900], life: [0.4, 0.8], g: 1800, drag: 1, size: [4, 8], kind: 'drop', color: '#d47a34', hi: 'rgba(255,240,200,0.7)', comp: 'source-over', wrap: false });
  }
  chrome(g, 3, t);
};

// ================================================================== 05 · PICK YOUR SOCIAL — the reveal and the flavour flip
const S5 = {
  SLAM: [0.55, 1.0], FLIP: [[2.8, 3.6], [5.4, 6.2]],
  shakes: [[0.55, 10], [1.0, 24], [3.2, 7], [5.8, 7]],
  zooms: [[0.55, 0.015], [1.0, 0.04]],
  flashes: [[1.0, 0.35, '255,220,180'], [3.2, 0.3, '255,240,200'], [5.8, 0.3, '255,210,170']],
  NAMES: ["PEACHTREE CRUISIN'", 'HALF & HALF'],
};
S5.build = () => {
  const sA = fitSize('PICK YOUR', FONT.anton, 150, 760, 8), sB = fitSize('SOCIAL', FONT.wide, 250, 940, 6);
  S5.A = glyph('PICK YOUR', FONT.anton, sA, ST.cream);
  S5.B = glyph('SOCIAL', FONT.wide, sB, ST.peach);
  S5.Bp = glyph('SOCIAL', FONT.wide, sB, { fill: '#ff5fa0' }); S5.Bt = glyph('SOCIAL', FONT.wide, sB, { fill: '#3fe0d0' });
  S5.Ap = glyph('PICK YOUR', FONT.anton, sA, { fill: '#ff5fa0' }); S5.At = glyph('PICK YOUR', FONT.anton, sA, { fill: '#3fe0d0' });
  // split-flap tiles: one sprite per character
  S5.tile = {}; const chars = new Set((S5.NAMES.join('') + 'ABCDEFGHIJKLMNOPQRSTUVWXYZ').split(''));
  for (const ch of chars) {
    const c = mk(46, 64), g = c.getContext('2d');
    g.fillStyle = '#2a1220'; g.beginPath(); rrect(g, 0, 0, 46, 64, 7); g.fill();
    g.fillStyle = 'rgba(0,0,0,0.4)'; g.fillRect(0, 31, 46, 2);
    g.font = fstr(FONT.mono, 38); g.fillStyle = '#ffe9c4'; g.textAlign = 'center'; g.fillText(ch, 23, 46);
    S5.tile[ch] = c;
  }
  S5.l1 = { c: pill('FAN FAVORITE'), x: 830, y: 760 };
  S5.l2 = { c: pill('ICED TEA + LEMONADE'), x: 800, y: 760 };
  S5.l3 = { c: pill('PEACH + GINGER'), x: 230, y: 880 };
};
S5.flav = (t) => (t >= 3.2 && t < 5.8 ? 'half' : 'peach');
S5.can = (t) => {
  const P = whip(4, t);
  const rot = TAU * E.ioS(seg(t, ...S5.FLIP[0])) + TAU * E.ioS(seg(t, ...S5.FLIP[1]));
  const lift = 60 * Math.sin(PI * seg(t, ...S5.FLIP[0])) + 60 * Math.sin(PI * seg(t, ...S5.FLIP[1]));
  return { ...P, y: P.y - lift, rot, fl: S5.flav(t), sq: P.sq + 0.08 * damp(t - 3.6, 20, 6) + 0.08 * damp(t - 6.2, 20, 6), rim: 1, glint: seg(t, 1.0, 1.7), lift };
};
S5.back = (g, t) => {
  if (!vis(-400, W + 400)) return;
  // god rays from behind the can
  const cx = 540, cy = FLOOR - 300, rot = (t / LOOP) * (TAU / 12);
  const a = 0.6 + 0.4 * seg(t, 1.0, 1.3) + 0.3 * (decay(t - 3.2, 4) * (t > 3.2) + decay(t - 5.8, 4) * (t > 5.8));
  g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.11 * a; g.fillStyle = '#ffe0b0'; g.beginPath();
  for (let i = 0; i < 12; i++) { const an = rot + (i / 12) * TAU; g.moveTo(cx, cy); g.arc(cx, cy, 1400, an, an + TAU / 40); g.lineTo(cx, cy); }
  g.fill(); g.globalAlpha = 0.5 * a; g.drawImage(SPR.gold, cx - 520, cy - 420, 1040, 840); g.restore();
};
S5.mid = (g, t) => {
  const C = S5.can(t); if (!canBox(C)) return;
  canShadow(g, C, C.lift || 0, 0.55); drawCan(g, C, t);
};
S5.slam = (g, t, G, Gp, Gt, base, t0, k) => {
  if (t < t0 - 0.2) return;
  const u = seg(t, t0 - 0.2, t0), s = lerp(3.2, 1, E.inQ(u)), to = 6.85 + k * 0.08, out = seg(t, to, to + 0.35);
  const sc = s * (1 + 1.5 * E.inQ(out)), al = seg(t, t0 - 0.2, t0 - 0.1) * (1 - out);
  const gh = decay(t - t0, 5) * (t >= t0 ? 1 : 0) + 0.15 * Math.max(0, Math.sin(t * OM(2) + k));
  const sh = 12 + 30 * gh, sq = 0.1 * damp(t - t0, 22, 7);
  if (gh > 0.02) { drawSprite(g, Gp, 540 - sh, base, { sx: sc * (1 + sq), sy: sc * (1 - sq), alpha: al * 0.55 * Math.min(1, gh * 2), comp: 'lighter' }); drawSprite(g, Gt, 540 + sh, base, { sx: sc * (1 + sq), sy: sc * (1 - sq), alpha: al * 0.55 * Math.min(1, gh * 2), comp: 'lighter' }); }
  drawSprite(g, G, 540, base, { sx: sc * (1 + sq), sy: sc * (1 - sq), alpha: al });
};
S5.front = (g, t) => {
  const inView = vis(0, W);
  if (inView) {
    S5.slam(g, t, S5.A, S5.Ap, S5.At, 230, S5.SLAM[0], 0);
    S5.slam(g, t, S5.B, S5.Bp, S5.Bt, 470, S5.SLAM[1], 1);
    ring(g, t, S5.SLAM[1], 540, 400, { r0: 200, r1: 1100, dur: 0.7, w: 16, color: 'rgba(255,220,190,1)', alpha: 0.6, flat: 0.5 });
    [3.2, 5.8].forEach((tf, i) => { ring(g, t, tf, 540, FLOOR - 300, { r0: 120, r1: 760, dur: 0.6, w: 10, color: 'rgba(255,240,210,1)', alpha: 0.8 }); sparkle(g, t, tf, 540, FLOOR - 300, 40, 70 + i); });
    // split-flap flavour board
    const nm = t >= 3.4 && t < 6.0 ? S5.NAMES[1] : S5.NAMES[0], len = 18, tw = 50, x0 = 540 - (len * tw) / 2, y = 1150;
    const appear = seg(t, 1.3, 1.6) * (1 - seg(t, 6.95, 7.2));
    if (appear > 0) {
      const txt = nm.padStart(Math.floor((len + nm.length) / 2)).padEnd(len);
      for (let i = 0; i < len; i++) {
        const tf = [1.3, 3.4, 6.0].map((v) => v + i * 0.035), flipping = tf.some((v) => t >= v - 0.25 && t < v);
        const ch = flipping ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(hash(i, Math.floor(t * 30)) * 26)] : txt[i];
        const c = S5.tile[ch] || null, sy = flipping ? Math.abs(Math.cos(frac(t * 15) * PI)) : 1;
        g.save(); g.globalAlpha = appear; g.translate(x0 + i * tw + 23, y); g.scale(1, sy);
        if (c) g.drawImage(c, -23, -32); else { g.fillStyle = 'rgba(42,18,32,0.55)'; g.beginPath(); rrect(g, -23, -32, 46, 64, 7); g.fill(); }
        g.restore();
      }
    }
    drawLabel(g, t, S5.l1, 1.7, 2.75, 640, 800);
    drawLabel(g, t, S5.l3, 1.9, 2.8, 450, 900);
    drawLabel(g, t, S5.l2, 3.85, 5.3, 640, 800);
    drawLabel(g, t, S5.l1, 6.35, 7.0, 640, 800);
  }
  chrome(g, 4, t);
};

// ================================================================== 06 · CTA — find it at the Store Locator
const S6 = {
  BTN: 1.5, PIN: 2.3, BEAT2: 4.6, EXIT: 6.95,
  shakes: [[1.5, 10], [2.3, 18], [4.6, 8]],
  zooms: [[2.3, 0.03]],
  flashes: [[2.3, 0.3, '255,250,220']],
  bx: 700, by: 790,
};
S6.build = () => {
  const sA = fitSize('FIND YOUR', FONT.anton, 150, 800, 8), sB = fitSize('TEAZY', FONT.wide, 260, 900, 8);
  S6.A = word('FIND YOUR', FONT.anton, sA, ST.plum, 8);
  S6.B = word('TEAZY', FONT.wide, sB, ST.sun, 8);
  S6.btn = glyph('STORE LOCATOR', FONT.wide, fitSize('STORE LOCATOR', FONT.wide, 46, 440), { fill: '#fff8e8' });
  S6.at = glyph('@DRINKTEAZY', FONT.anton, 92, ST.plum);
  S6.web = word('THETEAZY.COM · BREWED FOR GOOD COMPANY', FONT.mono, 22, { fill: '#3a1430' }, 2);
};
S6.can = (t) => {
  const P = whip(5, t);
  const ex = seg(t, S6.EXIT, WHIP0), up = ex > 0 ? 1600 * E.inQ(ex) : 0;
  const jump = hop(t, S6.BEAT2, 0.6, 150);
  const sq = P.sq + 0.16 * damp(t - S6.BEAT2 - 0.6, 22, 6) - 0.2 * ex - 0.12 * damp(t - S6.EXIT + 0.12, 20, 5) * (t < S6.EXIT ? 1 : 0) * 0;
  return { ...P, y: P.y - up - jump, sq, rot: 0.15 * Math.sin(t * OM(1)), fl: 'peach', rim: 0.8, glint: seg(t, 2.3, 3.0), vis: t < WHIP0 || t >= WHIP1, lift: up + jump };
};
S6.back = (g, t) => {
  if (!vis(-300, W + 300)) return;
  // bright sunburst behind the CTA
  g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.5 + 0.2 * beat(t); g.drawImage(SPR.gold, S6.bx - 520, S6.by - 360, 1040, 720); g.restore();
};
S6.mid = (g, t) => {
  const C = S6.can(t); if (!C.vis || !canBox(C)) return;
  canShadow(g, C, C.lift, 0.5); drawCan(g, C, t);
};
S6.magnet = (g, t, Wd, base, t0, ln) => {
  const left = 540 - Wd.width / 2;
  Wd.items.forEach((it, i) => {
    if (!it.g) return;
    const ti = t0 + i * 0.07, p = E.outBack(seg(t, ti, ti + 0.45), 1.6);
    const ox = (hash(i + ln * 9, 1) - 0.5) * 1400, oy = (hash(i + ln * 9, 2) - 0.5) * 900 - 200, orot = (hash(i + ln * 9, 3) - 0.5) * 4;
    const to = 6.8 + i * 0.03 + ln * 0.05, q = E.inBack(seg(t, to, to + 0.45), 1.5);
    if (t < ti) return;
    const b = -26 * beat(t, 0.5 + i * 0.04) * seg(t, 3.0, 3.2) * (1 - seg(t, 6.6, 6.8));
    drawLetter(g, it, left, base, { dx: ox * (1 - p) + ox * q, dy: oy * (1 - p) + oy * q + b, rot: orot * (1 - p) + orot * q, s: 0.6 + 0.4 * Math.min(1, p) + 0 * q, alpha: seg(t, ti, ti + 0.1) * (1 - seg(t, to + 0.3, to + 0.45)) });
  });
};
S6.front = (g, t) => {
  const inView = vis(0, W);
  if (inView) {
    S6.magnet(g, t, S6.A, 230, 0.15, 0);
    S6.magnet(g, t, S6.B, 480, 0.55, 1);
    S6.A.items.concat(S6.B.items).forEach((it, i) => { if (!it.g) return; });
    // the button drops in and pulses on the beat
    const bp = E.outBack(seg(t, S6.BTN - 0.3, S6.BTN), 1.4), bo = seg(t, 6.9, 7.2), pulse = beat(t) * seg(t, 3.0, 3.3);
    if (bp > 0 && bo < 1) {
      const bw = 500, bh = 116, sq = 0.12 * damp(t - S6.BTN, 22, 6) + 0.1 * damp(t - S6.PIN, 24, 6), s = (1 + 0.06 * pulse) * (1 - E.inBack(bo, 2));
      g.save(); g.translate(S6.bx, S6.by - (1 - bp) * 900); g.scale(s * (1 + sq * 0.6), s * (1 - sq));
      g.fillStyle = 'rgba(60,15,40,0.35)'; g.beginPath(); rrect(g, -bw / 2 + 6, -bh / 2 + 14, bw, bh, bh / 2); g.fill();
      g.fillStyle = LG(g, 'btn', 0, -bh / 2, 0, bh / 2, [[0, '#7a2a5c'], [1, '#4a1238']]); g.beginPath(); rrect(g, -bw / 2, -bh / 2, bw, bh, bh / 2); g.fill();
      g.strokeStyle = '#ffe9c4'; g.lineWidth = 4; g.stroke();
      drawSprite(g, S6.btn, 0, S6.btn.cap / 2, {});
      g.restore();
      // halo ring per beat
      const q = frac(t); if (t > 3.0 && t < 6.8) { g.save(); g.globalAlpha = 0.5 * (1 - q); g.strokeStyle = '#fff4dc'; g.lineWidth = 4; g.beginPath(); rrect(g, S6.bx - 250 - 30 * q, S6.by - 58 - 30 * q, 500 + 60 * q, 116 + 60 * q, 58 + 30 * q); g.stroke(); g.restore(); }
    }
    // map pin drops onto the button
    const pf = seg(t, S6.PIN - 0.35, S6.PIN), po = seg(t, 6.85, 7.15);
    if (pf > 0 && po < 1) {
      const py = S6.by - 80 - (1 - E.inQ(pf)) * 900 - 60 * Math.max(0, kick(t - S6.BEAT2, 9, 3)) - 1200 * E.inBack(po, 2);
      const sq = 0.25 * damp(t - S6.PIN, 24, 6), px = S6.bx + 200;
      g.save(); g.translate(px, py); g.scale(1 + sq * 0.6, 1 - sq);
      g.beginPath(); g.moveTo(0, 0); g.bezierCurveTo(-18, -30, -46, -52, -46, -86); g.arc(0, -86, 46, PI, 0); g.bezierCurveTo(46, -52, 18, -30, 0, 0); g.closePath();
      g.fillStyle = '#ff6a4a'; g.fill(); g.strokeStyle = '#4a1426'; g.lineWidth = 5; g.stroke();
      g.beginPath(); g.arc(0, -86, 17, 0, TAU); g.fillStyle = '#fff4dc'; g.fill();
      g.restore();
    }
    ring(g, t, S6.PIN, S6.bx + 200, S6.by - 80, { r0: 30, r1: 520, dur: 0.6, w: 10, color: 'rgba(255,255,240,1)', alpha: 0.9 });
    sparkle(g, t, S6.PIN, S6.bx + 200, S6.by - 90, 40, 81, 'rgba(255,250,230,1)');
    ring(g, t, S6.BTN, S6.bx, S6.by + 40, { r0: 100, r1: 600, flat: 0.3, dur: 0.5, w: 8, color: 'rgba(255,240,220,1)', alpha: 0.6 });
    // handle stamps in, web line types
    const ap = seg(t, 2.9, 3.15), ao = seg(t, 6.9, 7.15);
    if (ap > 0) drawSprite(g, S6.at, S6.bx, 990, { s: 1.6 - 0.6 * E.outBack(ap, 2.5), alpha: Math.min(1, ap * 3) * (1 - ao), rot: -0.03 });
    ring(g, t, 3.15, S6.bx, 950, { r0: 80, r1: 420, dur: 0.45, w: 6, color: 'rgba(90,20,60,1)', alpha: 0.4, comp: 'source-over', flat: 0.4 });
    const wb = S6.web, n = Math.floor(seg(t, 3.4, 4.6) * wb.items.length + 0.001), wo = 1 - seg(t, 6.9, 7.1);
    wb.items.forEach((it, i) => { if (i < n) drawLetter(g, it, 540 - wb.width / 2, 1215, { alpha: wo }); });
    ring(g, t, S6.BEAT2 + 0.6, 290, FLOOR, { r0: 60, r1: 500, flat: 0.16, dur: 0.6, w: 10, color: 'rgba(255,240,200,1)', alpha: 0.7 });
  }
  // confetti of tiny leaves and peach slices on the beat
  if (inView) burst(g, t, S6.PIN, { n: 30, seed: 91, x: S6.bx, y: S6.by - 100, sx: 300, ang: [-PI * 0.9, -PI * 0.1], spd: [500, 1300], life: [1.0, 1.8], g: 900, drag: 1.2, size: [5, 9], kind: 'dot', color: '#ffffff', alpha: 0.8, wrap: false });
  chrome(g, 5, t);
};

const SL = [S1, S2, S3, S4, S5, S6];
