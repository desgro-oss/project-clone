/* ============================================================
   ПАНЕЛЬ ПРОТОТИПА — кто этот элемент (dev-ds.js, RE0030, Э5).

   Разбор имени элемента для Devmode: компонент дизайн-системы по корневому классу
   (.ibtn → IconButton), его модификаторы (ibtn--m) и части (ibtn__icon), виджет
   проекта по маркеру сборщика (data-widget, data-widget-group, data-widget-src —
   их пишет assemble.mjs в собранную страницу), иконка по data-icon, иллюстрация
   по data-illu. Ничего не пишет в DOM.

   Таблица BLOCKS — имя компонента, его папка в ДС и корневые классы (блоки БЭМ).
   Её ведёт человек, а сверяет с ДС `proto-panel.mjs --check` (ПН13): появился
   компонент или блок с `__` и `--` — проверка скажет, какой строки не хватает;
   пока строки нет, элемент называется как обычный тег с классом. Папки — от
   корня ДС (window.__DS_ROOT, его ставит apps/ds-config.js); если адреса ДС нет,
   ссылок нет.

   Слой имён фронтенда — отдельно от разбора класса: addNamer(fn) принимает
   функцию (info) → имя компонента UI-kit или '' — когда появится таблица
   соответствия «компонент ДС → компонент фронтенда» (ответ 5 задачи), её
   подключают здесь, а разбор не трогают.
   ============================================================ */
