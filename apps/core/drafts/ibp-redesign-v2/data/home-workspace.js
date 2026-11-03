/* Вкладки главной: выбор и клавиатура принадлежат Tab ДС,
   здесь только связь выбранного таба с содержимым и адресом страницы.
   «Поиск клиентов» — таблица V2MyClientsTable на всей базе (как вкладка
   «Поиск клиентов» раздела «Клиенты»); монтируется при первом показе. */
(function () {
  'use strict';
  var PANELS = ['dashboard', 'projects', 'clients'];
  var TITLES = { dashboard: 'Мой дашборд', projects: 'Мои проекты', clients: 'Поиск клиентов' };

  function mount() {
    var tabs = document.getElementById('home-tabs');
    if (!tabs) return;
    window.IBPHomeDashboard.mount({
      profileHost: document.getElementById('home-profile'),
      dashboardHost: document.getElementById('home-dashboard-content')
    });
    var params = new URLSearchParams(window.location.search);
    var current = PANELS.indexOf(params.get('home')) > 0 ? params.get('home') : 'dashboard';
    var clientsTable = null;
    function show(name, updateAddress) {
      current = name;
      PANELS.forEach(function (key) {
        document.getElementById('home-' + key).hidden = key !== name;
      });
      var title = TITLES[name];
      // Breadcrumbs перестраивает DOM: обновляем модель, чтобы resize не вернул прежнее имя.
      var trail = document.querySelector('[data-breadcrumbs]');
      var breadcrumbs = trail && window.DSBreadcrumbs ? window.DSBreadcrumbs.bind(trail) : null;
      if (breadcrumbs && breadcrumbs.items.length) {
        breadcrumbs.items[breadcrumbs.items.length - 1].text = title;
        breadcrumbs.refresh();
      }
      document.title = title + ' — IBP Redesign v2';
      if (updateAddress) {
        var url = new URL(window.location.href);
        url.searchParams.set('home', name);
        window.history.replaceState(null, '', url.href);
      }
      if (name === 'clients' && !clientsTable) {
        clientsTable = window.LcMyClientsTable.mount(document.getElementById('home-clients-table'), {
          tab: 'search', tree: document.getElementById('home-clients-tree')
        });
      }
      // Таблица и канбан измеряют ширину после появления скрытой панели.
      if (name !== 'dashboard') window.requestAnimationFrame(function () {
        window.dispatchEvent(new Event('resize'));
        var segments = document.querySelectorAll(name === 'projects' ? '[data-lead-segment="view"]' : '#home-clients [data-mc-view]');
        if (window.DSTabs) segments.forEach(function (segment) { window.DSTabs.positionThumb(segment); });
      });
    }
    var api = window.DSTabs.tabs(tabs, {onChange: function (index, button) {
      show(button.dataset.homeTab, true);
    }});
    api.select(PANELS.indexOf(current));
    show(current, false);
    if (window.dsIcons) window.dsIcons.apply(document.getElementById('home-profile'));
  }
  window.IBPHomeWorkspace = {mount: mount};
}());
