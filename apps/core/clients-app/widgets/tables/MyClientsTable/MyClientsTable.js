/* MyClientsTable — реестр «Мои клиенты» на общем рендере data/registry-table.js.
   mount(host, { tab, onView }) — tab: 'my' | 'did' (вкладки «Мои клиенты» и
   «Клиенты ДИД»; «Клиенты ДИД» — пустое состояние); onView(view) — выбор
   вида в SegmentControl ('rows' | 'tree'), переключает страница;
   setView(host, view) — отметить вид в переключателе виджета.
   Колонка ↔ поле — по ключу (ревью MS0014, Б6); чипы — слот .chip__icon (Б5);
   «в избранное» — скрытое действие строки (.tc__hidden, по наведению).
   Строки — по приоритету от максимального к низкому; сортировка колонки — по
   всем страницам (sortAll общего рендера). Шестерёнка в тулбаре — «Настройка
   таблицы» ДС (data-table-settings); вид таблицы переживает перерисовку
   (persist общего рендера). Фильтр — модалка .tfm по макету «Modal / Filter /
   My Clients»: разделы «Основная информация», «Команда», «Отрасль». */
(function () {
  'use strict';

  var COLS = [
    { key: 'name', label: 'Клиент', type: 'text', width: 'minmax(170px,1.4fr)' },
    { key: 'priorityCode', label: 'Приоритет', type: 'chip', width: '170px', sortType: 'number', sortValue: rank },
    { key: 'fullName', label: 'Полное наименование', type: 'wide' },
    { key: 'inn', label: 'ИНН', type: 'muted' },
    { key: 'statusLabel', label: 'Статус', type: 'chip', width: '130px' },
    { key: 'quarterChip', label: 'Дата', type: 'chip', width: '120px' },
    { key: 'growthCompany', label: 'Компания роста', type: 'chip', width: '170px' },
    { key: 'goalsFixed', label: 'Цели клиента', type: 'chip', width: '210px' },
    { key: 'industry', label: 'Отрасль', type: 'text' },
    { key: 'macro', label: 'Макроотрасль', type: 'text' },
    { key: 'sub', label: 'Подотрасль', type: 'text' },
    { key: 'segment', label: 'Сегмент', type: 'text' },
    { key: 'tbLabel', label: 'ТБ', type: 'text', width: '110px' },
    { key: 'gosb', label: 'ГОСБ', type: 'text', width: '120px' },
    { key: 'gcmName', label: 'ГКМ', type: 'text' },
    { key: 'id', label: 'CRM ID', type: 'muted' }
  ];

  /* Приоритет — наш рейтинг клиента: Максимальный · Высокий · Средний · Низкий
     (PRIORITY_LABELS, решение пользователя 26.10.2026). Ранг — для порядка:
     больше — выше в списке. */
  var RANK = { MAX: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
  function rank(c) { return RANK[c.priorityCode] || 0; }
  /* Исходный порядок строк — по приоритету от максимального к низкому (внутри
     приоритета — порядок базы); к нему же возвращает сброс сортировки колонки */
  function byRank(a, b) { return rank(b) - rank(a); }

  /* Разделы фильтра — по макету «Modal / Filter / My Clients»: поле ИНН и
     CRM ID — в одну колонку сетки, остальные — на всю ширину. */
  function employeeOptions(filter) {
    return window.IBPR.employees().filter(filter || function () { return true; }).map(function (e) { return { value: e.id, label: e.fullName }; });
  }
  function unique(list) { return list.filter(function (x, i) { return x && list.indexOf(x) === i; }).sort(); }
  function sectionsFor() {
    var S = window.IBPR;
    return [
      { title: 'Основная информация', fields: [
        { key: 'name', label: 'Клиент' },
        { key: 'fullName', label: 'Полное наименование' },
        { key: 'holdingName', label: 'Холдинг' },
        { key: 'inn', label: 'ИНН', half: true },
        { key: 'gcmId', label: 'Главный клиентский менеджер', type: 'select', options: function () { return employeeOptions(function (e) { return e.roleCode === 'KM'; }); }, get: function (c) { return c.gcmId; } },
        { key: 'id', label: 'CRM ID', half: true },
        { key: 'terBank', label: 'ТБ', type: 'select', options: function () { return Object.keys(window.DICT_TER_BANKS).map(function (k) { return { value: k, label: window.DICT_TER_BANKS[k] }; }); }, get: function (c) { return c.terBank; } },
        { key: 'gosb', label: 'ГОСБ', type: 'select', options: function () { return unique(S.clients().map(function (c) { return c.gosb; })); } }
      ] },
      { title: 'Команда', fields: [
        { key: 'desks', label: 'Дески клиента', type: 'multi', options: function () { return window.DICT_DESKS.map(function (d) { return { value: d.id, label: d.name }; }); }, get: function (c) { return c.desks.map(function (d) { return d.deskId; }); } },
        { key: 'team', label: 'Команда клиента', type: 'multi', options: employeeOptions, get: function (c) { return c.team.map(function (m) { return m.employeeId; }); } }
      ] },
      { title: 'Отрасль', fields: [
        { key: 'industry', label: 'Отрасль' },
        { key: 'macro', label: 'Макроотрасль' },
        { key: 'sub', label: 'Подотрасль' },
        { key: 'segment', label: 'Сегмент' }
      ] }
    ];
  }

  function value(c, col) {
    var S = window.IBPR;
    switch (col.key) {
      case 'statusLabel': return 'Активен';
      case 'tbLabel': return S.lbl.terBank(c.terBank);
      case 'gcmName': return (S.employee(c.gcmId) || {}).fullName;
      case 'priorityCode': return window.PRIORITY_LABELS[c.priorityCode];
      case 'growthCompany': return c.growthCompany ? 'Компания роста' : '';
      case 'goalsFixed': return c.goalsFixed ? 'Цели зафиксированы' : '';
      default: return c[col.key];
    }
  }

  /* SegmentControl вида: клик → onView(view); подписка одна на виджет */
  function wireView(host, onView) {
    var sw = host.querySelector('[data-mc-view]');
    if (!sw || sw.__mcWired) return;
    sw.__mcWired = true;
    sw.addEventListener('click', function (e) {
      var b = e.target.closest('.segctrl__item');
      if (b && onView) onView(b.getAttribute('data-view'));
    });
  }

  /* Показать выбранный вид в SegmentControl виджета (у таблицы и дерева
     свои переключатели; страница держит их согласованными). */
  function setView(host, view) {
    var sw = host.querySelector('[data-mc-view]');
    if (!sw) return;
    sw.querySelectorAll('.segctrl__item').forEach(function (b) {
      var on = b.getAttribute('data-view') === view;
      b.setAttribute('aria-checked', on ? 'true' : 'false');
      b.setAttribute('tabindex', on ? '0' : '-1');
    });
    if (window.DSTabs && window.DSTabs.positionThumb) window.DSTabs.positionThumb(sw);
  }

  function mount(host, opts) {
    opts = opts || {};
    var S = window.IBPR, T = window.IBPR_TABLE;
    var handle = T.mount(host, {
      id: 'my-clients', tab: opts.tab || 'my', columns: COLS,
      rows: function (tab) { return tab === 'did' ? [] : S.clients().slice().sort(byRank); },
      value: value,
      sort: { key: 'priorityCode', dir: 'desc' }, sortAll: true,
      /* вид таблицы из «Настройки таблицы» живёт в sessionStorage рантайма
         TableSettings (persist общего рендера) */
      persist: 'ibp-v1-clients',
      filterSections: sectionsFor,
      emptyText: 'Здесь пока ничего нет',
      rowTail: function () {
        return '<div class="tc__hidden"><button type="button" class="ibtn ibtn--neutral ibtn--s" aria-label="Добавить в избранное"><i data-icon="bookmark-add"></i></button></div>';
      },
      cell: function (c, col, v, first) {
        if (col.key === 'name') {
          return '<div class="tc tc--pinned" data-col="name"><span class="tc__row"><a class="link link--accent link--m" href="' + window.IBPR_NAV.href('client', { id: c.id }) + '">' + T.esc(c.name) + '</a></span></div>';
        }
        var chip = null;
        if (col.key === 'statusLabel') chip = T.chip(v, { tone: 'info', rounded: true });
        if (col.key === 'priorityCode' && v) chip = T.chip(v, { tone: T.priorityTone[c.priorityCode] });
        if (col.key === 'quarterChip' && v) chip = T.chip(v, { icon: 'calendar' });
        if (col.key === 'growthCompany' && v) chip = T.chip(v, { icon: 'trend-up' });
        if (col.key === 'goalsFixed' && v) {
          chip = '<span class="chip chip--s chip--fit"><span class="chip__icon" aria-hidden="true"><i data-icon="target"></i></span><span class="chip__label">' + T.esc(v) + '</span>'
            + '<button type="button" class="chip__info" aria-label="Подробнее о целях клиента"><i data-icon="info-circle"></i></button></span>';
        }
        return chip ? '<div class="tc" data-col="' + col.key + '"><span class="tc__row">' + chip + '</span></div>' : null;
      }
    });
    wireView(host, opts.onView);
    return handle;
  }

  window.LcMyClientsTable = { mount: mount, wireView: wireView, setView: setView };
})();
