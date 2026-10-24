/* ============================================================
   FinInstrumentsTile.js — карточки финансовых инструментов сделки из данных.

   Фрагмент FinInstrumentsTile.html держит эталон всех состояний, а список
   карточек в нём — пример с макета. Страница сделки рисует карточки своей
   сделки из FinInstrumentsStore.view(); витрина — этой же функцией.

   Правила предметной области (поля по типу ФИ, производные значения из
   дерева продуктов, погашение, генерация) живут в сторе —
   data/fin-instruments-store.js. Здесь только отрисовка списка и передача
   действий; саму карточку рисует подчасть FinInstrumentCard/
   (PostCardFinInstrument, скрипт подключается раньше этого).

   API:
     PostTileFinInstruments.cardHTML(card, opts) → строка
       то же, что PostCardFinInstrument.html: card — FinInstrumentCardView;
       opts.mode — 'edit' | 'view'; opts.open — карточка развёрнута.
     PostTileFinInstruments.counts(cards) → { all, active, repaid }
     PostTileFinInstruments.stateOf(cards) → 'empty' | 'partial' | 'data'
     PostTileFinInstruments.render(tile, cards, opts)
       Перерисовывает список, счётчики вкладок и ставит data-state.
       opts.state — явное состояние ('loading' | 'updating'); opts.mode —
       режим, по умолчанию data-mode тайла; opts.canGenerate — есть ли что
       генерировать (иначе «Сгенерировать автоматически» выключена).
     PostTileFinInstruments.bind(tile, store) → off()
       Связывает тайл со стором ФИ: перерисовка на use и commit стора ФИ и
       дерева продуктов; «Сгенерировать автоматически» — store.generate().

   Действия, у которых есть исполнитель, уходят событием 'fiaction' с корня
   тайла: detail = { action, id }. Слушают его окна:
     CREATE — DealFinancialInstrumentCreateModal («+ Фин. инструмент»,
              «+ Финансовый инструмент», «Заполнить вручную»);
     EDIT   — DealFinancialInstrumentEditModal (пункт «Изменить» меню
              карточки — временный: что в меню, не решено, 02.10.2026).
     OPEN   — «→» в шапке карточки: страница сделки открывает страницу ФИ
              (FinInstrument.html);
     OPEN_NODE — заголовок связанного инструмента со своей страницей (сейчас
              транш): страница открывает страницу узла.
   «+ Добавить», ⇄ у инструмента и ссылка у кодов RWA нарисованы по
   макету и пока ничего не делают: что они делают, человек опишет позже
   (02.10.2026).
   ============================================================ */
