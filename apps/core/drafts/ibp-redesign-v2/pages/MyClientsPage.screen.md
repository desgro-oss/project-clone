---
screen: MyClientsPage
kind: screen
title: Клиенты
file: apps/core/drafts/ibp-redesign-v2/pages/MyClientsPage.preview.html
module: core/drafts/ibp-redesign-v2
frontend: core/clients-app pages/MyClients/MyClientsPage
route: не решено (10.10.2026)
source: ТЗ — docs/tasks/MS0014-ibp-redesign-context-pages.md, docs/tasks/MS0014a-ibp-redesign-frontend-names.md
version: "2.003"
created: "10.10.2026"
design_system: IBP DS
components: [Layout, NavPanel, Breadcrumbs, PageHeader, Tab, Table, TableCell, TableFilter, Modal, InputText, InputAutocomplete, InputAmountRange, DropdownList, Pagination, Chip, Link, Buttons, IconButton, SegmentControl, Toast]
widgets: [tables/V2MyClientsTable, tables/V2MyClientsHierarchicalTree]
---

# Page: MyClientsPage — Клиенты

## 1. Назначение (Purpose)

Реестр клиентов: таблица или дерево холдингов, фильтр, переход на страницу клиента. «Поиск клиентов» — вся база клиентов банка, главная таблица раздела; «Мои клиенты» — клиенты базы, которых пользователь отметил избранными (решение пользователя 26.10.2026); «Клиенты ДИД» — пустое состояние. Таблица та же, что во вкладке главной «Поиск клиентов» (V2MyClientsTable): колонки у них общие. «Поиск клиентов» шире остальных вкладок на атрибуты БТ «Поиск клиентов» от 21.10.2026 — 33 колонки и дополнительные разделы фильтра (решение пользователя 26.10.2026).

**Роль пользователя:** Аналитик ДИД
**Права:** просмотр; «в избранное» — отметить клиента своим или снять отметку; «Добавить клиента» — переход на «Поиск клиентов»; ⓘ целей — по клику ничего (Р6)

«Поиск клиентов»: перед названием клиента — первая колонка «В работу» с IconButton M neutral (всего 33 колонки). `folder-arrow-forward-02` — «Взять клиента в работу»: добавить в «Мои клиенты»; `folder-close-x-02` — «Отменить взятие клиента в работу»: убрать из «Моих клиентов». Оба действия доступны и показывают Toast. Решения пользователя 27.10.2026, MS0017.

Колонка действий поиска — без видимого заголовка, ширина 52px (поля TableCell 16px × 2 + IconButton M 20px). «В работу» остаётся названием только в настройках таблицы. Решение пользователя 27.10.2026.

## 2. Адрес и навигация (Route)

- **Адрес в продукте:** не решено (10.10.2026)
- **Адрес в прототипе:** `MyClientsPage.preview.html?tab=MyClientsPage`; «Клиенты ДИД» — `?tab=did`, «Поиск клиентов» — `?tab=search`
- **Пункт бокового меню** в состоянии `nav__item--selected`: «Клиенты».

| Уровень крошек | Текст | Ссылка |
|---|---|---|
| 1 | Главная | `HomePage.html` |
| 2 (текущий) | Клиенты | — |

## 3. Пары во фронтенде

| Элемент | Прототип | Фронтенд |
|---|---|---|
| Страница | `pages/MyClientsPage.html` | core/clients-app `pages/MyClients/MyClientsPage` |
| Реестр | `V2MyClientsTable` | core/clients-app V2MyClientsTable (фильтр MyClientsTableFilters — часть) |
| Дерево холдингов | `V2MyClientsHierarchicalTree` | core/clients-app `widgets/HierarchicalTree/V2MyClientsHierarchicalTree` |
| Пустое состояние | `.dtable__empty` реестра | ErrorBanner страницы |
| Вкладки «Клиенты моего деска», «Избранные клиенты», «Клиенты ДИД» | видны; первые две не переключаются (Р3) | не решено (В4 MS0014a) |
| Вкладка «Поиск клиентов» | выборка `search` V2MyClientsTable | не решено (26.10.2026) |

