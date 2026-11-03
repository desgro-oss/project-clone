/* =========================================================================
   Договор займа (НКЛ) — демо-данные страниц договора (window.MOCK_LOAN_AGREEMENTS).

   Обычный <script> (file://, без fetch). Подключить ДО loan-agreement-store.js:
   <script src="../data/mock-loan-agreements.js"></script>.
   Значения — рыба по макету дизайнера 26.10.2026, правятся по ходу дизайна.
   Состав справочников (типы изменения, ключевые изменения, уровни одобрения,
   балансы) — только то, что видно на скринах, полные списки неизвестны
   (задача RE0041, вопрос 12). Исключение — «Финансовое» и «Нефинансовое»: взяты
   по смыслу названия «Финансовое и нефинансовое» (решение агента, RE0041).
   История КС — значения, близкие к ключевой ставке за 2021–2025, не источник.

   Договор — инструмент «Договор займа (НКЛ)» в дереве продуктов сделки
   (mock-deal-trees.js). Запись хранится по id его узла: в сделке бывает два
   договора (1038, 1053). Номер, название, транши и признак погашения договора
   живут в дереве, здесь их нет — их даёт ProductTreeStore.

   Баланс и валюта договора — здесь (balanceCurrency): по ответу человека
   26.10.2026 (RE0041, вопрос 24) они принадлежат тайлам «Баланс и валюта»
   инструментов и траншей, а не дереву продуктов. Поля balance и currency узлов
   mock-deal-trees.js пока остаются как есть и с этим файлом не связаны.

   Нет записи у договора — все разделы «не заполнено». Правка зависит от
   статуса сделки и погашения договора (LoanAgreementStore.isEditable), поэтому
   демо-договоры выбраны под оба режима:
   – 1027.d1.p1.i1 — правка есть, заполнено всё: 4 ДС (у одного комментарий), 5 схем ЕТС;
   – 1028.d1.p1.i1 — правка есть, частично: договор и баланс, без ДС, схем и тех. информации;
   – 1026.d1.p1.i1 — правка есть, записи нет: везде «Заполнить»;
   – 1024.d1.p1.i1 — просмотр (статус сделки), частично: договор, баланс и одна схема;
   – 1025.d1.p1.i1 — просмотр (статус сделки), записи нет: везде «Не заполнено»;
   – 1030.d1.p1.i1 — просмотр (договор погашен), одно ДС, одна схема;
   – остальные — без записи.

   Имена типов и полей — в стиле API фронтенда (…RsDto, camelCase); поля
   договора и баланса те же, что у TrancheRsDto (tranche-data.js), чтобы в
   проекте не было двух словарей. Перечисления — кодами, подписи — картами ниже.
   Суммы — числа, валюта — код ISO 4217 (RUB), даты — ISO-строки (2026-10-26).
   ========================================================================= */

/**
 * Раздел «Договор».
 * Source: invented (26.10.2026) — заменить на DTO, когда он появится.
 * @typedef {Object} LoanContractRsDto
 * @property {string} contractNumber   номер договора
 * @property {string} contractSignDate дата подписания договора (ISO)
 */

/**
 * Раздел «Баланс и валюта».
 * Source: invented (26.10.2026).
 * @typedef {Object} LoanBalanceCurrencyRsDto
 * @property {BalanceCode} balanceCode  баланс
 * @property {string} currencyCode      валюта, ISO 4217
 * @property {number} totalLimitAmount  общая сумма лимита
 */

/**
 * Раздел «Техническая информация».
 * Source: invented (26.10.2026).
 * @typedef {Object} LoanTechInfoRsDto
 * @property {string} gfoId               ГФО ID
 * @property {string} gfoFundingCreditId  ГФО ID фондирующего кредита
 */

