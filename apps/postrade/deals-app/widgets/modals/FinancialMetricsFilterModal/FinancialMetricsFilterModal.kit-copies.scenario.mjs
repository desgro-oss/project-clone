export default async (page) => {
  const d = page.document; const w = page.window;
  await page.wait(600);
  const live = d.querySelector('#pg-stage .modal-scrim');
  const copies = [...d.querySelectorAll('#kit-cases .modal-scrim')];
  page.check(copies.length >= 4, 'копий: ' + copies.length);
  const cnt = (s) => s.querySelectorAll('[data-fmf-grid] > *').length;
  const before = copies.map(cnt).join(',');
  const liveBefore = cnt(live);
  page.step('до: копии ' + before + ' живое ' + liveBefore);
  const target = copies.find((s) => cnt(s) > 1 && !s.querySelector('[data-fmf-clear]').disabled);
  page.check(!!target, 'есть копия с выбором');
  const ev = (el, t) => el.dispatchEvent(new w.Event(t, { bubbles: true }));
  const btn = target.querySelector('[data-fmf-clear]');
  ev(btn, 'pointerdown'); btn.click(); await page.wait(60);
  page.check(cnt(target) === 1, 'очищена выбранная копия');
  page.check(cnt(live) === liveBefore, 'живое окно не затронуто: ' + cnt(live));
  const others = copies.filter((s) => s !== target).map(cnt).join(',');
  const exp = copies.map((s, i) => s === target ? 1 : parseInt(before.split(',')[i])).join(',').split(',').filter((x, i) => copies[i] !== target).join(',');
  page.check(others === exp, 'остальные копии не затронуты: ' + others + ' vs ' + exp);
  // вернуться в живое окно
  const lb = live.querySelector('[data-fmf-clear]');
  if (!lb.disabled) { ev(lb, 'pointerdown'); lb.click(); await page.wait(60); page.check(cnt(live) === 1, 'живое очищено'); page.check(cnt(target) === 1, 'копия по-прежнему пуста'); }
  const ids = [...d.querySelectorAll('[id]')].map((e) => e.id); const dup = ids.filter((x, i) => ids.indexOf(x) !== i);
  page.check(dup.length === 0, 'дубли id в документе: ' + [...new Set(dup)].slice(0, 5).join(','));
};
