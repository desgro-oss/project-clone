---
screen: ClientComments
kind: screen
title: Комментарии клиента
file: apps/core/clients-app/pages/ClientComments.preview.html
module: core/clients-app
frontend: new
route: не решено (10.10.2026)
source: ТЗ — docs/tasks/MS0014-ibp-redesign-context-pages.md, docs/tasks/MS0014a-ibp-redesign-frontend-names.md
version: "2.000"
created: "10.10.2026"
design_system: IBP DS
components: [Layout, NavPanel, Breadcrumbs, PageHeader, Tile, InputText, IconButton, Buttons, SnackBar]
widgets: [tiles/CommentsTile]
---

# Page: ClientComments — Комментарии клиента

## 1. Назначение (Purpose)

### Бизнес-смысл (Business context)

| Вопрос | Ответ |
|---|---|
| Зачем существует | не решено (30.10.2026) — бизнес-цель отдельно от назначения интерфейса не уточнена |
| Кто заполняет и когда | не решено (30.10.2026) — регламент заполнения не уточнён |
| Кто пользуется результатом | не решено (30.10.2026) — потребители результата не уточнены |
| Бизнес-правила | не решено (30.10.2026) — бизнес-ограничения отдельно от поведения прототипа не уточнены |

Источники: `docs/tasks/MS0014-ibp-redesign-context-pages.md`, `docs/tasks/MS0014a-ibp-redesign-frontend-names.md`.
Технический перенос — `docs/tasks/RE0043-core-modules-promotion.md`; предметная область при переносе не уточнялась.

Все комментарии клиента и добавление нового: комментарий попадает в хранилище и виден в тайле «Комментарии» страницы клиента.

**Роли прототипа:** Аналитик Core (`core_analyst`), Аналитик ДИД Pre (`analyst`) и Руководитель IB (`director_ib`); контекст каждой роли сохраняется
**Права:** просмотр и добавление комментария; удаление и правка — по клику ничего (Р6)

## 2. Адрес и навигация (Route)

Главная зависит от `?role=`: `core_analyst` (по умолчанию) → dashboard-app;
`analyst` (Аналитик ДИД, Pre) и `director_ib` → их прежние главные host-app. Меню и крошки используют `roleHomeHref(code)`,
ссылки на объекты сохраняют `role`. Три отдельные роли — уточнение человека 30.10.2026 (`docs/tasks/RE0044a-three-separate-roles.md`).
Матрица прав исходного прототипа не изменяется.

- **Адрес в продукте:** не решено (10.10.2026)
- **Адрес в прототипе:** `ClientComments.preview.html?id=3000012345`
- **Пункт бокового меню** в состоянии `nav__item--selected`: «Клиенты».

| Уровень крошек | Текст | Ссылка |
|---|---|---|
| 1 | Главная | `../../dashboard-app/pages/HomePage.preview.html?role=core_analyst` |
| 2 | Клиенты | `MyClientsPage.preview.html` |
| 3 | <Клиент> | `ClientInfoPage.preview.html?id=…` |
| 4 (текущий) | Комментарии | — |

## 3. Сценарии (Scenarios)

Не решено (30.10.2026) — имён сценариев в ТЗ и бизнес-контексте страницы нет; вопрос в разделе 16.

## 4. Пары во фронтенде (Frontend pairs)

| Элемент | Прототип | Фронтенд |
|---|---|---|
| Страница | `pages/ClientComments.html` | пары нет (у сделки и лида — OpportunityComments, PotentialCommentsPage) |
| Список | `CommentsTile` | tiles/CommentsTile |

## 5. Раскладка (Layout)

```
Page (Layout, nav--rail)
├── PageHeader — «Комментарии — <Клиент>» · «На страницу клиента»
└── tile-row: CommentsTile (8) · Tile «Новый комментарий» (4): InputText + IconButton send
```

**Блоки контента** — 12 колонок; ряды и ширины — в разметке страницы, скрипт только наполняет виджеты:

| № | Блок | Компонент или виджет | Колонок из 12 | Содержимое |
|---|---|---|---|---|
| 1 | Комментарии | `widgets/tiles/CommentsTile` | 8 | все комментарии клиента |
| 2 | Новый комментарий | Tile | 4 | InputText · IconButton send |

Вертикальный скролл: есть, скроллится контентная область, крошки залипают.

## 6. Компоненты (Components)

