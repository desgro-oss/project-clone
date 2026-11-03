# MS0019a — handoff

- **Дата:** 28.10.2026
- **Статус:** закрыта.

## Цель
Убрать вложенные рамки событий на главной, разделить части Divider и сделать ровные поля строк.

## Этапы
- ✓ plan — скриншот изучен.
- ✓ build — embedded-варианты, Divider и геометрия строк.
- ✓ review — независимая приёмка PASS, сценарии OK.
- ✓ close — итог и затраты.

## Смета
build, ТЗ `docs/tasks/MS0019a-events-visual-fix.md`, cheat Entity,Tile,Divider, out-lines100: `ВЕРДИКТ: OK — запас 69 519`.

## Принятые решения
- Пользователь: убрать обе вложенные рамки на главной, между частями вертикальный Divider, поля строк визуально равные.
- Встроенный режим снимает Tile/Tile body классы внутри render. На странице событий standalone-вариант сохранён.
- Локальная геометрия embedded-строк по запросу пользователя: width:auto, padding16; тело24/26 компенсирует margin Entity−8/−10, даёт видимые поля16; gap24 даёт зазор8. Цвета и состояния Entity не переопределялись.
- На узком экране используется горизонтальный Divider; прежние высоты и прокрутка сохранены.

## Что сделано
- `data/home-dashboard.js`, `pages/HomeDashboard.css/.md/.scenario.mjs` — embedded-режим и Divider.
- `widgets/tiles/V2EventsListTile/`, `widgets/tiles/V2EventDetailsTile/` — варианты, ровная геометрия и документация.
- `pages/HomeBoard.preview.html`, `pages/EventsPage.preview.html` — пересобраны.
- `pages/EventsPage.scenario.mjs` — проверяет самостоятельные Tile.
- `pages/HomeBoard.screen.md`, `pages/EventsPage.screen.md` — актуальное оформление.

## Проверки
Независимая приёмка PASS. Оба page-run — OK (0 замечаний), layout-check — OK (7 прежних замечаний главной и З11 страницы). Scoped gate — OK (22 шага). Геометрия по CSS подтверждена, браузер и итоговый снимок не проверялись. Уроки Л278/Л279 записаны.

## Открытые вопросы
Нет блокирующих вопросов.

## Следующий шаг
Запрос выполнен, дальнейшие правки — по новому поручению.

## Читать первыми
- `docs/tasks/MS0019a-events-visual-fix.md`
- `apps/core/drafts/ibp-redesign-v2/widgets/tiles/V2EventsListTile/V2EventsListTile.md`
