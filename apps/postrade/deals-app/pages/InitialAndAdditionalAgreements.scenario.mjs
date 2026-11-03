// Сценарий страницы «Договор и дополнительные соглашения» (RE0041, Э3): тайл «Договор», список ДС,
// пустые состояния, фильтр, создание / правка / удаление ДС, режимы. Гонять с --query: id=1027 · 1028 · 1026 · 1024 · 1030
// Договор в сделке — <id>.d1.p1.i1. В 1027 — четыре ДС, в 1028 / 1024 / 1026 — ни одного, в 1030 — один (погашен).
const EXPECT = {
  '1027': { mode: 'edit', contract: 'data', agreements: 4 },
  '1028': { mode: 'edit', contract: 'data', agreements: 0 },
  '1026': { mode: 'edit', contract: 'empty', agreements: 0 },
  '1024': { mode: 'view', contract: 'data', agreements: 0 },
  '1030': { mode: 'view', contract: 'data', agreements: 1 }
};
export default async (page) => {
  const d = page.document;
  const w = page.window;
  const q = new URLSearchParams(w.location.search);
  const id = q.get('id') || '1027';
  const e = EXPECT[id];
  const $ = (s) => d.getElementById(s);
  const cards = () => [...d.querySelectorAll('#aa-list .lc-additional-agreement-tile')];
  const visible = (el) => !!el && !el.hidden;
  const chip = () => d.querySelector('#ia-filter .tfilter__applied');
  await page.wait(300);

  page.step('сделка ' + id + ': шапка и крошки');
  page.check(/\.preview\.html$/.test(w.location.pathname), 'открыт собранный файл');
  const crumbs = [...d.querySelectorAll('.crumbs a, .crumbs .crumbs__current')].map((x) => x.textContent.trim());
  page.check(crumbs.length === 5 && /^\d+\. /.test(crumbs[2] || '') && /^\d+(\.\d+)*\. Договор займа/.test(crumbs[3] || ''), 'крошки: ' + crumbs.join(' / '));
  page.check(crumbs[4] === 'Договор и дополнительные соглашения', 'последняя крошка — название страницы');
  const instrumentCrumb = d.querySelector('.crumbs a[href*="Instrument.preview.html"]');
  page.check(!!instrumentCrumb && /ins=/.test(instrumentCrumb.getAttribute('href')), 'крошка договора ведёт на страницу договора с ins=');
  const back = $('ia-back-btn');
  page.check(!!back && /В инструмент/.test(back.textContent), 'есть «В инструмент»');
  if (!e) return;

  page.step('тайл «Договор» и список ДС: состояния и режим');
  const tile = $('tile-contract');
  page.check(!!tile, 'тайл договора на странице');
  page.check(tile.getAttribute('data-state') === e.contract, 'тайл договора: состояние ' + e.contract + ', есть ' + tile.getAttribute('data-state'));
  page.check(tile.getAttribute('data-mode') === e.mode, 'тайл договора: режим ' + e.mode + ', есть ' + tile.getAttribute('data-mode'));
  page.check(tile.querySelectorAll('.lc-contract-tile__grid--data .rof').length === 3, 'у НКЛ три поля договора');
  page.check(!!tile.querySelector('[data-lc-action="DOCS"]'), '«Документы по сделке» есть всегда');
  page.check(cards().length === e.agreements, 'карточек ДС ' + e.agreements + ', есть ' + cards().length);
  page.check(cards().every((c) => c.getAttribute('data-mode') === e.mode), 'режим карточек — ' + e.mode);
  page.check(cards().every((c) => c.classList.contains('tile--collapsed')), 'карточки свёрнуты по умолчанию');
  page.check(cards().every((c) => !!c.querySelector('.tile__toggle')), 'шеврон есть у каждой карточки');
  page.check(visible($('ia-empty')) === (e.agreements === 0), 'пустое состояние «Дополнительные соглашения отсутствуют» ' + (e.agreements === 0 ? 'видно' : 'скрыто'));
  page.check(visible($('ia-filter')) === (e.agreements > 0), 'кнопка «Фильтр» ' + (e.agreements > 0 ? 'есть' : 'скрыта: ДС нет'));
  page.check(!visible($('ia-nothing')), '«Ничего не найдено» без фильтра скрыто');

  page.step('правка: карандаши и кнопки по режиму (Л235)');
  const newBtn = $('ia-new-btn');
  if (e.mode === 'view') {
    page.check(newBtn.disabled === true, 'просмотр: «Новое соглашение» в шапке выключена разметкой');
    page.check(!tile.querySelector('[data-modal="contract-scrim"]'), 'просмотр: карандаша тайла «Договор» нет в разметке');
    page.check(d.querySelectorAll('#aa-list [data-lc-action="EDIT_AGREEMENT"]').length === 0, 'просмотр: карандашей карточек ДС нет в разметке');
    if (e.agreements === 0) {
      page.check(d.querySelectorAll('#ia-empty [data-ia-act="NEW"]').length === 0, 'просмотр: в пустом состоянии кнопки «Новое соглашение» нет в разметке');
    } else {
      const chev = cards()[0].querySelector('.tile__toggle');
      page.check(!!chev, 'просмотр: шеврон остаётся');
      page.check(cards()[0].classList.contains('tile--collapsed'), 'карточка свёрнута до клика');
      await page.click('#aa-list .tile__toggle');
      await page.wait(60);
      page.check(!cards()[0].classList.contains('tile--collapsed'), 'шеврон раскрывает карточку');
      page.check(/Комментарий/.test(cards()[0].textContent), 'в раскрытой карточке — «Комментарий»');
    }
    return;
  }
  page.check(newBtn.disabled === false, 'правка: «Новое соглашение» доступна');
  page.check(!!tile.querySelector('[data-modal="contract-scrim"]'), 'правка: карандаш тайла «Договор» есть');
  page.check(d.querySelectorAll('#aa-list [data-lc-action="EDIT_AGREEMENT"]').length === e.agreements, 'правка: карандаш у каждой карточки ДС');
  if (e.agreements === 0) {
    page.check(!!d.querySelector('#ia-empty-actions button') && !$('ia-empty-actions').hidden, 'правка: в пустом состоянии есть «Новое соглашение»');
  }

  const las = w.LoanAgreementStore;
  const setVal = (sel, v) => { d.querySelector(sel).value = v; };

  page.step('создание ДС: окно берёт следующий номер, «Сохранить» пишет в стор и перерисовывает список');
  const before = las.agreements().length;
  const nextSeq = las.nextSeqNumber();
  await page.click('#ia-new-btn');
  await page.wait(80);
  const aScrim = $('agreement-scrim');
  page.check(!!aScrim && !aScrim.hidden, '«Новое соглашение» открыло окно ДС');
  page.check(/Создание/.test($('agreement-title').textContent), 'заголовок окна — «Создание…»');
  page.check(d.querySelector('#agreement-seq-number').value === String(nextSeq), 'номер подставлен следующий: ' + d.querySelector('#agreement-seq-number').value);
  setVal('#agreement-sign-date', '15.03.2026');
  await page.click('#agreement-scrim [data-agreement-save]');
  await page.wait(100);
  page.check(las.agreements().length === before + 1, 'ДС в сторе стало ' + (before + 1));
  page.check(aScrim.hidden, 'окно ДС закрылось после «Сохранить»');
  page.check(cards().length === before + 1, 'карточек стало ' + (before + 1) + ', есть ' + cards().length);
  page.check(!visible($('ia-empty')), 'пустое состояние ушло');
  page.check(visible($('ia-filter')), 'кнопка «Фильтр» появилась');
  const newest = cards()[0];
  page.check(newest && new RegExp('^\\s*№ ' + nextSeq + '(-|\\s)').test(newest.querySelector('.tile__title').textContent), 'новая карточка — первая, номер «' + nextSeq + '-…»: ' + (newest ? newest.querySelector('.tile__title').textContent.trim() : '—'));
  page.check(/15\.03\.2026/.test(newest.querySelector('.tile__title').textContent), 'в заголовке карточки дата подписания');

  page.step('шеврон сворачивает карточку, выбор переживает перерисовку');
  const firstId = cards()[0].getAttribute('data-agreement-id');
  await page.click('#aa-list .lc-additional-agreement-tile .tile__toggle');
  await page.wait(60);
  page.check(!cards()[0].classList.contains('tile--collapsed'), 'шеврон раскрыл первую карточку');
  page.check(/Комментарий/.test(cards()[0].textContent), 'в раскрытой — «Комментарий»');
  las.setContract({ contractNumber: 'ZZ-555', contractSignDate: '2024-03-15' });
  await page.wait(100);
  const again = cards().find((c) => c.getAttribute('data-agreement-id') === firstId);
  page.check(!!again && !again.classList.contains('tile--collapsed'), 'после перерисовки карточка осталась раскрытой');
  page.check(/ZZ-555/.test(again.querySelector('.tile__title').textContent), 'номер ДС пересчитан по новому номеру договора: ' + again.querySelector('.tile__title').textContent.trim());

  page.step('окно «Договор»: читает стор, «Сохранить» пишет и обновляет тайл');
  w.PostModalInitialAndAdditionalAgreements.open();
  await page.wait(60);
  page.check(d.querySelector('#contract-number').value === 'ZZ-555', 'окно показывает номер из стора: «' + d.querySelector('#contract-number').value + '»');
  setVal('#contract-number', 'QQ-111');
  await page.click('#contract-scrim [data-contract-save]');
  await page.wait(100);
  page.check(las.get().contract && las.get().contract.contractNumber === 'QQ-111', 'договор записан в стор');
  page.check($('contract-scrim').hidden, 'окно «Договор» закрылось');
  page.check(/QQ-111/.test(tile.textContent), 'тайл «Договор» показывает новый номер');

  page.step('фильтр: сужает список, чип «Применено», «Ничего не найдено», сброс');
  const total = las.agreements().length;
  await page.click('#ia-filter [data-ia-filter-open]');
  await page.wait(80);
  const fScrim = $('agreements-filter-scrim');
  page.check(!!fScrim && !fScrim.hidden, '«Фильтр» открыл окно фильтра');
  if (fScrim && !fScrim.hidden && w.DSModal && w.DSModal.closeTop) w.DSModal.closeTop(false);
  await page.wait(30);
  const one = las.agreements()[0];
  const apply = (filter, count) => {
    d.dispatchEvent(new w.CustomEvent('agreementsfilter', { detail: { filter, count } }));
  };
  /* номер ДС ищется подстрокой по полному номеру «<порядковый>-<номер договора>» */
  apply({ number: las.agreementNumber(one) }, 1);
  await page.wait(80);
  page.check(cards().length >= 1 && cards().length <= total, 'фильтр по номеру оставил ' + cards().length + ' из ' + total);
  page.check(cards().every((c) => c.querySelector('.tile__title').textContent.indexOf(las.agreementNumber(one)) !== -1), 'в списке только ДС с этим номером');
  page.check(!!chip() && /Применено: 1/.test(chip().textContent), 'появился чип «Применено: 1»');
  apply({ number: 'нет-такого' }, 1);
  await page.wait(80);
  page.check(cards().length === 0 && visible($('ia-nothing')), 'фильтр без результатов — «Ничего не найдено»');
  page.check(!visible($('ia-empty')), '«ДС отсутствуют» при фильтре не показывается');
  await page.click('#ia-nothing [data-ia-act="CLEAR_FILTER"]');
  await page.wait(80);
  page.check(cards().length === total && !visible($('ia-nothing')), '«Очистить фильтр» вернул полный список');
  page.check(!chip(), 'чип «Применено» ушёл');
  apply({ number: las.agreementNumber(one) }, 1);
  await page.wait(60);
  await page.click('#ia-filter .tfilter__applied .chip__remove');
  await page.wait(400);
  page.check(cards().length === total, 'крестик чипа сбросил фильтр целиком: ' + cards().length + ' из ' + total);

  page.step('правка ДС: окно читает запись, «Удалить» — через подтверждение');
  const rid = cards()[0].getAttribute('data-agreement-id');
  await page.click('#aa-list .lc-additional-agreement-tile [data-lc-action="EDIT_AGREEMENT"]');
  await page.wait(80);
  page.check(!aScrim.hidden && /Редактирование/.test($('agreement-title').textContent), 'карандаш открыл окно «Редактирование…»');
  const del = d.querySelector('#agreement-scrim [data-agreement-delete]');
  page.check(!!del && !del.disabled, 'в правке «Удалить» доступна');
  await page.click('#agreement-scrim [data-agreement-delete]');
  await page.wait(80);
  const cScrim = $('agreement-delete-scrim');
  page.check(!!cScrim && !cScrim.hidden, '«Удалить» открыло подтверждение');
  page.check(las.agreements().some((a) => a.id === rid), 'до подтверждения ДС ещё в сторе');
  await page.click('#agreement-delete-scrim [data-agreement-confirm="ok"]');
  await page.wait(100);
  page.check(!las.agreements().some((a) => a.id === rid), 'после «Подтвердить» ДС удалено из стора');
  page.check(cards().length === total - 1, 'карточек стало ' + (total - 1) + ', есть ' + cards().length);
  page.check(cScrim.hidden && aScrim.hidden, 'оба окна закрылись');

  page.step('«Документы по сделке» открывает окно ЭКД сделки');
  await page.click('#tile-contract [data-lc-action="DOCS"]');
  await page.wait(60);
  const ecm = $('deal-ecm-scrim');
  page.check(!!ecm && !ecm.hidden, 'открылось окно документов ЭКД');
  /* Проверяем состав, а не факт открытия: пустое окно тоже «открывалось» (RE0047).
     Список — участники всей сделки, нарисованные до открытия окна. */
  const ecmModal = ecm && ecm.querySelector('.lc-deal-ecm');
  const ecmCards = ecm ? ecm.querySelectorAll('[data-ecm-items] [role="radio"]') : [];
  const ecmMembers = w.CounterpartiesStore ? w.CounterpartiesStore.members().length : 0;
  page.check(!!ecmModal && ecmModal.getAttribute('data-state') === (ecmMembers ? 'data' : 'empty'),
    'окно в состоянии «' + (ecmMembers ? 'данные' : 'пусто') + '»');
  page.check(ecmCards.length === ecmMembers, 'карточек участников всей сделки ' + ecmCards.length + ' из ' + ecmMembers);
  if (ecm && !ecm.hidden && w.DSModal && w.DSModal.closeTop) w.DSModal.closeTop(false);

  page.step('погашение НКЛ переводит страницу в просмотр');
  const tree = w.ProductTreeStore;
  tree.repay(las.instrument().id, '2026-10-27');
  tree.commit();
  await page.wait(120);
  page.check($('tile-contract').getAttribute('data-mode') === 'view', 'тайл договора — просмотр');
  page.check(d.querySelectorAll('#aa-list [data-lc-action="EDIT_AGREEMENT"]').length === 0, 'карандашей карточек нет в разметке');
  page.check($('ia-new-btn').disabled === true, '«Новое соглашение» выключена');
  page.check(!$('tile-contract').querySelector('[data-modal="contract-scrim"]'), 'карандаша тайла «Договор» нет в разметке');
};
