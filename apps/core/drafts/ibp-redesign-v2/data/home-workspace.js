/* Вкладки главной: выбор и клавиатура принадлежат Tab ДС,
   здесь только связь выбранного таба с содержимым и адресом страницы. */
(function () {
  'use strict';
  function mount() {
    var tabs = document.getElementById('home-tabs');
    if (!tabs) return;
    window.IBPHomeDashboard.mount({
      profileHost: document.getElementById('home-profile'),
      dashboardHost: document.getElementById('home-dashboard-content')
    });
    var params = new URLSearchParams(window.location.search);
    var current = params.get('home') === 'projects' ? 'projects' : 'dashboard';
    function show(name, updateAddress) {
      current = name;
      ['dashboard', 'projects'].forEach(function (key) {
        document.getElementById('home-' + key).hidden = key !== name;
      });
      var title = name === 'dashboard' ? 'Мой дашборд' : 'Мои проекты';
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
      // Таблица и канбан измеряют ширину после появления скрытой панели.
      if (name === 'projects') window.requestAnimationFrame(function () {
        window.dispatchEvent(new Event('resize'));
        var segment = document.querySelector('[data-lead-segment="view"]');
        if (segment && window.DSTabs) window.DSTabs.positionThumb(segment);
      });
    }
    var api = window.DSTabs.tabs(tabs, {onChange: function (index, button) {
      show(button.dataset.homeTab, true);
    }});
    api.select(current === 'projects' ? 1 : 0);
    show(current, false);
    if (window.dsIcons) window.dsIcons.apply(document.getElementById('home-profile'));
  }
  window.IBPHomeWorkspace = {mount: mount};
}());
