/* ============================================================
   RsbuAdjustmentModal.js — поведение окна внесения корректировки процентов РСБУ.

   Делает то, чего нет в рантаймах ДС, и только это:
   1) разводит два режима одной формы: новая корректировка (кнопка «Добавить») и
      правка существующей («Сохранить») — заголовок, кнопка и значения полей;
   2) принимает обе даты как обычные поля даты и сверяет их с датами событий
      индикатора;
   3) форматирует сумму при вводе: знак «-» только первым, разряды неразрывным
      пробелом, запятая, не более двух знаков;
   4) показывает «Дельта на дату» (только чтение) — остаток дельты на выбранную
      исходную дату, если он есть (RE0034);
   5) проверяет форму по «Добавить» / «Сохранить» и показывает ошибку в Alert
      вверху окна с подсветкой полей; правка поля снимает его подсветку.
   Корректировка — перенос: сумма вычитается с исходной даты и прибавляется к целевой,
   целевая дата раньше исходной и совпадает с датой события индикатора.

   Открытие, фокус, Esc, крестик, календарь и маску даты делают рантаймы ДС.
   Транш и таблицу окно не знает: параметры списка берёт у страницы, проверенную
   запись отдаёт ей же.

   API:
     PostModalRsbuAdjustment.bind(scrim, { options, save }) → api
       options()           → { currencyCode, eventDates?, remaining? } — валюта; даты
                             событий индикатора ISO (обе даты должны быть среди них; нет —
                             без проверки); remaining(iso) → число | null — остаток дельты
                             на дату; функции нет — дельты у индикатора нет: поле скрыто,
                             сумма не ограничена; функция есть, а для даты вернула null —
                             на эту исходную дату дельты нет (ошибка)
       save(rec, wasEdit)  — принять запись { startDate, endDate, adjustmentAmount,
                             comment } (даты ISO); wasEdit — окно открыто на правку
       api.open(rec|null)  — заполнить окно (null — новая корректировка) и открыть
       api.fill(rec|null)  — только заполнить (на витрине окно уже на экране)
       api.validate()      → boolean — проверить форму и показать ошибку
   ============================================================ */
