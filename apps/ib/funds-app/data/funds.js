/* =========================================================================
   Фонды и их активы — демо-данные страницы FundsPipeline
   (window.MOCK_FUNDS, window.MOCK_FUND_ASSETS, window.FUND_TYPE_LABELS,
   window.FUND_PRIORITY_LABELS).

   Обычный <script>, а не JSON: страницы открываются по file://, где fetch не
   работает. Подключается до скриптов виджетов:
   <script src="../data/funds.js"></script>.

   Имена полей — из моков и колонок фронтенда funds-app
   (tmp/funds-app/src/widgets/tables/FundsTable/mock.ts, FundsTable.hooks.tsx,
   AssetsTable/mock.ts, AssetsTable.config.ts): FundItem, AssetInfo из
   @sber-ibp/ib-view-lib-fe. Значения — макет «Funds pipeline» (30.10.2026):
   12 фондов, активы Интерроса; у РФПИ активов нет (решение человека
   30.10.2026). Фонд из ЕПК — с partyId, фонд не из ЕПК — partyId null.
   Значения правдоподобные и детерминированные.
   ========================================================================= */

/**
 * Значение справочника: код и подпись.
 * Source: mock FundsTable/mock.ts (priority, types) — тип DictionaryItem фронтенда.
 * @typedef {Object} DictionaryItemDto
 * @property {string} code  код значения
 * @property {string} name  подпись для интерфейса
 */

/**
 * Тип фонда.
 * Source: mock FundsTable/mock.ts (PE, FAMILY_OFFICE); PE_VC и HOLDING — invented (30.10.2026), по макету.
 * @typedef {'PE'|'PE_VC'|'FAMILY_OFFICE'|'HOLDING'} FundTypeCode
 */

/**
 * Приоритет фонда.
 * Source: mock FundsTable/mock.ts (HIGH, MEDIUM); LOW — invented (30.10.2026), по макету.
 * @typedef {'HIGH'|'MEDIUM'|'LOW'} FundPriorityCode
 */

/**
 * Ключевой бенефициар фонда.
 * Source: FundsTable.hooks.tsx (item.keyBeneficiaries[].displayName).
 * @typedef {Object} FundBeneficiaryDto
 * @property {string} displayName  имя бенефициара так, как его показывает интерфейс
 */

/**
 * Контактное лицо фонда.
 * Source: FundsTable.hooks.tsx (item.contacts[].name).
 * @typedef {Object} FundContactDto
 * @property {string} name  ФИО контактного лица
 */

/**
 * Фонд в списке фондов — строка FundsTable.
 * Source: mock FundsTable/mock.ts (FundInfo) + поля колонок FundsTable.config.ts и FundsTable.hooks.tsx.
 * @typedef {Object} FundItemDto
 * @property {string} objectId                         идентификатор фонда
 * @property {string} name                             название фонда
 * @property {string|null} alias                       псевдоним
 * @property {string|null} inn                         ИНН
 * @property {string|null} kpp                         КПП
 * @property {string|null} partyId                     клиент в ЕПК; null — фонд не из ЕПК
 * @property {FundBeneficiaryDto[]} keyBeneficiaries   ключевые бенефициары
 * @property {DictionaryItemDto[]|null} types          типы фонда (FundTypeCode)
 * @property {DictionaryItemDto|null} priority         приоритет (FundPriorityCode)
 * @property {number|null} aumAssetsCount              число активов фонда; 0 и null — «—»
 * @property {FundContactDto[]} contacts               контактные лица (колонка скрыта по умолчанию)
 * @property {string|null} comment                     комментарий (колонка скрыта по умолчанию)
 * @property {string|undefined} foundationYear         год основания
 * @property {string|undefined} closureYear            год закрытия; есть — фонд закрыт
 */

