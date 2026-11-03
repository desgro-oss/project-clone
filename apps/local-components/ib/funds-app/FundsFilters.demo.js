/* ============================================================
   FundsFilters.demo.js — сценарий демо витрины для фильтров списка фондов.
   Пишется руками; страницу рядом собирает kit-build.mjs и подключает этот файл последним.

   CSS виджета состояний не различает: «Фильтры заданы» — та же разметка с другими
   значениями, «Фондов нет» — поля выключены атрибутом disabled. Поэтому состояния
   добавляет сценарий и рисует их функциями самого виджета: FundsFilters.init,
   setValue, setDisabled — теми же, что на странице FundsPipeline. Справочники —
   FUND_TYPE_LABELS и FUND_PRIORITY_LABELS из data/funds.js страницы-хозяина.
   Версия 3.000: ряд без карточки (на странице — в тулбаре таблицы), поля S;
   тип и приоритет — несколько значений сводкой «PE, +1», ширина — по самому
   длинному значению (init зовёт fit); init привязывает и тултип информера
   поиска — у каждой копии «Все состояния» свой.
   ============================================================ */
(function () {
  'use strict';

  window.IBPKitDemo.register('FundsFilters', {
    states: ['data', 'filtered', 'empty'],
    labels: { data: 'Фильтры не заданы', filtered: 'Фильтры заданы', empty: 'Фондов нет — поля выключены' },
    controls: function (defs) {
      defs.forEach(function (d) { if (d.key === 'state') d.value = 'data'; });
      return defs.concat([{ key: 'long', label: 'Длинные значения', bool: true, value: false }]);
    },
    cases: function (defs) {
      return defs.concat([{ label: 'Фильтры заданы · длинные значения', st: { state: 'filtered', long: true } }]);
    },
    apply: function (root, st, ctx) {
      var F = window.FundsFilters;
      var fx = ctx.fixtures || {};
      if (!F) return;
      var f = fx[st.long && st.state !== 'empty' ? 'long' : st.state] || fx.data || {};
      F.init(root, { types: window.FUND_TYPE_LABELS, priorities: window.FUND_PRIORITY_LABELS });
      F.setValue(root, f.filters, { silent: true });
      F.setDisabled(root, !!f.disabled);
    }
  });
})();
