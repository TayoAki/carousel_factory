// ================================================================== THE WORLD — one Southern golden-hour evening across six slides
const FIELD = (...a) => embers(...a); // engine's rising-particle helper (engine name, not example content)
const BGK = [ // [top, bottom] colour of each slide's sky
  ['#2c1638', '#f0874a'],   // 1 dusk plum → amber horizon
  ['#d9614f', '#ffc08a'],   // 2 coral
  ['#244a35', '#a7b965'],   // 3 tea-leaf green
  ['#f5b347', '#c9652a'],   // 4 honey
  ['#173547', '#dd875a'],   // 5 teal dusk
  ['#ffd773', '#ff8c5e'],   // 6 sunshine
];
const BAND = [300, 300, 300, 300, 240];
let BGC = null;
function bakeBG() {
  const sc = 6, w = Math.ceil(WORLD / sc), h = Math.ceil(H / sc);
  BGC = mk(w, h); const g = BGC.getContext('2d'), im = g.createImageData(w, h);
  const T = BGK.map(([a, b]) => [hex2rgb(a), hex2rgb(b)]);
  for (let x = 0; x < w; x++) {
    const xw = (x + 0.5) * sc, top = T[0][0].slice(), bot = T[0][1].slice();
    for (let s = 1; s < N; s++) {
      const k = smooth(s * W - BAND[s - 1], s * W + BAND[s - 1], xw); if (k <= 0) continue;
      for (let c = 0; c < 3; c++) { top[c] = lerp(top[c], T[s][0][c], k); bot[c] = lerp(bot[c], T[s][1][c], k); }
    }
    for (let y = 0; y < h; y++) {
      const v = clamp((((y + 0.5) * sc) / FLOOR)) ** 1.15, i = (y * w + x) * 4;
      for (let c = 0; c < 3; c++) im.data[i + c] = lerp(top[c], bot[c], v);
      im.data[i + 3] = 255;
    }
  }
  g.putImageData(im, 0, 0);
  // hills: two continuous ridges with round peach-tree crowns
  HILLS = mk(Math.ceil(WORLD / 2), 200); const hg = HILLS.getContext('2d'); hg.scale(0.5, 0.5);
  const ridge = (y0, amp, seed, col, trees) => {
    hg.beginPath(); hg.moveTo(0, 400);
    for (let x = 0; x <= WORLD; x += 12) hg.lineTo(x, y0 + amp * (Math.sin(x / 410 + seed) * 0.6 + Math.sin(x / 167 + seed * 2) * 0.25 + Math.sin(x / 71 + seed) * 0.08));
    hg.lineTo(WORLD, 400); hg.closePath(); hg.fillStyle = col; hg.fill();
    for (let i = 0; i < trees; i++) {
      const x = hash(i, seed * 10) * WORLD, y = y0 + amp * (Math.sin(x / 410 + seed) * 0.6 + Math.sin(x / 167 + seed * 2) * 0.25 + Math.sin(x / 71 + seed) * 0.08), r = 14 + 16 * hash(i, seed * 10 + 1);
      hg.beginPath(); hg.arc(x, y - r * 0.7, r, 0, TAU); hg.arc(x + r * 0.8, y - r * 0.4, r * 0.7, 0, TAU); hg.fill();
    }
  };
  ridge(150, 60, 1, 'rgba(90,40,60,0.28)', 40);
  ridge(250, 50, 4, 'rgba(70,28,40,0.45)', 60);
}
let HILLS = null;
const worldLight = () => 1;

