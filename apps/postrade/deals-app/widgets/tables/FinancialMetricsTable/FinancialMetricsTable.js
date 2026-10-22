/* ============================================================
   FinancialMetricsTable.js — отчет финансовых метрик (МСФО или РСБУ):
   тулбар с кнопкой «Фильтр» и таблица «метрики × даты» по группам ФИ.

   Виджет не читает стор сам: готовый отчет и значение фильтра ему отдает
   страница. Виджет вшивается на страницу дважды (МСФО и РСБУ), поэтому в
   разметке нет id; каждый экземпляр рисуется своим корнем.

   Глобальное имя: window.PostFinMetricsTable. Подключается после ds.js
   (рантаймы ДС: Table, TableCell, TableFilter, Icons) и до KPITable.js —
   тот строится на низкоуровневых функциях ниже.

   Типы (data/mock-fin-metrics-calc.js, FinMetricsReportRsDto):
     report = { reportCode, dates: ['ГГГГ-ММ-ДД'…],
                groups: [{ financialInstrumentId, financialInstrumentName,
                           currencyCode,
                           rows: [{ metricCode, metricName,
                                    values: { 'ГГГГ-ММ-ДД': число | null } }] }] }
     filter = FmFilterValue = { fiIds: string[], metrics: { [fiId]: string[] } }
       Пустой filter ({ fiIds: [], metrics: {} }) — фильтра нет. Непустой
       fiIds — видны только эти ФИ; если у ФИ в metrics[fiId] есть коды —
       только строки с этими metricCode, нет ключа или пусто — все метрики ФИ.
       ФИ, у которого после фильтра не осталось строк, не рисуется.

   API:
     render(root, report, filter)
       root — корень виджета (.lc-financial-metrics-table). Ставит на корень
       data-state (loading | empty | data) и data-report (из report.reportCode),
       перерисовывает тулбар и таблицу. report == null — загрузка (скелетоны).
       Отчет без групп (report.groups.length === 0) — «Нет данных», кнопка
       «Фильтр» заблокирована (атрибут disabled); если фильтр скрыл все группы
       непустого отчета — тоже «Нет данных», но кнопка доступна.
     drawReport(host, report, filter)
       Рисует в контейнер host только .dtable: шапка и группы либо «Нет данных».
       Свернутые группы сохраняются между перерисовками. После вставки вызывает
       dsIcons.apply, DSTable.bind и DSTable.wireAll, DSTablePin.bindAll.
     drawSkeleton(host)
       Загрузка: тот же каркас, ячейки — скелетоны.
     syncFilterBar(bar, appliedCount, disabled)
       bar — элемент .tfilter или его контейнер. appliedCount > 0 — чип
       «Применено: N»; disabled — .tfilter--disabled и disabled на кнопке,
       чип в этом случае не показывается.
     bind(root)
       Один раз вешает события корня (render зовет сам; KPITable — тоже).
     visibleGroups(report, filter), appliedCount(filter)
       Применение фильтра и N для чипа (N — число выбранных ФИ).
     fmtNumber(value) → '1 500 000,00' (неразрывный пробел между разрядами,
       запятая, обычный минус; null — пустая строка)
     fmtDate('ГГГГ-ММ-ДД') → 'ДД.ММ.ГГГГ'

   События с корня (bubbles: true, CustomEvent):
     fmtableaction      detail: { action: 'FILTER' } — клик по «Фильтр»; окно
                        открывает страница, у кнопки нет data-modal;
     fmtablefilterreset сброс чипа «Применено: N» (крестик или Backspace /
                        Delete на чипе). Штатное tfilter:reset ДС на корне
                        гасится и вместо него уходит это событие.
   Страница ловит оба и зовет render заново.

   Сворачивание групп, закрепление первой колонки, ширина и порядок колонок —
   рантаймы ДС (data-table, TableCell), своего кода на это нет.
   ============================================================ */
