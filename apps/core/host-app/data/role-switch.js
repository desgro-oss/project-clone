/* Служебное окно смены роли на главных Core. Разметку Modal держит страница;
   каталог ролей и адреса — authentication.js. В продукте роль приходит с логином. */
(function () {
  'use strict';
  function esc(value) {
    return String(value == null ? '' : value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function mount(code) {
    var host = document.getElementById('roleTeams');
    if (!host) return;
    var teams = [{ key: 'postrade', label: 'Post' }, { key: 'pretrade', label: 'Pre' }, { key: 'ib', label: 'IB' }, { key: 'core', label: 'Core' }];
    host.innerHTML = teams.map(function (team) {
      var roles = (window.localUserList || []).filter(function (role) { return role.team === team.key; });
      var body = roles.length
        ? '<div class="role-team__list">' + roles.map(function (role) {
          return role.code === code
            ? '<button type="button" class="btn btn--outline btn--m btn--fullwidth" disabled aria-current="true"><span class="btn__label">' + esc(role.title) + '</span></button>'
            : '<a class="btn btn--outline btn--m btn--fullwidth" href="' + esc(window.roleHomeHref(role.code)) + '"><span class="btn__label">' + esc(role.title) + '</span></a>';
        }).join('') + '</div>'
        : '<div class="es es--m"><span class="illu es__illu" data-illu="empty-folder" aria-hidden="true"></span><div class="es__body"><p class="es__title">Ролей пока нет</p></div></div>';
      return '<section class="role-team col-3" data-role-team="' + team.key + '"><h3 class="ds-h6-strong-smb">' + esc(team.label) + '</h3>' + body + '</section>';
    }).join('');
    if (window.dsIcons) window.dsIcons.apply(host);
  }
  window.IBPRoleSwitch = { mount: mount };
})();
