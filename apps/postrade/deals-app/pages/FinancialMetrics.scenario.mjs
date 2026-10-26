// Сценарий страницы «Финансовые метрики» (RE0033 Э4): вкладки, доступность кнопок шапки (Л235),
// фильтр, пересчёт, события страницы.
// Гонять с --query: id=1024 · 1037 · 1044 · 1026 · 1028 · 1027&fmMode=view · 1044&fmCalc=ok
const EXPECT = {
  '1024': { view: true, locked: false, calc: true, tabs: { IFRS: true, RAS: true, KPI: true } },
  '1027': { view: false, locked: false, calc: true, tabs: { IFRS: true, RAS: true, KPI: true } },
  '1037': { view: false, locked: false, calc: true, tabs: { IFRS: true, RAS: false, KPI: true } },
  '1044': { view: false, locked: false, calc: false, tabs: { IFRS: false, RAS: false, KPI: false } },
  '1026': { view: false, locked: true, calc: false, tabs: { IFRS: false, RAS: false, KPI: false } },
  '1028': { view: false, locked: false, calc: true, tabs: { IFRS: true, RAS: true, KPI: true } }
};
export default async (page) => {
  const d = page.document;
  const w = page.window;
  const q = new URLSearchParams(w.location.search);
  const id = q.get('id');
  const $ = (s) => d.getElementById(s);
  await page.wait(300);
  const e = EXPECT[id];
  const roleView = q.get('fmMode') === 'view';

  page.step('сделка ' + id + ': шапка и крошки');
  page.check(/\.preview\.html$/.test(w.location.pathname), 'открыт собранный файл');
  const crumbs = [...d.querySelectorAll('.crumbs a, .crumbs .crumbs__current')].map((x) => x.textContent.trim());
  page.check(crumbs.length === 4 && crumbs[3] === 'Финансовые метрики', 'крошки: ' + crumbs.join(' / '));
  page.check(/^\d+\. /.test(crumbs[2] || ''), 'третья крошка — «номер. название»: ' + crumbs[2]);
  const back = $('fm-return');
  page.check(/Deal\.preview\.html\?id=/.test(back.getAttribute('href') || ''), '«В сделку» → ' + back.getAttribute('href'));
  const sub = $('fm-subtitle');
  const text = $('fm-subtitle-text').textContent;
  if (e && e.calc) {
    page.check(!sub.hidden && /^Последний расчет: \d\d\.\d\d\.\d{4}, \d\d:\d\d$/.test(text), 'подзаголовок: ' + text);
  } else if (e) {
    page.check(sub.hidden, 'нет расчёта — подзаголовка нет');
  }

  page.step('кнопки шапки по режиму (Л235)');
  const view = (e && e.view) || roleView;
  const fix = $('fm-fixation');
  const calc = $('fm-calc');
  page.check(fix.hidden === view && fix.disabled === view, '«Фиксация ЭПС/ВБС»: hidden=' + fix.hidden + ' disabled=' + fix.disabled + ' (просмотр ' + view + ')');
  const calcOn = !view && !(e && e.locked);
  page.check(calc.hidden === view && calc.disabled === !calcOn, '«Пересчет метрик»: hidden=' + calc.hidden + ' disabled=' + calc.disabled);
  page.check(!$('fm-menu-btn').disabled, 'кебаб доступен');
  page.check(!!$('fm-return').getAttribute('href'), '«В сделку» с href');

  page.step('вкладки и отчёты');
  const tabs = [...d.querySelectorAll('#fm-tabs [data-fm-tab]')];
  page.check(tabs.map((t) => t.textContent.trim().replace(/\s+/g, ' ')).join('|').startsWith('МСФО|РСБУ|KPI|Фиксации ЭПС/ВБС'), 'вкладки: ' + tabs.map((t) => t.textContent.trim()).join('|'));
  const ifrs = $('fm-table-ifrs');
  page.check(ifrs && ifrs.getAttribute('data-report') === 'IFRS', 'МСФО: data-report=' + (ifrs && ifrs.getAttribute('data-report')));
  const ras = $('fm-table-ras');
  page.check(ras && ras.getAttribute('data-report') === 'RAS', 'РСБУ: data-report=' + (ras && ras.getAttribute('data-report')));
  if (e) {
    page.check(ifrs.getAttribute('data-state') === (e.tabs.IFRS ? 'data' : 'empty'), 'МСФО data-state=' + ifrs.getAttribute('data-state'));
    page.check(ras.getAttribute('data-state') === (e.tabs.RAS ? 'data' : 'empty'), 'РСБУ data-state=' + ras.getAttribute('data-state'));
    page.check($('fm-table-kpi').getAttribute('data-state') === (e.tabs.KPI ? 'data' : 'empty'), 'KPI data-state=' + $('fm-table-kpi').getAttribute('data-state'));
  }
  page.check(!$('panel-ifrs').hidden && $('panel-ras').hidden && $('panel-kpi').hidden && $('panel-fixations').hidden, 'открыта только МСФО');
  const badge = $('fm-fixations-badge');
  page.check(badge.hidden === !(badge.textContent.length > 0), 'бейдж фиксаций согласован: «' + badge.textContent + '», hidden=' + badge.hidden);
  page.check(!d.querySelector('#tab-ifrs .tab__badge, #tab-ras .tab__badge, #tab-kpi .tab__badge'), 'у отчётных вкладок бейджа нет');

  page.step('переключение вкладок');
  await page.click('#tab-ras');
  page.check(!$('panel-ras').hidden && $('panel-ifrs').hidden, 'РСБУ открыта, МСФО скрыта');
  await page.click('#tab-kpi');
  page.check(!$('panel-kpi').hidden && $('panel-ras').hidden, 'KPI открыта');
  await page.click('#tab-fixations');
  page.check(!$('panel-fixations').hidden && !!$('panel-fixations').querySelector('.lc-fixation-history-table'), 'Фиксации: открыта история');
  await page.click('#tab-ifrs');

  page.step('действия шапки → fmpageaction');
  const got = [];
  d.addEventListener('fmpageaction', (ev) => got.push(ev.detail && ev.detail.action));
  if (!view && !(e && e.locked) || roleView === false) {
    /* после Э6 «Фиксация ЭПС/ВБС» открывает окно, а не шлёт fmpageaction */
    if (!fix.disabled && !fix.hidden) {
      fix.click(); await page.wait(30);
      page.check(!d.getElementById('fm-fix-scrim').hidden, 'окно фиксации открыто');
      await page.click('#fm-fix-scrim [data-modal-close]');
    }
  }
  if (view) {
    const before = got.length;
    fix.click(); calc.click();
    await page.wait(50);
    page.check(got.length === before && !w.FinMetricsStore.state().busy, 'в просмотре кнопки ничего не запускают');
  }
  const exp = $('fm-export');
  exp.click();
  await page.wait(30);
  page.check(got.indexOf('EXPORT') >= 0, 'EXPORT отправлен');

  if (e && e.tabs.IFRS) {
    page.step('фильтр МСФО');
    const btn = ifrs.querySelector('.tfilter__open');
    page.check(btn && !btn.disabled, '«Фильтр» доступен');
    btn.click();
    await page.wait(100);
    const scrim = $('fm-filter-scrim');
    page.check(scrim && !scrim.hidden, 'окно фильтра открыто');
    const apply = [...scrim.querySelectorAll('.modal__foot .btn')].find((b) => /Применить/.test(b.textContent));
    page.check(!!apply, 'кнопка «Применить» на месте');
    if (apply) {
      // выбрать первый ФИ: опция списка
      const opt = scrim.querySelector('.ddl .ddl__item, .ddl [role="option"], .ddl .ddl__opt');
      if (opt) { opt.click(); await page.wait(50); }
      apply.click();
      await page.wait(100);
      page.check(scrim.hidden, 'окно закрыто');
      const chip = ifrs.querySelector('.tfilter__applied .chip__label');
      page.check(!opt || (chip && /^Применено: \d+$/.test(chip.textContent)), 'чип фильтра: ' + (chip ? chip.textContent : 'нет'));
      if (chip) {
        ifrs.querySelector('.tfilter__applied .chip__remove').click();
        await page.wait(350);
        page.check(!ifrs.querySelector('.tfilter__applied'), 'сброс чипа очищает фильтр вкладки');
      }
    }
  }

  if (q.get('fmCalc') === 'ok' && !view) {
    page.step('пересчёт');
    const hdrBtns = ['fm-fixation', 'fm-menu-btn'];
    await page.click('#fm-calc');
    await page.wait(50);
    page.check(calc.disabled && calc.classList.contains('btn--loading') && calc.getAttribute('aria-busy') === 'true' && !!calc.querySelector('.spin.spin--current'), 'лоадер на «Пересчет метрик», disabled, aria-busy');
    hdrBtns.forEach((b) => page.check($(b).disabled, b + ' disabled во время расчёта'));
    page.check(!$('fm-return').hasAttribute('href') && $('fm-return').getAttribute('aria-disabled') === 'true', '«В сделку» без href, aria-disabled');
    await page.wait(1800);
    page.check(!calc.disabled && !calc.classList.contains('btn--loading') && !calc.querySelector('.spin'), 'лоадер снят, кнопка доступна');
    hdrBtns.forEach((b) => page.check(!$(b).disabled, b + ' снова доступна'));
    page.check(!!$('fm-return').getAttribute('href') && !$('fm-return').hasAttribute('aria-disabled'), '«В сделку» снова со ссылкой');
    page.check(!$('fm-subtitle').hidden, 'подзаголовок «Последний расчет» показан');
    page.check(ifrs.getAttribute('data-state') === 'data', 'МСФО после расчёта — с данными');
    const snack = d.querySelector('.snack');
    page.check(!!snack && /Операция выполнена/.test(snack.textContent), 'снек «Операция выполнена»');
  }
};
