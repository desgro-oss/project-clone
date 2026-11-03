// Демо витрины «Меню фонда»: два триггера открывают оба варианта меню.
// Гонять: node .agents/tools/page-run.mjs apps/local-components/ib/funds-app/FundActionsMenu.doc.html \
//   --scenario apps/ib/funds-app/widgets/context-menus/FundActionsMenu/FundActionsMenu.kit.scenario.mjs --no-flows
export default async (page) => {
  const d = page.document;
  await page.wait(600);
  const text = (el) => el.textContent.replace(/\s+/g, ' ').trim();
  page.step('демо «Меню фонда»');
  const stage = d.getElementById('pg-stage');
  page.check(!!stage, 'стенд на месте');
  const epk = d.getElementById('fundActionsMenu');
  const custom = d.getElementById('fundActionsMenuCustom');
  page.check(!!epk && !!custom, 'оба меню на странице');
  page.check(/Перейти на страницу клиента/.test(text(epk)) && !/Связать/.test(text(epk)), 'фонд из ЕПК: «Перейти на страницу клиента»');
  page.check(/Связать с базой ЕПК/.test(text(custom)) && !/Перейти/.test(text(custom)), 'фонд не из ЕПК: «Связать с базой ЕПК»');
  const triggers = [...stage.querySelectorAll('[data-menu]')];
  page.check(triggers.length === 2, 'триггеров: ' + triggers.length);
  await page.click('#pg-stage [data-menu="fundActionsMenu"]');
  page.check(epk.classList.contains('is-open'), 'меню фонда из ЕПК открылось');
  await page.click('#pg-stage [data-menu="fundActionsMenuCustom"]');
  page.check(custom.classList.contains('is-open'), 'меню фонда не из ЕПК открылось');
};
