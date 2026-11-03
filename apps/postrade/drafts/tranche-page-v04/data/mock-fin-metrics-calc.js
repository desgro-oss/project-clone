/* =========================================================================
   Расчёт финансовых метрик сделок — демо-данные прототипа
   (window.MOCK_DEAL_METRICS_CALC · FIN_METRICS_LABELS · FIN_METRICS_CATALOG).

   Обычный <script> (file://, без fetch), подключается до стора метрик:
   <script src="../data/mock-fin-metrics-calc.js"></script>

   Читает FinMetricsStore (fin-metrics-store.js): тайл «Финансовые метрики»
   (DealMetricsCalculationTile) на странице сделки и страница «Финансовые
   метрики» (FinancialMetrics). Не путать с mock-financial-metrics.js — тот
   кормит другой тайл (DealFinancialMetricsTile: ВБС, ОСЗ, резерв).

   Что в файле:
   – записи расчёта по сделкам — когда считали, какие ФИ посчитались, были ли
     неудачные попытки, история фиксаций ЭПС/ВБС. Сделки без записи — «не
     рассчитано», фиксаций нет;
   – каталог метрик отчётов: у кого какой набор строк (макеты RE0033, лист
     «Пример индикаторов ФИ…» — РСБУ, лист «Отчеты KPI» — KPI; состав МСФО
     придуман по чипам фильтра, источник состава метрик не решён — вопрос 9
     задачи RE0033);
   – подписи кодов.

   Самих отчётных чисел здесь нет: значения и даты событий стор строит
   детерминированно по ФИ (без Math.random), чтобы экран был одинаков при
   каждом открытии. Значения — рыба.

   Демо-сделки под матрицу тайла (RE0033):
     1026, 1035, 1042 — ФИ нет: «Заблокировано»;
     1044            — ФИ есть, расчёта не было: «По умолчанию»; с ?fmMode=view —
                       «На просмотр × Не рассчитано» («Расчет не выполнен»);
     1036            — попытка расчёта не удалась: «Ошибка»;
     1024            — рассчитано по всем ФИ, сделка Активная (на просмотр),
                       есть история фиксаций;
     1027            — рассчитано частично, история фиксаций;
     1028            — расчёт был, пересчёт не удался: «Ошибка» над видом
                       «Рассчитано» с прежней датой (решение человека 21.10.2026).
   1037            — рассчитан один ФИ из четырёх, с отчётностью МСФО: на странице
                       «Финансовые метрики» МСФО и KPI с данными, РСБУ пустая
                       («Нет данных»).
   Остальные сделки — «не рассчитано»; расчёт в прототипе имитирует стор.
   ========================================================================= */

/**
 * Состояние расчёта метрик сделки.
 * Source: invented (21.10.2026) — заменить на DTO, когда он появится.
 * @typedef {Object} DealMetricsCalculationRsDto
 * @property {number} dealId                      сделка
 * @property {MetricsCalcStatusCode} calcStatusCode  был ли успешный расчёт
 * @property {string|null} calculatedAt           время последнего успешного расчёта (ISO)
 * @property {string[]} calculatedFiIds           ФИ, посчитанные в последнем успешном расчёте
 * @property {boolean} lastAttemptFailed          последняя попытка не посчитала ни одного ФИ
 */

/**
 * Был ли успешный расчёт метрик.
 * Source: invented (21.10.2026).
 * @typedef {'NOT_CALCULATED'|'CALCULATED'} MetricsCalcStatusCode
 */

/**
 * Фиксация ЭПС/ВБС финансового инструмента — строка истории фиксаций.
 * Source: invented (21.10.2026) — колонки листа «Фиксации ЭПС_ВБС» макетов.
 * @typedef {Object} EirIbsvFixationRsDto
 * @property {string} fixationId
 * @property {string} financialInstrumentId       ФИ (id карточки сделки)
 * @property {string} changeDate                  дата изменений (ISO-дата)
 * @property {FixationModificationCode} modificationTypeCode  вид модификации
 * @property {number|null} eirRate                значение ЭПС, %
 * @property {number|null} eirDelta               Δ ЭПС, % (знак — направление)
 * @property {number|null} etsRate                значение ЕТС, %
 * @property {number|null} etsDelta               Δ ЕТС, %
 * @property {number|null} grossCarryingAmount    ВБС на дату фиксации, в валюте ФИ
 * @property {number|null} grossCarryingImpactRate  влияние на ВБС, %
 * @property {number|null} day1PnlAmount          Day1PnL, в валюте ФИ
 * @property {string} comment
 */

