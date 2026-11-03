/* ============================================================
   DeleteFundModal.demo.js — сценарий демо витрины для окна «Удалить фонд».
   Пишется руками; страницу рядом собирает kit-build.mjs и подключает этот
   файл последним.

   Что добавляет к общему демо:
   - «Заполнено частично» — CSS его не различает: у фонда нет ИНН и КПП и
     активов, на их месте прочерк;
   - «Длинные значения» — ключ long в fixtures.json;
   - блок «Данные фонда» рисует само окно (DeleteFundModal.render) — та же
     функция, что на странице.
   ============================================================ */
(function () {
  'use strict';

  window.IBPKitDemo.register('DeleteFundModal', {
    states: ['partial'],
    controls: function (defs) {
      return defs.concat([{ key: 'long', label: 'Длинные значения', bool: true, value: false }]);
    },
    apply: function (scrim, st, ctx) {
      var M = window.DeleteFundModal;
      if (!M) return;
      var all = ctx.fixtures || {};
      var fx = st.long ? all.long : (st.state === 'partial' ? all.partial : all.data);
      M.render(scrim, { fund: (fx || {}).fund });
    }
  });
})();