/**
 * Актив фонда — строка AssetsTable.
 * Source: mock AssetsTable/mock.ts (AssetInfo) + колонки AssetsTable.config.ts.
 * @typedef {Object} AssetItemDto
 * @property {string} objectId               идентификатор актива
 * @property {string} fundId                 фонд-владелец (objectId фонда) — invented (30.10.2026): у фронтенда активы запрашиваются по fundId
 * @property {string} name                   название актива
 * @property {string|null} alias             псевдоним (колонка скрыта по умолчанию)
 * @property {string|null} inn               ИНН
 * @property {string|null} kpp               КПП
 * @property {string|null} partyId           клиент в ЕПК — invented (30.10.2026), по пункту меню «Перейти на страницу клиента»
 * @property {string} acquisitionYear        дата приобретения, ISO
 * @property {number|null} ev                Enterprise Value, млн руб.
 * @property {number|null} mcap              MCAP / 100% equity, млн руб.
 * @property {number|null} ownershipPercent  доля владения, %
 * @property {number|null} ownershipValue    стоимость доли, млн руб.
 * @property {DictionaryItemDto|null} gicsIndustry  отрасль по GICS
 */

/** Подписи кодов FundTypeCode. @type {Record<FundTypeCode, string>} */
window.FUND_TYPE_LABELS = {
  PE: 'PE',
  PE_VC: 'PE / VC',
  FAMILY_OFFICE: 'FamilyOffice',
  HOLDING: 'Холдинг'
};

/** Подписи кодов FundPriorityCode. @type {Record<FundPriorityCode, string>} */
window.FUND_PRIORITY_LABELS = {
  HIGH: 'Высокий',
  MEDIUM: 'Средний',
  LOW: 'Низкий'
};

