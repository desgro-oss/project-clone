/* ============================================================
   InitialAndAdditionalAgreementsModal.js — поведение окна «Договор».

   Делает то, чего нет в рантаймах ДС, и только это:
   1) заполняет окно при каждом открытии: номер договора и дату подписания из
      LoanAgreementStore.get().contract (договор не заполнен — поля пустые);
   2) проверяет дату по «Сохранить»: пусто — можно; иначе существующая дата
      ДД.ММ.ГГГГ. Номер договора не проверяется (человек обязательности не
      называл, RE0041, вопрос 28);
   3) показывает ошибку по правилу InputText: красное поле, текст — в тултипе
      на фокусе, не в хелпере; правка поля снимает ошибку, как только ввод
      стал корректным;
   4) «Сохранить» зовёт LoanAgreementStore.setContract({ contractNumber,
      contractSignDate (ISO | null) }) и закрывает окно. Тайл перерисует страница
      по событию стора.

   Привязка автоматическая: на DOMContentLoaded (или сразу, если страница уже
   загружена) окно с id contract-scrim привязывается само, bind() со страницы не нужен.
   5) В просмотре (LoanAgreementStore.isEditable() = false) «Сохранить» ничего не
      пишет, только закрывает окно.

   Открытие, фокус, Esc, крестик, маска даты и календарь делают рантаймы ДС.
   Окно только для типа «НКЛ»: окна по другим типам не делаются (RE0041, ответ 31).

   API:
     PostModalInitialAndAdditionalAgreements.bind(scrim?, opts?) → api
       scrim — по умолчанию #contract-scrim
       opts  — необязательно, для витрины и проверок: { get() → { contractNumber,
               contractSignDate (ISO | '') }, save({ contractNumber, contractSignDate }) }
               вместо стора
       api.fill() · api.validate() → boolean · api.clearError()
     PostModalInitialAndAdditionalAgreements.open() — открыть окно (DSModal.open)
   ============================================================ */
