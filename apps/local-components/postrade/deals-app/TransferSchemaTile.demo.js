/* ============================================================
   TransferSchemaTile.demo.js — сценарий демо витрины для карточки процентной
   схемы ЕТС. Пишется руками; страницу рядом собирает kit-build.mjs и подключает
   этот файл последним.

   У карточки нет оси data-state, поэтому сценарий сам задаёт то, что она различает:
   - тип ставки: «Плавающая» (формула «КС+2%») и «Фиксированная» («7,5%»);
   - режим прав: правка доступна (⋮ с «Изменить» и «Удалить») / недоступна (⋮ нет в разметке);
   - контрол «Комментарий»: есть / нет (прочерк) / длинный (одна строка с эллипсисом);
   - данные — из fixtures.json карточки; рисует их TransferSchemaTile.js
     (PostTileTransferSchema.renderList), те же функции, что на странице;
   - «Все состояния рядом» — строки: правка доступна / недоступна, колонки: плавающая /
     фиксированная ставка.
   ============================================================ */
(function () {
  'use strict';

  var API = function () { return window.PostTileTransferSchema; };

  var MODES = [['edit', 'Правка доступна'], ['view', 'Правка недоступна']];
  var COMMENTS = [['yes', 'Есть'], ['none', 'Нет'], ['long', 'Длинный']];

  function pick(fx, st) {
    var src = st.state === 'fixed' ? fx.fixed : fx.data;
    var view = {};
    for (var k in src) if (Object.prototype.hasOwnProperty.call(src, k)) view[k] = src[k];
    if (st.comment === 'none') view.comment = null;
    else if (st.comment === 'long' && fx.long) view.comment = fx.long.comment;
    else if (st.state === 'fixed' && !view.comment) view.comment = (fx.data || {}).comment;
    return view;
  }

  window.IBPKitDemo.register('TransferSchemaTile', {
    states: ['float', 'fixed'],
    labels: { float: 'Плавающая ставка', fixed: 'Фиксированная ставка' },
    controls: function (defs) {
      var out = defs.filter(function (d) { return d.key !== 'mode'; });
      return out.concat([
        { key: 'mode', label: 'Режим прав', value: 'edit', options: MODES },
        { key: 'comment', label: 'Комментарий', value: 'yes', options: COMMENTS }
      ]);
    },
    apply: function (tile, st, ctx) {
      var api = API();
      if (!api) return;
      var mode = st.mode === 'view' ? 'view' : 'edit';
      var view = pick(ctx.fixtures || {}, st);
      view.mode = mode;
      view.id = String(view.id || 'TS') + '-demo-' + mode + '-' + (st.state || 'float') + '-' + (st.comment || 'yes');
      api.renderList(tile, { mode: mode, items: [view] });
    },
    matrix: function () {
      return {
        cols: ['Плавающая ставка', 'Фиксированная ставка'],
        rows: MODES.map(function (m) {
          return {
            label: m[1],
            cells: [
              { st: { state: 'float', mode: m[0], comment: 'yes' } },
              { st: { state: 'fixed', mode: m[0], comment: 'yes' } }
            ]
          };
        })
      };
    }
  });
})();
