/* ============================================================
   LoanExternalDataTile.demo.js — сценарий демо витрины для тайла
   «Техническая информация». Пишется руками; страницу рядом собирает
   kit-build.mjs и подключает этот файл последним.

   Оси конструктора — data-state (loading/data/partial/empty) и data-mode
   (edit/view) из CSS виджета. Сценарий добавляет контрол «Потребитель» —
   НКЛ | Транш (решение человека 02.11.2026, RE0049): состав полей зависит
   от потребителя, оси data-state/data-mode его не различают. Новый потребитель
   в JS виджета — добавить опцию в контрол здесь.
   Рисует PostTileLoanExternalData.render — та же функция, что на страницах
   НКЛ и транша.
   ============================================================ */
(function () {
  'use strict';

  window.IBPKitDemo.register('LoanExternalDataTile', {
    controls: function (defs) {
      return defs.concat([
        { key: 'consumer', label: 'Потребитель', value: 'nkl',
          options: [['nkl', 'НКЛ'], ['tranche', 'Транш']] }
      ]);
    },
    apply: function (tile, st, ctx) {
      var T = window.PostTileLoanExternalData;
      var fx = ctx.fixtures || {};
      if (!T) return;
      var src = st.long && fx.long ? fx.long
        : st.state === 'partial' && fx.partial ? fx.partial
        : st.state === 'empty' && fx.empty ? fx.empty
        : fx.data;
      T.render(tile, { mode: st.mode || 'edit', consumer: st.consumer || 'nkl', data: src });
    }
  });
})();
