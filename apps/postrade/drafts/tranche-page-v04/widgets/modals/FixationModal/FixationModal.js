/* ============================================================
   FixationModal.js — окно «Фиксация ЭПС/ВБС».

   Окно — список карточек фиксации, по одной на ФИ. Карточку рисует этот файл по
   шаблону подчасти (FixationModalTile/FixationModalTile.html): клонирует <template>,
   заменяет {uid} в id и for, привязывает рантаймы ДС. Окно читает и пишет
   FinMetricsStore (data/fin-metrics-store.js): ФИ сделки, данные карточки по ФИ и
   дате, предварительный расчёт, правила фиксации, сохранение. Стор должен быть
   открыт на нужной сделке до open().

   Что делает скрипт сверх рантаймов ДС (в них этого нет — это модель данных):
     1. Выбор ФИ и типа модификации — одиночный выбор со списком (DSDropdownList);
        набранный руками текст сверяется со списком, пустое поле снимает выбор.
     2. Дата изменений: маска и календарь — рантайм ДС; здесь дата разбирается в
        ISO. Неполная или неверная дата — «не задана».
     3. Сброс ФИ или даты сбрасывает предварительный расчёт и данные карточки
        (ВБС до фиксации, ЕТС); тип и комментарий остаются (вопрос 37 RE0033).
     4. Тип «Первоначальная»: дата очищается и блокируется, предварительный расчёт
        блокируется, значения блоков — прочерк.
     5. Предварительный расчёт справочный: тип модификации ему не нужен, сохранить
        окно можно, не дожидаясь конца расчёта — после подтверждения (вопросы 35, 36).
     6. «Сохранить»: обязательные поля и повтор ФИ → ошибка у поля; правила стора
        (дата позже последней, «Первоначальная» одна на ФИ и первая) → снеки; всё
        верно → окно закрывается, тост «запущен», расчёт идёт в сторе, итог — снеки.
        Окно с ошибкой не закрывается.
     7. ЕТС (Э7): пока считается — скелетоны, и «Сохранить» отвечает алертом; ошибка
        расчёта и «нет или 0» — иконка с тултипом и карандаш, фиксацию не блокируют;
        разные ЕТС у инструментов ФИ — при «Сохранить» или предварительном расчёте
        появляются иконка и карандаш, а сохранение блокируется, пока значение не введено
        вручную (карандаш → поле → галочка). Δ ручного значения — от прежней ЕТС.

   API: window.PostFixationModal
     bind(scrim, { tpl?, confirm? })  — привязать окно (обработчики — один раз на скрим);
                                        scrim — корень фрагмента (#fm-fix-scrim); tpl — шаблон
                                        карточки (по умолчанию #lc-fixtile-tpl), confirm —
                                        скрим подтверждения (по умолчанию #fm-fix-confirm-scrim).
                                        Текущим окном становится последнее привязанное.
     preview(scrim, spec)             — только для витрины: нарисовать окно по описанию,
                                        без сеанса и DSModal (см. функцию)
     open() → Promise<{ started } | null>
                                      — открыть окно с одной пустой карточкой; промис
                                        закрывается, когда окно закрыли: данные
                                        запущенной фиксации — started, без сохранения —
                                        null. Нет ФИ в сделке — окно не открывается (null).
     isOpen() → boolean
   ============================================================ */
