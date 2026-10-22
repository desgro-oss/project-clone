/* ============================================================
   RsbuInterestAdjustmentsTile.demo.js — сценарий демо витрины для тайла
   «Корректировки процентов РСБУ». Пишется руками; страницу рядом собирает
   kit-build.mjs и подключает этот файл последним.

   Что добавляет к общему демо (оси данных и прав — из CSS виджета):
   - третья ось «Условия» — выполнены (процентные платежи рассчитаны) или
     нет («Требуется расчёт…»); свой контрол, атрибут data-calc;
   - подписи осей словами задачи: есть / нет данных, редактирование
     доступно / недоступно;
   - пробный вид «Все состояния» в зоне демо (gallery) и матрица копий
     (matrix, RE0027): колонки — права, строки — данные при выполненных
     условиях и «Условия не выполнены» одной ячейкой на строку (данные и
     права на неё не влияют) — сетка 2×3; минимум тайла 200px — по умолчанию
     рантайма, исключения нет; ячейка, совпавшая с выбором в конструкторе,
     подсвечена бледным фоном (у «Условия не выполнены» — по одному calc);
   - рисует PostTileRsbuAdjustments.render — та же функция, что на странице
     транша; число корректировок — из fixtures.json. Ссылки тайла в витрине
     ведут в «#»: страницы корректировок рядом нет.
   ============================================================ */
(function () {
  'use strict';

  var CALC = { done: 'Условия выполнены', required: 'Условия не выполнены' };
  var LABELS = {
    data: 'Есть данные', empty: 'Нет данных',
    edit: 'Редактирование доступно', view: 'Редактирование недоступно'
  };

  /* строка матрицы при выполненных условиях: по копии на каждое право */
  function doneRow(state) {
    return {
      label: LABELS[state], note: CALC.done,
      cells: ['edit', 'view'].map(function (m) { return { st: { calc: 'done', state: state, mode: m } }; })
    };
  }

  window.IBPKitDemo.register('RsbuInterestAdjustmentsTile', {
    labels: LABELS,
    gallery: true,
    controls: function (defs) {
      return defs.concat([
        { key: 'calc', label: 'Условия', value: 'done',
          options: [['done', 'Выполнены'], ['required', 'Не выполнены']] }
      ]);
    },
    matrix: {
      cols: [LABELS.edit, LABELS.view],
      rows: [
        doneRow('data'),
        doneRow('empty'),
        { label: CALC.required, note: 'данные и права на вид не влияют',
          /* match: данные и права на этот вид не влияют — ячейка выбрана при любых их значениях */
          cells: [{ span: true, st: { calc: 'required', state: 'empty', mode: 'edit' }, match: { calc: 'required' } }] }
      ]
    },
    apply: function (tile, st, ctx) {
      var T = window.PostTileRsbuAdjustments;
      if (!T) return;
      var fx = ctx.fixtures || {};
      var view = st.calc === 'required' ? 'locked' : (st.state === 'data' ? 'filled' : 'none');
      var rec = fx[view] || {};
      T.render(tile, { state: view, mode: st.mode, count: rec.count });
      tile.querySelectorAll('a[href]').forEach(function (a) { a.setAttribute('href', '#'); });
    }
  });
})();
