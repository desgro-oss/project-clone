/* ============================================================
   ПАНЕЛЬ ПРОТОТИПА — оболочка лёгкого инспектора для спеки на разработку (spec-lite.js, RE0032).

   Модули Devmode (dev-measure, dev-ds, dev-tokens, dev-props, dev-a11y, dev-inspect, dev-tip) работают на
   window.ProtoPanel и ждут рядом панель: масштаб страницы (_zoom), тему и подключение узлов (_ui), хранилище
   сессии (_store), словарь (_strings). В кадре снимка спецификации панели нет, поэтому оболочка ставит
   заглушки и запускает один инструмент — Inspect. Тулбара, боковой панели, масштаба и перемещения нет.

   Файл не подключается страницей прототипа: dev-spec.mjs собирает из него, модулей, словаря (только нужные
   ключи t('…')), глифов и правил слоя один блок и кладёт в автономную спеку; окно снимка запускает блок
   внутри своего кадра (sandbox="allow-scripts" и CSP по nonce). Словарь и глифы приходят из сборки в
   window.__ppLite = { strings, boot }; сюда boot() вызывает последняя строка блока.

   Мост с окном — postMessage; сообщения проверяются по источнику (window.parent) и форме { devspecInsp: 1 }.
     окно → кадр:  { devspecInsp: 1, cmd: 'inspect', on: boolean }
                   { devspecInsp: 1, cmd: 'tip', act: 'close' | 'pin', k: number } — действие над карточкой k
                   { devspecInsp: 1, cmd: 'tip', act: 'hl', cls: string } — обвести элементы с классом (пусто — снять)
                   { devspecInsp: 1, cmd: 'tip', act: 'clear' } — снять карточки
     кадр → окно:  { devspecInsp: 1, ev: 'ready' | 'toggle' | 'esc', what: 'inspect', on: boolean }
                   { devspecInsp: 1, ev: 'tips', hover: html, cursor: {x, y} | null, cards: [{ k, html, perm, x, y }] }
                   — что показать окну (оно рисует карточки поверх кадра, за его границей; x, y — в координатах кадра)
   Линеек в окне нет (решение человека, 19.10.2026): опция rulers Devmode остаётся выключенной.
   Клавиша в кадре: I переключает инспектор (кадр сообщает toggle), Esc при выключенном
   инспекторе и без карточек просит окно закрыться (esc). Пока инспектор выключен, клавиши, кроме Esc,
   кадр не трогает, а страница получает клики как обычно.
   ============================================================ */
(function () {
  'use strict';
  var L = window.__ppLite;
  if (!L) return;
  var PP = window.ProtoPanel = window.ProtoPanel || {};
  function noop() {}

  /* масштаба нет: кадр показывается в натуральной величине, масштаб миниатюры — transform у родителя окна */
  PP._zoom = { active: function () { return false; }, level: function () { return 1; }, setHand: noop, panning: function () { return false; }, onChange: noop };

  /* тема карточек — тема кадра (data-theme в атрибутах html снимка), служебной панели нет */
  PP._ui = { themed: function (node) { return node; }, wire: function (node) { if (window.dsIcons) window.dsIcons.apply(node); } };

  var mem = {};
  PP._store = { session: { get: function (k, d) { return Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : d; }, set: function (k, v) { mem[k] = v; } } };

  var S = L.strings || {};
  function t(key, vars) {
    var s = Object.prototype.hasOwnProperty.call(S, key) ? S[key] : key;
    if (vars) s = s.replace(/\{(\w+)\}/g, function (m, k) { return vars[k] != null ? String(vars[k]) : m; });
    return s;
  }
  PP._strings = { t: t, has: function (k) { return Object.prototype.hasOwnProperty.call(S, k); } };

  var PROTO = 1;
  var armed = false;
  function post(ev, what, on) {
    try { window.parent.postMessage({ devspecInsp: PROTO, ev: ev, what: what, on: !!on }, '*'); } catch (e) { /* окна нет — сообщать некому */ }
  }

  /* Карточки рисует окно (за границей кадра): кадр шлёт содержимое, якоря и курсор — см. PP._tip.mirror().
     Собственные карточки кадра остаются в разметке (от них считаются размеры и действия), но скрыты — правило в css рантайма. */
  var lastTips = '', queued = false;
  function mirror() {
    queued = false;
    var s = PP._tip.mirror(), json = JSON.stringify(s);
    if (json === lastTips) return;
    lastTips = json;
    try { window.parent.postMessage({ devspecInsp: PROTO, ev: 'tips', hover: s.hover, cursor: s.cursor, cards: s.cards }, '*'); } catch (e) { /* окна нет */ }
  }
  function schedule() { if (!queued) { queued = true; requestAnimationFrame(mirror); } }

  function setInspect(on) {
    var I = PP._inspect;
    if (!I || I.active() === on) return;
    if (on) { I.enable(); PP._tip.enable(); I.setTool('inspect'); } else { PP._tip.disable(); I.disable(); }
    schedule();
  }

  function onMessage(e) {
    var d = e.data;
    if (e.source !== window.parent || !d || d.devspecInsp !== PROTO) return;
    if (d.cmd === 'inspect' && typeof d.on === 'boolean') setInspect(d.on);
    else if (d.cmd === 'tip' && PP._inspect.active()) {   // действия окна над его карточками
      if (d.act === 'hl') PP._tip.hl(typeof d.cls === 'string' ? d.cls : '');
      else if (d.act === 'clear') PP._tip.clear();
      else if (typeof d.k === 'number') PP._tip.act(d.k, d.act);
      schedule();
    }
  }

  function typing(n) { return !!(n && n.closest && n.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"]')); }

  /* окно ждёт от кадра клавиши I и Esc; пока инспектор не включён, кадр сообщает о них окну, а не делает сам */
  function onKey(e) {
    if (e.altKey || e.ctrlKey || e.metaKey || typing(e.target)) return;
    var I = PP._inspect, k = e.key;
    if (k === 'Escape') { post('esc'); return; }   // карточки и выбор снимает инспектор и гасит клавишу сам — сюда она не дойдёт
    if (k === 'i' || k === 'I') { e.preventDefault(); post('toggle', 'inspect', !I.active()); }
  }

  /** Подключается один раз: слушает окно и клавиши, инспектор включает по команде окна. */
  function boot() {
    if (armed || !PP._inspect || !PP._tip) return;
    armed = true;
    window.addEventListener('message', onMessage);
    PP._inspect.onDraw(schedule);
    window.addEventListener('pointermove', schedule, true);
    window.addEventListener('keydown', schedule, true);
    window.addEventListener('keydown', onKey, false);   // после инспектора (он ловит keydown на фазе перехвата и гасит Esc сам)
    post('ready');
  }

  PP._lite = { boot: boot, setInspect: setInspect };
})();
