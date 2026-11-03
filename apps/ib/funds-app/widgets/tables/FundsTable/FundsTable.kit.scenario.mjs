// Демо витрины и API «Списка фондов»: строки из fixtures.json, фильтр, выбор, хуки окна «Настройка таблицы» ДС.
// Гонять: node .agents/tools/page-run.mjs apps/local-components/ib/funds-app/FundsTable.doc.html \
//   --scenario apps/ib/funds-app/widgets/tables/FundsTable/FundsTable.kit.scenario.mjs --no-flows
export default async (page) => {
  const d = page.document;
  const w = page.window;
  await page.wait(600);
  const stage = d.getElementById('pg-stage');
  const text = (el) => el.textContent.replace(/\s+/g, ' ').trim();
  page.step('демо «Список фондов»');
  page.check(!!stage, 'стенд на месте');
  const root = stage && stage.querySelector('.lc-funds-table');
  page.check(!!root, 'корень .lc-funds-table');
  if (!root) return;
  page.check(root.getAttribute('data-state') === 'data', 'состояние data: ' + root.getAttribute('data-state'));
  const rows = () => [...root.querySelectorAll('[data-fundstable-tbl] .tbl__row[data-fund-id]')];
  const shown = () => rows().filter((r) => !r.hidden);
  page.check(rows().length === 8, 'строк фондов: ' + rows().length);
  page.check(/ИНН 7706419639 · КПП 1157746316598/.test(text(root)), 'ИНН и КПП под названием');
  const setBtn = root.querySelector('[data-table-settings]');
  page.check(!!setBtn && !setBtn.disabled && setBtn.classList.contains('ibtn') && !!setBtn.querySelector('[data-icon="settings"]'), 'шестерёнка настройки (ibtn, settings, data-table-settings, доступна)');
  page.check(!root.querySelector('.dtable__title') && !!root.querySelector('.dtable__toolbar [data-fundstable-filters]'), 'заголовка нет, слот фильтров в тулбаре');
  page.check(!root.querySelector('[data-table-setup]'), 'старого хука data-table-setup нет');
  const menus = rows().map((r) => r.querySelector('[data-menu]').getAttribute('data-menu'));
  page.check(menus.includes('fundActionsMenu') && menus.includes('fundActionsMenuCustom'), 'меню по partyId: ' + [...new Set(menus)].join(','));
  const custom = rows().find((r) => r.getAttribute('data-fund-id') === 'fnd-008');
  page.check(custom && custom.querySelector('.tc__subtext').textContent === '—', 'фонд без ИНН — прочерк');
  const rfpi = rows().find((r) => r.getAttribute('data-fund-id') === 'fnd-004');
  page.check(rfpi && text(rfpi.querySelector('[data-col="aumAssetsCount"]')) === '—', 'РФПИ: активов 0 — прочерк');
  const heads = [...root.querySelectorAll('.tbl__row--head .th[data-col]')].map((x) => x.getAttribute('data-col'));
  /* вид по умолчанию (1.004, Table ДС 1.025): «Контактные лица» и «Комментарий» рантайм убирает из шапки */
  page.check(heads.length === 7 && !heads.includes('contacts') && !heads.includes('comment'), 'видимые колонки по умолчанию: ' + heads.join(','));
  const tbl = root.querySelector('[data-fundstable-tbl]');
  page.check(tbl.getAttribute('data-table-persist') === 'FundsTable', 'data-table-persist="FundsTable"');
  page.check(!('getColumns' in w.FundsTable) && !('setHiddenColumns' in w.FundsTable), 'API колонок удалено');

  page.step('выбор строки');
  let got = null;
  root.addEventListener('fundstable:select', (e) => { got = e.detail.objectId; });
  rows()[1].querySelector('[data-col="alias"]').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  page.check(got === 'fnd-002', 'событие fundstable:select: ' + got);
  page.check(rows()[1].classList.contains('tbl__row--selected'), 'строка выделена');
  got = null;
  rows()[0].querySelector('[data-menu]').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  page.check(got === null, 'клик по «⋮» строку не выбирает');

  page.step('фильтры');
  const T = w.FundsTable;
  T.applyFilters(root, { smartSearch: 'потанин', typeCodes: [], priorityCodes: [] });
  page.check(shown().length === 2, 'поиск по бенефициару «потанин»: ' + shown().length);
  T.applyFilters(root, { smartSearch: '', typeCodes: ['PE_VC'], priorityCodes: ['LOW'] });
  page.check(shown().length === 1 && shown()[0].getAttribute('data-fund-id') === 'fnd-004', 'тип PE / VC и приоритет «Низкий» — РФПИ');
  const lowHigh = (T.applyFilters(root, { smartSearch: '', typeCodes: [], priorityCodes: ['LOW', 'HIGH'] }), shown().length);
  T.applyFilters(root, { smartSearch: '', typeCodes: [], priorityCodes: ['LOW'] });
  const low = shown().length;
  page.check(lowHigh > low && low > 0, 'несколько приоритетов — объединение: «Низкий» ' + low + ', с «Высоким» ' + lowHigh);
  T.applyFilters(root, { smartSearch: '', typeCodes: [], priorityCode: 'LOW' });
  page.check(shown().length === low, 'priorityCode фронтенда тоже понимается');
  T.applyFilters(root, { smartSearch: '7706559642', typeCodes: [], priorityCodes: [] });
  page.check(shown().length === 1, 'поиск по ИНН');
  T.applyFilters(root, { smartSearch: 'нет такого', typeCodes: [], priorityCodes: [] });
  page.check(root.getAttribute('data-results') === 'none' && !root.querySelector('[data-fundstable-notfound]').hidden, '«Ничего не найдено»');
  T.applyFilters(root, null);
  page.check(shown().length === 8 && root.querySelector('[data-fundstable-notfound]').hidden, 'фильтр снят');

  page.step('перерисовка');
  T.init(root, { funds: root.__fundsTable.funds.slice() });
  const tbl2 = root.querySelector('[data-fundstable-tbl]');
  page.check(tbl2 !== tbl && tbl2.__dsTableSettings !== tbl.__dsTableSettings, 'новая таблица — со своим снимком, не со снимком старой шапки');
  page.check(rows()[1].classList.contains('tbl__row--selected'), 'выбор пережил пересборку');

  page.step('пусто');
  T.init(root, { funds: [] });
  page.check(root.getAttribute('data-state') === 'empty', 'data-state=empty');
  page.check(!root.querySelector('[data-table-settings]'), '«Настроек таблицы» нет');
  page.check(/Здесь пока ничего нет/.test(text(root)) && !!root.querySelector('[data-fundstable-empty] [data-fund-add]'), 'EmptyState с «Добавить фонд»');
  page.check(!/\.xls|Загрузите|импорт/i.test(text(root.querySelector('[data-fundstable-empty]'))), 'в пустом состоянии нет импорта');
};
