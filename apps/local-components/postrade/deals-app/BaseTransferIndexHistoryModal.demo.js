/* ============================================================
   BaseTransferIndexHistoryModal.demo.js — сценарий демо витрины для окна
   «История изменения базового индекса». Пишется руками; страницу рядом
   собирает kit-build.mjs и подключает этот файл последним.

   Окно — справка: правки нет, строки читает из стора на открытии, витрине
   стор не нужен — open({ rows }) принимает строки аргументом, а на inline-
   окне витрины показ поверх подавлен (modal-scrim--inline). Без сценария
   на витрине таблица пуста; сценарий подставляет строки из fixtures.json
   функцией самого окна:
   - «Есть данные» — три строки, от новых к старым;
   - «Нет данных» — строк нет, пагинации нет;
   - «Много строк» — 130 строк, три страницы по 50: сортировку шапки и
     пагинацию ведёт само окно.
   На страницах этот файл не подключается — там окно открывает страница.
   ============================================================ */
(function () {
  'use strict';

  var LABELS = {
    data: 'Есть данные',
    empty: 'Нет данных',
    long: 'Много строк (пагинация)'
  };

  window.IBPKitDemo.register('BaseTransferIndexHistoryModal', {
    states: ['data', 'empty', 'long'],
    labels: LABELS,
    controls: function (defs) {
      defs.forEach(function (d) { if (d.key === 'state') d.value = 'data'; });
      return defs;
    },
    apply: function (scrim, st, ctx) {
      var M = window.PostModalBaseTransferIndexHistory;
      var f = (ctx.fixtures || {})[st.state];
      if (!M || !f) return;
      var api = M.bind(scrim);
      if (!api) return;
      api.open({ rows: f.rows || [] });
    }
  });
})();
