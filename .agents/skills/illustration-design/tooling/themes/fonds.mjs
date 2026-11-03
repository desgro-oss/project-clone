/* Тема «Фонды»: нав-тайл раздела финансовых фондов IB — реестр фондов и их активов, управление активами, дашборд.
   Радара здесь нет. Активные — 6, 7, 8; остальные в архиве (keep: false). */
import {
  L, TO_DARK, COL, GLASS, LINE, D2R, pv, Scene, arc2, ept, arcE, UX, VY, WZ, scale3, circ, H, shiftE, poly3, ellipseSegs, disc, ring, sector, box, topLines, cyl, coinStack, extrude, bbox, render, toDark, polar, byDepth, sweepTrail, beamWedge, beamCone, clipAngles, splitAtDiagonals, sectorPrism, wallRect, wallLine, wallDisc,
} from '../lib.mjs';
import { drawMonitor, docStack } from '../motifs.mjs';

/* Площадка под объектами убрана (решение человека 29.10.2026): вызовы оставлены, рисунка нет.
   Объекты по-прежнему стоят на отметке z = 6 — без площадки это ни на что не влияет, фигуры сами по себе. */
const FLOOR_BOX = (s, w, d, h = 6) => {};

/* Ф1. Диаграмма роста активов: столбцы по диагонали плиты, линия тренда над ними, монеты и куб */
function f1() {
  const s = new Scene('fonds-1-bars');
  s.group('floor', () => FLOOR_BOX(s, 104, 72));
  const hs = [13, 22, 33, 46], ts = [-27, -9, 9, 27], w = 12;     // центры столбцов (t, −t): ряд идёт строго вдоль экрана
  s.group('bars', () => hs.forEach((h, i) =>
    box(s, ts[i] - w / 2, -ts[i] - w / 2, 6, w, w, h, i === 3 ? COL.hero : COL.cube,
      { edge: 1.2, glass: [1.6, 2] })));
  s.group('trend', () => {                                  // линия роста над столбцами и наконечник
    const pts = hs.map((h, i) => [ts[i], 6 + h + 8]);
    const at = ([t, z], off = 0) => [t, -t, z + off];
    for (let i = 0; i < pts.length - 1; i++) {
      const a = at(pts[i]), b = at(pts[i + 1]);
      s.add(poly3([[a[0], a[1], a[2] + 0.9], [b[0], b[1], b[2] + 0.9], [b[0], b[1], b[2] - 0.9], [a[0], a[1], a[2] - 0.9]]), L('right'));
    }
    const e = pts[3], tip = at([e[0] + 9, e[1] + 6]);
    s.add(poly3([at([e[0] - 1, e[1] + 4]), tip, at([e[0] + 5, e[1] - 4])]), L('right'));
  });
  s.group('funds', () => {
    coinStack(s, 34, 26, 6, 9, 5, COL.coin);
    box(s, -6, 24, 6, 10, 10, 9, COL.cube, { edge: 1, glass: [1.4, 1.6] });
  });
  return s;
}

/* Ф2. Объёмный «пончик» — структура активов: высота сектора = доля, главный выдвинут; в отверстии монеты */
function f2() {
  const s = new Scene('fonds-2-donut');
  const SET = [
    { a0: -30, a1: 114, h: 17, ex: 4, c: { top: L('topLight'), left: L('right'), right: L('shadowDeep') } },   // 40 %, главный
    { a0: 114, a1: 204, h: 11, ex: 0, c: { top: L('sideMid'), left: L('left'), right: L('right') } },          // 25 %
    { a0: 204, a1: 276, h: 8, ex: 0, c: { top: L('top'), left: L('sideMid'), right: L('left') } },             // 20 %
    { a0: 276, a1: 330, h: 13, ex: 0, c: { top: L('topMuted'), left: L('left'), right: L('right') } },         // 15 %
  ].map((p) => ({ ...p, mid: ((p.a0 + p.a1) / 2) * D2R }));
  s.group('donut', () => SET
    .sort((p, q) => (Math.cos(p.mid) + Math.sin(p.mid)) - (Math.cos(q.mid) + Math.sin(q.mid)))
    .forEach((p) => sectorPrism(s, 0, 0, 6, 17, 38, p.a0 * D2R, p.a1 * D2R, p.h, p.c, p.ex)));
  s.group('funds', () => {
    coinStack(s, 0, 0, 6, 10.5, 3, COL.coinHero);
    box(s, -46, 24, 6, 8, 8, 8, COL.cube, { edge: 1, glass: [1.2, 1.4] });
  });
  return s;
}

/* Ф3. Дашборд: стоящий монитор с карточками показателей, столбиками и кольцом; рядом монеты и куб */
/* drawMonitor — утверждённый рисунок монитора (вариант 3): код в ../motifs.mjs, здесь только вызов */

