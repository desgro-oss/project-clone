---
screen: HomePage
kind: screen
title: Главная страница IBP (по ролям)
file: apps/core/host-app/pages/HomePage.html
module: core/host-app
frontend: core/host-app/pages/HomePage
route: не решено (20.10.2026)
source: роль «Аналитик ДИД» — каталог design-system/patterns/HomeRoles/ibp-home.js, как на главной концепта core/drafts/ibp-redesign-v1 (29.10.2026); структура фронтенда host-app (README.md, STRUCTURE.md, src — переданы человеком 29.10.2026); скриншоты главной и меню роли «Руководитель IB» (29.10.2026); каталог разделов — design-system/patterns/HomeRoles/ibp-home.js
version: "4.200"
created: "12.09.2026"
updated: "30.10.2026"
design_system: IBP DS
components: [Layout, NavPanel, NavTile, Modal, Buttons, EmptyState, Link, Badge, Avatar, IconButton, Illustrations, Tooltip]
widgets: []
---

# Page: HomePage — Главная страница IBP

## 1. Назначение (Purpose)

### Бизнес-смысл (Business context)

| Вопрос | Ответ |
|---|---|
| Зачем существует | Дать сотруднику вход в разделы его роли; для Аналитика использовать dashboard-app |
| Кто заполняет и когда | Роль выбирается в служебном окне прототипа; продуктовый регламент логина не уточнялся |
| Кто пользуется результатом | Три роли: analyst («Аналитик ДИД», Pre), core_analyst («Аналитик», Core), director_ib («Руководитель IB», IB) |
| Бизнес-правила | Главная analyst и director_ib — host-app; новая роль core_analyst — dashboard-app; матрица прав не изменяется |

Источники: уточнение человека 30.10.2026, `docs/tasks/RE0044a-three-separate-roles.md`. Предыдущее объединение двух Аналитиков в RE0044 было ошибкой агента.

Плиточная главная ролей «Аналитик ДИД» и «Руководитель IB» и совместимый вход по адресу
`HomePage.html?role=<код>`. Код `core_analyst` перенаправляет на
`../../dashboard-app/pages/HomePage.preview.html?role=core_analyst`.
Дашборд является главной Аналитика по решению человека 30.10.2026.

**Роли прототипа** (`data/authentication.js`; analyst/director_ib — коды фронтенда, core_analyst — новый код прототипа):

| Код роли | Имя во фронтенде | Подпись | Команда | Строка хаба |
|---|---|---|---|---|
| `analyst` | Analyst | Аналитик ДИД | Pre | Pre → «Главная — Аналитик ДИД» |
| `core_analyst` | пара не установлена; CoreAnalyst — прототип | Аналитик | Core | Core → «Главная - Аналитик (Дашборд)», app.json dashboard-app |
| `director_ib` | DirectorIB | Руководитель IB | IB | IB → «Главная — Руководитель IB» |

Новая роль — запись в `data/authentication.js`, её колонки в `data/dashboard.js`
и блоки меню в `data/navigation.js`; адрес — поле `home`. Строки хаба прежних главных Pre и IB — `project.json → roleHomes`, главной Аналитика — `dashboard-app/app.json`.

## 2. Адрес и навигация (Route)

- **Адрес прототипа:** `HomePage.html?role=<код>`; без параметра или с
  неизвестным кодом — роль по умолчанию `director_ib`.
- **Адрес в продукте:** не решено (20.10.2026); у фронтенда — корень приложения.
- **Пункт бокового меню** в состоянии `nav__item--selected`: «Главная».
- **Хлебных крошек нет** (решение человека 29.10.2026) — раздел 16, №2.
- **Смена роли** — кнопка выхода в футере меню (`.nav__logout`, как в ДС): окно
  «Сменить роль».
- Шапки страницы (PageHeader) нет — правило стартовой страницы Layout.

## 3. Сценарии (Scenarios)

Не решено (30.10.2026) — имён сценариев в ТЗ и бизнес-контексте страницы нет; вопрос в разделе 16.

## 4. Пары во фронтенде (Frontend pairs)

