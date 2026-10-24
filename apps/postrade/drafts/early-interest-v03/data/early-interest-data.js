/* =========================================================================
   Досрочное погашение процентов — демо-данные страницы досрочных платежей,
   окна платежа и тайла на странице транша (window.MOCK_EARLY_INTEREST_PAYMENTS
   и карты подписей).

   Обычный <script> (file://, без fetch). Подключается до экранного скрипта:
   <script src="../data/early-interest-data.js"></script>.
   Значения — рыба по макетам дизайнера (16.10.2026) и правкам v3 (20.10.2026), правятся по ходу дизайна;
   имена и типы — для разработки.
   ========================================================================= */

/**
 * Часть досрочного платежа, пришедшаяся на один вид задолженности одного процентного периода
 * (строка таблицы «Задолженность на дату» окна платежа после расчёта).
 * Source: invented (20.10.2026) — заменить на DTO, когда он появится.
 * @typedef {Object} EarlyInterestAllocationRsDto
 * @property {string} periodStartDate  дата начала процентного периода (ISO)
 * @property {string} periodEndDate    дата окончания процентного периода (ISO)
 * @property {string} debtTypeCode     вид задолженности, код INTEREST_DEBT_TYPE_LABELS
 * @property {number} accruedAmount    начисленная сумма задолженности на дату платежа
 * @property {number} earlyAmount      досрочная сумма — сколько платежа гасит эту задолженность; считается по приоритету, не больше accruedAmount, вручную не правится
 */

/**
 * Досрочный платёж процентов — строка таблицы страницы «Досрочное погашение процентов».
 * Source: invented (20.10.2026).
 * @typedef {Object} EarlyInterestPaymentRsDto
 * @property {string} id               идентификатор платежа
 * @property {string} statusCode       статус обработки, код EARLY_INTEREST_PAYMENT_STATUS_LABELS: PROCESSING | PROCESSED | FAILED
 * @property {string} paymentDate      дата платежа (ISO)
 * @property {number} paymentAmount    сумма платежа в валюте инструмента, больше нуля; равна сумме earlyAmount всех allocations
 * @property {string} paymentTypeCode  тип платежа, код EARLY_INTEREST_PAYMENT_TYPE_LABELS; всегда EARLY_INTEREST_REPAYMENT
 * @property {string} comment          комментарий, ручной ввод; может быть пустым
 * @property {string} [errorText]      причина для статуса FAILED — текст от сервиса обработки
 * @property {EarlyInterestAllocationRsDto[]} allocations  распределение суммы по задолженности на дату
 */

/**
 * Задолженность одного процентного периода по видам — начисленные суммы.
 * Source: invented (20.10.2026).
 * @typedef {Object} InterestPeriodDebtRsDto
 * @property {string} periodStartDate             дата начала процентного периода (ISO)
 * @property {string} periodEndDate               дата окончания процентного периода (ISO)
 * @property {Object<string, number>} accrued     начисленная сумма по коду вида задолженности
 */

/**
 * Приоритет погашения процентной задолженности — один на инструмент.
 * Source: invented (20.10.2026).
 * @typedef {Object} InterestRepaymentOrderRsDto
 * @property {string[]} debtTypeCodes  все виды задолженности, коды INTEREST_DEBT_TYPE_LABELS; первый — приоритет 1 (гасится первым)
 */

/**
 * Досрочное погашение процентов инструмента.
 * Source: invented (20.10.2026).
 * @typedef {Object} EarlyInterestPaymentsRsDto
 * @property {string} currencyCode                       валюта инструмента, ISO 4217
 * @property {InterestPeriodDebtRsDto[]} periodDebts     задолженность по процентным периодам — из неё окно платежа берёт «Задолженность на дату»
 * @property {EarlyInterestPaymentRsDto[]} payments      внесённые досрочные платежи (демо для состояния filled)
 * @property {InterestRepaymentOrderRsDto} repaymentOrder приоритет погашения
 */

/**
 * Виды задолженности — правка v3 (20.10.2026, 23.10.2026): три вида начисленных процентов.
 *   CURRENT_INTEREST      = процентная задолженность + капитализированная процентная задолженность
 *   CAPITALIZED_INTEREST  = капитализированная задолженность + капитализированная капитализированная задолженность
 *   DEFERRED_INTEREST     = отложенная процентная задолженность + отложенная капитализированная задолженность
 * @type {Object<string, string>}
 */
