/* ============================================================
   tbl-resize.js — универсальное изменение ширины колонки для
   любой .tbl-таблицы (делегирование на document, без инициализации
   на странице). Общий рантайм ДС: входит в ds.js, поэтому
   на собранных экранах ручка `.th__resize` работает из коробки —
   отдельно подключать не нужно (страницы документации, не тянущие
   ds.js, линкуют файл напрямую).
   Ручки с [data-resize] (Конструктор, демо «Ширина колонок»)
   уже имеют свою логику — этот скрипт их не трогает.
   Событие: 'columnresize' на .tbl (bubbles) с { column, width } —
   column — индекс ячейки в строке шапки, width — новая ширина в px.
   Шлётся по отпусканию ручки и на каждый шаг стрелками; его слушает
   хранение колонок (data-table-persist, ds-table-settings.js).
   Минимум колонки (27.10.2026, решение человека):
   - колонка действий — в ячейках тела только IconButton (`.ibtn`, в том
     числе в обёртке тултипа): минимум по содержимому — поля ячейки + кнопки
     + зазоры между ними; для одной кнопки M это 16 + 20 + 16 = 52px.
     Порог 96px к ней не применяется;
   - остальные колонки — 96px, но не больше исходной ширины колонки (ширина
     при первом ресайзе на странице): колонка, свёрстанная уже 96px, может
     вернуться к своей ширине.
   Колонка с пометкой .th--actions (30.10.2026) — колонка действий: её ширину
   по иконкам ставит Table.js при подключении, порог 96px не применяется.
   Нажатие на ручку без перетаскивания ширину не меняет и события не шлёт.
   ============================================================ */
