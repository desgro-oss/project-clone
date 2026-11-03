/* Реестр витрины локальных компонентов (Локальные компоненты IB) — меню и карточки страниц apps/local-components/ib/.

   СГЕНЕРИРОВАН kit-build.mjs из паспортов виджетов (apps/<раздел>/<модуль>/widgets/<группа>/<Имя>/<Имя>.md)
   и project.json → localKit. Руками не править: пересобрать — node .agents/tools/kit-build.mjs
   (гейт сверяет, шаг kit).

   Обычный <script>, а не JSON: страницы открываются по file://, где fetch не работает.

   Поля компонента: id — папка виджета; name, category, purpose, version, updated —
   из паспорта; type — tile | table | modal | popover | context-menu | part (подчасть)
   | model (статусная модель data/*-status-model.js: name, category, purpose — из meta);
   module — <раздел>/<модуль>; doc — страница компонента от папки витрины; owner —
   id компонента, чей это артефакт (окно, поповер) или часть (подчасть с partOf), или null;
   stub — заглушка. */
window.IBPKit = {
  "title": "Локальные компоненты IB",
  "categories": [
    "Общие",
    "Фонды",
    "Другое"
  ],
  "components": [
    {
      "id": "AddFundEntityFromUcpModal",
      "name": "Добавить фонд — поиск в базах",
      "category": "Фонды",
      "purpose": "Найти фонд в базе фондов и в ЕПК перед добавлением",
      "type": "modal",
      "typeLabel": "модальное окно",
      "module": "ib/funds-app",
      "doc": "ib/funds-app/AddFundEntityFromUcpModal.doc.html",
      "owner": "FundsTable",
      "stub": false,
      "version": "1.000",
      "updated": "30.10.2026"
    },
    {
      "id": "AssetActionsMenu",
      "name": "Меню актива",
      "category": "Фонды",
      "purpose": "Действия над активом фонда из строки таблицы активов",
      "type": "context-menu",
      "typeLabel": "контекстное меню",
      "module": "ib/funds-app",
      "doc": "ib/funds-app/AssetActionsMenu.doc.html",
      "owner": "AssetsTable",
      "stub": false,
      "version": "1.000",
      "updated": "30.10.2026"
    },
    {
      "id": "AssetsTable",
      "name": "Активы фонда",
      "category": "Фонды",
      "purpose": "Таблица активов выбранного фонда в правой панели сплиттера",
      "type": "table",
      "typeLabel": "таблица",
      "module": "ib/funds-app",
      "doc": "ib/funds-app/AssetsTable.doc.html",
      "owner": null,
      "stub": false,
      "version": "1.007",
      "updated": "30.10.2026"
    },
    {
      "id": "DeleteFundModal",
      "name": "Удалить фонд",
      "category": "Фонды",
      "purpose": "Подтвердить удаление фонда и его связей с активами",
      "type": "modal",
      "typeLabel": "модальное окно",
      "module": "ib/funds-app",
      "doc": "ib/funds-app/DeleteFundModal.doc.html",
      "owner": "FundActionsMenu",
      "stub": false,
      "version": "1.001",
      "updated": "30.10.2026"
    },
    {
      "id": "EditFundModal",
      "name": "Форма фонда",
      "category": "Фонды",
      "purpose": "Добавить фонд из ЕПК, создать новый фонд или изменить данные фонда",
      "type": "modal",
      "typeLabel": "модальное окно",
      "module": "ib/funds-app",
      "doc": "ib/funds-app/EditFundModal.doc.html",
      "owner": "FundActionsMenu",
      "stub": false,
      "version": "1.000",
      "updated": "30.10.2026"
    },
    {
      "id": "FundActionsMenu",
      "name": "Меню фонда",
      "category": "Фонды",
      "purpose": "Действия над фондом: из ЕПК и не из ЕПК",
      "type": "context-menu",
      "typeLabel": "контекстное меню",
      "module": "ib/funds-app",
      "doc": "ib/funds-app/FundActionsMenu.doc.html",
      "owner": "FundsTable",
      "stub": false,
      "version": "1.001",
      "updated": "30.10.2026"
    },
    {
      "id": "FundsFilters",
      "name": "Фильтры списка фондов",
      "category": "Фонды",
      "purpose": "Поиск по атрибутам фонда, фильтры по типу и приоритету",
      "type": "table",
      "typeLabel": "таблица",
      "module": "ib/funds-app",
      "doc": "ib/funds-app/FundsFilters.doc.html",
      "owner": null,
      "stub": false,
      "version": "3.001",
      "updated": "30.10.2026"
    },
    {
      "id": "FundsTable",
      "name": "Список фондов",
      "category": "Фонды",
      "purpose": "Таблица фондов с выбором фонда, меню строки и пустым состоянием",
      "type": "table",
      "typeLabel": "таблица",
      "module": "ib/funds-app",
      "doc": "ib/funds-app/FundsTable.doc.html",
      "owner": null,
      "stub": false,
      "version": "1.006",
      "updated": "30.10.2026"
    }
  ]
};
