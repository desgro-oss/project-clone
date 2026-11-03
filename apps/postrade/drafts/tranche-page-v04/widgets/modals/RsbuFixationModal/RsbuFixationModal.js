/* ============================================================
   RsbuFixationModal.js — поведение окна «Фиксация РСБУ» (RE0034, концепт v4).

   Делает то, чего нет в рантаймах ДС, и только это:
   1) заполняет окно: прежняя фиксация — её даты; новой нет — дата корректировки
      подставляется первым числом месяца после даты фиксации (решение агента 27),
      пока человек сам её не менял;
   2) проверяет форму по «Сохранить» правилами, которые даёт страница, и показывает
      ошибку в Alert вверху окна с подсветкой полей; правка поля снимает его подсветку.

   Открытие, фокус, Esc, крестик, календарь и маску даты делают рантаймы ДС.
   Транш и стор окно не знает: правила берёт у страницы, проверенную запись отдаёт ей же.

   API:
     PostModalRsbuFixation.bind(scrim, { check, save }) → api
       check(rec)   → [{ field: 'fixationDate'|'adjustmentDate', code, date? }] — нарушения
                      (FinMetricsStore.checkRasFixation); code: REQUIRED | BEFORE_REPORT |
                      NOT_AFTER_FIXATION
       save(rec)    — принять запись { fixationDate, adjustmentDate } (ISO)
       api.open(rec|null) — заполнить окно (null — новая фиксация) и открыть
       api.fill(rec|null) — только заполнить (на витрине окно уже на экране)
       api.validate()     → boolean — проверить форму и показать ошибку
   ============================================================ */
(function () {
  'use strict';

  var KEYS = ['fixationDate', 'adjustmentDate'];

  function date(iso) { var p = String(iso).split('-'); return p[2] + '.' + p[1] + '.' + p[0]; }
  /* «ДД.ММ.ГГГГ» → ISO; мусор (в том числе 31.02) → '' */
  function parseDate(str) {
    var m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(String(str).trim());
    if (!m) return '';
    var d = new Date(Date.UTC(+m[3], +m[2] - 1, +m[1]));
    return (d.getUTCFullYear() === +m[3] && d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[1]) ? m[3] + '-' + m[2] + '-' + m[1] : '';
  }
  /* первое число месяца после даты (ISO) */
  function nextMonthStart(iso) {
    var y = +iso.slice(0, 4), m = +iso.slice(5, 7);
    if (m === 12) { y++; m = 1; } else m++;
    return y + '-' + (m < 10 ? '0' : '') + m + '-01';
  }

  /* Тексты ошибок придуманы агентом (решение 29 задачи RE0034). */
  var TEXTS = {
    REQUIRED: 'Укажите дату фиксации и дату корректировки в формате ДД.ММ.ГГГГ.',
    BEFORE_REPORT: 'Дата фиксации раньше первой даты отчёта РСБУ',
    NOT_AFTER_FIXATION: 'Дата корректировки должна быть позже даты фиксации.'
  };

  function bind(scrim, opts) {
    if (!scrim) return null;
    if (scrim.__rsbuFixation) return scrim.__rsbuFixation;
    opts = opts || {};

    var form = scrim.querySelector('form');
    var alertBox = scrim.querySelector('.modal__alert');
    var alertText = scrim.querySelector('.alert__text');
    var submit = scrim.querySelector('[data-rsbu-fix-submit]');
    var adjustTouched = false;

    function field(k) { return form.elements[k]; }
    function boxOf(k) { return field(k).closest('.inp'); }
    function isInline() { return scrim.classList.contains('modal-scrim--inline'); }

    function clearErrors() {
      alertBox.hidden = true;
      KEYS.forEach(function (k) { boxOf(k).classList.remove('inp--error'); });
    }
    function showError(text, keys) {
      alertText.textContent = text;
      alertBox.hidden = false;
      (keys || []).forEach(function (k) { boxOf(k).classList.add('inp--error'); });
    }

    /* дата корректировки следует за датой фиксации, пока человек её не трогал */
    function followFixation() {
      if (adjustTouched) return;
      var iso = parseDate(field('fixationDate').value);
      if (iso) { field('adjustmentDate').value = date(nextMonthStart(iso)); if (window.DSInput) window.DSInput.syncAll(scrim); }
    }
    form.addEventListener('input', function (e) {
      if (e.target.name === 'adjustmentDate') adjustTouched = true;
      if (e.target.closest('.inp')) e.target.closest('.inp').classList.remove('inp--error');
      if (e.target.name === 'fixationDate') followFixation();
    });
    /* выбор в календаре даёт change, а не input */
    field('fixationDate').addEventListener('change', followFixation);
    field('adjustmentDate').addEventListener('change', function () { adjustTouched = true; });

    function fill(rec) {
      adjustTouched = !!rec;
      field('fixationDate').value = rec ? date(rec.fixationDate) : '';
      field('adjustmentDate').value = rec ? date(rec.adjustmentDate) : '';
      clearErrors();
      if (window.DSInput) window.DSInput.syncAll(scrim);
    }

    function read() {
      return { fixationDate: parseDate(field('fixationDate').value), adjustmentDate: parseDate(field('adjustmentDate').value) };
    }

    function validate() {
      clearErrors();
      var v = read();
      var errs = opts.check ? opts.check(v) : [];
      if (!errs.length) return true;
      var req = errs.filter(function (e) { return e.code === 'REQUIRED'; });
      if (req.length) { showError(TEXTS.REQUIRED, req.map(function (e) { return e.field; })); return false; }
      var e = errs[0];
      showError(e.code === 'BEFORE_REPORT' ? TEXTS.BEFORE_REPORT + ' (' + date(e.date) + ').' : TEXTS[e.code] || TEXTS.REQUIRED, [e.field]);
      return false;
    }

    submit.addEventListener('click', function () {
      if (!validate()) return;
      if (opts.save) opts.save(read());
      if (!isInline() && window.DSModal) window.DSModal.closeTop();
    });

    function open(rec) {
      fill(rec || null);
      if (window.DSModal) window.DSModal.open(scrim);
    }

    fill(null);

    var api = { open: open, fill: fill, validate: validate };
    scrim.__rsbuFixation = api;
    return api;
  }

  window.PostModalRsbuFixation = { bind: bind };
})();
