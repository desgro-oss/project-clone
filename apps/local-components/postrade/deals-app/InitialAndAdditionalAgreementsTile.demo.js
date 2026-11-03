/* ============================================================
   InitialAndAdditionalAgreementsTile.demo.js — сценарий демо витрины для тайла
   «Договор и дополнительные соглашения». Пишется руками; страницу рядом
   собирает kit-build.mjs и подключает этот файл последним.

   Что добавляет к общему демо (оси данных и прав — из CSS виджета):
   - ось «Тип продукта» — 9 типов тайла (НКЛ, Deprecated, Транш, Акции/Доли,
     Опционы/РЕПО, Корпдоговор, Обеспечения, Гарантия с баланса ПАО, НКЛ с
     баланса ПАО): свой состав полей у каждого;
   - контрол «Есть ДС» — добавляет номер и дату подписания последнего ДС;
   - контрол «Длинные значения» — те же данные с самыми длинными значениями;
   - состояние «Заполнено частично» — CSS его не различает: та же разметка,
     другие данные (нет даты подписания и плановой даты);
   - данные — из fixtures.json тайла; рисует их
     InitialAndAdditionalAgreementsTile.js (PostTileInitialAndAdditionalAgreements.render),
     те же функции, что на странице договора;
   - «Все состояния рядом» — матрица макета «Tile_Contract_&_AdditionalAgreement»:
     строки — 9 типов, колонки — шесть сочетаний «данные × ДС × правка».
   ============================================================ */
(function () {
  'use strict';

  var API = function () { return window.PostTileInitialAndAdditionalAgreements; };

  function variantOptions() {
    var v = (API() && API().VARIANTS) || { 'loan-ncl': 'НКЛ' };
    return Object.keys(v).map(function (k) { return [k, v[k]]; });
  }

  /* Колонки матрицы — порядок строк макета сверху вниз */
  var COLS = [
    { label: 'Нет данных · правка доступна', st: { state: 'empty', mode: 'edit', ds: false } },
    { label: 'Данные есть · правка доступна', st: { state: 'data', mode: 'edit', ds: false } },
    { label: 'Данные и ДС · правка доступна', st: { state: 'data', mode: 'edit', ds: true } },
    { label: 'Нет данных · просмотр', st: { state: 'empty', mode: 'view', ds: false } },
    { label: 'Данные есть · просмотр', st: { state: 'data', mode: 'view', ds: false } },
    { label: 'Данные и ДС · просмотр', st: { state: 'data', mode: 'view', ds: true } }
  ];

  function pick(fx, st) {
    var src = st.long && fx.long ? fx.long : null;
    var own = (src && src.variants && src.variants[st.variant]) || (fx.variants && fx.variants[st.variant]) || { data: {} };
    var view = {
      data: own.data,
      plannedRepaymentDate: fx.plannedRepaymentDate,
      lastAgreement: st.ds ? fx.lastAgreement : null,
      lastAgreementNumber: st.ds ? ((src && src.lastAgreementNumber) || fx.lastAgreementNumber) : null
    };
    if (st.state === 'partial' && fx.partial) {
      view.data = fx.partial.data;
      view.plannedRepaymentDate = fx.partial.plannedRepaymentDate;
    }
    return view;
  }

  window.IBPKitDemo.register('InitialAndAdditionalAgreementsTile', {
    /* «Заполнено частично» CSS тайла не различает: разметка та же, что у
       «Данные есть», отличаются данные. */
    states: ['partial'],
    controls: function (defs) {
      return defs.concat([
        { key: 'variant', label: 'Тип продукта', value: 'loan-ncl', options: variantOptions() },
        { key: 'ds', label: 'Есть ДС', bool: true, value: false },
        { key: 'long', label: 'Длинные значения', bool: true, value: false }
      ]);
    },
    apply: function (tile, st, ctx) {
      var api = API();
      if (!api) return;
      var variant = st.variant || 'loan-ncl';
      var mode = st.mode === 'edit' ? 'edit' : 'view';
      if (st.state === 'loading') {
        tile.setAttribute('data-variant', variant);
        tile.setAttribute('data-mode', mode);
        tile.setAttribute('data-state', 'loading');
        api.syncActions(tile);
        return;
      }
      var s = { variant: variant, state: st.state, ds: st.ds, long: st.long };
      var view = pick(ctx.fixtures || {}, s);
      view.variant = variant;
      view.mode = mode;
      if (st.state === 'empty') { view.data = null; view.lastAgreement = null; view.lastAgreementNumber = null; }
      api.render(tile, view);
      /* «Заполнено частично» — свой атрибут для оси конструктора; разметка та же */
      if (st.state === 'partial') tile.setAttribute('data-state', 'partial');
    },
    matrix: function () {
      var keys = Object.keys((API() && API().VARIANTS) || { 'loan-ncl': 'НКЛ' });
      var names = (API() && API().VARIANTS) || {};
      return {
        cols: COLS.map(function (c) { return c.label; }),
        rows: keys.map(function (k) {
          return {
            label: names[k] || k,
            cells: COLS.map(function (c) {
              return { st: { variant: k, state: c.st.state, mode: c.st.mode, ds: c.st.ds } };
            })
          };
        })
      };
    }
  });
})();
