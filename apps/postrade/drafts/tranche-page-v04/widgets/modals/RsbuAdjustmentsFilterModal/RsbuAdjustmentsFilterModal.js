/* ============================================================
   RsbuAdjustmentsFilterModal.js — окно «Фильтр» таблицы корректировок РСБУ
   (RE0050, вторая волна 05.11.2026).

   Окно — компонент без сети и без стора: что уже выбрано, ему отдаёт страница
   при открытии. Фильтр — четыре группы: исходная дата, целевая дата корректировки,
   сумма корректировки, наличие комментария. Группа считается заполненной, если
   заполнено хотя бы одно поле пары; «Применено: N» на таблице считает группы.

   Что делает скрипт сверх рантаймов ДС:
     1. Заполняет поля значением фильтра (ISO-даты → ДД.ММ.ГГГГ, числа → «1 000,00»).
     2. Собирает значение по «Применить»: пустые даты и суммы — null / '', имена
        полей — startFrom, startTo, targetFrom, targetTo, amountFrom, amountTo,
        onlyCommented.
     3. «Очистить фильтр» сбрасывает поля окна и окно не закрывает; «Применить»
        закрывает и отдаёт значение; крестик/Esc — null; клик по скриму не закрывает — у полей
        ввода включается защита ДС (guarded-режим).
     4. Бейдж на табе раздела — число заполненных групп; при нуле скрыт.

   API: window.PostModalRsbuAdjustmentsFilter
     bind(scrim)                    — один раз привязать окно; повторный вызов
                                      возвращает уже привязанное
     open(value) → Promise<value|null>
                                    — открыть с текущим фильтром; null — закрыли
                                      без применения
     preview(scrim, opts)           — заполнить окно на витрине, без слоя поверх
                                      страницы (opts.value или само значение)
     empty() → пустой фильтр
     normalize(value)               — привести значение к семи полям фильтра
   ============================================================ */
