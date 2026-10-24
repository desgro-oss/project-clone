/* =========================================================================
   Хаб проектов, новый UI — демо-данные концепта (window.HUB_*).

   Снимок реестра hub.js и каталога спек dev-specs на 24.10.2026: реестр
   в концепте не читается, чтобы страница не зависела от генерата, а группировка
   версий жила отдельно. Если раскладка пойдёт на весь хаб, группировку и
   версии заведут в app.json приложений и соберёт hub-build.

   Обычный <script>, а не JSON: страницы открываются по file://, где fetch не
   работает. Подключается до экранного скрипта:
   <script src="../data/hub-data.js"></script>.

   Имена типов и полей — в стиле API фронтенда: типы в PascalCase с суффиксом
   RsDto, поля в camelCase, перечисления — кодами (UPPER_SNAKE), подписи для
   интерфейса — отдельными картами. Все ссылки (href) и папки (folder) — от
   корня репозитория: страница сама добавляет путь до корня.
   ========================================================================= */

/**
 * Команда (раздел apps/<раздел>/) — значение сегмент-контрола.
 * Source: invented (24.10.2026).
 * @typedef {Object} HubTeamRsDto
 * @property {HubTeamCode} teamCode  код команды
 * @property {string} teamName       подпись сегмента
 */

/** @typedef {'POST'|'PRE'|'IB'|'CORE'} HubTeamCode */

/**
 * Ссылка на раздел или приложение: строка Entity.
 * Source: invented (24.10.2026), снимок записей hub.js.
 * @typedef {Object} HubLinkRsDto
 * @property {string} linkId        идентификатор записи реестра
 * @property {HubTeamCode} [teamCode] команда; у общих ссылок нет
 * @property {string} title         название
 * @property {string} descText      описание одной строкой
 * @property {string} href          страница от корня репозитория
 * @property {string} folder        папка записи от корня
 * @property {string} iconName      глиф из Icons.md
 */

/**
 * Версия концепта или спецификации.
 * Source: invented (24.10.2026), снимок записей hub.js и dev-specs.
 * @typedef {Object} HubVersionRsDto
 * @property {string} versionId       идентификатор приложения или спеки
 * @property {string} versionLabel    подпись версии
 * @property {string} descText        описание версии
 * @property {string} href            страница от корня репозитория
 * @property {string} folder          папка от корня
 * @property {HubShelfCode} [shelfCode] полка версии; у спек нет
 */

/** @typedef {'ACTUAL'|'ARCHIVE'} HubShelfCode */

/**
 * Концепт или спецификация с версиями. Версии — от новой к старой; полка
 * группы — полка первой (последней по времени) версии.
 * Source: invented (24.10.2026).
 * @typedef {Object} HubGroupRsDto
 * @property {string} groupId            идентификатор группы
 * @property {HubTeamCode} teamCode      команда
 * @property {HubGroupKindCode} kindCode что это: концепт или спецификация
 * @property {string} title              название группы
 * @property {string} descText           описание одной строкой
 * @property {HubVersionRsDto[]} versions версии, не меньше одной
 */

/** @typedef {'CONCEPT'|'SPEC'} HubGroupKindCode */

/** @type {HubTeamRsDto[]} */
window.HUB_TEAMS = [
  { teamCode: 'POST', teamName: 'Post' },
  { teamCode: 'PRE', teamName: 'Pre' },
  { teamCode: 'IB', teamName: 'IB' },
  { teamCode: 'CORE', teamName: 'Core' }
];

/** Общий ряд над выбором команды. @type {HubLinkRsDto[]} */
window.HUB_COMMON_LINKS = [
  { linkId: 'ds-ibp', title: 'Дизайн-система IBP', descText: 'Документация основ и компонентов', href: 'design-system/index.html', folder: 'design-system', iconName: 'layer-01' },
  { linkId: 'kb-glossary', title: 'Глоссарий и термины', descText: 'Что значат слова предметной области — деск, ЦУП и другие', href: 'apps/knowledge-base/glossary/index.html', folder: 'apps/knowledge-base/glossary', iconName: 'file-search' },
  { linkId: 'local-kit-common', title: 'Локальные компоненты Общие', descText: 'Тайлы, окна и поповеры, общие для разделов: как работают, из чего собраны, зачем', href: 'apps/local-components/common/index.html', folder: 'apps/local-components/common', iconName: 'layout-grid-01' }
];

