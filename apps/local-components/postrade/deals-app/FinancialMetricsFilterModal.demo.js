/* ============================================================
   FinancialMetricsFilterModal.demo.js — сценарий демо витрины для окна «Фильтр» отчета.
   Пишется руками; страницу рядом собирает kit-build.mjs и подключает этот файл последним.

   Окно заполняет не разметка, а данные вкладки отчета: какие ФИ и индикаторы есть и что уже
   выбрано. На странице их при каждом открытии отдает страница. Витрине слой поверх страницы
   не нужен, поэтому демо зовет PostFinMetricsFilter.preview — то же заполнение, что в open,
   но окно остается на месте. Данные — fixtures.json окна.
   - состояния: Фильтр пуст · Выбраны ФИ · Выбраны ФИ и индикаторы;
   - контрол «Длинные имена» — самые длинные имена ФИ и индикаторов;
   - в живом окне поля работают (выбор ФИ, чипы, индикаторы по ФИ, «Очистить фильтр»); копии
     «Все состояния» тоже живые, но «Применить» нигде ничего не закрывает.
   ============================================================ */
(function () {
  'use strict';

  window.IBPKitDemo.register('FinancialMetricsFilterModal', {
    states: ['empty', 'data', 'partial'],
    labels: { empty: 'Фильтр пуст', data: 'Выбраны ФИ', partial: 'Выбраны ФИ и индикаторы' },
    controls: function (defs) {
      defs.forEach(function (d) { if (d.key === 'state') d.value = 'data'; });
      return defs.concat([{ key: 'long', label: 'Длинные имена', bool: true, value: false }]);
    },
    cases: function (defs) {
      return defs.concat([{ label: 'Выбраны ФИ · длинные имена', st: { state: 'data', long: true } }]);
    },
    apply: function (scrim, st, ctx) {
      var M = window.PostFinMetricsFilter;
      var fx = ctx.fixtures || {};
      var f = st.long ? fx.long : fx[st.state];
      if (M && f) M.preview(scrim, f);
    }
  });
})();
