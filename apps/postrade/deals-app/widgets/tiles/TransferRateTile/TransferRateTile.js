/* ============================================================
   TransferRateTile.js — ставка тайла «ЕТС» из данных и переход на страницу ЕТС.

   Фрагмент TransferRateTile.html держит эталон всех состояний, а ставка в нём —
   пример. Страница договора показывает ставку своего договора: берёт её из
   LoanAgreementStore.currentRate() и отдаёт сюда. Витрина компонента строит поле
   этой же функцией — разметка поля одна на оба места.

   API:
     PostTileTransferRate.render(tile, view)
       view = { mode: 'edit' | 'view',
                rate: null | { kind: 'FIXED' | 'FLOATING',
                               percent: число | null          — итоговая ставка,
                               baseIndexCode: 'KEY_RATE' | null,
                               spreadPercent: число | null,
                               isCurrent: boolean } }
       rate — то, что отдаёт LoanAgreementStore.currentRate(); null — схем нет.
       Заменяет поле ставки, ставит data-state (data | empty) и data-mode.
       isCurrent === false (схемы на сегодня нет, показана последняя) вид не
       меняет: что показывать в этом случае — не решено (паспорт).
     PostTileTransferRate.rateHTML(rate) → строка — разметка поля ставки
     PostTileTransferRate.stateOf(view) → 'data' | 'empty'
     PostTileTransferRate.formatPercent(n) → '15,5%' | '' — число по-русски:
       запятая, без лишних нулей, не больше двух знаков
     PostTileTransferRate.bind(tile) — повесить переход; render зовёт его сам

   Событие: стрелка «→» в шапке и «Заполнить →» шлют на сам тайл всплывающее
     loanaction { action: 'OPEN_ETS' } — переход на страницу ЕТС делает страница.
     Окна у тайла нет.
   Подписи: тип ставки — window.LOAN_RATE_TYPE_LABELS («Фиксированная» /
     «Плавающая») + слово «ставка»; базовый индекс — window.LOAN_BASE_INDEX_LABELS («КС»).
   ============================================================ */
(function () {
  'use strict';

  var ACTION_OPEN = 'OPEN_ETS';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function isNum(n) {
    return typeof n === 'number' && isFinite(n);
  }

  /* 15 → '15%', 15.5 → '15,5%', 5.25 → '5,25%'; не число → '' */
  function formatPercent(n) {
    if (!isNum(n)) return '';
    return String(Math.round(n * 100) / 100).replace('.', ',') + '%';
  }

  function rateTypeLabel(kind) {
    var labels = window.LOAN_RATE_TYPE_LABELS || {};
    var base = labels[kind] || (kind === 'FLOATING' ? 'Плавающая' : 'Фиксированная');
    return base + ' ставка';
  }

  function baseIndexLabel(code) {
    var labels = window.LOAN_BASE_INDEX_LABELS || {};
    return labels[code] || '';
  }

  /* '+5%' / '−2,5%' — знак спреда пишется всегда */
  function spreadText(n) {
    if (!isNum(n)) return '';
    return (n < 0 ? '−' : '+') + formatPercent(Math.abs(n));
  }

  /* Постфикс плавающей ставки: «КС +5%». Нет спреда — только подпись индекса. */
  function affixText(rate) {
    var parts = [baseIndexLabel(rate.baseIndexCode), spreadText(rate.spreadPercent)];
    return parts.filter(Boolean).join(' ');
  }

  function rateHTML(rate) {
    if (!rate) return '';
    /* Нет значения БИ на дату — итоговой ставки нет: прочерк на месте значения,
       поле с места не уходит (ReadOnlyField 1.010: у прочерка своего цвета нет). */
    var value = formatPercent(rate.percent) || '—';
    var affix = rate.kind === 'FLOATING' ? affixText(rate) : '';
    return '<div class="rof">'
      + '<span class="ds-label ds-label--wrap"><span class="ds-label__text">' + esc(rateTypeLabel(rate.kind)) + '</span></span>'
      + '<div class="rof__row"><span class="rof__value" data-ets-field="percent">' + esc(value) + '</span>'
      + (affix ? '<span class="rof__affix" data-ets-field="affix">' + esc(affix) + '</span>' : '')
      + '</div></div>';
  }

  function stateOf(view) {
    return view && view.rate ? 'data' : 'empty';
  }

  /* Переход: событие на сам тайл, что делать — решает страница. */
  function bind(tile) {
    if (!tile || tile.__transferRate) return;
    tile.__transferRate = true;
    tile.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('[data-loan-act]') : null;
      if (!btn || !tile.contains(btn) || btn.disabled) return;
      tile.dispatchEvent(new CustomEvent('loanaction', {
        bubbles: true,
        detail: { action: btn.getAttribute('data-loan-act') || ACTION_OPEN }
      }));
    });
  }

  function render(tile, view) {
    if (!tile) return;
    view = view || {};
    bind(tile);
    var mode = view.mode === 'edit' ? 'edit' : 'view';
    var grid = tile.querySelector('.lc-transfer-rate-tile__grid:not(.lc-transfer-rate-tile__loading)');
    if (grid) grid.innerHTML = rateHTML(view.rate);
    /* «Заполнить →» выключается разметкой, а не только стилем: без права править
       кнопки нет. Стрелку шапки не трогаем — она есть всегда. */
    Array.prototype.forEach.call(tile.querySelectorAll('.lc-transfer-rate-tile__fill .btn'), function (b) {
      b.disabled = mode !== 'edit';
    });
    tile.setAttribute('data-mode', mode);
    tile.setAttribute('data-state', stateOf(view));
  }

  window.PostTileTransferRate = {
    render: render, rateHTML: rateHTML, stateOf: stateOf, formatPercent: formatPercent, bind: bind
  };

  /* Тайл, стоящий на странице до первого render (загрузка), уже отвечает на клик. */
  function bindAll() {
    Array.prototype.forEach.call(document.querySelectorAll('.lc-transfer-rate-tile'), bind);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bindAll);
  else bindAll();
})();
