/* ============================================================
   Каталог мотивов: готовые предметы, из которых собирается сцена.

   Мотив — функция `draw(s, opts)` в натуральном размере, по центру (0, 0), основание на z = 0, плюс паспорт:
     title    — название; depicts — что изображает (по-русски); from — откуда взят рисунок;
     fp(opts) — занимаемый на полу прямоугольник { w, d } и высота h в натуральном размере;
     opts     — параметры, которые можно менять в описании сцены.
   Размер и положение задаёт раскладка (`layout.mjs`) через `Scene.frame` — мотив координат не считает.
   `docStack` и `drawMonitor` — утверждённые рисунки (варианты 7 и 3 «Фондов»); темы тоже берут их отсюда.
   ============================================================ */
import {
  L, COL, GLASS, LINE, D2R, pv, UX, WZ, circ, H, poly3, disc, ring, sector, box, topLines, cyl, coinStack,
  extrude, prism, beamCone, sectorPrism, wallRect, wallLine, wallDisc, withTilt,
} from './lib.mjs';

/* стопка документов: листы с небольшим сдвигом, на верхнем — «строки» и цветная плашка */
export const PAPER = { top: L('topLight'), left: L('sideLight'), right: L('left'), edge: L('right') };
export function docStack(s, x, y, z, w, d, n, th = 2.4) {
  for (let i = 0; i < n; i++) {
    const ox = (i % 2 ? 1 : -1) * 0.9, oy = ((i * 7) % 3 - 1) * 0.8;
    box(s, x + ox, y + oy, z + i * th, w, d, th, PAPER, { edge: 0.6 });
    if (i === n - 1) {
      const zt = z + n * th;
      s.add(poly3([[x + ox + 3, y + oy + 3, zt], [x + ox + 3 + 9, y + oy + 3, zt], [x + ox + 3 + 9, y + oy + 6.5, zt], [x + ox + 3, y + oy + 6.5, zt]]), L('right'));
      topLines(s, x + ox, y + oy + 4, zt, { n: Math.floor((d - 10) / 3.6), gap: 3.6, t: 1.3, len: [w - 8, w - 13, w - 9, w - 17], a: 3, b: 4 });
    }
  }
}

/* монитор-дашборд — утверждённый рисунок (вариант 3), не менять; px, py — угол корпуса */
export function drawMonitor(s, px, py, zb = 6) {          // zb — высота опоры над нулём (на плите 6, без плиты 0)
  const pw = 66, pd = 4, ph = 44, pz = zb + 10, yF = py + pd + 0.05;
  s.group('stand', () => {
    box(s, px + pw / 2 - 12, py - 4, zb, 24, 14, 3, COL.slab, { edge: 0.8 });
    box(s, px + pw / 2 - 3.5, py - 0.5, zb + 3, 7, 5, 8, COL.cube, { edge: 0.8 });
  });
  s.group('monitor', () => {
    box(s, px, py, pz, pw, pd, ph, COL.slab, { edge: 1 });
    const x0 = px + 3.5, z0 = pz + 3.5, iw = pw - 7, ih = ph - 7;
    wallRect(s, x0, yF, z0, iw, ih, L('right'));                                   // экран
    const tw = (iw - 8) / 3;
    for (let i = 0; i < 3; i++) {                                                  // карточки показателей
      wallRect(s, x0 + 2 + i * (tw + 2), yF, z0 + ih - 14, tw, 11, L('topLight'));
      wallRect(s, x0 + 4 + i * (tw + 2), yF, z0 + ih - 8, tw * 0.55, 2, L('right'), 0.5);
      wallRect(s, x0 + 4 + i * (tw + 2), yF, z0 + ih - 12.5, tw * 0.35, 1.6, L('left'));
    }
    const bars = [6, 10, 8, 14, 18], bw = 4;                                      // столбцы
    bars.forEach((h, i) => wallRect(s, x0 + 3 + i * (bw + 2), yF, z0 + 3, bw, h, i === 4 ? '#FFFFFF' : L('top')));
    wallLine(s, yF, [[x0 + 3, z0 + 16], [x0 + 11, z0 + 20], [x0 + 19, z0 + 18], [x0 + 27, z0 + 24]], 0.9, L('topLightest'));
    const cx = x0 + iw - 14, cz = z0 + 12;                                        // кольцевая диаграмма
    wallDisc(s, cx, yF, cz, 9, L('topLight'));
    sector(s, circ([cx, yF, cz], UX, WZ, 9), -10 * D2R, 110 * D2R, '#FFFFFF');
    wallDisc(s, cx, yF, cz, 4.8, L('right'));
  });
}

/* ---------- детали питчера: рисуются на вертикальной грани y = yF главного предмета, а не отдельными фигурами ---------- */
/* содержимое слайда: заголовок, таблица, столбцы с линией роста; pal — цвета (на тёмной грани — светлые) */
function slideFace(s, x0, yF, z0, w, h, o = {}) {
  const head = o.head ?? L('right'), cell = o.cell ?? L('topLight'), hi = o.hi ?? '#FFFFFF', line = o.line ?? L('right');
  const rows = o.rows ?? 4, table = o.table !== false, rh = 4.4;
  wallRect(s, x0 + 3, yF, z0 + h - 6.5, w * 0.36, 3.2, head);
  const tw = table ? w * 0.54 : 0, cw = (tw - 2.4) / 3, tz = z0 + h - 12.5;
  if (table) for (let r = 0; r < rows; r++) for (let c = 0; c < 3; c++)
    wallRect(s, x0 + 3 + c * (cw + 1.2), yF, tz - r * (rh + 1.2) - rh, cw, rh, r === 0 ? head : cell);
  const bx = x0 + 3 + (table ? tw + 5 : 0), aw = w - 3 - (table ? tw + 5 : 0) - 3, bw = (aw - 3 * 1.6) / 4, bh = (h - 16) * 0.62;
  [0.35, 0.6, 0.48, 1].forEach((k, i) => wallRect(s, bx + i * (bw + 1.6), yF, z0 + 3, bw, 3 + bh * k, i === 3 ? hi : cell));
  wallLine(s, yF, [0.35, 0.6, 0.48, 1].map((k, i) => [bx + i * (bw + 1.6) + bw / 2, z0 + 3 + 3 + bh * k + 3.5]), 0.9, line);
}
/* значок «соответствует требованиям»: диск с галочкой */
function checkBadge(s, cx, yF, cz, r, disc = L('right'), tick = '#FFFFFF') {
  wallDisc(s, cx, yF, cz, r, disc);
  wallLine(s, yF + 0.05, [[cx - r * 0.45, cz + r * 0.02], [cx - r * 0.1, cz - r * 0.38], [cx + r * 0.5, cz + r * 0.4]], r * 0.3, tick);
}
/* часы: циферблат со стрелками — «минуты вместо недели» */
function clockFace(s, cx, yF, cz, r) {
  wallDisc(s, cx, yF, cz, r, L('right'));
  wallDisc(s, cx, yF + 0.05, cz, r * 0.8, L('topLight'));
  wallLine(s, yF + 0.1, [[cx, cz], [cx, cz + r * 0.55]], r * 0.17, L('right'));
  wallLine(s, yF + 0.1, [[cx, cz], [cx + r * 0.42, cz - r * 0.2]], r * 0.17, L('right'));
}
/* лупа: обод с толщиной, стекло 0.3, ручка вниз-вправо; плоскость y, центр (cx, cz) */
function magnifier(s, cx, y, cz, r) {
  const dx = Math.SQRT1_2, p0 = [cx + r * dx, cz - r * dx], len = r * 0.9, p1 = [p0[0] + len * dx, p0[1] - len * dx], n = 1.9 * dx;
  s.add(poly3([[p0[0] - n, y - 3, p0[1] - n], [p1[0] - n, y - 3, p1[1] - n], [p1[0] + n, y - 3, p1[1] + n], [p0[0] + n, y - 3, p0[1] + n]]), L('left'));
  s.add(poly3([[p0[0] - n, y, p0[1] - n], [p1[0] - n, y, p1[1] - n], [p1[0] + n, y, p1[1] + n], [p0[0] + n, y, p0[1] + n]]), L('right'));
  const rim = circ([cx, y, cz], UX, WZ, r);
  extrude(s, rim, pv([0, -3, 0]), L('left'));
  disc(s, rim, L('right'));
  wallDisc(s, cx, y + 0.05, cz, r * 0.78, GLASS, 0.5);
}
/* стоящий слайд: две ножки и полотно, содержимое — slideFace; возвращает плоскость грани */
function drawSlide(s, ox, oy, zb = 0, w = 64, h = 44, o = {}) {
  box(s, ox - w * 0.36, oy - 1.5, zb, 5, 3, 6, COL.slab, { edge: 0.6 });
  box(s, ox + w * 0.36 - 5, oy - 1.5, zb, 5, 3, 6, COL.slab, { edge: 0.6 });
  box(s, ox - w / 2, oy - 4, zb + 6, w, 8, h, COL.slab, { edge: 1 });
  const yF = oy + 4 + 0.05;
  slideFace(s, ox - w / 2 + 2, yF, zb + 8, w - 4, h - 4, o);
  return { yF, x0: ox - w / 2, w, zTop: zb + 6 + h };
}
/* пузырь сообщения: блок с хвостиком-треугольником на лицевой грани; side — хвост слева или справа */
function bubble(s, x, y, z, w, d, h, c, tone, side = 'l') {
  box(s, x, y, z, w, d, h, c, { edge: 1 });
  const yF = y + d + 0.05, tx = side === 'l' ? x + 4 : x + w - 4, dx = side === 'l' ? 8 : -8;
  s.add(poly3([[tx, yF, z], [tx + dx, yF, z], [tx, yF, 0]]), tone);
  return yF;
}

