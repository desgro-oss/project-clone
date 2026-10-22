/* ============================================================
   KPITable.js — отчет KPI: карточка «Отчет KPI» с переключателем вида
   «Краткий» / «Подробный», под ними тулбар с «Фильтр» и таблица.

   Своей таблицы здесь нет: рисует FinancialMetricsTable.js
   (PostFinMetricsTable.drawReport / syncFilterBar). Страница подключает оба
   скрипта, сначала FinancialMetricsTable.js. Устройство отчета, типы и значение
   фильтра FmFilterValue — в шапке FinancialMetricsTable.js.

   Глобальное имя: window.PostKpiTable.

   API:
     render(root, reports, filter)
       root — корень виджета (.lc-kpi-table);
       reports = { KPI_SHORT: FinMetricsReportRsDto, KPI_FULL: FinMetricsReportRsDto };
       filter — FmFilterValue, один на оба вида: метрик, которых нет в
       «Краткий», там просто не видно. reports == null — загрузка (скелетоны).
       Текущий вид хранится на корне — data-view (KPI_SHORT по умолчанию).
       Отчет пуст, когда у KPI_FULL нет групп: «Нет данных», «Фильтр»
       заблокирован, переключатель вида остаётся. Если фильтр скрыл все группы — «Нет
       данных», но «Фильтр» доступен.
     view(root) → 'KPI_SHORT' | 'KPI_FULL'
       Текущий вид.

   Переключение вида перерисовывает таблицу без обращения к странице:
   отчеты и фильтр запоминаются на корне при render.

   События с корня — те же, что у FinancialMetricsTable (CustomEvent, bubbles):
     fmtableaction      detail: { action: 'FILTER' } — клик по «Фильтр»;
     fmtablefilterreset сброс чипа «Применено: N».
   ============================================================ */
(function () {
  'use strict';

  var VIEWS = ['KPI_SHORT', 'KPI_FULL'];
  var NO_FILTER = { fiIds: [], metrics: {} };
  var NO_REPORT = { reportCode: null, dates: [], groups: [] };

  function lib() {
    var t = window.PostFinMetricsTable;
    if (!t) throw new Error('KPITable: сначала подключите FinancialMetricsTable.js');
    return t;
  }

  function view(root) {
    var v = root && root.getAttribute('data-view');
    return VIEWS.indexOf(v) >= 0 ? v : 'KPI_SHORT';
  }

  /* Переключатель вида (сегмент-контрол в шапке): aria-checked и roving tabindex
     приводятся к data-view корня, индикатор двигается следом. Рантайм ДС
     (data-segctrl) ставит то же самое на клик; здесь — на render и на случай,
     когда рантайма нет. */
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

  function paint(root) {
    var T = lib();
    var st = root.__fmKpi || {};
    var current = view(root);
    var host = root.querySelector('[data-fm-table]');
    var bar = root.querySelector('.tfilter');
    syncTabs(root, current);

    if (st.reports == null) {
      root.setAttribute('data-state', 'loading');
      T.syncFilterBar(bar, 0, true);
      T.drawSkeleton(host);
      return;
    }

    var full = st.reports.KPI_FULL;
    var empty = !full || !full.groups || !full.groups.length;
    root.setAttribute('data-state', empty ? 'empty' : 'data');
    T.syncFilterBar(bar, T.appliedCount(st.filter), empty);
    T.drawReport(host, empty ? NO_REPORT : (st.reports[current] || NO_REPORT), st.filter);
  }

  function pick(root, next) {
    if (VIEWS.indexOf(next) < 0 || next === view(root)) return;
    root.setAttribute('data-view', next);
    paint(root);
  }

  function bind(root) {
    if (!root || root.__fmKpiBound) return;
    root.__fmKpiBound = true;
    lib().bind(root);

    /* Рантайм сегмент-контрола (roving, data-segctrl) сидит на самом контроле и
       срабатывает раньше, чем событие дойдет до корня. Клик читает вид с кнопки,
       клавиатура — с выбранного сегмента после отложенного вызова (контрол двигает
       выбор сам). */
    root.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('.segctrl__item') : null;
      if (b && root.contains(b)) pick(root, b.getAttribute('data-view'));
    });
    root.addEventListener('keydown', function (e) {
      var b = e.target.closest ? e.target.closest('.segctrl__item') : null;
      if (!b || !root.contains(b)) return;
      setTimeout(function () {
        var sel = root.querySelector('.segctrl__item[aria-checked="true"]');
        if (sel) pick(root, sel.getAttribute('data-view'));
      }, 0);
    });
  }

  function render(root, reports, filter) {
    if (!root) return;
    bind(root);
    root.__fmKpi = { reports: reports == null ? null : reports, filter: filter || NO_FILTER };
    paint(root);
  }

  window.PostKpiTable = { render: render, view: view };
})();
