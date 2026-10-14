// ================================================================== THE CAN (protagonist) + ingredient sprites
// A 12oz Teazy can drawn in code. Origin = centre of the can's floor contact, y up = negative.
// The label is a texture wrapped around the cylinder in vertical strips, so C.rot turns the can
// like a turntable (used for the flavour flip on slide 5).
const CAN = { rx: 104, top: -392, bodyTop: -366, labT: -344, labB: -34, persp: 0.17 };
const TEX = {};           // label textures per flavour
const ING = {};           // ingredient sprites (peach, lemon, ginger, leaf, ice)
const TEXW = 1320, TEXH = 620; // label texture (2x resolution of the visible label)

const FLAV = {
  peach: { bg: [[0, '#ffb98a'], [0.5, '#ff8a5c'], [1, '#e2553f']], ink: '#3a1420', acc: '#fff3df', name: ['PEACHTREE', "CRUISIN'"], sub: 'PEACH + GINGER' },
  half: { bg: [[0, '#ffe58a'], [0.5, '#f6c24a'], [1, '#c9822a']], ink: '#3a1e0c', acc: '#fffbe8', name: ['HALF', '& HALF'], sub: 'ICED TEA + LEMONADE' },
};

function buildLabel(key) {
  const F = FLAV[key], c = mk(TEXW, TEXH), g = c.getContext('2d');
  const gr = g.createLinearGradient(0, 0, 0, TEXH); for (const [o, col] of F.bg) gr.addColorStop(o, col);
  g.fillStyle = gr; g.fillRect(0, 0, TEXW, TEXH);
  // sun-ray fan behind the logo (centre of front = TEXW/2)
  const cx = TEXW / 2;
  g.save(); g.globalAlpha = 0.16; g.fillStyle = '#fff6e0';
  for (let i = 0; i < 18; i++) { const a = -PI + (i / 18) * PI; g.beginPath(); g.moveTo(cx, 420); g.arc(cx, 420, 900, a, a + PI / 36); g.closePath(); g.fill(); }
  g.restore();
  // rolling hill band at the bottom of the label
  g.fillStyle = 'rgba(60,20,30,0.28)'; g.beginPath(); g.moveTo(0, TEXH);
  for (let x = 0; x <= TEXW; x += 20) g.lineTo(x, 520 + 22 * Math.sin((x / TEXW) * TAU * 3) + 12 * Math.sin((x / TEXW) * TAU * 7));
  g.lineTo(TEXW, TEXH); g.closePath(); g.fill();
  // little leaf repeats on the back half
  for (let i = 0; i < 26; i++) {
    const x = (hash(i, 31) * 0.5 + (hash(i, 32) < 0.5 ? 0 : 0.75)) % 1 * TEXW, y = 60 + hash(i, 33) * 440;
    if (Math.abs(x - cx) < 230) continue;
    g.save(); g.translate(x, y); g.rotate(hash(i, 34) * TAU); g.globalAlpha = 0.22; leafPath(g, 26); g.fillStyle = F.ink; g.fill(); g.restore();
  }
  // wordmark (set in type, no logo files)
  g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  g.font = fstr(FONT.wide, 92); g.fillStyle = F.ink; g.fillText('TEAZY', cx, 200);
  g.font = fstr(FONT.mono, 24); g.fillStyle = F.ink; g.fillText('SOCIAL  ICED  TEA', cx, 246);
  g.fillStyle = F.ink; g.fillRect(cx - 120, 268, 240, 4);
  g.font = fstr(FONT.anton, 64); g.fillStyle = F.acc;
  g.save(); g.shadowColor = 'rgba(40,10,10,0.35)'; g.shadowOffsetY = 4;
  g.fillText(F.name[0], cx, 352); g.fillText(F.name[1], cx, 424); g.restore();
  g.font = fstr(FONT.mono, 20); g.fillStyle = F.ink; g.fillText(F.sub, cx, 470);
  g.font = fstr(FONT.mono, 18); g.fillText('12 FL OZ', cx, 590);
  // back half: a few words from the brand
  g.font = fstr(FONT.anton, 46); g.fillStyle = F.ink;
  g.fillText('BREWED FOR', 0, 260); g.fillText('BREWED FOR', TEXW, 260);
  g.fillText('GOOD COMPANY', 0, 316); g.fillText('GOOD COMPANY', TEXW, 316);
  TEX[key] = c;
}
function leafPath(g, s) {
  g.beginPath(); g.moveTo(-s, 0); g.quadraticCurveTo(-s * 0.2, -s * 0.62, s, 0); g.quadraticCurveTo(-s * 0.2, s * 0.62, -s, 0); g.closePath();
}

