/* ============================================================
   ПАНЕЛЬ ПРОТОТИПА — тулбар инструментов Devmode (dev-toolbar.js, RE0031, Э3).

   Группа кнопок в начале плавающего ряда у нижнего края (его узел .pp-zoom строит
   dev-zoom.js, группу ставит сюда ui.js: enable / disable вместе с Devmode):
     инструменты  V Inspect · H Hand · G Guides · M Measure · C Columns (dev-inspect.js);
     оверлеи      «Rulers», «Layout» и «Tips» (подсказки, dev-tip.js) — переключатели;
     дальше       прежние кнопки масштаба.
   Буквы работают, пока включён Devmode, без Ctrl / Alt / Shift и вне полей ввода;
   смотрим физическую клавишу (e.code), поэтому в русской раскладке они те же.
   Знаков «курсор», «рука», «направляющие», «линейка», «колонки» и «угол линеек» в ДС нет —
   рисуются здесь контуром в currentColor (в «Открытых вопросах» RE0031 — добавить их в
   библиотеку иконок). Тексты — strings.js.
   ============================================================ */
(function () {
  'use strict';
  var PP = window.ProtoPanel;
  var I = PP && PP._inspect;
  if (!PP || !PP._zoom || !PP._strings || !I) return;
  var t = PP._strings.t;

  var TOOLS = [
    { id: 'inspect', key: 'V', code: 'KeyV' },
    { id: 'hand', key: 'H', code: 'KeyH' },
    { id: 'guides', key: 'G', code: 'KeyG' },
    { id: 'measure', key: 'M', code: 'KeyM' },
    { id: 'columns', key: 'C', code: 'KeyC' }
  ];

  /* Контуры 24×24: линия 1.6, без заливки; цвет — от кнопки. */
  var SHAPES = {
    inspect: '<path d="M6 3.5l12.5 6.2-5.6 1.6-1.7 5.6z"/>',
    hand: '<path d="M8 12.5V6.5a1.5 1.5 0 013 0v5M11 11V4.5a1.5 1.5 0 013 0V11M14 11V6.5a1.5 1.5 0 013 0v7.2c0 4-2.2 6.8-6 6.8-2.6 0-4.2-1.3-5.6-3.6l-1.8-3a1.4 1.4 0 012.3-1.6L8 14.5"/>',
    guides: '<path d="M9 3v18M15 3v18M3 9h18M3 15h18"/>',
    measure: '<path d="M3.5 15L15 3.5 20.5 9 9 20.5z"/><path d="M7.5 13l2 2M10.5 10l2 2M13.5 7l2 2"/>',
    columns: '<rect x="3.5" y="4" width="4.5" height="16" rx="1"/><rect x="9.75" y="4" width="4.5" height="16" rx="1"/><rect x="16" y="4" width="4.5" height="16" rx="1"/>',
    rulers: '<rect x="3" y="3" width="18" height="18" rx="1.5"/><path d="M8 3v5M13 3v3M3 8h5M3 13h3"/>'
  };
  function shape(name) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + SHAPES[name] + '</svg>';
  }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function typing(n) { return !!(n && n.closest && n.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"], [role="textbox"]')); }

  var group = null, bound = false;

  function btn(act, label, tip, icon, pressed) {
    return '<button type="button" class="ibtn ibtn--neutral ibtn--m" data-pp-tool="' + act + '" aria-pressed="' + pressed + '" aria-label="' + esc(label) + '" data-tooltip="' + esc(tip) + '">' + icon + '</button>';
  }

  function html() {
    var cur = I.tool(), o = I.opts();
    return TOOLS.map(function (x) {
      return btn('tool:' + x.id, t('tool.' + x.id), t('tool.' + x.id) + ' · ' + x.key, shape(x.id), cur === x.id);
    }).join('')
      + '<span class="pp-zoom__sep" aria-hidden="true"></span>'
      + btn('opt:rulers', t('insp.rulers'), t('insp.rulers'), shape('rulers'), o.rulers)
      + btn('opt:layout', t('insp.layout'), t('insp.layout'), '<i data-icon="layout-grid-02"></i>', o.layout)
      + btn('opt:tips', t('insp.tips'), t('insp.tips'), '<i data-icon="message-text"></i>', o.tips)
      + '<span class="pp-zoom__sep" aria-hidden="true"></span>';
  }

  /** Состояние кнопок без перестройки: нажатость берётся у инспектора. */
  function sync() {
    if (!group || !group.isConnected) return;
    var cur = I.tool(), o = I.opts();
    Array.prototype.forEach.call(group.querySelectorAll('[data-pp-tool]'), function (b) {
      var p = b.getAttribute('data-pp-tool').split(':');
      var on = p[0] === 'tool' ? cur === p[1] : !!o[p[1]];
      b.setAttribute('aria-pressed', String(on));
    });
  }

  function onClick(e) {
    var b = e.target.closest && e.target.closest('[data-pp-tool]');
    if (!b) return;
    e.preventDefault();
    var p = b.getAttribute('data-pp-tool').split(':');
    if (p[0] === 'tool') I.setTool(p[1]);
    else I.setOpt(p[1], !I.opts()[p[1]]);
    sync();
  }

  function onKey(e) {
    if (!group || e.repeat || e.ctrlKey || e.metaKey || e.altKey || e.shiftKey || typing(e.target)) return;
    for (var i = 0; i < TOOLS.length; i++) {
      if (TOOLS[i].code !== e.code) continue;
      e.preventDefault();
      e.stopPropagation();
      I.setTool(TOOLS[i].id);
      return;
    }
  }

  function enable() {
    var bar = PP._zoom.bar && PP._zoom.bar();
    if (!bar || (group && group.isConnected)) return;
    group = document.createElement('div');
    group.className = 'pp-tools';
    group.setAttribute('role', 'group');
    group.setAttribute('aria-label', t('tool.label'));
    group.innerHTML = html();
    bar.insertBefore(group, bar.firstChild);
    group.addEventListener('click', onClick);
    if (PP._ui && PP._ui.wire) PP._ui.wire(group);
    if (!bound) {
      window.addEventListener('keydown', onKey, true);
      I.onChange(sync);
      bound = true;
    }
  }

  function disable() {
    if (group && group.parentNode) group.parentNode.removeChild(group);
    group = null;
  }

  PP._toolbar = { enable: enable, disable: disable, sync: sync };
})();
