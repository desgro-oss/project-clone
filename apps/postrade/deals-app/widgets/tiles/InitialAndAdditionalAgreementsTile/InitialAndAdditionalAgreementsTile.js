/* ============================================================
   InitialAndAdditionalAgreementsTile.js — поля тайла «Договор и дополнительные
   соглашения» по типу продукта и действия тайла.

   Фрагмент InitialAndAdditionalAgreementsTile.html держит эталон всех
   состояний, а поля в нём — пример. Страница договора показывает поля своего
   договора: берёт запись из LoanAgreementStore и отдаёт сюда. Витрина строит
   тайл этой же функцией — разметка полей одна на оба места.

   API:
     PostTileInitialAndAdditionalAgreements.render(tile, view)
       view = {
         mode: 'edit' | 'view',            режим прав (иное — view)
         variant: <тип>,                   см. VARIANTS; иное — 'loan-ncl'
         data: LoanAgreementStore.get().contract | null,
                                           null — договор не заполнен (empty)
         plannedRepaymentDate: ISO | null  плановая дата погашения: берётся
                                           готовой (у НКЛ — самая поздняя среди
                                           траншей), в тайле не вводится
         lastAgreement: ДС | null,         последнее ДС; есть — к полям добавляются
                                           номер и дата подписания ДС
         lastAgreementNumber: строка | null  '<порядковый>-<номер договора>'
         loading: boolean                  true — состояние loading
       }
       Рисует поля типа в сетке, ставит data-variant, data-mode и data-state и
       выключает разметкой недоступные действия (syncActions).
       data содержит поля договора по ключам VARIANTS; у типов с полями сверх
       «Номера» и «Даты подписания» (Акции/Доли, Опционы/РЕПО, Обеспечения,
       Гарантия) значения таких полей лежат в той же data (см. паспорт:
       источник этих значений не решён).
     PostTileInitialAndAdditionalAgreements.fieldsHTML(view) → строка
     PostTileInitialAndAdditionalAgreements.stateOf(view) → 'loading' | 'data' | 'empty'
     PostTileInitialAndAdditionalAgreements.VARIANTS — ключи типов и их подписи
     PostTileInitialAndAdditionalAgreements.CONTRACT_VARIANTS — типы тайла «Договор»
       внутренней страницы (ContractTile)
     PostTileInitialAndAdditionalAgreements.FIELDS — поля договора по типам: тот же
       словарь, что берёт ContractTile (data/loan-contract-fields.js, глобал
       LOAN_CONTRACT_FIELDS); словарь общий, а скрипт тайла другому тайлу не нужен
     PostTileInitialAndAdditionalAgreements.bind(tile) — уже зовётся из render
     PostTileInitialAndAdditionalAgreements.syncActions(tile) — выключить (disabled)
       недоступные действия по data-mode и data-state; уже зовётся из render

   События (всплывают от тайла, detail.action):
     loanaction { action: 'DOCS' }           — «Документы по сделке»
     loanaction { action: 'OPEN_CONTRACT' }  — стрелка «→» в шапке
   «Заполнить» открывает окно «Договор» (data-modal="contract-scrim") —
   рантаймом ДС, события нет. Что делать по событиям, решает страница.
   ============================================================ */
