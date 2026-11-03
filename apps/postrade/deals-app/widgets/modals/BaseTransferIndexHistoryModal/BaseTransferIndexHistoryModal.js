/* ============================================================
   BaseTransferIndexHistoryModal.js — поведение окна «История изменения базового индекса».

   Делает то, чего нет в рантаймах ДС, и только это:
   1) на открытии берёт историю БИ (LoanAgreementStore.baseIndexHistory() — от новых к старым)
      и рисует таблицу: дата «ДД.ММ.ГГГГ», подпись БИ («КС»), значение с запятой без лишних нулей;
   2) сортировка — штатная кнопка шапки Table ДС (none → asc → desc → none). Рантайм меняет глиф и
      aria-sort, а порядок строк здесь не переставляет (data-sort-rows не стоит): страница строк в
      DOM — часть массива, поэтому по событию `sort` { column, dir } массив пересортировывается
      целиком и перерисовывается текущая страница (так же сортировал бы сервер). Дата — по ISO,
      значение — числом, БИ — текстом по подписи; none возвращает порядок «от новых к старым»;
   3) пагинация — DSPagination.footer: размер страницы 50 по умолчанию, номера страниц, диапазон.
      Смена страницы или размера перерисовывает таблицу; пустая история — «Нет данных», пагинации нет.

   Открытие, фокус, Esc, крестик, «Закрыть» (data-modal-close) и клик мимо окна делают рантаймы ДС.
   Правки в окне нет, поэтому оно работает в любом режиме страницы, в том числе в просмотре.

   API:
     PostModalBaseTransferIndexHistory.bind(scrim?, { get }) → api
       scrim — скрим окна (по умолчанию #bih-scrim); повторный bind того же скрима возвращает
               прежний api
       get() → BaseIndexHistoryRsDto[] — история; по умолчанию LoanAgreementStore.baseIndexHistory()
       api.fill(rows?)   — заполнить окно заново: rows или get(); страница 1, размер 50, сортировка
                           снята
       api.open(opts?)   — fill + показ окна; opts.rows подставляет строки вместо get()
       api.read()        → { rows, sort, page, pageSize, shown } — что сейчас в окне
     PostModalBaseTransferIndexHistory.open(opts?) — открыть окно (bind по умолчанию сам)
     PostModalBaseTransferIndexHistory.use(rows)   — заполнить без показа (витрина)
   Привязка к скриму — в самом файле (на DOMContentLoaded), страница может звать bind() и сама.
   ============================================================ */
