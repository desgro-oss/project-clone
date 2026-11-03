/* Тема «Фонд Радар»: радарные платформы с фигурами-фондами (кубы, монеты), купол с лучом.
   Активные — 6 и 7; остальные в архиве (keep: false), вернуть — keep: true. */
import {
  L, TO_DARK, COL, GLASS, LINE, D2R, pv, Scene, arc2, ept, arcE, UX, VY, WZ, scale3, circ, H, shiftE, poly3, ellipseSegs, disc, ring, sector, box, topLines, cyl, coinStack, extrude, bbox, render, toDark, polar, byDepth, sweepTrail, beamWedge, beamCone, clipAngles, splitAtDiagonals, sectorPrism, wallRect, wallLine, wallDisc,
} from '../lib.mjs';

/* круглая радарная панель: кольца, перекрестье, сектор развёртки */
function radarOnDisc(s, z, R, sweepFrom, sweepTo, ringColor, trailColors) {
  s.group('radar', () => {
    sweepTrail(s, H([0, 0, z], R), sweepFrom * D2R, sweepTo * D2R, trailColors);
    const rs = [R, R * 0.68, R * 0.36];
    for (const r of rs) ring(s, [0, 0, z], r, r - 1.6, ringColor);
    for (const [dx, dy] of [[1, 0], [0, 1]]) {            // перекрестье вдоль осей 30°/150°
      const a = [-R * dx, -R * dy, z], b = [R * dx, R * dy, z], w = 0.8;
      s.add(poly3([[a[0] - w * dy, a[1] - w * dx, z], [b[0] - w * dy, b[1] - w * dx, z], [b[0] + w * dy, b[1] + w * dx, z], [a[0] + w * dy, a[1] + w * dx, z]]), ringColor);
    }
  });
}

/* ================= ВАРИАНТЫ ================= */

/* 1. Радарная платформа: ступенчатый диск, кольца, развёртка, «фонды» — кубы-отметки */
function v1() {
  const s = new Scene('fund-radar-1');
  s.group('base', () => { cyl(s, 0, 0, 0, 62, 7, COL.floorLight); cyl(s, 0, 0, 7, 54, 5, COL.floor); });
  radarOnDisc(s, 12, 46, 0, 84, L('topLightest'), [L('top'), L('topLight'), L('topLightest')]);
  const blips = [
    { a: 52, r: 28, w: 10, h: 22, c: COL.hero }, { a: 118, r: 38, w: 8, h: 10, c: COL.cube },
    { a: -22, r: 26, w: 8, h: 8, c: COL.cube }, { a: 24, r: 44, w: 6, h: 6, c: COL.cube },
  ].map((b) => { const [x, y] = polar(b.r, b.a); return { ...b, x, y }; });
  s.group('funds', () => byDepth(blips).forEach((b) => box(s, b.x - b.w / 2, b.y - b.w / 2, 12, b.w, b.w, b.h, b.c, { edge: 1, glass: [1.2, 1.5] })));
  return s;
}

/* 2. Реестр: стопка плит-папок с радарным кольцом на верхней, рядом — стопка с «строками» */
function v2() {
  const s = new Scene('fund-radar-2');
  s.group('floor', () => box(s, -52, -34, 0, 104, 68, 5, COL.floor, { edge: 1 }));
  const slabs = [[0, 0], [5, -2], [-3, 1], [4, -1]];
  s.group('registry', () => {
    slabs.forEach(([ox, oy], i) => box(s, -36 + ox, -14 + oy, 5 + i * 8, 56, 36, 7.4, COL.slab, { edge: 1.2, glass: [3, 1.6] }));
    const zt = 5 + 4 * 8 - 0.6;
    const cx = -36 + 4 + 28, cy = -14 - 1 + 18;
    sweepTrail(s, H([cx, cy, zt], 14), 0, 84 * D2R, [L('topLight'), L('topLightest'), '#FFFFFF']);
    ring(s, [cx, cy, zt], 14, 12.6, L('left')); ring(s, [cx, cy, zt], 8.4, 7.2, L('left'));
    box(s, cx - 3, cy - 3, zt, 6, 6, 10, COL.hero, { edge: 1, glass: [1, 1.4] });
  });
  s.group('docs', () => {
    [0, 1].forEach((i) => box(s, 24, 4, 5 + i * 7, 26, 24, 6.4, COL.slab, { edge: 1, glass: [2, 1.4] }));
    topLines(s, 24, 4, 5 + 7 + 6.4, { n: 4, gap: 4.6, t: 1.5, len: [18, 14, 20, 9], a: 3, b: 3 });
  });
  return s;
}

