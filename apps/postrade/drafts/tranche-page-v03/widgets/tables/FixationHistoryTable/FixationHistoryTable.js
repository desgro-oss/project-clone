/* ============================================================
   FixationHistoryTable.js — история фиксаций ЭПС/ВБС: карточка «История
   фиксаций» с переключателем вида «По ФИ» / «По дате» и таблица фиксаций.

   Виджет ничего не удаляет и стор не читает: список фиксаций и режим ему
   отдает страница, удаление выполняет она по событию корня. Числа и даты
   форматирует FinancialMetricsTable.js (fmtNumber, fmtDate), поэтому он
   подключается раньше этого скрипта; оба — после ds.js (рантаймы ДС: Table,
   TableCell, Tab, Icons).

   Глобальное имя: window.PostFixationHistoryTable.

   Тип записи (data/mock-fin-metrics-calc.js, EirIbsvFixationRsDto) плюс три
   поля, которые добавляет FinMetricsStore.fixations():
     { fixationId, financialInstrumentId, changeDate: 'ГГГГ-ММ-ДД',
       modificationTypeCode: 'INITIAL' | 'NON_SUBSTANTIAL' | 'SUBSTANTIAL',
       eirRate, eirDelta, etsRate, etsDelta, grossCarryingAmount,
       grossCarryingImpactRate, day1PnlAmount: число | null, comment,
       fiName, currencyCode }
   isLast виджету не нужен: корзина активна у всех строк, решает страница.

   API:
     render(root, fixations, { mode, busy })
       root — корень виджета (.lc-fixation-history-table).
       fixations == null — загрузка (скелетоны); [] — «Нет данных», переключатель вида
       на месте. mode — 'edit' (по умолчанию) | 'view': в просмотре колонки
       «Действия» нет вовсе. busy — идет пересчет метрик: корзины с атрибутом
       disabled. Значения запоминаются на корне и ставятся атрибутами data-mode,
       data-busy и data-state (loading | empty | data).
     view(root) → 'BY_FI' | 'BY_DATE'
       Текущий вид; хранится на корне в data-view (по умолчанию BY_FI).

   Порядок строк: дата изменений по возрастанию. Клик по кнопке сортировки
   даты идет по кругу none → asc → desc → none (рантайм ДС шлет событие sort,
   строки переставляет сам виджет: в дереве data-sort-rows ДС переставляет
   только корни, а нужны строки внутри групп). none — порядок по умолчанию,
   то есть возрастание. Направление и свернутые группы запоминаются на корне
   и переживают смену вида. «№» — порядковый номер строки: в «По ФИ»
   внутри группы, в «По дате» сквозной.

   События с корня (CustomEvent, bubbles: true):
     fmfixationaction  detail: { action: 'REMOVE', fixationId } — клик по
                       корзине. Корзина активна у всех строк, вопрос «последняя
                       ли» решает страница.

   Сворачивание групп, ширина колонок, скелетоны — рантаймы и классы ДС.
   Перестановка колонок выключена (data-grab у подписей шапки).
   ============================================================ */
