/* ============================================================
   TrancheLoanLimitsModal.js — поведение окна «Валюта транша».

   Делает то, чего нет в рантаймах ДС, и только это:
   1) заполняет окно текущими значениями при каждом открытии: список валюты и
      сумма;
   2) держит список «Валюта» (InputAutocomplete + DropdownList): значение —
      только из списка; набранный текст, не совпавший с опцией, при уходе с
      поля откатывается к выбранному; крестик снимает значение;
   3) держит поле суммы: набрать можно цифры, пробелы и одну запятую; при уходе
      с поля сумма приводится к виду «1 000 000,00». Постфикса валюты нет
      (решение человека 02.11.2026);
   4) «Сохранить» отдаёт значения в save() и закрывает окно. Стор страницы
      решает, писать ли их (погашенный транш правку не принимает); стор не
      передан (витрина) — сохранение разрешено.
   Валидации обязательности нет: на макете её нет, обязательность полей не
   решена (паспорт, «Открытые вопросы»). Сохраняется то, что в окне.

   Открытие, фокус, Esc, крестик, защита от клика мимо окна, крестик очистки
   поля и шеврон списка делают рантаймы ДС.

   API:
     PostModalTrancheLoanLimits.bind(scrim?, { get, save, editable }) → api
       scrim — скрим окна (по умолчанию #tl-scrim); повторный bind возвращает
               прежний api
       get()      → { currencyCode, totalLimitAmount }|null
       save(value) — принять значения
       editable() → boolean, правка разрешена (по умолчанию — да)
       api.fill()  — заполнить окно заново из get()
       api.use(data) — подставить значения без открытия (витрина)
       api.read()  → { currencyCode, totalLimitAmount } — что сейчас в окне
       api.save()  — отдать значения в save() и закрыть окно
     PostModalTrancheLoanLimits.open() — открыть окно (рантайм ДС)
     PostModalTrancheLoanLimits.use(data) — заполнить без открытия (витрина)
   ============================================================ */
