/* ============================================================
   TrancheNrlSummaryTile.js — значения хедлесс-тайла «Сводка НКЛ» из данных.
   Раздел «НКЛ» страницы транша показывает параметры РОДИТЕЛЬСКОГО договора
   займа (НКЛ), не транша (решение человека 02.11.2026): страница берёт их из
   LoanAgreementStore (counterparty(), get().balanceCurrency) и отдаёт сюда.

   Один фрагмент — три варианта; какой показывать, ставит страница: сборщик
   переносит с метки ds-include только id, class, state, mode (образец —
   PostTileKNR.setVariant, CounterpartiesTile.js). Витрина строит значения
   этими же функциями — разметка одна на оба места.

   API:
     PostTileTrancheNrlSummary.VARIANTS → ['counterparty', 'balance', 'limit']
     PostTileTrancheNrlSummary.setVariant(tile, variant) → boolean
       Только вариант (data-variant на корне), без данных: counterparty —
       «Контрагент», balance — «Баланс и валюта», limit — «Общая сумма лимита».
       Неизвестное значение — атрибут не меняется, false.
     PostTileTrancheNrlSummary.balanceLabel(code) → строка
       Подпись кода баланса из window.LOAN_BALANCE_LABELS
       (mock-loan-agreements.js); нет подписи — сам код. Как в
       BalanceAndCurrencyTile.
     PostTileTrancheNrlSummary.formatAmount(n) → '123 456 789,00' | ''
       Разряды — неразрывным пробелом; пусто или не число — ''.
     PostTileTrancheNrlSummary.metricHTML(risk) → строка
       risk — поле risk записи контрагента (mock-counterparties.js):
       { rating, zone, ratingDate, zoneDate, segment, profile } или null.
       null — чип без зоны (outline, поля поповера прочерком), как в
       CounterpartiesTile.js; контрагента нет вовсе — пустая строка (чипа нет:
       ставит render).
     PostTileTrancheNrlSummary.render(tile, view)
       view = { variant?, counterparty?, balanceCurrency? }
       variant — какой вариант показать (нет — оставить текущий);
       counterparty — запись базы контрагентов (name, risk) | null;
       balanceCurrency — раздел записи договора { balanceCode, currencyCode,
       totalLimitAmount } | null.
       Заполняет значения всех трёх вариантов (у компонента одно состояние —
       «данные есть»; пустое значение — прочерк «—» на своём месте, поле с
       места не уходит), ставит data-variant, рисует чип риск-метрики и
       монтирует RiskMetric.
   ============================================================ */
(function () {
  'use strict';

  var VARIANTS = ['counterparty', 'balance', 'limit'];
  var NBSP = ' ';
  var DASH = '—';

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

  /* Рейтинг не рассчитан — чип без зоны (CounterpartiesTile.js, metric(null)) */
  function metricHTML(risk) {
    if (!risk) return '<span data-riskmetric></span>';
    var a = ' data-risk="' + esc(risk.rating) + '"';
    if (risk.zone) a += ' data-zone="' + esc(risk.zone) + '"';
    if (risk.ratingDate) a += ' data-rating-date="' + esc(risk.ratingDate) + '"';
    if (risk.zoneDate) a += ' data-zone-date="' + esc(risk.zoneDate) + '"';
    if (risk.segment) a += ' data-segment="' + esc(risk.segment) + '"';
    if (risk.profile) a += ' data-profile="' + esc(risk.profile) + '"';
    return '<span data-riskmetric' + a + '></span>';
  }

  function setVariant(tile, variant) {
    if (!tile || VARIANTS.indexOf(variant) === -1) return false;
    tile.setAttribute('data-variant', variant);
    return true;
  }

  /* Значения пишутся во ВСЕ варианты сразу — данные у трёх тайлов страницы
     одни (запись родительского договора), слайс по вариантам не нужен. */
  function setText(tile, key, text) {
    Array.prototype.forEach.call(tile.querySelectorAll('[data-trnrl="' + key + '"]'), function (el) {
      el.textContent = text;
    });
  }

  function render(tile, view) {
    if (!tile) return;
    view = view || {};
    if (view.variant) setVariant(tile, view.variant);
    var cp = view.counterparty || null;
    var bc = view.balanceCurrency || null;

    setText(tile, 'name', cp && has(cp.name) ? String(cp.name).trim() : DASH);
    setText(tile, 'balanceCode', bc && has(bc.balanceCode) ? balanceLabel(bc.balanceCode) : DASH);
    setText(tile, 'currencyCode', bc && has(bc.currencyCode) ? String(bc.currencyCode).trim() : DASH);
    setText(tile, 'totalLimitAmount', formatAmount(bc && bc.totalLimitAmount) || DASH);

    /* Чип: контрагент есть — RiskMetric по полю risk (без risk — чип без
       зоны); контрагента нет — чипа нет вовсе. */
    var slot = tile.querySelector('[data-trnrl="metric"]');
    if (slot) slot.innerHTML = cp ? metricHTML(cp.risk) : '';
    if (window.DSRiskMetric) window.DSRiskMetric.mount(tile);
    if (window.dsIcons) window.dsIcons.apply(tile);
  }

  window.PostTileTrancheNrlSummary = {
    VARIANTS: VARIANTS,
    setVariant: setVariant,
    balanceLabel: balanceLabel,
    formatAmount: formatAmount,
    metricHTML: metricHTML,
    render: render
  };
})();