(function () {
  'use strict';

  var TPL_ID = 'lc-fixtile-tpl';
  var SCRIM_ID = 'fm-fix-scrim';
  var CONFIRM_ID = 'fm-fix-confirm-scrim';
  var DASH = '—';
  var REQUIRED = 'Обязательное поле';
  var DUPLICATE = 'Невозможно рассчитать более одной фиксации для одного ФИ';
  var ETS_ALERT_TITLE = 'Фиксация не может быть выполнена';
  var TYPE_FALLBACK = { INITIAL: 'Первоначальная', NON_SUBSTANTIAL: 'Несущественная', SUBSTANTIAL: 'Существенная' };

  var ui = null;        // привязанное окно
  var cards = [];       // карточки открытого окна
  var seq = 0;
  var session = null;   // открытый сеанс: { resolve, saving }
  var alertKind = null; // что показывает алерт окна: 'ets-loading' | 'ets-multiple' | null

  function store() { return window.FinMetricsStore; }
  function $(root, sel) { return root.querySelector(sel); }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* ── Форматы ────────────────────────────────────────────────────── */

  function fmtNum(n, signed) {
    if (n == null || isNaN(n)) return DASH;
    var s = Number(n).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return signed && n > 0 ? '+' + s : s;
  }

  function round2(x) { return Math.round(x * 100) / 100; }

  /* 14 → «14%», 22.5 → «22,5%» (для тултипа) */
  function fmtPct(n) { return Number(n).toLocaleString('ru-RU', { maximumFractionDigits: 2 }) + '%'; }

  /* «ДД.ММ.ГГГГ» → ISO; неполная или несуществующая дата — null */
  function parseDate(text) {
    var m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(String(text || '').trim());
    if (!m) return null;
    var d = new Date(+m[3], +m[2] - 1, +m[1]);
    if (d.getFullYear() !== +m[3] || d.getMonth() !== +m[2] - 1 || d.getDate() !== +m[1]) return null;
    return m[3] + '-' + m[2] + '-' + m[1];
  }

  function typeOptions() {
    var labels = (window.FIN_METRICS_LABELS && window.FIN_METRICS_LABELS.modification) || TYPE_FALLBACK;
    return Object.keys(labels).map(function (code) { return { code: code, label: labels[code] }; });
  }

  /* ── Атрибуты: недоступное — разметкой (урок Л235) ──────────────── */

  function setEnabled(el, on) {
    if (!el) return;
    el.disabled = !on;
    if (on) el.removeAttribute('aria-disabled'); else el.setAttribute('aria-disabled', 'true');
  }

  function setLoading(btn, on) {
    var spin = $(btn, '.spin');
    btn.classList.toggle('btn--loading', on);
    if (on) {
      btn.setAttribute('aria-busy', 'true');
      if (!spin) {
        spin = document.createElement('span');
        spin.className = 'spin spin--current';
        btn.insertBefore(spin, btn.firstChild);
      }
    } else {
      btn.removeAttribute('aria-busy');
      if (spin) spin.remove();
    }
  }

  function rebind(scope) {
    if (window.dsIcons) window.dsIcons.apply(scope);
    if (window.DSInput) { window.DSInput.bindAll(scope); window.DSInput.syncAll(scope); }
    if (window.DSTooltip && window.DSTooltip.bindAll) window.DSTooltip.bindAll(scope);
  }

  /* ── Ошибка поля: красная рамка и тултип на фокусе ───────────────── */
  /* bind() навешивает показ тултипа на наведение и фокус навсегда, поэтому, пока
     ошибки нет, показ гасится сразу за ним (как в DealPeriodModal.js). */
  function fieldError(input) {
    var inp = input.closest('.inp');
    var box = input.closest('.inp__box');
    var message = '';
    var api = null;

    function ensure() {
      if (api || !window.DSTooltip || !box) return api;
      var o = { type: 'error', placement: 'bottom', align: 'start', multiline: true };
      var tip = window.DSTooltip.make('', o);
      box.appendChild(tip);
      o.tip = tip;
      api = window.DSTooltip.bind(input, o);
      ['mouseenter', 'focus'].forEach(function (ev) {
        input.addEventListener(ev, function () { if (!message && api) api.hide(true); });
      });
      return api;
    }
    return {
      set: function (msg) {
        message = msg;
        inp.classList.add('inp--error');
        input.setAttribute('aria-invalid', 'true');
        var a = ensure();
        if (!a) return;
        a.tip.firstChild.textContent = msg;
        if (document.activeElement === input) a.show(true);
      },
      clear: function () {
        message = '';
        inp.classList.remove('inp--error');
        input.removeAttribute('aria-invalid');
        if (api) api.hide(true);
      },
      message: function () { return message; }
    };
  }

  /* ── Одиночный выбор со списком ─────────────────────────────────── */

  function select(card, name, options, onChange) {
    var inp = $(card.el, '[data-fx-field="' + name + '"]');
    var control = $(inp, '.inp__control');
    var list = $(inp, '.ddl');
    var field = $(inp, '[data-ddl]');
    var cur = null;

    function labelOf(code) {
      var o = options().filter(function (x) { return x.code === code; })[0];
      return o ? o.label : '';
    }
    function paint() {
      list.innerHTML = options().map(function (o) {
        return '<button type="button" class="ddl__item" role="option" aria-selected="' + (o.code === cur ? 'true' : 'false')
          + '" data-code="' + esc(o.code) + '"><span class="ddl__item-body"><span class="ddl__item-label">' + esc(o.label) + '</span></span></button>';
      }).join('');
    }
    function set(code, silent) {
      cur = code && options().some(function (o) { return o.code === code; }) ? code : null;
      control.value = labelOf(cur);
      paint();
      if (window.DSInput) window.DSInput.sync(inp);
      if (!silent) onChange(cur);
    }
    /* набранный руками текст: совпал с опцией — выбор; пусто — выбор снят; иначе откат */
    function commitTyped() {
      var s = String(control.value || '').trim().toLowerCase();
      if (!s) { if (cur) set(null); return; }
      var hit = options().filter(function (o) { return o.label.toLowerCase() === s; })[0];
      if (hit && hit.code !== cur) set(hit.code); else set(cur, true);
    }

    paint();
    if (window.DSDropdownList) {
      window.DSDropdownList.bind(field, { list: list, onSelect: function (it) { set(it.getAttribute('data-code')); } });
    }
    control.addEventListener('change', commitTyped);
    inp.addEventListener('ds-input:clear', function () { set(null); });
    return { set: set, get: function () { return cur; }, control: control, error: fieldError(control) };
  }

  /* ── Карточка ───────────────────────────────────────────────────── */

  /* Разметка карточки по шаблону: у каждой свои id и for */
  function cardElement() {
    var tpl = document.getElementById(ui.tplId);
    var node = tpl.content.firstElementChild.cloneNode(true);
    var uid = 'c' + (++seq);
    [node].concat([].slice.call(node.querySelectorAll('*'))).forEach(function (el) {
      ['id', 'for', 'data-ddl', 'aria-labelledby'].forEach(function (a) {
        var v = el.getAttribute(a);
        if (v && v.indexOf('{uid}') !== -1) el.setAttribute(a, v.replace(/\{uid\}/g, uid));
      });
    });
    return node;
  }

  /* Привязка полей уже вставленной в документ карточки */
  function wireCard(el) {
    var card = {
      el: el, fiId: null, date: null, typeCode: null,
      ctx: null, prelim: null, prelimState: 'idle', ctxToken: 0, prelimToken: 0, alive: true,
      etsManual: null, etsShown: false, etsEditing: false, etsIconKey: ''
    };

    card.fi = select(card, 'fi', function () {
      return store().fixationCandidates().map(function (c) { return { code: c.id, label: c.name }; });
    }, function (code) { onFiChange(card, code); });
    card.type = select(card, 'type', typeOptions, function (code) { onTypeChange(card, code); });

    var dateInp = $(el, '[data-fx-field="date"]');
    card.dateControl = $(dateInp, '.inp__control');
    card.dateError = fieldError(card.dateControl);
    /* ввод, очистка крестиком и выбор в календаре приходят событием input */
    card.dateControl.addEventListener('input', function () { onDateInput(card); });
    card.dateControl.addEventListener('change', function () { onDateInput(card); });

    card.comment = $(el, '[data-fx-field="comment"] .inp__control');
    card.runBtn = $(el, '[data-fx-prelim-run]');
    card.removeBtn = $(el, '[data-fx-remove]');
    card.etsInput = $(el, '[data-fx-ets-input] .inp__control');
    card.etsPencil = $(el, '[data-fx-ets-pencil]');
    card.etsOk = $(el, '[data-fx-ets-ok]');
    card.etsError = fieldError(card.etsInput);
    card.etsPencil.addEventListener('click', function () { startEtsEdit(card); });
    card.etsOk.addEventListener('click', function () { commitEts(card); });
    card.etsInput.addEventListener('input', function () { card.etsError.clear(); });
    card.etsInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); commitEts(card); }
    });
    card.runBtn.addEventListener('click', function () { runPreliminary(card); });
    card.removeBtn.addEventListener('click', function () { removeCard(card); });
    ['fi', 'type'].forEach(function (n) {
      card[n].control.addEventListener('input', function () { card[n].error.clear(); if (n === 'fi') markDuplicates(); });
    });
    return card;
  }

  /* ── Значения карточки ──────────────────────────────────────────── */

  function setVal(card, key, text, tone, affix) {
    var v = $(card.el, '[data-fx-val="' + key + '"]');
    if (!v) return;
    v.textContent = text;
    v.classList.toggle('rof__value--positive', tone === 'positive');
    v.classList.toggle('rof__value--negative', tone === 'negative');
    var a = $(card.el, '[data-fx-aff="' + key + '"]');
    if (a) a.hidden = !affix || text === DASH;
  }

  function tone(n) { return n > 0 ? 'positive' : n < 0 ? 'negative' : ''; }

  /* Всё, что показано в карточке, выводится из её состояния */
  function paint(card) {
    var ctx = card.ctx;
    var pre = card.prelimState === 'done' ? card.prelim : null;
    var initial = card.typeCode === 'INITIAL';

    var gca = pre ? pre.grossCarryingBefore : ctx ? ctx.grossCarryingBefore : null;
    setVal(card, 'gcaBefore', fmtNum(gca));

    setVal(card, 'nonGca', pre ? fmtNum(pre.nonSubstantial.gcaAfter) : DASH);
    setVal(card, 'nonDay1', pre ? fmtNum(pre.nonSubstantial.day1Pnl, true) : DASH, pre ? tone(pre.nonSubstantial.day1Pnl) : '');
    setVal(card, 'nonShare', pre ? fmtNum(pre.nonSubstantial.day1PnlShare) : DASH, '', true);
    setVal(card, 'subGca', pre ? fmtNum(pre.substantial.gcaAfter) : DASH);
    setVal(card, 'subEir', pre ? fmtNum(pre.substantial.eirAfter) : DASH, '', true);
    setVal(card, 'subEirDelta', pre ? fmtNum(pre.substantial.eirDelta, true) : DASH, pre ? tone(pre.substantial.eirDelta) : '', true);

    paintEts(card, initial);

    card.el.setAttribute('data-fx-prelim', card.prelimState);
    card.el.setAttribute('data-fx-initial', initial ? 'true' : 'false');

    /* предварительный расчёт доступен, когда выбраны ФИ и дата и тип не «Первоначальная» */
    var canRun = !!(card.fiId && card.date) && !initial && card.prelimState === 'idle';
    setEnabled(card.runBtn, canRun);
    setLoading(card.runBtn, card.prelimState === 'busy');
    if (card.prelimState === 'busy') { card.runBtn.disabled = true; card.runBtn.setAttribute('aria-disabled', 'true'); }
    var chip = $(card.el, '[data-fx-prelim-done]');
    chip.hidden = card.prelimState !== 'done';
    if (card.prelimState === 'done') { card.runBtn.disabled = true; card.runBtn.setAttribute('aria-disabled', 'true'); }

    /* «Первоначальная»: дата очищена и заблокирована (и календарь вместе с ней) */
    var dateInp = $(card.el, '[data-fx-field="date"]');
    card.dateControl.disabled = initial;
    dateInp.classList.toggle('inp--disabled', initial);
    var cal = $(dateInp, '.inp__act[aria-label="Открыть календарь"]');
    if (cal) setEnabled(cal, !initial);
  }

  /* ── ЕТС: вид блока по статусу, ручной ввод ─────────────────────── */

  /* Вид блока: состояние (атрибут data-fx-ets), иконка и текст её тултипа */
  function etsView(card, initial) {
    var ctx = card.ctx;
    if (card.ctxLoading) return { state: 'loading' };
    if (!ctx || initial) return { state: 'idle' };
    if (card.etsManual != null) return { state: 'manual' };
    switch (ctx.etsStatus) {
      case 'OK': return { state: 'ok' };
      case 'EMPTY': return { state: 'empty', icon: 'alert-triangle-filled', kind: 'warning', tip: 'Значение ЕТС отсутствует или равно 0' };
      case 'FAILED': return { state: 'error', icon: 'alert-circle-filled', kind: 'error', tip: 'Ошибка расчета ЕТС' };
      case 'MULTIPLE':
        if (!card.etsShown) return { state: 'idle' };
        return { state: 'error', icon: 'alert-circle-filled', kind: 'error',
          tip: 'Найдено несколько значений ЕТС для данного ФИ: ' + (ctx.etsValues || []).map(fmtPct).join(', ') };
      default: return { state: 'idle' };
    }
  }

  /* Иконка статуса пересоздаётся только при смене вида: у тултипа ДС текст задаётся при привязке */
  function paintEtsIcon(card, view) {
    var key = view.icon ? view.kind + '|' + view.tip : '';
    if (key === card.etsIconKey) return;
    card.etsIconKey = key;
    var slot = $(card.el, '[data-fx-ets-icon]');
    if (!view.icon) { slot.innerHTML = ''; return; }
    slot.innerHTML = '<span class="rof__icon' + (view.kind === 'warning' ? ' rof__icon--warning' : ' lc-fixtile__ets-icon--error')
      + '" role="img" tabindex="0" aria-label="' + esc(view.tip) + '" data-tooltip="' + esc(view.tip)
      + '" data-tooltip-placement="top" data-tooltip-multiline="yes"><i data-icon="' + view.icon + '"></i></span>';
    rebind(slot);
  }

  function paintEts(card, initial) {
    var ctx = card.ctx;
    var view = etsView(card, initial);
    var rate = null;
    var delta = null;
    if (view.state === 'ok') { rate = ctx.etsRate; delta = ctx.etsDelta; }
    else if (view.state === 'manual') {
      rate = card.etsManual;
      delta = ctx && ctx.etsBefore != null ? round2(card.etsManual - ctx.etsBefore) : null;
    }
    setVal(card, 'etsRate', fmtNum(rate), '', true);
    setVal(card, 'etsDelta', fmtNum(delta, true), tone(delta), true);

    /* карандаш — там, где значение можно ввести руками */
    var canEdit = view.state === 'empty' || view.state === 'error' || view.state === 'manual';
    if (!canEdit) card.etsEditing = false;
    card.el.setAttribute('data-fx-ets', view.state);
    card.el.setAttribute('data-fx-ets-edit', card.etsEditing ? 'true' : 'false');
    $(card.el, '[data-fx-block="ets"]').setAttribute('aria-busy', view.state === 'loading' ? 'true' : 'false');
    setEnabled(card.etsPencil, canEdit && !card.etsEditing);
    setEnabled(card.etsOk, card.etsEditing);
    card.etsInput.disabled = !card.etsEditing;
    paintEtsIcon(card, view);
  }

  function startEtsEdit(card) {
    card.etsEditing = true;
    card.etsError.clear();
    card.etsInput.value = card.etsManual != null ? String(card.etsManual).replace('.', ',') : '';
    paint(card);
    if (window.DSInput) window.DSInput.sync(card.etsInput.closest('.inp'));
    card.etsInput.focus();
  }

  /* Галочка: пусто — вернуться к прежнему виду; число — подставить; не число — ошибка поля */
  function commitEts(card) {
    var raw = card.etsInput.value.replace(/\s/g, '').replace(',', '.');
    if (raw) {
      var n = Number(raw);
      if (!isFinite(n)) { card.etsError.set('Введите число'); card.etsInput.focus(); return; }
      card.etsManual = round2(n);
    }
    card.etsEditing = false;
    card.etsError.clear();
    syncEtsAlert();
    paint(card);
    card.etsPencil.focus();
  }

  /* Алерт ЕТС живёт, пока причина есть: пересчитывается из состояния карточек после любого их
     изменения (ответ, ручной ввод, сброс), а не только в обработчике ответа */
  function syncEtsAlert() {
    if (alertKind === 'ets-loading' && !cards.some(function (c) { return c.ctxLoading; })) hideAlert();
    else if (alertKind === 'ets-multiple' && !cards.some(unresolvedEts)) hideAlert();
  }

  /* Разные ЕТС и значение не введено — фиксация невозможна */
  function unresolvedEts(c) {
    return !!(c.ctx && c.ctx.etsStatus === 'MULTIPLE' && c.etsManual == null && c.typeCode !== 'INITIAL');
  }

  function resetCalculation(card) {
    card.etsManual = null;
    card.etsShown = false;
    card.etsEditing = false;
    card.etsInput.value = '';
    if (window.DSInput) window.DSInput.sync(card.etsInput.closest('.inp'));
    card.etsError.clear();
    card.prelimToken++;
    card.prelimState = 'idle';
    card.prelim = null;
    card.ctxToken++;
    card.ctx = null;
    card.ctxLoading = false;
  }

  function loadContext(card) {
    if (!card.fiId || !card.date || card.typeCode === 'INITIAL') { paint(card); return; }
    var token = ++card.ctxToken;
    card.ctxLoading = true;
    paint(card);
    store().fixationContext(card.fiId, card.date).then(function (res) {
      if (!card.alive || token !== card.ctxToken) return;
      card.ctx = res;
      card.ctxLoading = false;
      /* предрасчёт мог закончиться раньше контекста: разные ЕТС показываем и без «Сохранить» */
      if (card.prelimState === 'done' && unresolvedEts(card)) card.etsShown = true;
      syncEtsAlert();
      paint(card);
    });
  }

  /* ── События полей ──────────────────────────────────────────────── */

  function onFiChange(card, code) {
    card.fiId = code;
    resetCalculation(card);
    hideAlert();   // алерт относился к прежнему расчёту
    card.fi.error.clear();
    markDuplicates();
    loadContext(card);
  }

  function onDateInput(card) {
    if (card.typeCode === 'INITIAL') return;
    var iso = parseDate(card.dateControl.value);
    if (iso === card.date) return;
    card.date = iso;
    card.dateError.clear();
    resetCalculation(card);
    hideAlert();
    loadContext(card);
  }

  function onTypeChange(card, code) {
    card.typeCode = code;
    card.type.error.clear();
    if (code === 'INITIAL') {
      resetCalculation(card);
      card.date = null;
      card.dateControl.value = '';
      card.dateError.clear();
      if (window.DSInput) window.DSInput.sync(card.dateControl.closest('.inp'));
      syncEtsAlert();   // сброс убрал причину алерта ЕТС
    } else if (!card.date && parseDate(card.dateControl.value)) {
      card.date = parseDate(card.dateControl.value);
      loadContext(card);
    }
    paint(card);
  }

  /* ФИ в двух карточках — ошибка у повторных (вторая и далее) */
  function markDuplicates() {
    var seen = {};
    cards.forEach(function (c) {
      if (c.fiId && seen[c.fiId]) c.fi.error.set(DUPLICATE);
      else if (c.fi.error.message() === DUPLICATE) c.fi.error.clear();
      if (c.fiId) seen[c.fiId] = true;
    });
  }

  /* ── Алерт уровня окна ──────────────────────────────────────────── */

  function showAlert(title, text, kind) {
    alertKind = kind || null;
    var box = $(ui.scrim, '[data-fix-alert]');
    $(box, '[data-fix-alert-title]').textContent = title;
    var t = $(box, '[data-fix-alert-text]');
    t.textContent = text || '';
    t.hidden = !text;
    box.hidden = false;
  }
  function hideAlert() { alertKind = null; $(ui.scrim, '[data-fix-alert]').hidden = true; }

  /* ── Предварительный расчёт ─────────────────────────────────────── */

  function runPreliminary(card) {
    if (card.prelimState !== 'idle' || !card.fiId || !card.date || card.typeCode === 'INITIAL') return;
    hideAlert();
    var token = ++card.prelimToken;
    card.prelimState = 'busy';
    paint(card);
    store().preliminary(card.fiId, card.date).then(function (res) {
      if (!card.alive || token !== card.prelimToken) return;
      if (res && res.ok) {
        card.prelim = res;
        card.prelimState = 'done';
        if (unresolvedEts(card)) card.etsShown = true;   // Н2 листа «разные ЕТС»: алерта нет, иконка и карандаш есть
        paint(card);
        return;
      }
      card.prelimState = 'idle';
      paint(card);
      if (res && res.error === 'NO_INITIAL') {
        var c = store().fixationCandidates().filter(function (x) { return x.id === card.fiId; })[0];
        showAlert('Предварительный расчет не выполнен',
          'Для ФИ "' + (c ? c.name : '') + '" еще не рассчитана первоначальная фиксация ЭПС/ВБС, предварительный расчет невозможен.');
      } else {
        showAlert('Предварительный расчет не выполнен');
      }
    });
  }

  /* ── Список карточек ────────────────────────────────────────────── */

  function updateRemove() {
    cards.forEach(function (c) { setEnabled(c.removeBtn, cards.length > 1); });
  }

  function addCard(focus) {
    var el = cardElement();
    $(ui.scrim, '[data-fix-list]').appendChild(el);
    rebind(el);
    var card = wireCard(el);
    cards.push(card);
    paint(card);
    updateRemove();
    if (focus) {
      card.el.scrollIntoView({ block: 'nearest' });
      card.fi.control.focus();
    }
    return card;
  }

  function removeCard(card) {
    if (cards.length < 2) return;
    card.alive = false;
    cards.splice(cards.indexOf(card), 1);
    card.el.remove();
    hideAlert();
    markDuplicates();
    updateRemove();
  }

  function clearCards() {
    cards.forEach(function (c) { c.alive = false; });
    cards = [];
    $(ui.scrim, '[data-fix-list]').innerHTML = '';
  }

  /* ── Сохранение ─────────────────────────────────────────────────── */

  /* Обязательные поля и повтор ФИ; true — всё заполнено */
  function validate() {
    var first = null;
    function bad(card, field, msg) {
      field.error.set(msg);
      if (!first) first = field.control;
    }
    markDuplicates();
    cards.forEach(function (c) {
      if (!c.fiId) bad(c, c.fi, REQUIRED);
      else if (c.fi.error.message() === DUPLICATE && !first) first = c.fi.control;
      if (c.typeCode !== 'INITIAL' && !c.date) bad(c, { error: c.dateError, control: c.dateControl }, REQUIRED);
      if (!c.typeCode) bad(c, c.type, REQUIRED);
    });
    if (first) { first.focus(); return false; }
    return true;
  }

  function items() {
    return cards.map(function (c) {
      var it = { fiId: c.fiId, date: c.typeCode === 'INITIAL' ? null : c.date, modificationTypeCode: c.typeCode, comment: c.comment.value.trim() };
      if (c.etsManual != null) it.etsRateManual = c.etsManual;
      return it;
    });
  }

  function doSave() {
    if (!session || session.saving) return;
    session.saving = true;
    var list = items();
    var notify = window.FinMetricsNotify;
    var done = store().saveFixations(list).then(function (res) {
      if (notify) notify.fixationResult(res);
      return res;
    });
    if (notify) notify.fixationStarted();
    session.started = { items: list, done: done };
    window.DSModal.closeTop(true);   // закрывает окно фиксации (подтверждение к этому моменту уже закрыто)
  }

  /* ЕТС перед сохранением: ещё считается — ждать; разные у инструментов ФИ — ввести вручную.
     Ошибка расчёта и «нет или 0» сохранение не блокируют. true — можно дальше. */
  function checkEts() {
    if (cards.some(function (c) { return c.ctxLoading; })) {
      showAlert(ETS_ALERT_TITLE, 'Выполняется расчет значения ЕТС для ФИ', 'ets-loading');
      return false;
    }
    var bad = cards.filter(unresolvedEts);
    if (!bad.length) return true;
    bad.forEach(function (c) { c.etsShown = true; paint(c); });
    showAlert(ETS_ALERT_TITLE,
      'В инструментах, включенных в ФИ, не совпадают значения ЕТС. Укажите значение ЕТС вручную или исправьте значение в инструментах и попробуйте выполнить фиксацию ЭПС/ВБС снова.',
      'ets-multiple');
    return false;
  }

  function save() {
    if (!session || session.saving) return;
    hideAlert();
    if (!validate()) return;
    if (!checkEts()) return;
    var violations = store().checkFixations(items());
    if (violations.length) {
      var notify = window.FinMetricsNotify;
      if (notify) violations.forEach(notify.fixationRule);
      return;
    }
    var busy = cards.some(function (c) { return c.prelimState === 'busy'; });
    if (!busy) { doSave(); return; }
    var confirmScrim = document.getElementById(ui.confirmId);
    if (!confirmScrim) { doSave(); return; }
    window.DSModal.open(confirmScrim, { nested: true, guarded: true });
  }

  /* ── Привязка и открытие ────────────────────────────────────────── */

  var confirmWired = false;

  /* Окно привязывается один раз на скрим; «текущим» становится последнее привязанное
     (на странице оно одно, в витрине — рисуемое сейчас). */
  function bind(scrim, opts) {
    opts = opts || {};
    ui = { scrim: scrim, tplId: opts.tpl || TPL_ID, confirmId: opts.confirm || CONFIRM_ID };
    if (!scrim.__fixBound) {
      scrim.__fixBound = true;
      scrim.addEventListener('click', function (e) {
        if (e.target.closest('[data-fix-add]')) addCard(true);
        else if (e.target.closest('[data-fix-save]')) save();
      });
    }
    if (!confirmWired) {
      confirmWired = true;
      document.addEventListener('click', function (e) {
        var ok = e.target.closest && e.target.closest('[data-fix-confirm-ok]');
        if (!ok || !session) return;
        var confirmScrim = document.getElementById(ui.confirmId);
        if (!confirmScrim || !confirmScrim.contains(ok)) return;
        window.DSModal.closeTop(true);   // закрывает подтверждение
        doSave();
      });
    }
    return api;
  }

  /* Витрина: нарисовать окно по готовому описанию, без сеанса и без DSModal — открывает
     и закрывает его сама витрина. Карточки живые: ФИ, дата, тип и «+ Добавить ФИ» работают;
     «Сохранить» ничего не запускает (сеанса нет). ФИ берутся из FinMetricsStore — стор
     должен быть открыт на сделке.
       spec: { cards: [{ fiId, date (ISO|null), typeCode, comment, ctx, prelim, prelimState,
                        ctxLoading?, etsShown?, etsManual? }],
               alert?: { title, text? } }
       ctx — как ответ fixationContext, prelim — как ответ preliminary, prelimState — idle | busy | done */
  function preview(scrim, spec) {
    spec = spec || {};
    bind(scrim);
    clearCards();
    hideAlert();
    (spec.cards || []).forEach(function (c) {
      var card = addCard(false);
      if (c.fiId) { card.fi.set(c.fiId, true); card.fiId = card.fi.get(); }
      if (c.typeCode) { card.type.set(c.typeCode, true); card.typeCode = card.type.get(); }
      if (c.date && card.typeCode !== 'INITIAL') {
        card.date = c.date;
        card.dateControl.value = c.date.slice(8, 10) + '.' + c.date.slice(5, 7) + '.' + c.date.slice(0, 4);
        if (window.DSInput) window.DSInput.sync(card.dateControl.closest('.inp'));
      }
      if (c.comment) card.comment.value = c.comment;
      card.ctx = c.ctx || null;
      card.ctxLoading = !!c.ctxLoading;
      card.etsShown = !!c.etsShown;
      card.etsManual = c.etsManual != null ? c.etsManual : null;
      card.prelim = c.prelim || null;
      card.prelimState = c.prelimState || (c.prelim ? 'done' : 'idle');
      paint(card);
    });
    markDuplicates();
    if (spec.alert) showAlert(spec.alert.title, spec.alert.text);
  }

  function open() {
    if (!ui) {
      var scrim = document.getElementById(SCRIM_ID);
      if (!scrim) return Promise.resolve(null);
      bind(scrim);
    }
    if (session) return session.promise;
    var S = store();
    if (!S || !S.fixationCandidates().length) return Promise.resolve(null);

    var resolve;
    var promise = new Promise(function (r) { resolve = r; });
    session = { promise: promise, saving: false, started: null };
    clearCards();
    hideAlert();
    addCard(false);
    window.DSModal.open(ui.scrim, {
      guarded: true,
      onClose: function (ok) {
        var s = session;
        session = null;
        clearCards();
        resolve(ok === true && s && s.started ? { started: s.started } : null);
      }
    });
    return promise;
  }

  var api = { bind: bind, open: open, preview: preview, isOpen: function () { return !!session; } };
  window.PostFixationModal = api;
})();