/** Колонка «Проекты»: витрина локальных компонентов команды — первой строкой. @type {HubLinkRsDto[]} */
window.HUB_PROJECTS = [
  { linkId: 'local-kit-post', teamCode: 'POST', title: 'Локальные компоненты Post', descText: 'Тайлы, окна и поповеры модулей Post: как работают, из чего собраны, зачем', href: 'apps/local-components/postrade/index.html', folder: 'apps/local-components/postrade', iconName: 'layout-grid-01' },
  { linkId: 'deals-app', teamCode: 'POST', title: 'Post — ДИД', descText: 'Финансист ДИД: главная, текущий портфель, страница сделки', href: 'apps/postrade/deals-app/pages/MainPage.html', folder: 'apps/postrade/deals-app', iconName: 'folder' },
  { linkId: 'screen-map-post', teamCode: 'POST', title: 'Карта Post', descText: 'Все страницы Post в один клик: от главной до транша и расчета FV', href: 'apps/screen-map/postrade/index.html', folder: 'apps/screen-map/postrade', iconName: 'tree-view' },

  { linkId: 'local-kit-pre', teamCode: 'PRE', title: 'Локальные компоненты Pre', descText: 'Тайлы, окна и поповеры модулей Pre: как работают, из чего собраны, зачем', href: 'apps/local-components/pretrade/index.html', folder: 'apps/local-components/pretrade', iconName: 'layout-grid-01' },

  { linkId: 'local-kit-ib', teamCode: 'IB', title: 'Локальные компоненты IB', descText: 'Тайлы, окна и поповеры модулей IB: как работают, из чего собраны, зачем', href: 'apps/local-components/ib/index.html', folder: 'apps/local-components/ib', iconName: 'layout-grid-01' },
  { linkId: 'banker-app', teamCode: 'IB', title: 'AI Pitcher', descText: 'Origination: новый отчёт в чате, история запросов, подготовка материала', href: 'apps/ib/banker-app/pages/index.html', folder: 'apps/ib/banker-app', iconName: 'ai-stars' },
  { linkId: 'screen-map-ib', teamCode: 'IB', title: 'Карта IB', descText: 'Все страницы AI Pitcher в один клик: от главной до нити запроса', href: 'apps/screen-map/ib/index.html', folder: 'apps/screen-map/ib', iconName: 'tree-view' },

  { linkId: 'local-kit-core', teamCode: 'CORE', title: 'Локальные компоненты Core', descText: 'Тайлы, окна и поповеры модулей Core: как работают, из чего собраны, зачем', href: 'apps/local-components/core/index.html', folder: 'apps/local-components/core', iconName: 'layout-grid-01' },
  { linkId: 'dashboard-app', teamCode: 'CORE', title: 'Дашборд Аналитика', descText: 'Редизайн главной: профиль, встречи, задачи и новости по клиентам', href: 'apps/core/dashboard-app/pages/HomePage.preview.html', folder: 'apps/core/dashboard-app', iconName: 'layout-grid-01' }
];

