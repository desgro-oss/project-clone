/* Плитки главной по ролям. Источник имён — фронтенд host-app:
   src/shared/models/dashboard.ts (DashboardColumn, DashboardItem) и
   src/shared/hooks/dashboard/useHomePageDashboardItems.tsx (колонки
   Origination · Pipeline · Clients and tasks, поля name / route / title / text).
   Во фронтенде состав плиток режут права роли (permission); в прототипе —
   явный список колонок на роль.

   `route` — маршрут фронтенда, дословно; `href` — адрес страницы прототипа от
   HomePage.html: есть только у разделов, чьи экраны собраны, остальные — «#».
   `illu` — имя иллюстрации ДС (у фронтенда — icon из uikit). */

/**
 * @typedef {Object} DashboardItem
 * @property {string} name   имя удалённого модуля (RemoteModuleName): 'bankerApp'
 * @property {string} route  маршрут фронтенда: '/banker-app/chat'
 * @property {string} title  название плитки
 * @property {string} text   описание плитки
 * @property {string} illu   иллюстрация ДС; '' — в ДС нет, штриховая заглушка
 * @property {string} [href] страница прототипа; нет — плитка ведёт на «#»
 * @property {RoutedLink[]} [links] подразделы — NavTile «со ссылками» (во фронтенде RoutedLinksList)
 * @property {boolean} [external] маршрут приходит из настроек (useExternalDashboardItems) — route нет
 */

/**
 * @typedef {Object} RoutedLink
 * @property {string} text   подпись подраздела
 * @property {string} route  маршрут фронтенда
 * @property {string} [href] страница прототипа; нет — «#»
 */

/**
 * @typedef {Object} DashboardColumn
 * @property {string} title          заголовок группы
 * @property {DashboardItem[]} cards плитки группы
 */

