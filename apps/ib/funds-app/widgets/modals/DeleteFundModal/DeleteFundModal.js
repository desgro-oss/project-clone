/* ============================================================
   DeleteFundModal.js — поведение окна «Удалить фонд» (DeleteFundModal).

   Чего нет в рантаймах ДС и что делает этот файл: блок «Данные фонда» из
   FundItemDto (аватар с инициалами, название, «ИНН … · КПП …», число
   активов) и подтверждение. Слой окна (портал, фокус, Esc, крестик, скрим) —
   рантайм ДС Modal.

   API (глобальный объект window.DeleteFundModal):
     open(scrimId, { fund, onConfirm }) → api DSModal (close(ok), isOpen) | null
       scrimId — id скрима, по умолчанию 'deleteFundModal';
       fund — FundItemDto (data/funds.js);
       onConfirm(fund) — по «Подтвердить»; окно закрывается.
     render(scrim, { fund }) → 'data' | 'partial' — заполнить без открытия
       (витрина); 'partial' — нет ИНН и КПП или активов, на их месте «—».
   Окно открывается рантаймом ДС: DSModal.open(scrim, { keep: true }).
   ============================================================ */
(function () {
  'use strict';

  var DEFAULT_ID = 'deleteFundModal';
  var DASH = '—';
  /* Организационно-правовые формы не дают букв аватара — тот же список, что у
     ячейки «Название фонда» FundsTable (FundOrAssetNameCell.utils.ts фронтенда). */
  var LEGAL = ['ООО', 'АО', 'ЗАО', 'ПАО', 'ОАО', 'НАК', 'НКО', 'ИП', 'ПФ', 'ФГУП', 'ГУП', 'МУП', 'КФ', 'КХ', 'СХП', 'СО', 'ТОО', 'ККА', 'АГР'];

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function filled(s) { return s != null && String(s).trim() !== ''; }

  /* Две буквы аватара: первые буквы двух первых слов или две первые буквы
     слова — как initials() в FundsTable.js. */
  function initials(name) {
    var words = String(name || '').split(/[^0-9A-Za-zА-Яа-яЁё]+/).filter(function (w) {
      return w && LEGAL.indexOf(w.toUpperCase()) < 0;
    });
    if (!words.length) return '';
    if (words.length === 1) return (words[0].charAt(0) + (words[0].charAt(1) || words[0].charAt(0))).toUpperCase();
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
  }

  /* Название фонда — разметка ДС ячейки «Название фонда» FundsTable (nameCell). */
  function nameHTML(f) {
    var req = [];
    if (filled(f.inn)) req.push('ИНН ' + f.inn);
    if (filled(f.kpp)) req.push('КПП ' + f.kpp);
    var name = filled(f.name) ? f.name : DASH;
    return '<div class="tc" data-col="name"><span class="tc__row">'
      + '<span class="av av--rounded av--m" data-av-seed="' + esc(f.objectId || f.name || '') + '" aria-hidden="true"><span class="av__text">' + esc(initials(f.name)) + '</span></span>'
      + '<span class="tc__body"><span class="tc__row"><span class="tc__text tc__text--truncate">' + esc(name) + '</span></span>'
      + '<span class="tc__subtext">' + esc(req.length ? req.join(' · ') : DASH) + '</span></span>'
      + '</span></div>';
  }

  function render(scrim, opts) {
    if (typeof scrim === 'string') scrim = document.getElementById(scrim);
    if (!scrim) return null;
    var f = (opts && opts.fund) || {};
    bind(scrim);
    scrim.__dfm = { fund: f, onConfirm: (opts && opts.onConfirm) || null, api: scrim.__dfm ? scrim.__dfm.api : null };
    var name = scrim.querySelector('[data-dfm-name]');
    if (name) name.innerHTML = nameHTML(f);
    var count = scrim.querySelector('[data-dfm-count]');
    var n = Number(f.aumAssetsCount);
    if (count) count.textContent = n > 0 ? n.toLocaleString('ru-RU') : DASH;
    var state = filled(f.inn) && filled(f.kpp) && n > 0 ? 'data' : 'partial';
    var modal = scrim.querySelector('.modal');
    if (modal) modal.setAttribute('data-state', state);
    if (window.DSTooltip && window.DSTooltip.bindAll) window.DSTooltip.bindAll(scrim);
    return state;
  }

  function bind(scrim) {
    if (scrim.__dfmBound) return;
    scrim.__dfmBound = true;
    scrim.addEventListener('click', function (e) {
      if (!e.target.closest('[data-dfm-confirm]')) return;
      var s = scrim.__dfm;
      if (!s) return;
      if (s.onConfirm) s.onConfirm(s.fund);
      if (s.api) s.api.close(true);
    });
  }

  function open(scrimId, opts) {
    var scrim = document.getElementById(scrimId || DEFAULT_ID);
    if (!scrim || !window.DSModal) return null;
    render(scrim, opts);
    var api = window.DSModal.open(scrim, { keep: true });
    scrim.__dfm.api = api;
    return api;
  }

  window.DeleteFundModal = { open: open, render: render };
})();
