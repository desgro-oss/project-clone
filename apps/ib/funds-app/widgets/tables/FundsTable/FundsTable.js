/* ============================================================
   FundsTable.js — поведение виджета «Список фондов» (FundsTable).

   Чего нет в рантаймах ДС и что делает этот файл: строки таблицы из данных
   (FundItemDto[] — data/funds.js), фильтрация строк, выбор фонда, пустые
   состояния. Сортировку, ширину и перенос колонок, закрепление колонки меню,
   тултипы усечения, свёртку чипов «+N», сами меню «⋮» и окно «Настройка
   таблицы» (порядок, видимость, закрепление колонок) дают рантаймы ДС (Table,
   TablePin, TableSettings, Tooltip, Chip, ContextMenu) по хукам разметки.

   API (глобальный объект window.FundsTable; root — корень фрагмента .lc-funds-table):
     init(root, { funds })            — нарисовать список; funds: [] — «Данных нет»
     placeFilters(root, el)           — поставить виджет фильтров (FundsFilters)
                                        в тулбар таблицы, слот data-fundstable-filters
     applyFilters(root, filters)      — { smartSearch, typeCodes, priorityCodes }
                                        (FundsFilters 3.000; priorityCode фронтенда
                                        тоже понимается); нет совпадений —
                                        «Ничего не найдено» (data-results="none")
     select(root, objectId | null)    — подсветить строку фонда / снять выбор;
                                        события не шлёт
     selected(root)                   → objectId выбранного фонда или null
   Событие (CustomEvent, bubbles, на корне):
     fundstable:select, detail { objectId } — клик по строке (кроме колонки меню).
   Шестерёнка «Настроить колонки» в тулбаре — хук ДС data-table-settings: окно TableSettings
   строится из колонок шапки (рисуются все колонки, у каждой .th — data-col).
   Настройка живёт на время сессии: data-table-persist="FundsTable" на .tbl;
   после каждой перерисовки (init) виджет зовёт DSTableSettings.restore — вид
   колонок и сортировка возвращаются на новую таблицу.
   Кнопка «⋮» строки — data-menu="fundActionsMenu" (фонд из ЕПК, partyId есть) или
   "fundActionsMenuCustom" (не из ЕПК); data-fund-id — objectId фонда.
   ============================================================ */
