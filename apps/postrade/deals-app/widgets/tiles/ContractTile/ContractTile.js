/* ============================================================
   ContractTile.js — поля тайла «Договор» внутренней страницы «Договор и
   дополнительные соглашения» по типу продукта и действия тайла.

   Словарь полей ОДИН, общий с тайлом «Договор и дополнительные соглашения»:
   data/loan-contract-fields.js (глобалы LOAN_CONTRACT_FIELDS, LOAN_CONTRACT_VARIANTS).
   Файл подключается на странице раньше этого скрипта; скрипт соседнего тайла не нужен.
   Нет словаря — в консоль уходит сообщение, сетка остаётся пустой, тайл не падает.

   API:
     PostTileContract.render(tile, view)
       view = {
         mode: 'edit' | 'view',             режим прав (иное — view)
         variant: <ключ CONTRACT_VARIANTS>, иное — 'loan-ncl'
         data: LoanAgreementStore.get().contract | null,
                                            null — договор не заполнен (empty): поля те же, «—»
         plannedRepaymentDate: ISO | null   плановая дата погашения, готовой от страницы
       }
       Рисует поля типа в обеих сетках (data и empty), ставит data-variant, data-mode
       и data-state ('data' | 'empty'), зовёт syncActions и bind. Полей ДС у тайла нет.
     PostTileContract.bind(tile)        — делегирование событий, один раз на тайл (зовётся из render)
     PostTileContract.syncActions(tile) — привести карандаш шапки к data-mode: в edit
       создать, если его нет; в view убрать из разметки вместе с .tile__actions.
       Читает атрибут корня, поэтому годится и после правки data-mode снаружи (витрина).
       «Документы по сделке» не трогает: она нужна во всех режимах.
     PostTileContract.VARIANTS          — ключи типов и подписи (CONTRACT_VARIANTS общего скрипта)

   События (всплывают от тайла, detail.action):
     loanaction { action: 'DOCS' }  — «Документы по сделке»
   Карандаш открывает окно «Договор» (data-modal="contract-scrim") рантаймом ДС,
   события нет. Что делать по событию, решает страница.
   ============================================================ */
(function () {
  'use strict';

  var ISO = /^(\d{4})-(\d{2})-(\d{2})/;
  var warned = false;

  /* Общий словарь полей: data/loan-contract-fields.js. Нет его — одно сообщение в консоль. */
  function dict() {
    var f = window.LOAN_CONTRACT_FIELDS;
    if (!f && !warned && window.console) {
      warned = true;
      console.error('PostTileContract: нет LOAN_CONTRACT_FIELDS. Подключите data/loan-contract-fields.js раньше ContractTile.js — словарь полей общий.');
    }
    return f || null;
  }

  function variants() {
    return window.LOAN_CONTRACT_VARIANTS || {};
  }

  function variantOf(view) {
    return view && variants()[view.variant] ? view.variant : 'loan-ncl';
  }

  function stateOf(view) {
    return view && view.data ? 'data' : 'empty';
  }

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

  function fieldHTML(label, key, value) {
    return '<div class="rof">'
      + '<span class="ds-label ds-label--wrap"><span class="ds-label__text">' + esc(label) + '</span></span>'
      /* Прочерк — значение, а не подсказка, и своего цвета у него нет (ReadOnlyField 1.010). */
      + '<div class="rof__row"><span class="rof__value" data-contract-field="' + key + '">'
      + (value ? esc(value) : '—') + '</span></div>'
      + '</div>';
  }

  /* Полей ДС у тайла «Договор» нет — только поля типа в порядке словаря */
  function fieldsHTML(view) {
    var d = dict();
    if (!d) return '';
    view = view || {};
    var data = view.data || {};
    return (d[variantOf(view)] || []).map(function (f) {
      var raw = f.planned ? view.plannedRepaymentDate : data[f.key];
      return fieldHTML(f.label, f.key, f.date ? fmtDate(raw) : String(raw == null ? '' : raw).trim());
    }).join('');
  }

  var PENCIL = '<button type="button" class="ibtn ibtn--neutral ibtn--m"'
    + ' aria-label="Редактировать договор" data-modal="contract-scrim" data-modal-guarded>'
    + '<i data-icon="edit"></i></button>';

  /* Недоступное действие убирается из разметки, а не прячется стилем (Л235): в view
     карандаша нет вовсе, в edit он создаётся и привязывается рантаймами ДС. */
  function syncActions(tile) {
    if (!tile) return;
    var edit = tile.getAttribute('data-mode') === 'edit';
    var actions = tile.querySelector('.tile__header > .tile__actions');
    if (!edit) {
      if (actions && actions.parentNode) actions.parentNode.removeChild(actions);
      return;
    }
    if (actions && actions.querySelector('[data-modal="contract-scrim"]')) return;
    var header = tile.querySelector('.tile__header');
    if (!header) return;
    if (!actions) {
      actions = document.createElement('div');
      actions.className = 'tile__actions';
      header.appendChild(actions);
    }
    actions.innerHTML = PENCIL;
    if (window.dsIcons && window.dsIcons.apply) window.dsIcons.apply(actions);
    var btn = actions.querySelector('[data-modal]');
    if (btn && window.DSModal && window.DSModal.bind) window.DSModal.bind(btn);
  }

  /* «Документы по сделке» уходит со страницы: событие на сам тайл, делегированием.
     Привязка один раз на тайл. */
  function bind(tile) {
    if (!tile || tile.__contractBound) return;
    tile.__contractBound = true;
    tile.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('[data-lc-action]') : null;
      if (!btn || !tile.contains(btn) || btn.disabled) return;
      tile.dispatchEvent(new CustomEvent('loanaction', {
        bubbles: true,
        detail: { action: btn.getAttribute('data-lc-action') }
      }));
    });
  }

  function render(tile, view) {
    if (!tile) return;
    view = view || {};
    var html = fieldsHTML(view);
    Array.prototype.forEach.call(tile.querySelectorAll('.lc-contract-tile__grid'), function (g) {
      g.innerHTML = html;
    });
    tile.setAttribute('data-variant', variantOf(view));
    tile.setAttribute('data-mode', view.mode === 'edit' ? 'edit' : 'view');
    tile.setAttribute('data-state', stateOf(view));
    syncActions(tile);
    bind(tile);
  }

  window.PostTileContract = {
    render: render,
    bind: bind,
    syncActions: syncActions,
    get VARIANTS() { return variants(); }
  };
})();
