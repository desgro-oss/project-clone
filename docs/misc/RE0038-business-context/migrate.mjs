#!/usr/bin/env node
/* ============================================================
   RE0038 · «Бизнес-смысл» — раскатка скелета и проверка.

   Одноразовый инструмент задачи RE0038 (по прецеденту RE0004), не шаг гейта.

     node docs/misc/RE0038-business-context/migrate.mjs --baseline --date 23.10.2026
     node docs/misc/RE0038-business-context/migrate.mjs --apply    --date 23.10.2026
     node docs/misc/RE0038-business-context/migrate.mjs --check --structure
     node docs/misc/RE0038-business-context/migrate.mjs --check    --date 23.10.2026
     node docs/misc/RE0038-business-context/migrate.mjs --unresolved

   Охват: --scope post (по умолчанию) — deals-app и post-reports-app;
   --scope all — все модули с паспортами и спеками; можно назвать модуль
   (postrade/deals-app, postrade/post-reports-app, core/dashboard-app, ib/banker-app).

   --baseline   снимает version / rulesVersion / updated до правок (baseline.json)
   --apply      вставляет скелет раздела, поднимает rulesVersion, updated и пишет
                строку в CHANGELOG каждого виджета; спек шапку не трогает
   --check      проверяет форму и содержание; --structure — только форму
                (после Э1, когда содержание ещё «не решено»)
   --unresolved печатает таблицу «компонент · ячейка · что не решено»

   Повторный --apply на файле с уже существующим разделом ничего не перезаписывает.
   ============================================================ */
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../../..');
const BASELINE = path.join(HERE, 'baseline.json');

const args = process.argv.slice(2);
const has = (f) => args.includes(f);
const val = (f, d) => {
  const i = args.indexOf(f);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : d;
};
const DATE = val('--date', '23.10.2026');
const SCOPE = val('--scope', 'post');
const ONLY = val('--only', '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const MODULES = {
  'core/dashboard-app': { root: 'apps/core/dashboard-app', kit: 'core' },
  'postrade/deals-app': { root: 'apps/postrade/deals-app', kit: 'postrade' },
  'postrade/post-reports-app': { root: 'apps/postrade/post-reports-app', kit: 'postrade' },
  'ib/banker-app': { root: 'apps/ib/banker-app', kit: 'ib' },
};

const T_PASS = '## Бизнес-смысл (Business context)';
const T_SPEC = '### Бизнес-смысл (Business context)';
const QUESTIONS = ['Зачем существует', 'Кто заполняет и когда', 'Кто пользуется результатом', 'Бизнес-правила'];
const HINTS = [
  'какую задачу бизнеса решает',
  'роль, этап или статус сделки',
  'роли, отчёты, смежные системы',
  'ограничения, зависимость от статуса, расчёты',
];

function selected() {
  if (SCOPE === 'all') return Object.keys(MODULES);
  if (MODULES[SCOPE]) return [SCOPE];
  if (SCOPE === 'post') return ['postrade/deals-app', 'postrade/post-reports-app'];
  throw new Error('неизвестный --scope: ' + SCOPE);
}

const read = (p) => readFileSync(p, 'utf8');
const write = (p, s) => writeFileSync(p, s, 'utf8');
const eolOf = (s) => (s.includes('\r\n') ? '\r\n' : '\n');
const norm = (s) => s.replace(/\r\n/g, '\n');
const denorm = (s, eol) => (eol === '\r\n' ? s.replace(/\n/g, '\r\n') : s);
const rel = (p) => path.relative(ROOT, p).split(path.sep).join('/');

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

function passports(mod) {
  const dir = path.join(ROOT, MODULES[mod].root, 'widgets');
  return walk(dir)
    .filter((p) => p.endsWith('.md') && !['README.md', 'CHANGELOG.md'].includes(path.basename(p)))
    .sort();
}

function specs(mod) {
  const dir = path.join(ROOT, MODULES[mod].root, 'pages');
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.screen.md'))
    .map((f) => path.join(dir, f))
    .sort();
}

