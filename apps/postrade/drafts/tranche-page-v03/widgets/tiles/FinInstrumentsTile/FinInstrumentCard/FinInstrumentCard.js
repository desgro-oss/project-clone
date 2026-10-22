/* ============================================================
   FinInstrumentCard.js — карточка финансового инструмента (ФИ) из данных.
   Подчасть тайла «Финансовые инструменты» (FinInstrumentsTile): тайл
   рисует ею свой список, витрина — страницу карточки.

   Фрагмент FinInstrumentCard.html держит эталон в <template>, а карточки
   по данным рисует эта функция: состав полей зависит от типа ФИ и от
   заполненности, через метку ds-include его не передать.

   Правила предметной области (поля по типу ФИ, производные значения из
   дерева продуктов, погашение) живут в сторе — data/fin-instruments-store.js.
   Здесь только отрисовка карточки по FinInstrumentCardView.

   API:
     PostCardFinInstrument.html(card, opts) → строка
       card — FinInstrumentCardView; opts.mode — 'edit' | 'view';
       opts.open — карточка развёрнута. В просмотре у карточки нет меню,
       «+ Добавить» и ⇄ у инструментов. На корне — data-state
       (empty | data) и data-mode.
     PostCardFinInstrument.stateOf(card) → 'empty' | 'data'

   Ошибки у карточки нет: состояние «Ошибка» макета снято — в системе его
   не бывает (решение человека 17.10.2026, задача RE0028).

   Кнопки с data-fi-act (OPEN — «→», EDIT — пункт «Изменить» меню) карточка
   не обрабатывает: их отдаёт событием fiaction тайл, в котором она стоит.
   «+ Добавить», ⇄ у инструмента и ссылка у кодов RWA нарисованы по
   макету и пока ничего не делают (паспорт, «Открытые вопросы»).
   ============================================================ */
