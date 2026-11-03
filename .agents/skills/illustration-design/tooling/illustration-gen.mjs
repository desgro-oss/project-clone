#!/usr/bin/env node
/* ============================================================
   ILLUSTRATION-GEN — генератор тайловых иллюстраций ДС (195×140, изометрия).

   Две формы темы в `themes/`:
     <тема>.json — описание сцен короткими записями (раскладка + мотивы из каталога): для новых тем и слабых моделей;
     <тема>.mjs  — сцены кодом на примитивах `lib.mjs`: для того, чего нет в каталоге мотивов (утверждённые «Радар» и «Фонды»).
   У темы: `id`, `title`, `dir`, `order`, `tile { title, desc }` — текст нав-тайла для превью — и список сцен с флагом `keep`
   (false — в архив, не в обзор). Цвета — только из design-system/foundations/Illustrations/illustration-style.json.
   Результат — только файлы в папке `--out`: <имя>.svg, <имя>-dark.svg и обзор index.html: вкладки по темам, у варианта
   рядом с рисунком живой NavTile ДС (светлый и тёмный) и итог автопроверки. Ничего, кроме результата, в эту папку не кладётся.

   Запуск из корня репозитория:
     node .agents/skills/illustration-design/tooling/illustration-gen.mjs --out tmp/<имя>
     node …/illustration-gen.mjs --list                        — темы и сцены (keep)
     node …/illustration-gen.mjs --motifs                      — каталог мотивов и раскладок
     node …/illustration-gen.mjs --out tmp/<имя> --theme fonds — одна тема
     node …/illustration-gen.mjs --out tmp/<имя> --all         — и сцены с keep: false, в <out>/архив/
     node …/illustration-gen.mjs --out tmp/<имя> --no-dark     — без тёмной пары
     node …/illustration-gen.mjs --check [--theme …]           — только проверить сцены, файлов не писать
     node …/illustration-gen.mjs --check-svg <файл.svg>        — проверить рисунок (центр, размер, заполнение) любого SVG
     node …/illustration-gen.mjs --calibrate                   — пересобрать пороги по 32 эталонам ДС (только чтение эталонов)
     node …/illustration-gen.mjs --selftest                    — плохие сцены обязаны упасть, хорошие пройти
   Тёмная пара собирается всегда — это скрипт (карта «светлый → тёмный» из JSON стиля).
   Сцена из JSON с нарушением правил — FAIL; утверждённые сцены кодом — только ВНИМАНИЕ. Строка `ВЕРДИКТ: OK | FAIL`, код выхода 0 | 1.
   ============================================================ */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { render, toDark } from './lib.mjs';
import { describeMotifs } from './motifs.mjs';
import { LAYOUTS, BASES, buildSceneFromSpec, validateSpec } from './layout.mjs';
import { checkScene, checkImage, measureSvgText, calibrate, loadThresholds, renderBalanced } from './check.mjs';
import { runSelftest } from './selftest.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../../../..');
const THEME_DIR = path.join(HERE, 'themes');

const argv = process.argv.slice(2);
const flag = (n) => argv.includes(n);
const val = (n, d) => (argv.includes(n) ? argv[argv.indexOf(n) + 1] : d);

/* ---------- темы: .mjs (код) и .json (описание сцен) ---------- */
const THEMES = {};
const loaded = [];
for (const f of fs.readdirSync(THEME_DIR).filter((n) => n.endsWith('.mjs') || n.endsWith('.json'))) {
  if (f.endsWith('.mjs')) loaded.push({ ...(await import(new URL('./themes/' + f, import.meta.url))).default, kind: 'код' });
  else {
    const j = JSON.parse(fs.readFileSync(path.join(THEME_DIR, f), 'utf8'));
    loaded.push({ ...j, kind: 'описание', scenes: j.scenes.map((spec) => ({ file: spec.file, keep: spec.keep !== false, spec, make: () => buildSceneFromSpec(spec) })) });
  }
}
for (const t of loaded.sort((a, b) => (a.order ?? 99) - (b.order ?? 99) || a.id.localeCompare(b.id))) THEMES[t.id] = t;   // порядок вкладок — по order

