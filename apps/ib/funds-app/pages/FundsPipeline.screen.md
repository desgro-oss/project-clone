---
screen: FundsPipeline
kind: screen
title: Фонды
file: apps/ib/funds-app/pages/FundsPipeline.preview.html
module: ib/funds-app
frontend: ib/funds-app/pages/FundsPipeline
route: /funds-app/pipeline
source: макеты «IB / Funds» (скриншоты, 30.10.2026), задача docs/tasks/MS0020-funds-pipeline.md
version: "1.002"
created: "30.10.2026"
design_system: IBP DS
components: [Layout, NavPanel, Breadcrumbs, PageHeader, Buttons, Splitter]
widgets: [tables/FundsFilters, tables/FundsTable, tables/AssetsTable, modals/AddFundEntityFromUcpModal, modals/EditFundModal, modals/DeleteFundModal, context-menus/FundActionsMenu, context-menus/AssetActionsMenu]
---

# Page: FundsPipeline — Фонды

## 1. Назначение (Purpose)

### Бизнес-смысл (Business context)

| Вопрос | Ответ |
|---|---|
| Зачем существует | Вести список фондов и их активов: найти фонд по атрибутам, отобрать по типу и приоритету, посмотреть активы фонда |
| Кто заполняет и когда | Руководитель IB добавляет фонды вручную («Добавить фонд» → поиск в базах → форма фонда). Первичную загрузку из .xls делает администратор IB при первом запуске системы — у Руководителя IB импорта нет (решение человека 30.10.2026) |
| Кто пользуется результатом | Руководитель IB (`director_ib`) — раздел «Origination» главной. Другие роли — не решено (30.10.2026) |
| Бизнес-правила | Фонд бывает из ЕПК (связан с клиентом — есть `partyId`) и не из ЕПК: меню строки у них разное. Активы — только вложенная таблица фонда; отдельного поиска актива нет (решение человека 30.10.2026). Права на действия (создать, редактировать, удалить фонд, добавить актив) — во фронтенде флагами `usePermissions`; состав прав ролей — не решено (30.10.2026) |

Источники: задача `docs/tasks/MS0020-funds-pipeline.md` (решения человека 30.10.2026), фронтенд `funds-app` (`pages/FundsPipeline`, `shared/hooks/useFundActions.tsx`).

Страница раздела «Фонды»: Руководитель IB приходит с плитки или пункта меню
«Фонды» главной, ищет фонд и смотрит его активы.

**Роль пользователя:** Руководитель IB (`director_ib`)
**Права:** не решено (30.10.2026) — в прототипе все действия доступны

## 2. Адрес и навигация (Route)

- **Адрес в продукте:** `/funds-app/pipeline` (host-app, `routes.ib.ts`).
- **Вход:** плитка «Фонды» и пункт меню «Фонды» главной Руководителя IB
  (`apps/core/host-app/data/dashboard.js`, `navigation.js` — поле `href`).
- **Пункт бокового меню** в состоянии `nav__item--selected`: «Фонды» (меню —
  как на `ib/banker-app/pages/RequestThread.html`).

| Уровень крошек | Текст | Ссылка |
|---|---|---|
| 1 | Главная | `../../../core/host-app/pages/HomePage.html?role=director_ib` |
| 2 (текущий) | Фонды | — |

Демо-параметры адреса (карта экранов IB, панель прототипа):

| Параметр | Что показывает |
|---|---|
| — | список фондов, активы скрыты |
| `?fund=fnd-001` | выбран Интеррос — активы справа |
| `?fund=fnd-004` | выбран РФПИ — пустые активы |
| `?state=empty` | фондов нет — пустое состояние, фильтры выключены |

## 3. Сценарии (Scenarios)

Не решено (30.10.2026) — имён сценариев в ТЗ и бизнес-контексте страницы нет; вопрос в разделе 16.

## 4. Пары во фронтенде (Frontend pairs)

| Элемент | Прототип | Фронтенд |
|---|---|---|
| Страница | `FundsPipeline.preview.html` | ib/funds-app/pages/FundsPipeline |

Соответствие по элементам — не решено (30.10.2026); заполнить по правилу 3 скилла
`screen-spec` (README модуля, `docs/misc/project-tree.md`). Таблица соответствия
файлов — раздел 13.

