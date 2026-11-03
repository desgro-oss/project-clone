/* ============================================================
   TrancheLoanLimitsTile.js — значения тайла «Валюта транша».

   Фрагмент держит пример значений; страница транша отдаёт свои через render:
   валюта и общая сумма лимита ТРАНША (data/tranche-data.js, window.MOCK_TRANCHE;
   правки окна живут в сессии страницы). Витрина строит поля этой же функцией —
   разметка полей одна на оба места.

   API:
     PostTileTrancheLoanLimits.fieldsHTML(data) → строка
       data — { currencyCode, totalLimitAmount } или null. Два поля в
       постоянном порядке: «Валюта» (код) и «Общая сумма лимита» («1 000 000,00»
       с неразрывным пробелом) с аффиксом валюты. Пустое значение — прочерк,
       поле с места не уходит.
     PostTileTrancheLoanLimits.formatAmount(n) → '1 000 000,00' | ''
     PostTileTrancheLoanLimits.render(tile, view)
       view = { mode: 'edit' | 'view', data }
       mode ставит data-mode; в просмотре карандаш выключается разметкой
       (disabled), CSS его прячет. Окно открывает рантайм ДС по data-modal.
   ============================================================ */
(function () {
  'use strict';

  /* Неразрывный пробел — escape-последовательностью, а не литералом: литерал
     невидим и легко превращается в обычный пробел при правке (§8). */
  var NBSP = '\u00a0';

  /* Порядок полей — порядок отображения (паспорт, «Поля») */
  var FIELDS = [
    { key: 'currencyCode', label: 'Валюта', affix: false },
    { key: 'totalLimitAmount', label: 'Общая сумма лимита', affix: true }
  ];

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function has(v) { return v !== null && v !== undefined && String(v).trim() !== ''; }

  /* 1000000 → «1 000 000,00», разряды — неразрывным пробелом */
  function formatAmount(n) {
    if (!has(n)) return '';
    var x = Number(n);
    if (!isFinite(x)) return '';
    var parts = x.toFixed(2).split('.');
    return parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, NBSP) + ',' + parts[1];
  }

  function textOf(data, key) {
    if (!data || !has(data[key])) return '';
    return key === 'totalLimitAmount' ? formatAmount(data[key]) : String(data[key]).trim();
  }

  function fieldsHTML(data) {
    var currency = data && has(data.currencyCode) ? String(data.currencyCode).trim() : '';
    return FIELDS.map(function (f) {
      var v = textOf(data, f.key);
      var affix = f.affix
        ? '<span class="rof__affix" data-tl-affix="currencyCode">' + esc(currency) + '</span>'
        : '';
      /* Прочерк — значение, а не подсказка, и своего цвета у него нет
         (ReadOnlyField 1.010). */
      return '<div class="rof">'
        + '<span class="ds-label ds-label--wrap"><span class="ds-label__text">' + f.label + '</span></span>'
        + '<div class="rof__row"><span class="rof__value" data-tl-field="' + f.key + '">'
        + (v ? esc(v) : '—') + '</span>' + affix + '</div>'
        + '</div>';
    }).join('');
  }

  function render(tile, view) {
    if (!tile) return;
    view = view || {};
    var grid = tile.querySelector('.lc-tranche-loan-limits-tile__grid');
    if (grid) grid.innerHTML = fieldsHTML(view.data);
    var mode = view.mode === 'edit' ? 'edit' : 'view';
    /* Недоступное действие выключается разметкой, а не только стилем
       (урок Л235). */
    Array.prototype.forEach.call(tile.querySelectorAll('[data-modal]'), function (b) {
      b.disabled = mode !== 'edit';
    });
    tile.setAttribute('data-mode', mode);
  }

  window.PostTileTrancheLoanLimits = {
    fieldsHTML: fieldsHTML,
    formatAmount: formatAmount,
    render: render
  };
})();