if (flag('--motifs')) {
  console.log('== мотивы ==\n' + describeMotifs().join('\n'));
  console.log('\n== раскладки (роли: размер; угол в мире) ==');
  for (const [n, l] of Object.entries(LAYOUTS)) console.log(`${n.padEnd(9)} ` + Object.entries(l.roles).map(([r, d]) => `${r} ×${d.k}${d.angle !== undefined ? ' @' + d.angle + '°' : ''}`).join(', '));
  console.log('\nоснования: ' + BASES.join(', '));
  console.log('ВЕРДИКТ: OK');
  process.exit(0);
}
if (flag('--list')) {
  for (const t of Object.values(THEMES)) {
    console.log(`${t.id} — ${t.title} (${t.kind}) [тайл: «${t.tile?.title ?? '—'}»]`);
    for (const s of t.scenes) console.log(`  ${s.keep ? '✔' : '·'} ${s.file}`);
  }
  console.log('✔ — в обзоре, · — в архиве (keep: false; собирается с --all)');
  process.exit(0);
}
if (flag('--selftest')) {
  const { lines, failed } = runSelftest();
  console.log('== illustration-gen --selftest ==\n' + lines.join('\n'));
  process.exit(failed ? 1 : 0);
}
if (flag('--calibrate')) {
  const { refs, json } = calibrate();
  console.log(`== пороги по ${refs.length} эталонам ДС (процентили p5…p95 + 25 % размаха) ==`);
  for (const [k, r] of Object.entries(json.image)) console.log(`${k.padEnd(5)} ${r.min}…${r.max}`);
  console.log(`выбросы среди эталонов (${json.outliers.length}) — вне порогов, пороги они не размывают:`);
  for (const o of json.outliers) console.log('  ' + o);
  console.log('записано: .agents/skills/illustration-design/references/check-thresholds.json\nВЕРДИКТ: OK');
  process.exit(0);
}
if (flag('--check-svg')) {
  const file = val('--check-svg');
  const res = []; checkImage(measureSvgText(fs.readFileSync(path.resolve(process.cwd(), file), 'utf8')), loadThresholds(), res);
  for (const r of res) console.log((r.ok ? 'OK    ' : 'FAIL  ') + r.msg);
  const failed = res.some((r) => !r.ok);
  console.log('ВЕРДИКТ: ' + (failed ? 'FAIL' : 'OK'));
  process.exit(failed ? 1 : 0);
}

const TILE_DESC_MAX = 50;                  // NavTile режет описание на 2 строках многоточием: ~25 знаков в строке при ширине тайла 442
const checkOnly = flag('--check');
const out = path.resolve(process.cwd(), val('--out', 'tmp/illustrations'));
const wanted = (val('--theme', '') || '').split(',').filter(Boolean);
const themes = wanted.length ? wanted.map((id) => THEMES[id]) : Object.values(THEMES).filter((t) => !t.sample);   // темы-образцы (`sample: true`) в общий обзор не попадают, собираются только по --theme
const stop = (msg) => { console.log('FAIL  ' + msg); console.log('ВЕРДИКТ: FAIL'); process.exit(1); };
if (themes.some((t) => !t)) stop('неизвестная тема; доступны: ' + Object.keys(THEMES).join(', '));
const missingTile = themes.filter((t) => !t.tile?.title || !t.tile?.desc);
if (missingTile.length) stop('у темы нет tile { title, desc } для превью нав-тайла: ' + missingTile.map((t) => t.id).join(', '));
const tooLong = themes.filter((t) => t.tile.desc.length > TILE_DESC_MAX);
if (tooLong.length) stop(`описание тайла длиннее ${TILE_DESC_MAX} знаков, в NavTile оно обрежется многоточием: ` + tooLong.map((t) => `${t.id} (${t.tile.desc.length})`).join(', '));
for (const t of themes) for (const sc of t.scenes.filter((s) => s.spec)) {
  const bad = validateSpec(sc.spec);
  if (bad.length) stop(`${t.id}/${sc.file}: ` + bad.join('; '));
}
const dark = !flag('--no-dark'), all = flag('--all');
const thr = loadThresholds();

