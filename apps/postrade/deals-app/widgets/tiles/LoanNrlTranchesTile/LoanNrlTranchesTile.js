/* ============================================================
   LoanNrlTranchesTile.js — строки тайла «Транши» страницы договора займа (НКЛ).

   Фрагмент LoanNrlTranchesTile.html держит эталон всех состояний, а строки в нём —
   пример с макета. Страница договора собирает список траншей своего договора из
   LoanAgreementStore.tranches() (узлы дерева продуктов) и отдаёт сюда. Витрина компонента
   рисует строки этой же функцией — разметка строки одна на оба места. Дата и сумма
   форматируются здесь, при выводе.

   API:
     PostTileLoanNrlTranches.rowsHTML(tranches, opts) → строка
       tranches — [{ id, number, name, repaid, repaidAt, dateISO, amount, currencyCode }]:
         number — «1.1.1.1.», name — «Транш»; repaid — транш погашен, repaidAt — дата
         погашения 'ГГГГ-ММ-ДД' (строка статуса «Дата фактического погашения …» с зелёным чеком);
         canRemove — необязательное, по умолчанию true: false выключает «Удалить»
         (страница берёт значение из ProductTreeStore.canRemove);
         dateISO — 'ГГГГ-ММ-ДД' или null (дата подписания договора);
         amount — число или null (сумма лимита); currencyCode — код валюты ('RUB').
       opts.mode — 'edit' | 'view'. В просмотре у строк нет слота действий (меню ⋮ не в
       разметке); заголовок-ссылка остаётся ссылкой. У погашенного транша вместо «Погасить» —
       «Отменить погашение»; при canRemove: false «Удалить» выключен (aria-disabled), и событие
       DELETE_TRANCHE не уходит.
     PostTileLoanNrlTranches.stateOf(tranches) → 'empty' | 'partial' | 'data'
       Нет траншей — empty; у какого-то нет даты или суммы — partial; иначе data.
     PostTileLoanNrlTranches.render(tile, view, opts)
       view — { mode: 'edit' | 'view', tranches: [...] }. Перерисовывает список и ставит
       data-mode и data-state; opts.state — явное состояние ('loading'). Скрывает слот
       шапки и выключает кнопки добавления, когда правки нет.

   События — loanaction, всплывающее, с корня тайла: detail = { action, id }.
     ADD_TRANCHE                 — «Добавить транш» (в шапке и в пустом тайле); id нет
     OPEN_TRANCHE { id }         — заголовок строки: страница транша
     REPAY_TRANCHE { id }        — пункт «Погасить»: окно погашения
     UNDO_REPAY_TRANCHE { id }   — пункт «Отменить погашение»: то же окно в режиме отмены
     DELETE_TRANCHE { id }       — пункт «Удалить»: окно подтверждения
   Сам транш тайл не добавляет, не гасит и не удаляет: это делает страница через
   ProductTreeStore и окна дерева продуктов, после чего перерисовывает тайл.
   ============================================================ */
