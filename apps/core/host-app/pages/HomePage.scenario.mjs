// Сценарий главной по ролям: меню и плитки собраны по роли из ?role=,
// кнопка выхода в футере меню открывает окно «Сменить роль» (рантайм Modal).
// Запуск: node .agents/tools/page-run.mjs apps/core/host-app/pages/HomePage.html --scenario apps/core/host-app/pages/HomePage.scenario.mjs
// analyst — прежняя роль ДИД в Pre; core_analyst — отдельная роль с дашбордом.
export default async (page) => {
  const d = page.document;
  const roleCode = new URLSearchParams(page.window.location.search).get('role') || 'director_ib';
  page.check(page.window.localUserList.length === 3, 'в каталоге ровно три роли');
  page.check(page.window.localUserList.find(role => role.code === 'analyst')?.team === 'pretrade', 'Аналитик ДИД сохранён в Pre');
  page.check(page.window.localUserList.find(role => role.code === 'core_analyst')?.team === 'core', 'новый Аналитик существует отдельно в Core');
  if (roleCode === 'core_analyst') {
    page.step('главная Аналитика — дашборд');
    page.check(page.window.IBP_HOME_REDIRECT === '../../dashboard-app/pages/HomePage.preview.html?role=core_analyst', 'вход новой роли направляет на её дашборд');
    page.check(!d.querySelector('#homeGroups .ntile'), 'плиточная главная для Аналитика не строится');
    return;
  }
  page.step('сборка по роли');
  const groups = d.querySelectorAll('#homeGroups > section.home-group').length;
  const tiles = d.querySelectorAll('#homeGroups .ntile').length;
  const role = d.getElementById('userRole').textContent;
  const expect = { 'Руководитель IB': [3, 11], 'Аналитик ДИД': [6, 20] }[role];
  page.check(!page.window.IBP_HOME_REDIRECT, 'прежние роли не перенаправляются на дашборд');
  page.check(!!expect, 'роль в футере известна: ' + role);
  if (expect) {
    page.check(groups === expect[0], 'групп ' + expect[0] + ', есть ' + groups);
    page.check(tiles === expect[1], 'плиток ' + expect[1] + ', есть ' + tiles);
  }
  page.check(d.querySelectorAll('#navList i[data-icon] svg, #navList i[data-icon]:not(:empty)').length > 0, 'глифы меню отрисованы');
  page.check(d.querySelectorAll('#homeGroups .illu:not(:empty)').length >= 1, 'иллюстрации отрисованы');
  page.step('ссылки перенесённых модулей Core');
  for (const [route, href] of [
    ['/clients-app/my-clients', '../../clients-app/pages/MyClientsPage.preview.html?role=' + roleCode],
    ['/tasks-app/tasks', '../../tasks-app/pages/TasksPage.preview.html?role=' + roleCode]
  ]) {
    const tile = d.querySelector('#homeGroups .ntile[data-route="' + route + '"]');
    page.check(tile && tile.getAttribute('href') === href, 'плитка ' + route + ' ведёт в модуль');
    page.check(!!d.querySelector('#navList a[href="' + href + '"]'), 'меню ведёт в тот же модуль: ' + route);
  }
  page.step('окно смены роли');
  page.check(d.querySelectorAll('#homeGroups h2.ds-h6-reg').length > 0 && !d.querySelector('#homeGroups h2.ds-h6-strong-smb'), 'заголовки групп — H6 Regular');
  await page.click('.nav__logout');
  await page.wait(50);
  const modal = d.getElementById('roleModal');
  page.check(!modal.hidden, 'окно открылось по кнопке выхода');
  page.check(modal.querySelectorAll('.role-team').length === 4, 'четыре колонки команд');
  page.check(modal.querySelectorAll('.role-team button[disabled]').length === 1, 'текущая роль — недоступная кнопка');
  page.check(modal.querySelectorAll('.role-team a.btn').length === 2, 'две другие роли доступны для переключения');
  page.check(!!modal.querySelector('[data-role-team="core"] a[href="../../dashboard-app/pages/HomePage.preview.html?role=core_analyst"]'), 'Аналитик в Core ведёт на дашборд');
  page.check(modal.querySelector('[data-role-team="pretrade"]').textContent.includes('Аналитик ДИД'), 'в колонке Pre присутствует Аналитик ДИД');
};
