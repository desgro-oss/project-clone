/* ============================================================
   Самопроверка автопроверки: заведомо плохие сцены обязаны дать FAIL по своему правилу, хорошие — OK.
   Запуск: illustration-gen.mjs --selftest
   ============================================================ */
import { Scene, COL, L, poly3, box, render } from './lib.mjs';
import { buildSceneFromSpec } from './layout.mjs';
import { checkScene, checkImage, measureSvgText, measureReferences, loadThresholds, renderBalanced } from './check.mjs';

const spec = (over) => ({ file: 'selftest', layout: 'trio', base: 'none',
  hero: { motif: 'building' }, mid: { motif: 'docStack' }, small: { motif: 'coinStack' }, ...over });

function run(scene) { const r = scene.meta?.layout ? renderBalanced(scene) : render(scene); return checkScene(scene, r, loadThresholds()); }
const failedIds = (res) => res.results.filter((r) => !r.ok).map((r) => r.id);

export function runSelftest() {
  const lines = []; let failed = 0;
  const t = (name, ok, extra = '') => { lines.push((ok ? 'ok    ' : 'FAIL  ') + name + (extra ? ' — ' + extra : '')); if (!ok) failed++; };

  /* хорошие сцены — OK по всем правилам */
  for (const [name, sp] of [
    ['хорошая: trio, башня + документы + куб', spec({ hero: { motif: 'tower' }, mid: { motif: 'docStack' }, small: { motif: 'cube' } })],
    ['хорошая: solo, монитор', { file: 'selftest', layout: 'solo', base: 'none', hero: { motif: 'monitor' } }],
    ['хорошая: diagonal, монитор + две стопки, плита', { file: 'selftest', layout: 'diagonal', base: 'slab', hero: { motif: 'monitor' }, mid: { motif: 'docStack', opts: { n: 7 } }, small: { motif: 'docStack' } }],
    ['хорошая: trio на радарном диске', spec({ base: 'radar', hero: { motif: 'tower' }, mid: { motif: 'cube' }, small: { motif: 'cube' } })],
  ]) { const res = run(buildSceneFromSpec(sp)); t(name, res.ok, res.ok ? '' : failedIds(res).join(', ')); }

  /* плохие — обязаны упасть именно по своему правилу */
  const bad = (name, scene, id) => { const f = failedIds(run(scene)); t(name, f.some((x) => x.startsWith(id)), `ждали ${id}, упало: ${f.join(', ') || 'ничего'}`); };
  bad('плохая: крошечный малый объект', buildSceneFromSpec(spec({ small: { motif: 'coinStack', k: 0.1 } })), 'share.small');
  bad('плохая: плоская и пустая сцена (здание в ряд с двумя низкими предметами, без основания)', buildSceneFromSpec(spec({})), 'image.');
  bad('плохая: средний крупнее главного', buildSceneFromSpec(spec({ hero: { motif: 'cube' }, mid: { motif: 'building', k: 1 }, small: { motif: 'cube' } })), 'hero');

  const hidden = new Scene('selftest');                    // малый объект целиком за главным
  hidden.owner('mid', () => box(hidden, -4, -4, 0, 8, 8, 8, COL.cube));
  hidden.owner('hero', () => box(hidden, -22, -22, 0, 44, 44, 44, COL.cube));
  hidden.meta = { objects: [{ role: 'hero' }, { role: 'mid' }], overlaps: [] };
  bad('плохая: объект спрятан за соседом', hidden, 'visible.mid');

  const color = new Scene('selftest');                     // цвет вне палитры
  color.owner('hero', () => color.add(poly3([[-30, -30, 0], [30, -30, 0], [30, 30, 0], [-30, 30, 0]]), '#123456'));
  bad('плохая: чужой цвет', color, 'palette');

  const tiny = '<svg viewBox="0 0 195 140" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="4" width="22" height="22" fill="#A3CCC9"/></svg>';
  const imgRes = []; checkImage(measureSvgText(tiny), loadThresholds(), imgRes);
  t('плохой рисунок: маленький и в углу', imgRes.filter((r) => !r.ok).length >= 3, `упало правил: ${imgRes.filter((r) => !r.ok).map((r) => r.id).join(', ')}`);

  const bomb = (() => { try { buildSceneFromSpec(spec({ layout: 'quartet' })); return false; } catch (e) { return /раскладка/.test(e.message); } })();
  t('плохое описание: неизвестная раскладка — понятная ошибка', bomb);
  const bomb2 = (() => { try { buildSceneFromSpec(spec({ hero: { motif: 'rocket' } })); return false; } catch (e) { return /мотива/.test(e.message); } })();
  t('плохое описание: неизвестный мотив — понятная ошибка', bomb2);

  /* эталоны: все разбираются; доля внутри порогов рисунка (выбросы — информация, не отказ) */
  const thr = loadThresholds(), refs = measureReferences();
  const inside = refs.filter((r) => { const o = []; checkImage(r, thr, o); return o.every((x) => x.ok); }).length;
  t(`эталоны ДС разбираются: ${refs.length} из 32`, refs.length === 32 && refs.every((r) => !r.empty));
  t(`эталоны внутри порогов рисунка: ${inside} из ${refs.length} (не меньше 28)`, inside >= 28);

  lines.push('ВЕРДИКТ: ' + (failed ? `FAIL (провалено: ${failed})` : 'OK'));
  return { lines, failed };
}
