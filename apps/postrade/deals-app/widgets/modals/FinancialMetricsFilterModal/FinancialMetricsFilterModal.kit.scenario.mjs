// Демо витрины (RE0033 Э9): окно фильтра финансовых метрик рисует данные из fixtures.json своей функцией.
// Гонять: node .agents/tools/page-run.mjs apps/local-components/postrade/deals-app/FinancialMetricsFilterModal.doc.html \
//   --scenario apps/postrade/deals-app/widgets/modals/FinancialMetricsFilterModal/FinancialMetricsFilterModal.kit.scenario.mjs --no-flows
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

  const scrim = stage.querySelector('.modal-scrim') || stage;
  const badge = scrim.querySelector('.tab__badge');
  page.check(!!badge && !badge.hidden && text(badge) !== '0', 'счётчик на табе: ' + (badge && text(badge)));
  const fields = scrim.querySelectorAll('[data-fmf-grid] > *').length;
  page.check(fields >= 2, 'поле ФИ и поля индикаторов: ' + fields);
  page.check(!scrim.querySelector('[data-fmf-clear]').disabled, '«Очистить фильтр» доступна при выбранных ФИ');
  const second = cases.map((c) => c.querySelector('.modal-scrim')).filter(Boolean);
  page.check(second.length >= 4, 'копий окна: ' + second.length);
  page.step('«Очистить фильтр» в живом окне');
  await page.click('#pg-stage [data-fmf-clear]');
  await page.wait(100);
  page.check(scrim.querySelectorAll('[data-fmf-grid] > *').length === 1, 'остались только поле ФИ');
  page.check(scrim.querySelector('.tab__badge').hidden, 'счётчик скрыт');
};