function f3() {
  const s = new Scene('fonds-3-dashboard');
  s.group('floor', () => FLOOR_BOX(s, 100, 66));
  drawMonitor(s, -34, -14);
  s.group('funds', () => {
    coinStack(s, 28, 20, 6, 9.5, 6, COL.coinHero);
    coinStack(s, 40, 3, 6, 6.5, 3, COL.coin);
    box(s, -2, 20, 6, 10, 10, 10, COL.cube, { edge: 1, glass: [1.4, 1.6] });
  });
  return s;
}

/* Ф4. Хранилище активов: сейф с круглой дверью-штурвалом, монеты и куб рядом */
function f4() {
  const s = new Scene('fonds-4-vault');
  s.group('floor', () => FLOOR_BOX(s, 100, 70));
  const bx = -24, by = -22, bw = 44, bd = 40, bh = 40, yF = by + bd + 0.05;
  s.group('vault', () => {
    box(s, bx, by, 6, bw, bd, bh, COL.slab, { edge: 1.4 });
    const cx = bx + bw / 2, cz = 6 + bh / 2;
    const rim = circ([cx, yF + 2.5, cz], UX, WZ, 15.5);
    extrude(s, rim, pv([0, -2.5, 0]), L('left'));
    disc(s, rim, L('top'));                                                       // обод двери
    wallDisc(s, cx, yF + 2.5, cz, 12.6, L('sideMid'));
    wallDisc(s, cx, yF + 2.5, cz, 11, L('left'));
    for (let k = 0; k < 8; k++) {                                                 // болты по кругу
      const a = (k * 45 + 22.5) * D2R;
      wallDisc(s, cx + 13.8 * Math.cos(a), yF + 2.5, cz + 13.8 * Math.sin(a), 0.9, L('right'));
    }
    for (let k = 0; k < 3; k++) {                                                 // штурвал: три спицы
      const a = (90 + k * 120) * D2R, l = 7.8, w = 1.3;
      const dx = Math.cos(a), dz = Math.sin(a), nx = -dz * w, nz = dx * w;
      s.add(poly3([[cx + nx, yF + 2.5, cz + nz], [cx + dx * l + nx, yF + 2.5, cz + dz * l + nz],
        [cx + dx * l - nx, yF + 2.5, cz + dz * l - nz], [cx - nx, yF + 2.5, cz - nz]]), L('topLight'));
      wallDisc(s, cx + dx * l, yF + 2.5, cz + dz * l, 1.9, L('topLight'));
    }
    wallDisc(s, cx, yF + 2.5, cz, 3.2, L('topLight'));
    s.add(poly3([[bx + bw, by + 5, 6 + 6], [bx + bw, by + bd - 5, 6 + 6], [bx + bw, by + bd - 5, 6 + bh - 6], [bx + bw, by + 5, 6 + bh - 6]]), GLASS, 0.3);
  });
  s.group('funds', () => {
    coinStack(s, 40, 28, 6, 9.5, 7, COL.coinHero);
    coinStack(s, 44, 6, 6, 6.5, 3, COL.coin);
    box(s, -44, 20, 6, 9, 9, 9, COL.cube, { edge: 1, glass: [1.3, 1.5] });
  });
  return s;
}

/* Ф5. Здание фонда: ступени, колонны, фронтон и крыша; рядом монеты и диаграмма-куб */
function f5() {
  const s = new Scene('fonds-5-building');
  s.group('floor', () => FLOOR_BOX(s, 110, 76));
  const x0 = -34, y0 = -26;
  s.group('steps', () => {
    box(s, x0 - 5, y0 - 3, 6, 62, 46, 4, COL.slab, { edge: 1 });
    box(s, x0 - 1, y0 + 1, 10, 54, 38, 4, COL.floorLight, { edge: 1 });
  });
  const zb = 14, wy = y0 + 4;
  s.group('hall', () => {
    box(s, x0 + 3, wy, zb, 48, 24, 30, COL.slab, { edge: 1, glass: [4, 3] });          // тело здания
    const n = 5, sp = 10.5;
    for (let i = 0; i < n; i++) {                                                      // колонны, дальние первыми
      const cx = x0 + 6 + i * sp, cy = y0 + 33;
      cyl(s, cx, cy, zb, 3.8, 1.6, COL.coinHero);                                      // база
      cyl(s, cx, cy, zb + 1.6, 2.9, 26, COL.coin);                                     // ствол
      cyl(s, cx, cy, zb + 27.6, 3.8, 2.4, COL.coinHero);                               // капитель
    }
    box(s, x0 - 0.5, y0 + 1 + 4, zb + 30, 55, 36, 3.6, COL.slab, { edge: 0.8 });      // антаблемент
  });
  s.group('roof', () => {
    const rx = x0 - 0.5, ry = y0 + 5, rw = 55, rd = 36, zt = zb + 33.6, hh = 12;
    s.add(poly3([[rx + rw, ry, zt], [rx + rw, ry + rd, zt], [rx + rw / 2, ry + rd, zt + hh], [rx + rw / 2, ry, zt + hh]]), L('left'));   // правый скат
    s.add(poly3([[rx, ry + rd, zt], [rx + rw, ry + rd, zt], [rx + rw / 2, ry + rd, zt + hh]]), L('top'));                                 // фронтон
    s.add(poly3([[rx + 8, ry + rd + 0.05, zt + 1.4], [rx + rw - 8, ry + rd + 0.05, zt + 1.4], [rx + rw / 2, ry + rd + 0.05, zt + hh - 3.2]]), L('topLight'));
    wallDisc(s, rx + rw / 2, ry + rd + 0.1, zt + 4.6, 2.2, L('right'));               // эмблема во фронтоне
  });
  s.group('funds', () => {
    coinStack(s, 40, 24, 6, 9, 6, COL.coinHero);
    box(s, -48, 22, 6, 10, 10, 14, COL.cube, { edge: 1, glass: [1.4, 1.8] });
  });
  return s;
}

