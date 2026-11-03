/* ============================================================
   Раскладка: из короткого описания сцены (JSON темы) собирает сцену из мотивов.

   Модель не считает координаты и порядок слоёв: она выбирает раскладку, основание и мотивы по ролям,
   а позиции, размеры (1 : 0,6 : 0,4), зазоры и порядок «дальние первыми» считает этот файл.

     { "file": "…", "keep": true, "layout": "trio", "base": "none",
       "hero": { "motif": "building" }, "mid": { "motif": "docStack", "opts": { "n": 6 } }, "small": { "motif": "cube" } }

   Раскладки (углы — в мире: 138° — экранное «влево», −38° — «вправо», 100° — влево-ближе, −80° — вправо-дальше):
     solo     — один главный объект по центру;
     pair     — главный по центру + средний справа-спереди;
     trio     — главный по центру, средний слева-сзади, малый справа-спереди (размеры 1 : 0,6 : 0,4);
     diagonal — главный по центру, два одинаковых по диагонали: справа-дальше и слева-ближе.
   Основание: none — без площадки; slab — плита; disc — ступенчатый диск; radar — диск с кольцами и развёрткой.
   ============================================================ */
import { L, COL, D2R, pv, placeSegs, Scene, H, ring, poly3, cyl, box, sweepTrail } from './lib.mjs';
import { MOTIFS } from './motifs.mjs';
import { measureItems } from './check.mjs';

export const LAYOUTS = {
  solo:     { roles: { hero: { k: 1, at: [0, 0] } } },
  pair:     { roles: { hero: { k: 1, at: [0, 0] }, mid: { k: 0.6, angle: -38 } } },
  trio:     { roles: { hero: { k: 1, at: [0, 0] }, mid: { k: 0.6, angle: 138 }, small: { k: 0.4, angle: -38 } } },
  diagonal: { roles: { hero: { k: 1, at: [0, 0] }, mid: { k: 0.7, angle: -80 }, small: { k: 0.7, angle: 100 } } },
};
export const BASES = ['none', 'slab', 'disc', 'radar'];
const GAP = 6;                    // зазор между основаниями объектов, ед. мира
const MAX_SCREEN_OVERLAP = 0.2;   // какая доля рамки объекта на экране может быть закрыта главным

/* натуральный размер мотива на экране: площадь (px²) и рамка относительно его центра; считается растеризацией, кэшируется */
const MEASURES = new Map();
function measureMotif(name, opts) {
  const key = name + JSON.stringify(opts ?? {});
  if (!MEASURES.has(key)) {
    const OFF = [97.5, 100], s = new Scene('measure');
    s.owner('m', () => MOTIFS[name].draw(s, opts));
    const m = measureItems(s.items.map((it) => ({ segs: placeSegs(it.segs, 1, OFF), opacity: it.opacity ?? 1 })));
    MEASURES.set(key, { area: m.area, bbox: [m.bbox[0] - OFF[0], m.bbox[1] - OFF[1], m.bbox[2] - OFF[0], m.bbox[3] - OFF[1]] });
  }
  return MEASURES.get(key);
}

/* проблемы описания словами; пусто — описание годится */
export function validateSpec(spec) {
  const bad = [];
  const lay = LAYOUTS[spec.layout];
  if (!spec.file) bad.push('нет file');
  if (!lay) bad.push(`раскладка «${spec.layout}» неизвестна; есть: ${Object.keys(LAYOUTS).join(', ')}`);
  if (!BASES.includes(spec.base ?? 'none')) bad.push(`основание «${spec.base}» неизвестно; есть: ${BASES.join(', ')}`);
  if (lay) {
    for (const role of Object.keys(lay.roles)) {
      const o = spec[role];
      if (!o) bad.push(`в раскладке ${spec.layout} нужна роль ${role}`);
      else if (!MOTIFS[o.motif]) bad.push(`роль ${role}: мотива «${o.motif}» нет; есть: ${Object.keys(MOTIFS).join(', ')}`);
    }
    for (const role of ['hero', 'mid', 'small']) if (spec[role] && !lay.roles[role]) bad.push(`роль ${role} в раскладке ${spec.layout} не используется — уберите её`);
  }
  return bad;
}

/* опорная функция прямоугольника w×d (оси x, y) в направлении a: насколько он выступает от центра */
const reach = (w, d, a) => Math.abs(Math.cos(a)) * w / 2 + Math.abs(Math.sin(a)) * d / 2;

/* радарный слой диска: кольца, перекрестье, развёртка со шлейфом */
function radarOverlay(s, z, R) {
  const ringColor = L('topLightest');
  s.group('radar', () => {
    sweepTrail(s, H([0, 0, z], R), -10 * D2R, 74 * D2R, [L('top'), L('topLight'), L('topLightest')]);
    for (const r of [R, R * 0.68, R * 0.36]) ring(s, [0, 0, z], r, r - 1.6, ringColor);
    for (const [dx, dy] of [[1, 0], [0, 1]]) {
      const w = 0.8;
      s.add(poly3([[-R * dx - w * dy, -R * dy - w * dx, z], [R * dx - w * dy, R * dy - w * dx, z], [R * dx + w * dy, R * dy + w * dx, z], [-R * dx + w * dy, -R * dy + w * dx, z]]), ringColor);
    }
  });
}

