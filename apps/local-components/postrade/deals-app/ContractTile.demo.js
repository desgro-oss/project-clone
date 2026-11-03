/* ============================================================
   ContractTile.demo.js — сценарий демо витрины для тайла «Договор» внутренней
   страницы «Договор и дополнительные соглашения». Пишется руками; страницу рядом
   собирает kit-build.mjs и подключает этот файл последним.

   Что добавляет к общему демо (оси данных и прав — из CSS виджета):
   - ось «Тип продукта» — 9 типов тайла «Договор» (НКЛ, Транш, Акции/Доли,
     Опционы/РЕПО, Корпдоговор, Обеспечения, Гарантия с баланса ПАО, НКЛ с
     баланса ПАО, Соглашение о комп. выплатах): свой состав полей у каждого;
   - контрол «Длинные значения» — те же данные с самыми длинными значениями;
   - состояние «Заполнено частично» — CSS его не различает: та же разметка,
     другие данные (нет даты подписания и плановой даты);
   - данные — из fixtures.json тайла; рисует их ContractTile.js
     (PostTileContract.render), те же функции, что на странице;
   - «Все состояния рядом» — матрица макета «Tile_Contract»: строки — 9 типов,
     колонки — «нет данных / данные есть» × «правка доступна / просмотр».
   Словарь типов (подписи) берётся из data/loan-contract-fields.js
   (LOAN_CONTRACT_VARIANTS); нет его — один тип «НКЛ».
   ============================================================ */
(function () {
  'use strict';

  var API = function () { return window.PostTileContract; };

  function variantNames() {
    return window.LOAN_CONTRACT_VARIANTS || { 'loan-ncl': 'НКЛ' };
  }

  function variantOptions() {
    var v = variantNames();
    return Object.keys(v).map(function (k) { return [k, v[k]]; });
  }

  /* Колонки матрицы — «данные × правка», как на макете «Tile_Contract» */
  var COLS = [
    { label: 'Нет данных · правка доступна', st: { state: 'empty', mode: 'edit' } },
    { label: 'Данные есть · правка доступна', st: { state: 'data', mode: 'edit' } },
    { label: 'Нет данных · просмотр', st: { state: 'empty', mode: 'view' } },
    { label: 'Данные есть · просмотр', st: { state: 'data', mode: 'view' } }
  ];

  function pick(fx, st) {
    var variant = st.variant || 'loan-ncl';
    var longOwn = st.long && fx.long && fx.long.variants && fx.long.variants[variant];
    var own = longOwn || (fx.variants && fx.variants[variant]) || { data: {} };
    var view = { data: own.data, plannedRepaymentDate: fx.plannedRepaymentDate };
    if (st.state === 'partial' && fx.partial) {
      view.data = fx.partial.data;
      view.plannedRepaymentDate = fx.partial.plannedRepaymentDate;
    }
    return view;
  }

  window.IBPKitDemo.register('ContractTile', {
    /* «Заполнено частично» CSS тайла не различает: разметка та же, что у
       «Данные есть», отличаются данные. */
    states: ['partial'],
    controls: function (defs) {
      return defs.concat([
        { key: 'variant', label: 'Тип продукта', value: 'loan-ncl', options: variantOptions() },
        { key: 'long', label: 'Длинные значения', bool: true, value: false }
      ]);
    },
    apply: function (tile, st, ctx) {
      var api = API();
      if (!api) return;
      var variant = st.variant || 'loan-ncl';
      var mode = st.mode === 'edit' ? 'edit' : 'view';
      var view = pick(ctx.fixtures || {}, { variant: variant, state: st.state, long: st.long });
      view.variant = variant;
      view.mode = mode;
      if (st.state === 'empty') { view.data = null; view.plannedRepaymentDate = null; }
      api.render(tile, view);
      /* «Заполнено частично» — свой атрибут для оси конструктора; поля те же */
      if (st.state === 'partial') tile.setAttribute('data-state', 'partial');
    },
    matrix: function () {
      var names = variantNames();
      return {
        cols: COLS.map(function (c) { return c.label; }),
        rows: Object.keys(names).map(function (k) {
          return {
            label: names[k] || k,
            cells: COLS.map(function (c) {
              return { st: { variant: k, state: c.st.state, mode: c.st.mode } };
            })
          };
        })
      };
    }
  });
})();