(function () {
  'use strict';

  /* Состав полей по типам — общий словарь data/loan-contract-fields.js (key — ключ в
     view.data, плановая дата — view.plannedRepaymentDate; label — подпись как на макете,
     date — значение датой ДД.ММ.ГГГГ). Скрипт страницы подключается раньше этого. Нет
     словаря — в консоль уходит сообщение, сетка остаётся пустой, тайл не падает. */
  var FIELDS = window.LOAN_CONTRACT_FIELDS || {};
  var VARIANTS = window.LOAN_CONTRACT_TILE_VARIANTS || {};
  var CONTRACT_VARIANTS = window.LOAN_CONTRACT_VARIANTS || {};
  if (!window.LOAN_CONTRACT_FIELDS && window.console) {
    console.error('PostTileInitialAndAdditionalAgreements: нет LOAN_CONTRACT_FIELDS. Подключите data/loan-contract-fields.js раньше скрипта тайла.');
  }

  var ISO = /^(\d{4})-(\d{2})-(\d{2})/;

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

  function variantOf(view) {
    return view && FIELDS[view.variant] ? view.variant : 'loan-ncl';
  }

  function stateOf(view) {
    if (view && view.loading) return 'loading';
    return view && view.data ? 'data' : 'empty';
  }

  function fieldHTML(label, key, value, extraClass) {
    return '<div class="rof' + (extraClass ? ' ' + extraClass : '') + '">'
      + '<span class="ds-label ds-label--wrap"><span class="ds-label__text">' + esc(label) + '</span></span>'
      /* Прочерк — значение, а не подсказка, и своего цвета у него нет
         (ReadOnlyField 1.010). */
      + '<div class="rof__row"><span class="rof__value" data-contract-field="' + key + '">'
      + (value ? esc(value) : '—') + '</span></div>'
      + '</div>';
  }

  function fieldsHTML(view) {
    view = view || {};
    var data = view.data || {};
    var html = (FIELDS[variantOf(view)] || []).map(function (f) {
      var raw = f.planned ? view.plannedRepaymentDate : data[f.key];
      return fieldHTML(f.label, f.key, f.date ? fmtDate(raw) : String(raw == null ? '' : raw).trim());
    }).join('');
    var last = view.lastAgreement;
    if (last) {
      /* Номер ДС — '<порядковый>-<номер договора>' даёт стор; нет номера договора —
         стор отдаёт один порядковый номер, нет и его — прочерк. */
      var num = view.lastAgreementNumber || (last.seqNumber != null ? String(last.seqNumber) : '');
      html += fieldHTML('Номер последнего ДС', 'lastAgreementNumber', num,
        'lc-initial-and-additional-agreements-tile__agreement-first')
        + fieldHTML('Дата подписания ДС', 'lastAgreementSignDate', fmtDate(last.signDate));
    }
    return html;
  }

  /* Действия, уходящие со страницы: событие на сам тайл, делегированием — разметка
     полей перерисовывается, кнопки остаются. Привязка один раз на тайл. */
  function bind(tile) {
    if (!tile || tile.__iaaBound) return;
    tile.__iaaBound = true;
    tile.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('[data-lc-action]') : null;
      if (!btn || !tile.contains(btn) || btn.disabled) return;
      tile.dispatchEvent(new CustomEvent('loanaction', {
        bubbles: true,
        detail: { action: btn.getAttribute('data-lc-action') }
      }));
    });
  }

  /* Недоступное действие выключается разметкой, а не только стилем: кнопки блока
     «Заполнить» (сама «Заполнить» и «Документы по сделке» рядом) — только в edit,
     стрелка «→» — только при заполненном договоре. «Документы по сделке» в блоке
     данных не трогаем: в просмотре с данными она нужна. Читает атрибуты корня, так что
     годится и после правки data-mode / data-state снаружи (витрина). */
  function syncActions(tile) {
    if (!tile) return;
    var edit = tile.getAttribute('data-mode') === 'edit';
    var data = tile.getAttribute('data-state') === 'data';
    Array.prototype.forEach.call(tile.querySelectorAll('.lc-initial-and-additional-agreements-tile__fill button'), function (b) {
      b.disabled = !edit;
    });
    Array.prototype.forEach.call(tile.querySelectorAll('[data-lc-action="OPEN_CONTRACT"]'), function (b) {
      b.disabled = !data;
    });
  }

  function render(tile, view) {
    if (!tile) return;
    view = view || {};
    var grid = tile.querySelector('.lc-initial-and-additional-agreements-tile__content .lc-initial-and-additional-agreements-tile__grid');
    if (grid) grid.innerHTML = fieldsHTML(view);
    tile.setAttribute('data-variant', variantOf(view));
    tile.setAttribute('data-mode', view.mode === 'edit' ? 'edit' : 'view');
    tile.setAttribute('data-state', stateOf(view));
    syncActions(tile);
    bind(tile);
  }

  window.PostTileInitialAndAdditionalAgreements = {
    render: render,
    bind: bind,
    syncActions: syncActions,
    fieldsHTML: fieldsHTML,
    stateOf: stateOf,
    VARIANTS: VARIANTS,
    CONTRACT_VARIANTS: CONTRACT_VARIANTS,
    FIELDS: FIELDS
  };
})();
