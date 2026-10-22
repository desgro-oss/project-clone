/* ============================================================
   FinancialMetricsDownloadReportModal.demo.js — сценарий демо витрины для окна «Выгрузка отчета».
   Пишется руками; страницу рядом собирает kit-build.mjs и подключает этот файл последним.

   Окно одно, а видов два — с шифрованием (сеть Сигма) и без (Альфа / Омега), и различает их не
   CSS, а сеть, которую страница узнаёт по логину. Поэтому вид объявляет сценарий: контрол «Сеть
   и получатели» (данные — fixtures.json).
   - в живом окне — api.load: вид и получатели настоящие, добавление и чекбоксы работают;
   - в копиях «Все состояния» — preview: снимок без обработчиков.
   ============================================================ */
(function () {
  'use strict';

  /* ключ контрола → ключ fixtures.json */
  var VIEWS = { plain: 'partial', encEmpty: 'empty', encData: 'data', encLong: 'long' };

  window.IBPKitDemo.register('FinancialMetricsDownloadReportModal', {
    controls: function (defs) {
      return defs.concat([
        { key: 'view', label: 'Сеть и получатели', value: 'plain',
          options: [['plain', 'Альфа — без шифрования'], ['encEmpty', 'Сигма — получателей нет'],
            ['encData', 'Сигма — три получателя'], ['encLong', 'Сигма — длинные ФИО']] }
      ]);
    },
    cases: function () {
      return [
        { label: 'Альфа — без шифрования', st: { view: 'plain' } },
        { label: 'Сигма — получателей нет', st: { view: 'encEmpty' } },
        { label: 'Сигма — три получателя', st: { view: 'encData' } },
        { label: 'Сигма — длинные ФИО', st: { view: 'encLong' } }
      ];
    },
    apply: function (scrim, st, ctx) {
      var M = window.PostDealDownloadReportModal;
      var fx = (ctx.fixtures || {})[VIEWS[st.view || 'plain']] || {};
      if (!M) return;
      if (ctx.live) {
        var api = M.bind(scrim, { employees: window.MOCK_REPORT_EMPLOYEES });
        if (api) api.load({ encrypted: !!fx.encrypted }, fx.recipients || []);
      } else {
        M.preview(scrim, fx);
      }
    }
  });
})();
