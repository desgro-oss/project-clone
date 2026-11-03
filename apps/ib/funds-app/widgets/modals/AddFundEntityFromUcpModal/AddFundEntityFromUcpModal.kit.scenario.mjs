// Демо витрины и API окна «Добавить фонд — поиск в базах»: поиск, группы, выбор, «Продолжить», «Новый фонд».
// Гонять: node .agents/tools/page-run.mjs apps/local-components/ib/funds-app/AddFundEntityFromUcpModal.doc.html \
//   --scenario apps/ib/funds-app/widgets/modals/AddFundEntityFromUcpModal/AddFundEntityFromUcpModal.kit.scenario.mjs --no-flows
export default async (page) => {
  const d = page.document;
  const w = page.window;
  await page.wait(600);
  const M = w.AddFundEntityFromUcpModal;
  const scrim = d.getElementById('addFundEntityFromUcpModal');
  const text = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');
  page.step('окно на стенде');
  page.check(!!M && typeof M.open === 'function', 'API AddFundEntityFromUcpModal.open');
  page.check(!!scrim, 'скрим #addFundEntityFromUcpModal');
  if (!M || !scrim) return;
  const modal = scrim.querySelector('.lc-afe');
  const st = () => modal.getAttribute('data-state');
  const next = scrim.querySelector('[data-afe-next]');
  const cards = (g) => [...scrim.querySelectorAll('[data-afe-cards="' + g + '"] .lc-afe__card')];
  page.check(modal.classList.contains('modal--w9'), 'ширина modal--w9');
  page.check(/524\/3-Р/.test(text(scrim.querySelector('.modal__alert'))), 'Alert про распоряжение 524/3-Р');

  page.step('поиск не выполнялся');
  let gotNext = null, gotCreate = null;
  M.render(scrim, { funds: w.MOCK_FUNDS, clients: w.MOCK_UCP_CLIENTS, onNext: (c) => { gotNext = c; }, onCreateFund: (x) => { gotCreate = x; } });
  page.check(st() === 'idle', 'idle: ' + st());
  page.check(next.disabled, '«Продолжить» disabled');
  page.check(M.search(scrim) === false && st() === 'idle', 'пустой запрос поиск не запускает');

  page.step('найдено: «Интеррос» / «0765»');
  M.render(scrim, { funds: w.MOCK_FUNDS, clients: w.MOCK_UCP_CLIENTS, prefill: { name: 'Интеррос', inn: '0765' }, search: true,
    onNext: (c) => { gotNext = c; }, onCreateFund: (x) => { gotCreate = x; } });
  page.check(st() === 'data', 'data: ' + st());
  page.check(cards('funds').length === 1 && cards('funds')[0].getAttribute('data-afe-id') === 'fnd-001', 'в базе фондов — Интеррос');
  page.check(cards('clients').map((c) => c.getAttribute('data-afe-id')).join() === 'pty-3001', 'в ЕПК — ИП «Интер О.С.» (по ИНН и полному наименованию)');
  page.check(modal.getAttribute('data-detail') === 'fund' && cards('funds')[0].getAttribute('aria-checked') === 'true', 'выбран первый фонд');
  page.check(next.disabled, 'фонд выбран — «Продолжить» disabled');
  page.check(scrim.querySelector('[data-afe-unbound]').hidden, 'у фонда из ЕПК предупреждения нет');
  page.check(text(scrim.querySelector('[data-afe-f="investmentVolume"]')) === '987,65', 'объём инвестиций 987,65');
  page.check(scrim.querySelectorAll('[data-afe-f="keyIndustries"] .chip').length === 3, 'три чипа отраслей');

  page.step('выбор клиента ЕПК кликом');
  cards('clients')[0].dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  page.check(modal.getAttribute('data-detail') === 'client', 'детали клиента');
  page.check(!next.disabled, '«Продолжить» доступна');
  page.check(scrim.querySelectorAll('[data-afe-team-row]').length === 3, 'команда клиента — 3 строки');
  page.check(text(scrim.querySelector('[data-afe-c="segmentName"]')) === 'Крупнейшие', 'сегмент');
  next.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  page.check(gotNext && gotNext.partyId === 'pty-3001', 'onNext(client): ' + (gotNext && gotNext.partyId));

  page.step('CRM ID и фонд без ЕПК');
  M.render(scrim, { funds: w.MOCK_FUNDS, clients: w.MOCK_UCP_CLIENTS, prefill: { name: 'Интер', hideNoCrm: false }, search: true });
  page.check(cards('clients').some((c) => c.getAttribute('data-afe-id') === 'pty-3003'), 'без «Скрывать без CRM ID» — Интерлизинг виден');
  M.render(scrim, { funds: w.MOCK_FUNDS, clients: w.MOCK_UCP_CLIENTS, prefill: { name: 'Интер' }, search: true });
  page.check(!cards('clients').some((c) => c.getAttribute('data-afe-id') === 'pty-3003'), 'со «Скрывать без CRM ID» — Интерлизинга нет');
  M.render(scrim, { funds: w.MOCK_FUNDS, clients: w.MOCK_UCP_CLIENTS, prefill: { name: 'не из ЕПК' }, search: true });
  page.check(!scrim.querySelector('[data-afe-unbound]').hidden, 'фонд без partyId — предупреждение «Привязать»');
  page.check(!!cards('funds')[0].querySelector('.tile__title-add--warning'), '⚠ на карточке фонда');
  page.check(scrim.querySelector('[data-afe-group="clients"]').hidden, 'пустая группа ЕПК скрыта');

  page.step('ничего не найдено: «Андромеда»');
  gotCreate = null;
  M.render(scrim, { funds: w.MOCK_FUNDS, clients: w.MOCK_UCP_CLIENTS, prefill: { name: 'Андромеда' }, search: true, onCreateFund: (x) => { gotCreate = x; } });
  page.check(st() === 'empty', 'empty: ' + st());
  scrim.querySelector('[data-afe-create]').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  page.check(gotCreate && gotCreate.name === 'Андромеда', 'onCreateFund({ name }): ' + (gotCreate && gotCreate.name));

  page.step('загрузка и ошибка');
  M.setState(scrim, 'loading');
  page.check(st() === 'loading' && scrim.querySelector('[data-afe-search]').classList.contains('btn--loading'), 'loading: «Поиск» с лоадером');
  M.setState(scrim, 'error', 'Ошибка теста');
  page.check(st() === 'error' && text(scrim.querySelector('[data-afe-error-text]')) === 'Ошибка теста', 'error: текст ошибки');
  page.check(next.disabled, 'после ошибки «Продолжить» disabled');
};
