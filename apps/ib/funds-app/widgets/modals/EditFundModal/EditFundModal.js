/* ============================================================
   EditFundModal.js — поведение окна «Форма фонда» (EditFundModal).

   Чего нет в рантаймах ДС и что делает этот файл: вариант окна по входу
   (заголовок, подпись основной кнопки, выключенные поля, ряд ИНН | КПП,
   предупреждение ЕПК), заполнение полей, выбор приоритета из справочника,
   проверка ввода и сбор формы. Слой окна (портал, фокус, Esc, крестик, защита
   от клика по скриму у формы), крестики очистки полей, открытие списка,
   тултип ошибки — рантаймы ДС (Modal, Inputs, DropdownList, Tooltip).

   API (глобальный объект window.EditFundModal):
     open(scrimId, opts) → api DSModal (close(ok), isOpen) | null
       scrimId — id скрима, по умолчанию 'editFundModal';
       opts = {
         mode: 'create' | 'update',
         source: 'ucp' | 'custom',      // при update вариант решает fund.partyId
         client?: UcpClientDto,         // create + ucp: Название/ИНН/КПП/partyId
         fund?: FundItemDto,            // update: значения полей
         name?: string,                 // create + custom: название из поиска
         priorities: FUND_PRIORITY_LABELS,  // { HIGH: 'Высокий', … }
         onSave(form)                   // форма прошла проверку; окно закроется
       }
       form = { name, alias, beneficiaries, comment, inn, kpp, priorityCode, partyId }
       (имена EditFundFormData фронтенда; пустое необязательное поле — null).
     render(scrim, opts) → вариант     — заполнить окно без открытия (витрина)
     variantOf(opts) → 'add-ucp' | 'create-custom' | 'edit-ucp' | 'edit-custom'
     setState(scrim, state)            — data · partial · loading · updating
     mirror(scrim)                     — перевести data-state в классы ДС
   Окно открывается рантаймом ДС: DSModal.open(scrim, { keep: true }).
   Ошибка проверки окно не закрывает: поле получает .inp--error и тултип
   с текстом при фокусе (правило InputText).
   ============================================================ */
