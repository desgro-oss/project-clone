/* ============================================================
   AddFundEntityFromUcpModal.js — «Добавить фонд», шаг 1: поиск в базе фондов и в ЕПК.

   Пара во фронтенде — features/modals/AddFundEntityFromUcpModal (обёртка над
   UcpClientSearchModal общей библиотеки). Подключается страницей после ds-body.js.

   API — window.AddFundEntityFromUcpModal:
     open(scrimId, opts) → api DSModal — нарисовать и открыть окно
       (DSModal.open(scrim, { keep: true }));
       opts = {
         funds:   FundItemDto[]   — база фондов (MOCK_FUNDS),
         clients: UcpClientDto[]  — база юр. лиц ЕПК (MOCK_UCP_CLIENTS),
         prefill?: { name, inn, ogrn, kpp, kio } — значения полей поиска,
         search?: boolean         — сразу выполнить поиск по prefill,
         onNext(client)           — «Продолжить» (выбран клиент ЕПК), окно закрыто,
         onCreateFund({ name })   — «Новый фонд» (ничего не найдено), окно закрыто;
                                    name — значение поля «Название»
       }
     render(scrimOrId, opts)       — то же без открытия (витрина, копии состояний)
     search(scrimOrId)             — выполнить поиск по полям окна
     select(scrimOrId, kind, id)   — выбрать карточку: kind 'fund' | 'client'
     setState(scrimOrId, state, message?) — показать loading | error (витрина);
                                    message — текст ошибки

   Состояние — data-state на .modal: idle · loading · data · empty · error;
   выбранное — data-detail на .modal: fund | client.

   Правила поиска (допущение 30.10.2026, вопрос 2 паспорта): подстрока без учёта
   регистра; запись найдена, если совпало хотя бы одно заполненное поле (ИЛИ).
   Фонды — название или псевдоним по «Названию», ИНН и КПП по своим полям.
   Клиенты ЕПК — краткое или полное наименование по «Названию», ИНН, ОГРН, КПП,
   КИО по своим полям; клиенты, уже заведённые фондом (partyId фонда), в список
   ЕПК не попадают; «Скрывать клиентов без CRM ID» убирает клиентов с crmId: null.
   Пустой запрос (все поля пусты) поиск не запускает.
   После поиска выбрана первая карточка (фонд, если найден, иначе клиент).
   «Продолжить» доступна только при выбранном клиенте ЕПК (disabled, урок Л235).
   «Привязать» и ссылки «Страница фонда/клиента» — без обработчика (решение 30.10.2026).
   ============================================================ */
