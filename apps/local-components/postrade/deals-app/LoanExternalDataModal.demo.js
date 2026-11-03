/* ============================================================
   LoanExternalDataModal.demo.js — сценарий демо витрины для окна
   «Техническая информация». Пишется руками; страницу рядом собирает
   kit-build.mjs и подключает этот файл последним.

   Окно не биндится само (bind зовёт страница-хозяин), поэтому без сценария
   на витрине оно статично: разметка держит пример значений, список полей
   потребителя не переключается. Сценарий зовёт PostModalLoanExternalData.use
   и добавляет контрол «Потребитель» — НКЛ | Транш (решение человека
   02.11.2026, RE0049): у Транша показывается поле «CRM ID продукта».
   На страницах этот файл не подключается — там bind делает страница.
   ============================================================ */
(function () {
  'use strict';

  window.IBPKitDemo.register('LoanExternalDataModal', {
    controls: function (defs) {
      return defs.concat([
        { key: 'consumer', label: 'Потребитель', value: 'nkl',
          options: [['nkl', 'НКЛ'], ['tranche', 'Транш']] }
      ]);
    },
    apply: function (scrim, st, ctx) {
      var M = window.PostModalLoanExternalData;
      if (!M) return;
      var api = M.bind(scrim);
      if (!api) return;
      api.consumer(st.consumer || 'nkl');
      api.use(ctx.fixtures && ctx.fixtures.view ? ctx.fixtures.view : {});
    }
  });
})();
