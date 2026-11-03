/* ============================================================
   LoanExternalDataTile.js — значения тайла «Техническая информация» из данных.

   Фрагмент LoanExternalDataTile.html держит эталон всех состояний, а значения в нём —
   пример. Страница-хозяин показывает значения своей сущности и отдаёт сюда. Витрина
   компонента строит поля этой же функцией — разметка полей одна на оба места.

   Потребитель (решение человека 02.11.2026, RE0049): общий компонент для
   нескольких сущностей; состав полей зависит от потребителя и расширяется
   списком CONSUMERS — НКЛ (два поля) и Транш (плюс «CRM ID продукта»); потом
   добавятся другие. Потребитель приходит в render (view.consumer) или ставится
   заранее setConsumer; по умолчанию — «nkl», прежнее поведение страниц не меняется.

   API:
     PostTileLoanExternalData.render(tile, view)
       view = { mode: 'edit' | 'view',
                consumer: 'nkl' | 'tranche',       — необязательно, см. выше
                data: null | { gfoId, gfoFundingCreditId, crmProductId? } }
       data — techInfo сущности-хозяина (у НКЛ — LoanAgreementStore.get().techInfo,
       LoanTechInfoRsDto), строки или ''. Заменяет поля в сетке, ставит
       data-consumer, data-state (по stateOf) и data-mode.
     PostTileLoanExternalData.setConsumer(tile, consumer) — состав полей без данных
       (образец PostTileKNR.setVariant): ставит data-consumer и перерисовывает сетку.
     PostTileLoanExternalData.fieldsHTML(data, consumer) → строка
       Поля потребителя в постоянном порядке; пустое значение — прочерк, поле с
       места не уходит.
     PostTileLoanExternalData.stateOf(data, consumer) → 'data' | 'partial' | 'empty'
       null или все значения пусты — empty, часть — partial, все есть — data.

   Окно правки — LoanExternalDataModal (скрим tech-scrim): карандаш шапки и «Заполнить»
   открывают его атрибутом data-modal, рантайм ДС. Окно читает и сохраняет то, что
   передала страница (или запись договора НКЛ по умолчанию), тайл перерисовывает
   страница по событию стора.
   ============================================================ */
(function () {
  'use strict';

  /* Поля по потребителям (паспорт, «Поля»); порядок — порядок отображения.
     Новый потребитель — новая строка здесь, разметка и CSS не меняются. */
  var CONSUMERS = {
    nkl: [
      { key: 'gfoId', label: 'ГФО ID' },
      { key: 'gfoFundingCreditId', label: 'ГФО ID фондирующего кредита' }
    ],
    tranche: [
      { key: 'gfoId', label: 'ГФО ID' },
      { key: 'gfoFundingCreditId', label: 'ГФО ID фондирующего кредита' },
      { key: 'crmProductId', label: 'CRM ID продукта' }
    ]
  };
  var DEFAULT_CONSUMER = 'nkl';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function consumerOf(name) {
    return CONSUMERS[name] ? name : DEFAULT_CONSUMER;
  }

  function val(data, key) {
    return String((data && data[key]) || '').trim();
  }

  function fieldsHTML(data, consumer) {
    return CONSUMERS[consumerOf(consumer)].map(function (f) {
      var v = val(data, f.key);
      return '<div class="rof">'
        + '<span class="ds-label ds-label--wrap"><span class="ds-label__text">' + f.label + '</span></span>'
        /* Прочерк — значение, а не подсказка, и своего цвета у него нет
           (ReadOnlyField 1.010). */
        + '<div class="rof__row"><span class="rof__value" data-tech-field="' + f.key + '">'
        + (v ? esc(v) : '—') + '</span></div>'
        + '</div>';
    }).join('');
  }

  function stateOf(data, consumer) {
    var fields = CONSUMERS[consumerOf(consumer)];
    var filled = fields.filter(function (f) { return val(data, f.key); }).length;
    if (!filled) return 'empty';
    return filled === fields.length ? 'data' : 'partial';
  }

  function paintGrid(tile, data, consumer) {
    var grid = tile.querySelector('.lc-loan-external-data-tile__grid:not(.lc-loan-external-data-tile__loading)');
    if (grid) grid.innerHTML = fieldsHTML(data, consumer);
  }

  function setConsumer(tile, consumer) {
    if (!tile) return;
    var c = consumerOf(consumer);
    tile.setAttribute('data-consumer', c);
    paintGrid(tile, tile.__techData || null, c);
  }

  function render(tile, view) {
    if (!tile) return;
    view = view || {};
    var mode = view.mode === 'edit' ? 'edit' : 'view';
    var consumer = consumerOf(view.consumer || tile.getAttribute('data-consumer'));
    tile.__techData = view.data || null;
    paintGrid(tile, view.data, consumer);
    /* Недоступное действие выключается разметкой, а не только стилем: в просмотре
       карандаш и «Заполнить» — disabled. */
    Array.prototype.forEach.call(tile.querySelectorAll('[data-modal]'), function (b) {
      b.disabled = mode !== 'edit';
    });
    tile.setAttribute('data-consumer', consumer);
    tile.setAttribute('data-mode', mode);
    tile.setAttribute('data-state', stateOf(view.data, consumer));
  }

  window.PostTileLoanExternalData = {
    fieldsHTML: fieldsHTML,
    stateOf: stateOf,
    setConsumer: setConsumer,
    render: render,
    /* Владелец правила «потребитель → поля» единственный — здесь; окно
       (LoanExternalDataModal.js) читает его при bind, своего списка не держит. */
    CONSUMERS: CONSUMERS,
    DEFAULT_CONSUMER: DEFAULT_CONSUMER
  };
})();