/**
 * Дополнительное соглашение. Номер на экране — «<seqNumber>-<номер договора>»,
 * отдельно не хранится (ответы человека 26.10.2026, вопросы 13 и 26).
 * Source: invented (26.10.2026).
 * @typedef {Object} AdditionalAgreementRsDto
 * @property {string} id
 * @property {number} seqNumber                 порядковый номер ДС в договоре
 * @property {string} signDate                  дата подписания (ISO): то же, что «дата создания» ДС; в окне и в тайле договора — «Дата подписания» (ответ человека, вопрос 25)
 * @property {ChangeTypeCode|null} changeTypeCode тип изменения
 * @property {KeyChangeCode[]} keyChangeCodes   ключевые изменения
 * @property {string|null} comment              комментарий
 * @property {string|null} decisionDate         дата решения КО (ISO)
 * @property {string|null} decisionNumber       номер решения КО — один, строка (ответ человека, вопрос 14)
 * @property {ApprovalLevelCode|null} approvalLevelCode уровень одобрения
 */

/**
 * Процентная схема ЕТС. Периоды схем одного договора не пересекаются.
 * Source: invented (26.10.2026).
 * @typedef {Object} TransferSchemeRsDto
 * @property {string} id
 * @property {string|null} startDate            дата начала (ISO)
 * @property {string|null} endDate              дата окончания (ISO)
 * @property {number} baseIndexLagWorkDays      рабочих дней до применения БИ
 * @property {string|null} comment              комментарий
 * @property {RateTypeCode|null} rateTypeCode   тип ставки
 * @property {number|null} fixedRatePercent     фиксированная ставка, %
 * @property {BaseIndexCode|null} baseIndexCode базовый индекс (плавающая)
 * @property {number|null} spreadPercent        спред к БИ, %
 */

/**
 * Запись договора займа.
 * Source: invented (26.10.2026).
 * @typedef {Object} LoanAgreementRsDto
 * @property {string} instrumentId                     id узла договора в дереве продуктов
 * @property {string|null} counterpartyId             контрагент договора — id базы контрагентов
 *           (mock-counterparties.js); один; null — не выбран (ответ человека 26.10.2026, вопрос 33)
 * @property {LoanContractRsDto|null} contract         null — раздел не заполнен
 * @property {LoanBalanceCurrencyRsDto|null} balanceCurrency null — не заполнен
 * @property {LoanTechInfoRsDto|null} techInfo         null — не заполнен
 * @property {AdditionalAgreementRsDto[]} additionalAgreements
 * @property {TransferSchemeRsDto[]} transferSchemes
 * @property {Object<string, string|null>} trancheSchedules id транша → плановая дата погашения (ISO);
 *           договор берёт самую позднюю (ответ человека 26.10.2026, вопрос 3)
 */

/**
 * Изменение базового индекса. История общая, не по договору.
 * Source: invented (26.10.2026).
 * @typedef {Object} BaseIndexHistoryRsDto
 * @property {string} changeDate         дата изменения (ISO)
 * @property {BaseIndexCode} baseIndexCode
 * @property {number} valuePercent       значение, %
 */

/** @typedef {'SBIL'|'VPE_CAPITAL'|'SBI_LLC'|'PROMFINANCE'} BalanceCode  Source: invented (26.10.2026) — SBIL со скрина, остальные из дерева продуктов */
/** @typedef {'FINANCIAL'|'NON_FINANCIAL'|'FINANCIAL_AND_NON_FINANCIAL'} ChangeTypeCode  Source: invented (26.10.2026) */
/** @typedef {'PRINCIPAL_REPAYMENT_SCHEDULE'|'EARLY_REPAYMENT_TERMS'|'OTHER'} KeyChangeCode  Source: invented (26.10.2026) */
/** @typedef {'FOUR_EYES'|'KPKI_TB'|'KPA_TB'|'KPKI_GOSB'|'SIX_EYES_PPR'} ApprovalLevelCode  Source: invented (26.10.2026) */
/** @typedef {'FIXED'|'FLOATING'} RateTypeCode  Source: invented (26.10.2026) */
/** @typedef {'KEY_RATE'} BaseIndexCode  Source: invented (26.10.2026) — сейчас единственный БИ, КС (ответ человека, вопрос 10) */

/** «Сегодня» демо: ставка «на сегодня» в тайле ЕТС считается на эту дату, экран одинаков при каждом открытии. */
window.LOAN_AGREEMENT_DEMO_TODAY = '2026-10-26';