| Элемент | Прототип | Фронтенд |
|---|---|---|
| Страница | `HomePage.html` | core/host-app/pages/HomePage |

Соответствие по элементам — не решено (30.10.2026); заполнить по правилу 3 скилла
`screen-spec` (README модуля, `docs/misc/project-tree.md`). Таблица соответствия
файлов — раздел 13.

## 5. Раскладка (Layout)

```
.nav-layout
├── nav.nav.nav--rail              боковое меню роли (раздел 6); кнопка выхода в футере — вход в окно «Сменить роль»
└── .screen                        верхний отступ контента 24 (--layout-pad-top), крошек нет
    └── main.screen__content
        └── .home-wrap             фон — ::before с background-illustration, cover, opacity .6
            └── .grid12#homeGroups (12, зазор 16) сетка групп
                └── section.col-3.colw-6 ×N   группа: H6 (Regular) + NavTile, зазор 16
#roleModal                         окно «Сменить роль» (Modal w8): 4 колонки команд
```

**Блоки контента роли «Руководитель IB»:**

| № | Блок | Компонент | Колонок из 12 | Содержимое |
|---|---|---|---|---|
| 1 | Группа «Origination» | заголовок `h2.ds-h6-reg` + NavTile ×4 | 3 (`.col-3 colw-6`) | Потенциалы DCM, Прайсер облигаций, Фонды, AI Pitcher |
| 2 | Группа «Pipeline» | то же, NavTile ×4 | 3 | M&A Pipeline, Pipeline DCM, Pipeline ECM, Реестр платежей IB |
| 3 | Группа «Клиенты и задачи» | то же, NavTile ×3 | 3 | Клиенты, Встречи, Задачи |

Перестроение 4 → 2 → 1 колонки с порогами 1700 и 900 по ширине **рабочей
области** (не окна): первый шаг — штатная пара `.col-N` / `.colw-N`, второй —
правило экрана той же специфичности (0,2,0) ниже по файлу. Вертикальный скролл — у контентной
области; горизонтального нет.

**Плитки роли «Руководитель IB»** (`data/dashboard.js`, поля — `DashboardItem` фронтенда):

| Группа | Плитка | Описание | Иллюстрация | `name` / `route` фронтенда | Ссылка в прототипе |
|---|---|---|---|---|---|
| Origination | Потенциалы DCM | Кредиты клиентов банка с потенциалом перевода в облигации | `dcm-potentials` | potentialsApp · `/potentials-app/register` | `#` |
| Origination | Прайсер облигаций | Расчёт облигаций | `reserve` | bondsPriceCalculationApp · `/bonds-price-calculation-app/calculation` | `#` |
| Origination | Фонды | Анализ фондов, активов и поиск потенциалов | `qliksense-reports` | fundsApp · `/funds-app/pipeline` | `#` |
| **Origination** | **AI Pitcher** | Подготовка отчетов для встречи с клиентом | `rwa` | bankerApp · `/banker-app/chat` | `ib/banker-app/pages/RequestThread.html` |
| Pipeline | M&A Pipeline | Все сделки M&A | `mna-pipeline` | maOpportunitiesApp · `/ma-opportunities-app/pipeline` | `#` |
| Pipeline | Pipeline DCM | Текущие DCM проекты | `dcm-pipeline` | dcmecmApp · `/dcmecm-app/DCM/pipeline` | `#` |
| Pipeline | Pipeline ECM | Текущие ECM проекты | `ecm-pipeline` | dcmecmApp · `/dcmecm-app/ECM/pipeline` | `#` |
| Pipeline | Реестр платежей IB | Платежи по всем направлениям IB | `payment-ib` | ibPaymentsApp · `/ib-payments-app/register` | `#` |
| Клиенты и задачи | Клиенты | Работа с моими клиентами | `clients` | clientsApp · `/clients-app/my-clients` | `../../clients-app/pages/MyClientsPage.preview.html` |
| Клиенты и задачи | Встречи | Встречи и протоколы моего деска | — (штриховая заглушка) | meetingsProtocolsApp · `/meetings-protocols-app/meetings/my-meetings` | `#` |
| Клиенты и задачи | Задачи | Все задачи моего деска | `tasks` | tasksApp · `/tasks-app/tasks` | `../../tasks-app/pages/TasksPage.preview.html` |