// ingredients floating across each edge (persistent, so a swipe always lines up)
const FLOAT = [
  ['lemon', 1 * W + 30, 610, 0.62], ['leaf', 1 * W - 70, 700, 0.55], ['peach', 1 * W + 80, 1010, 0.42],
  ['ginger', 2 * W - 20, 560, 0.5], ['leaf', 2 * W + 70, 660, 0.48], ['lemon', 2 * W - 60, 980, 0.38],
  ['peach', 3 * W + 10, 600, 0.58], ['leaf', 3 * W - 80, 520, 0.42], ['ginger', 3 * W + 60, 990, 0.38],
  ['lemon', 4 * W - 30, 640, 0.56], ['peach', 4 * W + 70, 760, 0.42], ['leaf', 4 * W - 40, 1000, 0.5],
  ['leaf', 5 * W + 20, 600, 0.58], ['peach', 5 * W - 70, 700, 0.46], ['lemon', 5 * W + 50, 1010, 0.4],
];
function buildFG() {}
function drawWorldBack(g, t, x0, x1) {
  g.fillStyle = '#2a1520'; g.fillRect(x0 - 300, -300, x1 - x0 + 600, H + 600);
  g.drawImage(BGC, 0, 0, WORLD, H);
  // soft horizon glow band (continuous)
  g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.22;
  for (let x = Math.floor(x0 / 400) * 400; x < x1 + 400; x += 400) g.drawImage(SPR.gold, x - 400, FLOOR - 260, 800, 360);
  g.restore();
  if (x0 < W + 700) drawSun(g, t);
  g.drawImage(HILLS, 0, FLOOR - 300, WORLD, 400);
  // drifting clouds (slow, whole world)
  g.save();
  for (let i = 0; i < 12; i++) {
    const x = hash(i, 801) * WORLD + 60 * Math.sin(t * OM(1) + i * 1.7), y = 140 + 300 * hash(i, 802), s = 260 + 220 * hash(i, 803);
    if (x + s < x0 || x - s > x1) continue;
    g.globalAlpha = 0; g.drawImage(SPR.steam[i % 3], x - s, y - s * 0.3, s * 2, s * 0.6);
  }
  g.restore();
  // porch boards (continuous floor)
  g.fillStyle = LG(g, 'porch', 0, FLOOR, 0, H, [[0, '#a2603a'], [0.25, '#7a4126'], [1, '#3b1c12']]);
  g.fillRect(x0 - 300, FLOOR, x1 - x0 + 600, H - FLOOR + 300);
  g.fillStyle = 'rgba(255,214,150,0.55)'; g.fillRect(x0 - 300, FLOOR - 2, x1 - x0 + 600, 4);
  let y = FLOOR, row = 0, hgt = 26;
  while (y < H) {
    g.fillStyle = 'rgba(40,15,8,0.35)'; g.fillRect(x0 - 300, y + hgt - 2, x1 - x0 + 600, 3);
    g.fillStyle = 'rgba(255,200,140,0.12)'; g.fillRect(x0 - 300, y + 1, x1 - x0 + 600, 2);
    const pw = 520, off = hash(row, 9) * pw;
    for (let x = Math.floor((x0 - off) / pw) * pw + off; x < x1 + pw; x += pw) { g.fillStyle = 'rgba(40,15,8,0.3)'; g.fillRect(x, y, 3, hgt); }
    y += hgt; hgt *= 1.32; row++;
  }
  // far bokeh motes (gold, slow)
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 70; i++) {
    const u = frac(t / LOOP + hash(i, 701)), xb = hash(i, 702) * WORLD, x = xb + 46 * Math.sin(u * TAU + i);
    if (x < x0 - 80 || x > x1 + 80) continue;
    const yy = FLOOR + 40 - (FLOOR + 120) * u, s = 18 + 40 * hash(i, 703);
    g.globalAlpha = (0.08 + 0.14 * hash(i, 704)) * Math.sin(PI * u);
    g.drawImage(SPR.cream, x - s, yy - s, s * 2, s * 2);
  }
  g.restore();
}
function drawWorldFront(g, t, x0, x1) {
  for (const [key, x, y, s] of FLOAT) {
    const img = ING[key], i = x * 0.01 + y * 0.003, ww = img.width * s, hh = img.height * s;
    if (x + ww < x0 || x - ww > x1) continue;
    const px = x + 12 * Math.sin(t * OM(1) + i), py = y + 22 * Math.sin(t * OM(1) + i * 2.1);
    g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.25; g.drawImage(SPR.gold, px - ww * 0.8, py - hh * 0.8, ww * 1.6, hh * 1.6); g.restore();
    g.save(); g.translate(px, py); g.rotate(0.5 * Math.sin(t * OM(1) + i * 3) + i); g.drawImage(img, -ww / 2, -hh / 2, ww, hh); g.restore();
  }
  // fireflies / golden pollen everywhere
  FIELD(g, t, { n: 90, seed: 740, life: 4, x0: -200, x1: WORLD + 200, y0: H - 100, y1: 300, rise: 420, wind: 40, size: [4, 11], alpha: 0.7, wig: 60, spr: SPR.firefly });
  // big out-of-focus glows drifting up
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 14; i++) {
    const u = frac(t / LOOP + hash(i, 751)), x = hash(i, 752) * WORLD + 120 * Math.sin(u * TAU);
    const s = 160 + 160 * hash(i, 753); if (x + s < x0 || x - s > x1) continue;
    const yy = H + 300 - (H + 600) * u;
    g.globalAlpha = 0.08 * Math.sin(PI * u); g.drawImage(SPR.gold, x - s, yy - s, s * 2, s * 2);
  }
  g.restore();
}
function buildSprites() {
  SPR.firefly = radial(64, [[0, 'rgba(255,255,230,1)'], [0.15, 'rgba(255,236,150,1)'], [0.4, 'rgba(255,200,80,0.4)'], [1, 'rgba(255,170,40,0)']]);
}
function projectBuild() { buildSprites(); buildHero(); bakeBG(); buildFG(); buildChrome(); }