(function () {
  'use strict';

  var SCRIM_ID = 'bih-scrim';
  var DEFAULT_PAGE_SIZE = 50;
  var SORT_NONE = { column: null, dir: 'none' };

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }

  /* ISO «ГГГГ-ММ-ДД» (время, если оно есть, отбрасывается) → «ДД.ММ.ГГГГ»; не дата — прочерк */
  function fmtDate(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso || ''));
    return m ? m[3] + '.' + m[2] + '.' + m[1] : '—';
  }

  /* 16.5 → «16,5», 21 → «21», 88.888 → «88,888»; не число — прочерк */
  function fmtPercent(v) {
    var n = Number(v);
    if (v === null || v === undefined || !isFinite(n)) return '—';
    return String(Number(n.toFixed(3))).replace('.', ',');
  }

  /* Подпись кода БИ из справочника модуля; кода нет в справочнике — сам код */
  function baseIndexLabel(code) {
    var map = window.LOAN_BASE_INDEX_LABELS || {};
    return map[code] || code || '—';
  }

  /* Ключи сортировки по колонкам: дата — ISO-строкой, значение — числом, БИ — текстом подписи */
  function keyOf(row, column) {
    if (column === 'changeDate') return String(row.changeDate || '');
    if (column === 'valuePercent') {
      var n = Number(row.valuePercent);
      return row.valuePercent === null || row.valuePercent === undefined || !isFinite(n) ? null : n;
    }
    if (column === 'baseIndexCode') return baseIndexLabel(row.baseIndexCode);
    return null;
  }

  function compare(a, b, column) {
    var x = keyOf(a, column), y = keyOf(b, column);
    if (x === y) return 0;
    if (typeof x === 'number' && typeof y === 'number') return x - y;
    return String(x).localeCompare(String(y), 'ru');
  }

  /* Исходный порядок строк возвращает dir = none. Пустые значения всегда внизу. */
  function sorted(rows, sort) {
    var out = rows.slice();
    if (!sort || !sort.column || sort.dir === 'none') return out;
    var k = sort.dir === 'desc' ? -1 : 1;
    var column = sort.column;
    return out.sort(function (a, b) {
      var x = keyOf(a, column), y = keyOf(b, column);
      if (x === null || y === null) return x === y ? 0 : (x === null ? 1 : -1);
      return k * compare(a, b, column);
    });
  }

  function rowHtml(r, grid) {
    return '<div class="tbl__row" style="grid-template-columns:' + grid + ';">'
      + '<div class="tc tc--separator"></div>'
      + '<div class="tc" data-col="changeDate"><span class="tc__row"><span class="tc__text">' + esc(fmtDate(r.changeDate)) + '</span></span></div>'
      + '<div class="tc" data-col="baseIndexCode"><span class="tc__row"><span class="tc__text">' + esc(baseIndexLabel(r.baseIndexCode)) + '</span></span></div>'
      + '<div class="tc tc--numbers" data-col="valuePercent"><span class="tc__row"><span class="tc__text">' + esc(fmtPercent(r.valuePercent)) + '</span></span></div>'
      + '<div class="tc tc--separator"></div></div>';
  }

  function defaultRows() {
    var store = window.LoanAgreementStore;
    return store && store.baseIndexHistory ? store.baseIndexHistory() : [];
  }

  function bind(scrim, opts) {
    scrim = scrim || document.getElementById(SCRIM_ID);
    if (!scrim) return null;
    if (scrim.__baseIndexHistory) return scrim.__baseIndexHistory;
    opts = opts || {};

    var tbl = scrim.querySelector('.tbl');
    var empty = scrim.querySelector('[data-bih-empty]');
    var footerHost = scrim.querySelector('[data-bih-footer]');
    if (!tbl || !empty || !footerHost) return null;

    var state = { rows: [], sort: SORT_NONE, page: 1, pageSize: DEFAULT_PAGE_SIZE, shown: 0 };
    var silent = false;   // сброс шапки кодом не должен перерисовывать таблицу второй раз

    /* Шапку, её раскладку и сортировку держит рантайм ДС: находим в момент отрисовки (Л185) */
    function head() { return tbl.querySelector('.tbl__row--head'); }

    function pageRows() {
      var all = sorted(state.rows, state.sort);
      if (state.pageSize === 'all') return all;
      var from = (state.page - 1) * state.pageSize;
      return all.slice(from, from + state.pageSize);
    }

    function drawFooter() {
      footerHost.textContent = '';
      if (!state.rows.length || !window.DSPagination) { footerHost.hidden = true; return; }
      footerHost.hidden = false;
      footerHost.appendChild(window.DSPagination.footer({
        pager: {
          total: state.rows.length,
          page: state.page,
          pageSize: state.pageSize,
          onChange: function (page) { state.page = page; render(); toTop(); },
          onPageSizeChange: function (size) { state.pageSize = size; state.page = 1; render(); toTop(); }
        }
      }));
    }

    function toTop() {
      var body = scrim.querySelector('.modal__body');
      if (body) body.scrollTop = 0;
      var tb = scrim.querySelector('.dtable__body');
      if (tb) tb.scrollTop = 0;
    }

    function render() {
      var h = head();
      var grid = h ? h.style.gridTemplateColumns : '';
      Array.prototype.forEach.call(tbl.querySelectorAll('.tbl__row:not(.tbl__row--head)'), function (n) { n.remove(); });

      /* страница за пределом (размер вырос, строк стало меньше) — возвращаем в допустимое */
      if (window.DSPagination && state.pageSize !== 'all') {
        state.page = Math.min(state.page, window.DSPagination.totalPages(state.rows.length, state.pageSize));
      }
      var list = pageRows();
      state.shown = list.length;
      tbl.insertAdjacentHTML('beforeend', list.map(function (r) { return rowHtml(r, grid); }).join(''));
      empty.hidden = state.rows.length > 0;
      scrim.setAttribute('data-state', state.rows.length ? 'data' : 'empty');
      drawFooter();

      if (window.dsIcons) window.dsIcons.apply(scrim);
      if (window.DSTable) {
        if (window.DSTable.bindAll) window.DSTable.bindAll(scrim);
        if (window.DSTable.wireAll) window.DSTable.wireAll(scrim);
        var wired = window.DSTable.wire ? window.DSTable.wire(tbl) : null;
        if (wired && wired.rowsChanged) wired.rowsChanged();
      }
    }

    /* Сортировка шапки: рантайм ДС уже поменял глиф и aria-sort, нам — пересортировать массив */
    scrim.addEventListener('sort', function (e) {
      if (silent || !e.target.closest || e.target.closest('.tbl') !== tbl) return;
      var d = e.detail || {};
      state.sort = { column: d.column || null, dir: d.dir || 'none' };
      if (!d.restored) state.page = 1;
      render();
    });

    /* Снять сортировку в шапке (глиф, aria-sort, подсветка) штатным API таблицы */
    function resetSortHead() {
      var first = tbl.querySelector('[data-sort]');
      var wired = window.DSTable && window.DSTable.wire ? window.DSTable.wire(tbl) : null;
      if (!first || !wired) return;
      silent = true;
      try { wired.sort(first.getAttribute('data-sort'), 'none'); } finally { silent = false; }
    }

    function fill(rows) {
      var src = rows || (opts.get ? opts.get() : defaultRows()) || [];
      state.rows = src.slice();
      state.sort = SORT_NONE;
      state.page = 1;
      state.pageSize = DEFAULT_PAGE_SIZE;
      resetSortHead();
      render();
      toTop();
    }

    function open(o) {
      fill(o && o.rows);
      if (window.DSModal && !scrim.classList.contains('modal-scrim--inline')) window.DSModal.open(scrim);
    }

    function read() {
      return { rows: state.rows.slice(), sort: { column: state.sort.column, dir: state.sort.dir }, page: state.page, pageSize: state.pageSize, shown: state.shown };
    }

    var api = { fill: fill, open: open, read: read };
    scrim.__baseIndexHistory = api;
    render();
    return api;
  }

  function open(o) {
    var api = bind();
    if (api) api.open(o);
  }

  function use(rows) {
    var api = bind();
    if (api) api.fill(rows || []);
  }

  window.PostModalBaseTransferIndexHistory = { bind: bind, open: open, use: use };

  /* Привязка в самом файле: страница может не звать bind (Л267) */
  function autoBind() { if (document.getElementById(SCRIM_ID)) bind(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', autoBind);
  else autoBind();
})();