function allFiles() {
  const out = [];
  for (const mod of selected()) {
    for (const f of passports(mod)) out.push({ mod, file: f, kind: 'passport' });
    for (const f of specs(mod)) out.push({ mod, file: f, kind: 'spec' });
  }
  if (!ONLY.length) return out;
  return out.filter((x) => ONLY.includes(path.basename(x.file, x.kind === 'spec' ? '.screen.md' : '.md')));
}

function fmRange(lines) {
  if (!lines.length || lines[0].trim() !== '---') return null;
  const end = lines.findIndex((l, i) => i > 0 && l.trim() === '---');
  return end > 0 ? [0, end] : null;
}

function fmValue(lines, key) {
  const r = fmRange(lines);
  if (!r) return null;
  const rx = new RegExp('^' + key + ':\\s*(.*)$');
  for (let i = r[0]; i < r[1]; i++) {
    const m = rx.exec(lines[i]);
    if (m) return m[1].replace(/^"|"$/g, '').trim();
  }
  return null;
}

function sectionLines(title, date) {
  return [
    title,
    '',
    '| Вопрос | Ответ |',
    '|---|---|',
    ...QUESTIONS.map((q) => '| ' + q + ' | не решено (' + date + ') |'),
    '',
    'Источники: не решено (' + date + ')',
  ];
}

const CHANGELOG_ENTRY = (date) => [
  '## Паспорт — ' + date,
  '',
  '**Паспорт приведён к правилам 2.001.** Добавлен раздел «Бизнес-смысл». Виджет не менялся. ' +
    '*Почему:* в паспорте не было бизнес-контекста — зачем компонент существует, кто и когда его ' +
    'заполняет, кто пользуется результатом, какие правила за ним стоят. *Требование:* задача RE0038, ' +
    'правила ДС «Локальные компоненты» 2.001.',
  '',
];

/* ---------------- baseline ---------------- */

function baseline() {
  const prev = existsSync(BASELINE) ? JSON.parse(read(BASELINE)) : { files: [] };
  const map = new Map((prev.files || []).map((x) => [x.file, x]));
  for (const { mod, file, kind } of allFiles()) {
    const lines = norm(read(file)).split('\n');
    map.set(rel(file), {
      file: rel(file),
      module: mod,
      kind,
      version: fmValue(lines, 'version'),
      rulesVersion: fmValue(lines, 'rulesVersion'),
      updated: fmValue(lines, 'updated'),
    });
  }
  const files = [...map.values()].sort((a, b) => (a.file < b.file ? -1 : 1));
  write(BASELINE, JSON.stringify({ scope: 'mixed', date: DATE, files }, null, 2) + '\n');
  console.log('baseline: ' + files.length + ' файлов → ' + rel(BASELINE));
}

/* ---------------- apply ---------------- */

