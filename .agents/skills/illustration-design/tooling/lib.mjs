/* ============================================================
   Движок иллюстраций: проекция, примитивы, вывод SVG, тёмная пара.

   Правила стиля — design-system/foundations/Illustrations/illustration-style.json
   (холст 195×140, изометрия 30°, плоские заливки, палитра бирюзы, прозрачности
   0.3 / 0.4 / 0.5). Палитра и карта тёмной темы читаются из него, цветов в коде нет.
   Темы сцен — ./themes/*.mjs, запуск — ./illustration-gen.mjs.
   ============================================================ */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const STYLE = JSON.parse(fs.readFileSync(
  path.resolve(HERE, '../../../../design-system/foundations/Illustrations/illustration-style.json'), 'utf8'));

/* ---------- палитра (роли из JSON стиля) ---------- */
const L = (role) => STYLE.palette.light[role].hex;
const TO_DARK = STYLE.palette.mapLightToDark;
const COL = {
  cube:  { top: L('top'),      left: L('sideMid'), right: L('left'),       edge: L('right') },
  slab:  { top: L('top'),      left: L('sideMid'), right: L('left'),       edge: L('right') },
  hero:  { top: L('topLight'), left: L('right'),    right: L('shadowDeep'), edge: L('shadowDeep') },
  floor: { top: L('topMuted'), left: L('left'),     right: L('right') },
  floorLight: { top: L('top'), left: L('sideMid'),  right: L('left') },
  coin:  { top: L('top'),      left: L('sideMid'), right: L('left') },
  coinHero: { top: L('topLight'), left: L('right'), right: L('shadowDeep') },
};
const GLASS = L('topLightest'), LINE = L('left');

/* ---------- проекция ---------- */
const D2R = Math.PI / 180;
const SX = Math.cos(Math.PI / 6);                 // dy/dx = 0.577
/* наклон: внутри `withTilt` плоскость отклоняется назад (к −y) пропорционально высоте над zRef — «экран откинут»; вне наклона dz = 0 и проекция прежняя */
let TILT = 0, TILT_Z = 0;
const pv = (w) => { const dz = TILT * (w[2] - TILT_Z); return [(w[0] - w[1] + dz) * SX, (w[0] + w[1] - dz) * 0.5 - w[2]]; };
function withTilt(t, zRef, fn) { const p = [TILT, TILT_Z]; TILT = t; TILT_Z = zRef; try { fn(); } finally { [TILT, TILT_Z] = p; } }

/* ---------- сцена ---------- */
/* сдвиг и масштаб контура в экранных координатах: проекция линейна, поэтому равномерный масштаб мира = масштаб экрана */
function placeSegs(segs, k, o) {
  const P = (p) => [p[0] * k + o[0], p[1] * k + o[1]];
  return segs.map((sg) => (sg[0] === 'Z' ? sg : sg[0] === 'C' ? ['C', P(sg[1]), P(sg[2]), P(sg[3])] : [sg[0], P(sg[1])]));
}
class Scene {
  constructor(name) { this.name = name; this.items = []; this.g = null; this.fr = null; this.ow = null; }
  group(id, fn) { const p = this.g; this.g = id; fn(); this.g = p; }
  /* владелец контуров (для автопроверки: «чья это площадь»); в svg не попадает, вложенные group его не сбивают */
  owner(id, fn) { const p = this.ow; this.ow = id; fn(); this.ow = p; }
  /* рамка размещения мотива: всё, что рисуется внутри fn, масштабируется на k и ставится в точку at (мир: x, y, z).
     Вне рамки (старые сцены) координаты не трогаются — их рисунок не меняется. */
  frame({ k = 1, at = [0, 0, 0] }, fn) { const p = this.fr; this.fr = { k, o: pv(at) }; fn(); this.fr = p; }
  add(segs, fill, opacity) {
    if (this.fr) segs = placeSegs(segs, this.fr.k, this.fr.o);
    this.items.push({ segs, fill, opacity, g: this.g, o: this.ow });
  }
}

