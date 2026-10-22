/* =========================================================================
   Запросы AI Pitcher и ответы в диалоге — демо-данные
   (window.MOCK_REPORT_REQUESTS, window.MOCK_REQUEST_DIALOGS).

   Обычный <script>, а не JSON: страницы открываются по file://, где fetch не
   работает. Подключается до экранного скрипта:
   <script src="../data/report-requests.js"></script>.

   Панель «Недавние запросы» на странице RequestThread показывает последние
   10 запросов пользователя (БТ-4.1); у двух из них нет отчёта — только ответ
   в диалоге (MOCK_REQUEST_DIALOGS). Даты — ISO-строки, «12 минут назад» и
   «вчера, 17:40» страница считает от демо-времени window.REPORT_DEMO_NOW.
   ========================================================================= */

/**
 * Запрос пользователя к AI Pitcher: одна нить чата.
 * Source: invented (20.10.2026) — заменить на DTO, когда он появится.
 * @typedef {Object} ReportRequestRsDto
 * @property {number} requestId               номер запроса
 * @property {string} title                   название запроса в истории и в шапке нити
 * @property {string|null} objectName         объект отчёта — компания, группа, бенефициар или рынок; null — пользовательский промпт без объекта
 * @property {string[]} focusNames            продуктовый фокус отчёта; пусто у промпта
 * @property {number} versionCount            сколько версий материала подготовлено; 0 — отчёта нет
 * @property {string} updatedAt               дата и время последнего изменения, ISO
 * @property {ReportRequestStatusCode} statusCode состояние запроса
 */

/**
 * Состояние запроса.
 * Source: invented (20.10.2026).
 * @typedef {'READY'|'RUNNING'|'ANSWERED'} ReportRequestStatusCode
 */

/**
 * Вопрос и ответ в нити без подготовки отчёта.
 * Source: invented (20.10.2026).
 * @typedef {Object} RequestDialogRsDto
 * @property {number} requestId     запрос, которому принадлежит диалог
 * @property {string} askedAt       когда задан вопрос, ISO
 * @property {string} question      текст вопроса пользователя
 * @property {string} answer        ответ AI Pitcher
 * @property {string[]} sourceNames источники ответа, как их показывает интерфейс
 */

/** Демо-время прототипа: от него считается «N минут назад». @type {string} */
window.REPORT_DEMO_NOW = '2026-09-12T12:00:00';

/** @type {ReportRequestRsDto[]} */
window.MOCK_REPORT_REQUESTS = [
  { requestId: 1,  title: 'ГК «Северный агрохолдинг» — выход миноритария',          objectName: 'ГК «Северный агрохолдинг»', focusNames: ['Оценка по мультипликаторам'],        versionCount: 2, updatedAt: '2026-09-12T11:48:00', statusCode: 'READY' },
  { requestId: 2,  title: 'ПАО «Волга-Агро» — оценка перед встречей',               objectName: 'ПАО «Волга-Агро»',          focusNames: ['Структура владения'],                versionCount: 1, updatedAt: '2026-09-12T11:20:00', statusCode: 'RUNNING' },
  { requestId: 4,  title: 'Логистика последней мили, Юг России',                    objectName: null,                        focusNames: [],                                    versionCount: 0, updatedAt: '2026-09-11T17:40:00', statusCode: 'ANSWERED' },
  { requestId: 5,  title: 'Бенефициар Токарев П. А. — активы и структура владения', objectName: 'Бенефициар Токарев П. А.',  focusNames: ['Структура владения'],                versionCount: 3, updatedAt: '2026-09-10T15:10:00', statusCode: 'READY' },
  { requestId: 6,  title: 'АО «Метизный завод» — рефинансирование выпуска',         objectName: 'АО «Метизный завод»',       focusNames: ['Рефинансирование'],                  versionCount: 1, updatedAt: '2026-09-09T13:30:00', statusCode: 'READY' },
  { requestId: 8,  title: 'ГК «Северный агрохолдинг» — долговой профиль',           objectName: 'ГК «Северный агрохолдинг»', focusNames: ['Долговая нагрузка и ковенанты'],     versionCount: 1, updatedAt: '2026-09-05T16:45:00', statusCode: 'READY' },
  { requestId: 9,  title: 'Сравнение peers в агросекторе за 2025 год',              objectName: null,                        focusNames: [],                                    versionCount: 0, updatedAt: '2026-09-03T10:15:00', statusCode: 'ANSWERED' },
  { requestId: 10, title: 'ООО «Каспий-Порт» — расширение терминала',               objectName: 'ООО «Каспий-Порт»',         focusNames: ['Продуктовые идеи для встречи'],      versionCount: 2, updatedAt: '2026-08-28T12:00:00', statusCode: 'READY' }
];

/** Подписи кодов ReportRequestStatusCode. Чип в панели — только у READY и RUNNING. @type {Record<ReportRequestStatusCode, string>} */
window.REPORT_REQUEST_STATUS_LABELS = {
  READY: 'Материал готов',
  RUNNING: 'Идет подготовка...',
  ANSWERED: 'Ответ в диалоге'
};

/** @type {RequestDialogRsDto[]} */
window.MOCK_REQUEST_DIALOGS = [
  {
    requestId: 4,
    askedAt: '2026-09-11T17:40:00',
    question: 'Кто лидирует в логистике последней мили на Юге России и есть ли там свободные ниши?',
    answer: 'Рынок доставки последней мили в ЮФО — около 38 млрд ₽ за 2025 год, рост 24% г/г. Половина объёма у трёх федеральных операторов, остальное — региональные курьерские службы. Свободная ниша — доставка и фулфилмент для продуктовых и агросетей в малых городах Краснодарского края и Ростовской области: своей складской сети там нет ни у одного крупного игрока.',
    sourceNames: ['Отраслевой обзор 2026', 'Данные Росстата', 'Раскрытие эмитентов']
  },
  {
    requestId: 9,
    askedAt: '2026-09-03T10:15:00',
    question: 'Сравни маржу ГК «Северный агрохолдинг» с ближайшими конкурентами за 2025 год.',
    answer: 'EBITDA-маржа группы — 18,9% против 14–16% у трёх ближайших конкурентов. Разрыв держится на вертикальной интеграции по кормам и собственной переработке. По оборачиваемости запасов группа на уровне рынка: 94 дня против 90–105 у peers.',
    sourceNames: ['Отчётность МСФО 2025', 'Раскрытие эмитентов', 'Отраслевой обзор 2026']
  }
];
