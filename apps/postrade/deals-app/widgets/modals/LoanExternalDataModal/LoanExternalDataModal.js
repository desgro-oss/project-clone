/* ============================================================
   LoanExternalDataModal.js — поведение окна «Техническая информация».

   Делает то, чего нет в рантаймах ДС, и только это:
   1) показывает поля потребителя (решение человека 02.11.2026, RE0049):
      НКЛ — «ГФО ID» и «ГФО ID фондирующего кредита»; Транш — плюс «CRM ID
      продукта». Владелец правила «потребитель → поля» один — список CONSUMERS
      тайла (LoanExternalDataTile.js), окно читает его при bind и показывает
      только те поля разметки, что входят в набор: обёртка поля нового
      потребителя ставится во фрагмент с data-tech-consumer="<имя>" hidden,
      JS и разметка окна при этом не меняются. Тайла нет (страница без его
      скрипта) — окно показывает все поля разметки;
   2) заполняет окно значениями при каждом открытии; без своих get — из
      LoanAgreementStore.get().techInfo (нет записи — поля пустые);
   3) по «Сохранить» отдаёт значения в save() страницы или, без неё, в
      LoanAgreementStore.setTechInfo, и закрывает окно. Проверки ввода нет —
      человек её не называл.

   Открытие, фокус, Esc, крестик, крестик очистки поля и защиту от закрытия
   кликом мимо окна делают рантаймы ДС.

   Порядок привязки: окно НЕ биндится само — bind зовёт страница-хозяин.
   Страница НКЛ (Instrument.html) — bind() без opts (стор); страница транша —
   bind(scrim, { get, save, consumer }) со своим источником; витрина — demo.js
   окна через use(). Самобинд бы выполнялся раньше страницы (окружения, где
   readyState уже «complete», к моменту внешних скриптов) и занимал api со
   стором НКЛ на странице транша.

   API (глобал PostModalLoanExternalData):
     bind([scrim], [{ get, save, consumer }]) → api
       scrim — по умолчанию #tech-scrim.
       get() → {} | null и save(value) — подмены стора (страница транша, витрина);
       consumer — 'nkl' (по умолчанию) | 'tranche': какой набор полей показывать.
       api.fill()  — заполнить окно заново из get()
       api.read()  → { gfoId, gfoFundingCreditId, crmProductId? } — введённое сейчас
       api.save()  — сохранить введённое и закрыть окно
       api.use(data) — подставить значения без стора и открытия (витрина)
       api.consumer(name) — сменить потребителя на живом окне (витрина)
     open() — заполнить и открыть окно (DSModal.open); то же делает триггер
       data-modal="tech-scrim" тайла
   ============================================================ */