Для роли `core_analyst` плитки на этой странице не строятся: совместимый вход
перенаправляет на главную `core/dashboard-app`. Состав её тайлов и поведение
описаны в `apps/core/dashboard-app/pages/HomePage.screen.md`.

**Плитки прежней роли «Аналитик ДИД» (`analyst`, Pre):** 6 групп, 20 плиток.
Состав восстановлен из существующего каталога `data/dashboard.js` без изменения.

| Группа | Плитка | Маршрут | Ссылка |
|---|---|---|---|
| Origination | Обязательные сделки | /opportunities-app/binding/active-opportunities | # |
| Origination | Возможные сделки | /opportunities-app/possible/active-opportunities | # |
| Origination | Лиды | /offersources-app/leads-did/leads | # |
| Origination | Обязательные лиды | /offersources-app/binding-leads/to-process-leads | # |
| Origination | Возможные лиды | /offersources-app/possible-leads/to-process-leads | # |
| Origination | Проекты продаж CIB | /salesources-app/sales-projects | # |
| Origination | Кампании продаж | /opportunities-app/campaigns/active-opportunities | # |
| Pipeline | Pipeline | /opportunities-app/pipeline/my-desk-opportunities | # |
| Pipeline | Pipeline ЦКП | /b3-opportunities-app/pipeline-dcp/my-desk-opportunities | # |
| Pipeline | M&A Pipeline | /ma-opportunities-app/pipeline | # |
| Pipeline | Календарь КПКИ | внешний маршрут | # |
| Текущий портфель ДИД | Текущий портфель | /deals-app/deal | ../../../postrade/deals-app/pages/Portfolio.html |
| Текущий портфель ДИД | CF СБИ | /deals-app/plan-payments-did | # |
| Текущий портфель ДИД | Корпоративные запросы | /corporaterequests-app/requests-register, /corporaterequests-app/mail-register | # |
| Отчёты | Отчёты для Рисков | /postreports-app/rwa-values, /postreports-app/rwa-reports, /postreports-app/ocp-reports | # |
| Клиенты и задачи | Клиенты | /clients-app/my-clients | ../../clients-app/pages/MyClientsPage.preview.html?role=analyst |
| Клиенты и задачи | Встречи | /meetings-protocols-app/meetings/my-meetings | # |
| Клиенты и задачи | Задачи | /tasks-app/tasks | ../../tasks-app/pages/TasksPage.preview.html?role=analyst |
| Администрирование | Отчеты Qliksense | внешний маршрут | # |
| Администрирование | Администрирование | host-app/admin | # |

## 6. Компоненты (Components)

| Компонент | Откуда | Где на экране | Варианты и ключевые параметры |
|---|---|---|---|
| Layout | ДС — `design-system/foundations/Layout/Layout.md` | каркас | стартовая страница: без PageHeader, фон-иллюстрация; без крошек |
| NavPanel | ДС — `design-system/components/organisms/NavPanel/NavPanel.md` | боковое меню | `nav--rail`; состав — ниже |
| NavTile | ДС — `design-system/components/molecules/NavTile/NavTile.md` | плитки разделов | обычный `<a class="ntile">`; «со ссылками» — `div.ntile` + `.ntile__title-link` + `.ntile__links` (Корпоративные запросы, Отчёты для Рисков) |
| Modal | ДС — `design-system/components/organisms/Modal/Modal.md` | окно «Сменить роль» | `modal--w8`, тело — `.grid12` из 4 колонок `col-3`, подвал — «Закрыть» (Accent); триггер — `data-modal` на кнопке выхода `.nav__logout` |
| Buttons | ДС — `design-system/components/atoms/Buttons/Buttons.md` | роли в окне | `btn--outline btn--m btn--fullwidth`: другая роль — ссылка `<a>` на `roleHomeHref(code)`, текущая — `disabled` |
| EmptyState | ДС — `design-system/components/molecules/EmptyState/EmptyState.md` | колонка команды без ролей | `es--m`, «Ролей пока нет» |
| Link | ДС — `design-system/components/atoms/Link/Link.md` | ссылки плиток «со ссылками» | `link--accent link--m` |
| Illustrations | ДС — `design-system/foundations/Illustrations/Illustrations.md` | плитки | имена — таблица плиток |
| Badge | ДС — `design-system/components/atoms/Badge/Badge.md` | пункт меню «Задачи» | счётчик 12 |
| Avatar | ДС — `design-system/components/atoms/Avatar/Avatar.md` | футер меню | инициалы «АП» |
| IconButton | ДС — `design-system/components/atoms/IconButton/IconButton.md` | бургер, пин, «Выйти» | `--neutral` |
| Tooltip | ДС — `design-system/components/molecules/Tooltip/Tooltip.md` | подписи пунктов меню в rail | — |