(function () {
  'use strict';

  var NBSP = ' ';
  var KEYS = ['startDate', 'endDate', 'adjustmentAmount'];

  /* ── Формат ─────────────────────────────────────────────────────── */
  function money(n) {
    var p = Number(n).toFixed(2).split('.');
    return p[0].replace(/\B(?=(\d{3})+(?!\d))/g, NBSP) + ',' + p[1];
  }
  function date(iso) { var p = String(iso).split('-'); return p[2] + '.' + p[1] + '.' + p[0]; }
  /* «-1 250 000,5» → число; пусто или мусор → NaN */
  function parseMoney(str) {
    var s = String(str).replace(/[\s ]/g, '').replace(',', '.');
    return s === '' || s === '-' || isNaN(Number(s)) ? NaN : Number(s);
  }
  /* «ДД.ММ.ГГГГ» → ISO; мусор (в том числе 31.02) → '' */
  function parseDate(str) {
    var m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(String(str).trim());
    if (!m) return '';
    var d = new Date(Date.UTC(+m[3], +m[2] - 1, +m[1]));
    return (d.getUTCFullYear() === +m[3] && d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[1]) ? m[3] + '-' + m[2] + '-' + m[1] : '';
  }

  function bind(scrim, opts) {
    if (!scrim) return null;
    if (scrim.__rsbuAdjustment) return scrim.__rsbuAdjustment;
    opts = opts || {};

    var form = scrim.querySelector('form');
    var alertBox = scrim.querySelector('.modal__alert');
    var alertText = scrim.querySelector('.alert__text');
    var title = scrim.querySelector('.modal__title');
    var submit = scrim.querySelector('[data-rsbu-submit]');
    var currencies = scrim.querySelectorAll('[data-rsbu-currency]');
    var deltaBox = scrim.querySelector('[data-rsbu-delta]');
    var deltaValue = scrim.querySelector('[data-rsbu-delta-value]');
    var forecastBox = scrim.querySelector('[data-rsbu-forecast]');
    var forecastLabel = scrim.querySelector('[data-rsbu-forecast-label]');
    var forecastValue = scrim.querySelector('[data-rsbu-forecast-value]');
    var startCtl = form.elements.startDate;
    var editing = false;

    function params() { return (opts.options && opts.options()) || { currencyCode: 'RUB' }; }
    /* исходная дата, набранная в поле или выбранная в календаре; пусто или мусор — '' */
    function startIso() { return parseDate(startCtl.value); }
    /* остаток дельты на исходную дату; null — дельты нет */
    function remaining() {
      var p = params();
      var r = startIso() && p.remaining ? p.remaining(startIso()) : null;
      return r == null || isNaN(r) ? null : r;
    }
    function paintDelta() {
      var r = remaining();
      deltaBox.hidden = r == null;
      deltaValue.textContent = r == null ? '' : money(r);
    }
    /* прогноз расхождения на первой дате, если внести перенос с такими датой «на» и суммой (RE0034);
       без даты «на» или суммы не показывается; нужен options().forecast(end, amt) → { date, amount } | null */
    function paintForecast() {
      var p = params();
      var end = parseDate(field('endDate').value), amt = parseMoney(field('adjustmentAmount').value);
      var f = end && !isNaN(amt) && amt !== 0 && p.forecast ? p.forecast(end, amt) : null;
      forecastBox.hidden = !f;
      forecastLabel.textContent = f ? 'Расхождение с ' + date(f.date) + ' после переноса' : 'Расхождение после переноса';
      forecastValue.textContent = f ? money(f.amount) : '';
    }
    function field(k) { return form.elements[k]; }
    function boxOf(k) { return field(k).closest('.inp'); }
    function isInline() { return scrim.classList.contains('modal-scrim--inline'); }

    /* ── Ошибки ─────────────────────────────────────────────────────── */
    function clearErrors() {
      alertBox.hidden = true;
      KEYS.forEach(function (k) { boxOf(k).classList.remove('inp--error'); });
    }
    function showError(text, keys) {
      alertText.textContent = text;
      alertBox.hidden = false;
      (keys || []).forEach(function (k) { boxOf(k).classList.add('inp--error'); });
    }

    /* ── Сумма ──────────────────────────────────────────────────────── */
    function formatAmount(inp) {
      var raw = inp.value, pos = inp.selectionStart == null ? raw.length : inp.selectionStart;
      var left = raw.slice(0, pos).replace(/[^\d,.]/g, '').length;
      var neg = /^\s*[-−–]/.test(raw);
      var clean = raw.replace(/\./g, ',').replace(/[^\d,]/g, '');
      var parts = clean.split(',');
      var intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
      var out = (neg ? '-' : '') + intPart + (parts.length > 1 ? ',' + parts.slice(1).join('').slice(0, 2) : '');
      inp.value = out;
      var n = 0, caret = neg ? 1 : 0;
      while (caret < out.length && n < left) { if (/[\d,]/.test(out.charAt(caret))) n++; caret++; }
      try { inp.setSelectionRange(caret, caret); } catch (e) { /* поле без выделения */ }
    }
    form.addEventListener('input', function (e) {
      var inp = e.target;
      if (inp.hasAttribute('data-amount')) formatAmount(inp);
      inp.closest('.inp').classList.remove('inp--error');
      paintForecast();
    });
    form.addEventListener('focusout', function (e) {
      var inp = e.target;
      if (inp.hasAttribute && inp.hasAttribute('data-amount')) {
        var n = parseMoney(inp.value);
        if (!isNaN(n)) inp.value = money(n);
      }
      paintForecast();
    });

    /* ── Исходная дата: «Дельта на дату» следует за полем ──────────── */
    startCtl.addEventListener('input', paintDelta);
    startCtl.addEventListener('change', paintDelta);
    startCtl.closest('.inp').addEventListener('ds-input:clear', paintDelta);
    /* дата «на» (поле с календарём): выбор в календаре даёт change, а не input */
    field('endDate').addEventListener('change', paintForecast);
    field('endDate').closest('.inp').addEventListener('ds-input:clear', paintForecast);

    /* ── Заполнение и проверка ──────────────────────────────────────── */
    function fill(rec) {
      editing = !!rec;
      title.textContent = rec ? 'Редактирование корректировки' : 'Новая корректировка';
      submit.querySelector('.btn__label').textContent = rec ? 'Сохранить' : 'Добавить';
      Array.prototype.forEach.call(currencies, function (c) { c.textContent = params().currencyCode; });
      startCtl.value = rec ? date(rec.startDate) : '';
      paintDelta();
      field('endDate').value = rec ? date(rec.endDate) : '';
      field('adjustmentAmount').value = rec ? money(rec.adjustmentAmount) : '';
      field('comment').value = rec ? rec.comment : '';
      paintForecast();
      clearErrors();
      if (window.DSInput) window.DSInput.syncAll(scrim);
    }

    function read() {
      return { start: startIso(), end: parseDate(field('endDate').value), amt: parseMoney(field('adjustmentAmount').value) };
    }

    function validate() {
      clearErrors();
      var v = read(), bad = [];
      if (!v.start) bad.push('startDate');
      if (!v.end) bad.push('endDate');
      if (isNaN(v.amt)) bad.push('adjustmentAmount');
      if (bad.length) { showError('Введите исходную и целевую даты в формате ДД.ММ.ГГГГ и сумму корректировки числом.', bad); return false; }
      if (v.end >= v.start) { showError('Целевая дата должна быть раньше исходной.', ['startDate', 'endDate']); return false; }
      var events = params().eventDates;
      if (events && events.indexOf(v.start) < 0) { showError('В исходную дату у индикатора нет события. Укажите дату начисления процентов.', ['startDate']); return false; }
      if (params().remaining && remaining() == null) { showError('На исходную дату нет дельты. Укажите дату после фиксации расчёта.', ['startDate']); return false; }
      if (events && events.indexOf(v.end) < 0) { showError('В эту дату у индикатора нет события. Укажите дату начисления процентов.', ['endDate']); return false; }
      if (v.amt === 0) { showError('Сумма корректировки не может быть равна нулю.', ['adjustmentAmount']); return false; }
      var rest = remaining();
      if (rest != null && Math.abs(v.amt) > Math.abs(rest)) {
        showError('Сумма больше дельты на дату: ' + money(rest) + ' ' + params().currencyCode + '.', ['adjustmentAmount']);
        return false;
      }
      return true;
    }

    submit.addEventListener('click', function () {
      if (!validate()) return;
      var v = read();
      var rec = { startDate: v.start, endDate: v.end, adjustmentAmount: v.amt, comment: field('comment').value.trim() };
      if (opts.save) opts.save(rec, editing);
      if (!isInline() && window.DSModal) window.DSModal.closeTop();
    });

    function open(rec) {
      fill(rec || null);
      if (window.DSModal) window.DSModal.open(scrim);
    }

    fill(null);

    var api = { open: open, fill: fill, validate: validate };
    scrim.__rsbuAdjustment = api;
    return api;
  }

  window.PostModalRsbuAdjustment = { bind: bind };
})();