| Компонент | Откуда |
|---|---|
| Layout | ДС — `design-system/foundations/Layout/Layout.md` |
| NavPanel | ДС — `design-system/components/organisms/NavPanel/NavPanel.md` |
| Breadcrumbs | ДС — `design-system/components/molecules/Breadcrumbs/Breadcrumbs.md` |
| PageHeader | ДС — `design-system/components/organisms/PageHeader/PageHeader.md` |
| Tile | ДС — `design-system/components/organisms/Tile/Tile.md` |
| InputText | ДС — `design-system/components/molecules/Inputs/InputText/InputText.md` |
| IconButton | ДС — `design-system/components/atoms/IconButton/IconButton.md` |
| Buttons | ДС — `design-system/components/atoms/Buttons/Buttons.md` |
| SnackBar | ДС — `design-system/components/organisms/SnackBar/SnackBar.md` |
| `CommentsTile` | виджет модуля — `../widgets/tiles/CommentsTile/CommentsTile.md` |

Параметры виджета на странице — атрибуты метки `<ds-include>`: `class` (место в сетке), `id`, `state`, `mode`.

## 7. Таблицы (Tables)

Таблиц в разметке страницы нет: таблицы — виджеты, колонки — в их паспортах.

## 8. Поведение (Behavior)

| Триггер | Результат |
|---|---|
| IconButton send | комментарий в хранилище, SnackBar, список обновляется |
| «На страницу клиента» | `ClientInfoPage.preview.html?id=…` |

## 9. Модальные окна (Modals)

Модальных окон нет.

## 10. Состояния (States)

### Loading
В прототипе не моделируется: демо-данные в памяти. У виджетов — блок загрузки по `data-state="loading"` (паспорта).

### Empty
Пустое состояние — у виджетов (паспорта).

### Error
В прототипе не моделируется. У виджетов — Alert с повтором по `data-state="error"` (паспорта).

### Disabled
Нет: права роли — просмотр; правка не воссоздаётся (Р6).

## 11. Тексты интерфейса (Texts)

| Место | Текст |
|---|---|
| Заголовок | Комментарии — <Клиент> |
| Поле | Комментарий · Текст комментария |
| SnackBar | Комментарий добавлен · Виден в тайле «Комментарии» клиента |

## 12. Данные (Data dependencies)

### API — что нужно от бэкенда

Поля — в паспортах виджетов и typedef демо-данных. Имена методов API выбирает разработка.

### Mock — демо-данные прототипа

| Файл | Глобальная переменная | Тип | Источник имён |
|---|---|---|---|
| `../data/clients.js` | `window.MOCK_CLIENTS` | `ClientRsDto[]` | invented (10.10.2026) |
| `../data/employees.js` | `window.MOCK_EMPLOYEES` | `EmployeeRsDto[]` | invented (10.10.2026) |
| `../data/store.js` | `window.IBPR` | — | хранилище: выборки, действия Р7, sessionStorage |
| `../data/nav-links.js` | `window.IBPR_NAV` | — | меню и карта страниц |

### Permissions — роли, права, флаги

| Роль | Просмотр | Действия |
|---|---|---|
| Аналитик ДИД | да | добавление комментария |

## 13. Соответствие файлов (Implementation mapping)

| Элемент | Прототип | Фронтенд (предложение) |
|---|---|---|
| Страница | `pages/ClientComments.html` | пары нет — предложение `src/pages/ClientComments/ClientComments.tsx` |

Пути фронтенда — по соглашениям его модуля; окончательный путь выбирает разработка.

## 14. Доступность (Accessibility)

- `<main>` для контентной области, `<nav aria-label="Хлебные крошки">`, `<nav aria-label="Главное меню">`;
- заголовок страницы — единственный `h1`;
- у всех кнопок-иконок есть `aria-label`;
- вкладки — `role="tablist"`, переключатели — `role="radiogroup"`.

## 15. Осознанные отклонения (Deviations)

Осознанных отклонений нет.

## 16. Открытые вопросы и допущения (Open questions)

| № | Вопрос / допущение | Статус |
|---|---|---|
| 1 | Иконки удаления и правки — у всех комментариев (в ТЗ — у системных) | допущение |
| 3 | Меню и карта страниц — `data/nav-links.js`: один источник на концепт; пункт без страницы — клик гасится (Р5) | решено (MS0014a, С1) |
| 4 | Имена бизнес-сценариев страницы (раздел 3) не известны — заполнятся, когда появится сценарный раздел | не решено (30.10.2026) |
