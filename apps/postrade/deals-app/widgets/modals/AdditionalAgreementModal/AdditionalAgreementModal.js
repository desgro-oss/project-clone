/* ============================================================
   AdditionalAgreementModal.js — окно «Создание / Редактирование дополнительного
   соглашения» (ДС) и подтверждение удаления.

   Делает то, чего нет в рантаймах ДС, и только это:
   1) заполняет окно при каждом открытии: создание — поля пустые, номер ДС —
      следующий (его даёт страница), дата не подставляется; правка — из записи
      LoanAgreementStore по id. Заголовок и кнопка «Удалить» зависят от режима;
   2) собирает опции списков из справочников LOAN_CHANGE_TYPE_LABELS,
      LOAN_KEY_CHANGE_LABELS, LOAN_APPROVAL_LEVEL_LABELS (нет глобала — список пуст;
      для витрины словари можно передать в opts.dictionaries);
   3) мультивыбор с чипами для «Ключевых изменений» (InputAutocomplete +
      DropdownList): чипы в поле, фильтр списка по набранному, «Выбрать всё» —
      модель выбора держит этот файл, как у окна «Фильтр» финансовых метрик;
   4) проверяет по «Сохранить» только формат дат («Дата подписания», «Дата решения»:
      пусто можно, иначе существующая дата ДД.ММ.ГГГГ) и номер доп. соглашения
      (пусто — остаётся/подставляется порядковый, иначе целое число больше нуля).
      Обязательность полей и уникальность номера не проверяются (RE0041, вопрос 28);
   5) показывает ошибку по правилу InputText: красное поле, текст — в тултипе на
      фокусе, не в хелпере; правка поля снимает ошибку, как только ввод стал верным;
   6) «Сохранить» зовёт addAgreement / updateAgreement стора и закрывает окно;
      «Удалить» поднимает подтверждение поверх окна, «Подтвердить» зовёт
      removeAgreement и закрывает оба окна. Тайлы и страницу перерисует страница по
      событию стора.
   7) В просмотре (LoanAgreementStore.isEditable() = false) окно открываться не
      должно (страница не даёт карандаш и «Новое соглашение»); на всякий случай «Сохранить» и
      «Подтвердить» ничего не пишут, только закрывают.

   Привязка автоматическая: на DOMContentLoaded (или сразу, если страница уже
   загружена) окно agreement-scrim привязывается само.

   Запись ДС (AdditionalAgreementRsDto): { id, seqNumber (число), signDate (ISO),
   changeTypeCode, keyChangeCodes[], comment, decisionDate (ISO), decisionNumber,
   approvalLevelCode }.

   API:
     PostModalAdditionalAgreement.bind(scrim?, opts?) → api
       scrim — по умолчанию #agreement-scrim
       opts  — необязательно, для витрины и проверок:
               get(id) → запись | null           вместо LoanAgreementStore.agreements()
               save(rec, id | null)              вместо addAgreement / updateAgreement
               remove(id)                        вместо removeAgreement
               dictionaries { changeType, keyChange, approvalLevel } — карты код → подпись
               confirm — скрим подтверждения (по умолчанию #agreement-delete-scrim)
       api.fill({ id?, nextSeqNumber? }) · api.validate() → boolean · api.clearError()
       api.collect() → запись из полей окна · api.mode() → 'create' | 'edit'
     PostModalAdditionalAgreement.open({ id?, nextSeqNumber? }) — подготовить и открыть
       окно (DSModal.open); id неизвестен — не открывает и возвращает null
   ============================================================ */
