#!/usr/bin/env node
/* ============================================================
   AFTER-WRITE — проверка экрана сразу после записи файла (задача RE0040, Э1).

   Зачем. Сенсор раскладки (`layout-check.mjs`) ловит блокеры экрана, но
   только когда его запустили: гейтом в конце захода или на приёмке. Ошибка,
   внесённая в начале сборки, всплывала через много шагов, и правка шла
   повторным заходом. Этот скрипт зовёт CLI агента после каждой записи или
   правки файла (хук «после вызова инструмента»): экран проверяется сразу, и
   блокер возвращается агенту, пока он ещё в этом файле.

   Не сторож. Гейт остаётся главным: правила без хука работают как раньше,
   хук только раньше показывает то же самое. Своих правил у скрипта нет —
   состав проверок целиком у `layout-check.mjs --rules`.

   Что считается экраном: `<Имя>.html` прямо в папке `pages/` приложения на
   любой глубине `apps/` (каталоги — из project.json), кроме собранных `*.preview.html` и каталогов, которые лежат
   в `apps/`, но экранами не являются: витрина локальных компонентов, карта
   экранов, база знаний. Источник модульной страницы с метками `<ds-include>`
   сенсор сам пропускает (проверяется собранный файл) — хук тогда молчит.
   Виджеты `widgets/…` — вне первого шага (вопрос 4 задачи).

   Ответ:
     - не экран, блокеров нет, вход не разобран — тишина, код 0;
     - есть блокеры — строка с путём и строки FAIL в stderr, код 2: так CLI с
       хуками возвращают текст агенту. Замечания (WARN) не печатаются: хук
       срабатывает и на промежуточных правках, шум отвлекает (риски задачи).

   ЖУРНАЛ ПРОГОНОВ. Прогон хука в журнал (`runlog.mjs`) не пишется: сенсору
   подставляется временный файл журнала, который удаляется после прогона.
   Хук видит экран на промежуточных шагах сборки, и блокер, закрытый
   следующей правкой, `stats` прочёл бы как возврат дефекта после урока —
   РЕГРЕСС на пустом месте. Работу над экраном журнал видит прогоном гейта.

   Запуск (из корня репо):
     node .agents/tools/after-write.mjs <путь>          — путь аргументом
     <событие JSON> | node .agents/tools/after-write.mjs  — поле tool_input.file_path
     node .agents/tools/after-write.mjs --selftest      — откат на фикстурах сенсора

   Как подключить в CLI — `.agents/README.md`, раздел «Хук после записи файла».
   ============================================================ */