/* дуга эллипса q(t)=C+U·cos t+V·sin t кубическими кривыми (аффинно-инвариантно) */
function arc2(C, U, V, t0, t1) {
  const n = Math.max(1, Math.ceil(Math.abs(t1 - t0) / (Math.PI / 2) - 1e-9));
  const dt = (t1 - t0) / n, k = (4 / 3) * Math.tan(dt / 4);
  const pt = (t) => [C[0] + U[0] * Math.cos(t) + V[0] * Math.sin(t), C[1] + U[1] * Math.cos(t) + V[1] * Math.sin(t)];
  const dv = (t) => [-U[0] * Math.sin(t) + V[0] * Math.cos(t), -U[1] * Math.sin(t) + V[1] * Math.cos(t)];
  const out = [];
  for (let i = 0; i < n; i++) {
    const a = t0 + dt * i, b = a + dt, pa = pt(a), pb = pt(b), da = dv(a), db = dv(b);
    out.push(['C', [pa[0] + k * da[0], pa[1] + k * da[1]], [pb[0] - k * db[0], pb[1] - k * db[1]], pb]);
  }
  return out;
}
const ept = (e, t) => [e.C[0] + e.U[0] * Math.cos(t) + e.V[0] * Math.sin(t), e.C[1] + e.U[1] * Math.cos(t) + e.V[1] * Math.sin(t)];
const arcE = (e, t0, t1) => arc2(e.C, e.U, e.V, t0, t1);

/* окружность радиуса r в плоскости, натянутой на единичные векторы u, v */
const UX = [1, 0, 0], VY = [0, 1, 0], WZ = [0, 0, 1];
const scale3 = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
const pvv = (w) => [(w[0] - w[1] + TILT * w[2]) * SX, (w[0] + w[1] - TILT * w[2]) * 0.5 - w[2]];   // проекция вектора (без сдвига на zRef)
const circ = (c, u, v, r) => ({ C: pv(c), U: pvv(scale3(u, r)), V: pvv(scale3(v, r)) });
const H = (c, r) => circ(c, UX, VY, r);           // горизонтальная
const shiftE = (e, dx, dy) => ({ C: [e.C[0] + dx, e.C[1] + dy], U: e.U, V: e.V });

const poly3 = (pts) => pts.map((p, i) => [i ? 'L' : 'M', pv(p)]).concat([['Z']]);

function ellipseSegs(e, rev = false) {
  return [['M', ept(e, rev ? 2 * Math.PI : 0)], ...arcE(e, rev ? 2 * Math.PI : 0, rev ? 0 : 2 * Math.PI), ['Z']];
}
const disc = (s, e, fill, op) => s.add(ellipseSegs(e), fill, op);
function ring(s, c, r1, r0, fill, op) {                // кольцо: внешний эллипс + внутренний в обратную сторону
  s.add([...ellipseSegs(H(c, r1)), ...ellipseSegs(H(c, r0), true)], fill, op);
}
function sector(s, e, t0, t1, fill, op) {
  s.add([['M', e.C], ['L', ept(e, t0)], ...arcE(e, t0, t1), ['Z']], fill, op);
}

