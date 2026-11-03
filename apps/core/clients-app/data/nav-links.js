/* =========================================================================
   nav-links.js — меню и карта страниц модулей Core. Один
   источник для всех страниц (MS0014a, С1).

   Страница держит в разметке только анатомию NavPanel: .nav__top (бургер и
   пин), пустой .nav__list[data-nav-list] и .nav__footer со строкой
   пользователя — ссылкой на хаб. Пункты меню, имя и роль пользователя
   заполняет IBPR_NAV.mount() из каталога роли «Аналитик ДИД»
   (design-system/patterns/HomeRoles/ibp-home.js) и этой карты. Анатомия в
   разметке нужна сторожам: Б31 сенсора читает .nav__pin и .nav__user,
   П5 сторожа хаба — ссылку строки пользователя на хаб.

   Имена страниц — имена фронтенда (MS0014a, раздел 3). Страница с метками
   <ds-include> открывается собранной .preview.html: по file:// fetch не
   работает, поэтому ссылка всегда ведёт на сборку.

   Пункт без страницы (null) — вне объёма части 1 (Р5): виден как в системе,
   клик гасится, адрес не меняется, сообщения нет.

   Подключается после ds-body.js (ibp-home.js), employees.js.
   API: window.IBPR_NAV
     PAGES — ключ страницы → файл; href(key, params) → адрес
     mount({ active }) — заполнить меню; active — id пункта каталога или 'home'
     select(key) — перенести выделение на пункт страницы key; itemOf(key) — id пункта
     inert(root) — погасить клики по [data-inert] внутри root
   ========================================================================= */