## 5. Раскладка (Layout)

```
Page (Layout, nav--rail, .screen--app — фиксированный вьюпорт)
├── Breadcrumbs            — Главная / Фонды
├── PageHeader             — «Фонды», действие «Добавить фонд»
└── Splitter (.splitpane, вся оставшаяся высота)
    ├── панель A — FundsTable    список фондов без заголовка; в тулбаре — FundsFilters
    │                            (поиск, «Все типы», «Все приоритеты») и шестерёнка настройки
    ├── .spl                     — только когда выбран фонд
    └── панель B — AssetsTable   «Активы <фонд>» — только когда выбран фонд
```

**Шапка страницы (PageHeader):**

| Элемент | Значение | Компонент / класс |
|---|---|---|
| Заголовок | Фонды | `h1.phead__title` |
| Действие (главное) | Добавить фонд | `btn btn--accent btn--m`, глиф `add`; окно `AddFundEntityFromUcpModal` |

«Импортировать данные» на странице нет — экран администратора IB (решение
человека 30.10.2026).

**Блоки контента** — один поток, ритм 12px (страница с таблицей):

| № | Блок | Компонент или виджет | Ширина | Содержимое |
|---|---|---|---|---|
| 1 | Список фондов | `widgets/tables/FundsTable` в панели A сплиттера | 100% или доля сплиттера | паспорт виджета |
| 2 | Фильтры | `widgets/tables/FundsFilters` в тулбаре списка фондов (`FundsTable.placeFilters`) | ширина тулбара до шестерёнки | паспорт виджета |
| 3 | Активы фонда | `widgets/tables/AssetsTable` в панели B сплиттера | доля сплиттера | паспорт виджета |

Сплиттер: по умолчанию 50 / 50, границы 35–75% (как в сплиттерах
`ClientInfoPage` концепта ibp-redesign-v2); своей рамки и подложки нет —
карточки рисуют виджеты. Вертикального скролла страницы нет: скроллятся тела
таблиц, горизонтальный скролл — внутри таблицы, когда панель узкая.

## 6. Компоненты (Components)

| Компонент | Откуда | Где на экране | Варианты и ключевые параметры |
|---|---|---|---|
| Layout | ДС — `design-system/foundations/Layout/Layout.md` | каркас | `nav--rail`, `.screen--app` |
| NavPanel | ДС — `design-system/components/organisms/NavPanel/NavPanel.md` | меню | пункт «Фонды» выбран |
| Breadcrumbs | ДС — `design-system/components/molecules/Breadcrumbs/Breadcrumbs.md` | зона крошек | `data-breadcrumbs` |
| PageHeader | ДС — `design-system/components/organisms/PageHeader/PageHeader.md` | шапка | заголовок + одно действие |
| Splitter | ДС — `design-system/components/molecules/Splitter/Splitter.md` | список фондов и активы | `DSSplitter.wire`, min 35, max 75 |
| `FundsFilters` | виджет модуля — `../widgets/tables/FundsFilters/FundsFilters.md` | в тулбаре списка фондов (сценарий страницы переносит в слот таблицы) | метка `id="fundsFilters"` |
| `FundsTable` | виджет модуля — `../widgets/tables/FundsTable/FundsTable.md` | панель A | метка `id="fundsTable"` |
| `AssetsTable` | виджет модуля — `../widgets/tables/AssetsTable/AssetsTable.md` | панель B | метка `id="assetsTable"` |
| Table → TableSettings | ДС — `design-system/components/organisms/Table/Table.md`, «Настройка таблицы» | по шестерёнке в тулбаре обеих таблиц | стандартное окно ДС, хук `data-table-settings` в виджетах, вид колонок держит `data-table-persist` на время сессии |
| `AddFundEntityFromUcpModal` | виджет модуля — `../widgets/modals/AddFundEntityFromUcpModal/AddFundEntityFromUcpModal.md` | по «Добавить фонд» | метка `id="addFundEntityFromUcpModal"` |
| `EditFundModal` | виджет модуля — `../widgets/modals/EditFundModal/EditFundModal.md` | после поиска; «Редактировать» в меню фонда | метка `id="editFundModal"` |
| `DeleteFundModal` | виджет модуля — `../widgets/modals/DeleteFundModal/DeleteFundModal.md` | «Удалить фонд» в меню фонда | метка `id="deleteFundModal"` |
| `FundActionsMenu` | виджет модуля — `../widgets/context-menus/FundActionsMenu/FundActionsMenu.md` | «⋮» строки фонда | `fundActionsMenu` (из ЕПК), `fundActionsMenuCustom` (не из ЕПК) |
| `AssetActionsMenu` | виджет модуля — `../widgets/context-menus/AssetActionsMenu/AssetActionsMenu.md` | «⋮» строки актива | `assetActionsMenu`, `assetActionsMenuCustom` |

