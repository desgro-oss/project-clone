// Сценарий страницы «Фонды» (MS0020, Э1–Э3): список фондов, выбор фонда → активы справа,
// крестик, пустые активы РФПИ, фильтр, окно ДС «Настройка таблицы», пустой список,
// окна фонда: добавить (поиск → форма), редактировать, удалить.
// Гонять с --query: (без параметров) · fund=fnd-004 · state=empty · modal=add · modal=edit&fund=fnd-008 · modal=delete&fund=fnd-001
function tsScrim(d) {
  return [...d.querySelectorAll('.modal-scrim')].find((s) => !s.hidden && /Настройка таблицы/.test(s.textContent)) || null;
}
const open = (s) => !!s && !s.hidden;
export default async (page) => {
  const d = page.document;
  const w = page.window;
  const q = new URLSearchParams(w.location.search);
  const $ = (s) => d.getElementById(s);
  const ft = $('fundsTable'), at = $('assetsTable'), ff = $('fundsFilters');
  const pb = d.querySelector('#fundsSplit .splitpane__b'), spl = d.querySelector('#fundsSplit .spl');
  const rows = () => [...ft.querySelectorAll('.tbl__row[data-fund-id]')].filter((r) => !r.hidden);
  const assetRows = () => [...at.querySelectorAll('.tbl__row[data-asset-id]')];
  await page.wait(300);

  page.step('шапка, крошки, меню');
  const crumbs = [...d.querySelectorAll('.crumbs a, .crumbs .crumbs__current')].map((x) => x.textContent.trim());
  page.check(crumbs.join(' / ') === 'Главная / Фонды', 'крошки: ' + crumbs.join(' / '));
  page.check(/HomePage\.html\?role=director_ib/.test(d.querySelector('.crumbs a').getAttribute('href')), 'крошка «Главная» ведёт на главную Руководителя IB');
  const sel = d.querySelector('.nav__item--selected');
  page.check(!!sel && /Фонды/.test(sel.textContent), 'в меню выбран пункт «Фонды»');
  page.check(d.querySelector('h1.phead__title').textContent.trim() === 'Фонды', 'заголовок «Фонды»');
  page.check(/Добавить фонд/.test(d.querySelector('.phead__actions').textContent) && !/Импортировать/.test(d.body.textContent), 'есть «Добавить фонд», «Импортировать данные» нет');

  if (q.get('state') === 'empty') {
    page.step('фондов нет');
    page.check(ft.getAttribute('data-state') === 'empty', 'список фондов в состоянии empty');
    page.check(/Здесь пока ничего нет/.test(ft.textContent), 'EmptyState «Здесь пока ничего нет»');
    const fields = [...ff.querySelectorAll('input')];
    page.check(fields.length >= 3 && fields.every((i) => i.disabled), 'поля фильтров выключены (disabled)');
    page.check(!ft.querySelector('[data-table-settings]'), 'шестерёнки настройки нет');
    page.check(ft.querySelector('[data-fundstable-filters]').contains(ff), 'выключенные фильтры — в тулбаре таблицы');
    await page.click('#fundsTable [data-fund-add]');
    await page.wait(80);
    page.check(open($('addFundEntityFromUcpModal')), '«Добавить фонд» пустого списка открывает поиск');
    return;
  }

  if (q.get('modal')) {
    page.step('демо-адрес окна: ' + q.get('modal'));
    const id = { add: 'addFundEntityFromUcpModal', edit: 'editFundModal', delete: 'deleteFundModal' }[q.get('modal')];
    const sc = $(id);
    page.check(!!sc && !sc.hidden, 'окно ' + id + ' открыто при загрузке');
    if (q.get('modal') === 'edit') page.check(/Редактировать фонд/.test(sc.textContent), 'заголовок «Редактировать фонд»');
    if (q.get('modal') === 'delete') page.check(/Удалить фонд/.test(sc.textContent) && /Интеррос/.test(sc.textContent), '«Удалить фонд» с данными Интерроса');
    return;
  }

  if (q.get('fund') === 'fnd-004') {
    page.step('РФПИ: активов нет');
    page.check(!pb.hidden && !spl.hidden, 'панель активов и сплиттер видны');
    page.check(at.getAttribute('data-state') === 'empty', 'активы в состоянии empty');
    page.check(/Активы РФПИ/.test(at.textContent), 'заголовок «Активы РФПИ»');
    page.check(/РФПИ · ИНН\s7706559641/.test(at.textContent), 'текст «РФПИ · ИНН …»');
    return;
  }

  page.step('тулбар таблицы: фильтры и шестерёнка, заголовка нет');
  page.check(ft.querySelector('[data-fundstable-filters]').contains(ff), 'фильтры стоят в тулбаре таблицы');
  page.check(!ff.classList.contains('tile') && !ff.querySelector('.tile'), 'своей карточки у фильтров нет');
  page.check(!ft.querySelector('.dtable__title') && !/Список фондов/.test(ft.querySelector('.dtable__toolbar').textContent), 'заголовка «Список фондов» нет');
  const gear = ft.querySelector('.dtable__toolbar [data-table-settings]');
  page.check(!!gear && gear.classList.contains('ibtn') && !!gear.querySelector('[data-icon="settings"]') && !gear.querySelector('.btn__label'), 'настройка — иконка-шестерёнка без подписи (ibtn, settings)');
  page.check([...ff.querySelectorAll('[data-ff-field="priorityCodes"] .ddl__item')].every((x) => x.classList.contains('ddl__item--checkbox')), 'приоритеты — с чекбоксами');

  page.step('тулбар активов: «Добавить актив» → шестерёнка → крестик');
  const atTools = [...at.querySelectorAll('.dtable__toolbar-right > button')].map((b) => b.matches('[data-table-settings]') ? 'gear' : b.matches('[data-at-close]') ? 'close' : b.matches('.lc-assets-table__add') ? 'add' : '?');
  page.check(atTools.join(',') === 'add,gear,close', 'порядок кнопок: ' + atTools.join(','));

  page.step('разноцветные аватарки модуля');
  page.check(d.body.hasAttribute('data-av-tones'), 'автоокраска аватарок включена на странице (data-av-tones)');
  const avs = [...ft.querySelectorAll('.tbl__row[data-fund-id] .av')];
  page.check(avs.length === 12 && avs.every((a) => a.getAttribute('data-av-seed') === a.closest('.tbl__row').getAttribute('data-fund-id')), 'у аватарки фонда data-av-seed = objectId');

  page.step('список фондов: 12 строк, активы скрыты');
  page.check(rows().length === 12, 'строк фондов 12, есть ' + rows().length);
  page.check(pb.hidden && spl.hidden, 'панель активов и сплиттер скрыты до выбора');
  const menus = rows().map((r) => r.querySelector('[data-menu]').getAttribute('data-menu'));
  page.check(menus.filter((m) => m === 'fundActionsMenuCustom').length === 1, 'одна строка (фонд не из ЕПК) с меню fundActionsMenuCustom');
  page.check(!!$('fundActionsMenu') && !!$('fundActionsMenuCustom') && !!$('assetActionsMenu') && !!$('assetActionsMenuCustom'), 'все четыре меню вшиты');

  page.step('клик по Интерросу → активы справа');
  const interros = ft.querySelector('.tbl__row[data-fund-id="fnd-001"]');
  await page.click('#fundsTable .tbl__row[data-fund-id="fnd-001"] .tc:not(.tc--separator)');
  await page.wait(60);
  page.check(interros.classList.contains('tbl__row--selected'), 'строка Интерроса выделена');
  page.check(!pb.hidden && !spl.hidden, 'панель активов и сплиттер появились');
  page.check(/Активы Интеррос/.test(at.textContent), 'заголовок «Активы Интеррос»');
  page.check(assetRows().length === 12, 'активов 12, есть ' + assetRows().length);

  page.step('клик по USM меняет панель');
  await page.click('#fundsTable .tbl__row[data-fund-id="fnd-002"] .tc:not(.tc--separator)');
  await page.wait(60);
  page.check(/Активы USM/.test(at.textContent) && assetRows().length === 3, 'активы USM: 3');

  page.step('крестик закрывает панель');
  await page.click('#assetsTable [data-at-close]');
  await page.wait(60);
  page.check(pb.hidden && spl.hidden, 'панель и сплиттер скрыты');
  page.check(!ft.querySelector('.tbl__row--selected'), 'выделение снято');

  page.step('фильтр по приоритетам: несколько значений');
  const prioList = ff.querySelector('[data-ff-field="priorityCodes"] .ddl') || d.querySelector('.ddl[aria-label="Приоритеты фондов"]');
  prioList.querySelector('.ddl__item[data-code="LOW"]').click();
  await page.wait(60);
  page.check(rows().length === 3, 'фондов с низким приоритетом 3, есть ' + rows().length);
  prioList.querySelector('.ddl__item[data-code="HIGH"]').click();
  await page.wait(60);
  page.check(rows().length === 7, '«Высокий» и «Низкий» вместе — 7, есть ' + rows().length);
  const sum = ff.querySelector('[data-ff-field="priorityCodes"] .inp__summary');
  page.check(!!sum && sum.textContent === 'Высокий, +1', 'сводка приоритетов: ' + (sum && sum.textContent));
  w.FundsFilters.setValue(ff, { smartSearch: 'нисанов', typeCodes: [], priorityCodes: [] });
  await page.wait(60);
  page.check(rows().length === 1, 'поиск по бенефициару: 1 фонд, есть ' + rows().length);
  w.FundsFilters.setValue(ff, { smartSearch: '', typeCodes: [], priorityCodes: [] });
  await page.wait(60);
  page.check(rows().length === 12, 'фильтры сняты — 12 строк, есть ' + rows().length);

  page.step('шестерёнка → стандартное окно ДС «Настройка таблицы», «Применить» скрывает столбец');
  const setupBtn = ft.querySelector('[data-table-settings]');
  page.check(!!setupBtn && !setupBtn.disabled, 'шестерёнка с хуком data-table-settings доступна');
  await page.click('#fundsTable [data-table-settings]');
  await page.wait(80);
  const scrim = tsScrim(d);
  page.check(!!scrim, 'окно «Настройка таблицы» ДС открыто');
  if (scrim) {
    const alias = [...scrim.querySelectorAll('input[type="checkbox"]')].find((c) => /Псевдоним/.test((c.closest('.col-item') || c.closest('label') || c.parentElement).textContent));
    page.check(!!alias && alias.checked, 'столбец «Псевдоним» отмечен');
    page.check(/Контактные лица/.test(scrim.textContent) && /Комментарий/.test(scrim.textContent), 'в окне есть «Контактные лица» и «Комментарий»');
    page.check(/Действия/.test(scrim.textContent), 'колонка «Действия» — обычная, есть в окне настройки');
    page.check(ft.querySelector('.th[data-col="actions"] .th__label') && ft.querySelector('.th[data-col="actions"]').classList.contains('th--pinned') && ft.querySelector('.th[data-col="actions"]').classList.contains('th--actions'), '«Действия» — колонка действий ДС (th--actions), закреплена по умолчанию');
    if (alias) { alias.click(); }
    const apply = [...scrim.querySelectorAll('button')].find((b) => /Применить/.test(b.textContent));
    page.check(!!apply, 'кнопка «Применить»');
    if (apply) apply.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
    await page.wait(80);
    page.check(!ft.querySelector('.th[data-col="alias"]') || !ft.querySelector('.th[data-col="alias"]').isConnected, 'после «Применить» столбца «Псевдоним» в шапке нет');
  }

  await more(page);
};

