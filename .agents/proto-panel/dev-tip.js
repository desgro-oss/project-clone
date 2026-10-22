/* ============================================================
   ПАНЕЛЬ ПРОТОТИПА — подсказки у элемента (dev-tip.js, RE0031, Э4).

   В инструменте Inspect у курсора идёт карточка наведённого элемента: имя, размер с режимом
   по осям, padding, gap, radius токенами, заливка и цвет текста образцами, токен шрифта,
   контраст. Только значения, отличные от умолчания. Место — по четверти области (курсор в
   нижней половине — карточка над ним, в правой — слева; образец — metatip.js VisBug), в
   пределах области рядом с закреплённой панелью.
   Клик по элементу закрепляет его карточку; следующий клик её заменяет, булавка в шапке
   оставляет насовсем — так копится несколько. Закреплённая идёт за элементом (прокрутка,
   масштаб), тянется за шапку, «Open in panel» выбирает элемент в панели, наведение на
   .класс в шапке обводит все элементы с ним. Esc снимает все карточки (dev-inspect.js).
   Слой выше хоста плавающих слоёв ДС (поповеры, меню страницы лежат в нём при закреплённой панели):
   карточки их не прячутся; подсказки кнопок карточки — родные (title), иначе хост закрыл бы их карточкой.
   Тумблер «Tips» — в тулбаре (dev-toolbar.js). Слой .pp-tips — в корне документа, как слой
   инспектора; свои входы в инспектор: onDraw, onPick, sig, count. Страницу не меняет.
   Тексты — strings.js; данные — dev-props.js, контраст — dev-a11y.js.
   ============================================================ */
