/* ============================================================
   TrancheLoanLimitsTile.demo.js — сценарий демо витрины для тайла
   «Валюта транша» (раздел «Общая информация» страницы транша).
   Пишется руками; страницу рядом собирает kit-build.mjs и подключает этот
   файл последним.

   Оси конструктора — только data-mode (edit | view) из CSS виджета: состояние
   данных у компонента одно — «данные есть» (решение человека 02.11.2026).
   Сценарий добавляет контрол «Длинные значения» — крупная сумма, чтобы увидеть,
   что аффикс валюты не уезжает.
   Значения — из fixtures.json (view / long) в форме MOCK_TRANCHE. Рисует
   PostTileTrancheLoanLimits.render — та же функция, что на странице транша.
   ============================================================ */
(function () {
  'use strict';

  window.IBPKitDemo.register('TrancheLoanLimitsTile', {
    controls: function (defs) {
      return defs.concat([
        { key: 'long', label: 'Длинные значения', bool: true, value: false }
      ]);
    },
    apply: function (tile, st, ctx) {
      var T = window.PostTileTrancheLoanLimits;
      var fx = ctx.fixtures || {};
      if (!T || !fx.view) return;
      T.render(tile, {
        mode: st.mode || 'edit',
        data: st.long && fx.long ? fx.long : fx.view
      });
    }
  });
})();
