/* ============================================================
   FinancialMetricsTable.demo.js — сценарий демо витрины для отчета МСФО / РСБУ.
   Пишется руками; страницу рядом собирает kit-build.mjs и подключает этот файл последним.

   CSS виджета различает только «Загрузку»: отчет, «Нет данных» и «Фильтр применен» — одна
   разметка и разные данные, которые страница отдает таблице. Поэтому демо добавляет состояния
   сценарием и рисует их функцией самого виджета PostFinMetricsTable.render — той же, что на
   странице «Финансовые метрики». Данные — fixtures.json виджета (отчет РСБУ).
   - состояния: Загрузка · Данные есть · Заполнено частично · Фильтр применен · Данных нет;
   - контрол «Длинные значения» — подставляет отчет с длинными именами и большими числами;
   - в живом отчете крестик на чипе «Применено: N» сбрасывает фильтр, как на странице; сама
     кнопка «Фильтр» ничего не открывает — окно фильтра принадлежит странице.
   ============================================================ */
(function () {
  'use strict';

  var NO_FILTER = { fiIds: [], metrics: {} };

  window.IBPKitDemo.register('FinancialMetricsTable', {
    states: ['data', 'partial', 'filtered', 'empty'],
    labels: { filtered: 'Фильтр применен' },
    controls: function (defs) {
      defs.forEach(function (d) { if (d.key === 'state') d.value = 'data'; });
      return defs.concat([{ key: 'long', label: 'Длинные значения', bool: true, value: false }]);
    },
    cases: function (defs) {
      return defs.concat([{ label: 'Данные есть · длинные значения', st: { state: 'data', long: true } }]);
    },
    apply: function (root, st, ctx) {
      var T = window.PostFinMetricsTable;
      var fx = ctx.fixtures || {};
      if (!T) return;
      var loading = st.state === 'loading';
      var f = loading ? null : fx[st.long && st.state !== 'empty' ? 'long' : st.state];
      if (!loading && !f) return;
      var report = f ? f.report : null;
      T.render(root, report, (f && f.filter) || NO_FILTER);
      if (!ctx.live) return;
      root.__fmDemoReport = report;
      if (root.__fmDemoBound) return;
      root.__fmDemoBound = true;
      root.addEventListener('fmtablefilterreset', function () { T.render(root, root.__fmDemoReport, NO_FILTER); });
    }
  });
})();
