/* ============================================================
   ПАНЕЛЬ ПРОТОТИПА — масштаб и перемещение страницы (dev-zoom.js, RE0030, Э3).

   Работает только в Devmode (пункт рельса «Devmode»: выбран и панель открыта). Тело страницы закрепляется
   (ui.js, pinPage) и становится «окном»: кадром размером с видимую область
   рядом с панелью. Масштаб и сдвиг — transform на теле, раскладка внутри
   кадра не меняется: страница видит прежние размеры окна, медиазапросы и
   100% на каркасе ведут себя как обычно. Прокрутка самой страницы — родная,
   внутри кадра.

   Управление:
     Ctrl + колесо, щипок тачпада, жесты Safari — масштаб к точке под курсором;
     зажатое колесо мыши, пробел + перетаскивание — перемещение;
     колесо или два пальца — родная прокрутка страницы, а если страница дальше
       не прокручивается, — перемещение кадра (Alt + колесо — всегда перемещение);
     Ctrl + 0 — 100 %, Shift + 1 — по ширине, Ctrl + «+» / «−» — шаг масштаба
       (масштаб браузера не срабатывает);
     пресеты ширины кадра (1280, 1440, 1920) — панель Devmode, setWidth();
     полосы прокрутки по обеим осям, когда кадр больше видимой области;
     кнопки «−», список процентов, «+», «100 %», «по ширине», выход — правая часть тулбара у нижнего
       края (левую, инструменты, ставит dev-toolbar.js в начало того же узла .pp-zoom, bar());
     инструмент Hand тулбара — перемещение левой кнопкой, пока выбран (setHand).

   Известные ограничения: слои страницы, которые позиционируются по
   getBoundingClientRect() (меню, тултипы ДС, подсветка цели сценария),
   при масштабе, отличном от 100 %, могут смещаться — тело страницы
   преобразовано, а они считают координаты в окне. Тексты — strings.js.
   ============================================================ */