(function () {
  var T = window.FUND_TYPE_LABELS, P = window.FUND_PRIORITY_LABELS;
  function type(code) { return { code: code, name: T[code] }; }
  function prio(code) { return { code: code, name: P[code] }; }
  function ben(names) { return names.map(function (n) { return { displayName: n }; }); }
  function fund(id, name, alias, inn, partyId, bens, types, priority, count) {
    return {
      objectId: id, name: name, alias: alias,
      inn: inn, kpp: inn ? '1157746316598' : null, partyId: partyId,
      keyBeneficiaries: ben(bens), types: types.map(type), priority: prio(priority),
      aumAssetsCount: count, contacts: [], comment: null,
      foundationYear: undefined, closureYear: undefined
    };
  }

  /** @type {FundItemDto[]} */
  window.MOCK_FUNDS = [
    fund('fnd-001', 'Интеррос', 'Интеррос — Потанин', '7706419639', 'pty-1001', ['Владимир Потанин'], ['PE'], 'HIGH', 12),
    fund('fnd-002', 'USM', 'USM — Усманов', '7706559639', 'pty-1002', ['Алишер Усманов'], ['PE'], 'HIGH', 3),
    fund('fnd-003', 'РТ-Развитие бизнеса', 'Ростех — РТ РБ', '7706559640', 'pty-1003', ['ГК Ростех'], ['PE_VC'], 'MEDIUM', 2),
    fund('fnd-004', 'РФПИ', 'РФПИ — госинвестиции', '7706559641', 'pty-1004', ['Государство'], ['PE_VC'], 'LOW', 0),
    fund('fnd-005', 'Киевская площадь', 'КП — недвижимость', '7706559642', 'pty-1005', ['Год Нисанов', 'Зарах Илиев'], ['FAMILY_OFFICE'], 'LOW', 3),
    fund('fnd-006', 'Группа Альянс', 'Альянс — внутренний фонд', '7706559643', 'pty-1006', ['Муса Бажаев'], ['HOLDING'], 'LOW', 2),
    fund('fnd-007', 'Группа Арнест', 'Арнест — инвестиции', '7706559644', 'pty-1007', ['Алексей Сагал'], ['PE_VC'], 'MEDIUM', 2),
    fund('fnd-008', 'Это пример фонда не из ЕПК', 'Это пример фонда не из ЕПК', null, null, [], ['PE'], 'HIGH', 2),
    fund('fnd-009', 'Восток Инвестиции (ранее BVCP)', 'Восток Инвестиции — BVCP', '7706559645', 'pty-1009', ['Институциональные инвесторы'], ['PE'], 'MEDIUM', 2),
    fund('fnd-010', 'Восход', 'Восход — венчур', '7706559646', 'pty-1010', ['Владимир Потанин'], ['PE_VC'], 'HIGH', 3),
    fund('fnd-011', 'Газпромбанк / ГПБ РА', 'ГПБ — прямые инвестиции', '7706559647', 'pty-1011', ['Государство'], ['HOLDING'], 'MEDIUM', 2),
    fund('fnd-012', 'Восток Инвестиции (ранее BVCP)', 'Фонд Восток', '7706559648', 'pty-1012', ['Институциональные инвесторы'], ['PE'], 'MEDIUM', 2)
  ];
  /* скрытые по умолчанию колонки «Контактные лица» и «Комментарий» — у части фондов */
  var F = window.MOCK_FUNDS;
  F[0].contacts = [{ name: 'Соколов Андрей Викторович' }, { name: 'Морозова Елена Игоревна' }];
  F[0].comment = 'Встреча по портфелю активов — ноябрь 2026';
  F[1].contacts = [{ name: 'Кузнецов Дмитрий Олегович' }];
  F[4].contacts = [{ name: 'Абрамов Рустам Ильич' }];
  F[4].comment = 'Интерес к сделкам с коммерческой недвижимостью';
  F[7].comment = 'Фонд заведён вручную, в ЕПК не найден';

  function ind(code, name) { return { code: code, name: name }; }
  var IND = {
    hotels: ind('HOTELS_RESORTS', 'Отели, курорты и круизы'),
    metals: ind('METALS_MINING', 'Металлы и добыча'),
    pharma: ind('PHARMA', 'Фармацевтика'),
    banks: ind('BANKS', 'Банки'),
    internet: ind('INTERACTIVE_MEDIA', 'Интерактивные медиа и сервисы'),
    software: ind('SOFTWARE', 'Программное обеспечение'),
    telecom: ind('TELECOM', 'Телекоммуникационные услуги'),
    realty: ind('REAL_ESTATE', 'Недвижимость'),
    industry: ind('INDUSTRIALS', 'Промышленное оборудование'),
    energy: ind('ENERGY', 'Энергетика')
  };
  var n = 0;
  function asset(fundId, name, inn, ev, mcap, pct, industry) {
    n += 1;
    return {
      objectId: 'ast-' + String(n).padStart(3, '0'), fundId: fundId, name: name, alias: null,
      inn: inn, kpp: inn ? '770601001' : null, partyId: inn ? 'pty-2' + String(n).padStart(3, '0') : null,
      acquisitionYear: '2021-01-01', ev: ev, mcap: mcap, ownershipPercent: pct,
      ownershipValue: mcap == null || pct == null ? null : Math.round(mcap * pct / 100),
      gicsIndustry: industry
    };
  }

  /** @type {AssetItemDto[]} */
  window.MOCK_FUND_ASSETS = [
    asset('fnd-001', 'Роза Хутор', '7706419639', 245000000, 220000000, 90, IND.hotels),
    asset('fnd-001', 'Турьев Хутор', '7706419640', 145000000, 140000000, 100, IND.hotels),
    asset('fnd-001', 'Парк Три Вулкана', '7706419641', 320000000, 300000000, 35, IND.hotels),
    asset('fnd-001', 'Норильский Никель', '7706419642', 2945000000, 2800000000, 55, IND.metals),
    asset('fnd-001', 'ГРК Быстринское', '7706419643', 2945000000, 2700000000, 24, IND.metals),
    asset('fnd-001', 'Петровакс фарм', '7706419644', 320000000, 310000000, 85, IND.pharma),
    asset('fnd-001', 'Т-банк', '7706419645', 320000000, 315000000, 100, IND.banks),
    asset('fnd-001', 'Банк Точка', '7706419646', 320000000, 290000000, 60, IND.banks),
    asset('fnd-001', 'Росбанк', '7706419647', 950000000, 900000000, 55, IND.banks),
    asset('fnd-001', 'Яндекс (9,95%)', '7706419648', 950000000, 940000000, 30, IND.internet),
    asset('fnd-001', 'Атомайз', '7706419649', 90000000, 85000000, 75, IND.software),
    asset('fnd-001', 'Рексофт', '7706419650', 120000000, 110000000, 89, IND.software),
    asset('fnd-002', 'Металлоинвест', '7706559701', 1850000000, 1700000000, 100, IND.metals),
    asset('fnd-002', 'МегаФон', '7706559702', 980000000, 930000000, 100, IND.telecom),
    asset('fnd-002', 'Удоканская медь', '7706559703', 640000000, 600000000, 70, IND.metals),
    asset('fnd-003', 'РТ-Техприемка', '7706559704', 42000000, 40000000, 51, IND.industry),
    asset('fnd-003', 'Национальная иммунобиологическая компания', '7706559705', 87000000, 82000000, 100, IND.pharma),
    asset('fnd-005', 'Европейский', '7706559706', 260000000, 250000000, 100, IND.realty),
    asset('fnd-005', 'Афимолл Сити', '7706559707', 410000000, 395000000, 100, IND.realty),
    asset('fnd-005', 'Москва-Сити Башня Федерация', '7706559708', 530000000, 510000000, 60, IND.realty),
    asset('fnd-006', 'Альянс Энерджи', '7706559709', 180000000, 170000000, 100, IND.energy),
    asset('fnd-006', 'Альянс Девелопмент', '7706559710', 95000000, 90000000, 75, IND.realty),
    asset('fnd-007', 'ИнвестТехЛаб', '7706559711', 36000000, 34000000, 40, IND.software),
    asset('fnd-007', 'Северная верфь', '7706559712', 120000000, 112000000, 25, IND.industry),
    asset('fnd-008', 'Пример актива не из ЕПК', null, null, null, 100, null),
    asset('fnd-008', 'Второй пример актива', null, 12000000, 11000000, 50, IND.software),
    asset('fnd-009', 'Ozon', '7706559713', 720000000, 690000000, 12, IND.internet),
    asset('fnd-009', 'Мэйл.ру Груп', '7706559714', 610000000, 590000000, 8, IND.internet),
    asset('fnd-010', 'Розница К-7', '7706559715', 54000000, 50000000, 49, IND.software),
    asset('fnd-010', 'Тинькофф Капитал', '7706559716', 80000000, 77000000, 20, IND.banks),
    asset('fnd-010', 'Медси', '7706559717', 150000000, 141000000, 30, IND.pharma),
    asset('fnd-011', 'ГПБ Энергия', '7706559718', 330000000, 315000000, 100, IND.energy),
    asset('fnd-011', 'Газпромбанк Лизинг', '7706559719', 210000000, 200000000, 100, IND.banks),
    asset('fnd-012', 'ВИ.ру', '7706559720', 140000000, 135000000, 35, IND.internet),
    asset('fnd-012', 'Деловые Линии', '7706559721', 260000000, 250000000, 15, IND.industry)
  ];
})();

