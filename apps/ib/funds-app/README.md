# funds-app — модуль раздела ib

Модуль повторяет модуль фронтенда `ib/funds-app` (маршрут `/funds-app/pipeline`,
плитка и пункт меню «Фонды» главной Руководителя IB, `director_ib`). Задача —
`docs/tasks/MS0020-funds-pipeline.md`.

Экран — `pages/FundsPipeline` «Фонды»: список фондов с фильтрами в тулбаре таблицы,
по клику на фонд — активы фонда справа в сплиттере, меню строк, пустые
состояния, стандартное окно ДС «Настройка таблицы», окна добавления (поиск в
базе фондов и в ЕПК), создания, редактирования и удаления фонда. Страницы
фонда и актива, окна активов, импорт данных и привязка к ЕПК пока не делаются.
Виджеты модуля на витрине «Локальные компоненты IB» — в разделе «Фонды». Страница вшивает виджеты метками
`<ds-include>`: открывают собранный `pages/FundsPipeline.preview.html`
(`node .agents/tools/assemble.mjs`). Демо-данные — `data/funds.js`, имена полей
из моков фронтенда.

Панель прототипа: Alt+Shift+P на любой странице; сценарии — proto-panel/flows.yaml.
Вариант демо-данных «Фондов нет» — таб System панели (или адрес `?state=empty`).

Аватарки модуля — разноцветные (решение человека 30.10.2026): страница ставит `data-av-tones`
на `<body>`, виджеты кладут `data-av-seed` = objectId фонда или актива — автоокраска Avatar ДС
1.006 даёт каждому объекту свой постоянный тон. Новая страница модуля ставит тот же атрибут.

## Что лежит

<!-- @tree — дерево генерирует .agents/tools/module-readme.mjs, руками не править -->
```
funds-app/
├── app.json                            ← запись хаба: «Фонды», трек product
├── README.md
├── pages/
│   ├── FundsPipeline.html              ← Фонды — источник, собирается в FundsPipeline.preview.html
│   ├── FundsPipeline.preview.html      ← собранная страница — открывать её
│   ├── FundsPipeline.scenario.mjs
│   └── FundsPipeline.screen.md         ← спека
├── widgets/
│   ├── context-menus/                  ← контекстные меню
│   │   ├── AssetActionsMenu/           ← Меню актива
│   │   │   ├── AssetActionsMenu.css
│   │   │   ├── AssetActionsMenu.html
│   │   │   ├── AssetActionsMenu.md
│   │   │   ├── AssetActionsMenuCustom.html
│   │   │   ├── CHANGELOG.md
│   │   │   └── fixtures.json
│   │   └── FundActionsMenu/            ← Меню фонда
│   │       ├── CHANGELOG.md
│   │       ├── fixtures.json
│   │       ├── FundActionsMenu.css
│   │       ├── FundActionsMenu.html
│   │       ├── FundActionsMenu.kit.scenario.mjs
│   │       ├── FundActionsMenu.md
│   │       └── FundActionsMenuCustom.html
│   ├── modals/                         ← модальные окна
│   │   ├── AddFundEntityFromUcpModal/  ← Добавить фонд — поиск в базах
│   │   │   ├── AddFundEntityFromUcpModal.css
│   │   │   ├── AddFundEntityFromUcpModal.html
│   │   │   ├── AddFundEntityFromUcpModal.js
│   │   │   ├── AddFundEntityFromUcpModal.kit.scenario.mjs
│   │   │   ├── AddFundEntityFromUcpModal.md
│   │   │   ├── CHANGELOG.md
│   │   │   └── fixtures.json
│   │   ├── DeleteFundModal/            ← Удалить фонд
│   │   │   ├── CHANGELOG.md
│   │   │   ├── DeleteFundModal.css
│   │   │   ├── DeleteFundModal.html
│   │   │   ├── DeleteFundModal.js
│   │   │   ├── DeleteFundModal.kit.scenario.mjs
│   │   │   ├── DeleteFundModal.md
│   │   │   └── fixtures.json
│   │   └── EditFundModal/              ← Форма фонда
│   │       ├── CHANGELOG.md
│   │       ├── EditFundModal.css
│   │       ├── EditFundModal.html
│   │       ├── EditFundModal.js
│   │       ├── EditFundModal.kit.scenario.mjs
│   │       ├── EditFundModal.md
│   │       └── fixtures.json
│   └── tables/                         ← таблицы
│       ├── AssetsTable/                ← Активы фонда
│       │   ├── AssetsTable.css
│       │   ├── AssetsTable.html
│       │   ├── AssetsTable.js
│       │   ├── AssetsTable.md
│       │   ├── CHANGELOG.md
│       │   └── fixtures.json
│       ├── FundsFilters/               ← Фильтры списка фондов
│       │   ├── CHANGELOG.md
│       │   ├── fixtures.json
│       │   ├── FundsFilters.css
│       │   ├── FundsFilters.html
│       │   ├── FundsFilters.js
│       │   ├── FundsFilters.kit.scenario.mjs
│       │   └── FundsFilters.md
│       └── FundsTable/                 ← Список фондов
│           ├── CHANGELOG.md
│           ├── fixtures.json
│           ├── FundsTable.css
│           ├── FundsTable.html
│           ├── FundsTable.js
│           ├── FundsTable.kit.scenario.mjs
│           └── FundsTable.md
├── data/
│   └── funds.js                        ← Фонды и их активы — демо-данные страницы FundsPipeline
├── refs/                               ← пусто
└── proto-panel/                        ← панель прототипа: сценарии показа и комментарии
    ├── comments.md                     ← комментарии к прототипу
    ├── flows.yaml                      ← сценарии показа
    └── panel-data.js                   ← генерат панели — руками не править
```
<!-- /@tree -->

## Имена фронтенда

Сняты с исходников фронтенда `funds-app` (`tmp/funds-app/src`,
`tmp/funds-app/PROJECT_STRUCTURE.md`, 30.10.2026).

| Куда у нас | Имена во фронтенде |
|---|---|
| `pages/` | `pages/FundsPipeline` (здесь), `Fund`, `Asset` (пока не делаются) |
| `widgets/tables/` | `widgets/tables/FundsFilters`, `FundsTable` (+ `ui/AssetsPreview`, `ui/EmptyFundsPreview`), `AssetsTable` (+ `ui/EmptyAssetsPreview`); ещё `BeneficiariesTable`, `ContactTable`, `MeetingProtocolTable`, `Owners` — страниц фонда и актива |
| `widgets/modals/` | `features/modals/AddFundEntityFromUcpModal`, `EditFundModal`, `DeleteFundModal` (Э2); `TableSetupHiddenColumnsModal` ← `shared/components/table/TableSetupHiddenColumns`; окна активов `AddAssetEntityFromUcpModal`, `EditAssetModal`, `DeleteAssetModal` — не делаются |
| `widgets/context-menus/` | `FundActionsMenu` ← `shared/hooks/useFundActions`, `AssetActionsMenu` ← `useAssetActions` (во фронтенде меню — `ContextMenuButton` в строке таблицы) |
| ячейки | `shared/components/table/FundOrAssetNameCell`, `FundPriorityCell`, `FundOrAssetIcon` — разметкой внутри FundsTable и AssetsTable |
