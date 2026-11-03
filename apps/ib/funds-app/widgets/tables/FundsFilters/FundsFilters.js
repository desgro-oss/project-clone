/* ============================================================
   FundsFilters.js — фильтры списка фондов (FundsFilters фронтенда,
   tmp/funds-app/src/widgets/tables/FundsFilters/FundsFilters.tsx).

   Глобальное имя: window.FundsFilters. Подключается страницей после
   ds-body.js (нужны рантаймы ДС: DSDropdownList, DSInput, DSTooltip, dsIcons).
   Версия 3.000: ряд в тулбаре таблицы без своей карточки; приоритет —
   множественный выбор, как тип; тип и приоритет — по ширине самого длинного
   значения.

   API:
     init(root, { types, priorities })
       root       — корень виджета (.lc-funds-filters);
       types      — справочник типов фонда { code: подпись } (FUND_TYPE_LABELS);
       priorities — справочник приоритетов { code: подпись } (FUND_PRIORITY_LABELS).
       Строит опции списков, привязывает поля к рантаймам ДС и ставит ширину
       полей с data-ff-fit. Повторный вызов меняет справочники и сбрасывает значения.
     fit(root)
       Пересчитать ширину: тип и приоритет — одной ширины по большему; поиск —
       от ширины своего плейсхолдера до суммы ширин типа и приоритета с зазором (виджет перенесли в видимое место,
       догрузились шрифты). init и загрузка шрифтов зовут сами.
     setDisabled(root, bool)
       true — все три поля выключены: disabled у контролов и кнопок поля,
       .inp--disabled на поле (вид ДС), открытый список закрывается.
     value(root) → { smartSearch, typeCodes, priorityCodes }
     setValue(root, filters, { silent })
       Ставит значения кодом (демо витрины); silent — без события.

   Событие с корня (CustomEvent, bubbles):
     fundsfilters:change  detail: { smartSearch: string, typeCodes: string[],
       priorityCodes: string[] }. smartSearch и typeCodes — имена FundFiltersDto
       фронтенда; priorityCodes — массив вместо priorityCode фронтенда (решение
       человека 30.10.2026: приоритетов можно выбрать несколько).
       Поиск — по вводу с задержкой 300 мс; 1–2 символа событие не дают
       (как во фронтенде: фильтр остаётся прежним); пустая строка — сброс.
       Тип и приоритет — сразу по выбору.

   Чего здесь нет: фильтрации строк — её делает FundsTable.applyFilters.
   Открытие, позиционирование и клавиатура списков — DSDropdownList;
   крестик очистки — DSInput; подсказка у информера — DSTooltip (своя
   разметка .tip в фрагменте, привязка — bindTip в init).
   ============================================================ */
