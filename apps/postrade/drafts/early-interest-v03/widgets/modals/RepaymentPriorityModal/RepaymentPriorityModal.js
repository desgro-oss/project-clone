/* ============================================================
   RepaymentPriorityModal.js — поведение окна «Приоритет погашения».

   Делает то, чего нет в рантаймах ДС, и только это:
   1) рисует список видов задолженности по приоритету (Entity: надзаголовок
      «Приоритет N», подпись типа, грип);
   2) переставляет строку перетаскиванием за грип — других способов нет;
   3) разводит режимы окна по оси data-mode: edit — грип, «Отменить»
      и «Сохранить»; view — только список и «Закрыть».

   Открытие, фокус, Esc и крестик делают рантаймы ДС. Порядок окно не хранит:
   получает его при открытии, новый отдаёт странице по «Сохранить».

   API:
     PostModalRepaymentOrder.bind(scrim, { labels, save }) → api
       labels()           → { CODE: 'Подпись' } — подписи видов задолженности
       save(order)        — принять новый порядок (коды, первый — приоритет 1)
       api.open(order, mode) — заполнить окно ('edit' | 'view') и открыть
       api.fill(order, mode) — только заполнить (на витрине окно уже на экране)
   ============================================================ */
(function () {
  'use strict';

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  function bind(scrim, opts) {
    if (!scrim) return null;
    if (scrim.__repayOrder) return scrim.__repayOrder;
    opts = opts || {};

    var modal = scrim.querySelector('.modal');
    var list = scrim.querySelector('[data-repay-list]');
    var saveBtn = scrim.querySelector('[data-repay-save]');
    var order = [];

    function labelOf(code) { var l = (opts.labels && opts.labels()) || {}; return l[code] || code; }
    function isInline() { return scrim.classList.contains('modal-scrim--inline'); }

    function rowHTML(code, i) {
      var name = esc(labelOf(code));
      return '<div class="entity entity--s lc-repay-order-modal__row" draggable="true" data-code="' + esc(code) + '">'
        + '<div class="entity__lead"><span class="entity__icon entity__icon--neutral lc-repay-order-modal__num" aria-hidden="true">' + (i + 1) + '</span></div>'
        + '<div class="entity__main"><div class="entity__titles"><div class="entity__labelrow"><span class="entity__label">' + name + '</span></div></div></div>'
        + '<button type="button" class="entity__drag" tabindex="-1" aria-label="Перетащить: ' + name + '"><i data-icon="drag-dots"></i></button>'
        + '</div>';
    }

    function paint() {
      list.innerHTML = order.map(function (c, i) { return rowHTML(c, i); }).join('');
      if (window.dsIcons) window.dsIcons.apply(list);
    }

    /* Перетаскивание строки мышью — как в списке колонок «Настройка таблицы» ДС: линия вставки
       --primary сверху или снизу целевой строки */
    var dragCode = null, dropCode = null, dropBefore = false;
    function clearDrop() {
      list.querySelectorAll('.entity').forEach(function (el) { el.classList.remove('drop-before', 'drop-after'); });
      dropCode = null;
    }
    list.addEventListener('dragstart', function (e) {
      var row = e.target.closest && e.target.closest('.entity');
      if (!row || modal.getAttribute('data-mode') === 'view') { e.preventDefault(); return; }
      dragCode = row.getAttribute('data-code');
      row.classList.add('is-dragging');
      if (e.dataTransfer) { e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', dragCode); } catch (x) { /* без данных */ } }
    });
    list.addEventListener('dragend', function () {
      list.querySelectorAll('.is-dragging').forEach(function (el) { el.classList.remove('is-dragging'); });
      clearDrop();
      dragCode = null;
    });
    list.addEventListener('dragover', function (e) {
      if (dragCode === null) return;
      e.preventDefault();
      var row = e.target.closest('.entity');
      clearDrop();
      if (!row || row.getAttribute('data-code') === dragCode) return;
      var r = row.getBoundingClientRect();
      dropBefore = (e.clientY - r.top) < r.height / 2;
      row.classList.add(dropBefore ? 'drop-before' : 'drop-after');
      dropCode = row.getAttribute('data-code');
    });
    list.addEventListener('dragleave', function (e) { if (!list.contains(e.relatedTarget)) clearDrop(); });
    list.addEventListener('drop', function (e) {
      e.preventDefault();
      var target = dropCode, before = dropBefore, from = dragCode;
      clearDrop();
      dragCode = null;
      if (from === null || target === null) return;
      order.splice(order.indexOf(from), 1);
      order.splice(order.indexOf(target) + (before ? 0 : 1), 0, from);
      paint();
    });

    saveBtn.addEventListener('click', function () {
      if (opts.save) opts.save(order.slice());
      if (!isInline() && window.DSModal) window.DSModal.closeTop();
    });

    function fill(next, mode) {
      order = (next || []).slice();
      modal.setAttribute('data-mode', mode === 'view' ? 'view' : 'edit');
      paint();
    }

    function open(next, mode) {
      fill(next, mode);
      if (window.DSModal) window.DSModal.open(scrim);
    }

    var api = { open: open, fill: fill };
    scrim.__repayOrder = api;
    return api;
  }

  window.PostModalRepaymentOrder = { bind: bind };
})();