/* =========================================================================
   Окна фонда (MS0020 Э2): поиск в базе фондов и в ЕПК, детали найденного.
   ========================================================================= */

/**
 * Участник команды клиента в ЕПК.
 * Source: invented (30.10.2026), по макету «Add fund / Step 01 - Search result B».
 * @typedef {Object} UcpTeamMemberDto
 * @property {string} employeeNumber  табельный номер
 * @property {string} fio             ФИО сотрудника
 * @property {string} role            роль в команде клиента
 */

/**
 * Клиент из базы юр. лиц Сбера (ЕПК) — результат поиска окна «Добавить фонд».
 * Source: ClientUcpDto (@sber-ibp/clients-lib-fe; в tmp/funds-app нет — используется
 * shortName, inn, kpp в EditFundModal.tsx); kppKn, ogrn, kio, crmId — ClientDetailsTile.tsx;
 * holdingName — meetingProtocols.types.ts; остальное — invented (30.10.2026), по макету.
 * @typedef {Object} UcpClientDto
 * @property {string} partyId                 идентификатор клиента в ЕПК
 * @property {string} shortName               краткое наименование (заголовок карточки)
 * @property {string} fullName                полное наименование
 * @property {'LEGAL'|'HOLDING'} clientKind   вид записи: юр. лицо или холдинг — invented
 * @property {string} clientTypeName          подпись типа клиента («Юридическое лицо», «Холдинг»)
 * @property {string|null} residencyName      «Резидент» / «Нерезидент»; у холдинга null
 * @property {string|null} inn                ИНН
 * @property {string|null} kpp                КПП
 * @property {string|null} kppKn              КПП КН
 * @property {string|null} ogrn               ОГРН
 * @property {string|null} kio                КИО
 * @property {string|null} crmId              CRM ID; null — клиент без CRM ID
 * @property {string|null} holdingName        наименование холдинга
 * @property {UcpTeamMemberDto[]} team        команда клиента
 * @property {string|null} subIndustryName    наименование подотрасли
 * @property {string|null} industryName       наименование отрасли
 * @property {string|null} segmentName        наименование сегмента
 */