const report = [], verdicts = {};
let hardFail = 0;
for (const t of themes) {
  for (const sc of t.scenes) {
    if (!sc.keep && !all) continue;
    const scene = sc.make();
    scene.name = sc.file;
    if (sc.base) scene.baseHint = sc.base;
    const rendered = sc.spec ? renderBalanced(scene) : render(scene);   // утверждённые сцены кодом — как были
    const chk = checkScene(scene, rendered, thr);
    verdicts[sc.file] = { ...chk, strict: !!sc.spec };
    const fails = chk.results.filter((r) => !r.ok);
    if (fails.length && sc.spec) hardFail++;
    report.push(`${t.id}/${sc.file}${sc.keep ? '' : ' (архив)'}: проверка ${fails.length ? (sc.spec ? 'FAIL' : 'ВНИМАНИЕ') : 'OK'} (${chk.results.length} правил)`);
    for (const f of fails) report.push(`    ${sc.spec ? 'FAIL' : 'ВНИМАНИЕ'}  ${f.msg}`);
    if (checkOnly) continue;
    const dir = path.join(out, sc.keep ? '' : 'архив', t.dir);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, sc.file + '.svg'), rendered.svg);
    if (dark) fs.writeFileSync(path.join(dir, sc.file + '-dark.svg'), toDark(rendered.svg));
    report.push(`    путей ${scene.items.length}, масштаб ×${rendered.scale.toFixed(2)}${dark ? ', тёмная собрана' : ''}`);
  }
}