## 4. Раскладка (Layout)

```
Page (Layout, nav--rail, screen--app)
├── PageHeader — «Клиенты»
├── Tab ×5 — Мои клиенты · Клиенты моего деска (Р3) · Избранные клиенты (Р3) · Клиенты ДИД · Поиск клиентов
└── V2MyClientsTable (12) или V2MyClientsHierarchicalTree (12) — выбор в SegmentControl тулбара
```

**Блоки контента** — 12 колонок; ряды и ширины — в разметке страницы, скрипт только наполняет виджеты:

| № | Блок | Компонент или виджет | Колонок из 12 | Содержимое |
|---|---|---|---|---|
| 1 | Реестр | `widgets/tables/V2MyClientsTable` | 12 | Фильтр · «Краткий отчет» · «Добавить клиента» (кроме поиска) · SegmentControl · IconButton M `settings` («Настройка таблицы»); 16 колонок, вторая — Приоритет; на «Поиске клиентов» — 33: первая «В работу», затем «Клиент», «Приоритет» и остальные атрибуты |
| 2 | Дерево холдингов | `widgets/tables/V2MyClientsHierarchicalTree` | 12 | вместо реестра по SegmentControl |

Высота: `.screen--app`, реестр заполняет высоту (`dtable--fill`).

## 5. Компоненты (Components)

| Компонент | Откуда |
|---|---|
| Layout | ДС — `design-system/foundations/Layout/Layout.md` |
| NavPanel | ДС — `design-system/components/organisms/NavPanel/NavPanel.md` |
| Breadcrumbs | ДС — `design-system/components/molecules/Breadcrumbs/Breadcrumbs.md` |
| PageHeader | ДС — `design-system/components/organisms/PageHeader/PageHeader.md` |
| Tab | ДС — `design-system/components/molecules/Tab/Tab.md` |
| Table | ДС — `design-system/components/organisms/Table/Table.md` |
| TableCell | ДС — `design-system/components/organisms/TableCell/TableCell.md` |
| TableFilter | ДС — `design-system/components/organisms/TableFilter/TableFilter.md` |
| Pagination | ДС — `design-system/components/molecules/Pagination/Pagination.md` |
| Chip | ДС — `design-system/components/atoms/Chip/Chip.md` |
| Link | ДС — `design-system/components/atoms/Link/Link.md` |
| Buttons | ДС — `design-system/components/atoms/Buttons/Buttons.md` |
| IconButton | ДС — `design-system/components/atoms/IconButton/IconButton.md` |
| SegmentControl | ДС — `design-system/components/molecules/SegmentControl/SegmentControl.md` |
| Toast | ДС — `design-system/components/molecules/Toast/Toast.md` |
| `V2MyClientsTable` | виджет концепта — `../widgets/tables/V2MyClientsTable/V2MyClientsTable.md` |
| `V2MyClientsHierarchicalTree` | виджет концепта — `../widgets/tables/V2MyClientsHierarchicalTree/V2MyClientsHierarchicalTree.md` |

Параметры виджета на странице — атрибуты метки `<ds-include>`: `class` (место в сетке), `id`, `state`, `mode`.

## 6. Таблицы (Tables)

Таблиц в разметке страницы нет: таблицы — виджеты, колонки — в их паспортах.

## 7. Поведение (Behavior)

