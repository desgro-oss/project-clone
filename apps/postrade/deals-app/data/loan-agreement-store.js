/* =========================================================================
   LoanAgreementStore — договор займа (НКЛ) выбранной сделки: разделы
   договора, дополнительные соглашения (ДС), процентные схемы ЕТС.

   Подключить ПОСЛЕ mock-product-catalog.js, mock-deal-trees.js, post-api.js,
   product-tree-store.js, deals-store.js и mock-loan-agreements.js. До
   первого use() дождаться LoanAgreementStore.ready и ProductTreeStore.ready:
   иначе сохранённые правки договора и дерева не видны.

   Экспорт: window.LoanAgreementStore = {
     ready → Promise                         — загружены сохранённые договоры
     persist(on)                             — false: витрина не читает и не
                                               пишет сохранённое
     use(dealId, instrumentId)               — открыть договор: узел
                                               «Договор займа (НКЛ)» дерева
                                               сделки; нет записи — пустой
     get() → LoanAgreementRsDto              — копия текущей записи
     instrument() → ProductTreeNodeView|null — узел договора в дереве
     tranches() → ProductTreeNodeView[]      — транши договора из дерева
     plannedRepaymentDate() → ISO|null       — самая поздняя плановая дата
                                               погашения траншей договора
     isEditable() → boolean                  — правка разрешена
     — разделы договора (значения — поля typedef, mock-loan-agreements.js):
     setContract(c) · setBalanceCurrency(b) · setTechInfo(t) → boolean
     counterparty() → запись базы контрагентов|null — контрагент договора
     setCounterparty(id) → boolean           — выбрать контрагента; новый для сделки
                                               становится её участником (не КНР)
     — дополнительные соглашения:
     agreements([filter]) → ДС[]             — от новых к старым по seqNumber
     agreementNumber(a) → '<seqNumber>-<номер договора>'
     lastAgreement() → ДС|null · nextSeqNumber() → number
     addAgreement(a) → id · updateAgreement(id, patch) · removeAgreement(id) → boolean
     — процентные схемы ЕТС:
     schemes() → схемы[]                     — от новых к старым по дате начала
     validateScheme(s[, exceptId]) → коды ошибок[]
     addScheme(s) → { ok, id, errors } · updateScheme(id, s) → { ok, errors }
     removeScheme(id) → boolean
     currentScheme(date) → схема|null        — схема, период которой покрывает дату
     lastScheme() → схема|null               — с самой поздней датой окончания
     displayScheme([date]) → схема|null      — для тайла ЕТС: схема на дату, а если
                                               её нет — последняя (ответ 27)
     rateOf(scheme, date) → { percent, kind, baseIndexCode, spreadPercent, baseIndexPercent }
     currentRate([date]) → rateOf + { schemeId, isCurrent }|null
                                             — ставка displayScheme; у схемы вне периода
                                               считается на ближайшую дату её периода
     rateHistory() → [{ startDate, endDate, ratePercent }] — История ставок: одна
                                               строка на схему, у плавающей — ставка
                                               на дату начала (вопрос 32, временно)
     baseIndexHistory() → BaseIndexHistoryRsDto[]          — История БИ
     today() → ISO
     on('change', fn) → off()
   }

   Правила предметной области живут здесь, а не в тайлах и окнах (ответы
   человека 26.10.2026 — задача RE0041):
   – плановая дата погашения договора — самая поздняя среди его траншей, у
     которых она задана (вопрос 3); нет дат — null;
   – правка недоступна, если не позволяет статус сделки (DealsStore) или
     договор погашен (вопрос 9). Роль в прототипе не моделируется — какие роли
     не правят, не решено (RE0041, вопрос 22);
   – периоды схем ЕТС одного договора не пересекаются (вопрос 10); границы
     включительно, соседние периоды (до 31.12 и с 01.01) допустимы;
   – ставка схемы: фиксированная — значение в %; плавающая — значение БИ + спред
     в %: КС = 10, спред 5 → 15 (вопрос 10);
   – изменившийся БИ применяется не в день изменения, а через
     baseIndexLagWorkDays рабочих дней схемы (вопрос 11); выходные — суббота и
     воскресенье, производственного календаря в прототипе нет;
   – контрагент договора свой, один; выбранный становится участником сделки, если им не
     был; один контрагент может быть у нескольких инструментов и КНР сделки (вопрос 33);
   – номер ДС — «<порядковый номер>-<номер договора>», например «4-1234567890»
     (вопросы 13 и 26); договор не заполнен — только порядковый номер;
   – дата ДС — «дата подписания» (она же «дата создания»), поле signDate (вопрос 25);
   – даты схемы ЕТС обязательны (вопрос 28); тайл ЕТС без схемы на сегодня показывает
     последнюю (вопрос 27 — остаётся открытым вопросом паспорта тайла).

   Правка сохраняется сразу — через PostApi.loanAgreements (localStorage или
   сервер данных, data/API.md), ключ — id узла договора; черновика нет: окна
   держат введённое сами и зовут стор по «Сохранить».
   ========================================================================= */
