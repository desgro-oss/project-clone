/* =========================================================================
   events.js — лента событий системы концепта ibp-redesign-v2.

   События по моим проектам в работе и моим клиентам (решение пользователя
   27.10.2026): смена статуса проекта, сделки или клиента; изменение данных
   (продукт, сумма, срок, параметр клиента); документы; задачи; встречи;
   клиент попал в «Мои клиенты» (при создании проекта клиент проекта
   добавляется в список автоматически). Один набор на карточку «События»
   главной (data/home-dashboard.js) и страницу «События» (EventsPage).

   У события: дата и время, тип, с чем связано (проект — лид в работе,
   сделка Pipeline, клиент — одно или несколько сразу) и что случилось.
   «Мои» — события моих проектов и клиентов (isMine), «Деск» — все события
   деска. Срез демо — 9 октября 2026, как у дашборда.

   Source: invented (27.10.2026). Проекты, сделки и клиенты — настоящие
   записи концепта (leads-store, opportunities, clients): ссылки ведут на
   их страницы. Сами события и значения «было → стало» вымышлены.

   API: window.IBPR_EVENTS
     all()                 → EventRsDto[] от новых к старым
     types                 → [{ code, label, icon, tone }] в порядке чипов
     type(code)            → тип
     entityHref(entity)    → адрес страницы связанного объекта
     entityLabel(entity)   → «Проект L-O166100» / «Сделка 130101» / клиент
     dateLabel(iso)        → «Сегодня, 10:20» / «Вчера, 16:05» / «2 октября, 09:15»
   ========================================================================= */

/**
 * Событие системы.
 * @typedef {Object} EventRsDto
 * @property {string} eventId     идентификатор
 * @property {string} occurredAt  дата и время (ISO, без пояса)
 * @property {'STATUS'|'DATA'|'DOCUMENT'|'TASK'|'MEETING'|'CLIENT'} typeCode тип события
 * @property {{kind:'project'|'deal'|'client', id:string, label:string}[]} entities с чем связано
 * @property {string} title       что случилось — одной строкой
 * @property {string} [from]      было (для смены статуса и данных)
 * @property {string} [to]        стало
 * @property {string} [field]     какое поле изменилось
 * @property {string} authorId    кто сделал (employeeId; 'SYSTEM' — система)
 * @property {boolean} isMine     событие моих проектов и клиентов
 */
