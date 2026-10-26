// Сценарий страницы сделки — тайл «Заведение сделки» (RE0026): степпер в
// области .ds-scroll, подвал вне её, на каждой вкладке после переключения.
export default async (page) => {
  const d = page.document;
  const tile = () => d.querySelector('.lc-navigator');
  page.step('загрузка: тайл отрисован');
  page.check(tile() && tile().getAttribute('data-state') === 'data', 'тайл Navigator в состоянии data');
  const panels = [...tile().querySelectorAll('.lc-navigator__panel')];
  page.check(panels.length === 4, 'четыре панели вкладок, есть ' + panels.length);
  for (const p of panels) {
    const lane = p.getAttribute('data-nav-lane');
    const ol = p.querySelector('ol.lc-navigator__steps');
    const foot = p.querySelector(':scope > .lc-navigator__foot');
    page.check(!!foot, lane + ': подвал — прямой ребёнок панели');
    if (ol) {
      const sc = ol.parentElement;
      page.check(sc.classList.contains('lc-navigator__scroll') && sc.classList.contains('ds-scroll'),
        lane + ': степпер внутри .lc-navigator__scroll.ds-scroll');
      page.check(sc.parentElement === p, lane + ': область прокрутки — прямой ребёнок панели');
      page.check(!sc.contains(foot), lane + ': подвал вне области прокрутки');
      page.check(sc.nextElementSibling === foot, lane + ': подвал сразу за областью');
    }
  }
  const lanes = ['tsup', 'ops', 'mon', 'deal'];
  for (const lane of lanes) {
    page.step('вкладка ' + lane);
    await page.click('.lc-navigator .tab[data-nav-lane="' + lane + '"]');
    await page.wait(30);
    const vis = [...tile().querySelectorAll('.lc-navigator__panel')].filter(p => !p.hidden);
    page.check(vis.length === 1 && vis[0].getAttribute('data-nav-lane') === lane,
      'видна ровно панель ' + lane + ', видно: ' + vis.map(p => p.getAttribute('data-nav-lane')).join(','));
    const sel = tile().querySelector('.tab[aria-selected="true"]');
    page.check(sel && sel.getAttribute('data-nav-lane') === lane, 'выбрана вкладка ' + lane);
  }
};