(function () {
  'use strict';

  var DASH = '—';
  var FIELDS = ['name', 'inn', 'ogrn', 'kpp', 'kio'];

  function $(root, sel) { return root.querySelector(sel); }
  function $$(root, sel) { return Array.prototype.slice.call(root.querySelectorAll(sel)); }
  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function val(v) { return v == null || v === '' ? DASH : String(v); }
  function scrimOf(x) { return typeof x === 'string' ? document.getElementById(x) : x; }
  function modalOf(scrim) { return scrim && (scrim.classList.contains('lc-afe') ? scrim : $(scrim, '.lc-afe')); }
  function ctxOf(scrim) {
    if (!scrim.__afe) scrim.__afe = { funds: [], clients: [], onNext: null, onCreateFund: null, found: { funds: [], clients: [] }, sel: null };
    return scrim.__afe;
  }
  function num(v) {
    if (v == null || v === '') return DASH;
    return Number(v).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  /* ---------- поля поиска ---------- */
  function readQuery(scrim) {
    var form = $(scrim, '[data-afe-form]');
    var q = {};
    FIELDS.forEach(function (k) { q[k] = String((form.elements[k] && form.elements[k].value) || '').trim().toLowerCase(); });
    q.hideNoCrm = !!(form.elements.hideNoCrm && form.elements.hideNoCrm.checked);
    return q;
  }
  function writePrefill(scrim, p) {
    var form = $(scrim, '[data-afe-form]');
    p = p || {};
    FIELDS.forEach(function (k) { if (form.elements[k]) form.elements[k].value = p[k] == null ? '' : p[k]; });
    if (form.elements.hideNoCrm) form.elements.hideNoCrm.checked = p.hideNoCrm == null ? true : !!p.hideNoCrm;
    if (window.DSInput) window.DSInput.syncAll(form);
  }
  function has(v, q) { return !!q && String(v == null ? '' : v).toLowerCase().indexOf(q) >= 0; }

  function match(ctx, q) {
    var empty = FIELDS.every(function (k) { return !q[k]; });
    if (empty) return null;
    var funds = ctx.funds.filter(function (f) {
      return has(f.name, q.name) || has(f.alias, q.name) || has(f.inn, q.inn) || has(f.kpp, q.kpp);
    });
    var inFunds = {};
    ctx.funds.forEach(function (f) { if (f.partyId) inFunds[f.partyId] = true; });
    var clients = ctx.clients.filter(function (c) {
      if (inFunds[c.partyId]) return false;
      if (q.hideNoCrm && !c.crmId) return false;
      return has(c.shortName, q.name) || has(c.fullName, q.name) || has(c.inn, q.inn) ||
        has(c.ogrn, q.ogrn) || has(c.kpp, q.kpp) || has(c.kio, q.kio);
    });
    return { funds: funds, clients: clients };
  }

  /* ---------- карточки результатов ---------- */
  function fundCard(f) {
    var types = (f.types || []).map(function (t) { return t.name; }).join(', ');
    var warn = f.partyId ? '' :
      '<span class="tile__title-add tile__title-add--icon tile__title-add--warning" tabindex="0" role="img"' +
      ' aria-label="Клиент не привязан к базе юр. лиц Сбера (ЕПК)." data-tooltip="Клиент не привязан к базе юр. лиц Сбера (ЕПК)."' +
      ' data-tooltip-multiline="yes"><i data-icon="alert-triangle-filled"></i></span>';
    return '<article class="tile tile--card lc-afe__card" role="radio" aria-checked="false" tabindex="-1" data-afe-kind="fund" data-afe-id="' + esc(f.objectId) + '">' +
      '<header class="tile__header"><div class="tile__header-main"><div class="tile__title-row">' +
      '<span class="tile__title-icon" aria-hidden="true"><i data-icon="factory-01"></i></span>' +
      '<h4 class="tile__title">' + esc(f.name) + '</h4>' + warn + '</div>' +
      '<p class="tile__subtitle">' + esc(types || DASH) + '</p></div></header></article>';
  }
  var KV = [['ИНН', 'inn'], ['КПП', 'kpp'], ['КПП КН', 'kppKn'], ['ОГРН', 'ogrn'], ['CRM ID', 'crmId']];
  function clientCard(c) {
    var sub = [c.clientTypeName, c.residencyName].filter(Boolean).join(' · ');
    var kv = KV.filter(function (p) { return c[p[1]]; }).map(function (p) {
      return '<dt>' + p[0] + '</dt><dd>' + esc(c[p[1]]) + '</dd>';
    }).join('');
    return '<article class="tile tile--card lc-afe__card" role="radio" aria-checked="false" tabindex="-1" data-afe-kind="client" data-afe-id="' + esc(c.partyId) + '">' +
      '<header class="tile__header"><div class="tile__header-main"><div class="tile__title-row">' +
      '<span class="tile__title-icon" aria-hidden="true"><i data-icon="' + (c.clientKind === 'HOLDING' ? 'building-01' : 'building-03') + '"></i></span>' +
      '<h4 class="tile__title">' + esc(c.shortName) + '</h4></div>' +
      (sub ? '<p class="tile__subtitle">' + esc(sub) + '</p>' : '') + '</div></header>' +
      (kv ? '<div class="tile__body"><dl class="lc-afe__kv">' + kv + '</dl></div>' : '') + '</article>';
  }

  function rebind(scope) {
    if (window.dsIcons) window.dsIcons.apply(scope);
    if (window.DSTooltip) window.DSTooltip.bindAll(scope);
  }

  /* ---------- детали ---------- */
  function setText(root, attr, key, text) {
    var el = $(root, '[' + attr + '="' + key + '"]');
    if (el) el.textContent = text;
  }
  function paintFund(scrim, f) {
    var box = $(scrim, '[data-afe-fund]');
    setText(box, 'data-afe-f', 'title', f.name);
    setText(box, 'data-afe-f', 'name', val(f.name));
    setText(box, 'data-afe-f', 'beneficiaries', val((f.keyBeneficiaries || []).map(function (b) { return b.displayName; }).join(', ')));
    setText(box, 'data-afe-f', 'investmentVolume', num(f.investmentVolume));
    setText(box, 'data-afe-f', 'priority', val(f.priority && f.priority.name));
    setText(box, 'data-afe-f', 'inn', val(f.inn));
    setText(box, 'data-afe-f', 'kpp', val(f.kpp));
    var chips = $(box, '[data-afe-f="keyIndustries"]');
    var list = f.keyIndustries || [];
    chips.innerHTML = list.length ? list.map(function (i) {
      return '<span class="chip chip--s"><span class="chip__label">' + esc(i.name) + '</span></span>';
    }).join('') : '<span class="rof__value">' + DASH + '</span>';
    $(box, '[data-afe-unbound]').hidden = !!f.partyId;
  }
  function paintClient(scrim, c) {
    var box = $(scrim, '[data-afe-client]');
    setText(box, 'data-afe-c', 'title', c.shortName);
    ['fullName', 'clientTypeName', 'holdingName', 'subIndustryName', 'industryName', 'segmentName'].forEach(function (k) {
      setText(box, 'data-afe-c', k, val(c[k]));
    });
    var team = c.team || [];
    var table = $(box, '[data-afe-c="team"]');
    $(box, '[data-afe-c="teamEmpty"]').hidden = team.length > 0;
    table.hidden = team.length === 0;
    var tbl = $(table, '.tbl');
    $$(tbl, '[data-afe-team-row]').forEach(function (r) { r.remove(); });
    tbl.insertAdjacentHTML('beforeend', team.map(function (m) {
      return '<div class="tbl__row lc-afe__team-row" data-afe-team-row><div class="tc tc--separator"></div>' +
        ['employeeNumber', 'fio', 'role'].map(function (k) {
          return '<div class="tc" data-col="' + k + '"><span class="tc__row"><span class="tc__text tc__text--truncate">' + esc(val(m[k])) + '</span></span></div>';
        }).join('') + '<div class="tc tc--separator"></div></div>';
    }).join(''));
    if (window.DSTable) { var api = window.DSTable.wire(tbl); if (api && api.rowsChanged) api.rowsChanged(); }
  }

  /* ---------- выбор ---------- */
  function select(scrimOrId, kind, id) {
    var scrim = scrimOf(scrimOrId), modal = modalOf(scrim), ctx = ctxOf(scrim);
    var item = null;
    if (kind === 'fund') item = ctx.found.funds.filter(function (f) { return f.objectId === id; })[0];
    if (kind === 'client') item = ctx.found.clients.filter(function (c) { return c.partyId === id; })[0];
    if (!item) return;
    ctx.sel = { kind: kind, id: id, item: item };
    $$(scrim, '.lc-afe__card').forEach(function (card) {
      var on = card.getAttribute('data-afe-kind') === kind && card.getAttribute('data-afe-id') === id;
      card.setAttribute('aria-checked', on ? 'true' : 'false');
      card.setAttribute('tabindex', on ? '0' : '-1');
    });
    if (kind === 'fund') paintFund(scrim, item); else paintClient(scrim, item);
    modal.setAttribute('data-detail', kind);
    $(scrim, '[data-afe-next]').disabled = kind !== 'client';
    rebind($(scrim, '.lc-afe__detail'));
  }

  /* ---------- состояния ---------- */
  function setState(scrimOrId, state, message) {
    var scrim = scrimOf(scrimOrId), modal = modalOf(scrim);
    modal.setAttribute('data-state', state);
    var btn = $(scrim, '[data-afe-search]');
    btn.classList.toggle('btn--loading', state === 'loading');
    if (state === 'loading') btn.setAttribute('aria-busy', 'true'); else btn.removeAttribute('aria-busy');
    if (state === 'error' && message) $(scrim, '[data-afe-error-text]').textContent = message;
    if (state !== 'data') {
      ctxOf(scrim).sel = null;
      $(scrim, '[data-afe-next]').disabled = true;
    }
  }

  function showResults(scrim, found) {
    var ctx = ctxOf(scrim);
    ctx.found = found;
    if (!found.funds.length && !found.clients.length) { setState(scrim, 'empty'); return; }
    var fBox = $(scrim, '[data-afe-cards="funds"]'), cBox = $(scrim, '[data-afe-cards="clients"]');
    fBox.innerHTML = found.funds.map(fundCard).join('');
    cBox.innerHTML = found.clients.map(clientCard).join('');
    $(scrim, '[data-afe-group="funds"]').hidden = !found.funds.length;
    $(scrim, '[data-afe-group="clients"]').hidden = !found.clients.length;
    rebind($(scrim, '[data-afe-list]'));
    setState(scrim, 'data');
    if (found.funds.length) select(scrim, 'fund', found.funds[0].objectId);
    else select(scrim, 'client', found.clients[0].partyId);
  }

  function search(scrimOrId) {
    var scrim = scrimOf(scrimOrId), ctx = ctxOf(scrim);
    var found = match(ctx, readQuery(scrim));
    if (!found) return false;
    showResults(scrim, found);
    return true;
  }

  /* ---------- закрытие ---------- */
  function close(scrim) {
    if (scrim.__afeApi && scrim.__afeApi.close) scrim.__afeApi.close(true);
    else if (window.DSModal && window.DSModal.current() && window.DSModal.current().scrim === scrim) window.DSModal.closeTop(true);
  }

  /* ---------- обработчики (один раз на скрим) ---------- */
  function wire(scrim) {
    if (scrim.__afeWired) return;
    scrim.__afeWired = true;
    var form = $(scrim, '[data-afe-form]');
    form.addEventListener('submit', function (e) { e.preventDefault(); search(scrim); });

    scrim.addEventListener('click', function (e) {
      var t = e.target;
      var card = t.closest('.lc-afe__card');
      if (card && scrim.contains(card)) { select(scrim, card.getAttribute('data-afe-kind'), card.getAttribute('data-afe-id')); return; }
      if (t.closest('[data-afe-retry]')) { search(scrim); return; }
      var next = t.closest('[data-afe-next]');
      if (next && !next.disabled) {
        var ctx = ctxOf(scrim), sel = ctx.sel;
        if (!sel || sel.kind !== 'client') return;
        close(scrim);
        if (ctx.onNext) ctx.onNext(sel.item);
        return;
      }
      if (t.closest('[data-afe-create]')) {
        var c = ctxOf(scrim), name = String(form.elements.name.value || '').trim();
        close(scrim);
        if (c.onCreateFund) c.onCreateFund({ name: name });
      }
    });

    /* Клавиатура карточек: Enter/Пробел — выбор, стрелки — соседняя карточка */
    scrim.addEventListener('keydown', function (e) {
      var card = e.target.closest && e.target.closest('.lc-afe__card');
      if (!card || e.target !== card) return;
      var cards = $$(scrim, '.lc-afe__card').filter(function (x) { return !x.closest('[hidden]'); });
      var i = cards.indexOf(card), to = null;
      if (e.key === 'Enter' || e.key === ' ') to = card;
      else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') to = cards[Math.min(i + 1, cards.length - 1)];
      else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') to = cards[Math.max(i - 1, 0)];
      if (!to) return;
      e.preventDefault();
      select(scrim, to.getAttribute('data-afe-kind'), to.getAttribute('data-afe-id'));
      to.focus();
    });
  }

  /* ---------- открытие ---------- */
  function render(scrimOrId, opts) {
    var scrim = scrimOf(scrimOrId);
    if (!scrim) return null;
    opts = opts || {};
    var ctx = ctxOf(scrim);
    ctx.funds = opts.funds || window.MOCK_FUNDS || [];
    ctx.clients = opts.clients || window.MOCK_UCP_CLIENTS || [];
    ctx.onNext = opts.onNext || null;
    ctx.onCreateFund = opts.onCreateFund || null;
    ctx.found = { funds: [], clients: [] };
    wire(scrim);
    writePrefill(scrim, opts.prefill);
    setState(scrim, 'idle');
    if (opts.search) search(scrim);
    return scrim;
  }

  function open(scrimId, opts) {
    var scrim = render(scrimId, opts);
    if (!scrim || !window.DSModal) return null;
    scrim.__afeApi = window.DSModal.open(scrim, { keep: true });
    return scrim.__afeApi;
  }

  window.AddFundEntityFromUcpModal = { open: open, render: render, search: search, select: select, setState: setState };
})();