(function () {
  'use strict';

  var DEMO = window.MOCK_LOAN_AGREEMENTS || {};
  var BASE_HISTORY = window.MOCK_BASE_INDEX_HISTORY || [];

  var persistOn = true;
  var saved = {};
  var current = { dealId: null, instrumentId: null, record: null };
  var listeners = [];

  function clone(x) { return x == null ? x : JSON.parse(JSON.stringify(x)); }
  function str(x) { return x == null ? null : String(x).trim() || null; }
  function num(x) {
    if (x == null || x === '') return null;
    var n = typeof x === 'number' ? x : parseFloat(String(x).replace(/\s/g, '').replace(',', '.'));
    return isFinite(n) ? n : null;
  }

  function emit(detail) {
    listeners.forEach(function (fn) { fn(detail); });
  }

  function today() {
    return window.LOAN_AGREEMENT_DEMO_TODAY || new Date().toISOString().slice(0, 10);
  }

  /* ── Даты (ISO «ГГГГ-ММ-ДД», UTC) ───────────────────────────────── */

  function toTime(iso) {
    var p = String(iso).split('-');
    return Date.UTC(+p[0], +p[1] - 1, +p[2]);
  }
  function fromTime(t) { return new Date(t).toISOString().slice(0, 10); }

  /* Через n рабочих дней: суббота и воскресенье не считаются. */
  function addWorkDays(iso, n) {
    var t = toTime(iso);
    var left = Math.max(0, n | 0);
    while (left > 0) {
      t += 86400000;
      var wd = new Date(t).getUTCDay();
      if (wd !== 0 && wd !== 6) left--;
    }
    return fromTime(t);
  }

  /* ── Загрузка и выбор договора ───────────────────────────────────── */

  var ready = (window.PostApi
    ? window.PostApi.ready.then(function () { return window.PostApi.loanAgreements.all(); })
    : Promise.resolve({})
  ).then(function (all) {
    if (!persistOn) return;
    Object.keys(all || {}).forEach(function (id) {
      if (all[id] && all[id].agreement) saved[id] = all[id].agreement;
    });
  }).catch(function () { /* нет сохранённого — остаётся демо */ });

  function persist(on) { persistOn = on !== false; }

  function emptyRecord(instrumentId) {
    return {
      instrumentId: instrumentId, counterpartyId: null, contract: null, balanceCurrency: null, techInfo: null,
      additionalAgreements: [], transferSchemes: [], trancheSchedules: {}
    };
  }

  function use(dealId, instrumentId) {
    var src = (persistOn && saved[instrumentId]) || DEMO[instrumentId];
    current = {
      dealId: dealId, instrumentId: instrumentId,
      record: src ? clone(src) : emptyRecord(instrumentId)
    };
    var trees = window.ProductTreeStore;
    if (trees && dealId != null && String(trees.dealId()) !== String(dealId)) trees.use(dealId);
    emit({ reason: 'use' });
  }

  function get() { return clone(current.record); }

  function save(reason) {
    if (persistOn && window.PostApi && current.instrumentId) {
      saved[current.instrumentId] = clone(current.record);
      window.PostApi.loanAgreements.put(current.instrumentId, { agreement: current.record });
    }
    emit({ reason: reason });
  }

  /* ── Договор в дереве продуктов ──────────────────────────────────── */

  function instrument() {
    var trees = window.ProductTreeStore;
    return trees && current.instrumentId ? trees.node(current.instrumentId) : null;
  }

  function tranches() {
    var node = instrument();
    return node ? node.children.filter(function (c) { return c.kind === 'TRANCHE'; }) : [];
  }

  function plannedRepaymentDate() {
    var schedules = current.record ? current.record.trancheSchedules : {};
    var best = null;
    tranches().forEach(function (t) {
      var d = schedules[t.id];
      if (d && (best === null || d > best)) best = d;
    });
    return best;
  }

  function isEditable() {
    var deals = window.DealsStore;
    if (deals && current.dealId != null) {
      var deal = deals.byId(current.dealId);
      if (!deal || !deals.isEditable(deal)) return false;
    }
    var node = instrument();
    return !(node && node.repaidAt);
  }

  /* ── Разделы договора ────────────────────────────────────────────── */

  /* Раздел, сохранённый без единого значения, — «не заполнено»: запись раздела сбрасывается
     в null, тайл показывает «Заполнить» (ответ человека 27.10.2026, вопрос 37) */
  function setContract(c) {
    var v = { contractNumber: str(c.contractNumber) || '', contractSignDate: str(c.contractSignDate) };
    current.record.contract = (v.contractNumber || v.contractSignDate) ? v : null;
    save('contract');
    return true;
  }

  function setBalanceCurrency(b) {
    var v = { balanceCode: str(b.balanceCode), currencyCode: str(b.currencyCode), totalLimitAmount: num(b.totalLimitAmount) };
    current.record.balanceCurrency = (v.balanceCode || v.currencyCode || v.totalLimitAmount != null) ? v : null;
    save('balance');
    return true;
  }

  function setTechInfo(t) {
    var v = { gfoId: str(t.gfoId) || '', gfoFundingCreditId: str(t.gfoFundingCreditId) || '' };
    current.record.techInfo = (v.gfoId || v.gfoFundingCreditId) ? v : null;
    save('tech');
    return true;
  }

  function counterparty() {
    var cps = window.CounterpartiesStore;
    var id = current.record && current.record.counterpartyId;
    return id && cps ? cps.byId(id) : null;
  }

  /* Участником сделки контрагент становится в её составе (CounterpartiesStore):
     состав открыт на этой же сделке — переносим и сохраняем; иначе только запись договора. */
  function setCounterparty(id) {
    id = str(id);
    var cps = window.CounterpartiesStore;
    if (id && cps && !cps.byId(id)) return false;
    current.record.counterpartyId = id;
    if (id && cps && String(cps.dealId()) === String(current.dealId) && !cps.isMember(id)) {
      cps.move(id, 'member');
      cps.commit();
    }
    save('counterparty');
    return true;
  }

  /* ── Дополнительные соглашения ───────────────────────────────────── */

  function agreementNumber(a) {
    var c = current.record.contract;
    return c && c.contractNumber ? a.seqNumber + '-' + c.contractNumber : String(a.seqNumber);
  }

  function inRange(value, from, to) {
    if (!from && !to) return true;
    if (!value) return false;
    return (!from || value >= from) && (!to || value <= to);
  }

  function hasAny(have, want) {
    return !want || !want.length || want.some(function (w) { return have.indexOf(w) !== -1; });
  }

  /* filter: number, signFrom, signTo, changeTypeCode, keyChangeCodes[]
     (любое из выбранных), decisionNumber, decisionFrom, decisionTo,
     approvalLevelCodes[] (любой из выбранных). Пустое поле не сужает. */
  function agreements(filter) {
    var f = filter || {};
    return clone(current.record.additionalAgreements.filter(function (a) {
      if (f.number && agreementNumber(a).toLowerCase().indexOf(String(f.number).trim().toLowerCase()) === -1) return false;
      if (!inRange(a.signDate, f.signFrom, f.signTo)) return false;
      if (f.changeTypeCode && a.changeTypeCode !== f.changeTypeCode) return false;
      if (!hasAny(a.keyChangeCodes || [], f.keyChangeCodes)) return false;
      if (f.decisionNumber && String(a.decisionNumber || '').toLowerCase().indexOf(String(f.decisionNumber).trim().toLowerCase()) === -1) return false;
      if (!inRange(a.decisionDate, f.decisionFrom, f.decisionTo)) return false;
      if (f.approvalLevelCodes && f.approvalLevelCodes.length && f.approvalLevelCodes.indexOf(a.approvalLevelCode) === -1) return false;
      return true;
    }).sort(function (x, y) { return y.seqNumber - x.seqNumber; }));
  }

  function lastAgreement() {
    var all = agreements();
    return all.length ? all[0] : null;
  }

  function nextSeqNumber() {
    return current.record.additionalAgreements.reduce(function (m, a) { return Math.max(m, a.seqNumber); }, 0) + 1;
  }

  function nextId(prefix, list) {
    var max = list.reduce(function (m, x) {
      var n = parseInt(String(x.id).split('-').pop(), 10);
      return isFinite(n) ? Math.max(m, n) : m;
    }, 0);
    return prefix + '-' + (max + 1);
  }

  function packAgreement(a) {
    return {
      seqNumber: num(a.seqNumber), signDate: str(a.signDate),
      changeTypeCode: str(a.changeTypeCode), keyChangeCodes: (a.keyChangeCodes || []).slice(),
      comment: str(a.comment), decisionDate: str(a.decisionDate),
      decisionNumber: str(a.decisionNumber), approvalLevelCode: str(a.approvalLevelCode)
    };
  }

  function addAgreement(a) {
    var rec = packAgreement(a);
    if (rec.seqNumber == null) rec.seqNumber = nextSeqNumber();
    rec.id = nextId('AA-' + current.instrumentId, current.record.additionalAgreements);
    current.record.additionalAgreements.push(rec);
    save('agreement-add');
    return rec.id;
  }

  function findIn(list, id) {
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return i;
    return -1;
  }

  function updateAgreement(id, patch) {
    var list = current.record.additionalAgreements;
    var i = findIn(list, id);
    if (i === -1) return false;
    var next = packAgreement(Object.assign({}, list[i], patch));
    next.id = id;
    list[i] = next;
    save('agreement-update');
    return true;
  }

  function removeAgreement(id) {
    var list = current.record.additionalAgreements;
    var i = findIn(list, id);
    if (i === -1) return false;
    list.splice(i, 1);
    save('agreement-remove');
    return true;
  }

  /* ── Процентные схемы ЕТС ────────────────────────────────────────── */

  function schemes() {
    return clone(current.record.transferSchemes.slice().sort(function (a, b) {
      return String(b.startDate || '').localeCompare(String(a.startDate || ''));
    }));
  }

  function packScheme(s) {
    var type = str(s.rateTypeCode);
    return {
      startDate: str(s.startDate), endDate: str(s.endDate),
      baseIndexLagWorkDays: num(s.baseIndexLagWorkDays) || 0,
      comment: str(s.comment), rateTypeCode: type,
      fixedRatePercent: type === 'FIXED' ? num(s.fixedRatePercent) : null,
      baseIndexCode: type === 'FLOATING' ? str(s.baseIndexCode) : null,
      spreadPercent: type === 'FLOATING' ? num(s.spreadPercent) : null
    };
  }

  /* Коды ошибок окна «Процентная схема»:
     RATE_REQUIRED   — не выбран тип ставки или не заполнены её значения
                       («Необходимо заполнить данные по ставке»);
     PERIOD_REQUIRED — не заполнена дата начала или окончания (ответ человека 26.10.2026,
                       вопрос 28; текст ошибки — согласовать при сборке окна);
     PERIOD_ORDER    — дата окончания раньше даты начала;
     PERIOD_OVERLAP  — период пересекается с другой схемой договора
                       («Период пересекается с другой процентной схемой»). */
  function validateScheme(s, exceptId) {
    var p = packScheme(s);
    var errors = [];
    var rateOk = (p.rateTypeCode === 'FIXED' && p.fixedRatePercent != null)
      || (p.rateTypeCode === 'FLOATING' && p.baseIndexCode && p.spreadPercent != null);
    if (!rateOk) errors.push('RATE_REQUIRED');
    if (!p.startDate || !p.endDate) {
      errors.push('PERIOD_REQUIRED');
    } else {
      if (p.endDate < p.startDate) {
        errors.push('PERIOD_ORDER');
      } else if (current.record.transferSchemes.some(function (o) {
        return o.id !== exceptId && o.startDate && o.endDate
          && p.startDate <= o.endDate && o.startDate <= p.endDate;
      })) {
        errors.push('PERIOD_OVERLAP');
      }
    }
    return errors;
  }

  function addScheme(s) {
    var errors = validateScheme(s);
    if (errors.length) return { ok: false, id: null, errors: errors };
    var rec = packScheme(s);
    rec.id = nextId('TS-' + current.instrumentId, current.record.transferSchemes);
    current.record.transferSchemes.push(rec);
    save('scheme-add');
    return { ok: true, id: rec.id, errors: [] };
  }

  function updateScheme(id, s) {
    var list = current.record.transferSchemes;
    var i = findIn(list, id);
    if (i === -1) return { ok: false, errors: ['NOT_FOUND'] };
    var errors = validateScheme(s, id);
    if (errors.length) return { ok: false, errors: errors };
    var rec = packScheme(s);
    rec.id = id;
    list[i] = rec;
    save('scheme-update');
    return { ok: true, errors: [] };
  }

  function removeScheme(id) {
    var list = current.record.transferSchemes;
    var i = findIn(list, id);
    if (i === -1) return false;
    list.splice(i, 1);
    save('scheme-remove');
    return true;
  }

  function currentScheme(date) {
    var d = date || today();
    var hit = current.record.transferSchemes.filter(function (s) {
      return s.startDate && s.endDate && s.startDate <= d && d <= s.endDate;
    })[0];
    return hit ? clone(hit) : null;
  }

  /* Последняя схема — с самой поздней датой окончания (при равенстве — позже начатая). */
  function lastScheme() {
    var hit = null;
    current.record.transferSchemes.forEach(function (s) {
      if (!s.endDate) return;
      if (!hit || s.endDate > hit.endDate || (s.endDate === hit.endDate && String(s.startDate) > String(hit.startDate))) hit = s;
    });
    return hit ? clone(hit) : null;
  }

  /* Схема для тайла ЕТС: на дату; если на неё схемы нет — последняя (ответ 27). */
  function displayScheme(date) {
    return currentScheme(date) || lastScheme();
  }

  /* Значение БИ на дату: последнее изменение, вступившее в силу — через
     lag рабочих дней после даты изменения. */
  function baseIndexValue(code, date, lag) {
    var hit = null;
    BASE_HISTORY.forEach(function (h) {
      if (h.baseIndexCode !== code) return;
      if (addWorkDays(h.changeDate, lag) > date) return;
      if (!hit || h.changeDate > hit.changeDate) hit = h;
    });
    return hit ? hit.valuePercent : null;
  }

  function round2(x) { return Math.round(x * 100) / 100; }

  function rateOf(scheme, date) {
    if (!scheme) return null;
    var d = date || today();
    if (scheme.rateTypeCode === 'FIXED') {
      return { percent: scheme.fixedRatePercent, kind: 'FIXED', baseIndexCode: null, spreadPercent: null, baseIndexPercent: null };
    }
    var base = baseIndexValue(scheme.baseIndexCode, d, scheme.baseIndexLagWorkDays || 0);
    return {
      percent: base == null ? null : round2(base + scheme.spreadPercent),
      kind: 'FLOATING', baseIndexCode: scheme.baseIndexCode,
      spreadPercent: scheme.spreadPercent, baseIndexPercent: base
    };
  }

  /* Ставка для тайла ЕТС. Схема вне периода (последняя, когда сегодняшней нет)
     считается на ближайшую дату своего периода: у плавающей — БИ на конец
     истёкшей схемы, а не сегодняшний. isCurrent — схема действует на дату. */
  function currentRate(date) {
    var d = date || today();
    var scheme = displayScheme(d);
    if (!scheme) return null;
    var isCurrent = !!(scheme.startDate && scheme.endDate && scheme.startDate <= d && d <= scheme.endDate);
    var asOf = d;
    if (!isCurrent && scheme.endDate && d > scheme.endDate) asOf = scheme.endDate;
    else if (!isCurrent && scheme.startDate && d < scheme.startDate) asOf = scheme.startDate;
    var rate = rateOf(scheme, asOf);
    rate.schemeId = scheme.id;
    rate.isCurrent = isCurrent;
    return rate;
  }

  /* История ставок — одна строка на схему (вариант А вопроса 32, временно):
     период схемы и её ставка; у плавающей — на дату начала схемы. */
  function rateHistory() {
    return current.record.transferSchemes
      .filter(function (s) { return s.startDate && s.endDate; })
      .map(function (s) {
        var r = rateOf(s, s.startDate);
        return { startDate: s.startDate, endDate: s.endDate, ratePercent: r ? r.percent : null };
      })
      .sort(function (a, b) { return b.startDate.localeCompare(a.startDate); });
  }

  function baseIndexHistory() { return clone(BASE_HISTORY); }

  function on(type, fn) {
    if (type !== 'change') return function () {};
    listeners.push(fn);
    return function () {
      var i = listeners.indexOf(fn);
      if (i !== -1) listeners.splice(i, 1);
    };
  }

  window.LoanAgreementStore = {
    ready: ready,
    persist: persist,
    use: use,
    get: get,
    instrument: instrument,
    tranches: tranches,
    plannedRepaymentDate: plannedRepaymentDate,
    isEditable: isEditable,
    setContract: setContract,
    setBalanceCurrency: setBalanceCurrency,
    setTechInfo: setTechInfo,
    counterparty: counterparty,
    setCounterparty: setCounterparty,
    agreements: agreements,
    agreementNumber: agreementNumber,
    lastAgreement: lastAgreement,
    nextSeqNumber: nextSeqNumber,
    addAgreement: addAgreement,
    updateAgreement: updateAgreement,
    removeAgreement: removeAgreement,
    schemes: schemes,
    validateScheme: validateScheme,
    addScheme: addScheme,
    updateScheme: updateScheme,
    removeScheme: removeScheme,
    currentScheme: currentScheme,
    lastScheme: lastScheme,
    displayScheme: displayScheme,
    rateOf: rateOf,
    currentRate: currentRate,
    rateHistory: rateHistory,
    baseIndexHistory: baseIndexHistory,
    today: today,
    on: on
  };
})();