(function () {
  'use strict';

  var TYPES = [
    { code: 'STATUS', label: 'Смена статуса', icon: 'refresh', tone: 'info' },
    { code: 'DATA', label: 'Изменение данных', icon: 'edit', tone: 'grey' },
    { code: 'DOCUMENT', label: 'Документы', icon: 'document-check', tone: 'lblue' },
    { code: 'TASK', label: 'Задачи', icon: 'tasks', tone: 'orange' },
    { code: 'MEETING', label: 'Встречи', icon: 'calendar-check-01', tone: 'dpurple' },
    { code: 'CLIENT', label: 'Мои клиенты', icon: 'user-circle', tone: 'green' }
  ];

  /* связанные объекты */
  function project(id, client) { return { kind: 'project', id: id, label: client }; }
  function deal(id, client) { return { kind: 'deal', id: id, label: client }; }
  function client(id, name) { return { kind: 'client', id: id, label: name }; }
  var C = {
    romashka: ['3000012345', 'ООО «Ромашка»'], landysh: ['3000012346', 'ООО «Ландыш»'], siren: ['3000012347', 'ООО «Сирень»'],
    zarya: ['3000020011', 'ООО «Заря Агро»'], niva: ['3000020012', 'ООО «Нива-Центр»'], kolos: ['3000020013', 'ООО «Колос»'],
    promteh: ['3000031004', 'ООО «ПромТехСервис»'], tehmash: ['3000031005', 'АО «ТехноМаш»'], mikro: ['3000031006', 'ООО «МикроПрибор»'],
    severles: ['3000042007', 'ООО «СеверЛес»'], betonmix: ['3000055009', 'ООО «БетонМикс»']
  };
  function cl(k) { return client(C[k][0], C[k][1]); }
  function pr(id, k) { return project(id, C[k][1]); }
  function dl(id, k) { return deal(id, C[k][1]); }

  var n = 0;
  function ev(at, typeCode, entities, title, o) {
    o = o || {};
    return { eventId: 'E-' + (1000 + (++n)), occurredAt: at, typeCode: typeCode, entities: entities, title: title,
      from: o.from, to: o.to, field: o.field, authorId: o.author || '04127', isMine: o.mine !== false };
  }

  var EVENTS = [
    ev('2026-10-09T11:40', 'STATUS', [pr('L-O166100', 'landysh'), cl('landysh')], 'Проект перешёл на стадию «Встреча проведена»', { field: 'Стадия', from: 'Встреча назначена', to: 'Встреча проведена' }),
    ev('2026-10-09T10:55', 'TASK', [pr('L-O165108', 'romashka')], 'Задача «Подготовить Term Sheet» выполнена', { field: 'Статус задачи', from: 'В работе', to: 'Выполнена' }),
    ev('2026-10-09T10:20', 'DATA', [dl('130101', 'siren'), cl('siren')], 'В сделке изменён продукт', { field: 'Продукт', from: 'Возобновляемая кредитная линия', to: 'Оборотная кредитная линия' }),
    ev('2026-10-09T09:30', 'MEETING', [pr('L-2214', 'zarya'), cl('zarya')], 'Назначена встреча с клиентом на 15 октября', { field: 'Встреча', to: '15.10.2026, 11:00' }),
    ev('2026-10-09T09:05', 'DATA', [cl('romashka')], 'У клиента обновился рейтинг ЕПК', { field: 'Рейтинг', from: 'B+', to: 'BB-', author: 'SYSTEM' }),
    ev('2026-10-09T08:45', 'STATUS', [pr('L-O165101', 'kolos'), cl('kolos')], 'Проект коллеги перешёл на стадию «Встреча назначена»', { field: 'Стадия', from: 'Исследование', to: 'Встреча назначена', author: '03882', mine: false }),
    ev('2026-10-08T17:10', 'DOCUMENT', [pr('L-O155102', 'severles'), cl('severles')], 'Загружен документ «Бухгалтерская отчётность за 9 месяцев 2026.pdf»', { field: 'Документы', to: 'Бухгалтерская отчётность за 9 месяцев 2026.pdf' }),
    ev('2026-10-08T16:05', 'CLIENT', [cl('tehmash'), pr('L-2242', 'tehmash')], 'Клиент добавлен в «Мои клиенты» при создании проекта', { field: 'Мои клиенты', to: 'Добавлен', author: 'SYSTEM' }),
    ev('2026-10-08T15:20', 'DATA', [dl('130102', 'niva')], 'В сделке изменена сумма', { field: 'Сумма, млн RUB', from: '1 100', to: '1 300' }),
    ev('2026-10-08T14:00', 'TASK', [pr('L-O140105', 'tehmash'), cl('tehmash')], 'Поставлена задача «Запросить управленческую отчётность»', { field: 'Срок', to: '14.10.2026', author: '04630' }),
    ev('2026-10-08T12:35', 'DATA', [pr('L-O165102', 'promteh')], 'В проекте коллеги изменён срок следующего шага', { field: 'Срок следующего шага', from: '10.10.2026', to: '17.10.2026', author: '05204', mine: false }),
    ev('2026-10-08T11:15', 'STATUS', [dl('130103', 'niva'), cl('niva')], 'Сделка перешла на этап «Кредитный комитет»', { field: 'Этап сделки', from: 'Структурирование', to: 'Кредитный комитет' }),
    ev('2026-10-08T09:50', 'MEETING', [pr('L-O166100', 'landysh')], 'Зафиксированы итоги встречи', { field: 'Итоги встречи', to: 'Клиент готов обсуждать лимит до 900 млн RUB' }),
    ev('2026-10-07T18:00', 'TASK', [pr('L-118846', 'zarya')], 'Срок задачи «Проверить залоговое обеспечение» истёк', { field: 'Статус задачи', from: 'В работе', to: 'Просрочена', author: 'SYSTEM' }),
    ev('2026-10-07T16:40', 'DOCUMENT', [dl('130101', 'siren')], 'Направлен Term Sheet клиенту', { field: 'Документы', to: 'Term Sheet (ред. 2).docx' }),
    ev('2026-10-07T15:25', 'DATA', [cl('tehmash')], 'У клиента изменился сегмент', { field: 'Сегмент', from: 'Средний бизнес', to: 'Крупный бизнес', author: 'SYSTEM' }),
    ev('2026-10-07T14:10', 'STATUS', [pr('L-O166105', 'kolos')], 'Проект коллеги создан из рекомендации AI', { field: 'Стадия', from: 'Рассмотрение', to: 'Идея', author: '03882', mine: false }),
    ev('2026-10-07T12:00', 'STATUS', [pr('L-O165105', 'severles'), cl('severles')], 'Проект взят в работу из рекомендации AI', { field: 'Стадия', from: 'Рассмотрение', to: 'Идея' }),
    ev('2026-10-07T10:30', 'MEETING', [pr('L-O166108', 'mikro'), cl('mikro')], 'Коллега назначил встречу с клиентом', { field: 'Встреча', to: '13.10.2026, 15:00', author: '03882', mine: false }),
    ev('2026-10-06T17:45', 'DATA', [pr('L-O155100', 'tehmash')], 'В проекте изменена идея сделки', { field: 'Идея', from: 'Покупка оборудования', to: 'Приобретение производственного комплекса' }),
    ev('2026-10-06T16:20', 'TASK', [dl('130102', 'niva'), cl('niva')], 'Поставлена задача «Подготовить заключение для кредитного комитета»', { field: 'Срок', to: '12.10.2026', author: '04711' }),
    ev('2026-10-06T14:05', 'CLIENT', [cl('severles'), pr('L-O155102', 'severles')], 'Клиент добавлен в «Мои клиенты» при создании проекта', { field: 'Мои клиенты', to: 'Добавлен', author: 'SYSTEM' }),
    ev('2026-10-06T11:30', 'DOCUMENT', [pr('L-O165104', 'mikro')], 'Коллега загрузил презентацию компании', { field: 'Документы', to: 'Презентация компании 2026.pdf', author: '03882', mine: false }),
    ev('2026-10-06T10:00', 'STATUS', [cl('zarya')], 'Статус клиента изменён', { field: 'Статус клиента', from: 'Потенциальный', to: 'Активен', author: 'SYSTEM' }),
    ev('2026-10-05T18:20', 'STATUS', [pr('L-O166101', 'siren'), dl('130101', 'siren'), cl('siren')], 'Проект передан в Pipeline — создана сделка 130101', { field: 'Стадия', from: 'Подготовка документов', to: 'Передано в Pipeline' }),
    ev('2026-10-05T15:40', 'TASK', [pr('L-O165102', 'promteh'), cl('promteh')], 'Коллега выполнил задачу «Согласовать One Pager»', { field: 'Статус задачи', from: 'В работе', to: 'Выполнена', author: '05204', mine: false }),
    ev('2026-10-05T12:15', 'DATA', [pr('L-12345', 'landysh')], 'В проекте указана сумма', { field: 'Объём, млн RUB', from: '—', to: '450' }),
    ev('2026-10-04T17:00', 'MEETING', [pr('L-O140105', 'tehmash'), cl('tehmash')], 'Встреча с клиентом перенесена', { field: 'Встреча', from: '06.10.2026, 10:00', to: '09.10.2026, 14:00', author: '04630' }),
    ev('2026-10-04T13:25', 'DOCUMENT', [pr('L-O165108', 'romashka'), cl('romashka')], 'One Pager согласован', { field: 'Документы', to: 'One Pager — согласован' }),
    ev('2026-10-04T10:40', 'DATA', [cl('niva')], 'У клиента обновлена выручка по данным ФНС', { field: 'Выручка (ФНС), млн RUB', from: '2 840', to: '3 120', author: 'SYSTEM' }),
    ev('2026-10-03T16:10', 'STATUS', [pr('L-O166111', 'betonmix')], 'Коллега отказался от рекомендации AI', { field: 'Стадия', from: 'Рассмотрение', to: 'Не беру', author: '03882', mine: false }),
    ev('2026-10-03T11:50', 'TASK', [pr('L-2214', 'zarya')], 'Поставлена задача «Подготовить повестку встречи»', { field: 'Срок', to: '14.10.2026' }),
    ev('2026-10-02T15:30', 'STATUS', [pr('L-O140105', 'tehmash'), cl('tehmash')], 'Проект перешёл на стадию «Исследование»', { field: 'Стадия', from: 'Идея', to: 'Исследование' }),
    ev('2026-10-02T09:15', 'DATA', [dl('130103', 'niva')], 'В сделке изменена дата закрытия', { field: 'Дата закрытия', from: '30.11.2026', to: '15.12.2026', author: '04711' }),
    ev('2026-10-01T14:45', 'CLIENT', [cl('kolos'), pr('L-O166105', 'kolos')], 'Клиент добавлен в «Мои клиенты» коллеги при создании проекта', { field: 'Мои клиенты', to: 'Добавлен', author: 'SYSTEM', mine: false }),
    ev('2026-10-01T10:05', 'DOCUMENT', [cl('landysh')], 'Обновлён устав клиента', { field: 'Документы', to: 'Устав (ред. 2026).pdf', author: 'SYSTEM' })
  ];

  var MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  var TODAY = '2026-10-09', YESTERDAY = '2026-10-08';
  function dateLabel(iso) {
    var d = String(iso || '').slice(0, 10), t = String(iso || '').slice(11, 16);
    var day = d === TODAY ? 'Сегодня' : d === YESTERDAY ? 'Вчера' : Number(d.slice(8, 10)) + ' ' + MONTHS[Number(d.slice(5, 7)) - 1];
    return day + (t ? ', ' + t : '');
  }
  var KIND_LABEL = { project: 'Проект', deal: 'Сделка', client: 'Клиент' };
  function entityLabel(e) { return e.kind === 'client' ? e.label : KIND_LABEL[e.kind] + ' ' + e.id; }
  function entityHref(e) {
    var nav = window.IBPR_NAV;
    if (!nav) return '#';
    if (e.kind === 'project') return nav.href('lead', { id: e.id, mode: 'after' });
    if (e.kind === 'deal') return nav.href('opportunity', { id: e.id, source: 'pipeline', mode: 'after' });
    return nav.href('client', { id: e.id });
  }
  function type(code) { return TYPES.filter(function (t) { return t.code === code; })[0]; }

  window.IBPR_EVENTS = {
    all: function () { return EVENTS.slice(); },
    types: TYPES, type: type,
    entityHref: entityHref, entityLabel: entityLabel, kindLabel: function (k) { return KIND_LABEL[k]; },
    dateLabel: dateLabel
  };
})();
