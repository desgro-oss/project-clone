/* =========================================================================
   loan-contract-fields.js — состав полей договора по типам продуктов.

   Один словарь на два тайла: «Договор и дополнительные соглашения» (страница договора
   займа) и «Договор» (внутренняя страница «Договор и дополнительные соглашения»).
   Тайлы берут его глобалом и строят поля каждый своей функцией; скрипт одного тайла
   другому не нужен — поэтому словарь лежит здесь, а не в скрипте тайла.

   Порядок полей — порядок отображения; состав и подписи — по макетам
   «Tile_Contract_&_AdditionalAgreement» и «Tile_Contract» (26.10.2026).
   Подписи полей — как на макете; пары во фронтенде нет — имена наши.

   Подключается на странице раньше скриптов тайлов договора.

   Source: invented (27.10.2026) — по макету дизайнера, не DTO.
   ========================================================================= */

/**
 * Поле договора в тайле.
 * @typedef {Object} LoanContractFieldDef
 * @property {string}  key       ключ в записи договора (у плановой даты — view.plannedRepaymentDate)
 * @property {string}  label     подпись как на макете
 * @property {boolean} [date]    значение показывается датой ДД.ММ.ГГГГ
 * @property {boolean} [planned] значение берётся из инструментов и траншей, в окне не вводится
 */

(function () {
  'use strict';

  var NUMBER = { key: 'contractNumber', label: 'Номер договора' };
  var SIGN = { key: 'contractSignDate', label: 'Дата подписания', date: true };
  var PLANNED = { key: 'plannedRepaymentDate', label: 'Плановая дата погашения', date: true, planned: true };

  var LOAN = [NUMBER, SIGN, PLANNED];

  /** Поля договора по типу продукта (ключ — код типа). @type {Object<string, LoanContractFieldDef[]>} */
  window.LOAN_CONTRACT_FIELDS = {
    'loan-ncl': LOAN,
    'deprecated': LOAN,
    'tranche': LOAN,
    'shares': LOAN.concat([
      { key: 'deliveryDate', label: 'Дата поставки', date: true },
      { key: 'ownershipTransferDate', label: 'Дата перехода прав собственности', date: true }
    ]),
    'options-repo': LOAN.concat([{ key: 'validityTerm', label: 'Срок действия', date: true }]),
    'corporate-agreement': LOAN,
    'collaterals': [NUMBER, SIGN, { key: 'endDate', label: 'Дата окончания', date: true }],
    'pjsc-guarantee': [
      { key: 'guaranteeNumber', label: 'Номер гарантии' },
      { key: 'conclusionDate', label: 'Дата заключения', date: true },
      { key: 'provisionDate', label: 'Дата предоставления', date: true },
      { key: 'endDate', label: 'Дата окончания', date: true }
    ],
    /* у НКЛ с баланса ПАО подпись «Дата погашения», а не «Плановая…»; значение — та же
       плановая дата (допущение, паспорт тайла, «Открытые вопросы») */
    'pjsc-ncl': [NUMBER, SIGN, { key: 'plannedRepaymentDate', label: 'Дата погашения', date: true, planned: true }],
    /* только у тайла «Договор» внутренней страницы: в матрице тайла страницы договора типа
       нет, поэтому в LOAN_CONTRACT_TILE_VARIANTS его нет (RE0041, решение агента 29) */
    'compensation-payments': [NUMBER, SIGN]
  };

  /** Типы тайла «Договор и дополнительные соглашения» (макет «Tile_Contract_&_AdditionalAgreement»). */
  window.LOAN_CONTRACT_TILE_VARIANTS = {
    'loan-ncl': 'НКЛ',
    'deprecated': 'Deprecated',
    'tranche': 'Транш',
    'shares': 'Акции/Доли',
    'options-repo': 'Опционы/РЕПО',
    'corporate-agreement': 'Корпдоговор',
    'collaterals': 'Обеспечения',
    'pjsc-guarantee': 'Гарантия с баланса ПАО',
    'pjsc-ncl': 'НКЛ с баланса ПАО'
  };

  /** Типы тайла «Договор» (макет «Tile_Contract»): девять, как у соседнего тайла, но вместо
      Deprecated — «Соглашение о комп. выплатах». Подписи — как на макете. */
  window.LOAN_CONTRACT_VARIANTS = {
    'loan-ncl': 'НКЛ',
    'tranche': 'Транш',
    'shares': 'Акции/Доли',
    'options-repo': 'Опционы/РЕПО',
    'corporate-agreement': 'Корпдоговор',
    'collaterals': 'Обеспечения',
    'pjsc-guarantee': 'Гарантия с баланса ПАО',
    'pjsc-ncl': 'НКЛ с баланса ПАО',
    'compensation-payments': 'Соглашение о комп. выплатах'
  };
})();