/* сцена по описанию; кроме Scene возвращает meta — объекты, их прямоугольники и основание (для автопроверки) */
export function buildSceneFromSpec(spec) {
  const bad = validateSpec(spec);
  if (bad.length) throw new Error(`сцена ${spec.file || '?'}: ` + bad.join('; '));
  const lay = LAYOUTS[spec.layout], base = spec.base ?? 'none';
  /* размер роли — по видимой площади мотива, а не по габаритам: 1 : 0,6 : 0,4 — это отношение «линейных» размеров рисунков,
     поэтому здание и стопка монет в одной роли выглядят соразмерно (габариты у них несравнимы) */
  const ms = Object.fromEntries(Object.keys(lay.roles).map((r) => [r, measureMotif(spec[r].motif, spec[r].opts)]));
  const kh = spec.hero.k ?? 1;
  const objs = [];
  for (const [role, def] of Object.entries(lay.roles)) {
    const o = spec[role], m = MOTIFS[o.motif], fp = m.fp(o.opts);
    const k = o.k ?? (role === 'hero' ? 1 : Math.min(3, Math.max(0.2, def.k * kh * Math.sqrt(ms.hero.area / ms[role].area))));
    objs.push({ role, motif: o.motif, opts: o.opts, k, w: fp.w * k, d: fp.d * k, h: fp.h * k, x: 0, y: 0, ang: def.angle, box: ms[role].bbox });
  }
  const h0 = objs.find((o) => o.role === 'hero');
  const screenBox = (o) => { const [ox, oy] = pv([o.x, o.y, 0]); return [o.box[0] * o.k + ox, o.box[1] * o.k + oy, o.box[2] * o.k + ox, o.box[3] * o.k + oy]; };
  const overlapShare = (a, b) => {                        // какая доля рамки a закрыта рамкой b
    const w = Math.min(a[2], b[2]) - Math.max(a[0], b[0]), h = Math.min(a[3], b[3]) - Math.max(a[1], b[1]);
    return w > 0 && h > 0 ? (w * h) / ((a[2] - a[0]) * (a[3] - a[1])) : 0;
  };
  for (const o of objs) {
    if (o.ang === undefined) continue;
    const a = o.ang * D2R;
    let dist = reach(h0.w, h0.d, a) + reach(o.w, o.d, a + Math.PI) + GAP;
    for (let i = 0; i < 80; i++) {                        // разводим, пока рамки на экране не перестанут закрывать друг друга
      o.x = dist * Math.cos(a); o.y = dist * Math.sin(a);
      if (overlapShare(screenBox(o), screenBox(h0)) <= MAX_SCREEN_OVERLAP) break;
      dist += 3;
    }
  }
  /* основания объектов не должны пересекаться — иначе раскладка сломана */
  const overlaps = [];
  for (let i = 0; i < objs.length; i++) for (let j = i + 1; j < objs.length; j++) {
    const a = objs[i], b = objs[j];
    if (Math.abs(a.x - b.x) < (a.w + b.w) / 2 + 1 && Math.abs(a.y - b.y) < (a.d + b.d) / 2 + 1) overlaps.push(`${a.role} и ${b.role}`);
  }
  let z0 = 0, R = 0;
  for (const o of objs) for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) R = Math.max(R, Math.hypot(o.x + sx * o.w / 2, o.y + sy * o.d / 2));
  const s = new Scene(spec.file);
  if (base === 'slab') {
    const ex = Math.max(...objs.map((o) => Math.abs(o.x) + o.w / 2)) + 10, ey = Math.max(...objs.map((o) => Math.abs(o.y) + o.d / 2)) + 10;
    s.group('base', () => s.owner('base', () => box(s, -ex, -ey, 0, 2 * ex, 2 * ey, 6, COL.floor, { edge: 1.2 })));
    z0 = 6;
  } else if (base === 'disc' || base === 'radar') {
    const Rr = Math.ceil(R) + (base === 'radar' ? 6 : 0);
    s.group('base', () => s.owner('base', () => { cyl(s, 0, 0, 0, Rr + 16, 7, COL.floorLight); cyl(s, 0, 0, 7, Rr + 8, 5, COL.floor); }));
    if (base === 'radar') s.owner('base', () => radarOverlay(s, 12, Rr));
    z0 = 12;
  }
  /* дальние первыми: по сумме x + y центра */
  for (const o of [...objs].sort((p, q) => (p.x + p.y) - (q.x + q.y))) {
    s.group('obj-' + o.role, () => s.owner(o.role, () => s.frame({ k: o.k, at: [o.x, o.y, z0] }, () => MOTIFS[o.motif].draw(s, o.opts))));
  }
  s.meta = { layout: spec.layout, base, objects: objs.map((o) => ({ role: o.role, motif: o.motif, x: o.x, y: o.y, w: o.w, d: o.d, h: o.h })), overlaps };
  return s;
}