/** Подписи кодов BalanceCode. @type {Record<BalanceCode, string>} */
window.LOAN_BALANCE_LABELS = {
  SBIL: 'SBIL',
  VPE_CAPITAL: 'VPE CAPITAL',
  SBI_LLC: 'ООО «СБИ»',
  PROMFINANCE: 'ПромФинанс'
};

/** Подписи кодов ChangeTypeCode. @type {Record<ChangeTypeCode, string>} */
window.LOAN_CHANGE_TYPE_LABELS = {
  FINANCIAL: 'Финансовое',
  NON_FINANCIAL: 'Нефинансовое',
  FINANCIAL_AND_NON_FINANCIAL: 'Финансовое и нефинансовое'
};

/** Подписи кодов KeyChangeCode. @type {Record<KeyChangeCode, string>} */
window.LOAN_KEY_CHANGE_LABELS = {
  PRINCIPAL_REPAYMENT_SCHEDULE: 'График погашения основного долга',
  EARLY_REPAYMENT_TERMS: 'Условия досрочного погашения',
  OTHER: 'Прочее'
};

/** Подписи кодов ApprovalLevelCode. @type {Record<ApprovalLevelCode, string>} */
window.LOAN_APPROVAL_LEVEL_LABELS = {
  FOUR_EYES: '4 глаза',
  KPKI_TB: 'КПКИ ТБ',
  KPA_TB: 'КПА ТБ',
  KPKI_GOSB: 'КПКИ ГОСБ',
  SIX_EYES_PPR: '6 глаз ППР'
};

/** Подписи кодов RateTypeCode. @type {Record<RateTypeCode, string>} */
window.LOAN_RATE_TYPE_LABELS = {
  FIXED: 'Фиксированная',
  FLOATING: 'Плавающая'
};

/** Подписи кодов BaseIndexCode: в списке и в тайле — «КС». @type {Record<BaseIndexCode, string>} */
window.LOAN_BASE_INDEX_LABELS = {
  KEY_RATE: 'КС'
};

/** История изменения БИ (КС), от новых к старым. @type {BaseIndexHistoryRsDto[]} */
window.MOCK_BASE_INDEX_HISTORY = [
  { changeDate: '2025-10-24', baseIndexCode: 'KEY_RATE', valuePercent: 16.5 },
  { changeDate: '2025-09-12', baseIndexCode: 'KEY_RATE', valuePercent: 17 },
  { changeDate: '2025-07-25', baseIndexCode: 'KEY_RATE', valuePercent: 18 },
  { changeDate: '2025-06-06', baseIndexCode: 'KEY_RATE', valuePercent: 20 },
  { changeDate: '2024-10-25', baseIndexCode: 'KEY_RATE', valuePercent: 21 },
  { changeDate: '2024-09-13', baseIndexCode: 'KEY_RATE', valuePercent: 19 },
  { changeDate: '2024-07-26', baseIndexCode: 'KEY_RATE', valuePercent: 18 },
  { changeDate: '2023-12-18', baseIndexCode: 'KEY_RATE', valuePercent: 16 },
  { changeDate: '2023-10-30', baseIndexCode: 'KEY_RATE', valuePercent: 15 },
  { changeDate: '2023-09-18', baseIndexCode: 'KEY_RATE', valuePercent: 13 },
  { changeDate: '2023-08-15', baseIndexCode: 'KEY_RATE', valuePercent: 12 },
  { changeDate: '2023-07-24', baseIndexCode: 'KEY_RATE', valuePercent: 8.5 },
  { changeDate: '2022-09-19', baseIndexCode: 'KEY_RATE', valuePercent: 7.5 },
  { changeDate: '2022-07-25', baseIndexCode: 'KEY_RATE', valuePercent: 8 },
  { changeDate: '2022-06-14', baseIndexCode: 'KEY_RATE', valuePercent: 9.5 },
  { changeDate: '2022-05-27', baseIndexCode: 'KEY_RATE', valuePercent: 11 },
  { changeDate: '2022-05-04', baseIndexCode: 'KEY_RATE', valuePercent: 14 },
  { changeDate: '2022-04-11', baseIndexCode: 'KEY_RATE', valuePercent: 17 },
  { changeDate: '2022-02-28', baseIndexCode: 'KEY_RATE', valuePercent: 20 },
  { changeDate: '2022-02-11', baseIndexCode: 'KEY_RATE', valuePercent: 9.5 },
  { changeDate: '2021-12-17', baseIndexCode: 'KEY_RATE', valuePercent: 8.5 },
  { changeDate: '2021-10-22', baseIndexCode: 'KEY_RATE', valuePercent: 7.5 },
  { changeDate: '2021-09-10', baseIndexCode: 'KEY_RATE', valuePercent: 6.75 },
  { changeDate: '2021-07-23', baseIndexCode: 'KEY_RATE', valuePercent: 6.5 },
  { changeDate: '2021-06-11', baseIndexCode: 'KEY_RATE', valuePercent: 5.5 },
  { changeDate: '2021-04-23', baseIndexCode: 'KEY_RATE', valuePercent: 5 },
  { changeDate: '2021-03-26', baseIndexCode: 'KEY_RATE', valuePercent: 4.5 },
  { changeDate: '2020-07-24', baseIndexCode: 'KEY_RATE', valuePercent: 4.25 }
];

