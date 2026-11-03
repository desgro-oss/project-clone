/* ============================================================
   TrancheLoanLimitsModal.demo.js — сценарий демо витрины для окна
   «Валюта транша». Пишется руками; страницу рядом собирает kit-build.mjs и
   подключает этот файл последним.

   Без него окно на витрине статично: разметка держит пример значений, а список
   валют пуст — его заполняет скрипт окна, который на витрине никто не связывает
   со стором. Сценарий зовёт PostModalTrancheLoanLimits.use(fixtures.view):
   окно заполняется значениями транша и получает заполненный список валют.
   На странице транша этот файл не подключается — там bind с get/save даёт сама
   страница.
   ============================================================ */
(function () {
  'use strict';

  window.IBPKitDemo.register('TrancheLoanLimitsModal', {
    apply: function (scrim, st, ctx) {
      var M = window.PostModalTrancheLoanLimits;
      var fx = ctx.fixtures || {};
      if (!M || !fx.view) return;
      M.use(fx.view);
    }
  });
})();
