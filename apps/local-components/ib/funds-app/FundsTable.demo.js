/* ============================================================
   FundsTable.demo.js — сценарий демо витрины для «Списка фондов».
   Пишется руками; страницу рядом собирает kit-build.mjs и подключает этот файл последним.

   CSS виджета различает только «Загрузку» (разметка фрагмента): строки, «Данных нет»,
   «Ничего не найдено» и выбор фонда рисует сам виджет из данных. Поэтому демо добавляет
   состояния сценарием и рисует их функциями виджета — FundsTable.init / applyFilters /
   select, — теми же, что на странице «Фонды». Данные — fixtures.json:
   - состояния: Загрузка · Данные есть · Заполнено частично · Фонд выбран ·
     Ничего не найдено · Данных нет;
   - контрол «Длинные значения» — длинные названия, четыре бенефициара, три типа.
   Кнопка «⋮» в витрине ничего не открывает: меню принадлежит странице.
   «Настройки таблицы» открывает стандартное окно ДС TableSettings (рантайм ДС).
   ============================================================ */
(function () {
  'use strict';

  window.IBPKitDemo.register('FundsTable', {
    states: ['data', 'partial', 'selected', 'notfound', 'empty'],
    labels: { selected: 'Фонд выбран', notfound: 'Ничего не найдено' },
    controls: function (defs) {
      defs.forEach(function (d) { if (d.key === 'state') d.value = 'data'; });
      return defs.concat([{ key: 'long', label: 'Длинные значения', bool: true, value: false }]);
    },
    cases: function (defs) {
      return defs.concat([{ label: 'Данные есть · длинные значения', st: { state: 'data', long: true } }]);
    },
    apply: function (root, st, ctx) {
      var T = window.FundsTable;
      var fx = ctx.fixtures || {};
      if (!T || st.state === 'loading') return;
      var key = st.long && st.state !== 'empty' ? 'long' : st.state;
      var f = fx[key];
      if (!f) return;
      T.applyFilters(root, f.filters || null);
      T.select(root, f.selected || null);
      T.init(root, { funds: f.funds || [] });
    }
  });
})();