(function () {
  'use strict';

  var SCRIM_ID = 'agreement-scrim';
  var CONFIRM_ID = 'agreement-delete-scrim';
  var TITLE_CREATE = 'Создание дополнительного соглашения';
  var TITLE_EDIT = 'Редактирование дополнительного соглашения';
  var FORMAT = 'Введите дату в формате ДД.ММ.ГГГГ';
  var SEQ_FORMAT = 'Введите целое число больше нуля';
  var DATE = /^(\d{2})\.(\d{2})\.(\d{4})$/;
  var ISO = /^(\d{4})-(\d{2})-(\d{2})/;

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function norm(s) { return String(s == null ? '' : s).trim().toLowerCase(); }
  function applyIcons(el) { if (window.dsIcons) window.dsIcons.apply(el); }
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

  /* карта код → подпись → [{ code, label }] в порядке карты */
  function listOf(map) {
    map = map || {};
    return Object.keys(map).map(function (code) { return { code: code, label: map[code] }; });
  }

  function bind(scrim, opts) {
    scrim = scrim || document.getElementById(SCRIM_ID);
    if (!scrim) return null;
    if (scrim.__agreementModal) return scrim.__agreementModal;
    opts = opts || {};

    var title = scrim.querySelector('.modal__title');
    var modal = scrim.querySelector('.modal');
    var footLeft = scrim.querySelector('.modal__foot-left');
    var delBtn = scrim.querySelector('[data-agreement-delete]');
    var confirm = opts.confirm || document.getElementById(CONFIRM_ID);

    function ctl(name) { return scrim.querySelector('.inp__control[name="' + name + '"]'); }
    var signDate = ctl('signDate');
    var seqNumber = ctl('seqNumber');
    var comment = ctl('comment');
    var decisionDate = ctl('decisionDate');
    var decisionNumber = ctl('decisionNumber');

    var ctx = { id: null, nextSeq: 1, seq: null };
    var sel = { changeTypeCode: null, keyChangeCodes: [], approvalLevelCode: null };

    /* ── Справочники ────────────────────────────────────────────────── */
    function dict(key, glob) {
      var d = opts.dictionaries && opts.dictionaries[key];
      return listOf(d || window[glob]);
    }
    function changeTypes() { return dict('changeType', 'LOAN_CHANGE_TYPE_LABELS'); }
    function keyChanges() { return dict('keyChange', 'LOAN_KEY_CHANGE_LABELS'); }
    function approvalLevels() { return dict('approvalLevel', 'LOAN_APPROVAL_LEVEL_LABELS'); }

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
      var item = { control: control, err: err, check: check };
      checks.push(item);
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
      return v && toIso(v) == null ? FORMAT : '';
    }
    function seqCheck(v) {
      v = String(v || '').trim();
      if (!v) return '';
      return /^\d+$/.test(v) && +v > 0 && isFinite(+v) ? '' : SEQ_FORMAT;
    }
    watch(signDate, dateCheck);
    watch(seqNumber, seqCheck);
    watch(decisionDate, dateCheck);

    function clearError() {
      checks.forEach(function (c) { c.err.clear(); });
    }

    function validate() {
      var first = null;
      checks.forEach(function (c) {
        var m = c.check(c.control.value);
        if (m) { c.err.set(m); if (!first) first = c.control; } else c.err.clear();
      });
      if (first) first.focus();
      return !first;
    }

    /* ── Одиночный выбор: «Тип изменения», «Уровень одобрения» ──────── */
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

    var changeTypeSel = select('changeTypeCode', changeTypes, function (c) { sel.changeTypeCode = c; });
    var approvalSel = select('approvalLevelCode', approvalLevels, function (c) { sel.approvalLevelCode = c; });

    /* ── Мультивыбор с чипами: «Ключевые изменения» ─────────────────── */
    function multi(name, options, get, set) {
      var control = ctl(name);
      if (!control) return null;
      var root = control.closest('.inp');
      var field = control.closest('.inp__field');
      var chips = root.querySelector('.inp__chips');
      var list = scrim.querySelector('#' + field.getAttribute('data-ddl'));

      function labelOf(code) {
        var o = options().filter(function (x) { return x.code === code; })[0];
        return o ? o.label : code;
      }
      function chipEl(code) {
        var label = labelOf(code);
        var chip = document.createElement('span');
        chip.className = 'chip chip--edit chip--s';
        chip.tabIndex = 0;
        chip.setAttribute('data-value', code);
        chip.innerHTML = '<span class="chip__label">' + esc(label) + '</span>'
          + '<span class="chip__remove" role="button" aria-label="Удалить ' + esc(label) + '"><i data-icon="close"></i></span>';
        return chip;
      }
      function rowHTML(o, on, query) {
        var at = query ? norm(o.label).indexOf(query) : -1;
        var text = at < 0
          ? esc(o.label)
          : esc(o.label.slice(0, at)) + '<span class="ddl__match">' + esc(o.label.slice(at, at + query.length)) + '</span>' + esc(o.label.slice(at + query.length));
        return '<button type="button" class="ddl__item ddl__item--checkbox" role="option" aria-checked="' + (on ? 'true' : 'false') + '" data-value="' + esc(o.code) + '">'
          + '<span class="ddl__item-check"><span class="cb__box"><span class="cb__mark"><i data-icon="check"></i></span></span></span>'
          + '<span class="ddl__item-body"><span class="ddl__item-label">' + text + '</span></span></button>';
      }
      function allRowHTML(state) {
        return '<button type="button" class="ddl__item ddl__item--checkbox ddl__item--all" role="option" aria-checked="' + state + '">'
          + '<span class="ddl__item-check"><span class="cb__box"><span class="cb__mark"><i data-icon="' + (state === 'mixed' ? 'minus' : 'check') + '"></i></span></span></span>'
          + '<span class="ddl__item-body"><span class="ddl__item-label">Выбрать всё</span></span></button>';
      }
      function renderList() {
        var query = norm(control.value);
        var selected = get();
        var shown = options().filter(function (o) { return !query || norm(o.label).indexOf(query) >= 0; });
        if (!shown.length) {
          list.innerHTML = '<div class="ddl__state ddl__state--empty">Ничего не найдено</div>';
        } else {
          var on = shown.filter(function (o) { return selected.indexOf(o.code) >= 0; }).length;
          var state = on === shown.length ? 'true' : (on ? 'mixed' : 'false');
          list.innerHTML = allRowHTML(state) + '<hr class="ddl__divider">'
            + shown.map(function (o) { return rowHTML(o, selected.indexOf(o.code) >= 0, query); }).join('');
        }
        applyIcons(list);
      }
      function renderChips() {
        chips.innerHTML = '';
        get().forEach(function (code) { chips.appendChild(chipEl(code)); });
        applyIcons(chips);
        syncInput(root);
      }
      function render() { renderChips(); renderList(); }

      /* Набранный текст — запрос к списку, а не значение: с поля он уходит, когда
         фокус ушёл и из поля, и из списка. */
      function dropQuery() {
        if (!control.value) return;
        control.value = '';
        renderList();
        syncInput(root);
      }
      function openList() {
        var api = field.__dsDdl;
        if (!api) return;
        if (api.isOpen()) api.place(); else api.open();
      }
      function remove(code) {
        set(get().filter(function (c) { return c !== code; }));
        render();
        control.focus();
      }

      /* Привязка — до собственного слушателя списка: обработчик ДС переключает
         чекбокс первым, этот читает уже готовое состояние. Без multiple: в этом
         режиме пробел в поле выбирал бы опцию, а не писался в запрос. */
      if (window.DSDropdownList) window.DSDropdownList.bind(field, { list: list });

      list.addEventListener('click', function (e) {
        var item = e.target.closest ? e.target.closest('.ddl__item--checkbox') : null;
        if (!item || item.getAttribute('aria-disabled') === 'true') return;
        var on = item.getAttribute('aria-checked') === 'true';
        var next = get().slice();
        function put(code, add) {
          var at = next.indexOf(code);
          if (add && at < 0) next.push(code);
          else if (!add && at >= 0) next.splice(at, 1);
        }
        if (item.classList.contains('ddl__item--all')) {
          Array.prototype.forEach.call(list.querySelectorAll('.ddl__item--checkbox:not(.ddl__item--all)'), function (r) {
            put(r.getAttribute('data-value'), on);
          });
        } else {
          put(item.getAttribute('data-value'), on);
        }
        set(next);
        renderChips();
      });

      /* Чип: крестик и Backspace/Delete на сфокусированном чипе. Слушатель стоит на
         стеке чипов и гасит событие: рантайм чипа иначе снял бы узел сам, а выбор
         остался бы в модели; поле-триггер списка — раскрыл бы список. */
      chips.addEventListener('click', function (e) {
        var rm = e.target.closest ? e.target.closest('.chip__remove') : null;
        var chip = rm && rm.closest('.chip');
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
      control.addEventListener('input', function () {
        renderList();
        if (control.value) openList();
        else if (field.__dsDdl && field.__dsDdl.isOpen()) field.__dsDdl.place();
      });
      /* Backspace в пустом поле снимает последнее значение (правило InputAutocomplete). */
      control.addEventListener('keydown', function (e) {
        if (e.key !== 'Backspace' || control.value) return;
        var selected = get();
        if (!selected.length) return;
        e.preventDefault();
        remove(selected[selected.length - 1]);
      });
      /* Крестик очистки поля (рантайм ДС уже стёр текст и чипы) снимает весь выбор. */
      root.addEventListener('ds-input:clear', function () {
        set([]);
        control.value = '';
        render();
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

      return { render: function () { control.value = ''; render(); } };
    }

    var keyChangesSel = multi('keyChangeCodes', keyChanges,
      function () { return sel.keyChangeCodes; },
      function (codes) { sel.keyChangeCodes = codes; });

    /* ── Запись ─────────────────────────────────────────────────────── */
    function store() { return window.LoanAgreementStore || null; }

    function readOnly() {
      var st = store();
      return !opts.save && !!(st && st.isEditable && !st.isEditable());
    }

    function find(id) {
      if (opts.get) return opts.get(id) || null;
      var st = store();
      var all = st && st.agreements ? st.agreements() : [];
      for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i];
      return null;
    }

    /* Окно → запись ДС. Дата с ошибкой формата в запись не попадёт: collect зовут
       после validate. */
    function collect() {
      var seq = seqNumber && seqNumber.value.trim();
      var text = function (el) { return el && el.value.trim() ? el.value.trim() : null; };
      return {
        seqNumber: seq ? +seq : (ctx.id ? ctx.seq : ctx.nextSeq),
        signDate: signDate && signDate.value.trim() ? toIso(signDate.value) : null,
        changeTypeCode: sel.changeTypeCode,
        keyChangeCodes: sel.keyChangeCodes.slice(),
        comment: text(comment),
        decisionDate: decisionDate && decisionDate.value.trim() ? toIso(decisionDate.value) : null,
        decisionNumber: text(decisionNumber),
        approvalLevelCode: sel.approvalLevelCode
      };
    }

    /* ── Заполнение ─────────────────────────────────────────────────── */
    /* params: { id?, nextSeqNumber? } — id есть: правка записи; нет: создание.
       Возвращает false, если запись с таким id не нашлась. */
    function fill(params) {
      params = params || {};
      var rec = params.id != null ? find(params.id) : null;
      if (params.id != null && !rec) return false;
      var next = params.nextSeqNumber;
      ctx.id = rec ? rec.id : null;
      ctx.nextSeq = next != null && +next > 0 ? Math.floor(+next) : 1;
      ctx.seq = rec ? rec.seqNumber : null;

      var edit = !!rec;
      if (modal) modal.setAttribute('data-mode', edit ? 'edit' : 'create');
      if (title) title.textContent = edit ? TITLE_EDIT : TITLE_CREATE;
      if (footLeft) footLeft.hidden = !edit;
      if (delBtn) delBtn.disabled = !edit;

      var r = rec || {};
      if (signDate) signDate.value = fromIso(r.signDate);
      if (seqNumber) seqNumber.value = String(edit ? (r.seqNumber == null ? '' : r.seqNumber) : ctx.nextSeq);
      if (comment) comment.value = r.comment == null ? '' : String(r.comment);
      if (decisionDate) decisionDate.value = fromIso(r.decisionDate);
      if (decisionNumber) decisionNumber.value = r.decisionNumber == null ? '' : String(r.decisionNumber);

      sel.changeTypeCode = r.changeTypeCode == null ? null : r.changeTypeCode;
      sel.keyChangeCodes = (r.keyChangeCodes || []).slice();
      sel.approvalLevelCode = r.approvalLevelCode == null ? null : r.approvalLevelCode;
      if (changeTypeSel) changeTypeSel.set(sel.changeTypeCode);
      if (approvalSel) approvalSel.set(sel.approvalLevelCode);
      if (keyChangesSel) keyChangesSel.render();

      /* крестик очистки живёт по значению — после записи скриптом его состояние
         пересчитывает рантайм поля */
      if (window.DSInput) window.DSInput.syncAll(scrim);
      clearError();
      return true;
    }

    /* ── События ────────────────────────────────────────────────────── */
    function closeTop() {
      if (!isInline(scrim) && window.DSModal) window.DSModal.closeTop(true);
    }

    /* Окно закрыли — несохранённый ввод и ошибки не нужны. */
    var wasOpen = !scrim.hidden;
    new MutationObserver(function () {
      var open = !scrim.hidden;
      if (open === wasOpen) return;
      wasOpen = open;
      if (!open) clearError();
    }).observe(scrim, { attributes: true, attributeFilter: ['hidden'] });

    scrim.addEventListener('click', function (e) {
      if (e.target.closest('[data-agreement-save]')) {
        if (!validate()) return;
        /* В просмотре окно само не сохраняет: правку закрывают роль, статус сделки и
           погашение договора (LoanAgreementStore.isEditable). */
        if (readOnly()) { closeTop(); return; }
        var rec = collect();
        var id = ctx.id;
        if (opts.save) opts.save(rec, id);
        else if (store()) {
          if (id) store().updateAgreement(id, rec);
          else store().addAgreement(rec);
        }
        closeTop();
        return;
      }
      if (e.target.closest('[data-agreement-delete]')) askRemove();
    });

    /* ── Подтверждение удаления ─────────────────────────────────────── */
    /* Подтверждение поднимается рантаймом ДС как настоящий вложенный слой.
       Исключение — окно, показанное статично внутри страницы (витрина:
       .modal-scrim--inline у подтверждения): там слой не открывают, а показывают
       и прячут атрибутом hidden. */
    function askRemove() {
      if (!ctx.id || !confirm) return;
      confirm.__agreementOwner = api;
      if (isInline(confirm)) { confirm.hidden = false; return; }
      if (window.DSModal) window.DSModal.open(confirm);
    }

    function removeNow() {
      var id = ctx.id;
      if (!id || readOnly()) return;
      if (opts.remove) opts.remove(id);
      else if (store()) store().removeAgreement(id);
    }

    if (confirm && !confirm.__agreementWired) {
      confirm.__agreementWired = true;
      confirm.addEventListener('click', function (e) {
        var owner = confirm.__agreementOwner;
        var btn = e.target.closest('[data-agreement-confirm]');
        if (!btn) {
          /* крестик статичного подтверждения: слоя нет, закрываем сами */
          if (isInline(confirm) && e.target.closest('[data-modal-close]')) confirm.hidden = true;
          return;
        }
        var ok = btn.getAttribute('data-agreement-confirm') === 'ok';
        if (ok && owner) owner.removeNow();
        if (isInline(confirm)) { confirm.hidden = true; return; }
        if (window.DSModal) {
          window.DSModal.closeTop(ok);
          /* подтвердили — закрывается и окно ДС под ним */
          if (ok) window.DSModal.closeTop(true);
        }
      });
    }

    var api = {
      fill: fill, validate: validate, clearError: clearError, collect: collect,
      mode: function () { return ctx.id ? 'edit' : 'create'; },
      removeNow: removeNow
    };
    fill({});
    scrim.__agreementModal = api;
    return api;
  }

  /* Подготовить окно и открыть поверх страницы. */
  function open(params) {
    var scrim = document.getElementById(SCRIM_ID);
    if (!scrim) return null;
    var api = bind(scrim);
    if (!api || !api.fill(params || {})) return null;
    return window.DSModal ? window.DSModal.open(scrim) : null;
  }

  window.PostModalAdditionalAgreement = { bind: bind, open: open };

  /* Окно стоит на странице в конце body: привязываем, как только скрим есть, —
     без вызова со страницы. */
  function bindAuto() { bind(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bindAuto);
  else bindAuto();
})();
