/* ============================================================
   ПАНЕЛЬ ПРОТОТИПА — инспектор вёрстки Devmode (dev-inspect.js, RE0030, Э4).

   Работает вместе с масштабом (dev-zoom.js): включается и выключается вместе с
   Devmode. Пять инструментов (тулбар — dev-toolbar.js, клавиши V H G M C):
     Inspect — клики не доходят до страницы, а выбирают элемент; удержание Shift
       временно возвращает обычное взаимодействие (открыть меню, перейти в нужное
       состояние);
     Hand — перемещение кадра, слой показывает только выбранное;
     Guides — Inspect плюс линии от краёв наведённого элемента через всю область;
     Measure — Inspect плюс расстояние от выбранного до наведённого без Alt;
     Columns — Inspect плюс колонки сетки ДС (.grid12, .tile-row), в которой лежит элемент:
       с номерами, занятые элементом подсвечены.

   На странице рисуется свой слой .pp-insp (корень документа, вне тела
   страницы: масштаб на него не действует, координаты — в окне):
     наведение — рамка и зоны margin / border / padding / content с числами,
       ярлык с именем и плашка «W × H» с режимом по каждой оси;
     выбор — то же для выбранного, зазоры (gap) flex / grid, красные линии
       расстояний до соседей и родителя; с зажатым Alt (в Measure — всегда) — до
       элемента под курсором;
     оверлей раскладки — дорожки grid (в том числе колонки сетки ДС .grid12) и
       блоки детей flex; линейки сверху и слева с подсветкой диапазона и
       перекрестием за курсором.
   Подсказки (dev-tip.js) цепляются к слою тремя входами: onDraw (перерисовка), onPick (клик по
   элементу), sig / count (подпись кадра и число карточек); Esc сначала снимает карточки.
   Клавиши при выбранном элементе: ↑ родитель, ↓ первый ребёнок, ← → соседи
   (Tab / Shift+Tab — сосед, Enter / Shift+Enter — ребёнок / родитель), Esc — снять.
   Измерения — dev-measure.js, панель с крошками и переключателями — dev-pane.js.
   Тексты — strings.js. Имена компонентов — dev-ds.js, токены — dev-tokens.js (Э5); состояний (Э6) нет.
   ============================================================ */
