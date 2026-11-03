// Демо витрины (версия 3.000): фильтры списка фондов — ряд без карточки, поля S, опции из справочников,
// выбор типа и нескольких приоритетов (чекбоксы, сводка), ширина полей по значению, событие fundsfilters:change, подсказка поиска, выключение полей.
// Гонять: node .agents/tools/page-run.mjs apps/local-components/ib/funds-app/FundsFilters.doc.html \
//   --scenario apps/ib/funds-app/widgets/tables/FundsFilters/FundsFilters.kit.scenario.mjs --no-flows
export default async (page) => {
  const d = page.document, w = page.window;
  await page.wait(600);
  const stage = d.getElementById('pg-stage');
  const root = stage && stage.querySelector('.lc-funds-filters');
  page.step('фильтры: разметка и опции');
  page.check(!!root, 'корень .lc-funds-filters на стенде');
  page.check(!!w.FundsFilters, 'скрипт виджета подключён');
  const F = w.FundsFilters;
  F.init(root, { types: w.FUND_TYPE_LABELS, priorities: w.FUND_PRIORITY_LABELS });
  F.setDisabled(root, false);
  const field = (n) => root.querySelector('[data-ff-field="' + n + '"]');
  const typeList = field('typeCodes').querySelector('.ddl') || d.querySelector('.ddl[aria-label="Типы фондов"]');
  const prioList = field('priorityCodes').querySelector('.ddl') || d.querySelector('.ddl[aria-label="Приоритеты фондов"]');
  page.check(!root.classList.contains('tile') && root.getAttribute('role') === 'group', 'ряд без своей карточки (role=group)');
  page.check(field('typeCodes').hasAttribute('data-ff-fit') && field('priorityCodes').hasAttribute('data-ff-fit') && !field('smartSearch').hasAttribute('data-ff-fit'), 'тип и приоритет — по ширине значения, поиск тянется');
  const typeRows = [...typeList.querySelectorAll('.ddl__item[data-code]')];
  page.check(typeRows.length === Object.keys(w.FUND_TYPE_LABELS).length, 'опций типа: ' + typeRows.length);
  page.check(!!typeList.querySelector('.ddl__item--all'), 'строка «Выбрать всё» у типов');
  page.check([...root.querySelectorAll('.inp')].every((i) => i.classList.contains('inp--s') && !i.classList.contains('inp--m')), 'все три поля размера S');
  const prioRows = [...prioList.querySelectorAll('.ddl__item')];
  page.check(prioRows.length === Object.keys(w.FUND_PRIORITY_LABELS).length && prioRows.every((x) => x.classList.contains('ddl__item--checkbox')), 'опции приоритета с чекбоксами: ' + prioRows.length);
  page.check(prioList.getAttribute('aria-multiselectable') === 'true', 'список приоритетов — множественный выбор');

  const events = [];
  root.addEventListener('fundsfilters:change', (e) => events.push(e.detail));

  page.step('выбор типа');
  typeList.querySelector('.ddl__item[data-code="PE"]').click();
  let last = events[events.length - 1];
  page.check(!!last && last.typeCodes.join() === 'PE', 'событие с typeCodes [PE]: ' + JSON.stringify(last));
  const summary = () => field('typeCodes').querySelector('.inp__summary');
  page.check(!!summary() && summary().textContent === 'PE', 'сводка выбранного типа в поле: ' + (summary() && summary().textContent));
  page.check(!field('typeCodes').querySelector('.inp__chips'), 'чипов в поле S нет');
  typeList.querySelector('.ddl__item--all').click();
  last = events[events.length - 1];
  page.check(last.typeCodes.length === 4, '«Выбрать всё» — все типы: ' + last.typeCodes.join(','));
  page.check(summary() && summary().textContent === 'PE, +3', 'сводка «PE, +3»: ' + (summary() && summary().textContent));
  typeList.querySelector('.ddl__item--all').click();
  last = events[events.length - 1];
  page.check(last.typeCodes.length === 0 && !summary(), 'повтор «Выбрать всё» снимает все типы, сводки нет');
  page.check(field('typeCodes').querySelector('.inp__control').placeholder === 'Все типы', 'плейсхолдер «Все типы» вернулся');

  page.step('выбор нескольких приоритетов');
  const prioSum = () => field('priorityCodes').querySelector('.inp__summary');
  prioList.querySelector('.ddl__item[data-code="HIGH"]').click();
  last = events[events.length - 1];
  page.check(last.priorityCodes.join() === 'HIGH', 'событие с priorityCodes [HIGH]: ' + JSON.stringify(last.priorityCodes));
  page.check(!!prioSum() && prioSum().textContent === 'Высокий', 'сводка «Высокий»');
  prioList.querySelector('.ddl__item[data-code="LOW"]').click();
  last = events[events.length - 1];
  page.check(last.priorityCodes.join() === 'HIGH,LOW', 'два приоритета: ' + last.priorityCodes.join());
  page.check(prioSum() && prioSum().textContent === 'Высокий, +1', 'сводка «Высокий, +1»');
  prioList.querySelector('.ddl__item[data-code="HIGH"]').click();
  prioList.querySelector('.ddl__item[data-code="LOW"]').click();
  last = events[events.length - 1];
  page.check(last.priorityCodes.length === 0 && !prioSum(), 'снятые чекбоксы — фильтра нет, сводки нет');
  page.check(field('priorityCodes').querySelector('.inp__control').placeholder === 'Все приоритеты', 'плейсхолдер «Все приоритеты» вернулся');

  page.step('подсказка поиска');
  const info = root.querySelector('[data-ff-tip]');
  const tipId = info && info.getAttribute('aria-describedby');
  const tip = tipId && d.getElementById(tipId);
  page.check(!!tip && tip.classList.contains('tip'), 'информер связан с тултипом через aria-describedby: ' + tipId);
  const tipText = tip ? tip.textContent : '';
  page.check(['Поиск записей осуществляется по атрибутам:', 'Название Фонда', 'Псевдоним', 'Бенефициар', 'ИНН Фонда'].every((t) => tipText.includes(t)), 'тексты подсказки с макета');
  page.check(!!tip && tip.querySelectorAll('br').length === 4, 'атрибуты — четыре строки');

  page.step('поля выключены');
  F.setDisabled(root, true);
  const controls = [...root.querySelectorAll('.inp__control')];
  page.check(controls.length === 3 && controls.every((c) => c.disabled), 'disabled у всех трёх полей');
  page.check([...root.querySelectorAll('.inp')].every((i) => i.classList.contains('inp--disabled')), '.inp--disabled у всех полей');
  F.setDisabled(root, false);
  page.check(controls.every((c) => !c.disabled), 'поля снова доступны');

  const cases = [...d.querySelectorAll('#kit-cases .kit-case')];
  page.check(cases.length >= 3, 'копий «Все состояния»: ' + cases.length);
};
