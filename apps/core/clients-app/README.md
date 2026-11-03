# clients-app — модуль раздела core

Клиенты: реестр `MyClientsPage` с таблицей и деревом холдингов, карточка
`ClientInfoPage` со всеми вкладками и страница `ClientComments`. Сюда перенесены
виджеты карточки и её реестров; общие блоки использует оставшийся концепт Core.
Вкладка задач берёт виджеты из соседнего `tasks-app`.

Источник — согласованный перенос из `core/drafts/ibp-redesign-v1`
(30.10.2026, RE0043), исходные требования MS0014 и MS0014a. Модуль трека `product`.
Имена, демо-данные и поведение сохранены; полный набор данных нужен общему
`data/store.js`. Вход — `pages/MyClientsPage.preview.html`,
главная — `core/host-app/pages/HomePage.html`.

## Что лежит

<!-- @tree — дерево генерирует .agents/tools/module-readme.mjs, руками не править -->
```
clients-app/
├── app.json                             ← запись хаба: «Клиенты», трек product
├── README.md
├── pages/
│   ├── ClientComments.html              ← Комментарии клиента — источник, собирается в ClientComments.preview.html
│   ├── ClientComments.preview.html      ← собранная страница — открывать её
│   ├── ClientComments.scenario.mjs
│   ├── ClientComments.screen.md         ← спека
│   ├── ClientInfoPage.html              ← Клиент — источник, собирается в ClientInfoPage.preview.html
│   ├── ClientInfoPage.preview.html      ← собранная страница — открывать её
│   ├── ClientInfoPage.scenario.mjs
│   ├── ClientInfoPage.screen.md         ← спека
│   ├── MyClientsPage.html               ← Клиенты — источник, собирается в MyClientsPage.preview.html
│   ├── MyClientsPage.preview.html       ← собранная страница — открывать её
│   ├── MyClientsPage.scenario.mjs
│   └── MyClientsPage.screen.md          ← спека
├── widgets/
│   ├── tables/                          ← таблицы
│   │   ├── BindingOpportunitiesTable/   ← Реестр обязательных сделок
│   │   │   ├── BindingOpportunitiesTable.css
│   │   │   ├── BindingOpportunitiesTable.html
│   │   │   ├── BindingOpportunitiesTable.md
│   │   │   ├── CHANGELOG.md
│   │   │   └── fixtures.json
│   │   ├── DcmEcmPipelineTable/         ← Pipeline DCM и ECM клиента
│   │   │   ├── CHANGELOG.md
│   │   │   ├── DcmEcmPipelineTable.css
│   │   │   ├── DcmEcmPipelineTable.html
│   │   │   ├── DcmEcmPipelineTable.js
│   │   │   ├── DcmEcmPipelineTable.md
│   │   │   └── fixtures.json
│   │   ├── FinancialsTable/             ← Таблица ФОК
│   │   │   ├── CHANGELOG.md
│   │   │   ├── FinancialsTable.css
│   │   │   ├── FinancialsTable.html
│   │   │   ├── FinancialsTable.js
│   │   │   ├── FinancialsTable.md
│   │   │   └── fixtures.json
│   │   ├── LeadsTable/                  ← Реестр лидов
│   │   │   ├── CHANGELOG.md
│   │   │   ├── fixtures.json
│   │   │   ├── LeadsTable.css
│   │   │   ├── LeadsTable.html
│   │   │   ├── LeadsTable.js
│   │   │   └── LeadsTable.md
│   │   ├── MaPipelineTable/             ← M&A Pipeline клиента
│   │   │   ├── CHANGELOG.md
│   │   │   ├── fixtures.json
│   │   │   ├── MaPipelineTable.css
│   │   │   ├── MaPipelineTable.html
│   │   │   ├── MaPipelineTable.js
│   │   │   └── MaPipelineTable.md
│   │   ├── MeetingsProtocolsList/       ← Реестр встреч
│   │   │   ├── CHANGELOG.md
│   │   │   ├── fixtures.json
│   │   │   ├── MeetingsProtocolsList.css
│   │   │   ├── MeetingsProtocolsList.html
│   │   │   ├── MeetingsProtocolsList.js
│   │   │   └── MeetingsProtocolsList.md
│   │   ├── MyClientsHierarchicalTree/   ← Мои клиенты по холдингам
│   │   │   ├── CHANGELOG.md
│   │   │   ├── fixtures.json
│   │   │   ├── MyClientsHierarchicalTree.css
│   │   │   ├── MyClientsHierarchicalTree.html
│   │   │   ├── MyClientsHierarchicalTree.js
│   │   │   └── MyClientsHierarchicalTree.md
│   │   ├── MyClientsTable/              ← Мои клиенты
│   │   │   ├── CHANGELOG.md
│   │   │   ├── fixtures.json
│   │   │   ├── MyClientsTable.css
│   │   │   ├── MyClientsTable.html
│   │   │   ├── MyClientsTable.js
│   │   │   └── MyClientsTable.md
│   │   ├── OpportunitiesPipelineTable/  ← Реестр Pipeline
│   │   │   ├── CHANGELOG.md
│   │   │   ├── fixtures.json
│   │   │   ├── OpportunitiesPipelineTable.css
│   │   │   ├── OpportunitiesPipelineTable.html
│   │   │   └── OpportunitiesPipelineTable.md
│   │   └── PossibleOpportunitiesTable/  ← Реестр возможных сделок
│   │       ├── CHANGELOG.md
│   │       ├── fixtures.json
│   │       ├── PossibleOpportunitiesTable.css
│   │       ├── PossibleOpportunitiesTable.html
│   │       └── PossibleOpportunitiesTable.md
│   └── tiles/                           ← тайлы
│       ├── ClientCreditsList/           ← Кредиты клиента
│       │   ├── CHANGELOG.md
│       │   ├── ClientCreditsList.css
│       │   ├── ClientCreditsList.html
│       │   ├── ClientCreditsList.js
│       │   ├── ClientCreditsList.md
│       │   └── fixtures.json
│       ├── ClientNewsTile/              ← Новости клиента
│       │   ├── CHANGELOG.md
│       │   ├── ClientNewsTile.css
│       │   ├── ClientNewsTile.html
│       │   ├── ClientNewsTile.js
│       │   ├── ClientNewsTile.md
│       │   └── fixtures.json
│       ├── ClientTimingsTile/           ← Сроки клиента
│       │   ├── CHANGELOG.md
│       │   ├── ClientTimingsTile.css
│       │   ├── ClientTimingsTile.html
│       │   ├── ClientTimingsTile.js
│       │   ├── ClientTimingsTile.md
│       │   └── fixtures.json
│       ├── CommentsTile/                ← Комментарии
│       │   ├── CHANGELOG.md
│       │   ├── CommentsTile.css
│       │   ├── CommentsTile.html
│       │   ├── CommentsTile.js
│       │   ├── CommentsTile.md
│       │   └── fixtures.json
│       ├── DesksTile/                   ← Дески
│       │   ├── CHANGELOG.md
│       │   ├── DesksTile.css
│       │   ├── DesksTile.html
│       │   ├── DesksTile.js
│       │   ├── DesksTile.md
│       │   └── fixtures.json
│       ├── DocumentsInfoTile/           ← Документы клиента
│       │   ├── CHANGELOG.md
│       │   ├── DocumentsInfoTile.css
│       │   ├── DocumentsInfoTile.html
│       │   ├── DocumentsInfoTile.js
│       │   ├── DocumentsInfoTile.md
│       │   └── fixtures.json
│       ├── FinancialsChart/             ← График ФОК
│       │   ├── CHANGELOG.md
│       │   ├── FinancialsChart.css
│       │   ├── FinancialsChart.html
│       │   ├── FinancialsChart.js
│       │   ├── FinancialsChart.md
│       │   └── fixtures.json
│       ├── GigaInfoTile/                ← ГигаСправка
│       │   ├── CHANGELOG.md
│       │   ├── fixtures.json
│       │   ├── GigaInfoTile.css
│       │   ├── GigaInfoTile.html
│       │   ├── GigaInfoTile.js
│       │   └── GigaInfoTile.md
│       ├── GoalArchiveSection/          ← Архив целей
│       │   ├── CHANGELOG.md
│       │   ├── fixtures.json
│       │   ├── GoalArchiveSection.css
│       │   ├── GoalArchiveSection.html
│       │   ├── GoalArchiveSection.js
│       │   └── GoalArchiveSection.md
│       ├── GoalsPopoverBadge/           ← Цели зафиксированы
│       │   ├── CHANGELOG.md
│       │   ├── fixtures.json
│       │   ├── GoalsPopoverBadge.css
│       │   ├── GoalsPopoverBadge.html
│       │   ├── GoalsPopoverBadge.js
│       │   └── GoalsPopoverBadge.md
│       ├── IndustryInfoTile/            ← Отрасль клиента
│       │   ├── CHANGELOG.md
│       │   ├── fixtures.json
│       │   ├── IndustryInfoTile.css
│       │   ├── IndustryInfoTile.html
│       │   ├── IndustryInfoTile.js
│       │   └── IndustryInfoTile.md
│       ├── MeetingsProtocolsDetails/    ← Предпросмотр встречи
│       │   ├── CHANGELOG.md
│       │   ├── fixtures.json
│       │   ├── MeetingsProtocolsDetails.css
│       │   ├── MeetingsProtocolsDetails.html
│       │   ├── MeetingsProtocolsDetails.js
│       │   └── MeetingsProtocolsDetails.md
│       ├── RelatedPersonsTile/          ← Связанные физические лица
│       │   ├── CHANGELOG.md
│       │   ├── fixtures.json
│       │   ├── RelatedPersonsTile.css
│       │   ├── RelatedPersonsTile.html
│       │   ├── RelatedPersonsTile.js
│       │   └── RelatedPersonsTile.md
│       ├── RequisitesInfoTile/          ← Реквизиты клиента
│       │   ├── CHANGELOG.md
│       │   ├── fixtures.json
│       │   ├── RequisitesInfoTile.css
│       │   ├── RequisitesInfoTile.html
│       │   ├── RequisitesInfoTile.js
│       │   └── RequisitesInfoTile.md
│       ├── StratDialogueCard/           ← Карточка цели
│       │   ├── CHANGELOG.md
│       │   ├── fixtures.json
│       │   ├── StratDialogueCard.css
│       │   ├── StratDialogueCard.html
│       │   ├── StratDialogueCard.js
│       │   └── StratDialogueCard.md
│       └── TeamInfoTile/                ← Команда клиента
│           ├── CHANGELOG.md
│           ├── fixtures.json
│           ├── TeamInfoTile.css
│           ├── TeamInfoTile.html
│           ├── TeamInfoTile.js
│           └── TeamInfoTile.md
├── data/
│   ├── clients.js                       ← clients.js — клиенты демо-данных концепта ibp-redesign-v1.
│   ├── dictionaries.js                  ← dictionaries.js — справочники и конфиги реестров концепта ibp-redesign-…
│   ├── employees.js                     ← employees.js — сотрудники демо-данных концепта ibp-redesign-v1.
│   ├── meetings.js                      ← meetings.js — встречи демо-данных концепта ibp-redesign-v1.
│   ├── nav-links.js                     ← nav-links.js — меню и карта страниц модулей Core. Один
│   ├── opportunities.js                 ← opportunities.js — сделки демо-данных концепта ibp-redesign-v1.
│   ├── potentials.js                    ← potentials.js — лиды демо-данных концепта ibp-redesign-v1.
│   ├── registry-table.js                ← registry-table.js — общий рендер реестров концепта ibp-redesign-v1.
│   ├── store.js                         ← store.js — общее хранилище прототипа ibp-redesign-v1.
│   └── tasks.js                         ← tasks.js — задачи демо-данных концепта ibp-redesign-v1.
├── refs/                                ← пусто
└── proto-panel/                         ← панель прототипа: сценарии показа и комментарии
    ├── comments.md                      ← комментарии к прототипу
    ├── flows.yaml                       ← сценарии показа
    └── panel-data.js                    ← генерат панели — руками не править
```
<!-- /@tree -->