/* 3. Монеты на радаре: круглая радарная панель с тремя стопками монет разной высоты */
function v3() {
  const s = new Scene('fund-radar-3');
  s.group('base', () => cyl(s, 0, 0, 0, 62, 6, COL.floor));
  radarOnDisc(s, 6, 54, 0, 80, L('topLightest'), [L('top'), L('topLight'), L('topLightest')]);
  const stacks = [
    { x: -26, y: -10, n: 4, rr: 9, c: COL.coin }, { x: 14, y: 6, n: 9, rr: 11, c: COL.coinHero },
    { x: -8, y: 34, n: 3, rr: 8, c: COL.coin }, { x: 34, y: -26, n: 2, rr: 7, c: COL.coin },
  ];
  s.group('coins', () => byDepth(stacks).forEach((b) => coinStack(s, b.x, b.y, 6, b.rr, b.n, b.c)));
  return s;
}

/* 4. Город фондов: башни разной высоты на плите, радарные кольца под ними, стеклянная развёртка */
function v4() {
  const s = new Scene('fund-radar-4');
  s.group('floor', () => box(s, -56, -46, 0, 112, 92, 6, COL.floor, { edge: 1.2 }));
  s.group('radar', () => {
    for (const r of [48, 33, 18]) ring(s, [0, 0, 6], r, r - 1.6, L('topLightest'));
    sector(s, H([0, 0, 6], 48), 5 * D2R, 75 * D2R, L('topLightest'), 0.3);
  });
  const towers = [
    [-34, -30, 14, 12, 16], [-8, -34, 12, 12, 26], [18, -30, 14, 12, 14],
    [-38, -4, 12, 14, 12], [-8, -10, 14, 14, 40], [20, -6, 14, 12, 20],
    [-30, 20, 14, 12, 18], [-2, 20, 14, 12, 10], [24, 20, 12, 12, 24],
  ].map(([x, y, w, d, h]) => ({ x, y, w, d, h }));
  s.group('towers', () => byDepth(towers).forEach((t) => {
    const hero = t.h === 40;
    box(s, t.x, t.y, 6, t.w, t.d, t.h, hero ? COL.hero : COL.cube,
      { edge: 1, stripes: { n: Math.floor((t.h - 4) / 5), t: 1.3, gap: 5, a: 2.4, z0: 3.2 } });
  }));
  return s;
}

/* 5. Радарный экран на стойке + монеты и куб на плите */
function v5() {
  const s = new Scene('fund-radar-5');
  s.group('floor', () => box(s, -44, -30, 0, 88, 60, 6, COL.floor, { edge: 1.2 }));
  const cx = -14, cy = -8, zc = 52, R = 28, T = 7, Ri = R - 3;
  s.group('stand', () => {
    box(s, cx - 13, cy - 8, 6, 26, 16, 4, COL.slab, { edge: 1, glass: [3, 0.8] });
    box(s, cx - 3.5, cy - 3.5, 10, 7, 7, 16, COL.cube, { edge: 1 });
  });
  s.group('screen', () => {
    const at = (r) => circ([cx, cy, zc], UX, WZ, r);
    extrude(s, at(R), pv([0, -T, 0]), L('sideMid'));
    disc(s, at(R), L('top'));                                         // рамка
    disc(s, at(Ri), L('right'));                                      // экран
    sweepTrail(s, at(Ri), 8 * D2R, 88 * D2R, [L('left'), L('sideMid'), L('top')]);
    for (const k of [1, 0.68, 0.36]) s.add([...ellipseSegs(at(Ri * k)), ...ellipseSegs(at(Ri * k - 1.3), true)], L('sideMid'));
    for (const [a, k] of [[60, 0.52], [24, 0.82], [-42, 0.62]]) {
      s.add(ellipseSegs({ C: ept(at(Ri * k), a * D2R), U: [1.9, 0], V: [0, 1.9] }), '#FFFFFF');
    }
  });
  s.group('funds', () => {
    coinStack(s, 22, 10, 6, 10, 7, COL.coinHero);
    coinStack(s, 34, -10, 6, 7, 3, COL.coin);
    box(s, 4, 8, 6, 11, 11, 11, COL.cube, { edge: 1, glass: [1.6, 1.8] });
  });
  return s;
}

