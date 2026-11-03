// Демо витрины и API «Формы фонда»: варианты окна, проверка ввода, приоритет, сбор формы, состояния.
// Гонять: node .agents/tools/page-run.mjs apps/local-components/ib/funds-app/EditFundModal.doc.html \
//   --scenario apps/ib/funds-app/widgets/modals/EditFundModal/EditFundModal.kit.scenario.mjs --no-flows
export default async (page) => {
  const d = page.document;
  const w = page.window;
  await page.wait(600);
  const M = w.EditFundModal;
  const stage = d.getElementById('pg-stage');
  const scrim = stage && stage.querySelector('.modal-scrim');
  page.step('демо «Форма фонда»');
  page.check(!!M, 'window.EditFundModal');
  page.check(!!scrim && !!scrim.querySelector('.lc-edit-fund-modal'), 'окно в стенде');
  if (!M || !scrim) return;
  const q = (s) => scrim.querySelector(s);
  const ctl = (k) => q('[data-efm-field="' + k + '"] .inp__control');
  const title = () => q('[data-efm-title]').textContent;
  const click = (el) => el.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));

  const client = { partyId: 'pty-3001', shortName: 'ИП «Интер О.С.»', inn: '7706419639', kpp: '1157746314274' };
  const fund = { objectId: 'fnd-001', name: 'Интеррос', alias: 'Интеррос', inn: '7706419639', kpp: '1157746316598', partyId: 'pty-1001',
    keyBeneficiaries: [{ displayName: 'Владимир Потанин' }], priority: { code: 'HIGH', name: 'Высокий' }, comment: 'Текст комментария' };
  const custom = Object.assign({}, fund, { objectId: 'fnd-008', inn: null, kpp: null, partyId: null });
  let saved = null;
  const onSave = (f) => { saved = f; };

  page.step('add-ucp');
  page.check(M.render(scrim, { mode: 'create', source: 'ucp', client, onSave }) === 'add-ucp', 'вариант add-ucp');
  page.check(title() === 'Добавить фонд' && q('[data-efm-save-label]').textContent === 'Добавить', 'заголовок и кнопка «Добавить»');
  page.check(ctl('name').disabled && ctl('name').value === 'ИП «Интер О.С.»', 'название из ЕПК, выключено');
  page.check(!q('[data-efm-requisites]').hidden && ctl('inn').disabled && ctl('kpp').disabled, 'ИНН | КПП видны и выключены');
  page.check(q('[data-efm-ucp-alert]').hidden, 'предупреждения ЕПК нет');
  ctl('alias').value = 'Большой перспективный фонд';
  click(q('.ddl__item[data-code="HIGH"]'));
  page.check(ctl('priorityCode').value === 'Высокий', 'приоритет выбран из списка');
  click(q('[data-efm-save]'));
  page.check(saved && saved.name === 'ИП «Интер О.С.»' && saved.inn === '7706419639' && saved.partyId === 'pty-3001'
    && saved.priorityCode === 'HIGH' && saved.alias === 'Большой перспективный фонд' && saved.comment === null, 'onSave: ' + JSON.stringify(saved));

  page.step('create-custom');
  saved = null;
  page.check(M.render(scrim, { mode: 'create', source: 'custom', name: 'Андромеда', onSave }) === 'create-custom', 'вариант create-custom');
  page.check(title() === 'Новый фонд' && q('[data-efm-save-label]').textContent === 'Сохранить', 'заголовок «Новый фонд»');
  page.check(!ctl('name').disabled && ctl('name').value === 'Андромеда', 'название из поиска, можно править');
  page.check(q('[data-efm-requisites]').hidden && q('[data-efm-ucp-alert]').hidden, 'ИНН | КПП и предупреждения нет');
  ctl('name').value = '  ';
  click(q('[data-efm-save]'));
  page.check(saved === null, 'пустое название — onSave не зовётся');
  page.check(q('[data-efm-field="name"]').classList.contains('inp--error') && ctl('name').getAttribute('aria-invalid') === 'true', 'ошибка названия: inp--error');
  ctl('name').value = 'Андромеда';
  ctl('name').dispatchEvent(new w.Event('input', { bubbles: true }));
  page.check(!q('[data-efm-field="name"]').classList.contains('inp--error'), 'ошибка ушла после исправления');
  ctl('comment').value = 'а'.repeat(260);
  click(q('[data-efm-save]'));
  page.check(saved === null && q('[data-efm-field="comment"]').classList.contains('inp--error'), 'комментарий 260 символов — ошибка');
  const tip = d.getElementById(ctl('comment').getAttribute('aria-describedby') || '');
  page.check(!!tip && /Максимальная длина – 254 символов\. Указано 260 символов\./.test(tip.textContent), 'текст ошибки длины: ' + (tip && tip.textContent));
  ctl('comment').value = 'Коротко';
  click(q('[data-efm-save]'));
  page.check(saved && saved.name === 'Андромеда' && saved.inn === null && saved.partyId === null && saved.comment === 'Коротко', 'onSave: ' + JSON.stringify(saved));

  page.step('edit-ucp и edit-custom');
  page.check(M.render(scrim, { mode: 'update', source: 'ucp', fund, onSave }) === 'edit-ucp', 'вариант edit-ucp');
  page.check(title() === 'Редактировать фонд' && ctl('name').disabled && ctl('beneficiaries').value === 'Владимир Потанин'
    && ctl('priorityCode').value === 'Высокий', 'поля из фонда');
  page.check(M.render(scrim, { mode: 'update', source: 'custom', fund: custom, onSave }) === 'edit-custom', 'вариант edit-custom');
  page.check(!q('[data-efm-ucp-alert]').hidden && !!q('[data-efm-link-ucp]') && q('[data-efm-requisites]').hidden && !ctl('name').disabled,
    'предупреждение ЕПК, без ИНН | КПП, название правится');
  const ce = new w.CustomEvent('ds-input:clear', { bubbles: true });
  q('[data-efm-field="priorityCode"]').dispatchEvent(ce);
  saved = null;
  click(q('[data-efm-save]'));
  page.check(saved && saved.priorityCode === null, 'очистка приоритета — priorityCode null');

  page.step('состояния');
  M.setState(scrim, 'loading');
  page.check(q('.inp__field').classList.contains('sk-surface') && q('[data-efm-save]').disabled && q('[data-efm-fields]').disabled, 'загрузка: шиммер, кнопка и поля выключены');
  M.setState(scrim, 'updating');
  page.check(q('.modal').classList.contains('modal--saving') && q('[data-efm-save]').classList.contains('btn--loading')
    && !!q('[data-efm-save] .spin') && q('[data-efm-cancel]').disabled && q('[data-efm-link-ucp]').disabled, 'обновление: saving, loading, спиннер');
  M.setState(scrim, 'data');
  page.check(!q('.modal').classList.contains('modal--saving') && !q('[data-efm-save] .spin') && !q('.inp__field.sk-surface') && !q('[data-efm-save]').disabled, 'данные: всё снято');

  page.step('open и закрытие по «Сохранить»');
  saved = null;
  const api = M.open('editFundModal', { mode: 'update', source: 'ucp', fund, priorities: w.FUND_PRIORITY_LABELS, onSave });
  page.check(!!api && api.isOpen(), 'окно открыто DSModal');
  const live = d.getElementById('editFundModal');
  click(live.querySelector('[data-efm-save]'));
  page.check(saved && saved.name === 'Интеррос' && saved.partyId === 'pty-1001', 'onSave из открытого окна');
  page.check(!api.isOpen() && live.hasAttribute('hidden'), 'окно закрыто и спрятано (keep)');
};