| Триггер | Результат |
|---|---|
| SegmentControl «дерево» | вместо реестра — дерево холдингов той же выборки; переключатели вида у таблицы и дерева согласованы |
| Вкладка «Поиск клиентов» | вся база клиентов банка: 250 клиентов, пять страниц по 50 |
| Порядок строк | по умолчанию — по приоритету от максимального к низкому; сортировка колонки упорядочивает все страницы; сброс сортировки возвращает порядок по приоритету |
| Предфильтр «Поиска клиентов» | при первом показе вкладки — «Приоритет: Максимальный, Высокий» (чип «Применено: 1», 112 клиентов); снимается в модалке или крестиком чипа; у каждой вкладки свой фильтр (решение пользователя 26.10.2026) |
| Шестерёнка в тулбаре | «Настройка таблицы» ДС: видимость, порядок, закрепление колонок; вид таблицы живёт на сессию и общий с главной |
| «в избранное» (по наведению на строку) | клиент попадает в «Мои клиенты» или уходит из них; Toast; отметка видна и на главной |
| «Добавить клиента» (тулбар, пустое состояние) | вкладка «Поиск клиентов»; на самом поиске кнопки нет |
| Вкладка «Клиенты ДИД» | пустое состояние с текстом и «Добавить клиента» |
| Вкладки «Клиенты моего деска», «Избранные клиенты» | видны, не переключаются (Р3) |
| Клиент | `ClientInfoPage.preview.html?id=…` |
| «Фильтр» | модалка `.tfm` по макету «Modal / Filter / My Clients»: разделы с бейджем заполненных полей, текст, выбор, множественный выбор с чипами, суммы «От / До»; чип «Применено: N». Подробно — паспорт V2MyClientsTable |
| «Краткий отчет» | Toast «Файл выгружен» |

## 8. Модальные окна (Modals)

| id | Заголовок | Ширина | Содержимое | Кнопки подвала |
|---|---|---|---|---|
| `rt-filter-my-clients` | Фильтр | `--w6` | TableFilter `.tfm`: «Основная информация» (Клиент, Полное наименование, Холдинг, ИНН, Главный клиентский менеджер, CRM ID, ТБ, ГОСБ), «Команда» (Дески клиента, Команда клиента), «Отрасль» (Отрасль, Макроотрасль, Подотрасль, Сегмент); на «Поиске клиентов» ещё ГКМ холдинга и Спонсор в «Команде», «Признаки клиента», «Финансы», «ДИД» | «Очистить фильтр», «Применить» |

## 9. Состояния (States)

### Loading
В прототипе не моделируется: демо-данные в памяти. У виджетов — блок загрузки по `data-state="loading"` (паспорта).

### Empty
«Клиенты ДИД» и «Мои клиенты» без избранных: «Здесь пока ничего нет», текст макета, «Добавить клиента»; при фильтре — «Ничего не найдено».

### Error
В прототипе не моделируется. У виджетов — Alert с повтором по `data-state="error"` (паспорта).

### Disabled
У действия «В работу» нет недоступного состояния: для уже добавленного клиента доступна отмена (`folder-close-x-02`). Правка полей клиента не воссоздаётся (Р6).

## 10. Тексты интерфейса (Texts)

| Место | Текст |
|---|---|
| Заголовок | Клиенты |
| Пусто — заголовок | Здесь пока ничего нет |
| Пусто — текст | Выберете клиента через поиск и добавте в список "Клиенты" с помощью кнопки |
| Кнопка | Добавить клиента |
| Вкладка | Поиск клиентов |
| Колонка | Приоритет |
| «в избранное» — подпись | Добавить в избранное / Убрать из избранного |
| Toast | Клиент {название} добавлен в «Мои клиенты» / Клиент {название} убран из «Моих клиентов» |
| Шестерёнка — подпись | Настроить колонки (модалка «Настройка таблицы» — тексты ДС) |

## 11. Данные (Data dependencies)

### API — что нужно от бэкенда

Поля — в паспортах виджетов и typedef демо-данных. Имена методов API выбирает разработка.

### Mock — демо-данные прототипа

