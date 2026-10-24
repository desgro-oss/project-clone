#!/usr/bin/env node
/* ============================================================
   BUSINESS-CONTEXT — обзор «Бизнес-смысла» и глоссария (RE0038). Только чтение.

   Зачем. Бизнес-смысл паспортов виджетов и спек страниц и термины глоссария
   пополняются по ходу других задач: ответил человек, вышло ТЗ, нашлось
   расхождение. Чтобы найти, что именно обновить, не листая 58 файлов, — этот
   обзор. Процедура правки — скилл `business-context`
   (`.agents/skills/business-context/SKILL.md`); инструмент ничего не пишет и
   не входит в гейт.

   Использование:
     node business-context.mjs --unresolved [--module postrade/deals-app]
         ячейки «не решено» таблиц «Бизнес-смысл» (паспорта виджетов модулей и
         спеки страниц; концепты `drafts/` не входят);
     node business-context.mjs --find <слово или фраза>
         где слово встречается в «Бизнес-смысле», «Открытых вопросах» и
         глоссарии — искать перед правкой, чтобы обновить все места сразу;
     node business-context.mjs --uses <Термин>
         где на термин ссылаются `[[…]]` — проверить после правки определения;
     node business-context.mjs --terms
         термины глоссария: сколько ссылок, у каких определение «не решено»;
     node business-context.mjs --stale
         ревизия: у каких паспортов и спек источник (файл из строки «Источники»)
         или задача с именем компонента изменились ПОЗЖЕ даты проверки —
         то, что нужно перечитать. Дата проверки — строка «Проверено: ДД.ММ.ГГГГ»
         под «Источниками»; нет строки — берётся позднейшая из 23.10.2026
         (наполнение RE0038) и `updated` шапки. Модель не нужна;
     node business-context.mjs --mark <Имя> [<Имя>…] [--date ДД.ММ.ГГГГ]
         поставить «Проверено:» (сегодня или --date) — после того как компонент
         разобран и правка внесена либо менять оказалось нечего.
   ============================================================ */
import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { project, findApps } from './project.mjs';
import { loadTerms, wikiLinks } from './glossary.mjs';

const P = project();
const read = (f) => readFileSync(f, 'utf8').replace(/\r\n/g, '\n').replace(/^﻿/, '');
const args = process.argv.slice(2);
const has = (f) => args.includes(f);
const val = (f) => { const i = args.indexOf(f); return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : ''; };
const short = (s, n = 170) => (s.length > n ? s.slice(0, n - 1) + '…' : s);

/** Файлы охвата: [{ file, rel, kind: 'passport' | 'spec', module }]. */
function scope() {
  const only = val('--module');
  const out = [];
  const walk = (dir, o) => {
    let list;
    try { list = readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of list) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p, o);
      else if (e.name.endsWith('.md') && !['README.md', 'CHANGELOG.md'].includes(e.name)) o.push(p);
    }
  };
  for (const app of findApps(P.root, P.appsDir, P.appsManifest)) {
    if (/(^|\/)drafts\//.test(app.dir)) continue;
    if (only && app.dir !== only) continue;
    const files = [];
    walk(path.join(app.abs, P.appShape.widgets || 'widgets'), files);
    for (const f of files) out.push({ file: f, rel: P.rel(f), kind: 'passport', module: app.dir });
    const pages = path.join(app.abs, P.appShape.pages || 'pages');
    if (existsSync(pages)) {
      for (const n of readdirSync(pages).filter((x) => x.endsWith('.screen.md')).sort()) {
        out.push({ file: path.join(pages, n), rel: P.rel(path.join(pages, n)), kind: 'spec', module: app.dir });
      }
    }
  }
  return out;
}

