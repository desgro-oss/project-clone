// Правила и подтверждение окна «Фиксация ЭПС/ВБС» (RE0033 Э6). Сделка 1027: у ФИ с индексом 2
// первоначальной фиксации нет. Гонять с --query "id=1027".
export default async (page) => {
  const d = page.document;
  const w = page.window;
  const $ = (s) => d.getElementById(s);
  const scrim = () => $('fm-fix-scrim');
  const confirm = () => $('fm-fix-confirm-scrim');
  const cards = () => [...scrim().querySelectorAll('[data-fx-card]')];
  const type = (el, value, ev = 'input') => { el.value = value; el.dispatchEvent(new w.Event(ev, { bubbles: true })); };
  const pick = (card, name, label) => type(card.querySelector('[data-fx-field="' + name + '"] .inp__control'), label, 'change');
  const date = (card, v) => type(card.querySelector('[data-fx-field="date"] .inp__control'), v);
  const cand = w.FinMetricsStore.fixationCandidates();
  const noInit = cand.filter((c) => !c.hasInitial)[0];
  const hasInit = cand.filter((c) => c.hasInitial)[0];
  page.check(!!noInit && !!hasInit, 'в сделке есть ФИ с первоначальной фиксацией и без неё');
  await page.wait(400);

  page.step('ФИ без первоначальной: предварительный расчёт — алерт с причиной');
  await page.click('#fm-fixation');
  let c = cards()[0];
  pick(c, 'fi', noInit.name);
  date(c, '01.01.2030');
  c.querySelector('[data-fx-prelim-run]').click();
  await page.wait(1800);
  const al = scrim().querySelector('[data-fix-alert]');
  page.check(!al.hidden && /Предварительный расчет не выполнен/.test(al.textContent) && /первоначальная фиксация/.test(al.textContent), 'алерт: ' + al.textContent.trim().replace(/\s+/g, ' '));
  page.check(c.getAttribute('data-fx-prelim') === 'idle', 'карточка вернулась в idle');

  page.step('«Существенная» без первоначальной: сохранение не проходит, окно остаётся');
  pick(c, 'type', 'Существенная');
  await page.click('[data-fix-save]');
  page.check(!scrim().hidden, 'окно открыто');
  page.check(page.text('body').indexOf('Измените тип модификации на "Первоначальная"') !== -1, 'снек подсказывает «Первоначальная»');

  page.step('«Первоначальная» проходит: окно закрывается, фиксация появляется');
  const before = w.FinMetricsStore.fixations().length;
  pick(c, 'type', 'Первоначальная');
  await page.click('[data-fix-save]');
  page.check(scrim().hidden, 'окно закрыто');
  await page.wait(1700);
  page.check(w.FinMetricsStore.fixations().length === before + 1, 'фиксаций стало ' + w.FinMetricsStore.fixations().length);
  page.check(w.FinMetricsStore.fixationCandidates().filter((x) => x.id === noInit.id)[0].hasInitial, 'у ФИ теперь есть первоначальная');
  const badge = $('fm-fixations-badge');
  page.check(!badge.hidden && Number(badge.textContent) === before + 1, 'бейдж вкладки: ' + badge.textContent);

  page.step('«Первоначальная» повторно: ошибка правила');
  await page.click('#fm-fixation');
  c = cards()[0];
  pick(c, 'fi', noInit.name);
  pick(c, 'type', 'Первоначальная');
  await page.click('[data-fix-save]');
  page.check(!scrim().hidden, 'окно осталось открытым');
  page.check(page.text('body').indexOf('уже рассчитана первоначальная фиксация') !== -1, 'снек: уже рассчитана первоначальная');
  scrim().querySelector('[data-modal-close]').click();
  page.check(scrim().hidden, 'крестик закрыл окно без сохранения');

  page.step('сохранение до конца предварительного расчёта — подтверждение');
  await page.click('#fm-fixation');
  c = cards()[0];
  pick(c, 'fi', hasInit.name);
  pick(c, 'type', 'Несущественная');
  date(c, '02.02.2032');
  c.querySelector('[data-fx-prelim-run]').click();
  await page.wait(800);   // ЕТС уже посчитан (600 мс), предрасчёт ещё идёт (1500 мс)
  page.check(c.getAttribute('data-fx-prelim') === 'busy', 'расчёт идёт');
  const n = w.FinMetricsStore.fixations().length;
  await page.click('[data-fix-save]');
  page.check(!confirm().hidden && !scrim().hidden, 'поверх окна — подтверждение');
  confirm().querySelector('[data-modal-close][class*="btn"]').click();
  page.check(confirm().hidden && !scrim().hidden, '«Отменить» закрыло подтверждение, окно на месте');
  await page.click('[data-fix-save]');
  page.check(!confirm().hidden, 'подтверждение снова');
  await page.click('[data-fix-confirm-ok]');
  page.check(confirm().hidden && scrim().hidden, '«Подтвердить»: оба окна закрыты');
  await page.wait(1700);
  page.check(w.FinMetricsStore.fixations().length === n + 1, 'фиксация сохранена без результата расчёта');
};