/* ---------- примитивы ---------- */
/* параллелепипед; x,y,z — минимальный угол; видны верх, лево (плоскость y+d), право (плоскость x+w) */
function box(s, x, y, z, w, d, h, c, o = {}) {
  s.add(poly3([[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]]), c.left);
  s.add(poly3([[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]]), c.right);
  s.add(poly3([[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]]), c.top);
  const e = o.edge;
  if (e && c.edge) {                                   // у наборов без цвета ребра (floor, floorLight) кромка не рисовалась: fill="undefined" ничего не показывал
    s.add(poly3([[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + e], [x, y + d, z + e]]), c.edge);
    s.add(poly3([[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + e], [x + w, y, z + e]]), c.edge);
  }
  if (o.glass) {                                       // стеклянный блик на левой грани, opacity 0.3
    const [a, b] = o.glass;
    s.add(poly3([[x + a, y + d, z + b], [x + w - a, y + d, z + b], [x + w - a, y + d, z + h - b], [x + a, y + d, z + h - b]]), GLASS, 0.3);
  }
  if (o.stripes) {                                     // горизонтальные полосы на левой грани (окна / строки)
    const { n, t, gap, a, z0 } = o.stripes;
    for (let i = 0; i < n; i++) {
      const zz = z + z0 + i * gap;
      s.add(poly3([[x + a, y + d, zz], [x + w - a, y + d, zz], [x + w - a, y + d, zz + t], [x + a, y + d, zz + t]]), LINE, 0.4);
    }
  }
}
/* строки «текста» на верхней грани, полоски вдоль x */
function topLines(s, x, y, z, { n, gap, t, len, a = 3, b = 3 }) {
  for (let i = 0; i < n; i++) {
    const yy = y + b + i * gap, l = Array.isArray(len) ? len[i % len.length] : len;
    s.add(poly3([[x + a, yy, z], [x + a + l, yy, z], [x + a + l, yy + t, z], [x + a, yy + t, z]]), LINE, 0.4);
  }
}
/* вертикальный цилиндр (монета): низ круга уходит вниз на h; бок двумя тонами */
function cyl(s, cx, cy, z, r, h, c) {
  const et = H([cx, cy, z + h], r), eb = shiftE(et, 0, h);
  const q = Math.PI / 4;
  s.add([['M', ept(et, 3 * q)], ...arcE(et, 3 * q, q), ['L', ept(eb, q)], ...arcE(eb, q, 3 * q), ['Z']], c.left);
  s.add([['M', ept(et, q)], ...arcE(et, q, -q), ['L', ept(eb, -q)], ...arcE(eb, -q, q), ['Z']], c.right);
  disc(s, et, c.top);
}
/* стопка монет */
function coinStack(s, cx, cy, z, r, n, c, th = 3.4, wob = 0.6) {
  for (let i = 0; i < n; i++) cyl(s, cx + (i % 2 ? wob : -wob) * 0.5, cy + (i % 2 ? -wob : wob) * 0.5, z + i * th, r, th, c);
}
/* выдавленный диск (вертикальный экран): тело между передним и задним эллипсом */
/* призма по многоугольнику pts ([x, y] на полу, по возрастанию угла): боковые грани по глубине, затем верх */
function prism(s, pts, z, h, c) {
  const z1 = z + h, walls = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
    const nx = dy / l, ny = -dx / l;
    if (nx + ny > 1e-6) walls.push({ a, b, key: a[0] + a[1] + b[0] + b[1], col: ny > nx ? c.left : c.right });
  }
  walls.sort((p, q) => p.key - q.key);
  for (const w of walls) s.add(poly3([[w.a[0], w.a[1], z], [w.b[0], w.b[1], z], [w.b[0], w.b[1], z1], [w.a[0], w.a[1], z1]]), w.col);
  s.add(poly3(pts.map((p) => [p[0], p[1], z1])), c.top);
}
function extrude(s, e, D, fill) {
  const cr = (a, b) => a[0] * b[1] - a[1] * b[0];
  const ta = Math.atan2(cr(e.V, D), cr(e.U, D));
  const mid = (t) => [Math.cos(t) * e.U[0] + Math.sin(t) * e.V[0], Math.cos(t) * e.U[1] + Math.sin(t) * e.V[1]];
  const m = mid(ta + Math.PI / 2), dot = m[0] * D[0] + m[1] * D[1];
  const t0 = dot < 0 ? ta : ta + Math.PI;               // «хвостовая» половина переднего эллипса
  const back = shiftE(e, D[0], D[1]);
  s.add([['M', ept(e, t0)], ...arcE(e, t0, t0 + Math.PI), ['L', ept(back, t0 + Math.PI)],
    ...arcE(back, t0 + Math.PI, t0 + 2 * Math.PI), ['Z']], fill);
}

