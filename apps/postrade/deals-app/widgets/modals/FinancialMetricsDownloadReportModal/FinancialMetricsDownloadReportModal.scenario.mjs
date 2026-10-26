// Окно «Выгрузка отчета» (RE0033 Э8) на странице «Финансовые метрики».
// Гонять: node .agents/tools/page-run.mjs apps/postrade/deals-app/pages/FinancialMetrics.preview.html \
//   --scenario apps/postrade/deals-app/widgets/modals/FinancialMetricsDownloadReportModal/FinancialMetricsDownloadReportModal.scenario.mjs --query "id=1024[&net=sigma][&download=fail]" --no-flows
// Без net — Альфа (без шифрования); net=sigma — с шифрованием; download=fail — ошибка выгрузки.
export default async (page) => {
  const d = page.document;
  const w = page.window;
  const q = new URLSearchParams(w.location.search);
  const sigma = q.get('net') === 'sigma';
  const fail = q.get('download') === 'fail';
  const $ = (s) => d.getElementById(s);
  const scrim = () => $('fm-download-scrim');
  const modal = () => scrim().querySelector('.modal');
  const recipients = () => scrim().querySelector('[data-dl-recipients]');
  const submit = () => scrim().querySelector('[data-dl-submit]');
  const rows = () => [...scrim().querySelectorAll('[data-dl-rows] .tbl__row[data-key]')];
  const type = (el, value, ev = 'input') => { el.value = value; el.dispatchEvent(new w.Event(ev, { bubbles: true })); };
  const snackText = () => [...d.querySelectorAll('.snack')].map((n) => n.textContent.replace(/\s+/g, ' ').trim()).join(' | ');
  await page.wait(400);

  page.step('кебаб → «Выгрузить в XLSX» открывает окно');
  page.check(scrim().hidden, 'окно закрыто');
  await page.click('#fm-menu-btn');
  await page.click('#fm-export');
  page.check(!scrim().hidden, 'окно открыто');
  page.check(scrim().querySelector('.modal__title').textContent.trim() === 'Выгрузка отчета', 'заголовок «Выгрузка отчета»');
  page.check(/Нажимая кнопку «Выгрузить»/.test(scrim().textContent), 'предупреждение ссылается на «Выгрузить»');
  page.check(!!scrim().querySelector('.btn--transparent[data-modal-close]'), '«Отменить» есть');

  if (!sigma) {
    page.step('Альфа: без шифрования — блока получателей нет, «Выгрузить» доступна');
    page.check(recipients().hidden, 'блок получателей скрыт');
    page.check(scrim().getAttribute('data-modal-guarded') === 'false', 'клик по скриму закрывает окно без шифрования');
    page.check(modal().classList.contains('modal--w6') && !modal().classList.contains('modal--w8'), 'ширина w6');
    page.check(!submit().disabled, '«Выгрузить» доступна');
  } else {
    page.step('Сигма: с шифрованием — получатели, «Выгрузить» выключена, пока никого нет');
    page.check(!recipients().hidden, 'блок получателей виден');
    page.check(!scrim().hasAttribute('data-modal-guarded'), 'с шифрованием слой защищён от клика по скриму');
    page.check(modal().classList.contains('modal--w8') && !modal().classList.contains('modal--w6'), 'ширина w8');
    page.check(submit().disabled && submit().getAttribute('aria-disabled') === 'true', '«Выгрузить» выключена атрибутом');
    page.check(rows().length === 0, 'таблица пуста');

    const addMail = scrim().querySelector('[data-dl-add-email]');
    const mail = $('fm-dl-email');
    page.check(addMail.disabled, '«Добавить» по e-mail выключена');
    type(mail, 'не-адрес');
    page.check(addMail.disabled, 'неверный адрес — «Добавить» выключена');
    type(mail, 'Petrov@omega.sberbank.ru');
    page.check(!addMail.disabled, 'верный адрес — «Добавить» доступна');
    await page.click('[data-dl-add-email]');
    page.check(rows().length === 1, 'строка добавлена');
    const cells = [...rows()[0].querySelectorAll('.tc__text')].map((n) => n.textContent.trim());
    page.check(cells[2] === '—' && /omega/.test(cells[3]), 'омега-адрес — в колонке внутреннего домена: ' + cells.join(' / '));
    page.check(!submit().disabled, 'есть отмеченный — «Выгрузить» доступна');
    page.check(mail.value === '', 'поле e-mail очищено');

    type(mail, 'petrov@omega.sberbank.ru');
    await page.click('[data-dl-add-email]');
    page.check(rows().length === 1, 'повторный адрес не дублируется');


    const emp = $('fm-dl-employee');
    const addEmp = scrim().querySelector('[data-dl-add-employee]');
    page.check(addEmp.disabled, '«Добавить» сотрудника выключена');
    type(emp, 'Иванов Михаил Александрович', 'change');
    page.check(!addEmp.disabled, 'ФИО из справочника — «Добавить» доступна');
    await page.click('[data-dl-add-employee]');
    page.check(rows().length === 2, 'сотрудник добавлен');

    const all = scrim().querySelector('[data-dl-all]');
    const boxes = () => rows().map((r) => r.querySelector('.cb__input'));
    boxes()[0].checked = false;
    boxes()[0].dispatchEvent(new w.Event('change', { bubbles: true }));
    page.check(all.indeterminate && !all.checked, 'один снят — «выбрать всех» в промежуточном');
    boxes()[1].checked = false;
    boxes()[1].dispatchEvent(new w.Event('change', { bubbles: true }));
    page.check(submit().disabled, 'никто не отмечен — «Выгрузить» выключена');
    all.checked = true;
    all.dispatchEvent(new w.Event('change', { bubbles: true }));
    page.check(!submit().disabled && boxes().every((b) => b.checked), '«выбрать всех» отмечает всех');
  }

  page.step('«Выгрузить»: окно закрывается, затем снек по исходу');
  let closed = false;
  await page.click('[data-dl-submit]');
  closed = scrim().hidden;
  page.check(closed, 'окно закрылось');
  $('fm-export').click();
  await page.wait(50);
  page.check(scrim().hidden, 'пока идёт выгрузка, повторный запуск игнорируется');
  await page.wait(900);
  const t = snackText();
  if (fail) {
    page.check(/Ошибка/.test(t) && /Не удалось выгрузить файл\. Попробуйте еще раз\./.test(t), 'снек ошибки: ' + t);
  } else {
    page.check(/Файл выгружен/.test(t), 'снек успеха: ' + t);
  }
  page.check(!$('fm-menu-btn').disabled, 'кебаб снова доступен');

  page.step('повторное открытие: получатели остаются, пока открыта страница');
  /* повторный клик по кебабу прогонщик не находит (и без этого окна), пункт жмём напрямую */
  $('fm-export').click();
  await page.wait(100);
  page.check(!scrim().hidden, 'окно открыто снова');
  if (sigma) page.check(rows().length === 2, 'получатели на месте: ' + rows().length);
  if (sigma) {
    type($('fm-dl-email'), 'omegauser@sberbank.ru');
    await page.click('[data-dl-add-email]');
    const last = [...rows()[rows().length - 1].querySelectorAll('.tc__text')].map((n) => n.textContent.trim());
    page.check(/sberbank/.test(last[2]) && last[3] === '—', 'домен — по части после @: omegauser@sberbank.ru — внешний');
  }
  await page.click('#fm-download-scrim [data-modal-close]');
  page.check(scrim().hidden, '«Отменить»/крестик закрывает без выгрузки');
};
