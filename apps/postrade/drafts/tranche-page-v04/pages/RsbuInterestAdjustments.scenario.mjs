// Ключевое поведение страницы корректировок (RE0050, вторая волна 05.11.2026):
// фильтр по двум датам и сумме, чип «Применено», выбор строк, массовое удаление,
// сброс фильтра, транш без ФИ. Запуск:
//   node .agents/tools/page-run.mjs apps/postrade/drafts/tranche-page-v04/pages/RsbuInterestAdjustments.preview.html \
//     --query "id=1028&tr=1028.d1.p1.i1.t1&rasAdj=multi" --scenario apps/postrade/drafts/tranche-page-v04/pages/RsbuInterestAdjustments.scenario.mjs --no-flows
//   node .agents/tools/page-run.mjs ... --query "id=1026&tr=1026.d1.p1.i1.t1&rasAdj=no-fi" ...
export default async (page) => {
  const d = page.document;
  const w = page.window;
  await page.wait(700);
  const rows = () => [...d.querySelectorAll('#rh-tbl .tbl__row:not(.tbl__row--head)')];
  const clickBox = async (box, on) => {
    box.checked = on;
    box.dispatchEvent(new w.Event('click', { bubbles: true }));
    await page.wait(60);
  };

  if ((w.location.search || '').includes('rasAdj=no-fi')) {
    page.step('без ФИ: строки транша и ручная корректировка');
    page.check(rows().length === 3, '3 строки без ФИ: ' + rows().length);
    page.check(!d.getElementById('rh-add').disabled, '«Внести корректировку» доступна без ФИ');
    page.check(rows().every((r) => {
      const c = r.querySelector('[data-col="comment"] .tc__text');
      return c && c.textContent.trim() === '—';
    }), 'пустой комментарий — ячейка без текста');
    page.check(!!d.querySelector('#rh-tbl .tbl__row--head [data-col="select"]'), 'колонка выбора есть');
    return;
  }

  page.step('21 строка и фильтр');
  page.check(rows().length === 21, '21 строка до фильтра: ' + rows().length);
  await page.do([
    { click: '#rh-filter-open' },
    { waitFor: '#rh-filter-scrim:not([hidden])' }
  ]);
  page.check(d.getElementById('rhf-title').textContent === 'Фильтр', 'заголовок окна фильтра');
  page.check(d.querySelector('[data-rhf-clear]').disabled, '«Очистить фильтр» выключена на пустом фильтре');
  await page.do([
    { fill: { target: '#rhf-target-from', value: '01.07.2026' } },
    { fill: { target: '#rhf-target-to', value: '01.07.2026' } },
    { fill: { target: '#rhf-amount-from', value: '10000' } }
  ]);
  page.check(!d.querySelector('[data-rhf-clear]').disabled, '«Очистить фильтр» включилась после ввода');
  page.check(d.querySelector('.tab__badge').textContent === '2', 'бейдж фильтра: две группы — ' + d.querySelector('.tab__badge').textContent);
  await page.do([{ click: '[data-rhf-apply]' }]);
  await page.wait(250);
  page.check(rows().length === 18, '18 строк после фильтра по целевой дате и сумме: ' + rows().length);
  const chip = d.querySelector('#rh-filter-bar .tfilter__applied');
  page.check(!!chip && chip.querySelector('.chip__label').textContent === 'Применено: 2', 'чип «Применено: 2»');

  page.step('выбрать все и массовое подтверждение');
  const head = d.querySelector('#rh-tbl .tbl__row--head .cb__input');
  await clickBox(head, true);
  page.check(d.querySelectorAll('#rh-tbl .tbl__row--selected').length === 18, 'выбраны все 18 строк фильтра: ' + d.querySelectorAll('#rh-tbl .tbl__row--selected').length);
  page.check(d.querySelector('#rh-footer .pgn-bulk__count').textContent.includes('18'), 'счётчик bulk: 18');
  await page.do([
    { click: '#rh-footer [data-bulk-delete]' },
    { waitFor: '#rh-delete-scrim:not([hidden])' }
  ]);
  page.check(d.getElementById('rh-delete-title').textContent === 'Удалить корректировки', 'заголовок массового удаления');
  page.check(d.getElementById('rh-delete-text').textContent.includes('18'), 'в тексте 18 строк');
  w.DSModal.closeTop();
  await page.wait(80);

  page.step('сброс фильтра и удаление одной строки');
  await page.do([{ click: '#rh-filter-bar .tfilter__applied .chip__remove' }]);
  await page.wait(350);
  page.check(rows().length === 21, '21 строка после сброса фильтра: ' + rows().length);
  page.check(!d.querySelector('#rh-filter-bar .tfilter__applied'), 'чип фильтра исчез');
  page.check(!d.querySelector('#rh-tbl .tbl__row--selected'), 'выбор сброшен вместе с фильтром');
  const first = rows()[0].querySelector('.cb__input');
  await clickBox(first, true);
  page.check(d.querySelectorAll('#rh-tbl .tbl__row--selected').length === 1, 'выбрана одна строка');
  await page.do([
    { click: '#rh-footer [data-bulk-delete]' },
    { waitFor: '#rh-delete-scrim:not([hidden])' }
  ]);
  page.check(d.getElementById('rh-delete-title').textContent === 'Удалить корректировку', 'для одной строки — заголовок одной корректировки');
  d.getElementById('rh-delete-confirm').click();
  await page.wait(150);
  page.check(rows().length === 20, '20 строк после удаления одной: ' + rows().length);

  page.step('удаление пачки из трёх');
  for (let i = 0; i < 3; i++) await clickBox(rows()[i].querySelector('.cb__input'), true);
  page.check(d.querySelectorAll('#rh-tbl .tbl__row--selected').length === 3, 'выбраны три строки');
  await page.do([
    { click: '#rh-footer [data-bulk-delete]' },
    { waitFor: '#rh-delete-scrim:not([hidden])' }
  ]);
  page.check(d.getElementById('rh-delete-title').textContent === 'Удалить корректировки', 'заголовок пачки');
  d.getElementById('rh-delete-confirm').click();
  await page.wait(150);
  page.check(rows().length === 17, '17 строк после удаления трёх: ' + rows().length);

  page.step('сортировка сохраняется после фильтра');
  const sortBtn = d.querySelector('#rh-tbl .tbl__row--head [data-sort="startDate"]');
  sortBtn.click();
  await page.wait(80);
  page.check(!!d.querySelector('#rh-tbl .tbl__row--head .th--sorted [data-sort="startDate"]'), 'сортировка по исходной дате включена');
  await page.do([{ click: '#rh-filter-open' }, { waitFor: '#rh-filter-scrim:not([hidden])' }]);
  await page.do([{ fill: { target: '#rhf-target-from', value: '01.07.2026' } }, { fill: { target: '#rhf-target-to', value: '01.07.2026' } }, { click: '[data-rhf-apply]' }]);
  await page.wait(250);
  const dates = rows().map((r) => r.querySelector('[data-col="startDate"]').getAttribute('data-sort-value'));
  page.check(dates.join('|') === dates.slice().sort().join('|'), 'порядок строк после фильтра соответствует активной сортировке: ' + dates.join('|'));
  page.check(rows()[0].querySelector('[data-col="num"] .tc__text').textContent === '1', 'номер первой строки после фильтра — 1');
};
