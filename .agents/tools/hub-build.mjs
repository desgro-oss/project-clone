#!/usr/bin/env node
/* ============================================================
   HUB-BUILD — генератор реестра хаба (hub.js) из записей приложений.

   Зачем (реструктуризация, шаг Ш9). До генератора новое приложение
   регистрировалось правкой общего файла в корне, а забывчивость сторожил
   отдельный валидатор. Теперь запись принадлежит приложению: `apps/…/<id>/app.json`
   (каталог приложения — модуль `<раздел>/<имя>-app/` или концепт
   `<раздел>/drafts/<имя>/`, с 23.09.2026; места сторожит registry-check, П8)
   (id, track, title, desc, home, icon), а `hub.js` собирается отсюда. Модуль, до
   которого доходят с главной другого модуля (плитка), не получает строки на
   хабе: в его app.json стоит `"hub": false` (с 08.10.2026) — запись проверяется
   как обычно, в hub.js не попадает. Запись
   дизайн-системы — `project.json → hub.ds`, её href — `<ДС>/index.html`.
   Витрина локальных компонентов (с 25.09.2026) — `project.json → localKit`,
   вторая запись колонки ДС, href — `<localKit.dir>/index.html`: это второй
   вход в документацию, а не экран продукта. Карта экранов проекта (с
   11.10.2026, задача RE0015) — `project.json → screenMap.maps`: запись сразу
   под записью приложения `after`, в его колонке, href —
   `<screenMap.dir>/<раздел>/index.html`, root — папка карты.
   Сторожу хаба остаётся проверить, что генератор отработал, и что экраны
   ведут обратно в хаб.

   Новый UI хаба (24.10.2026, концепт hub-redesign): концепт — одна плитка с
   версиями, а не по плитке на версию. Версии одного концепта связывают
   необязательные поля app.json `concept` (название концепта) и `version`
   (подпись версии: «v3») — только вместе; записи с одним `concept` хаб
   собирает в аккордеон. Спецификации на разработку (RE0016) — отдельный
   массив `window.IBPHubSpecs`: по записи на `<приложение>/refs/<Spec>/<Spec>.dev-spec.md`
   (front matter: spec, title, module, version, stage, date); href —
   `<root>/pages/Spec.html?spec=<Spec>`. Спеки с одним title хаб собирает в
   аккордеон версий так же, как концепты.

   Формат `hub.js` прежний — обычный `<script>` с `window.IBPHub`: хаб
   открывается двойным кликом (`file://`), где `fetch` не работает. Страница
   хаба (`index.html`) не меняется (решение владельца Р6).

   Порядок записей: дизайн-система, витрина, затем треки в порядке манифеста, внутри
   трека — приложения по id. Группа записи — `hubGroup` трека приложения.

   Коды ХБ — «хаб»:
     ХБ1 манифест не объявляет каталог приложений или реестр (apps.dir,
         hub.registry) — собирать не из чего;
     ХБ2 реестра нет;
     ХБ3 реестр разошёлся с записями приложений — правлен руками или не
         пересобран после правки app.json;
     ХБ4 запись приложения не годится для сборки: app.json не читается, нет
         поля, трек не из манифеста, id не совпадает с каталогом.

   Использование:
     node hub-build.mjs             — собрать hub.js
     node hub-build.mjs --check     — сверить, ничего не записывая
     node hub-build.mjs --selftest  — откат на временном дереве
   Строка `ВЕРДИКТ: OK | FAIL`, код выхода 0 | 1.
   ============================================================ */
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync, mkdtempSync, readdirSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { project, need, findApps, dsPaths } from './project.mjs';

/* Раскладка ДС — у модуля путей ДС (задача RE0002): где в ДС стили, скрипты,
   страницы и спеки, оснастка не пишет литералами папок. Модуль — из ДС этого
   проекта, раскладка — для ДС любого манифеста, в том числе стенда селфтеста. */
const DSP = await dsPaths();