**Боковое меню роли «Руководитель IB»** (`data/navigation.js`, поля — `NavigationItems` фронтенда).
Пункт «Главная» добавляет страница. Та же разметка — на странице AI Pitcher
(`ib/banker-app/pages/RequestThread.html`), отличается выделенный пункт.

| Группа | Пункт | Глиф | Ссылка |
|---|---|---|---|
| — | Главная | `main-page` | — (текущая) |
| Origination | Потенциалы DCM | `dcm-potentials` | `#` |
| Origination | Прайсер облигаций | `calc` | `#` |
| Origination | Фонды | `funds` | `#` |
| **Origination** | **AI Pitcher** | `ai-stars` | `ib/banker-app/pages/RequestThread.html` |
| Pipeline | M&A Pipeline | `mna-pipeline` | `#` |
| Pipeline | DCM Pipeline | `dcm-pipeline` | `#` |
| Pipeline | ECM Pipeline | `ecm-pipeline` | `#` |
| Pipeline | Реестр платежей IB | `payments-ib` | `#` |
| Клиенты и задачи | Клиенты | `factory-01` | `../../clients-app/pages/MyClientsPage.preview.html` |
| Клиенты и задачи | Поиск клиентов в ЕПК | `client-search` | `#` (во фронтенде — событие `ToggleUcpSearch`, модалка поиска) |
| Клиенты и задачи | Задачи | `tasks`, Badge 12 | `../../tasks-app/pages/TasksPage.preview.html` |
| Клиенты и задачи | Встречи | `calendar` | `#` |

**Футер меню:** Александров Пётр Константинович (`data/authentication.js`,
`currentEmployee`), должность — подпись текущей роли. Строка пользователя ведёт
на хаб проектов (корневой `index.html`, `aria-label="Хаб проектов"`) — служебный
переход прототипа, в продукт не переносится.

## 7. Таблицы (Tables)

Таблиц на экране нет.

## 8. Поведение (Behavior)

| Триггер | Результат |
|---|---|
| Открытие страницы | core_analyst перенаправляется на dashboard-app; analyst строит прежнюю главную ДИД, director_ib и неизвестный код — главную IB |
| Кнопка выхода в футере меню | окно «Сменить роль»: колонки Post · Pre · IB · Core с ролями команд |
| Клик по роли в окне | переход на главную роли из authentication.js: Аналитик → dashboard-app, Руководитель IB → host-app |
| Крестик, «Закрыть», Esc, клик по скриму | окно закрывается (рантайм Modal) |
| Клик по пункту-аккордеону меню | подпункты раскрываются (рантайм NavPanel) |
| Бургер | меню разворачивается из rail в drawer и обратно |
| Пин | drawer ↔ fixed, режим сохраняется в `localStorage` и переживает переход между экранами |
| Наведение на пункт в rail | подпись всплывает тултипом |
| Клик по плитке или пункту меню «AI Pitcher» | переход в «Новый отчёт» (`ib/banker-app/pages/RequestThread.html`) |
| Клик по остальным плиткам и пунктам | ничего не происходит (`#`) |
| Сужение рабочей области до 1700 / 900px | группы перестраиваются 4 → 2 → 1 |

Сборку разметки по данным роли делает скрипт страницы до рантайма ДС; поведение
компонентов — рантайм ДС.