/** Раздел по заголовку: строки до следующего заголовка того же или старшего уровня. */
function section(lines, title) {
  const level = /^#+/.exec(title)[0].length;
  const at = lines.findIndex((l) => l.trim() === title);
  if (at < 0) return null;
  let end = lines.length;
  for (let i = at + 1; i < lines.length; i++) {
    const m = /^(#+)\s/.exec(lines[i]);
    if (m && m[1].length <= level) { end = i; break; }
  }
  return lines.slice(at + 1, end);
}
const cells = (line) => line.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
const titleOf = (kind) => (kind === 'passport' ? '## Бизнес-смысл (Business context)' : '### Бизнес-смысл (Business context)');

function businessRows(item) {
  const sec = section(read(item.file).split('\n'), titleOf(item.kind));
  if (!sec) return null;
  return sec.filter((l) => l.trim().startsWith('|') && !/^\s*\|?\s*:?-{2,}/.test(l)).map(cells).filter((r) => r.length >= 2 && r[0] !== 'Вопрос');
}

function unresolved() {
  let n = 0, files = 0;
  for (const item of scope()) {
    const rows = businessRows(item);
    if (!rows) { console.log(item.rel + ' · нет раздела «Бизнес-смысл»'); continue; }
    const bad = rows.filter((r) => r[1].includes('не решено'));
    if (bad.length) files++;
    for (const r of bad) { n++; console.log(item.rel + ' · ' + r[0] + ' · ' + short(r[1])); }
  }
  console.log('— незакрытых ячеек: ' + n + ' в ' + files + ' файлах');
}

function find(q) {
  const needle = q.toLowerCase();
  let n = 0;
  for (const item of scope()) {
    const lines = read(item.file).split('\n');
    const bsec = section(lines, titleOf(item.kind)) || [];
    const oq = section(lines, '## Открытые вопросы (Open questions)') || section(lines, '## 7. Открытые вопросы и допущения') || [];
    for (const [label, part] of [['Бизнес-смысл', bsec], ['Открытые вопросы', oq]]) {
      for (const l of part) if (l.toLowerCase().includes(needle)) { n++; console.log(item.rel + ' · ' + label + ' · ' + short(l.trim())); }
    }
  }
  const gl = loadTerms(P);
  for (const t of gl.terms) {
    const text = [t.name, ...t.aliases, t.def, t.sources].join(' ');
    if (text.toLowerCase().includes(needle)) { n++; console.log(P.rel(path.join(gl.dir, t.file)) + ' · термин · ' + short(t.def.split('\n')[0])); }
  }
  console.log('— совпадений: ' + n);
}

/** Ссылки на термины: Map(id термина → Set файлов). Паспорта и спеки целиком, как их читает человек. */
function usage(gl) {
  const uses = new Map(gl.terms.map((t) => [t.id, new Set()]));
  for (const item of scope()) {
    for (const l of wikiLinks(read(item.file))) {
      const t = gl.find(l.name);
      if (t) uses.get(t.id).add(item.rel);
    }
  }
  for (const t of gl.terms) for (const l of wikiLinks(t.def)) { const o = gl.find(l.name); if (o && o !== t) uses.get(o.id).add(P.rel(path.join(gl.dir, t.file))); }
  return uses;
}

function uses(name) {
  const gl = loadTerms(P);
  const term = gl.find(name);
  if (!term) { console.error('Термина «' + name + '» нет в глоссарии (' + (gl.dir ? P.rel(gl.dir) : 'база знаний не объявлена') + ').'); process.exit(1); }
  const set = usage(gl).get(term.id);
  for (const f of [...set].sort()) console.log(f);
  console.log('— ссылок на «' + term.name + '»: ' + set.size + ' файлов');
}

function terms() {
  const gl = loadTerms(P);
  const u = usage(gl);
  for (const t of gl.terms) {
    const open = /^не решено/.test(t.def) || t.def.includes('не решено');
    console.log(t.name + ' · ссылок: ' + u.get(t.id).size + (open ? ' · в определении есть «не решено»' : '') + (u.get(t.id).size === 0 ? ' · никто не ссылается' : ''));
  }
  console.log('— терминов: ' + gl.terms.length);
}


/* ---------------- ревизия: что устарело ---------------- */

const BASE = '23.10.2026';   // дата наполнения (RE0038): проверки раньше не было
const iso = (dmy) => { const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(String(dmy).trim()); return m ? m[3] + '-' + m[2] + '-' + m[1] : null; };
const dmyOf = (isoDate) => String(isoDate).split('-').reverse().join('.');
const today = () => { const d = new Date(); const p = (n) => String(n).padStart(2, '0'); return p(d.getDate()) + '.' + p(d.getMonth() + 1) + '.' + d.getFullYear(); };
const git = (a) => { try { return execFileSync('git', a, { cwd: P.root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }); } catch { return ''; } };

let dirtyCache = null;
const dirty = () => dirtyCache || (dirtyCache = new Set(git(['status', '--porcelain']).split('\n').map((l) => l.slice(3).replace(/^"|"$/g, '').trim().replace(/ -> .*/, '')).filter(Boolean)));
const dateCache = new Map();
/** Когда файл менялся последний раз: ISO-дата. Правка без коммита и работа без git — по времени файла. */
function changedOn(rel) {
  if (dateCache.has(rel)) return dateCache.get(rel);
  const abs = path.join(P.root, rel);
  const mtime = () => { try { return statSync(abs).mtime.toISOString().slice(0, 10); } catch { return null; } };
  const d = dirty().has(rel) ? mtime() : (git(['log', '-1', '--format=%cs', '--', rel]).trim() || mtime());
  dateCache.set(rel, d);
  return d;
}

const TICK = String.fromCharCode(96);
function sourcesOf(item, lines) {
  const sec = section(lines, titleOf(item.kind)) || [];
  const line = sec.find((l) => /^Источники:/.test(l.trim())) || '';
  const out = [];
  for (const m of line.matchAll(new RegExp(TICK + '([^' + TICK + ']+)' + TICK, 'g'))) {
    const raw = m[1].trim().split('#')[0].replace(/[),.;]+$/, '');
    if (!raw || !/[./]/.test(raw) || !(/\.(md|js|json|html|css|yaml)$/.test(raw) || raw.includes('/'))) continue;
    const modRoot = path.join(P.root, P.appsDir, item.module);
    const cands = /^(apps|docs|design-system)\//.test(raw)
      ? [path.join(P.root, raw)]
      : [path.join(modRoot, raw), path.join(path.dirname(item.file), raw), path.join(modRoot, 'data', raw), path.join(modRoot, 'pages', raw)];
    const hit = cands.find((p) => existsSync(p) && statSync(p).isFile());
    if (hit) out.push(P.rel(hit));
  }
  return [...new Set(out)];
}

