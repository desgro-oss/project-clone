/* =========================================================================
   FinMetricsNotify — сообщения финансовых метрик: снек по исходу расчёта и
   сообщения об удалении фиксации ЭПС/ВБС.
   Подключить ПОСЛЕ ds-body.js (нужны DSSnack и DSToast) и fin-metrics-store.js.

   Экспорт: window.FinMetricsNotify = {
     calculation(res)  — res — результат FinMetricsStore.calculate():
                         { outcome: 'OK'|'PARTIAL'|'FAILED', calculated, failed }
     fixationNotLast() — снек ошибки: удалить можно только последнюю фиксацию ФИ
     fixationRemoved() — тост «Фиксация ЭПС/ВБС удалена» (kind bar, tone success)
     fixationStarted() — тост «Расчет фиксации ЭПС/ВБС запущен» (окно закрыто, расчёт идёт)
     fixationRule(v)   — снек нарушения правила: v — элемент FinMetricsStore.checkFixations()
     fixationResult(res) — итог FinMetricsStore.saveFixations(): снек ошибки на каждый ФИ
                         и один зелёный «Фиксация ЭПС/ВБС выполнена» / «ФИ: …» (текст зелёного —
                         решение агента: на макетах его нет, вопрос 32 задачи RE0033)
     exportDone()      — снек success «Файл выгружен» (текст придуман: на макетах успеха нет, Э8)
     exportFailed()    — снек error «Ошибка» / «Не удалось выгрузить файл. Попробуйте еще раз.» (макет)
   }

   Один снек на исход (ответы человека 21.10.2026, RE0033):
     OK      — success «Операция выполнена» / «Рассчитаны метрики для ФИ: …»
     PARTIAL — error «Операция выполнена частично» / «Рассчитано ФИ: N из M»
     FAILED  — error «Операция не выполнена» / «Не рассчитаны метрики для ФИ: …»

   Удаление фиксации (Э5, RE0033): клик по корзине не последней фиксации —
   error-снек «Невозможно удалить фиксацию ЭПС/ВБС» (ответ 33), после удаления
   последней — тёмный тост. Опечатка макета «Фиксации ЭПС/ВБС удалена»
   исправлена на «Фиксация…» (решение агента 7).

   Общий для тайла «Финансовые метрики» на странице сделки и страницы
   «Финансовые метрики»: тексты в одном месте. Файл без разметки — искать
   классы ему нечего, поэтому его можно подключать на страницу без тайла.
   ========================================================================= */
(function () {
  'use strict';

  function names(list) {
    return (list || []).map(function (c) { return c.name; }).join(', ');
  }

  function calculation(res) {
    if (!window.DSSnack || !res) return;
    var done = (res.calculated || []).length;
    var total = done + (res.failed || []).length;
    if (res.outcome === 'OK') {
      window.DSSnack.show({ tone: 'success', title: 'Операция выполнена', text: 'Рассчитаны метрики для ФИ: ' + names(res.calculated) });
    } else if (res.outcome === 'PARTIAL') {
      window.DSSnack.show({ tone: 'error', title: 'Операция выполнена частично', text: 'Рассчитано ФИ: ' + done + ' из ' + total });
    } else {
      window.DSSnack.show({ tone: 'error', title: 'Операция не выполнена', text: 'Не рассчитаны метрики для ФИ: ' + names(res.failed) });
    }
  }

  function fixationNotLast() {
    if (!window.DSSnack) return;
    window.DSSnack.show({ tone: 'error', title: 'Невозможно удалить фиксацию ЭПС/ВБС', text: 'Вы можете удалить только последнюю фиксацию для каждого ФИ', dedup: true });
  }

  function fixationRemoved() {
    if (!window.DSToast) return;
    window.DSToast.show({ message: 'Фиксация ЭПС/ВБС удалена', kind: 'bar', tone: 'success' });
  }

  /* ── Фиксация ЭПС/ВБС: окно (Э6, RE0033) ────────────────────────── */

  /* ISO-дата → «ДД.ММ.ГГГГ» без часовых поясов */
  function fmtDate(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '');
    return m ? m[3] + '.' + m[2] + '.' + m[1] : '';
  }

  function fixationStarted() {
    if (!window.DSToast) return;
    window.DSToast.show({ message: 'Расчет фиксации ЭПС/ВБС запущен', kind: 'bar', tone: 'neutral' });
  }

  /* Нарушение правила (checkFixations) — снек; тексты листов «Фиксация ЭПС_ВБС» и
     «Первоначальный расчет». «Первичная» с макета — «первоначальная» (решение агента 7). */
  function fixationRule(v) {
    if (!window.DSSnack || !v) return;
    var text;
    if (v.code === 'DATE_NOT_AFTER_LAST') {
      text = 'Невозможно рассчитать фиксацию для ФИ ' + v.fiName + ' на ' + fmtDate(v.date) + '. Дата новой фиксации должна быть позже даты последней фиксации';
    } else if (v.code === 'INITIAL_EXISTS') {
      text = 'Для ФИ ' + v.fiName + ' уже рассчитана первоначальная фиксация ЭПС/ВБС.';
    } else {
      text = 'Для ФИ ' + v.fiName + ' еще не рассчитана первоначальная фиксация ЭПС/ВБС. Измените тип модификации на "Первоначальная".';
    }
    window.DSSnack.show({ tone: 'error', title: 'Расчет фиксации ЭПС/ВБС не выполнен', text: text });
  }

  /* Итог расчёта «на бэке»: снек на каждый ФИ с ошибкой, зелёный — о выполненных (ответ 32). */
  function fixationResult(res) {
    if (!window.DSSnack || !res) return;
    (res.failed || []).forEach(function (f) {
      window.DSSnack.show({
        tone: 'error', title: 'Расчет фиксации ЭПС/ВБС не выполнен',
        text: 'Невозможно рассчитать фиксацию для ФИ ' + f.name + (f.date ? ' на ' + fmtDate(f.date) : '') + '.'
      });
    });
    if ((res.saved || []).length) {
      window.DSSnack.show({ tone: 'success', title: 'Фиксация ЭПС/ВБС выполнена', text: 'ФИ: ' + names(res.saved) });
    }
  }

  /* ── Выгрузка отчёта (Э8, RE0033) ───────────────────────────────── */

  function exportDone() {
    if (!window.DSSnack) return;
    window.DSSnack.show({ tone: 'success', title: 'Файл выгружен', text: 'Отчет финансовых метрик выгружен в XLSX.' });
  }

  function exportFailed() {
    if (!window.DSSnack) return;
    window.DSSnack.show({ tone: 'error', title: 'Ошибка', text: 'Не удалось выгрузить файл. Попробуйте еще раз.' });
  }

  window.FinMetricsNotify = {
    calculation: calculation, fixationNotLast: fixationNotLast, fixationRemoved: fixationRemoved,
    fixationStarted: fixationStarted, fixationRule: fixationRule, fixationResult: fixationResult,
    exportDone: exportDone, exportFailed: exportFailed
  };
})();