## 9. Модальные окна (Modals)

**Окно «Сменить роль»** (`#roleModal`, Modal `modal--w8`) — служебное окно прототипа.

| Часть | Что |
|---|---|
| Триггер | кнопка выхода в футере меню (`.nav__logout`, `data-modal="roleModal"`, `aria-label="Сменить роль / выйти"`) |
| Шапка | «Сменить роль» + крестик |
| Тело | `.grid12`, 4 колонки `col-3`: Post · Pre · IB · Core — заголовок H6 Strong и роли команды кнопками `btn--outline btn--m btn--fullwidth`; другая роль — ссылка на главную из `roleHomeHref(code)`, текущая — `disabled`; команда без ролей — EmptyState M «Ролей пока нет» |
| Подвал | «Закрыть» (Accent) |
| Закрытие | крестик, «Закрыть», Esc, клик по скриму (рантайм Modal) |

Как в каталоге ДС: `IBPHome.footerHTML(role, {logoutModal})` — кнопка выхода с `data-modal`.

## 10. Состояния (States)

### Loading
Состояния загрузки нет: состав главной — демо-данные.

### Empty
Роль без групп не предусмотрена; группа без плиток не показывается. Раздел без
плитки — пункт есть в меню, плитки нет («Поиск клиентов в ЕПК»).

### Error
Неизвестная роль в адресе — роль по умолчанию, без сообщения.

### Disabled
На главной недоступных элементов нет; плитки разделов без экранов — ссылки `#`, без
визуального состояния «недоступно». В окне «Сменить роль» текущая роль — кнопка `disabled`.

### Узкая рабочая область
4 → 2 → 1 колонки; длинное название плитки усекается многоточием (корнер-кейс NavTile).

## 11. Тексты интерфейса (Texts)

| Место | Текст |
|---|---|
| Кнопка выхода | `aria-label` — «Сменить роль / выйти» (как в демо NavPanel ДС) |
| Окно смены роли | заголовок «Сменить роль» · колонки Post · Pre · IB · Core · пустая колонка «Ролей пока нет» · кнопка «Закрыть» |
| Заголовки групп | Origination · Pipeline · Клиенты и задачи |
| Плитки | названия и описания — таблица плиток, раздел 5 |
| Футер меню | Александров Пётр Константинович · Руководитель IB |
| Подпись выхода | Выйти |

## 12. Данные (Data dependencies)

### API — что нужно от бэкенда
Текущий пользователь и его роли (`CurrentEmployeeRsDto`: ФИО, `roles`) и права,
по которым фронтенд режет плитки и пункты меню; счётчик задач для Badge (у
фронтенда — сокет `openTasksCountWebSocket`).

### Mock — демо-данные прототипа

| Файл | Что | Имена фронтенда |
|---|---|---|
| `data/authentication.js` | роли (`localUserList`), роль по умолчанию, пользователь | `localUserMap`, `LoginForRolesKeys`, `CurrentEmployeeRsDto` |
| `data/dashboard.js` | колонки плиток по ролям (`homePageDashboardItems`) | `DashboardColumn`, `DashboardItem`, `useHomePageDashboardItems` |
| `data/navigation.js` | блоки меню по ролям (`navigationItems`) | `NavigationItems`, `widgets/Sidebar` |

`title` роли, иллюстрации и `href` — прототипа (invented); `code`, `name`, `route` — дословно из фронтенда.

### Permissions — роли, права, флаги

| Роль | Просмотр | Действия |
|---|---|---|
| Руководитель IB (`director_ib`) | группы Origination, Pipeline, Клиенты и задачи | переход в разделы |
| Аналитик (`core_analyst`) | главная dashboard-app, разделы — в её меню | перенаправление, матрица прав не изменяется |

## 13. Соответствие файлов (Implementation mapping)

