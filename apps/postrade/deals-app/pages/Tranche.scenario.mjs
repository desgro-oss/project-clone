// Сценарий страницы «Транш» (RE0049): сводка НКЛ — три экземпляра виджета
// TrancheNrlSummaryTile показывают параметры РОДИТЕЛЬСКОГО договора займа, не
// транша; «Валюта транша» — виджет TrancheLoanLimitsTile на данных транша, окно
// правки TrancheLoanLimitsModal сохраняет и перерисовывает тайл. Погашение
// (RE0049, Э6): меню ⋮ шапки → окно RepaymentModal → «Подтвердить» — repaidAt
// уезжает в ProductTreeStore, в шапке сабхедер и пункт «Отменить погашение».
// Значения сверяются с сторами и MOCK_TRANCHE, как и рисует страница, — состав,
// а не факт отрисовки. Гонять с --query: без параметров (каркас: первый транш
// первой сделки, где он есть), id=1024 · id=1027 · id=1028 (каркасы разных сделок).
// Меню и окно погашения кликаются ПРЯМЫМИ кликами element.click(): исполнитель
// панели пропускает цели, которые ui.js пометил data-pp-own (известный дефект
// releasePage, обход — как в HomeDashboard.scenario.mjs).
export default async (page) => {
  const d = page.document;
  const w = page.window;
  await page.wait(400);

  const tiles = {
    counterparty: d.getElementById('tile-tr-nrl-counterparty'),
    balance: d.getElementById('tile-tr-nrl-balance'),
    limit: d.getElementById('tile-tr-nrl-limit')
  };
  const val = (tile, key) => {
    const el = tile && tile.querySelector('[data-trnrl="' + key + '"]');
    return el ? el.textContent : null;
  };

  page.step('сводка НКЛ: три тайла-варианта на месте');
  page.check(!!tiles.counterparty && tiles.counterparty.getAttribute('data-variant') === 'counterparty', 'первый тайл — вариант counterparty');
  page.check(!!tiles.balance && tiles.balance.getAttribute('data-variant') === 'balance', 'второй тайл — вариант balance');
  page.check(!!tiles.limit && tiles.limit.getAttribute('data-variant') === 'limit', 'третий тайл — вариант limit');
  page.check(!!tiles.counterparty.classList.contains('tile--headless') && !tiles.counterparty.querySelector('.tile__header'), 'тайлы хедлесс: шапки нет');
  page.check(!!d.querySelector('.tr-sum[data-off-grid]'), 'ряд сводки вне сетки (.tr-sum с data-off-grid)');

  page.step('значения — от родительской НКЛ (LoanAgreementStore), не от транша');
  const LAS = w.LoanAgreementStore;
  page.check(!!LAS && !!LAS.get(), 'запись договора открыта по контексту');
  const rec = LAS.get();
  const cp = LAS.counterparty();
  const bc = rec.balanceCurrency;
  page.check(!!cp && !!bc, 'у договора есть контрагент и раздел «Баланс и валюта»');

  page.check(val(tiles.counterparty, 'name') === cp.name, 'наименование — из записи контрагента договора: ' + cp.name);
  const chip = tiles.counterparty.querySelector('[data-trnrl="metric"] [data-riskmetric]');
  page.check(!!chip, 'риск-метрика смонтирована (data-riskmetric)');
  if (cp.risk) {
    page.check(chip.getAttribute('data-risk') === String(cp.risk.rating), 'рейтинг чипа — из поля risk записи: ' + cp.risk.rating);
    page.check(!!chip.querySelector('.chip'), 'чип риск-метрики собран рантаймом');
  } else {
    page.check(!chip.getAttribute('data-zone'), 'рейтинг не рассчитан: чип без зоны');
  }

  const labels = w.LOAN_BALANCE_LABELS || {};
  page.check(val(tiles.balance, 'balanceCode') === (labels[bc.balanceCode] || bc.balanceCode), 'баланс — из раздела balanceCurrency: ' + bc.balanceCode);
  page.check(val(tiles.balance, 'currencyCode') === bc.currencyCode, 'валюта — из раздела balanceCurrency: ' + bc.currencyCode);
  page.check(/\d/.test(val(tiles.limit, 'totalLimitAmount') || ''), 'сумма лимита отрисована с разрядами: ' + val(tiles.limit, 'totalLimitAmount'));
  page.check(val(tiles.limit, 'currencyCode') === bc.currencyCode, 'аффикс суммы — код валюты из раздела balanceCurrency');
  page.check(/\u00a0/.test(val(tiles.limit, 'totalLimitAmount') || ''), 'разряды суммы — неразрывным пробелом');

  page.step('«Валюта транша»: тайл на данных транша, окно правки');
  const limitTile = d.getElementById('tile-tr-loan-limits');
  page.check(!!limitTile && limitTile.getAttribute('data-mode') === 'edit', 'тайл «Валюта транша» на месте, режим правки');
  const tl = (key) => {
    const el = limitTile && limitTile.querySelector('[data-tl-field="' + key + '"]');
    return el ? el.textContent : null;
  };
  page.check(tl('currencyCode') === w.MOCK_TRANCHE.currencyCode, 'валюта — из данных транша: ' + w.MOCK_TRANCHE.currencyCode);
  page.check(/\d/.test(tl('totalLimitAmount') || ''), 'сумма лимита отрисована: ' + tl('totalLimitAmount'));
  const affix = limitTile.querySelector('.rof__affix');
  page.check(!!affix && affix.textContent === w.MOCK_TRANCHE.currencyCode, 'аффикс суммы — код валюты транша');

  const scrim = d.getElementById('tl-scrim');
  page.check(!!scrim && !!scrim.querySelector('.modal.modal--w3'), 'окно правки на месте, ширина три колонки (modal--w3)');
  page.check(!!scrim && !scrim.querySelector('.inp__postfix'), 'у суммы в окне нет постфикса валюты');

  page.step('окно сохраняет: тайл перерисовывается новыми значениями');
  const curInput = d.getElementById('tl-currency');
  const amtInput = d.getElementById('tl-limit');
  page.check(!!curInput && !!amtInput, 'поля «Валюта» и «Сумма лимита» в окне есть');
  curInput.value = 'USD';
  amtInput.value = '2 500 000,00';
  d.querySelector('[data-tl-save]').click();
  page.check(tl('currencyCode') === 'USD', 'валюта тайла после сохранения — USD');
  page.check(/2\u00a0500\u00a0000,00/.test(tl('totalLimitAmount') || ''), 'сумма тайла после сохранения — 2 500 000,00: ' + tl('totalLimitAmount'));
  page.check(limitTile.querySelector('.rof__affix').textContent === 'USD', 'аффикс суммы обновился на USD');

  page.step('ЕТС и «Техническая информация» — общие виджеты на данных транша');
  const etsTile = d.getElementById('tile-tr-transfer-rate');
  page.check(!!etsTile && etsTile.getAttribute('data-state') === 'data', 'ЕТС на месте, состояние data');
  const etsVal = etsTile.querySelector('[data-ets-field="percent"]');
  page.check(!!etsVal && etsVal.textContent.replace(',', '.') === String(w.MOCK_TRANCHE.fixedRatePercent) + '%',
    'ставка ЕТС — из данных транша: ' + (etsVal && etsVal.textContent));

  const techTile = d.getElementById('tile-tr-loan-external-data');
  page.check(!!techTile && techTile.getAttribute('data-consumer') === 'tranche', 'Техинфа — потребитель tranche');
  const techVal = (key) => {
    const el = techTile.querySelector('[data-tech-field="' + key + '"]');
    return el ? el.textContent : null;
  };
  page.check(techVal('gfoId') === w.MOCK_TRANCHE.gfoId, 'ГФО ID — из данных транша');
  page.check(techVal('crmProductId') === w.MOCK_TRANCHE.crmProductId, 'CRM ID продукта показан у транша: ' + techVal('crmProductId'));

  page.step('окно Техинфы у транша: три поля, правка живёт в сессии страницы');
  const techScrim = d.getElementById('tech-scrim');
  const crmWrap = techScrim.querySelector('[data-tech-consumer="tranche"]');
  page.check(crmWrap && crmWrap.hidden === false, 'поле «CRM ID продукта» в окне показано (потребитель tranche)');
  const crmInput = techScrim.querySelector('[name="crmProductId"]');
  page.check(crmInput.value === w.MOCK_TRANCHE.crmProductId, 'окно заполнилось данными транша, а не стора НКЛ');
  crmInput.value = 'CRM-NEW-1';
  techScrim.querySelector('[data-tech-save]').click();
  page.check(techVal('crmProductId') === 'CRM-NEW-1', 'после сохранения тайл перерисовался: CRM-NEW-1');
  const nklTech = w.LoanAgreementStore && w.LoanAgreementStore.get() && w.LoanAgreementStore.get().techInfo;
  page.check(!nklTech || !nklTech.crmProductId || nklTech.crmProductId !== 'CRM-NEW-1',
    'правка транша не утекла в стор НКЛ');

  page.step('«Договор и дополнительные соглашения»: вариант tranche на данных транша');
  const contractTile = d.getElementById('tile-tr-contract');
  page.check(!!contractTile && contractTile.getAttribute('data-variant') === 'tranche', 'вариант тайла — tranche');
  page.check(!!contractTile && contractTile.getAttribute('data-state') === 'data' && contractTile.getAttribute('data-mode') === 'edit',
    'тайл заполнен, режим правки');
  const cf = (key) => {
    const el = contractTile && contractTile.querySelector('[data-contract-field="' + key + '"]');
    return el ? el.textContent : null;
  };
  const c = w.MOCK_TRANCHE.contract;
  const dmy = (iso) => { const p = String(iso).split('-'); return p[2] + '.' + p[1] + '.' + p[0]; };
  page.check(cf('contractNumber') === c.contractNumber, 'номер договора — из MOCK_TRANCHE.contract: ' + c.contractNumber);
  page.check(cf('contractSignDate') === dmy(c.contractSignDate), 'дата подписания — ДД.ММ.ГГГГ: ' + cf('contractSignDate'));
  page.check(cf('plannedRepaymentDate') === dmy(c.plannedRepaymentDate), 'плановая дата погашения — из данных транша');
  page.check(cf('lastAgreementNumber') === c.lastAmendmentNumber, 'номер последнего ДС — из lastAmendmentNumber: ' + c.lastAmendmentNumber);
  page.check(cf('lastAgreementSignDate') === dmy(c.lastAmendmentSignDate), 'дата подписания ДС — из lastAmendmentSignDate');

  page.step('окно «Договор»: скрим на месте, правка — в сессии страницы, не в сторе НКЛ');
  const contractScrim = d.getElementById('contract-scrim');
  page.check(!!contractScrim, 'окно «Договор» вшито (contract-scrim)');
  const numInput = contractScrim.querySelector('.inp__control[name="contractNumber"]');
  page.check(numInput.value === c.contractNumber, 'окно заполнилось данными транша, а не стора НКЛ');
  numInput.value = 'TR-0001';
  contractScrim.querySelector('[data-contract-save]').click();
  page.check(cf('contractNumber') === 'TR-0001', 'после сохранения тайл перерисовался: TR-0001');
  const nklContract = w.LoanAgreementStore && w.LoanAgreementStore.get() && w.LoanAgreementStore.get().contract;
  page.check(!nklContract || nklContract.contractNumber !== 'TR-0001', 'правка транша не утекла в стор НКЛ');

  page.step('погашение транша (RE0049 Э6): меню ⋮ шапки, окно, запись в стор');
  const trees = w.ProductTreeStore;
  const firstTrancheId = (function find(list) {
    for (const v of list) {
      if (v.kind === 'TRANCHE') return v.id;
      const hit = find(v.children || []);
      if (hit) return hit;
    }
    return null;
  })(trees.view());
  page.check(!!firstTrancheId, 'в дереве сделки есть транш: ' + firstTrancheId);
  const menuBtn = d.querySelector('.phead [data-menu="tr-head-menu"]');
  page.check(!!menuBtn, 'кнопка «…» в шапке с меню tr-head-menu');
  const before = trees.node(firstTrancheId);
  page.check(before.kind === 'TRANCHE' && before.menu.some((m) => m.action === 'REPAY'), 'у узла транша в сторе есть пункт REPAY');
  /* сделка может быть нередактируемой (статус из READ_ONLY_STATUSES) — тогда
     пункт выключен разметкой и окна нет (урок Л267; каркас без --query — 1024,
     «Активная»). Полный ход — на редактируемой сделке (id=1027 · 1028 · 1026). */
  const deal = w.DealsStore.byId(String(trees.dealId()));
  const editable = w.DealsStore.isEditable(deal);
  menuBtn.click();
  await page.wait(30);
  if (!editable) {
    const item = d.querySelector('[data-tr-act="REPAY"]');
    page.check(!!item && item.getAttribute('aria-disabled') === 'true',
      'сделка нередактируемая («' + deal.status + '»): «Погасить» выключен разметкой');
    return;
  }
  const repayItem = d.querySelector('[data-tr-act="REPAY"]');
  page.check(!!repayItem && repayItem.getAttribute('aria-disabled') !== 'true', 'в меню есть доступное «Погасить»');
  page.check(!d.querySelector('[data-tr-act="DELETE"]'), '«Удалить» в меню шапки нет (фильтр как у НКЛ)');
  repayItem.click();
  await page.wait(60);
  const rs = d.getElementById('ptree-repay-scrim');
  page.check(!!rs && !rs.hidden, '«Погасить» открыло окно погашения');
  const repayText = rs.querySelector('.lc-repay__text');
  page.check(!!repayText && repayText.textContent === 'Погашение транша ' + before.number + ' ' + before.name,
    'текстовка окна — «Погашение транша N Имя»: ' + (repayText ? repayText.textContent : '—'));
  const dateInput = rs.querySelector('.lc-repay__date .inp__control');
  const repayDmy = dateInput.value;
  page.check(/^\d{2}\.\d{2}\.\d{4}$/.test(repayDmy), 'дата фактического погашения — по умолчанию сегодня: ' + repayDmy);
  const isoOf = (v) => { const q = v.split('.'); return q[2] + '-' + q[1] + '-' + q[0]; };
  rs.querySelector('[data-repay-ok]').click();
  await page.wait(80);
  const after = trees.node(firstTrancheId);
  page.check(!!after.repaidAt && after.repaidAt === isoOf(repayDmy),
    'repaidAt записан в ProductTreeStore (не в сессию страницы): ' + after.repaidAt);
  page.check(before.kind === 'TRANCHE' && (!before.children || before.children.length === 0),
    'транш — узел без вложенных (гашение вложенных у транша не даёт дочерних записей)');
  const parent = trees.path(firstTrancheId);
  page.check(!!parent && parent[2].repaidAt === null, 'родительский инструмент не погашен заодно: ' + (parent ? parent[2].repaidAt : '—'));

  page.step('погашенный транш: сабхедер в шапке, в меню «Отменить погашение»');
  const sub = d.getElementById('tr-subtitle');
  page.check(!!sub && sub.hidden === false, 'сабхедер шапки показан');
  const subText = d.getElementById('tr-subtitle-text');
  page.check(!!subText && subText.textContent === 'Дата фактического погашения ' + repayDmy,
    'текст сабхедера — по строке статуса дерева: ' + (subText ? subText.textContent : '—'));
  page.check(!!sub && !!sub.querySelector('[data-icon="check-circle-filled"], i[data-icon="check-circle-filled"]'),
    'в сабхедере иконка check-circle-filled');
  menuBtn.click();
  await page.wait(30);
  page.check(!d.querySelector('[data-tr-act="REPAY"]'), 'у погашенного транша пункта «Погасить» нет');
  const undoItem = d.querySelector('[data-tr-act="UNDO_REPAY"]');
  page.check(!!undoItem, 'у погашенного транша пункт «Отменить погашение»');

  page.step('отмена погашения: окно, запись в стор, сабхедер скрыт');
  undoItem.click();
  await page.wait(60);
  const rs2 = d.getElementById('ptree-repay-scrim');
  page.check(!!rs2 && !rs2.hidden, '«Отменить погашение» открыло окно');
  const undoText = rs2.querySelector('.lc-repay__text');
  page.check(!!undoText && undoText.textContent === 'Отмена погашения транша ' + before.number + ' ' + before.name,
    'текстовка отмены — «Отмена погашения транша N Имя»: ' + (undoText ? undoText.textContent : '—'));
  rs2.querySelector('[data-repay-ok]').click();
  await page.wait(80);
  const cleared = trees.node(firstTrancheId);
  page.check(!cleared.repaidAt, 'после отмены repaidAt в сторе снят');
  const sub2 = d.getElementById('tr-subtitle');
  page.check(!!sub2 && sub2.hidden === true, 'сабхедер после отмены скрыт');
  menuBtn.click();
  await page.wait(30);
  page.check(!!d.querySelector('[data-tr-act="REPAY"]'), 'в меню снова «Погасить»');
};
