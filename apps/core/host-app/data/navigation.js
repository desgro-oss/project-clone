/* Боковое меню по ролям. Источник имён — фронтенд host-app:
   src/shared/models/navigation.ts (NavigationItems: группа + items с
   icon / text / route) и src/widgets/Sidebar (useNavigationItems). Во
   фронтенде пункты режут права роли; в прототипе — явный список на роль.
   Пункт «Главная» меню добавляет страница сама.

   `icon` — глиф ДС (foundations/Icons/Icons.md); `route` — маршрут фронтенда;
   `href` — страница прототипа от HomePage.html, нет — «#»; `badge` — счётчик. */

/**
 * @typedef {Object} NavItemType
 * @property {string} icon    глиф ДС
 * @property {string} text    подпись пункта
 * @property {string} [route] маршрут фронтенда
 * @property {string} [event] событие вместо маршрута (EventItemType): 'ToggleUcpSearch' — модалка поиска в ЕПК
 * @property {string} [href]  страница прототипа; нет — «#»
 * @property {number} [badge] счётчик (Badge XS accent)
 * @property {{text: string, route: string}[]} [links] подпункты — пункт-аккордеон (как у плитки «со ссылками»)
 * @property {boolean} [external] маршрут приходит из настроек — route нет
 */

/**
 * @typedef {Object} NavigationItems
 * @property {string} title        заголовок блока меню
 * @property {NavItemType[]} items пункты блока
 */

