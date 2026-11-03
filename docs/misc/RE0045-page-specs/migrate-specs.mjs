#!/usr/bin/env node
// Разовая миграция спек страниц модулей к канону RE0045 (16 разделов).
// Канон читается из .agents/skills/screen-spec/references/template.md.
// По умолчанию — сухой прогон с отчётом; --write — запись файлов;
// --selftest — встроенная проверка на синтетической спеке.
// Отчёт сравнения «до/после»: docs/misc/RE0045-page-specs/migrate-specs.specs.json
//
// Правила:
//  - содержимое старых разделов не теряется: каждая непустая строка тела
//    должна найтись в новом файле как есть или после заявленной перенумерации
//    ссылок (сравнение нормализованное, «lost» = стоп);
//  - заголовки «##» меняются на канонические, свернутые разделы становятся
//    «###» внутри целевого раздела;
//  - новые разделы получают заготовки «Не решено (30.10.2026)» / «Не применимо»,
//    фактам извне (README модуля) верим только там, где указан источник.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../../..');
const REPORT_PATH = join(ROOT, 'docs/misc/RE0045-page-specs/migrate-specs.specs.json');
const DATE = '30.10.2026';

// ── Канон из шаблона ────────────────────────────────────────────────────────

const template = readFileSync(join(ROOT, '.agents/skills/screen-spec/references/template.md'), 'utf8');
const CANON = [...template.matchAll(/^## (\d+)\. (.+)$/gm)]
  .map((m) => ({ num: +m[1], title: m[2] }))
  .sort((a, b) => a.num - b.num);
if (CANON.length !== 16 || CANON.some((c, i) => c.num !== i + 1)) {
  throw new Error(`Канон шаблона: ждал 16 разделов 1..16, получил ${CANON.length}`);
}
const CANON_HEAD = Object.fromEntries(CANON.map((c) => [c.num, `## ${c.num}. ${c.title}`]));

// ── Общие заготовки ─────────────────────────────────────────────────────────

const SCEN = `Не решено (${DATE}) — имён сценариев в ТЗ и бизнес-контексте страницы нет; вопрос в разделе 16.`;

const DEV_NONE = 'Осознанных отклонений нет.';

const scenQuestion = {
  row: (n) => `| ${n} | Имена бизнес-сценариев страницы (раздел 3) не известны — заполнятся, когда появится сценарный раздел | не решено (${DATE}) |`,
  item: (n) => `${n}. Имена бизнес-сценариев страницы (раздел 3) не известны — заполнятся, когда появится сценарный раздел (не решено, ${DATE}).`,
};

// ── Парсер и сборщик ────────────────────────────────────────────────────────

function parseSpec(text) {
  const fm = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!fm) throw new Error('нет YAML-шапки');
  const yamlLines = fm[1].split('\n');
  const rest = text.slice(fm[0].length);
  const h1m = rest.match(/^# .+$/m);
  const heads = [...rest.matchAll(/^## (.+)$/gm)].map((m) => ({
    line: m[0],
    title: m[1].replace(/^\d+[а-я]?\. /, ''),
    at: m.index,
  }));
  const sections = heads.map((h, i) => {
    const bodyStart = h.at + h.line.length;
    const bodyEnd = i + 1 < heads.length ? heads[i + 1].at : rest.length;
    return { title: h.title, body: rest.slice(bodyStart, bodyEnd).replace(/^\n+/, '').replace(/\s+$/, '') };
  });
  return { yamlLines, h1: h1m ? h1m[0] : '', sections };
}

function yamlField(yamlLines, name) {
  const l = yamlLines.find((s) => s.startsWith(name + ':'));
  return l ? l.slice(name.length + 1).trim() : null;
}

function yamlAdd(yamlLines, additions) {
  const out = [...yamlLines];
  for (const a of additions) {
    if (a.after) {
      const i = out.findIndex((s) => a.after.test(s));
      if (i < 0) throw new Error(`YAML-якорь не найден: ${a.after}`);
      out.splice(i + 1, 0, a.line);
    } else {
      out.push(a.line);
    }
  }
  return out;
}

// Перенумерация ссылок: word — «раздел N», para — «§N», raw — точечные замены.
function applyRefs(body, refs) {
  let t = body;
  for (const [from, to] of refs?.raw || []) t = t.split(from).join(to);
  if (refs?.word) {
    const map = refs.word;
    t = t.replace(/(раздел[аеыу]*\s+)(\d+)(?!\d)/g, (m, p, n) => p + (map[n] ?? n));
  }
  if (refs?.para) {
    const map = refs.para;
    t = t.replace(/§(\d+)(?!\d)/g, (m, n) => '§' + (map[n] ?? n));
  }
  return t;
}

function maxQuestionNo(body) {
  let max = 0;
  for (const m of body.matchAll(/^\|\s*(\d+)[а-я]?\s*\|/gm)) max = Math.max(max, +m[1]);
  for (const m of body.matchAll(/^\s*(\d+)\.\s/gm)) max = Math.max(max, +m[1]);
  return max;
}

function buildSpec(cfg, parsed) {
  const buckets = new Map(); // canonNum -> [{ body, asSub }]
  const matched = new Set();
  for (const sec of parsed.sections) {
    const rule = cfg.map.find(([t]) => t === sec.title);
    if (!rule) throw new Error(`раздел не в карте: «${sec.title}»`);
    matched.add(sec.title);
    const [, target, asSub] = rule;
    if (!buckets.has(target)) buckets.set(target, []);
    buckets.get(target).push({ body: applyRefs(sec.body, cfg.refs), asSub });
  }
  const dup = cfg.map.filter(([t], i) => cfg.map.findIndex(([t2]) => t2 === t) !== i);
  if (dup.length) throw new Error(`повтор в карте: ${dup.map((d) => d[0]).join(', ')}`);

  const scenQ = cfg.scenQuestion !== false;
  const extraQ = cfg.extraQuestions || [];
  const parts = [];
  for (const { num } of CANON) {
    parts.push(CANON_HEAD[num]);
    const pieces = [];
    for (const { body, asSub } of buckets.get(num) || []) {
      pieces.push(asSub ? `### ${asSub}\n\n${body}` : body);
    }
    if (!pieces.length) {
      let text = typeof cfg.add?.[num] === 'function' ? cfg.add[num](parsed) : cfg.add?.[num];
      if (num === 3 && text === undefined) text = SCEN;
      if (text === undefined) throw new Error(`раздел ${num} не покрыт (ни карта, ни заготовка)`);
      pieces.push(text);
    }
    if (num === 16 && (scenQ || extraQ.length)) {
      let body = pieces[pieces.length - 1];
      const nextNo = maxQuestionNo(body) + 1;
      const isTable = /^\|\s*№/.test(body);
      const q = [];
      if (scenQ) q.push((isTable ? scenQuestion.row : scenQuestion.item)(nextNo));
      extraQ.forEach((mk, i) => q.push(mk(nextNo + i, isTable)));
      pieces[pieces.length - 1] = body + '\n' + q.join('\n');
    }
    parts.push(pieces.join('\n\n'));
  }

  const yamlLines = cfg.yaml ? yamlAdd(parsed.yamlLines, cfg.yaml) : parsed.yamlLines;
  const h1 = cfg.h1 || parsed.h1;
  return `---\n${yamlLines.join('\n')}\n---\n\n${h1}\n\n${parts.join('\n\n')}\n`;
}

// ── Сравнение «до/после» ────────────────────────────────────────────────────

const norm = (s) => s.replace(/\s+$/, '');

function compare(parsed, cfg, newText) {
  const newSet = new Set(newText.split('\n').filter((l) => l.trim()).map(norm));
  const lost = [];
  const renamed = [];
  for (const sec of parsed.sections) {
    const sub = cfg.map.find(([t]) => t === sec.title)?.[2];
    for (const line of sec.body.split('\n')) {
      if (!line.trim()) continue;
      if (newSet.has(norm(line))) continue;
      const t = applyRefs(line, cfg.refs);
      if (t !== line && newSet.has(norm(t))) { renamed.push(line); continue; }
      // строка могла стать частью ### -заголовка (свернутый раздел)
      lost.push(line);
    }
    if (sub && !newSet.has(norm(`### ${sub}`))) lost.push(`### ${sub}`);
  }
  const oldLines = new Set();
  for (const sec of parsed.sections) {
    oldLines.add(norm(sec.title));
    for (const line of sec.body.split('\n')) {
      if (line.trim()) { oldLines.add(norm(line)); oldLines.add(norm(applyRefs(line, cfg.refs))); }
    }
  }
  const added = [];
  for (const line of newText.split('\n')) {
    if (line.trim() && !line.startsWith('## ') && !oldLines.has(norm(line))) added.push(line);
  }
  const heads = [...newText.matchAll(/^## (.+)$/gm)].map((m) => m[1]);
  const canonOk =
    heads.length === 16 && heads.every((h, i) => h === CANON[i].num + '. ' + CANON[i].title);
  return { canonOk, lost, renamedCount: renamed.length, addedCount: added.length, addedSample: added.slice(0, 12) };
}

// ── Конфигурация файлов ─────────────────────────────────────────────────────

const pairsStub = (p) => (parsed) => {
  const file = yamlField(parsed.yamlLines, 'file') || '';
  const front = yamlField(parsed.yamlLines, 'frontend') || 'new';
  const page = file.split('/').pop() || p;
  return [
    '| Элемент | Прототип | Фронтенд |',
    '|---|---|---|',
    `| Страница | \`${page}\` | ${front} |`,
    '',
    `Соответствие по элементам — не решено (${DATE}); заполнить по правилу 3 скилла`,
    '`screen-spec` (README модуля, `docs/misc/project-tree.md`). Таблица соответствия',
    'файлов — раздел 13.',
  ].join('\n');
};

// Семейство A: 14 разделов, «Пары» уже есть (§3 → §4)
const A = (p) => ({
  path: p,
  family: 'A',
  map: [
    ['Назначение (Purpose)', 1],
    ['Адрес и навигация (Route)', 2],
    ['Пары во фронтенде', 4],
    ['Раскладка (Layout)', 5],
    ['Компоненты (Components)', 6],
    ['Таблицы (Tables)', 7],
    ['Поведение (Behavior)', 8],
    ['Модальные окна (Modals)', 9],
    ['Состояния (States)', 10],
    ['Тексты интерфейса (Texts)', 11],
    ['Данные (Data dependencies)', 12],
    ['Соответствие файлов (Implementation mapping)', 13],
    ['Доступность', 14],
    ['Открытые вопросы и допущения (Open questions)', 16],
  ],
  add: { 3: SCEN, 15: DEV_NONE },
});

// Семейство A′: 13 разделов без «Пар» (вариант fin — 11 разделов у FinInstrument)
const AP = (p, extra = {}) => ({
  path: p,
  family: 'A′',
  map: extra.map || [
    ['Назначение (Purpose)', 1],
    ['Адрес и навигация (Route)', 2],
    ['Раскладка (Layout)', 5],
    ['Компоненты (Components)', 6],
    ['Таблицы (Tables)', 7],
    ['Поведение (Behavior)', 8],
    ['Модальные окна (Modals)', 9],
    ['Состояния (States)', 10],
    ['Тексты интерфейса (Texts)', 11],
    ['Данные (Data dependencies)', 12],
    ['Соответствие файлов (Implementation mapping)', 13],
    ['Доступность', 14],
    ['Открытые вопросы и допущения (Open questions)', 16],
  ],
  add: { 3: SCEN, 4: pairsStub(p), 15: extra.dev || DEV_NONE, ...(extra.add || {}) },
  refs: extra.refs,
  extraQuestions: extra.extraQuestions,
});

const NR = (s) => `Не решено (${DATE}) — ${s}`;

const FILES = [
  // A — клиенты и задачи
  A('apps/core/clients-app/pages/ClientComments.screen.md'),
  A('apps/core/clients-app/pages/ClientInfoPage.screen.md'),
  A('apps/core/clients-app/pages/MyClientsPage.screen.md'),
  A('apps/core/tasks-app/pages/TasksPage.screen.md'),

  // A′ — стандартные 13 разделов
  AP('apps/core/host-app/pages/HomePage.screen.md', {
    refs: { word: { 3: 5, 4: 6, 13: 16 } },
    dev: `Осознанные отклонения описаны в открытых вопросах (раздел 16): пп. 2, 3, 11 — отклонения от Layout и каталога ДС, решения человека 29–30.10.2026.`,
  }),
  AP('apps/ib/funds-app/pages/FundsPipeline.screen.md'),
  AP('apps/postrade/deals-app/pages/FinancialMetrics.screen.md', { refs: { word: { 13: 16 } } }),
  AP('apps/postrade/deals-app/pages/InitialAndAdditionalAgreements.screen.md', { refs: { word: { 13: 16 } } }),
  AP('apps/postrade/deals-app/pages/Instrument.screen.md', {
    refs: { word: { 11: 13, 13: 16 } },
    dev: `Осознанные отклонения описаны в открытых вопросах (раздел 16): п. 8 — две колонки в тайле «Баланс и валюта», оставлено по макету (замечание K5 сенсора, не решено 27.10.2026).`,
  }),
  AP('apps/postrade/deals-app/pages/Tranche.screen.md', {
    refs: {
      word: { 13: 16 },
      raw: [
        ['(разделы 2, 3, 8 и 13, вопросы 4 и 11)', '(разделы 2, 5, 10 и 16, вопросы 4 и 11)'],
        ['(раздел 4: дерево продуктов', '(раздел 12: дерево продуктов'],
      ],
    },
  }),
  AP('apps/postrade/deals-app/pages/TransferSchemas.screen.md', { refs: { word: { 7: 8, 13: 16 } } }),
  AP('apps/postrade/post-reports-app/pages/FairValueCalculation.screen.md', {
    // «раздел 3/7» в Источниках — ссылка на docs/tasks/RE0012, не на спеку: только § и точечные
    refs: { para: { 6: 8 }, raw: [['(раздел 7)', '(раздел 9)']] },
  }),
  AP('apps/postrade/post-reports-app/pages/FairValueRegister.screen.md'),

  // A′ — FinInstrument: 11 разделов (нет «Таблиц» и «Модальных»)
  AP('apps/postrade/deals-app/pages/FinInstrument.screen.md', {
    map: [
      ['Назначение (Purpose)', 1],
      ['Адрес и навигация (Route)', 2],
      ['Раскладка (Layout)', 5],
      ['Компоненты (Components)', 6],
      ['Поведение (Behavior)', 8],
      ['Состояния (States)', 10],
      ['Тексты интерфейса (Texts)', 11],
      ['Данные (Data dependencies)', 12],
      ['Соответствие файлов (Implementation mapping)', 13],
      ['Доступность', 14],
      ['Открытые вопросы и допущения (Open questions)', 16],
    ],
    add: {
      7: 'Не применимо: таблиц в разметке страницы нет.',
      9: 'Не применимо: окна страницы — виджеты `widgets/modals/` (перечень — YAML `widgets`, паспорта там).',
    },
    refs: { raw: [['(раздел 4, «Финансовые инструменты»', '(раздел 12, «Финансовые инструменты»']] },
  }),

  // спец — dashboard-app/HomePage: 17 разделов
  {
    path: 'apps/core/dashboard-app/pages/HomePage.screen.md',
    family: 'спец',
    map: [
      ['Назначение (Purpose)', 1],
      ['Адрес и навигация (Route)', 2],
      ['Раскладка (Layout)', 5],
      ['Компоненты (Components)', 6],
      ['Таблицы (Tables)', 7],
      ['Поведение (Behavior)', 8],
      ['Скрипт экрана (Script)', 8, 'Скрипт экрана (Script)'],
      ['Модальные окна (Modals)', 9],
      ['Состояния (States)', 10],
      ['Демо-состояния (Demo)', 10, 'Демо-состояния (Demo)'],
      ['Тексты интерфейса (Texts)', 11],
      ['Данные (Data dependencies)', 12],
      ['Соответствие файлов (Implementation mapping)', 13],
      ['Доступность', 14],
      ['Отличия от макета (Deviations)', 15, 'Отличия от макета (Deviations)'],
      ['Кандидаты в ДС', 15, 'Кандидаты в ДС'],
      ['Открытые вопросы и допущения (Open questions)', 16],
    ],
    add: { 3: SCEN, 4: pairsStub('HomePage') },
    refs: { word: { 3: 5, 14: 15, 17: 16 } },
  },

  // спец — banker-app/RequestThread: 16 разделов
  {
    path: 'apps/ib/banker-app/pages/RequestThread.screen.md',
    family: 'спец',
    map: [
      ['Назначение (Purpose)', 1],
      ['Адрес и навигация (Route)', 2],
      ['Раскладка (Layout)', 5],
      ['Компоненты (Components)', 6],
      ['Таблицы (Tables)', 7],
      ['Поведение (Behavior)', 8],
      ['Лента, композер и подготовка материала (БТ-3, БТ-7)', 8, 'Лента, композер и подготовка материала (БТ-3, БТ-7)'],
      ['Скрипт экрана', 8, 'Скрипт экрана'],
      ['Модальные окна (Modals)', 9],
      ['Состояния (States)', 10],
      ['Тексты интерфейса (Texts)', 11],
      ['Данные (Data dependencies)', 12],
      ['Соответствие файлов (Implementation mapping)', 13],
      ['Доступность', 14],
      ['Дефекты ДС, найденные при сборке', 15, 'Дефекты ДС, найденные при сборке'],
      ['Открытые вопросы и допущения (Open questions)', 16],
    ],
    add: { 3: SCEN, 4: pairsStub('RequestThread') },
    refs: {
      word: { 3: 5, 6: 8, 9: 11, 13: 8, 14: 8 },
      raw: [
        // сначала 6→8 (ссылка на Поведение host-app), затем 4→6 (Компоненты) — иначе конфликт
        ['HomePage.screen.md`, раздел 6', 'HomePage.screen.md`, раздел 8'],
        ['HomePage.screen.md`, раздел 4', 'HomePage.screen.md`, раздел 6'],
      ],
    },
  },

  // B — deals-app, старый формат
  {
    path: 'apps/postrade/deals-app/pages/Deal.screen.md',
    family: 'B',
    h1: '# Page: Deal — Сделка',
    map: [
      ['Назначение', 1],
      ['Модульная сборка', 6, 'Модульная сборка'],
      ['Навигация', 2],
      ['Источник данных сделки', 12],
      ['Раскладка', 5],
      ['Поведение', 8],
      ['Открытые вопросы и допущения', 16],
    ],
    add: {
      3: SCEN,
      4: [
        '| Элемент | Прототип | Фронтенд |',
        '|---|---|---|',
        '| Страница | `pages/Deal.html` (источник; собранный — `Deal.preview.html`) | postrade/deals-app/pages/Deal |',
        '',
        `Соответствие по элементам — не решено (${DATE}): тайлы и окна страницы — виджеты \`widgets/\``,
        'с теми же именами во фронте (README модуля, «Имена фронтенда»); поэлементно заполнить',
        'по README модуля.',
      ].join('\n'),
      7: 'Не применимо: таблиц в разметке страницы нет — таблица таба «Контрагенты» — виджет `widgets/tables/DealCounterpartiesTable` (паспорт).',
      9: 'Не применимо: окна собраны из виджетов `widgets/modals/` (перечень — YAML `widgets`, поведение открытия — раздел 8).',
      10: NR('сводки Loading/Empty/Error/Disabled нет: режимы и заглушки описаны по месту (разделы 8 и 12, паспорта тайлов).'),
      11: NR('отдельной таблицы нет; тексты по месту — разделы 8 и 12.'),
      13: [
        '| Элемент | Прототип | Фронтенд (предложение) |',
        '|---|---|---|',
        '| Страница | `pages/Deal.html` → сборка `Deal.preview.html` | postrade/deals-app `Deal` — путь выберет разработка |',
        '| Тайлы и окна | `widgets/…` — YAML `widgets` | имена во фронте те же (README модуля, «Имена фронтенда») |',
      ].join('\n'),
      14: NR('сводки нет; aria-атрибуты по месту — разделы 8 и 12.'),
      15: 'Осознанные отклонения описаны в открытых вопросах (раздел 16): пп. 1, 11 — сворачиваемый заголовок раздела и ширины тайлов по решениям человека.',
    },
    refs: { para: { 6: 8, 7: 16 }, raw: [['§7.2', '§16, п. 2']] },
    yaml: [
      { after: /^screen:/, line: 'kind: screen' },
      { after: /^file:/, line: `module: postrade/deals-app\nfrontend: postrade/deals-app/pages/Deal\nroute: не решено (${DATE})` },
      { line: 'widgets: [tables/DealCounterpartiesTable, tiles/CounterpartiesTile, tiles/DealDescriptionTile, tiles/DealFinancialMetricsTile, tiles/DealMetricsCalculationTile, tiles/DealPeriodTile, tiles/DealProductTreeTile, tiles/DealRelatedCollateralsTile, tiles/DealTeamTile, tiles/FinInstrumentsTile, tiles/Navigator, tiles/ProjectInformationTile, popovers/RelatedDealsPopover, modals/CounterpartiesEcmModal, modals/DealDescriptionModal, modals/DealFinancialInstrumentCreateModal, modals/DealFinancialInstrumentEditModal, modals/DealFinancialMetricsModal, modals/DealPeriodModal, modals/DealProjectInformationModal, modals/DealTeamModal, modals/DealTitleModal, modals/DidProductsModal, modals/FixationModal, modals/InstrumentTransferModal, modals/InstrumentsCounterpartiesModal, modals/InstrumentsModal, modals/LinkChangeModal, modals/NavigatorAppointmentOfResponsibleModal, modals/NavigatorApprovalModal, modals/NavigatorChangeReasonModal, modals/NavigatorDealCloseModal, modals/NavigatorForwardToTransferModal, modals/ProductTreeConfirmModal, modals/ProductsModal, modals/RepaymentModal]' },
    ],
  },
  {
    path: 'apps/postrade/deals-app/pages/MainPage.screen.md',
    family: 'B',
    h1: '# Page: MainPage — Главная страница',
    map: [
      ['Назначение', 1],
      ['Навигация', 2],
      ['Источник данных — единый каталог', 12, 'Источник данных — единый каталог'],
      ['Раскладка (1920, референс)', 5],
      ['Поведение', 8],
      ['Состав (роль «Финансист ДИД»)', 5, 'Состав (роль «Финансист ДИД»)'],
      ['Открытые вопросы', 16],
    ],
    add: {
      3: SCEN,
      4: 'Не применимо: пары во фронтенде нет (`frontend: new`) — главной страницы deals-app в дереве фронтенда нет (README модуля, «Имена фронтенда»).',
      6: NR('таблицы компонентов нет; состав — YAML `components`, сборка каркаса — раздел 5.'),
      7: 'Не применимо: таблиц на странице нет.',
      9: NR('окно смены роли описано в разделе 8 («Поведение»), сводной таблицы нет.'),
      10: NR('сводки Loading/Empty/Error/Disabled нет.'),
      11: NR('отдельной таблицы нет; названия плиток — раздел 5 (подраздел «Состав»).'),
      13: NR('таблицы нет; страница без пары во фронте (`frontend: new`).'),
      14: NR('сводки нет; aria-current пункта меню — раздел 2.'),
      15: DEV_NONE,
    },
    refs: { raw: [['(разделы 3, 5 и 6, вопрос 3)', '(разделы 5, 8 и 12, вопрос 3)']] },
    yaml: [
      { after: /^screen:/, line: 'kind: screen' },
      { after: /^file:/, line: `module: postrade/deals-app\nfrontend: new\nroute: не решено (${DATE})` },
      { line: 'widgets: []' },
    ],
  },
  {
    path: 'apps/postrade/deals-app/pages/Portfolio.screen.md',
    family: 'B',
    h1: '# Page: Portfolio — Текущий портфель ДИД',
    map: [
      ['Назначение', 1],
      ['Навигация', 2],
      ['Источник данных навигации', 12, 'Источник данных навигации'],
      ['Шапка страницы (PageHeader)', 5, 'Шапка страницы (PageHeader)'],
      ['Раскладка', 5],
      ['Таблица «Сделки»', 7],
      ['Статусы', 7, 'Статусы'],
      ['Модальные окна', 9],
      ['Поведение', 8],
      ['Тексты интерфейса', 11],
      ['Компоненты ДС', 6],
      ['Открытые вопросы и допущения', 16],
    ],
    add: {
      3: SCEN,
      4: [
        '| Элемент | Прототип | Фронтенд |',
        '|---|---|---|',
        '| Страница | `pages/Portfolio.html` | `new` — кандидаты: страница `Deals`, таблица `CurrentPortfolioDidTable` |',
        '',
        'Таблица «Сделки» здесь — в разметке страницы, не виджет; вопрос о паре — раздел 16.',
      ].join('\n'),
      10: NR('EmptyState и его тексты — разделы 8 и 11; сводки Loading/Error/Disabled нет.'),
      13: NR('таблицы нет; страница без подтверждённой пары (раздел 4).'),
      14: NR('сводки нет; aria-sort шапки таблицы — раздел 7, aria-current пункта меню — раздел 2.'),
      15: DEV_NONE,
    },
    extraQuestions: [
      (n) => `| ${n} | Пара страницы во фронтенде: кандидаты — страница \`Deals\` и таблица \`CurrentPortfolioDidTable\` (README модуля, «Имена фронтенда»); таблица «Сделки» — в разметке страницы, не виджет | не решено (${DATE}) |`,
    ],
    yaml: [
      { after: /^screen:/, line: 'kind: screen' },
      { after: /^file:/, line: `module: postrade/deals-app\nfrontend: new\nroute: не решено (${DATE})` },
      { line: 'widgets: []' },
    ],
  },
];

// ── Прогон ──────────────────────────────────────────────────────────────────

function migrateOne(cfg) {
  const full = join(ROOT, cfg.path);
  const text = readFileSync(full, 'utf8');
  const parsed = parseSpec(text);
  const newText = buildSpec(cfg, parsed);
  const cmp = compare(parsed, cfg, newText);
  return { cfg, text, newText, parsed, cmp };
}

function main() {
  const write = process.argv.includes('--write');
  const report = { date: DATE, written: write, files: [] };
  let bad = 0;
  for (const cfg of FILES) {
    let r;
    try {
      r = migrateOne(cfg);
    } catch (e) {
      bad++;
      report.files.push({ file: cfg.path, family: cfg.family, error: String(e.message || e) });
      console.log(`FAIL ${cfg.path}: ${e.message}`);
      continue;
    }
    const { cmp } = r;
    const ok = cmp.canonOk && cmp.lost.length === 0;
    if (!ok) bad++;
    report.files.push({
      file: cfg.path,
      family: cfg.family,
      canonOk: cmp.canonOk,
      lost: cmp.lost.slice(0, 20),
      lostCount: cmp.lost.length,
      renamedCount: cmp.renamedCount,
      addedCount: cmp.addedCount,
      addedSample: cmp.addedSample,
    });
    console.log(
      `${ok ? 'OK  ' : 'FAIL'} ${cfg.path} [${cfg.family}] renamed=${cmp.renamedCount} added=${cmp.addedCount}${cmp.lost.length ? ` LOST=${cmp.lost.length}` : ''}${cmp.canonOk ? '' : ' НЕ-КАНОН'}`,
    );
    if (write && ok) writeFileSync(join(ROOT, cfg.path), r.newText, 'utf8');
  }
  writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2) + '\n', 'utf8');
  console.log(`\nОтчёт: ${REPORT_PATH}`);
  console.log(bad === 0 ? 'Все файлы чистые.' : `Проблемных файлов: ${bad} (запись для них пропущена).`);
  process.exitCode = bad === 0 ? 0 : 1;
}

// ── Селфтест на синтетике ───────────────────────────────────────────────────

function selftest() {
  // Синтетика собирается из самой карты A′: полный набор старых разделов
  const cfg = AP('apps/x/mod/pages/Sample.screen.md', { refs: { word: { 13: 16 } } });
  const sample = [
    '---',
    'screen: Sample',
    'kind: screen',
    'title: Пример',
    'file: apps/x/mod/pages/Sample.preview.html',
    'module: x/mod',
    'frontend: x/mod/pages/Sample',
    '---',
    '',
    '# Page: Sample — Пример',
    '',
  ];
  cfg.map.forEach(([title], i) => {
    const n = i + 1;
    sample.push(`## ${n}. ${title}`, '');
    if (n === 2) sample.push('Адрес не решён — вопрос в разделе 13.', '');
    else if (title.startsWith('Открытые вопросы')) {
      sample.push('| № | Вопрос / допущение | Статус |', '|---|---|---|', '| 1 | Первый вопрос | вопрос |', '');
    } else sample.push(`Тело раздела ${n}.`, '');
  });
  const parsed = parseSpec(sample.join('\n'));
  const newText = buildSpec(cfg, parsed);
  const cmp = compare(parsed, cfg, newText);
  const checks = [
    ['канон 16 разделов', cmp.canonOk],
    ['без потерь', cmp.lost.length === 0],
    ['ссылка 13→16 перенумерована', newText.includes('вопрос в разделе 16')],
    ['сценарии-заготовка', newText.includes('## 3. Сценарии (Scenarios)')],
    ['пары-заготовка со страницей', newText.includes('| Страница | `Sample.preview.html` | x/mod/pages/Sample |')],
    ['отклонения-заготовка', newText.includes('## 15. Осознанные отклонения (Deviations)')],
    ['вопрос о сценариях добавлен №2', newText.includes('| 2 | Имена бизнес-сценариев')],
    ['«Пары» на месте §4', newText.indexOf('## 4. Пары во фронтенде (Frontend pairs)') > 0],
  ];
  let bad = 0;
  for (const [name, ok] of checks) {
    console.log(`${ok ? 'OK  ' : 'FAIL'} ${name}`);
    if (!ok) bad++;
  }
  console.log(bad === 0 ? 'Селфтест миграции: OK' : `Селфтест миграции: FAIL (${bad})`);
  process.exitCode = bad === 0 ? 0 : 1;
}

if (process.argv.includes('--selftest')) selftest();
else main();