(function () {
  'use strict';
  var PP = window.ProtoPanel;
  if (!PP) return;

  /* [имя, папка от корня ДС без components/, корневые классы] */
  var BLOCKS = [
    ['Avatar', 'atoms/Avatar', ['av', 'av-group', 'av-stack']],
    ['Badge', 'atoms/Badge', ['badge', 'badge-anchor']],
    ['Buttons', 'atoms/Buttons', ['btn']],
    ['Checkbox', 'atoms/Checkbox', ['cb', 'cb-group']],
    ['Chip', 'atoms/Chip', ['chip', 'chiplist']],
    ['Divider', 'atoms/Divider', ['dvd', 'dvd-text']],
    ['IconButton', 'atoms/IconButton', ['ibtn']],
    ['Keyboard', 'atoms/Keyboard', ['kbd', 'kbd-combo']],
    ['LabelHelper', 'atoms/LabelHelper', ['ds-label', 'ds-helper']],
    ['Link', 'atoms/Link', ['link']],
    ['Note', 'atoms/Note', ['note']],
    ['ProgressBar', 'atoms/ProgressBar', ['pbar']],
    ['Radiobutton', 'atoms/Radiobutton', ['rb', 'rb-group']],
    ['Skeleton', 'atoms/Skeleton', ['sk-line', 'sk-block', 'sk-surface', 'sk-group', 'sk-row']],
    ['Slider', 'atoms/Slider', ['slr']],
    ['Spinner', 'atoms/Spinner', ['spin', 'spin-group', 'spin-overlay']],
    ['StepMarker', 'atoms/StepMarker', ['stepmark']],
    ['Switch', 'atoms/Switch', ['sw', 'sw-group', 'sw-row']],
    ['Alert', 'molecules/Alert', ['alert']],
    ['Breadcrumbs', 'molecules/Breadcrumbs', ['crumbs']],
    ['ButtonGroup', 'molecules/ButtonGroup', ['btn-group']],
    ['ColorPicker', 'molecules/ColorPicker', ['cpk']],
    ['ContextMenu', 'molecules/ContextMenu', ['menu', 'menu-anchor']],
    ['DatePicker', 'molecules/DatePicker', ['dpk']],
    ['DocCard', 'molecules/DocCard', ['doccard']],
    ['DropdownList', 'molecules/DropdownList', ['ddl']],
    ['EmptyState', 'molecules/EmptyState', ['es']],
    ['Inputs', 'molecules/Inputs', ['inp', 'inp-range', 'inp-ext'], 'InputText/InputText'],   // страница и спека — в папке поля
    ['NavTile', 'molecules/NavTile', ['ntile', 'ntile-grid']],
    ['Pagination', 'molecules/Pagination', ['pgn', 'pgn-row', 'pgn-bulk', 'pgn-info']],
    ['ReadOnlyField', 'molecules/ReadOnlyField', ['rof', 'rof-grid']],
    ['SegmentControl', 'molecules/SegmentControl', ['segctrl']],
    ['Splitter', 'molecules/Splitter', ['spl', 'splitpane']],
    ['StepForm', 'molecules/StepForm', ['stepform']],
    ['SubTab', 'molecules/SubTab', ['subtab', 'subtabs']],
    ['Tab', 'molecules/Tab', ['tab', 'tabs', 'tabs-scroll', 'tabs-overflow']],
    ['Toast', 'molecules/Toast', ['toast', 'toast-layer', 'toast-stack']],
    ['Tooltip', 'molecules/Tooltip', ['tip', 'tip-anchor']],
    ['AllocationBar', 'organisms/AllocationBar', ['albar', 'albar-host']],
    ['Chart', 'organisms/Chart', ['chart', 'chart-host']],
    ['Drawer', 'organisms/Drawer', ['drawer', 'drawer-scrim']],
    ['Entity', 'organisms/Entity', ['entity', 'entity-list']],
    ['Kanban', 'organisms/Kanban', ['kanban', 'kbcol', 'kbcard']],
    ['Modal', 'organisms/Modal', ['modal', 'modal-scrim']],
    ['NavPanel', 'organisms/NavPanel', ['nav', 'nav-layout']],
    ['PageHeader', 'organisms/PageHeader', ['phead']],
    ['Popover', 'organisms/Popover', ['pop', 'pop-anchor']],
    ['ProductRow', 'organisms/ProductRow', ['prow', 'prow-tree']],
    ['RiskMetric', 'organisms/RiskMetric', ['rm-block', 'rm-blocks', 'rm-body', 'rm-field']],
    ['SnackBar', 'organisms/SnackBar', ['snack', 'snack-more', 'snackbar-layer']],
    ['Table', 'organisms/Table', ['dtable', 'dtable-toolbar', 'tbl', 'th', 'col-item', 'col-list']],
    ['TableCell', 'organisms/TableCell', ['tc']],
    ['TableFilter', 'organisms/TableFilter', ['tfilter', 'tfm']],
    ['Tile', 'organisms/Tile', ['tile', 'tile-row', 'tile-group', 'tile-stack']]
  ];
  var HOME = 'components/';
  var byBlock = {};
  BLOCKS.forEach(function (b) { b[2].forEach(function (c) { byBlock[c] = b; }); });
  var namers = [];

  function root() { return typeof window.__DS_ROOT === 'string' && window.__DS_ROOT ? window.__DS_ROOT : ''; }

  /** Разбор одного класса: { block, mod, part } или null, если это не БЭМ-имя из таблицы. */
  function parseClass(c) {
    var part = '', mod = '', base = c, i;
    if ((i = base.indexOf('--')) > 0) { mod = base.slice(i + 2); base = base.slice(0, i); }
    if ((i = base.indexOf('__')) > 0) { part = base.slice(i + 2); base = base.slice(0, i); }
    return byBlock[base] ? { block: base, mod: mod, part: part } : null;
  }

  /** Компонент ДС элемента: { name, block, role: 'root' | 'part', part, mods, others, page, spec } или null.
      Первый подходящий класс называет компонент; остальные подходящие блоки (карточка канбана .kbcard
      одновременно .tile) — в others: [{ name, block, mods }]. */
  function component(el) {
    if (!el || !el.classList) return null;
    var groups = [], by = {};
    for (var i = 0; i < el.classList.length; i++) {
      var p = parseClass(el.classList[i]);
      if (!p) continue;
      var g = by[p.block];
      if (!g) { g = by[p.block] = { block: p.block, entry: byBlock[p.block], mods: [], part: '', root: false }; groups.push(g); }
      if (p.mod) g.mods.push(p.mod);
      else if (p.part) g.part = g.part || p.part;
      else g.root = true;
    }
    if (!groups.length) return null;
    var main = groups[0], found = main.entry, base = root();
    var file = found[3] || found[0];
    return {
      name: found[0], block: main.block, primary: main.block === found[2][0], role: main.root || !main.part ? 'root' : 'part', part: main.part, mods: main.mods,
      others: groups.slice(1).filter(function (g) { return g.entry[0] !== found[0]; }).map(function (g) { return { name: g.entry[0], block: g.block, mods: g.mods }; }),
      page: base ? base + HOME + found[1] + '/' + file + '.html' : '',
      spec: base ? base + HOME + found[1] + '/' + file + '.md' : ''
    };
  }

  /** Виджет проекта по маркеру сборщика: { name, group, src } или null. */
  function widget(el) {
    var n = el && el.getAttribute && el.getAttribute('data-widget');
    if (!n) return null;
    return { name: n, group: el.getAttribute('data-widget-group') || '', src: el.getAttribute('data-widget-src') || '' };
  }

  function icon(el) { return el && el.getAttribute && el.getAttribute('data-icon') || ''; }
  function illustration(el) { return el && el.getAttribute && el.getAttribute('data-illu') || ''; }

  /** Ближайший предок (не сам элемент) — компонент ДС или виджет: для строки «внутри …». */
  function context(el) {
    var out = { widget: null, ds: null };
    for (var n = el && el.parentElement; n && n !== document.documentElement; n = n.parentElement) {
      if (!out.widget && widget(n)) out.widget = widget(n);
      if (!out.ds) { var c = component(n); if (c && c.role === 'root') out.ds = c; }
      if (out.widget && out.ds) break;
    }
    return out;
  }

  /** Классы состояний ДС на элементе (is-hover, is-active …): их же ставит панель на Э6. */
  function states(el) {
    return Array.prototype.filter.call(el.classList || [], function (c) { return /^is-/.test(c); });
  }

  /** Всё про элемент разом. */
  function info(el) {
    var w = widget(el), c = component(el), i = icon(el), u = illustration(el);
    var ui = '';
    namers.forEach(function (fn) { if (ui) return; try { ui = fn({ ds: c, widget: w, icon: i, el: el }) || ''; } catch (e) { /* слой имён не должен ломать панель */ } });
    return { widget: w, ds: c, icon: i, illu: u, ui: ui, states: states(el), context: context(el) };
  }

  /** Короткое имя для ярлыка, хлебных крошек и заголовка панели; '' — нет своего имени, берётся тег с классом. */
  function name(el) {
    var w = widget(el), c = component(el), i = icon(el), u = illustration(el);
    if (w) return w.name;
    if (i) return 'icon · ' + i;
    if (u) return 'illustration · ' + u;
    if (c) return c.name + (c.primary ? '' : ' · ' + c.block) + (c.role === 'part' ? ' › ' + c.part : '');
    return '';
  }

  /** Вид элемента для знака у ярлыка слоя: 'widget' | 'icon' | 'illu' | 'ds' | '' — в той же очерёдности, что name(). */
  function kind(el) {
    if (widget(el)) return 'widget';
    if (icon(el)) return 'icon';
    if (illustration(el)) return 'illu';
    return component(el) ? 'ds' : '';
  }

  PP._ds = { info: info, name: name, kind: kind, component: component, widget: widget, context: context, addNamer: function (fn) { if (typeof fn === 'function') namers.push(fn); }, blocks: BLOCKS };
})();
