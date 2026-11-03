/* ============================================================
   AdditionalAgreementTile.demo.js — сценарий демо витрины для карточки
   дополнительного соглашения (ДС). Пишется руками; страницу рядом собирает
   kit-build.mjs и подключает этот файл последним.

   У карточки нет оси data-state, поэтому сценарий сам задаёт то, что она
   различает:
   - состояние данных: «Заполнено» и «Заполнено частично» (нет типа изменения,
     ключевых изменений, решения и комментария — на месте прочерки);
   - режим прав: правка доступна (карандаш + шеврон) / недоступна (только шеврон);
   - контрол «Развёрнута» — карточка раскрыта и видно «Комментарий»;
   - контрол «Длинные значения» — те же данные с самыми длинными значениями;
   - данные — из fixtures.json карточки; рисует их AdditionalAgreementTile.js
     (PostTileAdditionalAgreement.renderList), те же функции, что на странице;
   - «Все состояния рядом» — матрица макета «Tile_AdditionalAgreement»: строки —
     правка доступна / недоступна, колонки — свёрнута / развёрнута.
   Подписи кодов справочников (тип изменения, ключевые изменения, уровень
   одобрения) в витрине берутся из глобалов, если их подключила страница-хозяин;
   нет глобала — показывается код.
   ============================================================ */
(function () {
  'use strict';

  var API = function () { return window.PostTileAdditionalAgreement; };

  var MODES = [['edit', 'Правка доступна'], ['view', 'Правка недоступна']];

  function pick(fx, st) {
    var src = st.long && fx.long ? fx.long : (st.state === 'partial' && fx.partial ? fx.partial : fx.data);
    var view = {};
    for (var k in src) if (Object.prototype.hasOwnProperty.call(src, k)) view[k] = src[k];
    return view;
  }

  window.IBPKitDemo.register('AdditionalAgreementTile', {
    states: ['data', 'partial'],
    labels: { data: 'Заполнено', partial: 'Заполнено частично' },
    controls: function (defs) {
      var out = defs.filter(function (d) { return d.key !== 'mode'; });
      return out.concat([
        { key: 'mode', label: 'Режим прав', value: 'edit', options: MODES },
        { key: 'expanded', label: 'Развёрнута', bool: true, value: false },
        { key: 'long', label: 'Длинные значения', bool: true, value: false }
      ]);
    },
    apply: function (tile, st, ctx) {
      var api = API();
      if (!api) return;
      var mode = st.mode === 'view' ? 'view' : 'edit';
      var view = pick(ctx.fixtures || {}, st);
      view.mode = mode;
      view.collapsed = !st.expanded;
      /* состояние «свёрнута / развёрнута» карточка помнит по id — у каждого сочетания свой id */
      view.id = String(view.id || 'AA') + '-demo-' + mode + (st.expanded ? '-e' : '-c') + (st.long ? '-l' : '') + (st.state === 'partial' ? '-p' : '');
      api.renderList(tile, { mode: mode, items: [view] });
    },
    matrix: function () {
      return {
        cols: ['Свёрнута', 'Развёрнута'],
        rows: MODES.map(function (m) {
          return {
            label: m[1],
            cells: [
              { st: { state: 'data', mode: m[0], expanded: false } },
              { st: { state: 'data', mode: m[0], expanded: true } }
            ]
          };
        })
      };
    }
  });
})();