(function () {
  'use strict';

  var ROOT = '.lc-fin-instruments';
  var LIST = '.lc-fin-instruments__list';
  var FILTERS = {
    all: function () { return true; },
    active: function (c) { return !c.isRepaid; },
    repaid: function (c) { return c.isRepaid; }
  };

  function has(v) { return v !== null && v !== undefined && v !== ''; }

  /* Карточка — подчасть FinInstrumentCard/ (FinInstrumentCard.js). */
  function cardHTML(c, opts) {
    return window.PostCardFinInstrument ? window.PostCardFinInstrument.html(c, opts) : '';
  }

  /* ── Список и счётчики ──────────────────────────────────────────── */

  function counts(cards) {
    cards = cards || [];
    var repaid = cards.filter(FILTERS.repaid).length;
    return { all: cards.length, active: cards.length - repaid, repaid: repaid };
  }

  function stateOf(cards) {
    if (!cards || !cards.length) return 'empty';
    var partial = cards.some(function (c) {
      return !c.counterparty || !(c.nodes || []).length || !has(c.fvAcCode);
    });
    return partial ? 'partial' : 'data';
  }

  /* ── Отрисовка ──────────────────────────────────────────────────── */

  /* Что развёрнуто и какая вкладка выбрана — переживает перерисовку, пока
     открыта страница. По умолчанию развёрнута первая карточка (макет). */
  function memoOf(tile) {
    if (!tile.__fiMemo) {
      tile.__fiMemo = { open: {}, filter: 'all' };
      tile.addEventListener('tiletoggle', function (e) {
        var card = e.target.closest && e.target.closest('.lc-fin-card');
        var id = card && card.getAttribute('data-fi-id');
        if (id) tile.__fiMemo.open[id] = !(e.detail && e.detail.collapsed);
      });
    }
    return tile.__fiMemo;
  }

  function paintTabs(tile, n, memo) {
    var tabs = tile.querySelectorAll('[data-fi-filter]');
    Array.prototype.forEach.call(tabs, function (tab) {
      var key = tab.getAttribute('data-fi-filter');
      var count = n[key] || 0;
      var badge = tab.querySelector('.tab__badge');
      if (badge) { badge.textContent = String(count); badge.hidden = count === 0; }
      /* пустая вкладка выключена (макет: «Погашенные» без счётчика) */
      if (count === 0 && key !== 'all') tab.setAttribute('aria-disabled', 'true');
      else tab.removeAttribute('aria-disabled');
    });
    if (memo.filter !== 'all' && !n[memo.filter]) memo.filter = 'all';
    Array.prototype.forEach.call(tabs, function (tab) {
      var on = tab.getAttribute('data-fi-filter') === memo.filter;
      tab.classList.toggle('tab--selected', on);
      tab.setAttribute('aria-selected', on ? 'true' : 'false');
      tab.setAttribute('tabindex', on ? '0' : '-1');
    });
  }

  function render(tile, cards, opts) {
    if (!tile) return;
    opts = opts || {};
    cards = cards || [];
    var mode = opts.mode || tile.getAttribute('data-mode') || 'edit';
    var memo = memoOf(tile);
    var n = counts(cards);

    /* меню открытой карточки и тултип под курсором уходят вместе со списком */
    if (window.DSMenu) window.DSMenu.closeAll();
    if (window.DSTooltip) window.DSTooltip.hideAll();

    paintTabs(tile, n, memo);
    var shown = cards.filter(FILTERS[memo.filter] || FILTERS.all);
    var list = tile.querySelector(LIST);
    if (list) {
      list.innerHTML = shown.map(function (c, i) {
        var open = memo.open[c.id] != null ? memo.open[c.id] : i === 0;
        return cardHTML(c, { mode: mode, open: open });
      }).join('');
    }
    var gen = tile.querySelector('[data-fi-act="GENERATE"]');
    if (gen) gen.disabled = opts.canGenerate === false;

    tile.setAttribute('data-mode', mode);
    tile.setAttribute('data-state', opts.state || stateOf(cards));

    if (window.dsIcons) window.dsIcons.apply(tile);
    if (window.DSMenu) window.DSMenu.bindAll(tile);
    if (window.DSModal) window.DSModal.bindAll(tile);
    if (window.DSTooltip) window.DSTooltip.bindAll(tile);
    if (window.DSRiskMetric) window.DSRiskMetric.mount(tile);
    if (window.DSTile && list) {
      list.querySelectorAll('.lc-fin-card').forEach(function (card) { window.DSTile.wire(card); });
    }
  }

  /* ── Действия ───────────────────────────────────────────────────── */

  function emit(tile, action, id) {
    tile.dispatchEvent(new CustomEvent('fiaction', { bubbles: true, detail: { action: action, id: id || null } }));
  }

  function bind(tile, store) {
    if (!tile || !store) return function () {};
    var trees = window.ProductTreeStore;
    var paint = function () {
      render(tile, store.view(), { canGenerate: store.generatable().length > 0 });
    };
    var offs = [
      store.on('change', function (d) { if (d.reason === 'use') paint(); }),
      store.on('commit', paint)
    ];
    if (trees) {
      offs.push(trees.on('change', function (d) { if (d.reason === 'use') paint(); }));
      offs.push(trees.on('commit', paint));
    }
    tile.__fiPaint = paint;
    tile.__fiAct = function (action, id) {
      if (action === 'GENERATE') { store.generate(); return; }
      emit(tile, action, id);
    };
    paint();
    return function off() {
      offs.forEach(function (f) { f(); });
      tile.__fiAct = null;
      tile.__fiPaint = null;
    };
  }

  /* Пункты меню открытой карточки рантайм держит в общем слое DSFloat, вне
     тайла: их тайл восстанавливается по кнопке-триггеру меню (Л88). */
  function ownerOf(el) {
    var menu = el.closest('.menu');
    if (menu && menu.id) {
      var trigger = document.querySelector('[data-menu="' + menu.id + '"]');
      return trigger ? trigger.closest(ROOT) : null;
    }
    return el.closest(ROOT);
  }

  document.addEventListener('click', function (e) {
    /* Заголовок-ссылка карточки — href="#" только ради курсора и фокуса:
       перехода по нему быть не должно. Ссылка без действия (страница ещё не
       собрана) тоже не прыгает наверх. */
    var link = e.target.closest && e.target.closest(ROOT + ' .prow__title--link[href="#"]');
    if (link) e.preventDefault();
    var el = e.target.closest && e.target.closest('[data-fi-act]');
    if (!el || el.disabled || el.getAttribute('aria-disabled') === 'true') return;
    var tile = ownerOf(el);
    if (!tile) return;
    var action = el.getAttribute('data-fi-act');
    var id = el.getAttribute('data-fi-id');
    if (tile.__fiAct) tile.__fiAct(action, id);
    else emit(tile, action, id);
  });

  /* Вкладки: выбор ведёт рантайм Tab (data-tabs), список фильтрует тайл —
     по выбранной вкладке после клика или клавиши, а не по onChange: рантайм
     мог привязать группу раньше скрипта тайла. Выбор читается макрозадачей
     (setTimeout 0) — после всей рассылки события, в каком бы порядке ни были
     привязаны слушатели. Микрозадача не годится: при настоящем клике браузер
     выполняет её сразу после слушателя тайла, до рантайма, — фильтр отставал
     на клик (урок Л203; синтетический клик смоука этого не воспроизводит). */
  function watchTabs(tile) {
    var bar = tile && tile.querySelector('[data-fi-tabs]');
    if (!bar || bar.__fiWatch) return;
    bar.__fiWatch = true;
    function sync() {
      setTimeout(function () {
        var sel = bar.querySelector('[data-fi-filter][aria-selected="true"]');
        var key = sel && sel.getAttribute('data-fi-filter');
        var memo = memoOf(tile);
        if (!key || key === memo.filter) return;
        memo.filter = key;
        if (tile.__fiPaint) tile.__fiPaint();
      }, 0);
    }
    bar.addEventListener('click', sync);
    bar.addEventListener('keydown', sync);
  }

  function wireTabs(root) {
    (root || document).querySelectorAll(ROOT).forEach(watchTabs);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { wireTabs(document); });
  else wireTabs(document);

  window.PostTileFinInstruments = {
    cardHTML: cardHTML, counts: counts, stateOf: stateOf, render: render, bind: bind, watchTabs: watchTabs
  };
})();