/* ---------- «сбор в одно»: источники данных на полу, стрелки сходятся к слайду-докладу ---------- */
/* стрелка на полу из точки a в точку b: древко и наконечник */
function floorArrow(s, a, b, w = 3.2, z = 0.2) {
  const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy), ux = dx / l, uy = dy / l, nx = -uy, ny = ux, hl = w * 2.4, hw = w * 1.5;
  const t = [b[0] - ux * hl, b[1] - uy * hl], P = (p, k) => [p[0] + nx * k, p[1] + ny * k, z];
  s.add(poly3([P(a, w / 2), P(t, w / 2), P(t, -w / 2), P(a, -w / 2)]), L('right'));
  s.add(poly3([P(t, hw), [b[0], b[1], z], P(t, -hw)]), L('right'));
}
/* лист-источник нескольких видов: doc — текст, news — заголовок с картинкой, table — таблица, chart — столбцы, web — глобус */
function sourceSheet(s, cx, cy, kind, layers = 2, w = 24, d = 18, zb = 0) {
  const x = cx - w / 2, y = cy - d / 2, th = 3;
  for (let i = 0; i < layers; i++) box(s, x + (i % 2 ? 0.8 : -0.8), y + (i % 2 ? 0.7 : -0.7), zb + i * th, w, d, th, PAPER, { edge: 0.6 });
  const z = zb + layers * th, rect = (rx, ry, rw, rd, col, op) => s.add(poly3([[rx, ry, z], [rx + rw, ry, z], [rx + rw, ry + rd, z], [rx, ry + rd, z]]), col, op);
  if (kind === 'doc') topLines(s, x, y, z, { n: 4, gap: 3.4, t: 1.4, len: [w - 9, w - 7, w - 12, w - 8], a: 3.5, b: 2.4 });
  else if (kind === 'news') {
    rect(x + 3, y + 2.6, w - 6, 3, L('right'));
    rect(x + 3, y + 7.4, 8, 7, L('top'));
    topLines(s, x + 8, y + 6.6, z, { n: 3, gap: 3, t: 1.3, len: [w - 17, w - 15, w - 19], a: 4, b: 1 });
  } else if (kind === 'table') {
    const cw = (w - 6 - 2.4) / 3, rh = (d - 6 - 2.4) / 3;
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) rect(x + 3 + c * (cw + 1.2), y + 3 + r * (rh + 1.2), cw, rh, r === 0 ? L('right') : L('top'));
  } else if (kind === 'chart') {
    [3, 6.5, 4.5, 9].forEach((h, i) => box(s, x + 3 + i * 5, cy - 2.2, z, 3.6, 4.4, h, i === 3 ? COL.hero : COL.cube, { edge: 0.4 }));
  } else if (kind === 'web') {
    disc(s, H([cx, cy, z], 7.4), L('top'));
    ring(s, [cx, cy, z], 7.4, 6.2, L('right'));
    for (const [dx, dy] of [[1, 0], [0, 1]]) s.add(poly3([[cx - 7 * dx - 0.5 * dy, cy - 7 * dy - 0.5 * dx, z], [cx + 7 * dx - 0.5 * dy, cy + 7 * dy - 0.5 * dx, z], [cx + 7 * dx + 0.5 * dy, cy + 7 * dy + 0.5 * dx, z], [cx - 7 * dx + 0.5 * dy, cy - 7 * dy + 0.5 * dx, z]]), L('right'));
  }
}
/* слайд-доклад у задней границы, источники вокруг, стрелки к точке T перед ним; hub — узел-«воронка» перед слайдом */
function drawCollect(s, o) {
  const T = o.target ?? [0, -13], w = o.w ?? 80, sl = drawSlide(s, 0, -22, 0, w, o.h ?? 52);
  if (o.clock) clockFace(s, w / 2 - 9, sl.yF, sl.zTop - 6.5, 5.8);
  if (o.badge) checkBadge(s, w / 2 - (o.clock ? 21 : 9), sl.yF, sl.zTop - 6.5, 5.4);
  const H0 = o.hub ? [0, 4] : null, aim = H0 ?? T;
  const srcs = [...o.sources].sort((p, q) => (p.c[0] + p.c[1]) - (q.c[0] + q.c[1]));
  for (const src of srcs) {
    const [cx, cy] = src.c, dx = aim[0] - cx, dy = aim[1] - cy, l = Math.hypot(dx, dy), u = [dx / l, dy / l];
    floorArrow(s, [cx + u[0] * 12.5, cy + u[1] * 10.5], o.hub ? [aim[0] - u[0] * 10, aim[1] - u[1] * 10] : [aim[0] + (cx - aim[0]) * 0.18, aim[1]], 3.2);
  }
  if (H0) {
    floorArrow(s, [0, -5.5], [0, -15.5], 4.4);
    cyl(s, H0[0], H0[1], 0, 9, 3.6, COL.coinHero);
    ring(s, [H0[0], H0[1], 3.6], 6.4, 5.2, L('topLightest'));
  }
  for (const src of srcs) sourceSheet(s, src.c[0], src.c[1], src.kind, src.layers ?? 2);
}

import { panel, wBars, wDonut, wDoc, wTable, wNews, wGlobe, wSearch, wPerson, wCore, wCheckRow, link, chatBadge, searchBadge, wallGear, wallPie, wLine, topBar, dbStack, lensBars, CARD } from './parts.mjs';
/* значок вида источника на вертикальной грани (мини-экран): news, table, chart, web, doc */
function faceIcon(s, kind, x0, yF, z0, w, h) {
  const ink = L('right'), mid = L('top'), light = L('topLight');
  if (kind === 'news') {
    wallRect(s, x0 + 2, yF, z0 + h - 5.5, w - 4, 3, ink);
    wallRect(s, x0 + 2, yF, z0 + h - 17, 9, 8.5, mid);
    [w - 18, w - 16, w - 20].forEach((l, i) => wallRect(s, x0 + 13, yF, z0 + h - 11 - i * 3.4, l, 1.6, ink, 0.5));
  } else if (kind === 'table') {
    const cw = (w - 4 - 2.4) / 3, rh = (h - 4 - 3.6) / 4;
    for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) wallRect(s, x0 + 2 + c * (cw + 1.2), yF, z0 + 2 + (3 - r) * (rh + 1.2), cw, rh, r === 0 ? ink : light);
  } else if (kind === 'chart') {
    const bw = (w - 4 - 3 * 1.6) / 4;
    [0.3, 0.55, 0.42, 0.85].forEach((k, i) => wallRect(s, x0 + 2 + i * (bw + 1.6), yF, z0 + 2, bw, (h - 6) * k, i === 3 ? '#FFFFFF' : light));
  } else if (kind === 'web') {
    const r = Math.min(w, h) * 0.36, cx = x0 + w / 2, cz = z0 + h / 2;
    wallDisc(s, cx, yF, cz, r, ink);
    wallDisc(s, cx, yF + 0.05, cz, r * 0.82, light);
    wallLine(s, yF + 0.1, [[cx, cz - r * 0.82], [cx, cz + r * 0.82]], 1.1, ink);
    wallLine(s, yF + 0.1, [[cx - r * 0.82, cz], [cx + r * 0.82, cz]], 1.1, ink);
  } else {
    [w - 6, w - 9, w - 5, w - 11].forEach((l, i) => wallRect(s, x0 + 3, yF, z0 + h - 6 - i * 4.4, l, 2, ink, 0.5));
  }
}
function miniPanel(s, x, y, zb, w, h, kind) {
  box(s, x, y, zb, w, 4, h, COL.slab, { edge: 0.8 });
  faceIcon(s, kind, x + 1, y + 4.05, zb + 1, w - 2, h - 2);
}

