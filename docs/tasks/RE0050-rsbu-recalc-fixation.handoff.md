---
task: RE0050
updated: 2026-11-05
status: review
---

# Handoff RE0050 — Корректировки РСБУ v4: пересчёт с фиксацией

## Состояние

Э10–Э14 закрыты: спека на разработку — 37/37 (3.104), тосты в снимках; приёмка нового виджета и
экранов — PASS; гейт — OK. Задача в `review`, ждёт приёмки человеком.
Работа идёт в концепте `apps/postrade/drafts/tranche-page-v04/`, спеке
`RsbuInterestAdjustmentsV4`, концепт-приложении предложений и общей странице `Spec.html`.
Коммита нет.

## Этапы

- [x] Э0–Э9 — базовая версия RE0050 (03.11.2026 — 05.11.2026).
- [x] Э10 — ответы 05.11.2026, вторая волна: предложения, без ФИ, комментарий; документ,
  страница предложений, `app.json`/хаб.
- [x] Э11 — прототип: владелец-транш без ФИ, комментарий во всех созданных строках, выбор
  нескольких, фильтр по двум датам / сумме / комментарию, массовое удаление.
- [x] Э12 — виджет `RsbuAdjustmentsFilterModal`, паспорта, бизнес-смысл/глоссарий, панель,
  сценарий `RsbuInterestAdjustments.scenario.mjs`.
- [x] Э13 — `Spec.html` без вкладок версий; спека 3.101; 41/41, тосты в снимках.
- [x] Э14 — приёмка нового виджета PASS, приёмка экранов PASS, гейт OK, handoff, затраты.

## Что сделано

| Слой | Файлы | Суть |
|---|---|---|
| Стор | `data/fin-metrics-store.js` | `ownerKey(fiId, trancheId)` — без ФИ владелец `TRANCHE-<id>`; `recalcPayments(owner, {…, comment})` работает без ФИ; комментарий во все созданные строки; `removeRasAdjustments(ids)`; `?rasAdj=no-fi` |
| Транш | `pages/Tranche.html` | без ФИ обе кнопки доступны, тултип и блокировка убраны; окно открывается без ФИ; владелец через `ownerKey` |
| Окно фиксации | `RsbuFixationModal.*` | поле «Комментарий» (`inp--multiline`), `read/fill` его ведут; паспорт/CHANGELOG |
| Страница | `RsbuInterestAdjustments.html` | `.dtable-toolbar` + TableFilter; колонка чекбоксов 44px; фильтр (две даты, сумма, комментарий); чип «Применено»; выбор по id; bulk-строка; массовое удаление; пустое состояние после фильтра; сортировка переприменяется, `№` пересчитывается |
| Виджет | `widgets/modals/RsbuAdjustmentsFilterModal/` | новый локальный виджет: html/js/md/fixtures/CHANGELOG; API `bind/open/preview/fill/empty/normalize/count` |
| Предложения | `tranche-page-v04-proposals/` | №2 снят, №4 отклонён (позже нормальное редактирование), №5 реализован; карточек нет — «Рассмотрены» и пустое состояние; `app.json`/хаб |
| Спеки/знания | `*.screen.md`, паспорта, глоссарий | без ФИ, комментарий, фильтр/массовое удаление, источник строки не показывается |
| Панель | `proto-panel/flows.yaml` | состояние 75 без блокировки; новые 83–89; сценарий `rsbu-bulk` |
| Общий подход | `dev-specs/pages/Spec.html`, `Spec.screen.md`, `.agents/skills/dev-spec/SKILL.md`, шапка `dev-spec.mjs` | вкладок версий нет, версия — аккордеон хаба, `stage` в подзаголовке; каталог сохраняет кнопки версий |
| Dev-spec | `RsbuInterestAdjustmentsV4.dev-spec.md` | 3.104, два сценария (отбор и массовое удаление — ветка первого), шаги с 1 в каждом сценарии, 37 снимков, фильтр/комментарий/массовое удаление; `--check`/`--diff` OK |
| Тосты | `dev-spec`, `flows.yaml` | снимок/состояние, обещающее тост или снек, проигрывает действие и ждёт `.toast--success`/`.snack`; новые `page-deleted`/`bulk-deleted`; состояния 55/61/73/80/64/90/91; урок Л300 и правило в скилле `dev-spec` |
| Сценарий | `pages/RsbuInterestAdjustments.scenario.mjs` | apply/clear фильтра, выбор, массовое удаление, сортировка после фильтра, no-FI |

