/* Роли прототипа — кто входит в систему. Источник имён — фронтенд host-app:
   src/shared/authentication/authentication.const.ts (localUserMap) и
   authentication.types.ts (LoginForRolesKeys). analyst/Analyst и
   director_ib/DirectorIB — дословно оттуда; core_analyst/CoreAnalyst —
   отдельная роль прототипа (RE0044a), пара фронтенда не установлена.
   `title` (подпись роли по-русски) и пользователь — invented.

   Логина в прототипе нет: роль выбирается в адресе главной
   (`HomePage.html?role=<code>`, core_analyst направляется в dashboard-app); сменить её — кнопка выхода в футере
   меню (как в ДС): окно со всеми ролями по командам.
   Новая роль — запись здесь с home + её разделы в dashboard.js и navigation.js. */

/**
 * @typedef {Object} LocalUserType
 * @property {string} code   код LoginForRolesKeys; core_analyst — отдельный код прототипа (30.10.2026, RE0044a)
 * @property {string} name   имя роли во фронтенде; CoreAnalyst — имя прототипа, соответствие фронтенду не установлено
 * @property {string} title  подпись роли в интерфейсе (invented)
 * @property {'postrade'|'pretrade'|'ib'|'core'} team  команда прототипа — колонка в окне смены роли (Post · Pre · IB · Core), как вкладки хаба
 * @property {string} home  главная роли от pages/ модуля Core (решение человека 30.10.2026, RE0044)
 */

/**
 * @typedef {Object} CurrentEmployeeRsDto
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} middleName
 * @property {string} initials  инициалы для аватара (invented)
 */

/** @type {LocalUserType[]} */
window.localUserList = [
  { code: 'analyst', name: 'Analyst', title: 'Аналитик ДИД', team: 'pretrade', home: '../../host-app/pages/HomePage.html?role=analyst' },
  { code: 'core_analyst', name: 'CoreAnalyst', title: 'Аналитик', team: 'core', home: '../../dashboard-app/pages/HomePage.preview.html?role=core_analyst' },
  { code: 'director_ib', name: 'DirectorIB', title: 'Руководитель IB', team: 'ib', home: '../../host-app/pages/HomePage.html?role=director_ib' }
];

/** Роль по умолчанию — когда в адресе её нет или она неизвестна. */
window.DEFAULT_ROLE_CODE = 'director_ib';

/** @type {CurrentEmployeeRsDto} */
window.currentEmployee = { lastName: 'Александров', firstName: 'Пётр', middleName: 'Константинович', initials: 'АП' };

/** Главная роли от страниц модулей Core; неизвестная роль — роль по умолчанию. */
window.roleHomeHref = function (code) {
  var role = window.localUserList.filter(function (u) { return u.code === code; })[0]
    || window.localUserList.filter(function (u) { return u.code === window.DEFAULT_ROLE_CODE; })[0];
  return role.home;
};

/** Профиль Аналитика — существующие демо-значения dashboard-app/mock-profile.js. */
window.employeeForRole = function (code) {
  return code === 'core_analyst'
    ? { lastName: 'Ким', firstName: 'Анна', middleName: 'Сергеевна', initials: 'АК' }
    : window.currentEmployee;
};