## 7. Таблицы (Tables)

Обе таблицы — виджеты: колонки, сортировка, форматы — в паспортах
`FundsTable` и `AssetsTable`.

## 8. Поведение (Behavior)

Страница связывает виджеты по их API (скрипт в конце `FundsPipeline.html`):

| Триггер | Результат |
|---|---|
| Ввод в поиск, выбор типа или приоритета | `fundsfilters:change` → `FundsTable.applyFilters`: список сужается; совпадений нет — пустое состояние таблицы |
| Клик по строке фонда | `fundstable:select` → строка выделена, справа открываются сплиттер и «Активы <фонд>» (`AssetsTable.render`); клик по другому фонду меняет содержимое панели |
| Крестик в «Активы <фонд>» | `assetstable:close` → панель и сплиттер скрыты, выделение строки снято |
| Перетаскивание сплиттера | меняет доли панелей (35–75%); доля запоминается до перезагрузки |
| Шестерёнка «Настроить колонки» фондов или активов | стандартное окно ДС «Настройка таблицы» по колонкам своей таблицы: видимость, порядок, закрепление; «Применить» меняет таблицу, вид держится до закрытия вкладки |
| «⋮» в строке | меню фонда (из ЕПК / не из ЕПК) или актива |
| «Добавить фонд» (шапка, пустой список) | окно `AddFundEntityFromUcpModal`: поиск в базе фондов и в ЕПК |
| «Продолжить» с выбранным клиентом ЕПК | `EditFundModal` «Добавить фонд» (название, ИНН, КПП из ЕПК); «Добавить» → фонд появляется в списке и выбирается |
| «Новый фонд» (ничего не найдено) | `EditFundModal` «Новый фонд» с названием из поиска; «Сохранить» → фонд в списке |
| Меню фонда → «Редактировать» | `EditFundModal` «Редактировать фонд»; у фонда не из ЕПК — предупреждение «Клиент не привязан…» с «Привязать» (воркфлоу не делается); «Сохранить» → строка обновлена |
| Меню фонда → «Удалить фонд» | `DeleteFundModal`; «Подтвердить» → фонд убран из списка, панель активов закрыта, если был выбран он |
| «Связать с базой ЕПК», «Добавить актив», «Перейти на страницу клиента» | окон нет: воркфлоу ЕПК, окна активов и страница клиента не делаются (решения 30.10.2026) |
| Демо-адрес `?modal=add` · `?modal=edit&fund=<id>` · `?modal=delete&fund=<id>` | окно открыто при загрузке — для показа и проверок; с `fund` заодно открыта панель активов этого фонда |
| Таб System панели прототипа → «Список фондов» | «Есть фонды» / «Фондов нет» — перезагрузка с `?state=empty` (служебный переключатель не стоит в интерфейсе, скилл proto-panel §9) |
| Сценарии показа | `proto-panel/flows.yaml`: «Список фондов и активы», «Добавить фонд из ЕПК», «Новый фонд», «Редактировать и удалить фонд», «Фондов нет» |

## 9. Модальные окна (Modals)

| id | Заголовок | Ширина | Содержимое | Кнопки подвала |
|---|---|---|---|---|
| `addFundEntityFromUcpModal` | Добавить фонд | см. паспорт | поиск в базе фондов и в ЕПК, детали найденного | «Отменить», «Продолжить» |
| `editFundModal` | Добавить фонд / Новый фонд / Редактировать фонд | см. паспорт | форма фонда | «Отменить», «Добавить» или «Сохранить» |
| `deleteFundModal` | Удалить фонд | см. паспорт | данные фонда | «Подтвердить» |
| (рантайм ДС) | Настройка таблицы | `--w4` | колонки таблицы | «Отменить», «Применить» |

