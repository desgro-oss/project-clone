---
type: review
task: 'RE0048'
title: 'RE0048 — повторная приёмка типографского кита и типографских тем NEO'
date: 2026-11-02
branch: typography
base: 5c988db6
---
<!-- Шаблон — 0000-review-template.md рядом. Разделы заполняет субагент-приёмщик
     (роль screen-reviewer, чистый контекст); ведущий агент сверяет и разносит находки. -->

# RE0048 — повторная приёмка типографского кита и типографских тем NEO

**ВЕРДИКТ:** PASS с замечаниями

## Объём

Повторная приёмка итогового состояния задачи (Э1–Э6 + правки по комментариям человека 02.11.2026: таблица в двух табах, красная подпись `--st-red-dark`, `TYPO_OLD_DOC_PAGE`, Typography 2.001). Прочитаны целиком: `design-system/foundations/Typography/` (Typography.css, Typography.html, Typography.md, Typography.themes.css, Typography.themes.js), `foundations/Themes/` (Themes.html, Themes.page.js — блок типографики и все segctrl, Themes.page.css — theme-bar, Themes.js — контракт, ThemeBoot.js, Themes.md), `docs-kit/ds-theme-boot.js`, `ds.css` (импорты), протопанель (`.agents/proto-panel/ui.js` — renderThemePane и слушатели событий, strings.js, panel.css, README), сторожа (`design-system/tools/ds-lint.js` — B20, ds-lint.md, `design-system/fixtures/B20.bad.html`; `.agents/tools/layout-check.mjs` — Б51, `.agents/tools/fixtures/Б51.bad.html`), шаблон `.agents/tools/boot-build.mjs` с самотестом и генерат `apps/ds-config.js`, CHANGELOG.md (записи 1.003/2.000/2.001 + темы), MAINTAINING.md («Типографские темы»), specs/_index.md.

Команды (корень репозитория):

- Grep 19 старых имён (регэксп сторожа B20/Б51, граница слова) по репозиторию минус исключения ТЗ — **0 в живых файлах**. Все 84 вхождения — законные зоны: `docs/tasks/**`, `CHANGELOG.md` (решение агента №6), снимок Typography.html (19 старых токенов = данные таба «До переезда»), фикстуры B20/Б51, сам сторож (ds-lint.js:131, ds-lint.md:132 — описания правила). Компоненты ДС, apps, спеки, `docs/index.md`, протопанель — чисто.
- `node design-system/tools/ds-check.mjs --all` — `ВЕРДИКТ: OK` (BLOCKER 0; B20 по ДС — ноль).
- `node design-system/tools/ds-lint-cli.mjs fixtures/B20.bad.html` — `WARN B20 старое имя типографики «--type-body-m»` → `NEEDS-WORK` (падает, как требуется).
- `node design-system/tools/ds-lint-cli.mjs foundations/Typography/Typography.html` — B20 молчит (`TYPO_OLD_DOC_PAGE`), `PASS с замечаниями` (старые INFO B3 по отступам страницы).
- `node .agents/tools/layout-check.mjs .agents/tools/fixtures/Б51.bad.html` — `FAIL`, «Б51 старые имена типографики на строках 30, 49».
- `node .agents/tools/lessons-cli.mjs verify --only B20` и `--only Б51` — оба `ДОКАЗАН`.
- `node .agents/tools/page-run.mjs` Typography.html и Themes.html — блокеров 0 (вердикт «ТОЛЬКО ЗАГРУЗКА»: сценария панели у страниц нет, см. «Не проверено»).
- `node .agents/tools/lessons-cli.mjs gate` — `ВЕРДИКТ: FAIL (1 из 3)`, единственная причина — КД3 (находка Р1).
- `node .agents/tools/boot-build.mjs --check` — `ВЕРДИКТ: OK` (генераты = шаблон); `node tmp/RE0048-dstypo-check.mjs` — все кейсы OK (контракт DSTypography).
- `node .agents/tools/layout-check.mjs --rules` — Б51 в составе сенсора.
- Второй проход ls0: `letter-spacing: 0` в CSS и страницах ДС и в apps — 0 остатков; остались только токен `--type-ls: 0` и намеренные `.02em`–`.14em` (в том числе `.04em`/`.06em` — не тронуты).