(function () {
  'use strict';
  var requestedRole = new URLSearchParams(location.search).get('role');
  var currentRole = (window.localUserList || []).filter(function (u) { return u.code === requestedRole; })[0]
    || (window.localUserList || []).filter(function (u) { return u.code === 'core_analyst'; })[0];
  var roleCode = currentRole ? currentRole.code : 'core_analyst';

  /** Страницы концепта: ключ → файл (имя фронтенда, сборка .preview.html). */
  var PAGES = {
    home: window.roleHomeHref(roleCode),
    binding: '../../drafts/ibp-redesign-v1/pages/BindingActiveNewOpportunities.preview.html',
    possible: '../../drafts/ibp-redesign-v1/pages/PossibleActiveNewOpportunities.preview.html',
    cib: '../../drafts/ibp-redesign-v1/pages/OpportunityActiveSalesProjects.preview.html',
    campaign: '../../drafts/ibp-redesign-v1/pages/CampaignsActiveOpportunities.preview.html',
    pipeline: '../../drafts/ibp-redesign-v1/pages/MyDeskOpportunities.preview.html',
    opportunity: '../../drafts/ibp-redesign-v1/pages/Opportunity.preview.html',
    product: '../../drafts/ibp-redesign-v1/pages/OpportunityProduct.preview.html',
    leads: '../../drafts/ibp-redesign-v1/pages/LeadsPage.preview.html',
    bindingLeads: '../../drafts/ibp-redesign-v1/pages/BindingAllLeadsPage.preview.html',
    possibleLeads: '../../drafts/ibp-redesign-v1/pages/PossibleAllLeadsPage.preview.html',
    potential: '../../drafts/ibp-redesign-v1/pages/PotentialPage.preview.html',
    clients: 'MyClientsPage.preview.html',
    client: 'ClientInfoPage.preview.html',
    clientComments: 'ClientComments.preview.html',
    meetings: '../../drafts/ibp-redesign-v1/pages/MeetingsProtocolsPage.preview.html',
    tasks: '../../tasks-app/pages/TasksPage.preview.html',
    admin: '../../drafts/ibp-redesign-v1/pages/AdminPage.preview.html',
    taskStates: '../../drafts/ibp-redesign-v1/pages/TaskStatesPage.preview.html'
  };

  /** Пункт каталога → ключ страницы (null — вне объёма, Р5). */
  var NAV_LINKS = {
    'obligatory-deals': 'binding',
    'possible-deals': 'possible',
    'leads': 'leads',
    'obligatory-leads': 'bindingLeads',
    'possible-leads': 'possibleLeads',
    'sales-projects': 'cib',
    'sales-company': 'campaign',
    'pipeline': 'pipeline',
    'pipeline-ckp': null,
    'pipeline-mna': null,
    'kpki-calendar': null,
    'current-portfolio': null,
    'cf-sbi': null,
    'corporate-requests': null,
    'reports-for-risks': null,
    'clients': 'clients',
    'meetings': 'meetings',
    'tasks': 'tasks',
    'qliksense-reports': null,
    'admin': 'admin'
  };

  function href(key, params) {
    var file = PAGES[key];
    if (!file) return null;
    var parts = file.split('?');
    var query = new URLSearchParams(parts[1] || '');
    query.set('role', roleCode);
    Object.keys(params || {}).forEach(function (key) {
      if (params[key] != null && params[key] !== '') query.set(key, params[key]);
    });
    return parts[0] + '?' + query.toString();
  }

  function ic(name) { return '<i data-icon="' + name + '"></i>'; }

  function itemHTML(it, active) {
    var sel = it.id === active;
    if (it.tile && it.tile.links && it.tile.links.length) {
      var sub = '<div class="nav__sub" id="nav-sub-' + it.id + '"><div class="nav__sub-in">'
        + it.tile.links.map(function (l) { return '<a class="nav__item" href="#" data-inert><span class="nav__label">' + l + '</span></a>'; }).join('')
        + '</div></div>';
      return '<a class="nav__item nav__item--acc" href="#" aria-expanded="false" aria-controls="nav-sub-' + it.id + '">'
        + '<span class="nav__ico">' + ic(it.icon) + '</span><span class="nav__label">' + it.label + '</span>'
        + '<span class="nav__caret">' + ic('chevron-down') + '</span></a>' + sub;
    }
    var key = NAV_LINKS[it.id];
    var url = key ? href(key) : null;
    var badge = it.badge
      ? '<span class="nav__badge"><span class="badge badge--xs badge--accent" aria-hidden="true">' + it.badge + '</span></span>'
      : '';
    return '<a class="nav__item' + (sel ? ' nav__item--selected' : '') + '" href="' + (url || '#') + '"'
      + (url ? '' : ' data-inert') + (sel ? ' aria-current="page"' : '')
      + (it.badge ? ' aria-label="' + it.label + ', ' + it.badge + '"' : '') + '>'
      + '<span class="nav__ico">' + ic(it.icon) + '</span><span class="nav__label">' + it.label + '</span>' + badge + '</a>';
  }

  function inert(root) {
    (root || document).addEventListener('click', function (e) {
      var a = e.target.closest('[data-inert]');
      if (a) e.preventDefault();
    });
  }

  function mount(opts) {
    opts = opts || {};
    var nav = document.getElementById('nav');
    if (!nav || !window.IBPHome) return;
    var role = window.IBPR_NAV.role;
    var list = nav.querySelector('[data-nav-list]');
    var home = opts.active === 'home';
    var s = '<a class="nav__item' + (home ? ' nav__item--selected' : '') + '" href="' + PAGES.home + '"' + (home ? ' aria-current="page"' : '') + '>'
      + '<span class="nav__ico">' + ic('main-page') + '</span><span class="nav__label">Главная</span></a>';
    (window.navigationItems[roleCode] || []).forEach(function (group, index) {
      s += '<div class="nav__block' + (index === 0 ? ' nav__block--first' : '') + '"><div class="nav__block-label">' + group.title + '</div>';
      group.items.forEach(function (item, itemIndex) {
        if (item.links && item.links.length) {
          var id = 'core-nav-' + index + '-' + itemIndex;
          s += '<a class="nav__item nav__item--acc" href="#" aria-expanded="false" aria-controls="' + id + '"><span class="nav__ico">' + ic(item.icon) + '</span><span class="nav__label">' + item.text + '</span><span class="nav__caret">' + ic('chevron-down') + '</span></a>';
          s += '<div class="nav__sub" id="' + id + '"><div class="nav__sub-in">' + item.links.map(function (link) { return '<a class="nav__item" href="' + (link.href || '#') + '"' + (link.href ? '' : ' data-inert') + '><span class="nav__label">' + link.text + '</span></a>'; }).join('') + '</div></div>';
        } else {
          var active = (opts.active === 'clients' && item.route === '/clients-app/my-clients') || (opts.active === 'tasks' && item.route === '/tasks-app/tasks');
          s += '<a class="nav__item' + (active ? ' nav__item--selected' : '') + '" href="' + (item.href || '#') + '"' + (active ? ' aria-current="page"' : '') + (item.href ? '' : ' data-inert') + '><span class="nav__ico">' + ic(item.icon) + '</span><span class="nav__label">' + item.text + '</span>' + (item.badge ? '<span class="nav__badge"><span class="badge badge--xs badge--accent">' + item.badge + '</span></span>' : '') + '</a>';
        }
      });
      s += '</div>';
    });
    var homeCrumb = document.querySelector('.crumbs__item a');
    if (homeCrumb) homeCrumb.setAttribute('href', PAGES.home);
    var clientCrumb = document.querySelector('.crumbs__item a[href^="MyClientsPage.preview.html"]');
    if (clientCrumb) clientCrumb.setAttribute('href', href('clients'));
    if (list) list.innerHTML = s;
    var u = window.IBPR_NAV.user;
    var put = function (sel, text) { var el = nav.querySelector(sel); if (el) el.textContent = text; };
    put('.nav__user-name', u.fullName);
    put('.nav__user-role', role);
    put('.nav__user .av__text', u.initials);
    if (window.dsIcons) window.dsIcons.apply(nav);
    if (window.DSNavPanel) window.DSNavPanel.bind(nav);
  }

  /* Перенести выделение меню на пункт другой страницы без перестройки меню
     (сделка сменила раздел после «Взять в работу»). key — ключ страницы. */
  function select(key) {
    var nav = document.getElementById('nav');
    var url = href(key);
    if (!nav || !url) return;
    nav.querySelectorAll('.nav__item--selected').forEach(function (a) {
      a.classList.remove('nav__item--selected');
      a.removeAttribute('aria-current');
    });
    var a = nav.querySelector('.nav__item[href="' + url + '"]');
    if (a) { a.classList.add('nav__item--selected'); a.setAttribute('aria-current', 'page'); }
  }

  /* Пункт каталога по ключу страницы (обратная карта NAV_LINKS). */
  function itemOf(key) {
    for (var id in NAV_LINKS) if (NAV_LINKS[id] === key) return id;
    return null;
  }

  var cur = window.employeeForRole(roleCode);
  window.NAV_LINKS = NAV_LINKS;
  window.IBPR_NAV = {
    role: currentRole ? currentRole.title : 'Аналитик',
    /* Путь до хаба от страницы модуля: pages/ → модуль → core/ → apps/ → корень. */
    hubHref: '../../../../index.html',
    /* Демо-пользователь концепта (допущение ТЗ MS0014 §3) — из employees.js. */
    user: { fullName: [cur.lastName, cur.firstName, cur.middleName].filter(Boolean).join(' '), initials: cur.initials, desk: 'SMB Природные ресурсы +6' },
    PAGES: PAGES,
    href: href,
    mount: mount,
    select: select,
    itemOf: itemOf,
    inert: inert,
    pageHref: function (itemId) { var k = NAV_LINKS[itemId]; return k ? href(k) : null; }
  };
  inert(document);
})();
