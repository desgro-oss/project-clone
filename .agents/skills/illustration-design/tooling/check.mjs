/* ============================================================
   Автопроверка иллюстраций числами — чтобы слабая модель, не видя картинки, понимала, что не так.

   Растеризатор на чистом Node (сетка ×2 от холста 195×140, правило nonzero, кривые — ломаными).
   Два уровня:
     рисунок (эталоны и наши сцены) — центр и размер рамки, доля закрашенного: пороги — из
       references/check-thresholds.json, его пишет `--calibrate` по 32 эталонам ДС (процентили, не крайние значения:
       эталоны утверждены, но не все одинаково удачны, выбросы выводятся списком, а не размывают пороги);
     сцена (только наши) — палитра и запреты (обводки, градиенты, текст), главный объект заметно крупнее остальных,
       нет слишком мелких объектов, каждый виден, основания не пересекаются.
   Эталоны только читаются.
   ============================================================ */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { STYLE, render } from './lib.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../../../..');
export const ASSETS = path.join(REPO, 'design-system/assets/illustrations');
export const THRESHOLDS_FILE = path.join(HERE, '../references/check-thresholds.json');
export const TILES = ['deals', 'booked-deals', 'calclate-fv', 'cash-flow', 'ckp-pipeline', 'clients', 'corporate-transactions', 'current-depo',
  'dcm-pipeline', 'dcm-potentials', 'ecm-pipeline', 'empty-check', 'empty-folder', 'empty-loading', 'important-deals', 'important-leads', 'kpki-cal',
  'mna-pipeline', 'payment-ib', 'pipeline', 'possible-deals', 'possible-leads', 'potentials-rd', 'qliksense-reports', 'registry', 'reports-1-c',
  'reserve', 'rwa', 'sales-company', 'sales-projects', 'settings', 'tasks'];

const W = 195, Hh = 140, S = 2, GW = W * S, GH = Hh * S;

/* ---------- растеризатор ---------- */
function flatten(segs) {                                  // контур в ломаные, координаты холста × S
  const loops = [];
  let cur = null, start = null;
  for (const sg of segs) {
    if (sg[0] === 'M') { if (cur && cur.length > 2) loops.push(cur); start = [sg[1][0] * S, sg[1][1] * S]; cur = [start]; }
    else if (sg[0] === 'L') cur.push([sg[1][0] * S, sg[1][1] * S]);
    else if (sg[0] === 'C') {
      const a = cur[cur.length - 1], b = [sg[1][0] * S, sg[1][1] * S], c = [sg[2][0] * S, sg[2][1] * S], d = [sg[3][0] * S, sg[3][1] * S];
      for (let i = 1; i <= 10; i++) {
        const t = i / 10, u = 1 - t;
        cur.push([u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0],
          u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1]]);
      }
    } else if (sg[0] === 'Z' && cur && start) cur.push(start);
  }
  if (cur && cur.length > 2) loops.push(cur);
  return loops;
}
function fillLoops(loops, put) {                          // put(индекс пикселя) для точек с ненулевой намоткой
  const edges = [];
  let minY = 1e9, maxY = -1e9;
  for (const lp of loops) for (let i = 0; i < lp.length; i++) {
    const p = lp[i], q = lp[(i + 1) % lp.length];
    if (p[1] === q[1]) continue;
    const dir = q[1] > p[1] ? 1 : -1, [a, b] = dir > 0 ? [p, q] : [q, p];
    edges.push({ x0: a[0], y0: a[1], x1: b[0], y1: b[1], dir });
    minY = Math.min(minY, a[1]); maxY = Math.max(maxY, b[1]);
  }
  for (let j = Math.max(0, Math.floor(minY)); j <= Math.min(GH - 1, Math.ceil(maxY)); j++) {
    const y = j + 0.5, xs = [];
    for (const e of edges) if (e.y0 <= y && y < e.y1) xs.push([e.x0 + ((y - e.y0) * (e.x1 - e.x0)) / (e.y1 - e.y0), e.dir]);
    xs.sort((p, q) => p[0] - q[0]);
    let w = 0;
    for (let k = 0; k < xs.length - 1; k++) {
      w += xs[k][1];
      if (w === 0) continue;
      const i0 = Math.max(0, Math.ceil(xs[k][0] - 0.5)), i1 = Math.min(GW - 1, Math.floor(xs[k + 1][0] - 0.5));
      for (let i = i0; i <= i1; i++) put(j * GW + i);
    }
  }
}
/* items: [{ segs, opacity, o? }] в координатах холста; owners — список имён владельцев → индекс в own */
function paint(items, owners = []) {
  const cov = new Uint8Array(GW * GH), own = new Int16Array(GW * GH).fill(-1);
  for (const it of items) {
    const idx = it.o == null ? -2 : owners.indexOf(it.o), opaque = (it.opacity ?? 1) >= 0.99;
    fillLoops(flatten(it.segs), (p) => { cov[p] = 1; if (opaque) own[p] = idx; });
  }
  return { cov, own };
}
function metricsOf(cov) {
  let x0 = GW, y0 = GH, x1 = -1, y1 = -1, n = 0;
  for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) if (cov[j * GW + i]) { n++; if (i < x0) x0 = i; if (i > x1) x1 = i; if (j < y0) y0 = j; if (j > y1) y1 = j; }
  if (!n) return { empty: true, w: 0, h: 0, cx: 0, cy: 0, fill: 0 };
  return { empty: false, w: (x1 - x0 + 1) / S, h: (y1 - y0 + 1) / S, cx: (x0 + x1 + 1) / 2 / S, cy: (y0 + y1 + 1) / 2 / S, fill: n / (GW * GH) };
}

