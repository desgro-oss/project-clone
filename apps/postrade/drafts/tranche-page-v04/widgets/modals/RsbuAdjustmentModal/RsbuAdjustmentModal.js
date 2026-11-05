/* ============================================================
   RsbuAdjustmentModal.js — поведение окна ручной корректировки процентов РСБУ
   (RE0034, концепт v4).

   Делает то, чего нет в рантаймах ДС, и только это:
   1) форматирует шесть сумм при вводе: в поле вводится только число — буквы и прочий
      мусор отбрасываются, знак «-» только первым, разряды неразрывным пробелом,
      запятая, не более двух знаков;
   2) считает «Сумму корректировки» (только чтение) — сумму шести полей — при каждом вводе;
   3) проверяет форму по «Добавить» и показывает ошибку в Alert вверху окна с подсветкой
      полей; правка поля снимает его подсветку. Правила дат (ответ человека 05.11.2026):
      исходная дата — дата отчёта РСБУ, не позже конца последней фиксации; целевая дата
      корректировки — строго позже исходной.
   Окно только добавляет: правки строк в v4 нет (решение человека 28.10.2026). Корректировка
   вычитает сумму с исходной даты и прибавляет её на целевую дату корректировки при каждом
   пересчёте метрик.

   Открытие, фокус, Esc, крестик, календарь и маску даты делают рантаймы ДС.
   Транш и таблицу окно не знает: параметры берёт у страницы, проверенную запись отдаёт ей же.

   API:
     PostModalRsbuAdjustment.bind(scrim, { options, save }) → api
       options()      → { currencyCode, reportDates, fixationDate } — валюта ФИ транша, даты
                        отчёта РСБУ и конец последней фиксации (ISO; null — границы нет)
       save(rec)      — принять запись { startDate, endDate, parts: { <ключ>: число }, comment }
                        (даты ISO; ключи частей — PARTS ниже, как FinMetricsStore.rasParts())
       api.open()     — очистить окно и открыть
       api.fill(rec|null) — только заполнить (на витрине окно уже на экране; rec — пример)
       api.validate() → boolean — проверить форму и показать ошибку
   ============================================================ */
