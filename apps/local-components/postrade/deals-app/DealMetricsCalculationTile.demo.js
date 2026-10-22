/* ============================================================
   DealMetricsCalculationTile.demo.js — сценарий демо витрины для тайла
   «Финансовые метрики». Пишется руками; страницу рядом собирает
   kit-build.mjs и подключает этот файл последним.

   Что добавляет к общему демо (оси данных и прав — из CSS виджета):
   - своя ось «Вид» — По умолчанию · Ошибка · Заблокировано (атрибуты
     data-fm-error, data-fm-locked); вместе с осью данных (Не рассчитано ·
     Рассчитано · Рассчитано частично · Идёт расчет) и режимом прав она
     даёт матрицу макета «Tile-Deal-Metrics-Calculation»;
   - состояния, которые CSS не различает: «Рассчитано» и «Рассчитано
     частично» — та же разметка, другие N и M; «Идёт расчет» — лоадер на
     кнопке расчёта (ставит скрипт тайла);
   - данные — сделки-образцы из fixtures.json тайла: заблокировано 1026,
     не рассчитано 1044, ошибка 1036, рассчитано 1024, частично 1027,
     ошибка над расчётом 1028, пересчёт 1027;
   - ширина по умолчанию — 600px (на странице сделки тайл на 6 колонках);
   - «Все состояния рядом» — матрица: колонки — режим прав, строки — виды.
   Витрина ничего не сохраняет: FinMetricsStore.persist(false),
   FinInstrumentsStore.persist(false), ProductTreeStore.persist(false).
   Рисует DealMetricsCalculationTile.js (PostTileMetricsCalc.render) по
   FinMetricsStore.state() — те же функции и тот же стор, что на странице.

   Стор один на страницу, а «Все состояния рядом» показывают разные сделки.
   Поэтому состояния всех сделок-образцов снимаются один раз, до того как
   живой тайл привязан к стору. Живой тайл связан со стором
   (PostTileMetricsCalc.bind): «Рассчитать» и «Пересчет метрик» считают и
   показывают снек, как на странице; копии — снимки.
   ============================================================ */
(function () {
  'use strict';

  var LABELS = {
    empty: 'Не рассчитано', data: 'Рассчитано', partial: 'Рассчитано частично', updating: 'Идет расчет',
    edit: 'Редактирование доступно', view: 'На просмотр'
  };

  var snaps = null;
  var bound = false;

  /* Сделка-образец и признак расчёта по значениям конструктора. */
  function pick(st, fx) {
    var f = function (k) { return (fx[k] || {}).dealId; };
    if (st.calc === 'locked') return { id: f('locked') };
    if (st.state === 'updating') return { id: st.calc === 'error' ? f('error') : f('updating'), busy: true };
    if (st.calc === 'error') return { id: st.state === 'empty' || st.state === 'loading' ? f('error') : f('errorCalculated') };
    if (st.state === 'data') return { id: st.mode === 'view' && fx.data.viewDealId ? fx.data.viewDealId : f('data') };
    if (st.state === 'partial') return { id: f('partial') };
    return { id: f('empty') };
  }

  function open(id) {
    if (window.ProductTreeStore) window.ProductTreeStore.use(id);
    window.FinInstrumentsStore.use(id);
    window.FinMetricsStore.use(id);
  }

  function snapshot(fx) {
    if (snaps) return;
    snaps = {};
    Object.keys(fx).forEach(function (k) {
      var id = fx[k] && fx[k].dealId;
      var view = fx[k] && fx[k].viewDealId;
      [id, view].forEach(function (d) {
        if (d == null || snaps[d]) return;
        open(d);
        snaps[d] = window.FinMetricsStore.state();
      });
    });
  }

  function withBusy(s, busy) {
    var out = {};
    Object.keys(s).forEach(function (k) { out[k] = s[k]; });
    if (busy) out.busy = true;
    return out;
  }

  /* строка матрицы: по копии на каждый режим прав */
  function row(label, st, note) {
    return {
      label: label, note: note,
      cells: ['edit', 'view'].map(function (m) {
        return { st: { calc: st.calc, state: st.state, mode: m } };
      })
    };
  }

  if (window.FinMetricsStore) window.FinMetricsStore.persist(false);
  if (window.FinInstrumentsStore) window.FinInstrumentsStore.persist(false);
  if (window.ProductTreeStore) window.ProductTreeStore.persist(false);

  window.IBPKitDemo.register('DealMetricsCalculationTile', {
    states: ['data', 'partial', 'empty', 'updating'],
    labels: LABELS,
    gallery: true,
    controls: function (defs) {
      defs.forEach(function (d) { if (d.key === 'width') d.value = 600; });
      return defs.concat([
        { key: 'calc', label: 'Вид', value: 'default',
          options: [['default', 'По умолчанию'], ['error', 'Ошибка'], ['locked', 'Заблокировано']] }
      ]);
    },
    matrix: {
      cols: [LABELS.edit, LABELS.view],
      rows: [
        { label: 'Заблокировано', note: 'нет ФИ; данные и права на вид не влияют',
          cells: [{ span: true, st: { calc: 'locked', state: 'empty', mode: 'edit' }, match: { calc: 'locked' } }] },
        row('Не рассчитано', { calc: 'default', state: 'empty' }),
        row('Ошибка', { calc: 'error', state: 'empty' }, 'не рассчитано'),
        row('Рассчитано', { calc: 'default', state: 'data' }),
        row('Рассчитано частично', { calc: 'default', state: 'partial' }),
        row('Ошибка над расчетом', { calc: 'error', state: 'data' }, 'прежний расчет остается'),
        { label: 'Идет расчет', note: 'пересчет',
          cells: [{ span: true, st: { calc: 'default', state: 'updating', mode: 'edit' } }] },
        { label: 'Идет расчет', note: 'повторный после ошибки',
          cells: [{ span: true, st: { calc: 'error', state: 'updating', mode: 'edit' } }] },
        { label: 'Загрузка', note: 'до ответа стора',
          cells: [{ span: true, st: { calc: 'default', state: 'loading', mode: 'edit' }, match: { state: 'loading' } }] }
      ]
    },
    apply: function (tile, st, ctx) {
      var T = window.PostTileMetricsCalc, S = window.FinMetricsStore;
      var fx = ctx.fixtures || {};
      if (!T || !S || !window.FinInstrumentsStore || !fx.empty) return;
      snapshot(fx);
      var p = pick(st, fx);
      if (!ctx.live) {
        T.render(tile, withBusy(snaps[p.id], p.busy));
      } else {
        if (String(S.dealId()) !== String(p.id)) open(p.id);
        if (!bound) { T.bind(tile, S); bound = true; }
        T.render(tile, withBusy(S.state(), p.busy));
      }
      if (st.state === 'loading') tile.setAttribute('data-state', 'loading');
    }
  });
})();
