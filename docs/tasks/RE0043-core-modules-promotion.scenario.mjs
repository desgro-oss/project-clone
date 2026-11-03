import fs from 'node:fs';
import path from 'node:path';

export default async page => {
  const d = page.document;
  const w = page.window;
  const name = d.querySelector('main[data-screen-label]').getAttribute('data-screen-label');
  const owner = name === 'TasksPage' ? 'tasks-app' : 'clients-app';
  const base = path.join(process.cwd(), 'apps/core', owner, 'pages');
  const exists = href => !href || href.startsWith('#') || /^[a-z]+:/i.test(href) || fs.existsSync(path.resolve(base, href.split(/[?#]/)[0]));
  page.step('все маршруты и ссылки страницы разрешаются с нового места');
  for (const [key, href] of Object.entries(w.IBPR_NAV.PAGES)) page.check(exists(href), key + ' → ' + href);
  const requestedRole = new URLSearchParams(w.location.search).get('role');
  const currentRole = w.localUserList.find(role => role.code === requestedRole) || w.localUserList.find(role => role.code === 'core_analyst');
  const roleCode = currentRole.code;
  for (const a of d.querySelectorAll('a[href]')) {
    const href = a.getAttribute('href');
    page.check(exists(href), a.textContent.trim().slice(0, 35) + ': ' + href);
    if (/ClientInfoPage\.preview\.html|MyClientsPage\.preview\.html|ClientComments\.preview\.html|TasksPage\.preview\.html/.test(href)) {
      page.check(new URL(href, 'https://prototype.invalid/').searchParams.get('role') === roleCode, 'ссылка Core сохраняет роль: ' + href);
    }
  }
  page.check(w.IBPR_NAV.PAGES.home === w.roleHomeHref(roleCode), 'главная соответствует роли');
  page.check(d.querySelector('.crumbs__item a').getAttribute('href') === w.roleHomeHref(roleCode), 'крошки возвращают на главную текущей роли');
  page.check(d.querySelector('.nav__user-role').textContent === currentRole.title, 'футер показывает текущую роль');
  if (name === 'TasksPage') {
    page.step('предпросмотр и исполнение задачи');
    let taskId = Number(new URLSearchParams(w.location.search).get('id'));
    if (d.querySelector('.splitpane__b').hidden) {
      const row = [...d.querySelectorAll('#tk-list [data-rt-row]')].find(r => {
        const id = Number(r.querySelector('[data-col="id"]').textContent.trim());
        const task = w.IBPR.task(id);
        return task && ['PENDING_EXECUTION', 'ADJUSTMENT_REQUIRED'].includes(task.statusCode);
      });
      page.check(!!row, 'есть доступная к исполнению задача на первой странице');
      if (!row) return;
      taskId = Number(row.querySelector('[data-col="id"]').textContent.trim());
      await page.click('#tk-list [data-rt-row="' + row.getAttribute('data-rt-row') + '"]');
    }
    page.check(d.querySelector('[data-tp-title]').textContent.includes(String(taskId)), 'загружена выбранная задача');
    await page.click('[data-tp-done]');
    page.check(!d.getElementById('task-change-scrim').hidden, 'открыто окно исполнения');
    await page.click('[data-tc-confirm]');
    page.check(w.IBPR.task(taskId).statusCode === 'DONE', 'статус задачи сохранён');
    page.check(d.getElementById('task-change-scrim').hidden, 'окно закрылось');
  } else if (name === 'MyClientsPage') {
    page.step('таблица и дерево клиентов');
    page.check(d.querySelectorAll('#mc-table a[href*="ClientInfoPage.preview.html"][href*="id="]').length > 0, 'строки ведут в карточки');
    await page.click('#mc-table [data-view="tree"]');
    page.check(!d.getElementById('mc-tree').hidden && d.getElementById('mc-table').hidden, 'дерево показано вместо таблицы');
    page.check(d.querySelectorAll('#mc-tree a[href*="ClientInfoPage.preview.html"][href*="id="]').length > 0, 'дерево содержит ссылки карточек');
  } else if (name === 'ClientInfoPage') {
    page.step('все вкладки карточки клиента');
    for (const tab of ['meetings', 'tasks', 'deals', 'financials', 'goals', 'credits', 'analysis', 'general']) {
      await page.click('#cl-tabs [data-tab-id="' + tab + '"]');
      page.check(d.querySelector('#cl-tabs [data-tab-id="' + tab + '"]').getAttribute('aria-selected') === 'true', 'открыта вкладка ' + tab);
    }
  } else if (name === 'ClientComments') {
    page.step('добавление комментария клиента');
    const before = w.IBPR.clientComments('3000012345').length;
    d.getElementById('cc-input').value = 'Проверка переноса RE0043';
    await page.click('#cc-send');
    page.check(w.IBPR.clientComments('3000012345').length === before + 1, 'комментарий добавлен в хранилище');
    page.check(d.getElementById('cc-list').textContent.includes('Проверка переноса RE0043'), 'комментарий отрисован');
  }
};