if (!checkOnly) {
  /* обзор: вкладка на тему; у варианта — голый рисунок и живой NavTile ДС, светлая и тёмная строки, итог проверки */
  fs.mkdirSync(out, { recursive: true });
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  const active = (t) => t.scenes.filter((s) => s.keep);
  const bare = (file, bg, label) => `<figure style="background:${bg}"><img src="${file}" width="300" height="215"><figcaption>${esc(label)}</figcaption></figure>`;
  const tile = (t, file, isDark) => `<div class="pv"${isDark ? ' data-theme="ibp-neo-dark"' : ''}><a class="ntile" href="#" onclick="return false">`
    + `<span class="illu ntile__illu" aria-hidden="true"><img src="${file}" alt=""></span>`
    + `<h3 class="ntile__title">${esc(t.tile.title)}</h3><p class="ntile__desc">${esc(t.tile.desc)}</p></a></div>`;
  const badge = (file) => {
    const v = verdicts[file]; if (!v) return '';
    const fails = v.results.filter((r) => !r.ok);
    return fails.length ? `<span class="bad">проверка: ${v.strict ? 'не пройдена' : 'замечания'} — ${fails.map((f) => esc(f.msg)).join('; ')}</span>`
      : `<span class="good">проверка: пройдена (${v.results.length} правил)</span>`;
  };
  const variant = (t, s) => {
    const rel = (t.dir ? t.dir + '/' : '') + s.file;
    const hasDark = fs.existsSync(path.join(out, rel + '-dark.svg'));
    return `<div class="v"><h2>${esc(s.file)} ${badge(s.file)}</h2>`
      + `<div class="r"><div class="pair">${bare(rel + '.svg', '#fff', 'светлая')}${tile(t, rel + '.svg', false)}</div>`
      + (hasDark ? `<div class="pair">${bare(rel + '-dark.svg', '#12181c', 'тёмная')}${tile(t, rel + '-dark.svg', true)}</div>` : '')
      + '</div></div>';
  };
  const panel = (t, i) => `<section id="p-${t.id}"${i ? ' hidden' : ''}>${active(t).map((s) => variant(t, s)).join('')}</section>`;
  const cssFiles = ['foundations/Typography/Typography.css', 'foundations/Colors/Colors.css', 'foundations/Colors/Palette.css',
    'foundations/Radius/Radius.css', 'foundations/Elevation/Elevation.css', 'foundations/Themes/Themes.css',
    'foundations/Illustrations/Illustrations.css', 'components/molecules/NavTile/NavTile.css'];
  /* обзор самодостаточен: стили и шрифты ДС копируются в <out>/ds с той же структурой (url() шрифтов не ломаются),
     папку можно отдать архивом без остального репозитория */
  for (const f of cssFiles) {
    fs.mkdirSync(path.join(out, 'ds', path.dirname(f)), { recursive: true });
    fs.copyFileSync(path.join(REPO, 'design-system', f), path.join(out, 'ds', f));
  }
  fs.cpSync(path.join(REPO, 'design-system/assets/fonts'), path.join(out, 'ds/assets/fonts'), { recursive: true });
  const css = cssFiles.map((f) => `<link rel="stylesheet" href="ds/${f}">`).join('\n');
  fs.writeFileSync(path.join(out, 'index.html'), `<!doctype html><meta charset="utf-8"><title>Иллюстрации — варианты</title>
${css}
<style>body{margin:0;padding:24px;font:13px system-ui;background:#eef2f1;color:#233}h1{font-size:16px;margin:0 0 12px}h2{font-size:13px;margin:0 0 8px}
h2 .good{font-weight:400;color:#2e7d57;margin-left:8px}h2 .bad{font-weight:400;color:#b3261e;margin-left:8px}
nav{display:flex;gap:6px;margin-bottom:16px}nav button{font:inherit;padding:7px 16px;border:0;border-radius:8px;background:#dfe8e6;color:#233;cursor:pointer}
nav button[aria-selected=true]{background:#233;color:#fff}
.v{margin-bottom:40px}.r{display:flex;flex-wrap:wrap;gap:24px;align-items:stretch}.pair{display:flex;gap:12px;align-items:stretch}
figure{margin:0;border-radius:12px;padding:8px;box-shadow:0 0 0 1px rgba(0,0,0,.08)}figcaption{padding:4px 8px;opacity:.7}
.pv{display:flex;align-items:center;box-sizing:border-box;padding:16px;border-radius:12px;background:var(--bg-page,#f4f6f6);box-shadow:0 0 0 1px rgba(0,0,0,.08)}
[hidden]{display:none}</style>
<h1>Иллюстрации — варианты: рисунок и нав-тайл ДС (светлая / тёмная)</h1>
<nav role="tablist">${themes.map((t, i) => `<button role="tab" data-t="${t.id}" aria-selected="${i === 0}">${esc(t.title)} · ${active(t).length}</button>`).join('')}</nav>
${themes.map(panel).join('')}
<script>
const show=(id)=>{document.querySelectorAll('nav button').forEach(b=>b.setAttribute('aria-selected',b.dataset.t===id));
document.querySelectorAll('section').forEach(p=>p.hidden=p.id!=='p-'+id);try{location.hash=id}catch(e){}};
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>show(b.dataset.t));
const h=location.hash.slice(1);if(h&&document.getElementById('p-'+h))show(h);
</script>`);
}

console.log(`== illustration-gen${checkOnly ? ' --check' : ''} ==\n` + report.join('\n'));
if (!checkOnly) console.log(`обзор: ${path.relative(process.cwd(), path.join(out, 'index.html')).replace(/\\/g, '/')}`);
console.log('ВЕРДИКТ: ' + (hardFail ? `FAIL (сцен с нарушениями: ${hardFail})` : 'OK'));
process.exit(hardFail ? 1 : 0);
