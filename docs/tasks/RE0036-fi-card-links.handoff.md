# RE0036 — handoff

- **Дата:** 23.10.2026
- **Статус:** ждёт ответа пользователя (задача в `review`, нужна визуальная проверка в браузере)

## Цель

Убрать у карточки ФИ собственные наведение и нажатие и сделать заголовок
связанного инструмента ссылкой, как в дереве продуктов; те же правки — в
концепте `tranche-page-v03`.

## Этапы

- ✓ plan
- ✓ build-main (Э1–Э2: карточка → Tile, заголовки-ссылки)
- ✓ build-copies (Э3: концепт)
- ✓ review (PASS после исправления одного документационного блокера)
- → close (осталась визуальная проверка человеком)

## Смета

`ВЕРДИКТ: OK — запас 52 405` — `ctx-budget.mjs --stage build --tz docs/tasks/RE0036-fi-card-links.md --cheat Tile,ProductRow --out-lines 600`.

## Принятые решения

- Карточка ФИ — обычный Tile `.tile.tile--accordion.lc-fin-card`, не Card:
  шапка TileHeader M, контент 12 сверху / 20 по бокам / 24 снизу. Модификатор
  Card в ДС не заводится, `design-system/**` не меняется (человек, 23.10.2026).
- Заголовок узла со страницей — ссылка: транш шлёт `fiaction` `OPEN_NODE`,
  страница открывает `Tranche.html?id=&tr=`; другой тип со страницей — ссылка
  без действия; без страницы — текст (человек + правило ProductRow).
- Адрес узла — одна функция `nodePage(node)` на странице, общая для дерева и
  карточки.
- На витрине ссылка и подсветка есть, перехода нет: нет страницы-хозяина.

## Что сделано

- `apps/postrade/deals-app/widgets/tiles/FinInstrumentsTile/FinInstrumentCard/` —
  Tile вместо Card, `titleHTML`, `kind`/`hasPage`, паспорт 1.003, CHANGELOG.
- `apps/postrade/deals-app/widgets/tiles/FinInstrumentsTile/` — примеры и
  заготовки без `.tile--card`, `preventDefault` для `href="#"`, `OPEN_NODE`,
  паспорт 1.008, CHANGELOG.
- `apps/postrade/deals-app/data/fin-instruments-store.js` — `kind` и `hasPage`
  у узлов карточки.
- `apps/postrade/deals-app/pages/Deal.html`, `FinInstrument.html` — `nodePage`,
  `OPEN_NODE`, локальный `nodesHTML`; `Deal.screen.md`, `FinInstrument.screen.md`.
- `apps/postrade/deals-app/widgets/tiles/DealProductTreeTile/` — паспорт 1.005 и
  шапка скрипта: у транша переход есть.
- `apps/postrade/drafts/tranche-page-v03/` — те же копии виджетов и данных,
  `Deal.html` с `OPEN_NODE` и `Tranche.preview.html`, `Deal.screen.md`.
- Витрина пересобрана: `FinInstrumentCard.doc.html`, `FinInstrumentsTile.doc.html`,
  `DealProductTreeTile.doc.html`, `kit-data.js`.

## Проверки

`lessons-cli gate` — `ВЕРДИКТ: OK` (17 шаг). `assemble --check` — OK,
`kit-build --check` — OK, `layout-check` на `Deal.preview.html`,
`FinInstrument.preview.html` и `Deal.preview.html` концепта — OK, `page-run` —
OK / «только загрузка» на странице ФИ. Приёмка `screen-reviewer` — **PASS**.

## Открытые вопросы

- Визуально в браузере: нет ли наведения/нажатия на карточке, работает ли клик
  по заголовку транша, не усекается ли геометрия при 600–620px — к человеку.
- `WARN Б44` по зазору IconButton в `.prow__actions` — слой ДС ProductRow, к
  RE0036 не относится.

## Следующий шаг

Человек открывает `apps/postrade/deals-app/pages/Deal.preview.html`,
`FinInstrument.preview.html` и `apps/postrade/drafts/tranche-page-v03/pages/Deal.preview.html`:
проверяет карточку и переход по траншу. Если всё верно — задача закрывается
(`status: done`); если нет — правка обычным маршрутом.

## Читать первыми

- `docs/tasks/RE0036-fi-card-links.md`
- `apps/postrade/deals-app/widgets/tiles/FinInstrumentsTile/FinInstrumentCard/FinInstrumentCard.md`
- `apps/postrade/deals-app/widgets/tiles/FinInstrumentsTile/FinInstrumentsTile.md`
- `apps/postrade/deals-app/widgets/tiles/FinInstrumentsTile/FinInstrumentCard/FinInstrumentCard.css`
- `apps/postrade/deals-app/widgets/tiles/FinInstrumentsTile/FinInstrumentsTile.js`
- `apps/postrade/deals-app/pages/Deal.html`, `FinInstrument.html`
- `apps/postrade/drafts/tranche-page-v03/pages/Deal.html`
