// Сценарий страницы «Единая трансфертная ставка» (RE0041, Э4): карточки схем, пустое состояние, окно схемы
// с проверками, подтверждение удаления, тосты, истории, режимы. Гонять с --query: id=1027 · 1028 · 1026 · 1025 · 1024 · 1030
// Договор в сделке — <id>.d1.p1.i1. В 1027 — пять схем, в 1024 и 1030 — по одной (просмотр), в 1028 / 1026 / 1025 — ни одной.
const EXPECT = {
  '1027': { mode: 'edit', schemes: 5 },
  '1028': { mode: 'edit', schemes: 0 },
  '1026': { mode: 'edit', schemes: 0 },
  '1025': { mode: 'view', schemes: 0 },
  '1024': { mode: 'view', schemes: 1 },
  '1030': { mode: 'view', schemes: 1 }
};
export default async (page) => {
  const d = page.document;
  const w = page.window;
  const q = new URLSearchParams(w.location.search);
  const id = q.get('id') || '1027';
  const e = EXPECT[id];
  const $ = (s) => d.getElementById(s);
  const cards = () => [...d.querySelectorAll('#ets-list .lc-transfer-schema-tile')];
  const visible = (el) => !!el && !el.hidden;
  const las = w.LoanAgreementStore;
  const setVal = (sel, v) => { d.querySelector(sel).value = v; };
  const alertText = () => (d.querySelector('#tschema-scrim [data-tschema-alert]') || { textContent: '' }).textContent;
  const alertShown = () => { const a = d.querySelector('#tschema-scrim [data-tschema-alert]'); return !!a && !a.hidden; };
  const pick = async (listId, code) => {
    await page.click('#' + listId.replace('-list', ''));
    await page.wait(40);
    const item = d.querySelector('#' + listId + ' .ddl__item[data-code="' + code + '"]');
    page.check(!!item, 'в списке ' + listId + ' есть пункт ' + code + ' (пунктов: ' + d.querySelectorAll('#' + listId + ' .ddl__item').length + ')');
    if (!item) return;
    item.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
    await page.wait(40);
  };
  /* пункты меню ⋮ лежат в скрытом меню — открытие меню штатное (ContextMenu ДС), здесь шлём клик по пункту */
  const fire = (sel) => { const el = d.querySelector(sel); page.check(!!el, 'пункт меню найден: ' + sel); if (el) el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); };
  await page.wait(300);

  page.step('сделка ' + id + ': шапка и крошки');
  page.check(/\.preview\.html$/.test(w.location.pathname), 'открыт собранный файл');
  const crumbs = [...d.querySelectorAll('.crumbs a, .crumbs .crumbs__current')].map((x) => x.textContent.trim());
  page.check(crumbs.length === 5 && /^\d+(\.\d+)*\. Договор займа/.test(crumbs[3] || ''), 'крошки: ' + crumbs.join(' / '));
  page.check(crumbs[4] === 'Единая трансфертная ставка', 'последняя крошка — название страницы');
  const instrumentCrumb = d.querySelector('.crumbs a[href*="Instrument.preview.html"]');
  page.check(!!instrumentCrumb && /ins=/.test(instrumentCrumb.getAttribute('href')), 'крошка договора ведёт на страницу договора с ins=');
  page.check(!!$('ets-back-btn') && /В инструмент/.test($('ets-back-btn').textContent), 'есть «В инструмент»');
  if (!e) return;

  page.step('список схем и пустое состояние по режиму');
  page.check(cards().length === e.schemes, 'карточек схем ' + e.schemes + ', есть ' + cards().length);
  page.check(cards().every((c) => c.getAttribute('data-mode') === e.mode), 'режим карточек — ' + e.mode);
  page.check(visible($('ets-empty-wrap')) === (e.schemes === 0), 'пустое состояние «Здесь пока ничего нет» ' + (e.schemes === 0 ? 'видно' : 'скрыто'));
  page.check(visible($('ets-list')) === (e.schemes > 0), 'список ' + (e.schemes > 0 ? 'виден' : 'скрыт'));
  if (cards().length > 1) {
    const starts = cards().map((c) => c.querySelector('.tile__title').textContent.trim().slice(0, 10).split('.').reverse().join(''));
    page.check(starts.every((s, i) => i === 0 || starts[i - 1] >= s), 'схемы — от новых к старым по дате начала');
  }
  if (cards().length) {
    page.check(/^\d{2}\.\d{2}\.\d{4}—\d{2}\.\d{2}\.\d{4}$/.test(cards()[0].querySelector('.tile__title').textContent.trim()), 'заголовок карточки — «ДД.ММ.ГГГГ—ДД.ММ.ГГГГ»');
  }

  page.step('правка: кнопки и меню по режиму (Л235)');
  const newBtn = $('ets-new-btn');
  const histRate = d.querySelector('[data-ets-act="HISTORY_RATE"]');
  const histBase = d.querySelector('[data-ets-act="HISTORY_BASE_INDEX"]');
  page.check(!!histRate && !!histBase && !histRate.disabled && !histBase.disabled, 'истории в меню ⋮ шапки доступны в любом режиме');
  if (e.mode === 'view') {
    page.check(newBtn.disabled === true, 'просмотр: «Новая схема» в шапке выключена разметкой');
    page.check(d.querySelectorAll('#ets-list [data-lc-action]').length === 0, 'просмотр: пунктов «Изменить» / «Удалить» в разметке нет');
    page.check(d.querySelectorAll('#ets-list [data-menu]').length === 0, 'просмотр: ⋮ карточек в разметке нет');
    page.check(d.querySelectorAll('#ets-empty [data-ets-act="NEW"]').length === 0, 'просмотр: в пустом состоянии кнопки «Новая схема» нет в разметке');
    w.PostModalTransferSchema.open({});
    await page.wait(60);
    page.check($('tschema-scrim').hidden, 'просмотр: окно схемы не открывается');
  } else {
    page.check(newBtn.disabled === false, 'правка: «Новая схема» доступна');
    page.check(d.querySelectorAll('#ets-list [data-lc-action="EDIT_SCHEME"]').length === e.schemes, 'правка: «Изменить» у каждой карточки');
    page.check(d.querySelectorAll('#ets-list [data-lc-action="REMOVE_SCHEME"]').length === e.schemes, 'правка: «Удалить» у каждой карточки');
    if (e.schemes === 0) page.check(!!d.querySelector('#ets-empty-actions button') && !$('ets-empty-actions').hidden, 'правка: в пустом состоянии есть «Новая схема»');
  }

  page.step('истории: окна открываются из меню шапки и читают стор');
  fire('[data-ets-act="HISTORY_RATE"]');
  await page.wait(80);
  const rScrim = $('transfer-rate-history-scrim');
  page.check(!!rScrim && !rScrim.hidden, '«История ставок» открыла окно');
  const rRows = rScrim ? rScrim.querySelectorAll('.tbl__row:not(.tbl__row--head)').length : 0;
  page.check(rRows === las.rateHistory().length, 'строк истории ставок ' + las.rateHistory().length + ', есть ' + rRows);
  if (rScrim && !rScrim.hidden && w.DSModal && w.DSModal.closeTop) w.DSModal.closeTop(false);
  await page.wait(40);
  fire('[data-ets-act="HISTORY_BASE_INDEX"]');
  await page.wait(80);
  const bScrim = $('bih-scrim');
  page.check(!!bScrim && !bScrim.hidden, '«История БИ» открыла окно');
  const bRows = bScrim ? bScrim.querySelectorAll('.tbl__row:not(.tbl__row--head)').length : 0;
  page.check(bRows === Math.min(50, las.baseIndexHistory().length), 'строк истории БИ на странице ' + Math.min(50, las.baseIndexHistory().length) + ', есть ' + bRows);
  if (bScrim && !bScrim.hidden && w.DSModal && w.DSModal.closeTop) w.DSModal.closeTop(false);
  await page.wait(40);
  if (e.mode === 'view') return;

  page.step('окно схемы: ошибки — все сразу, окно не закрывается, стор не меняется');
  const before = las.schemes().length;
  await page.click('#ets-new-btn');
  await page.wait(80);
  const sScrim = $('tschema-scrim');
  page.check(!!sScrim && !sScrim.hidden, '«Новая схема» открыла окно «Процентная схема»');
  page.check(/Процентная схема/.test($('tschema-title').textContent), 'заголовок окна — «Процентная схема»');
  page.check($('tschema-lag').value === '0', '«Рабочих дней до применения БИ» по умолчанию 0');
  page.check(!alertShown(), 'до «Сохранить» ошибок нет');
  await page.click('#tschema-scrim [data-tschema-save]');
  await page.wait(80);
  page.check(!sScrim.hidden && las.schemes().length === before, 'пустая форма: окно открыто, стор не изменился');
  page.check(alertShown() && /Необходимо заполнить данные по ставке/.test(alertText()), 'Alert: «Необходимо заполнить данные по ставке»');
  page.check(/Необходимо заполнить даты начала и окончания/.test(alertText()), 'Alert: «Необходимо заполнить даты начала и окончания» — тем же Alert');
  await pick('tschema-rate-type-list', 'FIXED');
  setVal('#tschema-fixed-rate', '4');
  setVal('#tschema-start-date', '01.07.2028');
  setVal('#tschema-end-date', '01.06.2028');
  await page.click('#tschema-scrim [data-tschema-save]');
  await page.wait(80);
  page.check(!sScrim.hidden && /Дата окончания не может быть раньше даты начала/.test(alertText()), 'Alert: «Дата окончания не может быть раньше даты начала»');
  page.check(!/Необходимо заполнить данные по ставке/.test(alertText()), 'ставка заполнена — её ошибки в Alert нет');
  if (e.schemes > 0) {
    /* пересечение проверяется только когда есть с чем пересекаться */
    setVal('#tschema-start-date', '01.06.2024');
    setVal('#tschema-end-date', '01.07.2024');
    await page.click('#tschema-scrim [data-tschema-save]');
    await page.wait(80);
    page.check(!sScrim.hidden && /Период пересекается с другой процентной схемой/.test(alertText()), 'Alert: «Период пересекается с другой процентной схемой»');
  }
  page.check(las.schemes().length === before, 'ни одна ошибка не изменила стор');

  page.step('создание схемы: фиксированная — стор, перерисовка, тост');
  setVal('#tschema-start-date', '01.01.2029');
  setVal('#tschema-end-date', '31.12.2029');
  setVal('#tschema-comment', 'Новая фиксированная схема');
  await page.click('#tschema-scrim [data-tschema-save]');
  await page.wait(120);
  page.check(sScrim.hidden, 'окно закрылось после «Сохранить»');
  page.check(las.schemes().length === before + 1, 'схем в сторе ' + (before + 1));
  page.check(cards().length === before + 1, 'карточек ' + (before + 1) + ', есть ' + cards().length);
  page.check(!visible($('ets-empty-wrap')), 'пустое состояние ушло');
  page.check(/Новая процентная схема добавлена/.test(d.body.textContent), 'тост «Новая процентная схема добавлена»');
  page.check(/01\.01\.2029—31\.12\.2029/.test(cards()[0].textContent) && /4%/.test(cards()[0].textContent), 'первая карточка — новая схема, ставка «4%»');

  page.step('создание плавающей схемы: БИ + спред');
  await page.click('#ets-new-btn');
  await page.wait(80);
  await pick('tschema-rate-type-list', 'FLOATING');
  await pick('tschema-base-index-list', 'KEY_RATE');
  setVal('#tschema-spread', '3,5');
  setVal('#tschema-start-date', '01.01.2030');
  setVal('#tschema-end-date', '31.12.2030');
  await page.click('#tschema-scrim [data-tschema-save]');
  await page.wait(120);
  page.check(sScrim.hidden && las.schemes().length === before + 2, 'плавающая схема сохранена');
  page.check(/КС\+3,5%/.test(cards()[0].textContent), 'формула в карточке — «КС+3,5%»: ' + cards()[0].querySelector('.tile__body').textContent.replace(/\s+/g, ' ').trim());
  const added = las.schemes()[0];
  page.check(added.rateTypeCode === 'FLOATING' && added.baseIndexCode === 'KEY_RATE' && added.spreadPercent === 3.5, 'в сторе: плавающая, КС, спред 3,5');

  page.step('правка схемы: окно читает запись, «Сохранить» меняет карточку, тост');
  const eid = cards()[0].getAttribute('data-scheme-id');
  fire('#ets-list .lc-transfer-schema-tile [data-lc-action="EDIT_SCHEME"]');
  await page.wait(80);
  page.check(!sScrim.hidden, '«Изменить» открыло окно');
  page.check($('tschema-start-date').value === '01.01.2030', 'окно показывает дату начала из стора: «' + $('tschema-start-date').value + '»');
  page.check($('tschema-spread').value.replace(',', '.') === '3.5', 'окно показывает спред из стора: «' + $('tschema-spread').value + '»');
  setVal('#tschema-comment', 'Правка комментария');
  await page.click('#tschema-scrim [data-tschema-save]');
  await page.wait(120);
  const edited = las.schemes().find((s) => s.id === eid);
  page.check(!!edited && edited.comment === 'Правка комментария', 'комментарий записан в стор');
  page.check(sScrim.hidden && las.schemes().length === before + 2, 'окно закрылось, схем не прибавилось');
  page.check(/Процентная схема изменена/.test(d.body.textContent), 'тост «Процентная схема изменена»');
  page.check(/Правка комментария/.test(cards()[0].textContent), 'карточка показывает новый комментарий');

  page.step('удаление: только через подтверждение, тост');
  fire('#ets-list .lc-transfer-schema-tile [data-lc-action="REMOVE_SCHEME"]');
  await page.wait(80);
  const dScrim = $('tschema-delete-scrim');
  page.check(!!dScrim && !dScrim.hidden, '«Удалить» открыло подтверждение');
  page.check(/Подтвердите действие/.test(dScrim.textContent) && /Удаление процентной схемы/.test(dScrim.textContent), 'тексты подтверждения');
  page.check(las.schemes().some((s) => s.id === eid), 'до подтверждения схема ещё в сторе');
  await page.click('#tschema-delete-scrim [data-tschema-confirm="cancel"]');
  await page.wait(60);
  page.check(dScrim.hidden && las.schemes().some((s) => s.id === eid), '«Отменить» закрыло подтверждение, схема на месте');
  fire('#ets-list .lc-transfer-schema-tile [data-lc-action="REMOVE_SCHEME"]');
  await page.wait(80);
  await page.click('#tschema-delete-scrim [data-tschema-confirm="ok"]');
  await page.wait(120);
  page.check(!las.schemes().some((s) => s.id === eid) && las.schemes().length === before + 1, 'после «Подтвердить» схема удалена из стора');
  page.check(cards().length === before + 1, 'карточек ' + (before + 1) + ', есть ' + cards().length);
  page.check(/Процентная схема удалена/.test(d.body.textContent), 'тост «Процентная схема удалена»');

  page.step('удаление последней схемы возвращает пустое состояние');
  while (las.schemes().length > 1) las.removeScheme(las.schemes()[0].id);
  await page.wait(100);
  const lastId = cards()[0].getAttribute('data-scheme-id');
  fire('#ets-list .lc-transfer-schema-tile [data-lc-action="REMOVE_SCHEME"]');
  await page.wait(80);
  await page.click('#tschema-delete-scrim [data-tschema-confirm="ok"]');
  await page.wait(120);
  page.check(las.schemes().length === 0 && cards().length === 0, 'схем не осталось');
  page.check(visible($('ets-empty-wrap')) && !!d.querySelector('#ets-empty-actions button'), 'пустое состояние с кнопкой «Новая схема»');
  page.check(lastId != null, 'id последней схемы был: ' + lastId);

  page.step('погашение НКЛ переводит страницу в просмотр');
  const tree = w.ProductTreeStore;
  tree.repay(las.instrument().id, '2026-10-27');
  tree.commit();
  await page.wait(120);
  page.check($('ets-new-btn').disabled === true, '«Новая схема» выключена');
  page.check(d.querySelectorAll('#ets-empty-actions button').length === 0, 'в пустом состоянии кнопки нет в разметке');
};
