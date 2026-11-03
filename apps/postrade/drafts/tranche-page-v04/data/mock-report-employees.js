/* =========================================================================
   Сотрудники для выгрузки отчёта финансовых метрик — демо-данные
   (window.MOCK_REPORT_EMPLOYEES).

   Обычный <script> (file://). Подключается на странице «Финансовые метрики»:
   <script src="../data/mock-report-employees.js"></script>.
   Справочник для автокомплита «Сотрудник» в окне «Выгрузка отчета» (вариант с
   шифрованием). Значения — рыба, имена и типы держатся.
   ========================================================================= */

/**
 * Сотрудник, которому будет доступен зашифрованный файл отчёта.
 * Source: invented (21.10.2026).
 * @typedef {Object} ReportEmployeeRsDto
 * @property {string} employeeId      идентификатор сотрудника
 * @property {string} fullName        ФИО
 * @property {string} positionName    должность
 * @property {string} externalEmail   почта во внешнем домене (Сигма)
 * @property {string} internalEmail   почта во внутреннем домене (Альфа / Омега)
 */

/** @type {ReportEmployeeRsDto[]} */
window.MOCK_REPORT_EMPLOYEES = [
  { employeeId: 'E-201', fullName: 'Иванов Михаил Александрович', positionName: 'Аналитик', externalEmail: 'IvanovMA@sberbank.ru', internalEmail: 'IvanovMA@omega.sberbank.ru' },
  { employeeId: 'E-202', fullName: 'Петрова Анна Викторовна', positionName: 'Ведущий аналитик', externalEmail: 'PetrovaAV@sberbank.ru', internalEmail: 'PetrovaAV@omega.sberbank.ru' },
  { employeeId: 'E-203', fullName: 'Сидоров Дмитрий Олегович', positionName: 'Риск-менеджер', externalEmail: 'SidorovDO@sberbank.ru', internalEmail: 'SidorovDO@omega.sberbank.ru' },
  { employeeId: 'E-204', fullName: 'Кузнецова Елена Павловна', positionName: 'Финансист', externalEmail: 'KuznetsovaEP@sberbank.ru', internalEmail: 'KuznetsovaEP@omega.sberbank.ru' },
  { employeeId: 'E-205', fullName: 'Смирнов Алексей Игоревич', positionName: 'Руководитель направления', externalEmail: 'SmirnovAI@sberbank.ru', internalEmail: 'SmirnovAI@omega.sberbank.ru' },
  { employeeId: 'E-206', fullName: 'Орлова Татьяна Сергеевна', positionName: 'Аналитик', externalEmail: 'OrlovaTS@sberbank.ru', internalEmail: 'OrlovaTS@omega.sberbank.ru' }
];
