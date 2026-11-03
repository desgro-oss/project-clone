// Сценарий страницы «Договор займа (НКЛ)» (RE0041, Э2): состояния и режимы тайлов, меню шапки,
// транши, контрагент договора. Гонять с --query: id=1027 · 1028 · 1026 · 1024 · 1025 · 1030
// Договор в сделке — 1027.d1.p1.i1 (в 1027 — два транша, заполнено всё).
const EXPECT = {
  '1027': { mode: 'edit', counterparty: 'data', balance: 'data', contract: 'data', ets: 'data', tech: 'data', tranches: 2 },
  '1028': { mode: 'edit', counterparty: 'data', balance: 'data', contract: 'data', ets: 'empty', tech: 'empty', tranches: 1 },
  '1026': { mode: 'edit', counterparty: 'empty', balance: 'empty', contract: 'empty', ets: 'empty', tech: 'empty', tranches: 2 },
  '1024': { mode: 'view', counterparty: 'data', balance: 'data', contract: 'data', ets: 'data', tech: 'empty', tranches: 2 },
  '1025': { mode: 'view', counterparty: 'empty', balance: 'empty', contract: 'empty', ets: 'empty', tech: 'empty', tranches: 2 },
  '1030': { mode: 'view', counterparty: 'data', balance: 'data', contract: 'data', ets: 'data', tech: 'data', tranches: 1 }
};
const TILES = {
  counterparty: 'tile-counterparty', balance: 'tile-balance-currency', contract: 'tile-contract',
  ets: 'tile-transfer-rate', tech: 'tile-loan-external-data'
};
export default async (page) => {
  const d = page.document;
  const w = page.window;
  const q = new URLSearchParams(w.location.search);
  const id = q.get('id') || '1027';
  const e = EXPECT[id];
  const $ = (s) => d.getElementById(s);
  await page.wait(300);

  /* Контрагент договора из данных сделки — до правок сценария: шаг «свой
     контрагент» ниже меняет запись договора, и проверять исходные данные
     после него уже нечего (RE0047). */
  const seededCounterpartyId = w.LoanAgreementStore.get().counterpartyId;

  page.step('сделка ' + id + ': шапка и крошки');
  page.check(/\.preview\.html$/.test(w.location.pathname), 'открыт собранный файл');
  const title = $('in-title').textContent.trim();
  page.check(/^\d+(\.\d+)*\. Договор займа/.test(title), 'заголовок «номер. название»: ' + title);
  const crumbs = [...d.querySelectorAll('.crumbs a, .crumbs .crumbs__current')].map((x) => x.textContent.trim());
  page.check(crumbs.length === 4 && /^\d+\. /.test(crumbs[2] || ''), 'крошки: ' + crumbs.join(' / '));
  if (!e) return;

  page.step('тайлы: состояния и режим');
  for (const [k, tid] of Object.entries(TILES)) {
    const t = $(tid);
    page.check(!!t, 'тайл ' + tid + ' на странице');
    if (!t) continue;
    page.check(t.getAttribute('data-state') === e[k], tid + ': состояние ' + e[k] + ', есть ' + t.getAttribute('data-state'));
    page.check(t.getAttribute('data-mode') === e.mode, tid + ': режим ' + e.mode + ', есть ' + t.getAttribute('data-mode'));
  }
  const tr = $('tile-loan-tranches');
  page.check(tr && tr.getAttribute('data-mode') === e.mode, 'тайл траншей: режим ' + e.mode);
  const rows = () => tr.querySelectorAll('li[data-lntr-id]').length;
  page.check(rows() === e.tranches, 'траншей в тайле ' + e.tranches + ', есть ' + rows());

  page.step('меню ⋮ шапки');
  const items = [...d.querySelectorAll('#in-head-menu [data-in-act]')];
  page.check(items.length === 2, 'в меню два пункта: ' + items.map((x) => x.textContent.trim()).join(', '));
  const labels = items.map((x) => x.textContent.trim());
  page.check(labels.includes('Перенести'), 'есть «Перенести»');
  page.check(labels.includes(id === '1030' ? 'Отменить погашение' : 'Погасить'), 'первый пункт — ' + (id === '1030' ? '«Отменить погашение»' : '«Погасить»'));
  /* в демо-договорах просмотр всегда по статусу сделки (1030 — ещё и погашен) */
  const dealView = e.mode === 'view';
  page.check(items.every((x) => x.disabled === dealView), 'пункты ' + (dealView ? 'выключены разметкой (статус сделки)' : 'доступны'));

  page.step('правка: карандаши и кнопки по режиму (Л235)');
  const addBtn = [...tr.querySelectorAll('[data-lntr-add], button')].find((b) => /Добавить транш/.test(b.textContent));
  if (e.mode === 'view') {
    page.check(!addBtn || addBtn.disabled || addBtn.hidden, 'просмотр: «Добавить транш» выключена или скрыта');
    page.check(tr.querySelectorAll('.prow__actions').length === 0, 'просмотр: меню ⋮ строк траншей нет в разметке');
    for (const tid of ['tile-balance-currency', 'tile-contract', 'tile-loan-external-data']) {
      const open = [...$(tid).querySelectorAll('button[data-modal]')].filter((b) => !b.disabled);
      page.check(open.length === 0, 'просмотр: у ' + tid + ' все кнопки правки (data-modal) выключены разметкой, включены ' + open.length);
    }
    const fill = $('tile-contract').querySelector('[class$="__fill"]');
    const docsOpen = fill ? [...fill.querySelectorAll('button')].filter((b) => !b.disabled) : [];
    page.check(docsOpen.length === 0, 'просмотр: в блоке «Заполнить» тайла договора все кнопки выключены, включены ' + docsOpen.length);
    return;
  }
  page.check(!!addBtn && !addBtn.disabled, 'правка: «Добавить транш» доступна');

  page.step('«Добавить транш» добавляет транш в дерево');
  const before = rows();
  await page.click('#tile-loan-tranches button', { text: 'Добавить транш' });
  await page.wait(100);
  page.check(rows() === before + 1, 'траншей стало ' + (before + 1) + ', есть ' + rows());
  const tree = w.ProductTreeStore;
  page.check(tree.node(w.LoanAgreementStore.instrument().id).children.length === before + 1, 'транш появился в дереве продуктов');

  page.step('окно «Договор»: читает стор, «Сохранить» пишет и закрывает');
  const las0 = w.LoanAgreementStore;
  const scrimOf = (sid) => $(sid);
  const setVal = (sel, v) => { d.querySelector(sel).value = v; };
  w.PostModalInitialAndAdditionalAgreements.open();
  await page.wait(60);
  const stored = las0.get().contract;
  page.check(d.querySelector('#contract-number').value === (stored ? stored.contractNumber : ''),
    'окно «Договор» показывает номер из стора, а не статику разметки: «' + d.querySelector('#contract-number').value + '»');
  setVal('#contract-number', 'ZZ-777');
  setVal('#contract-sign-date', '15.03.2024');
  await page.click('#contract-scrim [data-contract-save]');
  await page.wait(60);
  const saved = las0.get().contract;
  page.check(saved && saved.contractNumber === 'ZZ-777' && saved.contractSignDate === '2024-03-15', 'договор записан в стор: ' + JSON.stringify(saved));
  page.check(scrimOf('contract-scrim').hidden, 'окно «Договор» закрылось после «Сохранить»');
  page.check(/ZZ-777/.test($('tile-contract').textContent), 'тайл договора показывает новый номер');

  page.step('окно «Техническая информация»: «Сохранить» пишет и закрывает');
  w.PostModalLoanExternalData.open();
  await page.wait(60);
  setVal('#tech-gfo-id', '777000111');
  setVal('#tech-gfo-funding-credit-id', '777000111-01-01');
  await page.click('#tech-scrim [data-tech-save]');
  await page.wait(60);
  const tech = las0.get().techInfo;
  page.check(tech && tech.gfoId === '777000111', 'тех. информация записана в стор: ' + JSON.stringify(tech));
  page.check(scrimOf('tech-scrim').hidden, 'окно «Техническая информация» закрылось');
  page.check(/777000111/.test($('tile-loan-external-data').textContent), 'тайл «Техническая информация» обновился');

  if (las0.get().balanceCurrency) {
    page.step('окно «Баланс и валюта»: «Сохранить» пишет и закрывает');
    w.PostModalBalanceAndCurrency.open();
    await page.wait(60);
    page.check(d.querySelector('#bal-balance').value !== '', 'окно показывает баланс из стора: «' + d.querySelector('#bal-balance').value + '»');
    setVal('#bal-limit', '5000,50');
    await page.click('#bal-scrim [data-bal-save]');
    await page.wait(60);
    const bc = las0.get().balanceCurrency;
    page.check(bc && bc.totalLimitAmount === 5000.5, 'сумма лимита записана в стор: ' + JSON.stringify(bc));
    page.check(scrimOf('bal-scrim').hidden, 'окно «Баланс и валюта» закрылось');
  }

  page.step('меню траншей: «Удалить» выключен, если транш нельзя удалить; иначе открывает подтверждение');
  for (const row of [...tr.querySelectorAll('li[data-lntr-id]')]) {
    const rid = row.getAttribute('data-lntr-id');
    const del = row.querySelector('[data-lntr-act="DELETE_TRANCHE"]');
    const can = w.ProductTreeStore.canRemove(rid);
    page.check(!!del, rid + ': пункт «Удалить» есть');
    if (!del) continue;
    if (!can) {
      page.check(del.getAttribute('aria-disabled') === 'true', rid + ': нельзя удалить (прикреплён к ФИ) — пункт выключен разметкой');
    } else {
      page.check(del.getAttribute('aria-disabled') !== 'true', rid + ': можно удалить — пункт доступен');
      await page.click('li[data-lntr-id="' + rid + '"] [data-menu]');
      await page.wait(30);
      /* открытое меню рантайм выносит из строки в общий слой — ищем пункт по его атрибутам */
      await page.click('[data-lntr-act="DELETE_TRANCHE"][data-lntr-id="' + rid + '"]');
      await page.wait(60);
      const cs = $('ptree-confirm-scrim');
      page.check(!!cs && !cs.hidden, rid + ': «Удалить» открыло подтверждение');
      if (cs && !cs.hidden && w.DSModal && w.DSModal.closeTop) w.DSModal.closeTop(true);
      await page.wait(30);
      break;
    }
  }

  page.step('погашенный транш: строка статуса с чеком, в меню «Отменить погашение» вместо «Погасить»');
  const trId = [...tr.querySelectorAll('li[data-lntr-id]')].map((r) => r.getAttribute('data-lntr-id'))[0];
  tree.repay(trId, '2026-10-20');
  tree.commit();
  await page.wait(100);
  const trRow = tr.querySelector('li[data-lntr-id="' + trId + '"]');
  const st = trRow.querySelector('.prow__status--success');
  page.check(!!st && !!st.querySelector('[data-icon="check-circle-filled"]'), 'у погашенного транша строка статуса с зелёным чеком');
  page.check(!!st && /Дата фактического погашения 20\.10\.2026/.test(st.textContent), 'в статусе дата погашения: ' + (st ? st.textContent.trim() : '—'));
  page.check(!trRow.querySelector('[data-lntr-act="REPAY_TRANCHE"]'), 'у погашенного транша нет «Погасить»');
  const undoTr = trRow.querySelector('[data-lntr-act="UNDO_REPAY_TRANCHE"]');
  page.check(!!undoTr, 'у погашенного транша есть «Отменить погашение»');
  await page.click('li[data-lntr-id="' + trId + '"] [data-menu]');
  await page.wait(30);
  await page.click('[data-lntr-act="UNDO_REPAY_TRANCHE"][data-lntr-id="' + trId + '"]');
  await page.wait(60);
  const rs = $('ptree-repay-scrim');
  page.check(!!rs && !rs.hidden, '«Отменить погашение» открыло окно погашения');
  if (rs && !rs.hidden && w.DSModal && w.DSModal.closeTop) w.DSModal.closeTop(true);
  tree.undoRepay(trId);
  tree.commit();
  await page.wait(60);
  page.check(!tr.querySelector('li[data-lntr-id="' + trId + '"] .prow__status'), 'после отмены погашения строки статуса нет');

  page.step('договор, сохранённый с пустыми полями, — «не заполнено»');
  las0.setContract({ contractNumber: '', contractSignDate: '' });
  await page.wait(60);
  page.check(las0.get().contract === null, 'пустой договор в сторе — null');
  page.check($('tile-contract').getAttribute('data-state') === 'empty', 'тайл договора — «не заполнено»');

  page.step('НКЛ: свой контрагент, новый становится участником сделки');
  const cp = w.CounterpartiesStore;
  const las = w.LoanAgreementStore;
  const other = ['ul-20', 'ul-21', 'ul-22', 'ul-23'].find((x) => !cp.isMember(x));
  if (other) {
    const knrBefore = cp.knr().map((x) => x.id).join(',');
    page.check(las.setCounterparty(other) === true, 'setCounterparty(' + other + ')');
    await page.wait(100);
    page.check(cp.isMember(other), 'выбранный контрагент стал участником сделки');
    page.check(cp.knr().map((x) => x.id).join(',') === knrBefore, 'состав КНР не изменился');
    page.check(/\S/.test(($('tile-counterparty').textContent || '')), 'тайл «Контрагент» перерисован');
  }

  page.step('«Документы по сделке» открывает окно со всеми участниками сделки');
  await page.click('#tile-contract [data-lc-action="DOCS"]');
  await page.wait(60);
  const ecm = $('deal-ecm-scrim');
  page.check(!!ecm && !ecm.hidden, 'окно документов ЭКД открылось');
  /* Кнопка открывает окно программно, без data-modal: список должен быть нарисован
     до открытия — проверяем состав, а не видимость окна (RE0047). */
  const ecmModal = ecm && ecm.querySelector('.lc-deal-ecm');
  const ecmCards = ecm ? ecm.querySelectorAll('[data-ecm-items] [role="radio"]') : [];
  const ecmMembers = cp.members().length;
  page.check(!!ecmModal && ecmModal.getAttribute('data-state') === (ecmMembers ? 'data' : 'empty'),
    'окно в состоянии «' + (ecmMembers ? 'данные' : 'пусто') + '»');
  page.check(ecmCards.length === ecmMembers, 'карточек участников всей сделки ' + ecmCards.length + ' из ' + ecmMembers);
  if (ecm && !ecm.hidden && w.DSModal && w.DSModal.closeTop) w.DSModal.closeTop(false);

  page.step('контрагент договора — участник сделки и отмечен в окне «Контрагент»');
  /* Инвариант базы (RE0047): контрагент договора обязан быть участником сделки,
     иначе его нет ни в окне документов, ни в составе, и выбор «Контрагент» пуст. */
  page.check(!!seededCounterpartyId && !!cp.byId(seededCounterpartyId),
    'контрагент договора из данных есть в базе: ' + seededCounterpartyId);
  page.check(cp.isMember(seededCounterpartyId), 'контрагент договора из данных входит в участников сделки');
  const cpId = las.get().counterpartyId;
  page.check(cp.isMember(cpId), 'текущий контрагент договора — участник: ' + cpId);
  w.PostModalCounterparties.open();
  await page.wait(60);
  const cpCard = d.querySelector('[data-knr-card="' + cpId + '"]');
  page.check(!!cpCard, 'карточка контрагента договора в окне «Контрагент»');
  page.check(!!(cpCard && cpCard.querySelector('input[type="radio"]:checked')), 'радио «Контрагент» отмечено');
  if (w.DSModal && w.DSModal.closeTop) w.DSModal.closeTop(false);
  await page.wait(40);

  page.step('погашение НКЛ переводит тайлы в просмотр');
  const insId = las.instrument().id;
  tree.repay(insId, '2026-10-27');
  tree.commit();
  await page.wait(100);
  for (const tid of Object.values(TILES)) {
    page.check($(tid).getAttribute('data-mode') === 'view', tid + ': после погашения — просмотр');
  }
  const after = [...d.querySelectorAll('#in-head-menu [data-in-act]')].map((x) => x.textContent.trim());
  page.check(after.includes('Отменить погашение'), 'в меню «Отменить погашение»: ' + after.join(', '));
  const undo = d.querySelector('#in-head-menu [data-in-act="UNDO_REPAY"]');
  page.check(!!undo && !undo.disabled, 'сделка допускает правку — «Отменить погашение» доступно');
};
