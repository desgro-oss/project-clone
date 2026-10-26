// Окно «Фиксация ЭПС/ВБС» со страницы сделки (RE0033 Э6): кнопка тайла «Финансовые метрики».
// Гонять: page-run Deal.preview.html --scenario … --query "id=1027"
export default async (page) => {
  const d = page.document;
  const w = page.window;
  const scrim = () => d.getElementById('fm-fix-scrim');
  await page.wait(800);
  page.step('кнопка тайла открывает окно фиксации');
  const btn = d.querySelector('#tile-fm-calc [data-fm-act="FIXATION"]');
  page.check(!!btn && !btn.disabled, 'кнопка «Фиксация ЭПС/ВБС» на тайле доступна');
  await page.click('#tile-fm-calc [data-fm-act="FIXATION"]');
  page.check(!scrim().hidden, 'окно открыто');
  page.check(scrim().querySelectorAll('[data-fx-card]').length === 1, 'одна карточка');
  const c = scrim().querySelector('[data-fx-card]');
  const names = [w.FinMetricsStore.fixationCandidates().filter((x) => !x.hasInitial)[0].name];
  const fi = c.querySelector('[data-fx-field="fi"] .inp__control');
  fi.value = names[0]; fi.dispatchEvent(new w.Event('change', { bubbles: true }));
  const typ = c.querySelector('[data-fx-field="type"] .inp__control');
  typ.value = 'Первоначальная'; typ.dispatchEvent(new w.Event('change', { bubbles: true }));
  const before = w.FinMetricsStore.fixations().length;
  await page.click('[data-fix-save]');
  page.check(scrim().hidden, 'окно закрыто после сохранения');
  await page.wait(1700);
  page.check(w.FinMetricsStore.fixations().length >= before, 'стор жив: фиксаций ' + w.FinMetricsStore.fixations().length);
  page.check(!d.querySelector('#tile-fm-calc[data-state="loading"]'), 'тайл не завис в загрузке');
};