function fmUpdated(lines) {
  const end = lines[0] === '---' ? lines.indexOf('---', 1) : -1;
  if (end < 0) return null;
  const m = lines.slice(1, end).map((l) => /^updated:\s*"?([\d.]+)"?\s*$/.exec(l)).find(Boolean);
  return m ? iso(m[1]) : null;
}

function checkedOf(item, lines) {
  const sec = section(lines, titleOf(item.kind)) || [];
  const mark = sec.map((l) => /^Проверено:\s*(\d{2}\.\d{2}\.\d{4})\s*$/.exec(l.trim())).find(Boolean);
  if (mark) return { on: iso(mark[1]), marked: true };
  const base = iso(BASE), up = fmUpdated(lines);
  return { on: up && up > base ? up : base, marked: false };
}

const nameOf = (item) => path.basename(item.file).replace(/\.screen\.md$|\.md$/, '');

function taskMentions(item, after) {
  const dir = path.join(P.root, P.docs, 'tasks');
  if (!existsSync(dir)) return [];
  const id = nameOf(item);
  const re = item.kind === 'spec' ? new RegExp('\\b' + id + '(\\.screen\\.md|\\.html|\\.preview\\.html)') : new RegExp('\\b' + id + '\\b');
  const out = [];
  for (const n of readdirSync(dir).filter((x) => /^[A-Z]{2}\d{4}.*\.md$/.test(x) && !/^RE0038/.test(x))) {
    const d = changedOn(P.docs + '/tasks/' + n);
    if (d && d > after && re.test(read(path.join(dir, n)))) out.push(n.replace(/\.md$/, '') + ' (' + dmyOf(d) + ')');
  }
  return out;
}

