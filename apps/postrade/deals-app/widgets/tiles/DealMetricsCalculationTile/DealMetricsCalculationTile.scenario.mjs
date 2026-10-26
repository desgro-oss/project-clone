// Сценарий тайла «Финансовые метрики» (RE0033 Э3): атрибуты вида по сделке-образцу,
// во время расчёта — лоадер и блокировка, после — вид и снек.
// Гонять с --query: id=1026 · 1044 · 1036 · 1024 · 1027 · 1028 · 1027&fmMode=view · 1044&fmCalc=ok
const EXPECT = {
  '1026': { state: 'empty', locked: true, error: false, calc: false },
  '1044': { state: 'empty', locked: false, error: false, calc: false },
  '1036': { state: 'empty', locked: false, error: true, calc: false },
  '1024': { state: 'data', locked: false, error: false, calc: true },
  '1027': { state: 'partial', locked: false, error: false, calc: true },
  '1028': { state: 'data', locked: false, error: true, calc: true }
};
export default async (page) => {
  const d = page.document;
  const w = page.window;
  const q = new URLSearchParams(w.location.search);
  const id = q.get('id');
  const tile = () => d.getElementById('tile-fm-calc');
  await page.wait(200);
  page.step('сделка ' + id + ': вид тайла');
  const t = tile();
  page.check(!!t, 'тайл на странице');
  const e = EXPECT[id];
  if (e) {
    page.check(t.getAttribute('data-state') === e.state, 'data-state=' + e.state + ', есть ' + t.getAttribute('data-state'));
    page.check(t.hasAttribute('data-fm-locked') === e.locked, 'data-fm-locked ' + e.locked);
    page.check(t.hasAttribute('data-fm-error') === e.error, 'data-fm-error ' + e.error);
    page.check(t.hasAttribute('data-fm-calculated') === e.calc, 'data-fm-calculated ' + e.calc);
  }
  if (e && e.calc) {
    const done = t.querySelector('[data-fm-done]').textContent;
    const total = t.querySelector('[data-fm-total]').textContent;
    const at = t.querySelector('[data-fm-at]').textContent;
    page.check(/^\d+$/.test(done) && /^\d+$/.test(total), 'N и M вписаны: ' + done + ' из ' + total);
    page.check(/^\d\d\.\d\d\.\d{4}, \d\d:\d\d$/.test(at), 'дата «ДД.ММ.ГГГГ, ЧЧ:ММ»: ' + at);
  }
  if (e) {
    page.step('доступность кнопок по виду и режиму (Л235)');
    const view = t.getAttribute('data-mode') === 'view';
    const on = (sel) => !t.querySelector(sel).disabled;
    const first = '.lc-fin-metrics__start [data-fm-act="CALCULATE"]';
    const recalc = '.lc-fin-metrics__done [data-fm-act="CALCULATE"]';
    const edit = !view && !e.locked;
    page.check(on(first) === (edit && !e.calc), '«Рассчитать» ' + (edit && !e.calc ? 'доступна' : 'disabled'));
    page.check(on(recalc) === (edit && e.calc), '«Пересчет метрик» ' + (edit && e.calc ? 'доступна' : 'disabled'));
    page.check(on('[data-fm-act="FIXATION"]') === (edit && e.calc), '«Фиксация ЭПС/ВБС» ' + (edit && e.calc ? 'доступна' : 'disabled'));
    page.check(on('[data-fm-act="REPORTS"]') === e.calc, '«Отчеты →» ' + (e.calc ? 'доступна' : 'disabled'));
    if (!edit) {
      t.querySelectorAll('[data-fm-act="CALCULATE"]').forEach((b) => b.click());
      await page.wait(50);
      page.check(t.getAttribute('data-state') !== 'updating', 'клик по скрытой кнопке расчёта ничего не запускает');
    }
  }
  if (q.get('fmMode') === 'view') {
    page.check(t.getAttribute('data-mode') === 'view', 'режим просмотра от страницы не перебит тайлом');
  }
  if (q.get('fmCalc') === 'ok') {
    page.step('расчёт');
    await page.click('#tile-fm-calc .lc-fin-metrics__start [data-fm-act="CALCULATE"]');
    await page.wait(50);
    page.check(t.getAttribute('data-state') === 'updating', 'идёт расчёт — updating');
    const btn = t.querySelector('.lc-fin-metrics__start [data-fm-act="CALCULATE"]');
    page.check(btn.disabled && btn.classList.contains('btn--loading') && !!btn.querySelector('.spin.spin--current'), 'лоадер на «Рассчитать», disabled');
    const fix = t.querySelector('[data-fm-act="FIXATION"]');
    page.check(fix.disabled, '«Фиксация ЭПС/ВБС» заблокирована');
    const rep = t.querySelector('button[data-fm-act="REPORTS"]');
    page.check(rep.disabled === true, '«Отчеты →» заблокирована');
    await page.wait(1700);
    page.check(t.getAttribute('data-state') === 'data' && t.hasAttribute('data-fm-calculated'), 'после расчёта — data, рассчитано');
    page.check(btn.disabled && !t.querySelector('.spin'), 'лоадер снят, «Рассчитать» после расчёта недоступна');
    page.check(!t.querySelector('.lc-fin-metrics__done [data-fm-act="CALCULATE"]').disabled, '«Пересчет метрик» доступна');
    page.check(rep.disabled === false, '«Отчеты →» снова доступна');
    const snack = d.querySelector('.snack, .snackbar, [class*="snack"]');
    page.check(!!snack && /Операция выполнена/.test(snack.textContent), 'снек «Операция выполнена»');
  }
};