(function () {
  'use strict';

  var ROOT = '.lc-loan-nrl-tranches-tile';
  var LIST = '.lc-loan-nrl-tranches-tile__list';
  var NBSP = ' ';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* '2024-04-22' → «22.04.2024» */
  function fmtDate(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '');
    return m ? m[3] + '.' + m[2] + '.' + m[1] : '';
  }

  /* 800000 → «800 000,00», разряды — неразрывным пробелом */
  function fmtAmount(n) {
    if (n == null || n === '' || !isFinite(Number(n))) return '';
    var parts = Number(n).toFixed(2).split('.');
    return parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, NBSP) + ',' + parts[1];
  }

  /* Подписи значений — те же, что в строках «Продуктов сделки» */
  function label(field, fallback) {
    var map = window.PRODUCT_DETAIL_LABELS || {};
    return map[field] || fallback;
  }

  function menuId(id) { return 'lntr-m-' + String(id).replace(/[^A-Za-z0-9_-]/g, '-'); }

  function actAttrs(action, id) {
    return ' data-lntr-act="' + action + '"' + (id == null ? '' : ' data-lntr-id="' + esc(id) + '"');
  }

  /* ── Строка ─────────────────────────────────────────────────────── */

  function titleHTML(t) {
    return '<a class="prow__title prow__title--link" href="#"' + actAttrs('OPEN_TRANCHE', t.id) + '>'
      + esc(String(t.number || '') + ' ' + String(t.name || '')).replace(/^\s+|\s+$/g, '') + '</a>';
  }

  /* Пустое значение — «–», пара значений не скрывается (ProductRow) */
  function metaHTML(t) {
    var date = fmtDate(t.dateISO);
    var amount = fmtAmount(t.amount);
    var amountText = amount
      ? esc(amount) + (t.currencyCode ? ' <span class="prow__meta-affix">' + esc(t.currencyCode) + '</span>' : '')
      : '–';
    return '<div class="prow__meta">'
      + '<span class="prow__meta-item" data-tooltip="' + esc(label('signedAt', 'Дата подписания договора')) + '">'
      + '<i data-icon="calendar"></i><span class="prow__meta-text">' + (date ? esc(date) : '–') + '</span></span>'
      + '<span class="prow__meta-item" data-tooltip="' + esc(label('limitAmount', 'Сумма лимита')) + '">'
      + '<i data-icon="bar-chart-square"></i><span class="prow__meta-text">' + amountText + '</span></span>'
      + '</div>';
  }

  function menuItemHTML(action, id, text, disabled) {
    return '<button type="button" class="menu__item" role="menuitem"'
      + (disabled ? ' aria-disabled="true"' : '') + actAttrs(action, id) + '>'
      + '<span class="menu__item-label">' + text + '</span></button>';
  }

  /* Статус погашенного транша — как в «Продуктах сделки»: зелёный чек и «Дата фактического погашения …» */
  function statusHTML(t) {
    if (!t.repaid) return '';
    var date = fmtDate(t.repaidAt);
    return '<div class="prow__status prow__status--success"><i data-icon="check-circle-filled"></i>'
      + '<span class="prow__status-text">' + esc(label('repaidAt', 'Дата фактического погашения') + (date ? ' ' + date : '')) + '</span></div>';
  }

  /* Меню ⋮, как в дереве продуктов: «Погасить» (у погашенного — «Отменить погашение») и «Удалить».
     «Удалить» выключен (aria-disabled, как в дереве продуктов), когда транш удалить нельзя —
     canRemove === false (например, он прикреплён к ФИ): общий диалог такой запрос отклонил бы молча */
  function actionsHTML(t) {
    var mid = menuId(t.id);
    var items = (t.repaid ? menuItemHTML('UNDO_REPAY_TRANCHE', t.id, 'Отменить погашение') : menuItemHTML('REPAY_TRANCHE', t.id, 'Погасить'))
      + menuItemHTML('DELETE_TRANCHE', t.id, 'Удалить', t.canRemove === false);
    return '<div class="prow__actions"><span class="menu-anchor">'
      + '<button type="button" class="ibtn ibtn--neutral ibtn--l" aria-label="Действия" data-menu="' + mid
      + '" data-menu-align="end"><i data-icon="more-dots"></i></button>'
      + '<div id="' + mid + '" class="menu menu--floating" role="menu" hidden>' + items + '</div></span></div>';
  }

  function rowHTML(t, edit) {
    return '<li class="prow-tree__node" data-lntr-id="' + esc(t.id) + '"><div class="prow">'
      + '<div class="prow__main"><div class="prow__head">' + titleHTML(t) + '</div>' + statusHTML(t) + metaHTML(t) + '</div>'
      + (edit ? actionsHTML(t) : '') + '</div></li>';
  }

  /* Список строк — группа детей корня (зазор 8px, без отступа): обёртка одного узла без
     своей строки, как в дереве «Продуктов сделки» */
  function rowsHTML(tranches, opts) {
    var edit = !opts || opts.mode !== 'view';
    return '<ul class="prow-tree"><li class="prow-tree__node"><ul class="prow-tree__group">'
      + (tranches || []).map(function (t) { return rowHTML(t, edit); }).join('')
      + '</ul></li></ul>';
  }

  function stateOf(tranches) {
    if (!tranches || !tranches.length) return 'empty';
    var partial = tranches.some(function (t) { return !fmtDate(t.dateISO) || !fmtAmount(t.amount); });
    return partial ? 'partial' : 'data';
  }

  /* ── Отрисовка ──────────────────────────────────────────────────── */

  function render(tile, view, opts) {
    if (!tile) return;
    opts = opts || {};
    view = view || {};
    var mode = (view.mode || tile.getAttribute('data-mode')) === 'view' ? 'view' : 'edit';
    var edit = mode === 'edit';
    var tranches = view.tranches || [];
    var state = opts.state || stateOf(tranches);

    /* меню открытой строки и тултип под курсором уходят вместе со старым списком */
    if (window.DSMenu) window.DSMenu.closeAll();
    if (window.DSTooltip) window.DSTooltip.hideAll();

    var list = tile.querySelector(LIST);
    if (list) list.innerHTML = rowsHTML(tranches, { mode: mode });

    tile.setAttribute('data-mode', mode);
    tile.setAttribute('data-state', state);

    /* Недоступное действие выключается разметкой, а не только стилем: в просмотре слот
       шапки скрыт, кнопки добавления выключены. Кнопка шапки есть, пока транши есть. */
    var actions = tile.querySelector('.tile__actions');
    if (actions) actions.hidden = !edit || state === 'loading' || state === 'empty';
    Array.prototype.forEach.call(tile.querySelectorAll('[data-lntr-act="ADD_TRANCHE"]'), function (b) {
      b.disabled = !edit;
    });

    if (window.dsIcons) window.dsIcons.apply(tile);
    if (window.DSMenu) window.DSMenu.bindAll(tile);
    if (window.DSTooltip) window.DSTooltip.bindAll(tile);
  }

  /* ── Действия ───────────────────────────────────────────────────── */

  function emit(tile, action, id) {
    var detail = { action: action };
    if (id != null) detail.id = id;
    tile.dispatchEvent(new CustomEvent('loanaction', { bubbles: true, detail: detail }));
  }

  /* Один слушатель на документ. Кнопки строк и шапки лежат в тайле, а пункты меню
     открытой строки рантайм держит в общем слое DSFloat, вне тайла: их тайл восстанавливается
     по кнопке-триггеру меню, а не по цели клика (урок Л88). */
  function ownerOf(el) {
    var menu = el.closest('.menu');
    if (menu && menu.id) {
      var trigger = document.querySelector('[data-menu="' + menu.id + '"]');
      return trigger ? trigger.closest(ROOT) : null;
    }
    return el.closest(ROOT);
  }

  document.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('[data-lntr-act]');
    if (!el) return;
    /* ссылка на страницу транша: куда идти — знает страница */
    if (el.tagName === 'A') e.preventDefault();
    if (el.disabled || el.getAttribute('aria-disabled') === 'true') return;
    var tile = ownerOf(el);
    if (!tile) return;
    emit(tile, el.getAttribute('data-lntr-act'), el.getAttribute('data-lntr-id'));
  });

  window.PostTileLoanNrlTranches = { rowsHTML: rowsHTML, stateOf: stateOf, render: render };
})();