Окна активов, импорт и привязка к ЕПК не делаются.

## 10. Состояния (States)

### Loading

Не показывается в прототипе: данные демо приходят сразу. Во фронтенде —
загрузка таблицы uikit. Вид загрузки — не решено (30.10.2026).

### Empty

Фондов нет (`?state=empty`): FundsTable в состоянии `empty` (EmptyState
«Здесь пока ничего нет» и «Добавить фонд»), поля фильтров выключены
(`disabled`). У фонда нет активов (`?fund=fnd-004`): AssetsTable в
состоянии `empty`. Тексты — паспорта виджетов.

### Error

Не решено (30.10.2026): в макетах ошибки загрузки нет.

### Disabled

Нет прав на действия — во фронтенде кнопки и пункты меню не показываются
(`usePermissions`); в прототипе права не моделируются.

### Выбран фонд

Строка фонда выделена, правая панель сплиттера открыта (`?fund=fnd-001`).

## 11. Тексты интерфейса (Texts)

| Место | Текст |
|---|---|
| Крошки | Главная / Фонды |
| Заголовок страницы | Фонды |
| Кнопка в шапке | Добавить фонд |

Тексты виджетов — в их паспортах.

## 12. Данные (Data dependencies)

### API — что нужно от бэкенда

Поля фонда и актива — typedef `FundItemDto`, `AssetItemDto` в `../data/funds.js`
(имена — из моков фронтенда `FundsTable/mock.ts`, `AssetsTable/mock.ts`:
FundItem, AssetInfo). Фильтры — FundFiltersDto фронтенда: `smartSearch`,
`typeCodes`; приоритеты — массивом `priorityCodes` (во фронтенде один `priorityCode`; решение
человека 30.10.2026 — приоритетов можно выбрать несколько). Имена методов API здесь не придумываются.

### Mock — демо-данные прототипа

| Файл | Глобальная переменная | Тип | Источник имён |
|---|---|---|---|
| `../data/funds.js` | `window.MOCK_FUNDS` | `FundItemDto[]` | моки фронтенда; значения — макет (12 фондов) |
| `../data/funds.js` | `window.MOCK_FUND_ASSETS` | `AssetItemDto[]` | моки фронтенда; `fundId`, `partyId` актива — invented |
| `../data/funds.js` | `window.FUND_TYPE_LABELS`, `window.FUND_PRIORITY_LABELS` | карты подписей | коды PE, FAMILY_OFFICE, HIGH, MEDIUM — мок; PE_VC, HOLDING, LOW — invented по макету |

### Permissions — роли, права, флаги

| Роль | Просмотр | Действия |
|---|---|---|
| Руководитель IB | все фонды | не решено (30.10.2026); во фронтенде — флаги `createFund`, `updateFund`, `closeFund`, `createAsset`, `searchFundsPipeline` |

## 13. Соответствие файлов (Implementation mapping)

| Элемент | Прототип | Фронтенд |
|---|---|---|
| Страница | `pages/FundsPipeline.html` | `src/pages/FundsPipeline/FundsPipeline.tsx` |
| Фильтры | `widgets/tables/FundsFilters/` | `src/widgets/tables/FundsFilters/` |
| Список фондов | `widgets/tables/FundsTable/` | `src/widgets/tables/FundsTable/` (+ `ui/EmptyFundsPreview`) |
| Активы фонда | `widgets/tables/AssetsTable/` | `src/widgets/tables/AssetsTable/` (+ `ui/EmptyAssetsPreview`); панель — `FundsTable/ui/AssetsPreview` |
| Настройка таблицы | стандартное окно ДС (TableSettings) | `src/shared/components/table/TableSetupHiddenColumns` |
| Добавить фонд — поиск | `widgets/modals/AddFundEntityFromUcpModal/` | `src/features/modals/AddFundEntityFromUcpModal/` |
| Форма фонда | `widgets/modals/EditFundModal/` | `src/features/modals/EditFundModal/` + `src/entities/forms/EditFundForm/` |
| Удалить фонд | `widgets/modals/DeleteFundModal/` | `src/features/modals/DeleteFundModal/` |
| Меню фонда / актива | `widgets/context-menus/FundActionsMenu/`, `AssetActionsMenu/` | `src/shared/hooks/useFundActions.tsx`, `useAssetActions` |
| Типы данных | `data/funds.js` (JSDoc typedef) | `FundItem`, `AssetInfo` из `@sber-ibp/ib-view-lib-fe` |

