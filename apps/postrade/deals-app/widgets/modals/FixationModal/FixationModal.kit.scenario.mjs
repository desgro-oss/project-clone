// Витрина окна «Фиксация ЭПС/ВБС» (RE0033 Э6): демо рисует карточки через PostFixationModal.preview.
export default async (page) => {
  const d = page.document;
  await page.wait(600);
  page.step('демо нарисовало окно');
  const scrim = d.querySelector('#fm-fix-scrim');
  page.check(!!scrim, 'скрим окна на странице');
  const cards = () => [...scrim.querySelectorAll('[data-fx-card]')];
  page.check(cards().length === 1, 'по умолчанию одна карточка: ' + cards().length);
  const fi = cards()[0] && cards()[0].querySelector('[data-fx-field="fi"] .inp__control');
  page.check(!!fi && fi.getAttribute('value') !== undefined, 'поле ФИ на месте');
  page.check(cards()[0].querySelector('[data-fx-remove]').disabled, '«⊖» выключена при одной карточке');
  page.step('добавление карточки в демо');
  scrim.querySelector('[data-fix-add]').click();
  await page.wait(100);
  page.check(cards().length === 2 && !cards()[0].querySelector('[data-fx-remove]').disabled, 'две карточки, «⊖» доступна');
};