/** @type {Object<string, DashboardColumn[]>} роль (LocalUserType.code) → колонки главной */
window.homePageDashboardItems = {
  /* Аналитик ДИД — состав плиток роли из каталога ДС (patterns/HomeRoles/ibp-home.js,
     роль «Аналитик ДИД»), как на главной концепта core/drafts/ibp-redesign-v1 */
  analyst: [
    { title: 'Origination', cards: [
      { name: 'opportunitiesApp', route: '/opportunities-app/binding/active-opportunities', title: 'Обязательные сделки', text: 'Сделки с продуктами ДИД, и/или А-риском', illu: 'important-deals' },
      { name: 'opportunitiesApp', route: '/opportunities-app/possible/active-opportunities', title: 'Возможные сделки', text: 'Прочие сделки в Банке от 500 млн руб.', illu: 'possible-deals' },
      { name: 'offersourcesApp', route: '/offersources-app/leads-did/leads', title: 'Лиды', text: 'Драфты будущих сделок ДИД, в т.ч. лиды для КМ', illu: '' },
      { name: 'offersourcesApp', route: '/offersources-app/binding-leads/to-process-leads', title: 'Обязательные лиды', text: 'Компании роста, Топ-клиенты, продукты ДИД и ИК/ПФ от 3 млрд руб.', illu: 'important-leads' },
      { name: 'offersourcesApp', route: '/offersources-app/possible-leads/to-process-leads', title: 'Возможные лиды', text: 'ИК/ПФ от 1 до 3 млрд руб.', illu: 'possible-leads' },
      { name: 'salesourcesApp', route: '/salesources-app/sales-projects', title: 'Проекты продаж CIB', text: 'Продуктовые предложения ДКК, ДККК, ДГР и ДИД', illu: 'sales-projects' },
      { name: 'opportunitiesApp', route: '/opportunities-app/campaigns/active-opportunities', title: 'Кампании продаж', text: 'Потенциалы ДИД, отправленные на проработку в рабочее место КМ', illu: 'sales-company' }
    ] },
    { title: 'Pipeline', cards: [
      { name: 'opportunitiesApp', route: '/opportunities-app/pipeline/my-desk-opportunities', title: 'Pipeline', text: 'Все сделки моего деска', illu: 'pipeline' },
      { name: 'b3OpportunitiesApp', route: '/b3-opportunities-app/pipeline-dcp/my-desk-opportunities', title: 'Pipeline ЦКП', text: 'Все сделки моего деска ЦКП', illu: 'ckp-pipeline' },
      { name: 'maOpportunitiesApp', route: '/ma-opportunities-app/pipeline', title: 'M&A Pipeline', text: 'Все сделки M&A', illu: 'mna-pipeline' },
      { external: true, title: 'Календарь КПКИ', text: 'Перечень сделок, обсуждаемых на Комитете', illu: 'kpki-cal' }
    ] },
    { title: 'Текущий портфель ДИД', cards: [
      { name: 'dealsApp', route: '/deals-app/deal', title: 'Текущий портфель', text: 'Все активные сделки ДИД', illu: 'current-depo', href: '../../../postrade/deals-app/pages/Portfolio.html' },
      { name: 'dealsApp', route: '/deals-app/plan-payments-did', title: 'CF СБИ', text: 'Плановые платежи по сделкам ГК СБИ', illu: 'cash-flow' },
      { name: 'corporateRequestsApp', title: 'Корпоративные запросы', text: '', illu: 'corporate-transactions', links: [
        { text: 'Реестр запросов', route: '/corporaterequests-app/requests-register' },
        { text: 'Реестр входящих писем', route: '/corporaterequests-app/mail-register' }
      ] }
    ] },
    { title: 'Отчёты', cards: [
      { name: 'postReportsApp', title: 'Отчёты для Рисков', text: '', illu: 'rwa', links: [
        { text: 'Коды RWA', route: '/postreports-app/rwa-values' },
        { text: 'Расчет RWA', route: '/postreports-app/rwa-reports' },
        { text: 'Расчет ОВП', route: '/postreports-app/ocp-reports' }
      ] }
    ] },
    { title: 'Клиенты и задачи', cards: [
      { name: 'clientsApp', route: '/clients-app/my-clients', href: '../../clients-app/pages/MyClientsPage.preview.html?role=analyst', title: 'Клиенты', text: 'Работа с моими клиентами', illu: 'clients' },
      { name: 'meetingsProtocolsApp', route: '/meetings-protocols-app/meetings/my-meetings', title: 'Встречи', text: 'Встречи и протоколы моего деска', illu: '' },
      { name: 'tasksApp', route: '/tasks-app/tasks', href: '../../tasks-app/pages/TasksPage.preview.html?role=analyst', title: 'Задачи', text: 'Все задачи моего деска', illu: 'tasks' }
    ] },
    { title: 'Администрирование', cards: [
      { external: true, title: 'Отчеты Qliksense', text: 'Сводная информация по сделкам', illu: 'qliksense-reports' },
      { route: 'host-app/admin', title: 'Администрирование', text: 'Справочники и другая информация', illu: 'settings' }
    ] }
  ],
  core_analyst: [
    { title: 'Origination', cards: [
      { name: 'opportunitiesApp', route: '/opportunities-app/binding/active-opportunities', title: 'Обязательные сделки', text: 'Сделки с продуктами ДИД, и/или А-риском', illu: 'important-deals' },
      { name: 'opportunitiesApp', route: '/opportunities-app/possible/active-opportunities', title: 'Возможные сделки', text: 'Прочие сделки в Банке от 500 млн руб.', illu: 'possible-deals' },
      { name: 'offersourcesApp', route: '/offersources-app/leads-did/leads', title: 'Лиды', text: 'Драфты будущих сделок ДИД, в т.ч. лиды для КМ', illu: '' },
      { name: 'offersourcesApp', route: '/offersources-app/binding-leads/to-process-leads', title: 'Обязательные лиды', text: 'Компании роста, Топ-клиенты, продукты ДИД и ИК/ПФ от 3 млрд руб.', illu: 'important-leads' },
      { name: 'offersourcesApp', route: '/offersources-app/possible-leads/to-process-leads', title: 'Возможные лиды', text: 'ИК/ПФ от 1 до 3 млрд руб.', illu: 'possible-leads' },
      { name: 'salesourcesApp', route: '/salesources-app/sales-projects', title: 'Проекты продаж CIB', text: 'Продуктовые предложения ДКК, ДККК, ДГР и ДИД', illu: 'sales-projects' },
      { name: 'opportunitiesApp', route: '/opportunities-app/campaigns/active-opportunities', title: 'Кампании продаж', text: 'Потенциалы ДИД, отправленные на проработку в рабочее место КМ', illu: 'sales-company' }
    ] },
    { title: 'Pipeline', cards: [
      { name: 'opportunitiesApp', route: '/opportunities-app/pipeline/my-desk-opportunities', title: 'Pipeline', text: 'Все сделки моего деска', illu: 'pipeline' },
      { name: 'b3OpportunitiesApp', route: '/b3-opportunities-app/pipeline-dcp/my-desk-opportunities', title: 'Pipeline ЦКП', text: 'Все сделки моего деска ЦКП', illu: 'ckp-pipeline' },
      { name: 'maOpportunitiesApp', route: '/ma-opportunities-app/pipeline', title: 'M&A Pipeline', text: 'Все сделки M&A', illu: 'mna-pipeline' },
      { external: true, title: 'Календарь КПКИ', text: 'Перечень сделок, обсуждаемых на Комитете', illu: 'kpki-cal' }
    ] },
    { title: 'Текущий портфель ДИД', cards: [
      { name: 'dealsApp', route: '/deals-app/deal', title: 'Текущий портфель', text: 'Все активные сделки ДИД', illu: 'current-depo', href: '../../../postrade/deals-app/pages/Portfolio.html' },
      { name: 'dealsApp', route: '/deals-app/plan-payments-did', title: 'CF СБИ', text: 'Плановые платежи по сделкам ГК СБИ', illu: 'cash-flow' },
      { name: 'corporateRequestsApp', title: 'Корпоративные запросы', text: '', illu: 'corporate-transactions', links: [
        { text: 'Реестр запросов', route: '/corporaterequests-app/requests-register' },
        { text: 'Реестр входящих писем', route: '/corporaterequests-app/mail-register' }
      ] }
    ] },
    { title: 'Отчёты', cards: [
      { name: 'postReportsApp', title: 'Отчёты для Рисков', text: '', illu: 'rwa', links: [
        { text: 'Коды RWA', route: '/postreports-app/rwa-values' },
        { text: 'Расчет RWA', route: '/postreports-app/rwa-reports' },
        { text: 'Расчет ОВП', route: '/postreports-app/ocp-reports' }
      ] }
    ] },
    { title: 'Клиенты и задачи', cards: [
      { name: 'clientsApp', route: '/clients-app/my-clients', href: '../../clients-app/pages/MyClientsPage.preview.html?role=core_analyst', title: 'Клиенты', text: 'Работа с моими клиентами', illu: 'clients' },
      { name: 'meetingsProtocolsApp', route: '/meetings-protocols-app/meetings/my-meetings', title: 'Встречи', text: 'Встречи и протоколы моего деска', illu: '' },
      { name: 'tasksApp', route: '/tasks-app/tasks', href: '../../tasks-app/pages/TasksPage.preview.html?role=core_analyst', title: 'Задачи', text: 'Все задачи моего деска', illu: 'tasks' }
    ] },
    { title: 'Администрирование', cards: [
      { external: true, title: 'Отчеты Qliksense', text: 'Сводная информация по сделкам', illu: 'qliksense-reports' },
      { route: 'host-app/admin', title: 'Администрирование', text: 'Справочники и другая информация', illu: 'settings' }
    ] }
  ],
  director_ib: [
    { title: 'Origination', cards: [
      { name: 'potentialsApp', route: '/potentials-app/register', title: 'Потенциалы DCM', text: 'Кредиты клиентов банка с потенциалом перевода в облигации', illu: 'dcm-potentials' },
      { name: 'bondsPriceCalculationApp', route: '/bonds-price-calculation-app/calculation', title: 'Прайсер облигаций', text: 'Расчёт облигаций', illu: 'reserve' },
      { name: 'fundsApp', route: '/funds-app/pipeline', title: 'Фонды', text: 'Анализ фондов, активов и поиск потенциалов', illu: 'qliksense-reports', href: '../../../ib/funds-app/pages/FundsPipeline.preview.html' },
      { name: 'bankerApp', route: '/banker-app/chat', title: 'AI Pitcher', text: 'Подготовка отчетов для встречи с клиентом', illu: 'rwa', href: '../../../ib/banker-app/pages/RequestThread.html' }
    ] },
    { title: 'Pipeline', cards: [
      { name: 'maOpportunitiesApp', route: '/ma-opportunities-app/pipeline', title: 'M&A Pipeline', text: 'Все сделки M&A', illu: 'mna-pipeline' },
      { name: 'dcmecmApp', route: '/dcmecm-app/DCM/pipeline', title: 'Pipeline DCM', text: 'Текущие DCM проекты', illu: 'dcm-pipeline' },
      { name: 'dcmecmApp', route: '/dcmecm-app/ECM/pipeline', title: 'Pipeline ECM', text: 'Текущие ECM проекты', illu: 'ecm-pipeline' },
      { name: 'ibPaymentsApp', route: '/ib-payments-app/register', title: 'Реестр платежей IB', text: 'Платежи по всем направлениям IB', illu: 'payment-ib' }
    ] },
    { title: 'Клиенты и задачи', cards: [
      { name: 'clientsApp', route: '/clients-app/my-clients', href: '../../clients-app/pages/MyClientsPage.preview.html?role=director_ib', title: 'Клиенты', text: 'Работа с моими клиентами', illu: 'clients' },
      { name: 'meetingsProtocolsApp', route: '/meetings-protocols-app/meetings/my-meetings', title: 'Встречи', text: 'Встречи и протоколы моего деска', illu: '' },
      { name: 'tasksApp', route: '/tasks-app/tasks', href: '../../tasks-app/pages/TasksPage.preview.html?role=director_ib', title: 'Задачи', text: 'Все задачи моего деска', illu: 'tasks' }
    ] }
  ]
};
