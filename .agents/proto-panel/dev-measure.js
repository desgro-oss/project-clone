/* ============================================================
   ПАНЕЛЬ ПРОТОТИПА — измерения для Devmode (dev-measure.js, RE0030, Э4).

   Чистые функции без записи в DOM: коробочная модель элемента, режим размера
   по осям (фиксированный / растягивается / по содержимому), расстояния до
   соседей и родителя и между двумя элементами, крошки предков, устойчивый
   селектор. Рисует и слушает мышь dev-inspect.js, показывает панель — dev-pane.js.

   Координаты getBoundingClientRect() при масштабе страницы — в масштабе
   (тело преобразовано, dev-zoom.js): линии рисуются в них, а числа делятся на
   масштаб (scale()). Отступы и рамки берутся из getComputedStyle — это CSS px
   без масштаба. Имя токена и вычисленные значения — этап Э5.
   ============================================================ */
(function () {
  'use strict';
  var PP = window.ProtoPanel;
  if (!PP) return;

  var SKIP = /^(script|style|template|link|meta|head|noscript|title|base)$/i;
  var OWN = '.pp-root, #pp-drawer, .pp-modal, .pp-zoom, .pp-zbar, .pp-insp, .pp-tips, .pp-probe';

  function num(v) { var n = parseFloat(v); return isFinite(n) ? n : 0; }
  /** Число для показа: до 0,1 px, без хвоста «.0». */
  function fmt(v) { return String(Math.round(v * 10) / 10); }
  function scale() { return PP._zoom && PP._zoom.active() ? PP._zoom.level() || 1 : 1; }
  function own(n) { return !!(n && n.closest && n.closest(OWN)); }

  function sides(cs, pre, post) {
    return { t: num(cs[pre + 'Top' + post]), r: num(cs[pre + 'Right' + post]), b: num(cs[pre + 'Bottom' + post]), l: num(cs[pre + 'Left' + post]) };
  }

  /** Коробочная модель: rect — в координатах окна (в масштабе), m / b / p — margin, border, padding в CSS px. */
  function box(el) {
    var cs = getComputedStyle(el), r = el.getBoundingClientRect(), z = scale();
    return {
      rect: r, z: z, cs: cs,
      m: sides(cs, 'margin', ''), b: sides(cs, 'border', 'Width'), p: sides(cs, 'padding', ''),
      w: r.width / z, h: r.height / z, sizing: cs.boxSizing
    };
  }

  /* ---------------- размер по осям ---------------- */

  /* Объявления размера из таблиц стилей: CSSOM читается не всегда (чужой источник по file://
     закрыт) — тогда остаётся эвристика по вычисленным стилям. Кэш по элементу живёт доли секунды. */
  var cache = typeof WeakMap === 'function' ? new WeakMap() : null;

  function declared(el, prop) {
    var found = el.style && el.style[prop] ? el.style[prop] : '';
    if (found) return found;
    var sheets = document.styleSheets;
    for (var i = 0; i < sheets.length; i++) {
      var rules;
      try { rules = sheets[i].cssRules; } catch (e) { continue; }
      found = scan(rules, el, prop) || found;
    }
    return found;
  }
  function scan(rules, el, prop) {
    var out = '';
    for (var i = 0; i < rules.length; i++) {
      var r = rules[i];
      if (r.selectorText) {
        if (r.style && r.style[prop]) {
          try { if (el.matches(r.selectorText)) out = r.style[prop]; } catch (e) { /* селектор вне поддержки */ }
        }
      } else if (r.cssRules && r.cssRules.length && !r.keyText && (!r.media || window.matchMedia(r.media.mediaText).matches)) {
        out = scan(r.cssRules, el, prop) || out;
      }
    }
    return out;
  }

  /** 'fixed' | 'fill' | 'hug' для оси 'w' | 'h'. */
  function axisMode(el, axis) {
    var prop = axis === 'w' ? 'width' : 'height';
    var cs = getComputedStyle(el);
    var d = declared(el, prop);
    if (d && !/^(auto|initial|unset|revert)$/.test(d)) {
      if (/^(fit-content|max-content|min-content)/.test(d)) return 'hug';
      if (/%|stretch|\bfr\b|\bvw\b|\bvh\b|100cq/.test(d)) return 'fill';
      return 'fixed';
    }
    var par = el.parentElement, pcs = par ? getComputedStyle(par) : null;
    var disp = cs.display;
    if (cs.position === 'absolute' || cs.position === 'fixed') return 'hug';
    if (pcs && /flex/.test(pcs.display)) {
      var row = /^row/.test(pcs.flexDirection);
      var main = (axis === 'w') === row;
      if (main) return num(cs.flexGrow) > 0 ? 'fill' : 'hug';
      var self = cs.alignSelf === 'auto' ? pcs.alignItems : cs.alignSelf;
      return /^(normal|stretch)$/.test(self) ? 'fill' : 'hug';
    }
    if (pcs && /grid/.test(pcs.display)) return 'fill';
    if (/^inline/.test(disp)) return 'hug';
    if (/^(img|svg|input|button|select|textarea|video|canvas)$/i.test(el.tagName)) return 'hug';
    return axis === 'w' ? 'fill' : 'hug';
  }

  function sizing(el) {
    var hit = cache && cache.get(el);
    var now = Date.now();
    if (hit && now - hit.at < 400) return hit.v;
    var v = { w: axisMode(el, 'w'), h: axisMode(el, 'h') };
    if (cache) cache.set(el, { at: now, v: v });
    return v;
  }

  /* ---------------- отношения ---------------- */

  function visible(n) {
    if (!n || n.nodeType !== 1 || SKIP.test(n.tagName) || own(n)) return false;
    var cs = getComputedStyle(n);
    if (cs.display === 'none' || cs.visibility === 'hidden') return false;
    var r = n.getBoundingClientRect();
    return r.width > 0 || r.height > 0;
  }
  function inFlow(n) { var p = getComputedStyle(n).position; return p !== 'absolute' && p !== 'fixed'; }

  function overlap(a1, a2, b1, b2) { return Math.min(a2, b2) - Math.max(a1, b1); }
  function mid(a, b) { return (a + b) / 2; }

  /** Расстояния от выбранного до соседей в потоке и родителя: для каждой стороны — до ближайшего соседа
      в этом направлении, а без него — до края родителя. Линии в координатах окна. */
  function relations(el) {
    var p = el.parentElement, out = [];
    if (!p || el === document.body) return out;
    var r = el.getBoundingClientRect(), pr = p.getBoundingClientRect();
    var rs = [], kids = p.children, i;
    for (i = 0; i < kids.length && i < 400; i++) if (kids[i] !== el && visible(kids[i]) && inFlow(kids[i])) rs.push(kids[i].getBoundingClientRect());
    var tol = 0.5, best;
    function pick(test, key, sign) {
      best = null;
      rs.forEach(function (s) { if (test(s) && (!best || sign * (s[key] - best[key]) > 0)) best = s; });
      return best;
    }
    var L = pick(function (s) { return s.right <= r.left + tol && overlap(s.top, s.bottom, r.top, r.bottom) > 0; }, 'right', 1);
    var R = pick(function (s) { return s.left >= r.right - tol && overlap(s.top, s.bottom, r.top, r.bottom) > 0; }, 'left', -1);
    var T = pick(function (s) { return s.bottom <= r.top + tol && overlap(s.left, s.right, r.left, r.right) > 0; }, 'bottom', 1);
    var B = pick(function (s) { return s.top >= r.bottom - tol && overlap(s.left, s.right, r.left, r.right) > 0; }, 'top', -1);
    var cy = mid(r.top, r.bottom), cx = mid(r.left, r.right);
    function row(s, edge, side) {
      var y = s ? mid(Math.max(r.top, s.top), Math.min(r.bottom, s.bottom)) : cy;
      out.push(side === 'l' ? { x1: edge, y1: y, x2: r.left, y2: y, v: r.left - edge } : { x1: r.right, y1: y, x2: edge, y2: y, v: edge - r.right });
    }
    function col(s, edge, side) {
      var x = s ? mid(Math.max(r.left, s.left), Math.min(r.right, s.right)) : cx;
      out.push(side === 't' ? { x1: x, y1: edge, x2: x, y2: r.top, v: r.top - edge } : { x1: x, y1: r.bottom, x2: x, y2: edge, v: edge - r.bottom });
    }
    row(L, L ? L.right : pr.left, 'l');
    row(R, R ? R.left : pr.right, 'r');
    col(T, T ? T.bottom : pr.top, 't');
    col(B, B ? B.top : pr.bottom, 'b');
    return out.filter(function (s) { return s.v > 0.4; });
  }

  /** Расстояния между двумя прямоугольниками (Alt): разнесены по оси — зазор между ними; пересекаются —
      разница соответствующих краёв. */
  function between(a, b) {
    var out = [];
    var oy = overlap(a.top, a.bottom, b.top, b.bottom);
    var ox = overlap(a.left, a.right, b.left, b.right);
    var cy = oy > 0 ? mid(Math.max(a.top, b.top), Math.min(a.bottom, b.bottom)) : mid(a.top, a.bottom);
    var cx = ox > 0 ? mid(Math.max(a.left, b.left), Math.min(a.right, b.right)) : mid(a.left, a.right);
    function h(x1, x2) { if (Math.abs(x2 - x1) > 0.4) out.push({ x1: Math.min(x1, x2), y1: cy, x2: Math.max(x1, x2), y2: cy, v: Math.abs(x2 - x1) }); }
    function v(y1, y2) { if (Math.abs(y2 - y1) > 0.4) out.push({ x1: cx, y1: Math.min(y1, y2), x2: cx, y2: Math.max(y1, y2), v: Math.abs(y2 - y1) }); }
    if (a.right <= b.left) h(a.right, b.left);
    else if (b.right <= a.left) h(b.right, a.left);
    else { h(a.left, b.left); h(a.right, b.right); }
    if (a.bottom <= b.top) v(a.bottom, b.top);
    else if (b.bottom <= a.top) v(b.bottom, a.top);
    else { v(a.top, b.top); v(a.bottom, b.bottom); }
    return out;
  }

  /** Зазоры (gap) контейнера flex / grid: полосы между соседними детьми, ширина которых равна gap. */
  function gaps(el) {
    var cs = getComputedStyle(el), out = [];
    if (!/flex|grid/.test(cs.display)) return out;
    var cg = num(cs.columnGap), rg = num(cs.rowGap), z = scale();
    if (!cg && !rg) return out;
    var kids = [], i, j;
    for (i = 0; i < el.children.length && kids.length < 80; i++) if (visible(el.children[i]) && inFlow(el.children[i])) kids.push(el.children[i].getBoundingClientRect());
    var tol = 0.6;
    for (i = 0; i < kids.length; i++) {
      for (j = 0; j < kids.length; j++) {
        if (i === j) continue;
        var a = kids[i], b = kids[j];
        var oy = overlap(a.top, a.bottom, b.top, b.bottom), ox = overlap(a.left, a.right, b.left, b.right);
        if (cg && oy > 0 && Math.abs(b.left - a.right - cg * z) < tol) out.push({ x: a.right, y: Math.max(a.top, b.top), w: cg * z, h: oy, v: cg });
        if (rg && ox > 0 && Math.abs(b.top - a.bottom - rg * z) < tol) out.push({ x: Math.max(a.left, b.left), y: a.bottom, w: ox, h: rg * z, v: rg });
      }
    }
    return out;
  }

  /** Дорожки grid: границы колонок и строк в координатах окна (по вычисленным px-значениям). */
  function tracks(el) {
    var cs = getComputedStyle(el);
    if (!/grid/.test(cs.display)) return null;
    var z = scale(), r = el.getBoundingClientRect(), b = box(el);
    function list(v) { return v && v !== 'none' ? v.split(/\s+/).map(num).filter(function (x) { return x > 0; }) : []; }
    function lines(sizes, gap, start) {
      var out = [], at = start;
      sizes.forEach(function (s) { out.push([at, at + s * z]); at += (s + gap) * z; });
      return out;
    }
    return {
      cols: lines(list(cs.gridTemplateColumns), num(cs.columnGap), r.left + (b.b.l + b.p.l) * z),
      rows: lines(list(cs.gridTemplateRows), num(cs.rowGap), r.top + (b.b.t + b.p.t) * z)
    };
  }

  /* ---------------- имена, крошки, навигация ---------------- */

  function classes(el) {
    return Array.prototype.filter.call(el.classList || [], function (c) { return !/^(is-|pp-)/.test(c); });
  }
  /** Короткое имя для ярлыка: виджет, компонент ДС, иконка (dev-ds.js), иначе тег с классами. */
  function describe(el) {
    var named = PP._ds ? PP._ds.name(el) : '';
    if (named) return named;
    var c = classes(el).slice(0, 2);
    return el.tagName.toLowerCase() + (c.length ? '.' + c.join('.') : '');
  }

  /** Что считать целью под курсором: внутри иконки или иллюстрации — сам слот, а не его svg и path. */
  function target(n) {
    if (!n || !n.closest) return n;
    var slot = n.closest('[data-icon], [data-illu]');
    return slot && !own(slot) ? slot : n;
  }

  function crumbs(el) {
    var out = [];
    for (var n = el; n && n.nodeType === 1 && n !== document.documentElement; n = n.parentElement) out.unshift({ el: n, name: describe(n) });
    return out;
  }

  function pickable(n) { return !!n && n.nodeType === 1 && !SKIP.test(n.tagName) && !own(n) && getComputedStyle(n).display !== 'none'; }
  /** Соседний элемент для клавиш: 'parent' | 'child' | 'prev' | 'next'; null — идти некуда. */
  function nav(el, dir) {
    var n;
    if (dir === 'parent') { n = el.parentElement; return n && n !== document.documentElement ? n : null; }
    if (dir === 'child') { for (n = el.firstElementChild; n && !pickable(n); n = n.nextElementSibling); return n; }
    var step = dir === 'prev' ? 'previousElementSibling' : 'nextElementSibling';
    for (n = el[step]; n && !pickable(n); n = n[step]);
    return n;
  }

  function esc(s) { return window.CSS && CSS.escape ? CSS.escape(s) : String(s).replace(/[^\w-]/g, '\\$&'); }
  /** Устойчивый селектор: id, иначе цепочка тегов с классами, пока не станет единственным в документе. */
  function selector(el) {
    var parts = [];
    for (var n = el; n && n.nodeType === 1 && n !== document.documentElement; n = n.parentElement) {
      if (n.id && document.querySelectorAll('#' + esc(n.id)).length === 1) { parts.unshift('#' + esc(n.id)); break; }
      var part = n.tagName.toLowerCase();
      var cls = classes(n).slice(0, 2);
      if (cls.length) part += '.' + cls.map(esc).join('.');
      var p = n.parentElement;
      if (p && n !== document.body) {
        var same = Array.prototype.filter.call(p.children, function (s) { return s.matches(part); });
        if (same.length > 1) part += ':nth-of-type(' + (Array.prototype.filter.call(p.children, function (s) { return s.tagName === n.tagName; }).indexOf(n) + 1) + ')';
      }
      parts.unshift(part);
      if (n === document.body) break;
      try { if (document.querySelectorAll(parts.join(' > ')).length === 1) break; } catch (e) { break; }
    }
    return parts.join(' > ');
  }

  PP._measure = {
    OWN: OWN, num: num, fmt: fmt, scale: scale, own: own, box: box, sizing: sizing, visible: visible,
    relations: relations, between: between, gaps: gaps, tracks: tracks,
    describe: describe, target: target, classes: classes, crumbs: crumbs, nav: nav, pickable: pickable, selector: selector
  };
})();
