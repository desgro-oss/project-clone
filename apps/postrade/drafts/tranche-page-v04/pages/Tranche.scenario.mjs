// Ключевое поведение транша без ФИ (RE0050, вторая волна 05.11.2026): обе кнопки доступны,
// окно фиксации открывается, комментарий попадает во все созданные строки. Запуск:
//   node .agents/tools/page-run.mjs apps/postrade/drafts/tranche-page-v04/pages/Tranche.preview.html \
//     --query "id=1026&tr=1026.d1.p1.i1.t1&rasAdj=none" --scenario apps/postrade/drafts/tranche-page-v04/pages/Tranche.scenario.mjs --no-flows
export default async (page) => {
  const d = page.document;
  const w = page.window;
  await page.wait(500);
  await page.do([{ waitFor: '#ip-fix-recalc:not([disabled])' }]);
  page.check(!d.getElementById('ip-fix-recalc').hidden, '«Пересчитать с фиксацией» видна без ФИ');
  page.check(!d.getElementById('ip-fix-recalc').disabled, '«Пересчитать с фиксацией» доступна без ФИ');
  page.check(!d.getElementById('ip-recalc').disabled, '«Пересчитать» доступна без ФИ');
  page.check(!d.getElementById('ip-fix-anchor'), 'тултип-якоря у кнопки нет');

  await page.do([
    { click: '#ip-fix-recalc' },
    { waitFor: '#rsbu-fix-scrim:not([hidden])' }
  ]);
  page.check(!!d.getElementById('rsbu-fix-cmt'), 'в окне есть поле «Комментарий»');
  await page.do([
    { fill: { target: '#rsbu-fix-from', value: '01.01.2025' } },
    { fill: { target: '#rsbu-fix-to', value: '31.03.2025' } },
    { fill: { target: '#rsbu-fix-adjust', value: '01.04.2025' } },
    { fill: { target: '#rsbu-fix-cmt', value: 'Пересчёт после уточнения данных' } },
    { click: '[data-rsbu-fix-submit]' },
    { waitFor: '#ip-fix-recalc.btn--loading' }
  ]);
  await page.wait(1900);
  const scrim = d.getElementById('rsbu-fix-scrim');
  page.check(!scrim || scrim.hidden, 'окно закрылось после «Пересчитать»');
  const count = d.querySelector('#tile-rsbu-adjustments [data-rsbu-count]');
  page.check(!!count && count.textContent === '3', 'тайл: «Внесено корректировок: 3» — ' + (count && count.textContent));
  const rows = w.FinMetricsStore.rasAdjustments('TRANCHE-1026.d1.p1.i1.t1');
  page.check(rows.length === 3, 'в сторе три строки: ' + rows.length);
  page.check(rows.every((r) => r.comment === 'Пересчёт после уточнения данных'), 'комментарий стоит во всех строках');
};