(function () {
  'use strict';

  var NBSP = ' ';
  var FIRST_COL = '400px';
  var DATE_COL = '160px';
  var SKELETON_ROWS = 6;
  var SKELETON_DATES = 4;
  /* Колонки не переставляются: даты идут по хронологии. Рантайм ДС (TableReorder.js) не берёт
     подпись шапки с атрибутом data-grab — его и ставим; ширина колонок меняется как обычно. */
  var LABEL = '<span class="th__label" data-grab>';

  var RESIZE = '<span class="th__resize" role="separator" aria-orientation="vertical" tabindex="0" aria-label="Изменить ширину колонки"></span>';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* ── Форматирование ───────────────────────────────────────────── */

  function fmtNumber(value) {
    if (value == null || value === '') return '';
    var n = Number(value);
    if (!isFinite(n)) return '';
    var fixed = Math.abs(n).toFixed(2);
    var parts = fixed.split('.');
    var int = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
    var negative = n < 0 && Number(fixed) !== 0;
    return (negative ? '-' : '') + int + ',' + parts[1];
  }

  function fmtDate(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso == null ? '' : iso));
    return m ? m[3] + '.' + m[2] + '.' + m[1] : String(iso == null ? '' : iso);
  }

  /* ── Фильтр ───────────────────────────────────────────────────── */

  function appliedCount(filter) {
    var ids = filter && filter.fiIds;
    return ids && ids.length ? ids.length : 0;
  }

  function visibleGroups(report, filter) {
    var groups = (report && report.groups) || [];
    var ids = filter && filter.fiIds;
    if (!ids || !ids.length) return groups;
    var metrics = (filter && filter.metrics) || {};
    var out = [];
    groups.forEach(function (g) {
      var id = g.financialInstrumentId;
      if (ids.indexOf(id) < 0) return;
      var codes = metrics[id];
      if (!codes || !codes.length) { out.push(g); return; }
      var rows = (g.rows || []).filter(function (r) { return codes.indexOf(r.metricCode) >= 0; });
      if (!rows.length) return;
      out.push({
        financialInstrumentId: id,
        financialInstrumentName: g.financialInstrumentName,
        currencyCode: g.currencyCode,
        rows: rows
      });
    });
    return out;
  }

  /* ── Разметка ─────────────────────────────────────────────────── */

  function gridTemplate(dateCount) {
    return '8px ' + FIRST_COL + ' '
      + (dateCount ? 'repeat(' + dateCount + ', ' + DATE_COL + ') ' : '')
      + 'minmax(8px,1fr)';
  }

  function nodeId(fiId) {
    return 'fm-' + String(fiId).replace(/[^A-Za-z0-9_-]/g, '_');
  }

  function emptyHtml() {
    return '<div class="dtable dtable--fill"><div class="dtable__body">'
      + '<div class="dtable__empty"><p class="dtable__empty-title">Нет данных</p></div>'
      + '</div></div>';
  }

  function headHtml(grid, dates) {
    return '<div class="tbl__row tbl__row--head" style="grid-template-columns:' + grid + '">'
      + '<div class="th th--separator"></div>'
      + '<div class="th th--pinned">' + LABEL + 'Наименование метрики</span>' + RESIZE + '</div>'
      + dates.map(function (d) {
        return '<div class="th th--right">' + LABEL + esc(fmtDate(d)) + '</span>' + RESIZE + '</div>';
      }).join('')
      + '<div class="th th--separator"></div></div>';
  }

  function groupHtml(grid, dates, g, collapsed) {
    var node = nodeId(g.financialInstrumentId);
    var open = !collapsed[node];
    var h = '<div class="tbl__row" data-node="' + node + '" style="grid-template-columns:' + grid + '">'
      + '<div class="tc tc--separator"></div>'
      + '<div class="tc tc--tree tc--pinned"><span class="tc__row">'
      + '<button type="button" class="tc__twisty" aria-expanded="' + open + '" aria-label="' + (open ? 'Свернуть' : 'Развернуть') + '"><i data-icon="chevron-right"></i></button>'
      + '<span class="tc__text tc__text--truncate lc-financial-metrics-table__group-name">' + esc(g.financialInstrumentName) + '</span>'
      + (g.currencyCode ? '<span class="tc__postfix">' + esc(g.currencyCode) + '</span>' : '')
      + '</span></div>'
      + dates.map(function () { return '<div class="tc"></div>'; }).join('')
      + '<div class="tc tc--separator"></div></div>';
    (g.rows || []).forEach(function (r) {
      var values = r.values || {};
      h += '<div class="tbl__row"' + (open ? '' : ' hidden') + ' data-parent="' + node + '" style="grid-template-columns:' + grid + '">'
        + '<div class="tc tc--separator"></div>'
        + '<div class="tc tc--tree tc--pinned" style="--tc-level:1"><span class="tc__row">'
        + '<span class="tc__twisty tc__twisty--leaf" aria-hidden="true"></span>'
        + '<span class="tc__text tc__text--truncate">' + esc(r.metricName) + '</span></span></div>'
        + dates.map(function (d) {
          var text = fmtNumber(values[d]);
          return text
            ? '<div class="tc tc--numbers"><span class="tc__row"><span class="tc__text">' + text + '</span></span></div>'
            : '<div class="tc tc--numbers"></div>';
        }).join('')
        + '<div class="tc tc--separator"></div></div>';
    });
    return h;
  }

  function skeletonCell(extra) {
    return '<div class="tc ' + (extra || '') + ' tc--skeleton" aria-busy="true"><span class="sk-line sk-line--caption" style="--sk-w:60%"></span></div>';
  }

  /* Какие группы были свернуты на экране, пока таблица перерисовывалась. */
  function collapsedNodes(host) {
    var out = {};
    var rows = host.querySelectorAll('.tbl__row[data-node]');
    for (var i = 0; i < rows.length; i++) {
      var tw = rows[i].querySelector('.tc__twisty[aria-expanded]');
      if (tw && tw.getAttribute('aria-expanded') === 'false') out[rows[i].getAttribute('data-node')] = true;
    }
    return out;
  }

  function wire(host) {
    if (window.dsIcons) window.dsIcons.apply(host);
    var body = host.querySelector('.dtable__body');
    if (window.DSTable && body) { window.DSTable.bind(body); window.DSTable.wireAll(host); }
    if (window.DSTablePin) window.DSTablePin.bindAll(host);
  }

  /* ── Низкоуровневый API ───────────────────────────────────────── */

  function drawReport(host, report, filter) {
    if (!host) return;
    var groups = visibleGroups(report, filter);
    var collapsed = collapsedNodes(host);
    if (!groups.length) {
      host.innerHTML = emptyHtml();
      return;
    }
    var dates = (report && report.dates) || [];
    var grid = gridTemplate(dates.length);
    host.innerHTML = '<div class="dtable dtable--fill"><div class="dtable__body">'
      + '<div class="tbl" data-table>'
      + headHtml(grid, dates)
      + groups.map(function (g) { return groupHtml(grid, dates, g, collapsed); }).join('')
      + '</div></div></div>';
    wire(host);
  }

  function drawSkeleton(host) {
    if (!host) return;
    var grid = gridTemplate(SKELETON_DATES);
    var head = '<div class="tbl__row tbl__row--head" style="grid-template-columns:' + grid + '">'
      + '<div class="th th--separator"></div>'
      + '<div class="th">' + LABEL + 'Наименование метрики</span></div>';
    for (var d = 0; d < SKELETON_DATES; d++) {
      head += '<div class="th th--right"><span class="sk-line sk-line--caption" style="--sk-w:60%"></span></div>';
    }
    head += '<div class="th th--separator"></div></div>';
    var rows = '';
    for (var r = 0; r < SKELETON_ROWS; r++) {
      rows += '<div class="tbl__row" style="grid-template-columns:' + grid + '"><div class="tc tc--separator"></div>' + skeletonCell('');
      for (var c = 0; c < SKELETON_DATES; c++) rows += skeletonCell('tc--numbers');
      rows += '<div class="tc tc--separator"></div></div>';
    }
    host.innerHTML = '<div class="dtable dtable--fill" aria-busy="true"><div class="dtable__body"><div class="tbl" data-table>' + head + rows + '</div></div></div>';
    wire(host);
  }

  function syncFilterBar(bar, count, disabled) {
    if (!bar) return;
    var tf = bar.classList && bar.classList.contains('tfilter') ? bar : bar.querySelector('.tfilter');
    if (!tf) return;
    var off = !!disabled;
    tf.classList.toggle('tfilter--disabled', off);
    var btn = tf.querySelector('.tfilter__open');
    if (btn) btn.disabled = off;
    var chip = tf.querySelector('.tfilter__applied');
    var n = off ? 0 : (count > 0 ? Math.floor(count) : 0);
    if (n <= 0) {
      if (chip) chip.remove();
      return;
    }
    if (!chip) {
      chip = document.createElement('span');
      chip.className = 'chip chip--edit chip--m tfilter__applied';
      chip.tabIndex = 0;
      chip.innerHTML = '<span class="chip__label"></span>'
        + '<span class="chip__remove" role="button" aria-label="Сбросить все фильтры"><i data-icon="close"></i></span>';
      tf.appendChild(chip);
      if (window.dsIcons) window.dsIcons.apply(chip);
    }
    chip.querySelector('.chip__label').textContent = 'Применено: ' + n;
  }

  /* ── События корня ────────────────────────────────────────────── */

  function emit(root, name, detail) {
    root.dispatchEvent(new CustomEvent(name, { bubbles: true, detail: detail || {} }));
  }

  function bind(root) {
    if (!root || root.__fmTableBound) return;
    root.__fmTableBound = true;
    root.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('.tfilter__open') : null;
      if (!btn || !root.contains(btn) || btn.disabled) return;
      emit(root, 'fmtableaction', { action: 'FILTER' });
    });
    root.addEventListener('tfilter:reset', function (e) {
      e.stopPropagation();
      emit(root, 'fmtablefilterreset');
    });
  }

  /* ── Виджет ───────────────────────────────────────────────────── */

  function render(root, report, filter) {
    if (!root) return;
    bind(root);
    var loading = report == null;
    var empty = !loading && !(report.groups && report.groups.length);
    root.setAttribute('data-state', loading ? 'loading' : (empty ? 'empty' : 'data'));
    if (report && report.reportCode) root.setAttribute('data-report', report.reportCode);
    syncFilterBar(root.querySelector('.tfilter'), appliedCount(filter), loading || empty);
    var host = root.querySelector('[data-fm-table]');
    if (loading) drawSkeleton(host);
    else drawReport(host, report, filter);
  }

  window.PostFinMetricsTable = {
    render: render,
    drawReport: drawReport,
    drawSkeleton: drawSkeleton,
    syncFilterBar: syncFilterBar,
    bind: bind,
    visibleGroups: visibleGroups,
    appliedCount: appliedCount,
    fmtNumber: fmtNumber,
    fmtDate: fmtDate
  };
})();
