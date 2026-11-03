/* ============================================================
   TransferSchemaModal.js — окно «Процентная схема» страницы «Единая трансфертная
   ставка» (создание и правка) и подтверждение удаления схемы.

   Делает то, чего нет в рантаймах ДС, и только это:
   1) заполняет окно при каждом открытии: создание — поля пустые, «Рабочих дней до
      применения БИ» = 0, тип ставки не выбран; правка — из схемы LoanAgreementStore по id.
      Заголовок один («Процентная схема»), кнопки «Удалить» в окне нет;
   2) собирает опции списков «Тип ставки» и «Базовый индекс (БИ)» из справочников
      LOAN_RATE_TYPE_LABELS и LOAN_BASE_INDEX_LABELS (нет глобала — список пуст; для
      витрины словари можно передать в opts.dictionaries);
   3) показывает поля ставки по типу: «Фиксированная» — «Ставка», «Плавающая» —
      «Базовый индекс (БИ)» и «Спред» (скрытые поля несут атрибут hidden);
   4) проверяет по «Сохранить» только формат: даты (пусто можно, иначе существующая дата
      ДД.ММ.ГГГГ) и «Рабочих дней до применения БИ» (пусто — 0, иначе целое число не меньше
      нуля). Ошибка формата — красное поле, текст в тултипе на фокусе (правило InputText),
      окно остаётся открытым, стор не вызывается. Обязательность ставки и дат, порядок дат
      и пересечение периодов проверяет стор (validateScheme);
   5) «Сохранить» зовёт addScheme / updateScheme стора. Ответ { ok, errors[] }: есть ошибки —
      окно не закрывается, вверху один Alert уровня окна (.modal__alert, тон error) со ВСЕМИ
      сработавшими ошибками, строка на каждую (RATE_REQUIRED, PERIOD_REQUIRED, PERIOD_ORDER,
      PERIOD_OVERLAP; решение человека 27.10.2026). Alert пропадает при следующем вводе или
      повторном «Сохранить». ok — окно закрывается и на document уходит событие
      transferschemasaved, detail { kind: 'add' | 'update', id };
   6) confirmRemove(id) поднимает подтверждение удаления; «Подтвердить» зовёт removeScheme(id),
      закрывает подтверждение и шлёт transferschemasaved, detail { kind: 'remove', id }.
      Страницу, тайлы и тосты перерисовывает страница по этому событию;
   7) в просмотре (LoanAgreementStore.isEditable() = false) окно не открывается, подтверждение
      не поднимается; на всякий случай «Сохранить» и «Подтвердить» ничего не пишут, только
      закрывают.

   Привязка автоматическая: на DOMContentLoaded (или сразу, если страница уже загружена)
   окно tschema-scrim привязывается само.

   Схема (TransferSchemeRsDto): { id, startDate (ISO), endDate (ISO), baseIndexLagWorkDays
   (целое), comment, rateTypeCode 'FIXED' | 'FLOATING', fixedRatePercent, baseIndexCode
   'KEY_RATE', spreadPercent }. Числа вводятся с запятой или точкой.

   API:
     PostModalTransferSchema.bind(scrim?, opts?) → api
       scrim — по умолчанию #tschema-scrim
       opts  — необязательно, для витрины и проверок:
               get(id) → схема | null            вместо LoanAgreementStore.schemes()
               save(scheme, id | null) → { ok, id?, errors[] }
                                                 вместо addScheme / updateScheme
               remove(id) → boolean              вместо removeScheme
               dictionaries { rateType, baseIndex } — карты код → подпись
               confirm — скрим подтверждения (по умолчанию #tschema-delete-scrim)
       api.fill({ id? }) → boolean · api.validate() → boolean (формат полей)
       api.collect() → схема из полей окна · api.mode() → 'create' | 'edit'
       api.showErrors(codes[]) · api.hideErrors() · api.clearError()
       api.askRemove(id) → скрим подтверждения | null · api.readOnly() → boolean
     PostModalTransferSchema.open({ id? }) — подготовить и открыть окно (DSModal.open);
       id неизвестен или правка недоступна — не открывает и возвращает null
     PostModalTransferSchema.confirmRemove(id) — поднять подтверждение удаления схемы;
       id неизвестен или правка недоступна — не поднимает и возвращает null
   ============================================================ */
