// Демо витрины (RE0033 Э9): таблица «Финансовые метрики» рисует данные из fixtures.json своей функцией.
// Гонять: node .agents/tools/page-run.mjs apps/local-components/postrade/deals-app/FinancialMetricsTable.doc.html \
//   --scenario apps/postrade/deals-app/widgets/tables/FinancialMetricsTable/FinancialMetricsTable.kit.scenario.mjs --no-flows
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

  const root = stage.querySelector('.lc-financial-metrics-table');
  page.check(root.getAttribute('data-state') === 'data', 'состояние data: ' + root.getAttribute('data-state'));
  page.check(root.querySelectorAll('.tbl__row').length > 5, 'строк в таблице: ' + root.querySelectorAll('.tbl__row').length);
  page.check(/Cashflow/.test(text(root)), 'метрики РСБУ нарисованы');
  const states = cases.map((c) => (c.querySelector('.lc-financial-metrics-table') || {}).getAttribute && c.querySelector('.lc-financial-metrics-table').getAttribute('data-state'));
  page.check(states.includes('empty') && states.includes('loading'), 'в копиях есть empty и loading: ' + states.join(','));
  const filtered = cases.find((c) => /Применено: [0-9]/.test(text(c)));
  page.check(!!filtered, 'копия «Фильтр применен» с чипом «Применено: N»');
};
