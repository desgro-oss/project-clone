/* ============================================================
   Детали для «экранов-панелей»: карточки-виджеты на вертикальной грани, значки, шестерня, пирог, пузыри.
   Всё рисуется на плоскости y = yF грани главного предмета (как в `drawMonitor`), цвета — только роли палитры.
   Используется мотивами тем «Питчер» (`motifs.mjs`); сами по себе мотивами не являются.
   ============================================================ */
import {
  L, COL, D2R, pv, UX, WZ, circ, H, poly3, disc, ring, ellipseSegs, sector, box, cyl, extrude, wallRect, wallLine, wallDisc,
} from './lib.mjs';

export const CARD = '#FFFFFF';

/* ---------- панель: толстая плита с экраном в рамке ---------- */
export function panel(s, x, y, zb, w, h, d = 6) {
  box(s, x, y, zb, w, d, h, COL.slab, { edge: 1.2 });
  const yF = y + d + 0.05;
  wallRect(s, x + 3, yF, zb + 3, w - 6, h - 6, L('topLight'));
  return { yF, x0: x + 3, z0: zb + 3, w: w - 6, h: h - 6, top: zb + h, right: x + w };
}

/* ---------- карточки-виджеты (белая карточка + содержимое) ---------- */
export function wBars(s, x, yF, z, w, h) {
  wallRect(s, x, yF, z, w, h, CARD);
  const n = 5, bw = (w - 6 - (n - 1) * 1.4) / n;
  [0.3, 0.5, 0.4, 0.7, 1].forEach((k, i) => wallRect(s, x + 3 + i * (bw + 1.4), yF + 0.05, z + 2.5, bw, (h - 5) * k, i === n - 1 ? L('right') : L('top')));
}
export function wDonut(s, x, yF, z, w, h) {
  wallRect(s, x, yF, z, w, h, CARD);
  const r = Math.min(h * 0.36, w * 0.24), cx = x + r + 3.5, cz = z + h / 2;
  wallDisc(s, cx, yF + 0.05, cz, r, L('top'));
  sector(s, circ([cx, yF + 0.05, cz], UX, WZ, r), -10 * D2R, 130 * D2R, L('right'));
  wallDisc(s, cx, yF + 0.1, cz, r * 0.55, CARD);
  [w - 2 * r - 12, w - 2 * r - 16].forEach((l, i) => wallRect(s, x + 2 * r + 8, yF + 0.05, cz + 1.2 - i * 3.6, Math.max(l, 4), 1.8, i ? L('top') : L('right'), i ? undefined : 0.5));
}
export function wDoc(s, x, yF, z, w, h) {
  wallRect(s, x, yF, z, w, h, CARD);
  wallRect(s, x + 3, yF + 0.05, z + h - 6.5, w * 0.45, 2.6, L('right'));
  const n = Math.max(2, Math.floor((h - 14) / 3.6));
  for (let i = 0; i < n; i++) wallRect(s, x + 3, yF + 0.05, z + h - 12 - i * 3.6, (w - 6) * (i % 3 === 2 ? 0.62 : i % 3 === 1 ? 0.86 : 1), 1.5, L('top'));
}
export function wTable(s, x, yF, z, w, h) {
  wallRect(s, x, yF, z, w, h, CARD);
  const cw = (w - 6 - 2.4) / 3, rh = (h - 6 - 3.6) / 4;
  for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) wallRect(s, x + 3 + c * (cw + 1.2), yF + 0.05, z + 3 + (3 - r) * (rh + 1.2), cw, rh, r === 0 ? L('right') : L('top'));
}
export function wNews(s, x, yF, z, w, h) {
  wallRect(s, x, yF, z, w, h, CARD);
  wallRect(s, x + 3, yF + 0.05, z + h - 6.5, w - 6, 3, L('right'));
  wallRect(s, x + 3, yF + 0.05, z + 3, w * 0.34, h - 13, L('top'));
  [0, 1, 2].forEach((i) => wallRect(s, x + 3 + w * 0.34 + 2.5, yF + 0.05, z + h - 12.5 - i * 3.2, w * 0.66 - 8.5 - (i % 2) * 3, 1.5, L('top')));
}
export function wGlobe(s, x, yF, z, w, h) {
  wallRect(s, x, yF, z, w, h, CARD);
  const r = Math.min(w, h) * 0.34, cx = x + w / 2, cz = z + h / 2;
  wallDisc(s, cx, yF + 0.05, cz, r, L('right'));
  wallDisc(s, cx, yF + 0.1, cz, r * 0.82, L('topLight'));
  wallLine(s, yF + 0.15, [[cx, cz - r * 0.82], [cx, cz + r * 0.82]], 1.1, L('right'));
  wallLine(s, yF + 0.15, [[cx - r * 0.82, cz], [cx + r * 0.82, cz]], 1.1, L('right'));
}
/* поиск: плашка и лупа */
function glyphSearch(s, cx, yF, cz, r, ring, inner) {
  wallDisc(s, cx, yF, cz, r, ring);
  wallDisc(s, cx, yF + 0.05, cz, r * 0.64, inner);
  wallLine(s, yF, [[cx + r * 0.62, cz - r * 0.62], [cx + r * 1.4, cz - r * 1.4]], r * 0.36, ring);
}
export function wSearch(s, x, yF, z, w, h) {
  wallRect(s, x, yF, z, w, h, CARD);
  wallRect(s, x + 3, yF + 0.05, z + h / 2 - 2.2, w * 0.5, 4.4, L('top'));
  glyphSearch(s, x + w - 9, yF + 0.05, z + h / 2 + 1, 4.4, L('right'), CARD);
}
export function wPerson(s, x, yF, z, w, h) {
  wallRect(s, x, yF, z, w, h, CARD);
  const cx = x + w / 2, rh = Math.min(h * 0.16, w * 0.14), rs = Math.min(w * 0.3, h * 0.36);
  wallDisc(s, cx, yF + 0.05, z + h * 0.62, rh, L('right'));
  const arc = []; for (let i = 0; i <= 12; i++) { const a = (i / 12) * Math.PI; arc.push([cx + rs * Math.cos(a), yF + 0.05, z + 2 + rs * Math.sin(a) * 0.9]); }
  s.add(poly3(arc), L('right'));                                                         // плечи: полукруг
}
/* ядро-«ИИ»: акцентный квадрат с четырёхлучевой искрой */
export function wCore(s, x, yF, z, w, h) {
  wallRect(s, x, yF, z, w, h, L('right'));
  const cx = x + w / 2, cz = z + h / 2, R = Math.min(w, h) * 0.36, r = R * 0.3, pts = [];
  for (let i = 0; i < 8; i++) { const a = (i * 45 + 90) * D2R, k = i % 2 ? r : R; pts.push([cx + k * Math.cos(a), yF + 0.05, cz + k * Math.sin(a)]); }
  s.add(poly3(pts), CARD);
}
/* значок организации: три колонны */
export function wTower(s, x, yF, z, w, h) {
  wallRect(s, x, yF, z, w, h, CARD);
  const bw = w * 0.2, base = z + 3;
  [[0.2, 0.42], [0.4, 0.66], [0.62, 0.5]].forEach(([k, hh]) => wallRect(s, x + w * k, yF + 0.05, base, bw, (h - 8) * hh, L('right')));
}
/* строка проверки: галочка в кружке и линия */
export function wCheckRow(s, x, yF, z, w, h) {
  wallRect(s, x, yF, z, w, h, CARD);
  checkMark(s, x + h / 2 + 1.5, yF + 0.05, z + h / 2, h * 0.34, L('right'), CARD);
  wallRect(s, x + h + 3, yF + 0.05, z + h / 2 - 1, w - h - 7, 2, L('top'));
}
export function checkMark(s, cx, yF, cz, r, disc, tick) {
  wallDisc(s, cx, yF, cz, r, disc);
  wallLine(s, yF + 0.05, [[cx - r * 0.45, cz + r * 0.02], [cx - r * 0.1, cz - r * 0.38], [cx + r * 0.5, cz + r * 0.4]], r * 0.3, tick);
}
/* линия-связь между карточками: ломаная в плоскости грани */
export function link(s, yF, pts) { wallLine(s, yF + 0.02, pts, 1.1, L('right'), 0.5); }