/** Колонки «Концепты» и «Спецификации на разработку». @type {HubGroupRsDto[]} */
window.HUB_GROUPS = [
  /* ---- Post: концепты ---- */
  {
    groupId: 'early-interest', teamCode: 'POST', kindCode: 'CONCEPT',
    title: 'Досрочное погашение процентов',
    descText: 'Транш: тайл, страница платежей, окно платежа с расчётом задолженности',
    versions: [
      { versionId: 'early-interest-v03', versionLabel: 'v3', descText: 'Горизонтальный тайл приоритета, авторасчёт задолженности на дату', href: 'apps/postrade/drafts/early-interest-v03/pages/Tranche.preview.html', folder: 'apps/postrade/drafts/early-interest-v03', shelfCode: 'ACTUAL' },
      { versionId: 'early-interest-v02', versionLabel: 'v2', descText: 'Статусы обработки платежей и приоритет погашения', href: 'apps/postrade/drafts/early-interest-v02/pages/Tranche.preview.html', folder: 'apps/postrade/drafts/early-interest-v02', shelfCode: 'ARCHIVE' },
      { versionId: 'early-interest', versionLabel: 'v1', descText: 'Карточка «Досрочные проценты», окна «Новые проценты» и «Порядок погашения»', href: 'apps/postrade/drafts/early-interest/pages/Tranche.preview.html', folder: 'apps/postrade/drafts/early-interest', shelfCode: 'ARCHIVE' }
    ]
  },
  {
    groupId: 'tranche-page', teamCode: 'POST', kindCode: 'CONCEPT',
    title: 'Корректировки РСБУ',
    descText: 'Сделка и транш: финансовые метрики и корректировки процентов РСБУ',
    versions: [
      { versionId: 'tranche-page-v03', versionLabel: 'v3', descText: 'Фиксация расчёта процентов на вкладке РСБУ, корректировка по дельтам', href: 'apps/postrade/drafts/tranche-page-v03/pages/Deal.preview.html', folder: 'apps/postrade/drafts/tranche-page-v03', shelfCode: 'ACTUAL' },
      { versionId: 'tranche-page-v02', versionLabel: 'v2', descText: 'Корректировки процентов РСБУ', href: 'apps/postrade/drafts/tranche-page-v02/pages/Tranche.html', folder: 'apps/postrade/drafts/tranche-page-v02', shelfCode: 'ARCHIVE' },
      { versionId: 'tranche-page', versionLabel: 'v1', descText: 'Транш: шапка, общая информация, проценты, комиссии, платежи', href: 'apps/postrade/drafts/tranche-page/pages/Tranche.html', folder: 'apps/postrade/drafts/tranche-page', shelfCode: 'ARCHIVE' }
    ]
  },
  {
    groupId: 'hub-redesign', teamCode: 'POST', kindCode: 'CONCEPT',
    title: 'Хаб проектов: новый UI',
    descText: 'Эта страница: общий ряд, выбор команды, три колонки',
    versions: [
      { versionId: 'hub-redesign', versionLabel: 'v1', descText: 'Эта страница: общий ряд, выбор команды, три колонки', href: 'apps/postrade/drafts/hub-redesign/pages/Hub.html', folder: 'apps/postrade/drafts/hub-redesign', shelfCode: 'ACTUAL' }
    ]
  },

  /* ---- Post: спецификации на разработку ---- */
  {
    groupId: 'spec-early-interest', teamCode: 'POST', kindCode: 'SPEC',
    title: 'Досрочное погашение процентов',
    descText: 'Модуль postrade/drafts/early-interest',
    versions: [
      { versionId: 'EarlyInterestPaymentsV3', versionLabel: 'Концепт v3', descText: 'версия 1.001 · 23.10.2026 · снимков 23', href: 'apps/postrade/drafts/dev-specs/pages/Spec.html?spec=EarlyInterestPaymentsV3', folder: 'apps/postrade/drafts/dev-specs' },
      { versionId: 'EarlyInterestPayments', versionLabel: 'Концепт v2', descText: 'версия 1.000 · 16.10.2026 · снимков 30', href: 'apps/postrade/drafts/dev-specs/pages/Spec.html?spec=EarlyInterestPayments', folder: 'apps/postrade/drafts/dev-specs' }
    ]
  },
  {
    groupId: 'spec-rsbu', teamCode: 'POST', kindCode: 'SPEC',
    title: 'Корректировки процентов РСБУ',
    descText: 'Модуль postrade/drafts/tranche-page-v03',
    versions: [
      { versionId: 'RsbuInterestAdjustments', versionLabel: 'Концепт v3', descText: 'версия 2.000 · 23.10.2026 · снимков 20', href: 'apps/postrade/drafts/dev-specs/pages/Spec.html?spec=RsbuInterestAdjustments', folder: 'apps/postrade/drafts/dev-specs' }
    ]
  },

  /* ---- Pre ---- */
  {
    groupId: 'pipeline-manager', teamCode: 'PRE', kindCode: 'CONCEPT',
    title: 'Pipeline Management',
    descText: 'Сделки и лиды всех pipeline: канбан по стадиям и дескам, таблица',
    versions: [
      { versionId: 'pipelineManager-v02', versionLabel: 'v2', descText: 'Канбан по стадиям и дескам, таблица — версия 02', href: 'apps/pretrade/drafts/pipelineManager-v02/pages/index.html', folder: 'apps/pretrade/drafts/pipelineManager-v02', shelfCode: 'ACTUAL' },
      { versionId: 'pipelineManager-v01', versionLabel: 'v1', descText: 'Канбан по стадиям и дескам, таблица', href: 'apps/pretrade/drafts/pipelineManager-v01/pages/index.html', folder: 'apps/pretrade/drafts/pipelineManager-v01', shelfCode: 'ACTUAL' }
    ]
  },
  {
    groupId: 'pipeline-scanner', teamCode: 'PRE', kindCode: 'CONCEPT',
    title: 'Pipeline Scanner',
    descText: 'Нить запроса, конструктор, материалы с заключением АР, история и журнал',
    versions: [
      { versionId: 'pipelineScanner-v07', versionLabel: 'v7', descText: 'Нить запроса, конструктор, материалы с заключением АР, история и журнал', href: 'apps/pretrade/drafts/pipelineScanner-v07/pages/index.html', folder: 'apps/pretrade/drafts/pipelineScanner-v07', shelfCode: 'ACTUAL' }
    ]
  },

  /* ---- IB ---- */
  {
    groupId: 'ai-pitcher', teamCode: 'IB', kindCode: 'CONCEPT',
    title: 'AI Pitcher',
    descText: 'Прототип модуля: чат, конструктор запроса, история, журнал',
    versions: [
      { versionId: 'ai-bankster-prototype-v02', versionLabel: 'v2', descText: 'Чат с конструктором запроса и просмотром материала', href: 'apps/ib/drafts/ai-bankster-prototype-v02/pages/index.html', folder: 'apps/ib/drafts/ai-bankster-prototype-v02', shelfCode: 'ACTUAL' },
      { versionId: 'ai-bankster-prototype-v01', versionLabel: 'v1', descText: 'Новый отчёт, история, журнал', href: 'apps/ib/drafts/ai-bankster-prototype-v01/pages/index.html', folder: 'apps/ib/drafts/ai-bankster-prototype-v01', shelfCode: 'ACTUAL' }
    ]
  },

  /* ---- Core ---- */
  {
    groupId: 'ibp-redesign', teamCode: 'CORE', kindCode: 'CONCEPT',
    title: 'IBP Redesign',
    descText: 'Редизайн страниц под роль «Аналитик ДИД»',
    versions: [
      { versionId: 'ibp-redesign-v2', versionLabel: 'v2', descText: 'Единые лиды, главная «Мои проекты» и путь лида', href: 'apps/core/drafts/ibp-redesign-v2/pages/HomeBoard.preview.html', folder: 'apps/core/drafts/ibp-redesign-v2', shelfCode: 'ACTUAL' },
      { versionId: 'ibp-redesign-v1', versionLabel: 'v1', descText: 'Текущая система: страницы на компонентах ДС, контекст для редизайна', href: 'apps/core/drafts/ibp-redesign-v1/pages/HomePage.html', folder: 'apps/core/drafts/ibp-redesign-v1', shelfCode: 'ACTUAL' }
    ]
  }
];

/** Подписи кодов HubShelfCode для интерфейса. @type {Record<HubShelfCode, string>} */
window.HUB_SHELF_LABELS = {
  ACTUAL: 'Актуальное',
  ARCHIVE: 'Архив'
};