(function () {
  'use strict';

  var SCRIM_ID = 'tech-scrim';

  function isInline(scrim) {
    return scrim.classList.contains('modal-scrim--inline');
  }

  function str(x) {
    return String(x == null ? '' : x).trim();
  }

  /* Набор полей потребителя: владелец правила — тайл (CONSUMERS, там поля —
     объекты { key, label }; здесь нужны только имена). Тайла нет (скрипт тайла
     не подключён) — показываем все поля разметки. */
  function consumerKeys(consumer) {
    var T = window.PostTileLoanExternalData;
    if (T && T.CONSUMERS) {
      var set = T.CONSUMERS[consumer || T.DEFAULT_CONSUMER] || T.CONSUMERS[T.DEFAULT_CONSUMER];
      var keys = set.map(function (f) { return typeof f === 'string' ? f : f.key; });
      return { keys: keys, def: T.DEFAULT_CONSUMER };
    }
    return null;
  }

  function bind(scrim, opts) {
    scrim = scrim || document.getElementById(SCRIM_ID);
    if (!scrim) return null;
    if (scrim.__loanExternalData) return scrim.__loanExternalData;
    opts = opts || {};

    var gfoId = scrim.querySelector('.inp__control[name="gfoId"]');
    var gfoFunding = scrim.querySelector('.inp__control[name="gfoFundingCreditId"]');
    if (!gfoId || !gfoFunding) return null;

    var currentConsumer = opts.consumer;

    /* ── Поля потребителя ───────────────────────────────────────────── */
    var inputs = [];

    function applyConsumer(name) {
      currentConsumer = name;
      var cons = consumerKeys(name);
      var keys = cons
        ? cons.keys
        : Array.prototype.map.call(
            scrim.querySelectorAll('.inp__control[name]'),
            function (i) { return i.getAttribute('name'); });

      /* Обёртки полей потребителей показываются, только если их поле входит в
         набор потребителя. */
      Array.prototype.forEach.call(scrim.querySelectorAll('[data-tech-consumer]'), function (wrap) {
        var field = wrap.querySelector('.inp__control[name]');
        wrap.hidden = !field || keys.indexOf(field.getAttribute('name')) === -1;
      });

      inputs = keys.map(function (key) {
        return { key: key, input: scrim.querySelector('.inp__control[name="' + key + '"]') };
      }).filter(function (f) { return f.input; });
    }

    applyConsumer(opts.consumer);

    function current() {
      if (opts.get) return opts.get() || {};
      var store = window.LoanAgreementStore;
      var rec = store && store.get ? store.get() : null;
      return (rec && rec.techInfo) || {};
    }

    /* ── Заполнение ─────────────────────────────────────────────────── */
    function setValue(input, value) {
      input.value = str(value);
      /* крестик очистки живёт по значению — после записи скриптом его
         состояние пересчитывает рантайм поля */
      var inp = input.closest('.inp');
      if (window.DSInput && inp) window.DSInput.sync(inp);
    }

    function fill() {
      var t = current();
      inputs.forEach(function (f) { setValue(f.input, t[f.key]); });
    }

    function read() {
      var value = {};
      inputs.forEach(function (f) { value[f.key] = str(f.input.value); });
      return value;
    }

    /* ── Сохранение ─────────────────────────────────────────────────── */
    function save() {
      var value = read();
      if (opts.save) opts.save(value);
      else if (window.LoanAgreementStore) window.LoanAgreementStore.setTechInfo(value);
      if (!isInline(scrim) && window.DSModal) window.DSModal.closeTop(true);
    }

    /* ── События ────────────────────────────────────────────────────── */
    /* Окно открылось — значения заново: за время, пока оно было закрыто, запись
       могла смениться, а несохранённый ввод прошлого открытия не нужен. */
    var wasOpen = !scrim.hidden;
    new MutationObserver(function () {
      var open = !scrim.hidden;
      if (open === wasOpen) return;
      wasOpen = open;
      if (open) fill();
    }).observe(scrim, { attributes: true, attributeFilter: ['hidden'] });

    scrim.addEventListener('click', function (e) {
      if (e.target.closest('[data-tech-save]')) save();
    });

    fill();

    /* значения без стора и без открытия (витрина) */
    function use(data) {
      opts.get = function () { return data; };
      fill();
    }

    /* сменить потребителя на живом окне (витрина, «Потребитель») */
    function setConsumer(name) {
      applyConsumer(name);
      fill();
    }

    var api = { fill: fill, read: read, save: save, use: use, consumer: setConsumer };
    scrim.__loanExternalData = api;
    return api;
  }

  function open() {
    var scrim = document.getElementById(SCRIM_ID);
    if (!scrim) return;
    var api = bind(scrim);
    if (api) api.fill();
    if (window.DSModal && !isInline(scrim)) window.DSModal.open(scrim);
  }

  function use(data) {
    var api = bind();
    if (api) api.use(data);
  }

  window.PostModalLoanExternalData = { bind: bind, open: open, use: use };

  /* Самобинда нет: bind зовёт страница-хозяин (НКЛ — со стором, транш — со
     своим get/save, витрина — demo.js через use). */
})();