import { readFileSync, existsSync, mkdtempSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { project } from './project.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const LAYOUT_CHECK = path.join(HERE, 'layout-check.mjs');

/** Путь записанного файла из события CLI: `tool_input.file_path`. Не JSON или
    поля нет — null (хук молчит: чужое событие — не повод шуметь). */
export function pathFromEvent(text) {
  try {
    const ev = JSON.parse(text);
    const p = ev && ev.tool_input && ev.tool_input.file_path;
    return typeof p === 'string' && p ? { file: p, cwd: typeof ev.cwd === 'string' ? ev.cwd : null } : null;
  } catch {
    return null;
  }
}

/** Экран ли это: путь от корня проекта, слэшами вперёд, или null. */
export function screenRel(abs, P) {
  if (!P.root || !P.appsDir) return null;
  const rel = path.relative(P.root, abs).split(path.sep).join('/');
  if (rel.startsWith('..') || path.isAbsolute(rel) || !rel.startsWith(P.appsDir + '/')) return null;
  const notScreens = [P.showcase, P.screenMap && P.screenMap.dir, P.knowledgeBase && P.knowledgeBase.dir].filter(Boolean);
  if (notScreens.some((d) => rel === d || rel.startsWith(d + '/'))) return null;
  const parts = rel.split('/');
  const name = parts[parts.length - 1];
  if (parts[parts.length - 2] !== P.appShape.pages) return null;
  if (!/\.html$/i.test(name) || /\.preview\.html$/i.test(name)) return null;
  return rel;
}

/** Прогон сенсора без записи в журнал. { code, err } — код выхода хука и текст для stderr. */
export function check(rel, root) {
  const tmp = mkdtempSync(path.join(os.tmpdir(), 'after-write-'));
  let r;
  try {
    r = spawnSync(process.execPath, [LAYOUT_CHECK, rel], {
      cwd: root, encoding: 'utf8', env: { ...process.env, RUNLOG_FILE: path.join(tmp, 'run.jsonl') },
    });
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
  if (r.status === 0) return { code: 0, err: '' };
  const lines = String(r.stdout || '').split(/\r?\n/);
  let shown = lines.filter((l) => /^(FAIL|ОШИБКА)\b/u.test(l));
  /* Сенсор упал, а строк FAIL нет (формат отчёта сменился, процесс оборвался) —
     молчать нельзя: молчание читалось бы как чистота (Л100). */
  if (!shown.length) shown = [...lines.filter((l) => /^ВЕРДИКТ/u.test(l)), String(r.stderr || '').trim() || 'layout-check: код ' + r.status].filter(Boolean);
  return { code: 2, err: `layout-check ${rel}: блокеры экрана — закрыть до следующего шага\n` + shown.join('\n') + '\n' };
}

/* ---------------- selftest: откат на фикстурах сенсора ---------------- */

function selftest() {
  const P = project(HERE);
  const out = ['== after-write --selftest =='];
  let bad = 0;
  const ok = (name, cond, why) => { out.push((cond ? 'PASS  ' : 'FAIL  ') + name + (cond ? '' : ' — ' + why)); if (!cond) bad++; };
  const at = (rel) => path.join(P.root, rel);
  const a = P.appsDir, pg = P.appShape.pages;

  ok('экран страницы приложения — проверяется', screenRel(at(`${a}/x/drafts/y/${pg}/Deal.html`), P) === `${a}/x/drafts/y/${pg}/Deal.html`, 'не распознан');
  ok('собранный *.preview.html — нет', screenRel(at(`${a}/x/y-app/${pg}/Deal.preview.html`), P) === null, 'распознан как экран');
  ok('виджет widgets/ — нет', screenRel(at(`${a}/x/y-app/${P.appShape.widgets}/tiles/T/T.html`), P) === null, 'распознан как экран');
  ok('спека .screen.md — нет', screenRel(at(`${a}/x/y-app/${pg}/Deal.screen.md`), P) === null, 'распознана как экран');
  if (P.showcase) ok('витрина локальных компонентов — нет', screenRel(at(`${P.showcase}/postrade/${pg}/X.html`), P) === null, 'распознана как экран');
  ok('файл вне apps/ — нет', screenRel(at(`docs/${pg}/X.html`), P) === null, 'распознан как экран');
  ok('файл вне проекта — нет', screenRel(path.resolve(P.root, '..', `${pg}/X.html`), P) === null, 'распознан как экран');

  const ev = pathFromEvent(JSON.stringify({ tool_input: { file_path: 'a/b.html' }, cwd: '/w' }));
  ok('событие: путь из tool_input.file_path', ev && ev.file === 'a/b.html' && ev.cwd === '/w', JSON.stringify(ev));
  ok('событие: не JSON — null', pathFromEvent('не json') === null, 'не null');
  ok('событие: без поля — null', pathFromEvent('{"tool_input":{}}') === null, 'не null');

  /* Фикстуры сенсора: эталон и дефект Б26 (валюта «руб.»). В журнал они не
     пишутся и без подмены (runlog.mjs, isFixture). */
  const fx = path.relative(P.root, path.join(HERE, 'fixtures')).split(path.sep).join('/');
  const t0 = Date.now();
  const clean = check(`${fx}/_base.ok.html`, P.root);
  ok('чистый экран — тишина, код 0', clean.code === 0 && clean.err === '', `код ${clean.code}, вывод: ${clean.err}`);
  const dirty = check(`${fx}/Б26.bad.html`, P.root);
  ok('блокер Б26 — строка FAIL, код 2', dirty.code === 2 && /^FAIL\s+Б26/mu.test(dirty.err), `код ${dirty.code}, вывод: ${dirty.err}`);
  ok('замечания и пройденные — не печатаются', !/^(WARN|PASS)\b/mu.test(dirty.err), 'в выводе есть WARN/PASS');
  out.push(`время двух прогонов: ${Date.now() - t0} мс`);

  out.push('', bad ? `ВЕРДИКТ: FAIL (${bad})` : 'ВЕРДИКТ: OK');
  console.log(out.join('\n'));
  process.exit(bad ? 1 : 0);
}

/* ---------------- main ---------------- */

function main() {
  const args = process.argv.slice(2);
  if (args.includes('--selftest')) return selftest();
  const P = project(HERE);
  if (P.error) process.exit(0);                     // не наш проект — не наше дело

  let target = null;
  const arg = args.find((x) => !x.startsWith('--'));
  if (arg) target = { file: arg, cwd: null };
  else if (!process.stdin.isTTY) {
    let text = '';
    try { text = readFileSync(0, 'utf8'); } catch { /* stdin закрыт — входа нет */ }
    target = pathFromEvent(text);
  }
  if (!target) process.exit(0);

  const abs = path.resolve(target.cwd || process.cwd(), target.file);
  const rel = existsSync(abs) ? screenRel(abs, P) : null;
  if (!rel) process.exit(0);

  const r = check(rel, P.root);
  if (r.err) process.stderr.write(r.err);
  process.exit(r.code);
}

main();