(function () {
  'use strict';

  var FORMAT = 'Введите дату в формате ДД.ММ.ГГГГ';
  var DATE = /^(\d{2})\.(\d{2})\.(\d{4})$/;
  var ISO = /^(\d{4})-(\d{2})-(\d{2})/;
  var SCRIM_ID = 'contract-scrim';

  /* 'ДД.ММ.ГГГГ' → ISO; не дата (в том числе 31.02) — null */
  function toIso(s) {
    var m = DATE.exec(String(s == null ? '' : s).trim());
    if (!m) return null;
    var d = +m[1], mo = +m[2], y = +m[3];
    var dt = new Date(y, mo - 1, d);
    if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
    return m[3] + '-' + m[2] + '-' + m[1];
  }

  /* ISO → 'ДД.ММ.ГГГГ'; иное остаётся как есть */
  function fromIso(v) {
    var s = String(v == null ? '' : v).trim();
    var m = ISO.exec(s);
    return m ? m[3] + '.' + m[2] + '.' + m[1] : s;
  }

  function isInline(scrim) {
    return scrim.classList.contains('modal-scrim--inline');
  }

  function bind(scrim, opts) {
    scrim = scrim || document.getElementById(SCRIM_ID);
    if (!scrim) return null;
    if (scrim.__contractModal) return scrim.__contractModal;
    opts = opts || {};

    var number = scrim.querySelector('.inp__control[name="contractNumber"]');
    var date = scrim.querySelector('.inp__control[name="contractSignDate"]');
    var inp = date && date.closest('.inp');
    var box = date && date.closest('.inp__box');
    var error = '';
    var tipApi = null;

    function current() {
      if (opts.get) return opts.get() || {};
      var store = window.LoanAgreementStore;
      var rec = store && store.get ? store.get() : null;
      return (rec && rec.contract) || {};
    }

    /* ── Ошибка поля даты ───────────────────────────────────────────── */
    /* Тултип строится через DSTooltip и монтируется в .inp__box поля. bind()
       навешивает показ на наведение и фокус навсегда, поэтому, пока ошибки нет,
       показ гасится сразу за ним (как в окне «Сроки сделки»). */
    function ensureTip() {
      if (tipApi || !window.DSTooltip || !box) return tipApi;
      var o = { type: 'error', placement: 'bottom', align: 'start', multiline: true };
      var tip = window.DSTooltip.make('', o);
      box.appendChild(tip);
      o.tip = tip;
      tipApi = window.DSTooltip.bind(date, o);
      ['mouseenter', 'focus'].forEach(function (ev) {
        date.addEventListener(ev, function () { if (!error && tipApi) tipApi.hide(true); });
      });
      return tipApi;
    }

    function setError(msg) {
      error = msg;
      inp.classList.add('inp--error');
      date.setAttribute('aria-invalid', 'true');
      var api = ensureTip();
      if (!api) return;
      api.tip.firstChild.textContent = msg;
      if (document.activeElement === date) api.show(true);
    }

    function clearError() {
      if (!date) return;
      error = '';
      inp.classList.remove('inp--error');
      date.removeAttribute('aria-invalid');
      if (tipApi) tipApi.hide(true);
    }

    function validate() {
      if (!date) return true;
      var v = date.value.trim();
      if (v && toIso(v) == null) { setError(FORMAT); return false; }
      clearError();
      return true;
    }

    /* ── Заполнение ─────────────────────────────────────────────────── */
    function fill() {
      var c = current();
      if (number) number.value = String(c.contractNumber == null ? '' : c.contractNumber).trim();
      if (date) date.value = fromIso(c.contractSignDate);
      /* крестик очистки живёт по значению — после записи скриптом его состояние
         пересчитывает рантайм поля */
      if (window.DSInput) {
        [number, date].forEach(function (el) {
          var box1 = el && el.closest('.inp');
          if (box1) window.DSInput.sync(box1);
        });
      }
      clearError();
    }

    /* ── События ────────────────────────────────────────────────────── */
    /* Окно открылось — поля заново: за время, пока оно было закрыто, договор мог
       смениться, а несохранённый ввод прошлого открытия не нужен. */
    var wasOpen = !scrim.hidden;
    new MutationObserver(function () {
      var open = !scrim.hidden;
      if (open === wasOpen) return;
      wasOpen = open;
      if (open) fill();
      else clearError();
    }).observe(scrim, { attributes: true, attributeFilter: ['hidden'] });

    /* новая ошибка появляется только по «Сохранить»; при правке поля уже показанная
       ошибка пересчитывается и снимается, когда ввод стал верным. Очистка крестиком и
       выбор в календаре приходят тем же событием input */
    if (date) date.addEventListener('input', function () { if (error) validate(); });

    scrim.addEventListener('click', function (e) {
      if (!e.target.closest('[data-contract-save]')) return;
      if (!validate()) { date.focus(); return; }
      /* В просмотре окно само не сохраняет: правку закрывают роль, статус сделки и
         погашение договора (LoanAgreementStore.isEditable). Нет стора (витрина) или
         save передан снаружи — как раньше. */
      var store = window.LoanAgreementStore;
      if (!opts.save && store && store.isEditable && !store.isEditable()) {
        if (!isInline(scrim) && window.DSModal) window.DSModal.closeTop(true);
        return;
      }
      var value = {
        contractNumber: number ? number.value.trim() : '',
        contractSignDate: date && date.value.trim() ? toIso(date.value) : null
      };
      if (opts.save) opts.save(value);
      else if (window.LoanAgreementStore && window.LoanAgreementStore.setContract) window.LoanAgreementStore.setContract(value);
      if (!isInline(scrim) && window.DSModal) window.DSModal.closeTop(true);
    });

    fill();

    var api = { fill: fill, validate: validate, clearError: clearError };
    scrim.__contractModal = api;
    return api;
  }

  function open() {
    var scrim = document.getElementById(SCRIM_ID);
    if (!scrim) return null;
    bind(scrim);
    return window.DSModal ? window.DSModal.open(scrim) : null;
  }

  window.PostModalInitialAndAdditionalAgreements = { bind: bind, open: open };

  /* Окно стоит на странице в конце body, открывает его data-modal на «Заполнить»:
     привязываем, как только скрим есть, — без вызова со страницы. */
  function bindAuto() { bind(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bindAuto);
  else bindAuto();
})();
