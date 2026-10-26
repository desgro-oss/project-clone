// Сценарий окна «Фиксация ЭПС/ВБС» (RE0033 Э6) на странице «Финансовые метрики».
// Гонять: node .agents/tools/page-run.mjs apps/postrade/deals-app/pages/FinancialMetrics.preview.html \
//   --scenario apps/postrade/deals-app/widgets/modals/FixationModal/FixationModal.scenario.mjs --query "id=1027"
// Сделка 1027: у FI-1027-1 и FI-1027-2 есть первоначальная фиксация (последняя у -1 — 30.06.2025),
// у FI-1027-3 первоначальной нет. Сценарии стора: &fmFix=prefail · &fmFix=fail.
export default async (page) => {
  const d = page.document;
  const w = page.window;
  const q = new URLSearchParams(w.location.search);
  const fail = q.get('fmFix');
  const $ = (s) => d.getElementById(s);
  const scrim = () => $('fm-fix-scrim');
  const cards = () => [...scrim().querySelectorAll('[data-fx-card]')];
  const type = (el, value, ev = 'input') => { el.value = value; el.dispatchEvent(new w.Event(ev, { bubbles: true })); };
  const pick = (card, name, label) => {
    const c = card.querySelector('[data-fx-field="' + name + '"] .inp__control');
    type(c, label, 'change');
  };
  const date = (card, v) => type(card.querySelector('[data-fx-field="date"] .inp__control'), v);
  const val = (card, key) => card.querySelector('[data-fx-val="' + key + '"]').textContent;
  const names = w.FinInstrumentsStore.view().map((c) => c.name);
  await page.wait(400);

  page.step('открытие: одна пустая карточка, недоступное выключено (Л235)');
  page.check(scrim().hidden, 'окно скрыто до клика');
  await page.click('#fm-fixation');
  page.check(!scrim().hidden, 'окно открыто');
  page.check(cards().length === 1, 'одна карточка: ' + cards().length);
  let c1 = cards()[0];
  page.check(c1.querySelector('[data-fx-remove]').disabled, '«⊖» выключена, пока карточка одна');
  page.check(c1.querySelector('[data-fx-prelim-run]').disabled, 'предварительный расчёт выключен без ФИ и даты');
  page.check(!scrim().querySelector('[data-fix-save]').disabled, '«Сохранить» активна');
  page.check(scrim().querySelector('[data-fix-alert]').hidden, 'алерт скрыт');
  page.check(val(c1, 'etsRate') === '—' && val(c1, 'nonGca') === '—', 'значения — прочерк');

  page.step('ФИ и дата → предварительный расчёт доступен, ВБС до фиксации и ЕТС подтянулись');
  pick(c1, 'fi', names[0]);
  page.check(c1.querySelector('[data-fx-prelim-run]').disabled, 'только ФИ — расчёт ещё недоступен');
  date(c1, '01.01.2030');
  page.check(!c1.querySelector('[data-fx-prelim-run]').disabled, 'ФИ + дата — расчёт доступен');
  await page.wait(900);
  page.check(val(c1, 'gcaBefore') !== '—', 'ВБС до фиксации: ' + val(c1, 'gcaBefore'));
  page.check(/\d,\d\d/.test(val(c1, 'etsRate')) && !c1.querySelector('[data-fx-aff="etsRate"]').hidden, 'ЕТС: ' + val(c1, 'etsRate') + ' %');

  page.step('предварительный расчёт: лоадер, затем чип «Расчет выполнен»');
  const run = c1.querySelector('[data-fx-prelim-run]');
  run.click();
  await page.wait(50);
  page.check(c1.getAttribute('data-fx-prelim') === 'busy' && run.disabled && run.classList.contains('btn--loading'), 'идёт расчёт: кнопка с лоадером и disabled');
  await page.wait(1800);
  if (fail === 'prefail') {
    page.check(c1.getAttribute('data-fx-prelim') === 'idle', 'расчёт упал: карточка вернулась в idle');
    const al = scrim().querySelector('[data-fix-alert]');
    page.check(!al.hidden && /Предварительный расчет не выполнен/.test(al.textContent), 'алерт: ' + al.textContent.trim().replace(/\s+/g, ' '));
    return;
  }
  page.check(c1.getAttribute('data-fx-prelim') === 'done', 'расчёт выполнен');
  page.check(!c1.querySelector('[data-fx-prelim-done]').hidden && run.disabled, 'чип виден, кнопка выключена');
  page.check(val(c1, 'nonGca') !== '—' && val(c1, 'subEir') !== '—', 'блоки заполнены: ' + val(c1, 'nonGca') + ' / ' + val(c1, 'subEir'));

  page.step('сброс даты сбрасывает предварительный расчёт, тип и комментарий остаются');
  pick(c1, 'type', 'Несущественная');
  type(c1.querySelector('[data-fx-field="comment"] .inp__control'), 'Перенос даты');
  date(c1, '');
  page.check(c1.getAttribute('data-fx-prelim') === 'idle' && val(c1, 'nonGca') === '—', 'расчёт сброшен');
  page.check(c1.querySelector('[data-fx-field="type"] .inp__control').value === 'Несущественная', 'тип остался');
  page.check(c1.querySelector('[data-fx-field="comment"] .inp__control').value === 'Перенос даты', 'комментарий остался');
  date(c1, '01.01.2030');

  page.step('«Первоначальная»: дата очищена и заблокирована, расчёт выключен');
  pick(c1, 'type', 'Первоначальная');
  const dc = c1.querySelector('[data-fx-field="date"] .inp__control');
  page.check(dc.value === '' && dc.disabled, 'дата очищена и disabled');
  page.check(c1.querySelector('[data-fx-field="date"] .inp__act[aria-label="Открыть календарь"]').disabled, 'календарь выключен');
  page.check(c1.querySelector('[data-fx-prelim-run]').disabled, 'предварительный расчёт выключен');
  pick(c1, 'type', 'Существенная');
  page.check(!dc.disabled, 'при другом типе дата снова доступна');

  page.step('добавление карточек, «⊖» и повтор ФИ');
  await page.click('[data-fix-add]');
  page.check(cards().length === 2 && !cards()[0].querySelector('[data-fx-remove]').disabled, 'две карточки, «⊖» активна');
  const c2 = cards()[1];
  pick(c2, 'fi', names[0]);
  page.check(c2.querySelector('[data-fx-field="fi"]').classList.contains('inp--error'), 'тот же ФИ — ошибка у второй карточки');
  pick(c2, 'fi', names[1]);
  page.check(!c2.querySelector('[data-fx-field="fi"]').classList.contains('inp--error'), 'другой ФИ — ошибка снята');
  pick(c2, 'fi', names[0]);
  cards()[1].querySelector('[data-fx-remove]').click();
  page.check(cards().length === 1 && cards()[0].querySelector('[data-fx-remove]').disabled, 'карточка удалена, «⊖» снова выключена');

  page.step('валидация обязательных полей');
  await page.click('[data-fix-add]');
  const c3 = cards()[1];
  await page.click('[data-fix-save]');
  page.check(!scrim().hidden, 'окно не закрылось');
  const errs = [...scrim().querySelectorAll('.inp--error')].map((e) => e.getAttribute('data-fx-field'));
  page.check(errs.includes('fi') && errs.includes('date') && errs.includes('type'), 'ошибки полей у пустой карточки: ' + errs.join(','));
  c3.querySelector('[data-fx-remove]').click();

  page.step('правила стора: дата не позже последней фиксации ФИ');
  const last = w.FinMetricsStore.fixationCandidates().filter((c) => c.name === names[0])[0].lastDate;
  pick(cards()[0], 'type', 'Несущественная');
  date(cards()[0], '01.01.2020');
  await page.click('[data-fix-save]');
  page.check(!scrim().hidden, 'окно осталось открытым (последняя фиксация ' + last + ')');

  page.step('сохранение: окно закрывается, тост «запущен», строка в истории по ответу');
  const before = w.FinMetricsStore.fixations().length;
  date(cards()[0], '01.01.2031');
  await page.wait(900);   // пока ЕТС считается, «Сохранить» отвечает алертом (Э7)
  await page.click('[data-fix-save]');
  page.check(scrim().hidden, 'окно закрыто');
  await page.wait(1700);
  const after = w.FinMetricsStore.fixations().length;
  if (fail === 'fail') page.check(after === before, 'сценарий fail: фиксация не появилась');
  else page.check(after === before + 1, 'фиксаций было ' + before + ', стало ' + after);
};