(function () {
  'use strict';

  /* Неразрывный пробел — escape-последовательностью, а не литералом: литерал
     невидим и легко превращается в обычный пробел при правке (§8). */
  var NBSP = '\u00a0';

  /* Валюты — коды ISO, те же, что в окне «Баланс и валюта» страницы НКЛ
     (BalanceAndCurrencyModal.js). Полный справочник валют не решён (паспорт,
     «Открытые вопросы»). */
  var CURRENCY_CODES = ['RUB', 'USD', 'EUR', 'JPY'];

  function has(v) { return v !== null && v !== undefined && v !== ''; }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function optionHTML(o, selected) {
    return '<button type="button" class="ddl__item" role="option" aria-selected="' + (selected ? 'true' : 'false')
      + '" data-code="' + esc(o.code) + '"><span class="ddl__item-body"><span class="ddl__item-label">'
      + esc(o.label) + '</span></span></button>';
  }

  /* Список из InputAutocomplete + DropdownList: значение — код, в поле — подпись.
     Код, которого нет в справочнике, показывается как есть. */
  function currencySelect(scrim) {
    var control = scrim.querySelector('#tl-currency');
    var list = scrim.querySelector('#tl-currency-list');
    var field = scrim.querySelector('[data-ddl="tl-currency-list"]');
    var cur = null;

    function options() {
      return CURRENCY_CODES.map(function (code) { return { code: code, label: code }; });
    }
    function labelOf(code) {
      var o = options().filter(function (x) { return x.code === code; })[0];
      return o ? o.label : (has(code) ? String(code) : '');
    }
    function paint() {
      if (list) list.innerHTML = options().map(function (o) { return optionHTML(o, o.code === cur); }).join('');
    }
    function set(code, silent) {
      cur = has(code) ? String(code) : null;
      if (control) control.value = labelOf(cur);
      paint();
      if (window.DSInput) window.DSInput.syncAll(scrim);
    }
    /* Набранный руками текст: совпал с опцией — выбор; пусто — значение снято;
       иначе — откат к выбранному. */
    function commitTyped() {
      if (!control) return;
      var s = String(control.value || '').trim().toLowerCase();
      if (!s) { if (cur) set(null); return; }
      var hit = options().filter(function (o) { return o.label.toLowerCase() === s; })[0];
      if (hit) { if (hit.code !== cur) set(hit.code); else set(cur, true); return; }
      set(cur, true);
    }

    paint();
    if (field && list && window.DSDropdownList) {
      window.DSDropdownList.bind(field, {
        list: list,
        onSelect: function (it) { set(it.getAttribute('data-code')); }
      });
    }
    if (control) {
      control.addEventListener('change', commitTyped);
      var inp = control.closest('.inp');
      if (inp) inp.addEventListener('ds-input:clear', function () { set(null); });
    }
    return {
      set: function (code) { set(code, true); },
      get: function () { return cur; },
      commitTyped: commitTyped
    };
  }

  /* ── Сумма ────────────────────────────────────────────────────────── */

  /* При вводе: цифры, пробелы, одна запятая (точка становится запятой). */
  function sanitize(text) {
    var s = String(text == null ? '' : text);
    var out = '';
    var sep = false;
    for (var i = 0; i < s.length; i++) {
      var ch = s.charAt(i);
      if (ch >= '0' && ch <= '9') out += ch;
      else if (ch === ' ' || ch === NBSP) { if (out.length && !sep) out += ch; }
      else if ((ch === ',' || ch === '.') && !sep && out.length) { out += ','; sep = true; }
    }
    return out;
  }

  function parseAmount(text) {
    var s = sanitize(text).replace(/[ \u00a0]/g, '').replace(',', '.');
    if (!s) return null;
    var n = Number(s);
    return isFinite(n) ? n : null;
  }

  /* 1000000 → «1 000 000,00», разряды — неразрывным пробелом */
  function formatAmount(n) {
    if (!has(n)) return '';
    var x = Number(n);
    if (!isFinite(x)) return '';
    var parts = x.toFixed(2).split('.');
    return parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, NBSP) + ',' + parts[1];
  }

  /* ── Окно ─────────────────────────────────────────────────────────── */

  function bind(scrim, opts) {
    scrim = scrim || (typeof document !== 'undefined' && document.getElementById('tl-scrim'));
    if (!scrim) return null;
    if (scrim.__trancheLoanLimits) return scrim.__trancheLoanLimits;
    opts = opts || {};

    var amount = scrim.querySelector('#tl-limit');
    var currency = currencySelect(scrim);

    function current() {
      return opts.get ? (opts.get() || null) : null;
    }

    function fill() {
      var d = current() || {};
      currency.set(d.currencyCode);
      if (amount) {
        amount.value = formatAmount(d.totalLimitAmount);
        /* крестик очистки живёт по значению — после записи скриптом его
           состояние пересчитывает рантайм поля */
        if (window.DSInput) window.DSInput.sync(amount.closest('.inp'));
      }
    }

    function read() {
      currency.commitTyped();
      return {
        currencyCode: currency.get(),
        totalLimitAmount: amount ? parseAmount(amount.value) : null
      };
    }

    function editable() {
      return opts.editable ? opts.editable() !== false : true;
    }

    function save() {
      var value = read();
      if (editable() && opts.save) opts.save(value);
      if (!scrim.classList.contains('modal-scrim--inline') && window.DSModal) window.DSModal.closeTop(true);
    }

    if (amount) {
      amount.addEventListener('input', function () {
        var v = sanitize(amount.value);
        if (v !== amount.value) amount.value = v;
      });
      /* уход с поля: сумма приводится к виду «1 000 000,00»; нечитаемое
         очищается */
      amount.addEventListener('change', function () {
        amount.value = formatAmount(parseAmount(amount.value));
        if (window.DSInput) window.DSInput.sync(amount.closest('.inp'));
      });
    }

    /* Окно открылось — значения заново: за время, пока оно было закрыто, они
       могли смениться, а несохранённый ввод прошлого открытия не нужен. */
    var wasOpen = !scrim.hidden;
    new MutationObserver(function () {
      var open = !scrim.hidden;
      if (open === wasOpen) return;
      wasOpen = open;
      if (open) fill();
    }).observe(scrim, { attributes: true, attributeFilter: ['hidden'] });

    scrim.addEventListener('click', function (e) {
      if (e.target.closest('[data-tl-save]')) save();
    });

    fill();

    /* значения без стора и без открытия (витрина) */
    function use(data) {
      opts.get = function () { return data; };
      fill();
    }

    var api = { fill: fill, read: read, save: save, use: use };
    scrim.__trancheLoanLimits = api;
    return api;
  }

  function open() {
    var scrim = document.getElementById('tl-scrim');
    if (!scrim) return;
    bind(scrim);
    if (window.DSModal && !scrim.classList.contains('modal-scrim--inline')) window.DSModal.open(scrim);
  }

  function use(data) {
    var api = bind();
    if (api) api.use(data);
  }

  window.PostModalTrancheLoanLimits = { bind: bind, open: open, use: use };

  /* Самобинда нет намеренно: окну нужны get/save страницы, а она загружает этот
     скрипт раньше, чем их передаёт. Страница зовёт bind(scrim, {...}) сама;
     на витрине без bind в полях остаются примеры разметки. */
})();