const HERE = path.dirname(fileURLToPath(import.meta.url));
const GEN = 'hub-build.mjs';
const APP_FIELDS = ['id', 'track', 'title', 'desc', 'home', 'icon'];
/* Необязательное поле `shelf` — полка приложения на хабе: «actual» (актуальное) или «archive»
   (архив). Хаб раскладывает по полкам аккордеонами тот раздел концептов, где поле есть хотя бы
   у одного приложения; приложение без поля в таком разделе — в «Актуальном». */
const SHELVES = ['actual', 'archive'];
/* Необязательные `concept` + `version` — версия концепта: записи с одним `concept` — одна плитка-аккордеон. */
const SPEC_FIELDS = ['spec', 'title', 'module', 'version'];
const DS_FIELDS = ['id', 'title', 'desc', 'icon'];
const KIT_FIELDS = ['id', 'title', 'desc', 'icon'];
const KB_FIELDS = ['id', 'section', 'title', 'desc', 'icon'];
const MAP_FIELDS = ['id', 'section', 'title', 'desc', 'icon', 'after'];

const js = (v) => (v === null ? 'null' : "'" + String(v).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n') + "'");

/** Front matter спеки (ключ: значение, одна строка; списки и вложенное пропускаются). */
function frontOf(text) {
  const lines = text.split(/\r?\n/);
  if (lines[0] !== '---') return {};
  const end = lines.indexOf('---', 1);
  const out = {};
  for (const l of end > 0 ? lines.slice(1, end) : []) {
    const m = l.match(/^([A-Za-z]+):\s*(.+?)\s*$/);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return out;
}

/** Спеки на разработку приложения: refs/<Spec>/<Spec>.dev-spec.md → записи IBPHubSpecs. */
function collectSpecs(P, dir, defects) {
  const refs = path.join(P.root, P.appsDir, dir, 'refs');
  if (!existsSync(refs)) return [];
  const out = [];
  for (const e of readdirSync(refs, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    const file = path.join(refs, e.name, e.name + '.dev-spec.md');
    if (!existsSync(file)) continue;
    const rel = P.appsDir + '/' + dir + '/refs/' + e.name + '/' + e.name + '.dev-spec.md';
    const front = frontOf(readFileSync(file, 'utf8'));
    const miss = SPEC_FIELDS.filter((k) => !front[k]);
    if (miss.length) { defects.push('ХБ4 ' + rel + ' — нет полей front matter: ' + miss.join(', ')); continue; }
    if (front.spec !== e.name) { defects.push('ХБ4 ' + rel + ' — spec «' + front.spec + '» не совпадает с папкой «' + e.name + '»'); continue; }
    const root = P.appsDir + '/' + dir;
    out.push({ id: front.spec, title: front.title, module: front.module, version: front.version, ...(front.stage ? { stage: front.stage } : {}), ...(front.date ? { date: front.date } : {}), href: root + '/pages/Spec.html?spec=' + encodeURIComponent(front.spec), root });
  }
  return out;
}

/** Записи реестра из манифеста и app.json приложений: { entries, specs, defects }. */
export function collect(P) {
  const defects = [];
  if (!P.appsDir || !P.hubRegistry) {
    defects.push('ХБ1 project.json не объявляет каталог приложений или реестр хаба (apps.dir, hub.registry)');
    return { entries: [], specs: [], defects };
  }
  const entries = [];
  const specs = [];
  const ds = (P.manifest.hub && P.manifest.hub.ds) || null;
  if (ds) {
    const miss = DS_FIELDS.filter((k) => typeof ds[k] !== 'string' || !ds[k].trim());
    if (miss.length) defects.push('ХБ4 project.json → hub.ds — нет полей: ' + miss.join(', '));
    else entries.push({ id: ds.id, group: 'ds', title: ds.title, desc: ds.desc, href: P.ds + '/index.html', root: null, icon: ds.icon });
  }
  const kit = P.manifest.localKit || null;
  if (kit) {
    /* kits (09.10.2026) — по записи на раздел, href — обзор раздела; без kits — одна запись. */
    const kits = Array.isArray(kit.kits) && kit.kits.length ? kit.kits : [kit];
    for (const k of kits) {
      const miss = KIT_FIELDS.filter((f) => typeof k[f] !== 'string' || !k[f].trim());
      if (miss.length) { defects.push('ХБ4 project.json → localKit — нет полей: ' + miss.join(', ')); continue; }
      const dir = kit.dir || 'kit';
      entries.push({ id: k.id, group: 'ds', title: k.title, desc: k.desc, href: dir + (k.section ? '/' + k.section : '') + '/index.html', root: null, icon: k.icon });
    }
  }
  const tracks = P.tracks.filter((t) => t.id && t.hubGroup);
  const byTrack = new Map(tracks.map((t) => [t.id, []]));
  /* Приложение — каталог с app.json на любой глубине apps/: разделы
     (модули `<раздел>/<имя>-app/`, концепты `<раздел>/drafts/<имя>/`). */
  for (const { dir } of findApps(P.root, P.appsDir, P.appsManifest)) {
    const rel = P.appsDir + '/' + dir + '/' + P.appsManifest;
    const file = path.join(P.root, rel);
    let app;
    try { app = JSON.parse(readFileSync(file, 'utf8')); } catch (e) { defects.push('ХБ4 ' + rel + ' не читается как JSON: ' + e.message); continue; }
    const miss = APP_FIELDS.filter((k) => typeof app[k] !== 'string' || !app[k].trim());
    if (miss.length) { defects.push('ХБ4 ' + rel + ' — нет полей записи: ' + miss.join(', ')); continue; }
    if (app.id !== path.posix.basename(dir)) { defects.push('ХБ4 ' + rel + ' — id «' + app.id + '» не совпадает с каталогом «' + path.posix.basename(dir) + '»'); continue; }
    if (!byTrack.has(app.track)) { defects.push('ХБ4 ' + rel + ' — track «' + app.track + '» не из треков манифеста: ' + [...byTrack.keys()].join(', ')); continue; }
    if (app.hub === false) continue;        // приложение без строки на хабе
    if (app.shelf !== undefined && !SHELVES.includes(app.shelf)) { defects.push('ХБ4 ' + rel + ' — shelf «' + app.shelf + '» не из списка: ' + SHELVES.join(', ')); continue; }
    if ((app.concept === undefined) !== (app.version === undefined)) { defects.push('ХБ4 ' + rel + ' — concept и version задаются только вместе'); continue; }
    if (app.concept !== undefined && (typeof app.concept !== 'string' || !app.concept.trim() || typeof app.version !== 'string' || !app.version.trim())) { defects.push('ХБ4 ' + rel + ' — concept и version — непустые строки'); continue; }
    byTrack.get(app.track).push({ ...app, dir });
    specs.push(...collectSpecs(P, dir, defects));
  }
  for (const t of tracks) {
    for (const app of byTrack.get(t.id).sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))) {
      const root = P.appsDir + '/' + app.dir;
      entries.push({ id: app.id, group: t.hubGroup, title: app.title, desc: app.desc, href: root + '/' + app.home.replace(/^\.\//, ''), root, icon: app.icon, ...(app.shelf ? { shelf: app.shelf } : {}), ...(app.concept ? { concept: app.concept, version: app.version } : {}) });
    }
  }
  /* Карты экранов (задача RE0015, решение человека 11.10.2026): пункт карты —
     сразу под записью приложения `after`, в его колонке («Карта Post» под
     «Post — ДИД»); root — папка карты: это не приложение, сторож хаба знает. */
  const sm = P.manifest.screenMap;
  if (sm && Array.isArray(sm.maps)) {
    const placed = new Map();   // несколько карт под одной записью — в порядке манифеста
    for (const m of sm.maps) {
      const miss = MAP_FIELDS.filter((f) => typeof (m && m[f]) !== 'string' || !m[f].trim());
      if (!P.screenMap || miss.length) { defects.push('ХБ4 project.json → screenMap.maps — ' + (P.screenMap ? 'нет полей: ' + miss.join(', ') : 'нет dir — каталога карт')); continue; }
      const i = entries.findIndex((e) => e.id === m.after);
      if (i < 0) { defects.push('ХБ4 project.json → screenMap.maps «' + m.id + '» — after «' + m.after + '»: такой записи на хабе нет (нет приложения или у него hub: false)'); continue; }
      const n = placed.get(m.after) || 0;
      placed.set(m.after, n + 1);
      const root = P.screenMap.dir + '/' + m.section;
      entries.splice(i + 1 + n, 0, { id: m.id, group: entries[i].group, title: m.title, desc: m.desc, href: root + '/index.html', root, icon: m.icon });
    }
  }
  /* База знаний (RE0038, решение человека 23.10.2026): отдельная колонка «База знаний»,
     по записи на страницу; root — папка страницы внутри knowledgeBase.dir. */
  const kbm = P.manifest.knowledgeBase;
  if (kbm && Array.isArray(kbm.pages)) {
    for (const k of kbm.pages) {
      const miss = KB_FIELDS.filter((f) => typeof (k && k[f]) !== 'string' || !k[f].trim());
      if (!P.knowledgeBase || miss.length) { defects.push('ХБ4 project.json → knowledgeBase.pages — ' + (P.knowledgeBase ? 'нет полей: ' + miss.join(', ') : 'нет dir — каталога базы знаний')); continue; }
      const root = P.knowledgeBase.dir + '/' + k.section;
      entries.push({ id: k.id, group: 'kb', title: k.title, desc: k.desc, href: root + '/index.html', root, icon: k.icon });
    }
  }
  specs.sort((a, b) => (a.title < b.title ? -1 : a.title > b.title ? 1 : a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  return { entries, specs, defects };
}

/** Текст hub.js. */
export function render(P, entries, specs = []) {
  const groups = P.tracks.filter((t) => t.hubGroup)
    .map((t) => '     ' + t.hubGroup.padEnd(8) + ' — приложения трека ' + t.id + (t.desc ? ': ' + t.desc : '') + ';');
  const head = [
    '/* Реестр хаба проектов — источник меню и списка на корневой странице ' + P.hubPage + '.',
    '',
    '   СГЕНЕРИРОВАН ' + GEN + ' из ' + P.appsDir + '/<id>/' + P.appsManifest + ' и project.json → hub.ds' + (P.manifest.localKit ? ', localKit' : '') + '. Руками не',
    '   править: запись приложения — его ' + P.appsManifest + ', пересобрать — node ' + P.tools + '/' + GEN,
    '   (гейт сверяет, шаг hub). Хаб строит из реестра и меню, и колонки; сама',
    '   страница не правится.',
    '',
    '   Обычный <script>, а не JSON: страницы открываются по file://, а fetch по',
    '   file:// с кириллическим путём не работает.',
    '',
    '   Группы (колонки хаба, в этом порядке):',
    '     ds       — дизайн-система (запись — project.json → hub.ds)' + (P.manifest.localKit ? ' и витрина локальных компонентов (project.json → localKit)' : '') + ';',
    ...groups,
    ...(P.manifest.knowledgeBase ? ["     kb       — база знаний (project.json → knowledgeBase.pages): глоссарий и термины;"] : []),
    '   Группа приложения — hubGroup его трека (project.json → tracks).',
    ...(P.manifest.screenMap ? ['   Карта экранов (project.json → screenMap.maps) — сразу под записью приложения',
      '   after, в его колонке; root — папка карты, не приложения.'] : []),
    '',
    '   Поля:',
    '     id     — уникальный ключ, латиница; у приложения — его каталог;',
    "     group  — 'ds' | " + P.tracks.filter((t) => t.hubGroup).map((t) => "'" + t.hubGroup + "'").join(' | ') + (P.manifest.knowledgeBase ? " | 'kb'" : '') + ';',
    '     title  — название строки на хабе и пункта меню;',
    '     desc   — описание одной строкой;',
    '     href   — стартовая страница от корня: каталог приложения + home из ' + P.appsManifest + ';',
    "     root   — каталог приложения от корня; у группы 'ds' — null. Всё внутри",
    '              него — часть записи: экраны с меню обязаны вести строкой',
    '              пользователя в футере на хаб;',
    '     icon   — имя глифа из ' + P.ds + '/' + DSP.layout().specOf('Icons') + ';',
    "     shelf  — необязательное, только у приложений: 'actual' | 'archive' — полка в разделе концептов;",
    '     concept, version — необязательные, только вместе, только у приложений: название концепта',
    '              и подпись версии; записи с одним concept — одна плитка-аккордеон на хабе.',
    '',
    '   Спецификации на разработку — window.IBPHubSpecs (после реестра): id (имя спеки), title (название',
    '   сценария; спеки с одним title — версии), module (раздел/модуль, чьи страницы сняты), version,',
    '   stage (подпись версии, необязательно), date (необязательно), href (страница спеки от корня),',
    '   root (каталог приложения со спеками). */',
  ].join('\n');
  const OPTIONAL = ['shelf', 'concept', 'version'];
  const body = entries.map((e) => '  {\n' + ['id', 'group', 'title', 'desc', 'href', 'root', 'icon', 'shelf', 'concept', 'version']
    .filter((k) => !OPTIONAL.includes(k) || e[k])
    .map((k) => '    ' + k + ': ' + js(e[k])).join(',\n') + '\n  }').join(',\n');
  const specBody = specs.map((e) => '  {\n' + ['id', 'title', 'module', 'version', 'stage', 'date', 'href', 'root']
    .filter((k) => e[k])
    .map((k) => '    ' + k + ': ' + js(e[k])).join(',\n') + '\n  }').join(',\n');
  return head + '\nwindow.IBPHub = [\n' + body + '\n];\n\nwindow.IBPHubSpecs = [' + (specs.length ? '\n' + specBody + '\n' : '') + '];\n';
}

export function check(P, write = false) {
  const { entries, specs, defects } = collect(P);
  if (defects.length) return { defects, written: [] };
  const text = render(P, entries, specs);
  const file = path.join(P.root, P.hubRegistry);
  if (write) {
    if (!existsSync(file) || readFileSync(file, 'utf8') !== text) { writeFileSync(file, text, 'utf8'); return { defects, written: [P.hubRegistry], entries }; }
    return { defects, written: [], entries };
  }
  if (!existsSync(file)) defects.push('ХБ2 ' + P.hubRegistry + ' нет — собрать: node ' + P.tools + '/' + GEN);
  else if (readFileSync(file, 'utf8') !== text) defects.push('ХБ3 ' + P.hubRegistry + ' разошёлся с записями приложений (' + P.appsDir + '/*/' + P.appsManifest + ') — правлен руками или не пересобран: node ' + P.tools + '/' + GEN);
  return { defects, written: [], entries };
}

function report(title, { defects, written, entries }) {
  const out = ['== ' + title + ' =='];
  if (entries) out.push('записей: ' + entries.length);
  for (const w of written) out.push('записан ' + w);
  for (const d of defects) out.push('FAIL  ' + d);
  out.push('ВЕРДИКТ: ' + (defects.length ? 'FAIL (дефектов: ' + defects.length + ')' : 'OK'));
  return out.join('\n');
}

/* ---------------- selftest: откат на временном дереве ---------------- */

function put(root, rel, text) {
  const p = path.join(root, rel);
  mkdirSync(path.dirname(p), { recursive: true });
  writeFileSync(p, text, 'utf8');
}

const MANIFEST = {
  contract: 1, id: 't', designSystem: { mount: 'ds' }, agentKit: { mount: '.kit', tools: '.kit/tools' },
  hub: { page: 'index.html', registry: 'hub.js', ds: { id: 'ds', title: 'ДС', desc: 'тест', icon: 'layer-01' } },
  apps: { dir: 'apps', manifest: 'app.json' },
  tracks: [{ id: 'product', title: 'Проекты', hubGroup: 'projects' }, { id: 'rnd', title: 'Концепты', hubGroup: 'concepts' }],
};
const app = (id, track, patch = {}) => JSON.stringify({ id, track, title: 'Приложение ' + id, desc: 'тест', home: 'pages/Start.html', icon: 'folder', ...patch });

const CASES = [
  { name: 'собрано — диффа нет', expect: null, build: true },
  { name: 'реестра нет', expect: 'ХБ2 hub.js нет' },
  { name: 'реестр правлен руками', expect: 'ХБ3 hub.js разошёлся', build: true,
    mutate: (r) => put(r, 'hub.js', readFileSync(path.join(r, 'hub.js'), 'utf8').replace("title: 'Приложение beta'", "title: 'Бета'")) },
  { name: 'новое приложение без пересборки', expect: 'ХБ3', build: true,
    mutate: (r) => put(r, 'apps/gamma/app.json', app('gamma', 'rnd')) },
  { name: 'новое приложение и пересборка', expect: null, build: true,
    mutate: (r) => { put(r, 'apps/gamma/app.json', app('gamma', 'rnd')); check(project(r), true); } },
  { name: 'в записи нет поля', expect: 'ХБ4 apps/beta/app.json — нет полей записи: title',
    mutate: (r) => put(r, 'apps/beta/app.json', JSON.stringify({ id: 'beta', track: 'rnd', desc: 'тест', home: 'pages/Start.html', icon: 'folder' })) },
  { name: 'трек не из манифеста', expect: 'ХБ4 apps/beta/app.json — track «lab»',
    mutate: (r) => put(r, 'apps/beta/app.json', app('beta', 'lab')) },
  { name: 'приложение в разделе apps/', expect: null, build: true,
    mutate: (r) => { put(r, 'apps/postrade/drafts/delta/app.json', app('delta', 'rnd')); check(project(r), true);
      if (!readFileSync(path.join(r, 'hub.js'), 'utf8').includes("root: 'apps/postrade/drafts/delta'")) put(r, 'hub.js', 'сломан'); } },
  { name: 'id вложенного приложения не совпадает с каталогом', expect: 'ХБ4 apps/ib/eps/app.json — id «epsilon»',
    mutate: (r) => put(r, 'apps/ib/eps/app.json', app('epsilon', 'rnd')) },
  { name: 'модуль раздела и концепт в drafts', expect: null, build: true,
    mutate: (r) => { put(r, 'apps/core/clients-app/app.json', app('clients-app', 'product')); put(r, 'apps/core/drafts/lab/app.json', app('lab', 'rnd')); check(project(r), true);
      const h = readFileSync(path.join(r, 'hub.js'), 'utf8'); if (!h.includes("root: 'apps/core/clients-app'") || !h.includes("root: 'apps/core/drafts/lab'")) put(r, 'hub.js', 'сломан'); } },
  { name: 'приложение со скрытой записью (hub: false)', expect: null, build: true,
    mutate: (r) => { put(r, 'apps/postrade/zeta-app/app.json', app('zeta-app', 'product', { hub: false })); check(project(r), true);
      if (readFileSync(path.join(r, 'hub.js'), 'utf8').includes('zeta-app')) put(r, 'hub.js', 'сломан'); } },
  { name: 'concept без version', expect: 'ХБ4 apps/beta/app.json — concept и version задаются только вместе',
    mutate: (r) => put(r, 'apps/beta/app.json', app('beta', 'rnd', { concept: 'Бета' })) },
  { name: 'версия концепта и спека на разработку попадают в реестр', expect: null, build: true,
    mutate: (r) => {
      put(r, 'apps/beta/app.json', app('beta', 'rnd', { concept: 'Бета', version: 'v2' }));
      put(r, 'apps/beta/refs/Spec1/Spec1.dev-spec.md', '---\nspec: Spec1\ntitle: Сценарий\nmodule: postrade/beta\nversion: "1.000"\nstage: Концепт v2\n---\n');
      check(project(r), true);
      const h = readFileSync(path.join(r, 'hub.js'), 'utf8');
      if (!h.includes("concept: 'Бета'") || !h.includes("version: 'v2'") || !h.includes("window.IBPHubSpecs = [\n  {\n    id: 'Spec1'") || !h.includes("href: 'apps/beta/pages/Spec.html?spec=Spec1'")) put(r, 'hub.js', 'сломан');
    } },
  { name: 'манифест без каталога приложений', expect: 'ХБ1',
    mutate: (r) => { const { apps, ...rest } = MANIFEST; put(r, 'project.json', JSON.stringify(rest)); } },
];

function selftest() {
  const out = ['== hub-build --selftest =='];
  let failed = 0;
  for (const c of CASES) {
    const root = mkdtempSync(path.join(os.tmpdir(), 'hub-build-'));
    try {
      put(root, 'project.json', JSON.stringify(MANIFEST));
      put(root, 'apps/alpha/app.json', app('alpha', 'product', { home: 'pages/MainPage.html' }));
      put(root, 'apps/beta/app.json', app('beta', 'rnd'));
      if (c.build) check(project(root), true);
      if (c.mutate) c.mutate(root);
      const { defects } = check(project(root));
      const pass = c.expect === null ? defects.length === 0 : defects.some((d) => d.includes(c.expect));
      if (!pass) failed++;
      out.push((pass ? 'ok    ' : 'FAIL  ') + c.name + ' — ' + (defects.length ? defects.join(' | ') : 'дефектов нет'));
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }
  /* Собранный реестр выполняется и отдаёт те же записи: шапка — блочный
     комментарий, и глоб «звёздочка-слэш» в её тексте закрыл бы его на середине
     (так было в первой сборке 22.09.2026 — реестр не выполнялся). */
  {
    const r = mkdtempSync(path.join(os.tmpdir(), 'hub-build-'));
    try {
      put(r, 'project.json', JSON.stringify(MANIFEST));
      put(r, 'apps/alpha/app.json', app('alpha', 'product', { title: "Кавычка ' и слэш \\ в названии" }));
      check(project(r), true);
      const ctx = { window: {} };
      let got = null;
      try { vm.runInNewContext(readFileSync(path.join(r, 'hub.js'), 'utf8'), ctx); got = ctx.window.IBPHub; } catch (e) { got = e.message; }
      const pass = Array.isArray(got) && got.length === 2 && got[1].title === "Кавычка ' и слэш \\ в названии";
      if (!pass) failed++;
      out.push((pass ? 'ok    ' : 'FAIL  ') + 'собранный реестр выполняется — ' + (Array.isArray(got) ? 'записей ' + got.length : got));
    } finally {
      rmSync(r, { recursive: true, force: true });
    }
  }
  /* Порядок и форма записей: ДС первой, треки по порядку манифеста, группа — hubGroup трека. */
  const root = mkdtempSync(path.join(os.tmpdir(), 'hub-build-'));
  try {
    put(root, 'project.json', JSON.stringify(MANIFEST));
    put(root, 'apps/zeta/app.json', app('zeta', 'rnd'));
    put(root, 'apps/alpha/app.json', app('alpha', 'product', { home: 'pages/MainPage.html' }));
    const { entries } = collect(project(root));
    const got = entries.map((e) => e.id + ':' + e.group + ':' + (e.href || '')).join(' ');
    const pass = got === 'ds:ds:ds/index.html alpha:projects:apps/alpha/pages/MainPage.html zeta:concepts:apps/zeta/pages/Start.html';
    if (!pass) failed++;
    out.push((pass ? 'ok    ' : 'FAIL  ') + 'порядок и форма записей — ' + got);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
  /* Витрина локальных компонентов — вторая запись колонки ДС, до приложений. */
  {
    const r = mkdtempSync(path.join(os.tmpdir(), 'hub-build-'));
    try {
      put(r, 'project.json', JSON.stringify({ ...MANIFEST, localKit: { dir: 'kit', id: 'kit', title: 'Кит', desc: 'тест', icon: 'layout-grid-01' } }));
      put(r, 'apps/alpha/app.json', app('alpha', 'product'));
      const got = collect(project(r)).entries.map((e) => e.id + ':' + e.group + ':' + e.href).join(' ');
      const pass = got === 'ds:ds:ds/index.html kit:ds:kit/index.html alpha:projects:apps/alpha/pages/Start.html';
      if (!pass) failed++;
      out.push((pass ? 'ok    ' : 'FAIL  ') + 'витрина — вторая запись колонки ДС — ' + got);
      put(r, 'project.json', JSON.stringify({ ...MANIFEST, localKit: { dir: 'kit', id: 'kit', title: 'Кит' } }));
      const { defects } = collect(project(r));
      const pass2 = defects.some((d) => d.includes('ХБ4 project.json → localKit — нет полей: desc, icon'));
      if (!pass2) failed++;
      out.push((pass2 ? 'ok    ' : 'FAIL  ') + 'в записи витрины нет полей — ' + (defects.join(' | ') || 'дефектов нет'));
    } finally {
      rmSync(r, { recursive: true, force: true });
    }
  }
  /* Карта экранов (RE0015) — сразу под записью after, в её колонке; after не найден — ХБ4. */
  {
    const r = mkdtempSync(path.join(os.tmpdir(), 'hub-build-'));
    try {
      const map = (after) => ({ screenMap: { dir: 'apps/screen-map', maps: [{ id: 'map-post', section: 'postrade', title: 'Карта', desc: 'тест', icon: 'tree-view', after }] } });
      put(r, 'project.json', JSON.stringify({ ...MANIFEST, ...map('alpha') }));
      put(r, 'apps/alpha/app.json', app('alpha', 'product'));
      put(r, 'apps/gamma/app.json', app('gamma', 'product'));
      put(r, 'apps/beta/app.json', app('beta', 'rnd'));
      const got = collect(project(r)).entries.map((e) => e.id + ':' + e.group + ':' + (e.root || '-')).join(' ');
      const pass = got === 'ds:ds:- alpha:projects:apps/alpha map-post:projects:apps/screen-map/postrade gamma:projects:apps/gamma beta:concepts:apps/beta';
      if (!pass) failed++;
      out.push((pass ? 'ok    ' : 'FAIL  ') + 'карта экранов — сразу под записью after, в её колонке — ' + got);
      put(r, 'project.json', JSON.stringify({ ...MANIFEST, ...map('nope') }));
      const { defects } = collect(project(r));
      const pass2 = defects.some((d) => d.includes('ХБ4 project.json → screenMap.maps «map-post» — after «nope»'));
      if (!pass2) failed++;
      out.push((pass2 ? 'ok    ' : 'FAIL  ') + 'after карты не найден на хабе — ' + (defects.join(' | ') || 'дефектов нет'));
    } finally {
      rmSync(r, { recursive: true, force: true });
    }
  }
  const total = CASES.length + 6;
  out.push('ВЕРДИКТ: ' + (failed ? 'FAIL (кейсов не прошло: ' + failed + ' из ' + total + ')' : 'OK (кейсов: ' + total + ')'));
  console.log(out.join('\n'));
  process.exit(failed ? 1 : 0);
}

/* ---------------- main ---------------- */

function main() {
  const args = process.argv.slice(2);
  if (args.includes('--selftest')) return selftest();
  const P = need('hub-build', HERE);
  const write = !args.includes('--check');
  const res = check(P, write);
  console.log(report(write ? 'hub-build' : 'hub-build --check', res));
  process.exit(res.defects.length ? 1 : 0);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