(function () {
  'use strict';

  var MIN_SEARCH = 3;      /* FundsFilters.tsx: newValue.length < 3 — фильтр не меняется */
  var DEBOUNCE = 300;      /* FundsFilters.tsx: useDebouncedCallback(…, 300) */
  /* Поля множественного выбора: ключ состояния → поле разметки и событие */
  var MULTI = {
    types: { field: 'typeCodes', placeholder: 'Все типы' },
    priority: { field: 'priorityCodes', placeholder: 'Все приоритеты' }
  };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  /* подсветка совпадения — .ddl__match ДС */
  function mark(label, q) {
    if (!q) return esc(label);
    var i = label.toLowerCase().indexOf(q.toLowerCase());
    if (i < 0) return esc(label);
    return esc(label.slice(0, i)) + '<span class="ddl__match">' + esc(label.slice(i, i + q.length)) + '</span>' + esc(label.slice(i + q.length));
  }
  function entries(map) {
    return Object.keys(map || {}).map(function (code) { return { code: code, name: map[code] }; });
  }
  function matches(name, q) { return !q || name.toLowerCase().indexOf(q.toLowerCase()) >= 0; }
  function apply(scope) { if (window.dsIcons) window.dsIcons.apply(scope); }
  function syncInp(inp) { if (window.DSInput) window.DSInput.sync(inp); }
  function emptyRow() {
    return '<div class="ddl__state ddl__state--empty"><span class="ddl__state-icon"><i data-icon="close-circle"></i></span><span class="ddl__state-text">Ничего не найдено</span></div>';
  }
  function cbMark(on) {
    if (on === 'mixed') return '<i data-icon="minus"></i>';
    return on ? '<i data-icon="check"></i>' : '';
  }

  /* ---------- состояние на корне ---------- */
  function st(root) { return root.__fundsFilters; }

  function detail(s) {
    return { smartSearch: s.search, typeCodes: s.types.sel.slice(), priorityCodes: s.priority.sel.slice() };
  }
  function emit(root) {
    root.dispatchEvent(new CustomEvent('fundsfilters:change', { bubbles: true, detail: detail(st(root)) }));
  }

  /* ---------- множественный выбор: список с чекбоксами + сводка ---------- */
  function renderList(root, key, q) {
    var m = st(root)[key], list = m.f.list;
    var opts = m.opts.filter(function (o) { return matches(o.name, q); });
    var html = '';
    if (!opts.length) html = emptyRow();
    else {
      /* «Выбрать всё» — только без запроса и при четырёх опциях и больше (DropdownList) */
      if (!q && m.opts.length >= 4) {
        var on = m.sel.length;
        var allSt = on === m.opts.length ? true : (on ? 'mixed' : false);
        html += '<button type="button" class="ddl__item ddl__item--checkbox ddl__item--all" role="option" aria-checked="' + (allSt === 'mixed' ? 'mixed' : String(allSt)) + '">'
          + '<span class="ddl__item-check"><span class="cb__box"><span class="cb__mark">' + cbMark(allSt) + '</span></span></span>'
          + '<span class="ddl__item-body"><span class="ddl__item-label">Выбрать всё</span></span></button>'
          + '<hr class="ddl__divider">';
      }
      html += opts.map(function (o) {
        var checked = m.sel.indexOf(o.code) >= 0;
        return '<button type="button" class="ddl__item ddl__item--checkbox" role="option" data-code="' + esc(o.code) + '" aria-checked="' + checked + '">'
          + '<span class="ddl__item-check"><span class="cb__box"><span class="cb__mark">' + cbMark(checked) + '</span></span></span>'
          + '<span class="ddl__item-body"><span class="ddl__item-label">' + mark(o.name, q) + '</span></span></button>';
      }).join('');
    }
    list.innerHTML = html;
    apply(list);
  }
  /* Сводка в поле «Первое, +N» (.inp__summary ДС): вариант S у InputAutocomplete —
     только сводкой. Узел сводки есть, только когда выбор не пуст, иначе пустой
     узел давал бы зазор перед плейсхолдером. */
  function summaryOf(m, codes) {
    if (!codes.length) return '';
    var first = m.labels[codes[0]] || codes[0];
    return codes.length > 1 ? first + ', +' + (codes.length - 1) : first;
  }
  function renderSummary(root, key) {
    var m = st(root)[key], f = m.f;
    var box = f.field.querySelector('.inp__summary');
    var text = summaryOf(m, m.sel);
    if (!text) { if (box) box.remove(); }
    else {
      if (!box) {
        box = document.createElement('span');
        box.className = 'inp__summary';
        f.field.insertBefore(box, f.control);
      }
      box.textContent = text;
    }
    f.control.placeholder = text ? '' : MULTI[key].placeholder;
    syncInp(f.inp);
  }
  function onToggle(root, key, it) {
    var m = st(root)[key];
    if (it.classList.contains('ddl__item--all')) {
      m.sel = it.getAttribute('aria-checked') === 'true' ? m.opts.map(function (o) { return o.code; }) : [];
    } else {
      var shown = {};
      Array.prototype.forEach.call(m.f.list.querySelectorAll('.ddl__item[data-code]'), function (r) {
        shown[r.getAttribute('data-code')] = r.getAttribute('aria-checked') === 'true';
      });
      /* порядок значений — порядок справочника */
      m.sel = m.opts.map(function (o) { return o.code; }).filter(function (code) {
        return code in shown ? shown[code] : m.sel.indexOf(code) >= 0;
      });
    }
    m.f.control.value = '';
    renderSummary(root, key);
    renderList(root, key, '');
    emit(root);
  }
  function setSel(root, key, codes) {
    var m = st(root)[key];
    codes = codes || [];
    m.sel = m.opts.map(function (o) { return o.code; }).filter(function (c) { return codes.indexOf(c) >= 0; });
    m.f.control.value = '';
    renderSummary(root, key);
    renderList(root, key, '');
  }

  /* ---------- ширина по самому длинному значению (data-ff-fit) ----------
     Ширина поля = «обвязка» поля (паддинги, бордер, иконки справа — мерится
     на живом поле) + самое широкое содержимое: плейсхолдер или сводка
     («Подпись, +N» для каждой подписи справочника) с зазором поля и минимальной
     шириной ввода после неё (поле ввода стоит за сводкой). Текст мерится шрифтом
     поля через canvas. В скрытом поле (ширина 0) мерить нечего — fit ждёт показа. */
  var canvas;
  function textW(font, t) {
    canvas = canvas || document.createElement('canvas');
    var ctx = canvas.getContext && canvas.getContext('2d');
    if (!ctx) return null; /* нет canvas (проверочная среда) — ширину не меряем, поле остаётся как есть */
    ctx.font = font;
    return ctx.measureText(t).width;
  }
  /* «Обвязка» поля — всё, кроме текста: паддинги и бордер поля, иконка слева,
     кнопки справа и зазоры между ними. Считается по частям, а не как «поле минус
     ввод»: сжатое поле ввод переполняет, и разность врёт. Сводка в обвязку не входит. */
  function chromeOf(f) {
    var fcs = getComputedStyle(f.field);
    var gap = parseFloat(fcs.columnGap) || 0;
    var w = ['paddingLeft', 'paddingRight', 'borderLeftWidth', 'borderRightWidth'].reduce(function (sum, k) { return sum + (parseFloat(fcs[k]) || 0); }, 0);
    var parts = Array.prototype.filter.call(f.field.children, function (el) {
      return !el.classList.contains('inp__summary') && !el.hidden && getComputedStyle(el).display !== 'none';
    });
    parts.forEach(function (el) { if (el !== f.control) w += el.getBoundingClientRect().width; });
    return { w: w + gap * Math.max(parts.length - 1, 0), gap: gap };
  }
  /* Поле на экране (не в скрытом предке). Ширина не годится: сжатый поиск — 0px. */
  function shown(f) { return f.inp.getClientRects().length > 0 && f.inp.closest('[hidden]') === null; }
  function fontOf(el) {
    var cs = getComputedStyle(el);
    return cs.font || (cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily);
  }
  /* Ширина, нужная полю множественного выбора: обвязка + самое широкое содержимое.
     false — поле не на экране, null — мерить нечем (нет canvas), число — px. */
  function needOf(m, key) {
    var f = m.f;
    if (!shown(f)) return false;
    if (textW('', '') === null) return null;
    var ch = chromeOf(f);
    var font = fontOf(f.control);
    var minCtl = parseFloat(getComputedStyle(f.control).minWidth) || 0;
    var need = textW(font, MULTI[key].placeholder);
    m.opts.forEach(function (o) {
      var t = summaryOf(m, [o.code].concat(m.opts.filter(function (x) { return x !== o; }).map(function (x) { return x.code; })));
      need = Math.max(need, textW(font, t) + ch.gap + minCtl);
    });
    return Math.ceil(ch.w + need);
  }
  /* Тип и приоритет — одной ширины, по большему из них (решение человека 30.10.2026).
     Поиск тянется, но не шире двух этих полей с зазором между ними и не уже
     своего плейсхолдера с обвязкой поля (иконка, информер). */
  function fit(root) {
    var s = root && st(root);
    if (!s) return;
    var needs = [needOf(s.types, 'types'), needOf(s.priority, 'priority')];
    var hidden = needs.indexOf(false) >= 0 || !shown(s.f.search);
    if (!hidden && needs.indexOf(null) < 0) {
      var w = Math.max(needs[0], needs[1]);
      s.types.f.inp.style.width = w + 'px';
      s.priority.f.inp.style.width = w + 'px';
      var gap = parseFloat(getComputedStyle(root).columnGap) || 0;
      var f = s.f.search;
      var min = Math.ceil(chromeOf(f).w + textW(fontOf(f.control), f.control.placeholder));
      var max = 2 * w + gap;
      f.inp.style.maxWidth = max + 'px';
      f.inp.style.minWidth = Math.min(min, max) + 'px';
    }
    /* поле ещё не видно (витрина в скрытом табе, таблица в «Загрузке») — досчитать при показе */
    if (hidden && window.ResizeObserver && !s.fitRO) {
      s.fitRO = new ResizeObserver(function () {
        if (root.getBoundingClientRect().width) { s.fitRO.disconnect(); s.fitRO = null; fit(root); }
      });
      s.fitRO.observe(root);
    }
  }

  /* ---------- smartSearch ---------- */
  function onSearchInput(root) {
    var s = st(root);
    clearTimeout(s.searchT);
    s.searchT = setTimeout(function () {
      var v = s.f.search.control.value.trim();
      if (v && v.length < MIN_SEARCH) return;
      if (v === s.search) return;
      s.search = v;
      emit(root);
    }, DEBOUNCE);
  }

  /* Список закрылся (выбор, клик мимо, Esc) — набранный запрос стирается. */
  function watchClose(list, onClose) {
    new MutationObserver(function () {
      var open = list.classList.contains('is-open');
      if (list.__ffOpen && !open) onClose();
      list.__ffOpen = open;
    }).observe(list, { attributes: true, attributeFilter: ['class'] });
  }

  function fieldOf(root, name) {
    var inp = root.querySelector('[data-ff-field="' + name + '"]');
    return {
      inp: inp,
      field: inp.querySelector('.inp__field'),
      control: inp.querySelector('.inp__control'),
      list: inp.querySelector('.ddl'),
      api: null
    };
  }

  function wireMulti(root, key) {
    var m = st(root)[key], f = m.f;
    var D = window.DSDropdownList;
    if (D) f.api = D.bind(f.field, { list: f.list, multiple: true, onToggle: function (it) { onToggle(root, key, it); } });
    f.control.addEventListener('input', function () {
      renderList(root, key, f.control.value.trim());
      if (f.api) f.api.open();
    });
    /* крестик поля стирает набранный запрос; выбор снимается в списке (чекбоксы, «Выбрать всё») */
    f.inp.addEventListener('ds-input:clear', function () { renderList(root, key, ''); });
    watchClose(f.list, function () {
      if (f.control.value) { f.control.value = ''; syncInp(f.inp); }
      renderList(root, key, '');
    });
  }

  function wire(root) {
    var s = st(root), f = s.f;
    f.search.control.addEventListener('input', function () { onSearchInput(root); });
    f.search.inp.addEventListener('ds-input:clear', function () {
      clearTimeout(s.searchT);
      if (s.search !== '') { s.search = ''; emit(root); }
    });
    wireMulti(root, 'types');
    wireMulti(root, 'priority');
    /* SB Sans догружается после init — ширина пересчитывается по настоящему шрифту */
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { fit(root); });
  }

  /* Подсказка информера — своя разметка .tip рядом с кнопкой (текст со строками атрибутов,
     у data-tooltip текст только строкой). Привязка с явным tip: DSTooltip.bind ставит
     тултипу уникальный id и aria-describedby кнопке — у каждой копии виджета свой. */
  function bindTip(root) {
    var btn = root.querySelector('[data-ff-tip]');
    var tip = btn && btn.closest('.tip-anchor') && btn.closest('.tip-anchor').querySelector('.tip');
    if (btn && tip && window.DSTooltip) window.DSTooltip.bind(btn, { tip: tip });
  }

  /* ---------- API ---------- */
  function init(root, opts) {
    if (!root) return;
    opts = opts || {};
    var fresh = !root.__fundsFilters;
    if (fresh) {
      root.__fundsFilters = {
        f: { search: fieldOf(root, 'smartSearch') },
        types: { f: fieldOf(root, MULTI.types.field), sel: [] },
        priority: { f: fieldOf(root, MULTI.priority.field), sel: [] },
        search: '', searchT: null
      };
    }
    var s = st(root);
    s.types.labels = opts.types || {};
    s.priority.labels = opts.priorities || {};
    s.types.opts = entries(s.types.labels);
    s.priority.opts = entries(s.priority.labels);
    s.search = '';
    s.f.search.control.value = '';
    if (fresh) wire(root);
    setSel(root, 'types', []);
    setSel(root, 'priority', []);
    syncInp(s.f.search.inp);
    bindTip(root);
    apply(root);
    fit(root);
  }

  function setDisabled(root, off) {
    var s = root && st(root);
    if (!s) return;
    off = !!off;
    s.disabled = off;
    [s.f.search, s.types.f, s.priority.f].forEach(function (f) {
      if (off && f.api) f.api.close();
      f.inp.classList.toggle('inp--disabled', off);
      f.control.disabled = off;
      Array.prototype.forEach.call(f.inp.querySelectorAll('button'), function (b) { b.disabled = off; });
      /* поле-триггер списка фокусируется само (tabindex от DSDropdownList) — выключенное из обхода убирается */
      if (f.api) {
        f.field.setAttribute('tabindex', off ? '-1' : '0');
        f.field.setAttribute('aria-disabled', String(off));
      }
    });
  }

  function value(root) { var s = root && st(root); return s ? detail(s) : null; }

  function setValue(root, filters, o) {
    var s = root && st(root);
    if (!s) return;
    filters = filters || {};
    s.search = filters.smartSearch || '';
    s.f.search.control.value = s.search;
    syncInp(s.f.search.inp);
    setSel(root, 'types', filters.typeCodes);
    setSel(root, 'priority', filters.priorityCodes);
    if (!(o && o.silent)) emit(root);
  }

  window.FundsFilters = { init: init, fit: fit, setDisabled: setDisabled, value: value, setValue: setValue };
})();
