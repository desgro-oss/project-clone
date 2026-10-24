/* ============================================================
   FinInstrumentCard.demo.js — сценарий демо витрины для «Карточки
   финансового инструмента». Пишется руками; страницу рядом собирает
   kit-build.mjs и подключает этот файл последним.

   Фрагмент карточки — эталон в <template>: карточки по нему рисует
   FinInstrumentCard.js (PostCardFinInstrument.html) — та же функция, что
   в тайле «Финансовые инструменты». Здесь она рисует образцы макета
   «Card-Fininstrument» из fixtures.json карточки:
   - ось «Тип ФИ» — пять типов макета (свой контрол);
   - состояния — колонки макета: Не заполнено (empty), Заполнено (data);
     CSS их не различает — разные данные, а не вид. Колонки «Ошибка» макета
     нет: состояние снято (решение человека 17.10.2026, RE0028);
   - режим прав — правка / просмотр (data-mode, из CSS карточки);
   - «Развёрнута» — свитч аккордеона Tile;
   - вид «Все состояния» — матрица витрины (RE0027): колонки макета ×
     строки «Развёрнута / Свёрнута» для выбранного типа.
   Кнопки карточки и заголовки-ссылки узлов в витрине ничего не открывают:
   события fiaction отдаёт тайл, а его на этой странице нет.
   ============================================================ */
(function () {
  'use strict';

  var TYPES = ['LOAN', 'SHARES', 'ADDITIONAL_YIELD', 'REPO', 'RECEIVABLES'];
  /* подписи типов — справочник модуля (data/mock-fin-instruments.js) */
  var TYPE_LABELS = window.FIN_INSTRUMENT_TYPE_LABELS || {};
  var LABELS = {
    empty: 'Не заполнено', data: 'Заполнено',
    edit: 'Редактирование', view: 'Просмотр'
  };
  /* колонки макета слева направо */
  var COLS = [
    { label: 'Не заполнено', st: { state: 'empty', mode: 'edit' } },
    { label: 'Не заполнено · просмотр', st: { state: 'empty', mode: 'view' } },
    { label: 'Заполнено', st: { state: 'data', mode: 'edit' } },
    { label: 'Заполнено · просмотр', st: { state: 'data', mode: 'view' } }
  ];

  function assign(to) {
    for (var i = 1; i < arguments.length; i++) {
      var src = arguments[i] || {};
      Object.keys(src).forEach(function (k) { to[k] = src[k]; });
    }
    return to;
  }

  /* Строка инструмента — как у стора: дата подписания и сумма с валютой
     в details, подпись суммы — по типу ФИ. */
  function nodeOf(n, field, currency) {
    return {
      id: n.id, number: n.number, name: n.name,
      kind: n.kind, hasPage: n.hasPage === true,
      details: [
        { field: 'signedAt', value: n.signedAt || null },
        { field: field, value: n.amount != null ? n.amount : null, currency: currency || 'RUB' }
      ],
      repaidAt: n.repaidAt || null,
      isIfrsOption: n.isIfrsOption === true
    };
  }

  /* FinInstrumentCardView образца: поля, заданные при создании, + данные
     состояния. */
  function viewOf(fx, type, state) {
    var t = (fx.types || {})[type];
    if (!t) return null;
    var labels = window.PRODUCT_DETAIL_LABELS || {};
    var v = {
      id: 'FX-' + type, typeCode: type, typeLabel: t.label, name: t.name,
      reportingLabel: fx.reportingLabel, amountField: t.amountField,
      amountLabel: labels[t.amountField] || '',
      balance: null, currency: null, fvAcLabel: null, targetIrr: null, amount: null,
      signedAt: null, plannedMaturityAt: null,
      counterparty: null, reserveCounterparty: null, allocationCounterparty: null,
      isDkkk: false, isTypeC: false, hasLinkedUnconditionalOption: false,
      rwaCodes: [], nodes: [], isRepaid: false, repaidAt: null
    };
    if (state === 'data') assign(v, t.data, fx.parties);
    v.nodes = (v.nodes || []).map(function (n) { return nodeOf(n, t.amountField, v.currency); });
    return v;
  }

  window.IBPKitDemo.register('FinInstrumentCard', {
    states: ['empty'],
    labels: LABELS,
    gallery: true,
    /* карточка — не тайл страницы: минимум высоты тайла к ней не относится */
    minHeight: 0,
    controls: function (defs) {
      /* ширина по умолчанию — карточка в тайле на 6 колонках, как на макете */
      defs.forEach(function (d) { if (d.key === 'width') d.value = 620; });
      return defs.concat([
        { key: 'type', label: 'Тип ФИ', value: 'LOAN',
          options: TYPES.map(function (k) { return [k, TYPE_LABELS[k] || k]; }) },
        { key: 'open', label: 'Развёрнута', bool: true, value: true }
      ]);
    },
    matrix: function () {
      return {
        cols: COLS.map(function (c) { return c.label; }),
        rows: [true, false].map(function (open) {
          return {
            label: open ? 'Развёрнута' : 'Свёрнута',
            cells: COLS.map(function (c) { return { st: assign({ open: open }, c.st) }; })
          };
        })
      };
    },
    /* Рендер отдаёт строку, а демо держит свой узел: переносим в него
       атрибуты и содержимое отрисованной карточки. */
    apply: function (el, st, ctx) {
      var C = window.PostCardFinInstrument;
      var view = viewOf(ctx.fixtures || {}, st.type || 'LOAN', st.state || 'data');
      if (!C || !view) return;
      var box = document.createElement('div');
      box.innerHTML = C.html(view, { mode: st.mode, open: st.open !== false });
      var card = box.firstElementChild;
      Array.prototype.slice.call(el.attributes).forEach(function (a) { el.removeAttribute(a.name); });
      Array.prototype.slice.call(card.attributes).forEach(function (a) { el.setAttribute(a.name, a.value); });
      while (el.firstChild) el.removeChild(el.firstChild);
      while (card.firstChild) el.appendChild(card.firstChild);
      el.__dsTile = null;
      if (window.DSTile) window.DSTile.wire(el);
    }
  });
})();
