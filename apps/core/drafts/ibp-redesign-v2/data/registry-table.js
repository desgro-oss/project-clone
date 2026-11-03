/* =========================================================================
   registry-table.js — общий рендер реестров концепта ibp-redesign-v2.

   Пары во фронтенде нет: это общий код таблиц-виджетов (MS0014a, правило
   имён 8). Его зовут виджеты с именами фронтенда — пять реестров сделок
   (V2BindingOpportunitiesTable, V2PossibleOpportunitiesTable,
   V2OpportunitySalesProjectsTable, V2SalesCampaignsTable,
   V2OpportunitiesPipelineTable), V2LeadsTable, V2MyClientsTable, V2TasksTable,
   V2MeetingsProtocolsList, V2SimpleSettingsTable. Копий кода по виджетам нет.

   Что делает (всё на компонентах ДС, свой CSS не нужен):
   - шапка и строки таблицы (Table, TableCell) по конфигу колонок;
   - вкладка — подфильтр одной таблицы (Р4): строки отбирает функция rows(tab);
   - фильтр TableFilter + модалка .tfm (разделы — поля конфига), чип
     «Применено: N», крестик чипа сбрасывает всё; фильтр отбирает строки
     подстрокой по значению поля;
   - пагинация — DSPagination.row({ pager }) из кода: автоподключение по
     разметке data-pagination в ДС 1.x не передаёт data-total в пейджер
     (buildFooter → buildRow берёт o.pager), поэтому только из кода;
   - пустое состояние тела — .dtable__empty;
   - «Краткий отчет» — Toast «Файл выгружен» (MS0014 §3).

   API: window.IBPR_TABLE
     mount(host, opts) → handle { setTab, tab, refresh, rows, select }
     get(host) → handle | null
     chip(label, { tone, icon, marker }) → разметка чипа ДС (маркер вместо иконки)
     headCell(col, pinned, pinnable, dir) → единая разметка шапки TableCell для
                  всех реестров; pinnable — тогл закрепления .th__pin (TablePin ДС);
                  dir — 'asc' | 'desc': колонка уже отсортирована
     tabs(tabsEl, handle, tabsCfg, onChange) — вкладки ↔ handle ↔ ?tab=<страница фронтенда>
   opts:
     id         — уникальный ключ таблицы (id модалки фильтра)
     columns    — [{ key, label, type, align?, width?, sort?, sortValue?, hideLabel? }]
                  hideLabel скрывает подпись шапки, сохраняя имя в настройках
                  или fn(tab); sortValue(row) — ключ сортировки колонки
                  (ранг вместо подписи)
     rows       — fn(tab) → массив записей
     value      — fn(row, col) → строка значения (по умолчанию row[col.key])
     cell       — fn(row, col, value) → html ячейки или null (тип по умолчанию)
     rowClass   — fn(row) → доп. классы строки
     rowAttrs   — fn(row) → доп. атрибуты строки (строкой)
     filter     — [{ label, key }] поля модалки фильтра: по разделу на поле,
                  в разделе — текстовое поле «… содержит»
     filterSections — [{ title, fields }] или fn(tab) — разделы модалки с
                  полями разных типов (вместо filter); поле — { key, label,
                  type: 'text'|'select'|'multi'|'range', half?, options?,
                  get?, placeholder? }: options — [{ value, label }] или fn;
                  get(row) — значение строки для отбора (по умолчанию —
                  значение колонки key); half — поле в одну колонку сетки.
                  fn(tab) — у каждой вкладки свой набор полей и свои
                  значения фильтра: модалка пересобирается в setTab, значения
                  вкладки возвращаются при возврате на неё. Бейдж раздела в
                  навигации — число заполненных полей (у filter тоже)
     preset     — { key: значение } заполненные поля по умолчанию; fn(tab) —
                  у вкладки свой предфильтр (ставится при первом показе
                  вкладки, снимается в модалке или крестиком чипа)
     pageSize   — 50 по умолчанию
     sort       — { key, dir: 'asc' | 'desc' } — стартовая сортировка: строки
                  упорядочены, шапка колонки показывает направление
     sortAll    — сортировать весь набор (все страницы) по событию 'sort'
                  Table ДС; на .tbl виджета тогда нет data-sort-rows — тот
                  механизм переставляет только строки текущей страницы
     persist    — ключ data-table-persist (строка или fn(tab) — свой ключ
                  у вкладки с другим набором колонок): вид таблицы (колонки
                  из «Настройки таблицы» ДС, сортировка) живёт в sessionStorage рантайма
                  TableSettings; рендер ставит новый корень .tbl и возвращает
                  вид штатным DSTableSettings.restore — как реестр лидов
     tab        — начальная вкладка
     rowTail    — fn(row) → html после замыкающего разделителя строки
                  (скрытые действия .tc__hidden — по наведению на строку)
     onRowClick — fn(row, rowEl) — выбор строки (предпросмотр)
     pinned     — [ключи колонок], закреплённых при открытии; по умолчанию —
                  первая колонка. В шапке у каждой колонки тогл .th__pin
     emptyText  — подпись пустого состояния; [data-rt-empty-only] внутри
                  пустого блока видны только без применённого фильтра
     compact    — { title, actions? } компактный режим таблицы-тайла (вкладка
                  «Сделки» клиента): заголовок .dtable__title вместо фильтра,
                  actions — разметка кнопок справа вместо «Краткого отчета»,
                  таблица не тянется на высоту экрана, по 10 строк
   ========================================================================= */
