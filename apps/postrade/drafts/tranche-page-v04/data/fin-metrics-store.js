/* =========================================================================
   FinMetricsStore — расчёт финансовых метрик текущей сделки и его отчёты.
   Подключить ПОСЛЕ mock-fin-metrics-calc.js, post-api.js, product-tree-store.js
   и fin-instruments-store.js (ФИ сделки — записи его базы; страница сначала
   открывает сделку у обоих сторов: FinInstrumentsStore.use(id), потом
   FinMetricsStore.use(id)).

   Экспорт: window.FinMetricsStore = {
     ready → Promise                         — загружены сохранённые расчёты
     persist(on)                             — false: витрина не читает и не пишет
     use(dealId)                             — открыть расчёт сделки
     dealId() → id|null
     state() → { code, busy, calculated, calculatedAt, done, total }
                 code: LOCKED (нет ФИ) | DEFAULT | ERROR (последняя попытка не
                 посчитала ни одного ФИ); calculated — есть успешный расчёт,
                 calculatedAt — его время (ISO); done · total — «Рассчитано ФИ:
                 N из M»; busy — идёт расчёт (в записи не хранится)
     calculate() → Promise<{ outcome: 'OK'|'PARTIAL'|'FAILED', calculated, failed }>
                 — имитация с задержкой; calculated · failed — [{id, name}]. Успешный пересчёт
                 запоминает для отчёта РСБУ пересчитанные платежи и корректировки (концепт v4)
     reportTabs() → [{ code, label, isEmpty, count? }]   — МСФО · РСБУ · KPI ·
                 Фиксации ЭПС/ВБС; count — число фиксаций у последней
     report(code) → FinMetricsReportRsDto    — code: IFRS · RAS · KPI_SHORT · KPI_FULL
     indicators(tabCode) → [{ fiId, fiName, currencyCode, metrics: [{code, name}] }]
                 — ФИ отчёта и их индикаторы, для окна фильтра
     fixations() → EirIbsvFixationRsDto[] + fiName, currencyCode, isLast
     removeFixation(id) → { ok } | { error: 'NOT_FOUND'|'NOT_LAST' }
     fixationCandidates() → [{ id, name, currencyCode, hasInitial, lastDate }]
                 — ФИ сделки для окна «Фиксация ЭПС/ВБС»
     fixationContext(fiId, date) → Promise<FixationContext> — данные карточки
                 после выбора ФИ и даты: ВБС до фиксации и ЕТС (с задержкой);
                 etsStatus: OK | EMPTY (нет или 0) | FAILED (ошибка расчёта) |
                 MULTIPLE (разные ЕТС у инструментов ФИ; значения — etsValues) | NONE;
                 etsBefore — прежняя ЕТС, от неё считается Δ ручного ввода;
                 без даты (тип «Первоначальная») — всё null
     preliminary(fiId, date) → Promise<FixationPreliminary | { error }> — предварительный
                 расчёт (с задержкой); error: 'NO_INITIAL' | 'FAILED'
     checkFixations(items) → [{ index, fiId, fiName, date, code }] — нарушения правил
                 по карточкам окна; code: DATE_NOT_AFTER_LAST | INITIAL_EXISTS | NO_INITIAL
     saveFixations(items) → Promise<{ saved: [{id,name,date}], failed: [{id,name,date}] }>
                 — имитация расчёта на «бэке» с задержкой; строки появляются в истории
                 по ответу, событие change с reason 'fixation-added'
     trancheFiIds() → string[]               — ФИ сделки, к которым прикреплён транш
     fiOfTranche(trancheId) → fiId|null      — ФИ, к которому прикреплён транш (вопрос 4: первый)
     ownerKey(fiId, trancheId) → string|null — владелец корректировок: ФИ, а без ФИ — ключ
                 транша 'TRANCHE-<id>' (допущение прототипа, ответ человека 05.11.2026)
     rasEventDates(fiId) → string[]          — даты отчёта РСБУ ФИ (ISO, помесячная сетка RE0050)
     Пересчёт с фиксацией и корректировки процентов (RE0034 → RE0050; типы — @typedef у раздела):
     checkRasFixation({ fiId, periodFrom, periodTo, adjustmentDate }) → [{ field, code }] —
                 нарушения окна «Пересчет с фиксацией»; field: periodFrom|periodTo|adjustmentDate;
                 code: REQUIRED | PERIOD_ORDER | NOT_AFTER_FIXATION
     recalcPayments(owner, opts?) → Promise<{ fiId, created, withFixation }> — «Пересчитать» и
                 «Пересчитать с фиксацией» на тайле (задержка). owner — ФИ или ключ транша
                 (ownerKey); opts = { periodFrom, periodTo, adjustmentDate, comment } — пересчёт
                 с фиксацией: значения периода фиксируются по текущему расчёту, пересчитывается
                 весь срок, по строке AUTO на каждую ненулевую дельту даты периода (на дату
                 корректировки); comment из окна попадает во все созданные строки; прежние
                 корректировки остаются (решение человека 03.11.2026, RE0050). Без opts — обычный
                 пересчёт, корректировок не создаёт. Без ФИ owner — ключ транша, корректировки
                 создаются (ответ человека 05.11.2026, вторая волна)
     paymentsBusy() → boolean                — идёт пересчёт платежей
     rasAdjustments(owner?) → RsbuInterestAdjustmentRsDto[]
     addRasAdjustment({ fiId, startDate, endDate, parts, comment }) → { ok, id } — ручная (MANUAL);
                 сумма — сумма частей; fiId — ФИ или ключ транша
     removeRasAdjustment(id) → { ok } | { error: 'NOT_FOUND' }
     removeRasAdjustments(ids) → { ok, removed } — удалить пачку одним событием
     rasMarks() → { fiId: { 'ГГГГ-ММ-ДД': сумма } } — суммы корректировок на целевые даты на момент
                 последнего пересчёта метрик (отметки отчёта РСБУ)
     rasParts() → string[]                   — ключи шести частей в порядке колонок
     resetRas()                              — сбросить фиксацию, корректировки и пересчёт платежей
                 (таб System на любой странице концепта); параметры ras снимаются из адреса
     on('change', fn) → off()
   }

   Правила предметной области живут здесь, а не в тайле и странице. Сущностей
   траншей и инструментов нет, поэтому правила ниже — допущения агента
   (21.10.2026), заменяются, когда придут настоящие (RE0033, вопрос 2):
   – ФИ готов к расчёту, если к нему прикреплён хоть один узел дерева сделки
     (ФИ строится на инструментах, ответ человека 20.10.2026);
   – нет ФИ — «Заблокировано». Расчёт считает готовые ФИ; ни одного — попытка
     не удалась (ERROR), прежний успешный расчёт и его дата остаются
     (ответы 24, 42); часть — «Операция выполнена частично» (ответ 41);
   – в отчёт попадают только рассчитанные ФИ (ответ 4): в МСФО — с типом
     отчётности МСФО или «МСФО и РСБУ», в РСБУ — РСБУ или «МСФО и РСБУ», в KPI —
     все. Нет таких ФИ — вкладка пустая;
   – колонки дат отчёта общие: все даты событий (выдача, начисления, погашение,
     фиксации) всех ФИ отчёта; у ФИ без события на дату — пустая ячейка
     (ответ 10). Даты и числа строятся от номера и id ФИ детерминированно —
     экран одинаков при каждом открытии;
   – удалить можно только последнюю по дате фиксацию ФИ (ответ 33);
   – добавление фиксации: «Первоначальная» — одна на ФИ, остальные виды — только
     после неё и с датой позже даты последней фиксации ФИ (листы «Фиксация
     ЭПС_ВБС», «Первоначальный расчет»); предварительный расчёт справочный и
     тип модификации ему не нужен (ответ 35);
   – ЕТС (Э7): ошибка расчёта и «нет или 0» фиксацию не блокируют (ответ 21.10.2026),
     разные ЕТС у инструментов ФИ блокируют, пока значение не введено вручную;
     ручное значение приходит в items как etsRateManual и ложится в строку истории.

   Сценарий панели прототипа: адрес ?fmCalc=ok|partial|fail подменяет исход
   расчёта — все ФИ · примерно половина · ни одного (как ?hardsState= у
   Tranche.html). Без параметра исход определяет правило готовности. Исход
   по сценарию живёт до перезагрузки страницы и в хранилище не пишется.

   Сценарий панели ?fmFix=prefail|fail: предварительный расчёт падает · часть ФИ
   (каждая вторая карточка: вторая, четвёртая…; единственная — целиком) не фиксируется. Исход по сценарию
   в хранилище не пишется.

   Сценарий панели ?fmEts=slow|failed|empty|multiple: ЕТС грузится ~8 с · ошибка расчёта
   ЕТС · ЕТС нет или 0 · разные ЕТС у инструментов ФИ. Без параметра — обычное значение.
   В хранилище не пишется.

   Пересчёт с фиксацией и корректировки процентов (RE0034, RE0050) — запись ras в записи сделки:
   число пересчётов платежей по ФИ, корректировки и снимок последнего пересчёта метрик. Период
   последнего пересчёта с фиксацией хранится по ФИ (`fixationPeriods`) — по нему проверяется
   исходная дата ручной корректировки; отдельной операции фиксации нет (решение человека
   03.11.2026, уточнение 05.11.2026). Живёт в хранилище вместе с расчётом: по страницам концепта
   ходят кликами. Закрытый период в 1С не меняется: дельта закрытой даты — корректировка с неё на
   целевую дату корректировки. Отчёт РСБУ на любой дате = расчёт после пересчёта платежей −
   корректировки с этой исходной даты + корректировки на эту целевую, и так при каждом пересчёте
   метрик — закрытые даты остаются как при закрытии. Система пересчитывает платёжи за весь срок,
   включая выплаченные периоды: повторные пересчёты с фиксацией добавляют корректировки, прежние
   остаются со своей целевой датой корректировки (решение человека 03.11.2026, RE0050).
   Пересчёт с фиксацией и корректировки доступны и без привязки транша к ФИ: система считает
   процентные платежи по траншу, поэтому владелец корректировок без ФИ — ключ
   'TRANCHE-<id>' (ответ человека 05.11.2026, вторая волна). Комментарий из окна пересчёта
   попадает во все созданные строки.
   Сценарий панели ?rasAdj=none|created|applied|multi|multi-applied|manual|manual-applied|no-fi:
   платежи не пересчитаны · один пересчёт с фиксацией (период 01.01.2025–31.03.2025,
   корректировки на 01.04.2025) · и метрики пересчитаны · два пересчёта с фиксацией (второй:
   период 01.01.2025–30.06.2026, корректировки на 01.07.2026) · два и метрики пересчитаны · одна
   ручная корректировка (16.01.2025 → 01.04.2025, 12 500,00) · она же и метрики пересчитаны ·
   корректировки первого транша сделки без ФИ.
   Адрес задаёт состояние страницы и в хранилище не пишет, пока человек сам не сделал действие —
   после него состояние сохраняется как обычно. Значения, сдвиги пересчёта и раскладка по видам —
   рыба, детерминированно (Source: invented 28.10.2026); шесть сумм вида в системе приходят с
   бэкенда готовыми (ответ человека 05.11.2026).

   Чистый старт ручного сценария (RE0035, Э4): ?rasReset=1 на первой странице сценария. Сбрасывает
   только корректировки и пересчёт платежей этой сделки (расчёт метрик и фиксации ЭПС/ВБС
   остаются), записывает пустое ras в хранилище и снимает параметр из адреса — обновление страницы
   не стирает ход прохождения. «Сбросить» в табе System объявлено здесь же, поэтому есть на любой
   странице концепта; оно делает то же самое и снимает из адреса rasAdj.

   Хранение. Расчёт и фиксации кладёт в память страницы и в PostApi.finMetrics
   (localStorage или сервер данных, data/API.md) после каждого расчёта и
   удаления: отчёты открываются на другой странице. Сохранённое перекрывает
   демо-запись сделки из mock-fin-metrics-calc.js.
   ========================================================================= */
