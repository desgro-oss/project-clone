// Постоянный DOM-сценарий RE0044; браузер не запускается.
// Запуск: node .agents/tools/page-run.mjs apps/core/dashboard-app/pages/HomePage.preview.html --scenario apps/core/dashboard-app/pages/HomePage.scenario.mjs
export default async (page) => {
  const d = page.document;
  const w = page.window;
  await page.wait(1200);
  const tasksHref = '../../tasks-app/pages/TasksPage.preview.html?role=core_analyst';
  const clientsHref = '../../clients-app/pages/MyClientsPage.preview.html?role=core_analyst';
  page.step('Главная Аналитика Core и верхнее поле');
  page.check([...d.querySelectorAll('style')].some(style => style.textContent.includes('.screen { --layout-pad-top: var(--space-24); }')), 'Стартовая страница явно задаёт верхнее поле токеном 24');
  page.check(page.text('.nav__user-role') === 'Аналитик', 'В футере роль Аналитик');
  page.check(page.text('.nav__user-name') === 'Ким Анна Сергеевна', 'Демо-профиль Анны Ким сохранён');
  page.check(w.HomeStore.profile.positionName === 'Аналитик', 'Должность профиля — Аналитик');
  page.check(d.querySelector('.nav__item[aria-current="page"]').getAttribute('href') === 'HomePage.preview.html?role=core_analyst', 'Активна главная Аналитика');
  page.check([...d.querySelectorAll('.nav__block-label')].map(node => node.textContent).join('|') === w.navigationItems.core_analyst.map(group => group.title).join('|'), 'Меню взято из каталога Core для analyst');
  page.check(!!d.querySelector('#nav a[href="' + clientsHref + '"]'), 'Пункт Клиенты ведёт в реестр и сохраняет роль');
  const tasksNav = d.querySelector('#nav a[href="' + tasksHref + '"]');
  page.check(!!tasksNav && tasksNav.querySelector('.badge')?.textContent === '7', 'Пункт Задачи ведёт в реестр, бейдж роли сохранён');
  const accordion = d.querySelector('#nav .nav__item--acc');
  await page.click('#nav .nav__item--acc');
  page.check(accordion.getAttribute('aria-expanded') === 'true', 'Подменю открывается рантаймом NavPanel');

  page.step('Ссылки задач и клиентов — реестры без вымышленных id');
  page.check(!!d.querySelector('#tile-tasks .tile__actions a[href="' + tasksHref + '"]') && !!d.querySelector('#tile-tasks .link[href="' + tasksHref + '"]'), 'Стрелка и подвал задач — настоящие ссылки');
  page.check(!!d.querySelector('#lc-tasks-row-menu a[data-task-act="open"][href="' + tasksHref + '"]'), 'Открыть в меню задачи — настоящая ссылка в реестр');
  for (const selector of ['#tile-tasks .lc-tasks__link[href]', '#tile-news .lc-news__client[href]']) {
    const links = [...d.querySelectorAll(selector)];
    page.check(links.length > 0 && links.every(link => link.getAttribute('href') === clientsHref), selector + ': все клиенты открывают реестр');
  }
  const goto = [];
  d.addEventListener('home:goto', event => goto.push(event.detail));
  await page.click('#tile-tasks [data-task-id="T-1002"] [data-menu="lc-tasks-row-menu"]');
  const open = d.querySelector('#lc-tasks-row-menu [data-task-act="open"]');
  const click = new w.Event('click', { bubbles: true, cancelable: true });
  open.dispatchEvent(click);
  page.check(!click.defaultPrevented && goto.length === 0, 'Клик Открыть не заменяется уведомлением или событием-заглушкой');
  for (const anchor of d.querySelectorAll('#tile-tasks a[data-home-goto="tasks"], #tile-tasks a[data-home-goto="clients"], #tile-news a[data-home-goto="clients"]')) {
    const event = new w.Event('click', { bubbles: true, cancelable: true });
    anchor.dispatchEvent(event);
    page.check(!event.defaultPrevented, 'Рабочая ссылка не перехватывается: ' + anchor.getAttribute('data-home-goto'));
  }

  page.step('Прежние действия тайлов и формы');
  await page.click('#tile-tasks [data-task-id="T-1002"] [data-menu="lc-tasks-row-menu"]');
  await page.click('#lc-tasks-row-menu [data-task-act="take"]');
  page.check(!!d.querySelector('#tile-tasks [data-task-id="T-1002"] .chip--dpurple'), 'Взять в работу меняет задачу на месте');
  page.check([...d.querySelectorAll('#tile-tasks a[data-home-goto="clients"]')].every(link => link.getAttribute('href') === clientsHref), 'Ссылки клиентов сохраняются после перерисовки задач');
  await page.click('#tile-news [data-scope="DESK"]');
  page.check([...d.querySelectorAll('#tile-news a[data-home-goto="clients"]')].every(link => link.getAttribute('href') === clientsHref), 'Ссылки клиентов назначаются после переключения ленты');
  await page.click('#tile-profile [data-modal="task-create-scrim"]');
  page.check(!d.getElementById('task-create-scrim').hidden, 'Быстрое действие открывает форму задачи');
  await page.click('#task-create-scrim [data-modal-close]');
  await page.click('#tile-profile [data-modal="meeting-create-scrim"]');
  page.check(!d.getElementById('meeting-create-scrim').hidden, 'Быстрое действие открывает форму встречи');
  await page.click('#meeting-create-scrim [data-modal-close]');

  page.step('Смена роли');
  await page.click('.nav__logout');
  const modal = d.getElementById('roleModal');
  page.check(!modal.hidden && modal.querySelectorAll('.role-team').length === 4, 'Открывается окно с четырьмя командами');
  page.check(page.text('[data-role-team="core"] [aria-current="true"]') === 'Аналитик', 'Текущая роль находится в Core');
  page.check(!!modal.querySelector('a[href="../../host-app/pages/HomePage.html?role=director_ib"]'), 'Руководитель IB ведёт на прежнюю главную');
  page.check(!!modal.querySelector('[data-role-team="pretrade"] a[href="../../host-app/pages/HomePage.html?role=analyst"]'), 'Аналитик ДИД отдельной ролью возвращён в Pre');
  page.check(w.localUserList.length === 3, 'каталог сохраняет все три роли');
  await page.click('#roleModal [data-modal-close]');
  page.check(modal.hidden, 'Окно роли закрывается штатно');
};
