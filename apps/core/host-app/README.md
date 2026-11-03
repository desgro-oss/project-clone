# host-app — модуль раздела core

Модуль повторяет фронтенд `core/host-app`: плиточные главные Аналитика ДИД и Руководителя IB
и служебный выбор роли. Для `core_analyst` («Аналитик», Core) совместимый вход
`pages/HomePage.html?role=core_analyst` направляет в соседний `dashboard-app`
(решение человека 30.10.2026, RE0044).

**Источники:** структура фронтенда host-app (README.md, STRUCTURE.md, `src`),
переданы человеком 29.10.2026; скриншоты главной и меню ролей.

По уточнению человека 30.10.2026 (RE0044a) прежний `analyst` / `Analyst` —
«Аналитик ДИД» в Pre, его плиточная главная сохранена. Новый Аналитик Core —
отдельная роль `core_analyst` / `CoreAnalyst` (прототипный код, пара фронтенда неизвестна).
Ролей ровно три.

## Экраны

| Файл | Экран | Пара во фронтенде | Роли |
|---|---|---|---|
| `pages/HomePage.html` | Главная по ролям, `?role=<код>` | `src/pages/HomePage` | `director_ib` — Руководитель IB (IB); `core_analyst` — перенаправление в дашборд (Core) |

Логина в прототипе нет: роль — параметр адреса; сменить её — кнопка выхода в
футере меню (как в ДС), окно со всеми ролями по командам
Post · Pre · IB · Core. Строка хаба на роль — `project.json → roleHomes` (у самого
модуля строки нет, `"hub": false`): «Главная — Руководитель IB» первой во вкладке
IB; «Главная - Аналитик (Дашборд)» — запись dashboard-app во вкладке Core.

**Новая роль:** код — из `LoginForRolesKeys` фронтенда
(`src/shared/authentication/authentication.types.ts`); запись в
`data/authentication.js` (команда `team` и адрес `home`), колонки плиток в `data/dashboard.js`, блоки меню в
`data/navigation.js`, строка в `project.json → roleHomes`, пересборка
`node .agents/tools/hub-build.mjs`.

## Данные

`data/*.js` — JSDoc-typedef с именами фронтенда (`LocalUserType`,
`DashboardColumn`, `DashboardItem`, `NavigationItems`); `code`, `name`, `route` —
дословно из фронтенда, подписи ролей, иллюстрации и `href` — прототипа.

## Что лежит

<!-- @tree — дерево генерирует .agents/tools/module-readme.mjs, руками не править -->
```
host-app/
├── app.json                ← запись хаба: «Главная IBP», трек product
├── README.md
├── pages/
│   ├── HomePage.html       ← Главная страница IBP (по ролям)
│   ├── HomePage.scenario.mjs
│   └── HomePage.screen.md  ← спека
├── widgets/                ← пусто
├── data/
│   ├── authentication.js   ← Роли прототипа — кто входит в систему. Источник имён — фронтенд host-ap…
│   ├── dashboard.js        ← Плитки главной по ролям. Источник имён — фронтенд host-app:
│   ├── navigation.js       ← Боковое меню по ролям. Источник имён — фронтенд host-app:
│   └── role-switch.js      ← Служебное окно смены роли на главных Core. Разметку Modal держит страни…
└── refs/                   ← пусто
```
<!-- /@tree -->

## Имена фронтенда

Сущности модуля во фронтенде (снято с дерева фронтенда 24.09.2026) —
разложены по нашей форме. Экран или виджет, у которого здесь есть пара, называется
так же: разработчик находит его без перевода (`apps/README.md`, «widgets»).

| Куда у нас | Имена во фронтенде |
|---|---|
| `pages/` | AdminPage, HomePage, LoginPage, MissingRightsPage, NotFoundPage, ServerErrorPage, ServicesVersionPage |
| `widgets/tiles/` | LinkNavigationTile |
| `widgets/modals/` | AuthorizationExpiredModal — у фронтенда в `features/` и `widgets/` |
| другие виджеты | BreadcrumbsSection, MissingRightsSideBar, ServiceVersionFilters, Sidebar, SnackbarArea — своей группы у нас нет: новая группа — в `project.json → appShape.widgetGroups` |
| мелкие элементы | Logout — у фронтенда `features/`; у нас — в разметке страницы или виджета |