/**
 * Дополнительные поля фонда для правой панели окна «Добавить фонд» (найден в базе фондов).
 * Source: invented (30.10.2026), по макету «Add fund / Step 01 - Search result A»;
 * подписи — i18n фронтенда 'Investment volume', 'Key industries'.
 * На FundItemDto: investmentVolume {number|null} — объём инвестиций, млрд руб.;
 * keyIndustries {DictionaryItemDto[]} — ключевые отрасли.
 */
(function () {
  var F = window.MOCK_FUNDS;
  F.forEach(function (f) { f.investmentVolume = null; f.keyIndustries = []; });
  F[0].investmentVolume = 987.65;
  F[0].keyIndustries = [
    { code: 'METALS_MINING', name: 'Металлы и руды' },
    { code: 'IT_SERVICES', name: 'Информационно-технологические услуги' },
    { code: 'BANKS', name: 'Банки' }
  ];
  F[1].investmentVolume = 412.3;
  F[1].keyIndustries = [{ code: 'METALS_MINING', name: 'Металлы и руды' }, { code: 'TELECOM', name: 'Телекоммуникационные услуги' }];

  function team() {
    return [
      { employeeNumber: '18181811', fio: 'Иванов Иван Иванович', role: 'Клиентский менеджер' },
      { employeeNumber: '18181812', fio: 'Петров Иван Иванович', role: 'Старший банкир конгломерата' },
      { employeeNumber: '18181813', fio: 'Сидоров Иван Иванович', role: 'Территориальный менеджер' }
    ];
  }

  /** @type {UcpClientDto[]} */
  window.MOCK_UCP_CLIENTS = [
    {
      partyId: 'pty-3001', shortName: 'ИП «Интер О.С.»', fullName: 'ОТКРЫТОЕ АКЦИОНЕРНОЕ ОБЩЕСТВО "Интеррос"',
      clientKind: 'LEGAL', clientTypeName: 'Юридическое лицо', residencyName: 'Резидент',
      inn: '076543834', kpp: '33432423423', kppKn: '7788994455', ogrn: '076543834', kio: null, crmId: '1-1V9D55',
      holdingName: 'ОБЩЕСТВО С ОГРАНИЧЕННОЙ ОТВЕТСТВЕННОСТЬЮ "РОМАШКА-ПРОМОКАШКА-ХОЛДИНГ"',
      team: team(), subIndustryName: 'Производство железной руды',
      industryName: 'Металлургическая и горнодобывающая промышленность', segmentName: 'Крупнейшие'
    },
    {
      partyId: 'pty-3002', shortName: 'Интерактив Брокерс', fullName: 'Интерактив Брокерс',
      clientKind: 'HOLDING', clientTypeName: 'Холдинг', residencyName: null,
      inn: null, kpp: null, kppKn: null, ogrn: null, kio: null, crmId: '1-1SKTO4YD',
      holdingName: null, team: [], subIndustryName: null, industryName: 'Финансовые услуги', segmentName: 'Крупные'
    },
    {
      partyId: 'pty-3003', shortName: 'ООО «Интерлизинг»', fullName: 'ОБЩЕСТВО С ОГРАНИЧЕННОЙ ОТВЕТСТВЕННОСТЬЮ "ИНТЕРЛИЗИНГ"',
      clientKind: 'LEGAL', clientTypeName: 'Юридическое лицо', residencyName: 'Резидент',
      inn: '7802131219', kpp: '780201001', kppKn: null, ogrn: '1027804862755', kio: null, crmId: null,
      holdingName: null, team: [], subIndustryName: null, industryName: 'Лизинг', segmentName: 'Средние'
    }
  ];
})();