(function () {
  'use strict';

  var SCRIM_ID = 'tschema-scrim';
  var CONFIRM_ID = 'tschema-delete-scrim';
  var EVENT = 'transferschemasaved';
  var DATE_FORMAT = 'Введите дату в формате ДД.ММ.ГГГГ';
  var LAG_FORMAT = 'Введите целое число не меньше нуля';
  var ERROR_TEXTS = {
    RATE_REQUIRED: 'Необходимо заполнить данные по ставке',
    PERIOD_REQUIRED: 'Необходимо заполнить даты начала и окончания',
    PERIOD_ORDER: 'Дата окончания не может быть раньше даты начала',
    PERIOD_OVERLAP: 'Период пересекается с другой процентной схемой'
  };
  var ERROR_ORDER = ['RATE_REQUIRED', 'PERIOD_REQUIRED', 'PERIOD_ORDER', 'PERIOD_OVERLAP'];
  var DATE = /^(\d{2})\.(\d{2})\.(\d{4})$/;
  var ISO = /^(\d{4})-(\d{2})-(\d{2})/;
  var NUMBER = /^-?\d+([.,]\d+)?$/;

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function norm(s) { return String(s == null ? '' : s).trim().toLowerCase(); }
  function syncInput(el) { if (window.DSInput && el) window.DSInput.sync(el); }
  function isInline(scrim) { return scrim.classList.contains('modal-scrim--inline'); }

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

  /* '4,5' | '4.5' | ' 4 ' → число; пусто и не число — null */
  function parseNumber(v) {
    var s = String(v == null ? '' : v).replace(/\s/g, '');
    return NUMBER.test(s) ? parseFloat(s.replace(',', '.')) : null;
  }
  function formatNumber(n) { return n == null ? '' : String(n).replace('.', ','); }

  /* карта код → подпись → [{ code, label }] в порядке карты */
  function listOf(map) {
    map = map || {};
    return Object.keys(map).map(function (code) { return { code: code, label: map[code] }; });
  }

  function bind(scrim, opts) {
    scrim = scrim || document.getElementById(SCRIM_ID);
    if (!scrim) return null;
    if (scrim.__tschemaModal) return scrim.__tschemaModal;
    opts = opts || {};

    var confirm = opts.confirm || document.getElementById(CONFIRM_ID);
    var alertBox = scrim.querySelector('[data-tschema-alert]');
    var alertList = scrim.querySelector('[data-tschema-alert-list]');

    function ctl(name) { return scrim.querySelector('.inp__control[name="' + name + '"]'); }
    var lag = ctl('baseIndexLagWorkDays');
    var startDate = ctl('startDate');
    var endDate = ctl('endDate');
    var comment = ctl('comment');
    var fixedRate = ctl('fixedRatePercent');
    var spread = ctl('spreadPercent');

    var ctx = { id: null, removeId: null };
    var sel = { rateTypeCode: null, baseIndexCode: null };

    /* ── Справочники ────────────────────────────────────────────────── */
    function dict(key, glob) {
      var d = opts.dictionaries && opts.dictionaries[key];
      return listOf(d || window[glob]);
    }
    function rateTypes() { return dict('rateType', 'LOAN_RATE_TYPE_LABELS'); }
    function baseIndexes() { return dict('baseIndex', 'LOAN_BASE_INDEX_LABELS'); }

    /* ── Alert уровня окна ──────────────────────────────────────────── */
    function hideErrors() {
      if (!alertBox || alertBox.hidden) return;
      alertBox.hidden = true;
      alertList.innerHTML = '';
    }

    /* codes — коды ошибок стора; строка на каждую, порядок — как в паспорте.
       Неизвестные коды (NOT_FOUND и т. п.) в Alert не попадают. */
    function showErrors(codes) {
      codes = codes || [];
      var shown = ERROR_ORDER.filter(function (c) { return codes.indexOf(c) >= 0; });
      if (!shown.length || !alertBox) { hideErrors(); return; }
      alertList.innerHTML = shown.map(function (c) {
        return '<p class="alert__text">' + esc(ERROR_TEXTS[c]) + '</p>';
      }).join('');
      alertBox.hidden = false;
    }

    /* Любой ввод в окне снимает Alert: пользователь исправляет ошибку. */
    scrim.addEventListener('input', hideErrors);
    scrim.addEventListener('change', hideErrors);

    /* ── Ошибка поля (правило InputText) ────────────────────────────── */
    /* Тултип строится через DSTooltip и монтируется в .inp__box поля. bind()
       навешивает показ на наведение и фокус навсегда, поэтому, пока ошибки нет,
       показ гасится сразу за ним. */
    function errorOf(control) {
      var inp = control && control.closest('.inp');
      var box = control && control.closest('.inp__box');
      var tipApi = null;
      var msg = '';
      function ensureTip() {
        if (tipApi || !window.DSTooltip || !box) return tipApi;
        var o = { type: 'error', placement: 'bottom', align: 'start', multiline: true };
        var tip = window.DSTooltip.make('', o);
        box.appendChild(tip);
        o.tip = tip;
        tipApi = window.DSTooltip.bind(control, o);
        ['mouseenter', 'focus'].forEach(function (ev) {
          control.addEventListener(ev, function () { if (!msg && tipApi) tipApi.hide(true); });
        });
        return tipApi;
      }
      return {
        has: function () { return !!msg; },
        set: function (text) {
          msg = text;
          inp.classList.add('inp--error');
          control.setAttribute('aria-invalid', 'true');
          var api = ensureTip();
          if (!api) return;
          api.tip.firstChild.textContent = text;
          if (document.activeElement === control) api.show(true);
        },
        clear: function () {
          msg = '';
          inp.classList.remove('inp--error');
          control.removeAttribute('aria-invalid');
          if (tipApi) tipApi.hide(true);
        }
      };
    }

    /* check(value) → текст ошибки или '' */
    var checks = [];
    function watch(control, check) {
      if (!control) return;
      var err = errorOf(control);
      checks.push({ control: control, err: err, check: check });
      /* новая ошибка появляется только по «Сохранить»; при правке уже показанная
         пересчитывается и снимается, когда ввод стал верным. Очистка крестиком и
         выбор в календаре приходят тем же событием input */
      control.addEventListener('input', function () {
        if (!err.has()) return;
        var m = check(control.value);
        if (m) err.set(m); else err.clear();
      });
    }
    function dateCheck(v) {
      v = String(v || '').trim();
      return v && toIso(v) == null ? DATE_FORMAT : '';
    }
    function lagCheck(v) {
      v = String(v || '').trim();
      return v && !/^\d+$/.test(v) ? LAG_FORMAT : '';
    }
    watch(lag, lagCheck);
    watch(startDate, dateCheck);
    watch(endDate, dateCheck);

    function clearError() {
      checks.forEach(function (c) { c.err.clear(); });
    }

    /* Формат полей; первое поле с ошибкой получает фокус. */
    function validate() {
      var first = null;
      checks.forEach(function (c) {
        var m = c.check(c.control.value);
        if (m) { c.err.set(m); if (!first) first = c.control; } else c.err.clear();
      });
      if (first) first.focus();
      return !first;
    }

    /* ── Одиночный выбор: «Тип ставки», «Базовый индекс (БИ)» ───────── */
    /* Список из InputAutocomplete + DropdownList: значение — код, в поле — подпись.
       Код, которого нет в справочнике, показывается как есть. */
    function select(name, options, onChange) {
      var control = ctl(name);
      if (!control) return null;
      var field = control.closest('.inp__field');
      var list = scrim.querySelector('#' + field.getAttribute('data-ddl'));
      var cur = null;

      function labelOf(code) {
        if (code == null) return '';
        var o = options().filter(function (x) { return x.code === code; })[0];
        return o ? o.label : String(code);
      }
      function paint() {
        list.innerHTML = options().map(function (o) {
          return '<button type="button" class="ddl__item" role="option" aria-selected="' + (o.code === cur ? 'true' : 'false')
            + '" data-code="' + esc(o.code) + '"><span class="ddl__item-body"><span class="ddl__item-label">'
            + esc(o.label) + '</span></span></button>';
        }).join('');
      }
      function set(code, silent) {
        cur = code == null || code === '' ? null : String(code);
        control.value = labelOf(cur);
        paint();
        syncInput(control.closest('.inp'));
        if (!silent) onChange(cur);
      }
      /* Набранный руками текст: совпал с опцией — выбор; пусто — значение снято;
         иначе — откат к выбранному. */
      function commitTyped() {
        var s = norm(control.value);
        if (!s) { if (cur) set(null); return; }
        var hit = options().filter(function (o) { return norm(o.label) === s; })[0];
        if (hit) { if (hit.code !== cur) set(hit.code); else set(cur, true); return; }
        set(cur, true);
      }

      /* Выбор ловит собственный слушатель списка, а не onSelect: рантайм ДС сам привязывает
         все [data-ddl] на загрузке страницы, и повторный bind со своими опциями возвращает
         уже готовую привязку без них. */
      if (window.DSDropdownList) window.DSDropdownList.bind(field, { list: list });
      list.addEventListener('click', function (e) {
        var it = e.target.closest ? e.target.closest('.ddl__item') : null;
        if (!it || it.getAttribute('aria-disabled') === 'true') return;
        set(it.getAttribute('data-code'));
      });
      control.addEventListener('change', commitTyped);
      control.closest('.inp').addEventListener('ds-input:clear', function () { set(null); });
      return { set: function (code) { set(code, true); } };
    }

    /* Поля ставки по типу: лишние скрыты атрибутом hidden. */
    function applyRateType() {
      Array.prototype.forEach.call(scrim.querySelectorAll('[data-tschema-rate]'), function (el) {
        el.hidden = el.getAttribute('data-tschema-rate') !== sel.rateTypeCode;
      });
    }

    var rateTypeSel = select('rateTypeCode', rateTypes, function (c) {
      sel.rateTypeCode = c;
      applyRateType();
      hideErrors();
    });
    var baseIndexSel = select('baseIndexCode', baseIndexes, function (c) {
      sel.baseIndexCode = c;
      hideErrors();
    });

    /* ── Запись ─────────────────────────────────────────────────────── */
    function store() { return window.LoanAgreementStore || null; }

    function readOnly() {
      var st = store();
      return !opts.save && !!(st && st.isEditable && !st.isEditable());
    }

    function find(id) {
      if (opts.get) return opts.get(id) || null;
      var st = store();
      var all = st && st.schemes ? st.schemes() : [];
      for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i];
      return null;
    }

    /* Окно → схема. Дата с ошибкой формата в схему не попадёт: collect зовут после
       validate. Значения ставки читаются только для выбранного типа; число, которого
       не разобрать, уходит как null — стор ответит RATE_REQUIRED. */
    function collect() {
      var text = function (el) { return el && el.value.trim() ? el.value.trim() : null; };
      var type = sel.rateTypeCode;
      var lagText = lag ? lag.value.trim() : '';
      return {
        baseIndexLagWorkDays: lagText ? parseInt(lagText, 10) : 0,
        startDate: startDate && startDate.value.trim() ? toIso(startDate.value) : null,
        endDate: endDate && endDate.value.trim() ? toIso(endDate.value) : null,
        comment: text(comment),
        rateTypeCode: type,
        fixedRatePercent: type === 'FIXED' ? parseNumber(fixedRate && fixedRate.value) : null,
        baseIndexCode: type === 'FLOATING' ? sel.baseIndexCode : null,
        spreadPercent: type === 'FLOATING' ? parseNumber(spread && spread.value) : null
      };
    }

    /* ── Заполнение ─────────────────────────────────────────────────── */
    /* params: { id? } — id есть: правка схемы; нет: создание. Возвращает false, если
       схема с таким id не нашлась. */
    function fill(params) {
      params = params || {};
      var rec = params.id != null ? find(params.id) : null;
      if (params.id != null && !rec) return false;
      ctx.id = rec ? rec.id : null;

      var r = rec || {};
      if (lag) lag.value = String(r.baseIndexLagWorkDays == null ? 0 : r.baseIndexLagWorkDays);
      if (startDate) startDate.value = fromIso(r.startDate);
      if (endDate) endDate.value = fromIso(r.endDate);
      if (comment) comment.value = r.comment == null ? '' : String(r.comment);
      if (fixedRate) fixedRate.value = formatNumber(r.fixedRatePercent);
      if (spread) spread.value = formatNumber(r.spreadPercent);

      sel.rateTypeCode = r.rateTypeCode == null ? null : r.rateTypeCode;
      sel.baseIndexCode = r.baseIndexCode == null ? null : r.baseIndexCode;
      if (rateTypeSel) rateTypeSel.set(sel.rateTypeCode);
      if (baseIndexSel) baseIndexSel.set(sel.baseIndexCode);
      applyRateType();

      /* крестик очистки живёт по значению — после записи скриптом его состояние
         пересчитывает рантайм поля */
      if (window.DSInput) window.DSInput.syncAll(scrim);
      clearError();
      hideErrors();
      return true;
    }

    /* ── События ────────────────────────────────────────────────────── */
    function closeTop() {
      if (!isInline(scrim) && window.DSModal) window.DSModal.closeTop(true);
    }
    function emit(kind, id) {
      document.dispatchEvent(new CustomEvent(EVENT, { detail: { kind: kind, id: id } }));
    }

    /* Окно закрыли — несохранённый ввод и ошибки не нужны. */
    var wasOpen = !scrim.hidden;
    new MutationObserver(function () {
      var open = !scrim.hidden;
      if (open === wasOpen) return;
      wasOpen = open;
      if (!open) { clearError(); hideErrors(); }
    }).observe(scrim, { attributes: true, attributeFilter: ['hidden'] });

    scrim.addEventListener('click', function (e) {
      if (!e.target.closest('[data-tschema-save]')) return;
      hideErrors();
      if (!validate()) return;
      /* В просмотре окно само не сохраняет: правку закрывают роль, статус сделки и
         погашение договора (LoanAgreementStore.isEditable). */
      if (readOnly()) { closeTop(); return; }
      var scheme = collect();
      var id = ctx.id;
      var st = store();
      var res = null;
      if (opts.save) res = opts.save(scheme, id);
      else if (st) res = id ? st.updateScheme(id, scheme) : st.addScheme(scheme);
      if (!res) { closeTop(); return; }
      if (!res.ok) {
        /* схема пропала из стора, пока окно было открыто: править нечего */
        if ((res.errors || []).indexOf('NOT_FOUND') >= 0) { closeTop(); return; }
        showErrors(res.errors);
        return;
      }
      closeTop();
      emit(id ? 'update' : 'add', id || res.id);
    });

    /* ── Подтверждение удаления ─────────────────────────────────────── */
    /* Подтверждение поднимается рантаймом ДС как настоящий вложенный слой.
       Исключение — окно, показанное статично внутри страницы (витрина:
       .modal-scrim--inline у подтверждения): там слой не открывают, а показывают
       и прячут атрибутом hidden. */
    function askRemove(id) {
      if (id == null || !confirm || readOnly() || !find(id)) return null;
      ctx.removeId = id;
      if (isInline(confirm)) { confirm.hidden = false; return confirm; }
      return window.DSModal ? window.DSModal.open(confirm) : null;
    }

    function removeNow() {
      var id = ctx.removeId;
      ctx.removeId = null;
      if (id == null || readOnly()) return;
      var st = store();
      var done = opts.remove ? opts.remove(id) : (st ? st.removeScheme(id) : false);
      if (done !== false) emit('remove', id);
    }

    if (confirm && !confirm.__tschemaWired) {
      confirm.__tschemaWired = true;
      confirm.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-tschema-confirm]');
        if (!btn) {
          /* крестик статичного подтверждения: слоя нет, закрываем сами */
          if (isInline(confirm) && e.target.closest('[data-modal-close]')) confirm.hidden = true;
          return;
        }
        var ok = btn.getAttribute('data-tschema-confirm') === 'ok';
        if (ok) removeNow();
        if (isInline(confirm)) { confirm.hidden = true; return; }
        if (window.DSModal) window.DSModal.closeTop(ok);
      });
    }

    var api = {
      fill: fill, validate: validate, collect: collect, clearError: clearError,
      showErrors: showErrors, hideErrors: hideErrors,
      mode: function () { return ctx.id ? 'edit' : 'create'; },
      readOnly: readOnly, askRemove: askRemove
    };
    fill({});
    scrim.__tschemaModal = api;
    return api;
  }

  /* Подготовить окно и открыть поверх страницы. */
  function open(params) {
    var scrim = document.getElementById(SCRIM_ID);
    if (!scrim) return null;
    var api = bind(scrim);
    if (!api || api.readOnly() || !api.fill(params || {})) return null;
    return window.DSModal ? window.DSModal.open(scrim) : null;
  }

  /* Подтверждение удаления схемы. */
  function confirmRemove(id) {
    var scrim = document.getElementById(SCRIM_ID);
    var api = scrim ? bind(scrim) : null;
    return api ? api.askRemove(id) : null;
  }

  window.PostModalTransferSchema = { bind: bind, open: open, confirmRemove: confirmRemove };

  /* Окно стоит на странице в конце body: привязываем, как только скрим есть, —
     без вызова со страницы. */
  function bindAuto() { bind(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bindAuto);
  else bindAuto();
})();