| Файл | Глобальная переменная | Тип | Источник имён |
|---|---|---|---|
| `../data/clients.js` | `window.MOCK_CLIENTS` | `ClientRsDto[]` | invented (10.10.2026) |
| `../data/clients.js` | `window.MOCK_BASE_CLIENTS` | `ClientRsDto[]` — остальная база, с полем `priorityCode` и атрибутами БТ | invented (26.10.2026) |
| `../data/employees.js` | `window.MOCK_EMPLOYEES` | `EmployeeRsDto[]` | invented (10.10.2026) |
| `../data/dictionaries.js` | `window.REGISTRY_CONFIGS`, `*_LABELS` | конфиги, подписи кодов | invented (10.10.2026) |
| `../data/store.js` | `window.IBPR` | — | хранилище: выборки, действия Р7, sessionStorage |
| `../data/nav-links.js` | `window.IBPR_NAV` | — | меню и карта страниц |
| `../data/registry-table.js` | `window.IBPR_TABLE` | — | общий рендер реестров (пары нет) |

### Permissions — роли, права, флаги

| Роль | Просмотр | Действия |
|---|---|---|
| Аналитик ДИД | да | «в избранное» — свой список «Мои клиенты» |

## 12. Соответствие файлов (Implementation mapping)

| Элемент | Прототип | Фронтенд (предложение) |
|---|---|---|
| Страница | `pages/MyClientsPage.html` | `src/pages/MyClients/MyClientsPage.tsx` |
| Реестр | `widgets/tables/V2MyClientsTable/` | `src/widgets/Tables/V2MyClientsTable/V2MyClientsTable.tsx` |
| Дерево | `widgets/tables/V2MyClientsHierarchicalTree/` | `src/widgets/HierarchicalTree/V2MyClientsHierarchicalTree/V2MyClientsHierarchicalTree.tsx` |

Пути фронтенда — по соглашениям его модуля; окончательный путь выбирает разработка.

## 13. Доступность

- `<main>` для контентной области, `<nav aria-label="Хлебные крошки">`, `<nav aria-label="Главное меню">`;
- заголовок страницы — единственный `h1`;
- у всех кнопок-иконок есть `aria-label`;
- вкладки — `role="tablist"`, переключатели — `role="radiogroup"`.

## 14. Открытые вопросы и допущения (Open questions)

| № | Вопрос / допущение | Статус |
|---|---|---|
| 1 | Пары вкладок «Клиенты моего деска», «Избранные клиенты», «Клиенты ДИД» (В4 MS0014a) | вопрос |
| 2 | Опечатки «Выберете», «добавте» — дословно с макета (открытый вопрос 9 MS0014) | вопрос |
| 3 | Во фронтенде группировка — InputSwitch «Group by holdings», на снимке — SegmentControl | допущение по снимку |
| 3 | Меню и карта страниц — `data/nav-links.js`: один источник на концепт; пункт без страницы — клик гасится (Р5) | решено (MS0014a, С1) |
| 4 | «Мои клиенты» — избранные клиенты базы; как с ними соотносится вкладка «Избранные клиенты» (Р3) | вопрос, не решено (26.10.2026) |
| 5 | Приоритет клиента («Приоритет» — наш рейтинг клиента по набору параметров: Максимальный, Высокий, Средний, Низкий; заменил AI score (решение пользователя 26.10.2026)): по каким параметрам и как часто считается, нужно ли объяснение оценки; в прототипе значения демонстрационные | вопрос, не решено (26.10.2026) |
| 6 | Пара вкладки «Поиск клиентов» во фронтенде | вопрос, не решено (26.10.2026) |
| 7 | Атрибуты БТ «Поиск клиентов»: период выручки и EBITDA, смысл «Компании роста» и «Компании роста ДИД», цвета зоны проблемности (кроме чёрной — она есть в MS0017), расшифровки ФОК, ЧОД, ОСЗ, ЕПК; строка БТ «Приоритет: A, B, C, D» — колонка «Приоритет A–D», её смысл и связь с нашим «Приоритетом» | вопрос, не решено (26.10.2026) |
| 8 | Кнопка подвала фильтра «Сохранить» (макет) — в прототипе «Применить» по спеке TableFilter ДС; сводка и чипы вместе у «Десков клиента» (макет) — в прототипе только чипы под полем (правило InputAutocomplete ДС) | отклонение от макета по ДС, на подтверждение |