/* 6. Платформа, три крупные фигуры: большая в центре, средняя и малая по бокам (по мотивам 1) */
function v6() {
  const s = new Scene('fund-radar-6-trio');
  s.group('base', () => { cyl(s, 0, 0, 0, 62, 7, COL.floorLight); cyl(s, 0, 0, 7, 54, 5, COL.floor); });
  radarOnDisc(s, 12, 46, -10, 74, L('topLightest'), [L('top'), L('topLight'), L('topLightest')]);
  const at = (a, r) => polar(r, a);
  const [mx, my] = at(138, 32), [sx, sy] = at(-38, 34);
  const items = [
    { x: -9, y: -9, w: 18, h: 40, c: COL.hero, st: { n: 6, t: 1.4, gap: 5.6, a: 3, z0: 4 } },   // большая
    { x: mx - 7, y: my - 7, w: 14, h: 18, c: COL.cube, st: null },                              // средняя
    { x: sx - 4.5, y: sy - 4.5, w: 9, h: 9, c: COL.cube, st: null },                            // малая
  ];
  s.group('funds', () => byDepth(items).forEach((b) =>
    box(s, b.x, b.y, 12, b.w, b.w, b.h, b.c, { edge: 1.2, glass: b.st ? null : [b.w * 0.14, b.w * 0.17], stripes: b.st })));
  return s;
}

/* 7. Монеты, три крупные стопки: большая в центре, средняя и малая по бокам (по мотивам 3) */
function v7() {
  const s = new Scene('fund-radar-7-trio');
  s.group('base', () => cyl(s, 0, 0, 0, 62, 6, COL.floor));
  radarOnDisc(s, 6, 54, -10, 74, L('topLightest'), [L('top'), L('topLight'), L('topLightest')]);
  const [mx, my] = polar(36, 138), [sx, sy] = polar(38, -36);
  const stacks = [
    { x: 0, y: 0, n: 9, rr: 16, th: 4, c: COL.coinHero },     // большая
    { x: mx, y: my, n: 6, rr: 10.5, th: 3.6, c: COL.coin },    // средняя
    { x: sx, y: sy, n: 3, rr: 7, th: 3.2, c: COL.coin },       // малая
  ];
  s.group('coins', () => byDepth(stacks).forEach((b) => coinStack(s, b.x, b.y, 6, b.rr, b.n, b.c, b.th, 0.8)));
  return s;
}

/* 8. Радарный купол на платформе и луч-конус в воздухе */
function v8() {
  const s = new Scene('fund-radar-8-dome');
  const A0 = -10 * D2R, A1 = 74 * D2R;
  s.group('base', () => { cyl(s, 0, 0, 0, 62, 7, COL.floorLight); cyl(s, 0, 0, 7, 54, 5, COL.floor); });
  radarOnDisc(s, 12, 46, -64, 8, L('topLightest'), [L('top'), L('topLight'), L('topLightest')]);
  /* купол: ярусы-пластины, радиус по окружности профиля */
  const R = 23, layers = 9, th = 2.5;
  s.group('dome', () => {
    for (let k = 0; k < layers; k++) {
      const zc = (k + 0.5) * th, r = Math.sqrt(R * R - zc * zc);
      cyl(s, 0, 0, 12 + k * th, r, th, k === layers - 1 ? COL.coinHero : COL.coin);
    }
    box(s, -1.6, -1.6, 12 + layers * th, 3.2, 3.2, 5, COL.cube, { edge: 0.8 });   // мачта антенны
  });
  s.group('beam', () => {                                   // слои по 0.3 копятся: сердцевина плотнее краёв
    const apex = [0, 0, 12 + layers * th + 5], a = -28 * D2R, dir = [0.74 * Math.cos(a), 0.74 * Math.sin(a), 0.62];
    beamCone(s, apex, dir, 60, 21, L('left'), 0.3);
    const mid = beamCone(s, apex, dir, 60, 13, L('left'), 0.3);
    disc(s, mid, L('left'), 0.3);
    const core = beamCone(s, apex, dir, 60, 6.5, L('left'), 0.5);
    disc(s, core, L('right'), 0.5);
  });
  return s;
}

export default {
  id: 'radar', title: 'Радар', dir: '', order: 1,
  tile: { title: 'Фонд "Радар"', desc: 'Мониторинг фондов и сигналы по их активам' },
  scenes: [
    { file: 'fund-radar-1-platform', make: v1, keep: false },
    { file: 'fund-radar-2-registry', make: v2, keep: false },
    { file: 'fund-radar-3-coins', make: v3, keep: false },
    { file: 'fund-radar-4-city', make: v4, keep: false },
    { file: 'fund-radar-5-screen', make: v5, keep: false },
    { file: 'fund-radar-6-trio', make: v6, keep: true },
    { file: 'fund-radar-7-trio', make: v7, keep: true },
    { file: 'fund-radar-8-dome', make: v8, keep: false },
  ].map((s) => ({ ...s, base: 'radar' })),          // основание сцены — подсказка автопроверке (диск закрашен по замыслу)
};