(function () {
  'use strict';

  var DEFAULT_ID = 'editFundModal';
  var COMMENT_MAX = 254;
  var VARIANTS = {
    'add-ucp':       { title: 'Добавить фонд',      save: 'Добавить',  ucp: true,  alert: false },
    'create-custom': { title: 'Новый фонд',         save: 'Сохранить', ucp: false, alert: false },
    'edit-ucp':      { title: 'Редактировать фонд', save: 'Сохранить', ucp: true,  alert: false },
    'edit-custom':   { title: 'Редактировать фонд', save: 'Сохранить', ucp: false, alert: true }
  };
  /* Подписи справочника, если страница их не передала (data/funds.js). */
  function priorities(opts) {
    return (opts && opts.priorities) || window.FUND_PRIORITY_LABELS || {};
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function str(v) { return v == null ? '' : String(v); }
  function orNull(v) { var s = str(v).trim(); return s ? s : null; }

  function variantOf(opts) {
    opts = opts || {};
    if (opts.mode === 'update') return opts.fund && opts.fund.partyId ? 'edit-ucp' : 'edit-custom';
    return opts.source === 'ucp' ? 'add-ucp' : 'create-custom';
  }

  /* Значения формы по входу окна. */
  function valuesOf(opts, variant) {
    var f = opts.fund || {}, c = opts.client || {};
    if (variant === 'add-ucp') {
      return { name: c.shortName, alias: null, beneficiaries: null, comment: null,
        inn: c.inn, kpp: c.kpp, priorityCode: null, partyId: c.partyId || null };
    }
    if (variant === 'create-custom') {
      return { name: opts.name, alias: null, beneficiaries: null, comment: null,
        inn: null, kpp: null, priorityCode: null, partyId: null };
    }
    /* Бенефициар — одна строка формы; у фонда список keyBeneficiaries:
       допущение 30.10.2026 — имена через запятую. */
    var bens = (f.keyBeneficiaries || []).map(function (b) { return str(b.displayName).trim(); }).filter(Boolean);
    return { name: f.name, alias: f.alias, beneficiaries: bens.length ? bens.join(', ') : null,
      comment: f.comment, inn: f.inn, kpp: f.kpp,
      priorityCode: f.priority ? f.priority.code : null, partyId: f.partyId || null };
  }

  function q(scrim, sel) { return scrim.querySelector(sel); }
  function control(scrim, key) { var w = q(scrim, '[data-efm-field="' + key + '"]'); return w && w.querySelector('.inp__control'); }

  /* ── ошибка поля: .inp--error + тултип при фокусе (правило InputText) ── */
  function fieldError(input) {
    if (input.__efmError) return input.__efmError;
    var inp = input.closest('.inp'), box = input.closest('.inp__box');
    var message = '', api = null;
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
    input.__efmError = {
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
      }
    };
    return input.__efmError;
  }

  /* Правила проверки — схема EditFundModal.tsx фронтенда: «Название фонда»
     обязательно, «Комментарий» не длиннее 254 символов. Текст ошибки длины —
     перевод фронтенда; текст пустого названия — допущение (30.10.2026). */
  function checkField(scrim, key) {
    var c = control(scrim, key);
    if (!c || c.disabled) return true;
    var v = str(c.value), msg = '';
    if (key === 'name' && !v.trim()) msg = 'Заполните поле';
    if (key === 'comment' && v.length > COMMENT_MAX) {
      msg = 'Максимальная длина – ' + COMMENT_MAX + ' символов. Указано ' + v.length + ' символов.';
    }
    if (msg) fieldError(c).set(msg); else if (c.__efmError) c.__efmError.clear();
    return !msg;
  }
  function validate(scrim) {
    var ok = ['name', 'comment'].map(function (k) { return checkField(scrim, k); }).every(Boolean);
    if (!ok) { var first = q(scrim, '.inp--error .inp__control'); if (first) first.focus(); }
    return ok;
  }

  /* ── приоритет: одиночный выбор из справочника ── */
  function paintPriorities(scrim, code) {
    var list = q(scrim, '[data-efm-priority-list]'), P = scrim.__efm.priorities;
    if (!list) return;
    list.innerHTML = Object.keys(P).map(function (k) {
      return '<button type="button" class="ddl__item" role="option" aria-selected="' + (k === code ? 'true' : 'false') + '" data-code="' + esc(k) + '">'
        + '<span class="ddl__item-body"><span class="ddl__item-label">' + esc(P[k]) + '</span></span></button>';
    }).join('');
  }
  function setPriority(scrim, code) {
    var P = scrim.__efm.priorities;
    scrim.__efm.priorityCode = code && P[code] ? code : null;
    var c = control(scrim, 'priorityCode');
    if (c) c.value = scrim.__efm.priorityCode ? P[scrim.__efm.priorityCode] : '';
    paintPriorities(scrim, scrim.__efm.priorityCode);
    if (c && window.DSInput) window.DSInput.sync(c.closest('.inp'));
  }
  /* Набранный руками текст — выбор, если совпал с подписью целиком (Л202). */
  function commitTypedPriority(scrim) {
    var c = control(scrim, 'priorityCode'), P = scrim.__efm.priorities;
    var s = str(c && c.value).trim().toLowerCase();
    if (!s) { setPriority(scrim, null); return; }
    var hit = Object.keys(P).filter(function (k) { return String(P[k]).toLowerCase() === s; })[0];
    setPriority(scrim, hit || scrim.__efm.priorityCode);
  }

  /* ── сбор формы ── */
  function formOf(scrim) {
    var s = scrim.__efm, v = function (k) { var c = control(scrim, k); return c ? c.value : ''; };
    var ucp = VARIANTS[s.variant].ucp;
    return {
      name: str(v('name')).trim(),
      alias: orNull(v('alias')),
      beneficiaries: orNull(v('beneficiaries')),
      comment: orNull(v('comment')),
      inn: ucp ? orNull(s.values.inn) : null,
      kpp: ucp ? orNull(s.values.kpp) : null,
      priorityCode: s.priorityCode,
      partyId: s.values.partyId
    };
  }

  /* ── привязка один раз на скрим ── */
  function bind(scrim) {
    if (scrim.__efmBound) return;
    scrim.__efmBound = true;
    scrim.addEventListener('click', function (e) {
      var it = e.target.closest('.ddl__item[data-code]');
      if (it && it.closest('[data-efm-priority-list]')) { setPriority(scrim, it.getAttribute('data-code')); return; }
      if (e.target.closest('[data-efm-save]')) save(scrim);
    });
    scrim.addEventListener('ds-input:clear', function (e) {
      var w = e.target.closest('[data-efm-field]');
      if (w && w.getAttribute('data-efm-field') === 'priorityCode') setPriority(scrim, null);
    });
    var pc = control(scrim, 'priorityCode');
    if (pc) pc.addEventListener('change', function () { commitTypedPriority(scrim); });
    /* Проверка по уходу из поля (mode: 'onBlur' фронтенда); поле с ошибкой
       перепроверяется на каждом вводе, чтобы ошибка ушла, как только исправлена. */
    ['name', 'comment'].forEach(function (k) {
      var c = control(scrim, k);
      if (!c) return;
      c.addEventListener('blur', function () { checkField(scrim, k); });
      c.addEventListener('input', function () { if (c.getAttribute('aria-invalid')) checkField(scrim, k); });
    });
  }

  function save(scrim) {
    var s = scrim.__efm;
    if (!s || s.state === 'loading' || s.state === 'updating') return;
    commitTypedPriority(scrim);
    if (!validate(scrim)) return;
    var form = formOf(scrim);
    if (s.onSave) s.onSave(form);
    if (s.api) s.api.close(true);
  }

  /* ── вариант и значения ── */
  function setField(scrim, key, value, disabled) {
    var c = control(scrim, key);
    if (!c) return;
    var inp = c.closest('.inp'), lab = inp.querySelector('.ds-label');
    c.value = str(value);
    c.disabled = !!disabled;
    inp.classList.toggle('inp--disabled', !!disabled);
    if (lab) lab.classList.toggle('ds-label--disabled', !!disabled);
    if (c.__efmError) c.__efmError.clear();
  }

  function render(scrim, opts) {
    if (typeof scrim === 'string') scrim = document.getElementById(scrim);
    if (!scrim) return null;
    opts = opts || {};
    var variant = variantOf(opts), V = VARIANTS[variant];
    var values = valuesOf(opts, variant);
    var prev = scrim.__efm || {};
    scrim.__efm = { variant: variant, values: values, priorities: priorities(opts),
      priorityCode: null, onSave: opts.onSave || null, api: prev.api || null, state: 'data' };
    bind(scrim);
    var modal = q(scrim, '.modal');
    modal.setAttribute('data-variant', variant);
    q(scrim, '[data-efm-title]').textContent = V.title;
    q(scrim, '[data-efm-save-label]').textContent = V.save;
    q(scrim, '[data-efm-ucp-alert]').hidden = !V.alert;
    q(scrim, '[data-efm-requisites]').hidden = !V.ucp;
    setField(scrim, 'name', values.name, V.ucp);
    setField(scrim, 'alias', values.alias, false);
    setField(scrim, 'beneficiaries', values.beneficiaries, false);
    setField(scrim, 'comment', values.comment, false);
    setField(scrim, 'inn', values.inn, true);
    setField(scrim, 'kpp', values.kpp, true);
    setPriority(scrim, values.priorityCode);
    setState(scrim, 'data');
    if (window.DSInput) window.DSInput.syncAll(scrim);
    return variant;
  }

  /* ── состояние данных: data-state на .modal, в классы ДС — mirror ── */
  function setState(scrim, state) {
    if (typeof scrim === 'string') scrim = document.getElementById(scrim);
    if (!scrim) return;
    q(scrim, '.modal').setAttribute('data-state', state || 'data');
    mirror(scrim);
  }

  function mirror(scrim) {
    var modal = q(scrim, '.modal');
    if (!modal) return;
    var st = modal.getAttribute('data-state') || 'data';
    if (scrim.__efm) scrim.__efm.state = st;
    var loading = st === 'loading', saving = st === 'updating';
    /* Загрузка: каркас на месте, шиммер на рамках полей (.sk-surface — Skeleton). */
    scrim.querySelectorAll('.inp__field').forEach(function (f) { f.classList.toggle('sk-surface', loading); });
    var body = q(scrim, '.modal__body');
    if (body) { if (loading) body.setAttribute('aria-busy', 'true'); else body.removeAttribute('aria-busy'); }
    /* Обновление (сохранение): правило Modal — .modal--saving, поля в
       <fieldset disabled>, основная кнопка .btn--loading со Spinner. */
    modal.classList.toggle('modal--saving', saving);
    var fs = q(scrim, '[data-efm-fields]');
    if (fs) fs.disabled = saving || loading;
    var link = q(scrim, '[data-efm-link-ucp]');
    if (link) link.disabled = saving;
    var btn = q(scrim, '[data-efm-save]');
    if (btn) {
      btn.disabled = loading || saving;
      btn.classList.toggle('btn--loading', saving);
      var spin = btn.querySelector('.spin');
      if (saving && !spin) btn.insertAdjacentHTML('afterbegin', '<span class="spin spin--current" aria-hidden="true"></span>');
      if (!saving && spin) spin.remove();
    }
    var cancel = q(scrim, '[data-efm-cancel]');
    if (cancel) cancel.disabled = saving;
  }

  function open(scrimId, opts) {
    var scrim = document.getElementById(scrimId || DEFAULT_ID);
    if (!scrim || !window.DSModal) return null;
    render(scrim, opts);
    var api = window.DSModal.open(scrim, { keep: true });
    scrim.__efm.api = api;
    return api;
  }

  window.EditFundModal = { open: open, render: render, variantOf: variantOf, setState: setState, mirror: mirror };
})();