## 14. Доступность (Accessibility)

- `<main>` для контентной области, `<nav aria-label="Хлебные крошки">`,
  `<nav aria-label="Главное меню">`;
- заголовок страницы — единственный `h1`;
- сплиттер — `role="separator"` с `aria-label`, стрелки двигают его с клавиатуры;
- у кнопок-иконок (меню строки, закрыть панель) есть `aria-label`;
- контраст — не ниже WCAG AA (обеспечивается токенами ДС).

## 15. Осознанные отклонения (Deviations)

Осознанных отклонений нет.

## 16. Открытые вопросы и допущения (Open questions)

| № | Вопрос / допущение | Статус |
|---|---|---|
| 1 | Pixso MCP | подключён (30.10.2026); окна сверены с кадрами страницы «Фонды» Pixso — совпадают со скриншотами |
| 2 | Доли сплиттера 50 / 50 и границы 35–75% — **допущение** по прецеденту ClientInfoPage v2 | нужно подтверждение |
| 3 | У РФПИ в макете «Активов 19», но активов нет (решение человека) — в данных `aumAssetsCount: 0`, в таблице «—» | допущение |
| 4 | Число активов остальных фондов в данных равно числу их демо-активов, а не числам макета (16, 12, 5…): иначе счётчик расходится с панелью активов | допущение |
| 5 | Окно «Настройка таблицы» — своё (`TableSetupHiddenColumnsModal`, по макету и фронтенду: только видимость столбцов, одна кнопка «Сохранить»), хотя в ДС есть стандартная `TableSettings` (хук `data-table-settings`: закрепление, порядок, «Отменить» / «Применить») | решено 30.10.2026: стандартное окно ДС `TableSettings` |
| 6 | Поля фильтров — размер M (40px), на макете и во фронтенде — S: в ДС размер S у полей только для правки в таблице | решено 30.10.2026: фильтры — новый вид по макету, поля S (паспорт FundsFilters 2.000) |
| 7 | Подсказка поиска — тултип одной строкой («…по атрибутам: Название фонда, Псевдоним, Бенефициар, ИНН Фонда»): у Tooltip ДС нет вида со списком, как на макете | решено 30.10.2026: подсказка списком (паспорт FundsFilters 2.000) |
| 8 | Аватары фондов и активов — разноцветные: Avatar ДС 1.006, `data-av-tones` на `<body>`, тон по objectId (решение 30.10.2026); логотипов активов нет; приоритет — значок-точка TableCell тона error / warning / success без ореола макета | аватары — решено (Avatar ДС 1.006); точка приоритета — вопрос к ДС |
| 9 | Подписи колонок активов — «млн RUB», а не «млн руб.» макета и ответа на вопрос 6: «руб.» запрещает правило ДС Б26 (валюта — код ISO) | решено 30.10.2026 человеком: «пока как в ДС» |
| 10 | MCAP / 100% equity: на макете значения с «%», в данных — сумма; EV и стоимость доли на макете «245 000 000» при подписи «млн» | решено 30.10.2026: в значениях EV и MCAP отрезать «000», в заголовке — «млн» (код валюты RUB по правилу ДС Б26) |
| 11 | Поиск срабатывает с 3 символов (как во фронтенде), типы между собой и приоритеты между собой — ИЛИ, тип и приоритет — И; фильтры и столбцы не сохраняются между заходами | допущение |
| 12 | Пункт «Связать с базой ЕПК» есть в макете, но нет во фронтенде (`useFundActions`) | решено 30.10.2026: пункт нужен, воркфлоу не делается |
| 13 | Имена бизнес-сценариев страницы (раздел 3) не известны — заполнятся, когда появится сценарный раздел | не решено (30.10.2026) |
