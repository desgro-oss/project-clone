/* ============================================================
   kit-docpage.js — рантайм страницы компонента витрины.

   Страницы компонентов собирает kit-build.mjs: реальный фрагмент виджета
   уже вшит в стенд демо (#pg-stage), его окна — в конец body, скрипты данных
   и виджетов — как на странице-хозяине. Каркас и табы держит слой ДС
   (docs-split.css + docs-split.js), оглавление он собирает сам. Этот модуль
   закрывает то, чего в слое ДС нет:

   1. Конструктор. Оси — из CSS виджета: состояния данных (data-state) и
      режимы прав (data-mode); у тайла и таблицы ещё ширина. Все выборы
      создаются селектами — docs-split.js сам делает из да/нет свитч, из 2–3
      вариантов ButtonGroup, 4 и больше оставляет списком (правило §11).
   2. Демо. Переключатели меняют атрибуты на ЖИВОМ фрагменте, а не
      пересобирают его: скрипт окна держит ссылки на свои узлы, и замена
      разметки оборвала бы его поведение.
   3. «Все состояния рядом» — копии исходного фрагмента, по одной на пару
      «состояние × режим». id в копиях получают суффикс, чтобы не задвоиться.
      Копии строятся поверх значений конструктора и перерисовываются, когда
      меняется контрол, которого копии сами не задают (RE0028).
   4. Сценарий демо. Необязательный <Имя>.demo.js рядом со страницей
      регистрирует его до загрузки страницы:
        IBPKitDemo.register('<Имя>', {
          states: ['partial'],                  // состояния, которые различают
                                                // данные, а не CSS виджета
          labels: { data: 'Есть данные' },      // свои подписи состояний и режимов
          controls: function (defs) { return defs.concat([...]); },  // свои контролы
          apply: function (el, st, ctx) { … },  // наполнить узел данными;
                                                // ctx.fixtures — fixtures.json,
                                                // ctx.live — живой фрагмент или копия
          cases: function (defs, ctx) { … },    // свой набор копий «Все состояния»:
                                                // [{ label, st }], st — поверх
                                                // текущих значений конструктора
          matrix: { cols: [...], rows: [...] }, // вместо cases: копии сеткой по осям
                                                // (п. 6), объект или функция (defs, ctx)
          gallery: true,                        // проба: переключатель вида в зоне
                                                // демо «Одно состояние | Все состояния»
          perRow: 2,                            // не больше двух копий в ряд (п. 3)
          minHeight: 0                          // исключение из минимума тайла (п. 7)
        });
   5. «Все состояния» в зоне демо (gallery сценария, пробно). Над стендом —
      SegmentControl ДС; во втором виде стенд скрыт, вместо него — те же
      копии, что в разделе документации, шириной со слайдера конструктора.
      Выбор вида помнит браузер зрителя (localStorage, без него — один вид).
   6. Матрица (matrix сценария, RE0027). Колонки — значения одной оси, строки —
      другой; подписи осей — заголовками, а не над каждой копией:
        { cols: ['Редактирование доступно', …],
          rows: [{ label: 'Есть данные', note: 'условия выполнены',
                   cells: [{ st: {…} }, …] },
                 { label: 'Условия не выполнены', cells: [{ st: {…}, span: true }] }] }
      span — одна ячейка на всю строку (ось колонок на вид не влияет), тайл в ней
      той же ширины. Плоский список копий (cases) выводится из матрицы.
      Ячейка, совпавшая с текущими значениями конструктора, подсвечена бледным
      фоном под тайлом. Совпадение — по match ячейки (по умолчанию её st):
      { calc: 'required' } — ячейка подсвечена при любых прочих значениях.
   7. Минимальная высота тайла — 200px, как на странице сделки; меньше —
      исключение полем minHeight сценария (с причиной в комментарии). Пока
      проба, правило включено только у сценариев с gallery.

   Вызов — из страницы: IBPKitDoc.page(window.IBPKitPage).
   ============================================================ */
