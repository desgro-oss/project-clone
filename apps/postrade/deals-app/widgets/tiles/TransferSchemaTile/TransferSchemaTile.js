/* ============================================================
   TransferSchemaTile.js — карточка процентной схемы ЕТС на странице
   «Единая трансфертная ставка».

   Фрагмент TransferSchemaTile.html держит эталон (четыре карточки), а карточки
   страницы рисует эта же функция — разметка одна.

   Стор виджет не читает: страница отдаёт записи схем как они лежат в
   LoanAgreementStore.schemes(). Подпись базового индекса берётся из глобала
   LOAN_BASE_INDEX_LABELS демо-данных (KEY_RATE → «КС»); глобала нет или кода в
   нём нет — показывается код как есть. Запасного словаря нет.

   «Ставка» в карточке — формула схемы, а не расчёт на сегодня: фиксированная —
   «4%», плавающая — «КС+2%». Числа по-русски: запятая, без лишних нулей («7,5%»).

   API:
     PostTileTransferSchema.render(card, view)
       card — корень карточки (<section class="tile …">);
       view = запись схемы + режим: {
         mode: 'edit' | 'view',          режим прав (иное — view)
         id, startDate (ISO), endDate (ISO),
         baseIndexLagWorkDays (число), comment (строка | null),
         rateTypeCode ('FIXED' | 'FLOATING'), fixedRatePercent,
         baseIndexCode ('KEY_RATE'), spreadPercent
       }
       Перерисовывает карточку и ставит data-mode.
     PostTileTransferSchema.renderList(root, { mode, items })
       Рисует стопку карточек (.tile-stack) из items — записей схем в порядке
       страницы. Безопасно звать повторно: открытое меню закрывается до перерисовки.
     PostTileTransferSchema.cardHTML(view) → строка разметки карточки
     PostTileTransferSchema.syncActions(el) — меню ⋮ есть только в edit: в
       просмотре его нет в разметке вовсе; el — карточка или контейнер списка

   Режим 'view': ни ⋮, ни меню в разметку не попадают (не прячутся стилем).
   Режим 'edit': ⋮ с пунктами «Изменить» и «Удалить».

   События (всплывают от карточки):
     loanaction { action: 'EDIT_SCHEME' | 'REMOVE_SCHEME', id } — пункты меню ⋮
   Что делать по событию (окно «Процентная схема», подтверждение удаления),
   решает страница: она слушает loanaction на контейнере списка.

   Меню ⋮ рантайм ДС (DSMenu) при открытии выносит в общий слой DSFloat, вне
   карточки, поэтому клики ловит один слушатель на документе, а владелец
   карточки восстанавливается по кнопке-триггеру меню, а не по цели клика.
   ============================================================ */