/* ---------- вывод ---------- */
const f = (n) => String(+n.toFixed(3));
function bbox(items) {
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  const eat = (p) => { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); };
  for (const it of items) {
    let cur = null;
    for (const sg of it.segs) {
      if (sg[0] === 'M' || sg[0] === 'L') { eat(sg[1]); cur = sg[1]; }
      else if (sg[0] === 'C') {
        for (let t = 0.05; t <= 1.0001; t += 0.05) {
          const u = 1 - t, a = cur, b = sg[1], c = sg[2], d = sg[3];
          eat([u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0],
               u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1]]);
        }
        cur = sg[3];
      }
    }
  }
  return [x0, y0, x1, y1];
}
/* вписать в холст: масштаб до рамки FIT, центр в (CX, CY) */
const FIT = { w: 184, h: 130, cx: 97.5, cy: 70 };
function render(scene, opts = {}) {
  const [x0, y0, x1, y1] = bbox(scene.items);
  const s = Math.min(FIT.w / (x1 - x0), FIT.h / (y1 - y0), opts.maxScale ?? Infinity);   // maxScale — ограничение сверху (для сцен из описания)
  const ox = FIT.cx - ((x0 + x1) / 2) * s, oy = FIT.cy - ((y0 + y1) / 2) * s;
  const T = (p) => f(p[0] * s + ox) + ' ' + f(p[1] * s + oy);
  const dOf = (segs) => segs.map((sg) => sg[0] === 'Z' ? 'Z' : sg[0] === 'C'
    ? 'C' + T(sg[1]) + ' ' + T(sg[2]) + ' ' + T(sg[3]) : sg[0] + T(sg[1])).join('');
  let body = '', cur = null;
  for (const it of scene.items) {
    if (it.g !== cur) { if (cur) body += '\t</g>\n'; if (it.g) body += `\t<g id="${it.g}">\n`; cur = it.g; }
    body += `${cur ? '\t' : ''}\t<path d="${dOf(it.segs)}" fill="${it.fill}"${it.opacity ? ` opacity="${it.opacity}"` : ''} fill-rule="nonzero" />\n`;
  }
  if (cur) body += '\t</g>\n';
  /* контуры в координатах холста (для автопроверки); на строку svg не влияет */
  const placed = scene.items.map((it) => ({ g: it.g, o: it.o, fill: it.fill, opacity: it.opacity || 1,
    segs: placeSegs(it.segs, s, [ox, oy]) }));
  return { scale: s, placed, svg: `<svg viewBox="0 0 195 140" xmlns="http://www.w3.org/2000/svg" width="195" height="140" fill="none">\n\t<rect id="${scene.name}" width="195" height="140" x="0" y="0" />\n${body}</svg>\n` };
}
function toDark(svg) {
  return svg.replace(/fill="(#[0-9A-F]{6})"/g, (m, h) => {
    if (!TO_DARK[h]) throw new Error('цвет вне карты: ' + h);
    return `fill="${TO_DARK[h]}"`;
  });
}

/* ---------- общие кусочки сцен ---------- */
const polar = (r, deg) => [r * Math.cos(deg * D2R), r * Math.sin(deg * D2R)];
const byDepth = (arr) => arr.sort((a, b) => (a.x + a.y) - (b.x + b.y));

/* развёртка со «шлейфом»: три вложенных сектора, ярче всего у ведущей кромки t1 (цвета — от тёмного к светлому) */
function sweepTrail(s, e, t0, t1, colors) {
  const k = [0, 0.5, 0.8];
  colors.forEach((c, i) => sector(s, e, t0 + (t1 - t0) * k[i], t1, c));
}