(function () {
  'use strict';
  var MIN = 96;

  function ensureGuide(tbl) {
    var g = tbl.querySelector(':scope > .tbl__guide');
    if (!g) { g = document.createElement('span'); g.className = 'tbl__guide'; tbl.appendChild(g); }
    return g;
  }
  function colIndex(row, th) { return Array.prototype.indexOf.call(row.children, th); }
  /* Кнопки ячейки, если ничего, кроме IconButton, в ней нет (обёртка
     тултипа `.tip-anchor` вокруг кнопки прозрачна); иначе null. */
  function iconButtonsOnly(cell) {
    var box = cell.querySelector(':scope > .tc__row') || cell;
    var btns = [];
    var ok = Array.prototype.every.call(box.children, function (el) {
      if (el.hidden || el.classList.contains('tip')) return true;
      var b = el.classList.contains('ibtn') ? el : (el.classList.contains('tip-anchor') && el.children.length === 1 && el.firstElementChild.classList.contains('ibtn') ? el.firstElementChild : null);
      if (b) btns.push(b);
      return !!b;
    });
    return ok && btns.length ? { box: box, btns: btns } : null;
  }
  /* Минимум по содержимому колонки действий; null — колонка не такая
     (хоть одна ячейка тела несёт что-то кроме IconButton или тело пустое). */
  function iconColumnMin(tbl, idx) {
    var rows = tbl.querySelectorAll(':scope > .tbl__row:not(.tbl__row--head)');
    var min = 0, seen = 0;
    for (var i = 0; i < rows.length; i++) {
      var cell = rows[i].children[idx];
      if (!cell) continue;
      var c = iconButtonsOnly(cell);
      if (!c) return null;
      seen++;
      var cs = getComputedStyle(cell), bs = getComputedStyle(c.box);
      var gap = parseFloat(bs.columnGap) || 0;
      var w = (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0) + (parseFloat(cs.borderLeftWidth) || 0) + (parseFloat(cs.borderRightWidth) || 0)
        + c.btns.reduce(function (s, b) { return s + b.getBoundingClientRect().width; }, 0) + gap * (c.btns.length - 1);
      if (w > min) min = w;
    }
    return seen ? Math.ceil(min) : null;
  }
  /* Нижняя граница ширины колонки; исходная ширина запоминается на шапке
     при первом ресайзе — дальнейшие расширения её не поднимают. */
  function floorOf(tbl, th, idx, current) {
    var icon = iconColumnMin(tbl, idx);
    if (icon != null) return icon;
    /* колонка действий без строк в теле — порог 96px к ней всё равно не
       применяется: не уже, чем она есть (TableCell 2.028) */
    if (th.classList.contains('th--actions')) return Math.min(current, MIN);
    if (!th.__dsResizeBase) th.__dsResizeBase = current;
    return Math.min(MIN, th.__dsResizeBase);
  }
  /* фиксирует текущую отрендеренную ширину каждой колонки строки в px —
     остальные колонки при резайзе не пересчитываются, только сдвигаются */
  function freezeTracks(row) {
    var kids = row.children;
    return Array.prototype.map.call(kids, function (cell, i) {
      /* хвостовой разделитель — гибкий трек: остаток ширины контейнера уходит
         ему, линии строк (border ячеек) доходят до правого края */
      if (i === kids.length - 1 && /(^|\s)(tc|th)--separator(\s|$)/.test(cell.className)) return 'minmax(8px,1fr)';
      return Math.round(cell.getBoundingClientRect().width) + 'px';
    });
  }
  function applyTracksAll(tbl, tracks) {
    var str = tracks.join(' ');
    tbl.querySelectorAll('.tbl__row').forEach(function (row) { row.style.gridTemplateColumns = str; });
  }
  /* ширина поменялась — сообщаем наружу: без события хранение колонок
     (data-table-persist) не узнало бы о новой ширине и не записало её */
  function emitResize(tbl, idx, width) {
    tbl.dispatchEvent(new CustomEvent('columnresize', { bubbles: true, detail: { column: idx, width: width } }));
  }
  function guideAt(tbl, clientX) {
    var g = ensureGuide(tbl);
    g.style.left = (clientX - tbl.getBoundingClientRect().left + tbl.scrollLeft) + 'px';
  }
  function startResize(e, handle) {
    var th = handle.closest('.th');
    var row = handle.closest('.tbl__row');
    var tbl = handle.closest('.tbl');
    if (!th || !row || !tbl) return;
    e.preventDefault();
    tbl.classList.add('tbl--scroll');
    var idx = colIndex(row, th);
    var tracks = freezeTracks(row);
    applyTracksAll(tbl, tracks);
    var x0 = e.clientX, w0 = parseFloat(tracks[idx]), w = w0;
    var floor = floorOf(tbl, th, idx, w0);
    tbl.classList.add('tbl--resizing');
    th.classList.add('th--resizing');
    function move(ev) {
      w = Math.max(floor, Math.round(w0 + (ev.clientX - x0)));
      var next = tracks.slice(); next[idx] = w + 'px';
      applyTracksAll(tbl, next);
      guideAt(tbl, ev.clientX);
    }
    function up() {
      tbl.classList.remove('tbl--resizing');
      th.classList.remove('th--resizing');
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      if (w !== w0) emitResize(tbl, idx, w);
    }
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
    /* без move(e): нажатие без перетаскивания ширину не трогает (раньше
       минимум применялся уже на нажатии — колонка 52px становилась 96px) */
    guideAt(tbl, e.clientX);
  }

  document.addEventListener('pointerdown', function (e) {
    var h = e.target.closest && e.target.closest('.th__resize');
    if (!h || h.hasAttribute('data-resize')) return;
    startResize(e, h);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    var h = document.activeElement;
    if (!h || !h.classList || !h.classList.contains('th__resize') || h.hasAttribute('data-resize')) return;
    var th = h.closest('.th'), row = h.closest('.tbl__row'), tbl = h.closest('.tbl');
    if (!th || !row || !tbl) return;
    e.preventDefault();
    tbl.classList.add('tbl--scroll');
    var idx = colIndex(row, th);
    var tracks = freezeTracks(row);
    var cur = parseFloat(tracks[idx]);
    var w = Math.max(floorOf(tbl, th, idx, cur), Math.round(cur + (e.key === 'ArrowRight' ? 16 : -16)));
    if (w === cur) return;
    tracks[idx] = w + 'px';
    applyTracksAll(tbl, tracks);
    emitResize(tbl, idx, w);
  });
})();