/* ---------- пузыри и значки, торчащие за край панели ---------- */
/* сообщение: акцентный блок с хвостиком; kind — dots (печатает) или lines (текст) */
export function chatBadge(s, x, y, z, w, h, kind = 'dots', tone = 'hero') {
  const c = tone === 'hero' ? COL.hero : COL.slab, face = tone === 'hero' ? L('right') : L('sideMid'), ink = tone === 'hero' ? CARD : L('left');
  box(s, x, y, z, w, 5, h, c, { edge: 0.8 });
  const yF = y + 5.05;
  s.add(poly3([[x + 4, yF, z], [x + 11, yF, z], [x + 4, yF, z - 6]]), face);
  if (kind === 'dots') for (let i = 0; i < 3; i++) wallDisc(s, x + w / 2 - 4.6 + i * 4.6, yF, z + h / 2, 1.2, ink);
  else [w - 8, w - 13].forEach((l, i) => wallRect(s, x + 4, yF, z + h - 6 - i * 4, l, 2, ink, tone === 'hero' ? undefined : 0.5));
}
export function searchBadge(s, x, y, z, w) {
  box(s, x, y, z, w, 5, w, COL.hero, { edge: 0.8 });
  const yF = y + 5.05;
  s.add(poly3([[x + w - 11, yF, z], [x + w - 4, yF, z], [x + w - 4, yF, z - 6]]), L('right'));
  glyphSearch(s, x + w / 2 - 1, yF, z + w / 2 + 1, w * 0.26, CARD, L('right'));
}

