/* ============================================================
   EditFundModal.demo.js — сценарий демо витрины для окна «Форма фонда».
   Пишется руками; страницу рядом собирает kit-build.mjs и подключает этот
   файл последним.

   Что добавляет к общему демо:
   - «Вариант» — закрытый список variants паспорта: add-ucp, create-custom,
     edit-ucp, edit-custom; окно рисует само (EditFundModal.render) по образцу
     из fixtures.json — те же функции, что на странице;
   - «Заполнено частично» и «Обновление» — CSS их не различает: первое — те же
     поля с пустыми значениями, второе переводит в классы ДС скрипт окна
     (EditFundModal.mirror);
   - «Длинные значения» — ключ long в fixtures.json;
   - копии «Все состояния рядом» — четыре варианта с данными, затем
     загрузка, частичное заполнение и сохранение.
   ============================================================ */
(function () {
  'use strict';

  var VARIANTS = [
    ['add-ucp', 'Добавить фонд из ЕПК'],
    ['create-custom', 'Новый фонд не из ЕПК'],
    ['edit-ucp', 'Редактировать фонд из ЕПК'],
    ['edit-custom', 'Редактировать фонд не из ЕПК']
  ];
  var LABEL = {};
  VARIANTS.forEach(function (v) { LABEL[v[0]] = v[1]; });

  function optsOf(variant, fx) {
    fx = fx || {};
    if (variant === 'add-ucp') return { mode: 'create', source: 'ucp', client: fx.client };
    if (variant === 'create-custom') return { mode: 'create', source: 'custom', name: fx.name };
    if (variant === 'edit-ucp') return { mode: 'update', source: 'ucp', fund: fx.fund };
    return { mode: 'update', source: 'custom', fund: fx.fundCustom };
  }

  window.IBPKitDemo.register('EditFundModal', {
    states: ['partial', 'updating'],
    labels: { updating: 'Обновление (сохранение)' },
    controls: function (defs) {
      return defs.concat([
        { key: 'variant', label: 'Вариант', value: 'add-ucp', options: VARIANTS },
        { key: 'long', label: 'Длинные значения', bool: true, value: false }
      ]);
    },
    apply: function (scrim, st, ctx) {
      var M = window.EditFundModal;
      if (!M) return;
      var all = ctx.fixtures || {};
      var fx = st.long ? all.long : (st.state === 'partial' ? all.partial : all.data);
      M.render(scrim, optsOf(st.variant || 'add-ucp', fx));
      M.setState(scrim, st.state || 'data');
    },
    cases: function () {
      var list = VARIANTS.map(function (v) { return { label: v[1], st: { state: 'data', variant: v[0] } }; });
      return list.concat([
        { label: 'Загрузка данных фонда · ' + LABEL['edit-ucp'], st: { state: 'loading', variant: 'edit-ucp' } },
        { label: 'Заполнено частично · ' + LABEL['edit-custom'], st: { state: 'partial', variant: 'edit-custom' } },
        { label: 'Обновление (сохранение) · ' + LABEL['edit-ucp'], st: { state: 'updating', variant: 'edit-ucp' } }
      ]);
    },
    perRow: 2
  });
})();
