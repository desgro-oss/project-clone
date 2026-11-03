// Прогон DOM без браузера: вкладки «Мои / Деск», чипы-фильтры типов,
// выбор события, адрес, ссылки на связанные объекты, пустой фильтр.
export default async function (page) {
  const { window, document } = page;
  const E = window.IBPR_EVENTS;
  if (!page.check(!!E && E.all().length > 0, 'События загружены из data/events.js')) return;
  const all = E.all();
  const rows = () => Array.from(document.querySelectorAll('#events-list [data-event-id]'));
  const selected = () => document.querySelector('#events-list [aria-current="true"]')?.getAttribute('data-event-id');
  const query = () => new URLSearchParams(window.location.search);
  const chip = code => document.querySelector('[data-events-type="' + code + '"]');

  page.step('Адрес из карточки: область, включённые типы и выбранное событие');
  const startScope = query().get('scope');
  const startTypes = query().has('types') ? query().get('types').split(',') : E.types.map(t => t.code);
  const initial = all.filter(e => (startScope === 'desk' || e.isMine) && startTypes.includes(e.typeCode));
  page.check(rows().map(r => r.getAttribute('data-event-id')).join() === initial.map(e => e.eventId).join(), 'Адрес отбирает всю выборку без ограничения 10');
  page.check(selected() === query().get('id') && initial.some(e => e.eventId === selected()), 'id в адресе совпадает с выделением');
  page.check(rows().every(r => r.matches('.entity.entity--interactive') && r.parentElement.classList.contains('entity-list') && r.querySelector('.entity__lead .entity__icon i')?.getAttribute('data-icon') === E.type(all.find(e => e.eventId === r.getAttribute('data-event-id')).typeCode).icon), 'Entity-строки с соответствующей типу ведущей иконкой');
  page.check(!!document.querySelector('#events-split .spl[role="separator"]'), 'На полной странице сохранён Splitter');
  const eventWidgets = Array.from(document.querySelectorAll('#events-split [data-widget="V2EventsListTile"], #events-split [data-widget="V2EventDetailsTile"]'));
  page.check(eventWidgets.length === 2 && eventWidgets.every(w => w.matches('.tile.tile--headless') && !!w.querySelector('.tile__body.ds-scroll') && !Array.from(w.classList).some(c => c.endsWith('--embedded'))), 'Самостоятельная страница сохраняет обе Tile-оболочки и scroll-body');
  // Нормализуем после проверки входного адреса реальными контролами.
  for (const t of E.types) if (chip(t.code).getAttribute('aria-pressed') !== 'true') { chip(t.code).click(); await page.wait(0); }
  document.querySelector('[data-events-scope="my"]').click();
  await page.wait(0);
  rows()[0].click();
  await page.wait(0);

  page.step('Открытие: «Мои», все типы включены, выбрано первое событие');
  page.check(rows().length === all.filter(e => e.isMine).length, '«Мои» — события моих проектов и клиентов');
  page.check(E.types.every(t => chip(t.code)?.getAttribute('aria-pressed') === 'true'), 'Все чипы типов нажаты');
  page.check(selected() === rows()[0]?.getAttribute('data-event-id') && query().get('id') === selected(), 'Выбрано первое, id в адресе');

  page.step('Чип выключает тип: лента и адрес');
  chip('DATA').click();
  await page.wait(0);
  page.check(chip('DATA').getAttribute('aria-pressed') === 'false', 'Чип «Изменение данных» отжат');
  page.check(rows().length === all.filter(e => e.isMine && e.typeCode !== 'DATA').length, 'События этого типа скрыты');
  page.check((query().get('types') || '').split(',').indexOf('DATA') < 0, 'Включённые типы — в адресе');

  page.step('Вкладка «Деск» — все события включённых типов');
  document.querySelector('[data-events-scope="desk"]').click();
  await page.wait(0);
  page.check(rows().length === all.filter(e => e.typeCode !== 'DATA').length && query().get('scope') === 'desk', '«Деск»: набор и адрес');

  page.step('Выбор события: подробности и ссылки на объекты');
  const row = rows()[2];
  row.click();
  await page.wait(0);
  const ev = all.find(e => e.eventId === row.getAttribute('data-event-id'));
  page.check(selected() === ev.eventId && query().get('id') === ev.eventId, 'Выбрано нажатое событие');
  page.check(document.querySelector('[data-event-title]')?.textContent === ev.title, 'Справа — что случилось');
  const links = Array.from(document.querySelectorAll('[data-event-links] a')).map(a => a.getAttribute('href'));
  page.check(links.length === ev.entities.length && links.every((h, i) => h === E.entityHref(ev.entities[i])), '«Связано с» — ссылки на страницы объектов');

  page.step('Клавиатурный выбор Entity и сохранение при фильтрации');
  const keyRow = rows()[1];
  keyRow.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  await page.wait(0);
  const keyId = keyRow.getAttribute('data-event-id');
  page.check(selected() === keyId && document.querySelector('[data-event-title]')?.textContent === all.find(e => e.eventId === keyId).title, 'Enter выбирает событие и обновляет подробности');
  const keyType = all.find(e => e.eventId === keyId).typeCode;
  chip(keyType).click();
  await page.wait(0);
  page.check(selected() === rows()[0]?.getAttribute('data-event-id') && selected() !== keyId, 'Выключение типа выбранного события выбирает первое');

  page.step('Все типы выключены — EmptyState в обеих панелях');
  for (const t of E.types) if (chip(t.code).getAttribute('aria-pressed') === 'true') { chip(t.code).click(); await page.wait(0); }
  page.check(rows().length === 0 && document.querySelector('[data-events-empty]')?.hidden === false, 'Лента: «Событий нет»');
  page.check(document.querySelector('[data-event-article]')?.hidden === true && document.querySelector('[data-event-none]')?.hidden === false, 'Справа: «Событие не выбрано»');
}
