/* ============================================================
   FixationModal.demo.js — сценарий демо витрины для окна «Фиксация ЭПС/ВБС».
   Пишется руками; страницу рядом собирает kit-build.mjs и подключает этот файл последним.

   В продукте карточки рисует open() по сеансу, а витрине сеанс не нужен: окно открывает и
   закрывает сама витрина. Поэтому демо рисует окно функцией PostFixationModal.preview — той
   же, что строит карточки на странице: поля живые (выбор ФИ, дата, тип, «+ Добавить ФИ»),
   «Сохранить» ничего не запускает.

   ФИ — сделки 1027 из FinMetricsStore: у первых двух есть первоначальная фиксация, у
   «127-Акции-203» нет. Значения расчёта — из fixtures.json окна.
   Контролы «Конструктора»:
   - «Сценарий» — пустое окно · ФИ и дата · предварительный расчет выполнен ·
     «Первоначальная» · ошибка предварительного расчета · повтор ФИ · ЕТС: загрузка ·
     нет или 0 · ошибка расчета · разные ЕТС (после «Сохранить») · введена вручную;
   - «Карточек» — 1–3: лишние — пустые карточки (у двух и более «⊖» доступна, у трёх
     тело окна прокручивается).
   ============================================================ */
(function () {
  'use strict';

  var DEAL = 1027;
  var DATE = '2030-08-15';

  function copy(o) { return JSON.parse(JSON.stringify(o)); }

  /* Стор метрик и стор ФИ — на сделку витрины; повторно не открываем. */
  function openStores() {
    var cards = window.FinInstrumentsStore;
    var fm = window.FinMetricsStore;
    if (!cards || !fm) return false;
    if (String(cards.dealId()) !== String(DEAL)) cards.use(DEAL);
    if (String(fm.dealId()) !== String(DEAL)) fm.use(DEAL);
    return true;
  }

  /* Ответ fixationContext с другим статусом ЕТС: значения нет, пока статус не OK */
  function withEts(ctx, status) {
    var c = copy(ctx);
    c.etsStatus = status;
    c.etsRate = null;
    c.etsDelta = null;
    if (status === 'MULTIPLE') c.etsValues = [14, 22.5, 22.5];
    return c;
  }

  function cardsFor(st, fx, cand) {
    var withInit = cand.filter(function (c) { return c.hasInitial; });
    var noInit = cand.filter(function (c) { return !c.hasInitial; });
    var a = withInit[0] && withInit[0].id;
    var b = (withInit[1] || withInit[0]) && (withInit[1] || withInit[0]).id;
    var n = noInit[0] && noInit[0].id;
    var ctx = fx.context;
    var filled = { fiId: a, date: DATE, ctx: copy(ctx) };
    var out = [];
    var alert = null;
    switch (st.scenario) {
      case 'filled':
        out.push(filled);
        break;
      case 'done':
        out.push({ fiId: a, date: DATE, typeCode: 'NON_SUBSTANTIAL', comment: 'Перенос даты платежа',
          ctx: copy(ctx), prelim: copy(fx.preliminary) });
        break;
      case 'initial':
        out.push({ fiId: n || a, typeCode: 'INITIAL' });
        break;
      case 'error':
        out.push(filled);
        alert = { title: 'Предварительный расчет не выполнен' };
        break;
      case 'duplicate':
        out.push({ fiId: a, date: DATE, typeCode: 'SUBSTANTIAL', ctx: copy(ctx), prelim: copy(fx.preliminary) });
        out.push({ fiId: a });
        break;
      case 'ets-loading':
        out.push({ fiId: a, date: DATE, ctxLoading: true });
        break;
      case 'ets-empty':
        out.push({ fiId: a, date: DATE, ctx: withEts(ctx, 'EMPTY') });
        break;
      case 'ets-failed':
        out.push({ fiId: a, date: DATE, ctx: withEts(ctx, 'FAILED') });
        break;
      case 'ets-multiple':
        out.push({ fiId: a, date: DATE, typeCode: 'NON_SUBSTANTIAL', ctx: withEts(ctx, 'MULTIPLE'), etsShown: true });
        alert = { title: 'Фиксация не может быть выполнена',
          text: 'В инструментах, включенных в ФИ, не совпадают значения ЕТС. Укажите значение ЕТС вручную или исправьте значение в инструментах и попробуйте выполнить фиксацию ЭПС/ВБС снова.' };
        break;
      case 'ets-manual':
        out.push({ fiId: a, date: DATE, ctx: withEts(ctx, 'MULTIPLE'), etsManual: 18.5 });
        break;
      default:
        out.push({});
    }
    while (out.length < Number(st.count || 1)) out.push({});
    return { cards: out, alert: alert };
  }

  window.IBPKitDemo.register('FixationModal', {
    controls: function (defs) {
      return defs.concat([
        { key: 'scenario', label: 'Сценарий', value: 'empty',
          options: [['empty', 'Пустое окно'], ['filled', 'ФИ и дата'], ['done', 'Предварительный расчет выполнен'],
            ['initial', '«Первоначальная»'], ['error', 'Ошибка предварительного расчета'], ['duplicate', 'Повтор ФИ'],
            ['ets-loading', 'ЕТС: загрузка'], ['ets-empty', 'ЕТС: нет или 0'], ['ets-failed', 'ЕТС: ошибка расчета'],
            ['ets-multiple', 'ЕТС: разные значения'], ['ets-manual', 'ЕТС: введена вручную']] },
        { key: 'count', label: 'Карточек', value: '1', options: [['1', '1'], ['2', '2'], ['3', '3']] }
      ]);
    },
    apply: function (scrim, st, ctx) {
      var fx = ctx.fixtures || {};
      var M = window.PostFixationModal;
      if (!M || !openStores()) return;
      M.preview(scrim, cardsFor(st, fx, window.FinMetricsStore.fixationCandidates()));
    }
  });
})();