Вне объёма: унаследованные изменения рабочего дерева, не относящиеся к RE0048, не разворачивались. Браузер не запускался (process.md §9).

## Что подтверждено

- **29 токенов = имена кита; старых нет** — Typography.css:94–128 (11 заголовков + 11 боди + 3 display + 4 кнопочных; порядок совпадает с массивом `uikit` Typography.html:407–437); счётчики секций страницы 11/11/3/4 (Typography.html:184,194,204,214).
- **Вес H1/H2 — 400** — Typography.css:94–95 `--type-h1-light: var(--weight-regular) 52px/68px …`; в таблице сверки совпадение по весу с китом (Typography.html:408–409).
- **`--type-ls`** — Typography.css:86 `--type-ls: 0`; все утилити-классы берут `letter-spacing: var(--type-ls)` (Typography.css:135–166).
- **7 неиспользуемых стилей кита с красной подписью** — `UK_UNUSED` из 7 имён (Typography.html:441), строка `.uk-unused { background: var(--st-red-light) }` и подпись `.uk-unused-note { color: var(--st-red-dark) }` (Typography.html:128–129); токены существуют (Palette.css:149,153 — `--st-red-dark: var(--red-700)`, `--st-red-light: color-mix(… var(--red-400) 16% …)`).
- **Таблица сверки в двух табах** — Typography.html:257–260 (`data-tabs`, Tab.css:16 + Tab.js:613), панели переключает страница по `data-pane` (Typography.html:537–551, паттерн Colors.html:77–82,257); таб «До переезда» — снимок 11.10.2026: 19 старых токенов данными (Typography.html:459–489), расхождение веса H1/H2 красным на стороне кита (`ukSize(kit, diff)`, Typography.html:520), колонка «Имя ДС после переезда» (Typography.html:495), образцы ДС рисуются значениями снимка, не токенами (Typography.html:510,516).
- **Версии согласованы** — Typography 2.001: страница (Typography.html:147), спека (Typography.md:4), CHANGELOG (строка 18); Themes 1.016: страница (Themes.html:21), спека (Themes.md:4), specs/_index.md:71,75.
- **Тема NEO** — Typography.themes.css:22–26 `:root[data-typography="neo"], [data-typography="neo"] { --type-ls: -0.02em; letter-spacing: -0.02em; }`; без атрибута ДС не меняется (правил на отсутствие атрибута нет, база — `--type-ls: 0`).
- **Подключение** — ds.css:91 импорт Typography.themes.css после Typography.css:9 и рядом с Themes.css:85 (перебивает `:root` по порядку); ThemeBoot.js:14 — Typography.themes.js в цепочке после Themes.js; ds-theme-boot.js ставит `data-typography` до отрисовки из `?typography=`/`ds.typography`; apps/ds-config.js:23–30 дословно равен шаблону boot-build.mjs:124–131, `boot-build --check` — OK, самотест кейсов `?typography=` — boot-build.mjs:335–343.
- **Регистр и хранение** — `toLowerCase()` в Typography.themes.js:31, ds-theme-boot.js, boot-build-шаблоне:127–128; `normalize('NEO') → neo`, неизвестный → null (Typography.themes.js:30–36; vm-проверка OK); localStorage `ds.typography` (Typography.themes.js:24,53–58), base удаляет ключ.
- **Событие и контракт** — `ds:typographychange` (Typography.themes.js:47–51); API get/set/list/normalize повторяет `DSTheme` (Themes.js:137–146 — get/set/list присутствуют).
- **Протопанель** — блок «Типографика» под списком цветовых тем (ui.js:1042–1055 — typoHtml дописывается после списка тем), без рантайма скрыт (`typoList()` возвращает null → typoHtml пуст, ui.js:1029–1033,1042), клик → `DSTypography.set` + перерисовка (ui.js:1058–1062), перерисовка по `ds:typographychange` при активной вкладке темы (ui.js:1402–1403), строка `typo.title` (strings.js:258), README панели — README.md:81–84.
- **Страница «Темы»** — сегмент «Базовая / NEO» в theme-bar (Themes.html:36–44, классы theme-bar на месте — Themes.page.css:18–21), логика через `DSTabs.segment` (Themes.page.js:932–946); синхронизация по событию без петли — `seg.select(item, true)` (silent, Tab.js roving `select(target, silent)` не вызывает onChange); порядок скриптов рантайм → page.js (Themes.html:527–530).
- **Сторожа** — B20 (ds-lint.js:132–137,425–442 глобальный обход, 1711–1719 явная проверка; ds-lint.md:132) и Б51 (layout-check.mjs:733–752, комментарии маскируются) — один регэксп 19 имён с границей слова (`--type-h3` не матчится внутри `--type-h3-strong-smb`); исключения совпадают с решениями: CHANGELOG, fixtures/, сам линтер, icons-data.js, Typography.html. Непустые прогоны — оба падают на своих фикстурах; `verify` — ДОКАЗАН откатом; глобальный обход чист.
- **К13 (правило = код)** — заявленное в Themes.md:37 («цветовые темы типографику не меняют; типографские — отдельное измерение») и MAINTAINING.md:232–236 подтверждено реализацией: Typography.themes.css/.js, импорт ds.css, boot-теги; встречное правило «новый текст пишет letter-spacing только через var(--type-ls)» (MAINTAINING.md:236) подтверждено ls0-проходом.
- **Спеки актуальны** — Typography.md:14–18 описывает двухтабовую таблицу, красную пометку, `TYPO_OLD_DOC_PAGE`, темы и переключатели — совпадает с кодом; Themes.md:37, MAINTAINING.md:232 — то же.

