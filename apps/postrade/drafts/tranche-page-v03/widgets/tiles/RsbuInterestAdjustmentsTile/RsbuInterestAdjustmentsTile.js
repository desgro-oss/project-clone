/* ============================================================
   RsbuInterestAdjustmentsTile.js — вид тайла «Корректировки процентов РСБУ».

   API:
     PostTileRsbuAdjustments.render(tile, opts)
       opts.state  — 'locked' | 'none' | 'filled' — вид по данным; раскладывается
                     на оси корня: locked → data-calc="required",
                     none → data-state="empty", filled → data-state="data"
       opts.mode   — 'edit' | 'view' (data-mode, по умолчанию edit): в view
                     нет кнопки «Внести корректировку»
       opts.count  — число внесённых корректировок (для filled)
       opts.unallocated — { amount, currencyCode, date } | null: расхождение, которое не устранено (RE0034);
                     есть — Alert-слот между шапкой и телом «Расхождение с ДД.ММ.ГГГГ: <сумма> <валюта>»
       opts.query  — строка адреса '?id=…&tr=…', которую страница передаёт
                     на страницу корректировок (необязательно)
   ============================================================ */
(function () {
  'use strict';

  var STATES = ['locked', 'none', 'filled'];

  function money(n) {
    var p = Number(n).toFixed(2).split('.');
    return p[0].replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0') + ',' + p[1];
  }

  /* Недоступная ссылка выключается разметкой, а не только стилем (урок Л235): без href, aria-disabled, вне порядка табуляции */
  function setLink(a, on, href) {
    if (on) { a.setAttribute('href', href); a.removeAttribute('aria-disabled'); a.removeAttribute('tabindex'); }
    else { a.removeAttribute('href'); a.setAttribute('aria-disabled', 'true'); a.setAttribute('tabindex', '-1'); }
  }

  function render(tile, opts) {
    if (!tile) return;
    opts = opts || {};
    var st = STATES.indexOf(opts.state) >= 0 ? opts.state : 'none';
    var q = opts.query || '';
    tile.setAttribute('data-calc', st === 'locked' ? 'required' : 'done');
    if (st !== 'locked') tile.setAttribute('data-state', st === 'filled' ? 'data' : 'empty');
    tile.setAttribute('data-mode', opts.mode === 'view' ? 'view' : 'edit');
    var count = tile.querySelector('[data-rsbu-count]');
    if (count) count.textContent = opts.count == null ? '' : String(opts.count);
    /* страница корректировок вшивает окно меткой ds-include — по двойному клику её открывают собранной */
    var page = /\.preview\.html$/.test(window.location.pathname) ? 'RsbuInterestAdjustments.preview.html' : 'RsbuInterestAdjustments.html';
    var locked = st === 'locked';
    var open = tile.querySelector('.lc-rsbu-adj__open');
    if (open) setLink(open, !locked, page + q);
    var un = opts.unallocated || null;
    var mark = tile.querySelector('.tile__alert');
    if (mark) {
      mark.hidden = !un || st === 'locked';
      var amount = tile.querySelector('[data-rsbu-unalloc]');
      if (amount) amount.textContent = un ? money(un.amount) + ' ' + un.currencyCode : '';
      var since = tile.querySelector('[data-rsbu-unalloc-date]');
      if (since) since.textContent = un && un.date ? un.date.slice(8, 10) + '.' + un.date.slice(5, 7) + '.' + un.date.slice(0, 4) : '';
    }
    var add = tile.querySelector('.lc-rsbu-adj__add');
    if (add) setLink(add, !locked && opts.mode !== 'view', page + (q ? q + '&' : '?') + 'open=add');
  }

  window.PostTileRsbuAdjustments = { render: render };
})();