/* ---------- шестерня в плоскости грани: выдавлена вперёд, с отверстием насквозь ---------- */
export function wallGear(s, cx, cz, R, y0, y1) {
  const T = 8, p = (2 * Math.PI) / T, Ri = R * 0.78, pts = [];
  for (let i = 0; i < T; i++) for (const [r, da] of [[Ri, -0.22], [R, -0.14], [R, 0.14], [Ri, 0.22], [Ri, 0.5]]) { const a = (i + da) * p; pts.push([cx + r * Math.cos(a), cz + r * Math.sin(a)]); }
  for (let i = 0; i < pts.length; i++) {                                                  // боковые грани: верх и право
    const a = pts[i], b = pts[(i + 1) % pts.length], nx = b[1] - a[1], nz = -(b[0] - a[0]);
    const c = nz > 1e-6 ? L('topLight') : nx > 1e-6 ? L('left') : null;
    if (c) s.add(poly3([[a[0], y0, a[1]], [a[0], y1, a[1]], [b[0], y1, b[1]], [b[0], y0, b[1]]]), c);
  }
  s.add([...poly3(pts.map(([x, z]) => [x, y1, z])).slice(0, -1), ['Z'], ...ellipseSegs(circ([cx, y1, cz], UX, WZ, R * 0.38), true)], L('top'));   // лицо с отверстием
  s.add(ellipseSegs(circ([cx, y1, cz], UX, WZ, R * 0.3)), L('left'), 0.4);               // втулка
}

/* ---------- пирог (круговая диаграмма) с толщиной, торчит из-за панели ---------- */
export function wallPie(s, cx, y, cz, r) {
  const rim = circ([cx, y, cz], UX, WZ, r);
  extrude(s, rim, pv([0, -3, 0]), L('left'));
  disc(s, rim, L('top'));
  [[-20, 95, L('right')], [95, 190, L('topLight')], [190, 300, L('left')]].forEach(([a0, a1, c]) => sector(s, circ([cx, y, cz], UX, WZ, r), a0 * D2R, a1 * D2R, c));
}

/* ---------- линейный график, полоса «окна», база данных, столбцы в стекле лупы ---------- */
export function wLine(s, x, yF, z, w, h) {
  wallRect(s, x, yF, z, w, h, CARD);
  wallRect(s, x + 3, yF + 0.05, z + 3, w - 6, 1.2, L('top'));
  const ks = [0.18, 0.4, 0.3, 0.62, 0.8], pts = ks.map((k, i) => [x + 4 + i * ((w - 8) / 4), z + 5 + (h - 12) * k]);
  wallLine(s, yF + 0.1, pts, 1.5, L('right'));
  pts.forEach(([px, pz]) => wallDisc(s, px, yF + 0.15, pz, 1.4, L('right')));
}
export function topBar(s, x, yF, z, w) {
  wallRect(s, x, yF, z, w, 5, L('right'));
  for (let i = 0; i < 3; i++) wallDisc(s, x + 3 + i * 3.6, yF + 0.05, z + 2.5, 0.9, CARD);
}
export function dbStack(s, cx, cy, z, r, n) {
  for (let i = 0; i < n; i++) cyl(s, cx, cy, z + i * 7.6, r, 7, i === n - 1 ? COL.coinHero : COL.coin);
  ring(s, [cx, cy, z + n * 7.6 - 0.6], r * 0.66, r * 0.5, L('topLightest'));
  for (let i = 1; i < n; i++) ring(s, [cx, cy, z + i * 7.6], r * 0.98, r * 0.9, L('topLightest'), 0.5);
}
export function lensBars(s, cx, yF, cz, r) {
  const bw = r * 0.2;
  [0.34, 0.6, 0.46, 0.9].forEach((k, i) => wallRect(s, cx - r * 0.5 + i * (bw + r * 0.07), yF, cz - r * 0.42, bw, r * 0.9 * k, i === 3 ? L('right') : L('top')));
}