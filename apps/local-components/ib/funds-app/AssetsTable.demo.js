/* ============================================================
   AssetsTable.demo.js — сценарий демо витрины для «Активов фонда».
   Пишется руками; страницу рядом собирает kit-build.mjs и подключает этот файл последним.

   Рисует функцией самого виджета AssetsTable.render — той же, что на странице
   FundsPipeline. Данные — fixtures.json виджета ({ fund, assets } на состояние).
   - «Данные есть» — активы Интерроса; «Заполнено частично» — фонд не из ЕПК, активы
     без ИНН/КПП и без части значений (прочерки); «Данных нет» — РФПИ без активов;
   - «Загрузка» и «Ошибка» — разметка фрагмента, показ по data-state;
   - контрол «Длинные значения» — длинные названия, псевдоним, большие числа.
   Крестик и «Добавить актив» в витрине ничего не открывают: панель — страницы,
   окна активов не делаются. «Настройки таблицы» открывает стандартное окно ДС
   TableSettings (рантайм ДС).
   ============================================================ */
(function () {
  'use strict';

  window.IBPKitDemo.register('AssetsTable', {
    states: ['partial'],
    controls: function (defs) {
      return defs.concat([{ key: 'long', label: 'Длинные значения', bool: true, value: false }]);
    },
    cases: function (defs) {
      return defs.concat([{ label: 'Данные есть · длинные значения', st: { state: 'data', long: true } }]);
    },
    apply: function (root, st, ctx) {
      var T = window.AssetsTable;
      var fx = ctx.fixtures || {};
      if (!T) return;
      var key = st.state === 'loading' || st.state === 'error' ? 'data' : st.state;
      if (st.long && key !== 'empty') key = 'long';
      var f = fx[key] || fx.data;
      if (!f) return;
      if (st.mode) root.setAttribute('data-mode', st.mode);
      T.render(root, { fund: f.fund, assets: f.assets });
      if (st.state === 'loading' || st.state === 'error') root.setAttribute('data-state', st.state);
    }
  });
})();