/* клин-луч в воздухе: кольцевой сектор r0..r1, углы a0..a1, высота z0..z1; стекло — полупрозрачные грани */
function beamWedge(s, r0, r1, a0, a1, z0, z1, color, op, edgeColor) {
  const dir = (a) => [Math.cos(a), Math.sin(a)];
  const at = (r, a, z) => [r * dir(a)[0], r * dir(a)[1], z];
  const eOuterTop = H([0, 0, z1], r1), eOuterBot = H([0, 0, z0], r1), eInnerTop = H([0, 0, z1], r0);
  /* внешняя криволинейная стенка */
  s.add([['M', ept(eOuterTop, a0)], ...arcE(eOuterTop, a0, a1), ['L', ept(eOuterBot, a1)], ...arcE(eOuterBot, a1, a0), ['Z']], color, op);
  /* боковые стенки на кромках развёртки */
  for (const a of [a0, a1]) s.add(poly3([at(r0, a, z0), at(r1, a, z0), at(r1, a, z1), at(r0, a, z1)]), color, op);
  /* верхняя грань */
  s.add([['M', ept(eOuterTop, a0)], ...arcE(eOuterTop, a0, a1), ['L', ept(eInnerTop, a1)], ...arcE(eInnerTop, a1, a0), ['Z']], color, op);
  /* яркая кайма: верхняя дуга и вертикаль ведущей кромки на внешнем крае */
  const rim = 1.5, eRimIn = H([0, 0, z1], r1 - rim);
  s.add([['M', ept(eOuterTop, a0)], ...arcE(eOuterTop, a0, a1), ['L', ept(eRimIn, a1)], ...arcE(eRimIn, a1, a0), ['Z']], edgeColor);
  s.add(poly3([at(r1 - rim, a1, z0), at(r1, a1, z0), at(r1, a1, z1), at(r1 - rim, a1, z1)]), edgeColor);
}

/* конус-луч из точки apex вдоль dir: контур — две касательные из вершины к эллипсу торца (находятся по знаку
   векторного произведения) и дальняя дуга торца; spot — торец, подсвеченный отдельным слоем */
function beamCone(s, apex, dir, len, rEnd, color, op) {
  const n = Math.hypot(...dir), d = dir.map((v) => v / n);
  let u = [d[1], -d[0], 0]; const un = Math.hypot(u[0], u[1]); u = u.map((v) => v / un);
  const v = [d[1] * u[2] - d[2] * u[1], d[2] * u[0] - d[0] * u[2], d[0] * u[1] - d[1] * u[0]];
  const e = circ([apex[0] + d[0] * len, apex[1] + d[1] * len, apex[2] + d[2] * len], u, v, rEnd);
  const A = pv(apex);
  const dq = (t) => [-e.U[0] * Math.sin(t) + e.V[0] * Math.cos(t), -e.U[1] * Math.sin(t) + e.V[1] * Math.cos(t)];
  const fn = (t) => { const p = ept(e, t), g = dq(t); return (p[0] - A[0]) * g[1] - (p[1] - A[1]) * g[0]; };
  const roots = [], N = 720;
  for (let i = 0; i < N; i++) {
    let a = (i * 2 * Math.PI) / N, b = ((i + 1) * 2 * Math.PI) / N;
    if (fn(a) * fn(b) < 0) { for (let k = 0; k < 40; k++) { const m = (a + b) / 2; if (fn(a) * fn(m) <= 0) b = m; else a = m; } roots.push((a + b) / 2); }
  }
  if (roots.length !== 2) throw new Error('конус: касательных ' + roots.length);
  const [ta, tb] = roots, far = (t) => { const p = ept(e, t); return Math.hypot(p[0] - A[0], p[1] - A[1]); };
  const [t0, t1] = far((ta + tb) / 2) > far((ta + tb) / 2 + Math.PI) ? [ta, tb] : [tb, ta + 2 * Math.PI];
  s.add([['M', A], ['L', ept(e, t0)], ...arcE(e, t0, t1), ['Z']], color, op);
  return e;
}