/**
 * Вид модификации при фиксации ЭПС/ВБС.
 * Source: invented (21.10.2026) — «Первоначальная» везде (ответ человека 20.10.2026).
 * @typedef {'INITIAL'|'NON_SUBSTANTIAL'|'SUBSTANTIAL'} FixationModificationCode
 */

/**
 * Данные карточки окна «Фиксация ЭПС/ВБС» после выбора ФИ и даты. Отдаёт стор, не мок.
 * Source: invented (21.10.2026) — листы «Фиксация ЭПС_ВБС» и листы ЕТС макетов.
 * @typedef {Object} FixationContextRsDto
 * @property {number|null} grossCarryingBefore    ВБС до фиксации; null — нет первоначальной фиксации
 * @property {number|null} etsRate                значение ЕТС, %
 * @property {number|null} etsDelta               Δ ЕТС, %
 * @property {number|null} etsBefore              прежняя ЕТС, %; от неё считается Δ при ручном вводе
 * @property {number[]|null} etsValues            значения ЕТС инструментов ФИ при etsStatus MULTIPLE, %
 * @property {'OK'|'EMPTY'|'FAILED'|'MULTIPLE'|'NONE'} etsStatus  состояние ЕТС: есть · нет или 0 · ошибка расчёта · разные у инструментов · не запрашивали
 */

/**
 * Результат предварительного расчёта фиксации: два блока по виду модификации.
 * Source: invented (21.10.2026) — блоки «Несущественная» и «Существенная модификация» окна.
 * @typedef {Object} FixationPreliminaryRsDto
 * @property {boolean} ok
 * @property {number} grossCarryingBefore         ВБС до фиксации
 * @property {{gcaAfter: number, day1Pnl: number, day1PnlShare: number}} nonSubstantial
 *           ВБС после фиксации, Day1PnL, доля Day1PnL (%)
 * @property {{gcaAfter: number, eirAfter: number, eirDelta: number}} substantial
 *           ВБС после фиксации, ЭПС после фиксации (%), Δ ЭПС (%)
 */

/**
 * Ошибка предварительного расчёта фиксации: вместо результата.
 * Source: invented (21.10.2026).
 * @typedef {Object} FixationPreliminaryErrorRsDto
 * @property {'NO_INITIAL'|'FAILED'} error      нет первоначальной фиксации ФИ · расчёт не выполнен
 */

/**
 * Запрос на расчёт фиксации — по карточке окна «Фиксация ЭПС/ВБС».
 * Source: invented (21.10.2026).
 * @typedef {Object} EirIbsvFixationRqDto
 * @property {string} fiId                        ФИ (id карточки сделки)
 * @property {string|null} date                   дата изменений (ISO-дата); для «Первоначальной» null
 * @property {FixationModificationCode} modificationTypeCode
 * @property {string} comment
 * @property {number} [etsRateManual]             ЕТС, введённая вручную, %
 */

/**
 * Код отчёта метрик: МСФО, РСБУ, KPI «Краткий» / «Подробный».
 * Source: invented (21.10.2026).
 * @typedef {'IFRS'|'RAS'|'KPI_SHORT'|'KPI_FULL'} FinMetricsReportCode
 */

/**
 * Отчёт метрик: общие колонки дат и группы по ФИ. Собирает стор, не мок.
 * Source: invented (21.10.2026).
 * @typedef {Object} FinMetricsReportRsDto
 * @property {FinMetricsReportCode} reportCode
 * @property {string[]} dates                     колонки — все даты событий всех ФИ отчёта
 * @property {{financialInstrumentId: string, financialInstrumentName: string, currencyCode: string,
 *   rows: {metricCode: string, metricName: string, values: Record<string, number|null>}[]}[]} groups
 *           values: дата → число; нет события у ФИ на дату — null (пустая ячейка)
 */

