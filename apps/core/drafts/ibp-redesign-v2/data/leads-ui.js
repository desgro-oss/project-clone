/* Представления одного адаптера: доска, реестр, карточка и проводник.
   Геометрия компонентов — ДС; B1–B4 согласованы 12.10.2026. */
(function () {
  'use strict';
  var store = window.LEADS, stages = window.LEAD_STAGES, nav = window.IBPR_NAV;
  var page, currentId, previewId, tab = 'picks', view = 'board', listMode = 'list';
  var collapsedColumns = new Set(['PIPELINE', 'DECLINED']);
  var BOARD_GROUP_KEY = 'ibp-redesign-v2-HomeBoard-grouping';
  var boardGrouping = 'status';
  var boardGroupingOptions = [{ value:'status',label:'Статус проекта' },{ value:'client',label:'Клиент' },{ value:'desk',label:'Деск' }];
  try {
    var savedGrouping = sessionStorage.getItem(BOARD_GROUP_KEY);
    if (boardGroupingOptions.some(function (option) { return option.value === savedGrouping; })) boardGrouping = savedGrouping;
  } catch (e) { /* При недоступном хранилище выбор живёт в памяти страницы. */ }
  var collapsedHoldings = new Set();
  var filters = {}, basisFilter = null, pageNumber = 1, pageSize = 50, selected = new Set(), formState, transferLeadId;
  // «Статус клиента» (c11, MS0016) хранится последним в values(), а стоит сразу после «Клиента»:
  // ORDER задаёт порядок ячеек, индексы остальных колонок не меняются.
  var ORDER = [0,1,11,2,3,4,5,6,7,8,9,10];
  // Колонка выбора — порог ДС 124px (.th--select/.tc--select); хвост — гибкий разделитель ДС.
  var grid = '8px 124px 140px 224px 160px 224px 232px 112px 208px 240px 160px 208px 140px 160px minmax(8px,1fr)';
  function esc(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]; }); }
  function el(id) { return document.getElementById(id); }
  function put(id, html) { var node = el(id); if (node) node.innerHTML = html; }
  // Крошку рантайм ДС пересобирает и снимает с неё id (Л185): текст — через его API, по id — только без рантайма.
  function crumb(text) {
    var ol = document.querySelector('[data-breadcrumbs]');
    var api = ol && window.DSBreadcrumbs ? window.DSBreadcrumbs.bind(ol) : null;
    if (api && api.items.length) { api.items[api.items.length - 1].text = text; api.refresh(); return; }
    put('lead-crumb', esc(text));
  }
  function money(v) { return v == null ? '—' : Number(v).toLocaleString('ru-RU', { maximumFractionDigits: 2 }); }
  function date(v) { return v ? String(v).slice(0, 10).split('-').reverse().join('.') : '—'; }
  function days(l) { return Math.max(0, Math.floor((Date.parse('2026-10-12') - Date.parse(l.stageEnteredAt)) / 86400000)); }
  function chip(text, tone) { return '<span class="chip chip--rounded chip--s chip--' + (tone || 'grey') + '"><span class="chip__label">' + esc(text) + '</span></span>'; }
  // Основание — категория, а не статус: квадратный Chip с цветами через слоты ДС.
  // withIcon — глиф раздела системы, откуда пришёл лид (таблица, предпросмотр); на карточке доски чип без иконки.
  function basisChip(type, withIcon) {
    var b = stages.basis[type], c = b.colors;
    return '<span class="chip chip--s chip--fit" data-lead-basis-chip="' + type + '" style="--chip-fill:var(' + c[0] + ');--chip-border:var(' + c[0] + ');--chip-text:var(' + c[1] + ');--chip-icon-color:var(' + c[2] + ')">' + (withIcon && b.icon ? '<span class="chip__icon" aria-hidden="true"><i data-icon="' + b.icon + '"></i></span>' : '') + '<span class="chip__label">' + esc(b.title) + '</span></span>';
  }
  function btn(text, action, id, tone, small) { return '<button type="button" class="btn btn--' + (tone || 'outline') + ' btn--' + (small ? 's' : 'm') + '" data-lead-action="' + action + '"' + (id ? ' data-lead-id="' + esc(id) + '"' : '') + (action==='reasons'?' data-popover="lead-reasons" data-reasons-for="'+esc(id)+'"':'') + '><span class="btn__label">' + esc(text) + '</span></button>'; }
  function link(text, url) { return '<a class="link" href="' + esc(url) + '">' + esc(text) + '</a>'; }
  function rof(label, value, full) { return '<div class="rof' + (full ? ' tile__grid-full' : '') + '"><span class="ds-label"><span class="ds-label__text">' + esc(label) + '</span></span><div class="rof__row"><span class="rof__value">' + value + '</span></div></div>'; }
  function fields(items, cols) { return '<div class="tile__grid" style="grid-template-columns:repeat(' + (cols || 2) + ',minmax(0,1fr))">' + items.join('') + '</div>'; }
  function empty(title, text) { return '<div class="es es--m" role="status"><span class="illu es__illu" data-illu="empty-folder" aria-hidden="true"></span><div class="es__body"><p class="es__title">' + esc(title) + '</p><p class="es__text">' + esc(text) + '</p></div></div>'; }
  function checkbox(name, title, checked, attrs) { return '<label class="cb' + (!title ? ' cb--no-content' : '') + '"><input type="checkbox" class="cb__input" name="' + esc(name) + '"' + (checked ? ' checked' : '') + ' ' + (attrs || '') + '><span class="cb__box"><span class="cb__mark"><i data-icon="check"></i></span></span>' + (title ? '<span class="cb__content"><span class="cb__label">' + esc(title) + '</span></span>' : '') + '</label>'; }
  function input(name, label, value, type) { return '<div class="inp inp--m' + (type === 'textarea' ? ' inp--multiline' : '') + '"><label class="ds-label" for="' + name + '"><span class="ds-label__text">' + esc(label) + '</span></label><div class="inp__field">' + (type === 'textarea' ? '<textarea class="inp__control" id="' + name + '" name="' + name + '" rows="3">' + esc(value) + '</textarea>' : '<input class="inp__control" id="' + name + '" name="' + name + '" type="' + (type || 'text') + '" value="' + esc(value) + '"' + (type === 'number' ? ' min="0" step="any"' : '') + '>') + '</div></div>'; }
  function select(name, label, values, value) {
    var choices = values.map(function (x) { return typeof x === 'string' ? { value: x, label: x } : x; });
    var picked = choices.find(function (x) { return String(x.value) === String(value); });
    return '<div class="inp inp--m" data-lead-select="' + name + '"><label class="ds-label" for="' + name + '"><span class="ds-label__text">' + esc(label) + '</span></label><div class="inp__field" role="combobox" aria-expanded="false" aria-controls="' + name + '-list"><input class="inp__control" name="' + name + '" id="' + name + '" value="' + esc(picked ? picked.label : value || '') + '" data-value="' + esc(value || '') + '" placeholder="Выберите или найдите"><span class="inp__acts"><button type="button" class="inp__act inp__act--chev" aria-label="Показать список"><i data-icon="chevron-down"></i></button></span></div><div class="ddl ddl--floating ddl--scroll" id="' + name + '-list" role="listbox" hidden data-lead-list><div>' + choices.map(function (x) { return '<button type="button" class="ddl__item" role="option" aria-selected="' + (String(x.value) === String(value)) + '" data-value="' + esc(x.value) + '"><span class="ddl__item-body"><span class="ddl__item-label">' + esc(x.label) + '</span></span></button>'; }).join('') + '</div></div></div>';
  }
  function bind(scope) {
    scope = scope || document;
    if (window.dsIcons) window.dsIcons.apply(scope);
    if (window.DSInput) window.DSInput.bindAll(scope);
    if (window.DSModal) window.DSModal.bindAll(scope);
    if (window.DSPopover) window.DSPopover.bindAll(scope);
    if (window.DSDrawer) window.DSDrawer.bindAll(scope);
    if (window.DSMenu) window.DSMenu.bindAll(scope);
    if (window.DSTableSettings) window.DSTableSettings.bindAll(scope);
    scope.querySelectorAll('[data-lead-settings]').forEach(function (trigger) {
      if (trigger.__leadViewSettingsBound) return;
      trigger.__leadViewSettingsBound = true;
      trigger.addEventListener('click',function () { openViewSettings(trigger); });
    });
    if (window.DSTabs) scope.querySelectorAll('[data-lead-segment]').forEach(function (root) {
      window.DSTabs.segment(root, { onChange: function (i, b) {
        var kind = root.dataset.leadSegment;
        if (kind === 'view') { if (view === b.dataset.leadView) return; view = b.dataset.leadView; }
        if (kind === 'group') { if (listMode === b.dataset.leadGroup) return; listMode = b.dataset.leadGroup; pageNumber = 1; selected.clear(); }
        render();
      } });
      window.DSTabs.positionThumb(root);
    });
    scope.querySelectorAll('[data-lead-select]').forEach(function (root) {
      if (root.dataset.leadBound) return;
      var field = root.querySelector('.inp__field'), control = root.querySelector('input'), list = root.querySelector('.ddl');
      if (!window.DSDropdownList || !list) return;
      window.DSDropdownList.bind(field, { list: list, onSelect: function (item) {
        control.value = item.querySelector('.ddl__item-label').textContent;
        control.dataset.value = item.dataset.value;
        if (window.DSInput) window.DSInput.sync(root);
      } });
      control.addEventListener('input', function () { control.dataset.value = ''; });
      root.addEventListener('ds-input:clear', function () { control.dataset.value = ''; });
      root.dataset.leadBound = 'yes';
    });
    if (window.DSTable) { window.DSTable.bindAll(scope); window.DSTable.wireAll(scope); }
  }
  function notify(title, snapshot) {
    if (!window.DSSnack) return;
    var after = snapshot ? JSON.stringify(store.snapshot()) : '';
    window.DSSnack.show({ tone: 'success', title: title, dedup:!snapshot, buttons: snapshot ? [{ label: 'Отменить', onClick: function () { if(JSON.stringify(store.snapshot())!==after){error('После этого действия данные уже изменились');return;}store.restore(snapshot); } }] : null });
  }
  function error(message) { if (window.DSSnack) window.DSSnack.show({ tone: 'warning', title: message }); }
  function basisHtml(l) { return l.basis.map(function (b) { return basisChip(b.type,true); }).join(' '); }
  /* Фильтр оснований — множественный выбор (решение пользователя 21.10.2026):
     basisFilter = null — все основания; Set кодов — лиды хотя бы с одним из них.
     Поле InputAutocomplete S со сводкой + DropdownList с чекбоксами ДС. */
  var CHECK_MARK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>';
  function basisActive() { return !!basisFilter && basisFilter.size < Object.keys(stages.basis).length; }
  function basisOn(code) { return !basisFilter || basisFilter.has(code); }
  function renderBasisPicker() {
    var root = el('lead-basis-filter'); if (!root) return;
    var list = el('lead-basis-list'), codes = Object.keys(stages.basis); // плавающий список рантайм ДС переносит в body — берём по id
    function option(code, all) {
      var on = all ? (!basisActive() ? 'true' : basisFilter.size ? 'mixed' : 'false') : String(basisOn(code));
      return '<button type="button" class="ddl__item ddl__item--checkbox' + (all ? ' ddl__item--all' : '') + '" role="option" aria-checked="' + on + '"' + (all ? '' : ' data-basis="' + code + '"') + '>'
        + '<span class="ddl__item-check"><span class="cb__box"><span class="cb__mark">' + CHECK_MARK + '</span></span></span>'
        + '<span class="ddl__item-body"><span class="ddl__item-label">' + esc(all ? 'Все основания' : stages.basis[code].title) + '</span></span>'
        + (all ? '' : '<span class="ddl__item-trail" data-basis-count="' + code + '"></span>') + '</button>';
    }
    if (!list.querySelector('.ddl__item')) {
      list.innerHTML = option('', true) + '<hr class="ddl__divider">' + codes.map(function (c) { return option(c); }).join('');
      if (window.DSDropdownList) window.DSDropdownList.bind(root.querySelector('.inp__field'), { list: list, multiple: true, onToggle: function () {
        var on = codes.filter(function (c) { return list.querySelector('[data-basis="' + c + '"]').getAttribute('aria-checked') === 'true'; });
        basisFilter = on.length === codes.length ? null : new Set(on);
        pageNumber = 1; selected.clear(); render();
      } });
    }
    // состояние чекбоксов — из basisFilter (сброс фильтра, вкладки): глиф как у DSDropdownList
    var DASH_MARK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 12h12"/></svg>';
    list.querySelectorAll('.ddl__item--checkbox').forEach(function (it) {
      var all = it.classList.contains('ddl__item--all');
      var v = all ? (!basisActive() ? 'true' : basisFilter.size ? 'mixed' : 'false') : String(basisOn(it.dataset.basis));
      it.setAttribute('aria-checked', v);
      it.querySelector('.cb__mark').innerHTML = v === 'mixed' ? DASH_MARK : CHECK_MARK;
    });
    var scope = filtered(true);
    list.querySelectorAll('[data-basis-count]').forEach(function (b) { b.textContent = scope.filter(function (l) { return l.basis.some(function (x) { return x.type === b.dataset.basisCount; }); }).length; });
    var picked = codes.filter(basisOn);
    root.querySelector('[data-basis-summary]').textContent = !basisActive() ? 'Все основания' : !picked.length ? 'Не выбрано' : stages.basis[picked[0]].title + (picked.length > 1 ? ', +' + (picked.length - 1) : '');
  }
  // Сводка недели в подзаголовке PageHeader: мета-элементы ДС, числа из данных (MS0016 §2.1).
  function meta(icon, text) { return '<span class="phead__meta"><span class="phead__meta-ico" aria-hidden="true"><i data-icon="' + icon + '"></i></span>' + esc(text) + '</span>'; }
  function weekSummary() {
    var all = store.all(), me = window.IBPR.user.id;
    var mine = all.filter(function (l) { return l.owner === me && !stages.get(l.stage).final; });
    var work = mine.filter(function (l) { return l.stage !== 'REVIEW'; });
    var meetings = new Set();
    mine.forEach(function (l) { l.meetings.forEach(function (m) { if (m.statusCode !== 'CANCELLED' && m.date >= '2026-10-12' && m.date <= '2026-10-18') meetings.add(m.id); }); });
    var passed = all.filter(function (l) { return l.owner === me && l.stage === 'PIPELINE' && l.stageEnteredAt >= '2026-10-01'; });
    var passedSum = passed.reduce(function (acc,l) { return acc + (Number(l.amountMln) || 0); },0);
    return meta('calendar',window.WEEKLY_PICKS.title)
      + meta('star','В подборке: ' + all.filter(function (l) { return l.picked && l.stage === 'REVIEW'; }).length)
      + meta('tasks','В работе: ' + work.length)
      + meta('calendar-check-01','Встречи на неделе: ' + meetings.size)
      + meta('pipeline','В Pipeline за Q4: ' + passed.length + ' · ' + money(passedSum) + ' млн RUB')
      + meta('clock-timer','Без движения > 14 дн.: ' + work.filter(function (l) { return days(l) > 14; }).length);
  }
  function owner(l) { var p = window.IBPR.employee(l.owner); return p ? p.fullName : l.owner; }
  function leadHref(id) { return nav.href('lead', { id: id, mode: 'after' }); }
  function values(l) { return [l.id,l.clientName,l.basis.map(function (b) { return stages.basis[b.type].title + ' ' + b.sourceId; }).join('; '),l.idea,money(l.amountMln),stages.get(l.stage).title,l.reasons.join('; '),l.client.quarterPlan || '—',owner(l),date(l.createdAt),date(l.lastActivityAt),clientStatus(l).title]; }
  function clientStatus(l) { return stages.clientStatus[l.clientStatus] || stages.clientStatus.ACTIVE; }
  // skipBasis — без выбранного основания: так считаются счётчики сегментов текущей вкладки.
  function filtered(skipBasis) {
    var rows = store.all().filter(function (l) {
      if (page === 'HomeBoard') return l.picked || l.stage !== 'REVIEW' && l.stage !== 'NOT_TAKEN' && l.owner === '04127';
      if (tab === 'picks') return l.picked && l.stage === 'REVIEW';
      if (tab === 'work') return !stages.get(l.stage).final && l.stage !== 'REVIEW' && l.owner === '04127';
      if (tab === 'archive') return stages.get(l.stage).final;
      return !stages.get(l.stage).final;
    });
    rows = rows.filter(function (l) {
      if (basisActive() && !skipBasis && !l.basis.some(function (b) { return basisFilter.has(b.type); })) return false;
      return Object.keys(filters).every(function (key) {
        var v = filters[key]; if (!v) return true;
        if (key === 'plan') return l.client.inQuarterPlan;
        if (key === 'min') return l.amountMln >= Number(v);
        if (key === 'max') return l.amountMln <= Number(v);
        if (key === 'created') return String(l.createdAt).slice(0,10) >= v;
        if (key === 'stale') return days(l) > 14 && !stages.get(l.stage).final;
        var text = { client: l.clientName, holding: l.holdingName, product: l.products.join(', '), stage: l.stage, owner: l.owner, industry: l.client.industry, bank: l.client.terBank }[key];
        return String(text || '').toLowerCase().includes(String(v).toLowerCase());
      });
    });
    if (page === 'LeadsNew' && listMode === 'holdings') rows.sort(function (a,b) { return a.holdingName.localeCompare(b.holdingName, 'ru') || a.clientName.localeCompare(b.clientName, 'ru'); });
    return rows;
  }
  function card(l, picked) {
    var s = stages.get(l.stage), basis = l.basis[0];
    var actions = picked ? btn('Беру','take',l.id,'accent',true) + btn('Не беру','not-taken',l.id,null,true) + '<button type="button" class="btn btn--transparent btn--s" data-popover="lead-reasons" data-reasons-for="' + esc(l.id) + '"><span class="btn__label">Почему?</span></button>' : '<button type="button" class="ibtn ibtn--neutral ibtn--s" aria-label="Действия с лидом" data-menu="lead-card-menu" data-menu-lead="' + esc(l.id) + '"><i data-icon="more-dots"></i></button>';
    if (picked) return '<article class="tile tile--card" data-lead-id="'+esc(l.id)+'"><header class="tile__header"><div class="tile__header-main"><div class="tile__title-row"><h3 class="tile__title">'+esc(l.clientName)+'</h3></div><div class="tile__chiplist">'+basisChip(basis.type)+'</div></div></header><div class="tile__body"><div class="lead-toolbar__group"><span class="ds-body-s">'+money(l.amountMln)+' млн RUB</span>'+link(l.id,leadHref(l.id))+'</div><div class="lead-pick-footer">'+actions+'</div></div></article>';
    return '<article class="tile tile--card' + (picked ? '' : ' kbcard') + '" tabindex="0" data-lead-id="' + esc(l.id) + '"' + (picked ? '' : ' data-kb-card="' + esc(l.id) + '"') + '><header class="tile__header"><div class="tile__header-main"><div class="tile__title-row"><h3 class="tile__title">' + esc(l.clientName) + '</h3></div><div class="tile__chiplist">' + basisChip(basis.type) + (l.client.keyClient ? chip('Ключевой клиент','orange') : '') + '</div></div>' + (!picked ? '<div class="tile__actions">' + actions + '</div>' : '') + '</header><div class="tile__body"><div class="kbcard__fields">' + [['Продукт',l.products.join(', ') || l.idea],['Объём, млн RUB',money(l.amountMln)],['Следующий шаг',l.nextStep.title],['Срок',date(l.nextStep.dueDate)]].map(function (x) { return '<div class="kbcard__field"><span class="kbcard__flabel">' + esc(x[0]) + '</span><span class="kbcard__fvalue" title="' + esc(x[1]) + '">' + esc(x[1]) + '</span></div>'; }).join('') + '</div><div class="kbcard__meta"><span class="kbcard__stat">' + days(l) + ' дн. на стадии' + (days(l)>14 ? ' · Без движения' : '') + '</span><span class="kbcard__stat">Встречи: ' + l.meetings.length + '</span></div><div class="kbcard__foot"><span class="kbcard__id">' + link(l.id,leadHref(l.id)) + '</span><span class="av av--circular av--s" title="' + esc(owner(l)) + '"><span class="av__text">' + esc((window.IBPR.employee(l.owner) || {}).initials || 'КА') + '</span></span></div>' + (picked ? '<div class="lead-pick-footer">' + actions + '</div>' : '') + (l.opportunityId ? link('Сделка ' + l.opportunityId,nav.href('opportunity',{id:l.opportunityId,source:'pipeline',mode:'after'})) : '') + '</div></article>';
  }
  function renderTable(rows) {
    var oldTable = el('lead-table');
    oldTable.querySelectorAll('[data-lead-holding]').forEach(function (r) {
      if (r.querySelector('[aria-expanded]').getAttribute('aria-expanded') === 'false') collapsedHoldings.add(r.dataset.node);
      else collapsedHoldings.delete(r.dataset.node);
    });
    var headers = ['ID','Клиент','Основание','Идея / продукт','Объём, млн RUB','Стадия','Почему рекомендован','Приоритет на квартал РД','Ответственный','Появился','Последняя активность','Статус клиента'];
    var countPages = Math.max(1,Math.ceil(rows.length/pageSize)); pageNumber = Math.min(pageNumber,countPages);
    var slice = rows.slice((pageNumber-1)*pageSize,pageNumber*pageSize);
    var html = '<div class="tbl__row tbl__row--head" style="grid-template-columns:' + grid + '"><div class="th th--separator"></div><div class="th th--select">' + checkbox('all','',false,'data-lead-select-all aria-label="Выбрать страницу"') + '</div>' + ORDER.map(function (i) {
      return window.IBPR_TABLE.headCell({ key:'c' + i,label:headers[i],align:i === 4 ? 'right' : 'left',sortType:i === 4 ? 'number' : i === 9 || i === 10 ? 'date' : 'text' },false);
    }).join('') + '<div class="th th--separator"></div></div>';
    if (page === 'LeadsNew' && listMode === 'holdings') {
      var groups = new Map();
      slice.forEach(function (l) { if (!groups.has(l.holdingName)) groups.set(l.holdingName,[]); groups.get(l.holdingName).push(l); });
      groups.forEach(function (leads, name) {
        var key = 'lead-holding-' + encodeURIComponent(name), closed = collapsedHoldings.has(key);
        var volume = leads.reduce(function (sum,l) { return sum + (Number(l.amountMln) || 0); },0);
        html += '<div class="tbl__row" data-lead-holding data-node="' + key + '" data-holding-name="' + esc(name) + '" data-holding-count="' + leads.length + '" data-holding-volume="' + volume + '" style="grid-template-columns:' + grid + '"><div class="tc tc--separator"></div><div class="tc tc--select"></div>' + ORDER.map(function (i) {
          var value = i === 1 ? name : i === 4 ? volume : '';
          return '<div class="tc' + (i === 1 ? ' tc--tree' : i === 4 ? ' tc--numbers' : '') + '" data-col="c' + i + '" data-sort-value="' + esc(value) + '">' + (i === 1 ? '<button type="button" class="tc__twisty" aria-expanded="' + !closed + '" aria-label="' + (closed ? 'Развернуть' : 'Свернуть') + '"><i data-icon="chevron-right"></i></button>' : '') + '<span class="tc__row"><span class="tc__text tc__text--truncate">' + esc(i === 4 ? money(value) : value) + '</span>' + (i === 1 ? '<span class="badge badge--text badge--s">' + leads.length + '</span>' : '') + '</span></div>';
        }).join('') + '<div class="tc tc--separator"></div></div>';
        html += leads.map(function (l) { return tableRow(l,key,closed); }).join('');
      });
    } else html += slice.map(function (l) { return tableRow(l); }).join('');
    // Новый корень позволяет TableSettings работать с актуальными заголовками.
    // Вид таблицы восстанавливает штатный рантайм ДС по data-table-persist.
    var table = oldTable.cloneNode(false); table.innerHTML = html; oldTable.replaceWith(table);
    put('lead-table-count',String(rows.length));
    if (window.DSTable) window.DSTable.wire(table).rowsChanged();
    if (window.DSTableSettings) window.DSTableSettings.restore(table);
    layoutHoldingRows(table);
    stretchClient(table);
    el('lead-table-empty').hidden = rows.length > 0;
    put('lead-table-empty',empty('Лиды не найдены','Измените фильтр или выберите другую вкладку.'));
    if (window.DSPagination) {
      // Итоги — по всем строкам вкладки с учётом фильтра, не по текущей странице (MS0016 §2.3).
      var known = rows.filter(function (l) { return Number(l.amountMln) > 0; });
      var sum = known.reduce(function (acc,l) { return acc + Number(l.amountMln); },0);
      var info = [['Всего лидов',String(rows.length)],['На сумму',money(sum) + ' млн RUB']];
      if (rows.length > known.length) info.push(['Без оценки',String(rows.length - known.length)]);
      var holder = el('lead-pagination'); holder.replaceChildren(window.DSPagination.footer({
        info:{ items:info, warn:'' },
        pager:{ total:rows.length,page:pageNumber,pageSize:pageSize,
          onChange:function (n) { pageNumber=n; render(); }, onPageSizeChange:function (n) { pageSize=n;pageNumber=1;render(); } } }));
    }
    updateBulk();
  }
  /* [ПРЕДЛОЖЕНИЕ] Резиновая колонка «Клиент» (MS0016, решение человека 13.10.2026 —
     только в этом прототипе). Пока таблица уже области, «Клиент» забирает свободную
     ширину; шире — остаётся базовой (CLIENT_BASE) и появляется горизонтальный скролл.
     Рантайм Table ДС держит треки в px (выравнивание, ресайз, настройки), поэтому
     ширина считается здесь в px и пишется всем строкам. Ручной ресайз «Клиента»
     меняет базу. Кандидат в ДС — свойство колонки «фиксированная / тянется до упора». */
  var CLIENT_BASE = 224, clientBase = CLIENT_BASE;
  function trackPx(t) { var m = /^minmax\((\d+(?:\.\d+)?)px/.exec(t); return m ? Number(m[1]) : parseFloat(t) || 0; }
  function stretchClient(table) {
    if (!table || !table.clientWidth) return;
    var head = table.querySelector('.tbl__row--head'); if (!head) return;
    var cells = Array.prototype.slice.call(head.children);
    var idx = cells.findIndex(function (c) { return c.dataset.col === 'c1'; });
    var tracks = (head.style.gridTemplateColumns || '').match(/minmax\([^)]*\)|\S+/g);
    if (idx < 0 || !tracks || tracks.length !== cells.length) return;   // «Клиент» скрыт в настройках
    var others = tracks.reduce(function (sum, t, i) { return i === idx ? sum : sum + trackPx(t); }, 0);
    var next = Math.max(clientBase, Math.floor(table.clientWidth - others)) + 'px';
    if (tracks[idx] === next) return;
    tracks[idx] = next;
    var gtc = tracks.join(' ');
    table.querySelectorAll('.tbl__row').forEach(function (row) { row.style.gridTemplateColumns = gtc; });
  }
  function layoutHoldingRows(table) {
    // Заголовок группы занимает левую часть строки, до колонки объёма.
    // Все ячейки и ключи остаются на месте для штатных Settings / Resize / Reorder.
    table.querySelectorAll('[data-lead-holding]').forEach(function (row) {
      // Reorder измеряет ячейки каждой строки: объединённый заголовок берёт треки шапки.
      row.style.gridTemplateColumns = table.querySelector('.tbl__row--head').style.gridTemplateColumns;
      var cells = Array.from(row.children), volume = cells.find(function (c) { return c.dataset.col === 'c4'; });
      var title = cells.find(function (c) { return /^c\d+$/.test(c.dataset.col || '') && c !== volume; }) || cells[1];
      var volumeTrack = volume ? cells.indexOf(volume) + 1 : 0;
      if (volumeTrack && volumeTrack < 4) volumeTrack = cells.length - 1;
      var closed = collapsedHoldings.has(row.dataset.node);
      cells.forEach(function (cell, i) {
        cell.style.removeProperty('grid-column');
        if (cell.classList.contains('tc--separator')) { cell.style.gridColumn = i === 0 ? '1' : '-2'; return; }
        cell.hidden = cell !== title && cell !== volume;
        cell.classList.toggle('tc--tree', cell === title);
        cell.innerHTML = '';
      });
      title.style.gridColumn = '2 / ' + (volumeTrack || '-2');
      title.innerHTML = '<button type="button" class="tc__twisty" aria-expanded="' + !closed + '" aria-label="' + (closed ? 'Развернуть' : 'Свернуть') + '"><i data-icon="chevron-right"></i></button><span class="tc__row"><span class="tc__text tc__text--truncate">' + esc(row.dataset.holdingName) + '</span><span class="badge badge--text badge--s">' + row.dataset.holdingCount + '</span></span>';
      if (volume) { volume.style.gridColumn = String(volumeTrack); volume.innerHTML = '<span class="tc__row"><span class="tc__text">' + money(Number(row.dataset.holdingVolume)) + '</span></span>'; }
    });
  }
  function tableRow(l,parent,closed) {
    var vals = values(l);
    return '<div class="tbl__row' + (selected.has(l.id) ? ' tbl__row--selected' : '') + '" data-lead-row="' + esc(l.id) + '"' + (parent ? ' data-parent="' + parent + '"' : '') + (closed ? ' hidden' : '') + ' style="grid-template-columns:' + grid + '"><div class="tc tc--separator"></div><div class="tc tc--select">' + checkbox('select','',selected.has(l.id),'data-lead-check="' + esc(l.id) + '" aria-label="Выбрать ' + esc(l.id) + '"') + '</div>' + ORDER.map(function (i) {
      var v = vals[i];
      var inside = i === 0 ? link(v,leadHref(l.id)) : i === 2 ? basisHtml(l) : i === 5 ? chip(v,stages.get(l.stage).tone) : i === 11 ? chip(v,clientStatus(l).tone) : esc(v || '—');
      return '<div class="tc' + (i === 4 ? ' tc--numbers' : parent && i === 1 ? ' tc--tree' : '') + '"' + (parent && i === 1 ? ' style="--tc-level:1"' : '') + ' data-col="c' + i + '" data-sort-value="' + esc(i === 4 ? l.amountMln : i === 9 ? l.createdAt : i === 10 ? l.lastActivityAt : v) + '">' + (parent && i === 1 ? '<span class="tc__twisty tc__twisty--leaf" aria-hidden="true"></span>' : '') + '<span class="tc__row"><span class="tc__text tc__text--truncate">' + inside + '</span></span></div>';
    }).join('') + '<div class="tc tc--separator"></div></div>';
  }
  function updateBulk() { if (!el('lead-bulk')) return; el('lead-bulk').hidden = !selected.size; if (el('lead-bulk-divider')) el('lead-bulk-divider').hidden = !selected.size; put('lead-bulk-count','Выбрано строк: <b>' + selected.size + '</b>'); }
  // Все группировки показывают один набор проектов: рабочие стадии и исходы текущей доски.
  function boardGroups(rows) {
    var statuses = stages.working.concat([stages.get('PIPELINE'),stages.get('DECLINED')]);
    if (boardGrouping === 'status') return statuses.map(function (s) {
      return { code:s.code,title:s.title,tone:s.tone,cards:rows.filter(function (l) { return l.stage === s.code; }) };
    });
    var groups = new Map();
    rows.filter(function (l) { return statuses.some(function (s) { return s.code === l.stage; }); }).forEach(function (l) {
      // «По деску» — деск ответственного, не дески клиента или источника.
      var employee = window.IBPR.employee(l.owner) || {};
      var deskId = employee.deskId;
      var deskLabel = employee.desk || (deskId != null ? window.IBPR.lbl.desk(deskId) : '');
      var keys = boardGrouping === 'client'
        ? [{ code:'client:' + l.clientId,title:l.clientName }]
        : (deskLabel ? [{ code:'desk:' + (deskId || deskLabel),title:deskLabel }] : []);
      if (!keys.length) keys = [{ code:'desk:none',title:'Без деска' }];
      var seen = new Set();
      keys.forEach(function (key) {
        if (seen.has(key.code)) return;
        seen.add(key.code);
        if (!groups.has(key.code)) groups.set(key.code,{ code:key.code,title:key.title,tone:'lblue',cards:[] });
        groups.get(key.code).cards.push(l);
      });
    });
    return Array.from(groups.values()).sort(function (a,b) { return a.title.localeCompare(b.title,'ru'); });
  }
  function applyBoardGrouping(value) {
    if (!boardGroupingOptions.some(function (option) { return option.value === value; }) || value === boardGrouping) return;
    boardGrouping = value;
    try { sessionStorage.setItem(BOARD_GROUP_KEY,value); } catch (e) { /* в памяти */ }
    render();
  }
  function openViewSettings(trigger) {
    if (page !== 'HomeBoard') return;
    if (view === 'table') {
      if (!window.DSTableSettings) return;
      // Штатный TableSettings находит пересозданный renderTable корень по селектору.
      var proxy = document.createElement('button');
      proxy.type = 'button'; proxy.hidden = true; proxy.setAttribute('data-table-settings','#lead-table');
      document.body.appendChild(proxy); window.DSTableSettings.bind(proxy); proxy.click(); proxy.remove();
      var scrims = document.querySelectorAll('[id^="ds-table-settings-scrim-"]');
      var tableScrim = scrims[scrims.length - 1];
      if (!tableScrim || !window.DSModal) return;
      // TableSettings владеет моделью колонок; Modal — фокусом, Esc и inert фоном.
      var title = tableScrim.querySelector('.modal__title');
      title.id = tableScrim.id + '-title';
      tableScrim.querySelector('.modal').setAttribute('aria-labelledby',title.id);
      var layer = window.DSModal.open(tableScrim,{ keep:true,returnFocus:trigger,onClose:function () {
        var cancel = tableScrim.querySelector('[data-cancel]');
        if (cancel) cancel.click();
      } });
      tableScrim.addEventListener('click',function (event) {
        if (event.target.closest('[data-cancel],[data-apply]')) layer.close();
      });
      // Форма настроек защищена от закрытия по скриму, как остальные формы ДС.
      tableScrim.addEventListener('click',function (event) {
        if (event.target === tableScrim) { event.preventDefault(); event.stopImmediatePropagation(); }
      },true);
      return;
    }
    if (!window.DSModal) return;
    var scrim = el('lead-board-settings');
    if (!scrim) {
      document.body.insertAdjacentHTML('beforeend','<div class="modal-scrim" id="lead-board-settings" hidden><div class="modal modal--w4" role="dialog" aria-modal="true" aria-labelledby="lead-board-settings-title"><header class="modal__head"><h2 class="modal__title" id="lead-board-settings-title">Настройка доски</h2><button type="button" class="ibtn ibtn--neutral ibtn--l" aria-label="Закрыть" data-modal-close><i data-icon="close"></i></button></header><div class="modal__body"><div class="rb-group" role="radiogroup" aria-labelledby="lead-board-group-title"><p class="rb-group__title" id="lead-board-group-title">Группировать проекты</p><div class="rb-group__items">' + boardGroupingOptions.map(function (option) {
        return '<label class="rb"><input type="radio" class="rb__input" name="lead-board-grouping" value="' + option.value + '"><span class="rb__box"><i class="rb__mark" data-icon="radio-button-checked"></i></span><span class="rb__content"><span class="rb__label">' + option.label + '</span></span></label>';
      }).join('') + '</div></div><p class="ds-body-s">По деску ответственного. Если деск не указан, проект отображается в колонке «Без деска».</p><p class="ds-body-s">В группировках по клиенту и деску перенос карточек отключён. Изменить статус можно из карточки проекта.</p></div><footer class="modal__foot"><div class="modal__foot-right"><button type="button" class="btn btn--transparent btn--m" data-modal-close><span class="btn__label">Отменить</span></button><button type="button" class="btn btn--accent btn--m" data-lead-board-settings-apply><span class="btn__label">Применить</span></button></div></footer></div></div>');
      scrim = el('lead-board-settings');
      scrim.querySelector('[data-lead-board-settings-apply]').addEventListener('click',function () {
        var picked = Array.from(scrim.querySelectorAll('input[name="lead-board-grouping"]')).find(function (radio) { return radio.checked; });
        window.DSModal.closeTop();
        if (picked) applyBoardGrouping(picked.value);
      });
      scrim.addEventListener('change',function () { syncBoardGroupingRadios(scrim); });
    }
    scrim.querySelectorAll('input[name="lead-board-grouping"]').forEach(function (radio) { radio.checked = radio.value === boardGrouping; });
    syncBoardGroupingRadios(scrim);
    window.DSModal.open(scrim,{ returnFocus:trigger });
  }
  function syncBoardGroupingRadios(scrim) {
    scrim.querySelectorAll('input[name="lead-board-grouping"]').forEach(function (radio) {
      radio.closest('.rb').querySelector('.rb__mark').setAttribute('data-icon',radio.checked ? 'radio-button-checked' : 'radio-button-unchecked');
    });
    if (window.dsIcons) window.dsIcons.apply(scrim);
  }
  function renderBoard(rows) {
    // Штатное меню Kanban меняет DOM: сохраняем выбор пользователя перед перерисовкой.
    el('lead-board').querySelectorAll('[data-kb-col]').forEach(function (col) {
      if (col.classList.contains('kbcol--collapsed')) collapsedColumns.add(col.dataset.kbCol);
      else collapsedColumns.delete(col.dataset.kbCol);
    });
    /* Отложено пользователем: подборка недели. Сохранено для дальнейшей проработки.
    var picks = rows.filter(function (l) { return l.stage === 'REVIEW'; });
    put('lead-picks-count',String(picks.length)); put('lead-picks',picks.length ? picks.slice(0,3).map(function (l) { return card(l,true); }).join('') : empty('Подборка разобрана','Все лиды доступны в разделе «Лиды».'));
    */
    var cols = boardGroups(rows);
    el('lead-board').dataset.leadBoardGrouping = boardGrouping;
    put('lead-board-track',cols.map(function (s) {
      var cards = s.cards;
      var tone = s.tone === 'red' ? 'primary' : s.tone;
      var volume = cards.reduce(function (sum,l) { return sum + (Number(l.amountMln) || 0); },0);
      var unknown = cards.filter(function (l) { return l.amountMln == null; }).length;
      return '<section class="kbcol kbcol--' + tone + (collapsedColumns.has(s.code) ? ' kbcol--collapsed' : '') + '" data-kb-col="' + esc(s.code) + '" data-kb-name="' + esc(s.title) + '"><header class="kbcol__head"><span class="kbcol__marker" aria-hidden="true"></span><span class="kbcol__name">' + esc(s.title) + '</span><span class="kbcol__vname" aria-hidden="true">' + esc(s.title) + '</span><span class="badge badge--text badge--s" data-kb-count>' + cards.length + '</span><span class="kbcol__acts"><button type="button" class="ibtn ibtn--neutral ibtn--s" data-menu="lead-column-menu" aria-label="Действия с колонкой «' + esc(s.title) + '»"><i data-icon="more-dots"></i></button></span></header><div class="kbcol__body" data-kb-body>' + (cards.length ? cards.map(function (l) { return card(l,false); }).join('') : empty('Нет лидов','Переместите сюда подходящий лид.')) + '</div><div class="lead-colsum" data-lead-column-total="' + volume + '"><div class="lead-colsum__row"><span class="lead-colsum__label">Объём, млн RUB</span><span class="lead-colsum__value">' + money(volume) + '</span></div>' + (unknown ? '<span class="lead-colsum__label">Без оценки: ' + unknown + '</span>' : '') + '</div></section>';
    }).join('') || empty('Проекты не найдены','Измените фильтр или выберите другую группировку.'));
    /* Отложено пользователем: сводка и план квартала. Сохранено для дальнейшей проработки.
    var all = store.all(), active = all.filter(function (l) { return l.owner === '04127' && l.stage !== 'REVIEW' && !stages.get(l.stage).final; });
    var summary = [['В подборке',all.filter(function (l) { return l.picked && l.stage === 'REVIEW'; }).length,'picks'],['В работе',active.length,'work'],['Без движения более 14 дней',active.filter(function (l) { return days(l)>14; }).length,'stale']];
    put('lead-summary',summary.map(function (x) { return '<section class="tile col-4" style="grid-column:span 4"><header class="tile__header"><div class="tile__header-main"><div class="tile__title-row"><h3 class="tile__title">' + esc(x[0]) + '</h3></div></div></header><div class="tile__body">' + fields([rof('Неделя 42', '<span class="ds-h3-strong">' + x[1] + '</span>'),rof('Действие',btn('Показать','summary-' + x[2],null,null,true))],2) + '</div></section>'; }).join(''));
    var plan = window.IBPR.clients().filter(function (c) { return c.inQuarterPlan; });
    var withLeads = plan.filter(function (c) { return active.some(function (l) { return l.clientId === c.id; }); }).length;
    var meetings = window.IBPR.meetings('MY').filter(function (m) { return m.date >= '2026-10-12' && m.date <= '2026-10-18'; }).length;
    var transferred = all.filter(function (l) { return l.stage === 'PIPELINE'; });
    put('lead-quarter-plan','Клиенты плана Q4: ' + plan.length + ' · с лидами в работе ' + withLeads + ' · без лидов ' + (plan.length-withLeads) + ' · Встречи недели: ' + meetings + ' · Передано за Q4: ' + transferred.length + ' · ' + money(transferred.reduce(function (sum,l) { return sum+(l.amountMln||0); },0)) + ' млн RUB · ' + link('Открыть клиентов',nav.href('clients',{mode:'after'})));
    */
    if (window.DSKanban) { window.DSKanban.bind(el('lead-board')); window.DSKanban.sync(el('lead-board')); }
    el('lead-board').querySelectorAll('.kbcard').forEach(function (node) {
      node.setAttribute('aria-roledescription',boardGrouping === 'status' ? 'карточка, перетаскиваемая' : 'карточка проекта');
      if (boardGrouping !== 'status') {
        var l = store.get(node.dataset.leadId), state = stages.get(l.stage);
        node.querySelector('.tile__chiplist').insertAdjacentHTML('beforeend',chip(state.title,state.tone));
      }
    });
  }
  // Основание лида — строки [подпись, значение, на всю ширину]: их рисуют и тайл страницы лида, и панель просмотра.
  function basisRows(l) {
    var rows = [];
    l.basis.forEach(function (b) { var src = b.type === 'MEETING' ? window.IBPR.meeting(b.sourceId) : stages.basis[b.type].page === 'opportunity' ? window.IBPR.opportunity(b.sourceId) : window.IBPR.potential(b.sourceId);
      rows.push([stages.basis[b.type].title, basisChip(b.type,true) + ' ' + link(String(b.sourceId),store.basisHref(b)), true], ['Создан', date(src.createdAt)], ['Автор', esc((window.IBPR.employee(src.createdBy) || {}).fullName || 'Система')]);
    });
    return rows.concat([['ТБ / ГОСБ', esc(window.IBPR.lbl.terBank(l.client.terBank) + ' / ' + l.client.gosb), true], ['Продукты источника', esc((l.source.productLabels || l.products).join(', ') || '—'), true]]);
  }
  function renderBasis(l) { return fields(basisRows(l).map(function (r) { return rof(r[0], r[1], r[2]); }), 2); }
  function stageIndex(l) { var code=l.stage;if(code==='DECLINED'||code==='NOT_TAKEN')code=l.history.length?l.history[l.history.length-1].from:'REVIEW';return stages.all.findIndex(function(s){return s.code===code;}); }
  function stageMark(s,i,current,failed) { var status = i<current ? 'done' : i===current ? failed?'error':'current' : ''; return '<span class="stepmark stepmark--s' + (status ? ' stepmark--'+status : '') + '" aria-hidden="true"><span class="stepmark__num">'+(i+1)+'</span><i class="stepmark__icon" data-icon="check"></i><i class="stepmark__icon stepmark__icon--error" data-icon="alert-circle"></i></span>'; }
  function renderLead(l) {
    if (!l) { put('lead-page-title','Лид не найден'); put('lead-page-actions','');crumb('Лид не найден');var main=document.querySelector('main');Array.from(main.children).forEach(function(c){if(!c.classList.contains('phead'))c.hidden=true;});if(el('lead-path'))el('lead-path').hidden=true;main.insertAdjacentHTML('beforeend',empty('Лид не найден','Вернитесь в реестр лидов.'));return; }
    var s = stages.get(l.stage), index = stageIndex(l);
    put('lead-page-title',esc(l.id+' · '+l.clientName)); crumb(l.id);
    put('lead-page-chips',chip(s.title,s.tone)+basisHtml(l));
    put('lead-page-subtitle','<span class="phead__meta">Ответственный: '+esc(owner(l))+' · Появился '+date(l.createdAt)+' · '+days(l)+' дн. на стадии</span>');
    put('lead-page-actions',btn('Путь лида','path-expand')+(!s.final ? btn('Клиент отказался','decline') : '')+btn(l.stage==='MEETING_DONE' && l.repeatNeeded && l.meetings.some(function(m){return m.statusCode==='SCHEDULED';})?'Итоги повторной встречи':s.action,'primary',l.id,'accent'));
    put('lead-stage-track',stages.workflow.map(function (stage,i) { return '<span class="lead-stage-track__item">'+stageMark(stage,i,index)+'<span class="ds-body-s">'+esc(stage.title)+'</span></span>'; }).join(''));
    put('lead-client-body',fields([rof('Клиент',link(l.clientName,nav.href('client',{id:l.clientId,mode:'after'})),true),rof('Холдинг',esc(l.holdingName),true),rof('ИНН',esc(l.client.inn)),rof('Приоритет',esc(l.client.quarterPlan || '—'))]));
    document.querySelector('[data-lead-basis-body]').innerHTML = renderBasis(l);
    document.querySelector('[data-lead-stage-body]').innerHTML = fields([rof('Стадия',chip(s.title,s.tone)),rof('Дней на стадии',String(days(l))),rof('Следующий шаг',esc(l.nextStep.title),true),rof('Срок',date(l.nextStep.dueDate)),rof('Подборка',l.picked?'Неделя 42':'Все лиды')]) + '<div class="lead-pick-footer">'+btn('Почему рекомендован','reasons',l.id,null,true)+'</div>';
    put('lead-idea-body',fields([rof('Идея сделки',esc(l.idea||'—'),true),rof('Продукты',l.products.map(function (p) { return chip(p,'lblue'); }).join(' ') || '—',true),rof('Объём, млн RUB',money(l.amountMln)),rof('Валюта',chip('RUB','grey'))],4));
    put('lead-timing-body',fields([rof('Появился',date(l.createdAt)),rof('Последняя активность',date(l.lastActivityAt)),rof('Срок следующего шага',date(l.nextStep.dueDate),true)]));
    put('lead-meetings-body',(l.meetings.length ? simpleTable(['Встреча','Дата','Статус','Повестка'],l.meetings.map(function (m) { return [link(m.id,nav.href('meetings',{id:m.id,mode:'after'})),date(m.date),esc(window.IBPR.lbl.meetingStatus(m.statusCode)),esc(m.agenda.map(function (x) { return x.title; }).join('; '))]; })) : empty('Встреч пока нет','Назначьте встречу из карточки лида.')) + (l.protocol ? '<p class="ds-body-s">Итоги: '+esc(l.protocol)+'</p>' : '') + (l.stage==='MEETING_DONE' ? btn('Повторная встреча','repeat',l.id) : ''));
    put('lead-tasks-body',simpleTable(['Задача клиента','Статус'],l.tasks.map(function (t) { return [link(t.title||t.name||String(t.id),nav.href('tasks',{id:t.id,mode:'after'})),esc(window.IBPR.lbl.taskStatus(t.statusCode))]; }))+(l.comments.length ? l.comments.map(function (c) { return '<p class="ds-body-s">'+esc(typeof c === 'string' ? c : c.text)+'</p>'; }).join('') : '<p class="note note--s"><span class="note__text">Комментариев по лиду пока нет. Задачи выше показаны в контексте клиента.</span></p>'));
    var f = l.source.financials;
    put('lead-finance-body',f ? fields([rof('Общий объём, млн RUB',money(f.totalVolume)),rof('Итоговый доход, млн RUB',money(f.totalIncome)),rof('Процентный доход, млн RUB',money(f.interestIncome)),rof('Комиссионный доход, млн RUB',money(f.commissionIncome))],2) : '<p class="note note--s"><span class="note__text">В источнике нет финансовых метрик. '+link('Открыть финпоказатели клиента',nav.href('client',{id:l.clientId,tab:'ClientInfoFinancials',mode:'after'}))+'</span></p>');
    put('lead-team-body',fields([rof('Ответственный',esc(owner(l)),true),rof('Дески',esc((l.source.desks||[]).map(function (d) { return window.IBPR.lbl.desk(d.deskId); }).join('; ') || 'SMB Природные ресурсы +6'),true),rof('Связи',l.opportunityId ? link('Сделка '+l.opportunityId,nav.href('opportunity',{id:l.opportunityId,source:'pipeline',mode:'after'})) : 'Передачи в Pipeline пока нет',true)]));
    document.querySelector('[data-lead-history-table]').innerHTML = l.history.length ? simpleTable(['Дата','Событие','Стадия'],l.history.map(function (h) { return [date(h.date),esc(h.title),esc(stages.get(h.to).title)]; })) : empty('Нет событий','История появится после первого решения по лиду.');
    document.querySelectorAll('[data-lead-action="edit"],[data-lead-action="meeting"],[data-lead-action="repeat"]').forEach(function(b){b.disabled=!!s.final;});
    put('lead-live','Текущая стадия: '+esc(s.title)); renderPath(l);
  }
  function simpleTable(headers,rows) {
    if (!rows.length) return empty('Нет записей','Связанные записи появятся по мере работы.');
    var cols = '8px '+headers.map(function () { return 'minmax(0,1fr)'; }).join(' ')+' 8px';
    return '<div class="dtable"><div class="dtable__body"><div class="tbl" data-table><div class="tbl__row tbl__row--head" style="grid-template-columns:'+cols+'"><div class="th th--separator"></div>'+headers.map(function (h,i) { return window.IBPR_TABLE.headCell({key:'s'+i,label:h,sort:false},false); }).join('')+'<div class="th th--separator"></div></div>'+rows.map(function (row) { return '<div class="tbl__row" style="grid-template-columns:'+cols+'"><div class="tc tc--separator"></div>'+row.map(function (cell,i) { return '<div class="tc" data-col="s'+i+'"><span class="tc__row"><span class="tc__text tc__text--truncate">'+cell+'</span></span></div>'; }).join('')+'<div class="tc tc--separator"></div></div>'; }).join('')+'</div></div></div>';
  }
  function pathState(value) {
    var root = el('lead-path'); if (!root) return;
    if (value) { root.dataset.pathState=value; try { localStorage.setItem('ibp-redesign-v2-path',value); } catch(e) {} }
    root.hidden=root.dataset.pathState==='hidden'; root.querySelector('[data-path-pill]').hidden=root.dataset.pathState!=='collapsed'; root.querySelector('[data-path-expanded]').hidden=root.dataset.pathState!=='expanded';
  }
  function renderPath(l) {
    if (!el('lead-path')) return;
    var current=stageIndex(l), check=stages.checks(l), missing=check.filter(function (c) { return !c.done && !c.optional; });
    var pathStages=stages.workflow.filter(function (s) { return !s.final; });
    document.querySelector('[data-path-label]').textContent='Путь лида · '+Math.min(current+1,pathStages.length)+' из '+pathStages.length+' · '+stages.get(l.stage).title+' · '+missing.length+' осталось';
    document.querySelector('[data-path-body]').innerHTML=pathStages.map(function (s,i) { return '<div class="lc-lead-path__step">'+stageMark(s,i,current)+'<div><div class="ds-body-s-strong">'+esc(s.title)+'</div>'+(i===current ? '<p class="ds-body-s">'+esc(s.goal)+'</p>'+check.map(function (c) { return '<p class="ds-body-s">'+(c.done?'✓ ':'○ ')+esc(c.title)+' '+(!c.done?btn('Заполнить',c.action,l.id,'transparent',true):'')+'</p>'; }).join('') : '')+'</div></div>'; }).join('');
    var button=document.querySelector('[data-path-next]'), next=stages.next(l);
    button.disabled=stages.get(l.stage).final || missing.length>0 || !next;
    button.querySelector('.btn__label').textContent=next?'К «'+stages.get(next).title+'»':'Работа завершена';
    button.title=missing.length?'Не выполнено: '+missing.map(function (c) { return c.title; }).join(', '):'';
    if(l.stage==='MEETING_DONE') document.querySelector('[data-path-body]').insertAdjacentHTML('beforeend',btn('Назначить повторную встречу','repeat',l.id));
    pathState();
  }
  /* Быстрый просмотр лида — Drawer ДС w5 (MS0016 §5.6, по примеру человека 13.10.2026).
     Шапка: путь «Лиды › номер», название лида, «Открыть лид», крестик. Тело: Entity L
     клиента (холдинг, чипы признаков) и команда клиента в банке (Avatar group, список в
     тултипе), тулбар действий, Tab с панелями. Подвала нет: по ДС он только для подтверждения. */
  var pvTab = 'overview';
  function drof(label, value, full) { return '<div class="rof' + (full ? ' drawer__grid-full' : '') + '"><span class="ds-label"><span class="ds-label__text">' + esc(label) + '</span></span><div class="rof__row"><span class="rof__value">' + value + '</span></div></div>'; }
  function dgrid(items) { return '<div class="drawer__grid">' + items.join('') + '</div>'; }
  function dsec(title, html) { return '<section class="drawer__sec">' + (title ? '<div class="drawer__sechead"><h3 class="drawer__sectitle">' + esc(title) + '</h3></div>' : '') + html + '</section>'; }
  function tbtn(text, action, id, icon, tone) {
    return '<button type="button" class="btn btn--' + (tone || 'outline') + ' btn--s" data-lead-action="' + action + '" data-lead-id="' + esc(id) + '">'
      + (icon ? '<i data-icon="' + icon + '"></i>' : '') + '<span class="btn__label">' + esc(text) + '</span></button>';
  }
  function pvEntity(l) {
    var c = l.client, T = window.IBPR_TABLE, cs = clientStatus(l), chips = [chip(cs.title, cs.tone)];
    if (c.quarterPlan) chips.push(T.chip(c.quarterPlan, { icon: 'calendar' }));
    if (c.didGrowthCompany) chips.push(T.chip('Компания роста ДИД', { icon: 'trend-up' }));
    if (c.topClient) chips.push(T.chip('Топ клиент', { icon: 'star' }));
    if (c.keyClient) chips.push(T.chip('Ключевой клиент'));
    return '<a class="entity entity--l entity--interactive" href="' + esc(nav.href('client', { id: l.clientId, mode: 'after' })) + '" aria-label="Карточка клиента ' + esc(l.clientName) + '">'
      + '<div class="entity__lead"><span class="entity__icon lead-pv-client-icon" aria-hidden="true"><i data-icon="factory-01"></i></span></div>'
      + '<div class="entity__main"><div class="entity__titles"><p class="entity__header">' + esc(l.holdingName) + '</p>'
      + '<div class="entity__labelrow"><span class="entity__label entity__label--truncate" data-tooltip="' + esc(l.clientName) + '" data-tooltip-truncated="only">' + esc(l.clientName) + '</span></div></div>'
      + '<div class="entity__chips">' + chips.join('') + '</div></div></a>';
  }
  // Команда клиента в банке — менеджеры без фото (инициалы), как получатели доступа в AI Pitcher v02.
  function pvTeam(l) {
    var roles = window.EMPLOYEE_ROLE_LABELS || {};
    var team = (l.client.team || []).map(function (m) {
      var e = window.IBPR.employee(m.employeeId) || {};
      return { name: e.fullName || m.employeeId, initials: e.initials || '—', role: roles[m.roleCode] || '' };
    });
    if (!team.length) return '';
    var names = team.map(function (p) { return p.name + (p.role ? ' — ' + p.role : ''); }).join(', ');
    return '<span class="av-group av-group--m" role="group" tabindex="0" aria-label="Команда клиента в банке: ' + esc(names) + '" data-tooltip="' + esc('Команда клиента: ' + names) + '" data-tooltip-multiline="yes">'
      + team.slice(0, 4).map(function (p) { return '<span class="av av--circular av--m" aria-hidden="true"><span class="av__text">' + esc(p.initials) + '</span></span>'; }).join('')
      + (team.length > 4 ? '<span class="av-group__more" aria-hidden="true">+' + (team.length - 4) + '</span>' : '') + '</span>';
  }
  function pvToolbar(l) {
    var s = stages.get(l.stage), open = !s.final && l.stage !== 'REVIEW';
    var repeat = l.stage === 'MEETING_DONE' && l.repeatNeeded && l.meetings.some(function (m) { return m.statusCode === 'SCHEDULED'; });
    var step = nextStep(l);
    var b = [tbtn(repeat ? 'Итоги повторной встречи' : step.label, repeat ? 'primary' : step.action, l.id, null, 'accent')];
    if (open) b.push(tbtn('Идея и продукты', 'edit', l.id, 'edit'), tbtn('Встреча', 'meeting', l.id, 'calendar-plus'));
    b.push(tbtn('Комментарий', 'comment', l.id, 'message-text'));
    // Редкие и необратимые исходы — в меню «Ещё действия» (ContextMenu ДС): ряд не переносится на вторую строку.
    var more = l.stage === 'REVIEW' ? [['Не беру', 'not-taken']] : open ? [['Клиент отказался', 'decline']] : [];
    if (more.length) b.push('<span class="menu-anchor"><button type="button" class="btn btn--outline btn--s btn--icon-only" aria-label="Ещё действия" data-menu="lead-pv-menu" data-menu-align="end"><i data-icon="more-dots"></i></button>'
      + '<div class="menu" id="lead-pv-menu" role="menu">' + more.map(function (m) { return '<button type="button" class="menu__item menu__item--danger" role="menuitem" data-lead-action="' + m[1] + '" data-lead-id="' + esc(l.id) + '"><span class="menu__item-label">' + m[0] + '</span></button>'; }).join('') + '</div></span>');
    return '<div class="lead-toolbar__group" role="toolbar" aria-label="Действия с лидом">' + b.join('') + '</div>';
  }
  /* Целевое действие — следующий шаг по Roadmap (решение пользователя 21.10.2026):
     первый невыполненный обязательный пункт стадии, а когда всё сделано —
     переход на следующую стадию. Раньше кнопка показывала фиксированное
     действие стадии («Описать идею») и при уже описанной идее звала его снова. */
  var STEP_LABEL = { edit: 'Заполнить идею', outcome: 'Зафиксировать итоги', documents: 'Заполнить документы', basis: 'Открыть основание' };
  function nextStep(l) {
    var s = stages.get(l.stage);
    if (s.final || l.stage === 'REVIEW') return { label: s.action, action: 'primary' };
    var pending = stages.checks(l).filter(function (c) { return !c.done && !c.optional; })[0];
    if (pending) {
      var label = pending.action === 'meeting' ? (l.meetings.length ? 'Заполнить встречу' : 'Назначить встречу') : STEP_LABEL[pending.action] || 'Заполнить';
      return { label: label, action: pending.action };
    }
    if (l.stage === 'DOCUMENTS' || l.stage === 'MEETING_DONE') return { label: s.action, action: 'primary' };
    // короткий глагол перехода: ряд тулбара превью не должен переноситься
    var ADVANCE = { RESEARCH: 'В проработку', MEETING_PLANNED: 'Встреча назначена', MEETING_DONE: 'Встреча проведена', DOCUMENTS: 'К документам' };
    return { label: ADVANCE[stages.next(l)] || 'Следующая стадия', action: 'advance' };
  }
  // [ПРЕДЛОЖЕНИЕ] Roadmap стадии: ближайшее действие, прогресс обязательных пунктов, затем выполненное.
  function pvPath(l) {
    var s = stages.get(l.stage), checks = stages.checks(l);
    var step = nextStep(l);
    if (!checks.length) return '<section class="lead-worklist" aria-label="Roadmap"><h3 class="ds-body-m-strong">Roadmap</h3><p class="ds-body-s">' + esc(s.goal) + '</p>' + btn(step.label, step.action, l.id, 'outline', true) + '</section>';
    var required = checks.filter(function (c) { return !c.optional; });
    var done = required.filter(function (c) { return c.done; }).length;
    var pending = checks.filter(function (c) { return !c.done && !c.optional; });
    var optional = checks.filter(function (c) { return !c.done && c.optional; });
    var completed = checks.filter(function (c) { return c.done; });
    var next = pending[0] || optional[0];
    function item(c) {
      var state = c.done ? 'done' : c === next ? 'next' : 'pending';
      return '<li class="lead-worklist__item" data-work-state="' + state + '"><span class="lead-worklist__mark" aria-hidden="true"><i data-icon="' + (c.done ? 'check' : c === next ? 'arrow-right' : 'circle') + '"></i></span>'
        + '<div class="lead-worklist__copy"><span class="ds-body-s-strong">' + esc(c.title) + '</span><span class="lead-worklist__hint">' + (c.done ? 'Выполнено' : c.optional ? 'Необязательно' : c === next ? 'Следующее действие' : 'Осталось сделать') + '</span></div>'
        + (!c.done && !s.final ? btn(c.action === 'basis' ? 'Открыть' : 'Заполнить', c.action, l.id, c === next ? 'accent' : 'transparent', true) : '') + '</li>';
    }
    var meter = required.length ? '<div class="pbar pbar--accent" role="progressbar" aria-label="Готовность текущей стадии" aria-valuemin="0" aria-valuemax="' + required.length + '" aria-valuenow="' + done + '" aria-valuetext="Выполнено ' + done + ' из ' + required.length + '"><div class="pbar__head"><span class="pbar__label">Готовность стадии</span><span class="pbar__value">' + done + ' из ' + required.length + '</span></div><div class="pbar__track"><div class="pbar__fill" style="width:' + Math.round(done / required.length * 100) + '%"></div></div></div>' : '';
    var body = pending.concat(optional).length ? '<ul class="lead-worklist__items">' + pending.concat(optional).map(item).join('') + '</ul>' : '';
    if (completed.length) body += '<div class="lead-worklist__completed"><p class="lead-worklist__hint">Сделано · ' + completed.length + '</p><ul class="lead-worklist__items">' + completed.map(item).join('') + '</ul></div>';
    if (required.length && !pending.length && !s.final) body += '<div class="lead-worklist__ready"><span class="ds-body-s">Всё готово к следующему шагу</span>' + btn(step.label, step.action, l.id, 'accent', true) + '</div>';
    return '<section class="lead-worklist" aria-label="Roadmap"><div class="lead-worklist__head"><h3 class="ds-body-m-strong">Roadmap</h3><span class="lead-worklist__hint">Текущая стадия</span></div><p class="ds-body-s">' + esc(s.goal) + '</p>' + meter + body + '</section>';
  }
  // Связь только по объекту, без подмешивания остальных задач клиента.
  function pvRelatedTasks(l) {
    return window.IBPR.tasks().filter(function (t) {
      if (t.sourceType === 'UNIFIED_LEAD' && String(t.sourceId) === String(l.id)) return true;
      var o = t.linkedObject || {};
      if ((o.typeCode === 'UNIFIED_LEAD' || o.typeCode === 'LEADS') && String(o.number) === String(l.id)) return true;
      return l.basis.some(function (b) {
        var meta = stages.basis[b.type];
        var type = b.type === 'MEETING' ? 'MEETINGS' : meta.page === 'opportunity' ? 'DEALS' : 'POTENTIALS';
        var source = new URLSearchParams(o.params || '').get('source');
        return o.typeCode === type && String(o.number) === String(b.sourceId) && (!source || !meta.source || source === meta.source);
      });
    });
  }
  /* Сводка лида карточками Tile Inset (решение пользователя 21.10.2026, образец —
     дашборд с блоками-карточками): стадия и срок · объём и продукты · ответственный и даты. */
  function pvFacts(l, s) {
    function card(cls, body) { return '<section class="tile tile--inset tile--headless lead-fact' + cls + '"><div class="tile__body">' + body + '</div></section>'; }
    function top(label, addon) { return '<div class="lead-fact__top"><span class="ds-body-xs lead-fact__label">' + esc(label) + '</span>' + (addon || '') + '</div>'; }
    var who = owner(l), initials = who.split(/\s+/).slice(0, 2).map(function (w) { return w.charAt(0); }).join('');
    var d = days(l);
    return '<div class="lead-facts">'
      + card('', top('Стадия', chip(s.title, s.tone))
        + '<div class="lead-fact__value"><span class="ds-h3-strong">' + d + '</span><span class="ds-body-s">дн. на стадии</span></div>'
        + '<p class="ds-body-xs lead-fact__meta">Срок шага · ' + date(l.nextStep.dueDate) + '</p>')
      + card('', top('Объём')
        + '<div class="lead-fact__value"><span class="ds-h3-strong">' + money(l.amountMln) + '</span><span class="ds-body-s">млн RUB</span></div>'
        + (l.products.length ? '<div class="lead-fact__chips">' + l.products.map(function (p) { return chip(p, 'lblue'); }).join('') + '</div>' : '<p class="ds-body-xs lead-fact__meta">Продукт не выбран</p>'))
      + card(' lead-fact--wide', top('Ответственный', '<span class="ds-body-xs lead-fact__label">' + (l.picked ? 'Подборка · Неделя 42' : 'Все лиды') + '</span>')
        + '<div class="lead-fact__person"><span class="lead-fact__who"><span class="av av--circular av--m" aria-hidden="true"><span class="av__text">' + esc(initials) + '</span></span><span class="ds-body-m-strong">' + esc(who) + '</span></span>'
        + '<span class="lead-fact__dates"><span class="ds-body-xs"><span class="lead-fact__label">Появился</span> ' + date(l.createdAt) + '</span><span class="ds-body-xs"><span class="lead-fact__label">Активность</span> ' + date(l.lastActivityAt) + '</span></span></div>')
      + '</div>';
  }
  function pvTasks(items, l) {
    if (!items.length) return empty('Связанных задач пока нет', 'Здесь появятся задачи, связанные с этим лидом или его основанием.');
    return '<div class="lead-pv-task-list">' + items.map(function (t) {
      var o = t.linkedObject || {}, employee = window.IBPR.employee(t.executorId) || {};
      return '<article class="lead-pv-task"><div class="ds-body-s-strong">' + link(t.title || t.name || String(t.id), nav.href('tasks', { id: t.id, mode: 'after' })) + '</div>'
        + '<div class="lead-pv-task__meta"><span class="ds-body-xs">№ ' + esc(t.id) + '</span><span class="ds-body-xs">До ' + date(t.dueDate) + '</span><span class="ds-body-xs">' + esc(window.IBPR.lbl.taskStatus(t.statusCode)) + '</span></div>'
        + '<p class="ds-body-xs">' + esc(employee.fullName || 'Исполнитель не указан') + '</p><p class="lead-worklist__hint">' + esc(o.number ? 'Основание: ' + (o.name || o.number) : 'Лид: ' + l.id) + '</p></article>';
    }).join('') + '</div>';
  }
  function pvComments(l) {
    var entries = l.comments.map(function (c) { return typeof c === 'string' ? { text: c } : c; });
    var groups = [];
    entries.slice().sort(function (a, b) { return (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0); }).forEach(function (c) {
      var day = c.createdAt ? new Intl.DateTimeFormat('ru-RU', { timeZone: 'Europe/Moscow', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(c.createdAt)) : 'Ранее';
      var group = groups.find(function (g) { return g.day === day; });
      if (!group) { group = { day: day, entries: [] }; groups.push(group); }
      group.entries.push(c);
    });
    var header = '<div class="lead-comments__head"><div><h3 class="ds-body-m-strong">Обсуждение лида</h3><p class="ds-body-xs">Договорённости, вопросы и контекст команды</p></div>' + tbtn('Добавить', 'comment', l.id, 'add') + '</div>';
    if (!entries.length) return header + empty('Комментариев пока нет', 'Добавьте вопрос или договорённость для команды.');
    return '<div class="lead-comments">' + header + groups.map(function (g) {
      return '<section class="lead-comments__day"><h4 class="lead-comments__date">' + esc(g.day) + '</h4><div class="lead-comments__feed">' + g.entries.map(function (c) {
        var author = c.authorId ? window.IBPR.employee(c.authorId) : null;
        var name = c.system ? 'Система' : author ? author.fullName : 'Автор не указан';
        var time = c.createdAt ? new Intl.DateTimeFormat('ru-RU', { timeZone: 'Europe/Moscow', hour: '2-digit', minute: '2-digit' }).format(new Date(c.createdAt)) : '';
        var avatar = c.system ? '<span class="lead-comments__system-icon" aria-hidden="true"><i data-icon="file-basic"></i></span>' : '<span class="av av--circular av--s" aria-hidden="true"><span class="av__text">' + esc(author ? author.initials : '—') + '</span></span>';
        return '<article class="lead-comments__entry"' + (c.system ? ' data-comment-system' : '') + '>' + avatar + '<div class="lead-comments__message"><header class="lead-comments__meta"><span class="ds-body-s-strong">' + esc(name) + '</span>'
          + (time ? '<time class="ds-body-xs" datetime="' + esc(c.createdAt) + '">' + time + '</time>' : '') + '</header>'
          + (author ? '<p class="lead-comments__role">' + esc(author.position) + '</p>' : '') + '<p class="lead-comments__text ds-body-s">' + esc(c.text) + '</p></div></article>';
      }).join('') + '</div></section>';
    }).join('') + '</div>';
  }
  function pvPanels(l) {
    var s = stages.get(l.stage);
    var overview = pvPath(l) + pvFacts(l, s);
    var basis = dsec('', dgrid(basisRows(l).map(function (r) { return drof(r[0], r[1], r[2]); })));
    var meetings = dsec('', l.meetings.length ? simpleTable(['Встреча', 'Дата', 'Статус'], l.meetings.map(function (m) {
      return [link(m.id, nav.href('meetings', { id: m.id, mode: 'after' })), date(m.date), esc(window.IBPR.lbl.meetingStatus(m.statusCode))];
    })) : empty('Встреч пока нет', 'Назначьте встречу из тулбара панели.')) + (l.protocol ? dsec('Итоги', '<p class="ds-body-s">' + esc(l.protocol) + '</p>') : '');
    var history = dsec('', l.history.length ? simpleTable(['Дата', 'Событие'], l.history.map(function (h) { return [date(h.date), esc(h.title)]; }))
      : empty('Нет событий', 'История появится после первого решения по лиду.'));
    var tasks = pvRelatedTasks(l);
    var tabs = [['overview', 'Обзор', overview], ['basis', 'Основание', basis], ['tasks', 'Задачи', dsec('', pvTasks(tasks, l)), tasks.length], ['meetings', 'Встречи', meetings, l.meetings.length], ['comments', 'Комментарии', pvComments(l), l.comments.length], ['history', 'История', history, l.history.length]];
    if (!tabs.some(function (x) { return x[0] === pvTab; })) pvTab = 'overview';
    return '<div class="tabs tabs--horiz" role="tablist" aria-label="Разделы лида" id="lead-pv-tabs">' + tabs.map(function (x) {
      var on = x[0] === pvTab;
      return '<button type="button" class="tab tab--m' + (on ? ' tab--selected' : '') + '" role="tab" id="lead-pv-tab-' + x[0] + '" aria-controls="lead-pv-panel-' + x[0] + '" aria-selected="' + on + '" tabindex="' + (on ? 0 : -1) + '" data-lead-pv-tab="' + x[0] + '">'
        + '<span class="tab__label">' + x[1] + '</span>' + (x[3] != null ? '<span class="tab__badge">' + x[3] + '</span>' : '') + '</button>';
    }).join('') + '</div>' + tabs.map(function (x) {
      return '<div class="lead-pv-panel" role="tabpanel" id="lead-pv-panel-' + x[0] + '" aria-labelledby="lead-pv-tab-' + x[0] + '"' + (x[0] === pvTab ? '' : ' hidden') + '>' + x[2] + '</div>';
    }).join('');
  }
  function renderPreview(l) {
    put('lead-preview-path', esc('Лиды › ' + l.id));
    put('lead-preview-title', esc(l.idea || 'Лид ' + l.id));
    var acts = document.querySelector('#lead-preview .drawer__acts');
    if (acts && !acts.querySelector('[data-lead-action="open-lead"]')) acts.insertAdjacentHTML('afterbegin', '<span class="lead-pv-act"><button type="button" class="ibtn ibtn--neutral ibtn--m" aria-label="Открыть страницу лида" data-tooltip="Открыть страницу лида" data-lead-action="open-lead"><i data-icon="link-external"></i></button></span>');
    put('lead-preview-body', '<div class="lead-pv-head">' + pvEntity(l) + pvTeam(l) + '</div>' + pvToolbar(l) + pvPanels(l));
    var tabsEl = el('lead-pv-tabs');
    if (tabsEl && window.DSTabs) window.DSTabs.tabs(tabsEl, { onChange: function (i, b) {
      pvTab = b.dataset.leadPvTab;
      el('lead-preview').querySelectorAll('.lead-pv-panel').forEach(function (p) { p.hidden = p.id !== 'lead-pv-panel-' + pvTab; });
    } });
    bind(el('lead-preview'));
    if (window.DSTooltip && window.DSTooltip.bindAll) window.DSTooltip.bindAll(el('lead-preview'));
  }
  function preview(id) {
    var l = store.get(id); if (!l) return;
    if (previewId !== id) pvTab = 'overview';
    previewId = id; renderPreview(l);
    if (window.DSDrawer) window.DSDrawer.open(el('lead-preview'));
  }
  function renderFilter() {
    var defs = [['filter-client','Клиент',window.IBPR.clients().map(function(c){return c.name;}),'client'],['filter-holding','Холдинг',window.IBPR.clients().map(function(c){return c.holdingName;}),'holding'],['filter-owner','Ответственный',window.IBPR.employees().map(function(e){return {value:e.id,label:e.fullName};}),'owner'],['filter-stage','Стадия',stages.all.map(function(s){return {value:s.code,label:s.title};}),'stage']];
    put('lead-filter-fields',defs.map(function (x) { return select(x[0],x[1],x[2],filters[x[3]]); }).join(''));
    put('lead-filter-parameters-fields',select('filter-product','Продукт',[...new Set(store.all().flatMap(function(l){return l.products;}))],filters.product)+select('filter-industry','Отрасль',[...new Set(window.IBPR.clients().map(function(c){return c.industry;}))],filters.industry)+select('filter-bank','ТБ',Object.keys(window.DICT_TER_BANKS).map(function(k){return {value:k,label:window.DICT_TER_BANKS[k]};}),filters.bank)+input('filter-min','Объём от, млн RUB',filters.min||'','number')+input('filter-max','Объём до, млн RUB',filters.max||'','number')+input('filter-created','Появился с',filters.created||'','date')+checkbox('filter-plan','Клиент в плане Q4',filters.plan));
    bind(el('lead-filter'));
  }
  function fieldValue(id) { var node=el(id); return node ? node.dataset.value || node.value.trim() : ''; }
  function openForm(action,id,ids) {
    var l=id?store.get(id):null; formState={action:action,id:id,ids:ids};
    if(l && stages.get(l.stage).final && ['edit','meeting','repeat','outcome','documents'].includes(action))throw new Error('Сначала верните лид в работу');
    var html='',title='Работа с лидом',submit='Сохранить';
    if(action==='create') { title=page==='HomeBoard'?'Новый проект':'Новый лид'; html=select('form-client','Клиент',window.IBPR.clients().map(function(c){return {value:c.id,label:c.name};}),null); }
    if(action==='create'||action==='edit') { title=action==='edit'?'Идея и продукты':title; html+=input('form-idea','Идея сделки',l?l.idea:'','textarea')+input('form-product','Продукт',l?l.products.join(', '):'')+input('form-amount','Объём, млн RUB',l?l.amountMln||'':'','number')+input('form-due','Срок следующего шага',l?l.nextStep.dueDate:'2026-10-16','date'); }
    if(action==='meeting'||action==='repeat') { title=action==='repeat'?'Повторная встреча':'Назначить встречу'; submit='Назначить'; html=input('form-date','Дата','2026-10-15','date')+input('form-time','Время','10:00','time')+input('form-participant','Участник клиента','')+input('form-agenda','Повестка',l.idea,'textarea'); }
    if(action==='outcome') { title='Итоги встречи'; html=input('form-protocol','Итоги и договорённости',l.protocol||'','textarea'); submit='Зафиксировать итоги'; }
    if(action==='documents') { title='Подготовка документов'; html=['onePager','termSheet','clientDocs'].map(function(k,i){return checkbox('form-'+k,['One Pager согласован','Term Sheet направлен','Документы клиента проверены'][i],l.documents[k]);}).join('')+'<p class="note note--s"><span class="note__text">Демо фиксирует готовность; файлы хранятся в карточке клиента.</span></p>'; }
    if(['not-taken','decline','bulk-decline'].includes(action)) { title=action==='decline'?'Клиент отказался':'Не беру'; html=select('form-reason','Причина',stages.reasons[action==='decline'?'DECLINED':'NOT_TAKEN'],'')+input('form-comment','Комментарий','','textarea'); submit='Подтвердить'; }
    if(action==='comment') { title='Комментарий по лиду'; html=input('form-comment','Комментарий','','textarea'); }
    if(action==='bulk-owner') { title='Назначить ответственного'; html=select('form-owner','Ответственный',window.IBPR.employees().map(function(e){return {value:e.id,label:e.fullName};}),null); }
    document.querySelectorAll('.ddl[id^="form-"]').forEach(function(n){n.remove();});
    put('lead-modal-title',title); put('lead-form-fields','<div class="lead-form-fields">'+html+'</div>');
    el('lead-form-error').hidden=true; el('lead-form-submit').querySelector('.btn__label').textContent=submit;
    bind(el('lead-actions-modal'));
    if(window.DSModal) window.DSModal.open(el('lead-actions-modal'),{nested:!!window.DSModal.current()});
  }
  function transfer(id) {
    var l=store.get(id),missing=store.missing(id,'PIPELINE'); formState={action:'transfer',id:id};transferLeadId=id;
    put('lead-transfer-body','<p class="ds-body-m">'+esc(l.id+' · '+l.clientName)+'</p><p class="note note--s"><span class="note__text">Будет создана сделка в Pipeline со стадией «Проработка идеи сделки».</span></p>'+stages.checks(Object.assign({},l,{stage:'DOCUMENTS'})).map(function(c){return '<p class="ds-body-s">'+(c.done?'✓ ':'○ ')+esc(c.title)+(c.done?'':' '+btn('Заполнить',c.action,id,'transparent',true))+'</p>';}).join(''));
    el('lead-transfer-confirm').disabled=missing.length>0;
    bind(el('lead-transfer-modal')); if(window.DSModal) window.DSModal.open(el('lead-transfer-modal'),{nested:!!window.DSModal.current()});
  }
  function move(id,target,reason) { var snapshot=store.snapshot(); store.move(id,target,reason); notify('Лид '+id+' → '+stages.get(target).title,snapshot); }
  function primary(id) {
    var l=store.get(id); if(!l) return;
    if(l.stage==='MEETING_DONE' && l.repeatNeeded && l.meetings.some(function(m){return m.statusCode==='SCHEDULED';})) return openForm('outcome',id);
    var actions={REVIEW:'take',IDEA:'edit',RESEARCH:'meeting',MEETING_PLANNED:'outcome',MEETING_DONE:'advance',DOCUMENTS:'transfer',PIPELINE:'open-deal',DECLINED:'revive',NOT_TAKEN:'revive'};
    act(actions[l.stage],id);
  }
  function act(action,id) {
    id=id||currentId||previewId;
    var l=id?store.get(id):null;
    if(action==='take') return move(id,'IDEA');
    if(action==='primary') return primary(id);
    if(action==='preview') return preview(id);
    if(action==='open-lead') { window.location.href=leadHref(id); return; }
    if(action==='transfer') return transfer(id);
    if(action==='transfer-confirm') { var targetId=formState.id; move(targetId,'PIPELINE'); window.DSModal.closeTop(); return; }
    if(action==='advance') {
      var next=stages.next(l); if(!next) return;
      if(next==='PIPELINE') return transfer(id);
      var needed=store.missing(id,next); if(needed.length) return openForm(needed[0].action,id);
      return move(id,next);
    }
    if(action==='revive') { var shot=store.snapshot(); store.revive(id);notify('Лид возвращён в работу',shot);return; }
    if(action==='open-deal') { window.location.href=nav.href('opportunity',{id:l.opportunityId,source:'pipeline',mode:'after'});return; }
    if(action==='basis') { store.markBasis(id); window.location.href=store.basisHref(l.basis[0]);return; }
    if(action==='reasons') { put('lead-reasons-body',l.reasons.map(function(r){return '<p class="ds-body-s">'+esc(r)+'</p>';}).join('')); return; }
    if(action==='path-expand'||action==='path-collapse'||action==='path-hide') { pathState(action==='path-expand'?'expanded':action==='path-hide'?'hidden':'collapsed');if(action==='path-expand') el('lead-path').querySelector('[data-lead-action="path-collapse"]').focus();else if(action==='path-collapse')el('lead-path').querySelector('[data-lead-action="path-expand"]').focus();else document.querySelector('#lead-page-actions [data-lead-action="path-expand"]').focus();return; }
    if(action==='filter-clear') { el('lead-filter').querySelectorAll('input').forEach(function(n){n.value='';n.dataset.value='';n.checked=false;});if(window.DSInput)window.DSInput.syncAll(el('lead-filter'));return; }
    if(action==='filter-apply') { filters={};['client','holding','owner','stage','product','industry','bank','min','max','created'].forEach(function(k){var value=fieldValue('filter-'+k);if(value)filters[k]=value;});if(el('lead-filter').querySelector('[name="filter-plan"]').checked)filters.plan=true;pageNumber=1;selected.clear();window.DSModal.closeTop();render();return; }
    if(action==='filter-reset') { filters={};basisFilter=null;selected.clear();pageNumber=1;renderFilter();render();return; }
    if(action.startsWith('summary-')) { var key=action.slice(8); if(key==='stale'){filters.stale=true;view='table';render();}else window.location.href=nav.href('leadsNew',{tab:key,mode:'after'});return; }
    if(action.startsWith('bulk-')) {
      var ids=[...selected]; if(!ids.length)return;
      if(action==='bulk-take') { if(ids.some(function(x){return store.get(x).stage!=='REVIEW';}))throw new Error('Выберите только лиды в Рассмотрении');var shot=store.snapshot();ids.forEach(function(x){store.move(x,'IDEA');});selected.clear();notify('Лиды взяты в работу',shot);render();return; }
      if(action==='bulk-decline'&&ids.some(function(x){return store.get(x).stage!=='REVIEW';}))throw new Error('«Не беру» доступно только в Рассмотрении');
      return openForm(action,null,ids);
    }
    return openForm(action,id);
  }
  function submit(e) {
    e.preventDefault(); var f=formState,l=f.id?store.get(f.id):null,shot=store.snapshot();
    try {
      if(f.action==='create'||f.action==='edit') {
        var idea=fieldValue('form-idea'),products=fieldValue('form-product').split(',').map(function(s){return s.trim();}).filter(Boolean),amount=Number(fieldValue('form-amount'));
        if(!idea||!products.length||amount<=0)throw new Error('Заполните идею, продукт и положительный объём');
        if(f.action==='create'){var clientId=fieldValue('form-client');if(!window.IBPR.client(clientId))throw new Error('Выберите клиента из списка');var created=store.create({clientId:clientId,idea:idea,product:products[0],amountMln:amount});window.DSModal.closeTop();window.location.href=leadHref(created.id);return;}
        store.patch(f.id,{idea:idea,products:products,amountMln:amount,dueDate:fieldValue('form-due')});
      } else if(f.action==='meeting'||f.action==='repeat') {
        if(!fieldValue('form-participant')||!fieldValue('form-agenda')||!fieldValue('form-date'))throw new Error('Укажите дату, участника и повестку');
        store.schedule(f.id,{date:fieldValue('form-date'),time:fieldValue('form-time'),participant:fieldValue('form-participant'),agenda:fieldValue('form-agenda')});
        if(l.stage==='RESEARCH')store.move(f.id,'MEETING_PLANNED');
        if(f.action==='repeat')store.patch(f.id,{repeatNeeded:true});
      } else if(f.action==='outcome') {
        if(!fieldValue('form-protocol'))throw new Error('Запишите итоги встречи');
        store.outcome(f.id,fieldValue('form-protocol'));
        if(l.stage==='MEETING_PLANNED')store.move(f.id,'MEETING_DONE');
      } else if(f.action==='documents') {
        var flags={};['onePager','termSheet','clientDocs'].forEach(function(k){flags[k]=el('lead-actions-modal').querySelector('[name="form-'+k+'"]').checked;});store.documents(f.id,flags);
      } else if(f.action==='comment') {
        if(!fieldValue('form-comment'))throw new Error('Введите комментарий');if(previewId===f.id)pvTab='comments';store.comment(f.id,fieldValue('form-comment'));
      } else if(f.action==='bulk-owner') {
        var employeeId=fieldValue('form-owner');if(!window.IBPR.employee(employeeId))throw new Error('Выберите сотрудника');f.ids.forEach(function(id){store.patch(id,{owner:employeeId});});selected.clear();
      } else {
        var reason=fieldValue('form-reason');if(!reason)throw new Error('Выберите причину');
        var target=f.action==='decline'?'DECLINED':'NOT_TAKEN';(f.ids||[f.id]).forEach(function(id){store.move(id,target,reason+(fieldValue('form-comment')?' · '+fieldValue('form-comment'):''));});selected.clear();
      }
      window.DSModal.closeTop();notify('Изменения сохранены',shot);render();
    } catch(err) { el('lead-form-error').hidden=false;el('lead-form-error').querySelector('.note__text').textContent=err.message; }
  }
  function render() {
    if (transferLeadId && el('lead-transfer-modal') && !el('lead-transfer-modal').hidden) {
      var transferLead=store.get(transferLeadId);
      el('lead-transfer-confirm').disabled=store.missing(transferLeadId,'PIPELINE').length>0;
      put('lead-transfer-body','<p class="ds-body-m">'+esc(transferLead.id+' · '+transferLead.clientName)+'</p>'+stages.checks(Object.assign({},transferLead,{stage:'DOCUMENTS'})).map(function(c){return '<p class="ds-body-s">'+(c.done?'✓ ':'○ ')+esc(c.title)+(c.done?'':' '+btn('Заполнить',c.action,transferLeadId,'transparent',true))+'</p>';}).join(''));
    }
    // Открытая панель просмотра перерисовывается вместе с данными: действие из её тулбара сразу видно в ней.
    if(previewId && el('lead-preview') && !el('lead-preview').hidden){var pl=store.get(previewId);if(pl)renderPreview(pl);}
    if(page==='Lead'){renderLead(store.get(currentId));bind();return;}
    var rows=filtered();
    if(page==='HomeBoard') { renderBoard(rows);el('lead-board').hidden=view!=='board';el('lead-table-wrap').hidden=view==='board'; }
    else { el('lead-table-wrap').hidden=false; }
    renderTable(rows);
    put('lead-filter-chips',Object.keys(filters).length||basisActive()?'<span class="chip chip--edit chip--m tfilter__applied" tabindex="0"><span class="chip__label">Применено: '+(Object.keys(filters).length+(basisActive()?1:0))+'</span><span class="chip__remove" role="button" tabindex="0" aria-label="Сбросить все фильтры" data-lead-action="filter-reset"><i data-icon="close"></i></span></span>':'');
    if(page==='LeadsNew') {
      put('lead-page-subtitle',weekSummary());
      renderBasisPicker();
      document.querySelectorAll('[data-lead-tab]').forEach(function(b){var active=b.dataset.leadTab===tab;b.classList.toggle('tab--selected',active);b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;});
    }
    document.querySelectorAll('[data-lead-view],[data-lead-group]').forEach(function(b){var active=b.hasAttribute('data-lead-view')?b.dataset.leadView===view:b.dataset.leadGroup===listMode;b.setAttribute('aria-checked',String(active));b.tabIndex=active?0:-1;});
    bind();
  }
  function mount(name) {
    page=name;var params=new URLSearchParams(window.location.search);currentId=params.get('id')||'L-O166092';tab=params.get('tab')||'picks';
    if(page==='Lead'){try{el('lead-path').dataset.pathState=localStorage.getItem('ibp-redesign-v2-path')||'collapsed';}catch(e){}}
    document.body.insertAdjacentHTML('beforeend','<div class="menu" id="lead-card-menu" role="menu" hidden></div>');
    renderFilter();render();store.on(render);
    document.addEventListener('treetoggle',function(e){
      if(!e.target.matches('#lead-table') || !e.detail || !e.detail.node) return;
      if(e.detail.open) collapsedHoldings.delete(e.detail.node); else collapsedHoldings.add(e.detail.node);
    });
    ['columnsettings','columnreorder'].forEach(function(type){document.addEventListener(type,function(e){
      if(!e.target.matches('#lead-table')) return;
      if(page==='LeadsNew' && listMode==='holdings'){layoutHoldingRows(e.target);if(window.dsIcons)window.dsIcons.apply(e.target);}
      stretchClient(e.target);
    });});
    // Резиновый «Клиент»: ручной ресайз самой колонки задаёт базу, любой другой — пересчёт остатка.
    document.addEventListener('columnresize',function(e){
      if(!e.target.matches('#lead-table')) return;
      var head=e.target.querySelector('.tbl__row--head'),cell=head&&head.children[e.detail.column];
      if(cell&&cell.dataset.col==='c1')clientBase=Math.max(CLIENT_BASE/2,Math.round(e.detail.width));
      stretchClient(e.target);
    });
    var wrap=el('lead-table-wrap');
    if(wrap&&window.ResizeObserver){var lastW=0;new ResizeObserver(function(es){var w=Math.round(es[0].contentRect.width);if(w===lastW)return;lastW=w;stretchClient(el('lead-table'));}).observe(wrap);}
    if(window.DSTabs){
      var tabs=el('lead-list-tabs');
      if(tabs)window.DSTabs.tabs(tabs,{onChange:function(i,b){tab=b.dataset.leadTab;pageNumber=1;selected.clear();render();}});
    }
    document.addEventListener('click',function(e){
      var columnButton=e.target.closest('[data-menu="lead-column-menu"]');
      if(columnButton){var col=columnButton.closest('[data-kb-col]');el('lead-column-collapse-label').textContent=col.classList.contains('kbcol--collapsed')?'Развернуть колонку':'Свернуть колонку';}
      var menuButton=e.target.closest('[data-menu-lead]');if(!menuButton)return;var menuId=menuButton.dataset.menuLead;put('lead-card-menu',[['Открыть предпросмотр','preview'],['Следующий шаг','primary'],['Клиент отказался','decline']].map(function(item){return '<button type="button" class="menu__item" role="menuitem" data-lead-action="'+item[1]+'" data-lead-id="'+esc(menuId)+'"><span class="menu__item-label">'+item[0]+'</span></button>';}).join(''));
    },true);
    el('lead-action-form').addEventListener('submit',submit);
    document.addEventListener('click',function(e){
      var action=e.target.closest('[data-lead-action]'),row=e.target.closest('[data-lead-row]'),reason=e.target.closest('[data-reasons-for]');
      if(reason){put('lead-reasons-body',store.get(reason.dataset.reasonsFor).reasons.map(function(r){return '<p class="ds-body-s">'+esc(r)+'</p>';}).join(''));}
      if(action){e.preventDefault();e.stopPropagation();try{act(action.dataset.leadAction,action.dataset.leadId);}catch(err){error(err.message);}return;}
      if(row&&!e.target.closest('a,button,input,label'))preview(row.dataset.leadRow);
    });
    document.addEventListener('dblclick',function(e){var r=e.target.closest('[data-lead-row]');if(r)window.location.href=leadHref(r.dataset.leadRow);});
    document.addEventListener('change',function(e){if(e.target.dataset.leadCheck){if(e.target.checked)selected.add(e.target.dataset.leadCheck);else selected.delete(e.target.dataset.leadCheck);updateBulk();}if(e.target.hasAttribute('data-lead-select-all')){document.querySelectorAll('[data-lead-check]').forEach(function(n){n.checked=e.target.checked;if(n.checked)selected.add(n.dataset.leadCheck);else selected.delete(n.dataset.leadCheck);});updateBulk();}});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&el('lead-path')&&!window.DSModal.current()){pathState('collapsed');document.querySelector('[data-lead-action="path-expand"]').focus();}});
    document.addEventListener('keydown',function(e){var reset=e.target.closest('.chip__remove[data-lead-action="filter-reset"]');if(reset&&(e.key==='Enter'||e.key===' ')){e.preventDefault();act('filter-reset');}});
    var board=el('lead-board');
    if(board){
      // Рантайм не имеет readonly-режима: блокируем захват карточки до его делегированных
      // обработчиков, сохраняя обычные клики, меню и клавиатурное открытие предпросмотра.
      board.addEventListener('pointerdown',function(e){if(boardGrouping!=='status'&&e.target.closest('.kbcard'))e.stopPropagation();},true);
      board.addEventListener('keydown',function(e){
        var c=e.target.closest('.kbcard');if(!c)return;
        if(boardGrouping!=='status'&&(e.key===' '||e.key==='Spacebar'||e.key.indexOf('Arrow')===0)){
          e.stopPropagation();if(e.target===c)e.preventDefault();
        }
        if(e.key==='Enter'&&e.target===c){e.preventDefault();preview(c.dataset.kbCard);}
      },true);
      board.addEventListener('kanban:beforemove',function(e){e.preventDefault();if(boardGrouping!=='status')return;var id=e.detail.card.dataset.kbCard,target=e.detail.to.dataset.kbCol;if(!stages.get(target))return;setTimeout(function(){try{if(target==='PIPELINE')transfer(id);else if(target==='DECLINED')openForm('decline',id);else{var missing=store.missing(id,target);if(missing.length)openForm(missing[0].action,id);else move(id,target);}}catch(err){error(err.message);}},0);});
      board.addEventListener('kanban:open',function(e){preview(e.detail.card.dataset.kbCard);});
    }
  }
  window.LeadUI={mount:mount,preview:preview,render:render,openViewSettings:openViewSettings,clientTable:function(host,clientId){
    function draw(){var rows=store.all().filter(function(l){return l.clientId===clientId;});host.innerHTML='<header class="tile__header"><div class="tile__header-main"><div class="tile__title-row"><h3 class="tile__title">Лиды клиента</h3><span class="badge badge--text badge--s">'+rows.length+'</span></div></div></header><div class="tile__body">'+simpleTable(['Лид','Основание','Идея','Стадия','Объём, млн RUB'],rows.map(function(l){return [link(l.id,leadHref(l.id)),basisHtml(l),esc(l.idea),chip(stages.get(l.stage).title,stages.get(l.stage).tone),money(l.amountMln)];}))+'</div>';bind(host);}
    draw();store.on(draw);
  }};
})();
