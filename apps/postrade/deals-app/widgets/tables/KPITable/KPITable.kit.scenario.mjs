// Демо витрины (RE0033 Э9): таблица KPI рисует данные из fixtures.json своей функцией.
// Гонять: node .agents/tools/page-run.mjs apps/local-components/postrade/deals-app/KPITable.doc.html \
//   --scenario apps/postrade/deals-app/widgets/tables/KPITable/KPITable.kit.scenario.mjs --no-flows
export default async (page) => {
  const d = page.document;
  await page.wait(600);
  const stage = d.getElementById('pg-stage');
  const cases = [...d.querySelectorAll('#kit-cases .kit-case')];
  const title = (d.querySelector('title') || {}).textContent || '';
  const text = (el) => el.textContent.replace(/\s+/g, ' ').trim();
  page.step('демо ' + title);
  page.check(!!stage, 'стенд на месте');
  page.check(cases.length >= 4, 'копий «Все состояния»: ' + cases.length);

  const root = stage.querySelector('.lc-kpi-table');
  page.check(root.getAttribute('data-state') === 'data', 'состояние data: ' + root.getAttribute('data-state'));
  page.check(/KPI\./.test(text(root)), 'метрики KPI нарисованы');
  const views = [...stage.querySelectorAll('.segctrl [data-view]')].map((x) => x.getAttribute('data-view'));
  page.check(views.includes('KPI_SHORT') && views.includes('KPI_FULL') && views.length === 2, 'переключатель «Краткий / Полный»: ' + views.join(','));
  const filtered = cases.find((c) => /Применено: [0-9]/.test(text(c)));
  page.check(!!filtered, 'копия «Фильтр применен» с чипом');
};
