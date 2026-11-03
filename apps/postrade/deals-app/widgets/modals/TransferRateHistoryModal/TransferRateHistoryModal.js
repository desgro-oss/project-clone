/* ============================================================
   TransferRateHistoryModal.js — окно «История изменения ставок» страницы
   «Единая трансфертная ставка» (TransferSchemas).

   Делает то, чего нет в рантаймах ДС, и только это:
   1) читает историю ставок из LoanAgreementStore.rateHistory() на каждом открытии
      (или берёт строки из аргумента — для витрины) и хранит все строки в памяти;
   2) рисует строки текущей страницы под шапкой, которая лежит в разметке: даты
      «ДД.ММ.ГГГГ», ставка без лишних нулей с запятой, пустая ставка — «—»;
   3) сортировка: кнопки шапки, цикл none → asc → desc → none, глиф и aria-sort
      красит рантайм ДС, он же шлёт событие sort { column, dir }. Строки
      переставляет этот файл по всему массиву, а не по DOM: data-sort-rows ДС
      сортирует только строки текущей страницы, а страниц несколько. none —
      порядок стора (от новых к старым); пустая ставка всегда внизу;
   4) пагинация — DSPagination.footer: размер страницы 50 по умолчанию, смена
      страницы и размера перерисовывает строки; у пустой истории пагинации нет,
      вместо строк — «Нет данных».

   Окно — справка: правки нет, в просмотре открывается так же.

   Строка (RateHistoryRowDto, форму отдаёт LoanAgreementStore.rateHistory):
     { startDate: 'ГГГГ-ММ-ДД', endDate: 'ГГГГ-ММ-ДД', ratePercent: число | null }

   Привязка автоматическая: на DOMContentLoaded (или сразу, если страница уже
   загружена) окно transfer-rate-history-scrim привязывается само.

   API:
     PostModalTransferRateHistory.bind(scrim?) → api
       scrim — по умолчанию #transfer-rate-history-scrim
       api.load(rows?) — подставить строки без показа окна (rows — массив строки
                         выше; не передан — читает LoanAgreementStore.rateHistory());
                         сбрасывает сортировку и страницу
       api.rows() → копия строк в порядке стора · api.page() → номер страницы
     PostModalTransferRateHistory.open({ rows? }?) — подготовить и открыть окно
       (DSModal.open); без аргументов читает стор
   ============================================================ */
