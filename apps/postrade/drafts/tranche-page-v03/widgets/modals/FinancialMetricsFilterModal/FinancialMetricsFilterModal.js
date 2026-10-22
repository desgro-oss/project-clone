/* ============================================================
   FinancialMetricsFilterModal.js — окно «Фильтр» отчёта финансовых метрик.

   Окно — компонент без сети и без стора: что в нём выбирать и что уже выбрано,
   ему отдаёт страница при каждом открытии. Одно окно обслуживает все вкладки
   отчёта (МСФО, РСБУ, KPI): у каждой вкладки свои финансовые инструменты (ФИ) и
   свои индикаторы, поэтому всё заполняется заново на каждое открытие.

   Что делает скрипт сверх рантаймов ДС (в них этого нет — это модель данных):
     1. Мультивыбор с чипами. Список с чекбоксами и «Выбрать всё» — DSDropdownList,
        открытие, клавиатуру и крестик очистки ведут рантаймы ДС; чипы в поле,
        фильтрацию списка по набранному тексту (с подсветкой совпадения) и
        состояние выбора держит этот файл.
     2. Поле индикаторов на каждый выбранный ФИ. Подпись поля — имя ФИ, пустое поле
        значит «все индикаторы». Убрали ФИ — его поле исчезает вместе с выбором,
        добавили — поле появляется следом, в порядке выбора.
     3. Счётчик на табе раздела — число выбранных ФИ; при нуле бейдж скрыт.
     4. Результат: «Применить» закрывает окно и отдаёт значение, закрытие
        крестиком или Esc отдаёт null. «Очистить фильтр» сбрасывает поля окна и
        окно не закрывает.

   Значение фильтра — FmFilterValue:
     { fiIds: string[], metrics: { [fiId: string]: string[] } }
     metrics[fiId] — коды выбранных индикаторов этого ФИ; нет ключа или пусто — все
     индикаторы. Пустой фильтр — { fiIds: [], metrics: {} }.

   API: window.PostFinMetricsFilter
     bind(scrim)                    — один раз привязать окно; scrim — корень
                                      фрагмента (.modal-scrim, id fm-filter-scrim);
                                      повторный вызов возвращает уже привязанное.
                                      open() привязывает окно сам, если его нашёл по id
     open({ title?, indicators, value }) → Promise<FmFilterValue | null>
       title       — заголовок окна; по умолчанию «Фильтр»
       indicators  — [{ fiId, fiName, currencyCode, metrics: [{ code, name }] }] —
                     ФИ вкладки и их индикаторы (структура
                     FinMetricsStore.indicators(tab); стор отсюда не читается);
                     пусто — окно не открывается, результат null
       value       — текущий фильтр вкладки; окно заполняется им
       Результат: по «Применить» — значение, в котором только ФИ из indicators и
       только коды, которые есть у своего ФИ; закрыли без применения — null.
       Повторный open при открытом окне возвращает тот же промис.
     preview(scrim, { title?, indicators, value }) → scrim | null
                                    — то же заполнение, что в open, но окно остаётся на месте,
                                      без слоя поверх страницы (витрина локальных компонентов);
                                      прежний сеанс сбрасывается. Окон на витрине несколько:
                                      текущим становится то, в которое зашли
     empty() → FmFilterValue        — пустой фильтр
     normalize(value, indicators)   — привести значение к indicators: убрать чужие ФИ
                                      и чужие коды, повторы, пустые списки индикаторов
   ============================================================ */