let CANP = null;
function canPath() {
  if (CANP) return CANP; const rx = CAN.rx, ry = rx * CAN.persp, p = new Path2D();
  p.moveTo(-rx * 0.9, -2); p.quadraticCurveTo(-rx, -4, -rx, -24);
  p.lineTo(-rx, CAN.bodyTop); p.quadraticCurveTo(-rx, CAN.bodyTop - 10, -rx * 0.88, CAN.top + 6);
  p.lineTo(rx * 0.88, CAN.top + 6); p.quadraticCurveTo(rx, CAN.bodyTop - 10, rx, CAN.bodyTop);
  p.lineTo(rx, -24); p.quadraticCurveTo(rx, -4, rx * 0.9, -2);
  p.ellipse(0, -2, rx * 0.9, ry * 0.9, 0, 0, PI, false); p.closePath(); return (CANP = p);
}
const DROPS = Array.from({ length: 46 }, (_, i) => ({ a: (hash(i, 61) - 0.5) * TAU, y: lerp(CAN.labT + 10, CAN.labB - 6, hash(i, 62)), r: 2 + 4.5 * hash(i, 63) ** 2 }));
// C: { x, y, s, rot, fl, sq, lean, tilt, rim, glint, alpha }
function drawCan(g, C, t) {
  const rx = CAN.rx, ry = rx * CAN.persp, rot = C.rot || 0, tex = TEX[C.fl || 'peach'];
  g.save();
  g.translate(C.x, C.y); if (C.lean) g.rotate(C.lean);
  const sq = C.sq || 0; g.scale(C.s * (1 + sq * 0.6), C.s * (1 - sq));
  if (C.tilt) { g.translate(0, -196); g.rotate(C.tilt); g.translate(0, 196); }
  if (C.alpha != null) g.globalAlpha *= C.alpha;
  // body silhouette (metal)
  const BP = canPath(); g.save(); g.clip(BP);
  g.beginPath(); g.rect(-rx - 2, CAN.top - 4, rx * 2 + 4, -CAN.top + 30);
  g.fillStyle = LG(g, 'canMetal', -rx, 0, rx, 0, [[0, '#5d5a5e'], [0.18, '#c9c6c4'], [0.33, '#ffffff'], [0.5, '#b4b0ad'], [0.75, '#8a8580'], [1, '#4a4648']]);
  g.fill();
  // wrapped label (vertical strips)
  const NS = 44, lt = CAN.labT, lh = CAN.labB - CAN.labT;
  for (let i = 0; i < NS; i++) {
    const a0 = -PI / 2 + (i / NS) * PI, a1 = -PI / 2 + ((i + 1) / NS) * PI, am = (a0 + a1) / 2;
    const x0 = Math.sin(a0) * rx, x1 = Math.sin(a1) * rx, dy = Math.cos(am) * ry;
    const u = frac(0.5 + (am + rot) / TAU), sw = TEXW / (2 * NS);
    const sx = Math.min(TEXW - sw, u * TEXW - sw / 2 < 0 ? 0 : u * TEXW - sw / 2);
    g.drawImage(tex, sx, 0, sw, TEXH, x0 - 0.4, lt + dy, x1 - x0 + 0.8, lh);
  }
  // cylinder shading + speculars
  g.fillStyle = LG(g, 'canShade', -rx, 0, rx, 0, [[0, 'rgba(30,10,20,0.62)'], [0.14, 'rgba(30,10,20,0.18)'], [0.3, 'rgba(255,255,255,0)'], [0.62, 'rgba(30,10,20,0.05)'], [0.86, 'rgba(30,10,20,0.3)'], [1, 'rgba(30,10,20,0.66)']]);
  g.fillRect(-rx, CAN.top, rx * 2, -CAN.top);
  g.save(); g.globalCompositeOperation = 'lighter';
  g.fillStyle = LG(g, 'canSpec', -rx, 0, rx, 0, [[0, 'rgba(255,255,255,0)'], [0.26, 'rgba(255,255,255,0)'], [0.31, 'rgba(255,250,235,0.42)'], [0.36, 'rgba(255,255,255,0)'], [0.78, 'rgba(255,255,255,0)'], [0.83, 'rgba(255,220,170,0.2)'], [0.88, 'rgba(255,255,255,0)']]);
  g.fillRect(-rx, CAN.top + 8, rx * 2, -CAN.top - 12);
  // travelling glint
  if (C.glint > 0) {
    const gx = lerp(-rx * 1.4, rx * 1.4, C.glint);
    g.globalAlpha = Math.sin(PI * C.glint) * 0.8; g.drawImage(SPR.cream, gx - 40, CAN.top, 80, -CAN.top);
  }
  g.restore();
  // condensation drops (iced)
  for (const d of DROPS) {
    const a = d.a + rot * 0, cz = Math.cos(a); if (cz < 0.2) continue;
    const x = Math.sin(a) * rx * 0.97, y = d.y + cz * ry;
    g.fillStyle = 'rgba(255,255,255,0.32)'; g.beginPath(); g.ellipse(x, y, d.r * cz, d.r * 1.25, 0, 0, TAU); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.75)'; g.beginPath(); g.arc(x - d.r * 0.3, y - d.r * 0.4, d.r * 0.32, 0, TAU); g.fill();
  }
  g.restore();
  // lid
  const lidY = CAN.top + 6, lrx = rx * 0.88;
  g.beginPath(); g.ellipse(0, lidY, lrx, lrx * CAN.persp, 0, 0, TAU);
  g.fillStyle = LG(g, 'lid', -lrx, 0, lrx, 0, [[0, '#8d8a8a'], [0.4, '#eceae6'], [1, '#77726f']]); g.fill();
  g.strokeStyle = 'rgba(60,55,58,0.8)'; g.lineWidth = 3; g.stroke();
  g.beginPath(); g.ellipse(0, lidY + 2, lrx * 0.82, lrx * 0.82 * CAN.persp, 0, 0, TAU); g.strokeStyle = 'rgba(90,85,85,0.6)'; g.lineWidth = 2.5; g.stroke();
  // pull tab
  g.fillStyle = '#d6d2cc'; g.beginPath(); g.ellipse(6, lidY - 1, 22, 6, 0, 0, TAU); g.fill(); g.strokeStyle = 'rgba(70,65,65,0.7)'; g.lineWidth = 1.5; g.stroke();
  g.fillStyle = '#3c3838'; g.beginPath(); g.ellipse(-26, lidY + 2, 13, 4, 0, 0, TAU); g.fill();
  // golden rim light
  if (C.rim > 0) {
    g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = C.rim;
    g.fillStyle = LG(g, 'canRim', -rx, 0, rx, 0, [[0, 'rgba(255,200,110,0.9)'], [0.07, 'rgba(255,170,80,0)'], [0.93, 'rgba(255,170,80,0)'], [1, 'rgba(255,214,140,1)']]);
    g.fillRect(-rx, CAN.top + 10, rx * 2, -CAN.top - 14); g.restore();
  }
  g.restore();
}
// soft contact shadow + warm bounce on the porch
function canShadow(g, C, lift = 0, a = 0.5) {
  const k = clamp(1 - lift / 700), w = 260 * C.s * (0.6 + 0.4 * k);
  g.save(); g.globalAlpha = a * (0.3 + 0.7 * k); g.drawImage(SPR.dark, C.x - w, C.y - 22 * C.s, w * 2, 46 * C.s); g.restore();
}
const canBox = (C) => { const s = C.s * 1.3; return vis(C.x - 140 * s, C.x + 140 * s); };

