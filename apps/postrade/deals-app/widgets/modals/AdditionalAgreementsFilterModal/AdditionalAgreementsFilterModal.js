/* ============================================================
   AdditionalAgreementsFilterModal.js — окно «Фильтр» списка дополнительных соглашений (ДС).

   Окно — компонент без стора: текущий применённый фильтр ему отдаёт страница при
   каждом открытии (open(currentFilter)); результат окно отдаёт событием
   agreementsfilter на document. Что делает скрипт сверх рантаймов ДС (в них этого
   нет — это модель данных):
     1. Справочники. Опции «Тип изменения», «Ключевые изменения» и «Уровень
        одобрения» строятся при привязке из глобалов LOAN_CHANGE_TYPE_LABELS,
        LOAN_KEY_CHANGE_LABELS, LOAN_APPROVAL_LEVEL_LABELS (data/mock-loan-agreements.js).
        Нет глобала (витрина) — запасной словарь ниже, он повторяет значения со
        скринов (справочники неполные: паспорт, «Открытые вопросы»).
     2. Поля. «Тип изменения» — одиночный выбор (InputAutocomplete + DropdownList):
        значение — код, в поле — подпись; набранный текст, не совпавший с опцией,
        при уходе с поля откатывается к выбранному, крестик снимает значение.
        «Ключевые изменения» и «Уровень одобрения» — мультивыбор с чипами в поле:
        список с чекбоксами и «Выбрать всё» ведёт DSDropdownList, а чипы, фильтрацию
        по набранному тексту (с подсветкой) и состояние выбора держит этот файл.
     3. Счётчики на табах разделов — число заполненных полей раздела, пересчёт на
        вводе; при нуле бейдж скрыт. Диапазон дат — одно поле, если заполнена хотя
        бы одна граница. «Основная информация»: number, signFrom/signTo,
        changeTypeCode, keyChangeCodes. «Решение»: decisionNumber,
        decisionFrom/decisionTo, approvalLevelCodes.
     4. «Очистить фильтр» только очищает поля окна (счётчики обнуляются), окно
        остаётся открытым, фильтр не применяется; кнопка выключена, пока очищать
        нечего. Применяется фильтр по «Сохранить» — как в окне фильтра
        FinancialMetricsFilterModal.
     5. «Сохранить»: проверяет формат четырёх дат (пусто — можно; иначе существующая
        дата ДД.ММ.ГГГГ), собирает фильтр, закрывает окно и шлёт на document событие
        agreementsfilter с detail { filter, count }. Ошибка — по правилу InputText:
        красное поле, текст в тултипе на фокусе, окно остаётся открытым. Проверка
        «конец не раньше начала» не делается (RE0041, ответ 28: проверяется только
        формат дат). Крестик и Esc закрывают без сохранения и без события.

   Формат фильтра = аргумент LoanAgreementStore.agreements():
     { number, signFrom, signTo, changeTypeCode, keyChangeCodes[], decisionNumber,
       decisionFrom, decisionTo, approvalLevelCodes[] }
   Даты — ISO (в окне ДД.ММ.ГГГГ); незаполненное поле — ключа в объекте нет, пустой
   фильтр — {}.

   API: window.PostModalAdditionalAgreementsFilter
     bind(scrim?, opts?) → api
       scrim — по умолчанию #agreements-filter-scrim; повторный bind того же скрима
               возвращает прежний api. На загрузке страницы окно привязывается само.
       opts  — необязательно: { get() → filter } — откуда брать фильтр, если окно
               открыли не через open() (например, триггером data-modal); по
               умолчанию — последний фильтр, что окно получило в open() или сохранило
       api.fill(filter?)  — заполнить окно фильтром (пусто — очистить)
       api.read()         → { filter, count } | null — что сейчас в окне; null, если
                            дата не прошла проверку (ошибки на полях показаны)
       api.validate()     → boolean — проверить формат дат
       api.clear()        — очистить поля окна (без закрытия)
       api.count()        → число заполненных полей
     open(currentFilter?) → слой окна (DSModal.open) | null
       currentFilter — текущий применённый фильтр (формат выше); окно заполняется
                       им при каждом открытии; несохранённый ввод прошлого открытия
                       сбрасывается
     Событие на document: agreementsfilter, detail { filter, count } — count: число
       заполненных полей фильтра (для чипа «Применено: N» на странице)
   ============================================================ */