(function () {
  'use strict';

  var SCRIM_ID = 'fm-filter-scrim';
  var DEFAULT_TITLE = 'Фильтр';
  var PLACEHOLDER_ALL = 'Все индикаторы';
  var PLACEHOLDER_NONE = 'Нет индикаторов';

  var ui = null;       // привязанное окно: узлы и поля
  var session = null;  // открытый сеанс: данные вкладки и выбор
  var uid = 0;         // номера полей индикаторов: id уникальны и между окнами витрины

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function norm(s) { return String(s == null ? '' : s).trim().toLowerCase(); }
  function dict() { return Object.create(null); }
  function applyIcons(el) { if (window.dsIcons) window.dsIcons.apply(el); }
  function syncInput(inp) { if (window.DSInput) window.DSInput.sync(inp); }

  /* ---------- значение фильтра ---------- */

  function emptyValue() { return { fiIds: [], metrics: {} }; }

  /* ФИ и индикаторы вкладки: без повторов и без записей без кода. */
  function cleanIndicators(src) {
    var seen = dict();
    var out = [];
    (Array.isArray(src) ? src : []).forEach(function (it) {
      if (!it || it.fiId == null) return;
      var id = String(it.fiId);
      if (seen[id]) return;
      seen[id] = true;
      var codes = dict();
      var metrics = [];
      (Array.isArray(it.metrics) ? it.metrics : []).forEach(function (m) {
        if (!m || m.code == null) return;
        var code = String(m.code);
        if (codes[code]) return;
        codes[code] = true;
        metrics.push({ code: code, name: m.name == null ? code : String(m.name) });
      });
      out.push({
        fiId: id,
        fiName: it.fiName == null ? id : String(it.fiName),
        currencyCode: it.currencyCode,
        metrics: metrics
      });
    });
    return out;
  }

  function byFiId(inds) {
    var map = dict();
    inds.forEach(function (i) { map[i.fiId] = i; });
    return map;
  }

  /* Привести значение к ФИ вкладки. Порядок — как в значении: он же порядок
     полей в окне. */
  function normalize(value, indicators) {
    var inds = cleanIndicators(indicators);
    var map = byFiId(inds);
    var src = value && typeof value === 'object' ? value : {};
    var srcMetrics = src.metrics && typeof src.metrics === 'object' ? src.metrics : {};
    var ids = [];
    var metrics = {};
    (Array.isArray(src.fiIds) ? src.fiIds : []).forEach(function (raw) {
      var id = String(raw);
      if (!map[id] || ids.indexOf(id) >= 0) return;
      ids.push(id);
    });
    ids.forEach(function (id) {
      var raw = srcMetrics[id];
      if (!Array.isArray(raw)) return;
      var known = map[id].metrics.map(function (m) { return m.code; });
      var codes = [];
      raw.forEach(function (c) {
        var code = String(c);
        if (known.indexOf(code) >= 0 && codes.indexOf(code) < 0) codes.push(code);
      });
      if (codes.length) metrics[id] = codes;
    });
    return { fiIds: ids, metrics: metrics };
  }

  /* Выбор в окне → значение для вкладки. Пустой список индикаторов — «все», ключа нет. */
  function collect() {
    var ids = session.fiIds.slice();
    var metrics = {};
    ids.forEach(function (id) {
      var codes = session.metrics[id];
      if (codes && codes.length) metrics[id] = codes.slice();
    });
    return { fiIds: ids, metrics: metrics };
  }

  /* ---------- поле мультивыбора ---------- */

  /* Разметка поля — та же, что у «Финансовых инструментов» во фрагменте: поле
     индикаторов — такой же InputAutocomplete с чипами. Крестик очистки в разметку не
     кладётся: его ставит и показывает рантайм поля, по значению. */
  function fieldHTML(id, label, placeholder, disabled) {
    return '<div class="inp inp--m tfm__span-2' + (disabled ? ' inp--disabled' : '') + '">'
      + '<label class="ds-label" for="' + id + '"><span class="ds-label__text">' + esc(label) + '</span></label>'
      + '<div class="inp__field" data-ddl="' + id + '-list">'
      + '<span class="inp__chips"></span>'
      + '<input class="inp__control" id="' + id + '" autocomplete="off" placeholder="' + esc(placeholder) + '"' + (disabled ? ' disabled' : '') + '>'
      + '<span class="inp__acts"><button type="button" class="inp__act inp__act--chev" aria-label="Показать список"' + (disabled ? ' disabled' : '') + '><i data-icon="chevron-down"></i></button></span>'
      + '</div>'
      + '<div id="' + id + '-list" class="ddl ddl--floating ddl--scroll" role="listbox" aria-multiselectable="true"></div>'
      + '</div>';
  }

  function rowHTML(opt, on, query) {
    var label = opt.label;
    var at = query ? norm(label).indexOf(query) : -1;
    var text = at < 0
      ? esc(label)
      : esc(label.slice(0, at)) + '<span class="ddl__match">' + esc(label.slice(at, at + query.length)) + '</span>' + esc(label.slice(at + query.length));
    return '<button type="button" class="ddl__item ddl__item--checkbox" role="option" aria-checked="' + (on ? 'true' : 'false') + '" data-value="' + esc(opt.value) + '">'
      + '<span class="ddl__item-check"><span class="cb__box"><span class="cb__mark"><i data-icon="check"></i></span></span></span>'
      + '<span class="ddl__item-body"><span class="ddl__item-label">' + text + '</span></span></button>';
  }

  function allRowHTML(state) {
    return '<button type="button" class="ddl__item ddl__item--checkbox ddl__item--all" role="option" aria-checked="' + state + '">'
      + '<span class="ddl__item-check"><span class="cb__box"><span class="cb__mark"><i data-icon="' + (state === 'mixed' ? 'minus' : 'check') + '"></i></span></span></span>'
      + '<span class="ddl__item-body"><span class="ddl__item-label">Выбрать всё</span></span></button>';
  }

  function chipEl(value, label) {
    var chip = document.createElement('span');
    chip.className = 'chip chip--edit chip--s';
    chip.tabIndex = 0;
    chip.setAttribute('data-value', value);
    chip.innerHTML = '<span class="chip__label">' + esc(label) + '</span>'
      + '<span class="chip__remove" role="button" aria-label="Удалить ' + esc(label) + '"><i data-icon="close"></i></span>';
    return chip;
  }

  /* Поле мультивыбора поверх разметки root (.inp). Выбор живёт не в поле, а в
     сеансе: поле спрашивает его у cfg.selected() и сообщает об изменениях в
     cfg.toggle / setMany / clear, а затем в cfg.changed().
     cfg: { options() → [{ value, label }], selected() → string[], placeholder,
            disabled, toggle(value, on), setMany(values, on), clear(), changed() } */
  function makeField(root, cfg) {
    var field = root.querySelector('.inp__field');
    var chips = root.querySelector('.inp__chips');
    var input = root.querySelector('.inp__control');
    var list = root.querySelector('.ddl');

    function labelOf(value) {
      var opts = cfg.options();
      for (var i = 0; i < opts.length; i++) if (opts[i].value === value) return opts[i].label;
      return value;
    }

    function listHTML() {
      var query = norm(input.value);
      var selected = cfg.selected();
      var shown = cfg.options().filter(function (o) { return !query || norm(o.label).indexOf(query) >= 0; });
      if (!shown.length) return '<div class="ddl__state ddl__state--empty">Ничего не найдено</div>';
      var on = shown.filter(function (o) { return selected.indexOf(o.value) >= 0; }).length;
      var state = on === shown.length ? 'true' : (on ? 'mixed' : 'false');
      return allRowHTML(state) + '<hr class="ddl__divider">'
        + shown.map(function (o) { return rowHTML(o, selected.indexOf(o.value) >= 0, query); }).join('');
    }

    function renderList() {
      list.innerHTML = listHTML();
      applyIcons(list);
    }

    function renderChips() {
      var selected = cfg.selected();
      chips.innerHTML = '';
      selected.forEach(function (v) { chips.appendChild(chipEl(v, labelOf(v))); });
      applyIcons(chips);
      input.placeholder = selected.length ? '' : cfg.placeholder;
      syncInput(root);
    }

    function render() {
      renderChips();
      renderList();
    }

    /* Набранный текст — запрос к списку, а не значение: с поля он уходит, когда
       фокус ушёл и из поля, и из списка. */
    function dropQuery() {
      if (!input.value) return;
      input.value = '';
      renderList();
      syncInput(root);
    }

    function openList() {
      var api = field.__dsDdl;
      if (!api) return;
      if (api.isOpen()) api.place(); else api.open();
    }

    function remove(value) {
      cfg.toggle(value, false);
      render();
      cfg.changed();
      input.focus();
    }

    if (!cfg.disabled && window.DSDropdownList) {
      /* Привязка — до собственного слушателя списка: обработчик ДС переключает
         чекбокс первым, этот читает уже готовое состояние. Без multiple:
         в этом режиме пробел в поле выбирал бы опцию, а не писался в запрос. */
      window.DSDropdownList.bind(field, { list: list });
    }

    list.addEventListener('click', function (e) {
      var item = e.target.closest ? e.target.closest('.ddl__item--checkbox') : null;
      if (!item || item.getAttribute('aria-disabled') === 'true') return;
      var on = item.getAttribute('aria-checked') === 'true';
      if (item.classList.contains('ddl__item--all')) {
        var values = Array.prototype.map.call(
          list.querySelectorAll('.ddl__item--checkbox:not(.ddl__item--all)'),
          function (r) { return r.getAttribute('data-value'); }
        );
        cfg.setMany(values, on);
      } else {
        cfg.toggle(item.getAttribute('data-value'), on);
      }
      renderChips();
      cfg.changed();
    });

    /* Чип: крестик и Backspace/Delete на сфокусированном чипе. Слушатель стоит на
       стеке чипов и гасит событие: рантайм чипа иначе снял бы узел сам, а выбор
       остался бы в сеансе; поле-триггер списка — раскрыл бы список. */
    chips.addEventListener('click', function (e) {
      var rm = e.target.closest ? e.target.closest('.chip__remove') : null;
      if (!rm) return;
      var chip = rm.closest('.chip');
      if (!chip) return;
      e.stopPropagation();
      remove(chip.getAttribute('data-value'));
    });
    chips.addEventListener('keydown', function (e) {
      if (e.key !== 'Backspace' && e.key !== 'Delete') return;
      var chip = e.target.closest ? e.target.closest('.chip') : null;
      if (!chip || chip !== e.target) return;
      e.preventDefault();
      e.stopPropagation();
      remove(chip.getAttribute('data-value'));
    });

    input.addEventListener('input', function () {
      renderList();
      if (input.value) openList();
      else if (field.__dsDdl && field.__dsDdl.isOpen()) field.__dsDdl.place();
    });
    /* Backspace в пустом поле снимает последнее значение (правило InputAutocomplete). */
    input.addEventListener('keydown', function (e) {
      if (e.key !== 'Backspace' || input.value) return;
      var selected = cfg.selected();
      if (!selected.length) return;
      e.preventDefault();
      remove(selected[selected.length - 1]);
    });

    /* Крестик очистки поля (рантайм ДС уже стёр текст и чипы) снимает весь выбор поля. */
    root.addEventListener('ds-input:clear', function () {
      cfg.clear();
      input.value = '';
      render();
      cfg.changed();
    });

    function leave() {
      setTimeout(function () {
        var active = document.activeElement;
        if (active && (root.contains(active) || list.contains(active))) return;
        dropQuery();
      }, 0);
    }
    root.addEventListener('focusout', leave);
    list.addEventListener('focusout', leave);

    return {
      root: root,
      render: render,
      reset: function () { input.value = ''; render(); },
      focus: function () { input.focus(); },
      destroy: function () {
        var api = field.__dsDdl;
        if (api && api.isOpen()) api.close();
        if (list.parentNode) list.parentNode.removeChild(list);
        if (root.parentNode) root.parentNode.removeChild(root);
      }
    };
  }

  /* ---------- выбор в сеансе ---------- */

  function setFi(id, on) {
    var ids = session.fiIds;
    var at = ids.indexOf(id);
    if (on && at < 0) {
      ids.push(id);
      if (!session.metrics[id]) session.metrics[id] = [];
    } else if (!on && at >= 0) {
      ids.splice(at, 1);
      delete session.metrics[id];
    }
  }

  function setMetric(id, code, on) {
    var codes = session.metrics[id] || (session.metrics[id] = []);
    var at = codes.indexOf(code);
    if (on && at < 0) codes.push(code);
    else if (!on && at >= 0) codes.splice(at, 1);
  }

  function updateBadge() {
    var n = session ? session.fiIds.length : 0;
    ui.badge.textContent = String(n);
    ui.badge.hidden = n === 0;
  }

  /* «Очистить фильтр» выключена, пока очищать нечего. */
  function updateClear() {
    ui.clear.disabled = !session || session.fiIds.length === 0;
  }

  function createMetricField(fi) {
    var id = 'fmf-m' + (++uid);
    var none = fi.metrics.length === 0;
    var holder = document.createElement('div');
    holder.innerHTML = fieldHTML(id, fi.fiName, none ? PLACEHOLDER_NONE : PLACEHOLDER_ALL, none);
    var root = holder.firstElementChild;
    applyIcons(root);
    return makeField(root, {
      placeholder: none ? PLACEHOLDER_NONE : PLACEHOLDER_ALL,
      disabled: none,
      options: function () { return fi.metrics.map(function (m) { return { value: m.code, label: m.name }; }); },
      selected: function () { return session ? (session.metrics[fi.fiId] || (session.metrics[fi.fiId] = [])) : []; },
      toggle: function (code, on) { if (session) setMetric(fi.fiId, code, on); },
      setMany: function (codes, on) { if (session) codes.forEach(function (c) { setMetric(fi.fiId, c, on); }); },
      clear: function () { if (session) session.metrics[fi.fiId] = []; },
      changed: updateClear
    });
  }

  /* Поля индикаторов — по одному на выбранный ФИ, в порядке выбора, сразу за полем ФИ. */
  function syncFields() {
    var ids = session.fiIds;
    Object.keys(ui.fields).forEach(function (id) {
      if (ids.indexOf(id) >= 0) return;
      ui.fields[id].destroy();
      delete ui.fields[id];
    });
    ids.forEach(function (id, n) {
      var f = ui.fields[id];
      if (!f) {
        f = ui.fields[id] = createMetricField(session.byId[id]);
        f.render();
      }
      var at = ui.grid.children[n + 1] || null;
      if (f.root !== at) ui.grid.insertBefore(f.root, at);
    });
  }

  function onFiChanged() {
    syncFields();
    updateBadge();
    updateClear();
  }

  function clearAll() {
    if (!session) return;
    session.fiIds = [];
    session.metrics = dict();
    ui.fi.reset();
    syncFields();
    updateBadge();
    updateClear();
    /* Кнопка, на которой стоял фокус, только что выключилась. */
    ui.fi.focus();
  }

  function apply() {
    if (!session) return;
    session.result = collect();
    if (session.layer) session.layer.close(true);
  }

  function onClose(ok) {
    var s = session;
    if (!s) return;
    session = null;
    if (ui) ui.sess = null;
    if (window.DSDropdownList) window.DSDropdownList.closeAll();
    s.resolve(ok && s.result ? s.result : null);
  }

  /* ---------- привязка и открытие ---------- */

  function bind(scrim) {
    if (!scrim) return null;
    if (scrim.__fmFilterUi) { ui = scrim.__fmFilterUi; return api; }
    var next = {
      scrim: scrim,
      title: scrim.querySelector('.modal__title'),
      grid: scrim.querySelector('[data-fmf-grid]'),
      badge: scrim.querySelector('.tab__badge'),
      clear: scrim.querySelector('[data-fmf-clear]'),
      apply: scrim.querySelector('[data-fmf-apply]'),
      fiRoot: scrim.querySelector('[data-fmf-fi]'),
      fi: null,
      fields: dict()
    };
    if (!next.title || !next.grid || !next.badge || !next.clear || !next.apply || !next.fiRoot) return null;
    ui = next;
    scrim.__fmFilterUi = next;
    /* Окон на странице обычно одно. На витрине их несколько (живое и копии «Все состояния»), а узлы и
       сеанс — общие на скрипт: окно, в которое зашли, становится текущим вместе со своим сеансом. */
    ['pointerdown', 'focusin', 'keydown'].forEach(function (type) {
      scrim.addEventListener(type, function () {
        if (ui === next) return;
        ui = next;
        session = next.sess || null;
      }, true);
    });

    next.fi = makeField(next.fiRoot, {
      placeholder: next.fiRoot.querySelector('.inp__control').getAttribute('placeholder') || '',
      options: function () {
        return session ? session.indicators.map(function (i) { return { value: i.fiId, label: i.fiName }; }) : [];
      },
      selected: function () { return session ? session.fiIds : []; },
      toggle: function (id, on) { if (session) setFi(id, on); },
      setMany: function (ids, on) { if (session) ids.forEach(function (id) { setFi(id, on); }); },
      clear: function () { if (session) { session.fiIds = []; session.metrics = dict(); } },
      changed: onFiChanged
    });

    next.clear.addEventListener('click', clearAll);
    next.apply.addEventListener('click', apply);
    return api;
  }

  /* Сеанс и заполнение окна по данным вкладки; слой поверх страницы — забота open. */
  function start(opts) {
    var inds = cleanIndicators(opts.indicators);
    if (!inds.length) return null;
    if (!ui) bind(document.getElementById(SCRIM_ID));
    if (!ui) return null;

    var resolve;
    var promise = new Promise(function (r) { resolve = r; });
    var value = normalize(opts.value, inds);
    var metrics = dict();
    value.fiIds.forEach(function (id) { metrics[id] = (value.metrics[id] || []).slice(); });
    session = {
      promise: promise,
      resolve: resolve,
      indicators: inds,
      byId: byFiId(inds),
      fiIds: value.fiIds.slice(),
      metrics: metrics,
      result: null,
      layer: null
    };

    var title = typeof opts.title === 'string' ? opts.title.trim() : '';
    ui.title.textContent = title || DEFAULT_TITLE;

    /* Поля индикаторов прошлого открытия — от другой вкладки: строятся заново. */
    Object.keys(ui.fields).forEach(function (id) { ui.fields[id].destroy(); });
    ui.fields = dict();
    ui.fi.reset();
    syncFields();
    updateBadge();
    updateClear();
    ui.sess = session;
    return session;
  }

  function open(opts) {
    opts = opts || {};
    if (session) return session.promise;
    if (!start(opts)) return Promise.resolve(null);
    var s = session;

    var layer = window.DSModal ? window.DSModal.open(ui.scrim, { onClose: onClose }) : null;
    if (!layer) {
      session = null;
      ui.sess = null;
      s.resolve(null);
      return s.promise;
    }
    s.layer = layer;
    return s.promise;
  }

  /* Окно на месте, без слоя поверх страницы — для витрины локальных компонентов: заполняется
     теми же данными, что в open, поля живые, «Применить» только собирает значение. Прежний
     сеанс сбрасывается, чтобы окно можно было перерисовать другими данными. */
  function preview(scrim, opts) {
    if (!bind(scrim)) return null;
    if (window.DSDropdownList) window.DSDropdownList.closeAll();
    session = null;
    ui.sess = null;
    return start(opts || {}) ? ui.scrim : null;
  }

  var api = {
    bind: bind,
    open: open,
    preview: preview,
    empty: emptyValue,
    normalize: normalize
  };
  window.PostFinMetricsFilter = api;
})();