(function () {
  'use strict';
  var PP = window.ProtoPanel;
  var M = PP && PP._measure, I = PP && PP._inspect, P = PP && PP._props, A = PP && PP._a11y;
  if (!PP || !PP._strings || !M || !I || !P || !A) return;
  var t = PP._strings.t;

  var MAX_SAME = 300, MAX_CLASSES = 4;
  var root = null, hoverNode = null, hlLayer = null;
  var cards = [], cursor = null, shown = null, bound = false, drag = null, hlClass = '';
  var ids = typeof WeakMap === 'function' ? new WeakMap() : null, nextId = 1;

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function px(v) { return Math.round(v * 100) / 100; }
  function idOf(el) { if (!ids) return 0; if (!ids.has(el)) ids.set(el, nextId++); return ids.get(el); }
  function on() { return !!root && I.active() && I.opts().tips; }

  /* ---------------- содержимое карточки ---------------- */

  var KIND_ICON = { ds: 'layer-01', widget: 'layout-grid-01', icon: 'image-01', illu: 'image-01' };
  function kindIcon(el) {
    var name = KIND_ICON[PP._ds && PP._ds.kind ? PP._ds.kind(el) : ''];
    var svg = name && window.dsIcons && window.dsIcons.svg ? window.dsIcons.svg(name) : '';
    return svg ? '<span class="pp-tip__ico" aria-hidden="true">' + svg + '</span>' : '';
  }

  function find(rows, k) { for (var i = 0; i < rows.length; i++) if (rows[i].k === k) return rows[i]; return null; }
  function partsHtml(r) {
    return r.parts.map(function (p) {
      return (p.token ? '<span class="pp-tok' + (p.exact ? '' : ' pp-tok--guess') + '">' + (p.exact ? '' : '≈ ') + esc(p.token) + '</span> ' : '')
        + '<span class="pp-val' + (p.token ? ' pp-muted' : '') + '">' + esc(p.text) + '</span>';
    }).join(' ');
  }
  function row(k, html) {
    return '<div class="pp-tip__row"><span class="ds-body-xs pp-muted">' + esc(k) + '</span><span class="ds-body-xs pp-tip__val">' + html + '</span></div>';
  }

  function rowsHtml(el) {
    var d = P.build(el), b = M.box(el), s = M.sizing(el), h = '', r;
    h += row(t('tip.size'), esc(M.fmt(b.w) + ' × ' + M.fmt(b.h)) + ' <span class="pp-muted">' + esc(t('insp.' + s.w) + ' · ' + t('insp.' + s.h)) + '</span>');
    if ((r = find(d.layout, 'padding'))) h += row('padding', partsHtml(r));
    if ((r = find(d.layout, 'gap'))) h += row('gap', partsHtml(r));
    if ((r = find(d.style, 'border-radius'))) h += row('radius', partsHtml(r));
    [t('css.fill'), t('css.text'), t('css.icon')].forEach(function (k) {
      var c = find(d.colors, k);
      if (!c) return;
      var p = c.parts[0] || { text: '', token: '' };
      h += row(k, '<span class="pp-sw pp-sw--round" style="--pp-sw:' + esc(c.swatch) + '" aria-hidden="true"></span>'
        + '<span class="' + (p.token ? 'pp-tok' + (p.exact ? '' : ' pp-tok--guess') : 'pp-muted') + '">' + esc(p.token ? (p.exact ? '' : '≈ ') + p.token : t('tok.none')) + '</span> <span class="pp-muted">' + esc(p.text) + '</span>');
    });
    var ty = find(d.type, t('type.style')) || find(d.type, 'font-size');
    if (ty) h += row(t('type.style'), partsHtml(ty));
    var c2 = null;
    try { c2 = A.contrast(el); } catch (e) { c2 = null; }
    if (c2 && !c2.unknown) {
      var ratio = (Math.floor(c2.ratio * 100) / 100).toFixed(2);
      h += row(t('tip.contrast'), esc(ratio + ' : 1') + ' <span class="' + (c2.ok ? 'pp-muted' : 'pp-warn') + '">' + esc(c2.ok ? t('tip.pass') : t('tip.fail')) + '</span>');
    }
    return h;
  }

  function btn(act, icon, label) {
    return '<button type="button" class="ibtn ibtn--neutral ibtn--s" data-pp-tip="' + act + '" aria-label="' + esc(label) + '" title="' + esc(label) + '"><i data-icon="' + icon + '"></i></button>';
  }

  /** Карточка целиком; у закреплённой — кнопки в шапке и ссылка «Open in panel». */
  function cardHtml(el, pinned, perm) {
    var cls = M.classes(el).slice(0, MAX_CLASSES);
    return '<div class="pp-tip__head"' + (pinned ? ' title="' + esc(t('tip.drag')) + '"' : '') + '>' + kindIcon(el) + '<span class="ds-body-s-strong pp-tip__name">' + esc(M.describe(el)) + '</span>'
      + (pinned ? '<span class="pp-tip__acts">' + btn('pin', perm ? 'pin-filled' : 'pin', perm ? t('tip.unpin') : t('tip.pin')) + btn('close', 'close', t('tip.close')) + '</span>' : '') + '</div>'
      + (cls.length ? '<div class="pp-tip__cls">' + cls.map(function (c) {
        return pinned ? '<button type="button" class="pp-tip__cl ds-body-xs" data-pp-tip="cls:' + esc(c) + '" title="' + esc(t('tip.same')) + '">.' + esc(c) + '</button>' : '<span class="pp-tip__cl ds-body-xs">.' + esc(c) + '</span>';
      }).join('') + '</div>' : '')
      + '<div class="pp-tip__rows">' + rowsHtml(el) + '</div>'
      + (pinned && !PP._lite ? '<div class="pp-tip__foot"><a href="#" role="button" class="link link--accent link--s" data-pp-tip="open">' + esc(t('tip.open')) + '</a></div>' : '');
  }

  function fill(node, el, pinned, perm) {
    node.innerHTML = cardHtml(el, pinned, perm);
    if (pinned && PP._ui && PP._ui.wire) PP._ui.wire(node);
  }

  /* ---------------- место ---------------- */

  function area() { var r = root.getBoundingClientRect(); return { l: r.left, t: r.top, w: r.width, h: r.height }; }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(v, Math.max(lo, hi))); }

  /** Левый верхний угол карточки для курсора: по четверти области, затем в пределах области. */
  function placeAt(x, y, w, h) {
    var a = area(), cx = x - a.l, cy = y - a.t;
    var north = cy > a.h / 2, west = cx > a.w / 2;
    var left = west ? cx - w - 16 : cx + 16, top = north ? cy - h - 16 : cy + 20;
    return { left: clamp(left, 4, a.w - w - 4), top: clamp(top, 4, a.h - h - 4) };
  }
  function put(node, left, top) { node.style.left = px(left) + 'px'; node.style.top = px(top) + 'px'; }

  function moveHover() {
    if (!hoverNode || hoverNode.hidden || !cursor) return;
    var p = placeAt(cursor.x, cursor.y, hoverNode.offsetWidth, hoverNode.offsetHeight);
    put(hoverNode, p.left, p.top);
  }
  function putCard(c) {
    var r = c.el.getBoundingClientRect(), a = area();
    put(c.node, r.left - a.l + c.dx, r.top - a.t + c.dy);
  }

  /* ---------------- закреплённые ---------------- */

  function dropCard(c) {
    if (c.node.parentNode) c.node.parentNode.removeChild(c.node);
    cards.splice(cards.indexOf(c), 1);
  }
  function cardOf(node) {
    var n = node && node.closest ? node.closest('.pp-tip') : null;
    for (var i = 0; i < cards.length; i++) if (cards[i].node === n) return cards[i];
    return null;
  }
  function dropTemps(except) { cards.slice().forEach(function (c) { if (!c.perm && c !== except) dropCard(c); }); }

  function pin(el) {
    if (!on() || I.tool() !== 'inspect' || !el || !el.isConnected) return;
    var same = cards.filter(function (c) { return c.el === el; })[0];
    if (same) { dropTemps(same); return; }
    dropTemps(null);
    var node = document.createElement('div');
    node.className = 'pp-tip pp-tip--pinned';
    node.setAttribute('role', 'group');
    node.setAttribute('aria-label', t('tip.label'));
    fill(node, el, true, false);
    root.appendChild(node);
    var c = { el: el, node: node, perm: false, dx: 0, dy: 0 };
    var at = cursor || { x: el.getBoundingClientRect().left, y: el.getBoundingClientRect().top };
    var p = placeAt(at.x, at.y, node.offsetWidth, node.offsetHeight), r = el.getBoundingClientRect(), a = area();
    put(node, p.left, p.top);
    c.dx = p.left - (r.left - a.l); c.dy = p.top - (r.top - a.t);
    cards.push(c);
    if (hoverNode) hoverNode.hidden = true;
  }

  function clear() {
    var had = cards.length > 0 || !!hlClass;
    cards.slice().forEach(dropCard);
    hlClass = '';
    if (hlLayer) hlLayer.innerHTML = '';
    return had;
  }

  /* ---------------- «тот же класс» ---------------- */

  function drawSame() {
    if (!hlLayer) return;
    if (!hlClass) { if (hlLayer.firstChild) hlLayer.innerHTML = ''; return; }
    var list = [], h = '', a = area();
    try { list = document.querySelectorAll('.' + (window.CSS && CSS.escape ? CSS.escape(hlClass) : hlClass)); } catch (e) { list = []; }
    for (var i = 0; i < list.length && i < MAX_SAME; i++) {
      if (M.own(list[i])) continue;
      var r = list[i].getBoundingClientRect();
      h += '<div class="pp-tips__same" style="left:' + px(r.left - a.l) + 'px;top:' + px(r.top - a.t) + 'px;width:' + px(r.width) + 'px;height:' + px(r.height) + 'px"></div>';
    }
    hlLayer.innerHTML = h;
  }

  /* ---------------- перерисовка (вызывает инспектор) ---------------- */

  function refresh() {
    if (!root) return;
    if (!on()) { clear(); if (hoverNode) hoverNode.hidden = true; return; }
    cards.slice().forEach(function (c) { if (!c.el.isConnected) dropCard(c); else putCard(c); });
    drawSame();
    var h = I.tool() === 'inspect' && I.interactive() ? I.hovered() : null;
    if (h && cards.some(function (c) { return c.el === h; })) h = null;
    if (!h) { hoverNode.hidden = true; shown = null; return; }
    if (h !== shown) { fill(hoverNode, h, false, false); shown = h; }
    hoverNode.hidden = false;
    moveHover();
  }

  function rectSig(n) { var r = n.getBoundingClientRect(); return [r.left, r.top].map(function (v) { return Math.round(v * 10); }).join(','); }
  /** Подпись для кадра инспектора: закреплённые и наведённый — их место и кто именно. */
  function sig() {
    if (!root) return '';
    var h = I.hovered();
    return (h ? idOf(h) : 0) + '/' + hlClass + '/' + cards.map(function (c) { return c.el.isConnected ? idOf(c.el) + '@' + rectSig(c.el) : 'x'; }).join(';');
  }

  /* ---------------- ввод ---------------- */

  function onMove(e) {
    if (!root || drag) return;
    cursor = { x: e.clientX, y: e.clientY };
    moveHover();
  }

  function onClick(e) {
    var b = e.target.closest && e.target.closest('[data-pp-tip]');
    if (!b) return;
    e.preventDefault();
    var c = cardOf(b), act = b.getAttribute('data-pp-tip');
    if (!c) return;
    doAct(c, act);
  }
  function doAct(c, act) {
    if (act === 'close') dropCard(c);
    else if (act === 'open') I.select(c.el);
    else if (act === 'pin') { c.perm = !c.perm; fill(c.node, c.el, true, c.perm); if (!c.perm) dropTemps(c); }
  }

  /* ---------------- для окна снимка спеки (spec-lite.js) ----------------
     В кадре снимка карточки обрезает его граница, поэтому окно рисует их само, поверх кадра: кадр отдаёт
     содержимое карточек, их якоря (левый верхний угол элемента в координатах кадра) и курсор, а действия
     окна (закрыть, закрепить, «тот же класс») выполняет здесь же теми же обработчиками, что и клик по своей карточке. */

  /** Что показать окну: наведённая карточка (html), закреплённые (k, html, perm, якорь x y) и курсор кадра. */
  function mirror() {
    if (!root) return { hover: '', cursor: null, cards: [] };
    return {
      hover: shown && hoverNode && !hoverNode.hidden ? hoverNode.innerHTML : '',
      cursor: cursor ? { x: cursor.x, y: cursor.y } : null,
      cards: cards.filter(function (c) { return c.el.isConnected; }).map(function (c) {
        var r = c.el.getBoundingClientRect();
        return { k: idOf(c.el), html: c.node.innerHTML, perm: c.perm, x: px(r.left), y: px(r.top) };
      })
    };
  }
  /** Действие окна над закреплённой карточкой с ключом k. */
  function act(k, what) {
    if (what !== 'close' && what !== 'pin') return;
    for (var i = 0; i < cards.length; i++) if (idOf(cards[i].el) === k) { doAct(cards[i], what); return; }
  }
  /** Обвести элементы с классом cls (пусто — снять). */
  function hl(cls) { if (root && cls !== hlClass) { hlClass = cls; drawSame(); } }

  function onDown(e) {
    var head = e.target.closest && e.target.closest('.pp-tip__head');
    if (!head || e.button !== 0 || e.target.closest('button')) return;
    var c = cardOf(head);
    if (!c) return;
    e.preventDefault();
    try { head.setPointerCapture(e.pointerId); } catch (err) { /* без захвата тянем по событиям слоя */ }
    drag = { c: c, x: e.clientX, y: e.clientY, dx: c.dx, dy: c.dy, head: head };
    c.node.classList.add('is-dragging');
  }
  function onDrag(e) {
    if (!drag) return;
    drag.c.dx = drag.dx + e.clientX - drag.x;
    drag.c.dy = drag.dy + e.clientY - drag.y;
    putCard(drag.c);
  }
  function onUp() {
    if (!drag) return;
    drag.c.node.classList.remove('is-dragging');
    drag = null;
  }

  function onOver(e) {
    var b = e.target.closest && e.target.closest('[data-pp-tip^="cls:"]');
    var cls = b ? b.getAttribute('data-pp-tip').slice(4) : '';
    if (cls !== hlClass) { hlClass = cls; drawSame(); }
  }

  /* ---------------- включение ---------------- */

  function enable() {
    if (root) return;
    root = document.createElement('div');
    root.className = 'pp-tips';
    if (PP._ui && PP._ui.themed) PP._ui.themed(root); else root.setAttribute('data-theme', 'service');
    root.innerHTML = '<div class="pp-tips__hl" aria-hidden="true"></div><div class="pp-tip pp-tip--hover" aria-hidden="true" hidden></div>';
    hlLayer = root.firstChild; hoverNode = root.lastChild;
    document.documentElement.appendChild(root);
    root.addEventListener('click', onClick);
    root.addEventListener('pointerdown', onDown);
    root.addEventListener('pointermove', onDrag);
    root.addEventListener('pointerup', onUp);
    root.addEventListener('pointercancel', onUp);
    root.addEventListener('mouseover', onOver);
    if (!bound) {
      window.addEventListener('pointermove', onMove, true);
      I.onDraw(refresh);
      I.onPick(pin);
      bound = true;
    }
  }

  function disable() {
    if (!root) return;
    if (root.parentNode) root.parentNode.removeChild(root);
    root = hoverNode = hlLayer = null;
    cards = []; shown = null; drag = null; hlClass = ''; cursor = null;
  }

  PP._tip = { enable: enable, disable: disable, clear: clear, count: function () { return cards.length + (hlClass ? 1 : 0); }, sig: sig, pin: pin, mirror: mirror, act: act, hl: hl };
})();