(function () {
  'use strict';

  var SCRIM_ID = 'agreements-filter-scrim';
  var FORMAT = 'Введите дату в формате ДД.ММ.ГГГГ';
  var DATE = /^(\d{2})\.(\d{2})\.(\d{4})$/;
  var ISO = /^(\d{4})-(\d{2})-(\d{2})/;
  var NO_RESULTS = 'Ничего не найдено';

  /* Запасные словари — только если страница не подключила data/mock-loan-agreements.js
     (витрина). Значения — со скринов, полные справочники неизвестны. */
  var FALLBACK = {
    LOAN_CHANGE_TYPE_LABELS: {
      FINANCIAL: 'Финансовое',
      NON_FINANCIAL: 'Нефинансовое',
      FINANCIAL_AND_NON_FINANCIAL: 'Финансовое и нефинансовое'
    },
    LOAN_KEY_CHANGE_LABELS: {
      PRINCIPAL_REPAYMENT_SCHEDULE: 'График погашения основного долга',
      EARLY_REPAYMENT_TERMS: 'Условия досрочного погашения',
      OTHER: 'Прочее'
    },
    LOAN_APPROVAL_LEVEL_LABELS: {
      FOUR_EYES: '4 глаза',
      KPKI_TB: 'КПКИ ТБ',
      KPA_TB: 'КПА ТБ',
      KPKI_GOSB: 'КПКИ ГОСБ',
      SIX_EYES_PPR: '6 глаз ППР'
    }
  };

  /* поле формы -> раздел для счётчика */
  var SECTIONS = {
    main: ['number', 'sign', 'changeTypeCode', 'keyChangeCodes'],
    decision: ['decisionNumber', 'decision', 'approvalLevelCodes']
  };

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function norm(s) { return String(s == null ? '' : s).trim().toLowerCase(); }
  function has(v) { return v !== null && v !== undefined && v !== ''; }
  function applyIcons(el) { if (window.dsIcons) window.dsIcons.apply(el); }
  function syncInput(inp) { if (window.DSInput && inp) window.DSInput.sync(inp); }
  function isInline(scrim) { return scrim.classList.contains('modal-scrim--inline'); }

  function labels(name) {
    var map = window[name];
    return map && typeof map === 'object' ? map : FALLBACK[name];
  }
  function options(name) {
    var map = labels(name);
    return Object.keys(map).map(function (code) { return { value: code, label: map[code] }; });
  }

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

  function codes(v) {
    var out = [];
    (Array.isArray(v) ? v : []).forEach(function (c) {
      var s = String(c);
      if (s && out.indexOf(s) < 0) out.push(s);
    });
    return out;
  }

  /* ---------- поле мультивыбора (чипы в поле) ---------- */

  function rowHTML(opt, on, query) {
    var label = opt.label;
    var at = query ? norm(label).indexOf(query) : -1;
    var text = at < 0
      ? esc(label)
      : esc(label.slice(0, at)) + '<span class="ddl__match">' + esc(label.slice(at, at + query.length)) + '</span>' + esc(label.slice(at + query.length));
    return '<button type="button" class="ddl__item ddl__item--checkbox" role="option" aria-checked="' + (on ? 'true' : 'false') + '" data-value="' + esc(opt.value) + '">'
      + '<span class="ddl__item-check"><span class="cb__box"><span class="cb__mark"><i data-icon="check"></i></span></span></span>'
      + '<span class="ddl__item-body"><span class="ddl__item-label">' + text + '</span></span></button>';
  }

  function allRowHTML(state) {
    return '<button type="button" class="ddl__item ddl__item--checkbox ddl__item--all" role="option" aria-checked="' + state + '">'
      + '<span class="ddl__item-check"><span class="cb__box"><span class="cb__mark"><i data-icon="' + (state === 'mixed' ? 'minus' : 'check') + '"></i></span></span></span>'
      + '<span class="ddl__item-body"><span class="ddl__item-label">Выбрать всё</span></span></button>';
  }

  function chipEl(value, label) {
    var chip = document.createElement('span');
    chip.className = 'chip chip--edit chip--s';
    chip.tabIndex = 0;
    chip.setAttribute('data-value', value);
    chip.innerHTML = '<span class="chip__label">' + esc(label) + '</span>'
      + '<span class="chip__remove" role="button" aria-label="Удалить ' + esc(label) + '"><i data-icon="close"></i></span>';
    return chip;
  }

  /* Мультивыбор поверх разметки root (.inp с .inp__chips). Выбор живёт в массиве
     selected (коды), не в поле. cfg: { options() → [{ value, label }], placeholder,
     changed() } */
  function makeMulti(root, cfg) {
    var field = root.querySelector('.inp__field');
    var chips = root.querySelector('.inp__chips');
    var input = root.querySelector('.inp__control');
    var list = root.querySelector('.ddl');
    var selected = [];

    function labelOf(value) {
      var opts = cfg.options();
      for (var i = 0; i < opts.length; i++) if (opts[i].value === value) return opts[i].label;
      return value;
    }

    function listHTML() {
      var query = norm(input.value);
      var shown = cfg.options().filter(function (o) { return !query || norm(o.label).indexOf(query) >= 0; });
      if (!shown.length) return '<div class="ddl__state ddl__state--empty">' + NO_RESULTS + '</div>';
      var on = shown.filter(function (o) { return selected.indexOf(o.value) >= 0; }).length;
      var state = on === shown.length ? 'true' : (on ? 'mixed' : 'false');
      return allRowHTML(state) + '<hr class="ddl__divider">'
        + shown.map(function (o) { return rowHTML(o, selected.indexOf(o.value) >= 0, query); }).join('');
    }

    function renderList() {
      list.innerHTML = listHTML();
      applyIcons(list);
    }

    function renderChips() {
      chips.innerHTML = '';
      selected.forEach(function (v) { chips.appendChild(chipEl(v, labelOf(v))); });
      applyIcons(chips);
      input.placeholder = selected.length ? '' : cfg.placeholder;
      syncInput(root);
    }

    function render() { renderChips(); renderList(); }

    function toggle(value, on) {
      var at = selected.indexOf(value);
      if (on && at < 0) selected.push(value);
      else if (!on && at >= 0) selected.splice(at, 1);
    }

    /* Набранный текст — запрос к списку, а не значение: с поля он уходит, когда
       фокус ушёл и из поля, и из списка. */
    function dropQuery() {
      if (!input.value) return;
      input.value = '';
      renderList();
      syncInput(root);
    }

    function openList() {
      var api = field.__dsDdl;
      if (!api) return;
      if (api.isOpen()) api.place(); else api.open();
    }

    function remove(value) {
      toggle(value, false);
      render();
      cfg.changed();
      input.focus();
    }

    if (window.DSDropdownList) window.DSDropdownList.bind(field, { list: list });

    list.addEventListener('click', function (e) {
      var item = e.target.closest ? e.target.closest('.ddl__item--checkbox') : null;
      if (!item || item.getAttribute('aria-disabled') === 'true') return;
      var on = item.getAttribute('aria-checked') === 'true';
      if (item.classList.contains('ddl__item--all')) {
        Array.prototype.forEach.call(
          list.querySelectorAll('.ddl__item--checkbox:not(.ddl__item--all)'),
          function (r) { toggle(r.getAttribute('data-value'), on); }
        );
      } else {
        toggle(item.getAttribute('data-value'), on);
      }
      renderChips();
      cfg.changed();
    });

    /* Чип: крестик и Backspace/Delete на сфокусированном чипе. Событие гасится:
       рантайм чипа иначе снял бы узел сам, а выбор остался бы в массиве. */
    chips.addEventListener('click', function (e) {
      var rm = e.target.closest ? e.target.closest('.chip__remove') : null;
      if (!rm) return;
      var chip = rm.closest('.chip');
      if (!chip) return;
      e.stopPropagation();
      remove(chip.getAttribute('data-value'));
    });
    chips.addEventListener('keydown', function (e) {
      if (e.key !== 'Backspace' && e.key !== 'Delete') return;
      var chip = e.target.closest ? e.target.closest('.chip') : null;
      if (!chip || chip !== e.target) return;
      e.preventDefault();
      e.stopPropagation();
      remove(chip.getAttribute('data-value'));
    });

    input.addEventListener('input', function () {
      renderList();
      if (input.value) openList();
      else if (field.__dsDdl && field.__dsDdl.isOpen()) field.__dsDdl.place();
    });
    /* Backspace в пустом поле снимает последнее значение (правило InputAutocomplete). */
    input.addEventListener('keydown', function (e) {
      if (e.key !== 'Backspace' || input.value || !selected.length) return;
      e.preventDefault();
      remove(selected[selected.length - 1]);
    });

    /* Крестик очистки поля (рантайм ДС уже стёр текст и чипы) снимает весь выбор. */
    root.addEventListener('ds-input:clear', function () {
      selected = [];
      input.value = '';
      render();
      cfg.changed();
    });

    function leave() {
      setTimeout(function () {
        var active = document.activeElement;
        if (active && (root.contains(active) || list.contains(active))) return;
        dropQuery();
      }, 0);
    }
    root.addEventListener('focusout', leave);
    list.addEventListener('focusout', leave);

    render();
    return {
      get: function () { return selected.slice(); },
      set: function (values) { selected = codes(values); input.value = ''; render(); },
      focus: function () { input.focus(); },
      refresh: render
    };
  }

  /* ---------- поле одиночного выбора ---------- */

  function optionHTML(o, selected) {
    return '<button type="button" class="ddl__item" role="option" aria-selected="' + (selected ? 'true' : 'false')
      + '" data-code="' + esc(o.value) + '"><span class="ddl__item-body"><span class="ddl__item-label">'
      + esc(o.label) + '</span></span></button>';
  }

  /* InputAutocomplete + DropdownList: значение — код, в поле — подпись. Код, которого
     нет в справочнике, показывается как есть. */
  function makeSelect(root, cfg) {
    var field = root.querySelector('.inp__field');
    var control = root.querySelector('.inp__control');
    var list = root.querySelector('.ddl');
    var cur = null;

    function labelOf(code) {
      var o = cfg.options().filter(function (x) { return x.value === code; })[0];
      return o ? o.label : (has(code) ? String(code) : '');
    }
    function paint() {
      list.innerHTML = cfg.options().map(function (o) { return optionHTML(o, o.value === cur); }).join('');
    }
    function set(code, silent) {
      cur = has(code) ? String(code) : null;
      control.value = labelOf(cur);
      paint();
      syncInput(root);
      if (!silent) cfg.changed();
    }
    /* Набранный руками текст: совпал с опцией — выбор; пусто — значение снято;
       иначе — откат к выбранному. */
    function commitTyped() {
      var s = norm(control.value);
      if (!s) { if (cur) set(null); return; }
      var hit = cfg.options().filter(function (o) { return norm(o.label) === s; })[0];
      if (hit) { if (hit.value !== cur) set(hit.value); else set(cur, true); return; }
      set(cur, true);
    }

    paint();
    /* Привязку списка рантайм ДС делает сам по data-ddl (открытие, клавиатура, закрытие
       после выбора); если он успел раньше скрипта, свой onSelect уже не принять, поэтому
       выбор ловится собственным слушателем на списке, после обработчика ДС. */
    if (window.DSDropdownList) window.DSDropdownList.bind(field, { list: list });
    list.addEventListener('click', function (e) {
      var it = e.target.closest ? e.target.closest('.ddl__item[data-code]') : null;
      if (!it || it.getAttribute('aria-disabled') === 'true') return;
      set(it.getAttribute('data-code'));
    });
    control.addEventListener('change', commitTyped);
    root.addEventListener('ds-input:clear', function () { set(null); });

    return {
      get: function () { return cur; },
      set: function (code) { set(code, true); },
      focus: function () { control.focus(); },
      refresh: paint
    };
  }

  /* ---------- ошибка поля даты (правило InputText) ---------- */

  /* Тултип строится через DSTooltip и монтируется в .inp__box поля. bind() навешивает
     показ на наведение и фокус навсегда, поэтому, пока ошибки нет, показ гасится сразу
     за ним (как в окне «Договор»). */
  function makeDateField(control) {
    var inp = control.closest('.inp');
    var box = control.closest('.inp__box');
    var error = '';
    var tipApi = null;

    function ensureTip() {
      if (tipApi || !window.DSTooltip || !box) return tipApi;
      var o = { type: 'error', placement: 'bottom', align: 'start', multiline: true };
      var tip = window.DSTooltip.make('', o);
      box.appendChild(tip);
      o.tip = tip;
      tipApi = window.DSTooltip.bind(control, o);
      ['mouseenter', 'focus'].forEach(function (ev) {
        control.addEventListener(ev, function () { if (!error && tipApi) tipApi.hide(true); });
      });
      return tipApi;
    }

    function setError(msg) {
      error = msg;
      inp.classList.add('inp--error');
      control.setAttribute('aria-invalid', 'true');
      var api = ensureTip();
      if (!api) return;
      api.tip.firstChild.textContent = msg;
      if (document.activeElement === control) api.show(true);
    }

    function clearError() {
      error = '';
      inp.classList.remove('inp--error');
      control.removeAttribute('aria-invalid');
      if (tipApi) tipApi.hide(true);
    }

    function validate() {
      var v = control.value.trim();
      if (v && toIso(v) == null) { setError(FORMAT); return false; }
      clearError();
      return true;
    }

    /* новая ошибка появляется только по «Сохранить»; при правке уже показанная
       пересчитывается и снимается, когда ввод стал верным */
    control.addEventListener('input', function () { if (error) validate(); });

    return { control: control, validate: validate, clearError: clearError };
  }

  /* ---------- привязка ---------- */

  function bind(scrim, opts) {
    scrim = scrim || document.getElementById(SCRIM_ID);
    if (!scrim) return null;
    if (scrim.__aafModal) return scrim.__aafModal;
    opts = opts || {};

    function q(sel) { return scrim.querySelector(sel); }
    var num = q('input[name="number"]');
    var decNum = q('input[name="decisionNumber"]');
    var typeRoot = q('input[name="changeTypeCode"]');
    var keyRoot = q('[data-aaf-multi="keyChangeCodes"]');
    var apprRoot = q('[data-aaf-multi="approvalLevelCodes"]');
    var clearBtn = q('[data-aaf-clear]');
    var saveBtn = q('[data-aaf-save]');
    var badges = { main: q('[data-aaf-badge="main"]'), decision: q('[data-aaf-badge="decision"]') };
    var dateInputs = {};
    ['signFrom', 'signTo', 'decisionFrom', 'decisionTo'].forEach(function (n) {
      var c = q('input[name="' + n + '"]');
      if (c) dateInputs[n] = makeDateField(c);
    });
    if (!num || !decNum || !typeRoot || !keyRoot || !apprRoot || !clearBtn || !saveBtn
        || !dateInputs.signFrom || !dateInputs.signTo || !dateInputs.decisionFrom || !dateInputs.decisionTo) return null;

    var lastFilter = {};

    function current() {
      return opts.get ? (opts.get() || {}) : lastFilter;
    }

    var changeType = makeSelect(typeRoot.closest('.inp'), {
      options: function () { return options('LOAN_CHANGE_TYPE_LABELS'); },
      changed: refresh
    });
    var keyChanges = makeMulti(keyRoot, {
      options: function () { return options('LOAN_KEY_CHANGE_LABELS'); },
      placeholder: keyRoot.querySelector('.inp__control').getAttribute('placeholder') || '',
      changed: refresh
    });
    var approval = makeMulti(apprRoot, {
      options: function () { return options('LOAN_APPROVAL_LEVEL_LABELS'); },
      placeholder: apprRoot.querySelector('.inp__control').getAttribute('placeholder') || '',
      changed: refresh
    });

    function filled(el) { return el.value.trim() !== ''; }

    /* заполнено ли поле фильтра: диапазон дат — одно поле */
    function sectionCount(name) {
      var f = {
        number: filled(num),
        sign: filled(dateInputs.signFrom.control) || filled(dateInputs.signTo.control),
        changeTypeCode: !!changeType.get(),
        keyChangeCodes: keyChanges.get().length > 0,
        decisionNumber: filled(decNum),
        decision: filled(dateInputs.decisionFrom.control) || filled(dateInputs.decisionTo.control),
        approvalLevelCodes: approval.get().length > 0
      };
      return SECTIONS[name].filter(function (k) { return f[k]; }).length;
    }

    function count() { return sectionCount('main') + sectionCount('decision'); }

    /* бейджи разделов и «Очистить фильтр» — по текущему содержимому окна */
    function refresh() {
      Object.keys(badges).forEach(function (name) {
        var n = sectionCount(name);
        if (!badges[name]) return;
        badges[name].textContent = String(n);
        badges[name].hidden = n === 0;
      });
      clearBtn.disabled = count() === 0;
    }

    function closeLists() { if (window.DSDropdownList) window.DSDropdownList.closeAll(); }

    function setText(el, value) {
      el.value = value;
      syncInput(el.closest('.inp'));
    }

    function clearErrors() {
      Object.keys(dateInputs).forEach(function (n) { dateInputs[n].clearError(); });
    }

    function validate() {
      var ok = true;
      var first = null;
      ['signFrom', 'signTo', 'decisionFrom', 'decisionTo'].forEach(function (n) {
        if (!dateInputs[n].validate()) { ok = false; if (!first) first = dateInputs[n].control; }
      });
      if (first) first.focus();
      return ok;
    }

    /* Фильтр → поля окна. Пустой или чужой формат — пустые поля. */
    function fill(filter) {
      var f = filter && typeof filter === 'object' ? filter : {};
      closeLists();
      setText(num, has(f.number) ? String(f.number) : '');
      setText(dateInputs.signFrom.control, fromIso(f.signFrom));
      setText(dateInputs.signTo.control, fromIso(f.signTo));
      changeType.set(f.changeTypeCode);
      keyChanges.set(f.keyChangeCodes);
      setText(decNum, has(f.decisionNumber) ? String(f.decisionNumber) : '');
      setText(dateInputs.decisionFrom.control, fromIso(f.decisionFrom));
      setText(dateInputs.decisionTo.control, fromIso(f.decisionTo));
      approval.set(f.approvalLevelCodes);
      clearErrors();
      refresh();
    }

    /* Поля окна → фильтр: пустое поле — ключа нет. Даты здесь уже проверены. */
    function collect() {
      var f = {};
      function text(key, el) { var v = el.value.trim(); if (v) f[key] = v; }
      function date(key, el) { var v = el.value.trim(); if (v) f[key] = toIso(v); }
      text('number', num);
      date('signFrom', dateInputs.signFrom.control);
      date('signTo', dateInputs.signTo.control);
      if (changeType.get()) f.changeTypeCode = changeType.get();
      if (keyChanges.get().length) f.keyChangeCodes = keyChanges.get();
      text('decisionNumber', decNum);
      date('decisionFrom', dateInputs.decisionFrom.control);
      date('decisionTo', dateInputs.decisionTo.control);
      if (approval.get().length) f.approvalLevelCodes = approval.get();
      return f;
    }

    function read() {
      if (!validate()) return null;
      return { filter: collect(), count: count() };
    }

    /* «Очистить фильтр»: поля окна пустые, окно открыто, фильтр не применён. Кнопка
       только что выключилась — фокус уходит на первое поле. */
    function clear() {
      fill({});
      num.focus();
    }

    function save() {
      var res = read();
      if (!res) return;
      lastFilter = JSON.parse(JSON.stringify(res.filter));
      if (!isInline(scrim) && window.DSModal) window.DSModal.closeTop(true);
      document.dispatchEvent(new CustomEvent('agreementsfilter', { detail: res }));
    }

    /* ── События ───────────────────────────────────────────────────── */
    clearBtn.addEventListener('click', clear);
    saveBtn.addEventListener('click', save);
    [num, decNum, dateInputs.signFrom.control, dateInputs.signTo.control,
      dateInputs.decisionFrom.control, dateInputs.decisionTo.control].forEach(function (el) {
      el.addEventListener('input', refresh);
      el.addEventListener('change', refresh);
      /* крестик очистки и выбор в календаре сообщают через ds-input:clear / input */
      var inp = el.closest('.inp');
      if (inp) inp.addEventListener('ds-input:clear', refresh);
    });

    /* Окно открылось (не только через open()) — поля заново: за время, пока оно было
       закрыто, фильтр мог смениться, а несохранённый ввод прошлого открытия не нужен. */
    var wasOpen = !scrim.hidden;
    new MutationObserver(function () {
      var open = !scrim.hidden;
      if (open === wasOpen) return;
      wasOpen = open;
      if (open) fill(current());
      else { closeLists(); clearErrors(); }
    }).observe(scrim, { attributes: true, attributeFilter: ['hidden'] });

    var api = {
      fill: fill,
      read: read,
      validate: validate,
      clear: clear,
      count: count,
      setCurrent: function (filter) { lastFilter = filter && typeof filter === 'object' ? JSON.parse(JSON.stringify(filter)) : {}; }
    };
    scrim.__aafModal = api;
    fill(current());
    return api;
  }

  function open(currentFilter) {
    var scrim = document.getElementById(SCRIM_ID);
    if (!scrim) return null;
    var api = bind(scrim);
    if (!api) return null;
    api.setCurrent(currentFilter);
    api.fill(currentFilter);
    return window.DSModal ? window.DSModal.open(scrim) : null;
  }

  window.PostModalAdditionalAgreementsFilter = { bind: bind, open: open };

  /* Окно стоит на странице в конце body: привязываем, как только скрим есть, —
     без вызова со страницы. */
  function bindAuto() { bind(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bindAuto);
  else bindAuto();
})();
