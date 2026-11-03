/* ============================================================
   TrancheNrlSummaryTile.demo.js — сценарий демо витрины для тайла
   «Сводка НКЛ» (раздел «НКЛ» страницы транша). Пишется руками; страницу
   рядом собирает kit-build.mjs и подключает этот файл последним.

   Без него конструктор пуст: у компонента одно состояние («данные есть»),
   осей data-state/data-mode в CSS нет, а три варианта переключаются
   data-variant на корне — этот атрибут генератор витрины не видит.
   Сценарий добавляет:
   - контрол «Вариант» — Контрагент · Баланс и валюта · Общая сумма лимита;
   - контрол «Рейтинг не рассчитан» — чип метрики без зоны (outline);
   - контрол «Длинные значения» — самое длинное наименование, длинная
     подпись баланса, крупная сумма;
   - «Все состояния рядом» — три варианта в ряд (кейсы по вариантам).
   Значения — из fixtures.json тайла: counterparty — запись базы контрагентов,
   balanceCurrency — раздел записи договора НКЛ, как отдаёт страница
   (LoanAgreementStore). Рисует PostTileTrancheNrlSummary.render — та же
   функция, что на странице транша. Ширина по умолчанию 360px — тайлы раздела
   «НКЛ» стоят по 360px (решение дизайнера 07.10.2026).
   ============================================================ */
(function () {
  'use strict';

  window.IBPKitDemo.register('TrancheNrlSummaryTile', {
    controls: function (defs) {
      defs.forEach(function (d) { if (d.key === 'width') d.value = 360; });
      return defs.concat([
        { key: 'variant', label: 'Вариант', value: 'counterparty',
          options: [['counterparty', 'Контрагент'], ['balance', 'Баланс и валюта'], ['limit', 'Общая сумма лимита']] },
        { key: 'noRating', label: 'Рейтинг не рассчитан', bool: true, value: false },
        { key: 'long', label: 'Длинные значения', bool: true, value: false }
      ]);
    },
    /* «Все состояния рядом»: состояние одно — показываем три варианта */
    cases: function () {
      return [
        { label: 'Контрагент', st: { variant: 'counterparty' } },
        { label: 'Баланс и валюта', st: { variant: 'balance' } },
        { label: 'Общая сумма лимита', st: { variant: 'limit' } }
      ];
    },
    perRow: 3,
    apply: function (tile, st, ctx) {
      var T = window.PostTileTrancheNrlSummary;
      var fx = ctx.fixtures || {};
      if (!T || !fx.view) return;
      var src = st.long && fx.long ? fx.long : (st.noRating && fx.noRating ? fx.noRating : fx.view);
      T.render(tile, {
        variant: st.variant,
        counterparty: src.counterparty,
        balanceCurrency: src.balanceCurrency
      });
    }
  });
})();