function stale() {
  let n = 0, total = 0;
  for (const item of scope()) {
    total++;
    const lines = read(item.file).split('\n');
    const { on, marked } = checkedOf(item, lines);
    const newer = sourcesOf(item, lines).map((s) => [s, changedOn(s)]).filter(([, d]) => d && d > on);
    const tasks = taskMentions(item, on);
    if (!newer.length && !tasks.length) continue;
    n++;
    console.log(item.rel + ' · проверено ' + dmyOf(on) + (marked ? '' : ' (отметки нет — взята дата наполнения)'));
    for (const [s, d] of newer) console.log('    источник новее: ' + s + ' (' + dmyOf(d) + ')');
    if (tasks.length) console.log('    задачи с этим именем после проверки: ' + tasks.join(', '));
  }
  console.log('— требуют перечитывания: ' + n + ' из ' + total);
}

function mark(names) {
  const date = val('--date') || today();
  if (!iso(date)) { console.error('Дата — ДД.ММ.ГГГГ.'); process.exit(2); }
  const items = scope();
  let done = 0;
  for (const name of names) {
    const item = items.find((i) => nameOf(i) === name);
    if (!item) { console.error('Не нашёл паспорт или спеку «' + name + '».'); process.exitCode = 1; continue; }
    const text = readFileSync(item.file, 'utf8');
    const eol = text.includes('\r\n') ? '\r\n' : '\n';
    const lines = text.replace(/\r\n/g, '\n').split('\n');
    const head = lines.findIndex((l) => l.trim() === titleOf(item.kind));
    if (head < 0) { console.error(item.rel + ': нет раздела «Бизнес-смысл».'); process.exitCode = 1; continue; }
    let src = -1;
    for (let i = head + 1; i < lines.length && !/^#{1,6}\s/.test(lines[i]); i++) if (/^Источники:/.test(lines[i].trim())) { src = i; break; }
    if (src < 0) { console.error(item.rel + ': нет строки «Источники:».'); process.exitCode = 1; continue; }
    if (lines[src + 1] !== undefined && /^Проверено:/.test(lines[src + 1].trim())) lines[src + 1] = 'Проверено: ' + date;
    else if (lines[src + 2] !== undefined && lines[src + 1] === '' && /^Проверено:/.test(lines[src + 2].trim())) lines[src + 2] = 'Проверено: ' + date;
    else lines.splice(src + 1, 0, '', 'Проверено: ' + date);
    writeFileSync(item.file, lines.join('\n').replace(/\n/g, eol), 'utf8');
    done++;
    console.log('проверено ' + date + ' — ' + item.rel);
  }
  if (done) console.log('Пересобери витрину: node .agents/tools/kit-build.mjs');
}

if (has('--unresolved')) unresolved();
else if (has('--find') && val('--find')) find(val('--find'));
else if (has('--uses') && val('--uses')) uses(val('--uses'));
else if (has('--terms')) terms();
else if (has('--stale')) stale();
else if (has('--mark')) mark(args.slice(args.indexOf('--mark') + 1).filter((a, i, arr) => !a.startsWith('--') && arr[arr.indexOf(a) - 1] !== '--date'));
else {
  console.error('Использование: business-context.mjs --unresolved [--module <модуль>] | --find <слово> | --uses <Термин> | --terms | --stale | --mark <Имя>…');
  process.exit(2);
}
