/* ============================================================
   V2NewsListTile.js — лента новостей (левая панель NewsPage).

   API: window.LcNewsListTile
     render(host, { items, selectedId, onSelect }) — нарисовать строки:
       items      — NewsRsDto[] (data/news.js) в порядке показа;
       selectedId — newsId выбранной строки (aria-current="true");
       onSelect(item) — клик или Enter/Space по строке.
     Пустой items — пустое состояние EmptyState ДС.
     dateLabel(iso) → «27 августа 2026» — общий формат даты новости.
   ============================================================ */
(function () {
  'use strict';

  var MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  function dateLabel(iso) {
    var p = String(iso || '').split('-');
    return p.length < 3 ? '–' : Number(p[2]) + ' ' + MONTHS[Number(p[1]) - 1] + ' ' + p[0];
  }
  function esc(s) { var d = document.createElement('div'); d.textContent = s == null ? '' : String(s); return d.innerHTML; }

  function render(host, opts) {
    var items = opts.items || [];
    var list = host.querySelector('[data-news-list]');
    host.querySelector('[data-news-empty]').hidden = items.length > 0;
    list.hidden = !items.length;
    list.innerHTML = items.map(function (n) {
      var on = n.newsId === opts.selectedId;
      return '<button type="button" class="lc-v2-news-list-tile__item" data-news-id="' + esc(n.newsId) + '" aria-current="' + on + '">'
        + '<span class="lc-v2-news-list-tile__meta"><time datetime="' + esc(n.publishedAt) + '">' + dateLabel(n.publishedAt) + '</time><span aria-hidden="true">·</span><span class="lc-v2-news-list-tile__source">' + esc(n.sourceDomain) + '</span></span>'
        + '<span class="lc-v2-news-list-tile__title">' + esc(n.title) + '</span>'
        + '<span class="lc-v2-news-list-tile__summary">' + esc(n.summary) + '</span>'
        + '<span class="lc-v2-news-list-tile__client"><i data-icon="building-02" aria-hidden="true"></i><span>' + esc(n.clientName) + '</span></span>'
        + '</button>';
    }).join('');
    if (!list.__lcWired) {
      list.__lcWired = true;
      list.addEventListener('click', function (e) {
        var b = e.target.closest('[data-news-id]');
        if (!b || !list.__lcOnSelect) return;
        var id = b.getAttribute('data-news-id');
        list.__lcOnSelect(list.__lcItems.filter(function (n) { return n.newsId === id; })[0]);
      });
    }
    list.__lcItems = items;
    list.__lcOnSelect = opts.onSelect;
    if (window.dsIcons) window.dsIcons.apply(host);
    if (window.DSIllustrations && !items.length) window.DSIllustrations.render();
  }

  window.LcNewsListTile = { render: render, dateLabel: dateLabel };
})();