/* меню строк, сортировка, пересборка таблицы, окно активов, поиск вводом — после основного прохода */
async function more(page) {
  const d = page.document, w = page.window, $ = (s) => d.getElementById(s);
  const ft = $('fundsTable'), at = $('assetsTable');
  const rows = () => [...ft.querySelectorAll('.tbl__row[data-fund-id]')].filter(r => !r.hidden);

  page.step('меню фонда из ЕПК открывается');
  await page.click('#fundsTable .tbl__row[data-fund-id="fnd-001"] [data-menu]');
  await page.wait(60);
  const m1 = $('fundActionsMenu');
  page.check(m1 && !m1.hidden, 'fundActionsMenu открыто: hidden=' + (m1 && m1.hidden) + ' class=' + (m1 && m1.className));
  page.check(!ft.querySelector('.tbl__row--selected'), 'клик по ⋮ не выбирает строку');
  await page.click('#fundActionsMenu .menu__item', { index: 1 });
  await page.wait(80);
  page.check(m1.hidden || !m1.classList.contains('is-open'), 'пункт закрывает меню: hidden=' + m1.hidden + ' ' + m1.className);
  const em = $('editFundModal');
  page.check(open(em), '«Редактировать» открывает EditFundModal');
  page.check(/Редактировать фонд/.test(em.textContent), 'заголовок «Редактировать фонд»');
  const alias2 = em.querySelector('[data-field="alias"] input, input[name="alias"]');
  if (alias2) { alias2.value = 'Интеррос — правка'; alias2.dispatchEvent(new w.Event('input', { bubbles: true })); }
  const saveE = [...em.querySelectorAll('.modal__foot button')].find((b) => /Сохранить/.test(b.textContent));
  page.check(!!saveE, 'кнопка «Сохранить»');
  if (saveE) saveE.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  await page.wait(120);
  page.check(!open(em), 'после «Сохранить» окно закрыто');
  if (alias2) page.check(/Интеррос — правка/.test(ft.textContent), 'псевдоним обновился в списке');

  page.step('меню фонда не из ЕПК → «Редактировать»: предупреждение ЕПК');
  await page.click('#fundsTable .tbl__row[data-fund-id="fnd-008"] [data-menu]');
  await page.wait(60);
  await page.click('#fundActionsMenuCustom .menu__item', { index: 1 });
  await page.wait(80);
  page.check(open(em) && /Клиент не привязан к базе юр\. лиц Сбера/.test(em.textContent) && /Привязать/.test(em.textContent), 'предупреждение «Клиент не привязан…» с «Привязать»');
  const cancelE = [...em.querySelectorAll('.modal__foot button')].find((b) => /Отменить/.test(b.textContent));
  if (cancelE) cancelE.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  await page.wait(80);
  page.check(!open(em), '«Отменить» закрывает окно');

  page.step('меню → «Удалить фонд» → «Подтвердить»');
  const before = rows().length;
  await page.click('#fundsTable .tbl__row[data-fund-id="fnd-012"] [data-menu]');
  await page.wait(60);
  await page.click('#fundActionsMenu .menu__item', { index: 2 });
  await page.wait(80);
  const dm = $('deleteFundModal');
  page.check(open(dm) && /Удалить фонд/.test(dm.textContent), 'окно «Удалить фонд» открыто');
  const ok = [...dm.querySelectorAll('.modal__foot button')].find((b) => /Подтвердить/.test(b.textContent));
  if (ok) ok.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  await page.wait(120);
  page.check(!open(dm) && rows().length === before - 1 && !ft.querySelector('.tbl__row[data-fund-id="fnd-012"]'), 'фонд удалён из списка: ' + rows().length);

  page.step('«Добавить фонд» → поиск → «Новый фонд» → форма → фонд в списке');
  await page.click('#btnAddFund');
  await page.wait(80);
  const am0 = $('addFundEntityFromUcpModal');
  page.check(open(am0), 'окно «Добавить фонд» открыто');
  const nameInp = [...am0.querySelectorAll('input')].find((i) => /Название/.test((i.closest('.inp') || i.parentElement).textContent) || i.name === 'name') || am0.querySelector('input');
  nameInp.value = 'Андромеда'; nameInp.dispatchEvent(new w.Event('input', { bubbles: true }));
  const findBtn = [...am0.querySelectorAll('button')].find((b) => /^\s*Поиск\s*$/.test(b.textContent));
  if (findBtn) findBtn.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  await page.wait(120);
  page.check(/По вашему запросу результатов не найдено/.test(am0.textContent), '«ничего не найдено» для «Андромеда»');
  const nf = [...am0.querySelectorAll('button')].find((b) => /Новый фонд/.test(b.textContent));
  page.check(!!nf, 'кнопка «Новый фонд»');
  if (nf) nf.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  await page.wait(120);
  page.check(!open(am0) && open(em) && /Новый фонд/.test(em.querySelector('.modal__title').textContent), 'открыта форма «Новый фонд»');
  const nm = em.querySelector('input');
  page.check(nm && nm.value === 'Андромеда', 'название из поиска: ' + (nm && nm.value));
  const saveN = [...em.querySelectorAll('.modal__foot button')].find((b) => /Сохранить/.test(b.textContent));
  if (saveN) saveN.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  await page.wait(120);
  page.check(!open(em) && /Андромеда/.test(ft.textContent), 'фонд «Андромеда» появился в списке');

  page.step('«Добавить фонд» → поиск «Интеррос» → клиент ЕПК → «Продолжить» → «Добавить»');
  await page.click('#btnAddFund');
  await page.wait(80);
  page.check(open(am0), 'окно поиска открыто снова');
  const nameI = am0.querySelector('input');
  nameI.value = 'Интеррос'; nameI.dispatchEvent(new w.Event('input', { bubbles: true }));
  const findB = [...am0.querySelectorAll('button')].find((b) => /^\s*Поиск\s*$/.test(b.textContent));
  if (findB) findB.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  await page.wait(120);
  const cli = am0.querySelector('[data-afe-cards="clients"] .lc-afe__card[data-afe-id="pty-3001"]');
  page.check(!!cli, 'в ЕПК найден ИП «Интер О.С.»');
  if (cli) cli.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  await page.wait(60);
  const nextB = am0.querySelector('[data-afe-next]');
  page.check(nextB && !nextB.disabled, '«Продолжить» доступна для клиента ЕПК');
  if (nextB) nextB.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  await page.wait(120);
  page.check(!open(am0) && open(em) && /Добавить фонд/.test(em.querySelector('.modal__title').textContent), 'открыта форма «Добавить фонд» (из ЕПК)');
  const locked = [...em.querySelectorAll('input')].filter((i) => i.disabled && !i.closest('[hidden]'));
  page.check(locked.length >= 3 && locked.some((i) => i.value === 'ИП «Интер О.С.»'), 'название, ИНН, КПП из ЕПК выключены: ' + locked.map((i) => i.value).join(' | '));
  const addB = [...em.querySelectorAll('.modal__foot button')].find((b) => /Добавить/.test(b.textContent));
  page.check(!!addB, 'кнопка «Добавить»');
  if (addB) addB.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  await page.wait(120);
  const added = [...ft.querySelectorAll('.tbl__row[data-fund-id]')].find((r) => /Интер О\.С\./.test(r.textContent));
  page.check(!open(em) && !!added && added.querySelector('[data-menu]').getAttribute('data-menu') === 'fundActionsMenu', 'фонд из ЕПК в списке, меню «из ЕПК»');

  page.step('сортировка по названию');
  await page.click('#fundsTable .th[data-col="name"] .th__sort');
  await page.wait(60);
  const names = rows().map(r => r.querySelector('[data-col="name"] .tc__text').textContent);
  const sorted = names.slice().sort((a, b) => a.localeCompare(b, 'ru'));
  page.check(JSON.stringify(names) === JSON.stringify(sorted), 'строки по алфавиту: ' + names.slice(0,4).join(' | '));

  page.step('после сортировки меню строки живо');
  await page.click('#fundsTable .tbl__row[data-fund-id="fnd-008"] [data-menu]');
  await page.wait(60);
  const m2 = $('fundActionsMenuCustom');
  page.check(m2 && !m2.hidden, 'после пересборки меню custom открывается: hidden=' + (m2 && m2.hidden));
  d.body.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

  page.step('активы: меню, сортировка, настройка');
  await page.click('#fundsTable .tbl__row[data-fund-id="fnd-001"] .tc:not(.tc--separator)');
  await page.wait(60);
  const ar = [...at.querySelectorAll('.tbl__row[data-asset-id]')];
  page.check(ar.length === 12, 'активов ' + ar.length);
  await page.click('#assetsTable .tbl__row[data-asset-id] [data-menu]');
  await page.wait(60);
  const am = $(ar[0].querySelector('[data-menu]').getAttribute('data-menu'));
  page.check(am && !am.hidden, 'меню актива открыто: ' + (am && am.id) + ' hidden=' + (am && am.hidden));
  d.body.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  page.check(/млн RUB/.test(at.querySelector('.th[data-col="ev"]').textContent), 'EV: подпись «млн RUB»');
  const evCell = at.querySelector('.tbl__row[data-asset-id="ast-001"] [data-col="ev"]');
  page.check(evCell && /^245\s000$/.test(evCell.textContent.trim()), 'EV Роза Хутор без «000»: ' + (evCell && evCell.textContent.trim()));
  const ovCell = at.querySelector('.tbl__row[data-asset-id="ast-001"] [data-col="ownershipValue"]');
  page.check(ovCell && /^198\s000$/.test(ovCell.textContent.trim()), 'стоимость доли того же порядка: ' + (ovCell && ovCell.textContent.trim()));
  await page.click('#assetsTable [data-table-settings]');
  await page.wait(80);
  const sc = tsScrim(d);
  page.check(!!sc && /Enterprise Value/.test(sc.textContent), 'окно ДС «Настройка таблицы» по колонкам активов');
  const cancelT = sc && [...sc.querySelectorAll('button')].find((b) => /Отменить/.test(b.textContent));
  if (cancelT) cancelT.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  await page.wait(80);
  page.check(/Активы Интеррос/.test(at.textContent), 'заголовок активов на месте');

  page.step('фильтр вводом в поле поиска');
  const inp = d.querySelector('#fundsFilters [data-ff-field="smartSearch"] input');
  inp.value = 'усм'; inp.setAttribute('value','усм'); inp.dispatchEvent(new w.Event('input', { bubbles: true }));
  await page.wait(400);
  page.check(rows().length === 1, 'поиск «усм»: ' + rows().length);
  inp.value = 'zzzzz'; inp.setAttribute('value','zzzzz'); inp.dispatchEvent(new w.Event('input', { bubbles: true }));
  await page.wait(400);
  page.check(ft.getAttribute('data-results') === 'none' && !ft.querySelector('[data-fundstable-notfound]').hidden, 'ничего не найдено');
  page.check(!pageSplitHidden(d), 'панель активов при пустом поиске: ' + (pageSplitHidden(d) ? 'скрыта' : 'видна'));
}
function pageSplitHidden(d) { return d.querySelector('#fundsSplit .splitpane__b').hidden; }