(function () {
  'use strict';

  var SCRIM_ID = 'rh-filter-scrim';
  var FIELDS = {
    startFrom: 'rhf-start-from',
    startTo: 'rhf-start-to',
    targetFrom: 'rhf-target-from',
    targetTo: 'rhf-target-to',
    amountFrom: 'rhf-amount-from',
    amountTo: 'rhf-amount-to',
    onlyCommented: 'rhf-commented'
  };

  var ui = null;
  var session = null;

  function empty() {
    return {
      startFrom: '', startTo: '', targetFrom: '', targetTo: '',
      amountFrom: null, amountTo: null, onlyCommented: false
    };
  }

  function normalize(value) {
    var v = value || {};
    function str(x) { return x == null ? '' : String(x).trim(); }
    function num(x) {
      if (x == null || x === '') return null;
      var n = Number(x);
      return isFinite(n) ? n : null;
    }
    return {
      startFrom: str(v.startFrom),
      startTo: str(v.startTo),
      targetFrom: str(v.targetFrom),
      targetTo: str(v.targetTo),
      amountFrom: num(v.amountFrom),
      amountTo: num(v.amountTo),
      onlyCommented: !!v.onlyCommented
    };
  }

  function count(value) {
    var v = normalize(value);
    var n = 0;
    if (v.startFrom || v.startTo) n++;
    if (v.targetFrom || v.targetTo) n++;
    if (v.amountFrom != null || v.amountTo != null) n++;
    if (v.onlyCommented) n++;
    return n;
  }

  /* «ДД.ММ.ГГГГ» → ISO; мусор (в том числе 31.02) → '' */
  function parseDate(str) {
    var m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(String(str).trim());
    if (!m) return '';
    var d = new Date(Date.UTC(+m[3], +m[2] - 1, +m[1]));
    return (d.getUTCFullYear() === +m[3] && d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[1])
      ? m[3] + '-' + m[2] + '-' + m[1]
      : '';
  }
  function fmtDate(iso) {
    var p = String(iso).split('-');
    return p[2] + '.' + p[1] + '.' + p[0];
  }
  function parseAmount(str) {
    var s = String(str == null ? '' : str).replace(/\s/g, '').replace(',', '.');
    if (!s) return null;
    var n = Number(s);
    return isFinite(n) ? n : null;
  }
  function fmtAmount(n) {
    if (n == null || n === '') return '';
    var p = Number(n).toFixed(2).split('.');
    return p[0].replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0') + ',' + p[1];
  }

  function read() {
    return {
      startFrom: parseDate(ui.startFrom.value),
      startTo: parseDate(ui.startTo.value),
      targetFrom: parseDate(ui.targetFrom.value),
      targetTo: parseDate(ui.targetTo.value),
      amountFrom: parseAmount(ui.amountFrom.value),
      amountTo: parseAmount(ui.amountTo.value),
      onlyCommented: ui.commented.checked
    };
  }

  function updateBadge() {
    if (!ui) return;
    var n = count(read());
    ui.badge.textContent = String(n);
    ui.badge.hidden = n === 0;
  }
  function updateClear() {
    if (ui) ui.clear.disabled = count(read()) === 0;
  }
  function syncState() {
    updateBadge();
    updateClear();
  }

  function fill(value) {
    var v = normalize(value);
    ui.startFrom.value = v.startFrom ? fmtDate(v.startFrom) : '';
    ui.startTo.value = v.startTo ? fmtDate(v.startTo) : '';
    ui.targetFrom.value = v.targetFrom ? fmtDate(v.targetFrom) : '';
    ui.targetTo.value = v.targetTo ? fmtDate(v.targetTo) : '';
    ui.amountFrom.value = v.amountFrom == null ? '' : fmtAmount(v.amountFrom);
    ui.amountTo.value = v.amountTo == null ? '' : fmtAmount(v.amountTo);
    ui.commented.checked = !!v.onlyCommented;
    if (window.DSInput) window.DSInput.syncAll(ui.scrim);
    syncState();
  }

  function clearAll() {
    fill(empty());
    ui.startFrom.focus();
  }

  function apply() {
    if (!session) return;
    session.result = read();
    if (session.layer) session.layer.close(true);
  }

  function onClose(ok) {
    var s = session;
    if (!s) return;
    session = null;
    s.resolve(ok && s.result ? s.result : null);
  }

  function open(value) {
    if (!ui) bind(document.getElementById(SCRIM_ID));
    if (!ui) return Promise.resolve(null);
    if (session) return session.promise;
    var resolve;
    var promise = new Promise(function (r) { resolve = r; });
    session = { promise: promise, resolve: resolve, result: null, layer: null };
    fill(value || empty());
    var layer = window.DSModal ? window.DSModal.open(ui.scrim, { onClose: onClose }) : null;
    if (!layer) {
      session = null;
      resolve(null);
      return promise;
    }
    session.layer = layer;
    return promise;
  }

  function preview(scrim, opts) {
    if (!bind(scrim)) return null;
    fill((opts && opts.value) || opts || empty());
    return scrim;
  }

  function bind(scrim) {
    if (!scrim) return null;
    if (scrim.__rhFilterUi) { ui = scrim.__rhFilterUi; return api; }
    var next = {
      scrim: scrim,
      startFrom: scrim.querySelector('#' + FIELDS.startFrom),
      startTo: scrim.querySelector('#' + FIELDS.startTo),
      targetFrom: scrim.querySelector('#' + FIELDS.targetFrom),
      targetTo: scrim.querySelector('#' + FIELDS.targetTo),
      amountFrom: scrim.querySelector('#' + FIELDS.amountFrom),
      amountTo: scrim.querySelector('#' + FIELDS.amountTo),
      commented: scrim.querySelector('#' + FIELDS.onlyCommented),
      badge: scrim.querySelector('.tab__badge'),
      clear: scrim.querySelector('[data-rhf-clear]'),
      apply: scrim.querySelector('[data-rhf-apply]')
    };
    if (!next.startFrom || !next.startTo || !next.targetFrom || !next.targetTo
      || !next.amountFrom || !next.amountTo || !next.commented || !next.badge
      || !next.clear || !next.apply) return null;
    ui = next;
    scrim.__rhFilterUi = next;
    scrim.addEventListener('input', syncState);
    scrim.addEventListener('change', syncState);
    next.clear.addEventListener('click', clearAll);
    next.apply.addEventListener('click', apply);
    syncState();
    return api;
  }

  var api = {
    bind: bind,
    open: open,
    preview: preview,
    fill: fill,
    empty: empty,
    normalize: normalize,
    count: count
  };

  window.PostModalRsbuAdjustmentsFilter = api;
})();
