/* ============================================================
   EarlyInterestRepaymentModal.js — поведение окна «Новый платеж» / «Изменение платежа».

   Делает то, чего нет в рантаймах ДС, и только это:
   1) разводит два режима одной формы: новый платёж («Добавить») и изменение
      («Сохранить») — заголовок, кнопка и значения полей;
   2) форматирует сумму при вводе: только цифры, разряды неразрывным пробелом,
      запятая, не более двух знаков; знака «-» нет;
   3) «Рассчитать платежи»: берёт задолженность процентного периода, в который попала
      дата платежа, и раскладывает сумму по видам задолженности в порядке приоритета
      (первый вид гасится целиком, остаток идёт в следующий); результат — таблица
      «Задолженность на дату»;
   4) «Досрочная сумма» в таблице только считается по приоритету, вручную не правится
      (правка v3, 20.10.2026);
   5) проверки: пустые дата и сумма при расчёте — красная рамка без текста; расчёт и
      добавление — Alert вверху окна (заголовок и текст). Смена даты или суммы после
      расчёта таблицу не сбрасывает, но «Добавить» без нового расчёта не пройдёт.

   Открытие, фокус, Esc, крестик и календарь делают рантаймы ДС. Страницу и таблицу
   платежей окно не знает: задолженность, валюту и приоритет берёт у страницы,
   проверенную запись отдаёт ей же.

   API:
     PostModalEarlyInterest.bind(scrim, { options, save }) → api
       options()           → { currencyCode, periodDebts, order, debtLabels } — валюта;
                             задолженность по периодам [{ periodStartDate, periodEndDate,
                             accrued: { КОД: сумма } }]; коды видов по приоритету;
                             подписи видов { КОД: 'Подпись' }
       save(rec, wasEdit)  — принять запись { paymentDate, paymentAmount, comment,
                             allocations } (дата ISO); wasEdit — окно открыто на изменение
       api.open(rec|null)  — заполнить окно (null — новый платёж) и открыть
       api.fill(rec|null)  — только заполнить (на витрине окно уже на экране)
       api.demo(name)      — привести окно к состоянию сценария: empty, validate, calc,
                             err-nodebt, err-excess, err-notcalc
       api.calculate()     → boolean — «Рассчитать платежи»
       api.validate()      → boolean — проверка перед «Добавить» / «Сохранить»
   ============================================================ */