(function () {
  'use strict';

  var NBSP = ' ';
  var PARTS = ['currentInterest', 'currentInterestCap', 'capitalizedInterest', 'capitalizedInterestCap', 'deferredInterest', 'deferredInterestCap'];

  /* ── Формат ─────────────────────────────────────────────────────── */
  function money(n) {
    var p = Number(n).toFixed(2).split('.');
    return p[0].replace(/\B(?=(\d{3})+(?!\d))/g, NBSP) + ',' + p[1];
  }
  function date(iso) { var p = String(iso).split('-'); return p[2] + '.' + p[1] + '.' + p[0]; }
  /* «-1 250 000,5» → число; пусто → 0; мусор → NaN */
  function parseMoney(str) {
    var s = String(str).replace(/\s/g, '').replace(',', '.');
    if (s === '') return 0;
    return s === '-' || isNaN(Number(s)) ? NaN : Number(s);
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
    var currencies = scrim.querySelectorAll('[data-rsbu-currency]');
    var total = scrim.querySelector('[data-rsbu-total]');
    var submit = scrim.querySelector('[data-rsbu-submit]');
    var KEYS = ['startDate', 'endDate'].concat(PARTS);

    function params() { return (opts.options && opts.options()) || { currencyCode: 'RUB' }; }
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

    /* ── Суммы и итог ───────────────────────────────────────────────── */
    function parts() {
      var out = {};
      PARTS.forEach(function (k) { out[k] = parseMoney(field(k).value); });
      return out;
    }
    function paintTotal() {
      var p = parts(), sum = 0, bad = false;
      PARTS.forEach(function (k) { if (isNaN(p[k])) bad = true; else sum += p[k]; });
      total.textContent = bad ? '—' : money(Math.round(sum * 100) / 100);
    }
    function formatAmount(inp) {
      var raw = inp.value, pos = inp.selectionStart == null ? raw.length : inp.selectionStart;
      var left = raw.slice(0, pos).replace(/[^\d,.]/g, '').length;
      var neg = /^\s*[-−–]/.test(raw);
      var clean = raw.replace(/\./g, ',').replace(/[^\d,]/g, '');
      var ps = clean.split(',');
      var intPart = ps[0].replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
      var out = (neg ? '-' : '') + intPart + (ps.length > 1 ? ',' + ps.slice(1).join('').slice(0, 2) : '');
      inp.value = out;
      var n = 0, caret = neg ? 1 : 0;
      while (caret < out.length && n < left) { if (/[\d,]/.test(out.charAt(caret))) n++; caret++; }
      try { inp.setSelectionRange(caret, caret); } catch (e) { /* поле без выделения */ }
    }
    form.addEventListener('input', function (e) {
      var inp = e.target;
      if (inp.hasAttribute('data-amount')) formatAmount(inp);
      if (inp.closest('.inp')) inp.closest('.inp').classList.remove('inp--error');
      paintTotal();
    });
    form.addEventListener('focusout', function (e) {
      var inp = e.target;
      if (inp.hasAttribute && inp.hasAttribute('data-amount')) {
        /* в поле суммы вводится только число: без цифр («-», «,») — незаконченный ввод, он не значение */
        if (!/\d/.test(inp.value)) inp.value = '';
        if (inp.value !== '') {
          var n = parseMoney(inp.value);
          if (!isNaN(n)) inp.value = money(n);
        }
      }
      paintTotal();
    });
    /* крестик очистки поля ДС — пересчитать итог */
    form.addEventListener('ds-input:clear', paintTotal);

    /* ── Заполнение и проверка ──────────────────────────────────────── */
    function fill(rec) {
      Array.prototype.forEach.call(currencies, function (c) { c.textContent = params().currencyCode; });
      field('startDate').value = rec ? date(rec.startDate) : '';
      field('endDate').value = rec ? date(rec.endDate) : '';
      PARTS.forEach(function (k) { field(k).value = rec && rec.parts && rec.parts[k] ? money(rec.parts[k]) : ''; });
      field('comment').value = rec ? rec.comment || '' : '';
      paintTotal();
      clearErrors();
      if (window.DSInput) window.DSInput.syncAll(scrim);
    }

    /* Тексты ошибок придуманы агентом (решение 29 задачи RE0034); правила дат — ответ
       человека 05.11.2026. */
    function validate() {
      clearErrors();
      var start = parseDate(field('startDate').value), end = parseDate(field('endDate').value);
      var bad = [];
      if (!start) bad.push('startDate');
      if (!end) bad.push('endDate');
      if (bad.length) { showError('Введите исходную дату и целевую дату корректировки в формате ДД.ММ.ГГГГ.', bad); return false; }
      var now = params();
      if (now.reportDates && now.reportDates.indexOf(start) === -1) {
        showError('Исходная дата должна быть датой отчёта РСБУ.', ['startDate']); return false;
      }
      if (now.fixationDate && start > now.fixationDate) {
        showError('Исходная дата не может быть позже даты фиксации (' + date(now.fixationDate) + ').', ['startDate']); return false;
      }
      if (end <= start) { showError('Целевая дата корректировки должна быть позже исходной.', ['startDate', 'endDate']); return false; }
      var amounts = parts();
      if (PARTS.every(function (k) { return !amounts[k]; })) { showError('Укажите сумму хотя бы одного вида процентов.', PARTS); return false; }
      return true;
    }

    submit.addEventListener('click', function () {
      if (!validate()) return;
      var rec = {
        startDate: parseDate(field('startDate').value), endDate: parseDate(field('endDate').value),
        parts: parts(), comment: field('comment').value.trim()
      };
      if (opts.save) opts.save(rec);
      if (!isInline() && window.DSModal) window.DSModal.closeTop();
    });

    function open() {
      fill(null);
      if (window.DSModal) window.DSModal.open(scrim);
    }

    fill(null);

    var api = { open: open, fill: fill, validate: validate };
    scrim.__rsbuAdjustment = api;
    return api;
  }

  window.PostModalRsbuAdjustment = { bind: bind };
})();