export const MOTIFS = {
  cube: {
    title: 'Куб', depicts: 'Малый акцентный объект: блок, модуль, счётчик', from: 'вариант 6 «Радара» (малая фигура)',
    opts: {}, fp: () => ({ w: 14, d: 14, h: 14 }),
    draw(s) { box(s, -7, -7, 0, 14, 14, 14, COL.cube, { edge: 1.2, glass: [1.8, 2.2] }); },
  },
  tower: {
    title: 'Башня', depicts: 'Высокое здание с рядами окон: организация, холдинг, фонд', from: 'вариант 6 «Радара» (главная фигура)',
    opts: {}, fp: () => ({ w: 18, d: 18, h: 40 }),
    draw(s) { box(s, -9, -9, 0, 18, 18, 40, COL.hero, { edge: 1.2, stripes: { n: 6, t: 1.4, gap: 5.6, a: 3, z0: 4 } }); },
  },
  coinStack: {
    title: 'Стопка монет', depicts: 'Деньги, активы, баланс', from: 'вариант 7 «Радара»; эталоны reserve, dcm-potentials',
    opts: { n: 'число монет, по умолчанию 8' }, fp: (o = {}) => ({ w: 22, d: 22, h: (o.n ?? 8) * 3.4 }),
    draw(s, o = {}) { coinStack(s, 0, 0, 0, 10, o.n ?? 8, COL.coinHero); },
  },
  docStack: {
    title: 'Стопка документов', depicts: 'Реестр, дела, договоры, отчётность', from: 'вариант 7 «Фондов»; эталоны deals, possible-leads',
    opts: { n: 'число листов, по умолчанию 8' }, fp: (o = {}) => ({ w: 32, d: 24, h: (o.n ?? 8) * 2.4 }),
    draw(s, o = {}) { docStack(s, -15, -11, 0, 30, 22, o.n ?? 8); },
  },
  docTray: {
    title: 'Лоток с документами', depicts: 'Входящие, сделки в работе, очередь', from: 'эталоны deals, possible-deals, important-deals',
    opts: { n: 'число листов, по умолчанию 9' }, fp: (o = {}) => ({ w: 46, d: 36, h: 2 + (o.n ?? 9) * 2.2 }),
    draw(s, o = {}) {
      const w = 46, d = 36, wall = 2, n = o.n ?? 9;
      box(s, -w / 2, -d / 2, 0, w, d, 2, COL.floorLight, { edge: 0.6 });                     // дно
      box(s, -w / 2, -d / 2, 2, w, wall, 7, COL.floorLight);                                  // задняя стенка
      box(s, -w / 2, -d / 2 + wall, 2, wall, d - wall, 7, COL.floorLight);                    // дальняя по x стенка
      docStack(s, -w / 2 + wall + 1.5, -d / 2 + wall + 1.5, 2, w - 2 * wall - 3, d - 2 * wall - 3, n, 2.2);   // стопка торчит над стенками
      box(s, -w / 2 + wall, d / 2 - wall, 2, w - wall, wall, 7, COL.floorLight);              // передняя стенка — поверх стопки
      box(s, w / 2 - wall, -d / 2 + wall, 2, wall, d - 2 * wall, 7, COL.floorLight);          // ближняя по x стенка — поверх
    },
  },
  clipboard: {
    title: 'Планшет с листом', depicts: 'Задачи, чек-лист, отчёт на подпись', from: 'эталоны tasks, potentials-rd, important-leads',
    opts: {}, fp: () => ({ w: 46, d: 34, h: 8 }),
    draw(s) {
      box(s, -23, -17, 0, 46, 34, 3, COL.slab, { edge: 0.8 });
      box(s, -20, -14.5, 3, 40, 29, 1.2, PAPER, { edge: 0.4 });
      topLines(s, -20, -14.5, 4.2, { n: 6, gap: 3.8, t: 1.4, len: [30, 26, 32, 22, 28, 18], a: 4, b: 9 });
      box(s, -7, -19.5, 3, 14, 5, 4.5, COL.hero, { edge: 0.8 });                              // зажим на задней кромке
    },
  },
  gear: {
    title: 'Шестерня', depicts: 'Настройки, управление, механика процесса', from: 'эталон settings',
    opts: {}, fp: () => ({ w: 60, d: 60, h: 9 }),
    draw(s) {
      const T = 8, Ro = 30, Ri = 23, p = (2 * Math.PI) / T, pts = [];
      for (let i = 0; i < T; i++) {                                                          // зубцы по возрастанию угла
        const a = i * p;
        for (const [r, da] of [[Ri, -0.22], [Ro, -0.14], [Ro, 0.14], [Ri, 0.22], [Ri, 0.5]]) pts.push([r * Math.cos(a + da * p), r * Math.sin(a + da * p)]);
      }
      prism(s, pts, 0, 9, { top: L('top'), left: L('sideMid'), right: L('left') });
      ring(s, [0, 0, 9], 19, 17.6, L('topLight'));
      disc(s, H([0, 0, 9], 11.5), L('sideMid'));
      disc(s, H([0, 0, 9], 10), L('right'));                                                 // отверстие
    },
  },
  monitor: {
    title: 'Монитор-дашборд', depicts: 'Дашборд, аналитика, показатели', from: 'вариант 3 «Фондов» (утверждён); эталон rwa',
    opts: {}, fp: () => ({ w: 66, d: 14, h: 60 }),
    draw(s) { drawMonitor(s, -33, -2, 0); },
  },
  building: {
    title: 'Здание с колоннами', depicts: 'Фонд, банк, организация, учреждение', from: 'вариант 6 «Фондов»; эталон clients',
    opts: {}, fp: () => ({ w: 62, d: 46, h: 56 }),
    draw(s) {
      box(s, -31, -23, 0, 62, 46, 4, COL.slab, { edge: 1 });
      box(s, -27, -19, 4, 54, 38, 4, COL.floorLight, { edge: 1 });
      const zb = 8;
      box(s, -24, -15, zb, 48, 24, 30, COL.slab, { edge: 1, glass: [4, 3] });                 // тело здания
      for (let i = 0; i < 5; i++) {                                                           // колонны, дальние первыми
        const cx = -21 + i * 10.5, cy = 13;
        cyl(s, cx, cy, zb, 3.8, 1.6, COL.coinHero);
        cyl(s, cx, cy, zb + 1.6, 2.9, 26, COL.coin);
        cyl(s, cx, cy, zb + 27.6, 3.8, 2.4, COL.coinHero);
      }
      box(s, -27.5, -15, zb + 30, 55, 34.5, 3.6, COL.slab, { edge: 0.8 });                    // антаблемент
      const rx = -27.5, ry = -15, rw = 55, rd = 34.5, zt = zb + 33.6, hh = 13;
      s.add(poly3([[rx, ry, zt], [rx, ry + rd, zt], [rx + rw / 2, ry + rd, zt + hh], [rx + rw / 2, ry, zt + hh]]), L('top'));          // левый скат
      s.add(poly3([[rx + rw, ry, zt], [rx + rw, ry + rd, zt], [rx + rw / 2, ry + rd, zt + hh], [rx + rw / 2, ry, zt + hh]]), L('left')); // правый скат
      s.add(poly3([[rx, ry + rd, zt], [rx + rw, ry + rd, zt], [rx + rw / 2, ry + rd, zt + hh]]), L('sideMid'));                        // фронтон
      s.add(poly3([[rx + 8, ry + rd + 0.05, zt + 1.4], [rx + rw - 8, ry + rd + 0.05, zt + 1.4], [rx + rw / 2, ry + rd + 0.05, zt + hh - 3.4]]), L('topLight'));
      wallDisc(s, rx + rw / 2, ry + rd + 0.1, zt + 4.8, 2.3, L('right'));                      // эмблема во фронтоне
    },
  },
  vault: {
    title: 'Сейф', depicts: 'Резерв, хранилище активов, надёжность', from: 'вариант 4 «Фондов»; эталон reserve',
    opts: {}, fp: () => ({ w: 44, d: 40, h: 40 }),
    draw(s) {
      const bx = -22, by = -20, bw = 44, bd = 40, bh = 40, yF = by + bd + 0.05;
      box(s, bx, by, 0, bw, bd, bh, COL.slab, { edge: 1.4 });
      const cx = bx + bw / 2, cz = bh / 2;
      const rim = circ([cx, yF + 2.5, cz], UX, WZ, 15.5);
      extrude(s, rim, pv([0, -2.5, 0]), L('left'));
      disc(s, rim, L('top'));                                                                 // обод двери
      wallDisc(s, cx, yF + 2.5, cz, 12.6, L('sideMid'));
      wallDisc(s, cx, yF + 2.5, cz, 11, L('left'));
      for (let k = 0; k < 8; k++) {                                                           // болты по кругу
        const a = (k * 45 + 22.5) * D2R;
        wallDisc(s, cx + 13.8 * Math.cos(a), yF + 2.5, cz + 13.8 * Math.sin(a), 0.9, L('right'));
      }
      for (let k = 0; k < 3; k++) {                                                           // штурвал: три спицы
        const a = (90 + k * 120) * D2R, l = 7.8, w = 1.3;
        const dx = Math.cos(a), dz = Math.sin(a), nx = -dz * w, nz = dx * w;
        s.add(poly3([[cx + nx, yF + 2.5, cz + nz], [cx + dx * l + nx, yF + 2.5, cz + dz * l + nz],
          [cx + dx * l - nx, yF + 2.5, cz + dz * l - nz], [cx - nx, yF + 2.5, cz - nz]]), L('topLight'));
        wallDisc(s, cx + dx * l, yF + 2.5, cz + dz * l, 1.9, L('topLight'));
      }
      wallDisc(s, cx, yF + 2.5, cz, 3.2, L('topLight'));
      s.add(poly3([[bx + bw, by + 5, 6], [bx + bw, by + bd - 5, 6], [bx + bw, by + bd - 5, bh - 6], [bx + bw, by + 5, bh - 6]]), GLASS, 0.3);
    },
  },
  donut: {
    title: 'Объёмный «пончик»', depicts: 'Структура активов: высота сектора — доля', from: 'вариант 2 «Фондов»; эталон qliksense-reports',
    opts: {}, fp: () => ({ w: 84, d: 84, h: 24 }),
    draw(s) {
      const SET = [
        { a0: -30, a1: 114, h: 17, ex: 4, c: { top: L('topLight'), left: L('right'), right: L('shadowDeep') } },   // 40 %, главный
        { a0: 114, a1: 204, h: 11, ex: 0, c: { top: L('sideMid'), left: L('left'), right: L('right') } },          // 25 %
        { a0: 204, a1: 276, h: 8, ex: 0, c: { top: L('top'), left: L('sideMid'), right: L('left') } },             // 20 %
        { a0: 276, a1: 330, h: 13, ex: 0, c: { top: L('topMuted'), left: L('left'), right: L('right') } },         // 15 %
      ].map((p) => ({ ...p, mid: ((p.a0 + p.a1) / 2) * D2R }));
      SET.sort((p, q) => (Math.cos(p.mid) + Math.sin(p.mid)) - (Math.cos(q.mid) + Math.sin(q.mid)))
        .forEach((p) => sectorPrism(s, 0, 0, 0, 17, 38, p.a0 * D2R, p.a1 * D2R, p.h, p.c, p.ex));
      coinStack(s, 0, 0, 0, 10.5, 3, COL.coinHero);                                           // монеты в отверстии
    },
  },
  bars: {
    title: 'Столбцы роста', depicts: 'Рост, динамика, показатели во времени', from: 'вариант 1 «Фондов»; эталон rwa (столбцы на мониторе)',
    opts: {}, fp: () => ({ w: 70, d: 70, h: 62 }),
    draw(s) {
      const hs = [13, 22, 33, 46], ts = [-27, -9, 9, 27], w = 12;                              // центры столбцов (t, −t): ряд вдоль экрана
      hs.forEach((h, i) => box(s, ts[i] - w / 2, -ts[i] - w / 2, 0, w, w, h, i === 3 ? COL.hero : COL.cube, { edge: 1.2, glass: [1.6, 2] }));
      const pts = hs.map((h, i) => [ts[i], h + 8]), at = ([t, z]) => [t, -t, z];
      for (let i = 0; i < pts.length - 1; i++) {                                              // линия роста над столбцами
        const a = at(pts[i]), b = at(pts[i + 1]);
        s.add(poly3([[a[0], a[1], a[2] + 0.9], [b[0], b[1], b[2] + 0.9], [b[0], b[1], b[2] - 0.9], [a[0], a[1], a[2] - 0.9]]), L('right'));
      }
      const e = pts[3];
      s.add(poly3([at([e[0] - 1, e[1] + 4]), at([e[0] + 9, e[1] + 6]), at([e[0] + 5, e[1] - 4])]), L('right'));   // наконечник
    },
  },
  chat: {
    title: 'Чат', depicts: 'Диалог с ассистентом: два сообщения-блока со строками и хвостиками', from: 'новый (тема «Питчер»)',
    opts: { n: 'число сообщений 2 или 3, по умолчанию 2' }, fp: () => ({ w: 58, d: 22, h: 40 }),
    draw(s, o = {}) {
      const bz = 8, rows = (x, yF, z, lens, col, op) => lens.forEach((l, i) => wallRect(s, x, yF, z - i * 4.6, l, 2.2, col, op));
      s.group('chat-assistant', () => {                                                      // сообщение ассистента: светлое, слева-сзади
        box(s, -28, -14, bz, 36, 9, 32, COL.slab, { edge: 1 });
        s.add(poly3([[-24, -5.95, bz], [-16, -5.95, bz], [-24, -5.95, 0]]), L('sideMid'));    // хвостик: треугольник на лицевой грани
        rows(-24, -5.95, bz + 32 - 6.5, [26, 20, 26, 12], LINE, 0.4);
      });
      if (o.n === 3) s.group('chat-assistant-2', () => {                                       // второе сообщение ассистента: сзади справа, торчит над сообщением клиента
        box(s, 8, -14, bz, 26, 9, 30, COL.slab, { edge: 1 });
        rows(12, -5.95, bz + 30 - 6.5, [18, 12], LINE, 0.4);
      });
      s.group('chat-user', () => {                                                           // сообщение клиента: акцентное, справа-спереди
        box(s, -4, 2, bz, 36, 9, 24, COL.hero, { edge: 1 });
        s.add(poly3([[28, 11.05, bz], [20, 11.05, bz], [28, 11.05, 0]]), L('right'));
        rows(0, 11.05, bz + 24 - 6.5, [26, 18, 14], L('topLight'));
        for (let i = 0; i < 3; i++) wallDisc(s, 3 + i * 4.4, 11.05, bz + 3.6, 1.1, L('topLight'));   // «печатает…»
      });
    },
  },
  chip: {
    title: 'Чип ИИ', depicts: 'ИИ-ассистент: микросхема с контактами по краям', from: 'новый (тема «Питчер»)',
    opts: {}, fp: () => ({ w: 34, d: 34, h: 8 }),
    draw(s) {
      box(s, -14, -14, 0, 28, 28, 5, COL.hero, { edge: 1 });
      for (let i = 0; i < 5; i++) {                                                          // контакты на видимых боковых гранях
        box(s, -11.5 + i * 5.5, 14, 1.2, 3, 3, 2.4, COL.slab, { edge: 0.5 });
        box(s, 14, -11.5 + i * 5.5, 1.2, 3, 3, 2.4, COL.slab, { edge: 0.5 });
      }
      box(s, -8.5, -8.5, 5, 17, 17, 3, COL.slab, { edge: 0.8, glass: [1.5, 0.8] });           // кристалл
      box(s, -3, -3, 8, 6, 6, 1.2, COL.hero, { edge: 0.5 });
    },
  },
  board: {
    title: 'Доска-презентация', depicts: 'Слайд клиентской встречи: заголовок, пункты, диаграмма', from: 'новый (тема «Питчер»)',
    opts: {}, fp: () => ({ w: 60, d: 12, h: 54 }),
    draw(s) {
      const bx = -30, by = -3, bw = 60, bd = 4, bz = 15, bh = 38, yF = by + bd + 0.05;
      box(s, -24, -1.5, 0, 4, 3, bz, COL.slab, { edge: 0.6 });                                 // ножки
      box(s, 20, -1.5, 0, 4, 3, bz, COL.slab, { edge: 0.6 });
      box(s, bx, by, bz, bw, bd, bh, COL.slab, { edge: 1 });                                   // полотно
      box(s, bx + 2, by - 4, bz - 2, bw - 4, 8, 2, COL.floorLight, { edge: 0.6 });             // полка
      const x0 = bx + 4, z0 = bz + 4;
      wallRect(s, x0, yF, z0 + bh - 14, 30, 4, L('right'));                                    // заголовок
      [24, 28, 20].forEach((l, i) => wallRect(s, x0, yF, z0 + bh - 22 - i * 5, l, 2, L('left'), 0.5));   // пункты
      const hs = [8, 14, 11, 20], bwid = 5;
      hs.forEach((h, i) => wallRect(s, x0 + 34 + i * (bwid + 2), yF, z0 + 2, bwid, h, i === 3 ? L('topLight') : L('top')));   // столбцы
      wallLine(s, yF, [[x0 + 34, z0 + 22], [x0 + 41, z0 + 26], [x0 + 48, z0 + 24], [x0 + 55, z0 + 30]], 0.9, L('right'));
    },
  },
  briefcase: {
    title: 'Портфель', depicts: 'Встреча с клиентом, материалы к визиту', from: 'новый (тема «Питчер»)',
    opts: {}, fp: () => ({ w: 48, d: 28, h: 48 }),
    draw(s) {
      const x = -24, y = -14, w = 48, d = 28, h = 22, yF = y + d + 0.05, xR = x + w + 0.05;
      box(s, -16, -8, h - 2, 32, 1.6, 28, PAPER, { edge: 0.5 });                                // отчёт торчит из портфеля\n      wallRect(s, -12, -6.35, h + 17, 16, 2.6, L('right'));\n      wallRect(s, -12, -6.35, h + 11, 24, 1.8, LINE, 0.4);\n      wallRect(s, -12, -6.35, h + 6.5, 18, 1.8, LINE, 0.4);\n      box(s, -8, -1.5, h, 3, 3, 4, COL.slab, { edge: 0.6 });                                   // ручка
      box(s, 5, -1.5, h, 3, 3, 4, COL.slab, { edge: 0.6 });
      box(s, -8, -1.5, h + 4, 16, 3, 3, COL.slab, { edge: 0.6 });
      box(s, x, y, 0, w, d, h, COL.hero, { edge: 1.2 });
      wallRect(s, x, yF, 12, w, 1.4, L('shadowDeep'));                                         // шов крышки
      s.add(poly3([[xR, y, 12], [xR, y + d, 12], [xR, y + d, 13.4], [xR, y, 13.4]]), L('shadowDeep'));
      wallRect(s, -4.5, yF, 9.5, 9, 6, L('topLight'));                                         // замок
      wallRect(s, -1.2, yF, 11, 2.4, 2.4, L('right'));
      wallRect(s, x + 5, yF, 3, 10, 1.6, L('topLight'), 0.5);
    },
  },
  dossier: {
    title: 'Досье компании', depicts: 'Папка-досье: из неё торчат листы с таблицей и графиком, на папке — значок организации, на листе — галочка соответствия',
    from: 'новый (тема «Питчер»)', opts: {}, fp: () => ({ w: 68, d: 44, h: 54 }),
    draw(s) {
      [[-19, 52], [-15.5, 46], [-12, 40]].forEach(([y, h], i) => {                          // листы ступенями: дальние выше, у переднего — содержимое
        box(s, -28 + i * 1.5, y - 1.6, 8, 56, 1.6, h, PAPER, { edge: 0.5 });
      });
      const yS = -12 + 0.05;
      slideFace(s, -26, yS, 13, 54, 35, { rows: 3, head: L('right'), cell: L('top'), hi: L('topLight'), line: L('right') });
      checkBadge(s, 20, yS, 43.5, 5.6);
      box(s, -34, -10, 0, 68, 26, 13, COL.hero, { edge: 1.2 });                              // папка
      const yF = 16.05;
      wallRect(s, -28, yF, 7.5, 26, 2.8, L('topLight'));
      wallRect(s, -28, yF, 3.4, 16, 1.8, L('topLight'), 0.5);
      [[17, 6], [22.5, 9.5], [28, 6]].forEach(([x, h]) => wallRect(s, x, yF, 2.8, 4.4, h, L('topLight')));   // значок организации
    },
  },
  collect: {
    title: 'Сбор в одно', depicts: 'Листы-источники стрелками сходятся к слайду с графиками и таблицей; на слайде часы — результат за минуты',
    from: 'новый (тема «Питчер»)', opts: {}, fp: () => ({ w: 92, d: 52, h: 62 }),
    draw(s) {
      const sl = drawSlide(s, 0, -20, 0, 88, 56);
      clockFace(s, 37, sl.yF, sl.zTop - 6.5, 6);
      for (let i = 0; i < 3; i++) {
        const cx = -32 + i * 32;
        s.add(poly3([[cx - 7, 0, 0.2], [cx + 7, 0, 0.2], [cx, -11, 0.2]]), L('right'));       // стрелка к слайду
        box(s, cx - 14.8, 5.8, 0, 28, 21, 3.4, PAPER, { edge: 0.6 });
        box(s, cx - 14, 6.6, 3.4, 28, 21, 3.4, PAPER, { edge: 0.6 });                              // лист-источник
        topLines(s, cx - 14, 6.6, 6.8, { n: 4, gap: 4.2, t: 1.6, len: [18, 20, 14, 16], a: 4, b: 3.4 });
      }
    },
  },
  slideChat: {
    title: 'Слайд и чат', depicts: 'Презентация с таблицей и графиком; к её нижнему углу пристыкован пузырь ответа агента; на слайде галочка',
    from: 'новый (тема «Питчер»)', opts: {}, fp: () => ({ w: 76, d: 36, h: 46 }),
    draw(s) {
      const sl = drawSlide(s, 0, -8, 0, 76, 40);
      checkBadge(s, 30, sl.yF, sl.zTop - 6, 5.4);
      const yF = bubble(s, -4, 8, 4, 50, 11, 22, COL.hero, L('right'), 'l');
      [32, 22].forEach((l, i) => wallRect(s, 1, yF, 4 + 22 - 6.5 - i * 4.6, l, 2.4, L('topLight')));
      for (let i = 0; i < 3; i++) wallDisc(s, 3 + i * 4.6, yF, 4 + 3.6, 1.2, L('topLight'));    // «агент печатает…»
    },
  },
  chatSearch: {
    title: 'Чат и лупа', depicts: 'Крупный ответ агента: в пузыре таблица и график; поверх пузыря лупа — ответ найден в собранных данных',
    from: 'новый (тема «Питчер»)', opts: {}, fp: () => ({ w: 72, d: 26, h: 42 }),
    draw(s) {
      const yF = bubble(s, -34, 0, 6, 68, 10, 34, COL.hero, L('right'), 'l');
      slideFace(s, -32, yF, 8.5, 64, 30, { rows: 3, head: L('topLightest'), cell: L('topLight'), hi: '#FFFFFF', line: L('topLightest') });
      magnifier(s, 20, yF + 4, 15, 11.5);
    },
  },
  chatCheck: {
    title: 'Чат с проверкой', depicts: 'Вопрос (светлый пузырь) и крупный ответ агента с графиком; на ответе значок «требованиям соответствует»',
    from: 'новый (тема «Питчер»)', opts: {}, fp: () => ({ w: 104, d: 40, h: 50 }),
    draw(s) {
      const yB = bubble(s, -46, -16, 6, 44, 12, 28, COL.slab, L('sideMid'), 'l');             // вопрос клиента: светлый, сзади слева
      [26, 20, 24].forEach((l, i) => wallRect(s, -41, yB, 6 + 28 - 7 - i * 4.8, l, 2.4, LINE, 0.4));
      const yF = bubble(s, -12, 2, 6, 58, 13, 40, COL.hero, L('right'), 'r');               // ответ агента: акцентный, спереди справа
      slideFace(s, -10, yF, 8.5, 54, 36, { table: false, head: L('topLightest'), cell: L('topLight'), hi: '#FFFFFF', line: L('topLightest') });
      checkBadge(s, 40, yF, 6 + 40, 6.6, '#FFFFFF', L('right'));
    },
  },
  collectFour: {
    title: 'Сбор: четыре источника', depicts: 'Новости, таблица, документы и график дугой стекаются стрелками в слайд-доклад; на слайде галочка соответствия',
    from: 'вариация «Сбора в одно»', opts: {}, fp: () => ({ w: 100, d: 60, h: 62 }),
    draw(s) {
      const T = [0, -12], P = (a, r = 46) => [T[0] + r * Math.cos(a * D2R), T[1] + r * Math.sin(a * D2R)];
      drawCollect(s, { badge: true, w: 86, sources: [{ c: P(24), kind: 'news' }, { c: P(66), kind: 'table' }, { c: P(114), kind: 'doc' }, { c: P(156), kind: 'chart' }] });
    },
  },
  collectSides: {
    title: 'Сбор: два ряда', depicts: 'Два дальних и два ближних источника сходятся к слайду-докладу, ближние стрелки идут между дальними; на слайде часы',
    from: 'вариация «Сбора в одно»', opts: {}, fp: () => ({ w: 108, d: 56, h: 62 }),
    draw(s) {
      drawCollect(s, { clock: true, w: 88, sources: [
        { c: [-36, 4], kind: 'news' }, { c: [36, 4], kind: 'web' }, { c: [-15, 29], kind: 'table' }, { c: [15, 29], kind: 'doc' }] });
    },
  },
  collectStacks: {
    title: 'Сбор: растущие стопки', depicts: 'Три источника, толще и толще, стрелками сходятся к слайду-докладу; на слайде часы и галочка',
    from: 'вариация «Сбора в одно»', opts: {}, fp: () => ({ w: 92, d: 56, h: 62 }),
    draw(s) {
      drawCollect(s, { clock: true, badge: true, sources: [
        { c: [-34, 10], kind: 'news', layers: 2 }, { c: [0, 22], kind: 'table', layers: 3 }, { c: [34, 10], kind: 'doc', layers: 4 }] });
    },
  },
  collectHub: {
    title: 'Сбор через узел', depicts: 'Три источника втекают в узел-воронку, из узла одна стрелка к слайду-докладу; на слайде галочка',
    from: 'вариация «Сбора в одно»', opts: {}, fp: () => ({ w: 92, d: 66, h: 62 }),
    draw(s) {
      drawCollect(s, { badge: true, hub: true, w: 92, h: 60, sources: [
        { c: [-35, 14], kind: 'news', layers: 3 }, { c: [0, 30], kind: 'web', layers: 3 }, { c: [35, 14], kind: 'chart', layers: 3 }] });
    },
  },
  collectFive: {
    title: 'Сбор: пять источников', depicts: 'Пять разных источников веером сходятся к слайду-докладу; на слайде часы и галочка',
    from: 'вариация «Сбора в одно»', opts: {}, fp: () => ({ w: 100, d: 62, h: 62 }),
    draw(s) {
      const T = [0, -12], P = (a, r = 40) => [T[0] + r * Math.cos(a * D2R), T[1] + r * Math.sin(a * D2R)];
      drawCollect(s, { clock: true, badge: true, sources: [
        { c: P(16, 46), kind: 'web' }, { c: P(52), kind: 'news' }, { c: P(90), kind: 'table' }, { c: P(128), kind: 'doc' }, { c: P(164, 46), kind: 'chart' }] });
    },
  },
  collectWall: {
    title: 'Экран и стена маленьких', depicts: 'Большой слайд-доклад спереди, а позади на ступенях несколько маленьких экранов-источников: новости, таблица, график, интернет',
    from: 'вариация «Сбора в одно» по просьбе человека', opts: {}, fp: () => ({ w: 108, d: 52, h: 66 }),
    draw(s) {
      box(s, -56, -50, 0, 112, 26, 14, COL.floorLight, { edge: 1 });                          // ступенчатая стойка
      ['news', 'table', 'chart', 'web'].forEach((k, i) => miniPanel(s, -52 + i * 28, -42, 14, 24, 28 + (i % 2) * 4, k));
      const sl = drawSlide(s, 0, 0, 0, 76, 42);
      checkBadge(s, 28, sl.yF, sl.zTop - 6.5, 5.4);
      clockFace(s, 16, sl.yF, sl.zTop - 6.5, 5.4);
    },
  },
  collectPanels: {
    title: 'Экран и перед ним маленькие', depicts: 'Большой слайд-доклад сзади, перед ним зигзагом стоят маленькие экраны-источники (новости, таблица, график, интернет), от каждого стрелка к докладу',
    from: 'вариация «Сбора в одно» по просьбе человека', opts: {}, fp: () => ({ w: 100, d: 60, h: 60 }),
    draw(s) {
      const sl = drawSlide(s, 0, -28, 0, 92, 58);
      checkBadge(s, 36, sl.yF, sl.zTop - 6.5, 5.6);
      const P = [[-45, 10, 'news'], [-15, 22, 'table'], [15, 10, 'chart'], [45, 22, 'web']];
      P.forEach(([x, y]) => floorArrow(s, [x, y - 4], [x * 0.55, -16], 3.6));
      P.sort((p, q) => (p[0] + p[1]) - (q[0] + q[1])).forEach(([x, y, k]) => {
        box(s, x - 10, y, 0, 4, 3, 4, COL.slab, { edge: 0.5 });                               // ножки
        box(s, x + 6, y, 0, 4, 3, 4, COL.slab, { edge: 0.5 });
        miniPanel(s, x - 14, y - 1, 4, 28, 32, k);
      });
    },
  },
  collectBelt: {
    title: 'Конвейер', depicts: 'Лента несёт источники — новости, таблицу, документ — прямо в слайд-доклад; на ленте стрелки движения',
    from: 'вариация «Сбора в одно»', opts: {}, fp: () => ({ w: 76, d: 100, h: 54 }),
    draw(s) {
      const sl = drawSlide(s, 0, -26, 0, 100, 64);
      clockFace(s, 39, sl.yF, sl.zTop - 6.5, 5.8);
      box(s, -17, -20, 0, 34, 80, 6, COL.slab, { edge: 1 });                                   // лента
      for (let i = 0; i < 8; i++) s.add(poly3([[-17, -14 + i * 10, 6], [17, -14 + i * 10, 6], [17, -12.6 + i * 10, 6], [-17, -12.6 + i * 10, 6]]), L('left'), 0.4);
      [-5, 21.5, 42.5, 62].forEach((y) => s.add(poly3([[-3.5, y + 4, 6.1], [3.5, y + 4, 6.1], [0, y - 3, 6.1]]), L('right')));   // стрелки движения
      [['doc', 52], ['table', 32], ['news', 12]].forEach(([k, y]) => sourceSheet(s, 0, y, k, 4, 28, 20, 6));
    },
  },
  collectFlight: {
    title: 'Листы летят в экран', depicts: 'Стопка источников внизу, из неё листы разных видов по лестнице поднимаются и влетают в слайд-доклад',
    from: 'вариация «Сбора в одно»', opts: {}, fp: () => ({ w: 88, d: 70, h: 60 }),
    draw(s) {
      const sl = drawSlide(s, 8, -20, 0, 70, 50);
      checkBadge(s, 8 + 25, sl.yF, sl.zTop - 6.5, 5.4);
      sourceSheet(s, -30, 34, 'doc', 4, 22, 16);                                               // стопка-источник на полу
      [[-28, 26, 'news', 16], [-17, 15, 'table', 26], [-6, 5, 'chart', 36]].forEach(([x, y, k, z]) => sourceSheet(s, x, y, k, 1, 20, 15, z));
    },
  },
  collectTray: {
    title: 'Лоток', depicts: 'Лоток, доверху набитый источниками разных видов, а из-за него поднимается один готовый слайд-доклад',
    from: 'вариация «Сбора в одно»', opts: {}, fp: () => ({ w: 76, d: 70, h: 56 }),
    draw(s) {
      const sl = drawSlide(s, 0, -26, 0, 72, 50);
      checkBadge(s, 26, sl.yF, sl.zTop - 6.5, 5.4);
      const w = 54, d = 38, wall = 2, zw = 6;
      box(s, -w / 2, -d / 2 + 8, 0, w, d, 2, COL.floorLight, { edge: 0.6 });
      box(s, -w / 2, -d / 2 + 8, 2, w, wall, zw, COL.floorLight);
      box(s, -w / 2, -d / 2 + 8 + wall, 2, wall, d - wall, zw, COL.floorLight);
      [[-12, 2, 'table'], [10, 4, 'news'], [-2, 14, 'doc']].forEach(([x, y, k]) => sourceSheet(s, x, y + 8, k, 2, 22, 16, 2));
      box(s, -w / 2 + wall, d / 2 + 8 - wall, 2, w - wall, wall, zw, COL.floorLight);
      box(s, w / 2 - wall, -d / 2 + 8 + wall, 2, wall, d - 2 * wall, zw, COL.floorLight);
    },
  },
  panelDossier: {
    title: 'Панель-досье', depicts: 'Большая панель на подставке: лист-отчёт, карточка клиента, диаграмма и столбцы; за углы торчат пузырь чата и значок поиска',
    from: 'референсы человека (стеклянная панель с виджетами); тема «Питчер»', opts: {}, fp: () => ({ w: 104, d: 40, h: 72 }),
    draw(s) {
      box(s, -48, -22, 0, 96, 40, 5, COL.floorLight);
      const P = panel(s, -40, -14, 5, 80, 60, 6), x0 = P.x0, z0 = P.z0;
      wDoc(s, x0 + 3, P.yF, z0 + 3, 28, 48);
      wPerson(s, x0 + 35, P.yF, z0 + 30, 36, 21);
      wDonut(s, x0 + 35, P.yF, z0 + 17, 36, 10.5);
      wBars(s, x0 + 35, P.yF, z0 + 3, 36, 11.5);
      chatBadge(s, -52, -9, 5 + 60 - 18, 22, 14, 'dots');
      searchBadge(s, 30, -9, 5 + 3, 18);
    },
  },
  panelNodes: {
    title: 'Панель с узлами', depicts: 'Экран: в центре лист-отчёт, слева и справа четыре источника, соединённые линиями; сверху шестерни, из-за угла пирог, у края светлый пузырь',
    from: 'референсы человека (схема вокруг центра); тема «Питчер»', opts: {}, fp: () => ({ w: 120, d: 30, h: 82 }),
    draw(s) {
      wallPie(s, 46, -15, 14, 22);                                                           // позади панели
      wallGear(s, -30, 77, 11, -15, -11);
      wallGear(s, -52, 69, 6.5, -15, -11.5);
      const P = panel(s, -48, -14, 0, 96, 66, 14), x0 = P.x0, z0 = P.z0, y = P.yF, cx = x0 + 35;
      wNews(s, x0 + 3, y, z0 + 32, 24, 25);
      wGlobe(s, x0 + 3, y, z0 + 3, 24, 25);
      wTable(s, x0 + 63, y, z0 + 32, 24, 25);
      wSearch(s, x0 + 63, y, z0 + 3, 24, 25);
      wDoc(s, cx, y, z0 + 13, 26, 34);
      link(s, y, [[x0 + 27, z0 + 44], [x0 + 31, z0 + 44], [x0 + 31, z0 + 38], [cx, z0 + 38]]);
      link(s, y, [[x0 + 27, z0 + 15], [x0 + 31, z0 + 15], [x0 + 31, z0 + 21], [cx, z0 + 21]]);
      link(s, y, [[x0 + 63, z0 + 44], [x0 + 59, z0 + 44], [x0 + 59, z0 + 38], [cx + 26, z0 + 38]]);
      link(s, y, [[x0 + 63, z0 + 15], [x0 + 59, z0 + 15], [x0 + 59, z0 + 21], [cx + 26, z0 + 21]]);
      chatBadge(s, -62, -2, 12, 24, 14, 'lines', 'slab');
    },
  },
  cardStack: {
    title: 'Стопка карточек', depicts: 'Три плиты друг над другом, слои данных: нижняя акцентная; на верхней белый лист-отчёт и кнопка; сбоку лупа и пузырь чата',
    from: 'референсы человека (стопка карточек); тема «Питчер»', opts: {}, fp: () => ({ w: 92, d: 70, h: 62 }),
    draw(s) {
      box(s, -33, -25, 0, 66, 50, 6, COL.hero, { edge: 1.2 });
      box(s, -25, -31, 16, 66, 50, 6, COL.cube, { edge: 1.2 });
      box(s, -17, -37, 32, 66, 50, 6, COL.slab, { edge: 1.2 });
      const z = 38.05, rect = (x, y, w, d, c) => s.add(poly3([[x, y, z], [x + w, y, z], [x + w, y + d, z], [x, y + d, z]]), c);
      rect(-10, -31, 30, 38, CARD);                                                          // лист-отчёт
      rect(-6, -27, 14, 3.2, L('right'));
      topLines(s, -10, -29, z, { n: 6, gap: 4.6, t: 1.6, len: [20, 22, 16, 22, 18, 12], a: 4, b: 5 });
      rect(25, -17, 18, 16, CARD);                                                           // карточка-кнопка
      s.add(poly3([[31, -9.5, z], [38, -9.5, z], [38, -12, z], [41, -9, z], [38, -6, z], [38, -8.5, z], [31, -8.5, z]]), L('right'));
      [4, 8, 6].forEach((h, i) => box(s, 28 + i * 5, -29, z, 3.4, 3.4, h, i === 2 ? COL.hero : COL.cube, { edge: 0.4 }));
      chatBadge(s, -34, 12, 14, 22, 14, 'dots');
      magnifier(s, 38, 20, 30, 11);
    },
  },
  panelCore: {
    title: 'Панель с ядром ИИ', depicts: 'Экран на подставке: в центре ядро-искра, вокруг лист, клиент, столбцы и диаграмма, связанные линиями; слева два пузыря чата',
    from: 'референсы человека (ядро в центре); тема «Питчер»', opts: {}, fp: () => ({ w: 120, d: 40, h: 74 }),
    draw(s) {
      box(s, -52, -26, 0, 104, 40, 5, COL.floorLight);
      const P = panel(s, -46, -16, 5, 92, 62, 6), x0 = P.x0, z0 = P.z0, y = P.yF, cx = x0 + 31;
      wDoc(s, x0 + 3, y, z0 + 31, 22, 22);
      wBars(s, x0 + 3, y, z0 + 3, 22, 22);
      wPerson(s, x0 + 61, y, z0 + 31, 22, 22);
      wDonut(s, x0 + 61, y, z0 + 3, 22, 22);
      wCore(s, cx, y, z0 + 16, 24, 24);
      link(s, y, [[x0 + 25, z0 + 42], [x0 + 28, z0 + 42], [x0 + 28, z0 + 36], [cx, z0 + 36]]);
      link(s, y, [[x0 + 25, z0 + 14], [x0 + 28, z0 + 14], [x0 + 28, z0 + 20], [cx, z0 + 20]]);
      link(s, y, [[x0 + 61, z0 + 42], [x0 + 58, z0 + 42], [x0 + 58, z0 + 36], [cx + 24, z0 + 36]]);
      link(s, y, [[x0 + 61, z0 + 14], [x0 + 58, z0 + 14], [x0 + 58, z0 + 20], [cx + 24, z0 + 20]]);
      chatBadge(s, -62, -11, 5 + 38, 22, 14, 'dots');
      chatBadge(s, -66, -11, 5 + 16, 26, 14, 'lines', 'slab');
    },
  },
  panelChecks: {
    title: 'Панель проверки', depicts: 'Панель: слева карточка клиента, справа строки с галочками «требованиям соответствует» и столбцы; сверху шестерня, у края значок поиска',
    from: 'референсы человека + суть «удовлетворяет ли компания требованиям»; тема «Питчер»', opts: {}, fp: () => ({ w: 110, d: 30, h: 80 }),
    draw(s) {
      wallGear(s, 38, 72, 10, -15, -11);
      const P = panel(s, -42, -8, 0, 84, 60, 6), x0 = P.x0, z0 = P.z0, y = P.yF;
      wPerson(s, x0 + 3, y, z0 + 3, 26, 48);
      wCheckRow(s, x0 + 33, y, z0 + 39.5, 42, 11.5);
      wCheckRow(s, x0 + 33, y, z0 + 26.5, 42, 11.5);
      wBars(s, x0 + 33, y, z0 + 3, 42, 20);
      searchBadge(s, 34, -3, 2, 18);
      chatBadge(s, -52, -3, 38, 20, 13, 'dots');
    },
  },
  tiltDossier: {
    title: 'Откинутая панель-досье', depicts: 'Экран откинут назад на подставке: лист-отчёт, карточка клиента, диаграмма, столбцы; пузырь чата и значок поиска у углов',
    from: 'референс человека (наклонённая стеклянная панель); тема «Питчер»', opts: {}, fp: () => ({ w: 104, d: 48, h: 72 }),
    draw(s) {
      const T = 0.3, zb = 5; let P;
      box(s, -50, -28, 0, 100, 48, 5, COL.floorLight);
      withTilt(T, zb, () => {
        P = panel(s, -40, -6, zb, 80, 60, 6);
        const x0 = P.x0, z0 = P.z0;
        wDoc(s, x0 + 3, P.yF, z0 + 3, 28, 48);
        wPerson(s, x0 + 35, P.yF, z0 + 30, 36, 21);
        wDonut(s, x0 + 35, P.yF, z0 + 17, 36, 10.5);
        wBars(s, x0 + 35, P.yF, z0 + 3, 36, 11.5);
      });
      const fy = (z) => P.yF - T * (z - zb);
      chatBadge(s, -50, fy(zb + 46) + 1, zb + 44, 22, 14, 'dots');
      searchBadge(s, 28, fy(zb + 8) + 1, zb + 3, 18);
    },
  },
  tiltBrowser: {
    title: 'Окно отчёта с лупой', depicts: 'Панель-«окно» с линейным графиком, столбцами и диаграммой на подставке; слева база данных, спереди крупная лупа со столбцами в стекле',
    from: 'референс человека (панель, база данных и лупа); тема «Питчер»', opts: {}, fp: () => ({ w: 112, d: 54, h: 70 }),
    draw(s) {
      const T = 0.12, zb = 5; let P;
      box(s, -56, -30, 0, 112, 54, 5, COL.floorLight);
      withTilt(T, zb, () => {
        P = panel(s, -42, -18, zb, 84, 58, 6);
        const x0 = P.x0, z0 = P.z0;
        topBar(s, x0, P.yF, z0 + P.h - 5, P.w);
        wLine(s, x0 + 3, P.yF, z0 + 3, 46, 38);
        wBars(s, x0 + 53, P.yF, z0 + 23, 22, 18);
        wDonut(s, x0 + 53, P.yF, z0 + 3, 22, 16);
      });
      dbStack(s, -46, 6, zb, 11, 3);
      const fy = P.yF - T * 20;
      magnifier(s, 14, fy + 12, zb + 20, 15);
      lensBars(s, 14, fy + 12.1, zb + 20, 15);
    },
  },
  tiltCore: {
    title: 'Откинутая панель с ядром', depicts: 'Откинутый экран: в центре ядро-искра, вокруг четыре карточки на линиях; спереди слева база данных, сверху пузырь чата',
    from: 'референсы человека; тема «Питчер»', opts: {}, fp: () => ({ w: 120, d: 48, h: 76 }),
    draw(s) {
      const T = 0.28, zb = 5; let P;
      box(s, -54, -30, 0, 108, 50, 5, COL.floorLight);
      withTilt(T, zb, () => {
        P = panel(s, -46, -8, zb, 92, 62, 6);
        const x0 = P.x0, z0 = P.z0, y = P.yF, cx = x0 + 31;
        wDoc(s, x0 + 3, y, z0 + 31, 22, 22);
        wBars(s, x0 + 3, y, z0 + 3, 22, 22);
        wPerson(s, x0 + 61, y, z0 + 31, 22, 22);
        wDonut(s, x0 + 61, y, z0 + 3, 22, 22);
        wCore(s, cx, y, z0 + 16, 24, 24);
        link(s, y, [[x0 + 25, z0 + 42], [x0 + 28, z0 + 42], [x0 + 28, z0 + 36], [cx, z0 + 36]]);
        link(s, y, [[x0 + 25, z0 + 14], [x0 + 28, z0 + 14], [x0 + 28, z0 + 20], [cx, z0 + 20]]);
        link(s, y, [[x0 + 61, z0 + 42], [x0 + 58, z0 + 42], [x0 + 58, z0 + 36], [cx + 24, z0 + 36]]);
        link(s, y, [[x0 + 61, z0 + 14], [x0 + 58, z0 + 14], [x0 + 58, z0 + 20], [cx + 24, z0 + 20]]);
      });
      const fy = (z) => P.yF - T * (z - zb);
      dbStack(s, -44, 12, zb, 10, 3);
      chatBadge(s, -58, fy(zb + 46) + 1, zb + 44, 22, 14, 'dots');
    },
  },
  tiltChat: {
    title: 'Откинутый чат', depicts: 'Откинутая панель — окно чата: вопрос слева, акцентный ответ справа, «печатает» внизу; сверху пузырь, внизу значок поиска',
    from: 'референсы человека (пузыри чата на панели); тема «Питчер»', opts: {}, fp: () => ({ w: 104, d: 48, h: 72 }),
    draw(s) {
      const T = 0.3, zb = 5; let P;
      box(s, -50, -28, 0, 100, 48, 5, COL.floorLight);
      withTilt(T, zb, () => {
        P = panel(s, -40, -6, zb, 80, 60, 6);
        const x0 = P.x0, y = P.yF, z0 = P.z0, msg = (x, z, w, h, c, ink, lens) => {
          wallRect(s, x, y, z, w, h, c);
          lens.forEach((l, i) => wallRect(s, x + 3, y + 0.05, z + h - 5 - i * 4.4, l, 2, ink, c === CARD ? undefined : undefined));
        };
        msg(x0 + 3, z0 + 34, 40, 17, CARD, L('top'), [30, 22, 26]);
        msg(x0 + 31, z0 + 14, 40, 17, L('right'), CARD, [30, 24, 18]);
        wallRect(s, x0 + 3, y, z0 + 3, 24, 9, CARD);
        for (let i = 0; i < 3; i++) wallDisc(s, x0 + 9 + i * 5, y + 0.05, z0 + 7.5, 1.3, L('right'));
        wallRect(s, x0 + 45, y, z0 + 38, 26, 13, CARD);                                  // карточка-справка справа сверху
        wallRect(s, x0 + 48, y + 0.05, z0 + 46, 12, 2.4, L('right'));
        wallRect(s, x0 + 48, y + 0.05, z0 + 41, 18, 1.6, L('top'));
      });
      const fy = (z) => P.yF - T * (z - zb);
      chatBadge(s, 24, fy(zb + 46) + 1, zb + 44, 22, 14, 'dots');
      searchBadge(s, -52, fy(zb + 8) + 1, zb + 3, 18);
    },
  },
  tiltDb: {
    title: 'Откинутый отчёт с базами и лупой', depicts: 'Откинутая панель с листом, таблицей, столбцами и диаграммой; слева две базы данных, справа крупная лупа со столбцами в стекле',
    from: 'референсы человека (база данных и лупа на подставке); тема «Питчер»', opts: {}, fp: () => ({ w: 112, d: 54, h: 72 }),
    draw(s) {
      const T = 0.25, zb = 5; let P;
      box(s, -56, -30, 0, 112, 54, 5, COL.floorLight);
      withTilt(T, zb, () => {
        P = panel(s, -42, -14, zb, 84, 62, 6);
        const x0 = P.x0, z0 = P.z0, y = P.yF;
        wDoc(s, x0 + 3, y, z0 + 3, 26, 50);
        wTable(s, x0 + 33, y, z0 + 29, 42, 24);
        wBars(s, x0 + 33, y, z0 + 3, 20, 22);
        wDonut(s, x0 + 57, y, z0 + 3, 18, 22);
      });
      dbStack(s, -48, 8, zb, 9, 3);
      dbStack(s, -32, 16, zb, 9, 2);
      const fy = P.yF - T * 22;
      magnifier(s, 28, fy + 12, zb + 22, 15);
      lensBars(s, 28, fy + 12.1, zb + 22, 15);
    },
  },
  dome: {
    title: 'Купол с лучом', depicts: 'Обзор, контроль, мониторинг (радар)', from: 'вариант 8 «Радара»',
    opts: { beam: 'луч-конус из вершины, по умолчанию true' }, fp: () => ({ w: 46, d: 46, h: 28 }),
    draw(s, o = {}) {
      const R = 23, layers = 9, th = 2.5;
      for (let k = 0; k < layers; k++) {                                                      // ярусы-пластины
        const zc = (k + 0.5) * th, r = Math.sqrt(R * R - zc * zc);
        cyl(s, 0, 0, k * th, r, th, k === layers - 1 ? COL.coinHero : COL.coin);
      }
      box(s, -1.6, -1.6, layers * th, 3.2, 3.2, 5, COL.cube, { edge: 0.8 });                  // мачта
      if (o.beam === false) return;
      const apex = [0, 0, layers * th + 5], a = -28 * D2R, dir = [0.74 * Math.cos(a), 0.74 * Math.sin(a), 0.62];
      beamCone(s, apex, dir, 60, 21, L('left'), 0.3);                                         // слои копятся: сердцевина плотнее
      const mid = beamCone(s, apex, dir, 60, 13, L('left'), 0.3);
      disc(s, mid, L('left'), 0.3);
      const core = beamCone(s, apex, dir, 60, 6.5, L('left'), 0.5);
      disc(s, core, L('right'), 0.5);
    },
  },
};

/* каталог для `--motifs` и документации: из паспортов, не вручную */
export function describeMotifs() {
  return Object.entries(MOTIFS).map(([name, m]) => {
    const fp = m.fp();
    return `${name.padEnd(10)} ${m.title} — ${m.depicts}. ${fp.w}×${fp.d}×${fp.h}; из: ${m.from}${Object.keys(m.opts).length ? '; параметры: ' + Object.entries(m.opts).map(([k, v]) => `${k} (${v})`).join(', ') : ''}`;
  });
}