/* площадь (px²) и рамка контуров в координатах холста; для размеров мотивов в раскладке */
export function measureItems(items) {
  const { cov } = paint(items);
  let x0 = GW, y0 = GH, x1 = -1, y1 = -1, n = 0;
  for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) if (cov[j * GW + i]) { n++; if (i < x0) x0 = i; if (i > x1) x1 = i; if (j < y0) y0 = j; if (j > y1) y1 = j; }
  return { area: n / (S * S), bbox: n ? [x0 / S, y0 / S, (x1 + 1) / S, (y1 + 1) / S] : [0, 0, 0, 0] };
}

/* ---------- разбор SVG эталонов (только то, что в них встречается: M L C Z, rect, polygon, translate/matrix) ---------- */
const IDENT = [1, 0, 0, 1, 0, 0];
const mul = (m, n) => [m[0] * n[0] + m[2] * n[1], m[1] * n[0] + m[3] * n[1], m[0] * n[2] + m[2] * n[3], m[1] * n[2] + m[3] * n[3],
  m[0] * n[4] + m[2] * n[5] + m[4], m[1] * n[4] + m[3] * n[5] + m[5]];
const apply = (m, p) => [m[0] * p[0] + m[2] * p[1] + m[4], m[1] * p[0] + m[3] * p[1] + m[5]];
function parseTransform(str) {
  let m = IDENT;
  for (const t of (str || '').matchAll(/(\w+)\(([^)]*)\)/g)) {
    const n = t[2].split(/[\s,]+/).filter(Boolean).map(Number);
    if (t[1] === 'translate') m = mul(m, [1, 0, 0, 1, n[0], n[1] || 0]);
    else if (t[1] === 'matrix' && n.length === 6) m = mul(m, n);
    else if (t[1] === 'scale') m = mul(m, [n[0], 0, 0, n[1] ?? n[0], 0, 0]);
  }
  return m;
}
function parseAttrs(str) {
  const a = {};
  for (const m of str.matchAll(/([\w:-]+)\s*=\s*("([^"]*)"|'([^']*)')/g)) a[m[1]] = m[3] ?? m[4];
  return a;
}
function pathSegs(d, tr) {
  const t = d.match(/[A-Za-z]|-?\d*\.?\d+(?:e-?\d+)?/g) || [];
  const segs = [], P = (x, y) => apply(tr, [x, y]);
  let i = 0, cmd = '', x = 0, y = 0, sx = 0, sy = 0;
  const num = () => +t[i++];
  while (i < t.length) {
    if (/[A-Za-z]/.test(t[i])) cmd = t[i++];
    if (cmd === 'M') { x = num(); y = num(); sx = x; sy = y; segs.push(['M', P(x, y)]); cmd = 'L'; }
    else if (cmd === 'L') { x = num(); y = num(); segs.push(['L', P(x, y)]); }
    else if (cmd === 'H') { x = num(); segs.push(['L', P(x, y)]); }
    else if (cmd === 'V') { y = num(); segs.push(['L', P(x, y)]); }
    else if (cmd === 'C') { const a = [num(), num()], b = [num(), num()], c = [num(), num()]; segs.push(['C', P(...a), P(...b), P(...c)]); x = c[0]; y = c[1]; }
    else if (cmd === 'Z' || cmd === 'z') { segs.push(['Z']); x = sx; y = sy; cmd = ''; }
    else throw new Error('команда пути ' + cmd + ' не поддерживается разбором эталонов');
  }
  return segs;
}
export function parseSvgItems(text) {
  const vb = (text.match(/viewBox="([^"]+)"/) || [])[1]?.split(/[\s,]+/).map(Number) || [0, 0, W, Hh];
  const base = [W / vb[2], 0, 0, Hh / vb[3], -vb[0] * W / vb[2], -vb[1] * Hh / vb[3]];
  const items = [], stack = [];
  for (const m of text.matchAll(/<(\/?)([a-zA-Z][\w:-]*)([^>]*?)(\/?)>/g)) {
    const [, close, tag, attrStr, selfClose] = m;
    if (close) { stack.pop(); continue; }
    const at = parseAttrs(attrStr), par = stack[stack.length - 1] || { tr: base, op: 1, fill: null, skip: false };
    const tr = mul(par.tr, parseTransform(at.transform)), op = par.op * (at.opacity != null ? +at.opacity : 1);
    const fill = at.fill ?? par.fill, skip = par.skip || ['defs', 'mask', 'clipPath'].includes(tag);
    if (!skip && fill && fill !== 'none') {
      const o = op * (at['fill-opacity'] != null ? +at['fill-opacity'] : 1);
      let segs = null;
      if (tag === 'path' && at.d) segs = pathSegs(at.d, tr);
      else if (tag === 'rect') {
        const x = +(at.x || 0), y = +(at.y || 0), w = +at.width, h = +at.height;
        if (!(w >= 190 && h >= 135)) segs = [['M', apply(tr, [x, y])], ['L', apply(tr, [x + w, y])], ['L', apply(tr, [x + w, y + h])], ['L', apply(tr, [x, y + h])], ['Z']];
      } else if (tag === 'polygon' && at.points) {
        const n = at.points.split(/[\s,]+/).filter(Boolean).map(Number);
        segs = n.reduce((acc, v, i) => { if (i % 2 === 0) acc.push([acc.length ? 'L' : 'M', apply(tr, [v, n[i + 1]])]); return acc; }, []).concat([['Z']]);
      }
      if (segs && o > 0) items.push({ segs, opacity: o, fill });
    }
    if (!selfClose) stack.push({ tr, op, fill, skip });
  }
  return items;
}
export function measureSvgText(text) { return metricsOf(paint(parseSvgItems(text)).cov); }

/* ---------- пороги ---------- */
const DEFAULTS = {
  image: { cx: { min: 78, max: 112 }, cy: { min: 64, max: 88 }, w: { min: 105, max: 190 }, h: { min: 90, max: 140 }, fill: { min: 0.1, max: 0.45 } },
  scene: { heroRatio: 1.5, minObjectShare: 0.05, minVisible: 0.5, maxObjects: 3 },
};
export function loadThresholds() {
  if (!fs.existsSync(THRESHOLDS_FILE)) return DEFAULTS;
  const j = JSON.parse(fs.readFileSync(THRESHOLDS_FILE, 'utf8'));
  return { image: j.image, scene: { ...DEFAULTS.scene, ...j.scene } };
}

/* ---------- проверка сцены ---------- */
const ALLOWED = new Set([...Object.values(STYLE.palette.light).map((v) => v.hex), ...Object.keys(STYLE.palette.mapLightToDark), '#FFFFFF']);
const pct = (v) => (v * 100).toFixed(1) + ' %';
const rng = (r) => `${r.min.toFixed(r.max < 1 ? 2 : 0)}…${r.max.toFixed(r.max < 1 ? 2 : 0)}`;

/* hasBase — у сцены есть основание (плита, диск): оно само закрашено, поэтому нижняя граница доли не проверяется,
   а верхняя — общая (не забито до отказа) */
const FILL_MAX_WITH_BASE = 0.7;
export function checkImage(m, thr, out, hasBase = false) {
  const rows = [['cx', 'центр по x', m.cx], ['cy', 'центр по y', m.cy], ['w', 'ширина рисунка', m.w], ['h', 'высота рисунка', m.h], ['fill', 'доля закрашенного', m.fill]];
  for (const [k, label, v] of rows) {
    const r = k === 'fill' && hasBase ? { min: 0, max: FILL_MAX_WITH_BASE } : thr.image[k], ok = v >= r.min && v <= r.max;
    out.push({ id: 'image.' + k, ok, msg: `${label}: ${k === 'fill' ? pct(v) : v.toFixed(1)}, допустимо ${k === 'fill' ? pct(r.min) + '…' + pct(r.max) : rng(r)}${k === 'fill' && hasBase ? ' (у сцены с основанием — только верхняя граница)' : ''}` });
  }
}

/* scene — Scene (с meta или без), rendered — результат render(): { svg, placed } */
export function checkScene(scene, rendered, thr = loadThresholds()) {
  const out = [];
  const bad = [...new Set(rendered.placed.map((i) => i.fill))].filter((c) => !ALLOWED.has(c));
  out.push({ id: 'palette', ok: !bad.length, msg: bad.length ? 'цвета вне палитры стиля: ' + bad.join(', ') : 'только цвета палитры' });
  const forb = (rendered.svg.match(/stroke|Gradient|<filter|<text|<image|currentColor/g) || []);
  out.push({ id: 'forbidden', ok: !forb.length, msg: forb.length ? 'запрещено стилем: ' + [...new Set(forb)].join(', ') : 'нет обводок, градиентов, фильтров, текста' });

  const roles = scene.meta ? scene.meta.objects.map((o) => o.role) : [];
  const all = paint(rendered.placed, [...roles, 'base']);
  const base = scene.meta ? scene.meta.base : scene.baseHint;      // baseHint — у утверждённых сцен кодом, их тема знает основание
  checkImage(metricsOf(all.cov), thr, out, !!base && base !== 'none');
  if (scene.meta) {
    out.push({ id: 'overlap', ok: !scene.meta.overlaps.length, msg: scene.meta.overlaps.length ? 'основания пересекаются: ' + scene.meta.overlaps.join('; ') : 'основания объектов не пересекаются' });
    out.push({ id: 'count', ok: roles.length <= thr.scene.maxObjects, msg: `объектов: ${roles.length}, не больше ${thr.scene.maxObjects}` });
    const vis = {}, alone = {};
    roles.forEach((r, i) => {
      let v = 0; for (let p = 0; p < all.own.length; p++) if (all.own[p] === i) v++;
      const solo = paint(rendered.placed.filter((it) => it.o === r && it.opacity >= 0.99), [r]); let a = 0;
      for (let p = 0; p < solo.own.length; p++) if (solo.own[p] === 0) a++;
      vis[r] = v; alone[r] = a;
    });
    const total = roles.reduce((s, r) => s + vis[r], 0) || 1;
    for (const r of roles) {
      const share = vis[r] / total, seen = alone[r] ? vis[r] / alone[r] : 0;
      out.push({ id: 'share.' + r, ok: share >= thr.scene.minObjectShare, msg: `объект ${r}: ${pct(share)} видимой площади объектов, не меньше ${pct(thr.scene.minObjectShare)}` });
      out.push({ id: 'visible.' + r, ok: seen >= thr.scene.minVisible, msg: `объект ${r}: виден на ${pct(seen)}, не меньше ${pct(thr.scene.minVisible)} (остальное закрыто соседями)` });
    }
    if (roles.length > 1) {
      const others = roles.filter((r) => r !== 'hero'), top = Math.max(...others.map((r) => vis[r]));
      const ratio = top ? vis.hero / top : Infinity;
      out.push({ id: 'hero', ok: ratio >= thr.scene.heroRatio, msg: `главный объект крупнее соседа в ${ratio === Infinity ? '∞' : ratio.toFixed(2)} раза, нужно не меньше ${thr.scene.heroRatio}` });
    }
  }
  return { results: out, ok: out.every((r) => r.ok) };
}

/* Рендер сцены из описания: вписать в холст, но не раздувать — если рисунок закрашивает больше TARGET_FILL кадра,
   масштаб уменьшается (одиночные плоские предметы — шестерня, лоток — иначе заполняют всю ширину, у эталонов ДС 28–53 %).
   Сцены с основанием (плита, диск) не трогаем: основание само закрашено. Утверждённые сцены кодом идут через render() как были. */
const TARGET_FILL = 0.42;
export function renderBalanced(scene) {
  const r0 = render(scene);
  if (!scene.meta || scene.meta.base !== 'none') return r0;
  const fill = metricsOf(paint(r0.placed).cov).fill;
  return fill > TARGET_FILL ? render(scene, { maxScale: r0.scale * Math.sqrt(TARGET_FILL / fill) }) : r0;
}

/* ---------- эталоны ---------- */
export function measureReferences() {
  return TILES.map((name) => ({ name, ...measureSvgText(fs.readFileSync(path.join(ASSETS, name + '.svg'), 'utf8')) }));
}
const q = (arr, p) => { const a = [...arr].sort((x, y) => x - y); const i = (a.length - 1) * p, l = Math.floor(i); return a[l] + (a[Math.min(l + 1, a.length - 1)] - a[l]) * (i - l); };

/* пороги: p5…p95 по эталонам, расширенные на 25 % размаха; выбросы — вне порогов */
export function calibrate() {
  const refs = measureReferences();
  const image = {};
  for (const k of ['cx', 'cy', 'w', 'h', 'fill']) {
    const v = refs.map((r) => r[k]), lo = q(v, 0.05), hi = q(v, 0.95), pad = (hi - lo) * 0.25;
    image[k] = { min: +(lo - pad).toFixed(3), max: +(hi + pad).toFixed(3) };
  }
  const outliers = refs.filter((r) => ['cx', 'cy', 'w', 'h', 'fill'].some((k) => r[k] < image[k].min || r[k] > image[k].max))
    .map((r) => `${r.name}: ` + ['cx', 'cy', 'w', 'h', 'fill'].filter((k) => r[k] < image[k].min || r[k] > image[k].max).map((k) => `${k}=${(+r[k]).toFixed(k === 'fill' ? 3 : 1)}`).join(', '));
  const json = { calibratedOn: refs.length, note: 'генерат `illustration-gen.mjs --calibrate`; пороги — процентили эталонов ДС p5…p95 + 25 % размаха, руками не править',
    image, scene: { ...DEFAULTS.scene }, outliers,
    refs: Object.fromEntries(refs.map((r) => [r.name, { cx: +r.cx.toFixed(1), cy: +r.cy.toFixed(1), w: +r.w.toFixed(1), h: +r.h.toFixed(1), fill: +r.fill.toFixed(3) }])) };
  fs.writeFileSync(THRESHOLDS_FILE, JSON.stringify(json, null, 2) + '\n');
  return { refs, json };
}