## Находки

### P2

**Р1. Гейт захода красный: `docs/index.md` разошёлся с документацией (КД3) — review-файл этого ревью не внесён в каталог.**

- Где: команда `node .agents/tools/lessons-cli.mjs gate` → `FAIL КД3 docs/index.md — каталог разошёлся с документацией: node .agents/tools/docs-index.mjs`, `ВЕРДИКТ: FAIL (1 из 3)`; остальные две проверки гейта (check, vendor-scan) — OK.
- Доказательство: файл `docs/tasks/RE0048-ds-typography-kit-neo.review.md` существует (создан каркасом под это ревью, в git не отслеживается), но в `docs/index.md` у RE0048 только две строки — задача (строка 1367) и handoff (строка 1414); review-файлы других задач в каталоге есть (RE0044 — строка 1361, RE0044a — строка 1363). Это не дефект реализации RE0048 (на Э6 гейт был OK) — артефакт подготовки повторного ревью, но до закрытия задачи гейт обязан быть зелёным.
- Что сделать: после заполнения этого ревью выполнить `node .agents/tools/docs-index.mjs` (добавит строку каталога) и повторить `node .agents/tools/lessons-cli.mjs gate` — ожидается `ВЕРДИКТ: OK` (3 из 3).

## Не проверено

- Фактический рендер (вне статических прогонов): вид красной подписи и фона строк таблицы, фактический трекинг NEO на живом экране, пересчёт сегмент-контрола при смене темы из панели, file:// с двойным кликом. page-run обеих страниц — «ТОЛЬКО ЗАГРУЗКА»: сценария панели у страниц нет, клики не проигрывались (ЖВ10); переключение табов и сегмента сверено чтением кода (страницы читают `data-pane` клика, сегмент — silent-select без петли, keydown читает `aria-selected` через setTimeout — З13 соблюдён). Визуальная проверка — руками человека по протоколу задачи.
- Изоляция сохранения у копий приложений (вторая часть Б28) — не проверялась: вне объёма повторной приёмки, на Э6 не поднималась.
- Композиция конструктора (КК1–КК4) — к проверяемым страницам не применима: Typography.html и Themes.html — страницы на `main.page` без `ds-split` (паттерн Colors.html), конструктора docs-split не содержат.

## Решения человека (02.11.2026)

| Находка | Решение |
|---|---|
| | |

## Статус исправлений (02.11.2026)

| Находка | Исправление | Проверка |
|---|---|---|
| Р1 | `node .agents/tools/docs-index.mjs` — каталог пересобран, строка ревью внесена (первый прогон упал на разовой блокировке файла, повторный — «ВЕРДИКТ: OK (документов: 1009)») | `node .agents/tools/lessons-cli.mjs gate` — `ВЕРДИКТ: OK (3 шаг.)`, `docs-index --check` — OK |
