/* ============================================================
   FixationHistoryTable.demo.js — сценарий демо витрины для истории фиксаций ЭПС/ВБС.
   Пишется руками; страницу рядом собирает kit-build.mjs и подключает этот файл последним.

   CSS виджета различает только «Загрузку»; остальные состояния — те же рантаймы и другие
   данные, которые таблице отдает страница. Поэтому демо добавляет состояния сценарием и
   рисует их функцией самого виджета PostFixationHistoryTable.render — той же, что на
   странице «Финансовые метрики». Данные — fixtures.json виджета.
   - состояния: Загрузка · Данные есть · По дате (второй вид) · Данных нет · Длинные
     значения;
   - контрол «Режим прав» — «Редактирование» с колонкой «Действия» или «Только просмотр» без
     нее; контрол «Идет пересчет метрик» — корзины в строках выключены;
   - в живой таблице переключатель вида, сортировку даты и сворачивание групп ведет сам виджет; клик
     по корзине шлет событие fmfixationaction — удаление выполняет страница, на витрине
     оно ничего не меняет.
   ============================================================ */
(function () {
  'use strict';

  var LABELS = { byDate: 'По дате', long: 'Длинные значения', edit: 'Редактирование', view: 'Только просмотр' };

  window.IBPKitDemo.register('FixationHistoryTable', {
    states: ['data', 'byDate', 'empty', 'long'],
    labels: LABELS,
    controls: function (defs) {
      defs.forEach(function (d) { if (d.key === 'state') d.value = 'data'; });
      return defs.concat([
        { key: 'mode', label: 'Режим прав', value: 'edit', options: [['edit', LABELS.edit], ['view', LABELS.view]] },
        { key: 'busy', label: 'Идет пересчет метрик', bool: true, value: false }
      ]);
    },
    cases: function (defs) {
      return defs.concat([
        { label: 'Данные есть · только просмотр', st: { state: 'data', mode: 'view' } },
        { label: 'Данные есть · идет пересчет метрик', st: { state: 'data', busy: true } }
      ]);
    },
    apply: function (root, st, ctx) {
      var T = window.PostFixationHistoryTable;
      var f = (ctx.fixtures || {})[st.state];
      if (!T || !f) return;
      root.setAttribute('data-view', f.view || 'BY_FI');
      T.render(root, f.fixations, { mode: st.mode || f.mode || 'edit', busy: !!st.busy || !!f.busy });
    }
  });
})();