/* интервалы [a0,a1] ∩ ([lo,hi] + 2πk) */
function clipAngles(a0, a1, lo, hi) {
  const out = [];
  for (let k = -2; k <= 2; k++) {
    const l = Math.max(a0, lo + k * 2 * Math.PI), h = Math.min(a1, hi + k * 2 * Math.PI);
    if (h > l + 1e-6) out.push([l, h]);
  }
  return out;
}
/* разбить интервал по углам вида π/4 + kπ (там боковая грань меняет тон) */
function splitAtDiagonals(l, h) {
  const cuts = [l];
  for (let k = -6; k <= 6; k++) { const t = Math.PI / 4 + k * Math.PI; if (t > l + 1e-6 && t < h - 1e-6) cuts.push(t); }
  cuts.push(h);
  return cuts.slice(1).map((b, i) => [cuts[i], b]);
}
/* призма сектора кольца (кусок объёмного «пончика»); explode — вынос по радиусу */
function sectorPrism(s, cx, cy, z, r0, r1, a0, a1, h, c, explode = 0) {
  const mid = (a0 + a1) / 2;
  cx += explode * Math.cos(mid); cy += explode * Math.sin(mid);
  const z1 = z + h, P = (r, a, zz) => [cx + r * Math.cos(a), cy + r * Math.sin(a), zz];
  const tone = (nx, ny) => (ny > nx ? c.left : c.right);
  const wallArc = (r, l, hh, col) => {
    const e1 = H([cx, cy, z1], r), e0 = H([cx, cy, z], r);
    s.add([['M', ept(e1, l)], ...arcE(e1, l, hh), ['L', ept(e0, hh)], ...arcE(e0, hh, l), ['Z']], col);
  };
  if (r0 > 0) {                                           // внутренняя стенка отверстия, видна на дальней стороне
    for (const [l, hh] of clipAngles(a0, a1, 3 * Math.PI / 4, 7 * Math.PI / 4))
      for (const [x, y] of splitAtDiagonals(l, hh)) { const m = (x + y) / 2; wallArc(r0, x, y, tone(-Math.cos(m), -Math.sin(m))); }
  }
  const side = (a, nx, ny) => {                           // боковая стенка сектора; видна, если нормаль к зрителю
    if (nx + ny > 1e-6) s.add(poly3([P(r0, a, z), P(r1, a, z), P(r1, a, z1), P(r0, a, z1)]), tone(nx, ny));
  };
  side(a0, Math.sin(a0), -Math.cos(a0));
  side(a1, -Math.sin(a1), Math.cos(a1));
  for (const [l, hh] of clipAngles(a0, a1, -Math.PI / 4, 3 * Math.PI / 4))
    for (const [x, y] of splitAtDiagonals(l, hh)) { const m = (x + y) / 2; wallArc(r1, x, y, tone(Math.cos(m), Math.sin(m))); }
  const eo = H([cx, cy, z1], r1), ei = H([cx, cy, z1], r0);
  s.add([['M', ept(eo, a0)], ...arcE(eo, a0, a1), ...(r0 > 0 ? [['L', ept(ei, a1)], ...arcE(ei, a1, a0)] : [['L', ei.C]]), ['Z']], c.top);
}

/* плоские детали в вертикальной плоскости y = const (передняя «левая» грань блока) */
const wallRect = (s, x, y, z, w, h, col, op) => s.add(poly3([[x, y, z], [x + w, y, z], [x + w, y, z + h], [x, y, z + h]]), col, op);
function wallLine(s, y, pts, t, col, op) {                // ломаная толщиной t в плоскости (x,z)
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, z0] = pts[i], [x1, z1] = pts[i + 1], dx = x1 - x0, dz = z1 - z0, l = Math.hypot(dx, dz);
    const nx = (-dz / l) * t / 2, nz = (dx / l) * t / 2;
    s.add(poly3([[x0 + nx, y, z0 + nz], [x1 + nx, y, z1 + nz], [x1 - nx, y, z1 - nz], [x0 - nx, y, z0 - nz]]), col, op);
  }
}
/* круг в плоскости y = const */
const wallDisc = (s, cx, y, cz, r, col, op) => disc(s, circ([cx, y, cz], UX, WZ, r), col, op);

export { withTilt, prism, FIT, placeSegs, STYLE, L, TO_DARK, COL, GLASS, LINE, D2R, pv, Scene, arc2, ept, arcE, UX, VY, WZ, scale3, circ, H, shiftE, poly3, ellipseSegs, disc, ring, sector, box, topLines, cyl, coinStack, extrude, bbox, render, toDark, polar, byDepth, sweepTrail, beamWedge, beamCone, clipAngles, splitAtDiagonals, sectorPrism, wallRect, wallLine, wallDisc };