/** @type {Record<string, DealMetricsCalculationRsDto & {fixations?: EirIbsvFixationRsDto[]}>} */
window.MOCK_DEAL_METRICS_CALC = {
  "1024": {
    dealId: 1024, calcStatusCode: 'CALCULATED', calculatedAt: '2024-01-22T16:45:00+03:00',
    calculatedFiIds: ['FI-1024-1', 'FI-1024-2', 'FI-1024-3', 'FI-1024-4', 'FI-1024-5', 'FI-1024-6', 'FI-1024-7'],
    lastAttemptFailed: false,
    fixations: [
      { fixationId: 'FX-1024-1', financialInstrumentId: 'FI-1024-1', changeDate: '2024-04-22', modificationTypeCode: 'INITIAL',
        eirRate: 11.82, eirDelta: null, etsRate: 9.4, etsDelta: null, grossCarryingAmount: 350000000,
        grossCarryingImpactRate: null, day1PnlAmount: null, comment: 'Первоначальная фиксация' },
      { fixationId: 'FX-1024-2', financialInstrumentId: 'FI-1024-1', changeDate: '2025-03-14', modificationTypeCode: 'SUBSTANTIAL',
        eirRate: 12.64, eirDelta: 0.82, etsRate: 10.1, etsDelta: 0.7, grossCarryingAmount: 338450000,
        grossCarryingImpactRate: -3.3, day1PnlAmount: -4210000, comment: 'Изменение графика погашения' },
      { fixationId: 'FX-1024-3', financialInstrumentId: 'FI-1024-2', changeDate: '2024-04-22', modificationTypeCode: 'INITIAL',
        eirRate: 10.15, eirDelta: null, etsRate: 8.9, etsDelta: null, grossCarryingAmount: 55000000,
        grossCarryingImpactRate: null, day1PnlAmount: null, comment: '' }
    ]
  },
  "1027": {
    dealId: 1027, calcStatusCode: 'CALCULATED', calculatedAt: '2024-01-22T16:45:00+03:00',
    calculatedFiIds: ['FI-1027-1', 'FI-1027-2', 'FI-1027-3'], lastAttemptFailed: false,
    fixations: [
      { fixationId: 'FX-1027-1', financialInstrumentId: 'FI-1027-1', changeDate: '2024-04-22', modificationTypeCode: 'INITIAL',
        eirRate: 13.05, eirDelta: null, etsRate: 15.45, etsDelta: null, grossCarryingAmount: 120000000,
        grossCarryingImpactRate: null, day1PnlAmount: null, comment: '' },
      { fixationId: 'FX-1027-2', financialInstrumentId: 'FI-1027-1', changeDate: '2025-06-30', modificationTypeCode: 'NON_SUBSTANTIAL',
        eirRate: 12.7, eirDelta: -0.35, etsRate: 15.45, etsDelta: 0, grossCarryingAmount: 118900000,
        grossCarryingImpactRate: -0.9, day1PnlAmount: -1100000, comment: 'Перенос даты платежа' },
      { fixationId: 'FX-1027-3', financialInstrumentId: 'FI-1027-2', changeDate: '2024-04-22', modificationTypeCode: 'INITIAL',
        eirRate: 9.8, eirDelta: null, etsRate: 7.6, etsDelta: null, grossCarryingAmount: 55000000,
        grossCarryingImpactRate: null, day1PnlAmount: null, comment: '' }
    ]
  },
  "1028": {
    dealId: 1028, calcStatusCode: 'CALCULATED', calculatedAt: '2024-01-22T16:45:00+03:00',
    calculatedFiIds: ['FI-1028-1', 'FI-1028-2', 'FI-1028-3', 'FI-1028-4'], lastAttemptFailed: false
  },
  "1037": {
    dealId: 1037, calcStatusCode: 'CALCULATED', calculatedAt: '2024-01-22T16:45:00+03:00',
    calculatedFiIds: ['FI-1037-1'], lastAttemptFailed: false
  },
  "1036": {
    dealId: 1036, calcStatusCode: 'NOT_CALCULATED', calculatedAt: null, calculatedFiIds: [], lastAttemptFailed: true
  }
};