| Элемент | Прототип | Фронтенд |
|---|---|---|
| Страница | `pages/HomePage.html` | `src/pages/HomePage/HomePage.tsx` |
| Плитки по роли | `data/dashboard.js` | `src/shared/hooks/dashboard/useHomePageDashboardItems.tsx` + права роли |
| Меню по роли | `data/navigation.js` | `src/widgets/Sidebar` (`useNavigationItems`) |
| Роли | `data/authentication.js` | `src/shared/authentication/authentication.const.ts` |
| Смена роли | окно «Сменить роль» по кнопке выхода | нет — во фронтенде роль приходит с логином (`LoginPage`) |

## 14. Доступность (Accessibility)

- `<main>` для контентной области, `<nav aria-label>` у меню;
- у кнопок-иконок меню есть `aria-label`; кнопка выхода — «Сменить роль / выйти»;
- счётчик задач продублирован в `aria-label` пункта («Задачи, 12»), сам Badge — `aria-hidden`;
- иллюстрации — `aria-hidden`;
- заголовки групп — `h2`, плиток — `h3`.

## 15. Осознанные отклонения (Deviations)

Осознанные отклонения описаны в открытых вопросах (раздел 16): пп. 2, 3, 11 — отклонения от Layout и каталога ДС, решения человека 29–30.10.2026.

## 16. Открытые вопросы и допущения (Open questions)

| № | Вопрос / допущение | Статус |
|---|---|---|
| 1 | **Куда ведут плитки разделов без экранов** (Прайсер облигаций, Встречи) и модулей IB без экранов | **вопрос человеку**: пока `#` |
| 2 | **Хлебных крошек нет.** По правилу Layout крошки есть всегда, кроме Дашборда | **решение человека** 29.10.2026 — отклонение от Layout |
| 3 | **Заголовок группы — H6** (Regular, `.ds-h6-reg`: «подзаголовок блоков, где избыточен H6 Strong»). По правилу Layout — H5 Strong; на скриншоте — мелкая подпись с линией | **решение человека** 29–30.10.2026 — отклонение от Layout
| 4 | **Смена роли** — кнопка выхода в футере меню открывает окно со всеми ролями (служебный переход прототипа вместо логина под ролью), как в каталоге ДС | **решение человека** 30.10.2026; в продукт не переносится |
| 5 | **Пункт «Главная» в меню.** На скриншоте меню его нет; в NavPanel ДС список начинается с «Главная» | **допущение**: пункт оставлен |
| 6 | **Пользователь в футере.** На скриншоте — реальный сотрудник с техническим кодом роли и строкой деска | **допущение**: демо-пользователь, должность — подпись роли |
| 7 | **Иллюстрации** «Прайсер облигаций» — `reserve`, «Фонды» — `qliksense-reports`, «AI Pitcher» — `rwa`; у «Встреч» иллюстрации в ДС нет — штриховая заглушка | **допущение** по скриншоту |
| 8 | **Глиф «Прайсер облигаций»** — `calc` | **допущение** |
| 9 | **Счётчик задач** — 12, как на скриншоте | **допущение** (демо) |
| 10 | Плитка «AI Pitcher» ведёт сразу в «Новый отчёт» | **решено заказчиком** |
| 11 | **Меню и плитки — свои данные прототипа**, а не `IBPHome.itemsFor(role)`: ролей фронтенда, «AI Pitcher» и «Прайсер облигаций» в каталоге `ibp-home.js` нет, файлы ДС не меняются | **отклонение от каталога ДС**: снимается, когда владелец ДС добавит роли в `ibp-home.js` |
| 12 | **Главная Финансиста ДИД** (`postrade/deals-app/pages/MainPage.html`) пока живёт в модуле Post | **к переносу** сюда ролью `financier` — по решению человека |
| 13 | **Отступ контента от верха — 24** вместо 8 у Layout (крошек нет) | **решение человека** 29.10.2026 |
| 14 | Главная Аналитика и его навигация | **решение человека 30.10.2026**: dashboard-app в Core; меню сохраняет доступные разделы, включая Текущий портфель |
| 15 | **Плитки с внешними ссылками** (Календарь КПКИ, Отчеты Qliksense) во фронтенде берут адрес из настроек | `#` |
| 16 | Имена бизнес-сценариев страницы (раздел 3) не известны — заполнятся, когда появится сценарный раздел | не решено (30.10.2026) |
