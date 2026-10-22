/* ============================================================
   FinInstrumentsTile.demo.js — сценарий демо витрины для тайла
   «Финансовые инструменты». Пишется руками; страницу рядом собирает
   kit-build.mjs и подключает этот файл последним.

   Что добавляет к общему демо (состояния и режимы из CSS виджета):
   - карточки — сделки-образцы из fixtures.json тайла, а не пример из
     фрагмента: data (1027, в просмотре — 1024), empty (1026 — есть что
     генерировать; в просмотре — 1042);
   - «Заполнено частично» — состояние, которое CSS не различает: разметка
     та же, отличаются данные (у карточек 1027 есть прочерки);
   - «Загрузка» и «Обновление» — на карточках сделки data;
   - свитч «Погашенная сделка» — карточки сделки 1048 (Погашена): все её
     карточки погашены, и в шапке каждой виден сабхедер с фактической датой
     погашения; выключен — сделка-образец data (1027).
   - не больше трёх карточек, одна погашена: в документации и демо хватает
     трёх (решение человека 17.10.2026, RE0028). Ограничение — только здесь,
     у тайла и стора его нет; данные модуля не тронуты;
   - ширина по умолчанию — 600px (на странице сделки тайл на 6 колонках);
   - «Все состояния рядом» — по две копии в ряд (perRow), карточки в копиях
     свёрнуты.
   Витрина правки не сохраняет: FinInstrumentsStore.persist(false),
   ProductTreeStore.persist(false). Карточки рисует FinInstrumentsTile.js
   (PostTileFinInstruments.render) по FinInstrumentsStore — те же функции и
   тот же стор, что на странице сделки.

   Стор один на страницу, а «Все состояния рядом» показывают разные
   сделки. Поэтому виды всех сделок-образцов снимаются один раз, до того
   как живой тайл привязан к стору. Живой тайл связан со стором
   (PostTileFinInstruments.bind) — вкладки, сворачивание, «Сгенерировать
   автоматически» и окна работают, как на странице; копии — снимки.
   ============================================================ */
(function () {
  'use strict';

  var views = null;
  var bound = false;

  function dealOf(st, fx) {
    var k = st.state === 'empty' ? 'empty' : 'data';
    var f = fx[k] || {};
    return st.mode === 'view' && f.viewDealId ? f.viewDealId : f.dealId;
  }

  /* Одна погашенная и до двух активных. В сделке, где активных нет (все
     карточки погашены), — первые три. */
  function trim(cards) {
    var repaid = cards.filter(function (c) { return c.isRepaid; });
    var active = cards.filter(function (c) { return !c.isRepaid; });
    if (!active.length) return repaid.slice(0, 3);
    return repaid.length ? active.slice(0, 2).concat(repaid[0]) : active.slice(0, 3);
  }

  /* Стор для живого тайла: те же события и действия, а список — урезанный,
     чтобы перерисовки по commit тоже давали не больше трёх карточек. */
  function limited(S) {
    return {
      on: function () { return S.on.apply(S, arguments); },
      view: function () { return trim(S.view()); },
      generatable: function () { return S.generatable(); },
      generate: function () { return S.generate(); }
    };
  }

  /* Копии «Все состояния рядом» — со свёрнутыми карточками: тайл обычно
     разворачивает первую, но в копиях важна картина целиком. */
  function collapseAll(tile) {
    if (!window.DSTile) return;
    tile.querySelectorAll('.lc-fin-card').forEach(function (card) { window.DSTile.toggle(card, true); });
  }

  function open(id) {
    window.ProductTreeStore.use(id);
    window.FinInstrumentsStore.use(id);
  }

  function snapshot(fx) {
    if (views) return;
    views = {};
    Object.keys(fx).forEach(function (k) {
      [fx[k] && fx[k].dealId, fx[k] && fx[k].viewDealId, fx[k] && fx[k].repaidDealId].forEach(function (id) {
        if (id == null || views[id]) return;
        open(id);
        var S = window.FinInstrumentsStore;
        views[id] = { cards: trim(S.view()), gen: S.generatable().length > 0 };
      });
    });
  }

  /* Явное состояние — только у тех, что не выводятся из данных: загрузка,
     обновление. Остальные render выводит сам (stateOf). */
  function opts(st, gen) {
    var o = { mode: st.mode, canGenerate: gen };
    if (st.state === 'loading' || st.state === 'updating') o.state = st.state;
    return o;
  }

  /* Свитч «Погашенная сделка»: включён — показываем сделку, где все карточки
     погашены (id из fixtures), выключен — сделку-образец data. Признак
     погашения приходит из данных (карточка погашена, когда все её узлы
     погашены), а не задаётся сценарием. */
  if (window.FinInstrumentsStore) window.FinInstrumentsStore.persist(false);
  if (window.ProductTreeStore) window.ProductTreeStore.persist(false);

  window.IBPKitDemo.register('FinInstrumentsTile', {
    states: ['partial'],
    perRow: 2,
    controls: function (defs) {
      defs.forEach(function (d) { if (d.key === 'width') d.value = 600; });
      return defs.concat([{ key: 'repaid', label: 'Погашенная сделка', bool: true, value: false }]);
    },
    apply: function (tile, st, ctx) {
      var T = window.PostTileFinInstruments, S = window.FinInstrumentsStore;
      var fx = ctx.fixtures || {};
      if (!T || !S || !window.ProductTreeStore || !fx.data) return;
      snapshot(fx);
      var id = st.repaid && fx.data.repaidDealId ? fx.data.repaidDealId : dealOf(st, fx);
      if (!ctx.live) {
        T.render(tile, views[id].cards, opts(st, views[id].gen));
        collapseAll(tile);
        return;
      }
      if (String(S.dealId()) !== String(id)) open(id);
      if (!bound) { T.bind(tile, limited(S)); T.watchTabs(tile); bound = true; }
      T.render(tile, trim(S.view()), opts(st, S.generatable().length > 0));
    }
  });
})();