/* Ф6. Здание фонда, исправленное: по центру площадки, обе стороны крыши, без мелочи на переднем плане */
function f6() {
  const s = new Scene('fonds-6-building-v2');
  s.group('floor', () => FLOOR_BOX(s, 92, 66));
  s.group('steps', () => {
    box(s, -31, -23, 6, 62, 46, 4, COL.slab, { edge: 1 });
    box(s, -27, -19, 10, 54, 38, 4, COL.floorLight, { edge: 1 });
  });
  const zb = 14;
  s.group('hall', () => {
    box(s, -24, -15, zb, 48, 24, 30, COL.slab, { edge: 1, glass: [4, 3] });                 // тело здания
    for (let i = 0; i < 5; i++) {                                                           // колонны, дальние первыми
      const cx = -21 + i * 10.5, cy = 13;
      cyl(s, cx, cy, zb, 3.8, 1.6, COL.coinHero);
      cyl(s, cx, cy, zb + 1.6, 2.9, 26, COL.coin);
      cyl(s, cx, cy, zb + 27.6, 3.8, 2.4, COL.coinHero);
    }
    box(s, -27.5, -15, zb + 30, 55, 34.5, 3.6, COL.slab, { edge: 0.8 });                    // антаблемент
  });
  s.group('roof', () => {
    const rx = -27.5, ry = -15, rw = 55, rd = 34.5, zt = zb + 33.6, hh = 13;
    s.add(poly3([[rx, ry, zt], [rx, ry + rd, zt], [rx + rw / 2, ry + rd, zt + hh], [rx + rw / 2, ry, zt + hh]]), L('top'));          // левый (дальний) скат
    s.add(poly3([[rx + rw, ry, zt], [rx + rw, ry + rd, zt], [rx + rw / 2, ry + rd, zt + hh], [rx + rw / 2, ry, zt + hh]]), L('left')); // правый скат
    s.add(poly3([[rx, ry + rd, zt], [rx + rw, ry + rd, zt], [rx + rw / 2, ry + rd, zt + hh]]), L('sideMid'));                        // фронтон
    s.add(poly3([[rx + 8, ry + rd + 0.05, zt + 1.4], [rx + rw - 8, ry + rd + 0.05, zt + 1.4], [rx + rw / 2, ry + rd + 0.05, zt + hh - 3.4]]), L('topLight'));
    wallDisc(s, rx + rw / 2, ry + rd + 0.1, zt + 4.8, 2.3, L('right'));                      // эмблема во фронтоне
  });
  return s;
}

/* docStack, PAPER — стопка документов: код в ../motifs.mjs */

/* Ф7. Дашборд и документы: утверждённый монитор по центру, стопки документов по диагонали — дальняя справа, ближняя слева */
function f7() {
  const s = new Scene('fonds-7-dashboard-docs');
  s.group('floor', () => box(s, -54, -37, 0, 108, 74, 6, COL.floor, { edge: 1.2 }));        // плита возвращена по просьбе человека
  s.group('docs-far', () => docStack(s, 19, -31, 6, 30, 22, 7));
  drawMonitor(s, -33, -5);
  s.group('docs-near', () => docStack(s, -48, 8, 6, 30, 22, 8));
  return s;
}

/* Ф8. Только монитор: утверждённый дашборд, без площадки (решение человека 29.10.2026) */
function f8() {
  const s = new Scene('fonds-8-monitor');
  drawMonitor(s, -33, -2, 0);
  return s;
}

export default {
  id: 'fonds', title: 'Фонды', dir: 'фонды', order: 2,
  tile: { title: 'Фонды', desc: 'Реестр фондов и управление их активами' },
  scenes: [
    { file: 'fonds-1-bars', make: f1, keep: false },
    { file: 'fonds-2-donut', make: f2, keep: false },
    { file: 'fonds-3-dashboard', make: f3, keep: false },
    { file: 'fonds-4-vault', make: f4, keep: false },
    { file: 'fonds-5-building', make: f5, keep: false },
    { file: 'fonds-6-building-v2', make: f6, keep: true },
    { file: 'fonds-7-dashboard-docs', make: f7, keep: true, base: 'slab' },
    { file: 'fonds-8-monitor', make: f8, keep: true },
  ],
};