(function () {
  'use strict';

  var ROOT = 'lc-transfer-schema-tile';
  var ISO = /^(\d{4})-(\d{2})-(\d{2})/;
  var DASH = '—';          /* длинное тире: прочерк и граница периода */
  var seq = 0;                  /* уникальность id меню при нескольких отрисовках */

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function text(v) { return String(v == null ? '' : v).trim(); }

  /* ISO 'ГГГГ-ММ-ДД' → 'ДД.ММ.ГГГГ'; иная строка остаётся как есть */
  function fmtDate(v) {
    var s = text(v);
    var m = ISO.exec(s);
    return m ? m[3] + '.' + m[2] + '.' + m[1] : s;
  }

  /* число по-русски: запятая, без лишних нулей; не число — пустая строка */
  function fmtNumber(v) {
    if (v == null || v === '' || isNaN(Number(v))) return '';
    return String(Math.round(Number(v) * 100) / 100).replace('.', ',');
  }

  function isEdit(view) { return !!view && view.mode === 'edit'; }

  /* подпись базового индекса из глобала справочника; нет глобала или кода — код как есть */
  function baseIndexLabel(code) {
    var c = text(code);
    if (!c) return '';
    var map = window.LOAN_BASE_INDEX_LABELS;
    return (map && map[c]) || c;
  }

  /* Формула ставки: фиксированная — «4%», плавающая — «КС+2%». Нет значений — пусто (прочерк). */
  function rateText(view) {
    if (view.rateTypeCode === 'FIXED') {
      var fixed = fmtNumber(view.fixedRatePercent);
      return fixed ? fixed + '%' : '';
    }
    if (view.rateTypeCode === 'FLOATING') {
      var base = baseIndexLabel(view.baseIndexCode);
      var spread = fmtNumber(view.spreadPercent);
      if (!base) return '';
      if (!spread) return base;
      /* отрицательный спред: знак минус вместо «+-» */
      return base + (Number(view.spreadPercent) < 0 ? '−' + fmtNumber(Math.abs(view.spreadPercent)) : '+' + spread) + '%';
    }
    return '';
  }

  function periodText(view) {
    var from = fmtDate(view.startDate);
    var to = fmtDate(view.endDate);
    if (!from && !to) return DASH;
    return (from || DASH) + DASH + (to || DASH);
  }

  function lagText(view) {
    var n = view.baseIndexLagWorkDays;
    return n == null || n === '' ? '' : String(n);
  }

  function fieldHTML(label, key, value, extraClass, valueClass) {
    return '<div class="rof' + (extraClass ? ' ' + extraClass : '') + '">'
      + '<span class="ds-label ds-label--wrap"><span class="ds-label__text">' + esc(label) + '</span></span>'
      /* Прочерк — значение, а не подсказка, и своего цвета у него нет (ReadOnlyField) */
      + '<div class="rof__row"><span class="rof__value' + (valueClass ? ' ' + valueClass : '') + '" data-scheme-field="' + key + '">'
      + (value ? esc(value) : DASH) + '</span></div>'
      + '</div>';
  }

  function menuItemHTML(action, label) {
    return '<button type="button" class="menu__item" role="menuitem" data-lc-action="' + action + '">'
      + '<span class="menu__item-label">' + label + '</span></button>';
  }

  /* ⋮ с меню на карточку: только в edit */
  function actionsHTML(id) {
    var mid = 'lts-m-' + String(id == null ? '' : id).replace(/[^A-Za-z0-9_-]/g, '-') + '-' + (++seq);
    return '<div class="tile__actions"><span class="menu-anchor">'
      + '<button type="button" class="ibtn ibtn--neutral ibtn--m" aria-label="Действия со схемой" data-menu="' + mid
      + '" data-menu-align="end"><i data-icon="more-dots"></i></button>'
      + '<div id="' + mid + '" class="menu menu--floating" role="menu" hidden>'
      + menuItemHTML('EDIT_SCHEME', 'Изменить')
      + menuItemHTML('REMOVE_SCHEME', 'Удалить')
      + '</div></span></div>';
  }

  /* внутренность карточки: шапка с периодом и три поля */
  function innerHTML(view) {
    return '<header class="tile__header">'
      + '<div class="tile__header-main"><div class="tile__title-row"><h3 class="tile__title" data-scheme-field="period">'
      + esc(periodText(view)) + '</h3></div></div>'
      + (isEdit(view) ? actionsHTML(view.id) : '')
      + '</header>'
      + '<div class="tile__body"><div class="tile__grid ' + ROOT + '__grid">'
      + fieldHTML('Рабочих дней до применения БИ', 'baseIndexLagWorkDays', lagText(view))
      + fieldHTML('Ставка', 'rate', rateText(view))
      + fieldHTML('Комментарий', 'comment', text(view.comment), ROOT + '__comment', 'rof__value--clamp-1')
      + '</div></div>';
  }

  function cardHTML(view) {
    view = view || {};
    return '<section class="tile ' + ROOT + '" data-scheme-id="' + esc(view.id) + '" data-mode="'
      + (isEdit(view) ? 'edit' : 'view') + '">' + innerHTML(view) + '</section>';
  }

  function cardsOf(el) {
    if (!el) return [];
    if (el.classList && el.classList.contains(ROOT)) return [el];
    return Array.prototype.slice.call(el.querySelectorAll('.' + ROOT));
  }

  function rebind(scope) {
    if (window.dsIcons && window.dsIcons.apply) window.dsIcons.apply(scope);
    if (window.DSMenu && window.DSMenu.bindAll) window.DSMenu.bindAll(scope);
  }

  /* Открытое меню уходит до перерисовки: его узел стоит в общем слое DSFloat */
  function closeMenus() {
    if (window.DSMenu && window.DSMenu.closeAll) window.DSMenu.closeAll();
  }

  /* ⋮ — только в edit: в просмотре его нет в разметке вовсе (не просто скрыт и не
     просто disabled). Читает data-mode корня, так что годится и после правки
     атрибута снаружи (витрина). */
  function syncActions(el) {
    var touched = false;
    cardsOf(el).forEach(function (card) {
      var edit = card.getAttribute('data-mode') === 'edit';
      var actions = card.querySelector('.tile__actions');
      if (!edit && actions) {
        closeMenus();
        actions.parentNode.removeChild(actions);
      }
      if (edit && !actions) {
        var header = card.querySelector('.tile__header');
        if (!header) return;
        header.insertAdjacentHTML('beforeend', actionsHTML(card.getAttribute('data-scheme-id')));
        touched = true;
      }
    });
    if (touched) rebind(el);
  }

  function render(card, view) {
    if (!card) return;
    view = view || {};
    closeMenus();
    card.classList.add('tile', ROOT);
    card.setAttribute('data-scheme-id', view.id == null ? '' : view.id);
    card.setAttribute('data-mode', isEdit(view) ? 'edit' : 'view');
    card.innerHTML = innerHTML(view);
    rebind(card);
  }

  function renderList(root, list) {
    if (!root) return;
    list = list || {};
    var mode = list.mode === 'edit' ? 'edit' : 'view';
    var items = list.items || [];
    closeMenus();
    root.classList.add('tile-stack');
    root.setAttribute('data-mode', mode);
    root.innerHTML = items.map(function (it) {
      var v = {};
      for (var k in it) if (Object.prototype.hasOwnProperty.call(it, k)) v[k] = it[k];
      v.mode = it.mode || mode;
      return cardHTML(v);
    }).join('');
    rebind(root);
  }

  /* Владелец пункта меню: пункт лежит в карточке (до открытия) или в общем слое
     DSFloat (открытое меню) — во втором случае карточку даёт кнопка-триггер (урок Л88). */
  function ownerOf(el) {
    var menu = el.closest('.menu');
    if (menu && menu.id) {
      var trigger = document.querySelector('[data-menu="' + menu.id + '"]');
      if (trigger) return trigger.closest('.' + ROOT);
    }
    return el.closest('.' + ROOT);
  }

  document.addEventListener('click', function (e) {
    var el = e.target && e.target.closest ? e.target.closest('[data-lc-action]') : null;
    if (!el || el.disabled || el.getAttribute('aria-disabled') === 'true') return;
    var card = ownerOf(el);
    if (!card) return;
    card.dispatchEvent(new CustomEvent('loanaction', {
      bubbles: true,
      detail: { action: el.getAttribute('data-lc-action'), id: card.getAttribute('data-scheme-id') }
    }));
  });

  window.PostTileTransferSchema = {
    render: render,
    renderList: renderList,
    cardHTML: cardHTML,
    syncActions: syncActions
  };
})();
