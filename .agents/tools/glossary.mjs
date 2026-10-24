/* ============================================================
   GLOSSARY — термины предметной области для базы знаний (RE0038).

   Зачем (решение человека 23.10.2026). Паспорта виджетов и спеки страниц не
   объясняют слова предметной области (деск, ЦУП, …) у себя: термин живёт в
   одном месте — в «Глоссарии» базы знаний, а в тексте на него ссылаются
   вики-ссылкой, как в Obsidian: `[[Деск]]`, `[[Деск|деска]]`.

   Где лежит. `<knowledgeBase.dir>/glossary/terms/<Термин>.md` — один файл на
   термин, имя файла = термин (так `[[Деск]]` находится в Obsidian сам).
   Шапка файла: `aliases: [деск, дески, …]` — другие формы слова (Obsidian тоже
   понимает `aliases`). Тело — определение; строка «Источники: …» — откуда оно.
   Нет источника — не пишем определение, а ставим «не решено (ДД.ММ.ГГГГ)».

   Здесь — только разбор: термины, поиск по имени и псевдониму без учёта
   регистра, поиск вики-ссылок в тексте. Страницу и разметку ссылок на странице
   паспорта делает kit-build.mjs (КТ7 — ссылка на несуществующий термин).
   ============================================================ */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';

const norm = (s) => String(s).trim().toLowerCase().replace(/ё/g, 'е').replace(/\s+/g, ' ');

/** Вики-ссылки текста: [{ name, alias }]. Код (в `…` и в блоках ```) пропускается. */
export function wikiLinks(text) {
  const clean = String(text)
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`\n]*`/g, '')
    .replace(/<!--[\s\S]*?-->/g, '');
  const out = [];
  for (const m of clean.matchAll(/\[\[([^\[\]|#\n]+?)(?:#[^\[\]|\n]*)?(?:\|([^\[\]\n]*))?\]\]/g)) {
    if (!/\p{L}/u.test(m[1])) continue;
    out.push({ name: m[1].trim(), alias: m[2] === undefined ? null : m[2].trim() });
  }
  return out;
}

function parseTerm(file, text) {
  const t = text.replace(/\r\n/g, '\n').replace(/^﻿/, '');
  let fm = '', body = t;
  if (t.startsWith('---\n')) {
    const end = t.indexOf('\n---', 3);
    if (end !== -1) {
      fm = t.slice(4, end);
      const after = t.indexOf('\n', end + 1);
      body = after === -1 ? '' : t.slice(after + 1);
    }
  }
  const aliases = [];
  const am = /^aliases:\s*(.*)$/m.exec(fm);
  if (am) {
    const v = am[1].trim();
    if (v.startsWith('[')) aliases.push(...v.replace(/^\[|\]$/g, '').split(',').map((s) => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean));
    else if (!v) {
      for (const l of fm.slice(am.index + am[0].length).split('\n').slice(1)) {
        const im = /^\s+-\s+(.*)$/.exec(l);
        if (!im) break;
        aliases.push(im[1].trim().replace(/^["']|["']$/g, ''));
      }
    }
  }
  const name = path.basename(file, '.md');
  const lines = body.trim().split('\n');
  const srcAt = lines.findIndex((l) => /^Источники:/.test(l.trim()));
  const sources = srcAt >= 0 ? lines[srcAt].trim().replace(/^Источники:\s*/, '') : '';
  const def = (srcAt >= 0 ? lines.slice(0, srcAt) : lines).join('\n').trim();
  return { id: name.toLowerCase().replace(/\s+/g, '-'), name, aliases, def, sources, file };
}

/** Термины базы знаний: { dir, terms, find(name), defects }. dir — папка `terms` или null. */
export function loadTerms(P) {
  const defects = [];
  const kb = P.knowledgeBase;
  const dir = kb ? path.join(kb.dirAbs, 'glossary', 'terms') : null;
  const terms = [];
  if (dir && existsSync(dir)) {
    for (const f of readdirSync(dir).filter((n) => n.endsWith('.md')).sort((a, b) => a.localeCompare(b, 'ru'))) {
      const term = parseTerm(f, readFileSync(path.join(dir, f), 'utf8'));
      if (!term.def) defects.push('КТ7 ' + P.rel(path.join(dir, f)) + ' — у термина нет определения');
      if (!term.sources) defects.push('КТ7 ' + P.rel(path.join(dir, f)) + ' — нет строки «Источники:»');
      terms.push(term);
    }
  }
  const index = new Map();
  for (const term of terms) {
    for (const key of [term.name, ...term.aliases].map(norm)) {
      if (index.has(key) && index.get(key) !== term) defects.push('КТ7 «' + key + '» — имя или псевдоним двух терминов: ' + index.get(key).name + ' и ' + term.name);
      else index.set(key, term);
    }
  }
  return { dir, terms, find: (name) => index.get(norm(name)) || null, defects };
}
