/* Реестр витрины локальных компонентов (Локальные компоненты Core) — меню и карточки страниц apps/local-components/core/.

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
  "title": "Локальные компоненты Core",
  "categories": [
    "Общие",
    "Сделка",
    "Инструменты",
    "Другое"
  ],
  "components": [
    {
      "id": "DateBadge",
      "name": "Блок даты",
      "category": "Общие",
      "purpose": "Дата «листком календаря» в ведущем слоте строки встречи — «09 / окт» или день недели «ПТ / 13.10», без подложки",
      "type": "tile",
      "typeLabel": "тайл",
      "module": "core/dashboard-app",
      "doc": "core/dashboard-app/DateBadge.doc.html",
      "owner": null,
      "stub": false,
      "version": "1.004",
      "updated": "15.10.2026"
    },
    {
      "id": "HomeProfileTile",
      "name": "Профиль на главной",
      "category": "Другое",
      "purpose": "Кто вошёл — фото, имя, должность и деск, связь — и быстрый вход в создание встречи и задачи",
      "type": "tile",
      "typeLabel": "тайл",
      "module": "core/dashboard-app",
      "doc": "core/dashboard-app/HomeProfileTile.doc.html",
      "owner": null,
      "stub": false,
      "version": "1.003",
      "updated": "15.10.2026"
    },
    {
      "id": "HomeTasksTile",
      "name": "Задачи",
      "category": "Другое",
      "purpose": "Задачи по срочности — свои или деска, со статусом в строке и сменой статуса через меню строки",
      "type": "tile",
      "typeLabel": "тайл",
      "module": "core/dashboard-app",
      "doc": "core/dashboard-app/HomeTasksTile.doc.html",
      "owner": null,
      "stub": false,
      "version": "1.005",
      "updated": "15.10.2026"
    },
    {
      "id": "MeetingCreateModal",
      "name": "Новая встреча",
      "category": "Другое",
      "purpose": "Быстро назначить встречу с клиентом с главной — клиент, тема, дата и время",
      "type": "modal",
      "typeLabel": "модальное окно",
      "module": "core/dashboard-app",
      "doc": "core/dashboard-app/MeetingCreateModal.doc.html",
      "owner": "MeetingsTile",
      "stub": false,
      "version": "1.001",
      "updated": "15.10.2026"
    },
    {
      "id": "MeetingsTile",
      "name": "Встречи",
      "category": "Другое",
      "purpose": "Ближайшие встречи сотрудника с клиентами — с выборками «сегодня», «на неделе», «требует внимания»",
      "type": "tile",
      "typeLabel": "тайл",
      "module": "core/dashboard-app",
      "doc": "core/dashboard-app/MeetingsTile.doc.html",
      "owner": null,
      "stub": false,
      "version": "1.004",
      "updated": "15.10.2026"
    },
    {
      "id": "NewsTile",
      "name": "Новости по клиентам",
      "category": "Другое",
      "purpose": "Свежие публикации о клиентах сотрудника, деска или избранных — повод для звонка и тема встречи",
      "type": "tile",
      "typeLabel": "тайл",
      "module": "core/dashboard-app",
      "doc": "core/dashboard-app/NewsTile.doc.html",
      "owner": null,
      "stub": false,
      "version": "1.004",
      "updated": "15.10.2026"
    },
    {
      "id": "StatCard",
      "name": "Карточка-счётчик",
      "category": "Общие",
      "purpose": "Число с подписью и тоном, по клику включает выборку списка — счётчики встреч главной",
      "type": "tile",
      "typeLabel": "тайл",
      "module": "core/dashboard-app",
      "doc": "core/dashboard-app/StatCard.doc.html",
      "owner": null,
      "stub": false,
      "version": "1.001",
      "updated": "15.10.2026"
    },
    {
      "id": "TaskCreateModal",
      "name": "Новая задача",
      "category": "Другое",
      "purpose": "Быстро поставить себе задачу с главной — формулировка, срок, приоритет, клиент и сделка",
      "type": "modal",
      "typeLabel": "модальное окно",
      "module": "core/dashboard-app",
      "doc": "core/dashboard-app/TaskCreateModal.doc.html",
      "owner": "HomeTasksTile",
      "stub": false,
      "version": "1.000",
      "updated": "09.10.2026"
    }
  ]
};
