/* ============================================================
   BalanceAndCurrencyModal.js — поведение окна «Баланс и валюта».

   Делает то, чего нет в рантаймах ДС, и только это:
   1) заполняет окно значениями договора при каждом открытии: два списка и
      сумма; пустой договор — пустое окно, как на макете;
   2) держит списки «Баланс» и «Валюта» (InputAutocomplete + DropdownList):
      значение — только из списка; набранный текст, не совпавший с опцией, при
      уходе с поля откатывается к выбранному; крестик снимает значение;
   3) держит поле суммы: набрать можно цифры, пробелы и одну запятую; при уходе
      с поля сумма приводится к виду «123 456 789,00»; код выбранной валюты
      стоит постфиксом поля;
   4) «Сохранить» отдаёт значения в LoanAgreementStore.setBalanceCurrency и
      закрывает окно; если стор говорит, что правка запрещена
      (LoanAgreementStore.isEditable() === false — роль, статус сделки,
      погашенный договор), ничего не сохраняет, окно закрывается. Стора нет
      (витрина) — работает как раньше.
   Валидации обязательности нет: на макете её нет, обязательность полей не
   решена (паспорт, «Открытые вопросы»). Сохраняется то, что в окне, в том числе
   пустое.

   Открытие, фокус, Esc, крестик, защита от клика мимо окна, крестик очистки
   поля и шеврон списков делают рантаймы ДС.

   API:
     PostModalBalanceAndCurrency.bind(scrim?, { get, save }) → api
       scrim — скрим окна (по умолчанию #bal-scrim); повторный bind того же
               скрима возвращает прежний api
       get()       → { balanceCode, currencyCode, totalLimitAmount }|null —
                     по умолчанию LoanAgreementStore.get().balanceCurrency
       save(value) — принять значения; по умолчанию
                     LoanAgreementStore.setBalanceCurrency
       api.fill()      — заполнить окно заново из get()
       api.use(data)   — подставить значения без стора и открытия (витрина)
       api.read()      → { balanceCode, currencyCode, totalLimitAmount } —
                     что сейчас в окне (код или null, сумма числом или null)
       api.save()      — отдать значения в save() и закрыть окно
     PostModalBalanceAndCurrency.open() — открыть окно (рантайм ДС), значения
                     подставляются на открытии
     PostModalBalanceAndCurrency.use(data) — заполнить без открытия (витрина)
   ============================================================ */
(function () {
  'use strict';

  var NBSP = ' ';

  /* Валюты — коды ISO, те же, что в данных модуля (деревья продуктов, сделки):
     RUB, USD, EUR, JPY. Полный справочник валют не решён (паспорт, «Открытые
     вопросы»). */
  var CURRENCY_CODES = ['RUB', 'USD', 'EUR', 'JPY'];

  function has(v) { return v !== null && v !== undefined && v !== ''; }

  function store() { return window.LoanAgreementStore; }

  /* ── Баланс и валюта: списки ──────────────────────────────────────── */

  function balanceOptions() {
    var map = window.LOAN_BALANCE_LABELS || {};
    return Object.keys(map).map(function (code) { return { code: code, label: map[code] }; });
  }

  function currencyOptions() {
    return CURRENCY_CODES.map(function (code) { return { code: code, label: code }; });
  }

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
  function select(scrim, id, opts) {
    var control = scrim.querySelector('#' + id);
    var list = scrim.querySelector('#' + id + '-list');
    var field = scrim.querySelector('[data-ddl="' + id + '-list"]');
    var cur = null;

    function options() { return opts.options(); }
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
      if (!silent && opts.onChange) opts.onChange(cur);
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
    var s = sanitize(text).replace(/[  ]/g, '').replace(',', '.');
    if (!s) return null;
    var n = Number(s);
    return isFinite(n) ? n : null;
  }

  /* 123456789 → «123 456 789,00», разряды — неразрывным пробелом */
  function formatAmount(n) {
    if (!has(n)) return '';
    var x = Number(n);
    if (!isFinite(x)) return '';
    var parts = x.toFixed(2).split('.');
    return parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, NBSP) + ',' + parts[1];
  }

  /* ── Окно ─────────────────────────────────────────────────────────── */

  function bind(scrim, opts) {
    scrim = scrim || (typeof document !== 'undefined' && document.getElementById('bal-scrim'));
    if (!scrim) return null;
    if (scrim.__balanceCurrency) return scrim.__balanceCurrency;
    opts = opts || {};

    var amount = scrim.querySelector('#bal-limit');
    var postfix = scrim.querySelector('[data-bal-postfix]');

    function paintPostfix(code) {
      if (!postfix) return;
      postfix.textContent = code || '';
      postfix.hidden = !code;
    }

    var balance = select(scrim, 'bal-balance', { options: balanceOptions });
    var currency = select(scrim, 'bal-currency', { options: currencyOptions, onChange: paintPostfix });

    function current() {
      if (opts.get) return opts.get() || null;
      var S = store();
      var rec = S && S.get();
      return (rec && rec.balanceCurrency) || null;
    }

    function fill() {
      var d = current() || {};
      balance.set(d.balanceCode);
      currency.set(d.currencyCode);
      paintPostfix(currency.get());
      if (amount) {
        amount.value = formatAmount(d.totalLimitAmount);
        /* крестик очистки живёт по значению — после записи скриптом его
           состояние пересчитывает рантайм поля */
        if (window.DSInput) window.DSInput.sync(amount.closest('.inp'));
      }
    }

    function read() {
      balance.commitTyped();
      currency.commitTyped();
      return {
        balanceCode: balance.get(),
        currencyCode: currency.get(),
        totalLimitAmount: amount ? parseAmount(amount.value) : null
      };
    }

    /* Правку запрещает стор: тайл в просмотре окно не открывает, но окно само
       не должно сохранять, если его открыли иначе (сценарий, клавиатура).
       Стора нет (витрина) или своего save — правка разрешена. */
    function editable() {
      var S = store();
      return opts.save || !S || typeof S.isEditable !== 'function' || S.isEditable() !== false;
    }

    function save() {
      var value = read();
      if (editable()) {
        if (opts.save) opts.save(value);
        else if (store() && store().setBalanceCurrency) store().setBalanceCurrency(value);
      }
      if (!scrim.classList.contains('modal-scrim--inline') && window.DSModal) window.DSModal.closeTop(true);
    }

    if (amount) {
      amount.addEventListener('input', function () {
        var v = sanitize(amount.value);
        if (v !== amount.value) amount.value = v;
      });
      /* уход с поля: сумма приводится к виду «123 456 789,00»; нечитаемое
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
      if (e.target.closest('[data-bal-save]')) save();
    });

    fill();

    /* значения без стора и без открытия (витрина) */
    function use(data) {
      opts.get = function () { return data; };
      fill();
    }

    var api = { fill: fill, read: read, save: save, use: use };
    scrim.__balanceCurrency = api;
    return api;
  }

  function open() {
    var scrim = document.getElementById('bal-scrim');
    if (!scrim) return;
    bind(scrim);
    if (window.DSModal && !scrim.classList.contains('modal-scrim--inline')) window.DSModal.open(scrim);
  }

  function use(data) {
    var api = bind();
    if (api) api.use(data);
  }

  window.PostModalBalanceAndCurrency = { bind: bind, open: open, use: use };

  if (typeof document !== 'undefined' && document.getElementById('bal-scrim')) bind();
})();