/** @type {Object<string, NavigationItems[]>} роль (LocalUserType.code) → блоки меню */
window.navigationItems = {
  /* Аналитик ДИД — пункты роли из каталога ДС (ibp-home.js), как в меню концепта ibp-redesign-v1 */
  analyst: [
    { title: 'Origination', items: [
      { icon: 'Important-deals', text: 'Обязательные сделки', route: '/opportunities-app/binding/active-opportunities' },
      { icon: 'deals-possible-deals', text: 'Возможные сделки', route: '/opportunities-app/possible/active-opportunities' },
      { icon: 'file-basic', text: 'Лиды', route: '/offersources-app/leads-did/leads' },
      { icon: 'important-leads', text: 'Обязательные лиды', route: '/offersources-app/binding-leads/to-process-leads' },
      { icon: 'possible-leads', text: 'Возможные лиды', route: '/offersources-app/possible-leads/to-process-leads' },
      { icon: 'sales-projects', text: 'Проекты продаж CIB', route: '/salesources-app/sales-projects' },
      { icon: 'sales-company', text: 'Кампании продаж', route: '/opportunities-app/campaigns/active-opportunities' }
    ] },
    { title: 'Pipeline', items: [
      { icon: 'pipeline', text: 'Pipeline', route: '/opportunities-app/pipeline/my-desk-opportunities' },
      { icon: 'ckp-pipeline', text: 'Pipeline ЦКП', route: '/b3-opportunities-app/pipeline-dcp/my-desk-opportunities' },
      { icon: 'mna-pipeline', text: 'M&A Pipeline', route: '/ma-opportunities-app/pipeline' },
      { icon: 'kpki-cal', text: 'Календарь КПКИ', external: true }
    ] },
    { title: 'Текущий портфель ДИД', items: [
      { icon: 'current-depo', text: 'Текущий портфель', route: '/deals-app/deal', href: '../../../postrade/deals-app/pages/Portfolio.html' },
      { icon: 'cash-flow', text: 'CF СБИ', route: '/deals-app/plan-payments-did' },
      { icon: 'corporate-transactions', text: 'Корпоративные запросы', links: [
        { text: 'Реестр запросов', route: '/corporaterequests-app/requests-register' },
        { text: 'Реестр входящих писем', route: '/corporaterequests-app/mail-register' }
      ] }
    ] },
    { title: 'Отчёты', items: [
      { icon: 'rwa', text: 'Отчёты для Рисков', links: [
        { text: 'Коды RWA', route: '/postreports-app/rwa-values' },
        { text: 'Расчет RWA', route: '/postreports-app/rwa-reports' },
        { text: 'Расчет ОВП', route: '/postreports-app/ocp-reports' }
      ] }
    ] },
    { title: 'Клиенты и задачи', items: [
      { icon: 'factory-01', text: 'Клиенты', route: '/clients-app/my-clients', href: '../../clients-app/pages/MyClientsPage.preview.html?role=analyst' },
      { icon: 'calendar', text: 'Встречи', route: '/meetings-protocols-app/meetings/my-meetings' },
      { icon: 'tasks', text: 'Задачи', route: '/tasks-app/tasks', href: '../../tasks-app/pages/TasksPage.preview.html?role=analyst', badge: 7 }
    ] },
    { title: 'Администрирование', items: [
      { icon: 'qliksense-reports', text: 'Отчеты Qliksense', external: true },
      { icon: 'admin-panel-settings', text: 'Администрирование', route: 'host-app/admin' }
    ] }
  ],
  core_analyst: [
    { title: 'Origination', items: [
      { icon: 'Important-deals', text: 'Обязательные сделки', route: '/opportunities-app/binding/active-opportunities' },
      { icon: 'deals-possible-deals', text: 'Возможные сделки', route: '/opportunities-app/possible/active-opportunities' },
      { icon: 'file-basic', text: 'Лиды', route: '/offersources-app/leads-did/leads' },
      { icon: 'important-leads', text: 'Обязательные лиды', route: '/offersources-app/binding-leads/to-process-leads' },
      { icon: 'possible-leads', text: 'Возможные лиды', route: '/offersources-app/possible-leads/to-process-leads' },
      { icon: 'sales-projects', text: 'Проекты продаж CIB', route: '/salesources-app/sales-projects' },
      { icon: 'sales-company', text: 'Кампании продаж', route: '/opportunities-app/campaigns/active-opportunities' }
    ] },
    { title: 'Pipeline', items: [
      { icon: 'pipeline', text: 'Pipeline', route: '/opportunities-app/pipeline/my-desk-opportunities' },
      { icon: 'ckp-pipeline', text: 'Pipeline ЦКП', route: '/b3-opportunities-app/pipeline-dcp/my-desk-opportunities' },
      { icon: 'mna-pipeline', text: 'M&A Pipeline', route: '/ma-opportunities-app/pipeline' },
      { icon: 'kpki-cal', text: 'Календарь КПКИ', external: true }
    ] },
    { title: 'Текущий портфель ДИД', items: [
      { icon: 'current-depo', text: 'Текущий портфель', route: '/deals-app/deal', href: '../../../postrade/deals-app/pages/Portfolio.html' },
      { icon: 'cash-flow', text: 'CF СБИ', route: '/deals-app/plan-payments-did' },
      { icon: 'corporate-transactions', text: 'Корпоративные запросы', links: [
        { text: 'Реестр запросов', route: '/corporaterequests-app/requests-register' },
        { text: 'Реестр входящих писем', route: '/corporaterequests-app/mail-register' }
      ] }
    ] },
    { title: 'Отчёты', items: [
      { icon: 'rwa', text: 'Отчёты для Рисков', links: [
        { text: 'Коды RWA', route: '/postreports-app/rwa-values' },
        { text: 'Расчет RWA', route: '/postreports-app/rwa-reports' },
        { text: 'Расчет ОВП', route: '/postreports-app/ocp-reports' }
      ] }
    ] },
    { title: 'Клиенты и задачи', items: [
      { icon: 'factory-01', text: 'Клиенты', route: '/clients-app/my-clients', href: '../../clients-app/pages/MyClientsPage.preview.html?role=core_analyst' },
      { icon: 'calendar', text: 'Встречи', route: '/meetings-protocols-app/meetings/my-meetings' },
      { icon: 'tasks', text: 'Задачи', route: '/tasks-app/tasks', href: '../../tasks-app/pages/TasksPage.preview.html?role=core_analyst', badge: 7 }
    ] },
    { title: 'Администрирование', items: [
      { icon: 'qliksense-reports', text: 'Отчеты Qliksense', external: true },
      { icon: 'admin-panel-settings', text: 'Администрирование', route: 'host-app/admin' }
    ] }
  ],
  director_ib: [
    { title: 'Origination', items: [
      { icon: 'dcm-potentials', text: 'Потенциалы DCM', route: '/potentials-app/register' },
      { icon: 'calc', text: 'Прайсер облигаций', route: '/bonds-price-calculation-app/calculation' },
      { icon: 'funds', text: 'Фонды', route: '/funds-app/pipeline', href: '../../../ib/funds-app/pages/FundsPipeline.preview.html' },
      { icon: 'ai-stars', text: 'AI Pitcher', route: '/banker-app/chat', href: '../../../ib/banker-app/pages/RequestThread.html' }
    ] },
    { title: 'Pipeline', items: [
      { icon: 'mna-pipeline', text: 'M&A Pipeline', route: '/ma-opportunities-app/pipeline' },
      { icon: 'dcm-pipeline', text: 'DCM Pipeline', route: '/dcmecm-app/DCM/pipeline' },
      { icon: 'ecm-pipeline', text: 'ECM Pipeline', route: '/dcmecm-app/ECM/pipeline' },
      { icon: 'payments-ib', text: 'Реестр платежей IB', route: '/ib-payments-app/register' }
    ] },
    { title: 'Клиенты и задачи', items: [
      { icon: 'factory-01', text: 'Клиенты', route: '/clients-app/my-clients', href: '../../clients-app/pages/MyClientsPage.preview.html?role=director_ib' },
      { icon: 'client-search', text: 'Поиск клиентов в ЕПК', event: 'ToggleUcpSearch' },
      { icon: 'tasks', text: 'Задачи', route: '/tasks-app/tasks', href: '../../tasks-app/pages/TasksPage.preview.html?role=director_ib', badge: 12 },
      { icon: 'calendar', text: 'Встречи', route: '/meetings-protocols-app/meetings/my-meetings' }
    ] }
  ]
};
