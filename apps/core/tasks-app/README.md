# tasks-app — модуль раздела core

Задачи аналитика и его деска: реестр `TasksPage`, предпросмотр, история и окно
смены статуса. Виджеты задач также используются во вкладке карточки клиента
и на странице встреч оставшегося концепта.

Источник — согласованный перенос из `core/drafts/ibp-redesign-v1`
(30.10.2026, RE0043), исходные требования MS0014 и MS0014a. Модуль трека `product`.
Имена, демо-данные и поведение сохранены; полный набор данных нужен общему
`data/store.js`. Вход — `pages/TasksPage.preview.html`,
главная — `core/host-app/pages/HomePage.html`.

## Что лежит

<!-- @tree — дерево генерирует .agents/tools/module-readme.mjs, руками не править -->
```
tasks-app/
├── app.json                        ← запись хаба: «Задачи», трек product
├── README.md
├── pages/
│   ├── TasksPage.html              ← Задачи — источник, собирается в TasksPage.preview.html
│   ├── TasksPage.preview.html      ← собранная страница — открывать её
│   ├── TasksPage.scenario.mjs
│   └── TasksPage.screen.md         ← спека
├── widgets/
│   ├── modals/                     ← модальные окна
│   │   └── ChangeTaskStatusModal/  ← Смена статуса задачи
│   │       ├── CHANGELOG.md
│   │       ├── ChangeTaskStatusModal.css
│   │       ├── ChangeTaskStatusModal.html
│   │       ├── ChangeTaskStatusModal.js
│   │       ├── ChangeTaskStatusModal.md
│   │       └── fixtures.json
│   ├── tables/                     ← таблицы
│   │   ├── TaskHistoryTable/       ← История задачи
│   │   │   ├── CHANGELOG.md
│   │   │   ├── fixtures.json
│   │   │   ├── TaskHistoryTable.css
│   │   │   ├── TaskHistoryTable.html
│   │   │   ├── TaskHistoryTable.js
│   │   │   └── TaskHistoryTable.md
│   │   └── TasksTable/             ← Реестр задач
│   │       ├── CHANGELOG.md
│   │       ├── fixtures.json
│   │       ├── TasksTable.css
│   │       ├── TasksTable.html
│   │       ├── TasksTable.js
│   │       └── TasksTable.md
│   └── tiles/                      ← тайлы
│       └── TaskPreviewTile/        ← Предпросмотр задачи
│           ├── CHANGELOG.md
│           ├── fixtures.json
│           ├── TaskPreviewTile.css
│           ├── TaskPreviewTile.html
│           ├── TaskPreviewTile.js
│           └── TaskPreviewTile.md
├── data/
│   ├── clients.js                  ← clients.js — клиенты демо-данных концепта ibp-redesign-v1.
│   ├── dictionaries.js             ← dictionaries.js — справочники и конфиги реестров концепта ibp-redesign-…
│   ├── employees.js                ← employees.js — сотрудники демо-данных концепта ibp-redesign-v1.
│   ├── meetings.js                 ← meetings.js — встречи демо-данных концепта ibp-redesign-v1.
│   ├── nav-links.js                ← nav-links.js — меню и карта страниц модулей Core. Один
│   ├── opportunities.js            ← opportunities.js — сделки демо-данных концепта ibp-redesign-v1.
│   ├── potentials.js               ← potentials.js — лиды демо-данных концепта ibp-redesign-v1.
│   ├── registry-table.js           ← registry-table.js — общий рендер реестров концепта ibp-redesign-v1.
│   ├── store.js                    ← store.js — общее хранилище прототипа ibp-redesign-v1.
│   └── tasks.js                    ← tasks.js — задачи демо-данных концепта ibp-redesign-v1.
└── refs/                           ← пусто
```
<!-- /@tree -->

## Имена фронтенда

Сущности модуля во фронтенде (снято с дерева фронтенда 24.09.2026) —
разложены по нашей форме. Экран или виджет, у которого здесь есть пара, называется
так же: разработчик находит его без перевода (`apps/README.md`, «widgets»).

| Куда у нас | Имена во фронтенде |
|---|---|
| `pages/` | TasksOfMyDeskPage, TasksPage |
| `widgets/tiles/` | TaskPreviewTile |
| `widgets/tables/` | TaskHistoryTable, TasksTable, TasksTableFilters |
| `widgets/modals/` | ChangeTaskStatusModal — у фронтенда в `features/` и `widgets/` |
| мелкие элементы | DownloadTasksReportButton, FinalizeTaskForm, Tabs, UpdateTaskFormDeals, UpdateTaskFormOpportunities — у фронтенда `features/`; у нас — в разметке страницы или виджета |
