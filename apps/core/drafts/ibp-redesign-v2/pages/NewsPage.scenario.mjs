// Прогон DOM без браузера: вкладки, выбор новости, адрес, пустая вкладка
// и ссылка источника страницы «Новости».
export default async function (page) {
  const { window, document } = page;
  const rows = () => Array.from(document.querySelectorAll('#news-list [data-news-id]'));
  const selected = () => document.querySelector('#news-list [aria-current="true"]')?.getAttribute('data-news-id');
  const query = () => new URLSearchParams(window.location.search);
  const news = window.MOCK_NEWS;
  if (!page.check(Array.isArray(news) && news.length > 0, 'Новости загружены из data/news.js')) return;

  page.step('Открытие: «Мои клиенты», выбрана первая новость');
  page.check(rows().length === news.filter(n => n.isMyClient).length, 'Лента — новости моих клиентов');
  page.check(selected() === rows()[0]?.getAttribute('data-news-id'), 'Выбрана первая строка');
  page.check(document.querySelector('[data-news-title]')?.textContent === news.find(n => n.newsId === selected())?.title, 'Справа текст выбранной новости');
  page.check(query().get('scope') === 'my' && query().get('id') === selected(), 'Вкладка и новость записаны в адрес');

  page.step('Клик по строке выбирает новость и пишет её в адрес');
  const third = rows()[2];
  third.click();
  await page.wait(0);
  const id = third.getAttribute('data-news-id');
  page.check(selected() === id, 'Выбрана нажатая строка (aria-current)');
  page.check(query().get('id') === id, 'id в адресе');
  const item = news.find(n => n.newsId === id);
  page.check(document.querySelectorAll('[data-news-body] p').length === item.body.length, 'Текст по абзацам');
  const link = document.querySelector('[data-news-link]');
  page.check(link?.getAttribute('href') === item.url && link.getAttribute('target') === '_blank' && /noopener/.test(link.getAttribute('rel') || ''), '«Смотреть источник» — адрес источника в новой вкладке');

  page.step('Вкладки: набор и сохранение выбранной');
  for (const [scope, filter] of [['desk', () => true], ['fav', n => n.isFavorite]]) {
    document.querySelector('[data-news-scope="' + scope + '"]').click();
    await page.wait(0);
    page.check(rows().length === news.filter(filter).length, scope + ': набор вкладки');
    page.check(query().get('scope') === scope, scope + ': вкладка в адресе');
    const kept = news.filter(filter).some(n => n.newsId === id);
    page.check(kept ? selected() === id : selected() === rows()[0]?.getAttribute('data-news-id'), scope + ': выбранная сохранена, если есть во вкладке');
  }

  page.step('Пустая вкладка — EmptyState в обеих панелях');
  const saved = news.map(n => n.isFavorite);
  news.forEach(n => { n.isFavorite = false; });
  document.querySelector('[data-news-scope="my"]').click();
  await page.wait(0);
  document.querySelector('[data-news-scope="fav"]').click();
  await page.wait(0);
  page.check(rows().length === 0 && document.querySelector('[data-news-empty]')?.hidden === false, 'Лента: «Новостей нет»');
  page.check(document.querySelector('[data-news-article]')?.hidden === true && document.querySelector('[data-news-none]')?.hidden === false, 'Справа: «Новость не выбрана»');
  news.forEach((n, i) => { n.isFavorite = saved[i]; });
}