(function () {
  'use strict';

  var handles = [];

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* Чип ДС: тон — модификатор chip--<tone>, иконка — в слоте .chip__icon;
     rounded — статусный чип (статусные чипы ДС всегда скруглённые). */
  function chip(label, o) {
    o = o || {};
    return '<span class="chip chip--s chip--fit' + (o.rounded ? ' chip--rounded' : '') + (o.tone ? ' chip--' + o.tone : '') + '">'
      + (o.marker ? '<span class="chip__marker" aria-hidden="true"><i data-icon="circle-filled"></i></span>' : o.icon ? '<span class="chip__icon" aria-hidden="true"><i data-icon="' + o.icon + '"></i></span>' : '')
      + '<span class="chip__label">' + esc(label) + '</span></span>';
  }

  /* Ширины колонок по типу: fr — резиновые текстовые, px — компактные. */
  /* text — от 180px: в шапке у каждой колонки два инструмента (закрепление и
     сортировка: 16 + 6 + 16px, ещё 6px до подписи, поля 16 + 16px — подписи
     остаётся ширина минус 76px), и подпись в одно слово («Исполнитель»,
     «Макроотрасль») не должна рваться посреди слова. chip — 160px по той же
     причине («Приоритет»); icon-actions — 110px: «Действия» рвалась и при 96. */
  var WIDTH = {
    'id-link': '120px', text: 'minmax(180px,1.4fr)', wide: 'minmax(200px,2fr)',
    chip: '160px', chips: 'minmax(170px,1fr)', bool: '96px', 'icon-actions': '110px', muted: '130px'
  };
  function colWidth(col) {
    if (col.width) return col.width;
    if (col.align === 'right') return '150px';
    return WIDTH[col.type] || WIDTH.text;
  }
  function gridFor(cols) {
    return ['8px'].concat(cols.map(colWidth)).concat(['minmax(8px,1fr)']).join(' ');
  }

  /* Состояние сортировки в разметке — как его рисует Table ДС (глиф, aria-sort,
     .th--sorted); data-sort-dir — направление для следующего клика: рантайм
     читает aria-sort только при первом подключении таблицы, а не после
     перерисовки шапки. */
  var SORT_GLYPH = { asc: 'arrow-narrow-up', desc: 'arrow-narrow-down' };
  var SORT_ARIA = { asc: 'ascending', desc: 'descending' };
  var SORT_LABEL = { asc: 'Сортировка от меньшего к большему', desc: 'Сортировка от большего к меньшему' };

  function headCell(col, pinned, pinnable, dir) {
    var sortable = col.type !== 'icon-actions' && col.sort !== false;
    var sorted = sortable && SORT_GLYPH[dir] ? dir : null;
    var cls = 'th' + (pinned ? ' th--pinned' : '') + (col.align === 'right' ? ' th--right' : '') + (col.type === 'icon-actions' ? ' th--center' : '') + (sorted ? ' th--sorted' : '');
    /* Тогл закрепления — штатный .th__pin TableCell: клик обслуживает TablePin ДС
       (фон Pinned, pin ↔ pin-filled, aria-pressed, событие columnpin). */
    var pin = pinnable && col.type !== 'icon-actions'
      ? '<button class="ibtn ibtn--neutral ibtn--s th__pin" aria-pressed="' + (pinned ? 'true' : 'false') + '" aria-label="' + (pinned ? 'Открепить колонку' : 'Закрепить колонку') + '"><i data-icon="' + (pinned ? 'pin-filled' : 'pin') + '"></i></button>'
      : '';
    var sort = !sortable ? '' : sorted
      ? '<button class="ibtn ibtn--neutral ibtn--s th__sort is-sorted" data-sort="' + esc(col.key) + '" data-sort-dir="' + sorted + '" aria-label="' + SORT_LABEL[sorted] + '"><i data-icon="' + SORT_GLYPH[sorted] + '"></i></button>'
      : '<button class="ibtn ibtn--neutral ibtn--s th__sort" data-sort="' + esc(col.key) + '" aria-label="Сортировать"><i data-icon="arrow-up-down"></i></button>';
    return '<div class="' + cls + '" data-col="' + esc(col.key) + '"' + (col.sortType ? ' data-sort-type="' + esc(col.sortType) + '"' : '') + (sortable ? ' aria-sort="' + (sorted ? SORT_ARIA[sorted] : 'none') + '"' : '') + '>'
      + '<span class="th__label"' + (col.hideLabel ? ' hidden' : '') + '>' + esc(col.label) + '</span>'
      + (pin || sort ? '<span class="th__tools">' + pin + sort + '</span>' : '')
      + '<span class="th__resize" role="separator" aria-orientation="vertical" tabindex="0" aria-label="Изменить ширину колонки"></span></div>';
  }

  function defaultCell(row, col, v, first) {
    var cls = 'tc' + (first ? ' tc--pinned' : '') + (col.align === 'right' ? ' tc--numbers' : '') + (col.type === 'icon-actions' ? ' tc--center' : '');
    var empty = v == null || v === '' || v === '–';
    var body;
    if (col.type === 'chip') {
      body = empty ? '<span class="tc__text tc__empty">–</span>' : chip(v);
    } else if (col.type === 'chips') {
      var list = Array.isArray(v) ? v : [];
      body = list.length ? list.map(function (l) { return chip(l); }).join('') : '<span class="tc__text tc__empty">–</span>';
    } else if (col.type === 'bool') {
      body = '<span class="tc__text' + (v ? '' : ' tc__empty') + '">' + (v ? 'Да' : 'Нет') + '</span>';
    } else {
      var muted = col.type === 'muted' || empty;
      body = '<span class="tc__text tc__text--truncate' + (muted ? ' tc__empty' : '') + '">' + (empty ? '–' : esc(v)) + '</span>';
    }
    return '<div class="' + cls + '" data-col="' + esc(col.key) + '"><span class="tc__row">' + body + '</span></div>';
  }

  /* ── Модалка фильтра .tfm ──────────────────────────────────────────── */
  /* Разделы модалки: filterSections (поля разных типов) или — у реестров со
     старым конфигом filter — по разделу на поле с одним текстовым полем
     «… содержит». Значения фильтра — по ключу поля: st.values[key]. */
  /* Предфильтр вкладки: значения opts.preset по ключам её полей. */
  function presetFor(st) {
    var p = typeof st.opts.preset === 'function' ? st.opts.preset(st.tab) : st.opts.preset;
    var v = {};
    if (p) st.fields.forEach(function (f) { if (p[f.key] != null) v[f.key] = Array.isArray(p[f.key]) ? p[f.key].slice() : p[f.key]; });
    return v;
  }
  function sectionsFor(st) {
    var fs = st.opts.filterSections;
    if (fs) return (typeof fs === 'function' ? fs(st.tab) : fs) || [];
    return (st.opts.filter || []).map(function (f) {
      return { title: f.label, fields: [{ key: f.key, label: f.label + ' содержит', type: 'text', placeholder: 'Любое значение' }] };
    });
  }
  function optionsOf(f) {
    var o = typeof f.options === 'function' ? f.options() : (f.options || []);
    return o.map(function (x) { return typeof x === 'string' ? { value: x, label: x } : x; });
  }
  function ddlItem(o, multi) {
    return '<button type="button" class="ddl__item' + (multi ? ' ddl__item--checkbox' : '') + '" role="option" ' + (multi ? 'aria-checked' : 'aria-selected') + '="false" data-value="' + esc(o.value) + '">'
      + (multi ? '<span class="ddl__item-check"><span class="cb__box"><span class="cb__mark">' + CHECK_MARK + '</span></span></span>' : '')
      + '<span class="ddl__item-body"><span class="ddl__item-label">' + esc(o.label) + '</span></span></button>';
  }
  /* Поле по типу: text — InputText; select — InputAutocomplete с одиночным
     выбором; multi — InputAutocomplete с чекбоксами и внешним стеком чипов
     .inp-ext; range — InputAmountRange «От / До». half — поле в одну колонку
     сетки .tfm__grid, остальные — на всю ширину (.tfm__span-2). */
  function fieldHtml(f, id) {
    var span = f.half ? '' : ' tfm__span-2';
    var lbl = '<label class="ds-label" for="' + id + '"><span class="ds-label__text">' + esc(f.label) + '</span></label>';
    var attrs = ' data-rt-key="' + esc(f.key) + '" data-rt-type="' + (f.type || 'text') + '"';
    if (f.type === 'range') {
      var half = function (pre, data, aria) {
        return '<div class="inp inp--m inp-range__field"><div class="inp__field"><span class="inp__prefix">' + pre + '</span><input class="inp__control" inputmode="decimal" autocomplete="off"' + (data === 'from' ? ' id="' + id + '"' : '') + ' data-rt-' + data + ' aria-label="' + esc(f.label + ', ' + aria) + '"></div></div>';
      };
      return '<div class="inp-range' + span + '"' + attrs + '>' + lbl + '<div class="inp-range__row">' + half('От', 'from', 'от') + '<span class="inp-range__line" aria-hidden="true"></span>' + half('До', 'to', 'до') + '</div></div>';
    }
    if (f.type === 'select' || f.type === 'multi') {
      var multi = f.type === 'multi';
      return '<div class="inp inp--m' + span + '"' + attrs + '>' + lbl
        + '<div class="inp__field" role="combobox" aria-expanded="false" aria-controls="' + id + '-list" aria-haspopup="listbox"><input class="inp__control" id="' + id + '" autocomplete="off"' + (multi ? ' placeholder="Поиск…"' : '') + '>'
        + '<span class="inp__acts"><button type="button" class="inp__act inp__act--chev" aria-label="Показать список"><i data-icon="chevron-down"></i></button></span></div>'
        + '<div class="ddl ddl--floating ddl--scroll" id="' + id + '-list" role="listbox"' + (multi ? ' aria-multiselectable="true"' : '') + ' aria-label="' + esc(f.label) + '">'
        + optionsOf(f).map(function (o) { return ddlItem(o, multi); }).join('') + '</div>'
        + (multi ? '<div class="inp-ext" role="group" aria-label="' + esc('Выбрано: ' + f.label) + '" hidden></div>' : '')
        + '</div>';
    }
    return '<div class="inp inp--m' + span + '"' + attrs + '>' + lbl + '<div class="inp__field"><input class="inp__control" id="' + id + '" autocomplete="off"' + (f.placeholder ? ' placeholder="' + esc(f.placeholder) + '"' : '') + '></div></div>';
  }
  var CHECK_MARK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>';

  /* Чтение и запись поля модалки. Значение: text/select — строка, multi —
     массив значений, range — { from, to } (числа; пустая граница — null). */
  function num(v) {
    var t = String(v || '').replace(/[\s ]/g, '').replace(',', '.');
    return t === '' || isNaN(Number(t)) ? null : Number(t);
  }
  function readField(root) {
    var type = root.getAttribute('data-rt-type');
    if (type === 'range') {
      var from = num(root.querySelector('[data-rt-from]').value), to = num(root.querySelector('[data-rt-to]').value);
      return from == null && to == null ? null : { from: from, to: to };
    }
    if (type === 'select') return root.__rtValue || typedValue(root);
    if (type === 'multi') {
      var on = [];
      root.__rtList.querySelectorAll('.ddl__item[aria-checked="true"]').forEach(function (it) { on.push(it.getAttribute('data-value')); });
      return on.length ? on : null;
    }
    var v = root.querySelector('.inp__control').value.trim();
    return v || null;
  }
  /* Набранный в поле выбора текст, совпавший с подписью опции (без учёта
     регистра), — это выбор этой опции, даже без клика по строке списка. */
  function typedValue(root) {
    var q = root.querySelector('.inp__control').value.trim().toLowerCase();
    if (!q) return null;
    var hit = Array.prototype.filter.call(root.__rtList.querySelectorAll('.ddl__item'), function (it) {
      return it.querySelector('.ddl__item-label').textContent.trim().toLowerCase() === q;
    })[0];
    return hit ? hit.getAttribute('data-value') : null;
  }
  function markSelected(list, v) {
    list.querySelectorAll('.ddl__item').forEach(function (it) {
      it.setAttribute('aria-selected', v != null && it.getAttribute('data-value') === String(v) ? 'true' : 'false');
    });
  }
  function writeField(root, v) {
    var type = root.getAttribute('data-rt-type');
    if (type === 'range') {
      root.querySelector('[data-rt-from]').value = v && v.from != null ? String(v.from) : '';
      root.querySelector('[data-rt-to]').value = v && v.to != null ? String(v.to) : '';
    } else if (type === 'select') {
      root.__rtValue = v || null;
      var label = '';
      root.__rtList.querySelectorAll('.ddl__item').forEach(function (it) {
        var on = v != null && it.getAttribute('data-value') === String(v);
        it.setAttribute('aria-selected', on ? 'true' : 'false');
        if (on) label = it.querySelector('.ddl__item-label').textContent;
      });
      root.querySelector('.inp__control').value = label;
    } else if (type === 'multi') {
      var set = v || [];
      root.__rtList.querySelectorAll('.ddl__item').forEach(function (it) {
        it.setAttribute('aria-checked', set.indexOf(it.getAttribute('data-value')) >= 0 ? 'true' : 'false');
      });
      root.querySelector('.inp__control').value = '';
      renderExt(root);
    } else {
      root.querySelector('.inp__control').value = v || '';
    }
  }
  /* Внешний стек чипов под полем: чип — выбранное значение, крестик снимает
     отметку в списке. */
  function renderExt(root) {
    var ext = root.querySelector('.inp-ext');
    var on = root.__rtList.querySelectorAll('.ddl__item[aria-checked="true"]');
    ext.innerHTML = Array.prototype.map.call(on, function (it) {
      var l = it.querySelector('.ddl__item-label').textContent;
      return '<span class="chip chip--edit chip--s" tabindex="0" data-value="' + esc(it.getAttribute('data-value')) + '"><span class="chip__label">' + esc(l) + '</span>'
        + '<span class="chip__remove" role="button" aria-label="' + esc('Удалить ' + l) + '"><i data-icon="close"></i></span></span>';
    }).join('');
    ext.hidden = !on.length;
    if (window.dsIcons) window.dsIcons.apply(ext);
  }
  /* Поиск по списку: набранный текст оставляет опции, где он встречается. */
  function filterList(list, q) {
    q = q.trim().toLowerCase();
    list.querySelectorAll('.ddl__item').forEach(function (it) {
      it.hidden = !!q && it.querySelector('.ddl__item-label').textContent.toLowerCase().indexOf(q) < 0;
    });
  }
  function bindPicker(root, onChange) {
    var field = root.querySelector('.inp__field'), control = root.querySelector('.inp__control');
    var list = root.querySelector('.ddl');
    var multi = root.getAttribute('data-rt-type') === 'multi';
    root.__rtList = list; /* открытый список уезжает в скрим модалки (DSFloat) — держим ссылку */
    if (!window.DSDropdownList) return;
    var api = window.DSDropdownList.bind(field, {
      list: list, multiple: multi,
      onSelect: multi ? null : function (item) {
        writeField(root, item.getAttribute('data-value'));
        filterList(list, '');
        onChange();
      },
      onToggle: multi ? function () { renderExt(root); onChange(); } : null
    });
    control.addEventListener('input', function () {
      if (!multi) { root.__rtValue = typedValue(root); markSelected(list, root.__rtValue); }
      filterList(list, control.value);
      if (api && !api.isOpen()) api.open(); else if (api) api.place();
      onChange();
    });
    root.addEventListener('ds-input:clear', function () {
      if (multi) writeField(root, null); else { root.__rtValue = null; markSelected(list, null); }
      filterList(list, '');
      onChange();
    });
    if (multi) root.querySelector('.inp-ext').addEventListener('click', function (e) {
      var rm = e.target.closest('.chip__remove');
      if (!rm) return;
      e.stopPropagation();
      var chip = rm.closest('.chip');
      var it = list.querySelector('.ddl__item[data-value="' + chip.getAttribute('data-value').replace(/"/g, '\\"') + '"]');
      if (it) it.setAttribute('aria-checked', 'false');
      renderExt(root);
      onChange();
    });
  }

  function buildFilter(st) {
    var sid = 'rt-filter-' + st.id;
    var old = document.getElementById(sid);
    if (old) old.remove();
    st.sections = sectionsFor(st);
    st.fields = [];
    st.sections.forEach(function (sec) { sec.fields.forEach(function (f) { st.fields.push(f); }); });
    var nav = st.sections.map(function (sec, i) {
      return '<button type="button" class="tab tab--m tab--vert' + (i === 0 ? ' tab--selected' : '') + '" aria-current="' + (i === 0 ? 'true' : 'false') + '" data-target="' + sid + '-s' + i + '"><span class="tab__label">' + esc(sec.title) + '</span><span class="tab__badge" data-rt-badge="' + i + '" hidden></span></button>';
    }).join('');
    var n = 0;
    var panel = st.sections.map(function (sec, i) {
      return '<section class="tfm__sec" id="' + sid + '-s' + i + '" data-rt-sec="' + i + '"><h4 class="tfm__sec-title">' + esc(sec.title) + '</h4>'
        + '<div class="tfm__grid">' + sec.fields.map(function (f) { return fieldHtml(f, sid + '-f' + (n++)); }).join('') + '</div></section>';
    }).join('');
    var scrim = document.createElement('div');
    scrim.className = 'modal-scrim';
    scrim.id = sid;
    scrim.hidden = true;
    scrim.innerHTML = '<div class="modal modal--w6 tfm" role="dialog" aria-modal="true" aria-labelledby="' + sid + '-title">'
      + '<header class="modal__head"><h2 class="modal__title" id="' + sid + '-title">Фильтр</h2>'
      + '<button type="button" class="ibtn ibtn--neutral ibtn--l" data-modal-close aria-label="Закрыть"><i data-icon="close"></i></button></header>'
      + '<div class="modal__body modal__body--flush"><div class="tfm__body">'
      + '<nav class="tabs tabs--vert tfm__nav" aria-label="Разделы фильтра">' + nav + '</nav>'
      + '<div class="tfm__panel">' + panel + '</div></div></div>'
      + '<footer class="modal__foot"><div class="modal__foot-right">'
      + '<button type="button" class="btn btn--transparent btn--m" data-rt-clear><span class="btn__label">Очистить фильтр</span></button>'
      + '<button type="button" class="btn btn--accent btn--m" data-rt-apply><span class="btn__label">Применить</span></button>'
      + '</div></footer></div>';
    document.body.appendChild(scrim);
    st.scrim = scrim;
    var badges = function () { updateBadges(st); };
    scrim.querySelectorAll('[data-rt-type="select"], [data-rt-type="multi"]').forEach(function (root) { bindPicker(root, badges); });
    scrim.querySelectorAll('[data-rt-type="text"] .inp__control, [data-rt-type="range"] .inp__control').forEach(function (inp) {
      inp.addEventListener('input', badges);
    });
    scrim.addEventListener('ds-input:clear', function () { setTimeout(badges, 0); });
    scrim.querySelectorAll('.tfm__nav .tab').forEach(function (t) {
      t.addEventListener('click', function () {
        scrim.querySelectorAll('.tfm__nav .tab').forEach(function (x) { x.classList.remove('tab--selected'); x.setAttribute('aria-current', 'false'); });
        t.classList.add('tab--selected'); t.setAttribute('aria-current', 'true');
        var sec = document.getElementById(t.getAttribute('data-target'));
        var body = scrim.querySelector('.modal__body');
        if (sec && body) body.scrollTo({ top: body.scrollTop + sec.getBoundingClientRect().top - body.getBoundingClientRect().top - 16, behavior: 'smooth' });
      });
    });
    scrim.querySelector('[data-rt-apply]').addEventListener('click', function () {
      st.values = {};
      scrim.querySelectorAll('[data-rt-key]').forEach(function (root) {
        var v = readField(root);
        if (v != null) st.values[root.getAttribute('data-rt-key')] = v;
      });
      if (window.DSModal) window.DSModal.closeTop();
      st.page = 1;
      render(st);
    });
    scrim.querySelector('[data-rt-clear]').addEventListener('click', function () {
      scrim.querySelectorAll('[data-rt-key]').forEach(function (root) { writeField(root, null); });
      if (window.DSInput && window.DSInput.syncAll) window.DSInput.syncAll(scrim);
      updateBadges(st);
    });
    if (window.dsIcons) window.dsIcons.apply(scrim);
  }

  /* Бейдж раздела — число заполненных параметров раздела (0 — бейджа нет). */
  function updateBadges(st) {
    if (!st.scrim) return;
    st.scrim.querySelectorAll('[data-rt-sec]').forEach(function (sec) {
      var n = 0;
      sec.querySelectorAll('[data-rt-key]').forEach(function (root) { if (readField(root) != null) n++; });
      var b = st.scrim.querySelector('[data-rt-badge="' + sec.getAttribute('data-rt-sec') + '"]');
      b.textContent = n;
      b.hidden = !n;
    });
  }

  function syncFilterInputs(st) {
    if (!st.scrim) return;
    st.scrim.querySelectorAll('[data-rt-key]').forEach(function (root) {
      writeField(root, st.values[root.getAttribute('data-rt-key')]);
      if (root.__rtList) filterList(root.__rtList, '');
    });
    if (window.DSInput && window.DSInput.syncAll) window.DSInput.syncAll(st.scrim);
    updateBadges(st);
  }

  function renderBar(st) {
    var bar = st.host.querySelector('[data-rt-filter]');
    if (!bar) return;
    var n = Object.keys(st.values).length;
    var h = '<button class="btn btn--outline btn--s tfilter__open" aria-haspopup="dialog" aria-expanded="false" data-modal="rt-filter-' + st.id + '"><i data-icon="filter"></i><span class="btn__label">Фильтр</span></button>';
    if (n) h += '<span class="chip chip--edit chip--m tfilter__applied" tabindex="0"><span class="chip__label">Применено: ' + n + '</span><span class="chip__remove" role="button" aria-label="Сбросить все фильтры"><i data-icon="close"></i></span></span>';
    bar.innerHTML = h;
    var rm = bar.querySelector('.chip__remove');
    if (rm) rm.addEventListener('click', function (e) {
      e.stopPropagation();
      st.values = {};
      st.page = 1;
      render(st);
    });
    bar.querySelector('.tfilter__open').addEventListener('click', function () { syncFilterInputs(st); });
    if (window.DSModal) window.DSModal.bindAll(bar);
    if (window.dsIcons) window.dsIcons.apply(bar);
  }

  /* ── Отбор, страница, отрисовка ─────────────────────────────────────── */
  function valueOf(st, row, col) {
    return st.opts.value ? st.opts.value(row, col) : row[col.key];
  }
  /* Отбор: text — подстрока, select — равенство, multi — хотя бы одно из
     выбранных, range — число в границах. Значение строки — f.get(row) или
     значение колонки с тем же ключом. */
  function matches(st, row, f, want) {
    var v = f.get ? f.get(row) : valueOf(st, row, f);
    var list = (Array.isArray(v) ? v : [v]).map(function (x) { return x == null ? '' : String(x); });
    if (f.type === 'range') {
      var n = Number(v);
      if (v == null || v === '' || isNaN(n)) return false;
      return (want.from == null || n >= want.from) && (want.to == null || n <= want.to);
    }
    if (f.type === 'select') return list.indexOf(String(want)) >= 0;
    if (f.type === 'multi') return want.some(function (w) { return list.indexOf(String(w)) >= 0; });
    return list.join(' ').toLowerCase().indexOf(String(want).toLowerCase()) >= 0;
  }
  function filtered(st) {
    var rows = st.opts.rows(st.tab) || [];
    var keys = Object.keys(st.values);
    if (!keys.length) return rows;
    var byKey = {};
    (st.fields || []).forEach(function (f) { byKey[f.key] = f; });
    return rows.filter(function (row) {
      return keys.every(function (k) { return !byKey[k] || matches(st, row, byKey[k], st.values[k]); });
    });
  }

  /* Порядок всего набора по st.sort: число — по значению (sortType 'number'),
     остальное — строкой по-русски; пустые всегда внизу, как у Table ДС. */
  function sorted(st, rows, cols) {
    var s = sortFor(st, cols);
    var col = s && SORT_GLYPH[s.dir] && cols.filter(function (c) { return c.key === s.key; })[0];
    if (!col) return rows;
    var sign = s.dir === 'desc' ? -1 : 1;
    function blank(v) { return v == null || v === '' || v === '–'; }
    return rows.map(function (row, i) {
      var v = col.sortValue ? col.sortValue(row) : valueOf(st, row, col);
      return { row: row, i: i, v: Array.isArray(v) ? v.join(', ') : v };
    }).sort(function (a, b) {
      var ea = blank(a.v), eb = blank(b.v);
      if (ea || eb) return ea === eb ? a.i - b.i : (ea ? 1 : -1);
      var d = col.sortType === 'number' ? Number(a.v) - Number(b.v) : String(a.v).localeCompare(String(b.v), 'ru', { numeric: true });
      return d ? d * sign : a.i - b.i;
    }).map(function (x) { return x.row; });
  }

  /* Сортировка вкладки: колонки, по которой сортировали на другой вкладке,
     здесь может не быть — тогда стартовая сортировка (opts.sort), а
     st.sort остаётся до возврата на ту вкладку. */
  function sortFor(st, cols) {
    var s = st.sort;
    if (s && cols.some(function (c) { return c.key === s.key; })) return s;
    return st.opts.sort || null;
  }

  function persistKey(st) {
    return typeof st.opts.persist === 'function' ? st.opts.persist(st.tab) : st.opts.persist;
  }

  function render(st) {
    var host = st.host;
    var cols = typeof st.opts.columns === 'function' ? st.opts.columns(st.tab) : st.opts.columns;
    var grid = gridFor(cols);
    var all = sorted(st, filtered(st), cols);
    var size = st.pageSize === 'all' ? all.length || 1 : st.pageSize;
    var pages = Math.max(1, Math.ceil(all.length / size));
    if (st.page > pages) st.page = pages;
    var slice = all.slice((st.page - 1) * size, st.page * size);
    st.shown = slice;

    var tbl = host.querySelector('[data-rt-tbl]');
    if (st.opts.persist) {
      /* Снимок «Настройки таблицы» ДС держит ссылки на ячейки и шапку старого
         корня: перерисованный на месте корень оборвал бы их. Новый корень
         (атрибуты те же) получает вид таблицы из хранилища ниже. */
      var fresh = tbl.cloneNode(false);
      fresh.setAttribute('data-table-persist', persistKey(st));
      tbl.replaceWith(fresh);
      tbl = fresh;
    }
    var empty = host.querySelector('[data-rt-empty]');
    var h = '<div class="tbl__row tbl__row--head" style="grid-template-columns:' + grid + '"><div class="th th--separator"></div>'
      + cols.map(function (c) { var so = sortFor(st, cols); return headCell(c, st.pinned.has(c.key), true, so && so.key === c.key ? so.dir : null); }).join('')
      + '<div class="th th--separator"></div></div>';
    h += slice.map(function (row, ri) {
      var extra = st.opts.rowClass ? st.opts.rowClass(row) : '';
      var attrs = st.opts.rowAttrs ? st.opts.rowAttrs(row) : '';
      var sel = st.selected != null && String(st.selected) === String(row.id) ? ' tbl__row--selected' : '';
      return '<div class="tbl__row' + (extra ? ' ' + extra : '') + sel + '" data-rt-row="' + ri + '" style="grid-template-columns:' + grid + '"' + (attrs ? ' ' + attrs : '') + '>'
        + '<div class="tc tc--separator"></div>'
        + cols.map(function (c, i) {
          var v = valueOf(st, row, c);
          var custom = st.opts.cell ? st.opts.cell(row, c, v, i === 0) : null;
          return custom != null ? custom : defaultCell(row, c, v, i === 0);
        }).join('')
        + '<div class="tc tc--separator"></div>'
        + (st.opts.rowTail ? st.opts.rowTail(row) || '' : '') + '</div>';
    }).join('');
    tbl.innerHTML = h;
    syncPinned(st, tbl);
    tbl.hidden = !slice.length;
    if (empty) {
      empty.hidden = !!slice.length;
      var et = empty.querySelector('[data-rt-empty-title]');
      var filtering = Object.keys(st.values).length > 0;
      if (et) et.textContent = filtering ? 'Ничего не найдено' : (st.opts.emptyText || 'Записей нет');
      empty.querySelectorAll('[data-rt-empty-only]').forEach(function (x) { x.hidden = filtering; });
    }

    if (st.opts.onRowClick) {
      tbl.querySelectorAll('[data-rt-row]').forEach(function (rowEl) {
        rowEl.addEventListener('click', function (e) {
          if (e.target.closest('a, button')) return;
          var row = st.shown[Number(rowEl.getAttribute('data-rt-row'))];
          st.selected = row.id;
          tbl.querySelectorAll('.tbl__row--selected').forEach(function (r) { r.classList.remove('tbl__row--selected'); });
          rowEl.classList.add('tbl__row--selected');
          st.opts.onRowClick(row, rowEl);
        });
      });
    }

    renderBar(st);
    renderPager(st, all.length);
    if (window.DSTable) window.DSTable.bind(host.querySelector('.dtable__body'));
    if (st.opts.persist && window.DSTable) window.DSTable.wire(tbl);
    if (st.opts.persist && window.DSTableSettings) window.DSTableSettings.restore(tbl);
    if (window.DSModal) window.DSModal.bindAll(tbl);
    if (window.dsIcons) window.dsIcons.apply(host);
    if (window.DSTooltip && window.DSTooltip.bindAll) window.DSTooltip.bindAll(host);
    if (window.DSIllustrations && empty && !empty.hidden) window.DSIllustrations.render();
    if (st.opts.onRender) st.opts.onRender(slice, all);
  }

  function renderPager(st, total) {
    var pg = st.host.querySelector('[data-rt-footer]');
    if (!pg || !window.DSPagination) return;
    pg.innerHTML = '';
    pg.appendChild(window.DSPagination.row({ pager: {
      total: total, page: st.page, pageSize: st.pageSize,
      onChange: function (p) { st.page = p; render(st); },
      onPageSizeChange: function (v) { st.pageSize = v; st.page = 1; render(st); }
    } }));
  }

  /* Компактный режим: заголовок вместо фильтра, свои кнопки вместо отчёта. */
  function compactFrame(host, c) {
    var dt = host.querySelector('.dtable');
    if (dt) dt.classList.remove('dtable--fill');
    var left = host.querySelector('.dtable__toolbar-left');
    if (left) left.innerHTML = '<h3 class="dtable__title">' + esc(c.title || '') + '</h3>';
    var right = host.querySelector('.dtable__toolbar-right');
    if (right) right.innerHTML = c.actions || '';
  }

  /* Закрепление колонок. По умолчанию закреплена первая колонка (решение
     пользователя 21.10.2026); набор закреплённых — по ключу колонки, он
     переживает перерисовку строк (сортировка, фильтр, страница, вкладка).
     Класс .tc--pinned у ячеек ставится здесь по data-col, а не в шаблоне
     ячейки: свои ячейки виджетов тоже его получают и теряют. */
  function syncPinned(st, tbl) {
    tbl.querySelectorAll('.tbl__row:not(.tbl__row--head) > .tc[data-col]').forEach(function (cell) {
      cell.classList.toggle('tc--pinned', st.pinned.has(cell.getAttribute('data-col')));
    });
    if (tbl.__rtPinWired) return;
    tbl.__rtPinWired = true;
    tbl.addEventListener('columnpin', function (e) {
      var head = tbl.querySelector('.tbl__row--head');
      var th = head && head.children[e.detail.column];
      var key = th && th.getAttribute('data-col');
      if (!key) return;
      if (e.detail.pinned) st.pinned.add(key); else st.pinned.delete(key);
    });
  }

  function mount(host, opts) {
    if (!host) return null;
    var exist = get(host);
    if (exist) return exist;
    var st = {
      host: host, opts: opts, id: opts.id || ('t' + handles.length),
      tab: opts.tab, page: 1, pageSize: opts.pageSize || (opts.compact ? 10 : 50), values: {}, selected: null, shown: [],
      sort: opts.sort || null
    };
    var firstCols = typeof opts.columns === 'function' ? opts.columns(opts.tab) : opts.columns;
    /* по умолчанию — первая колонка с данными: колонку кнопок «Действия»
       (icon-actions, без тогла .th__pin) не закрепляем */
    var firstData = (firstCols || []).filter(function (c) { return c.type !== 'icon-actions'; })[0];
    st.pinned = new Set(opts.pinned || (firstData ? [firstData.key] : []));
    if (opts.compact) compactFrame(host, opts.compact);
    buildFilter(st);
    st.values = presetFor(st);
    st.valuesByTab = {};
    /* Table ДС красит шапку и шлёт 'sort'; строки всех страниц упорядочивает
       рендер. restored — сортировку вернуло хранение: страницу не сбрасываем.
       Слушаем на хосте — корень .tbl меняется (persist); рендер — после
       события, когда хранилище TableSettings уже записало новую сортировку,
       иначе восстановление вернуло бы прежнюю. */
    if (opts.sortAll) host.addEventListener('sort', function (e) {
      if (!e.target.matches || !e.target.matches('[data-rt-tbl]')) return;
      st.sort = { key: e.detail.column, dir: e.detail.dir };
      if (!e.detail.restored) st.page = 1;
      setTimeout(function () { render(st); }, 0);
    });
    if (opts.persist) host.querySelector('[data-rt-tbl]').setAttribute('data-table-persist', persistKey(st));
    var rep = host.querySelector('[data-rt-report]');
    if (rep) rep.addEventListener('click', function () {
      if (window.DSToast) window.DSToast.show({ message: 'Файл выгружен' });
    });
    render(st);
    var handle = {
      host: host,
      tab: function () { return st.tab; },
      setTab: function (t) {
        /* у вкладок свой набор полей фильтра (filterSections — fn): модалка
           пересобирается, у каждой вкладки свои значения, при первом показе —
           её предфильтр */
        if (typeof opts.filterSections === 'function') {
          st.valuesByTab[st.tab] = st.values;
          st.tab = t;
          buildFilter(st);
          st.values = st.valuesByTab[t] || presetFor(st);
        } else {
          st.tab = t;
        }
        st.page = 1; st.selected = null;
        render(st);
      },
      refresh: function () { render(st); },
      rows: function () { return st.shown.slice(); },
      select: function (id) { st.selected = id; render(st); }
    };
    handles.push({ host: host, handle: handle });
    return handle;
  }

  function get(host) {
    for (var i = 0; i < handles.length; i++) if (handles[i].host === host) return handles[i].handle;
    return null;
  }

  /* Вкладки реестра: выбор ↔ handle.setTab ↔ ?tab=<имя страницы фронтенда>. */
  function tabs(tabsEl, handle, cfg, onChange) {
    if (!tabsEl || !handle) return;
    function select(id) {
      tabsEl.querySelectorAll('.tab').forEach(function (b) {
        var on = b.getAttribute('data-tab-id') === id;
        b.classList.toggle('tab--selected', on);
        b.setAttribute('aria-selected', on ? 'true' : 'false');
        b.setAttribute('tabindex', on ? '0' : '-1');
      });
    }
    select(handle.tab());
    tabsEl.addEventListener('click', function (e) {
      var b = e.target.closest('.tab');
      if (!b || b.getAttribute('aria-disabled') === 'true') return;
      var id = b.getAttribute('data-tab-id');
      select(id);
      handle.setTab(id);
      var t = cfg.filter(function (x) { return x.id === id; })[0];
      var q = new URLSearchParams(location.search);
      q.set('tab', t && t.page ? t.page : id);
      history.replaceState(null, '', '?' + q.toString());
      if (onChange) onChange(id, t);
    });
    if (onChange) onChange(handle.tab(), cfg.filter(function (x) { return x.id === handle.tab(); })[0]);
  }

  /* Начальная вкладка из ?tab= (имя страницы фронтенда или id вкладки). */
  function tabFromUrl(cfg) {
    var v = new URLSearchParams(location.search).get('tab');
    var t = cfg.filter(function (x) { return x.page === v || x.id === v; })[0];
    return t ? t.id : (cfg[0] && cfg[0].id);
  }

  /* ── Реестры сделок: общий набор пяти виджетов-реестров ─────────────────
     Виджет (V2BindingOpportunitiesTable и др.) несёт data-registry="<id>"
     конфига REGISTRY_CONFIGS; здесь — значения, ячейки и действия. */
  var PRIORITY_TONE = { MAX: 'error', HIGH: 'error', MEDIUM: 'warning', LOW: 'info' };

  function oppValue(o, col) {
    var S = window.IBPR, F = window.DICT_FMT;
    switch (col.key) {
      case 'tbLabel': return S.lbl.terBank(o.terBank);
      case 'priorityLabel': return S.lbl.priority(o.priorityCode);
      case 'statusLabel': return S.lbl.oppStatus(o.statusCode);
      case 'dropoutReasonLabel': return o.dropoutReasonCode ? S.lbl.dropReason(o.dropoutReasonCode) : '';
      case 'totalVolumeLabel': return o.totalVolume != null ? F.money(o.totalVolume) : '';
      case 'keyDeal': case 'growthCompany': case 'didGrowthCompany': case 'topClient': case 'onePager':
        return !!o[col.key];
      default: return o[col.key];
    }
  }

  function opportunities(host, extra) {
    var S = window.IBPR;
    var cfg = S.registryConfig(host.getAttribute('data-registry'));
    if (!cfg) return null;
    extra = extra || {};
    /* компактный режим (вкладка клиента): без действий строк, только сделки клиента */
    var compact = !!extra.compact;
    var clientId = extra.clientId;
    var byLabel = {};
    cfg.columns.forEach(function (c) { byLabel[c.label] = c.key; });
    byLabel['Статус'] = 'statusLabel';
    byLabel['Общий объем по сделке'] = 'totalVolumeLabel';
    var handle = mount(host, Object.assign({
      id: cfg.id,
      tab: tabFromUrl(cfg.tabs),
      columns: function (tab) {
        return cfg.columns.filter(function (c) {
          if (compact && c.type === 'icon-actions') return false;
          return !(cfg.dropoutColumnsOnlyInArchive && tab !== 'archive' && (c.key === 'dropoutReasonLabel' || c.key === 'dropoutComment'));
        });
      },
      rows: function (tab) {
        return S.registry(cfg.id, tab).filter(function (o) { return !clientId || o.clientId === clientId; });
      },
      value: oppValue,
      filter: cfg.filterSections.map(function (l) { return { label: l, key: byLabel[l] || l }; }),
      preset: cfg.defaultPreset,
      rowClass: function (o) { return !o.viewed && o.source !== 'pipeline' ? 'tbl__row--accent' : ''; },
      cell: function (o, col, v, first) {
        if (col.type === 'id-link') {
          var url = window.IBPR_NAV.href('opportunity', { source: o.source, id: o.id, tab: o.tab });
          return '<div class="tc' + (first ? ' tc--pinned' : '') + '" data-col="id"><span class="tc__row"><a class="link link--accent link--m" href="' + url + '" data-opp-link="' + o.id + '">' + o.id + '</a></span></div>';
        }
        if (col.type === 'icon-actions') {
          var can = o.statusCode === 'WORK';
          var acts = '';
          if (can && cfg.rowActions.indexOf('take') >= 0) acts += '<button type="button" class="ibtn ibtn--neutral ibtn--s" aria-label="Взять в работу" data-modal="take-opp-scrim" data-opp="' + o.id + '"><i data-icon="folder-arrow-forward"></i></button>';
          if (can && cfg.rowActions.indexOf('refuse') >= 0) acts += '<button type="button" class="ibtn ibtn--neutral ibtn--s" aria-label="Отказаться" data-modal="refuse-opp-scrim" data-opp="' + o.id + '"><i data-icon="minus-circle"></i></button>';
          return '<div class="tc tc--center" data-col="actions"><div class="tc__controls">' + acts + '</div></div>';
        }
        if (col.key === 'priorityLabel' && v) {
          return '<div class="tc" data-col="priorityLabel"><span class="tc__row">' + chip(v, { tone: PRIORITY_TONE[o.priorityCode] }) + '</span></div>';
        }
        if (col.key === 'totalVolumeLabel') {
          return '<div class="tc tc--numbers" data-col="totalVolumeLabel"' + (o.totalVolume != null ? ' data-sort-value="' + o.totalVolume + '"' : '') + '><span class="tc__row"><span class="tc__text' + (v ? '' : ' tc__empty') + '">' + (v || '–') + '</span></span></div>';
        }
        return null;
      }
    }, extra));
    host.addEventListener('click', function (e) {
      var a = e.target.closest('[data-opp-link]');
      if (a) S.markViewed(a.getAttribute('data-opp-link'));
    });
    handle.config = cfg;
    return handle;
  }

  window.IBPR_TABLE = { priorityTone: PRIORITY_TONE, mount: mount, get: get, chip: chip, headCell: headCell, esc: esc, tabs: tabs, tabFromUrl: tabFromUrl, opportunities: opportunities };
})();