(function () {
  'use strict';

  var MOCK = window.MOCK_DEAL_METRICS_CALC || {};
  var CATALOG = window.FIN_METRICS_CATALOG || {};
  var LABELS = window.FIN_METRICS_LABELS || { tabs: {} };

  var CALC_DELAY_MS = 1500;

  /* Квартальные даты, из которых строятся события ФИ (МСФО, KPI, фиксации ЭПС/ВБС). */
  var QUARTER_ENDS = [
    '2024-03-31', '2024-06-30', '2024-09-30', '2024-12-31',
    '2025-03-31', '2025-06-30', '2025-09-30', '2025-12-31',
    '2026-03-31', '2026-06-30', '2026-09-30', '2026-12-31'
  ];

  /* Помесячная сетка отчёта РСБУ (решение человека 03.11.2026, RE0050): по колонке на месяц с
     января 2025 по декабрь 2027 — 36 дат. В месяцах закрытия квартала (март, июнь, сентябрь,
     декабрь) — последний день месяца, в остальных — фиксированный произвольный день. Пересчёт
     платёжей меняет все колонки, кроме колонок зафиксированного периода. */
  var RAS_MONTH_DAYS = { 1: '16', 2: '13', 3: '31', 4: '15', 5: '14', 6: '30', 7: '16', 8: '13', 9: '30', 10: '15', 11: '14', 12: '31' };
  var RAS_DATES = (function () {
    var out = [];
    for (var y = 2025; y <= 2027; y++) {
      for (var m = 1; m <= 12; m++) out.push(y + '-' + (m < 10 ? '0' : '') + m + '-' + RAS_MONTH_DAYS[m]);
    }
    return out;
  })();

  /* Какие отчёты берёт тип отчётности ФИ. */
  var TAB_REPORTING = { IFRS: ['IFRS', 'IFRS_RAS'], RAS: ['RAS', 'IFRS_RAS'] };
  var TAB_REPORT_CODE = { IFRS: 'IFRS', RAS: 'RAS', KPI: 'KPI_FULL' };

  function clone(x) { return JSON.parse(JSON.stringify(x)); }

  /* Детерминированный хеш строки → целое. */
  function hash(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }

  /* gen — { fiId: сколько раз пересчитаны платежи }; adjustments — RsbuInterestAdjustmentRsDto[];
     snapshot — { gen, adjustments } на последнем пересчёте метрик; fixationPeriods — последний
     пересчёт с фиксацией по ФИ: { periodFrom, periodTo, adjustmentDate }, конец периода нужен
     правилу дат ручной корректировки. Отдельной операции фиксации нет (RE0050). */
  function emptyRas() { return { gen: {}, adjustments: [], snapshot: null, fixationPeriods: {} }; }

  /* сохранённое до RE0050 могло нести fixation — новое состояние её не знает; fixationPeriods
     появились позже, старые сохранения получают пустую карту */
  function sanitizeRas(ras) {
    var out = clone(ras);
    delete out.fixation;
    if (!out.fixationPeriods || typeof out.fixationPeriods !== 'object' || Array.isArray(out.fixationPeriods)) out.fixationPeriods = {};
    return out;
  }
  var current = { dealId: null, calculation: null, fixations: [], ras: emptyRas() };
  /* состояние РСБУ задано адресом (?rasAdj=) и ещё не тронуто человеком — не пишется */
  var rasFromUrl = false;
  var saved = {};
  var persistOn = true;
  var busy = false;
  var running = null;
  var listeners = [];

  function emit(detail) {
    listeners.forEach(function (fn) { fn(detail || {}); });
  }

  /* ── Хранение ───────────────────────────────────────────────────── */

  function api() { return window.PostApi && window.PostApi.finMetrics ? window.PostApi.finMetrics : null; }

  var ready = (api() ? api().all() : Promise.resolve({})).then(function (all) {
    if (!persistOn) return;
    Object.keys(all || {}).forEach(function (key) {
      var rec = all[key];
      if (rec && rec.calculation) saved[key] = { calculation: rec.calculation, fixations: rec.fixations || [], ras: rec.ras || null };
    });
  }).catch(function (e) {
    if (window.console) console.warn('FinMetricsStore: сохранённые расчёты метрик не загружены —', e && e.message);
  });

  function persist(on) {
    persistOn = on !== false;
    if (!persistOn) saved = {};
  }

  function commit() {
    var dealId = current.dealId;
    if (dealId == null) return;
    var rec = { calculation: clone(current.calculation), fixations: clone(current.fixations), ras: clone(current.ras) };
    saved[String(dealId)] = rec;
    /* исход по сценарию панели (?fmCalc=, ?fmFix=) — показ, а не данные: в хранилище
       не пишется, чтобы повторный прогон сценария начинался с демо-записи */
    if (persistOn && api() && !scenario() && !fixScenario() && !etsScenario() && !rasFromUrl) {
      api().put(dealId, rec).catch(function (e) {
        if (window.console) console.warn('FinMetricsStore: расчёт метрик не сохранён —', e && e.message);
      });
    }
  }

  /* ── Сделка ─────────────────────────────────────────────────────── */

  function emptyCalculation(dealId) {
    return { dealId: dealId, calcStatusCode: 'NOT_CALCULATED', calculatedAt: null, calculatedFiIds: [], lastAttemptFailed: false };
  }

  function use(dealId) {
    var key = String(dealId);
    var rec = saved[key] || (MOCK[key] ? { calculation: MOCK[key], fixations: MOCK[key].fixations || [] } : null);
    current = {
      dealId: dealId,
      calculation: rec ? clone(rec.calculation) : emptyCalculation(dealId),
      fixations: rec ? clone(rec.fixations) : [],
      /* записи v3 (state, moves) и v4 до RE0050 (fixation) не читаются: хранилище у концепта своё,
         но на всякий случай */
      ras: rec && rec.ras && rec.ras.adjustments ? sanitizeRas(rec.ras) : emptyRas()
    };
    delete current.calculation.fixations;
    applyRasUrl(dealId);
    /* ?rasReset=1 — чистый старт ручного сценария панели (RE0035, Э4): сбрасываем только корректировки
       и пересчёт платежей; расчёт метрик и фиксации ЭПС/ВБС остаются. Параметр снимаем
       из адреса, иначе обновление страницы стирало бы ход прохождения. */
    if (rasResetParam()) {
      current.ras = emptyRas();
      rasFromUrl = false;
      commit();
      stripRasParams(['rasReset'].concat(RAS_URL_PARAMS), true);
    }
    busy = false;
    running = null;
    emit({ reason: 'use' });
  }

  /* ── ФИ сделки ──────────────────────────────────────────────────── */

  /* Карточки ФИ сделки со стора ФИ; чужая сделка в сторе ФИ — пусто. */
  function cards() {
    var S = window.FinInstrumentsStore;
    if (!S || String(S.dealId()) !== String(current.dealId)) return [];
    return S.view();
  }

  function isReady(card) { return (card.nodes || []).length > 0; }

  /* ── Состояние тайла ────────────────────────────────────────────── */

  function state() {
    var all = cards();
    var ids = all.map(function (c) { return c.id; });
    var done = current.calculation.calculatedFiIds.filter(function (id) { return ids.indexOf(id) !== -1; });
    var calculated = current.calculation.calcStatusCode === 'CALCULATED' && done.length > 0;
    var code = !all.length ? 'LOCKED' : current.calculation.lastAttemptFailed ? 'ERROR' : 'DEFAULT';
    return {
      code: code, busy: busy, calculated: calculated,
      calculatedAt: calculated ? current.calculation.calculatedAt : null,
      done: calculated ? done.length : 0, total: all.length
    };
  }

  /* ── Расчёт ─────────────────────────────────────────────────────── */

  function scenario() {
    var m = /[?&]fmCalc=(ok|partial|fail)/.exec(window.location && window.location.search || '');
    return m ? m[1] : null;
  }

  /* Какие карточки посчитаются: правило готовности либо сценарий панели. */
  function pickCalculated(all) {
    var s = scenario();
    if (s === 'ok') return all.slice();
    if (s === 'fail') return [];
    if (s === 'partial') return all.slice(0, Math.max(1, Math.floor(all.length / 2)));
    return all.filter(isReady);
  }

  function calculate() {
    if (running) return running;
    var all = cards();
    if (!all.length || !current.dealId) {
      return Promise.resolve({ outcome: 'FAILED', calculated: [], failed: [] });
    }
    busy = true;
    emit({ reason: 'calculating' });
    running = new Promise(function (resolve) {
      setTimeout(function () {
        var ok = pickCalculated(all);
        var okIds = ok.map(function (c) { return c.id; });
        var failed = all.filter(function (c) { return okIds.indexOf(c.id) === -1; });
        if (ok.length) {
          current.calculation = {
            dealId: current.dealId, calcStatusCode: 'CALCULATED', calculatedAt: new Date().toISOString(),
            calculatedFiIds: okIds, lastAttemptFailed: false
          };
          /* отчёт РСБУ берёт пересчитанные платежи и корректировки на этот момент (концепт v4) */
          takeSnapshot();
        } else {
          current.calculation.lastAttemptFailed = true;
        }
        /* пересчёт — тоже действие человека: адрес больше не задаёт состояние, результат пишется
           в хранилище, а параметры показа снимаются, чтобы F5 не вернул старое (RE0035, Э4) */
        rasFromUrl = false;
        commit();
        stripRasParams(RAS_URL_PARAMS);
        busy = false;
        running = null;
        emit({ reason: 'calculated' });
        function pair(c) { return { id: c.id, name: c.name }; }
        var out = {
          outcome: !ok.length ? 'FAILED' : failed.length ? 'PARTIAL' : 'OK',
          calculated: ok.map(pair), failed: failed.map(pair)
        };
        resolve(out);
      }, CALC_DELAY_MS);
    });
    return running;
  }

  /* ── Отчёты ─────────────────────────────────────────────────────── */

  function calculatedCards() {
    var ids = current.calculation.calculatedFiIds;
    if (current.calculation.calcStatusCode !== 'CALCULATED') return [];
    return cards().filter(function (c) { return ids.indexOf(c.id) !== -1; });
  }

  function cardsOfTab(tab) {
    var types = TAB_REPORTING[tab];
    return calculatedCards().filter(function (c) { return !types || types.indexOf(c.reportingType) !== -1; });
  }

  /* События ФИ: квартальные даты от номера ФИ плюс даты его фиксаций. */
  function eventDates(card) {
    var start = (card.number * 3) % 5;
    var count = 4 + (card.number % 3);
    var dates = QUARTER_ENDS.slice(start, start + count);
    current.fixations.forEach(function (f) {
      if (f.financialInstrumentId === card.id && dates.indexOf(f.changeDate) === -1) dates.push(f.changeDate);
    });
    return dates.sort();
  }

  function metricValue(fiId, metricCode, date) {
    var h = hash(fiId + '|' + metricCode + '|' + date);
    return 1000000 + (h % 90000000) + (h % 100) / 100;
  }

  function currencyOf(card) { return card.currency ? card.currency.split(',')[0].trim() : 'RUB'; }

  function report(code) {
    var tab = code === 'KPI_SHORT' || code === 'KPI_FULL' ? 'KPI' : code;
    var metrics = CATALOG[code] || [];
    var list = cardsOfTab(tab);
    var perFi = {};
    var all = {};
    var snap = snapshot();
    /* в РСБУ даты корректировок — события индикатора «Начисленные проценты за период» (концепт v4) */
    var rasOnly = {};
    list.forEach(function (c) {
      /* РСБУ — помесячная сетка 01.2025–12.2027 (RE0050); МСФО и KPI — даты событий ФИ */
      perFi[c.id] = code === 'RAS' ? RAS_DATES : eventDates(c);
      perFi[c.id].forEach(function (d) { all[d] = true; });
      if (code === 'RAS') {
        rasOnly[c.id] = rasDates(c.id, snap.adjustments);
        rasOnly[c.id].forEach(function (d) { all[d] = true; });
      }
    });
    var dates = Object.keys(all).sort();
    return {
      reportCode: code,
      dates: dates,
      groups: list.map(function (c) {
        return {
          financialInstrumentId: c.id, financialInstrumentName: c.name, currencyCode: currencyOf(c),
          rows: metrics.map(function (m) {
            var values = {};
            dates.forEach(function (d) {
              values[d] = perFi[c.id].indexOf(d) === -1 ? null : metricValue(c.id, m[0], d);
            });
            /* пересчитанные платежи и корректировки: −исходная дата, +целевая — при каждом пересчёте */
            if (code === 'RAS' && m[0] === RAS_METRIC) {
              rasOnly[c.id].forEach(function (d) { values[d] = reportedValue(c.id, d, genOf(snap.gen, c.id), snap.adjustments); });
            }
            return { metricCode: m[0], metricName: m[1], values: values };
          })
        };
      })
    };
  }

  function indicators(tab) {
    var metrics = CATALOG[TAB_REPORT_CODE[tab]] || [];
    return cardsOfTab(tab).map(function (c) {
      return {
        fiId: c.id, fiName: c.name, currencyCode: currencyOf(c),
        metrics: metrics.map(function (m) { return { code: m[0], name: m[1] }; })
      };
    });
  }

  /* ── Фиксации ЭПС/ВБС ───────────────────────────────────────────── */

  function lastOf(fiId) {
    var last = null;
    current.fixations.forEach(function (f) {
      if (f.financialInstrumentId !== fiId) return;
      if (!last || f.changeDate > last.changeDate) last = f;
    });
    return last;
  }

  /* Фиксации сделки по ФИ и дате — порядок строк «По дате» решает страница. */
  function fixations() {
    var names = {};
    cards().forEach(function (c) { names[c.id] = c; });
    return current.fixations.map(function (f) {
      var card = names[f.financialInstrumentId];
      var rec = clone(f);
      rec.fiName = card ? card.name : f.financialInstrumentId;
      rec.currencyCode = card ? currencyOf(card) : 'RUB';
      rec.isLast = lastOf(f.financialInstrumentId).fixationId === f.fixationId;
      return rec;
    });
  }

  function removeFixation(id) {
    var rec = current.fixations.filter(function (f) { return f.fixationId === id; })[0];
    if (!rec) return { error: 'NOT_FOUND' };
    if (lastOf(rec.financialInstrumentId) !== rec) return { error: 'NOT_LAST' };
    current.fixations.splice(current.fixations.indexOf(rec), 1);
    commit();
    emit({ reason: 'fixation-removed', id: id });
    return { ok: true };
  }

  /* ── Окно «Фиксация ЭПС/ВБС» ────────────────────────────────────── */

  var FIX_CONTEXT_DELAY_MS = 600;
  var FIX_PRELIM_DELAY_MS = 1500;
  var FIX_SAVE_DELAY_MS = 1200;

  function fixScenario() {
    var m = /[?&]fmFix=(prefail|fail)/.exec(window.location && window.location.search || '');
    return m ? m[1] : null;
  }

  var ETS_SLOW_DELAY_MS = 8000;

  function etsScenario() {
    var m = /[?&]fmEts=(slow|failed|empty|multiple)/.exec(window.location && window.location.search || '');
    return m ? m[1] : null;
  }

  function cardById(id) {
    return cards().filter(function (c) { return c.id === id; })[0] || null;
  }

  function hasInitial(fiId) {
    return current.fixations.some(function (f) { return f.financialInstrumentId === fiId && f.modificationTypeCode === 'INITIAL'; });
  }

  function round2(x) { return Math.round(x * 100) / 100; }

  function later(ms, fn) {
    return new Promise(function (resolve) { setTimeout(function () { resolve(fn()); }, ms); });
  }

  /* ФИ сделки для выбора в окне; чужая сделка в сторе ФИ — пусто. */
  function fixationCandidates() {
    return cards().map(function (c) {
      var last = lastOf(c.id);
      return {
        id: c.id, name: c.name, currencyCode: currencyOf(c),
        hasInitial: hasInitial(c.id), lastDate: last ? last.changeDate : null
      };
    });
  }

  /* Значения ФИ на дату — рыба, детерминированная от id ФИ и даты. */
  function fixationBase(fiId, date) {
    var last = lastOf(fiId);
    var h = hash(fiId + '|' + date);
    var gca = last && last.grossCarryingAmount ? last.grossCarryingAmount : 50000000 + (hash(fiId) % 300) * 1000000;
    var ets = last && last.etsRate != null ? last.etsRate : 7 + (hash(fiId + '|ets') % 1000) / 100;
    var etsNew = round2(ets + ((h % 200) - 100) / 100);
    return { last: last, h: h, gca: gca, ets: ets, etsNew: etsNew };
  }

  /* Данные карточки после выбора ФИ и даты. «ВБС до фиксации» есть, когда у ФИ уже
     была первоначальная фиксация (вопрос 34 задачи RE0033 открыт); без даты — всё
     пусто. Статус ЕТС — по сценарию панели ?fmEts= (Э7), без него — OK. */
  function fixationContext(fiId, date) {
    var scen = etsScenario();
    return later(scen === 'slow' ? ETS_SLOW_DELAY_MS : FIX_CONTEXT_DELAY_MS, function () {
      if (!date || !cardById(fiId)) {
        return { grossCarryingBefore: null, etsRate: null, etsDelta: null, etsBefore: null, etsValues: null, etsStatus: 'NONE' };
      }
      var b = fixationBase(fiId, date);
      var out = {
        grossCarryingBefore: hasInitial(fiId) ? b.gca : null,
        etsRate: b.etsNew, etsDelta: round2(b.etsNew - b.ets), etsBefore: b.ets, etsValues: null, etsStatus: 'OK'
      };
      if (scen === 'failed') out.etsStatus = 'FAILED';
      else if (scen === 'empty') out.etsStatus = 'EMPTY';
      else if (scen === 'multiple') { out.etsStatus = 'MULTIPLE'; out.etsValues = [14, 22.5, 22.5]; }
      if (out.etsStatus !== 'OK') { out.etsRate = null; out.etsDelta = null; }
      return out;
    });
  }

  function preliminary(fiId, date) {
    return later(FIX_PRELIM_DELAY_MS, function () {
      if (fixScenario() === 'prefail') return { error: 'FAILED' };
      if (!cardById(fiId) || !date) return { error: 'FAILED' };
      if (!hasInitial(fiId)) return { error: 'NO_INITIAL' };
      var b = fixationBase(fiId, date);
      var impact = round2(-((b.h % 400) / 100 + 0.5));          // влияние на ВБС, %
      var day1 = Math.round(b.gca * impact / 100);
      var eirDelta = round2(((b.h >>> 3) % 300) / 100 - 1);
      var eirBefore = b.last && b.last.eirRate != null ? b.last.eirRate : 10;
      return {
        ok: true,
        grossCarryingBefore: b.gca,
        nonSubstantial: { gcaAfter: Math.round(b.gca + day1), day1Pnl: day1, day1PnlShare: impact },
        substantial: { gcaAfter: Math.round(b.gca + day1), eirAfter: round2(eirBefore + eirDelta), eirDelta: eirDelta }
      };
    });
  }

  /* Правила по карточкам окна: items — [{ fiId, date (ISO|null), modificationTypeCode }]. */
  function checkFixations(items) {
    var out = [];
    (items || []).forEach(function (it, index) {
      var card = cardById(it.fiId);
      if (!card) return;
      var rec = { index: index, fiId: it.fiId, fiName: card.name, date: it.date || null };
      var last = lastOf(it.fiId);
      if (it.modificationTypeCode === 'INITIAL') {
        if (hasInitial(it.fiId)) { rec.code = 'INITIAL_EXISTS'; out.push(rec); }
      } else if (!hasInitial(it.fiId)) {
        rec.code = 'NO_INITIAL'; out.push(rec);
      } else if (last && it.date && it.date <= last.changeDate) {
        rec.code = 'DATE_NOT_AFTER_LAST'; out.push(rec);
      }
    });
    return out;
  }

  function nextFixationId() {
    var max = 0;
    current.fixations.forEach(function (f) {
      var n = parseInt(String(f.fixationId).split('-').pop(), 10);
      if (n > max) max = n;
    });
    return 'FX-' + current.dealId + '-' + (max + 1);
  }

  /* Расчёт фиксации «на бэке»: строки появляются в истории по ответу. */
  function saveFixations(items) {
    var list = clone(items || []);
    return later(FIX_SAVE_DELAY_MS, function () {
      var saved = [];
      var failed = [];
      var scen = fixScenario();
      list.forEach(function (it, i) {
        var card = cardById(it.fiId);
        var pair = { id: it.fiId, name: card ? card.name : it.fiId, date: it.date || null };
        if (!card || (scen === 'fail' && (list.length === 1 || i % 2 === 1))) { failed.push(pair); return; }
        var initial = it.modificationTypeCode === 'INITIAL';
        var date = it.date || new Date().toISOString().slice(0, 10);
        var b = fixationBase(it.fiId, date);
        var prev = b.last;
        var manual = it.etsRateManual != null && !isNaN(it.etsRateManual) ? Number(it.etsRateManual) : null;
        var eirDelta = initial || !prev || prev.eirRate == null ? null : round2(((b.h >>> 3) % 300) / 100 - 1);
        var impact = initial ? null : round2(-((b.h % 400) / 100 + 0.5));
        current.fixations.push({
          fixationId: nextFixationId(), financialInstrumentId: it.fiId, changeDate: date,
          modificationTypeCode: it.modificationTypeCode,
          eirRate: eirDelta == null ? round2(10 + (hash(it.fiId + '|eir') % 600) / 100) : round2(prev.eirRate + eirDelta),
          eirDelta: eirDelta,
          etsRate: manual != null ? manual : b.etsNew,
          etsDelta: initial ? null : round2((manual != null ? manual : b.etsNew) - b.ets),
          grossCarryingAmount: Math.round(b.gca), grossCarryingImpactRate: impact,
          day1PnlAmount: initial ? null : Math.round(b.gca * impact / 100),
          comment: it.comment || ''
        });
        saved.push(pair);
      });
      if (saved.length) {
        commit();
        emit({ reason: 'fixation-added' });
      }
      return { saved: saved, failed: failed };
    });
  }

  /* ── Фиксация РСБУ и корректировки процентов (RE0034, концепт v4) ── */

  /**
   * Части корректировки — шесть видов начисленных процентов (подписи — FIN_RAS_PART_LABELS).
   * @typedef {Object} RsbuAdjustmentPartsDto
   * @property {number} currentInterest — Текущие начисленные проценты
   * @property {number} currentInterestCap — Кап. текущие начисленные проценты
   * @property {number} capitalizedInterest — Капитализированные начисленные проценты
   * @property {number} capitalizedInterestCap — Кап. капитализированные начисленные проценты
   * @property {number} deferredInterest — Отложенные начисленные проценты
   * @property {number} deferredInterestCap — Кап. отложенные начисленные проценты
   */
  /**
   * Корректировка процентов РСБУ: сумма вычитается с исходной даты и прибавляется на целевую
   * при каждом пересчёте метрик.
   * @typedef {Object} RsbuInterestAdjustmentRsDto
   * @property {string} id
   * @property {string} financialInstrumentId — ФИ; без ФИ — ключ транша 'TRANCHE-<id>'
   *           (допущение прототипа, ответ человека 05.11.2026)
   * @property {string} startDate — исходная дата (ГГГГ-ММ-ДД), для строк из дельт — дата отчёта
   * @property {string} endDate — целевая дата корректировки: на неё сумма прибавляется
   * @property {RsbuAdjustmentPartsDto} parts
   * @property {number} adjustmentAmount — сумма шести частей
   * @property {string} comment
   * @property {string} sourceCode — AUTO (из дельты при пересчёте платежей) | MANUAL
   */
  /**
   * Период фиксации РСБУ транша: значения индикатора «Начисленные проценты за период»
   * за период [periodFrom; periodTo] фиксируются на момент пересчёта с фиксацией.
   * @typedef {Object} RsbuFixationPeriodRsDto
   * @property {string} financialInstrumentId — ФИ или ключ транша 'TRANCHE-<id>'
   * @property {string} periodFrom — начало периода фиксации (ГГГГ-ММ-ДД)
   * @property {string} periodTo — конец периода фиксации (ГГГГ-ММ-ДД)
   * @property {string} adjustmentDate — целевая дата корректировки, на неё ложатся дельты
   * @property {Object<string, number>} fixedValues — { 'ГГГГ-ММ-ДД': значение }
   * Source: invented (03.11.2026, RE0050).
   */

  var RAS_METRIC = 'RAS_ACCRUED_PERCENT';
  /* Ключи частей в порядке колонок и полей окна. */
  var RAS_PARTS = ['currentInterest', 'currentInterestCap', 'capitalizedInterest', 'capitalizedInterestCap', 'deferredInterest', 'deferredInterestCap'];
  /* Раскладка дельты по видам — рыба: в системе шесть сумм приходят с бэкенда готовыми
     (ответ человека 05.11.2026), в прототипе раскладываем постоянными долями. */
  var RAS_PART_SHARES = [0.5, 0.1, 0.15, 0.05, 0.15, 0.05];
  /* Сдвиг значения индикатора от одного пересчёта платежей — на каждую дату сетки РСБУ, растёт по
     индексу даты: дельта есть на каждой дате зафиксированного периода («12 месяцев — 12 корректировок»,
     решение человека 03.11.2026). Рыба. */
  var RAS_DELTA_STEP = 84210.5;
  /* Прирост значения индикатора от одного (g-го) пересчёта на дате d: растёт с номером пересчёта
     (условия расчёта меняются от прогона к прогону) и с индексом даты всего срока, с разбросом
     по дате — детерминированно, 0,70…1,29 от шага. Дельты двух пересчётов на одну дату не
     совпадают и не кратны друг другу (замечание человека 03.11.2026, RE0050). Рыба. */
  function runStep(fiId, d, i, g) {
    var h = hash(fiId + '|run|' + g + '|' + d);
    return RAS_DELTA_STEP * (i + 1) * g * (0.7 + (h % 60) / 100);
  }
  /* Демо для адреса панели (ФИ «Кредит-202», номер 2 в сделке): первый пересчёт с фиксацией —
     период Q1 2025, корректировки на 01.04.2025; второй (rasAdj=multi, спустя полтора года) —
     период 18 месяцев, корректировки на 01.07.2026 (пример человека, RE0050). */
  var RAS_DEMO = { periodFrom: '2025-01-01', periodTo: '2025-03-31', adjustmentDate: '2025-04-01' };
  var RAS_DEMO_2 = { periodFrom: '2025-01-01', periodTo: '2026-06-30', adjustmentDate: '2026-07-01' };
  /* демо ручной корректировки для адреса панели: те же даты и суммы, что в снимке окна */
  var RAS_MANUAL_DEMO = {
    startDate: '2025-01-16', endDate: '2025-04-01',
    parts: { currentInterest: 10000, currentInterestCap: 2500, capitalizedInterest: 0, capitalizedInterestCap: 0, deferredInterest: 0, deferredInterestCap: 0 },
    comment: ''
  };
  var PAYMENTS_DELAY_MS = 1500;
  var paymentsBusy = false;

  function round2f(x) { return Math.round(x * 100) / 100; }

  /* Сколько раз пересчитаны платежи ФИ. */
  function genOf(gen, fiId) { return (gen && gen[fiId]) || 0; }

  /* Даты ФИ в отчёте РСБУ: помесячная сетка плюс целевые даты корректировок (корректировка — тоже
     событие индикатора, решение агента 28 задачи RE0034). */
  function rasDates(fiId, adjustments) {
    var dates = RAS_DATES.slice();
    (adjustments || []).forEach(function (a) {
      if (a.financialInstrumentId === fiId && dates.indexOf(a.endDate) === -1) dates.push(a.endDate);
    });
    return dates.sort();
  }

  /* Расчёт индикатора без корректировок после gen пересчётов платежей; на дате вне сетки РСБУ — 0.
     Сдвиг — сумма приростов всех пересчётов: у каждого своя величина на каждой дате, поэтому
     второй пересчёт даёт другие дельты, а не повтор сумм первого. */
  function rawValue(fiId, d, gen) {
    var i = RAS_DATES.indexOf(d);
    if (i === -1) return 0;
    var v = metricValue(fiId, RAS_METRIC, d);
    for (var g = 1; g <= gen; g++) v += runStep(fiId, d, i, g);
    return round2f(v);
  }

  /* Значение в отчёте: расчёт − корректировки с этой исходной даты + корректировки на эту целевую. */
  function reportedValue(fiId, d, gen, adjustments) {
    var v = rawValue(fiId, d, gen);
    (adjustments || []).forEach(function (a) {
      if (a.financialInstrumentId !== fiId) return;
      if (a.startDate === d) v -= a.adjustmentAmount;
      if (a.endDate === d) v += a.adjustmentAmount;
    });
    return round2f(v);
  }

  /* Снимок на последнем пересчёте метрик — по нему рисуется отчёт РСБУ. */
  function snapshot() { return current.ras.snapshot || { gen: {}, adjustments: [] }; }

  /* Первый транш сделки без ФИ — для демо ?rasAdj=no-fi. Дерево берём из MOCK_DEAL_TREES:
     стор дерева может быть ещё не готов, а снимкам панели нужен стабильный ключ. */
  function firstNoFiTrancheId(dealId) {
    var tree = window.MOCK_DEAL_TREES && window.MOCK_DEAL_TREES[String(dealId)];
    if (!tree) return null;
    var found = null;
    (function scan(node) {
      if (!node || found) return;
      if (Array.isArray(node)) { node.forEach(scan); return; }
      if (node.tranches) {
        node.tranches.forEach(function (t) {
          if (!found && (!t.fiIds || !t.fiIds.length)) found = t.id;
        });
      }
      ['productsDid', 'products', 'instruments'].forEach(function (k) { if (node[k]) scan(node[k]); });
    })(tree);
    return found;
  }

  /* Адрес задаёт состояние страницы: ?rasAdj=none|created|applied|multi|multi-applied|manual|
     manual-applied|no-fi — платежи не пересчитаны · один пересчёт с фиксацией (корректировки
     созданы) · и метрики пересчитаны · два пересчёта с фиксацией · два и метрики пересчитаны ·
     одна ручная корректировка · она же и метрики пересчитаны · корректировки транша без ФИ
     (ключ TRANCHE-<id>). */
  function applyRasUrl(dealId) {
    var q = window.location && window.location.search || '';
    /* длинные значения — раньше коротких: «multi» иначе перехватит «multi-applied» */
    var adj = /[?&]rasAdj=(none|created|applied|multi-applied|multi|manual-applied|manual|no-fi)/.exec(q);
    rasFromUrl = !!adj;
    if (!rasFromUrl) return;
    var fiId = 'FI-' + dealId + '-2';
    current.ras = emptyRas();
    if (adj[1] === 'no-fi') {
      var trancheId = firstNoFiTrancheId(dealId);
      if (trancheId) createAdjustments(ownerKey(null, trancheId), RAS_DEMO);
      return;
    }
    if (adj[1] === 'manual' || adj[1] === 'manual-applied') {
      current.ras.adjustments.push({
        id: nextAdjustmentId(), financialInstrumentId: fiId,
        startDate: RAS_MANUAL_DEMO.startDate, endDate: RAS_MANUAL_DEMO.endDate,
        parts: clone(RAS_MANUAL_DEMO.parts), adjustmentAmount: sumParts(RAS_MANUAL_DEMO.parts),
        comment: RAS_MANUAL_DEMO.comment, sourceCode: 'MANUAL'
      });
      if (adj[1] === 'manual-applied') takeSnapshot();
    } else if (adj[1] !== 'none') {
      createAdjustments(fiId, RAS_DEMO);
      if (adj[1] === 'multi' || adj[1] === 'multi-applied') createAdjustments(fiId, RAS_DEMO_2);
      if (adj[1] === 'applied' || adj[1] === 'multi-applied') takeSnapshot();
    }
  }

  /* ?rasReset=1 — просьба о чистом старте (RE0035, Э4). */
  function rasResetParam() {
    return /[?&]rasReset=1/.test(window.location && window.location.search || '');
  }

  /* Убрать из адреса параметры состояния. replaceState на file:// браузер может запретить — тогда,
     если reloadOnFail, одна перезагрузка на адрес без параметра (она нужна для чистого старта:
     иначе F5 вернёт снятое); иначе адрес просто не меняем — состояние уже в хранилище. */
  function stripRasParams(names, reloadOnFail) {
    var q = window.location && window.location.search || '';
    var had = false;
    names.forEach(function (n) { if (new RegExp('[?&]' + n + '=').test(q)) had = true; });
    if (!had) return;
    var href = window.location.href;
    try {
      var u = new URL(href);
      names.forEach(function (n) { u.searchParams.delete(n); });
      href = u.toString();
    } catch (e) { return; }
    try {
      window.history.replaceState(null, '', href);
    } catch (e) {
      if (reloadOnFail) {
        try { window.location.replace(href); } catch (e2) { /* адрес не меняем */ }
      }
    }
  }

  var RAS_URL_PARAMS = ['rasAdj'];

  /* Человек сделал действие — адресное состояние становится настоящим и пишется; параметры показа
     снимаются из адреса, чтобы reload или «назад» не подменили сохранённое (RE0035, Э4). */
  function touchRas(reason, detail) {
    rasFromUrl = false;
    commit();
    stripRasParams(RAS_URL_PARAMS);
    var d = detail || {};
    d.reason = reason;
    emit(d);
  }

  /* ФИ с траншем: на узле-транше дерева сделки стоит fiIds. */
  function trancheFiIds() {
    var T = window.ProductTreeStore;
    if (!T || String(T.dealId()) !== String(current.dealId)) return [];
    var out = [];
    (function scan(list) {
      list.forEach(function (n) {
        if (n.kind === 'TRANCHE') (n.fiIds || []).forEach(function (id) { if (out.indexOf(id) === -1) out.push(id); });
        scan(n.children || []);
      });
    })(T.view());
    return out;
  }

  /* ФИ транша по узлу дерева (вопрос 4 задачи: пока у ФИ один транш, у транша — один ФИ). */
  function fiOfTranche(trancheId) {
    var T = window.ProductTreeStore;
    if (!T || String(T.dealId()) !== String(current.dealId)) return null;
    var found = null;
    (function scan(list) {
      list.forEach(function (n) {
        if (n.id === trancheId && n.kind === 'TRANCHE') found = (n.fiIds || [])[0] || null;
        scan(n.children || []);
      });
    })(T.view());
    return found;
  }

  /* Владелец корректировок: ФИ, а без ФИ — транш. Ключ транша — 'TRANCHE-<id>': система считает
     процентные платежи по траншу и без привязки к ФИ, поэтому корректировки создаются и без ФИ
     (ответ человека 05.11.2026, вторая волна). Отчёт РСБУ по реальным ФИ синтетический ключ
     не читает — строки без ФИ в нём не участвуют. */
  function ownerKey(fiId, trancheId) {
    if (fiId) return fiId;
    return trancheId ? 'TRANCHE-' + trancheId : null;
  }

  /* Даты отчёта РСБУ ФИ — помесячная сетка RE0050; окно «Пересчет с фиксацией» проверяет по ним
     период фиксации. */
  function rasEventDates() {
    return RAS_DATES.slice();
  }

  /* Все даты отчёта РСБУ ФИ: помесячная сетка плюс целевые даты корректировок — по ним проверяется
     исходная дата ручной корректировки (ответ человека 05.11.2026). */
  function rasReportDates(fiId) {
    return rasDates(fiId, current.ras.adjustments);
  }

  /* Последний пересчёт с фиксацией по ФИ: { periodFrom, periodTo, adjustmentDate } | null.
     Его конец — граница правила «исходная дата не позже фиксации» (05.11.2026). */
  function rasLastFixation(fiId) {
    var f = current.ras.fixationPeriods[fiId];
    return f ? clone(f) : null;
  }

  /* Период фиксации берёт то, что покажет отчёт при пересчёте метрик сейчас: текущий расчёт (число
     пересчётов платежей и внесённые корректировки), а не снимок — корректировки прошлых пересчётов
     с фиксацией остаются в силе (RE0050). */
  function makeFixation(fiId, fix) {
    var gen = genOf(current.ras.gen, fiId);
    var fixed = {};
    rasDates(fiId, current.ras.adjustments).forEach(function (d) {
      if (d >= fix.periodFrom && d <= fix.periodTo) fixed[d] = reportedValue(fiId, d, gen, current.ras.adjustments);
    });
    return { financialInstrumentId: fiId, periodFrom: fix.periodFrom, periodTo: fix.periodTo, adjustmentDate: fix.adjustmentDate, fixedValues: fixed };
  }

  /* Проверка окна «Пересчет с фиксацией»: [{ field: 'periodFrom'|'periodTo'|'adjustmentDate', code }].
     code: REQUIRED · PERIOD_ORDER (От позже До) · NOT_AFTER_FIXATION (дата корректировки не позже
     конца периода). От раньше первой даты отчёта не ошибка: дат до первой колонки в отчёте нет,
     фиксируются даты периода внутри сетки (RE0050). */
  function checkRasFixation(rec) {
    var out = [];
    if (!rec.periodFrom) out.push({ field: 'periodFrom', code: 'REQUIRED' });
    if (!rec.periodTo) out.push({ field: 'periodTo', code: 'REQUIRED' });
    if (!rec.adjustmentDate) out.push({ field: 'adjustmentDate', code: 'REQUIRED' });
    if (rec.periodFrom && rec.periodTo && rec.periodFrom > rec.periodTo) out.push({ field: 'periodTo', code: 'PERIOD_ORDER' });
    if (rec.adjustmentDate && rec.periodTo && rec.adjustmentDate <= rec.periodTo) out.push({ field: 'adjustmentDate', code: 'NOT_AFTER_FIXATION' });
    return out;
  }

  function nextAdjustmentId() {
    var max = 0;
    current.ras.adjustments.forEach(function (a) {
      var n = parseInt(String(a.id).split('-').pop(), 10);
      if (n > max) max = n;
    });
    return 'RA-' + (max + 1);
  }

  function sumParts(parts) {
    return round2f(RAS_PARTS.reduce(function (s, k) { return s + (Number(parts && parts[k]) || 0); }, 0));
  }

  /* Дельта по видам — доли RAS_PART_SHARES, остаток копеек — в последнюю часть: сумма частей = дельта. */
  function splitDelta(delta) {
    var parts = {}, left = delta;
    RAS_PARTS.forEach(function (k, i) {
      var v = i === RAS_PARTS.length - 1 ? round2f(left) : round2f(delta * RAS_PART_SHARES[i]);
      parts[k] = v;
      left -= v;
    });
    return parts;
  }

  /* Пересчёт с фиксацией: значения периода фиксируются по текущему расчёту, пересчёт поднимает gen,
     дельта на каждой дате периода = новый расчёт (с внесёнными корректировками) − зафиксированное.
     Каждая ненулевая — строка AUTO на целевую дату корректировки; прежние корректировки остаются
     при своём пересчёте (решение человека 03.11.2026, RE0050). Комментарий из окна попадает во все
     созданные строки; пустое поле оставляет ячейку комментария пустой. Возвращает число строк. */
  function createAdjustments(fiId, fix) {
    var fx = makeFixation(fiId, fix);
    current.ras.fixationPeriods[fiId] = {
      periodFrom: fix.periodFrom, periodTo: fix.periodTo, adjustmentDate: fix.adjustmentDate
    };
    current.ras.gen[fiId] = genOf(current.ras.gen, fiId) + 1;
    var gen = genOf(current.ras.gen, fiId);
    var created = 0;
    Object.keys(fx.fixedValues).sort().forEach(function (d) {
      var delta = round2f(reportedValue(fiId, d, gen, current.ras.adjustments) - fx.fixedValues[d]);
      if (!delta) return;
      current.ras.adjustments.push({
        id: nextAdjustmentId(), financialInstrumentId: fiId, startDate: d, endDate: fx.adjustmentDate,
        parts: splitDelta(delta), adjustmentAmount: delta, comment: fix.comment || '', sourceCode: 'AUTO'
      });
      created++;
    });
    return created;
  }

  /* «Пересчитать» и «Пересчитать с фиксацией» на тайле «Процентные платежи» — имитация с задержкой.
     owner — ФИ или ключ транша (ownerKey). Пересчёт с фиксацией (opts = { periodFrom, periodTo,
     adjustmentDate, comment }) пересчитывает весь срок: значения зафиксированного периода
     возвращаются корректировками на дату корректировки; comment попадает во все созданные строки. */
  function recalcPayments(owner, opts) {
    if (paymentsBusy) return Promise.resolve({ busy: true });
    paymentsBusy = true;
    emit({ reason: 'payments-calculating' });
    return new Promise(function (resolve) {
      setTimeout(function () {
        var withFixation = !!(owner && opts && opts.periodFrom && opts.periodTo && opts.adjustmentDate);
        var created = 0;
        if (owner) {
          if (withFixation) created = createAdjustments(owner, opts);
          else current.ras.gen[owner] = genOf(current.ras.gen, owner) + 1;
        }
        paymentsBusy = false;
        touchRas('payments-recalculated', { fiId: owner, created: created, withFixation: withFixation });
        resolve({ fiId: owner, created: created, withFixation: withFixation });
      }, PAYMENTS_DELAY_MS);
    });
  }

  function isPaymentsBusy() { return paymentsBusy; }

  function rasAdjustments(fiId) {
    return clone(current.ras.adjustments.filter(function (a) { return fiId == null || a.financialInstrumentId === fiId; }));
  }

  /* Ручная корректировка: rec = { fiId, startDate, endDate, parts, comment }; fiId — ФИ или ключ
     транша без ФИ; сумма — сумма частей. */
  function addRasAdjustment(rec) {
    var fiId = rec.fiId;
    if (!fiId) return { error: 'NO_FI' };
    var parts = {};
    RAS_PARTS.forEach(function (k) { parts[k] = round2f(Number(rec.parts && rec.parts[k]) || 0); });
    var id = nextAdjustmentId();
    current.ras.adjustments.push({
      id: id, financialInstrumentId: fiId, startDate: rec.startDate, endDate: rec.endDate,
      parts: parts, adjustmentAmount: sumParts(parts), comment: rec.comment || '', sourceCode: 'MANUAL'
    });
    touchRas('ras-adjustment', { id: id });
    return { ok: true, id: id };
  }

  function removeRasAdjustment(id) {
    var i = current.ras.adjustments.map(function (a) { return a.id; }).indexOf(id);
    if (i === -1) return { error: 'NOT_FOUND' };
    current.ras.adjustments.splice(i, 1);
    touchRas('ras-adjustment', { id: id });
    return { ok: true };
  }

  /* Массовое удаление: одна запись в хранилище и одно событие на всю пачку (RE0050, вторая волна). */
  function removeRasAdjustments(ids) {
    var want = {};
    (ids || []).forEach(function (id) { want[id] = true; });
    var before = current.ras.adjustments.length;
    current.ras.adjustments = current.ras.adjustments.filter(function (a) { return !want[a.id]; });
    var removed = before - current.ras.adjustments.length;
    if (!removed) return { ok: true, removed: 0 };
    touchRas('ras-adjustment', { removed: removed });
    return { ok: true, removed: removed };
  }

  /* Пересчёт метрик запоминает, что пересчитано: число пересчётов платежей и корректировки. */
  function takeSnapshot() {
    current.ras.snapshot = { gen: clone(current.ras.gen), adjustments: clone(current.ras.adjustments) };
  }

  /* Отметки отчёта РСБУ: { fiId: { 'ГГГГ-ММ-ДД': сумма корректировок на эту целевую дату } } по снимку. */
  function rasMarks() {
    var out = {};
    snapshot().adjustments.forEach(function (a) {
      var m = out[a.financialInstrumentId] || (out[a.financialInstrumentId] = {});
      m[a.endDate] = round2f((m[a.endDate] || 0) + a.adjustmentAmount);
    });
    return out;
  }

  function resetRas() {
    current.ras = emptyRas();
    touchRas('ras-state');
    /* снятое состояние не должно вернуться из адреса при обновлении страницы (RE0035, Э4) */
    stripRasParams(['rasReset'].concat(RAS_URL_PARAMS));
  }

  /* Служебное действие таба System — «Сбросить» (RE0035, Э4). Объявлено в сторе, а не на странице:
     стор грузят все страницы концепта, поэтому действие есть на любой из них. */
  (window.PP_SYSTEM = window.PP_SYSTEM || []).push({
    id: 'ras-reset',
    title: 'Пересчет с фиксацией и корректировки РСБУ',
    desc: 'Вернуть демо-состояние сделки: корректировок и пересчёта платежей нет.',
    action: 'Сбросить',
    run: function () { resetRas(); }
  });

  function reportTabs() {
    var out = ['IFRS', 'RAS', 'KPI'].map(function (code) {
      return { code: code, label: LABELS.tabs[code] || code, isEmpty: cardsOfTab(code).length === 0 };
    });
    var count = current.fixations.length;
    out.push({ code: 'FIXATIONS', label: LABELS.tabs.FIXATIONS || 'FIXATIONS', isEmpty: count === 0, count: count });
    return out;
  }

  function on(type, fn) {
    if (type !== 'change') return function () {};
    listeners.push(fn);
    return function off() {
      var i = listeners.indexOf(fn);
      if (i !== -1) listeners.splice(i, 1);
    };
  }

  window.FinMetricsStore = {
    ready: ready,
    persist: persist,
    use: use,
    dealId: function () { return current.dealId; },
    state: state,
    calculate: calculate,
    reportTabs: reportTabs,
    report: report,
    indicators: indicators,
    fixations: fixations,
    removeFixation: removeFixation,
    fixationCandidates: fixationCandidates,
    fixationContext: fixationContext,
    preliminary: preliminary,
    checkFixations: checkFixations,
    saveFixations: saveFixations,
    trancheFiIds: trancheFiIds,
    fiOfTranche: fiOfTranche,
    ownerKey: ownerKey,
    rasEventDates: rasEventDates,
    rasReportDates: rasReportDates,
    rasLastFixation: rasLastFixation,
    checkRasFixation: checkRasFixation,
    recalcPayments: recalcPayments,
    paymentsBusy: isPaymentsBusy,
    rasAdjustments: rasAdjustments,
    addRasAdjustment: addRasAdjustment,
    removeRasAdjustment: removeRasAdjustment,
    removeRasAdjustments: removeRasAdjustments,
    rasMarks: rasMarks,
    rasParts: function () { return RAS_PARTS.slice(); },
    resetRas: resetRas,
    on: on
  };
})();