/** Подписи кодов для интерфейса. */
window.FIN_METRICS_LABELS = {
  /** Вкладки страницы «Финансовые метрики»; вкладка KPI — два вида отчета. */
  tabs: { IFRS: 'МСФО', RAS: 'РСБУ', KPI: 'KPI', FIXATIONS: 'Фиксации ЭПС/ВБС' },
  kpiViews: { KPI_SHORT: 'Краткий', KPI_FULL: 'Подробный' },
  /** @type {Record<FixationModificationCode, string>} */
  modification: { INITIAL: 'Первоначальная', NON_SUBSTANTIAL: 'Несущественная', SUBSTANTIAL: 'Существенная' }
};

/**
 * Метрики отчётов: [код, подпись]. Набор одинаков для всех типов ФИ — допущение
 * (21.10.2026), точный состав по типам ФИ (акции, РЕПО, дебиторка, доп.
 * доходность) от аналитика не получен — вопрос 9 задачи RE0033.
 * РСБУ — 13 строк с листа «Пример индикаторов ФИ…», KPI — с листа «Отчеты KPI».
 */
window.FIN_METRICS_CATALOG = {
  IFRS: [
    ['IFRS_PL_INTEREST_INCOME', 'МСФО. ОПУ Процентные доходы по ЭПС'],
    ['IFRS_PL_INCOME', 'МСФО. ОПУ Доходы'],
    ['IFRS_PL_EXPENSE', 'МСФО. ОПУ Расходы'],
    ['IFRS_BS_CONTRACT_COST', 'МСФО. БАЛ Контрактная стоимость'],
    ['IFRS_BS_AMORTIZED_COST', 'МСФО. БАЛ Амортизированная стоимость'],
    ['IFRS_BS_GCA', 'МСФО. БАЛ ВБС'],
    ['IFRS_BS_RESERVE', 'МСФО. БАЛ Резерв'],
    ['IFRS_CF_TOTAL', 'МСФО. Cashflow, суммарный']
  ],
  RAS: [
    ['RAS_CF_EXCL_BODY_PERCENT', 'Cashflow, все за исключением тела и %'],
    ['RAS_PRINCIPAL_START', 'Тело долга на начало периода'],
    ['RAS_ACCUMULATED_INCOME_END', 'Накопленный доход на конец периода'],
    ['RAS_LIMIT_FEE_END', 'Комиссия за пользование лимитом на конец периода'],
    ['RAS_LIMIT_FEE_PAID_END', 'Накопленные платежи по комиссии за пользование лимитом на конец периода'],
    ['RAS_ACCRUED_PERCENT', 'Начисленные проценты за период'],
    ['RAS_LIMIT_FEE_REMAINDER_END', 'Остаток по комиссии за пользование лимитом на конец периода'],
    ['RAS_LIMIT_FEE_ACCUMULATED_END', 'Накопленная комиссия за пользование лимитом на конец периода'],
    ['RAS_PRINCIPAL_END', 'Тело долга на конец периода'],
    ['RAS_CF_TOTAL', 'Cashflow, суммарный'],
    ['RAS_CF_PERCENT', 'Cashflow, проценты'],
    ['RAS_ACCUMULATED_PERCENT_END', 'Накопленные проценты на конец периода'],
    ['RAS_CF_BODY', 'Cashflow, тело']
  ],
  KPI_SHORT: [
    ['KPI_PL_TOTAL_INCOME', 'KPI. ОПУ Суммарный доход'],
    ['KPI_PL_FUNDING_EXPENSE', 'KPI. ОПУ Фондирование (Расход по ЕТС)'],
    ['KPI_PL_INCOME_MINUS_FUNDING', 'KPI. ОПУ Суммарный доход - Фондирование (Расход по ЕТС)']
  ],
  KPI_FULL: [
    ['KPI_PL_TOTAL_INCOME', 'KPI. ОПУ Суммарный доход'],
    ['KPI_PL_FUNDED_VOLUME', 'KPI. ОПУ Фондируемый объем'],
    ['KPI_PL_FUNDING_EXPENSE', 'KPI. ОПУ Фондирование (Расход по ЕТС)'],
    ['KPI_PL_INCOME_MINUS_FUNDING', 'KPI. ОПУ Суммарный доход - Фондирование (Расход по ЕТС)']
  ]
};
