/* ============================================================
   RsbuRecalcWarningModal.js — окно предупреждения при пересчёте метрик, когда у
   зафиксированного индикатора «Начисленные проценты за период» осталась не
   перенесённая сумма (RE0034, Э5).

   Делает только то, чего нет в рантаймах ДС: вписывает сумму и ФИ в текст и отдаёт
   страницам результат выбора. Открытие, фокус, Esc, крестик — Modal ДС.

   API:
     PostRsbuRecalcWarning.open({ amount, currencyCode, fiName, date }) → Promise<boolean>
       amount — расхождение на первой дате, где оно осталось (со знаком), date — эта дата (ISO)
       true — нажали «Пересчитать»; false — «Отменить», крестик, Esc.
       Окно уже открыто — вернёт тот же Promise.
   ============================================================ */
(function () {
  'use strict';

  var NBSP = ' ';
  var pending = null;

  function money(n) {
    var p = Number(n).toFixed(2).split('.');
    return p[0].replace(/\B(?=(\d{3})+(?!\d))/g, NBSP) + ',' + p[1];
  }

  function open(info) {
    if (pending) return pending;
    var scrim = document.getElementById('rrw-scrim');
    if (!scrim || !window.DSModal) return Promise.resolve(true);
    info = info || {};
    scrim.querySelector('[data-rrw-amount]').textContent = money(info.amount || 0) + ' ' + (info.currencyCode || '');
    scrim.querySelector('[data-rrw-fi]').textContent = info.fiName || '';
    var d = info.date ? String(info.date) : '';
    scrim.querySelector('[data-rrw-date]').textContent = d ? d.slice(8, 10) + '.' + d.slice(5, 7) + '.' + d.slice(0, 4) : '';
    pending = new Promise(function (resolve) {
      window.DSModal.open(scrim, {
        onClose: function (ok) {
          pending = null;
          resolve(ok === true);
        }
      });
    });
    return pending;
  }

  /* «Пересчитать» закрывает окно с результатом «да» */
  document.addEventListener('click', function (e) {
    var ok = e.target.closest && e.target.closest('[data-rrw-ok]');
    if (!ok || !pending) return;
    window.DSModal.closeTop(true);
  });

  window.PostRsbuRecalcWarning = { open: open };
})();