function applyPassport(file) {
  const src = read(file);
  const eol = eolOf(src);
  const lines = norm(src).split('\n');
  const h = lines.findIndex((l) => l.trim() === '## Описание (Purpose)');
  if (h < 0) return { file, error: 'нет раздела «Описание (Purpose)»' };
  const changed = [];
  if (!lines.some((l) => l.trim() === T_PASS)) {
    let j = h + 1;
    while (j < lines.length && !/^##\s/.test(lines[j])) j++;
    let k = j;
    while (k > h + 1 && lines[k - 1].trim() === '') k--;
    lines.splice(k, j - k, '', ...sectionLines(T_PASS, DATE), '');
    changed.push('раздел');
  }
  const r = fmRange(lines);
  if (r) {
    for (let i = r[0]; i < r[1]; i++) {
      if (lines[i].startsWith('rulesVersion:')) {
        if (lines[i] !== 'rulesVersion: 2.001') { lines[i] = 'rulesVersion: 2.001'; changed.push('rulesVersion'); }
      } else if (lines[i].startsWith('updated:')) {
        const next = 'updated: "' + DATE + '"';
        if (lines[i] !== next) { lines[i] = next; changed.push('updated'); }
      }
    }
  }
  const out = denorm(lines.join('\n'), eol);
  if (out !== src) write(file, out);
  return { file, changed };
}

function applyChangelog(file) {
  if (!existsSync(file)) return { file, error: 'нет CHANGELOG.md' };
  const src = read(file);
  if (src.includes('RE0038') && src.includes('2.001')) return { file, skipped: true };
  const eol = eolOf(src);
  const lines = norm(src).split('\n');
  const i = lines.findIndex((l) => /^##\s/.test(l));
  const entry = CHANGELOG_ENTRY(DATE);
  if (i < 0) {
    lines.push('', ...entry);
  } else {
    let k = i;
    while (k > 0 && lines[k - 1].trim() === '') k--;
    const pad = k > 0 && lines[k - 1].trim() !== '' ? [''] : [];
    lines.splice(k, i - k, ...pad, ...entry);
  }
  write(file, denorm(lines.join('\n'), eol));
  return { file, changed: ['changelog'] };
}

function applySpec(file) {
  const src = read(file);
  if (src.includes(T_SPEC)) return { file, skipped: true };
  const eol = eolOf(src);
  const lines = norm(src).split('\n');
  const h = lines.findIndex((l) => /^##\s+1\./.test(l));
  if (h < 0) return { file, error: 'нет раздела «## 1.»' };
  let k = h + 1;
  while (k < lines.length && lines[k].trim() === '') k++;
  lines.splice(h + 1, k - (h + 1), '', ...sectionLines(T_SPEC, DATE), '');
  write(file, denorm(lines.join('\n'), eol));
  return { file, changed: ['раздел'] };
}

function apply() {
  if (!existsSync(BASELINE)) {
    console.error('НЕТ baseline.json — сначала --baseline. Иначе нечем доказать, что version не менялся.');
    process.exit(2);
  }
  const out = [];
  for (const { mod, file, kind } of allFiles()) {
    if (kind === 'passport') {
      out.push(applyPassport(file));
      out.push(applyChangelog(path.join(path.dirname(file), 'CHANGELOG.md')));
    } else {
      out.push(applySpec(file));
    }
  }
  const errors = out.filter((x) => x.error);
  const changed = out.filter((x) => x.changed);
  const skipped = out.filter((x) => x.skipped);
  for (const x of errors) console.log('FAIL  ' + rel(x.file) + ' — ' + x.error);
  for (const x of changed) console.log('записан ' + rel(x.file) + ' (' + x.changed.join(', ') + ')');
  console.log('== apply ==');
  console.log('изменено: ' + changed.length + ' · пропущено: ' + skipped.length + ' · ошибок: ' + errors.length);
  console.log('ВЕРДИКТ: ' + (errors.length ? 'FAIL' : 'OK'));
  if (errors.length) process.exit(1);
}

/* ---------------- check ---------------- */

function sectionOf(lines, title) {
  const i = lines.findIndex((l) => l.trim() === title);
  if (i < 0) return null;
  const isSpec = title.startsWith('### ');
  let j = i + 1;
  while (j < lines.length) {
    const l = lines[j];
    if (isSpec ? /^#{2,3}\s/.test(l) : /^##\s/.test(l)) break;
    j++;
  }
  return { start: i, lines: lines.slice(i + 1, j) };
}

function tableRows(sec) {
  const rows = [];
  let seen = false;
  for (const l of sec.lines) {
    if (!l.trim().startsWith('|')) continue;
    const cells = l.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((s) => s.trim());
    if (!seen) { seen = true; continue; }
    if (cells.every((c) => /^-+$/.test(c) || c === '')) continue;
    rows.push(cells);
  }
  return rows;
}

function openQuestionsText(lines) {
  const i = lines.findIndex((l) => /^##\s+.*Открытые вопросы/.test(l));
  if (i < 0) return '';
  let j = i + 1;
  while (j < lines.length && !/^##\s/.test(lines[j])) j++;
  return lines.slice(i, j).join('\n');
}

function sourcePaths(sec, mod, file) {
  const text = sec.lines.join('\n');
  const found = [...text.matchAll(/`([^`]+)`/g)].map((m) => m[1].trim());
  const bad = [];
  for (const raw of found) {
    if (!/[./]/.test(raw)) continue;
    const clean = raw.split('#')[0].replace(/[),.;]+$/, '').trim();
    if (!clean) continue;
    if (!/\.(md|js|json|html|css|yaml)$/.test(clean) && !clean.includes('/')) continue;
    const cands = [];
    if (/^(apps|docs|design-system)\//.test(clean)) cands.push(path.join(ROOT, clean));
    else {
      const modRoot = path.join(ROOT, MODULES[mod].root);
      cands.push(path.join(modRoot, clean));
      cands.push(path.join(path.dirname(file), clean));
      cands.push(path.join(modRoot, 'data', clean));
      cands.push(path.join(modRoot, 'pages', clean));
    }
    if (!cands.some((p) => existsSync(p))) bad.push(clean);
  }
  return bad;
}

function docPage(mod, id) {
  const p = path.join(ROOT, 'apps/local-components', MODULES[mod].kit, mod.split('/')[1], id + '.doc.html');
  return existsSync(p) ? p : null;
}

function checkOne({ mod, file, kind }, base, structureOnly) {
  const bad = [];
  const src = read(file);
  const lines = norm(src).split('\n');
  const title = kind === 'passport' ? T_PASS : T_SPEC;

  const sec = sectionOf(lines, title);
  if (!sec) bad.push('нет раздела «' + title.replace(/^#+\s/, '') + '»');
  else {
    const isSpec = kind === 'spec';
    if (isSpec) {
      const h = lines.findIndex((l) => /^##\s+1\./.test(l));
      const first = lines.slice(h + 1).find((l) => l.trim() !== '');
      if (first === undefined || first.trim() !== title) bad.push('раздел не первым блоком §1');
    } else {
      const desc = lines.findIndex((l) => l.trim() === '## Описание (Purpose)');
      let next = desc + 1;
      while (next < lines.length && !/^##\s/.test(lines[next])) next++;
      if (desc < 0 || next >= lines.length || lines[next].trim() !== title) bad.push('раздел не сразу после «Описания»');
    }

    const rows = tableRows(sec);
    if (rows.length !== QUESTIONS.length) bad.push('строк в таблице: ' + rows.length + ', ожидается ' + QUESTIONS.length);
    const labels = rows.map((r) => r[0]);
    for (let i = 0; i < QUESTIONS.length; i++) {
      if (labels[i] !== QUESTIONS[i]) bad.push('строка ' + (i + 1) + ': «' + (labels[i] || '') + '», ожидается «' + QUESTIONS[i] + '»');
    }

    if (!structureOnly) {
      const cells = rows.map((r) => r[1] || '');
      for (let i = 0; i < cells.length; i++) {
        const c = cells[i];
        if (!c) bad.push('пустая ячейка «' + (labels[i] || i + 1) + '»');
        else if (HINTS.some((h) => c.includes(h))) bad.push('осталась подсказка шаблона: «' + c + '»');
      }
      const line = sec.lines.find((l) => /^Источники:/.test(l.trim()));
      if (!line) bad.push('нет строки «Источники:»');
      else {
        const value = line.replace(/^Источники:\s*/, '').trim();
        if (!value || value === '…' || value === 'не решено (' + DATE + ')') bad.push('«Источники» не заполнены');
      }
      if (cells.some((c) => c.includes('не решено')) && !openQuestionsText(lines).includes('Бизнес-смысл')) {
        bad.push('есть «не решено», но в «Открытых вопросах» нет вопроса про «Бизнес-смысл»');
      }
      const badPaths = sourcePaths(sec, mod, file);
      if (badPaths.length) bad.push('нет файлов-источников: ' + badPaths.join(', '));
    }
  }

  if (kind === 'passport') {
    const version = fmValue(lines, 'version');
    const rules = fmValue(lines, 'rulesVersion');
    const updated = fmValue(lines, 'updated');
    if (!base) bad.push('нет записи в baseline.json');
    else if (version !== base.version) bad.push('version изменился: ' + base.version + ' → ' + version);
    if (rules !== '2.001') bad.push('rulesVersion: ' + rules + ', ожидается 2.001');
    if (updated !== DATE) bad.push('updated: ' + updated + ', ожидается ' + DATE);
    const ch = path.join(path.dirname(file), 'CHANGELOG.md');
    if (!existsSync(ch)) bad.push('нет CHANGELOG.md');
    else {
      const t = read(ch);
      if (!t.includes('2.001') || !t.includes('RE0038')) bad.push('в CHANGELOG нет записи 2.001 / RE0038');
    }
    const id = path.basename(file, '.md');
    const doc = docPage(mod, id);
    if (!doc) bad.push('нет страницы витрины ' + id + '.doc.html');
    else {
      const html = read(doc);
      const a = html.indexOf('data-screen-label="Описание"');
      const b = html.indexOf('data-screen-label="Бизнес-смысл"');
      const c = html.indexOf('data-screen-label="Раскладка"');
      if (!(a >= 0 && b > a && c > b)) bad.push('на витрине раздел не между «Описанием» и «Раскладкой»');
      if (!html.includes('2.001')) bad.push('на витрине нет «Версия правил 2.001»');
    }
  } else if (base) {
    const version = fmValue(lines, 'version');
    const updated = fmValue(lines, 'updated');
    if (version !== base.version) bad.push('version спеки изменился: ' + base.version + ' → ' + version);
    if (updated !== base.updated) bad.push('updated спеки изменился: ' + base.updated + ' → ' + updated);
  }

  return bad;
}

function check(structureOnly) {
  if (!existsSync(BASELINE)) {
    console.error('НЕТ baseline.json — сначала --baseline.');
    process.exit(2);
  }
  const data = JSON.parse(read(BASELINE));
  const byFile = new Map(data.files.map((x) => [x.file, x]));
  const files = allFiles();
  let failed = 0;
  for (const f of files) {
    const bad = checkOne(f, byFile.get(rel(f.file)), structureOnly);
    if (bad.length) {
      failed++;
      console.log('FAIL  ' + rel(f.file));
      for (const b of bad) console.log('      · ' + b);
    } else {
      console.log('ok    ' + rel(f.file));
    }
  }
  const p = files.filter((x) => x.kind === 'passport').length;
  const s = files.filter((x) => x.kind === 'spec').length;
  console.log('== check' + (structureOnly ? ' --structure' : '') + ' (scope: ' + SCOPE + ') ==');
  console.log('паспортов: ' + p + ' · спек: ' + s + ' · с дефектами: ' + failed);
  console.log('ВЕРДИКТ: ' + (failed ? 'FAIL' : 'OK'));
  if (failed) process.exit(1);
}

/* ---------------- unresolved ---------------- */

function unresolved() {
  const rows = [];
  for (const { mod, file, kind } of allFiles()) {
    const lines = norm(read(file)).split('\n');
    const sec = sectionOf(lines, kind === 'passport' ? T_PASS : T_SPEC);
    if (!sec) continue;
    for (const r of tableRows(sec)) {
      if ((r[1] || '').includes('не решено')) rows.push({ mod, file, q: r[0], a: r[1] });
    }
  }
  console.log('| Компонент | Вопрос | Что не решено | Файл |');
  console.log('|---|---|---|---|');
  for (const r of rows) {
    const id = path.basename(r.file, kindOf(r.file));
    console.log('| ' + id + ' | ' + r.q + ' | ' + r.a.replace(/\|/g, '\\|') + ' | `' + rel(r.file) + '` |');
  }
  console.log('');
  console.log('всего незакрытых ячеек: ' + rows.length);
}

function kindOf(file) {
  return file.endsWith('.screen.md') ? '.screen.md' : '.md';
}

/* ---------------- main ---------------- */

if (has('--baseline')) baseline();
else if (has('--apply')) apply();
else if (has('--check')) check(has('--structure'));
else if (has('--unresolved')) unresolved();
else {
  console.log('Использование: --baseline | --apply | --check [--structure] | --unresolved  [--date ДД.ММ.ГГГГ] [--scope post|all|<модуль>]');
  process.exit(2);
}
