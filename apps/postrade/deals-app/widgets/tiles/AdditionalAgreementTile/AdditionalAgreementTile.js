/* ============================================================
   AdditionalAgreementTile.js — карточка дополнительного соглашения (ДС)
   на странице «Договор и дополнительные соглашения».

   Фрагмент AdditionalAgreementTile.html держит эталон состояний (четыре
   карточки), а карточки страницы рисует эта же функция — разметка одна.
   Свёртку и развёртку ведёт рантайм ДС (Tile.js, DSTile): страница подключает
   его вместе с ds.js. Своего переключателя и своей анимации здесь нет.

   Стор виджет не читает: страница отдаёт готовые значения (номер ДС даёт
   LoanAgreementStore.agreementNumber(a)). Подписи кодов берутся из глобалов
   справочников демо-данных (LOAN_CHANGE_TYPE_LABELS, LOAN_KEY_CHANGE_LABELS,
   LOAN_APPROVAL_LEVEL_LABELS); глобала нет или кода в нём нет — показывается
   код как есть. Запасного словаря нет.

   API:
     PostTileAdditionalAgreement.render(tile, view)
       tile — корень карточки (<section class="tile tile--accordion …">);
       view = {
         mode: 'edit' | 'view',          режим прав (иное — view)
         id: строка,                     id ДС
         number: '4-1234567890',         номер ДС, готовая строка
         signDate: ISO,                  дата подписания
         changeTypeCode, keyChangeCodes[], decisionDate (ISO), decisionNumber,
         approvalLevelCode, comment      поля записи ДС, пустое — прочерк
         collapsed: boolean              свёрнута ли карточка (по умолчанию true)
       }
       Перерисовывает карточку, ставит data-mode и выключает разметкой недоступные
       действия (syncActions).
     PostTileAdditionalAgreement.renderList(container, { mode, items: view[] })
       Рисует стопку карточек (.tile-stack — вертикально, зазор ДС) и привязывает
       аккордеон и события. Безопасно звать повторно: состояние «свёрнута /
       развёрнута» карточки по её id переживает перерисовку (держится в замыкании,
       обновляется по событию tiletoggle). Пока человек карточку не трогал, берётся
       view.collapsed.
     PostTileAdditionalAgreement.cardHTML(view) → строка разметки карточки
     PostTileAdditionalAgreement.bind(el) — делегирование кликов; el — карточка или
       контейнер списка; один раз на элемент, уже зовётся из render / renderList
     PostTileAdditionalAgreement.syncActions(el) — карандаш есть только в edit:
       в просмотре его нет в разметке вовсе; el — карточка или контейнер списка

   События (всплывают от карточки, detail.action):
     loanaction { action: 'EDIT_AGREEMENT', id } — карандаш в шапке (только edit)
   Что делать по событию, решает страница (окно правки ДС). Шеврон события
   loanaction не шлёт: сворачивает рантайм ДС (событие tiletoggle).
   ============================================================ */
