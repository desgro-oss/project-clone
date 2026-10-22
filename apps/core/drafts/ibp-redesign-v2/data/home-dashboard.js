/* Главная: профиль и дашборд концепта ibp-redesign-v2.
 * Источники содержимого: dashboard-app/data/mock-{profile,meetings,tasks,news}.js
 * и HomeProfileTile (09–15.10.2026). Локальная копия не меняет исходное приложение.
 * Source: invented (20.10.2026), имена исходных полей сохранены; DTO нет.
 */
(function () {
  'use strict';

  /**
   * Профиль сотрудника. Source: invented (09.10.2026), mock-profile.js.
   * @typedef {Object} HomeDashboardProfileRsDto
   * @property {string} employeeId Идентификатор сотрудника.
   * @property {string} employeeNumber Табельный номер из запроса пользователя 20.10.2026.
   * @property {string} lastName Фамилия.
   * @property {string} firstName Имя.
   * @property {string} middleName Отчество.
   * @property {string} positionName Должность.
   * @property {string[]} deskNames Дески сотрудника (несколько).
   * @property {string[]} groups Группы доступа из исходного прототипа.
   * @property {string} phone Рабочий телефон.
   * @property {string} email Рабочая почта.
   * @property {string|null} photoUrl Локальная копия исходного фото.
   * @property {boolean} isOnline Признак присутствия; на экране не показывается.
   */
  /**
   * Встреча. Source: invented (09.10.2026), mock-meetings.js.
   * @typedef {Object} HomeDashboardMeetingRsDto
   * @property {string} meetingId Идентификатор встречи.
   * @property {string} clientName Клиент.
   * @property {string} topic Тема.
   * @property {string} startDateTime Начало, ISO без часового пояса.
   * @property {string} endDateTime Окончание, ISO без часового пояса.
   * @property {string} contactName Контакт клиента.
   * @property {string} contactPosition Должность контакта.
   * @property {{name:string,position:string}[]} [participants] Дополнительные участники клиента.
   * @property {string} organizerName Организатор.
   * @property {'SCHEDULED'|'NEEDS_ATTENTION'|'PROTOCOL_DONE'|'CANCELLED'} statusCode Статус.
   * @property {boolean} isMine Встреча сотрудника.
   */
  /**
   * Задача. Source: invented (09.10.2026), mock-tasks.js.
   * @typedef {Object} HomeDashboardTaskRsDto
   * @property {string} taskId Идентификатор задачи.
   * @property {string} title Формулировка.
   * @property {'HIGH'|'MEDIUM'|'LOW'} priorityCode Приоритет.
   * @property {'NEW'|'IN_PROGRESS'|'DONE'|'NEEDS_CORRECTION'} statusCode Статус.
   * @property {string} dueDate Срок, ISO-дата.
   * @property {string} createdDate Дата создания, ISO-дата.
   * @property {string|null} dealNumber Связанная сделка.
   * @property {string|null} clientName Клиент.
   * @property {string} assigneeName Исполнитель.
   * @property {string[]} assigneeGroups Группы исполнителя.
   * @property {boolean} isMine Задача сотрудника.
   */
  /**
   * Новость. Source: invented (09.10.2026), mock-news.js; публикации вымышлены.
   * @typedef {Object} HomeDashboardNewsRsDto
   * @property {string} newsId Идентификатор новости.
   * @property {string} publishedAt Дата публикации, ISO.
   * @property {string} sourceName Название источника.
   * @property {string} title Заголовок.
   * @property {string} summary Краткое содержание.
   * @property {string} clientName Клиент.
   * @property {boolean} isMyClient Клиент сотрудника.
   * @property {boolean} [isFavorite] Избранный клиент.
   * @property {string} url Адрес источника; в исходнике «#», внешнего перехода нет.
   */
  /**
   * Полный локальный снимок данных. Source: invented (20.10.2026).
   * @typedef {Object} HomeDashboardRsDto
   * @property {HomeDashboardProfileRsDto} profile Профиль.
   * @property {HomeDashboardMeetingRsDto[]} meetings Встречи.
   * @property {HomeDashboardTaskRsDto[]} tasks Задачи.
   * @property {HomeDashboardNewsRsDto[]} news Новости.
   * @property {Object<string,string>} meetingStatusLabels Подписи статусов встреч.
   * @property {Object<string,string>} taskStatusLabels Подписи статусов задач.
   * @property {Object<string,string>} taskPriorityLabels Подписи приоритетов.
   */
  /** @type {HomeDashboardRsDto} */
  var data = {
  "profile": {
    "employeeId": "E-1042",
    "employeeNumber": "21492411",
    "lastName": "Ким",
    "firstName": "Анна",
    "middleName": "Сергеевна",
    "positionName": "Управляющий директор",
    "deskNames": [
      "Недвижимость",
      "Строительство"
    ],
    "groups": [
      "RD_BB"
    ],
    "phone": "+7 495 000-10-42",
    "email": "a.kim@example.ru",
    "photoUrl": "../refs/home-profile-anna-kim.jpg",
    "isOnline": true
  },
  "meetings": [
    {
      "meetingId": "M-0101",
      "clientName": "ГК «Волга Тех»",
      "topic": "Ковенанты на горизонте трёх лет",
      "startDateTime": "2026-10-09T09:30",
      "endDateTime": "2026-10-09T10:30",
      "contactName": "Яковлев Б. А.",
      "contactPosition": "Управляющий партнёр",
      "organizerName": "Ким А. С.",
      "statusCode": "PROTOCOL_DONE",
      "isMine": true
    },
    {
      "meetingId": "M-0102",
      "clientName": "АО «Урал-Инвест»",
      "topic": "Условия рефинансирования",
      "startDateTime": "2026-10-09T14:00",
      "endDateTime": "2026-10-09T15:00",
      "contactName": "Иванов П. А.",
      "contactPosition": "Директор",
      "participants": [
        {
          "name": "Яковлев Б. А.",
          "position": "Управляющий партнёр"
        }
      ],
      "organizerName": "Ким А. С.",
      "statusCode": "NEEDS_ATTENTION",
      "isMine": true
    },
    {
      "meetingId": "M-0108",
      "clientName": "ООО «Сима-Опт»",
      "topic": "Созвон по лимиту на оборотное кредитование",
      "startDateTime": "2026-10-09T17:00",
      "endDateTime": "2026-10-09T17:30",
      "contactName": "Соколова Т. В.",
      "contactPosition": "Финансовый директор",
      "organizerName": "Ким А. С.",
      "statusCode": "SCHEDULED",
      "isMine": true
    },
    {
      "meetingId": "M-0103",
      "clientName": "АО «СтройАтомКомплекс»",
      "topic": "Знакомство с новым финансовым директором",
      "startDateTime": "2026-10-10T11:00",
      "endDateTime": "2026-10-10T12:00",
      "contactName": "Петров П. А.",
      "contactPosition": "Директор",
      "organizerName": "Зуев Р. Р.",
      "statusCode": "SCHEDULED",
      "isMine": true
    },
    {
      "meetingId": "M-0104",
      "clientName": "ПУБЛИЧНОЕ АКЦИОНЕРНОЕ ОБЩЕСТВО «АКЦИОНЕРНАЯ ФИНАНСОВАЯ КОРПОРАЦИЯ «СИСТЕМА»",
      "topic": "Проектное финансирование второй очереди",
      "startDateTime": "2026-10-12T10:00",
      "endDateTime": "2026-10-12T11:00",
      "contactName": "Ковалёв Д. Н.",
      "contactPosition": "Директор по строительству",
      "organizerName": "Ким А. С.",
      "statusCode": "SCHEDULED",
      "isMine": true
    },
    {
      "meetingId": "M-0105",
      "clientName": "ПАО «Трубная группа»",
      "topic": "График погашения по траншу",
      "startDateTime": "2026-10-13T15:30",
      "endDateTime": "2026-10-13T16:30",
      "contactName": "Морозова И. С.",
      "contactPosition": "Директор по финансам",
      "participants": [
        {
          "name": "Иванов П. А.",
          "position": "Управляющий директор"
        },
        {
          "name": "Спиридонов Д. С.",
          "position": "Руководитель блока развития"
        }
      ],
      "organizerName": "Ким А. С.",
      "statusCode": "SCHEDULED",
      "isMine": true
    },
    {
      "meetingId": "M-0106",
      "clientName": "ООО «Сима-Опт»",
      "topic": "Лимит на оборотное кредитование",
      "startDateTime": "2026-10-14T12:00",
      "endDateTime": "2026-10-14T13:00",
      "contactName": "Соколова Т. В.",
      "contactPosition": "Финансовый директор",
      "organizerName": "Зуев Р. Р.",
      "statusCode": "SCHEDULED",
      "isMine": true
    },
    {
      "meetingId": "M-0107",
      "clientName": "ООО «ДомСтрой Сибирь»",
      "topic": "Итоги due diligence",
      "startDateTime": "2026-10-16T16:00",
      "endDateTime": "2026-10-16T17:00",
      "contactName": "Ковалёв Д. Н.",
      "contactPosition": "Директор по строительству",
      "organizerName": "Ким А. С.",
      "statusCode": "SCHEDULED",
      "isMine": true
    },
    {
      "meetingId": "M-0201",
      "clientName": "ПАО «СибМеталл»",
      "topic": "Материалы к КПКИ",
      "startDateTime": "2026-10-09T12:00",
      "endDateTime": "2026-10-09T13:00",
      "contactName": "Гусев А. П.",
      "contactPosition": "Директор",
      "organizerName": "Орлова Е. В.",
      "statusCode": "SCHEDULED",
      "isMine": false
    },
    {
      "meetingId": "M-0202",
      "clientName": "АО «Платформа»",
      "topic": "Прогноз P&L на 2027 год",
      "startDateTime": "2026-10-09T16:30",
      "endDateTime": "2026-10-09T17:30",
      "contactName": "Белова Н. К.",
      "contactPosition": "Финансовый директор",
      "organizerName": "Зуев Р. Р.",
      "statusCode": "NEEDS_ATTENTION",
      "isMine": false
    },
    {
      "meetingId": "M-0203",
      "clientName": "ПАО «СибМеталл»",
      "topic": "Структура сделки",
      "startDateTime": "2026-10-11T10:00",
      "endDateTime": "2026-10-11T11:00",
      "contactName": "Гусев А. П.",
      "contactPosition": "Директор",
      "organizerName": "Белов И. А.",
      "statusCode": "SCHEDULED",
      "isMine": false
    },
    {
      "meetingId": "M-0204",
      "clientName": "АО «Платформа»",
      "topic": "Отчётность за 9 месяцев",
      "startDateTime": "2026-10-15T11:30",
      "endDateTime": "2026-10-15T12:30",
      "contactName": "Белова Н. К.",
      "contactPosition": "Финансовый директор",
      "organizerName": "Орлова Е. В.",
      "statusCode": "NEEDS_ATTENTION",
      "isMine": false
    },
    {
      "meetingId": "M-0205",
      "clientName": "ГК «Эталон-Сити»",
      "topic": "Коммерческое предложение",
      "startDateTime": "2026-10-20T14:00",
      "endDateTime": "2026-10-20T15:00",
      "contactName": "Липатова Е. А.",
      "contactPosition": "Коммерческий директор",
      "organizerName": "Белов И. А.",
      "statusCode": "SCHEDULED",
      "isMine": false
    }
  ],
  "tasks": [
    {
      "taskId": "T-1001",
      "title": "Обновить forecast P&L по АО «Платформа»",
      "priorityCode": "HIGH",
      "statusCode": "DONE",
      "dueDate": "2026-10-05",
      "createdDate": "2026-09-28",
      "dealNumber": "D-126618",
      "clientName": "АО «Платформа»",
      "assigneeName": "Ким А. С.",
      "assigneeGroups": [
        "RD_BB"
      ],
      "isMine": true
    },
    {
      "taskId": "T-1002",
      "title": "Проверить пакет КПКИ по ГК «Волга Тех»",
      "priorityCode": "HIGH",
      "statusCode": "NEW",
      "dueDate": "2026-10-09",
      "createdDate": "2026-10-09",
      "dealNumber": "D-134518",
      "clientName": "ГК «Волга Тех»",
      "assigneeName": "Ким А. С.",
      "assigneeGroups": [
        "RD_BB"
      ],
      "isMine": true
    },
    {
      "taskId": "T-1003",
      "title": "Обновить КП «Эталон-Сити»",
      "priorityCode": "HIGH",
      "statusCode": "NEW",
      "dueDate": "2026-10-09",
      "createdDate": "2026-10-07",
      "dealNumber": "D-153418",
      "clientName": "ГК «Эталон-Сити»",
      "assigneeName": "Ким А. С.",
      "assigneeGroups": [
        "RD_BB"
      ],
      "isMine": true
    },
    {
      "taskId": "T-1004",
      "title": "Сверить график погашения по траншу",
      "priorityCode": "MEDIUM",
      "statusCode": "IN_PROGRESS",
      "dueDate": "2026-10-07",
      "createdDate": "2026-10-01",
      "dealNumber": "D-118204",
      "clientName": "ПАО «Трубная группа»",
      "assigneeName": "Ким А. С.",
      "assigneeGroups": [
        "RD_BB"
      ],
      "isMine": true
    },
    {
      "taskId": "T-1005",
      "title": "Подготовить справку по ковенантам",
      "priorityCode": "LOW",
      "statusCode": "NEEDS_CORRECTION",
      "dueDate": "2026-10-08",
      "createdDate": "2026-10-02",
      "dealNumber": "D-126618",
      "clientName": "АО «Платформа»",
      "assigneeName": "Ким А. С.",
      "assigneeGroups": [
        "RD_BB"
      ],
      "isMine": true
    },
    {
      "taskId": "T-1006",
      "title": "Актуализировать рейтинг заёмщика",
      "priorityCode": "MEDIUM",
      "statusCode": "IN_PROGRESS",
      "dueDate": "2026-10-09",
      "createdDate": "2026-10-03",
      "dealNumber": "D-120998",
      "clientName": "ПАО «СибМеталл»",
      "assigneeName": "Ким А. С.",
      "assigneeGroups": [
        "RD_BB"
      ],
      "isMine": true
    },
    {
      "taskId": "T-1007",
      "title": "Проверить исполнение ковенантов за III квартал",
      "priorityCode": "MEDIUM",
      "statusCode": "IN_PROGRESS",
      "dueDate": "2026-10-09",
      "createdDate": "2026-10-05",
      "dealNumber": "D-134518",
      "clientName": "ГК «Волга Тех»",
      "assigneeName": "Ким А. С.",
      "assigneeGroups": [
        "RD_BB"
      ],
      "isMine": true
    },
    {
      "taskId": "T-1008",
      "title": "Добавить данные по клиенту в сделку",
      "priorityCode": "MEDIUM",
      "statusCode": "NEW",
      "dueDate": "2026-10-09",
      "createdDate": "2026-10-09",
      "dealNumber": "D-120998",
      "clientName": "ПАО «СибМеталл»",
      "assigneeName": "Ким А. С.",
      "assigneeGroups": [
        "RD_BB"
      ],
      "isMine": true
    },
    {
      "taskId": "T-1009",
      "title": "Обновить контакты клиента",
      "priorityCode": "LOW",
      "statusCode": "NEW",
      "dueDate": "2026-10-09",
      "createdDate": "2026-10-06",
      "dealNumber": null,
      "clientName": "ООО «ДомСтрой Сибирь»",
      "assigneeName": "Ким А. С.",
      "assigneeGroups": [
        "RD_BB"
      ],
      "isMine": true
    },
    {
      "taskId": "T-1010",
      "title": "Согласовать условия рефинансирования",
      "priorityCode": "HIGH",
      "statusCode": "IN_PROGRESS",
      "dueDate": "2026-10-09",
      "createdDate": "2026-10-06",
      "dealNumber": "D-160231",
      "clientName": "АО «Урал-Инвест»",
      "assigneeName": "Ким А. С.",
      "assigneeGroups": [
        "RD_BB"
      ],
      "isMine": true
    },
    {
      "taskId": "T-1011",
      "title": "Внести итоги встречи с ГК «Волга Тех»",
      "priorityCode": "MEDIUM",
      "statusCode": "IN_PROGRESS",
      "dueDate": "2026-10-09",
      "createdDate": "2026-10-09",
      "dealNumber": "D-134518",
      "clientName": "ГК «Волга Тех»",
      "assigneeName": "Ким А. С.",
      "assigneeGroups": [
        "RD_BB"
      ],
      "isMine": true
    },
    {
      "taskId": "T-1012",
      "title": "Согласовать материалы к КПКИ",
      "priorityCode": "MEDIUM",
      "statusCode": "NEW",
      "dueDate": "2026-10-12",
      "createdDate": "2026-10-08",
      "dealNumber": "D-120998",
      "clientName": "ПАО «СибМеталл»",
      "assigneeName": "Ким А. С.",
      "assigneeGroups": [
        "RD_BB"
      ],
      "isMine": true
    },
    {
      "taskId": "T-1013",
      "title": "Подготовить выгрузку по портфелю деска",
      "priorityCode": "LOW",
      "statusCode": "NEW",
      "dueDate": "2026-10-14",
      "createdDate": "2026-10-08",
      "dealNumber": null,
      "clientName": null,
      "assigneeName": "Ким А. С.",
      "assigneeGroups": [
        "RD_BB"
      ],
      "isMine": true
    },
    {
      "taskId": "T-1014",
      "title": "Проверить залоговое обеспечение",
      "priorityCode": "MEDIUM",
      "statusCode": "IN_PROGRESS",
      "dueDate": "2026-10-15",
      "createdDate": "2026-10-07",
      "dealNumber": "D-118204",
      "clientName": "ПАО «Трубная группа»",
      "assigneeName": "Ким А. С.",
      "assigneeGroups": [
        "RD_BB"
      ],
      "isMine": true
    },
    {
      "taskId": "T-2001",
      "title": "Подготовить заключение по лимиту",
      "priorityCode": "HIGH",
      "statusCode": "NEW",
      "dueDate": "2026-10-07",
      "createdDate": "2026-10-09",
      "dealNumber": "D-161004",
      "clientName": "ООО «Сима-Опт»",
      "assigneeName": "Зуев Р. Р.",
      "assigneeGroups": [
        "CIB_MANAGEMENT",
        "RD_BB",
        "RE"
      ],
      "isMine": false
    },
    {
      "taskId": "T-2002",
      "title": "Запросить отчётность за 9 месяцев",
      "priorityCode": "MEDIUM",
      "statusCode": "NEEDS_CORRECTION",
      "dueDate": "2026-10-06",
      "createdDate": "2026-09-30",
      "dealNumber": "D-153418",
      "clientName": "ГК «Эталон-Сити»",
      "assigneeName": "Орлова Е. В.",
      "assigneeGroups": [
        "RD_BB",
        "RE"
      ],
      "isMine": false
    },
    {
      "taskId": "T-2003",
      "title": "Проверить анкету клиента",
      "priorityCode": "LOW",
      "statusCode": "NEW",
      "dueDate": "2026-10-13",
      "createdDate": "2026-10-08",
      "dealNumber": null,
      "clientName": "АО «СтройАтомКомплекс»",
      "assigneeName": "Белов И. А.",
      "assigneeGroups": [
        "RE"
      ],
      "isMine": false
    },
    {
      "taskId": "T-2004",
      "title": "Обновить модель денежных потоков",
      "priorityCode": "MEDIUM",
      "statusCode": "IN_PROGRESS",
      "dueDate": "2026-10-09",
      "createdDate": "2026-10-04",
      "dealNumber": "D-160231",
      "clientName": "АО «Урал-Инвест»",
      "assigneeName": "Зуев Р. Р.",
      "assigneeGroups": [
        "CIB_MANAGEMENT",
        "RD_BB",
        "RE"
      ],
      "isMine": false
    }
  ],
  "news": [
    {
      "newsId": "N-301",
      "publishedAt": "2026-10-08",
      "sourceName": "Деловой вестник",
      "title": "ГК «Волга Тех» запускает вторую очередь логистического комплекса",
      "summary": "Группа рассчитывает завершить строительство до конца 2027 года и увеличить складские мощности на 40%.",
      "clientName": "ГК «Волга Тех»",
      "isMyClient": true,
      "isFavorite": true,
      "url": "#"
    },
    {
      "newsId": "N-302",
      "publishedAt": "2026-10-07",
      "sourceName": "Финансовая лента",
      "title": "АО «Урал-Инвест» готовит рефинансирование кредитного портфеля",
      "summary": "Компания ведёт переговоры с несколькими банками и планирует удлинить сроки заимствований.",
      "clientName": "АО «Урал-Инвест»",
      "isMyClient": true,
      "url": "#"
    },
    {
      "newsId": "N-303",
      "publishedAt": "2026-10-05",
      "sourceName": "Отраслевое обозрение",
      "title": "ПАО «Трубная группа» показала рост отгрузок по итогам III квартала",
      "summary": "Рост обеспечен спросом на продукцию для энергетических проектов и экспортными поставками.",
      "clientName": "ПАО «Трубная группа»",
      "isMyClient": true,
      "isFavorite": true,
      "url": "#"
    },
    {
      "newsId": "N-304",
      "publishedAt": "2026-10-02",
      "sourceName": "Рынки сегодня",
      "title": "ООО «ДомСтрой Сибирь» вышло на новый региональный рынок",
      "summary": "Застройщик приобрёл участок под жилой квартал и начинает проектирование первой очереди.",
      "clientName": "ООО «ДомСтрой Сибирь»",
      "isMyClient": true,
      "url": "#"
    },
    {
      "newsId": "N-305",
      "publishedAt": "2026-09-30",
      "sourceName": "Финансовая лента",
      "title": "ООО «Сима-Опт» расширяет сеть распределительных центров",
      "summary": "Компания откроет два новых склада в Поволжье и рассчитывает сократить сроки доставки в регионы.",
      "clientName": "ООО «Сима-Опт»",
      "isMyClient": true,
      "url": "#"
    },
    {
      "newsId": "N-401",
      "publishedAt": "2026-10-08",
      "sourceName": "Финансовая лента",
      "title": "ПАО «СибМеталл» утвердило программу модернизации производства",
      "summary": "Программа рассчитана на три года и включает обновление прокатного стана и энергетического хозяйства.",
      "clientName": "ПАО «СибМеталл»",
      "isMyClient": false,
      "isFavorite": true,
      "url": "#"
    },
    {
      "newsId": "N-402",
      "publishedAt": "2026-10-06",
      "sourceName": "Деловой вестник",
      "title": "АО «Платформа» сменило финансового директора",
      "summary": "Новый финансовый директор ранее отвечал за корпоративные финансы в отраслевом холдинге.",
      "clientName": "АО «Платформа»",
      "isMyClient": false,
      "url": "#"
    },
    {
      "newsId": "N-403",
      "publishedAt": "2026-10-03",
      "sourceName": "Рынки сегодня",
      "title": "ГК «Эталон-Сити» объявила о стратегическом партнёрстве",
      "summary": "Партнёры создадут совместное предприятие для девелопмента коммерческой недвижимости.",
      "clientName": "ГК «Эталон-Сити»",
      "isMyClient": false,
      "isFavorite": true,
      "url": "#"
    }
  ],
  "meetingStatusLabels": {
    "SCHEDULED": "Запланирована",
    "NEEDS_ATTENTION": "Требует внимания",
    "PROTOCOL_DONE": "Протокол заполнен",
    "CANCELLED": "Отменена"
  },
  "taskStatusLabels": {
    "NEW": "Ожидает исполнения",
    "IN_PROGRESS": "В работе",
    "DONE": "Выполнено",
    "NEEDS_CORRECTION": "Требуется корректировка"
  },
  "taskPriorityLabels": {
    "HIGH": "Высокий",
    "MEDIUM": "Средний",
    "LOW": "Низкий"
  }
};

  // Сохраняем дату исходного прототипа: все показатели относятся к 09.10.2026.
  var TODAY = '2026-10-09';
  var DAY_LABELS = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  var MEETINGS_URL = 'MeetingsProtocolsPage.preview.html';
  var TASKS_URL = 'TasksPage.preview.html';
  var root = null;
  var profileRoot = null;
  var meetingScope = 'MY';
  var taskScope = 'MY';
  var newsScope = 'MY';
  var allNews = false;
  var sequence = 0;

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function icon(name) { return '<i data-icon="' + name + '" aria-hidden="true"></i>'; }
  function addDays(date, count) {
    var d = new Date(date + 'T12:00:00');
    d.setDate(d.getDate() + count);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function dateLabel(date, withYear) {
    return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short', year: withYear ? 'numeric' : undefined }).format(new Date(date + 'T12:00:00'));
  }
  function chip(label, tone) {
    return '<span class="chip chip--s chip--rounded chip--' + tone + '"><span class="chip__label">' + esc(label) + '</span></span>';
  }
  function smallMeta(name, text) {
    return '<span class="hd-meta">' + icon(name) + '<span>' + esc(text) + '</span></span>';
  }
  function applyIcons(host) { if (window.dsIcons) window.dsIcons.apply(host); }
  function scopedMeetings(scope) {
    return data.meetings.filter(function (m) { return (scope === 'DESK' || m.isMine) && m.statusCode !== 'CANCELLED' && m.startDateTime.slice(0, 10) >= TODAY; })
      .sort(function (a, b) { return a.startDateTime.localeCompare(b.startDateTime); });
  }
  function scopedTasks(scope) {
    return data.tasks.filter(function (t) { return scope === 'DESK' || t.isMine; });
  }
  function overdue(t) { return t.statusCode !== 'DONE' && t.dueDate < TODAY; }
  function scopedNews() {
    return data.news.filter(function (n) { return newsScope === 'FAV' ? n.isFavorite : newsScope === 'DESK' || n.isMyClient; })
      .sort(function (a, b) { return b.publishedAt.localeCompare(a.publishedAt); });
  }

  function segment(label, group, options, selected) {
    return '<div class="segctrl segctrl--s segctrl--fullwidth hd-scope" role="radiogroup" aria-label="' + label + '" data-hd-segment="' + group + '">' +
      '<div class="segctrl__thumb"></div>' + options.map(function (o) {
        return '<button type="button" class="segctrl__item" role="radio" aria-label="' + esc(o[1]) + '" title="' + esc(o[1]) + '" aria-checked="' + (o[0] === selected) + '" tabindex="' + (o[0] === selected ? '0' : '-1') + '" data-hd-value="' + o[0] + '"><span class="segctrl__label">' + o[1] + '</span></button>';
      }).join('') + '</div>';
  }

  function renderProfile() {
    var p = data.profile;
    var fullName = p.firstName + ' ' + p.middleName + ' ' + p.lastName;
    profileRoot.innerHTML = '<section class="hd-profile" aria-label="Профиль сотрудника">' +
      '<div class="hd-profile__identity"><span class="av av--circular av--xl hd-profile__avatar"><img class="av__img" src="' + esc(p.photoUrl) + '" alt="' + esc(fullName) + '"></span>' +
      '<div class="hd-profile__main"><p class="hd-profile__overline"><time datetime="' + TODAY + '" data-hd-demo-date>Демо · 9 октября 2026</time></p><h2 class="hd-profile__name">' + esc(fullName) + '</h2>' +
      '<div class="hd-profile__role"><span>' + esc(p.positionName) + '</span><span class="hd-profile__dot" aria-hidden="true">·</span>' +
      // Дески — readonly-чипы Chip S (решение пользователя 20.10.2026).
      '<div class="chiplist hd-profile__desks" role="list" aria-label="Дески">' + p.deskNames.map(function (d) { return '<span class="chip chip--s chip--fit" role="listitem"><span class="chip__label">' + esc(d) + '</span></span>'; }).join('') + '</div></div>' +
      '<div class="hd-profile__contacts"><button type="button" class="hd-profile__contact-copy" data-hd-copy-phone aria-label="Скопировать телефон" data-tooltip="Скопировать телефон">' + icon('phone') + '<span>' + esc(p.phone) + '</span></button>' +
      '<a href="mailto:' + esc(p.email) + '">' + icon('mail') + '<span>' + esc(p.email) + '</span></a><span class="hd-profile__account"><button type="button" class="ibtn ibtn--neutral ibtn--s" data-modal="hd-profile-details" aria-label="Открыть профиль" data-tooltip="Открыть профиль">' + icon('user-circle') + '</button><span class="hd-profile__employee-number" aria-label="Табельный номер ' + esc(p.employeeNumber) + '">' + esc(p.employeeNumber) + '</span></span></div></div></div>' +
      '<div class="hd-profile__actions"><button type="button" class="btn btn--outline btn--m" data-modal="hd-meeting-create">' + icon('calendar-plus') + '<span class="btn__label">Новая встреча</span></button>' +
      '<button type="button" class="btn btn--outline btn--m" data-modal="hd-task-create">' + icon('tasks') + '<span class="btn__label">Новая задача</span></button>' +
      // «Новый проект» — единственная акцентная; модалку создания ведёт leads-ui (data-lead-action="create").
      '<button type="button" class="btn btn--accent btn--m" data-lead-action="create">' + icon('add') + '<span class="btn__label">Новый проект</span></button></div></section>';
    var img = profileRoot.querySelector('img');
    img.addEventListener('error', function () {
      img.parentElement.innerHTML = '<span class="av__text">' + esc(p.firstName[0] + p.lastName[0]) + '</span>';
    }, { once: true });
    profileRoot.querySelector('[data-hd-copy-phone]').addEventListener('click', function (event) {
      var button = event.currentTarget;
      if (!window.DSCopy) return;
      window.DSCopy.write(p.phone).then(function () {
        window.DSCopy.flash(button, 'Телефон ' + p.phone + ' скопирован');
        if (window.DSSnack) window.DSSnack.show({ tone: 'success', title: 'Телефон скопирован', text: p.phone });
      }).catch(function () {
        if (window.DSSnack) window.DSSnack.show({ tone: 'info', title: 'Телефон для копирования', text: p.phone });
      });
    });
    applyIcons(profileRoot);
  }

  function weekChart(meetings) {
    var counts = [];
    for (var i = 0; i < 7; i++) {
      var date = addDays(TODAY, i);
      counts.push({ date: date, count: meetings.filter(function (m) { return m.startDateTime.slice(0, 10) === date; }).length });
    }
    var max = Math.max.apply(null, counts.map(function (d) { return d.count; }).concat([1]));
    return '<div class="hd-week-chart" role="img" aria-label="Встречи на 7 дней: ' + esc(counts.map(function (d) { return dateLabel(d.date) + ': ' + d.count; }).join('; ')) + '">' + counts.map(function (d, index) {
      return '<span class="hd-week-chart__day' + (index === 0 ? ' hd-week-chart__day--today' : '') + '" aria-hidden="true"><span class="hd-week-chart__track"><span class="hd-week-chart__bar" style="height:' + (d.count / max * 100) + '%"></span></span><span>' + DAY_LABELS[new Date(d.date + 'T12:00:00').getDay()] + '</span></span>';
    }).join('') + '</div>';
  }
  function taskBar(tasks) {
    var done = tasks.filter(function (t) { return t.statusCode === 'DONE'; }).length;
    var progress = tasks.filter(function (t) { return t.statusCode === 'IN_PROGRESS'; }).length;
    var rest = tasks.length - done - progress;
    return '<div class="hd-task-bar" role="img" aria-label="В работе: ' + progress + ', выполнено: ' + done + ', остальные: ' + rest + '">' +
      '<span class="hd-task-bar__progress" style="flex:' + progress + '"></span><span class="hd-task-bar__done" style="flex:' + done + '"></span><span class="hd-task-bar__rest" style="flex:' + rest + '"></span></div>';
  }
  function kpis() {
    var meetings = scopedMeetings('MY');
    var tasks = scopedTasks('MY');
    var active = tasks.filter(function (t) { return t.statusCode !== 'DONE'; });
    var meetingsToday = meetings.filter(function (m) { return m.startDateTime.slice(0, 10) === TODAY; }).length;
    var meetingsWeek = meetings.filter(function (m) { return m.startDateTime.slice(0, 10) <= addDays(TODAY, 6); }).length;
    var overdueTasks = tasks.filter(overdue);
    var correction = tasks.filter(function (t) { return t.statusCode === 'NEEDS_CORRECTION'; }).length;
    var news = data.news.filter(function (n) { return n.isMyClient; });
    return '<div class="hd-kpis" aria-label="Моя работа в цифрах">' +
      '<a class="hd-kpi hd-kpi--lavender" href="' + MEETINGS_URL + '"><span class="hd-kpi__top"><span>Встречи сегодня</span><span class="hd-kpi__icon">' + icon('calendar') + '</span></span>' +
      '<div class="hd-kpi__middle"><strong class="hd-kpi__value">' + meetingsToday + '</strong>' + weekChart(meetings) + '</div><span class="hd-kpi__caption">' + meetingsWeek + ' встреч в ближайшие 7 дней</span></a>' +
      '<a class="hd-kpi hd-kpi--mint" href="' + TASKS_URL + '"><span class="hd-kpi__top"><span>Активные задачи</span><span class="hd-kpi__icon">' + icon('tasks') + '</span></span><div class="hd-kpi__middle"><strong class="hd-kpi__value">' + active.length + '</strong><span class="hd-kpi__context">из ' + tasks.length + '<br>моих задач</span></div>' + taskBar(tasks) + '<span class="hd-kpi__caption">' + tasks.filter(function (t) { return t.statusCode === 'IN_PROGRESS'; }).length + ' в работе · ' + tasks.filter(function (t) { return t.statusCode === 'DONE'; }).length + ' выполнена</span></a>' +
      '<a class="hd-kpi" href="' + TASKS_URL + '"><span class="hd-kpi__top"><span>Требуют внимания</span><span class="hd-kpi__icon hd-kpi__icon--warning">' + icon('clock-timer') + '</span></span><div class="hd-kpi__middle"><strong class="hd-kpi__value">' + overdueTasks.length + '</strong>' + chip('Срок истёк', 'orange') + '</div><span class="hd-kpi__caption">' + correction + ' задача требует корректировки</span></a>' +
      '<a class="hd-kpi" href="#hd-news"><span class="hd-kpi__top"><span>Новости моих клиентов</span><span class="hd-kpi__icon">' + icon('file-basic') + '</span></span><div class="hd-kpi__middle"><strong class="hd-kpi__value">' + news.length + '</strong><span class="hd-kpi__newsmark" aria-hidden="true">' + icon('building-02') + icon('bar-chart') + icon('factory-01') + '</span></div><span class="hd-kpi__caption">Последняя публикация — ' + dateLabel(news[0].publishedAt) + '</span></a></div>';
  }

  function cardHeader(title, subtitle, href, label) {
    return '<header class="hd-card__header"><div><h2 class="hd-card__title">' + title + '</h2><p class="hd-card__subtitle">' + subtitle + '</p></div><a class="ibtn ibtn--neutral ibtn--m" href="' + href + '" aria-label="' + label + '">' + icon('arrow-up-right') + '</a></header>';
  }
  function meetingsContent() {
    var meetings = scopedMeetings(meetingScope);
    var today = meetings.filter(function (m) { return m.startDateTime.slice(0, 10) === TODAY; });
    var attention = meetings.filter(function (m) { return m.statusCode === 'NEEDS_ATTENTION'; }).length;
    return '<div class="hd-meetings__summary"><span><strong>' + today.length + '</strong> сегодня</span><span><i class="hd-status-dot hd-status-dot--warning" aria-hidden="true"></i>' + attention + ' требует внимания</span></div>' +
      '<ol class="hd-meeting-list">' + meetings.slice(0, 6).map(function (m) {
        var date = m.startDateTime.slice(0, 10);
        var tone = m.statusCode === 'PROTOCOL_DONE' ? 'green' : m.statusCode === 'NEEDS_ATTENTION' ? 'orange' : 'lblue';
        return '<li><a class="hd-meeting" href="' + MEETINGS_URL + '" aria-label="Открыть реестр встреч: ' + esc(m.clientName) + '"><time class="hd-date' + (date === TODAY ? ' hd-date--today' : '') + '" datetime="' + esc(date) + '"><span>' + DAY_LABELS[new Date(date + 'T12:00:00').getDay()] + '</span><strong>' + date.slice(8) + '</strong><span>окт</span></time><div class="hd-meeting__body"><div class="hd-meeting__title">' + esc(m.clientName) + '</div><div class="hd-meeting__topic">' + esc(m.topic) + '</div><div class="hd-meeting__contact">' + esc(m.contactName + ' · ' + m.contactPosition) + (m.participants && m.participants.length ? ' +' + m.participants.length : '') + '</div>' + (meetingScope === 'DESK' ? '<div class="hd-meeting__organizer">Организатор: ' + esc(m.organizerName) + '</div>' : '') + '<div class="hd-meeting__bottom">' + smallMeta('clock-timer', m.startDateTime.slice(11) + '–' + m.endDateTime.slice(11)) + chip(data.meetingStatusLabels[m.statusCode], tone) + '</div></div></a></li>';
      }).join('') + '</ol>';
  }
  function tasksContent() {
    var tasks = scopedTasks(taskScope);
    var priorityRank = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    tasks.sort(function (a, b) {
      var ad = a.statusCode === 'DONE', bd = b.statusCode === 'DONE';
      if (ad !== bd) return ad ? 1 : -1;
      if (a.dueDate !== b.dueDate) return a.dueDate.localeCompare(b.dueDate);
      return priorityRank[a.priorityCode] - priorityRank[b.priorityCode];
    });
    var count = tasks.filter(overdue).length;
    return '<div class="hd-task-summary"><span><strong>' + tasks.filter(function (t) { return t.statusCode !== 'DONE'; }).length + '</strong> активных</span><span class="hd-task-summary__attention">' + count + ' с истёкшим сроком</span></div>' +
      '<ol class="hd-task-list">' + tasks.slice(0, 5).map(function (t) {
        var tone = { NEW: 'lblue', IN_PROGRESS: 'dpurple', DONE: 'green', NEEDS_CORRECTION: 'orange' }[t.statusCode];
        return '<li><a class="hd-task" href="' + TASKS_URL + '" aria-label="Открыть реестр задач: ' + esc(t.title) + '"><div class="hd-task__meta"><span><i class="hd-status-dot hd-status-dot--' + t.priorityCode.toLowerCase() + '" aria-hidden="true"></i>' + esc(data.taskPriorityLabels[t.priorityCode]) + '</span><time class="' + (overdue(t) ? 'hd-task__overdue' : '') + '" datetime="' + t.dueDate + '">' + (t.dueDate === TODAY ? 'Сегодня' : dateLabel(t.dueDate)) + '</time></div><div class="hd-task__title">' + esc(t.title) + '</div><div class="hd-task__context">' + esc(t.clientName || 'Без клиента') + (t.dealNumber ? '<span> · ' + esc(t.dealNumber) + '</span>' : '') + '</div><div class="hd-task__bottom">' + chip(data.taskStatusLabels[t.statusCode], tone) + (taskScope === 'DESK' ? '<span class="hd-task__assignee">' + esc(t.assigneeName) + '</span>' : '') + '</div></a></li>';
      }).join('') + '</ol>';
  }
  function newsContent() {
    var news = scopedNews();
    return '<div class="hd-news-list">' + news.slice(0, allNews ? news.length : 3).map(function (n, index) {
      return '<article class="hd-news-item' + (index === 0 ? ' hd-news-item--featured' : '') + '"><div class="hd-news-item__meta"><span>' + esc(n.sourceName) + '</span><time datetime="' + n.publishedAt + '">' + dateLabel(n.publishedAt) + '</time></div><h3>' + esc(n.title) + '</h3><p>' + esc(n.summary) + '</p><div class="hd-news-item__client">' + icon('building-02') + '<span>' + esc(n.clientName) + '</span>' + (n.isFavorite ? '<span class="hd-news-item__favorite" aria-label="Избранный клиент">' + icon('star-filled') + '</span>' : '') + '</div></article>';
    }).join('') + '</div>' + (news.length > 3 ? '<footer class="hd-card__footer"><button type="button" class="hd-text-link" data-hd-news-more aria-expanded="' + allNews + '">' + (allNews ? 'Свернуть новости...' : 'Все новости...') + '</button></footer>' : '');
  }

  function syncNewsHeader() {
    var button = root.querySelector('[data-hd-news-header]');
    if (!button) return;
    button.setAttribute('aria-expanded', String(allNews));
    button.setAttribute('aria-label', allNews ? 'Свернуть новости' : 'Показать все новости');
  }

  function bindSegments() {
    if (!window.DSTabs) return;
    root.querySelectorAll('[data-hd-segment]').forEach(function (host) {
      window.DSTabs.segment(host, { onChange: function (_, button) {
        var value = button.getAttribute('data-hd-value');
        if (host.getAttribute('data-hd-segment') === 'meetings') {
          meetingScope = value;
          root.querySelector('[data-hd-meeting-list]').innerHTML = meetingsContent();
          applyIcons(root.querySelector('[data-hd-meeting-list]'));
        } else if (host.getAttribute('data-hd-segment') === 'tasks') {
          taskScope = value;
          root.querySelector('[data-hd-task-list]').innerHTML = tasksContent();
          applyIcons(root.querySelector('[data-hd-task-list]'));
        } else {
          newsScope = value;
          allNews = false;
          root.querySelector('[data-hd-news-list]').innerHTML = newsContent();
          applyIcons(root.querySelector('[data-hd-news-list]'));
          syncNewsHeader();
        }
      } });
    });
  }
  function renderDashboard() {
    root.innerHTML = '<div class="hd-dashboard">' +
      '<div class="hd-announcement" role="status" data-hd-announcement hidden></div>' + kpis() +
      '<div class="hd-workspace"><section class="hd-card hd-meetings" aria-labelledby="hd-meetings-title">' + cardHeader('<span id="hd-meetings-title">Встречи</span>', 'Клиентские диалоги и ближайшие планы', MEETINGS_URL, 'Открыть все встречи') + segment('Область встреч', 'meetings', [['MY', 'Мои встречи'], ['DESK', 'Встречи моего деска']], meetingScope) + '<div data-hd-meeting-list aria-live="polite">' + meetingsContent() + '</div><footer class="hd-card__footer"><a class="hd-text-link" href="' + MEETINGS_URL + '">Все встречи...</a></footer></section>' +
      '<section class="hd-card hd-tasks" aria-labelledby="hd-tasks-title">' + cardHeader('<span id="hd-tasks-title">Задачи</span>', 'Сначала то, что требует внимания', TASKS_URL, 'Открыть все задачи') + segment('Область задач', 'tasks', [['MY', 'Мои задачи'], ['DESK', 'Моего деска']], taskScope) + '<div data-hd-task-list aria-live="polite">' + tasksContent() + '</div><footer class="hd-card__footer"><a class="hd-text-link" href="' + TASKS_URL + '">Все задачи...</a></footer></section>' +
      '<section class="hd-card hd-news" id="hd-news" aria-labelledby="hd-news-title"><header class="hd-card__header"><div><h2 class="hd-card__title" id="hd-news-title">Новости клиентов</h2><p class="hd-card__subtitle">Контекст для следующего разговора</p></div><button type="button" class="ibtn ibtn--neutral ibtn--m" data-hd-news-more data-hd-news-header aria-expanded="false" aria-label="Показать все новости">' + icon('arrow-up-right') + '</button></header>' + segment('Клиенты в новостях', 'news', [['MY', 'Мои'], ['DESK', 'Деск'], ['FAV', 'Избранные']], newsScope) + '<div data-hd-news-list aria-live="polite">' + newsContent() + '</div></section></div></div>';
    bindSegments();
    applyIcons(root);
    syncNewsHeader();
  }

  function input(id, label, type, options) {
    options = options || {};
    return '<div class="inp inp--m inp--fullwidth"><label class="ds-label" for="' + id + '"><span class="ds-label__text">' + label + '</span>' + (options.required ? '<span class="ds-label__req">*</span>' : '') + '</label><div class="inp__box"><div class="inp__field"><input class="inp__control" id="' + id + '" name="' + id + '" type="' + type + '"' + (options.required ? ' required' : '') + (options.value ? ' value="' + esc(options.value) + '"' : '') + (options.placeholder ? ' placeholder="' + esc(options.placeholder) + '"' : '') + (options.list ? ' list="hd-client-list"' : '') + ' maxlength="160" autocomplete="off"></div></div></div>';
  }
  function createModal(id, title, form, fields, saveLabel) {
    return '<div class="modal-scrim" id="' + id + '" hidden><div class="modal modal--w4" role="dialog" aria-modal="true" aria-labelledby="' + id + '-title"><header class="modal__head"><h2 class="modal__title" id="' + id + '-title">' + title + '</h2><button type="button" class="ibtn ibtn--neutral ibtn--l" data-modal-close aria-label="Закрыть">' + icon('close') + '</button></header><div class="modal__body"><form class="hd-form" id="' + form + '">' + fields + '<p class="hd-form__notice">Запись появится на этом дашборде. Данные прототипа хранятся до перезагрузки страницы.</p></form></div><footer class="modal__foot"><div class="modal__foot-right"><button type="button" class="btn btn--transparent btn--m" data-modal-close><span class="btn__label">Отменить</span></button><button type="submit" form="' + form + '" class="btn btn--accent btn--m"><span class="btn__label">' + saveLabel + '</span></button></div></footer></div></div>';
  }
  function mountModals() {
    if (document.getElementById('hd-dashboard-modals')) return;
    var container = document.createElement('div');
    container.id = 'hd-dashboard-modals';
    var clients = Array.from(new Set(data.meetings.concat(data.tasks).map(function (item) { return item.clientName; }).filter(Boolean))).sort();
    var p = data.profile;
    var profileFields = [['ФИО', p.firstName + ' ' + p.middleName + ' ' + p.lastName], ['Табельный номер', p.employeeNumber], ['Должность', p.positionName], [p.deskNames.length > 1 ? 'Дески' : 'Деск', p.deskNames.join(', ')], ['Телефон', p.phone], ['Электронная почта', p.email]];
    var profileModal = '<div class="modal-scrim" id="hd-profile-details" hidden><div class="modal modal--w4" role="dialog" aria-modal="true" aria-labelledby="hd-profile-details-title"><header class="modal__head"><h2 class="modal__title" id="hd-profile-details-title">Личный кабинет</h2><button type="button" class="ibtn ibtn--neutral ibtn--l" data-modal-close aria-label="Закрыть">' + icon('close') + '</button></header><div class="modal__body"><div class="hd-profile-details">' + profileFields.map(function (field) {
      return '<div class="rof"><span class="ds-label"><span class="ds-label__text">' + field[0] + '</span></span><div class="rof__row"><span class="rof__value">' + esc(field[1]) + '</span></div></div>';
    }).join('') + '</div></div><footer class="modal__foot"><div class="modal__foot-right"><button type="button" class="btn btn--accent btn--m" data-modal-close><span class="btn__label">Закрыть</span></button></div></footer></div></div>';
    container.innerHTML = profileModal + '<datalist id="hd-client-list">' + clients.map(function (c) { return '<option value="' + esc(c) + '"></option>'; }).join('') + '</datalist>' +
      createModal('hd-meeting-create', 'Новая встреча', 'hd-meeting-form',
        input('hd-meeting-client', 'Клиент', 'text', { required: true, list: true, placeholder: 'Выберите или укажите клиента' }) +
        input('hd-meeting-topic', 'Тема встречи', 'text', { required: true, placeholder: 'Например, условия рефинансирования' }) +
        '<div class="hd-form__when">' + input('hd-meeting-date', 'Дата', 'date', { required: true, value: TODAY }) + input('hd-meeting-start', 'Начало', 'time', { required: true, value: '14:00' }) + input('hd-meeting-end', 'Окончание', 'time', { required: true, value: '15:00' }) + '</div>', 'Создать встречу') +
      createModal('hd-task-create', 'Новая задача', 'hd-task-form',
        input('hd-task-title', 'Задача', 'text', { required: true, placeholder: 'Что нужно сделать' }) +
        input('hd-task-due', 'Срок', 'date', { required: true, value: TODAY }) +
        '<fieldset class="hd-form__priority"><legend>Приоритет</legend><div class="hd-form__radios">' + [['HIGH', 'Высокий'], ['MEDIUM', 'Средний'], ['LOW', 'Низкий']].map(function (p) {
          return '<label class="rb"><input class="rb__input" type="radio" name="hd-task-priority" value="' + p[0] + '"' + (p[0] === 'MEDIUM' ? ' checked' : '') + '><span class="rb__box"><i class="rb__mark" data-icon="' + (p[0] === 'MEDIUM' ? 'radio-button-checked' : 'radio-button-unchecked') + '"></i></span><span class="rb__content"><span class="rb__label">' + p[1] + '</span></span></label>';
        }).join('') + '</div></fieldset>' + input('hd-task-client', 'Клиент', 'text', { list: true, placeholder: 'Без клиента' }) + input('hd-task-deal', 'Номер сделки', 'text', { placeholder: 'Например, D-126618' }), 'Создать задачу');
    document.body.appendChild(container);
    var taskForm = document.getElementById('hd-task-form');
    function syncPriorityMarks() {
      // Modal переносит скрим в body: искать поля в самой форме, а не в месте вставки.
      taskForm.querySelectorAll('[name="hd-task-priority"]').forEach(function (radio) {
        var mark = radio.parentElement.querySelector('.rb__mark');
        mark.setAttribute('data-icon', radio.checked ? 'radio-button-checked' : 'radio-button-unchecked');
        mark.removeAttribute('data-icon-done');
      });
      applyIcons(taskForm);
    }
    taskForm.addEventListener('change', function (event) {
      if (event.target.getAttribute('name') === 'hd-task-priority') syncPriorityMarks();
    });
    function value(id) { return document.getElementById(id).value.trim(); }
    var endInput = document.getElementById('hd-meeting-end');
    ['hd-meeting-start', 'hd-meeting-end'].forEach(function (id) {
      document.getElementById(id).addEventListener('input', function () { endInput.setCustomValidity(''); });
    });
    document.getElementById('hd-meeting-form').addEventListener('submit', function (event) {
      event.preventDefault();
      if (value('hd-meeting-end') <= value('hd-meeting-start')) {
        endInput.setCustomValidity('Окончание встречи должно быть позже начала.');
        endInput.reportValidity();
        return;
      }
      if (!value('hd-meeting-client') || !value('hd-meeting-topic')) return;
      data.meetings.push({ meetingId: 'M-HOME-' + (++sequence), clientName: value('hd-meeting-client'), topic: value('hd-meeting-topic'), startDateTime: value('hd-meeting-date') + 'T' + value('hd-meeting-start'), endDateTime: value('hd-meeting-date') + 'T' + value('hd-meeting-end'), contactName: 'Контакт не указан', contactPosition: '', organizerName: 'Ким А. С.', statusCode: 'SCHEDULED', isMine: true });
      finishCreate('Встреча создана и добавлена на дашборд.');
      event.target.reset();
    });
    document.getElementById('hd-task-form').addEventListener('submit', function (event) {
      event.preventDefault();
      if (!value('hd-task-title')) return;
      var priority = Array.prototype.find.call(document.querySelectorAll('[name="hd-task-priority"]'), function (radio) { return radio.checked; });
      data.tasks.push({ taskId: 'T-HOME-' + (++sequence), title: value('hd-task-title'), priorityCode: priority ? priority.value : 'MEDIUM', statusCode: 'NEW', dueDate: value('hd-task-due'), createdDate: TODAY, dealNumber: value('hd-task-deal') || null, clientName: value('hd-task-client') || null, assigneeName: 'Ким А. С.', assigneeGroups: data.profile.groups.slice(), isMine: true });
      taskScope = 'MY';
      finishCreate('Задача создана и добавлена на дашборд.');
      event.target.reset();
      syncPriorityMarks();
    });
    applyIcons(container);
  }
  function finishCreate(message) {
    window.DSModal.closeTop();
    renderDashboard();
    var status = root.querySelector('[data-hd-announcement]');
    status.textContent = message;
    status.hidden = false;
    if (window.DSSnack) window.DSSnack.show({ tone: 'success', title: message });
  }

  function mount(options) {
    if (!options || !options.profileHost || !options.dashboardHost) return;
    profileRoot = options.profileHost;
    root = options.dashboardHost;
    mountModals();
    renderProfile();
    renderDashboard();
    if (!root.__hdBound) {
      root.__hdBound = true;
      root.addEventListener('click', function (event) {
        if (event.target.closest('[data-hd-news-more]')) {
          var fromHeader = !!event.target.closest('[data-hd-news-header]');
          allNews = !allNews;
          var target = root.querySelector('[data-hd-news-list]');
          target.innerHTML = newsContent();
          applyIcons(target);
          syncNewsHeader();
          var focusTarget = fromHeader ? root.querySelector('[data-hd-news-header]') : target.querySelector('[data-hd-news-more]');
          if (focusTarget) focusTarget.focus();
        }
      });
    }
    if (window.DSModal) window.DSModal.bindAll(profileRoot);
  }

  window.IBPHomeDashboard = { mount: mount };
})();
