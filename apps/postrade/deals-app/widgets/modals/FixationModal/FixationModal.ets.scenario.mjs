// ЕТС в окне «Фиксация ЭПС/ВБС» (RE0033 Э7) на странице «Финансовые метрики».
// Гонять: node .agents/tools/page-run.mjs apps/postrade/deals-app/pages/FinancialMetrics.preview.html \
//   --scenario apps/postrade/deals-app/widgets/modals/FixationModal/FixationModal.ets.scenario.mjs --query "id=1027&fmEts=<slow|failed|empty|multiple>" --no-flows
// Без fmEts — обычное значение ЕТС и ручной ввод не предлагается.
export default async (page) => {
  const d = page.document;
  const w = page.window;
  const q = new URLSearchParams(w.location.search);
  const mode = q.get('fmEts') || 'ok';
  const $ = (s) => d.getElementById(s);
  const scrim = () => $('fm-fix-scrim');
  const cards = () => [...scrim().querySelectorAll('[data-fx-card]')];
  const type = (el, value, ev = 'input') => { el.value = value; el.dispatchEvent(new w.Event(ev, { bubbles: true })); };
  const pick = (card, name, label) => type(card.querySelector('[data-fx-field="' + name + '"] .inp__control'), label, 'change');
  const date = (card, v) => type(card.querySelector('[data-fx-field="date"] .inp__control'), v);
  const val = (card, key) => card.querySelector('[data-fx-val="' + key + '"]').textContent;
  const alertBox = () => scrim().querySelector('[data-fix-alert]');
  const names = w.FinInstrumentsStore.view().map((c) => c.name);
  const iconTip = (card) => {
    const i = card.querySelector('[data-fx-ets-icon] [data-tooltip]');
    return i ? i.getAttribute('data-tooltip') : null;
  };
  const pencil = (card) => card.querySelector('[data-fx-ets-pencil]');
  const confirm = (card) => card.querySelector('[data-fx-ets-ok]');
  const etsInput = (card) => card.querySelector('[data-fx-ets-input] .inp__control');
  await page.wait(400);

  await page.click('#fm-fixation');
  let c = cards()[0];
  pick(c, 'fi', names[0]);
  pick(c, 'type', 'Несущественная');
  date(c, '01.01.2030');

  if (mode === 'slow') {
    page.step('загрузка ЕТС: скелетоны, «Сохранить» отвечает алертом');
    await page.wait(300);
    page.check(c.getAttribute('data-fx-ets') === 'loading', 'состояние загрузки');
    page.check(scrim().querySelector('[data-fx-block="ets"]').getAttribute('aria-busy') === 'true', 'блок ЕТС aria-busy');
    page.check(pencil(c).disabled, 'карандаш выключен');
    await page.click('[data-fix-save]');
    page.check(!scrim().hidden, 'окно осталось открытым');
    page.check(!alertBox().hidden && /Фиксация не может быть выполнена/.test(alertBox().textContent)
      && /Выполняется расчет значения ЕТС/.test(alertBox().textContent), 'алерт: ' + alertBox().textContent.trim().replace(/\s+/g, ' '));
    pick(c, 'type', 'Первоначальная');
    page.check(alertBox().hidden, 'смена типа на «Первоначальная» гасит алерт загрузки ЕТС');
    pick(c, 'type', 'Несущественная');
    date(c, '01.01.2030');
    await page.wait(8200);
    page.check(c.getAttribute('data-fx-ets') === 'ok', 'после загрузки — значение: ' + val(c, 'etsRate'));
    page.check(alertBox().hidden, 'алерт загрузки погас сам');
    return;
  }

  await page.wait(900);

  if (mode === 'ok') {
    page.step('обычная ЕТС: значение и Δ, карандаша нет');
    page.check(c.getAttribute('data-fx-ets') === 'ok' && /\d,\d\d/.test(val(c, 'etsRate')), 'значение ' + val(c, 'etsRate'));
    page.check(!iconTip(c) && pencil(c).disabled, 'иконки и карандаша нет');
    return;
  }

  if (mode === 'empty' || mode === 'failed') {
    const tip = mode === 'empty' ? 'Значение ЕТС отсутствует или равно 0' : 'Ошибка расчета ЕТС';
    page.step(mode === 'empty' ? 'ЕТС нет или 0: прочерк, жёлтая иконка, карандаш' : 'ошибка расчёта ЕТС: прочерк, красная иконка, карандаш');
    page.check(val(c, 'etsRate') === '—' && val(c, 'etsDelta') === '—', 'значения — прочерк');
    page.check(iconTip(c) === tip, 'тултип иконки: ' + iconTip(c));
    const icon = c.querySelector('[data-fx-ets-icon] .rof__icon');
    page.check(mode === 'empty' ? icon.classList.contains('rof__icon--warning') : icon.classList.contains('lc-fixtile__ets-icon--error'), 'цвет иконки по статусу');
    page.check(!pencil(c).disabled, 'карандаш доступен');
    page.step('сохранение не блокируется');
    const before = w.FinMetricsStore.fixations().length;
    await page.click('[data-fix-save]');
    page.check(scrim().hidden, 'окно закрыто');
    await page.wait(1700);
    page.check(w.FinMetricsStore.fixations().length === before + 1, 'фиксация появилась');
    return;
  }

  /* multiple */
  page.step('разные ЕТС: до попытки сохранить — прочерк без иконки и карандаша');
  page.check(val(c, 'etsRate') === '—' && !iconTip(c) && pencil(c).disabled, 'иконки и карандаша ещё нет');

  page.step('«Сохранить»: алерт, красная иконка с значениями, карандаш');
  await page.click('[data-fix-save]');
  page.check(!scrim().hidden, 'окно осталось открытым');
  page.check(!alertBox().hidden && /не совпадают значения ЕТС/.test(alertBox().textContent), 'алерт: ' + alertBox().textContent.trim().replace(/\s+/g, ' ').slice(0, 80));
  page.check(/14%, 22,5%, 22,5%/.test(iconTip(c) || ''), 'тултип: ' + iconTip(c));
  page.check(!pencil(c).disabled, 'карандаш доступен');

  page.step('смена типа на «Первоначальная» гасит алерт разных ЕТС');
  pick(c, 'type', 'Первоначальная');
  page.check(alertBox().hidden, 'алерт скрыт, иконки нет: ' + String(iconTip(c)));
  pick(c, 'type', 'Несущественная');
  date(c, '01.01.2031');
  await page.wait(900);
  await page.click('[data-fix-save]');
  page.check(!alertBox().hidden && !!iconTip(c), 'алерт и иконка вернулись после нового «Сохранить»');

  page.step('ручной ввод: карандаш → поле → галочка');
  await page.click('[data-fx-ets-pencil]');
  page.check(c.getAttribute('data-fx-ets-edit') === 'true' && !etsInput(c).disabled, 'поле ввода открыто');
  page.check(pencil(c).disabled && !confirm(c).disabled, 'вместо карандаша — галочка');
  type(etsInput(c), '');
  await page.click('[data-fx-ets-ok]');
  page.check(c.getAttribute('data-fx-ets-edit') === 'false' && val(c, 'etsRate') === '—', 'пустое значение — возврат к прежнему виду');
  await page.click('[data-fx-ets-pencil]');
  type(etsInput(c), 'abc');
  await page.click('[data-fx-ets-ok]');
  page.check(c.getAttribute('data-fx-ets-edit') === 'true' && etsInput(c).closest('.inp').classList.contains('inp--error'), 'не число — ошибка поля, ввод остался');
  type(etsInput(c), '18,5');
  await page.click('[data-fx-ets-ok]');
  page.check(c.getAttribute('data-fx-ets') === 'manual' && c.getAttribute('data-fx-ets-edit') === 'false', 'значение подставлено, поле скрыто');
  page.check(/18,50/.test(val(c, 'etsRate')), 'ЕТС: ' + val(c, 'etsRate'));
  page.check(/\d/.test(val(c, 'etsDelta')) && val(c, 'etsDelta') !== '—', 'Δ ЕТС пересчитана: ' + val(c, 'etsDelta'));
  page.check(!iconTip(c) && !pencil(c).disabled, 'иконка скрыта, карандаш остался');
  page.check(alertBox().hidden, 'алерт скрыт');

  page.step('сохранение с ручной ЕТС уходит в историю');
  const before = w.FinMetricsStore.fixations().length;
  await page.click('[data-fix-save]');
  page.check(scrim().hidden, 'окно закрыто');
  await page.wait(1700);
  const list = w.FinMetricsStore.fixations();
  page.check(list.length === before + 1, 'фиксация появилась');
  const added = list.filter((f) => f.etsRate === 18.5);
  page.check(added.length === 1, 'в строке истории ЕТС 18,5');

  page.step('предварительный расчёт при разных ЕТС: алерта нет, иконка и карандаш есть');
  await page.click('#fm-fixation');
  c = cards()[0];
  pick(c, 'fi', names[1] || names[0]);
  date(c, '01.01.2033');
  await page.wait(900);
  c.querySelector('[data-fx-prelim-run]').click();
  await page.wait(1800);
  page.check(c.getAttribute('data-fx-prelim') === 'done', 'расчёт выполнен');
  page.check(alertBox().hidden, 'алерта нет');
  page.check(!!iconTip(c) && !pencil(c).disabled, 'иконка и карандаш появились');
};