(function () {
  'use strict';
  var PP = window.ProtoPanel;
  var M = PP && PP._measure;
  if (!PP || !PP._zoom || !PP._strings || !M) return;
  var t = PP._strings.t;
  var store = PP._store;
  var K_OPTS = 'pp.devOpts';

  var TOOLS = ['inspect', 'hand', 'guides', 'measure', 'columns'];
  var on = false, bound = false, tool = 'inspect', opts = { rulers: false, layout: false, tips: true };
  var sel = null, hov = null, alt = false, shift = false, cursor = null;
  var root = null, layer = null, rulerX = null, rulerY = null, corner = null;
  var raf = 0, last = '', subs = [], drawSubs = [], pickSubs = [];

  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function px(v) { return Math.round(v * 100) / 100; }
  function typing(n) { return !!(n && n.closest && n.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"], [role="textbox"]')); }
  function live() { return on; }
  /** Выбирают и наводят в Inspect, Guides, Measure, Columns; в Hand клики уходят на перемещение кадра. */
  function picking() { return on && (tool === 'inspect' || tool === 'guides' || tool === 'measure' || tool === 'columns'); }
  /** С зажатым Shift клик идёт на страницу (меню, переход в нужное состояние). */
  function interactive() { return picking() && !shift; }

  function tip() { return PP._tip || null; }
  function fire(what) { subs.forEach(function (fn) { try { fn(what); } catch (e) { /* слушатель панели не должен ломать инспектор */ } }); }
  function saveOpts() { try { store.session.set(K_OPTS, { tool: tool, rulers: opts.rulers, layout: opts.layout, tips: opts.tips }); } catch (e) { /* без хранилища — до перезагрузки */ } }

  /* ---------------- оверлей: разметка ---------------- */

  function at(cls, x, y, w, h, extra) {
    return '<div class="' + cls + '" style="left:' + px(x) + 'px;top:' + px(y) + 'px;width:' + px(w) + 'px;height:' + px(h) + 'px;' + (extra || '') + '"></div>';
  }
  function frame(cls, x, y, w, h, s, z) {
    var bw = [s.t, s.r, s.b, s.l].map(function (v) { return px(Math.max(0, v) * z) + 'px'; }).join(' ');
    return at(cls, x, y, w, h, 'border-width:' + bw + ';');
  }
  function chip(cls, x, y, text) {
    return '<div class="pp-insp__n ds-body-xs ' + cls + '" style="left:' + px(x) + 'px;top:' + px(y) + 'px">' + esc(text) + '</div>';
  }

  /** Кольцо между внешним и внутренним прямоугольниками {l, t, r, b} — до четырёх полос; штриховка у VisBug
      (box-model.element.js) обрезана clip-path, здесь — полосы: так она не ложится на содержимое. */
  function ring(cls, o, i) {
    var h = '', w = o.r - o.l;
    if (i.t > o.t) h += at(cls, o.l, o.t, w, i.t - o.t);
    if (o.b > i.b) h += at(cls, o.l, i.b, w, o.b - i.b);
    if (i.l > o.l) h += at(cls, o.l, i.t, i.l - o.l, i.b - i.t);
    if (o.r > i.r) h += at(cls, i.r, i.t, o.r - i.r, i.b - i.t);
    return h;
  }

  /** Зоны элемента: margin и padding — штриховкой, border — рамкой, content — пунктиром; числа у каждой стороны. */
  function zones(el) {
    var b = M.box(el), r = b.rect, z = b.z, m = b.m, bd = b.b, p = b.p, h = '';
    var any = function (s) { return s.t > 0 || s.r > 0 || s.b > 0 || s.l > 0; };
    var mt = Math.max(0, m.t) * z, mr = Math.max(0, m.r) * z, mb = Math.max(0, m.b) * z, ml = Math.max(0, m.l) * z;
    if (any(m)) h += ring('pp-insp__hm', { l: r.left - ml, t: r.top - mt, r: r.right + mr, b: r.bottom + mb }, { l: r.left, t: r.top, r: r.right, b: r.bottom });
    if (any(bd)) h += frame('pp-insp__b', r.left, r.top, r.width, r.height, bd, z);
    var px0 = r.left + bd.l * z, py0 = r.top + bd.t * z, pw = r.width - (bd.l + bd.r) * z, ph = r.height - (bd.t + bd.b) * z;
    var cl = px0 + p.l * z, ct = py0 + p.t * z, cw = Math.max(0, pw - (p.l + p.r) * z), ch = Math.max(0, ph - (p.t + p.b) * z);
    if (any(p)) h += ring('pp-insp__hp', { l: px0, t: py0, r: px0 + pw, b: py0 + ph }, { l: cl, t: ct, r: cl + cw, b: ct + ch });
    h += at('pp-insp__c', cl, ct, cw, ch);
    var cx = (r.left + r.right) / 2, cy = (r.top + r.bottom) / 2;
    if (m.t > 0) h += chip('pp-insp__n--m', cx, r.top - m.t * z / 2, M.fmt(m.t));
    if (m.b > 0) h += chip('pp-insp__n--m', cx, r.bottom + m.b * z / 2, M.fmt(m.b));
    if (m.l > 0) h += chip('pp-insp__n--m', r.left - m.l * z / 2, cy, M.fmt(m.l));
    if (m.r > 0) h += chip('pp-insp__n--m', r.right + m.r * z / 2, cy, M.fmt(m.r));
    if (p.t > 0) h += chip('pp-insp__n--p', cx, py0 + p.t * z / 2, M.fmt(p.t));
    if (p.b > 0) h += chip('pp-insp__n--p', cx, py0 + ph - p.b * z / 2, M.fmt(p.b));
    if (p.l > 0) h += chip('pp-insp__n--p', px0 + p.l * z / 2, cy, M.fmt(p.l));
    if (p.r > 0) h += chip('pp-insp__n--p', px0 + pw - p.r * z / 2, cy, M.fmt(p.r));
    return h;
  }

  function outline(el, cls) {
    var r = el.getBoundingClientRect();
    return at(cls, r.left, r.top, r.width, r.height);
  }

  /* Знак вида у ярлыка: компонент ДС, виджет, иконка или иллюстрация; у обычного тега знака нет. */
  var KIND_ICON = { ds: 'layer-01', widget: 'layout-grid-01', icon: 'image-01', illu: 'image-01' };
  var iconCache = {};
  function kindIcon(el) {
    var name = KIND_ICON[PP._ds && PP._ds.kind ? PP._ds.kind(el) : ''];
    if (!name || !window.dsIcons || !window.dsIcons.svg) return '';
    if (!(name in iconCache)) iconCache[name] = window.dsIcons.svg(name);
    return iconCache[name] ? '<span class="pp-insp__ico" aria-hidden="true">' + iconCache[name] + '</span>' : '';
  }

  /** Радиус углов в CSS px: «8» или «8 8 0 0»; без скругления — ''. */
  function radiusText(cs) {
    var v = ['borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomRightRadius', 'borderBottomLeftRadius'].map(function (k) { return M.fmt(M.num(cs[k])); });
    if (v.every(function (x) { return x === '0'; })) return '';
    return v.every(function (x) { return x === v[0]; }) ? v[0] : v.join(' ');
  }

  function tag(el, cls) {
    var r = el.getBoundingClientRect();
    return '<div class="pp-insp__tag ds-body-xs ' + cls + '" style="left:' + px(r.left) + 'px;top:' + px(r.top) + 'px">' + kindIcon(el) + '<span>' + esc(M.describe(el)) + '</span></div>';
  }

  /** Ярлык со знаком и именем над элементом и плашка размера в две-три строки под ним: «W Fixed 320», «H Hug 48»,
      «R 8»; не помещаются — внутри. Выбранный — цветом основного, наведённый — приглушённым. */
  function labels(el, area, picked) {
    var b = M.box(el), r = b.rect, s = M.sizing(el), h = '', cls = picked ? '' : ' pp-insp__tag--hover';
    var flipT = r.top < 26, flipB = r.bottom > area.h - 64;
    h += '<div class="pp-insp__tag ds-body-xs' + (flipT ? ' pp-insp__tag--in' : '') + cls + '" style="left:' + px(Math.min(Math.max(r.left, 0), Math.max(0, area.w - 120))) + 'px;top:' + px(r.top) + 'px">' + kindIcon(el) + '<span>' + esc(M.describe(el)) + '</span></div>';
    var rad = radiusText(b.cs);
    var txt = '<span>W</span><span>' + esc(t('insp.' + s.w)) + '</span><span>' + esc(M.fmt(b.w)) + '</span>'
      + '<span>H</span><span>' + esc(t('insp.' + s.h)) + '</span><span>' + esc(M.fmt(b.h)) + '</span>'
      + (rad ? '<span>R</span><span></span><span>' + esc(rad) + '</span>' : '');
    h += '<div class="pp-insp__size ds-body-xs' + (flipB ? ' pp-insp__size--in' : '') + cls + '" style="left:' + px((r.left + r.right) / 2) + 'px;top:' + px(r.bottom) + 'px">' + txt + '</div>';
    return h;
  }

  function lines(list, z) {
    var h = '';
    list.forEach(function (s) {
      var horiz = Math.abs(s.y2 - s.y1) < 0.01;
      h += at('pp-insp__line pp-insp__line--' + (horiz ? 'h' : 'v'), s.x1, s.y1, s.x2 - s.x1, s.y2 - s.y1);
      h += chip('pp-insp__n--d', (s.x1 + s.x2) / 2, (s.y1 + s.y2) / 2, M.fmt(s.v / z));
    });
    return h;
  }

  /** Колоночная сетка, в которой лежит элемент: сам элемент или ближайший предок — .grid12, ряд тайлов .tile-row
      (оба — 12 колонок ДС) или любой grid с двенадцатью и более колонками. */
  function gridOf(el) {
    for (var n = el; n && n.nodeType === 1; n = n.parentElement) {
      if (n.classList && (n.classList.contains('grid12') || n.classList.contains('tile-row'))) return n;
      var cs = getComputedStyle(n);
      if (/grid/.test(cs.display) && cs.gridTemplateColumns.split(/\s+/).length >= 12) return n;
    }
    return null;
  }

  /** Колонки сетки: полосы на высоту сетки с номерами сверху; колонки, которые занимает элемент (прямой ребёнок
      сетки на пути к нему), подсвечены, под номерами — «Columns 1–3 · 3 of 12» и пара col-N / colw-N блока. */
  function columns(el) {
    var g = gridOf(el);
    var tr = g ? M.tracks(g) : null;
    if (!tr || !tr.cols.length) return '';
    var b = M.box(g), r = b.rect, z = b.z, h = '', n = tr.cols.length;
    var top = r.top + (b.b.t + b.p.t) * z, ch = r.height - (b.b.t + b.b.b + b.p.t + b.p.b) * z;
    var item = el === g ? null : el;
    while (item && item.parentElement !== g) item = item.parentElement;
    var ir = item ? item.getBoundingClientRect() : null, first = -1, last = -1, y = Math.max(top, 0) + 9;
    tr.cols.forEach(function (c, i) {
      var on = !!ir && ir.right > c[0] + 1 && ir.left < c[1] - 1;
      if (on) { if (first < 0) first = i; last = i; }
      h += at('pp-insp__col' + (on ? ' pp-insp__col--on' : ''), c[0], top, c[1] - c[0], ch)
        + chip('pp-insp__n--c' + (on ? '' : ' pp-insp__n--off'), (c[0] + c[1]) / 2, y, String(i + 1));
    });
    if (first >= 0) {
      var pair = (Array.prototype.filter.call(item.classList, function (c) { return /^(col|colw)-\d+$/.test(c); })).join(' / ');
      var txt = (first === last ? t('cols.one', { a: first + 1, n: n }) : t('cols.span', { a: first + 1, b: last + 1, k: last - first + 1, n: n })) + (pair ? ' · ' + pair : '');
      h += chip('pp-insp__n--c', (tr.cols[first][0] + tr.cols[last][1]) / 2, y + 20, txt);
    }
    return h;
  }

  /** Направляющие: от краёв прямоугольника через всю область (у VisBug — gridlines.element.js). */
  function guides(r, ar) {
    return at('pp-insp__guide pp-insp__guide--v', r.left, 0, 0, ar.h) + at('pp-insp__guide pp-insp__guide--v', r.right, 0, 0, ar.h)
      + at('pp-insp__guide pp-insp__guide--h', 0, r.top, ar.w, 0) + at('pp-insp__guide pp-insp__guide--h', 0, r.bottom, ar.w, 0);
  }

  function gapStrips(el) {
    var h = '';
    M.gaps(el).forEach(function (g) {
      h += at('pp-insp__gap', g.x, g.y, g.w, g.h) + chip('pp-insp__n--g', g.x + g.w / 2, g.y + g.h / 2, M.fmt(g.v));
    });
    return h;
  }

  /** Оверлей раскладки: дорожки grid и блоки детей flex. */
  function layoutOverlay(el) {
    var cs = getComputedStyle(el), h = '', b = M.box(el), r = b.rect, z = b.z;
    var top = r.top + (b.b.t + b.p.t) * z, left = r.left + (b.b.l + b.p.l) * z;
    var cw = r.width - (b.b.l + b.b.r + b.p.l + b.p.r) * z, ch = r.height - (b.b.t + b.b.b + b.p.t + b.p.b) * z;
    if (/grid/.test(cs.display)) {
      var tr = M.tracks(el);
      tr.cols.forEach(function (c) { h += at('pp-insp__track', c[0], top, c[1] - c[0], ch); });
      tr.rows.forEach(function (c) { h += at('pp-insp__track', left, c[0], cw, c[1] - c[0]); });
    } else if (/flex/.test(cs.display)) {
      h += at('pp-insp__track', left, top, cw, ch);
      for (var i = 0; i < el.children.length && i < 120; i++) if (M.visible(el.children[i])) h += outline(el.children[i], 'pp-insp__item');
    }
    return h;
  }

  /* ---------------- оверлей: линейки ---------------- */

  var STEPS = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000];

  function drawRuler(cv, axis) {
    var w = cv.clientWidth, h = cv.clientHeight;
    if (!w || !h) return;
    var dpr = window.devicePixelRatio || 1;
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
    var g = cv.getContext('2d'), cs = getComputedStyle(cv);
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, w, h);
    g.fillStyle = cs.backgroundColor; g.fillRect(0, 0, w, h);
    var z = M.scale(), bodyR = document.body.getBoundingClientRect(), cr = cv.getBoundingClientRect();
    var x = axis === 'x';
    var scroll = x ? document.body.scrollLeft : document.body.scrollTop;
    var u0 = ((x ? cr.left - bodyR.left : cr.top - bodyR.top) / z) + scroll;
    var len = x ? w : h, span = len / z;
    var major = STEPS[STEPS.length - 1], i;
    for (i = 0; i < STEPS.length; i++) if (STEPS[i] * z >= 64) { major = STEPS[i]; break; }
    var minor = major / 10;
    g.font = cs.fontSize + ' ' + cs.fontFamily;
    g.textBaseline = 'top';
    var ink = cs.color, hi = cs.borderTopColor;
    var mark = tool === 'guides' && hov && hov.isConnected ? hov : sel;
    if (mark && mark.isConnected) {
      var sr = mark.getBoundingClientRect();
      var a = ((x ? sr.left - cr.left : sr.top - cr.top)), bb = ((x ? sr.right - cr.left : sr.bottom - cr.top));
      g.globalAlpha = 0.25; g.fillStyle = hi;
      if (x) g.fillRect(a, 0, bb - a, h); else g.fillRect(0, a, w, bb - a);
      g.globalAlpha = 1;
    }
    g.strokeStyle = ink; g.fillStyle = ink; g.lineWidth = 1;
    var from = Math.floor(u0 / minor) * minor;
    for (var u = from; u <= u0 + span + minor; u += minor) {
      var p = (u - u0) * z;
      var isMajor = Math.abs(u / major - Math.round(u / major)) < 1e-6;
      var isHalf = Math.abs(u / (major / 2) - Math.round(u / (major / 2))) < 1e-6;
      if (!isMajor && minor * z < 5) continue;
      var tick = isMajor ? (x ? h : w) : isHalf ? (x ? h : w) * 0.5 : (x ? h : w) * 0.28;
      g.beginPath();
      if (x) { g.moveTo(p + 0.5, h); g.lineTo(p + 0.5, h - tick); } else { g.moveTo(w, p + 0.5); g.lineTo(w - tick, p + 0.5); }
      g.stroke();
      if (isMajor) {
        if (x) g.fillText(String(Math.round(u)), p + 3, 2);
        else { g.save(); g.translate(2, p - 3); g.rotate(-Math.PI / 2); g.fillText(String(Math.round(u)), 0, 0); g.restore(); }
      }
    }
    if (mark && mark.isConnected) {
      var q = mark.getBoundingClientRect();
      g.fillStyle = hi; g.strokeStyle = hi;
      [x ? q.left - cr.left : q.top - cr.top, x ? q.right - cr.left : q.bottom - cr.top].forEach(function (p2) {
        g.beginPath();
        if (x) { g.moveTo(p2 + 0.5, 0); g.lineTo(p2 + 0.5, h); } else { g.moveTo(0, p2 + 0.5); g.lineTo(w, p2 + 0.5); }
        g.stroke();
      });
    }
    if (cursor) {   // перекрестие идёт за курсором (у Screen Ruler так же)
      var c = (x ? cursor.x - cr.left : cursor.y - cr.top);
      if (c >= 0 && c <= (x ? w : h)) {
        var cross = cs.getPropertyValue('--pp-ruler-cross').trim() || ink;
        g.strokeStyle = cross;
        g.beginPath();
        if (x) { g.moveTo(c + 0.5, 0); g.lineTo(c + 0.5, h); } else { g.moveTo(0, c + 0.5); g.lineTo(w, c + 0.5); }
        g.stroke();
        /* число у бегунка: где курсор на линейке, в CSS px страницы */
        var val = String(Math.round(u0 + c / z)), tw = Math.ceil(g.measureText(val).width) + 8;
        g.fillStyle = cross;
        if (x) {
          var lx = Math.min(Math.max(c - tw / 2, 0), w - tw);
          g.fillRect(lx, 0, tw, h);
          g.fillStyle = cs.getPropertyValue('--pp-ruler-cross-ink').trim() || '#fff';
          g.fillText(val, lx + 4, 2);
        } else {
          var ty = Math.min(Math.max(c - tw / 2, 0), h - tw);
          g.fillRect(0, ty, w, tw);
          g.fillStyle = cs.getPropertyValue('--pp-ruler-cross-ink').trim() || '#fff';
          g.save(); g.translate(2, ty + tw - 4); g.rotate(-Math.PI / 2); g.fillText(val, 0, 0); g.restore();
        }
      }
    }
  }

  /* ---------------- оверлей: сборка ---------------- */

  function area() {
    var r = root.getBoundingClientRect();
    return { w: r.width, h: r.height };
  }

  function draw() {
    if (!root) return;
    var show = live();
    root.hidden = !show;
    if (!show) { layer.innerHTML = ''; return; }
    if (sel && !sel.isConnected) { sel = null; fire('select'); }
    var h = '', z = M.scale(), ar = area();
    var hv = interactive() && hov && hov.isConnected && hov !== sel ? hov : null;
    var main = sel || hv;
    var under = hov && hov.isConnected && interactive() ? hov : sel;   // под курсором, а без наведения — выбранный
    if (tool === 'guides' && under) h += guides(under.getBoundingClientRect(), ar);
    if (tool === 'columns' && under) h += columns(under);
    if (main) {
      h += zones(main);
      if (opts.layout) h += layoutOverlay(main);
      h += gapStrips(main);
    }
    if (sel) h += outline(sel, 'pp-insp__sel');
    else if (hv) h += outline(hv, 'pp-insp__hover');
    if (sel && hv) h += outline(hv, 'pp-insp__hover') + tag(hv, 'pp-insp__tag--hover');
    if (sel) {
      if ((alt || tool === 'measure') && hv) h += lines(M.between(sel.getBoundingClientRect(), hv.getBoundingClientRect()), z);
      else h += lines(M.relations(sel), z);
    }
    if (main) h += labels(main, ar, !!sel);   // ярлык и плашка — поверх линий
    layer.innerHTML = h;
    rulerX.hidden = rulerY.hidden = corner.hidden = !opts.rulers;
    if (opts.rulers) { drawRuler(rulerX, 'x'); drawRuler(rulerY, 'y'); }
    drawSubs.forEach(function (fn) { try { fn(); } catch (e) { /* карточки не должны ломать слой */ } });
  }

  function rectSig(n) { if (!n || !n.isConnected) return '-'; var r = n.getBoundingClientRect(); return [r.left, r.top, r.width, r.height].map(function (v) { return Math.round(v * 10); }).join(','); }
  function signature() {
    var cur = cursor && (opts.rulers || tool === 'guides') ? Math.round(cursor.x) + ',' + Math.round(cursor.y) : '';
    return [tool, shift, alt, opts.rulers, opts.layout, opts.tips, tip() ? tip().sig() : '', M.scale(), rectSig(sel), rectSig(hov), cur, document.body.scrollLeft, document.body.scrollTop, root ? root.clientWidth + 'x' + root.clientHeight : ''].join('|');
  }

  function tick() {
    raf = 0;
    if (!on) return;
    var s = signature();
    if (s !== last) { last = s; draw(); }
    if (sel || hov || (tip() && tip().count())) raf = requestAnimationFrame(tick);
  }
  function wake() { last = ''; if (on && !raf) raf = requestAnimationFrame(tick); }

  function buildRoot() {
    root = document.createElement('div');
    root.className = 'pp-insp';
    if (PP._ui && PP._ui.themed) PP._ui.themed(root); else root.setAttribute('data-theme', 'service');
    root.setAttribute('aria-hidden', 'true');
    root.innerHTML = '<div class="pp-insp__layer"></div>'
      + '<canvas class="pp-insp__ruler pp-insp__ruler--x" hidden></canvas>'
      + '<canvas class="pp-insp__ruler pp-insp__ruler--y" hidden></canvas>'
      + '<div class="pp-insp__corner" hidden></div>';
    document.documentElement.appendChild(root);
    layer = root.firstChild; rulerX = layer.nextSibling; rulerY = rulerX.nextSibling; corner = rulerY.nextSibling;
  }

  /* ---------------- выбор ---------------- */

  function select(el, reveal) {
    if (el && (el === document.documentElement || M.own(el))) el = null;
    if (el === sel) return;
    sel = el || null;
    if (sel && reveal && sel.scrollIntoView) { try { sel.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch (e) { /* без прокрутки */ } }
    wake();
    fire('select');
  }
  function go(dir) {
    var n = sel ? M.nav(sel, dir) : null;
    if (n) select(n, true);
    return !!n;
  }
  function setTool(m) {
    if (TOOLS.indexOf(m) < 0 || tool === m) return;
    tool = m; hov = null; alt = shift = false;
    syncTool();
    saveOpts(); wake(); fire('tool');
  }
  function syncTool() {
    document.documentElement.classList.toggle('pp-inspecting', picking());
    if (PP._zoom.setHand) PP._zoom.setHand(on && tool === 'hand');
  }
  function setOpt(k, v) {
    if (!(k in opts) || opts[k] === !!v) return;
    opts[k] = !!v;
    saveOpts(); wake(); fire('opt');
  }

  /* ---------------- ввод ---------------- */

  function onMove(e) {
    if (!picking()) return;
    if (shift !== e.shiftKey) { shift = e.shiftKey; wake(); }   // Shift отпущен вне окна или нажат до фокуса
    if (opts.rulers || tool === 'guides') { cursor = { x: e.clientX, y: e.clientY }; wake(); }
    if (!interactive()) return;
    var n = e.target && e.target.nodeType === 1 && e.target !== document.documentElement && !M.own(e.target) ? M.target(e.target) : null;
    if (n !== hov) { hov = n; wake(); }
  }

  /* В режиме Inspect клики не доходят до страницы (и до рекордера Fix State): window ловит раньше document. */
  function onBlock(e) {
    if (picking() && shift !== e.shiftKey) { shift = e.shiftKey; wake(); }
    if (!interactive() || e.button !== 0 || M.own(e.target) || PP._zoom.panning()) return;
    e.stopImmediatePropagation();
    if (e.type !== 'pointerdown' && e.type !== 'pointerup') e.preventDefault();
    if (e.type === 'click') {
      /* mousedown погашен, фокус остался на кнопке панели — стрелки ушли бы ей, а не инспектору */
      var f = document.activeElement;
      if (f && f !== document.body && M.own(f) && f.blur) f.blur();
      var picked = M.target(e.target);
      select(picked, false);
      if (picked && picked !== document.documentElement && !M.own(picked)) pickSubs.forEach(function (fn) { try { fn(picked); } catch (err) { /* карточки не должны ломать выбор */ } });
    }
  }

  function onKeyDown(e) {
    if (!live()) return;
    if (e.key === 'Shift') { if (!shift) { shift = true; wake(); } return; }
    if (e.key === 'Alt') { if (!alt) { alt = true; wake(); } if (sel) e.preventDefault(); return; }
    if (e.key === 'Escape' && !e.altKey && !e.ctrlKey && !e.metaKey && !typing(e.target) && tip() && tip().count()) {
      e.preventDefault(); e.stopPropagation(); tip().clear(); return;   // первый Esc снимает карточки, второй — выбор
    }
    if (!sel || e.altKey || e.ctrlKey || e.metaKey || typing(e.target) || M.own(e.target)) return;
    /* Tab и Enter (с Shift — назад и вверх) ходят по дереву, как у VisBug; стрелки — без Shift */
    var dir = e.key === 'Tab' ? (e.shiftKey ? 'prev' : 'next') : e.key === 'Enter' ? (e.shiftKey ? 'parent' : 'child')
      : e.shiftKey ? null : { ArrowUp: 'parent', ArrowDown: 'child', ArrowLeft: 'prev', ArrowRight: 'next' }[e.key];
    if (dir) { e.preventDefault(); e.stopPropagation(); go(dir); }
    else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); select(null); }
  }
  function onKeyUp(e) {
    if (e.key === 'Shift' && shift) { shift = false; wake(); }
    else if (e.key === 'Alt' && alt) { alt = false; wake(); if (sel) e.preventDefault(); }
  }

  function bindInput() {
    window.addEventListener('pointermove', onMove, true);
    ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'click', 'dblclick'].forEach(function (n) { window.addEventListener(n, onBlock, true); });
    window.addEventListener('dragstart', function (e) { if (interactive()) e.preventDefault(); }, true);
    window.addEventListener('keydown', onKeyDown, true);
    window.addEventListener('keyup', onKeyUp, true);
    window.addEventListener('blur', function () { if (shift || alt) { shift = alt = false; wake(); } });
    document.addEventListener('mouseleave', function () { if (hov || cursor) { hov = null; cursor = null; wake(); } });
    window.addEventListener('scroll', function () { if (on) wake(); }, true);
    window.addEventListener('resize', function () { if (on) wake(); });
  }

  /* ---------------- включение ---------------- */

  function enable() {
    if (on) return;
    var saved = store && store.session ? store.session.get(K_OPTS, null) : null;
    if (saved) { tool = TOOLS.indexOf(saved.tool) >= 0 ? saved.tool : 'inspect'; opts.rulers = !!saved.rulers; opts.layout = !!saved.layout; opts.tips = saved.tips !== false; }
    if (!bound) { bindInput(); PP._zoom.onChange(function () { if (on) wake(); }); bound = true; }
    on = true;
    sel = hov = cursor = null; alt = shift = false;
    buildRoot();
    syncTool();
    wake();
  }

  function disable() {
    if (!on) return;
    on = false;
    sel = hov = cursor = null; alt = shift = false;
    if (PP._zoom.setHand) PP._zoom.setHand(false);
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    document.documentElement.classList.remove('pp-inspecting');
    if (root && root.parentNode) root.parentNode.removeChild(root);
    root = layer = rulerX = rulerY = corner = null;
    if (PP._tokens) PP._tokens.dispose();
    fire('select');
  }

  PP._inspect = {
    enable: enable, disable: disable, active: function () { return on; },
    TOOLS: TOOLS, tool: function () { return tool; }, setTool: setTool,
    opts: function () { return { rulers: opts.rulers, layout: opts.layout, tips: opts.tips }; }, setOpt: setOpt,
    selected: function () { return sel; }, select: function (el) { select(el, true); }, go: go,
    hovered: function () { return hov && hov.isConnected ? hov : null; }, interactive: function () { return interactive(); },
    onChange: function (fn) { subs.push(fn); }, onDraw: function (fn) { drawSubs.push(fn); }, onPick: function (fn) { pickSubs.push(fn); }
  };
})();
