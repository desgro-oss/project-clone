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
                 — имитация с задержкой; calculated · failed — [{id, name}]
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
   расчёта — все ФИ · примерно половина · ни одного. Без параметра исход
   определяет правило готовности. Исход по сценарию живёт до перезагрузки
   страницы и в хранилище не пишется.

   Сценарий панели ?fmFix=prefail|fail: предварительный расчёт падает · часть ФИ
   (каждая вторая карточка: вторая, четвёртая…; единственная — целиком) не фиксируется. Исход по сценарию
   в хранилище не пишется.

   Сценарий панели ?fmEts=slow|failed|empty|multiple: ЕТС грузится ~8 с · ошибка расчёта
   ЕТС · ЕТС нет или 0 · разные ЕТС у инструментов ФИ. Без параметра — обычное значение.
   В хранилище не пишется.

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

  /* Квартальные даты, из которых строятся события ФИ. */
  var QUARTER_ENDS = [
    '2024-03-31', '2024-06-30', '2024-09-30', '2024-12-31',
    '2025-03-31', '2025-06-30', '2025-09-30', '2025-12-31',
    '2026-03-31', '2026-06-30', '2026-09-30', '2026-12-31'
  ];

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

  var current = { dealId: null, calculation: null, fixations: [] };
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
      if (rec && rec.calculation) saved[key] = { calculation: rec.calculation, fixations: rec.fixations || [] };
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
    var rec = { calculation: clone(current.calculation), fixations: clone(current.fixations) };
    saved[String(dealId)] = rec;
    /* исход по сценарию панели (?fmCalc=, ?fmFix=) — показ, а не данные: в хранилище
       не пишется, чтобы повторный прогон сценария начинался с демо-записи */
    if (persistOn && api() && !scenario() && !fixScenario() && !etsScenario()) {
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
      fixations: rec ? clone(rec.fixations) : []
    };
    delete current.calculation.fixations;
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
        } else {
          current.calculation.lastAttemptFailed = true;
        }
        commit();
        busy = false;
        running = null;
        emit({ reason: 'calculated' });
        function pair(c) { return { id: c.id, name: c.name }; }
        resolve({
          outcome: !ok.length ? 'FAILED' : failed.length ? 'PARTIAL' : 'OK',
          calculated: ok.map(pair), failed: failed.map(pair)
        });
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
    list.forEach(function (c) {
      perFi[c.id] = eventDates(c);
      perFi[c.id].forEach(function (d) { all[d] = true; });
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
    on: on
  };
})();
