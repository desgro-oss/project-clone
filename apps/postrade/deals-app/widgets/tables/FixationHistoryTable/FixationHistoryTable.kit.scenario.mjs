// Демо витрины (RE0033 Э9): таблица истории фиксаций рисует данные из fixtures.json своей функцией.
// Гонять: node .agents/tools/page-run.mjs apps/local-components/postrade/deals-app/FixationHistoryTable.doc.html \
//   --scenario apps/postrade/deals-app/widgets/tables/FixationHistoryTable/FixationHistoryTable.kit.scenario.mjs --no-flows
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

  const root = stage.querySelector('.lc-fixation-history-table');
  page.check(root.getAttribute('data-state') === 'data', 'состояние data: ' + root.getAttribute('data-state'));
  page.check(root.getAttribute('data-mode') === 'edit', 'режим edit');
  page.check(root.querySelectorAll('[data-fx-remove], button[aria-label="Удалить фиксацию"]').length > 0, 'корзины в строках');
  const view = cases.find((c) => /только просмотр/i.test(text(c.querySelector('.kit-case__label, h4, .kit-case__title') || c)) );
  const viewRoot = cases.map((c) => c.querySelector('.lc-fixation-history-table')).find((r) => r && r.getAttribute('data-mode') === 'view');
  page.check(!!viewRoot && !viewRoot.querySelector('button[aria-label="Удалить фиксацию"]'), 'копия «Только просмотр» без корзин');
  const busyRoot = cases.map((c) => c.querySelector('.lc-fixation-history-table')).find((r) => r && r.getAttribute('data-busy') === 'true');
  page.check(!!busyRoot, 'копия «Идет пересчет метрик»');
  void view;
};
