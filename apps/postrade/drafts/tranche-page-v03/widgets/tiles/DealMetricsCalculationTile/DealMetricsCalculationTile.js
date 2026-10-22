/* ============================================================
   DealMetricsCalculationTile.js — тайл «Финансовые метрики»: расчёт
   финансовых метрик по ФИ сделки.

   Фрагмент DealMetricsCalculationTile.html держит все виды сразу, нужный
   показывает DealMetricsCalculationTile.css по атрибутам корня. Скрипт только
   ставит атрибуты, вписывает числа и дату и ведёт кнопки во время расчёта.
   Режим (data-mode: edit | view) ставит страница — по статусу сделки и роли;
   тайл его не трогает, вид в просмотре держит CSS.

   Правила предметной области (когда «Заблокировано», «Ошибка», что значит
   «рассчитано») живут в сторе — data/fin-metrics-store.js. Скрипт
   подключается после стора и после FinInstrumentsTile.js.

   API:
     PostTileMetricsCalc.viewOf(state) → { state, locked, error, calculated,
         busy, done, total, at }
       state — FinMetricsStore.state(): { code, busy, calculated,
       calculatedAt, done, total }. Возвращает атрибуты корня:
         state      — data-state: updating (идёт расчёт) | empty (нет ФИ или
                      не рассчитано) | partial (done < total) | data;
         locked     — data-fm-locked  (code LOCKED);
         error      — data-fm-error   (code ERROR);
         calculated — data-fm-calculated (есть успешный расчёт);
       и тексты: done, total, at — «ДД.ММ.ГГГГ, ЧЧ:ММ» по местному времени.
     PostTileMetricsCalc.render(tile, state)
       Ставит атрибуты, тексты и доступность кнопок: кнопка, недоступная по
       виду или режиму (data-mode читается с корня), — disabled, а не только
       скрыта. Во время расчёта — лоадер на видимой кнопке расчёта
       (btn--loading + spin--current, aria-busy), disabled — все кнопки,
       «Отчеты →» тоже. Режим сменился — позвать render снова.
     PostTileMetricsCalc.bind(tile, store, opts?) → off()
       Связывает тайл со стором метрик (FinMetricsStore) и стором ФИ
       (FinInstrumentsStore): перерисовка на change стора метрик, на use и
       commit стора ФИ (добавили ФИ — «Заблокировано» уходит).
       «Рассчитать» и «Пересчет метрик» — store.calculate() и снек по исходу.
       opts.confirm(unallocated) → Promise<boolean> — необязательное подтверждение перед
       пересчётом (RE0034, Э5): зовётся, пока store.rasUnallocated() вернул нераспределённую
       дельту РСБУ ({ fiId, amount, currencyCode }); false — пересчёта нет. Без opts пересчёт
       идёт сразу.

   Действия — [data-fm-act], клики делегированы на документ:
     CALCULATE — расчёт (тайл, связанный со стором, выполняет сам);
     FIXATION  — окно «Фиксация ЭПС/ВБС» (RE0033 Э6);
     REPORTS   — «Отчеты →»: страница финансовых метрик сделки.
   FIXATION и REPORTS уходят событием 'fmcalcaction' с корня тайла,
   detail = { action }; куда идти, знает страница.

   Снеки по исходу расчёта — FinMetricsNotify.calculation (data/fin-metrics-notify.js,
   подключить на страницу после fin-metrics-store.js): один снек на исход, тексты там.
   ============================================================ */