## Имена фронтенда

Сущности модуля во фронтенде (снято с дерева фронтенда 24.09.2026) —
разложены по нашей форме. Экран или виджет, у которого здесь есть пара, называется
так же: разработчик находит его без перевода (`apps/README.md`, «widgets»).

| Куда у нас | Имена во фронтенде |
|---|---|
| `pages/` | ClientInfoDealsPage, ClientInfoFinancials, ClientInfoGoalsPage, ClientInfoPage, ClientsPage, ClientsRnpPage, MyClientsPage |
| `widgets/tiles/` | ClientRnpTile, ClientTile, ClientsRnpCacheTile, DocumentsInfoTile, GigaInfoTile, GoalArchiveSection, IndustryInfoTile, RequisitesInfoTile, TeamInfoTile |
| `widgets/tables/` | UcpClientTeamTable |
| `widgets/modals/` | ControlClientModal, GetEcmTicketModal, UcpClientSearchModal — у фронтенда в `features/` и `widgets/` |
| `widgets/popovers/` | GoalsPopoverBadge |
| другие виджеты | ClientForm, FinancialsChart, MyClientsHierarchicalTree — своей группы у нас нет: новая группа — в `project.json → appShape.widgetGroups` |
| мелкие элементы | ClientCard, ClientsModalActions, FinancialChartFilters, FinancialChartInfo, FinancialsChartLegend, GoalSegmentFilter, StratDialogueBadge, StratDialogueCard, StratDialogueUser, UcpClientInformationView, UcpClientReferenceView — у фронтенда `features/`; у нас — в разметке страницы или виджета |