(function () {
  'use strict';
  var PP = window.ProtoPanel;
  if (!PP || !PP._ui || !PP._strings) return;
  var t = PP._strings.t;

  var Z_MIN = 0.25, Z_MAX = 8;
  var STEPS = [0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4, 6, 8];
  var LIST = [0.25, 0.5, 1, 1.5, 2, 4];
  var WHEEL_ZOOM = 0.002;   // ln(масштаба) на единицу deltaY: колесо мыши (100) даёт ≈ ×1,22, щипок — плавно
  var OWN = '.pp-root, #pp-drawer, .pp-modal, .pp-zoom, .pp-zbar, .pp-tips';

  var on = false, z = 1, tx = 0, ty = 0, space = false, hand = false, pan = null, ro = null, subs = [];
  var el = {};

  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }
  function own(n) { return !!(n && n.closest && n.closest(OWN)); }
  function typing(n) { return !!(n && n.closest && n.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"], [role="textbox"]')); }
  /** Кадр — тело страницы без преобразования: offsetWidth/Height его не видят. */
  function frame() { return { w: document.body.offsetWidth, h: document.body.offsetHeight }; }
  /** Видимая область страницы рядом с закреплённой панелью. */
  function paneSize() { return PP._ui.paneSize(); }

  /* ---------------- положение кадра ---------------- */

  /* Кадр меньше области — по центру; больше — не выходит за её края. */
  function limit(v, area, size) { return size <= area ? (area - size) / 2 : clamp(v, area - size, 0); }

  function apply() {
    if (!on) return;
    var f = frame(), p = paneSize();
    tx = limit(tx, p.w, f.w * z);
    ty = limit(ty, p.h, f.h * z);
    var b = document.body;
    b.style.transformOrigin = '0 0';
    b.style.transform = z === 1 && !tx && !ty ? '' : 'translate(' + tx + 'px, ' + ty + 'px) scale(' + z + ')';
    syncUi();
    subs.forEach(function (fn) { try { fn(); } catch (e) { /* слушатель не должен ломать масштаб */ } });
  }

  function zoomAt(nz, cx, cy) {
    nz = clamp(nz, Z_MIN, Z_MAX);
    if (Math.abs(nz - 1) < 0.005) nz = 1;
    var k = nz / z;
    tx = cx - (cx - tx) * k;
    ty = cy - (cy - ty) * k;
    z = nz;
    apply();
  }
  function zoomMid(nz) { var p = paneSize(); zoomAt(nz, p.w / 2, p.h / 2); }
  function stepZoom(dir) {
    var next = null, i;
    if (dir > 0) { for (i = 0; i < STEPS.length; i++) if (STEPS[i] > z + 0.001) { next = STEPS[i]; break; } }
    else { for (i = STEPS.length - 1; i >= 0; i--) if (STEPS[i] < z - 0.001) { next = STEPS[i]; break; } }
    if (next != null) zoomMid(next);
  }
  function reset() { z = 1; tx = 0; ty = 0; apply(); }
  /* По ширине: кадр целиком по ширине области (у кадра шире области — масштаб меньше 100 %). */
  function fit() { z = clamp(paneSize().w / frame().w, Z_MIN, Z_MAX); tx = 0; ty = 0; apply(); }

  /* Ширина кадра: null — по области рядом с панелью, число — пресет окна (CSS px). Меняется только
     ширина кадра; медиазапросы по ширине окна пресета не видят — как и при закреплении панели. */
  var frameW = null;
  function setWidth(px) {
    frameW = px || null;
    var b = document.body;
    b.style.right = frameW ? 'auto' : '';
    b.style.width = frameW ? frameW + 'px' : '';
    tx = 0;
    apply();
    PP._ui.pageResized();
  }
  function panBy(dx, dy) { tx += dx; ty += dy; apply(); }

  /* ---------------- оверлей: кнопки и полосы прокрутки ---------------- */

  function pct(v) { return Math.round(v * 100) + '%'; }

  function buildUi() {
    var box = document.createElement('div');
    box.className = 'pp-zoom';
    if (PP._ui && PP._ui.themed) PP._ui.themed(box); else box.setAttribute('data-theme', 'service');
    box.setAttribute('role', 'group');
    box.setAttribute('aria-label', t('zoom.label'));
    box.innerHTML =
      '<button type="button" class="ibtn ibtn--neutral ibtn--m" data-pp-zoom="out" aria-label="' + esc(t('zoom.out')) + '" data-tooltip="' + esc(t('zoom.outTip')) + '"><i data-icon="minus"></i></button>'
      + '<span class="pp-zoom__pick"><button type="button" class="btn btn--transparent btn--s pp-zoom__val" data-pp-zoom="list" aria-haspopup="true" aria-expanded="false" aria-label="' + esc(t('zoom.pick')) + '"><span class="btn__label"></span></button>'
      + '<div class="pp-zoom__list" role="menu" hidden>' + LIST.map(function (v) {
        return '<button type="button" class="menu__item" role="menuitem" data-pp-zoom-set="' + v + '"><span class="menu__item-label">' + pct(v) + '</span></button>';
      }).join('') + '</div></span>'
      + '<button type="button" class="ibtn ibtn--neutral ibtn--m" data-pp-zoom="in" aria-label="' + esc(t('zoom.in')) + '" data-tooltip="' + esc(t('zoom.inTip')) + '"><i data-icon="add"></i></button>'
      + '<button type="button" class="ibtn ibtn--neutral ibtn--m" data-pp-zoom="reset" aria-label="' + esc(t('zoom.reset')) + '" data-tooltip="' + esc(t('zoom.resetTip')) + '"><i data-icon="maximize"></i></button>'
      + '<button type="button" class="ibtn ibtn--neutral ibtn--m" data-pp-zoom="fit" aria-label="' + esc(t('zoom.fit')) + '" data-tooltip="' + esc(t('zoom.fitTip')) + '"><i data-icon="arrow-left-right"></i></button>'
      + '<span class="pp-zoom__sep" aria-hidden="true"></span>'
      + '<button type="button" class="ibtn ibtn--neutral ibtn--m" data-pp-zoom="exit" aria-label="' + esc(t('zoom.exit')) + '" data-tooltip="' + esc(t('zoom.exitTip')) + '"><i data-icon="close"></i></button>';
    var bx = document.createElement('div');
    bx.className = 'pp-zbar pp-zbar--x';
    bx.innerHTML = '<div class="pp-zbar__thumb"></div>';
    var by = document.createElement('div');
    by.className = 'pp-zbar pp-zbar--y';
    by.innerHTML = '<div class="pp-zbar__thumb"></div>';
    var root = document.documentElement;
    root.appendChild(box);
    root.appendChild(bx);
    root.appendChild(by);
    el.box = box; el.bx = bx; el.by = by;
    el.val = box.querySelector('.pp-zoom__val .btn__label');
    el.list = box.querySelector('.pp-zoom__list');
    el.listBtn = box.querySelector('[data-pp-zoom="list"]');
    PP._ui.wire(box);
    wireBars();
  }

  function destroyUi() {
    [el.box, el.bx, el.by].forEach(function (n) { if (n && n.parentNode) n.parentNode.removeChild(n); });
    el = {};
  }

  function listOpen(open) {
    if (!el.list) return;
    el.list.hidden = !open;
    el.listBtn.setAttribute('aria-expanded', String(open));
  }

  function syncUi() {
    if (!el.box) return;
    el.val.textContent = pct(z);
    var f = frame(), p = paneSize();
    bar(el.bx, 'x', p.w, f.w * z, tx);
    bar(el.by, 'y', p.h, f.h * z, ty);
    document.documentElement.classList.toggle('pp-zoomed', z !== 1);
  }

  /* Ползунок: размер — доля видимой области в кадре, положение — доля сдвига. */
  function bar(box, axis, area, size, pos) {
    var show = size > area + 1;
    box.hidden = !show;
    if (!show) return;
    var track = axis === 'x' ? box.clientWidth : box.clientHeight;
    var th = box.firstChild;
    var len = Math.max(track * area / size, track / 12);
    var at = (track - len) * (-pos / (size - area));
    th.style[axis === 'x' ? 'width' : 'height'] = len + 'px';
    th.style[axis === 'x' ? 'left' : 'top'] = at + 'px';
  }

  function wireBars() {
    [['x', el.bx], ['y', el.by]].forEach(function (p) {
      var axis = p[0], box = p[1];
      box.addEventListener('pointerdown', function (e) {
        if (e.button !== 0) return;
        e.preventDefault();
        var f = frame(), p = paneSize(), area = axis === 'x' ? p.w : p.h, size = (axis === 'x' ? f.w : f.h) * z;
        var thumb = box.firstChild, track = axis === 'x' ? box.clientWidth : box.clientHeight;
        var rect = thumb.getBoundingClientRect();
        var start = axis === 'x' ? e.clientX : e.clientY;
        var grab = e.target === thumb ? start - (axis === 'x' ? rect.left : rect.top) : (axis === 'x' ? rect.width : rect.height) / 2;
        var origin = axis === 'x' ? box.getBoundingClientRect().left : box.getBoundingClientRect().top;
        function to(ev) {
          var len = axis === 'x' ? thumb.offsetWidth : thumb.offsetHeight;
          var at = clamp((axis === 'x' ? ev.clientX : ev.clientY) - origin - grab, 0, track - len);
          var v = -(at / Math.max(1, track - len)) * (size - area);
          if (axis === 'x') tx = v; else ty = v;
          apply();
        }
        to(e);
        function up() { window.removeEventListener('pointermove', to); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up); }
        window.addEventListener('pointermove', to);
        window.addEventListener('pointerup', up);
        window.addEventListener('pointercancel', up);
      });
    });
  }

  /* ---------------- ввод ---------------- */

  /* Может ли родная прокрутка забрать это движение колеса: идём от цели к телу. */
  function scrollable(node, dx, dy) {
    for (var n = node; n && n.nodeType === 1; n = n.parentNode) {
      var cs = getComputedStyle(n);
      if (dy && /auto|scroll/.test(cs.overflowY) && n.scrollHeight > n.clientHeight + 1
        && (dy < 0 ? n.scrollTop > 0 : n.scrollTop + n.clientHeight < n.scrollHeight - 1)) return true;
      if (dx && /auto|scroll/.test(cs.overflowX) && n.scrollWidth > n.clientWidth + 1
        && (dx < 0 ? n.scrollLeft > 0 : n.scrollLeft + n.clientWidth < n.scrollWidth - 1)) return true;
      if (n === document.body) break;
    }
    return false;
  }

  function delta(e, v) { return e.deltaMode === 1 ? v * 16 : e.deltaMode === 2 ? v * frame().h : v; }

  function onWheel(e) {
    if (!on) return;
    if (own(e.target)) { if (e.ctrlKey) e.preventDefault(); return; }
    if (e.ctrlKey) {   // и колесо с Ctrl, и щипок тачпада (Chromium, Firefox)
      e.preventDefault();
      zoomAt(z * Math.exp(-delta(e, e.deltaY) * WHEEL_ZOOM), e.clientX, e.clientY);
      return;
    }
    var dx = delta(e, e.deltaX), dy = delta(e, e.deltaY);
    if (e.shiftKey && !dx) { dx = dy; dy = 0; }
    if (!e.altKey && scrollable(e.target, dx, dy)) return;
    var f = frame(), p = paneSize();
    if (f.w * z <= p.w + 1 && f.h * z <= p.h + 1) return;
    e.preventDefault();
    panBy(-dx, -dy);
  }

  function startPan(e) {
    pan = { id: e.pointerId, x: e.clientX, y: e.clientY };
    document.documentElement.classList.add('pp-panning');
    function move(ev) { panBy(ev.clientX - pan.x, ev.clientY - pan.y); pan.x = ev.clientX; pan.y = ev.clientY; }
    function up() {
      pan = null;
      document.documentElement.classList.remove('pp-panning');
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    }
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  }

  /* Рука: пробел — временно, инструмент Hand тулбара (dev-toolbar.js, RE0031 Э3) — пока выбран. */
  function syncHand() { document.documentElement.classList.toggle('pp-hand', on && (space || hand)); }
  function setSpace(v) {
    if (space === v) return;
    space = v;
    syncHand();
  }
  function setHand(v) {
    v = !!v;
    if (hand === v) return;
    hand = v;
    syncHand();
  }

  function onKey(e) {
    if (!on) return;
    if (e.code === 'Space' && !typing(e.target) && !own(e.target)) { e.preventDefault(); setSpace(true); return; }
    if (e.shiftKey && e.code === 'Digit1' && !e.ctrlKey && !e.metaKey && !e.altKey && !typing(e.target) && !own(e.target)) { e.preventDefault(); fit(); return; }
    if (!(e.ctrlKey || e.metaKey) || e.altKey) return;
    var c = e.code;
    if (c === 'Digit0' || c === 'Numpad0') { e.preventDefault(); reset(); }
    else if (c === 'Equal' || c === 'NumpadAdd') { e.preventDefault(); stepZoom(1); }
    else if (c === 'Minus' || c === 'NumpadSubtract') { e.preventDefault(); stepZoom(-1); }
  }

  function bindInput() {
    window.addEventListener('wheel', onWheel, { passive: false, capture: true });
    window.addEventListener('keydown', onKey, true);
    window.addEventListener('keyup', function (e) { if (e.code === 'Space') setSpace(false); }, true);
    window.addEventListener('blur', function () { setSpace(false); });
    window.addEventListener('pointerdown', function (e) {
      if (!on || own(e.target)) return;
      if (e.button === 1 || (e.button === 0 && (space || hand))) { e.preventDefault(); e.stopPropagation(); startPan(e); }
    }, true);
    /* средняя кнопка: ни автопрокрутка, ни «открыть в новой вкладке» */
    ['mousedown', 'auxclick'].forEach(function (n) {
      window.addEventListener(n, function (e) { if (on && e.button === 1 && !own(e.target)) e.preventDefault(); }, true);
    });
    var base = 1;
    window.addEventListener('gesturestart', function (e) { if (on) { e.preventDefault(); base = z; } });
    window.addEventListener('gesturechange', function (e) { if (on) { e.preventDefault(); zoomAt(base * e.scale, e.clientX, e.clientY); } });
    document.addEventListener('click', function (e) {
      if (!on || !e.target.closest) return;
      var set = e.target.closest('[data-pp-zoom-set]');
      if (set) { listOpen(false); zoomMid(parseFloat(set.getAttribute('data-pp-zoom-set'))); return; }
      var b = e.target.closest('[data-pp-zoom]');
      if (!b) { listOpen(false); return; }
      var a = b.getAttribute('data-pp-zoom');
      if (a === 'list') listOpen(el.list.hidden);
      else { listOpen(false); if (a === 'out') stepZoom(-1); else if (a === 'in') stepZoom(1); else if (a === 'reset') reset(); else if (a === 'fit') fit(); else if (a === 'exit') PP._ui.setDev(false); }
    });
    window.addEventListener('resize', apply);
  }

  /* ---------------- включение ---------------- */

  var bound = false;
  function enable() {
    if (on) return;
    if (!bound) { bindInput(); bound = true; }
    on = true;
    z = 1; tx = 0; ty = 0; frameW = null;
    PP._ui.pinPage('dev', true);
    document.documentElement.classList.add('pp-dev');
    buildUi();
    syncHand();
    /* размер кадра меняется вместе с панелью (ширина, высота, положение) */
    if (window.ResizeObserver) { ro = new ResizeObserver(apply); ro.observe(document.body); }
    apply();
  }

  function disable() {
    if (!on) return;
    on = false;
    setSpace(false);
    hand = false;
    if (ro) { ro.disconnect(); ro = null; }
    document.body.style.transform = '';
    document.body.style.transformOrigin = '';
    setWidth(null);
    var root = document.documentElement;
    root.classList.remove('pp-dev', 'pp-zoomed', 'pp-panning', 'pp-hand');
    destroyUi();
    PP._ui.pinPage('dev', false);
  }

  PP._zoom = {
    enable: enable, disable: disable, active: function () { return on; },
    level: function () { return z; }, panning: function () { return space || hand; }, setHand: setHand, bar: function () { return el.box || null; }, onChange: function (fn) { subs.push(fn); }, set: zoomMid, reset: reset, fit: fit, step: stepZoom, pan: panBy,
    width: function () { return frameW; }, setWidth: setWidth, PRESETS: [1280, 1440, 1920]
  };
})();