/** Договоры по id узла в дереве продуктов. @type {Record<string, LoanAgreementRsDto>} */
window.MOCK_LOAN_AGREEMENTS = {
  '1027.d1.p1.i1': {
    instrumentId: '1027.d1.p1.i1',
    counterpartyId: 'ul-10',
    contract: { contractNumber: '1027-2024', contractSignDate: '2024-04-22' },
    balanceCurrency: { balanceCode: 'VPE_CAPITAL', currencyCode: 'RUB', totalLimitAmount: 123456789 },
    techInfo: { gfoId: '1234567890', gfoFundingCreditId: '1234567890-12-12' },
    additionalAgreements: [
      {
        id: 'AA-1027-4', seqNumber: 4, signDate: '2025-10-01', changeTypeCode: 'FINANCIAL_AND_NON_FINANCIAL',
        keyChangeCodes: ['PRINCIPAL_REPAYMENT_SCHEDULE'], comment: null,
        decisionDate: '2025-09-15', decisionNumber: '1234567890', approvalLevelCode: 'KPKI_GOSB'
      },
      {
        id: 'AA-1027-3', seqNumber: 3, signDate: '2025-06-02', changeTypeCode: 'FINANCIAL_AND_NON_FINANCIAL',
        keyChangeCodes: ['PRINCIPAL_REPAYMENT_SCHEDULE', 'EARLY_REPAYMENT_TERMS'],
        comment: 'Перенос сроков погашения основного долга по графику на один квартал; условия досрочного погашения приведены в соответствие с решением комитета.',
        decisionDate: '2025-05-20', decisionNumber: '1234567811', approvalLevelCode: 'SIX_EYES_PPR'
      },
      {
        id: 'AA-1027-2', seqNumber: 2, signDate: '2024-11-12', changeTypeCode: 'FINANCIAL',
        keyChangeCodes: ['PRINCIPAL_REPAYMENT_SCHEDULE'], comment: null,
        decisionDate: '2024-11-01', decisionNumber: '1234567733', approvalLevelCode: 'KPKI_TB'
      },
      {
        id: 'AA-1027-1', seqNumber: 1, signDate: '2024-07-01', changeTypeCode: 'NON_FINANCIAL',
        keyChangeCodes: ['OTHER'], comment: null,
        decisionDate: '2024-06-24', decisionNumber: '1234567655', approvalLevelCode: 'FOUR_EYES'
      }
    ],
    transferSchemes: [
      { id: 'TS-1027-5', startDate: '2025-01-01', endDate: '2027-12-31', baseIndexLagWorkDays: 2, comment: null,
        rateTypeCode: 'FLOATING', fixedRatePercent: null, baseIndexCode: 'KEY_RATE', spreadPercent: 5 },
      { id: 'TS-1027-4', startDate: '2024-01-01', endDate: '2024-12-31', baseIndexLagWorkDays: 2,
        comment: 'Очень длинный текст комментария в одну строку Очень длинный текст комментария в одну строку Очень длинный текст комментария в одну строку Очень длинный текст комментария в одну строку',
        rateTypeCode: 'FLOATING', fixedRatePercent: null, baseIndexCode: 'KEY_RATE', spreadPercent: 2 },
      { id: 'TS-1027-3', startDate: '2023-01-01', endDate: '2023-12-31', baseIndexLagWorkDays: 2, comment: null,
        rateTypeCode: 'FIXED', fixedRatePercent: 7.5, baseIndexCode: null, spreadPercent: null },
      { id: 'TS-1027-2', startDate: '2022-01-01', endDate: '2022-12-31', baseIndexLagWorkDays: 3,
        comment: 'Очень длинный текст комментария в одну строку Очень длинный текст комментария в одну строку Очень длинный текст комментария в одну строку Очень длинный текст комментария в одну строку',
        rateTypeCode: 'FLOATING', fixedRatePercent: null, baseIndexCode: 'KEY_RATE', spreadPercent: 2 },
      { id: 'TS-1027-1', startDate: '2021-01-01', endDate: '2021-12-31', baseIndexLagWorkDays: 2, comment: null,
        rateTypeCode: 'FIXED', fixedRatePercent: 4, baseIndexCode: null, spreadPercent: null }
    ],
    trancheSchedules: { '1027.d1.p1.i1.t1': '2027-04-22', '1027.d1.p1.i1.t2': '2026-12-30' }
  },

  '1028.d1.p1.i1': {
    instrumentId: '1028.d1.p1.i1',
    counterpartyId: 'ul-11',
    contract: { contractNumber: '1028-2024', contractSignDate: '2024-04-22' },
    balanceCurrency: { balanceCode: 'SBIL', currencyCode: 'RUB', totalLimitAmount: 5000000 },
    techInfo: null,
    additionalAgreements: [],
    transferSchemes: [],
    trancheSchedules: { '1028.d1.p1.i1.t1': '2026-12-30' }
  },

  '1024.d1.p1.i1': {
    instrumentId: '1024.d1.p1.i1',
    counterpartyId: 'ul-20',
    contract: { contractNumber: '1024-2024', contractSignDate: '2024-04-22' },
    balanceCurrency: { balanceCode: 'SBI_LLC', currencyCode: 'RUB', totalLimitAmount: 1600000 },
    techInfo: null,
    additionalAgreements: [],
    transferSchemes: [
      { id: 'TS-1024-1', startDate: '2024-01-01', endDate: '2026-12-31', baseIndexLagWorkDays: 0, comment: null,
        rateTypeCode: 'FIXED', fixedRatePercent: 5, baseIndexCode: null, spreadPercent: null }
    ],
    trancheSchedules: { '1024.d1.p1.i1.t1': '2026-04-22', '1024.d1.p1.i1.t2': '2025-06-30' }
  },

  '1030.d1.p1.i1': {
    instrumentId: '1030.d1.p1.i1',
    counterpartyId: 'ul-21',
    contract: { contractNumber: '1030-2021', contractSignDate: '2021-08-11' },
    balanceCurrency: { balanceCode: 'PROMFINANCE', currencyCode: 'EUR', totalLimitAmount: 9800000 },
    techInfo: { gfoId: '1030456789', gfoFundingCreditId: '1030456789-01-01' },
    additionalAgreements: [
      {
        id: 'AA-1030-1', seqNumber: 1, signDate: '2022-03-14', changeTypeCode: 'FINANCIAL',
        keyChangeCodes: ['EARLY_REPAYMENT_TERMS'], comment: null,
        decisionDate: '2022-03-01', decisionNumber: '1030000101', approvalLevelCode: 'KPA_TB'
      }
    ],
    transferSchemes: [
      { id: 'TS-1030-1', startDate: '2021-08-11', endDate: '2023-02-11', baseIndexLagWorkDays: 1, comment: null,
        rateTypeCode: 'FIXED', fixedRatePercent: 3.5, baseIndexCode: null, spreadPercent: null }
    ],
    trancheSchedules: { '1030.d1.p1.i1.t1': '2023-02-11' }
  }
};
