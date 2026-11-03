/* ============================================================
   AddFundEntityFromUcpModal.demo.js — сценарий демо витрины для окна «Добавить фонд —
   поиск в базах». Пишется руками; страницу рядом собирает kit-build.mjs и подключает этот
   файл последним.

   Окно встроено в стенд (modal-scrim--inline) и рисуется функциями самого окна —
   AddFundEntityFromUcpModal.render / select / setState, теми же, что на странице «Фонды».
   Базы — MOCK_FUNDS и MOCK_UCP_CLIENTS страницы; что ввести и что выбрать — fixtures.json:
   - Поиск не выполнялся — пустые поля (макет «Search empty»);
   - Загрузка — скелетоны карточек и деталей;
   - Данные есть — «Интеррос» / «0765» (макеты «Search result A» и «B»);
   - Заполнено частично — клиент ЕПК без холдинга, команды и отраслей (прочерки);
   - Данных нет — «Андромеда» (макет «Empty search result»);
   - Ошибка — Alert с «Повторить» в колонке результатов.
   Свои контролы: «Выбрано» (фонд — «Продолжить» выключена; клиент ЕПК — включена) и
   «Длинные значения». В живом стенде поиск, выбор карточек и «Новый фонд» работают;
   «Продолжить» и «Новый фонд» в витрине ничего не открывают — следующее окно у страницы.
   ============================================================ */
(function () {
  'use strict';

  var STATES = ['idle', 'loading', 'data', 'partial', 'empty', 'error'];

  window.IBPKitDemo.register('AddFundEntityFromUcpModal', {
    states: ['partial'],
    labels: { idle: 'Поиск не выполнялся', data: 'Найдено', empty: 'Ничего не найдено', error: 'Ошибка поиска' },
    controls: function (defs) {
      defs.forEach(function (d) { if (d.key === 'state') d.value = 'data'; });
      return defs.concat([
        { key: 'pick', label: 'Выбрано', value: 'fund', options: [['fund', 'Фонд из базы фондов'], ['client', 'Клиент ЕПК']] },
        { key: 'long', label: 'Длинные значения', bool: true, value: false }
      ]);
    },
    cases: function () {
      return [
        { label: 'Поиск не выполнялся', st: { state: 'idle' } },
        { label: 'Найдено · выбран фонд', st: { state: 'data', pick: 'fund' } },
        { label: 'Найдено · выбран клиент ЕПК', st: { state: 'data', pick: 'client' } },
        { label: 'Заполнено частично · клиент ЕПК', st: { state: 'partial', pick: 'client' } },
        { label: 'Ничего не найдено', st: { state: 'empty' } },
        { label: 'Загрузка', st: { state: 'loading' } },
        { label: 'Ошибка поиска', st: { state: 'error' } },
        { label: 'Длинные значения · клиент ЕПК', st: { state: 'data', pick: 'client', long: true } }
      ];
    },
    perRow: 1,
    apply: function (scrim, st, ctx) {
      var M = window.AddFundEntityFromUcpModal;
      var fx = ctx.fixtures || {};
      if (!M || STATES.indexOf(st.state) < 0) return;
      var withData = st.state === 'data' || st.state === 'partial';
      var key = st.long && withData ? 'long' : st.state;
      var f = fx[key] || {};
      M.render(scrim, {
        funds: f.funds || window.MOCK_FUNDS || [],
        clients: f.clients || window.MOCK_UCP_CLIENTS || [],
        prefill: f.prefill || {},
        search: withData || st.state === 'empty',
        onNext: function () {},
        onCreateFund: function () {}
      });
      if (st.state === 'loading') M.setState(scrim, 'loading');
      if (st.state === 'error') M.setState(scrim, 'error', f.message);
      if (withData && f.select) {
        var kind = st.pick === 'client' ? 'client' : 'fund';
        M.select(scrim, kind, f.select[kind]);
      }
    }
  });
})();