(function () {
  'use strict';

  var VIEWS = ['BY_FI', 'BY_DATE'];
  var SKELETON_ROWS = 6;
  /* Строка группы: ячейка с названием ФИ занимает первые три колонки «По ФИ»
     («№», «Дата изменений», «Значение ЭПС»), иначе название не помещается в «№». */
  var GROUP_SPAN = 3;
  var LABEL = '<span class="th__label" data-grab>';
  var RESIZE = '<span class="th__resize" role="separator" aria-orientation="vertical" tabindex="0" aria-label="Изменить ширину колонки"></span>';

  /* Начертание кнопки сортировки по направлению — те же значения, что рисует
     рантайм ДС после клика; здесь они нужны разметке при перерисовке. */
  var SORT = {
    none: { glyph: 'arrow-up-down', aria: 'none', label: 'Сортировать' },
    asc: { glyph: 'arrow-narrow-up', aria: 'ascending', label: 'Сортировка от меньшего к большему' },
    desc: { glyph: 'arrow-narrow-down', aria: 'descending', label: 'Сортировка от большего к меньшему' }
  };
  var MODIFICATION_FALLBACK = { INITIAL: 'Первоначальная', NON_SUBSTANTIAL: 'Несущественная', SUBSTANTIAL: 'Существенная' };

  var COLUMNS = [
    { key: 'num', label: '№', width: '64px' },
    { key: 'fiName', label: 'Наименование ФИ', width: '280px', view: 'BY_DATE' },
    { key: 'changeDate', label: 'Дата изменений', width: '160px', sort: true },
    { key: 'eirRate', label: 'Значение ЭПС, %', width: '140px', numbers: true },
    { key: 'eirDelta', label: 'Δ ЭПС, %', width: '120px', numbers: true, delta: true },
    { key: 'etsRate', label: 'Значение ЕТС, %', width: '140px', numbers: true },
    { key: 'etsDelta', label: 'Δ ЕТС, %', width: '120px', numbers: true, delta: true },
    { key: 'grossCarryingAmount', label: 'ВБС на дату фиксации, в валюте', width: '200px', numbers: true },
    { key: 'grossCarryingImpactRate', label: 'Влияние на ВБС, %', width: '160px', numbers: true },
    { key: 'day1PnlAmount', label: 'Day1PnL, в валюте', width: '180px', numbers: true },
    { key: 'modificationTypeCode', label: 'Вид модификации', width: '160px' },
    { key: 'comment', label: 'Комментарий', width: '280px' },
    { key: 'actions', label: 'Действия', width: '96px', center: true, mode: 'edit' }
  ];

  function lib() {
    var t = window.PostFinMetricsTable;
    if (!t) throw new Error('FixationHistoryTable: сначала подключите FinancialMetricsTable.js');
    return t;
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function view(root) {
    var v = root && root.getAttribute('data-view');
    return VIEWS.indexOf(v) >= 0 ? v : 'BY_FI';
  }

  function columnsFor(v, mode) {
    return COLUMNS.filter(function (c) { return (!c.view || c.view === v) && (!c.mode || c.mode === mode); });
  }

  function gridTemplate(cols) {
    return '8px ' + cols.map(function (c) { return c.width; }).join(' ') + ' minmax(8px,1fr)';
  }

  function modificationLabel(code) {
    var l = window.FIN_METRICS_LABELS && window.FIN_METRICS_LABELS.modification;
    return (l && l[code]) || MODIFICATION_FALLBACK[code] || String(code == null ? '' : code);
  }

  /* ── Порядок строк ────────────────────────────────────────────── */

  function byDate(dir) {
    var k = dir === 'desc' ? -1 : 1;
    return function (a, b) {
      if (a.changeDate !== b.changeDate) return (a.changeDate < b.changeDate ? -1 : 1) * k;
      var an = String(a.fiName || ''), bn = String(b.fiName || '');
      if (an !== bn) return (an < bn ? -1 : 1) * k;
      return (a.fixationId < b.fixationId ? -1 : (a.fixationId > b.fixationId ? 1 : 0)) * k;
    };
  }

  /* Группы идут в порядке появления ФИ в списке, строки внутри — по дате. */
  function groupsOf(list, dir) {
    var order = [];
    var map = {};
    list.forEach(function (f) {
      var id = f.financialInstrumentId;
      if (!map[id]) {
        map[id] = { id: id, name: f.fiName || id, currency: f.currencyCode, rows: [] };
        order.push(map[id]);
      }
      map[id].rows.push(f);
    });
    order.forEach(function (g) { g.rows.sort(byDate(dir)); });
    return order;
  }

  /* ── Разметка ─────────────────────────────────────────────────── */

  function nodeId(fiId) {
    return 'fh-' + String(fiId).replace(/[^A-Za-z0-9_-]/g, '_');
  }

  function headCell(col, dir, disabled) {
    var cls = 'th' + (col.numbers ? ' th--right' : '') + (col.center ? ' th--center' : '')
      + (col.sort && dir !== 'none' ? ' th--sorted' : '');
    var attrs = col.sort ? ' aria-sort="' + SORT[dir].aria + '"' : '';
    var tools = '';
    if (col.sort) {
      tools = '<span class="th__tools"><button type="button" class="ibtn ibtn--neutral ibtn--s th__sort'
        + (dir !== 'none' ? ' is-sorted' : '') + '" data-sort="' + col.key + '" aria-label="' + SORT[dir].label + '"'
        + (disabled ? ' disabled' : '') + '><i data-icon="' + SORT[dir].glyph + '"></i></button></span>';
    }
    return '<div class="' + cls + '"' + attrs + '>' + LABEL + esc(col.label) + '</span>' + tools + RESIZE + '</div>';
  }

  function headHtml(grid, cols, dir, disabled) {
    return '<div class="tbl__row tbl__row--head" style="grid-template-columns:' + grid + '">'
      + '<div class="th th--separator"></div>'
      + cols.map(function (c) { return headCell(c, dir, disabled); }).join('')
      + '<div class="th th--separator"></div></div>';
  }

  function textCell(text, extra) {
    return text === '' || text == null
      ? '<div class="tc' + (extra || '') + '"></div>'
      : '<div class="tc' + (extra || '') + '"><span class="tc__row"><span class="tc__text tc__text--truncate">' + text + '</span></span></div>';
  }

  /* Δ: «+» зеленым, «−» красным, ноль и пусто — без цвета. Знак «+» дописываем сами. */
  function deltaCell(value) {
    var T = lib();
    var text = T.fmtNumber(value);
    if (!text) return '<div class="tc tc--numbers"></div>';
    var n = Number(value);
    var tone = '';
    if (n > 0 && text.charAt(0) !== '-') { text = '+' + text; tone = ' lc-fixation-history-table__delta--up'; }
    else if (text.charAt(0) === '-') tone = ' lc-fixation-history-table__delta--down';
    return '<div class="tc tc--numbers"><span class="tc__row"><span class="tc__text"><span class="lc-fixation-history-table__delta' + tone + '">'
      + text + '</span></span></span></div>';
  }

  function numberCell(value) {
    var text = lib().fmtNumber(value);
    return text
      ? '<div class="tc tc--numbers"><span class="tc__row"><span class="tc__text">' + text + '</span></span></div>'
      : '<div class="tc tc--numbers"></div>';
  }

  function actionCell(rec, busy) {
    return '<div class="tc tc--center"><button type="button" class="ibtn ibtn--neutral ibtn--s" aria-label="Удалить фиксацию"'
      + ' data-fh-act="REMOVE" data-fixation-id="' + esc(rec.fixationId) + '"'
      + (busy ? ' disabled aria-disabled="true"' : '') + '><i data-icon="trash"></i></button></div>';
  }

  function fiCell(rec) {
    return '<div class="tc"><span class="tc__row"><span class="tc__text tc__text--truncate">'
      + esc(rec.fiName || rec.financialInstrumentId) + '</span>'
      + (rec.currencyCode ? '<span class="tc__postfix">' + esc(rec.currencyCode) + '</span>' : '')
      + '</span></div>';
  }

  function cellHtml(col, rec, n, busy) {
    var T = lib();
    switch (col.key) {
      case 'num': return textCell(String(n));
      case 'fiName': return fiCell(rec);
      case 'changeDate': return textCell(esc(T.fmtDate(rec.changeDate)));
      case 'modificationTypeCode': return textCell(esc(modificationLabel(rec.modificationTypeCode)));
      case 'comment': return textCell(esc(rec.comment));
      case 'actions': return actionCell(rec, busy);
      default: return col.delta ? deltaCell(rec[col.key]) : numberCell(rec[col.key]);
    }
  }

  function rowHtml(grid, cols, rec, n, busy, parent) {
    return '<div class="tbl__row"' + (parent ? ' data-parent="' + parent.node + '"' + (parent.open ? '' : ' hidden') : '')
      + ' data-fixation-id="' + esc(rec.fixationId) + '" style="grid-template-columns:' + grid + '">'
      + '<div class="tc tc--separator"></div>'
      + cols.map(function (c) { return cellHtml(c, rec, n, busy); }).join('')
      + '<div class="tc tc--separator"></div></div>';
  }

  function groupHtml(grid, cols, g, dir, busy, collapsed) {
    var node = nodeId(g.id);
    var open = !collapsed[node];
    var h = '<div class="tbl__row" data-node="' + node + '" style="grid-template-columns:' + grid + '">'
      + '<div class="tc tc--separator"></div>'
      + '<div class="tc tc--tree lc-fixation-history-table__group-cell"><span class="tc__row">'
      + '<button type="button" class="tc__twisty" aria-expanded="' + open + '" aria-label="' + (open ? 'Свернуть' : 'Развернуть') + '"><i data-icon="chevron-right"></i></button>'
      + '<span class="tc__text tc__text--truncate lc-fixation-history-table__group-name">' + esc(g.name) + '</span>'
      + (g.currency ? '<span class="tc__postfix">' + esc(g.currency) + '</span>' : '')
      + '</span></div>';
    for (var i = GROUP_SPAN; i < cols.length; i++) h += '<div class="tc"></div>';
    h += '<div class="tc tc--separator"></div></div>';
    g.rows.forEach(function (rec, i) {
      h += rowHtml(grid, cols, rec, i + 1, busy, { node: node, open: open });
    });
    return h;
  }

  function tableHtml(list, v, mode, busy, dir, collapsed) {
    var cols = columnsFor(v, mode);
    var grid = gridTemplate(cols);
    var body;
    if (v === 'BY_FI') {
      body = groupsOf(list, dir).map(function (g) { return groupHtml(grid, cols, g, dir, busy, collapsed); }).join('');
    } else {
      body = list.slice().sort(byDate(dir)).map(function (rec, i) { return rowHtml(grid, cols, rec, i + 1, busy, null); }).join('');
    }
    return '<div class="dtable dtable--fill"><div class="dtable__body"><div class="tbl" data-table>'
      + headHtml(grid, cols, dir, false) + body + '</div></div></div>';
  }

  function emptyHtml() {
    return '<div class="dtable dtable--fill"><div class="dtable__body">'
      + '<div class="dtable__empty"><p class="dtable__empty-title">Нет данных</p></div>'
      + '</div></div>';
  }

  function skeletonHtml(v, mode) {
    var cols = columnsFor(v, mode);
    var grid = gridTemplate(cols);
    var rows = '';
    for (var r = 0; r < SKELETON_ROWS; r++) {
      rows += '<div class="tbl__row" style="grid-template-columns:' + grid + '"><div class="tc tc--separator"></div>'
        + cols.map(function (c) {
          return '<div class="tc' + (c.numbers ? ' tc--numbers' : '') + ' tc--skeleton" aria-busy="true"><span class="sk-line sk-line--caption" style="--sk-w:60%"></span></div>';
        }).join('')
        + '<div class="tc tc--separator"></div></div>';
    }
    return '<div class="dtable dtable--fill" aria-busy="true"><div class="dtable__body"><div class="tbl" data-table>'
      + headHtml(grid, cols, 'none', true) + rows + '</div></div></div>';
  }

  /* Какие группы свернуты на экране: читается из разметки перед каждой перерисовкой
     и запоминается на корне, чтобы выбор переживал смену вида. */
  function readCollapsed(host, prev) {
    var out = {};
    Object.keys(prev || {}).forEach(function (k) { out[k] = prev[k]; });
    var rows = host.querySelectorAll('.tbl__row[data-node]');
    for (var i = 0; i < rows.length; i++) {
      var tw = rows[i].querySelector('.tc__twisty[aria-expanded]');
      if (tw) out[rows[i].getAttribute('data-node')] = tw.getAttribute('aria-expanded') === 'false';
    }
    return out;
  }

  function wire(host) {
    if (window.dsIcons) window.dsIcons.apply(host);
    var body = host.querySelector('.dtable__body');
    if (window.DSTable && body) { window.DSTable.bind(body); window.DSTable.wireAll(host); }
    if (window.DSTablePin) window.DSTablePin.bindAll(host);
  }

  /* ── Переключатель вида ───────────────────────────────────────────────── */

  /* Переключатель вида (сегмент-контрол в шапке): aria-checked и roving tabindex
     приводятся к data-view корня, индикатор двигается следом. Рантайм ДС
     (data-segctrl) ставит то же на клик; здесь — на render. */
  function syncTabs(root, current) {
    var items = root.querySelectorAll('.segctrl__item');
    for (var i = 0; i < items.length; i++) {
      var on = items[i].getAttribute('data-view') === current;
      items[i].setAttribute('aria-checked', on ? 'true' : 'false');
      items[i].setAttribute('tabindex', on ? '0' : '-1');
    }
    var seg = root.querySelector('.segctrl');
    if (seg && window.DSTabs) window.DSTabs.positionThumb(seg);
  }

  /* ── Перерисовка ──────────────────────────────────────────────── */

  function paint(root) {
    var st = root.__fh;
    var v = view(root);
    var host = root.querySelector('[data-fh-table]');
    if (!host) return;
    syncTabs(root, v);
    root.setAttribute('data-mode', st.mode);
    root.setAttribute('data-busy', st.busy ? 'true' : 'false');
    st.collapsed = readCollapsed(host, st.collapsed);

    if (st.fixations == null) {
      root.setAttribute('data-state', 'loading');
      host.innerHTML = skeletonHtml(v, st.mode);
      wire(host);
      return;
    }
    if (!st.fixations.length) {
      root.setAttribute('data-state', 'empty');
      host.innerHTML = emptyHtml();
      return;
    }
    root.setAttribute('data-state', 'data');
    host.innerHTML = tableHtml(st.fixations, v, st.mode, st.busy, st.sort, st.collapsed);
    wire(host);
  }

  function pick(root, next) {
    if (VIEWS.indexOf(next) < 0 || next === view(root)) return;
    root.setAttribute('data-view', next);
    paint(root);
  }

  function emit(root, name, detail) {
    root.dispatchEvent(new CustomEvent(name, { bubbles: true, detail: detail || {} }));
  }

  function bind(root) {
    if (!root || root.__fhBound) return;
    root.__fhBound = true;

    /* Рантайм сегмент-контрола (roving, data-segctrl) сидит на самом контроле и
       срабатывает раньше, чем событие дойдет до корня. Клик читает вид с кнопки,
       клавиатура — с выбранного сегмента после отложенного вызова (контрол двигает
       выбор сам). */
    root.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('.segctrl__item') : null;
      if (b && root.contains(b)) { pick(root, b.getAttribute('data-view')); return; }
      var del = e.target.closest ? e.target.closest('[data-fh-act="REMOVE"]') : null;
      if (!del || !root.contains(del) || del.disabled || del.getAttribute('aria-disabled') === 'true') return;
      emit(root, 'fmfixationaction', { action: 'REMOVE', fixationId: del.getAttribute('data-fixation-id') });
    });
    root.addEventListener('keydown', function (e) {
      var b = e.target.closest ? e.target.closest('.segctrl__item') : null;
      if (!b || !root.contains(b)) return;
      setTimeout(function () {
        var sel = root.querySelector('.segctrl__item[aria-checked="true"]');
        if (sel) pick(root, sel.getAttribute('data-view'));
      }, 0);
    });

    /* Сортировку по дате делает виджет: рантайм ДС красит кнопку и шлет sort с
       { column, dir }, строки (в том числе внутри групп) переставляет перерисовка. */
    root.addEventListener('sort', function (e) {
      var d = e.detail;
      if (!d || d.column !== 'changeDate' || !SORT[d.dir]) return;
      var hadFocus = root.contains(document.activeElement) && document.activeElement.closest('.th__sort');
      root.__fh.sort = d.dir;
      paint(root);
      /* перерисовка заменила кнопку сортировки новым узлом — фокус с клавиатуры возвращаем ей */
      if (hadFocus) {
        var again = root.querySelector('.th__sort[data-sort="changeDate"]');
        if (again) again.focus();
      }
    });
  }

  function render(root, fixations, opts) {
    if (!root) return;
    lib();
    bind(root);
    var prev = root.__fh || {};
    var o = opts || {};
    root.__fh = {
      fixations: fixations == null ? null : fixations,
      mode: o.mode === 'view' ? 'view' : 'edit',
      busy: !!o.busy,
      sort: prev.sort || 'none',
      collapsed: prev.collapsed || {}
    };
    paint(root);
  }

  window.PostFixationHistoryTable = { render: render, view: view };
})();