(function () {
  'use strict';

  var NBSP = ' ';
  var EPS = 0.004;

  /* ── Формат ─────────────────────────────────────────────────────── */
  function money(n) {
    var p = Number(n).toFixed(2).split('.');
    return p[0].replace(/\B(?=(\d{3})+(?!\d))/g, NBSP) + ',' + p[1];
  }
  function date(iso) { var p = String(iso).split('-'); return p[2] + '.' + p[1] + '.' + p[0]; }
  /* «31.03.2025» → «2025-03-31»; не дата → '' */
  function parseDate(text) {
    var m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(String(text).trim());
    if (!m) return '';
    var d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
    if (d.getFullYear() !== Number(m[3]) || d.getMonth() !== Number(m[2]) - 1 || d.getDate() !== Number(m[1])) return '';
    return m[3] + '-' + m[2] + '-' + m[1];
  }
  /* «1 250 000,5» → число; пусто или мусор → NaN */
  function parseMoney(str) {
    var s = String(str).replace(/\s/g, '').replace(',', '.');
    return s === '' || isNaN(Number(s)) ? NaN : Number(s);
  }
  function round2(n) { return Math.round(n * 100) / 100; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  /* Только цифры, разряды, запятая, до двух знаков; курсор остаётся на своей цифре */
  function formatAmount(inp) {
    var raw = inp.value, pos = inp.selectionStart == null ? raw.length : inp.selectionStart;
    var left = raw.slice(0, pos).replace(/[^\d,.]/g, '').length;
    var clean = raw.replace(/\./g, ',').replace(/[^\d,]/g, '');
    var parts = clean.split(',');
    var intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
    var out = intPart + (parts.length > 1 ? ',' + parts.slice(1).join('').slice(0, 2) : '');
    inp.value = out;
    var n = 0, caret = 0;
    while (caret < out.length && n < left) { if (/[\d,]/.test(out.charAt(caret))) n++; caret++; }
    try { inp.setSelectionRange(caret, caret); } catch (e) { /* поле без выделения */ }
  }

  function bind(scrim, opts) {
    if (!scrim) return null;
    if (scrim.__earlyInterest) return scrim.__earlyInterest;
    opts = opts || {};

    var form = scrim.querySelector('form');
    var alertBox = scrim.querySelector('.modal__alert');
    var alertTitle = scrim.querySelector('.alert__title');
    var alertText = scrim.querySelector('.alert__text');
    var title = scrim.querySelector('.modal__title');
    var submit = scrim.querySelector('[data-ei-submit]');
    var calcBtn = scrim.querySelector('[data-ei-calc]');
    var tbl = scrim.querySelector('#ei-pay-tbl');
    var debtEmpty = scrim.querySelector('[data-ei-debt-empty]');
    var dateCtl = form.elements.paymentDate;
    var amtCtl = form.elements.paymentAmount;
    var editing = false;
    var calc = null;       // строки таблицы «Задолженность на дату»; null — не рассчитано
    var calcFor = null;    // { iso, amt } — дата и сумма, на которые таблица рассчитана
    var forceNoDebt = false; // сценарий панели «нет начислений на дату»
    var totalsBox = scrim.querySelector('[data-ei-totals]');
    var totalDebt = scrim.querySelector('[data-ei-total-debt]');

    function params() { return (opts.options && opts.options()) || { currencyCode: 'RUB', periodDebts: [], order: [], debtLabels: {} }; }
    function field(k) { return form.elements[k]; }
    function boxOf(k) { return field(k).closest('.inp'); }
    function isInline() { return scrim.classList.contains('modal-scrim--inline'); }
    function labelOf(code) { var l = params().debtLabels || {}; return l[code] || code; }
    function curDate() { return parseDate(dateCtl.value); }
    function curAmount() { return parseMoney(amtCtl.value); }

    /* ── Ошибки ─────────────────────────────────────────────────────── */
    function clearErrors() {
      alertBox.hidden = true;
      ['paymentDate', 'paymentAmount'].forEach(function (k) { boxOf(k).classList.remove('inp--error'); });
    }
    function showAlert(head, text) {
      alertTitle.textContent = head || '';
      alertTitle.hidden = !head;
      alertText.textContent = text || '';
      alertText.hidden = !text;
      alertBox.hidden = false;
    }

    /* ── Таблица «Задолженность на дату» ────────────────────────────── */
    /* «Досрочная сумма» — текст в ячейке: считается по приоритету, вручную не правится. */
    function paintTable() {
      tbl.querySelectorAll('.tbl__row:not(.tbl__row--head)').forEach(function (r) { r.remove(); });
      var cur = params().currencyCode;
      var html = (calc || []).map(function (r, i) {
        return '<div class="tbl__row" data-idx="' + i + '" style="grid-template-columns:8px 120px 144px minmax(200px,1fr) 88px 160px 152px 8px;"><div class="tc tc--separator"></div>'
          + '<div class="tc" data-col="periodStart"><span class="tc__row"><span class="tc__text">' + date(r.periodStartDate) + '</span></span></div>'
          + '<div class="tc" data-col="periodEnd"><span class="tc__row"><span class="tc__text">' + date(r.periodEndDate) + '</span></span></div>'
          + '<div class="tc" data-col="debtType"><span class="tc__row"><span class="tc__text">' + esc(labelOf(r.debtTypeCode)) + '</span></span></div>'
          + '<div class="tc" data-col="currency"><span class="tc__row"><span class="tc__text">' + esc(cur) + '</span></span></div>'
          + '<div class="tc tc--numbers" data-col="accrued"><span class="tc__row"><span class="tc__text">' + money(r.accruedAmount) + '</span></span></div>'
          + '<div class="tc tc--numbers" data-col="early"><span class="tc__row"><span class="tc__text">' + money(r.earlyAmount) + '</span></span></div>' + '<div class="tc tc--separator"></div></div>';
      }).join('');
      tbl.insertAdjacentHTML('beforeend', html);
      debtEmpty.hidden = !!(calc && calc.length);
      paintTotals();
      if (window.dsIcons) window.dsIcons.apply(tbl);
      if (window.DSInput) window.DSInput.syncAll(tbl);
    }

    /* Итог под таблицей: общая сумма задолженности */
    function paintTotals() {
      var acc = 0;
      (calc || []).forEach(function (r) { acc += r.accruedAmount; });
      totalsBox.hidden = !(calc && calc.length);
      totalDebt.textContent = money(acc);
    }

        /* ── Поля формы ─────────────────────────────────────────────────── */
    form.addEventListener('input', function (e) {
      var inp = e.target;
      if (inp.hasAttribute('data-amount')) formatAmount(inp);
      var box = inp.closest('.inp');
      if (box) box.classList.remove('inp--error');
    });
    form.addEventListener('change', function (e) {
      if (e.target === dateCtl) boxOf('paymentDate').classList.remove('inp--error');
    });
    form.addEventListener('focusout', function (e) {
      var inp = e.target;
      if (inp.hasAttribute && inp.hasAttribute('data-amount')) {
        var n = parseMoney(inp.value);
        if (!isNaN(n)) inp.value = money(n);
      }
    });

    /* ── Расчёт ─────────────────────────────────────────────────────── */
    /* Период, в который попала дата, и начисления на эту дату. Моки: начисления равны суммам первого
       демо-периода на 31.03.2025 и растут на ACCRUAL_PER_DAY за каждый день вперёд (основной долг от даты не зависит) (уменьшаются при
       уходе в прошлое) — задолженность копится вместе с процентами. В жизни это не всегда так: на
       графике платежей есть и погашения, после которых задолженность падает; с реальными данными
       логика заменится (решение человека 16.10.2026). Квартал вне демо-периодов строится по дате.
       Ошибка «начислений нет» показывается только сценарием панели (demo err-nodebt, флаг forceNoDebt). */
    var ACCRUAL_ANCHOR = Date.UTC(2025, 2, 31), ACCRUAL_PER_DAY = 0.0003, ACCRUAL_MIN = 0.3;
    function accruedOn(base, iso) {
      var t = Date.UTC(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1, Number(iso.slice(8, 10)));
      var k = Math.max(ACCRUAL_MIN, 1 + Math.round((t - ACCRUAL_ANCHOR) / 86400000) * ACCRUAL_PER_DAY);
      var out = {};
      Object.keys(base).forEach(function (code) { out[code] = code === 'PRINCIPAL' ? base[code] : Math.round(base[code] * k); });
      return out;
    }
    function periodFor(iso) {
      if (forceNoDebt) return null;
      var list = params().periodDebts;
      if (!list.length) return null;
      var hit = list.filter(function (p) { return iso > p.periodStartDate && iso <= p.periodEndDate; })[0];
      if (hit) return { periodStartDate: hit.periodStartDate, periodEndDate: hit.periodEndDate, accrued: accruedOn(list[0].accrued, iso) };
      var y = Number(iso.slice(0, 4)), m = Number(iso.slice(5, 7)), q = Math.floor((m - 1) / 3);
      var start = new Date(Date.UTC(y, q * 3, 1) - 86400000), end = new Date(Date.UTC(y, q * 3 + 3, 0));
      function z(n) { return (n < 10 ? '0' : '') + n; }
      function f(d) { return d.getUTCFullYear() + '-' + z(d.getUTCMonth() + 1) + '-' + z(d.getUTCDate()); }
      return { periodStartDate: f(start), periodEndDate: f(end), accrued: accruedOn(list[0].accrued, iso) };
    }

    function calculate() {
      clearErrors();
      var iso = curDate(), amt = curAmount(), bad = [];
      if (!iso) bad.push('paymentDate');
      if (isNaN(amt) || amt <= 0) bad.push('paymentAmount');
      if (bad.length) {
        bad.forEach(function (k) { boxOf(k).classList.add('inp--error'); });
        calc = null; calcFor = null; paintTable();
        return false;
      }
      var p = periodFor(iso);
      if (!p) {
        calc = null; calcFor = null; paintTable();
        showAlert('', 'На указанную дату начисления отсутствуют');
        return false;
      }
      var order = params().order, rest = amt, total = 0;
      calc = order.map(function (code) {
        var acc = p.accrued[code] || 0, early = Math.min(acc, rest);
        rest = round2(rest - early); total += acc;
        return { periodStartDate: p.periodStartDate, periodEndDate: p.periodEndDate, debtTypeCode: code, accruedAmount: acc, earlyAmount: early };
      });
      calcFor = { iso: iso, amt: amt };
      paintTable();
      if (amt > total + EPS) {
        showAlert('', 'Сумма платежа превышает общую сумму задолженности');
        return false;
      }
      return true;
    }
    calcBtn.addEventListener('click', calculate);

    /* ── Проверка перед «Добавить» / «Сохранить» ────────────────────── */
    function validate() {
      clearErrors();
      var iso = curDate(), amt = curAmount(), bad = [];
      if (!iso) bad.push('paymentDate');
      if (isNaN(amt)) bad.push('paymentAmount');
      if (bad.length) { bad.forEach(function (k) { boxOf(k).classList.add('inp--error'); }); return false; }
      if (amt <= 0) { boxOf('paymentAmount').classList.add('inp--error'); showAlert('', 'Сумма платежа должна быть больше нуля'); return false; }
      /* дату или сумму сменили после расчёта — таблица устарела, «досрочные суммы» уже не равны сумме платежа */
      if (!calc || !calcFor || calcFor.iso !== iso || Math.abs(calcFor.amt - amt) > EPS) { showAlert('Не рассчитаны платежи', 'Чтобы добавить платеж рассчитайте платежи по суммам задолженности'); return false; }
      var totalAcc = calc.reduce(function (s, r) { return s + r.accruedAmount; }, 0);
      if (amt > totalAcc + EPS) { showAlert('', 'Сумма платежа превышает общую сумму задолженности'); return false; }
      return true;
    }

    submit.addEventListener('click', function () {
      if (!validate()) return;
      var rec = {
        paymentDate: curDate(), paymentAmount: curAmount(), comment: field('comment').value.trim(),
        allocations: calc.map(function (r) { return Object.assign({}, r); })
      };
      if (opts.save) opts.save(rec, editing);
      if (!isInline() && window.DSModal) window.DSModal.closeTop();
    });

    /* ── Заполнение ─────────────────────────────────────────────────── */
    function fill(rec) {
      editing = !!rec;
      title.textContent = rec ? 'Изменение платежа' : 'Новый платеж';
      submit.querySelector('.btn__label').textContent = rec ? 'Сохранить' : 'Добавить';
      scrim.querySelectorAll('[data-ei-currency]').forEach(function (el) { el.textContent = params().currencyCode; });
      dateCtl.value = rec ? date(rec.paymentDate) : '';
      amtCtl.value = rec ? money(rec.paymentAmount) : '';
      field('comment').value = rec ? (rec.comment || '') : '';
      calc = rec && rec.allocations ? rec.allocations.map(function (r) { return Object.assign({}, r); }) : null;
      calcFor = calc ? { iso: rec.paymentDate, amt: rec.paymentAmount } : null;
      forceNoDebt = false;
      clearErrors();
      paintTable();
      if (window.DSInput) window.DSInput.syncAll(scrim);
    }

    function open(rec) {
      fill(rec || null);
      if (window.DSModal) window.DSModal.open(scrim);
    }

    /* Сценарии панели прототипа: окно в заданном состоянии */
    function setInputs(iso, amount) {
      dateCtl.value = date(iso);
      amtCtl.value = money(amount);
      if (window.DSInput) window.DSInput.syncAll(scrim);
    }
    function demo(name) {
      fill(null);
      if (name === 'empty') return;
      if (name === 'validate') { calculate(); return; }
      if (name === 'err-nodebt') { forceNoDebt = true; setInputs('2025-03-31', 100000); calculate(); return; }
      if (name === 'err-excess') { setInputs('2025-03-31', 1000000); calculate(); return; }
      setInputs('2025-03-31', 100000);
      if (name === 'err-notcalc') { validate(); return; }
      calculate();
      // calc — окно с рассчитанными платежами
    }

    fill(null);

    var api = { open: open, fill: fill, demo: demo, calculate: calculate, validate: validate };
    scrim.__earlyInterest = api;
    return api;
  }

  window.PostModalEarlyInterest = { bind: bind };
})();
