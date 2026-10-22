/* ============================================================
   KPITable.demo.js — сценарий демо витрины для отчета KPI.
   Пишется руками; страницу рядом собирает kit-build.mjs и подключает этот файл последним.

   CSS виджета различает только «Загрузку»: отчет, «Нет данных» и «Фильтр применен» — одна
   разметка и разные данные, которые страница отдает таблице. Поэтому демо добавляет состояния
   сценарием и рисует их функцией самого виджета PostKpiTable.render — той же, что на странице
   «Финансовые метрики». Данные — fixtures.json виджета: отчеты обеих подвкладок, фильтр и
   вид, с которого начинается состояние.
   - состояния: Загрузка · Данные есть · Заполнено частично · Фильтр применен · Данных нет;
   - контрол «Длинные значения» — подставляет отчет с длинными именами и большими числами;
   - вид «Краткий» / «Подробный» переключает сам виджет; в живом отчете крестик на чипе
     «Применено: N» сбрасывает фильтр, как на странице. Кнопка «Фильтр» ничего не открывает —
     окно фильтра принадлежит странице.
   ============================================================ */
(function () {
  'use strict';

  var NO_FILTER = { fiIds: [], metrics: {} };

  window.IBPKitDemo.register('KPITable', {
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
      var T = window.PostKpiTable;
      var fx = ctx.fixtures || {};
      if (!T) return;
      var loading = st.state === 'loading';
      var f = loading ? null : fx[st.long && st.state !== 'empty' ? 'long' : st.state];
      if (!loading && !f) return;
      var reports = f ? f.reports : null;
      root.setAttribute('data-view', (f && f.view) || 'KPI_SHORT');
      T.render(root, reports, (f && f.filter) || NO_FILTER);
      if (!ctx.live) return;
      root.__fmDemoReports = reports;
      if (root.__fmDemoBound) return;
      root.__fmDemoBound = true;
      root.addEventListener('fmtablefilterreset', function () { T.render(root, root.__fmDemoReports, NO_FILTER); });
    }
  });
})();