// ---------------------------------------------------------------- ingredients
function buildIngredients() {
  // peach half-slice with pit groove
  let c = mk(240, 240), g = c.getContext('2d'); g.translate(120, 120);
  g.beginPath(); g.arc(0, 0, 96, PI * 0.05, PI * 1.95); g.closePath();
  let gr = g.createRadialGradient(-20, -20, 6, 0, 0, 100); gr.addColorStop(0, '#ffe2a8'); gr.addColorStop(0.6, '#ffb15c'); gr.addColorStop(0.92, '#f2763a'); gr.addColorStop(1, '#c8402e');
  g.fillStyle = gr; g.fill(); g.lineWidth = 9; g.strokeStyle = '#d8493a'; g.stroke();
  g.fillStyle = '#b5552a'; g.beginPath(); g.ellipse(18, 0, 26, 34, 0, 0, TAU); g.fill();
  g.fillStyle = 'rgba(120,40,20,0.6)'; g.beginPath(); g.ellipse(22, 2, 14, 22, 0.2, 0, TAU); g.fill();
  g.fillStyle = 'rgba(255,255,255,0.45)'; g.beginPath(); g.ellipse(-44, -36, 20, 9, -0.6, 0, TAU); g.fill();
  ING.peach = soften(c, 0.6);
  // lemon wheel
  c = mk(240, 240); g = c.getContext('2d'); g.translate(120, 120);
  g.beginPath(); g.arc(0, 0, 100, 0, TAU); g.fillStyle = '#f2c018'; g.fill();
  g.beginPath(); g.arc(0, 0, 90, 0, TAU); g.fillStyle = '#fff7d0'; g.fill();
  for (let k = 0; k < 9; k++) {
    const a = (k / 9) * TAU; g.save(); g.rotate(a);
    g.beginPath(); g.moveTo(8, 3); g.quadraticCurveTo(50, -2, 80, 18); g.quadraticCurveTo(60, 34, 14, 14); g.closePath();
    const lg = g.createLinearGradient(0, 0, 80, 0); lg.addColorStop(0, '#ffe680'); lg.addColorStop(1, '#ffd23a'); g.fillStyle = lg; g.fill(); g.restore();
  }
  g.fillStyle = 'rgba(255,255,255,0.5)'; g.beginPath(); g.ellipse(-40, -46, 22, 8, -0.7, 0, TAU); g.fill();
  ING.lemon = soften(c, 0.6);
  // ginger knob
  c = mk(260, 200); g = c.getContext('2d'); g.translate(130, 100);
  const knobs = [[-60, 10, 44, 30], [0, 0, 58, 38], [56, -12, 40, 30], [30, -50, 24, 32], [-30, -38, 20, 26], [80, 24, 26, 20]];
  for (const [x, y, a, b] of knobs) {
    g.beginPath(); g.ellipse(x, y, a, b, hash(x, y) - 0.5, 0, TAU);
    const rg = g.createRadialGradient(x - a * 0.3, y - b * 0.4, 4, x, y, a); rg.addColorStop(0, '#f7e1b0'); rg.addColorStop(0.6, '#d9ae6a'); rg.addColorStop(1, '#9b6b34');
    g.fillStyle = rg; g.fill();
  }
  g.strokeStyle = 'rgba(110,70,30,0.5)'; g.lineWidth = 2;
  for (let k = 0; k < 8; k++) { const x = -70 + k * 20; g.beginPath(); g.moveTo(x, -8 + 6 * hash(k, 3)); g.quadraticCurveTo(x + 6, 4, x + 2, 20); g.stroke(); }
  ING.ginger = soften(c, 0.6);
  // tea leaf
  c = mk(240, 140); g = c.getContext('2d'); g.translate(120, 70);
  leafPath(g, 104); gr = g.createLinearGradient(0, -60, 0, 60); gr.addColorStop(0, '#7fb24a'); gr.addColorStop(1, '#2f6a2c'); g.fillStyle = gr; g.fill();
  g.strokeStyle = 'rgba(230,255,190,0.7)'; g.lineWidth = 3.5; g.beginPath(); g.moveTo(-104, 0); g.quadraticCurveTo(0, -4, 100, 0); g.stroke();
  g.lineWidth = 2;
  for (let k = -3; k <= 3; k++) { if (!k) continue; const x = k * 24; g.beginPath(); g.moveTo(x, -1); g.lineTo(x + 22, -26 * Math.sign(k) * 0 - 28); g.moveTo(x, 1); g.lineTo(x + 22, 28); g.stroke(); }
  ING.leaf = soften(c, 0.6);
  // ice cube
  c = mk(160, 160); g = c.getContext('2d'); g.translate(80, 80);
  g.beginPath(); rrect(g, -56, -56, 112, 112, 22); g.fillStyle = 'rgba(235,250,255,0.55)'; g.fill();
  g.strokeStyle = 'rgba(255,255,255,0.9)'; g.lineWidth = 4; g.stroke();
  g.fillStyle = 'rgba(255,255,255,0.7)'; g.beginPath(); rrect(g, -40, -42, 40, 16, 8); g.fill();
  ING.ice = soften(c, 0.8);
  // blurred foreground versions
  ING.peachB = blurred(ING.peach, 8); ING.lemonB = blurred(ING.lemon, 8); ING.leafB = blurred(ING.leaf, 7);
}
function drawIng(g, key, x, y, s, rot = 0, a = 1) {
  const img = ING[key]; if (!img || a <= 0.003) return;
  g.save(); g.translate(x, y); g.rotate(rot); if (a !== 1) g.globalAlpha *= a;
  g.drawImage(img, -img.width * s / 2, -img.height * s / 2, img.width * s, img.height * s); g.restore();
}
function buildHero() { buildLabel('peach'); buildLabel('half'); buildIngredients(); }
