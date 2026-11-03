/* ============================================================
   BalanceAndCurrencyTile.js — значения тайла «Баланс и валюта» из данных.

   Фрагмент BalanceAndCurrencyTile.html держит эталон всех состояний, а значения
   в нём — пример с макета. Страница договора показывает значения своего
   договора: берёт раздел balanceCurrency записи (LoanAgreementStore.get()) и
   отдаёт сюда. Витрина компонента строит поля этой же функцией — разметка полей
   одна на оба места.

   API:
     PostTileBalanceAndCurrency.fieldsHTML(data) → строка
       data — { balanceCode, currencyCode, totalLimitAmount } или null.
       Три поля в постоянном порядке: «Баланс», «Валюта» (две колонки) и
       «Общая сумма лимита» (на всю ширину); пустое значение — прочерк, поле с
       места не уходит. Баланс — подпись из window.LOAN_BALANCE_LABELS (нет
       подписи — сам код); валюта — код; сумма — «1 234,00» с неразрывным
       пробелом, без валюты (как на макете).
     PostTileBalanceAndCurrency.stateOf(data) → 'data' | 'partial' | 'empty'
       null или все значения пусты — empty, часть — partial, все есть — data.
     PostTileBalanceAndCurrency.formatAmount(n) → '123 456 789,00' | ''
     PostTileBalanceAndCurrency.render(tile, view)
       view = { mode: 'edit' | 'view', data, state? }
       mode — режим прав (data-mode); data — раздел balanceCurrency записи
       договора или null. state: 'loading' — перекрывает состояние по данным
       (загрузка). Заменяет поля в сетке, ставит data-state и data-mode; в
       просмотре выключает разметкой (disabled) кнопки, открывающие окно, —
       карандаш шапки и «Заполнить». Событий loanaction у тайла нет: окно
       открывает рантайм ДС по data-modal="bal-scrim".
   ============================================================ */
(function () {
  'use strict';

  /* Порядок полей — порядок отображения (паспорт, «Поля») */
  var FIELDS = [
    { key: 'balanceCode', label: 'Баланс', full: false },
    { key: 'currencyCode', label: 'Валюта', full: false },
    { key: 'totalLimitAmount', label: 'Общая сумма лимита', full: true }
  ];

  var NBSP = ' ';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function has(v) { return v !== null && v !== undefined && String(v).trim() !== ''; }

  /* 123456789 → «123 456 789,00», разряды — неразрывным пробелом */
  function formatAmount(n) {
    if (!has(n)) return '';
    var x = Number(n);
    if (!isFinite(x)) return '';
    var parts = x.toFixed(2).split('.');
    return parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, NBSP) + ',' + parts[1];
  }

  function balanceLabel(code) {
    var map = window.LOAN_BALANCE_LABELS || {};
    return map[code] || code;
  }

  function textOf(data, key) {
    if (!data || !has(data[key])) return '';
    if (key === 'balanceCode') return balanceLabel(data[key]);
    if (key === 'totalLimitAmount') return formatAmount(data[key]);
    return String(data[key]).trim();
  }

  function fieldsHTML(data) {
    return FIELDS.map(function (f) {
      var v = textOf(data, f.key);
      return '<div class="rof' + (f.full ? ' tile__grid-full' : '') + '">'
        + '<span class="ds-label ds-label--wrap"><span class="ds-label__text">' + f.label + '</span></span>'
        /* Прочерк — значение, а не подсказка, и своего цвета у него нет
           (ReadOnlyField 1.010). */
        + '<div class="rof__row"><span class="rof__value" data-bal-field="' + f.key + '">'
        + (v ? esc(v) : '—') + '</span></div>'
        + '</div>';
    }).join('');
  }

  function stateOf(data) {
    var filled = FIELDS.filter(function (f) { return data && has(data[f.key]); }).length;
    if (!filled) return 'empty';
    return filled === FIELDS.length ? 'data' : 'partial';
  }

  function render(tile, view) {
    if (!tile) return;
    view = view || {};
    var grid = tile.querySelector('.lc-balance-currency__grid:not(.lc-balance-currency__loading)');
    if (grid) grid.innerHTML = fieldsHTML(view.data);
    var mode = view.mode === 'edit' ? 'edit' : 'view';
    var state = view.state === 'loading' ? 'loading' : stateOf(view.data);
    /* Недоступное действие выключается разметкой, а не только стилем: в
       просмотре карандаш и «Заполнить» — disabled, даже когда по состоянию
       не показываются (урок Л235). */
    Array.prototype.forEach.call(tile.querySelectorAll('[data-modal]'), function (b) {
      b.disabled = mode !== 'edit';
    });
    tile.setAttribute('data-state', state);
    tile.setAttribute('data-mode', mode);
  }

  window.PostTileBalanceAndCurrency = {
    fieldsHTML: fieldsHTML,
    stateOf: stateOf,
    formatAmount: formatAmount,
    render: render
  };
})();
