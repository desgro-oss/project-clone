/* ============================================================
   V2EventDetailsTile.js — подробности события (правая панель EventsPage).

   API: window.LcEventDetailsTile
     render(host, { item, embedded }) — item: EventRsDto (data/events.js) или null.
       embedded — без Tile-оболочки внутри карточки главной.
       null — пустое состояние «Событие не выбрано».
     «Что изменилось» — ReadOnlyField «Поле», «Было», «Стало» (нет «было» —
     прочерк); «Связано с» — ссылки на страницы проекта, сделки, клиента
     (IBPR_EVENTS.entityHref). Автор 'SYSTEM' — «Система».
   ============================================================ */
(function () {
  'use strict';

  function esc(s) { var d = document.createElement('div'); d.textContent = s == null ? '' : String(s); return d.innerHTML; }
  function rof(label, value) {
    return '<div class="rof"><span class="ds-label"><span class="ds-label__text">' + esc(label) + '</span></span>'
      + '<div class="rof__row"><span class="rof__value">' + esc(value || '–') + '</span></div></div>';
  }

  function render(host, opts) {
    var embedded = !!opts.embedded;
    host.classList.toggle('tile', !embedded);
    host.classList.toggle('tile--headless', !embedded);
    host.classList.toggle('lc-v2-event-details-tile--embedded', embedded);
    host.querySelector('.lc-v2-event-details-tile__body').classList.toggle('tile__body', !embedded);
    var E = window.IBPR_EVENTS;
    var e = opts.item || null;
    host.querySelector('[data-event-article]').hidden = !e;
    host.querySelector('[data-event-none]').hidden = !!e;
    if (!e) { if (window.DSIllustrations) window.DSIllustrations.render(); return; }
    var t = E.type(e.typeCode);
    host.querySelector('[data-event-type]').innerHTML = '<span class="chip chip--s chip--' + t.tone + '"><span class="chip__icon" aria-hidden="true"><i data-icon="' + t.icon + '"></i></span><span class="chip__label">' + esc(t.label) + '</span></span>';
    host.querySelector('[data-event-title]').textContent = e.title;
    var date = host.querySelector('[data-event-date]');
    date.setAttribute('datetime', e.occurredAt);
    date.textContent = E.dateLabel(e.occurredAt);
    host.querySelector('[data-event-author]').textContent = e.authorId === 'SYSTEM' ? 'Система' : ((window.IBPR && window.IBPR.employee(e.authorId)) || {}).fullName || '–';
    host.querySelector('[data-event-change-section]').hidden = !e.field;
    host.querySelector('[data-event-change]').innerHTML = e.field ? rof('Поле', e.field) + rof('Было', e.from) + rof('Стало', e.to) : '';
    host.querySelector('[data-event-links]').innerHTML = e.entities.map(function (x) {
      return '<li><span class="lc-v2-event-details-tile__link-kind">' + esc(E.kindLabel(x.kind)) + '</span>'
        + '<a class="link link--accent link--m" href="' + E.entityHref(x) + '">' + esc(x.kind === 'client' ? x.label : x.id + ' · ' + x.label) + '</a></li>';
    }).join('');
    var body = host.querySelector('.lc-v2-event-details-tile__body');
    if (body) body.scrollTop = 0;
    if (window.dsIcons) window.dsIcons.apply(host);
  }

  window.LcEventDetailsTile = { render: render };
})();
