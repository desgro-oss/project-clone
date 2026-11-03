// Демо витрины и API «Удалить фонд»: блок «Данные фонда», прочерки, подтверждение и закрытие.
// Гонять: node .agents/tools/page-run.mjs apps/local-components/ib/funds-app/DeleteFundModal.doc.html \
//   --scenario apps/ib/funds-app/widgets/modals/DeleteFundModal/DeleteFundModal.kit.scenario.mjs --no-flows
export default async (page) => {
  const d = page.document;
  const w = page.window;
  await page.wait(600);
  const M = w.DeleteFundModal;
  const stage = d.getElementById('pg-stage');
  const scrim = stage && stage.querySelector('.modal-scrim');
  const text = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');
  page.step('демо «Удалить фонд»');
  page.check(!!M, 'window.DeleteFundModal');
  page.check(!!scrim && !!scrim.querySelector('.lc-delete-fund-modal'), 'окно в стенде');
  if (!M || !scrim) return;
  const q = (s) => scrim.querySelector(s);
  page.check(text(q('.modal__title')) === 'Удалить фонд', 'заголовок');
  page.check(/Все данные о фонде и его связях с активами будут удалены/.test(text(q('.modal__body'))), 'текст последствий');
  page.check(text(q('[data-dfm-confirm]')) === 'Подтвердить' && q('.modal__foot').querySelectorAll('button').length === 1, 'в подвале только «Подтвердить»');

  page.step('данные фонда');
  const fund = { objectId: 'fnd-001', name: 'Интеррос', inn: '7706419639', kpp: '1157746316598', partyId: 'pty-1001', aumAssetsCount: 16 };
  page.check(M.render(scrim, { fund }) === 'data', 'состояние data');
  page.check(text(q('[data-dfm-name] .av__text')) === 'ИН', 'инициалы ИН');
  page.check(text(q('[data-dfm-name] .tc__text')) === 'Интеррос', 'название');
  page.check(text(q('[data-dfm-name] .tc__subtext')) === 'ИНН 7706419639 · КПП 1157746316598', 'ИНН · КПП');
  page.check(text(q('[data-dfm-count]')) === '16', 'активов 16');
  page.check(M.render(scrim, { fund: { objectId: 'fnd-008', name: 'ООО «Это пример фонда»', inn: null, kpp: null, aumAssetsCount: 0 } }) === 'partial', 'состояние partial');
  page.check(text(q('[data-dfm-name] .av__text')) === 'ЭП', 'инициалы без ООО: ' + text(q('[data-dfm-name] .av__text')));
  page.check(text(q('[data-dfm-name] .tc__subtext')) === '—' && text(q('[data-dfm-count]')) === '—', 'нет ИНН, КПП и активов — прочерки');
  page.check(q('.modal').getAttribute('data-state') === 'partial', 'data-state=partial');

  page.step('подтверждение');
  let got = null;
  const api = M.open('deleteFundModal', { fund, onConfirm: (f) => { got = f; } });
  page.check(!!api && api.isOpen(), 'окно открыто DSModal');
  const live = d.getElementById('deleteFundModal');
  live.querySelector('[data-dfm-confirm]').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  page.check(got && got.objectId === 'fnd-001', 'onConfirm(fund): ' + (got && got.objectId));
  page.check(!api.isOpen() && live.hasAttribute('hidden'), 'окно закрыто и спрятано (keep)');
};