(function () {
  'use strict';

  var ROOT = 'lc-additional-agreement-tile';
  var ISO = /^(\d{4})-(\d{2})-(\d{2})/;

  /* id карточки → свёрнута ли (после действий человека); переживает перерисовку */
  var collapsedById = {};
  var rendering = false;

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* ISO 'ГГГГ-ММ-ДД' → 'ДД.ММ.ГГГГ'; иная строка остаётся как есть */
  function fmtDate(v) {
    var s = String(v == null ? '' : v).trim();
    var m = ISO.exec(s);
    return m ? m[3] + '.' + m[2] + '.' + m[1] : s;
  }

  function text(v) { return String(v == null ? '' : v).trim(); }

  /* подпись кода из глобала справочника; нет глобала или кода — код как есть */
  function label(mapName, code) {
    var c = text(code);
    if (!c) return '';
    var map = window[mapName];
    return (map && map[c]) || c;
  }

  function isEdit(view) { return !!view && view.mode === 'edit'; }

  function collapsedOf(view) {
    var id = view && view.id;
    if (id != null && Object.prototype.hasOwnProperty.call(collapsedById, id)) return collapsedById[id];
    return !(view && view.collapsed === false);
  }

  function safeId(id) { return String(id == null ? '' : id).replace(/[^A-Za-z0-9_-]/g, '-'); }

  function fieldHTML(label, key, value, extraClass, valueClass) {
    return '<div class="rof' + (extraClass ? ' ' + extraClass : '') + '">'
      + '<span class="ds-label ds-label--wrap"><span class="ds-label__text">' + esc(label) + '</span></span>'
      /* Прочерк — значение, а не подсказка, и своего цвета у него нет (ReadOnlyField) */
      + '<div class="rof__row"><span class="rof__value' + (valueClass ? ' ' + valueClass : '') + '" data-agreement-field="' + key + '">'
      + (value ? esc(value) : '—') + '</span></div>'
      + '</div>';
  }

  /* ключевые изменения — чипы-теги XS в чиплисте; нет ни одного — прочерк */
  function keyChangesHTML(codes) {
    var items = (codes || []).map(function (c) { return label('LOAN_KEY_CHANGE_LABELS', c); }).filter(Boolean);
    var value = items.length
      ? '<div class="rof__value rof__value--chips" data-agreement-field="keyChanges"><div class="chiplist chiplist--s">'
        + items.map(function (t) { return '<span class="chip chip--xs"><span class="chip__label">' + esc(t) + '</span></span>'; }).join('')
        + '</div></div>'
      : '<span class="rof__value" data-agreement-field="keyChanges">—</span>';
    return '<div class="rof">'
      + '<span class="ds-label ds-label--wrap"><span class="ds-label__text">Ключевые изменения</span></span>'
      + '<div class="rof__row">' + value + '</div>'
      + '</div>';
  }

  function titleOf(view) {
    return '№ ' + (text(view.number) || '—') + ' от ' + (fmtDate(view.signDate) || '—');
  }

  function pencilHTML() {
    return '<button type="button" class="ibtn ibtn--neutral ibtn--m" aria-label="Редактировать соглашение"'
      + ' data-lc-action="EDIT_AGREEMENT"><i data-icon="edit"></i></button>';
  }

  /* внутренность карточки: шапка, поля всегда видимы, комментарий — в сворачиваемой части */
  function innerHTML(view) {
    var collapsed = collapsedOf(view);
    var cid = 'aat-' + safeId(view.id) + '-comment';
    return '<header class="tile__header">'
      + '<div class="tile__header-main"><div class="tile__title-row"><h3 class="tile__title">' + esc(titleOf(view)) + '</h3></div></div>'
      + '<div class="tile__actions">'
      + (isEdit(view) ? pencilHTML() : '')
      + '<button type="button" class="ibtn ibtn--neutral ibtn--m tile__toggle" aria-expanded="' + (collapsed ? 'false' : 'true') + '"'
      + ' aria-controls="' + cid + '" aria-label="' + (collapsed ? 'Развернуть' : 'Свернуть') + '">'
      + '<span class="tile__chevron"><i data-icon="chevron-up"></i></span></button>'
      + '</div></header>'
      + '<div class="tile__body"><div class="tile__grid ' + ROOT + '__grid">'
      + fieldHTML('Тип изменения', 'changeType', label('LOAN_CHANGE_TYPE_LABELS', view.changeTypeCode), '', 'rof__value--clamp-1')
      + fieldHTML('Дата решения', 'decisionDate', fmtDate(view.decisionDate))
      + fieldHTML('Номер решения', 'decisionNumber', text(view.decisionNumber), '', 'rof__value--clamp-1')
      + fieldHTML('Уровень одобрения', 'approvalLevel', label('LOAN_APPROVAL_LEVEL_LABELS', view.approvalLevelCode), '', 'rof__value--clamp-1')
      + keyChangesHTML(view.keyChangeCodes)
      + '</div></div>'
      + '<div class="tile__collapsible" id="' + cid + '"><div class="tile__body"><div class="tile__grid">'
      + fieldHTML('Комментарий', 'comment', text(view.comment), 'tile__grid-full')
      + '</div></div></div>';
  }

  function rootClass(view) {
    return 'tile tile--accordion ' + ROOT + (collapsedOf(view) ? ' tile--collapsed' : '');
  }

  function cardHTML(view) {
    view = view || {};
    return '<section class="' + rootClass(view) + '" data-agreement-id="' + esc(view.id) + '" data-mode="'
      + (isEdit(view) ? 'edit' : 'view') + '">' + innerHTML(view) + '</section>';
  }

  /* Действия, уходящие со страницы: событие на карточку, делегированием — разметка
     перерисовывается, привязка остаётся. Один раз на элемент (карточку или список). */
  function bind(el) {
    if (!el || el.__aatBound) return;
    el.__aatBound = true;
    el.addEventListener('click', function (e) {
      if (e.__aatHandled) return;
      var btn = e.target.closest ? e.target.closest('[data-lc-action]') : null;
      if (!btn || !el.contains(btn) || btn.disabled) return;
      var card = btn.closest('.' + ROOT);
      if (!card) return;
      e.__aatHandled = true;
      card.dispatchEvent(new CustomEvent('loanaction', {
        bubbles: true,
        detail: { action: btn.getAttribute('data-lc-action'), id: card.getAttribute('data-agreement-id') }
      }));
    });
  }

  function cardsOf(el) {
    if (!el) return [];
    if (el.classList && el.classList.contains(ROOT)) return [el];
    return Array.prototype.slice.call(el.querySelectorAll('.' + ROOT));
  }

  /* Карандаш правки — только в edit: в просмотре его нет в разметке вовсе (не просто
     скрыт и не просто disabled). Читает data-mode корня, так что годится и после правки
     атрибута снаружи (витрина). Шеврон есть всегда. */
  function syncActions(el) {
    cardsOf(el).forEach(function (card) {
      var edit = card.getAttribute('data-mode') === 'edit';
      var actions = card.querySelector('.tile__actions');
      if (!actions) return;
      var pencil = actions.querySelector('[data-lc-action="EDIT_AGREEMENT"]');
      if (!edit && pencil) pencil.parentNode.removeChild(pencil);
      if (edit && !pencil) {
        actions.insertAdjacentHTML('afterbegin', pencilHTML());
        if (window.dsIcons && window.dsIcons.apply) window.dsIcons.apply(actions);
      }
    });
  }

  function render(tile, view) {
    if (!tile) return;
    view = view || {};
    var collapsed = collapsedOf(view);
    tile.classList.add('tile', 'tile--accordion', ROOT);
    tile.classList.toggle('tile--collapsed', collapsed);
    tile.setAttribute('data-agreement-id', view.id == null ? '' : view.id);
    tile.setAttribute('data-mode', isEdit(view) ? 'edit' : 'view');
    tile.innerHTML = innerHTML(view);
    rendering = true;
    try {
      if (window.DSTile && window.DSTile.toggle) window.DSTile.toggle(tile, collapsed);
    } finally { rendering = false; }
    syncActions(tile);
    bind(tile);
    if (window.dsIcons && window.dsIcons.apply) window.dsIcons.apply(tile);
  }

  function renderList(container, list) {
    if (!container) return;
    list = list || {};
    var mode = list.mode === 'edit' ? 'edit' : 'view';
    var items = list.items || [];
    container.classList.add('tile-stack');
    container.setAttribute('data-mode', mode);
    rendering = true;
    try {
      container.innerHTML = items.map(function (it) {
        var v = {};
        for (var k in it) if (Object.prototype.hasOwnProperty.call(it, k)) v[k] = it[k];
        v.mode = it.mode || mode;
        return cardHTML(v);
      }).join('');
      if (window.DSTile && window.DSTile.wireAll) window.DSTile.wireAll(container);
    } finally { rendering = false; }
    syncActions(container);
    bind(container);
    if (window.dsIcons && window.dsIcons.apply) window.dsIcons.apply(container);
  }

  /* Запоминаем выбор человека — свёрнута карточка или развёрнута — по её id, и в списке,
     и одиночную: перерисовка по событию стора его не сбрасывает. Свёртку при самой
     отрисовке (rendering) не считаем: её задаёт view. */
  document.addEventListener('tiletoggle', function (e) {
    if (rendering) return;
    var card = e.target && e.target.closest ? e.target.closest('.' + ROOT) : null;
    var id = card && card.getAttribute('data-agreement-id');
    if (id) collapsedById[id] = !!(e.detail && e.detail.collapsed);
  });

  window.PostTileAdditionalAgreement = {
    render: render,
    renderList: renderList,
    cardHTML: cardHTML,
    bind: bind,
    syncActions: syncActions
  };
})();