(function () {
  'use strict';

  var ROOT = '.lc-fin-metrics';

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  /* ISO → «ДД.ММ.ГГГГ, ЧЧ:ММ» по местному времени. */
  function formatAt(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return pad(d.getDate()) + '.' + pad(d.getMonth() + 1) + '.' + d.getFullYear() +
      ', ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }

  /* ── Вид по состоянию стора ─────────────────────────────────────── */

  function viewOf(s) {
    s = s || {};
    var locked = s.code === 'LOCKED';
    var calculated = !locked && !!s.calculated;
    var state = s.busy ? 'updating'
      : !calculated ? 'empty'
      : (s.done < s.total ? 'partial' : 'data');
    return {
      state: state,
      locked: locked,
      error: !locked && s.code === 'ERROR',
      calculated: calculated,
      busy: !!s.busy,
      done: s.done || 0,
      total: s.total || 0,
      at: formatAt(s.calculatedAt)
    };
  }

  /* ── Отрисовка ──────────────────────────────────────────────────── */

  function flag(tile, name, on) {
    if (on) tile.setAttribute(name, 'true');
    else tile.removeAttribute(name);
  }

  function text(tile, sel, value) {
    var el = tile.querySelector(sel);
    if (el) el.textContent = String(value);
  }

  /* Лоадер на кнопке расчёта — разметка Buttons ДС (btn--loading + spin--current). */
  function setLoading(btn, on) {
    var spin = btn.querySelector('.spin');
    btn.classList.toggle('btn--loading', on);
    if (on) {
      if (!spin) {
        spin = document.createElement('span');
        spin.className = 'spin spin--current';
        spin.setAttribute('aria-hidden', 'true');
        btn.insertBefore(spin, btn.firstChild);
      }
      btn.setAttribute('aria-busy', 'true');
    } else {
      if (spin) spin.parentNode.removeChild(spin);
      btn.removeAttribute('aria-busy');
    }
  }

  /* Доступность кнопок — разметкой, а не только стилем (урок Л235): кнопка,
     которую CSS прячет по виду или режиму, ещё и disabled, иначе скрытое
     действие срабатывает. «Рассчитать» — в правке, есть ФИ, расчёта не было;
     «Пересчет метрик» и «Фиксация ЭПС/ВБС» — в правке после расчёта;
     «Отчеты →» — после расчёта в любом режиме. Во время расчёта заблокировано
     всё, лоадер — на той кнопке расчёта, что на виду. */
  function isView(tile) { return tile.getAttribute('data-mode') === 'view'; }

  function allowed(btn, v, view) {
    var action = btn.getAttribute('data-fm-act');
    var first = !!btn.closest('.lc-fin-metrics__start');
    if (action === 'REPORTS') return v.calculated;
    if (view || v.locked) return false;
    if (action === 'CALCULATE' && first) return !v.calculated;
    return v.calculated;
  }

  function setButtons(tile, v) {
    var view = isView(tile);
    tile.querySelectorAll('button[data-fm-act]').forEach(function (btn) {
      var ok = allowed(btn, v, view);
      btn.disabled = v.busy || !ok;
      if (btn.getAttribute('data-fm-act') === 'CALCULATE') {
        var shown = !!btn.closest('.lc-fin-metrics__start') !== v.calculated;
        setLoading(btn, v.busy && shown);
      }
    });
  }

  function render(tile, s) {
    if (!tile) return;
    var v = viewOf(s);
    tile.setAttribute('data-state', v.state);
    flag(tile, 'data-fm-locked', v.locked);
    flag(tile, 'data-fm-error', v.error);
    flag(tile, 'data-fm-calculated', v.calculated);
    text(tile, '[data-fm-done]', v.done);
    text(tile, '[data-fm-total]', v.total);
    text(tile, '[data-fm-at]', v.at);
    setButtons(tile, v);
    if (window.dsIcons) window.dsIcons.apply(tile);
  }

  /* ── Действия ───────────────────────────────────────────────────── */

  function emit(tile, action) {
    tile.dispatchEvent(new CustomEvent('fmcalcaction', { bubbles: true, detail: { action: action } }));
  }

  /* Снек по исходу расчёта — общий файл data/fin-metrics-notify.js. */
  function snack(res) {
    if (window.FinMetricsNotify) window.FinMetricsNotify.calculation(res);
  }

  function bind(tile, store, opts) {
    if (!tile || !store) return function () {};
    var cards = window.FinInstrumentsStore;
    var paint = function () { render(tile, store.state()); };
    var offs = [store.on('change', paint)];
    if (cards) {
      offs.push(cards.on('change', function (d) { if (d && d.reason === 'use') paint(); }));
      offs.push(cards.on('commit', paint));
    }
    tile.__fmPaint = paint;
    tile.__fmAct = function (action) {
      if (action === 'CALCULATE') {
        var s = store.state();
        if (s.busy || s.code === 'LOCKED' || isView(tile)) return;
        var un = opts && opts.confirm && store.rasUnallocated ? store.rasUnallocated() : null;
        if (un) {
          opts.confirm(un).then(function (ok) { if (ok) store.calculate().then(snack); });
          return;
        }
        store.calculate().then(snack);
        return;
      }
      emit(tile, action);
    };
    paint();
    return function off() {
      offs.forEach(function (f) { f(); });
      tile.__fmAct = null;
      tile.__fmPaint = null;
    };
  }

  document.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('[data-fm-act]');
    if (!el) return;
    var tile = el.closest(ROOT);
    if (!tile) return;
    if (el.tagName === 'A') e.preventDefault();
    if (el.disabled || el.getAttribute('aria-disabled') === 'true') return;
    var action = el.getAttribute('data-fm-act');
    if (tile.__fmAct) tile.__fmAct(action);
    else if (action !== 'CALCULATE') emit(tile, action);
  });

  window.PostTileMetricsCalc = { viewOf: viewOf, render: render, bind: bind };
})();