(function () {
  'use strict';

  var SCRIM_ID = 'transfer-rate-history-scrim';
  var PAGE_SIZE = 50;
  var ISO = /^(\d{4})-(\d{2})-(\d{2})/;
  var SORT_GLYPH = { none: 'arrow-up-down', asc: 'arrow-narrow-up', desc: 'arrow-narrow-down' };
  var SORT_ARIA = { none: 'none', asc: 'ascending', desc: 'descending' };
  var SORT_LABEL = {
    none: 'Сортировать',
    asc: 'Сортировка от меньшего к большему',
    desc: 'Сортировка от большего к меньшему'
  };
  var NUMBER = new Intl.NumberFormat('ru-RU', { useGrouping: false, maximumFractionDigits: 10 });

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* ISO → «ДД.ММ.ГГГГ»; не ISO — как есть. */
  function fmtDate(iso) {
    var m = ISO.exec(String(iso == null ? '' : iso));
    return m ? m[3] + '.' + m[2] + '.' + m[1] : String(iso == null ? '' : iso);
  }

  /* Ставка как есть, без добавленных нулей: 88.888 → «88,888», 4 → «4»; null → null. */
  function fmtRate(v) {
    if (v == null || v === '' || isNaN(Number(v))) return null;
    return NUMBER.format(Number(v));
  }

  function store() { return window.LoanAgreementStore || null; }

  function readStore() {
    var s = store();
    return s && typeof s.rateHistory === 'function' ? s.rateHistory() : [];
  }

  function normalize(rows) {
    return (rows || []).map(function (r, i) {
      return {
        startDate: r.startDate == null ? null : r.startDate,
        endDate: r.endDate == null ? null : r.endDate,
        ratePercent: r.ratePercent == null || isNaN(Number(r.ratePercent)) ? null : Number(r.ratePercent),
        __i: i
      };
    });
  }

  /* ── Порядок строк ────────────────────────────────────────────── */

  /* Пустое значение всегда внизу, при любом направлении (как у ДС); равные — в порядке стора. */
  function sorted(rows, column, dir) {
    if (!column || (dir !== 'asc' && dir !== 'desc')) return rows.slice();
    var k = dir === 'desc' ? -1 : 1;
    return rows.slice().sort(function (a, b) {
      var x = a[column], y = b[column];
      var xe = x == null || x === '', ye = y == null || y === '';
      if (xe || ye) return xe && ye ? a.__i - b.__i : (xe ? 1 : -1);
      if (x !== y) return (x < y ? -1 : 1) * k;
      return a.__i - b.__i;
    });
  }

  /* ── Разметка строк ───────────────────────────────────────────── */

  function dateCell(iso) {
    var t = fmtDate(iso);
    return t
      ? '<div class="tc"><span class="tc__row"><span class="tc__text tc__text--truncate">' + esc(t) + '</span></span></div>'
      : '<div class="tc"><span class="tc__empty">—</span></div>';
  }

  function rateCell(v) {
    var t = fmtRate(v);
    return t
      ? '<div class="tc tc--numbers"><span class="tc__row"><span class="tc__text">' + esc(t) + '</span></span></div>'
      : '<div class="tc tc--numbers"><span class="tc__empty">—</span></div>';
  }

  function rowHtml(r, grid) {
    return '<div class="tbl__row" style="grid-template-columns:' + grid + '">'
      + '<div class="tc tc--separator"></div>'
      + dateCell(r.startDate) + dateCell(r.endDate) + rateCell(r.ratePercent)
      + '<div class="tc tc--separator"></div></div>';
  }

  function bind(scrim) {
    scrim = scrim || document.getElementById(SCRIM_ID);
    if (!scrim) return null;
    if (scrim.__trhApi) return scrim.__trhApi;

    var tbl = scrim.querySelector('[data-trh-table]');
    var emptyEl = scrim.querySelector('[data-trh-empty]');
    var footEl = scrim.querySelector('[data-trh-footer]');
    if (!tbl || !emptyEl || !footEl) return null;

    var st = { rows: [], page: 1, pageSize: PAGE_SIZE, column: null, dir: 'none' };

    /* Узлы ДС ищем в момент использования: рантайм вправе перестроить шапку (Л185). */
    function head() { return tbl.querySelector('.tbl__row--head'); }

    /* Шапка — в исходное состояние: без сортировки. Рантайм ДС читает направление из
       data-sort-dir кнопки, поэтому сбрасываем и его, и глиф, и подписи. */
    function resetHead() {
      Array.prototype.forEach.call(tbl.querySelectorAll('[data-sort]'), function (b) {
        var th = b.closest('.th');
        var slot = b.querySelector('[data-icon]');
        b.dataset.sortDir = 'none';
        b.classList.remove('is-sorted');
        b.setAttribute('aria-label', SORT_LABEL.none);
        if (slot) {
          slot.setAttribute('data-icon', SORT_GLYPH.none);
          delete slot.dataset.iconDone;
        }
        if (th) { th.setAttribute('aria-sort', SORT_ARIA.none); th.classList.remove('th--sorted'); }
      });
      if (window.dsIcons) window.dsIcons.apply(tbl);
    }

    function pageSlice(list) {
      if (st.pageSize === 'all') return list;
      var from = (st.page - 1) * st.pageSize;
      return list.slice(from, from + st.pageSize);
    }

    function pages() {
      return st.pageSize === 'all' ? 1 : Math.max(1, Math.ceil(st.rows.length / st.pageSize));
    }

    function paintRows() {
      var h = head();
      var grid = (h && h.style.gridTemplateColumns) || '8px 144px 144px minmax(96px,1fr) 8px';
      Array.prototype.forEach.call(tbl.querySelectorAll('.tbl__row:not(.tbl__row--head)'), function (n) { n.remove(); });
      var list = pageSlice(sorted(st.rows, st.column, st.dir));
      tbl.insertAdjacentHTML('beforeend', list.map(function (r) { return rowHtml(r, grid); }).join(''));
      var body = tbl.closest('.dtable__body');
      if (body) body.scrollTop = 0;
      if (window.DSTable) {
        if (body) window.DSTable.bind(body);
        window.DSTable.wireAll(scrim);
      }
      if (window.dsIcons) window.dsIcons.apply(tbl);
    }

    function paintFooter() {
      footEl.textContent = '';
      if (!window.DSPagination) return;
      st.page = Math.min(Math.max(1, st.page), pages());
      footEl.appendChild(window.DSPagination.footer({
        pager: {
          total: st.rows.length,
          page: st.page,
          pageSize: st.pageSize,
          onChange: function (p) { st.page = p; paint(); },
          onPageSizeChange: function (size) { st.pageSize = size; st.page = 1; paint(); }
        }
      }));
      if (window.dsIcons) window.dsIcons.apply(footEl);
    }

    function paint() {
      var has = st.rows.length > 0;
      emptyEl.hidden = has;
      footEl.hidden = !has;
      paintRows();
      if (has) paintFooter(); else footEl.textContent = '';
    }

    /* Подставить строки: сортировка и страница — с начала. */
    function load(rows) {
      st.rows = normalize(rows == null ? readStore() : rows);
      st.page = 1;
      st.pageSize = PAGE_SIZE;
      st.column = null;
      st.dir = 'none';
      resetHead();
      paint();
    }

    /* Сортировку считает этот файл: рантайм ДС красит кнопку и шлёт sort, строки
       страницы после этого заменяются по всему массиву. */
    scrim.addEventListener('sort', function (e) {
      var d = e.detail;
      if (!d || !tbl.contains(e.target)) return;
      st.column = d.dir === 'none' ? null : d.column;
      st.dir = d.dir === 'asc' || d.dir === 'desc' ? d.dir : 'none';
      st.page = 1;
      paint();
    });

    var api = {
      load: load,
      rows: function () { return st.rows.map(function (r) { return { startDate: r.startDate, endDate: r.endDate, ratePercent: r.ratePercent }; }); },
      page: function () { return st.page; }
    };
    scrim.__trhApi = api;
    load([]);
    return api;
  }

  /* Подготовить окно и открыть поверх страницы. Без аргументов — строки из стора. */
  function open(params) {
    var scrim = document.getElementById(SCRIM_ID);
    if (!scrim) return null;
    var api = bind(scrim);
    if (!api) return null;
    api.load(params && params.rows ? params.rows : undefined);
    return window.DSModal ? window.DSModal.open(scrim) : null;
  }

  window.PostModalTransferRateHistory = { bind: bind, open: open };

  /* Окно стоит на странице в конце body: привязываем, как только скрим есть, —
     без вызова со страницы. */
  function bindAuto() { bind(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bindAuto);
  else bindAuto();
})();