(function () {
  'use strict';

  var DATE_FIELDS = { signedAt: 1 };

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* id карточки — в атрибуте меню: только буквы, цифры, «-» и «_» */
  function menuId(id) { return 'fi-m-' + String(id).replace(/[^A-Za-z0-9_-]/g, '-'); }

  function fmtDate(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '');
    return m ? m[3] + '.' + m[2] + '.' + m[1] : '';
  }

  /* 800000 → «800 000,00», разряды — неразрывным пробелом */
  function fmtAmount(n) {
    var parts = Number(n).toFixed(2).split('.');
    return parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ',' + parts[1];
  }

  /* 17.03 → «17,03» */
  function fmtNumber(n) {
    return String(n).replace('.', ',');
  }

  function detailLabel(field) {
    var map = window.PRODUCT_DETAIL_LABELS || {};
    return map[field] || '';
  }

  function has(v) { return v !== null && v !== undefined && v !== ''; }

  /* ── Поле ───────────────────────────────────────────────────────── */

  function rofHTML(label, value, cls, affix) {
    var empty = !has(value);
    return '<div class="rof' + (cls ? ' ' + cls : '') + '">'
      + '<span class="ds-label"><span class="ds-label__text">' + esc(label) + '</span></span>'
      + '<div class="rof__row"><span class="rof__value rof__value--clamp-1">' + (empty ? '—' : esc(value)) + '</span>'
      + (affix && !empty ? '<span class="rof__affix">' + esc(affix) + '</span>' : '') + '</div></div>';
  }

  function riskHTML(risk) {
    if (!risk) return '';
    var a = ' data-risk="' + esc(risk.rating) + '"';
    if (risk.zone) a += ' data-zone="' + esc(risk.zone) + '"';
    if (risk.ratingDate) a += ' data-rating-date="' + esc(risk.ratingDate) + '"';
    if (risk.zoneDate) a += ' data-zone-date="' + esc(risk.zoneDate) + '"';
    if (risk.segment) a += ' data-segment="' + esc(risk.segment) + '"';
    if (risk.profile) a += ' data-profile="' + esc(risk.profile) + '"';
    return '<span data-riskmetric' + a + '></span>';
  }

  /* Контрагент — на всю ширину сетки, две строки с усечением, риск-метрика
     справа. */
  function partyHTML(label, party) {
    return '<div class="rof tile__grid-full lc-fin-card__party">'
      + '<span class="ds-label"><span class="ds-label__text">' + esc(label) + '</span></span>'
      + '<div class="rof__row rof__row--top"><span class="rof__value rof__value--clamp-n">' + (party ? esc(party.name) : '—') + '</span>'
      + (party ? riskHTML(party.risk) : '') + '</div></div>';
  }

  function flagHTML(text) {
    return '<div class="rof__row"><span class="rof__icon"><i data-icon="check"></i></span>'
      + '<span class="rof__value">' + esc(text) + '</span></div>';
  }

  function rwaHTML(codes) {
    return '<div class="rof tile__grid-full">'
      + '<span class="ds-label"><span class="ds-label__text">Код для RWA</span></span>'
      + '<div class="rof__row"><div class="rof__value rof__value--chips"><div class="chiplist chiplist--s">'
      + codes.map(function (c) { return '<span class="chip chip--s chip--grey"><span class="chip__label">' + esc(c) + '</span></span>'; }).join('')
      + '</div></div>'
      /* куда ведёт ссылка — не решено (02.10.2026) */
      + '<span class="rof__icon rof__icon--interactive" role="button" tabindex="0" aria-label="Коды для RWA"><i data-icon="link-external"></i></span>'
      + '</div></div>';
  }

  /* ── Инструменты карточки ───────────────────────────────────────── */

  /* Текст о фактическом погашении — один на сабхедер карточки и строку узла. */
  function repaidText(iso) {
    return detailLabel('repaidAt') + (has(iso) ? ' ' + fmtDate(iso) : '');
  }

  /* Сабхедер шапки карточки: у погашенной карточки — строка о фактической
     дате погашения, та же, что у прикреплённого узла, слотом Tile Subtitle
     (иконка check-circle-filled, тон success). */
  function subtitleHTML(c) {
    if (!c.isRepaid) return '';
    return '<p class="tile__subtitle"><span class="tile__subtitle-icon tile__subtitle-icon--success">'
      + '<i data-icon="check-circle-filled"></i></span>' + esc(repaidText(c.repaidAt)) + '</p>';
  }

  function metaItemHTML(d) {
    var date = DATE_FIELDS[d.field] === 1;
    var text;
    if (d.value == null || d.value === '') text = '–';
    else if (date) text = esc(fmtDate(d.value));
    else text = esc(fmtAmount(d.value)) + (d.currency ? ' <span class="prow__meta-affix">' + esc(d.currency) + '</span>' : '');
    return '<span class="prow__meta-item" data-tooltip="' + esc(detailLabel(d.field)) + '">'
      + '<i data-icon="' + (date ? 'calendar' : 'bar-chart-square') + '"></i>'
      + '<span class="prow__meta-text">' + text + '</span></span>';
  }

  function nodeHTML(n, edit) {
    var status = n.repaidAt
      ? '<div class="prow__status prow__status--success"><i data-icon="check-circle-filled"></i>'
        + '<span class="prow__status-text">' + esc(repaidText(n.repaidAt)) + '</span></div>'
      : '';
    var meta = (n.details || []).length
      ? '<div class="prow__meta">' + n.details.map(metaItemHTML).join('') + '</div>' : '';
    var acts = '';
    if (n.isIfrsOption) {
      acts += '<button type="button" class="ibtn ibtn--neutral ibtn--l" aria-label="Опцион включенный в расчет МСФО"'
        + ' data-tooltip="Опцион включенный в расчет МСФО" data-tooltip-multiline="yes"><i data-icon="info-circle"></i></button>';
    }
    /* ⇄ у инструмента в карточке — что делает, не решено (02.10.2026) */
    if (edit) acts += '<button type="button" class="ibtn ibtn--neutral ibtn--l lc-fin-card__move" aria-label="Перенести"><i data-icon="arrow-left-right"></i></button>';
    return '<div class="prow" data-fi-node="' + esc(n.id) + '"><div class="prow__main">'
      + '<div class="prow__head"><span class="prow__title">' + esc(n.number + ' ' + n.name) + '</span></div>'
      + status + meta + '</div>'
      + (acts ? '<div class="prow__actions">' + acts + '</div>' : '') + '</div>';
  }

  /* ── Карточка ───────────────────────────────────────────────────── */

  function menuHTML(c) {
    var id = menuId(c.id);
    return '<span class="menu-anchor"><button type="button" class="ibtn ibtn--neutral ibtn--m" aria-label="Действия"'
      + ' data-menu="' + id + '" data-menu-align="end"><i data-icon="more-dots"></i></button>'
      + '<div id="' + id + '" class="menu menu--floating" role="menu" hidden>'
      + '<button type="button" class="menu__item" role="menuitem" data-fi-act="EDIT" data-fi-id="' + esc(c.id) + '">'
      + '<span class="menu__item-label">Изменить</span></button></div></span>';
  }

  function headHTML(c, edit, open) {
    var pe = c.isTypeC
      ? '<span class="tile__title-add"><span class="chip chip--s chip--fit lc-fin-card__pe"><span class="chip__label">Требуется переоценка</span></span></span>' : '';
    return '<header class="tile__header"><div class="tile__header-main">'
      + '<div class="tile__title-row"><h4 class="tile__title">' + esc(c.name) + '</h4>' + pe + '</div>'
      + subtitleHTML(c) + '</div>'
      + '<div class="tile__actions">'
      /* переход на страницу ФИ — событие 'fiaction' OPEN, навигацию делает страница */
      + '<button type="button" class="ibtn ibtn--neutral ibtn--m" aria-label="Открыть финансовый инструмент" data-fi-act="OPEN" data-fi-id="' + esc(c.id) + '"><i data-icon="arrow-right"></i></button>'
      + (edit ? menuHTML(c) : '')
      + '<button type="button" class="ibtn ibtn--neutral ibtn--m tile__toggle" aria-expanded="' + open + '" aria-label="' + (open ? 'Свернуть' : 'Развернуть') + '">'
      + '<span class="tile__chevron"><i data-icon="chevron-up"></i></span></button>'
      + '</div></header>';
  }

  /* Значения сетки: баланс, тип отчётности, валюта, FV/AC (+ целевой IRR у
     акций), ниже — сумма, дата подписания, плановая дата погашения. */
  function fieldsHTML(c) {
    var irr = c.typeCode === 'SHARES';
    return rofHTML('Баланс', c.balance)
      + rofHTML('Тип отчетности', c.reportingLabel)
      + rofHTML('Валюта', c.currency)
      + rofHTML('FV/AC', c.fvAcLabel)
      + (irr ? rofHTML('Целевой IRR', has(c.targetIrr) ? fmtNumber(c.targetIrr) : null, null, '%') : '')
      + rofHTML(c.amountLabel, has(c.amount) ? fmtAmount(c.amount) : null, 'lc-fin-card__amount')
      + rofHTML('Дата подписания', fmtDate(c.signedAt), 'lc-fin-card__signed')
      + rofHTML('Плановая дата погашения', fmtDate(c.plannedMaturityAt), 'lc-fin-card__planned');
  }

  /* Свёрнутая часть: заполненные контрагенты резервирования и аллокации,
     признаки, коды для RWA — пустые не показываются (макет «Не заполнено»). */
  function moreHTML(c) {
    var s = '';
    if (c.reserveCounterparty) s += partyHTML('Контрагент для целей резервирования', c.reserveCounterparty);
    if (c.allocationCounterparty) s += partyHTML('Контрагент для аллокации финансового результата', c.allocationCounterparty);
    var flags = '';
    if (c.isDkkk) flags += flagHTML('Участие ДККК');
    if (c.hasLinkedUnconditionalOption) flags += flagHTML('Связанный безусловный опцион');
    if (flags) s += '<div class="lc-fin-card__flags">' + flags + '</div>';
    if ((c.rwaCodes || []).length) s += rwaHTML(c.rwaCodes);
    /* своя сетка в одну колонку: поля остаются внутри .tile__grid */
    return s ? '<div class="tile__collapsible tile__grid-full"><div class="tile__grid">' + s + '</div></div>' : '';
  }

  function nodesHTML(c, edit) {
    var count = (c.nodes || []).length;
    var head = '<div class="tile__grid-full lc-fin-card__nodes-head">'
      + '<h5 class="lc-fin-card__nodes-title">Инструменты</h5>'
      + (count ? '<span class="badge badge--s badge--neutral" aria-label="Инструментов: ' + count + '">' + count + '</span>' : '')
      /* «+ Добавить» — что делает, не решено (02.10.2026) */
      + (edit ? '<button type="button" class="btn btn--outline btn--xs lc-fin-card__add-node"><i data-icon="add"></i><span class="btn__label">Добавить</span></button>' : '')
      + '</div>';
    var list = count
      ? '<div class="tile__collapsible tile__grid-full lc-fin-card__nodes">' + c.nodes.map(function (n) { return nodeHTML(n, edit); }).join('') + '</div>'
      : '<div class="tile__collapsible tile__grid-full"><p class="lc-fin-card__no-nodes">Нет связанных инструментов</p></div>';
    return head + list;
  }

  /* Состояние карточки — колонки макета «Card-Fininstrument»: empty — не
     заполнена: ни узлов, ни контрагента, ни FV/AC, ни баланса («Тип
     отчетности» задан при создании); иначе data — заполнена, прочерки на
     месте пустых значений. */
  function stateOf(c) {
    var filled = (c.nodes || []).length || c.counterparty || has(c.fvAcLabel) || has(c.balance);
    return filled ? 'data' : 'empty';
  }

  function cardHTML(c, opts) {
    opts = opts || {};
    var edit = opts.mode !== 'view';
    var open = opts.open === true;
    return '<article class="tile tile--card tile--accordion lc-fin-card' + (open ? '' : ' tile--collapsed') + '" data-fi-id="' + esc(c.id) + '"'
      + ' data-state="' + stateOf(c) + '" data-mode="' + (edit ? 'edit' : 'view') + '">'
      + headHTML(c, edit, open)
      + '<div class="tile__body"><div class="tile__grid lc-fin-card__grid' + (c.typeCode === 'SHARES' ? ' lc-fin-card__grid--irr' : '') + '">'
      + fieldsHTML(c) + partyHTML('Контрагент', c.counterparty) + moreHTML(c) + nodesHTML(c, edit)
      + '</div></div></article>';
  }

  window.PostCardFinInstrument = { html: cardHTML, stateOf: stateOf };
})();
