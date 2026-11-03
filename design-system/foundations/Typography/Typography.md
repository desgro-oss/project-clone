---
component: Typography
title: "Типографика"
version: "2.001"
updated: "02.11.2026"
page: foundations/Typography/Typography.html
css: foundations/Typography/Typography.css
status: curated
---

## Структура
Четыре семейства: SB Sans Display (заголовки, 300/400/600), Text (боди, 400/600), Screen (кнопки, 400), Text Cond (Display L–S). Рампа — 29 токенов `--type-*` в именах UI-kit; есть утилити-классы `.ds-*` с теми же именами. Трекинг — токен `--type-ls` (базовая тема 0), его берут и утилити-классы, и явные правила ДС.

## Имена UI-kit (02.11.2026)
Токены и классы названы как стили кита разработчиков (`src/styles/theme/typography.ts`, 29 стилей CamelCase): `H3StrongSmb` → `--type-h3-strong-smb`, класс `.ds-h3-strong-smb`. Кнопочные M/S/XS имя не меняли. Добавлены 7 стилей, которых в ДС не было: `H4StrongExtensiveSmb`, `BodyMExtensive`, `BodyXSExtensive`, `ButtonL`, `DisplayL/M/S`; в макетах они не используются — на странице помечены прозрачным красным фоном палитры статусов. Вес H1 и H2 — 400, как в ките, несмотря на `Light` в имени. Старые имена (19 токенов и классов) удалены, потребители переведены скриптом: совместимость сломана намеренно — версия 2.000; возврат старых имён стерегут линтер ДС (предупреждение) и сенсор экранов (блокер). Таблица сверки — в двух табах: «Сейчас» (действующая) и «До переезда» — снимок на 11.10.2026 со старыми именами ДС, расхождением веса H1/H2 и колонкой «Имя ДС после переезда»; сохранена по решению человека для ручной сверки в Pixo, поэтому на этой странице B20 линтера старые имена не стережёт — они там данные.

## Трекинг и типографские темы
`--type-ls` — единственный источник `letter-spacing` для текста ДС; базовая тема — 0. Его берут утилити-классы и явные правила ДС, поэтому смена токена достаёт до всего текста без правок компонентов. Типографская тема NEO (`Typography.themes.css`, рантайм `Typography.themes.js`, `window.DSTypography`) ставит на `[data-typography="neo"]` `-0.02em`: токеном — для явных правил (em разрешается в кегль каждого стиля), свойством на корне — наследование тексту без своих правил. Тема — отдельное измерение рядом с цветовым (цветовые темы типографику не меняют): выбор живёт в `ds.typography` и параметре `?typography=`, событие — `ds:typographychange`; переключатели — панель прототипа и страница «Темы». Без атрибута ДС не меняется.

## Оптическая нормализация метрик Display (05.08.2026)
У SB Sans Display метрики несимметричны относительно визуального блока (cap-height ↔ descender): заголовок вставал на 4% em выше оптического центра строки. В его `@font-face` добавлены `ascent-override: 80%` и `descent-override: 29%` (все веса 300/400/600), совмещающие центр content-area с оптическим центром глифов.

Сумма ascent+descent сохранена — `line-height: normal` и высоты строк не изменились, двигается только положение глифов внутри строки. SB Sans Text и SB Sans Screen — с исходными метриками, их не менять без отдельного решения.

## Атрибут hidden (01.10.2026)
`[hidden] { display: none !important }` — элемент с атрибутом `hidden` скрыт всегда, какой бы `display` ни задал ему компонент или экран. Браузерное правило слабее любого `display` компонента, и атрибут молча не работал (семь починок поштучно, последняя — строки AllocationBar 25.09.2026). Правило лежит в этом файле, потому что его подключают все: экраны — первым импортом `ds.css`, страницы документации — явной ссылкой. Показать элемент — снять атрибут, а не перебить `display`.

## Токены

**---------- Font faces ----------------------------------------------------**: 
**---------- Design tokens -------------------------------------------------**: 
**Font families**: `--font-display` `--font-text` `--font-screen` `--font-text-cond` 
**Weights**: `--weight-light` `--weight-regular` `--weight-semibold` 
**Tracking**: `--type-ls` 
**Headings — SB Sans Display**: `--type-h1-light` `--type-h2-light` `--type-h3-strong-smb` `--type-h3-reg` `--type-h4-strong-extensive-smb` `--type-h4-strong-smb` `--type-h4-reg` `--type-h5-strong-smb` `--type-h5-reg` `--type-h6-strong-smb` `--type-h6-reg` 
**Body — SB Sans Text**: `--type-body-xl-reg` `--type-body-xl-strong-smb` `--type-body-l-reg` `--type-body-l-strong-smb` `--type-body-m-extensive` `--type-body-m-reg` `--type-body-m-strong-smb` `--type-body-s-reg` `--type-body-s-strong-smb` `--type-body-xs-extensive` `--type-body-xs-reg` 
**Display — SB Sans Text Cond**: `--type-display-l` `--type-display-m` `--type-display-s` 
**Buttons — SB Sans Screen**: `--type-button-l` `--type-button-m` `--type-button-s` `--type-button-xs` 
**---------- Utility classes ----------------------------------------------**: 
