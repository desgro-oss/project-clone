/* V2MyClientsTable — реестр клиентов на общем рендере data/registry-table.js.
   Одна таблица на все места, где виден список клиентов (решение пользователя
   26.10.2026): вкладки раздела «Клиенты» и вкладка главной «Поиск клиентов».
   Колонка, добавленная в COLS, появляется везде — таблицы не расходятся.
   «Поиск клиентов» шире: к общим колонкам и разделам фильтра добавлены
   атрибуты БТ «Поиск клиентов» от 21.10.2026 (SEARCH_COLS, SEARCH_SECTIONS;
   решение пользователя 26.10.2026). Фильтр — модалка .tfm по макету
   «Modal / Filter / My Clients»: разделы «Основная информация», «Команда»,
   «Отрасль»; у вкладок свой набор полей и свой сохранённый вид таблицы.
   mount(host, { tab, tree, onAdd }) — tab: 'my' | 'did' | 'search'
   («Мои клиенты» — клиенты базы, отмеченные избранными; «Клиенты ДИД» —
   пустое состояние; «Поиск клиентов» — вся база клиентов банка); tree — хост
   V2MyClientsHierarchicalTree: SegmentControl переключает таблицу и дерево
   той же выборки (без tree переключателя нет); onAdd — «Добавить клиента»
   (без него кнопки в тулбаре нет; на «Поиске клиентов» её нет всегда).
   handle.showView(view) — показать 'rows' | 'tree'; setView(host, view) —
   отметить вид в переключателе виджета.
   Строки — по приоритету от максимального к низкому; на «Поиске клиентов»
   стоит предфильтр «Максимальный + Высокий». Сортировка колонки — по всем
   страницам (sortAll общего рендера). Шестерёнка в тулбаре — «Настройка
   таблицы» ДС (data-table-settings); вид таблицы переживает перерисовку и
   переходы (persist общего рендера). Колонка ↔ поле — по ключу (ревью MS0014,
   Б6); чипы — слот .chip__icon (Б5); «в избранное» — скрытое действие строки
   (.tc__hidden, по наведению): отмечает клиента своим или снимает отметку. */
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

  /* Колонки «Поиска клиентов» сверх общих: каждая группа встаёт после
     общей колонки с ключом after. «Приоритет — наше поле» из БТ — общая
     колонка «Приоритет» (решение пользователя 26.10.2026); строка БТ
     «Приоритет: A, B, C, D» — колонка «Приоритет A–D». Суммы — млн RUB. */
  var MONEY = { type: 'text', align: 'right', width: '200px', sortType: 'number', money: true };
  var SEARCH_COLS = [
    { after: 'fullName', cols: [{ key: 'holdingName', label: 'Холдинг', type: 'text' }] },
    { after: 'goalsFixed', cols: [
      { key: 'didGrowthCompany', label: 'Компания роста ДИД', type: 'chip', width: '200px' },
      { key: 'keyClient', label: 'Ключевой клиент', type: 'bool', width: '180px' },
      { key: 'priorityClass', label: 'Приоритет A–D', type: 'text', width: '170px' },
      { key: 'problemZone', label: 'Зона проблемности', type: 'chip', width: '190px' }
    ] },
    { after: 'gcmName', cols: [
      { key: 'holdingGcmName', label: 'ГКМ холдинга', type: 'text' },
      { key: 'sponsor', label: 'Спонсор', type: 'text' }
    ] },
    { after: 'id', cols: [
      Object.assign({ key: 'revenueFns', label: 'Выручка (ФНС), млн RUB' }, MONEY),
      Object.assign({ key: 'ebitdaFok', label: 'EBITDA (ФОК SB0140), млн RUB' }, MONEY, { width: '250px' }),
      Object.assign({ key: 'debtFok', label: 'Долг (ФОК SB0121), млн RUB' }, MONEY, { width: '240px' }),
      Object.assign({ key: 'netDebtFok', label: 'Чистый долг (ФОК SB0121), млн RUB' }, MONEY, { width: '280px' }),
      Object.assign({ key: 'oszSber', label: 'ОСЗ в Сбере, млн RUB' }, MONEY),
      Object.assign({ key: 'chod2025', label: 'ЧОД 2025, млн RUB' }, MONEY),
      Object.assign({ key: 'chod2026', label: 'ЧОД 2026, млн RUB' }, MONEY),
      Object.assign({ key: 'didPortfolio', label: 'Портфель ДИД, млн RUB' }, MONEY),
      Object.assign({ key: 'didPipeline', label: 'Pipeline ДИД, млн RUB' }, MONEY)
    ] }
  ];
  // Минимум TableCell: 16 + 20 (IconButton M) + 16; слой кнопки 32 помещается внутри.
  var ALL_COLS = COLS.reduce(function (acc, c) {
    acc.push(c);
    SEARCH_COLS.forEach(function (g) { if (g.after === c.key) acc.push.apply(acc, g.cols); });
    return acc;
  }, [{ key: 'takeClient', label: 'В работу', type: 'icon-actions', hideLabel: true, width: '52px' }]);
  function columnsFor(tab) { return tab === 'search' ? ALL_COLS : COLS; }

  /* Однократно сузить прежнюю колонку и в сохранённом виде таблицы,
     сохранив остальные колонки, сортировку и положение прокрутки. */
  function compactWorkColumn() {
    try {
      var key = 'ds.table-settings.ibp-v2-clients-search';
      var saved = JSON.parse(window.sessionStorage.getItem(key) || 'null');
      if (!saved || saved.v !== 1 || !Array.isArray(saved.columns) || saved.compactClientWork) return;
      saved.columns.forEach(function (col) { if (col.key === 'takeClient') col.width = 52; });
      saved.compactClientWork = true;
      window.sessionStorage.setItem(key, JSON.stringify(saved));
    } catch (e) { /* При недоступном хранилище используется исходная ширина. */ }
  }

  /* Приоритет — наш рейтинг клиента: Максимальный · Высокий · Средний · Низкий
     (PRIORITY_LABELS, решение пользователя 26.10.2026). Ранг — для порядка:
     больше — выше в списке. */
  var RANK = { MAX: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
  function rank(c) { return RANK[c.priorityCode] || 0; }
  /* Предфильтр «Поиска клиентов»: только максимальный и высокий приоритет;
     снимается в модалке или крестиком чипа «Применено» */
  var SEARCH_PRESET = { priorityCode: ['MAX', 'HIGH'] };
  var ZONES = { GREEN: { label: 'Зелёная', tone: 'success' }, YELLOW: { label: 'Жёлтая', tone: 'warning' }, RED: { label: 'Красная', tone: 'error' }, BLACK: { label: 'Чёрная', tone: 'dark-solid' } };
  var YES_NO = [{ value: 'yes', label: 'Да' }, { value: 'no', label: 'Нет' }];
  function yn(v) { return v ? 'yes' : 'no'; }
  function employeeOptions(filter) {
    return window.IBPR.employees().filter(filter || function () { return true; }).map(function (e) { return { value: e.id, label: e.fullName }; });
  }
  function unique(list) { return list.filter(function (x, i) { return x && list.indexOf(x) === i; }).sort(); }

  /* Разделы фильтра. Общие — по макету «Modal / Filter / My Clients»: поле
     ИНН и CRM ID — в одну колонку сетки, остальные — на всю ширину. */
  function sectionsFor(tab) {
    var S = window.IBPR;
    var main = { title: 'Основная информация', fields: [
      { key: 'name', label: 'Клиент' },
      { key: 'fullName', label: 'Полное наименование' },
      { key: 'holdingName', label: 'Холдинг' },
      { key: 'inn', label: 'ИНН', half: true },
      { key: 'gcmId', label: 'Главный клиентский менеджер', type: 'select', options: function () { return employeeOptions(function (e) { return e.roleCode === 'KM'; }); }, get: function (c) { return c.gcmId; } },
      { key: 'id', label: 'CRM ID', half: true },
      { key: 'terBank', label: 'ТБ', type: 'select', options: function () { return Object.keys(window.DICT_TER_BANKS).map(function (k) { return { value: k, label: window.DICT_TER_BANKS[k] }; }); }, get: function (c) { return c.terBank; } },
      { key: 'gosb', label: 'ГОСБ', type: 'select', options: function () { return unique(S.clientBase().map(function (c) { return c.gosb; })); } }
    ] };
    var team = { title: 'Команда', fields: [
      { key: 'desks', label: 'Дески клиента', type: 'multi', options: function () { return window.DICT_DESKS.map(function (d) { return { value: d.id, label: d.name }; }); }, get: function (c) { return c.desks.map(function (d) { return d.deskId; }); } },
      { key: 'team', label: 'Команда клиента', type: 'multi', options: employeeOptions, get: function (c) { return c.team.map(function (m) { return m.employeeId; }); } }
    ] };
    var industry = { title: 'Отрасль', fields: [
      { key: 'industry', label: 'Отрасль' },
      { key: 'macro', label: 'Макроотрасль' },
      { key: 'sub', label: 'Подотрасль' },
      { key: 'segment', label: 'Сегмент' }
    ] };
    if (tab !== 'search') return [main, team, industry];
    team.fields.push(
      { key: 'holdingGcmId', label: 'ГКМ холдинга', type: 'select', options: function () { return employeeOptions(function (e) { return e.roleCode === 'KM'; }); }, get: function (c) { return c.holdingGcmId; } },
      { key: 'sponsor', label: 'Спонсор' });
    var signs = { title: 'Признаки клиента', fields: [
      { key: 'priorityCode', label: 'Приоритет', type: 'multi', options: function () { return Object.keys(window.PRIORITY_LABELS).map(function (k) { return { value: k, label: window.PRIORITY_LABELS[k] }; }); }, get: function (c) { return c.priorityCode; } },
      { key: 'priorityClass', label: 'Приоритет A–D', type: 'multi', options: ['A', 'B', 'C', 'D'] },
      { key: 'problemZone', label: 'Зона проблемности', type: 'multi', options: Object.keys(ZONES).map(function (k) { return { value: k, label: ZONES[k].label }; }), get: function (c) { return c.problemZone; } },
      { key: 'growthCompany', label: 'Компания роста', type: 'select', half: true, options: YES_NO, get: function (c) { return yn(c.growthCompany); } },
      { key: 'didGrowthCompany', label: 'Компания роста ДИД', type: 'select', half: true, options: YES_NO, get: function (c) { return yn(c.didGrowthCompany); } },
      { key: 'keyClient', label: 'Ключевой клиент', type: 'select', half: true, options: YES_NO, get: function (c) { return yn(c.keyClient); } }
    ] };
    var money = function (key, label) { return { key: key, label: label + ', млн RUB', type: 'range', get: function (c) { return c[key]; } }; };
    var finance = { title: 'Финансы', fields: [
      money('revenueFns', 'Выручка (по данным ФНС)'),
      money('ebitdaFok', 'EBITDA (по данным ФОК, форма SB0140)'),
      money('debtFok', 'Долг (по данным ФОК, форма SB0121)'),
      money('netDebtFok', 'Чистый долг (по данным ФОК, форма SB0121)'),
      money('oszSber', 'ОСЗ в Сбере'),
      money('chod2025', 'ЧОД 2025'),
      money('chod2026', 'ЧОД 2026')
    ] };
    var did = { title: 'ДИД', fields: [money('didPortfolio', 'Портфель'), money('didPipeline', 'Pipeline')] };
    return [main, team, industry, signs, finance, did];
  }

  /* Выборка вкладки: «Мои клиенты» — избранные клиенты базы. Исходный порядок —
     по приоритету от максимального к низкому (внутри приоритета — порядок
     базы): к нему же возвращает сброс сортировки колонки (третий клик Table ДС). */
  function byRank(a, b) { return rank(b) - rank(a); }
  function rowsFor(tab) {
    var S = window.IBPR;
    if (tab === 'did') return [];
    return (tab === 'search' ? S.clientBase() : S.favoriteClients()).slice().sort(byRank);
  }

  function value(c, col) {
    var S = window.IBPR;
    switch (col.key) {
      case 'statusLabel': return 'Активен';
      case 'tbLabel': return S.lbl.terBank(c.terBank);
      case 'gcmName': return (S.employee(c.gcmId) || {}).fullName;
      case 'growthCompany': return c.growthCompany ? 'Компания роста' : '';
      case 'goalsFixed': return c.goalsFixed ? 'Цели зафиксированы' : '';
      case 'didGrowthCompany': return c.didGrowthCompany ? 'Компания роста ДИД' : '';
      case 'holdingGcmName': return (S.employee(c.holdingGcmId) || {}).fullName;
      case 'problemZone': return (ZONES[c.problemZone] || {}).label;
      case 'priorityCode': return window.PRIORITY_LABELS[c.priorityCode];
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
     свои переключатели; виджет держит их согласованными). */
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

  /* «Добавить клиента» в тулбаре — путь к поиску: на самом поиске и без
     обработчика страницы кнопки нет. Кнопку пустого состояния прячет общий
     рендер при фильтре; без фильтра пустой бывает только не-поиск. */
  function syncAdd(hosts, tab, onAdd) {
    hosts.forEach(function (h) {
      if (!h) return;
      h.querySelectorAll('.dtable-toolbar [data-mc-add]').forEach(function (b) { b.hidden = !onAdd || tab === 'search'; });
    });
  }

  function mount(host, opts) {
    opts = opts || {};
    compactWorkColumn();
    var S = window.IBPR, T = window.IBPR_TABLE;
    var tree = opts.tree || null;
    var tab = opts.tab || 'my';
    var handle = T.mount(host, {
      id: 'my-clients', tab: tab, columns: columnsFor,
      rows: function (t) { tab = t; return rowsFor(t); },
      value: value,
      sort: { key: 'priorityCode', dir: 'desc' }, sortAll: true,
      /* вид таблицы из «Настройки таблицы» — один ключ на главной и в разделе
         «Клиенты»: настроенные колонки совпадают в обоих местах. У «Поиска
         клиентов» колонок больше — у него свой ключ */
      persist: function (t) { return t === 'search' ? 'ibp-v2-clients-search' : 'ibp-v2-clients'; },
      filterSections: sectionsFor,
      preset: function (t) { return t === 'search' ? SEARCH_PRESET : null; },
      emptyText: 'Здесь пока ничего нет',
      onRender: function () { syncAdd([host, tree], tab, opts.onAdd); },
      rowTail: function (c) {
        var on = S.isFavoriteClient(c.id);
        return '<div class="tc__hidden"><button type="button" class="ibtn ibtn--neutral ibtn--s" data-mc-fav="' + T.esc(c.id) + '" aria-label="' + (on ? 'Убрать из избранного' : 'Добавить в избранное') + '"><i data-icon="' + (on ? 'bookmark-minus' : 'bookmark-add') + '"></i></button></div>';
      },
      cell: function (c, col, v, first) {
        if (col.key === 'takeClient') {
          var taken = S.isFavoriteClient(c.id);
          var takeLabel = taken ? 'Отменить взятие клиента в работу' : 'Взять клиента в работу';
          return '<div class="tc tc--center" data-col="takeClient"><span class="tc__row"><button type="button" class="ibtn ibtn--neutral ibtn--m" data-mc-take="' + T.esc(c.id) + '" aria-label="' + takeLabel + '" title="' + takeLabel + '"><i data-icon="' + (taken ? 'folder-close-x-02' : 'folder-arrow-forward-02') + '"></i></button></span></div>';
        }
        if (col.key === 'name') {
          return '<div class="tc tc--pinned" data-col="name"><span class="tc__row"><a class="link link--accent link--m" href="' + window.IBPR_NAV.href('client', { id: c.id }) + '">' + T.esc(c.name) + '</a></span></div>';
        }
        var chip = null;
        if (col.key === 'statusLabel') chip = T.chip(v, { tone: 'info', rounded: true });
        if (col.key === 'quarterChip' && v) chip = T.chip(v, { icon: 'calendar' });
        if ((col.key === 'growthCompany' || col.key === 'didGrowthCompany') && v) chip = T.chip(v, { icon: 'trend-up' });
        if (col.key === 'problemZone' && v) chip = T.chip(v, { tone: ZONES[c.problemZone].tone });
        if (col.key === 'priorityCode' && v) chip = T.chip(v, { tone: T.priorityTone[c.priorityCode], icon: tab === 'search' && c.priorityCode === 'MAX' ? 'zap' : null });
        if (col.money) return '<div class="tc tc--numbers" data-col="' + col.key + '"><span class="tc__row"><span class="tc__text">' + window.DICT_FMT.money(v) + '</span></span></div>';
        if (col.key === 'goalsFixed' && v) {
          chip = '<span class="chip chip--s chip--fit"><span class="chip__icon" aria-hidden="true"><i data-icon="target"></i></span><span class="chip__label">' + T.esc(v) + '</span>'
            + '<button type="button" class="chip__info" aria-label="Подробнее о целях клиента"><i data-icon="info-circle"></i></button></span>';
        }
        return chip ? '<div class="tc" data-col="' + col.key + '"><span class="tc__row">' + chip + '</span></div>' : null;
      }
    });

    /* «в избранное»: отметка живёт в сторе (data/store.js) — «Мои клиенты»
       на любой странице видят её сразу */
    host.addEventListener('click', function (e) {
      var take = e.target.closest('[data-mc-take]');
      if (take) {
        if (tab !== 'search') return;
        var client = S.client(take.getAttribute('data-mc-take'));
        if (!client) return;
        var inWork = S.toggleFavoriteClient(client.id);
        handle.refresh();
        if (window.DSToast) window.DSToast.show({ message: 'Клиент ' + client.name + (inWork ? ' добавлен в «Мои клиенты»' : ' убран из «Моих клиентов»') });
        return;
      }
      var b = e.target.closest('[data-mc-fav]');
      if (!b) return;
      var c = S.client(b.getAttribute('data-mc-fav'));
      var on = S.toggleFavoriteClient(c.id);
      handle.refresh();
      if (window.DSToast) window.DSToast.show({ message: 'Клиент ' + c.name + (on ? ' добавлен в «Мои клиенты»' : ' убран из «Моих клиентов»') });
    });

    [host, tree].forEach(function (h) {
      if (!h) return;
      h.addEventListener('click', function (e) {
        if (e.target.closest('[data-mc-add]') && opts.onAdd) opts.onAdd();
      });
    });

    /* Таблица ↔ дерево той же выборки; дерево перерисовывается при каждом показе */
    handle.showView = function (view) {
      var isTree = !!tree && view === 'tree';
      host.hidden = isTree;
      if (tree) tree.hidden = !isTree;
      if (isTree) window.LcMyClientsHierarchicalTree.render(tree, { rows: rowsFor(tab), onView: handle.showView });
      setView(isTree ? tree : host, isTree ? 'tree' : 'rows');
    };
    var sw = host.querySelector('[data-mc-view]');
    if (sw) sw.hidden = !tree;
    wireView(host, handle.showView);
    if (tree) tree.hidden = true;
    return handle;
  }

  window.LcMyClientsTable = { mount: mount, wireView: wireView, setView: setView };
})();
