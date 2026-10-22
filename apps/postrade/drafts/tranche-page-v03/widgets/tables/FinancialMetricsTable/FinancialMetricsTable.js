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

   Фиксация расчёта РСБУ (RE0034, Э3 — выбор человека 22.10.2026: кебаб строки, дерево из трёх
   строк): в render четвёртым аргументом приходит необязательный opts.ras (только для отчёта RAS):
     opts.ras = { canFix: [fiId…],          — ФИ с траншами: только им можно зафиксировать
                  fixation: null | { fiId, metricCode, fixedAt, firstDate, recalculated,
                                     fixed, actual, delta },  — FinMetricsStore.rasFixation(); actual · delta —
                                     с учётом переносов (прогноз до пересчёта); firstDate — первая дата расхождения
                  moves: [{ fiId, startDate, endDate, amount }],  — переносы дельт, FinMetricsStore.rasMoves();
                                               передаются и после снятия фиксации
                  readOnly: true }           — просмотр или идёт пересчёт: действия нет, чип и
                                               значения остаются
   Без opts.ras виджет рисует как раньше (МСФО, KPI не меняются). У строки «Начисленные проценты
   за период» ФИ с траншем: кебаб «Зафиксировать расчёт», после фиксации — чип-иконка с датой в
   тултипе, после пересчёта строка раскрывается на «Зафиксировано», «После пересчёта», «Дельта»;
   дельта со знаком (+ зелёным, − красным). Действие уходит событием fmtableaction:
   { action: 'FIX_RAS', fiId }.
   Переносы (RE0034, Э4): в строке индикатора ячейки даты «с» и «на» каждого переноса — акцентный фон
   (.tc--accent), метка изменения (.tc--edited) и тултип «Перенесено <сумма> <валюта> на ДД.ММ.ГГГГ» /
   «Получено <сумма> <валюта> с ДД.ММ.ГГГГ»; несколько — через «; ». Подсветка остаётся навсегда.

   API:
     render(root, report, filter, opts)
       root — корень виджета (.lc-financial-metrics-table). Ставит на корень
       data-state (loading | empty | data) и data-report (из report.reportCode),
       перерисовывает тулбар и таблицу. report == null — загрузка (скелетоны).
       Отчет без групп (report.groups.length === 0) — «Нет данных», кнопка
       «Фильтр» заблокирована (атрибут disabled); если фильтр скрыл все группы
       непустого отчета — тоже «Нет данных», но кнопка доступна.
     drawReport(host, report, filter, opts)
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
  var RAS_METRIC = 'RAS_ACCRUED_PERCENT';
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

  function numCell(text, extra, attrs) {
    return text
      ? '<div class="tc tc--numbers' + (extra || '') + '"' + (attrs || '') + '><span class="tc__row"><span class="tc__text">' + text + '</span></span></div>'
      : '<div class="tc tc--numbers"></div>';
  }

  /* Строка метрики: узел дерева (o.node) или лист; o.level — уровень вложенности. */
  function rowHtml(grid, dates, o) {
    var twisty = o.node
      ? '<button type="button" class="tc__twisty" aria-expanded="' + o.expanded + '" aria-label="' + (o.expanded ? 'Свернуть' : 'Развернуть') + '"><i data-icon="chevron-right"></i></button>'
      : '<span class="tc__twisty tc__twisty--leaf" aria-hidden="true"></span>';
    return '<div class="tbl__row"' + (o.node ? ' data-node="' + o.node + '"' : '') + (o.hidden ? ' hidden' : '')
      + ' data-parent="' + o.parent + '" style="grid-template-columns:' + grid + '">'
      + '<div class="tc tc--separator"></div>'
      + '<div class="tc tc--tree tc--pinned" style="--tc-level:' + o.level + '"><span class="tc__row">' + twisty
      + '<span class="tc__text tc__text--truncate">' + esc(o.name) + '</span>' + (o.after || '') + '</span></div>'
      + dates.map(o.cell).join('')
      + '<div class="tc tc--separator"></div></div>';
  }

  /* ── Фиксация расчёта РСБУ (RE0034, Э2) ───────────────────────── */

  /* Чип без текста на лице: имя метрики занимает почти всю закреплённую колонку, подпись с датой
     её усекала. Дата и смысл — в тултипе (открытый вопрос паспорта). */
  function fixChip(fixation) {
    var tip = 'Расчёт зафиксирован ' + fmtDate(fixation.fixedAt);
    return '<span class="chip chip--info chip--s chip--fit" tabindex="0" role="img" aria-label="' + esc(tip) + '" data-fm-fixed-chip data-tooltip="' + esc(tip) + '">'
      + '<span class="chip__icon"><i data-icon="bookmark-check"></i></span></span>';
  }

  /* Кебаб в закреплённой ячейке строки индикатора (всегда виден: показ по наведению панель сценария не воспроизводит). */
  function fixKebab(fiId, nodeKey) {
    var id = 'fm-fixmenu-' + nodeKey;
    return '<span class="tc__controls"><span class="menu-anchor">'
      + '<button type="button" class="ibtn ibtn--neutral ibtn--s" aria-label="Действия со строкой «Начисленные проценты за период»" aria-haspopup="menu" aria-expanded="false" data-menu="' + id + '" data-menu-align="end"><i data-icon="more-dots"></i></button>'
      + '<div id="' + id + '" class="menu menu--floating" role="menu" hidden>'
      + '<button type="button" class="menu__item" role="menuitem" data-fm-fix-ras="' + esc(fiId) + '">'
      + '<span class="menu__item-icon"><i data-icon="bookmark-add"></i></span><span class="menu__item-label">Зафиксировать расчёт</span></button>'
      + '</div></span></span>';
  }

  /* Дельта со знаком: «+» зелёным, «−» красным, ноль без цвета. */
  function fmtDelta(n) {
    var t = fmtNumber(n);
    return n > 0 && t ? '+' + t : t;
  }
  function deltaCell(n, first) {
    if (n == null) return numCell('');
    var cls = n > 0 ? ' lc-financial-metrics-table__delta--plus' : n < 0 ? ' lc-financial-metrics-table__delta--minus' : '';
    /* первая дата расхождения — отсюда начинается разрыв с зафиксированной траекторией (RE0034) */
    return numCell(fmtDelta(n), cls, first ? ' data-tooltip="Первая дата расхождения"' : '');
  }

  /* Подсветка переносов: по дате — что перенесено с неё и что получено на неё. */
  function moveMarks(moves, fiId, currency) {
    var out = {};
    function at(d) { return out[d] || (out[d] = []); }
    (moves || []).forEach(function (m) {
      if (m.fiId !== fiId) return;
      var sum = fmtNumber(Math.abs(m.amount)) + ' ' + currency;
      var sign = m.amount < 0 ? '-' : '';
      at(m.startDate).push('Перенесено ' + sign + sum + ' на ' + fmtDate(m.endDate));
      at(m.endDate).push('Получено ' + sign + sum + ' с ' + fmtDate(m.startDate));
    });
    return out;
  }

  /* Строка «Начисленные проценты за период» ФИ с траншем: кебаб, чип фиксации, после пересчёта — дерево. */
  function indicatorRows(grid, dates, node, r, g, open, collapsed, ras) {
    var fx = ras.fixation && ras.fixation.fiId === g.financialInstrumentId ? ras.fixation : null;
    var canFix = ras.canFix.indexOf(g.financialInstrumentId) >= 0;
    var values = r.values || {};
    var after = '';
    if (fx) after = fixChip(fx);
    else if (canFix && !ras.readOnly && !ras.fixation) after = fixKebab(g.financialInstrumentId, node);
    var tree = !!(fx && fx.recalculated);
    var key = node + '-ind';
    var marks = moveMarks(ras.moves, g.financialInstrumentId, g.currencyCode || 'RUB');

    var h = rowHtml(grid, dates, {
      node: tree ? key : '', expanded: !collapsed[key], parent: node, level: 1, hidden: !open,
      name: r.metricName, after: after,
      cell: function (d) {
        var tip = marks[d] && marks[d].join('; ');
        return numCell(fmtNumber(values[d]), tip ? ' tc--accent tc--edited' : '',
          tip ? ' data-fm-move data-tooltip="' + esc(tip) + '" data-tooltip-multiline="yes"' : '');
      }
    });
    if (!tree) return h;
    var hide = !open || !!collapsed[key];
    var line = function (name, src, cellFn) {
      return rowHtml(grid, dates, {
        parent: key, level: 2, hidden: hide, name: name,
        cell: function (d) { return src[d] == null ? numCell('') : cellFn(src[d], d); }
      });
    };
    var plain = function (v) { return numCell(fmtNumber(v)); };
    return h + line('Зафиксировано', fx.fixed, plain) + line('После пересчёта', fx.actual, plain) + line('Дельта', fx.delta, function (v, d) { return deltaCell(v, d === fx.firstDate); });
  }

  function groupHtml(grid, dates, g, collapsed, ras) {
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
      if (ras && r.metricCode === RAS_METRIC && ras.canFix.indexOf(g.financialInstrumentId) >= 0) {
        h += indicatorRows(grid, dates, node, r, g, open, collapsed, ras);
        return;
      }
      h += rowHtml(grid, dates, {
        parent: node, level: 1, hidden: !open, name: r.metricName,
        cell: function (d) { return numCell(fmtNumber(values[d])); }
      });
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
    if (window.DSMenu && window.DSMenu.bindAll) window.DSMenu.bindAll(host);
    if (window.DSTooltip && window.DSTooltip.bindAll) window.DSTooltip.bindAll(host);
  }

  /* ── Низкоуровневый API ───────────────────────────────────────── */

  function rasOf(report, opts) {
    var ras = opts && opts.ras;
    if (!ras || !report || report.reportCode !== 'RAS') return null;
    return {
      canFix: ras.canFix || [], fixation: ras.fixation || null, moves: ras.moves || [], readOnly: !!ras.readOnly
    };
  }

  function drawReport(host, report, filter, opts) {
    if (!host) return;
    var ras = rasOf(report, opts);
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
      + groups.map(function (g) { return groupHtml(grid, dates, g, collapsed, ras); }).join('')
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

  function render(root, report, filter, opts) {
    if (!root) return;
    bind(root);
    bindFix();
    var loading = report == null;
    var empty = !loading && !(report.groups && report.groups.length);
    root.setAttribute('data-state', loading ? 'loading' : (empty ? 'empty' : 'data'));
    if (report && report.reportCode) root.setAttribute('data-report', report.reportCode);
    syncFilterBar(root.querySelector('.tfilter'), appliedCount(filter), loading || empty);
    var host = root.querySelector('[data-fm-table]');
    if (loading) drawSkeleton(host);
    else drawReport(host, report, filter, opts);
  }

  /* Кнопки фиксации: пункт меню плавающего слоя уходит из корня, поэтому слушаем документ. */
  var fixBound = false;
  function bindFix() {
    if (fixBound) return;
    fixBound = true;
    document.addEventListener('click', function (e) {
      var t = e.target.closest ? e.target.closest('[data-fm-fix-ras]') : null;
      if (!t || t.disabled) return;
      var root = document.querySelector('.lc-financial-metrics-table[data-report="RAS"]') || document.body;
      emit(root, 'fmtableaction', { action: 'FIX_RAS', fiId: t.getAttribute('data-fm-fix-ras') });
    });
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