(function () {
  'use strict';

  var STATE_LABELS = {
    loading: 'Загрузка', data: 'Данные есть', partial: 'Заполнено частично', empty: 'Данных нет',
    error: 'Ошибка', updating: 'Обновление'
  };
  var MODE_LABELS = { edit: 'Редактирование', view: 'Только просмотр', select: 'Выбор' };
  var STATE_ORDER = ['loading', 'data', 'partial', 'empty', 'error', 'updating'];
  var label = function (map, v) { return map[v] || v; };
  /* Порядок контролов конструктора по ключу (раздел 3 канона): оси, вариант,
     пример, длинные значения, свои — по порядку сценария, ширина — последней. */
  var CONTROL_ORDER = { state: 0, mode: 1, variant: 2, example: 3, long: 4, width: 6 };
  var rankOf = function (d) { var r = CONTROL_ORDER[d.key]; return r === undefined ? 5 : r; };
  /* Минимум тайла — тот же, что у .screen__content .tile страницы сделки. */
  var TILE_MIN_HEIGHT = 200;

  /* ---------- контролы конструктора (разметка — конвенция ДС: .ctl > .lbl + контрол) ---------- */
  function makeSelect(def, state, onChange) {
    var wrap = document.createElement('div');
    wrap.className = 'ctl';
    var lbl = document.createElement('div');
    lbl.className = 'lbl';
    lbl.textContent = def.label;
    wrap.appendChild(lbl);
    var box = document.createElement('div');
    box.className = 'pg-select';
    var sel = document.createElement('select');
    var options = def.bool ? [['no', 'Нет'], ['yes', 'Да']] : def.options;
    var cur = def.bool ? (state[def.key] ? 'yes' : 'no') : String(state[def.key]);
    options.forEach(function (pair) {
      var op = document.createElement('option');
      op.value = pair[0];
      op.textContent = pair[1];
      if (pair[0] === cur) op.selected = true;
      sel.appendChild(op);
    });
    sel.addEventListener('change', function () {
      state[def.key] = def.bool ? sel.value === 'yes' : sel.value;
      onChange(state);
    });
    box.appendChild(sel);
    wrap.appendChild(box);
    return wrap;
  }

  /* Демо перерисовывается на каждом шаге слайдера: перестроение по ширине
     видно, пока тянешь. */
  function makeRange(def, state, onChange) {
    var wrap = document.createElement('div');
    wrap.className = 'ctl';
    var lbl = document.createElement('div');
    lbl.className = 'lbl';
    var val = document.createElement('b');
    lbl.appendChild(document.createTextNode(def.label + ' · '));
    lbl.appendChild(val);
    wrap.appendChild(lbl);
    var input = document.createElement('input');
    input.type = 'range';
    input.min = String(def.range.min);
    input.max = String(def.range.max);
    input.step = String(def.range.step || 1);
    input.value = String(state[def.key]);
    input.setAttribute('aria-label', def.label);
    val.textContent = input.value;
    input.addEventListener('input', function () {
      state[def.key] = Number(input.value);
      val.textContent = input.value;
      onChange(state);
    });
    wrap.appendChild(input);
    return wrap;
  }

  /* docs-split.js раскладывает контролы на DOMContentLoaded; слайдеры по
     конвенции стоят справа, в .toggles, — переносим их после раскладки. */
  function placeRanges(host, ranges) {
    if (!ranges.length) return;
    function move() {
      setTimeout(function () {
        var toggles = host.querySelector('.toggles');
        if (toggles) ranges.forEach(function (r) { toggles.appendChild(r); });
      }, 0);
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', move);
    else move();
  }

  function controls(defs, onChange) {
    var host = document.getElementById('pg-controls');
    var state = {};
    var switches = window.DS_SPLIT_SWITCH_LABELS || (window.DS_SPLIT_SWITCH_LABELS = {});
    defs.forEach(function (d) {
      if (d.bool) { state[d.key] = !!d.value; switches[d.label] = switches[d.label] || d.label; }
      else if (d.range) state[d.key] = d.value !== undefined ? Number(d.value) : d.range.min;
      else state[d.key] = d.value !== undefined && d.value !== null ? d.value : d.options[0][0];
    });
    if (host) {
      if (!defs.length) {
        host.insertAdjacentHTML('beforeend', '<p class="kit-controls__empty">Переключать нечего: у компонента одно состояние и один режим.</p>');
      }
      var ranges = [];
      defs.forEach(function (d) {
        if (d.range) { var r = makeRange(d, state, onChange); ranges.push(r); host.appendChild(r); }
        else host.appendChild(makeSelect(d, state, onChange));
      });
      placeRanges(host, ranges);
    }
    onChange(state);
    return state;
  }

  /* ---------- рантаймы ДС после правки разметки ---------- */
  /* Привязки ДС идемпотентны (метки __ds… на узлах), поэтому звать можно
     сколько угодно раз; свежим узлам без них не заработать. */
  function paint(root) {
    var w = window;
    if (w.dsIcons) w.dsIcons.apply(root);
    if (w.DSRiskMetric) w.DSRiskMetric.mount(root);
    if (w.DSModal) w.DSModal.bindAll(root);
    if (w.DSTooltip) w.DSTooltip.bindAll(root);
    if (w.DSMenu) w.DSMenu.bindAll(root);
    if (w.DSPopover) w.DSPopover.bindAll(root);
    if (w.DSDrawer) w.DSDrawer.bindAll(root);
    if (w.DSTable) w.DSTable.wireAll(root);
  }

  /* ---------- стенд ---------- */
  /* Демо-узел: у окна — сам скрим, встроенный в стенд (сборщик уже
     поставил .modal-scrim--inline); у поповера — он же без плавающего слоя;
     у подчасти-шаблона (<template>) — копия эталона: сам шаблон остаётся на
     месте, им рисуют карточки скрипты окон. */
  function subjectOf(stage, type) {
    var root = stage.firstElementChild;
    if (!root) return null;
    var tpl = root.tagName === 'TEMPLATE' ? root : root.querySelector('template');
    if (tpl && tpl.content && tpl.content.firstElementChild) {
      var el = tpl.content.firstElementChild.cloneNode(true);
      stage.appendChild(el);
      return el;
    }
    if (type === 'modal' || type === 'popover') {
      root.hidden = false;
      root.classList.remove('pop--floating');
    }
    return root;
  }
  function axisEl(el, attr) { return el.hasAttribute(attr) ? el : el.querySelector('[' + attr + ']'); }

  /* Копия для «Все состояния»: id с суффиксом, ссылки на них — тоже; ссылки
     наружу (data-modal на окно страницы) остаются — кнопки копий открывают
     настоящее окно. */
  var REF_ATTRS = ['for', 'aria-labelledby', 'aria-describedby', 'aria-controls', 'list'];
  function suffixIds(el, sfx) {
    var nodes = [el].concat(Array.prototype.slice.call(el.querySelectorAll('*')));
    var own = {};
    nodes.forEach(function (n) { if (n.id) { own[n.id] = true; n.id += sfx; } });
    nodes.forEach(function (n) {
      REF_ATTRS.forEach(function (a) {
        var v = n.getAttribute(a);
        if (!v) return;
        n.setAttribute(a, v.split(/\s+/).map(function (t) { return own[t] ? t + sfx : t; }).join(' '));
      });
      if (n.hasAttribute('aria-modal')) n.removeAttribute('aria-modal');
    });
  }

  var scenarios = {};
  window.IBPKitDemo = { register: function (id, s) { scenarios[id] = s || {}; } };

  function page(P) {
    var nav = document.getElementById('nav');
    if (window.IBPKitNav) window.IBPKitNav.render({ nav: nav, base: P.base, current: P.id, hub: P.hub });

    var stage = document.getElementById('pg-stage');
    var subject = stage && subjectOf(stage, P.type);
    if (!subject) return;
    var pristine = subject.cloneNode(true);
    var sc = scenarios[P.id] || {};
    /* Минимум тайла — на всех видах страницы (п. 7): одиночное демо, копии в
       зоне демо и в документации. Пока проба — только у сценариев с gallery. */
    if (P.type === 'tile' && sc.gallery) {
      var minH = sc.minHeight !== undefined ? Number(sc.minHeight) : TILE_MIN_HEIGHT;
      if (minH > 0) {
        document.documentElement.classList.add('kit-tile-min');
        document.documentElement.style.setProperty('--kit-tile-min', minH + 'px');
      }
    }
    /* Подписи своих состояний и режимов — полем labels сценария, а не в общем
       рантайме (раздел 3 канона). Ключ один на оба словаря: значения состояний
       и режимов не пересекаются. */
    var stateLabels = Object.assign({}, STATE_LABELS, sc.labels);
    var modeLabels = Object.assign({}, MODE_LABELS, sc.labels);
    /* Состояние, которое CSS не различает (заполнено частично — та же
       разметка, другие данные), добавляет сценарий; порядок — как у правил ДС. */
    if (sc.states) {
      sc.states.forEach(function (s) { if (P.states.indexOf(s) < 0) P.states.push(s); });
      var rank = function (s) { var k = STATE_ORDER.indexOf(s); return k < 0 ? STATE_ORDER.length : k; };
      P.states.sort(function (a, b) { return rank(a) - rank(b); });
    }

    var defs = [];
    if (P.states.length > 1) {
      defs.push({ key: 'state', label: 'Состояние данных', value: P.state,
        options: P.states.map(function (s) { return [s, label(stateLabels, s)]; }) });
    }
    if (P.modes.length > 1) {
      defs.push({ key: 'mode', label: 'Режим прав', value: P.mode,
        options: P.modes.map(function (m) { return [m, label(modeLabels, m)]; }) });
    }
    if (P.width) defs.push({ key: 'width', label: 'Ширина, px', range: { min: 180, max: 1600, step: 10 }, value: P.width });
    if (sc.controls) defs = sc.controls(defs) || defs;
    /* Порядок контролов — по ключу, а не по тому, как их добавил сценарий. */
    defs.sort(function (a, b) { return rankOf(a) - rankOf(b); });

    function applyTo(el, st, live) {
      var s = axisEl(el, 'data-state');
      if (s && st.state) s.setAttribute('data-state', st.state);
      var m = axisEl(el, 'data-mode');
      if (m && st.mode) m.setAttribute('data-mode', st.mode);
      if (sc.apply) sc.apply(el, st, { fixtures: P.fixtures || {}, live: live });
    }

    /* Набор копий «Все состояния»: по умолчанию — каждая пара «состояние ×
       режим», сценарий может задать свой (поле cases). */
    var states = P.states.length ? P.states : [P.state];
    var modes = P.modes.length ? P.modes : [P.mode];
    var cases = [];
    states.forEach(function (s) {
      modes.forEach(function (m) {
        var name = [s && label(stateLabels, s), modes.length > 1 && m && label(modeLabels, m)].filter(Boolean).join(' · ');
        cases.push({ label: name || 'Как во фрагменте', st: { state: s, mode: m } });
      });
    });
    var ctxCases = { fixtures: P.fixtures || {}, labels: stateLabels };
    if (sc.cases) cases = sc.cases(cases, ctxCases) || cases;
    /* Матрица (п. 6) задаёт и раскладку, и сам набор копий: подпись копии —
       «строка · колонка», у ячейки на всю строку — строка и её пометка. */
    var matrix = typeof sc.matrix === 'function' ? sc.matrix(cases, ctxCases) : sc.matrix;
    if (matrix && matrix.rows && matrix.rows.length) {
      var cols = matrix.cols || [];
      cases = [];
      matrix.rows.forEach(function (r) {
        (r.cells || []).forEach(function (c, j) {
          var name = c.span ? [r.label, r.note] : [r.label, cols[j]];
          cases.push({ label: name.filter(Boolean).join(' · '), st: c.st });
        });
      });
    } else {
      matrix = null;
    }

    /* Копия для набора: исходный фрагмент поверх текущих значений конструктора. */
    function copyOf(c, cur, sfx) {
      var el = pristine.cloneNode(true);
      var st = {};
      Object.keys(cur).forEach(function (k) { st[k] = cur[k]; });
      Object.keys(c.st || {}).forEach(function (k) { st[k] = c.st[k]; });
      applyTo(el, st, false);
      suffixIds(el, sfx);
      return el;
    }
    function textEl(tag, cls, text) {
      var el = document.createElement(tag);
      el.className = cls;
      el.textContent = text;
      return el;
    }

    /* Копии в host: списком с подписью над каждой или матрицей сценария. */
    function fillCases(host, cur, sfx, width) {
      host.innerHTML = '';
      host.classList.toggle('kit-cases--matrix', !!matrix);
      /* perRow — не больше N копий в ряд: в документации колонок ровно N, в зоне
         демо ширина списка ограничена N копиями со слайдера. */
      var rows = !matrix && sc.perRow > 0 ? Number(sc.perRow) : 0;
      host.classList.toggle('kit-cases--rows', rows > 0);
      if (rows > 0) host.style.setProperty('--kit-per-row', String(rows));
      else host.style.removeProperty('--kit-per-row');
      host.style.maxWidth = rows > 0 && width ? (rows * width + (rows - 1) * 16) + 'px' : '';
      if (matrix) fillMatrix(host, cur, sfx, width);
      else {
        cases.forEach(function (c, i) {
          var box = document.createElement('div');
          box.className = 'kit-case';
          if (width) box.style.width = width + 'px';
          box.appendChild(textEl('p', 'kit-case__label', c.label));
          box.appendChild(copyOf(c, cur, sfx + (i + 1)));
          host.appendChild(box);
        });
      }
      paint(host);
    }

    /* Матрица: угол, заголовки колонок, по строке — заголовок и ячейки. Ширина
       ячейки — со слайдера конструктора; без неё колонки делят место поровну. */
    function fillMatrix(host, cur, sfx, width) {
      var cols = matrix.cols || [];
      var n = Math.max(cols.length, 1);
      var grid = document.createElement('div');
      grid.className = 'kit-matrix';
      grid.style.setProperty('--kit-cols', String(n));
      if (width) grid.style.setProperty('--kit-cell-w', width + 'px');
      grid.appendChild(textEl('div', 'kit-matrix__corner', ''));
      for (var j = 0; j < n; j++) grid.appendChild(textEl('p', 'kit-matrix__col', cols[j] || ''));
      var i = 0;
      matrix.rows.forEach(function (r) {
        var head = document.createElement('div');
        head.className = 'kit-matrix__row';
        head.appendChild(textEl('p', 'kit-matrix__row-label', r.label || ''));
        if (r.note) head.appendChild(textEl('p', 'kit-matrix__row-note', r.note));
        grid.appendChild(head);
        (r.cells || []).forEach(function (c) {
          var cell = document.createElement('div');
          cell.className = 'kit-matrix__cell' + (c.span ? ' kit-matrix__cell--span' : '');
          cell.kitMatch = c.match || c.st || {};
          i += 1;
          cell.appendChild(copyOf(c, cur, sfx + i));
          grid.appendChild(cell);
        });
      });
      host.appendChild(grid);
      markCurrent(host, cur);
    }

    /* Подсветка выбранной конфигурации: ячейка текущая, если все значения её
       match (по умолчанию st) совпали с конструктором. Копии не перерисовываются. */
    function markCurrent(host, cur) {
      if (!host) return;
      Array.prototype.forEach.call(host.querySelectorAll('.kit-matrix__cell'), function (cell) {
        var m = cell.kitMatch || {};
        var on = Object.keys(m).length > 0 && Object.keys(m).every(function (k) { return String(cur[k]) === String(m[k]); });
        cell.classList.toggle('kit-matrix__cell--current', on);
        if (on) cell.setAttribute('aria-current', 'true');
        else cell.removeAttribute('aria-current');
      });
    }

    var gallery = sc.gallery && cases.length > 1 ? galleryView(stage) : null;

    /* Раздел «Все состояния рядом» перерисовывается, только когда сменился
       контрол, от которого копии зависят: ключ, который задаёт каждая копия
       (состояние и режим у пар, оси матрицы), и ширина копий не меняют — тогда
       подсветка переключается на месте. Свой контрол сценария (тип ФИ у
       карточки, RE0028) задаёт вид всех копий — раздел рисуется заново. */
    var covered = cases.length ? Object.keys(cases[0].st || {}).filter(function (k) {
      return cases.every(function (c) { return c.st && Object.prototype.hasOwnProperty.call(c.st, k); });
    }) : [];
    function docKey(st) {
      return JSON.stringify(Object.keys(st).sort().filter(function (k) {
        return k !== 'width' && covered.indexOf(k) < 0;
      }).map(function (k) { return [k, st[k]]; }));
    }
    var docKeyNow = null;

    var state = controls(defs, function (st) {
      if (st.width) stage.style.width = st.width + 'px';
      applyTo(subject, st, true);
      paint(stage);
      if (gallery && gallery.on()) fillCases(gallery.host, st, '-g', st.width);
      var docs = document.getElementById('kit-cases');
      if (docs && cases.length > 1 && docKeyNow !== null && docKey(st) !== docKeyNow) {
        docKeyNow = docKey(st);
        fillCases(docs, st, '-case');
      } else if (matrix) markCurrent(docs, st);
    });
    if (gallery) gallery.onShow(function () { fillCases(gallery.host, state, '-g', state.width); });

    /* все состояния рядом — раздел «Состояния» документации */
    var host = document.getElementById('kit-cases');
    if (!host) return;
    if (cases.length < 2) {
      host.insertAdjacentHTML('beforeend', '<p class="desc">У компонента одно состояние — оно в демо выше.</p>');
      return;
    }
    fillCases(host, state, '-case');
    docKeyNow = docKey(state);
  }

  /* ---------- вид зоны демо: одно состояние | все состояния ---------- */
  var VIEW_KEY = 'ibp-kit-demo-view';
  function readView() { try { return window.localStorage.getItem(VIEW_KEY); } catch (e) { return null; } }
  function saveView(v) { try { window.localStorage.setItem(VIEW_KEY, v); } catch (e) { /* без хранилища — один вид */ } }

  /* Переключатель — SegmentControl ДС (рантайм DSTabs.segment) над стендом;
     копии — в .kit-gallery рядом со стендом, стенд в этом виде скрыт. */
  function galleryView(stage) {
    var pane = stage.closest('.app-pane-demo');
    var box = stage.closest('.pg__stage');
    if (!pane || !box) return null;
    var bar = document.createElement('div');
    bar.className = 'kit-view';
    bar.innerHTML = '<div class="segctrl segctrl--s" role="radiogroup" aria-label="Вид демо">'
      + '<div class="segctrl__thumb"></div>'
      + '<button type="button" class="segctrl__item" role="radio" aria-checked="true" data-view="one"><span class="segctrl__label">Одно состояние</span></button>'
      + '<button type="button" class="segctrl__item" role="radio" aria-checked="false" data-view="all"><span class="segctrl__label">Все состояния</span></button>'
      + '</div>';
    pane.insertBefore(bar, pane.firstChild);
    var host = document.createElement('div');
    host.className = 'kit-cases kit-gallery';
    host.hidden = true;
    box.parentNode.insertBefore(host, box.nextSibling);
    var shown = [];
    var on = false;
    function set(all) {
      on = all;
      box.hidden = all;
      host.hidden = !all;
      saveView(all ? 'all' : 'one');
      if (all) shown.forEach(function (fn) { fn(); });
    }
    var seg = bar.querySelector('.segctrl');
    var items = seg.querySelectorAll('.segctrl__item');
    var pick = function (el) { set(el.getAttribute('data-view') === 'all'); };
    var api = window.DSTabs ? window.DSTabs.segment(seg, { onChange: function (i, el) { pick(el); } }) : null;
    if (!api) {
      /* без рантайма ДС — тот же выбор кликом */
      seg.addEventListener('click', function (e) {
        var b = e.target.closest ? e.target.closest('.segctrl__item') : null;
        if (!b) return;
        items.forEach(function (x) { x.setAttribute('aria-checked', String(x === b)); });
        pick(b);
      });
    }
    var start = readView() === 'all';
    return {
      host: host,
      on: function () { return on; },
      onShow: function (fn) {
        shown.push(fn);
        if (!start) return;
        start = false;
        if (api) api.select(1, true);
        else items.forEach(function (x, i) { x.setAttribute('aria-checked', String(i === 1)); });
        set(true);
      }
    };
  }

  window.IBPKitDoc = { page: page, controls: controls, paint: paint };
})();
