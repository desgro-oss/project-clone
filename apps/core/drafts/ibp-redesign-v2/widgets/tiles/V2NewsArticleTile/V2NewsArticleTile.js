/* ============================================================
   V2NewsArticleTile.js — текст выбранной новости (правая панель NewsPage).

   API: window.LcNewsArticleTile
     render(host, { item }) — item: NewsRsDto (data/news.js) или null.
       null — пустое состояние «Новость не выбрана».
     «Смотреть источник» — ссылка item.url в новой вкладке; в демо это
     главная страница домена, не сама статья (решение пользователя 27.10.2026).
     Дата — LcNewsListTile.dateLabel (тот же формат, что в ленте).
   ============================================================ */
(function () {
  'use strict';

  function esc(s) { var d = document.createElement('div'); d.textContent = s == null ? '' : String(s); return d.innerHTML; }

  function render(host, opts) {
    var n = opts.item || null;
    host.querySelector('[data-news-article]').hidden = !n;
    host.querySelector('[data-news-none]').hidden = !!n;
    if (!n) { if (window.DSIllustrations) window.DSIllustrations.render(); return; }
    host.querySelector('[data-news-title]').textContent = n.title;
    var date = host.querySelector('[data-news-date]');
    date.setAttribute('datetime', n.publishedAt);
    date.textContent = window.LcNewsListTile ? window.LcNewsListTile.dateLabel(n.publishedAt) : n.publishedAt;
    host.querySelector('[data-news-source]').textContent = n.sourceDomain;
    host.querySelector('[data-news-body]').innerHTML = (n.body || [n.summary]).map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('');
    var link = host.querySelector('[data-news-link]');
    link.href = n.url;
    link.setAttribute('aria-label', 'Смотреть источник: ' + n.sourceDomain + ' (откроется в новой вкладке)');
    var body = host.querySelector('.lc-v2-news-article-tile__body');
    if (body) body.scrollTop = 0;
    if (window.dsIcons) window.dsIcons.apply(host);
  }

  window.LcNewsArticleTile = { render: render };
})();
