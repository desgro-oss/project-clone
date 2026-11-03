/* ============================================================
   V2EventsListTile.js — лента событий (левая панель EventsPage).

   API: window.LcEventsListTile
     render(host, { items, selectedId, onSelect, embedded }) — нарисовать строки:
       items      — EventRsDto[] (data/events.js) в порядке показа;
       selectedId — eventId выбранной строки (aria-current="true");
       onSelect(item) — клик или Enter/Space по строке.
       embedded   — без Tile-оболочки внутри карточки главной.
     Пустой items — пустое состояние EmptyState ДС.
   Подписи типов, дат и связанных объектов — window.IBPR_EVENTS.
   ============================================================ */
(function () {
  'use strict';

  function esc(s) { var d = document.createElement('div'); d.textContent = s == null ? '' : String(s); return d.innerHTML; }
  var truncatedLabels = null;

  function render(host, opts) {
    var embedded = !!opts.embedded;
    host.classList.toggle('tile', !embedded);
    host.classList.toggle('tile--headless', !embedded);
    host.classList.toggle('lc-v2-events-list-tile--embedded', embedded);
    host.querySelector('.lc-v2-events-list-tile__body').classList.toggle('tile__body', !embedded);
    if (window.DSTooltip) {
      window.DSTooltip.hideAll();
      if (!truncatedLabels) truncatedLabels = window.DSTooltip.truncated('.lc-v2-events-list-tile .entity__label--truncate', { host: '[data-event-id]' });
    }
    var E = window.IBPR_EVENTS;
    var items = opts.items || [];
    var list = host.querySelector('[data-events-list]');
    host.querySelector('[data-events-empty]').hidden = items.length > 0;
    list.hidden = !items.length;
    list.innerHTML = items.map(function (e) {
      var t = E.type(e.typeCode);
      var selected = e.eventId === opts.selectedId;
      return '<div class="entity entity--m entity--interactive lc-v2-events-list-tile__row' + (selected ? ' entity--selected' : '') + '" role="button" tabindex="0" data-event-id="' + esc(e.eventId) + '" aria-current="' + selected + '" aria-pressed="' + selected + '">'
        + '<div class="entity__lead"><span class="entity__icon entity__icon--neutral" aria-hidden="true"><i data-icon="' + t.icon + '"></i></span></div>'
        + '<div class="entity__main"><div class="entity__titles"><p class="entity__header lc-v2-events-list-tile__meta"><time datetime="' + esc(e.occurredAt) + '">' + esc(E.dateLabel(e.occurredAt)) + '</time>'
        + '<span class="chip chip--s chip--' + t.tone + '"><span class="chip__icon" aria-hidden="true"><i data-icon="' + t.icon + '"></i></span><span class="chip__label">' + esc(t.label) + '</span></span></p>'
        + '<div class="entity__labelrow"><span class="entity__label entity__label--truncate" data-tooltip="' + esc(e.title) + '" data-tooltip-truncated="only" data-tooltip-multiline="yes">' + esc(e.title) + '</span></div></div>'
        + (e.field ? '<div class="entity__subs"><span class="entity__subs-list">' + esc(e.field) + ': ' + (e.from ? esc(e.from) + ' → ' : '') + esc(e.to || '') + '</span></div>' : '')
        + '<div class="entity__subs"><span class="entity__subs-list">' + e.entities.map(function (x) { return esc(E.entityLabel(x)); }).join(' · ') + '</span></div>'
        + '</div></div>';
    }).join('');
    if (!list.__lcWired) {
      list.__lcWired = true;
      list.addEventListener('click', function (ev) {
        var b = ev.target.closest('[data-event-id]');
        if (!b || !list.__lcOnSelect) return;
        var id = b.getAttribute('data-event-id');
        list.__lcOnSelect(list.__lcItems.filter(function (e) { return e.eventId === id; })[0]);
      });
      list.addEventListener('keydown', function (ev) {
        if (ev.key !== 'Enter' && ev.key !== ' ') return;
        var row = ev.target.closest('[data-event-id]');
        if (!row) return;
        ev.preventDefault();
        row.click();
      });
    }
    list.__lcItems = items;
    list.__lcOnSelect = opts.onSelect;
    if (window.dsIcons) window.dsIcons.apply(host);
    if (window.DSIllustrations && !items.length) window.DSIllustrations.render();
  }

  window.LcEventsListTile = { render: render };
})();