window.INTEREST_DEBT_TYPE_LABELS = {
  CURRENT_INTEREST: 'Текущие начисленные проценты',
  CAPITALIZED_INTEREST: 'Капитализированные начисленные проценты',
  DEFERRED_INTEREST: 'Отложенные начисленные проценты'
};

/** Подписи статусов обработки платежа. @type {Object<string, string>} */
window.EARLY_INTEREST_PAYMENT_STATUS_LABELS = {
  PROCESSING: 'В обработке',
  PROCESSED: 'Обработан',
  FAILED: 'Не обработан'
};

/** Подписи типов платежа. @type {Object<string, string>} */
window.EARLY_INTEREST_PAYMENT_TYPE_LABELS = {
  EARLY_INTEREST_REPAYMENT: 'Погашение процентов (досрочное)'
};

(function () {
  /* распределение по приоритету — как его считает окно платежа (демо-строки собраны тем же правилом) */
  var ORDER = ['CURRENT_INTEREST', 'CAPITALIZED_INTEREST', 'DEFERRED_INTEREST'];
  var PERIODS = [
    { periodStartDate: '2025-01-01', periodEndDate: '2025-03-31', accrued: { CURRENT_INTEREST: 100000, CAPITALIZED_INTEREST: 55000, DEFERRED_INTEREST: 35000 } },
    { periodStartDate: '2025-03-31', periodEndDate: '2025-06-30', accrued: { CURRENT_INTEREST: 103700, CAPITALIZED_INTEREST: 56100, DEFERRED_INTEREST: 36650 } },
    { periodStartDate: '2025-06-30', periodEndDate: '2025-09-30', accrued: { CURRENT_INTEREST: 108000, CAPITALIZED_INTEREST: 58500, DEFERRED_INTEREST: 38500 } },
    { periodStartDate: '2025-09-30', periodEndDate: '2025-12-31', accrued: { CURRENT_INTEREST: 111600, CAPITALIZED_INTEREST: 59900, DEFERRED_INTEREST: 39500 } }
  ];

  function allocate(date, amount) {
    var p = PERIODS.filter(function (x) { return date > x.periodStartDate && date <= x.periodEndDate; })[0];
    var rest = amount;
    return ORDER.map(function (code) {
      var acc = p.accrued[code], early = Math.min(acc, rest);
      rest = Math.round((rest - early) * 100) / 100;
      return { periodStartDate: p.periodStartDate, periodEndDate: p.periodEndDate, debtTypeCode: code, accruedAmount: acc, earlyAmount: early };
    });
  }
  function pay(id, status, date, amount, comment, errorText) {
    var r = { id: id, statusCode: status, paymentDate: date, paymentAmount: amount,
      paymentTypeCode: 'EARLY_INTEREST_REPAYMENT', comment: comment, allocations: allocate(date, amount) };
    if (errorText) r.errorText = errorText;
    return r;
  }

  /** @type {EarlyInterestPaymentsRsDto} */
  window.MOCK_EARLY_INTEREST_PAYMENTS = {
    currencyCode: 'RUB',
    periodDebts: PERIODS,
    payments: [
      pay('eip-1', 'PROCESSED', '2025-02-14', 100000.00, 'Досрочное погашение по письму контрагента от 10.02.2025'),
      pay('eip-2', 'PROCESSED', '2025-03-31', 150000.00, 'Погашение процентов перед пересмотром ставки'),
      pay('eip-3', 'FAILED', '2025-05-20', 120000.00, 'Частичное погашение капитализированных процентов', 'Сервис обработки платежей не ответил. Сохраните платёж повторно.'),
      pay('eip-4', 'PROCESSED', '2025-06-30', 180500.50, ''),
      pay('eip-5', 'PROCESSED', '2025-08-15', 75000.00, 'Погашение отложенных процентов по графику реструктуризации'),
      pay('eip-6', 'PROCESSING', '2025-09-30', 200000.00, 'Досрочное погашение по письму контрагента от 26.09.2025')
    ],
    repaymentOrder: { debtTypeCodes: ORDER.slice() }
  };
})();