## Проверки

- `layout-check` — OK: Tranche 7 прежних, RsbuInterestAdjustments 1, Proposals 0, Spec 1.
- `page-run` — OK: Tranche (все состояния, включая 75/83/84), RsbuInterestAdjustments (все
  flows 85–89), Proposals (только загрузка, статическая). Сценарий
  `RsbuInterestAdjustments.scenario.mjs` — findings пусто на `rasAdj=multi` и `rasAdj=no-fi`.
- `registry-check` — OK; `manifest-check` — OK; `kit-build` — OK (130 компонентов, концепты
  в витрину не попадают); `hub-build` — OK; `dev-spec --check` — OK; `docs-index` — OK;
  `lessons-cli gate` — `ВЕРДИКТ: OK`. Снимков 37/37 (3.104), тосты в кадрах.
- `page-run` по `Spec.html` — ложный `ЖВ3 window.__ppLite` на всех четырёх данных спек
  (строка внутри HTML-строки инспектора); страница грузится, `layout-check` — OK.
- Приёмка нового виджета: NEEDS-WORK (2 блокера + 6 замечаний) → исправлены backdrop-тексты,
  сортировка после фильтра, `aria-expanded`, `TableFilter` в паспорте, канон состояний,
  делегирование `count/empty`, сценарий, NBSP; повторная приёмка — PASS.
- Приёмка экранов: PASS; 6 заметок исправлено (`aria-live` у bulk-счётчика, `InputText` в
  таблице компонентов Tranche, сброс выбора до записи в стор, NBSP-эскейпы, старая строка
  решения помечена отменённой, сценарий `Proposals.scenario.mjs`).
- `lessons-cli gate` — `ВЕРДИКТ: OK`; `docs-index` пересобран.
- Правки человека 05.11.2026 в спеке разобраны: 18 блоков, журнал `edits-log.md`, закономерности
  `edit-patterns.md`; «Почему»-комментарии убраны. В «Коротко» остались «Что» и «Зачем».
- Снимки `page-empty`, `page-created`, `page-multi`, `page-view` пересняты после жалобы на пустую
  колонку выбора: колонка есть на всех редактируемых состояниях, в просмотре её нет (Л301).
- Третья волна 05.11.2026: правки человека (112 блоков) разобраны; ветки-дубли убраны, шаги
  сценария 2 — с 1, колонки таблицы — в шаге 5, матрица без оси «без ФИ», пустой комментарий —
  пустая ячейка, целевая дата вводится вручную. Пересняты 9 снимков, 37/37; `--check`/`--diff` OK,
  `page-run` OK, `layout-check` OK, гейт OK.

## Что дальше

1. Человек смотрит прототип и спеку: транш без ФИ → «Пересчитать с фиксацией» с комментарием →
  корректировки → фильтр/выбор/массовое удаление; отдельно — страница предложений (карточек нет,
  «Рассмотрены») и просмотрщик спек без вкладок. В спеке 41/41, тосты в кадрах.
2. Решить решения агента из задачи: `ownerKey` без ФИ, колонка выбора 44px, флажок комментария,
   сортировка после фильтра, страница предложений — пустое состояние «Рассмотрены».
3. `/promote` после приёмки — изменения уйдут в `postrade/deals-app`; новый виджет появится в
  витрине локальных компонентов.
4. Коммит — только по прямой просьбе человека.

## Читать первыми

1. `docs/tasks/RE0050-rsbu-recalc-fixation.md` — решения 05.11.2026 (вторая волна), итог,
   решения агента.
2. `apps/postrade/drafts/dev-specs/refs/RsbuInterestAdjustmentsV4/RsbuInterestAdjustmentsV4.dev-spec.md`.
3. `apps/postrade/drafts/tranche-page-v04/data/fin-metrics-store.js`.
4. `apps/postrade/drafts/tranche-page-v04/pages/RsbuInterestAdjustments.html` — фильтр, выбор,
   массовое удаление.
5. `apps/postrade/drafts/tranche-page-v04/widgets/modals/RsbuAdjustmentsFilterModal/`.
6. `apps/postrade/drafts/tranche-page-v04/pages/RsbuInterestAdjustments.scenario.mjs`.