(function () {
  'use strict';

  /* Колонки — FundsTable.config.ts фронтенда: name, порядок, sortingEnabled;
     ширина — width конфига (тип и приоритет — допущение, у них только maxWidth).
     Подпись — как в окне «Настройка таблицы» макета. Колонки icon у нас нет:
     аватар стоит в ячейке названия, как на макете. */
  var COLUMNS = [
    { name: 'name', title: 'Название фонда', track: 'minmax(441px,441fr)', sort: 'text' },
    { name: 'alias', title: 'Псевдоним', track: 'minmax(403px,403fr)', sort: 'text' },
    { name: 'beneficiaries', title: 'Бенефициар', track: 'minmax(453px,453fr)' },
    { name: 'types', title: 'Тип', track: '160px' },
    { name: 'priority', title: 'Приоритет', track: '140px', sort: 'number' },
    { name: 'aumAssetsCount', title: 'Активов', track: '148px', sort: 'number', align: 'right' },
    { name: 'contacts', title: 'Контактные лица', track: '575px', hidden: true },
    { name: 'comment', title: 'Комментарий', track: '575px', sort: 'text', hidden: true },
    { name: 'actions', title: 'Действия', track: '52px', pinned: true }
  ];
  /* Вид по умолчанию — как во фронтенде: «Контактные лица» и «Комментарий»
     скрыты (hidden → data-col-hidden, Table ДС 1.025), «Действия» закреплена.
     Ячейки скрытых колонок рисуются в каждой строке: рантайм ДС убирает
     колонку на подключении, в окне «Настройка таблицы» она выключена. */
  var PERSIST_KEY = 'FundsTable';

  /* Тон чипа типа фонда — по макету «Funds pipeline / Fund list» (допущение
     30.10.2026: тональные варианты Chip ДС, подобраны по цвету макета). */
  var TYPE_TONE = { PE: 'lblue', PE_VC: 'dpurple', FAMILY_OFFICE: 'orange', HOLDING: 'green' };
  /* Приоритет: тон точки — тона иконки ячейки TableCell; ранг — порядок сортировки. */
  var PRIORITY = { HIGH: { tone: 'error', rank: 1 }, MEDIUM: { tone: 'warning', rank: 2 }, LOW: { tone: 'success', rank: 3 } };
  /* Организационно-правовые формы не дают букв аватара (FundOrAssetNameCell.utils.ts). */
  var LEGAL = ['ООО', 'АО', 'ЗАО', 'ПАО', 'ОАО', 'НАК', 'НКО', 'ИП', 'ПФ', 'ФГУП', 'ГУП', 'МУП', 'КФ', 'КХ', 'СХП', 'СО', 'ТОО', 'ККА', 'АГР'];
  var DASH = '—';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function filled(s) { return s != null && String(s).trim() !== ''; }

  /* Две буквы аватара: первые буквы двух первых слов или две первые буквы слова. */
  function initials(name) {
    var words = String(name || '').split(/[^0-9A-Za-zА-Яа-яЁё]+/).filter(function (w) {
      return w && LEGAL.indexOf(w.toUpperCase()) < 0;
    });
    if (!words.length) return '';
    if (words.length === 1) return (words[0].charAt(0) + (words[0].charAt(1) || words[0].charAt(0))).toUpperCase();
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
  }

  function st(root) {
    if (!root.__fundsTable) {
      root.__fundsTable = { funds: null, filters: null, selected: null };
      root.addEventListener('click', onClick);
    }
    return root.__fundsTable;
  }
  function grid(cols) { return ['8px'].concat(cols.map(function (c) { return c.track; })).concat(['minmax(8px,1fr)']).join(' '); }

  var RESIZE = '<span class="th__resize" role="separator" aria-orientation="vertical" tabindex="0" aria-label="Изменить ширину колонки"></span>';

  function headCell(c) {
    /* «Действия» — обычная колонка, закреплённая по умолчанию: в окне «Настройка
       таблицы» её можно открепить, перенести или скрыть (решение человека 30.10.2026) */
    if (c.pinned) return '<div class="th th--actions th--pinned" data-col="' + c.name + '"><span class="th__label">' + c.title + '</span>' + RESIZE + '</div>';
    var cls = 'th' + (c.align === 'right' ? ' th--right' : '');
    var tools = c.sort
      ? '<span class="th__tools"><button type="button" class="ibtn ibtn--neutral ibtn--s th__sort" data-sort="' + c.name + '" aria-label="Сортировать"><i data-icon="arrow-up-down"></i></button></span>'
      : '';
    return '<div class="' + cls + '" data-col="' + c.name + '"' + (c.hidden ? ' data-col-hidden' : '') + (c.sort ? ' aria-sort="none" data-sort-type="' + c.sort + '"' : '') + '>'
      + '<span class="th__label">' + c.title + '</span>' + tools + RESIZE + '</div>';
  }

  function textCell(name, value, sortValue) {
    if (!filled(value)) return '<div class="tc" data-col="' + name + '" data-sort-value=""><span class="tc__row"><span class="tc__empty">' + DASH + '</span></span></div>';
    return '<div class="tc" data-col="' + name + '"' + (sortValue != null ? ' data-sort-value="' + esc(sortValue) + '"' : '') + '>'
      + '<span class="tc__row"><span class="tc__text tc__text--truncate">' + esc(value) + '</span></span></div>';
  }

  /* FundOrAssetNameCell: аватар с инициалами + название и «ИНН … · КПП …»; без обоих — прочерк. */
  function nameCell(f) {
    var req = [];
    if (filled(f.inn)) req.push('ИНН ' + f.inn);
    if (filled(f.kpp)) req.push('КПП ' + f.kpp);
    return '<div class="tc" data-col="name" data-sort-value="' + esc(f.name) + '"><span class="tc__row">'
      + '<span class="av av--rounded av--m" data-av-seed="' + esc(f.objectId || f.name || '') + '" aria-hidden="true"><span class="av__text">' + esc(initials(f.name)) + '</span></span>'
      + '<span class="tc__body"><span class="tc__row"><span class="tc__text tc__text--truncate">' + esc(f.name) + '</span></span>'
      + '<span class="tc__subtext">' + esc(req.length ? req.join(' · ') : DASH) + '</span></span>'
      + '</span></div>';
  }

  /* Бенефициары: до двух имён, остальные — «+N» с полным списком в тултипе. */
  function beneficiariesCell(f) {
    var names = (f.keyBeneficiaries || []).map(function (b) { return String(b.displayName || '').trim(); }).filter(Boolean);
    if (!names.length) return textCell('beneficiaries', null);
    var more = names.length - 2;
    return '<div class="tc" data-col="beneficiaries"><span class="tc__row">'
      + '<span class="tc__text tc__text--truncate">' + esc(names.slice(0, 2).join(', ')) + '</span>'
      + (more > 0 ? '<span class="tc__postfix" data-tooltip="' + esc(names.join(', ')) + '">+' + more + '</span>' : '')
      + '</span></div>';
  }

  function typesCell(f) {
    var types = f.types || [];
    if (!types.length) return textCell('types', null);
    return '<div class="tc" data-col="types"><span class="tc__row">' + types.map(function (t) {
      return '<span class="chip chip--s chip--fit chip--' + (TYPE_TONE[t.code] || 'grey') + '"><span class="chip__label">' + esc(t.name) + '</span></span>';
    }).join('') + '</span></div>';
  }

  /* FundPriorityCell: точка тона приоритета + подпись. */
  function priorityCell(f) {
    var p = f.priority;
    if (!p) return textCell('priority', null);
    var conf = PRIORITY[p.code] || { tone: 'warning', rank: 9 };
    return '<div class="tc" data-col="priority" data-sort-value="' + conf.rank + '"><span class="tc__row">'
      + '<span class="tc__icon tc__icon--lead tc__icon--' + conf.tone + '" aria-hidden="true"><i data-icon="circle-filled-small"></i></span>'
      + '<span class="tc__text tc__text--truncate">' + esc(p.name) + '</span></span></div>';
  }

  /* Активов: 0 и null — «—» (FundsTable.hooks.tsx), пустые при сортировке внизу. */
  function countCell(f) {
    var n = f.aumAssetsCount;
    if (!n) return '<div class="tc tc--numbers" data-col="aumAssetsCount" data-sort-value=""><span class="tc__row"><span class="tc__empty">' + DASH + '</span></span></div>';
    return '<div class="tc tc--numbers" data-col="aumAssetsCount" data-sort-value="' + n + '"><span class="tc__row"><span class="tc__text">' + new Intl.NumberFormat('ru-RU').format(n) + '</span></span></div>';
  }

  function actionsCell(f) {
    var menu = f.partyId ? 'fundActionsMenu' : 'fundActionsMenuCustom';
    return '<div class="tc tc--center tc--pinned" data-col="actions">'
      + '<button type="button" class="ibtn ibtn--neutral ibtn--m" aria-label="Действия с фондом ' + esc(f.name) + '" data-menu="' + menu + '" data-menu-align="end" data-fund-id="' + esc(f.objectId) + '"><i data-icon="more-dots"></i></button>'
      + '</div>';
  }

  var CELL = {
    name: nameCell,
    alias: function (f) { return textCell('alias', f.alias, f.alias); },
    beneficiaries: beneficiariesCell,
    types: typesCell,
    priority: priorityCell,
    aumAssetsCount: countCell,
    contacts: function (f) { return textCell('contacts', (f.contacts || []).map(function (c) { return c.name; }).filter(Boolean).join(', ')); },
    comment: function (f) { return textCell('comment', f.comment, f.comment); },
    actions: actionsCell
  };

  function rowHTML(f, cols, g, s) {
    var sel = s.selected === f.objectId;
    return '<div class="tbl__row' + (sel ? ' tbl__row--selected' : '') + '" data-fund-id="' + esc(f.objectId) + '"' + (sel ? ' aria-selected="true"' : '')
      + ' style="grid-template-columns:' + g + '"><div class="tc tc--separator"></div>'
      + cols.map(function (c) { return CELL[c.name](f); }).join('')
      + '<div class="tc tc--separator"></div></div>';
  }

  /* Привязка рантаймов ДС после пересборки поддерева (урок Л93). */
  function rebind(root, tbl) {
    var body = root.querySelector('.dtable__body');
    if (window.DSTable) { window.DSTable.bind(body); window.DSTable.wire(tbl); }
    if (window.DSTablePin) window.DSTablePin.bind(tbl);
    if (window.dsIcons) window.dsIcons.apply(root);
    if (window.DSMenu) window.DSMenu.bindAll(root);
    if (window.DSTooltip && window.DSTooltip.bindAll) window.DSTooltip.bindAll(root);
    if (window.DSChip && window.DSChip.refresh) window.DSChip.refresh(root);
    if (window.DSTable && window.DSTable.chipOverflow) window.DSTable.chipOverflow(tbl);
    var btn = root.querySelector('[data-table-settings]');
    if (btn && window.DSTableSettings) window.DSTableSettings.bind(btn);
  }

  function toolsHTML(s) {
    /* Шестерёнка настройки (как в ДС: ibtn neutral M, глиф settings) — только
       когда есть фонды (макет «Empty state»). */
    return s.funds && s.funds.length
      ? '<button type="button" class="ibtn ibtn--neutral ibtn--m" data-table-settings aria-label="Настроить колонки"><i data-icon="settings"></i></button>'
      : '';
  }

  function render(root) {
    var s = st(root);
    var funds = s.funds || [];
    var old = root.querySelector('[data-fundstable-tbl]');
    /* сортировку, выбранную пользователем, возвращаем после пересборки колонок */
    var sorted = old && old.querySelector('.th--sorted[data-col]');
    var sort = sorted ? { col: sorted.getAttribute('data-col'), dir: sorted.getAttribute('aria-sort') } : null;

    var cols = COLUMNS, g = grid(cols);
    var tbl = document.createElement('div');
    tbl.className = 'tbl';
    tbl.setAttribute('data-table', '');
    tbl.setAttribute('data-sort-rows', '');
    tbl.setAttribute('data-fundstable-tbl', '');
    tbl.setAttribute('data-table-persist', PERSIST_KEY);
    /* снимок колонок окна настройки — от старой шапки; новая таблица строит свой */
    tbl.__dsTableSettings = null;
    tbl.innerHTML = '<div class="tbl__row tbl__row--head" style="grid-template-columns:' + g + '"><div class="th th--separator"></div>'
      + cols.map(headCell).join('') + '<div class="th th--separator"></div></div>'
      + funds.map(function (f) { return rowHTML(f, cols, g, s); }).join('');
    if (old) old.replaceWith(tbl);
    else root.querySelector('.dtable__body').prepend(tbl);

    root.querySelector('[data-fundstable-tools]').innerHTML = toolsHTML(s);
    root.removeAttribute('aria-busy');
    root.setAttribute('data-state', funds.length ? 'data' : 'empty');
    filterRows(root);
    rebind(root, tbl);
    if (sort && sort.dir && sort.dir !== 'none' && tbl.__dsTableWired && tbl.__dsTableWired.sort) {
      tbl.__dsTableWired.sort(sort.col, sort.dir === 'ascending' ? 'asc' : 'desc');
    }
    /* вид колонок из окна «Настройка таблицы» (и сортировка) на время сессии —
       на новую таблицу; скрытую (пусто / ничего не найдено) рантайм применит,
       когда она появится */
    if (window.DSTableSettings) window.DSTableSettings.restore(tbl);
  }

  /* Фильтр (FundFiltersDto): smartSearch — без учёта регистра по названию,
     псевдониму, бенефициарам и ИНН (атрибуты подсказки поиска макета «Tooltip»);
     typeCodes — хотя бы один из типов фонда; priorityCodes — один из выбранных
     приоритетов (priorityCode фронтенда — как массив из одного). */
  function matches(f, flt) {
    if (!flt) return true;
    var q = String(flt.smartSearch || '').trim().toLowerCase();
    if (q) {
      var hay = [f.name, f.alias, f.inn].concat((f.keyBeneficiaries || []).map(function (b) { return b.displayName; }));
      if (!hay.some(function (v) { return v != null && String(v).toLowerCase().indexOf(q) >= 0; })) return false;
    }
    var codes = flt.typeCodes || [];
    if (codes.length && !(f.types || []).some(function (t) { return codes.indexOf(t.code) >= 0; })) return false;
    var prio = flt.priorityCodes || (flt.priorityCode ? [flt.priorityCode] : []);
    if (prio.length && !(f.priority && prio.indexOf(f.priority.code) >= 0)) return false;
    return true;
  }

  function filterRows(root) {
    var s = st(root);
    var tbl = root.querySelector('[data-fundstable-tbl]');
    var byId = {};
    (s.funds || []).forEach(function (f) { byId[f.objectId] = f; });
    var shown = 0;
    tbl.querySelectorAll('.tbl__row[data-fund-id]').forEach(function (row) {
      var ok = matches(byId[row.getAttribute('data-fund-id')], s.filters);
      row.hidden = !ok;
      if (ok) shown += 1;
    });
    var empty = !(s.funds && s.funds.length);
    var none = !empty && shown === 0;
    tbl.hidden = empty || none;
    root.querySelector('[data-fundstable-empty]').hidden = !empty;
    root.querySelector('[data-fundstable-notfound]').hidden = !none;
    root.setAttribute('data-results', none ? 'none' : 'all');
    if (!tbl.hidden && window.DSTable && tbl.__dsTableWired) tbl.__dsTableWired.refresh();
  }

  function markSelected(root) {
    var id = st(root).selected;
    root.querySelectorAll('[data-fundstable-tbl] .tbl__row[data-fund-id]').forEach(function (row) {
      var on = row.getAttribute('data-fund-id') === id;
      row.classList.toggle('tbl__row--selected', on);
      if (on) row.setAttribute('aria-selected', 'true'); else row.removeAttribute('aria-selected');
    });
  }

  function onClick(e) {
    var root = e.currentTarget;
    var row = e.target.closest('.tbl__row[data-fund-id]');
    if (!row || !root.contains(row)) return;
    /* колонка меню «⋮» строку не выбирает: там своё действие */
    if (e.target.closest('[data-col="actions"], [data-menu]')) return;
    var id = row.getAttribute('data-fund-id');
    st(root).selected = id;
    markSelected(root);
    root.dispatchEvent(new CustomEvent('fundstable:select', { bubbles: true, detail: { objectId: id } }));
  }

  window.FundsTable = {
    init: function (root, opts) {
      var s = st(root);
      s.funds = (opts && opts.funds) || [];
      if (s.selected && !s.funds.some(function (f) { return f.objectId === s.selected; })) s.selected = null;
      render(root);
    },
    placeFilters: function (root, el) {
      var slot = root.querySelector('[data-fundstable-filters]');
      if (slot && el && el.parentNode !== slot) slot.appendChild(el);
      if (el && window.FundsFilters && window.FundsFilters.fit) window.FundsFilters.fit(el);
    },
    applyFilters: function (root, filters) {
      var s = st(root);
      s.filters = filters || null;
      if (s.funds) filterRows(root);
    },
    select: function (root, objectId) {
      st(root).selected = objectId || null;
      markSelected(root);
    },
    selected: function (root) { return st(root).selected; }
  };
})();
