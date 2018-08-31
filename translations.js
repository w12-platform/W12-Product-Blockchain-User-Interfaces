const translationsDef = "ru"; // en, ru

const translations = {
    /* Config Dashboard */
    "ConfigDashboardTitle": {
        "en": "Config Dashboard",
        "ru": "Панель конфигурации"
    },
    "ConfigDashboardPlaceholder": {
        "en": "Address of the W12Lister",
        "ru": "Адрес W12Lister"
    },
    "ConfigDashboardSave": {
        "en": "Save",
        "ru": "Сохранить"
    },

    /* AdminDashboard */
    "AdminDashboard": {
        "en": "Admin Dashboard",
        "ru": "Панель управления администратора"
    },
    "AdminDashboardWhiteListForm": {
        "en": "Add to whitelist",
        "ru": "Добавить в белый список"
    },
    "AdminDashboardLoadLedger": {
        "en": "Loading smart contracts...",
        "ru": "Загрузка смарт-контрактов..."
    },
    "AdminDashboardLoadTokens": {
        "en": "Loading a list of tokens...",
        "ru": "Загрузка списка токенов..."
    },
    "AdminDashboardListingToken": {
        "en": "Adding a token to the whitelist...",
        "ru": "Добавление токена в whitelist..."
    },
    "AdminDashboardCheckingToken": {
        "en": "Checking the token...",
        "ru": "Проверка токена..."
    },
    "AdminDashboardFieldTokenLabel": {
        "en": "Token Address",
        "ru": "Адрес токена"
    },
    "AdminDashboardFieldTokenPlaceholder": {
        "en": "Token address with checksum",
        "ru": "Адрес токена с контрольной суммой"
    },
    "AdminDashboardFieldOwnerLabel": {
        "en": "Owner Address",
        "ru": "Адрес владельца"
    },
    "AdminDashboardFieldOwnerPlaceholder": {
        "en": "Token owner address",
        "ru": "Адрес владельца токена"
    },
    "AdminDashboardFieldSymbolLabel": {
        "en": "Symbol",
        "ru": "Символ"
    },
    "AdminDashboardFieldSymbolPlaceholder": {
        "en": "3-4 letter abbreviation",
        "ru": "Аббревиатуры 3-4 буквы"
    },
    "AdminDashboardFieldDecimalsLabel": {
        "en": "The number of decimal places after the decimal point",
        "ru": "Количество десятичных знаков после запятой"
    },
    "AdminDashboardFieldDecimalsPlaceholder": {
        "en": "Default: 18",
        "ru": "По умолчанию: 18"
    },
    "AdminDashboardFieldNameLabel": {
        "en": "Name",
        "ru": "Название"
    },
    "AdminDashboardFieldNamePlaceholder": {
        "en": "Descriptive name of the token",
        "ru": "Название токена"
    },
    "AdminDashboardFieldFeeTokensLabel": {
        "en": "Fee in tokens",
        "ru": "Сбор в токенах"
    },
    "AdminDashboardFieldFeeTokensLabelMessage": {
        "en": "It is charged at the time of the project's transfer of its tokens for sale through the blocking protocol W12",
        "ru": "Взимается в момент перевода проектом своих токенов для продажи через блокчейн протокол W12"
    },
    "AdminDashboardFieldFeeTokensPlaceholder": {
        "en": "0 .. 100 percent",
        "ru": "0 .. 100 процентов"
    },
    "AdminDashboardFieldFeeEthLabel": {
        "en": "Fee in ETH",
        "ru": "Сбор в эфире"
    },
    "AdminDashboardFieldFeeEthLabelMessage": {
        "en": "Charged at the time of sale of the tokens",
        "ru": "Взимается в момент продажи токенов"
    },
    "AdminDashboardFieldFeeEthPlaceholder": {
        "en": "0 .. 99.99 percent",
        "ru": "0 .. 99.99 процентов"
    },
    "AdminDashboardFieldWTokenSaleFeePercentLabel": {
        "en": "Commission in project tokens",
        "ru": "Комиссия в токенах проекта"
    },
    "AdminDashboardFieldWTokenSaleFeePercentLabelMessage": {
        "en": "Charged at the time of sale of the tokens",
        "ru": "Взимается в момент продажи токенов"
    },
    "AdminDashboardFieldWTokenSaleFeePercentPlaceholder": {
        "en": "0 .. 99.99 percent",
        "ru": "0 .. 99.99 процентов"
    },
    "AdminDashboardFieldTrancheFeePercentLabel": {
        "en": "Commission in ETH",
        "ru": "Комиссия в ETH"
    },
    "AdminDashboardFieldTrancheFeePercentLabelMessage": {
        "en": "It is charged at the time of receipt of funds after the completion of the road map phase",
        "ru": "Взимается в момент получения средств проектом после окончания этапа дорожной карты"
    },
    "AdminDashboardFieldTrancheFeePercentPlaceholder": {
        "en": "0 .. 99.99 percent",
        "ru": "0 .. 99.99 процентов"
    },
    "AdminDashboardWarning": {
        "en": "Check the correctness of all fields, the correctness of the address of the token and the absence of a token in the table of the already added to WhiteList tokens",
        "ru": "Проверьте корректность всех полей, корректность адреса токена и отсутствие токена в таблице уже добавленных в WhiteList токенов"
    },
    "AdminDashboardWhitelist": {
        "en": "Add to whitelist",
        "ru": "Добавить в белый список"
    },
    "AdminDashboardTableToken": {
        "en": "Token",
        "ru": "Токен"
    },
    "AdminDashboardTableOwner": {
        "en": "Project’s wallet",
        "ru": "Кошелек проекта"
    },
    "AdminDashboardTableSymbol": {
        "en": "Symbol",
        "ru": "Символ"
    },
    "AdminDashboardTableName": {
        "en": "Name",
        "ru": "Название"
    },
    "AdminDashboardTableDecimals": {
        "en": "Decimals",
        "ru": "Десятичные"
    },
    "AdminDashboardTableFeeTokens": {
        "en": "Fee (tokens)",
        "ru": "Сбор в токенах"
    },
    "AdminDashboardTableFeeEth": {
        "en": "Fee (ETH)",
        "ru": "Сбор в эфире"
    },
    "AdminDashboardTableWTokenSaleFeePercent": {
        "en": "Commission from the sale of tokens",
        "ru": "Комиссия с продажи токенов"
    },
    "AdminDashboardTableTrancheFeePercent": {
        "en": "Commission for the withdrawal of project funds from the fund",
        "ru": "Комиссия при выводе средств проектом из фонда"
    },
    "InvestorDashboard": {
        "en": "Investor Dashboard",
        "ru": "Панель инструментов инвестора"
    },
    "InvestorDashboardLoadLedger": {
        "en": "Loading smart contracts...",
        "ru": "Загрузка смарт-контрактов..."
    },
    "InvestorDashboardLoadTokens": {
        "en": "Loading a list of tokens...",
        "ru": "Загрузка списка токенов..."
    },
    "InvestorDashboardShortName": {
        "en": "Short name of the token",
        "ru": "Краткое название токена"
    },
    "InvestorDashboardFullName": {
        "en": "Full name of the token",
        "ru": "Полное название токена"
    },
    "InvestorDashboardShortWName": {
        "en": "Short name of secure token",
        "ru": "Краткое название защищённого токена"
    },
    "InvestorDashboardFullWName": {
        "en": "The full name of secure token",
        "ru": "Полное название защищённого токена"
    },
    "InvestorDashboardStatus": {
        "en": "Status",
        "ru": "Статус"
    },
    "InvestorDashboardStartDate": {
        "en": "Date and time of the tokens sale start",
        "ru": "Дата и время начала продажи токенов"
    },
    "InvestorDashboardEndDate": {
        "en": "Date and time of the tokens sale end",
        "ru": "Дата и время окончания продажи токенов"
    },
    "InvestorDashboardTotalTokens": {
        "en": "Total number of secure tokens",
        "ru": "Общее количество защищённых токенов"
    },
    "InvestorDashboardTokensSold": {
        "en": "Number of secure tokens sold",
        "ru": "Количество проданных защищенных токенов"
    },
    "InvestorDashboardShareSoldTokens": {
        "en": "Share of secure tokens sold",
        "ru": "Доля проданных защищённых токенов"
    },
    "InvestorDashboardTokensOnSale": {
        "en": "The number of protected tokens on sale",
        "ru": "Кол-во защищенных токенов, которое осталось в продаже"
    },
    "InvestorDashboardPrice": {
        "en": "The cost of one {WToken} token",
        "ru": "Стоимость одного токена {WToken}"
    },
    "InvestorDashboardDiscountPercent": {
        "en": "Discount on {WToken} in %",
        "ru": "Скидка на {WToken} в %"
    },
    "InvestorDashboardPriceOneDiscount": {
        "en": "The cost of one {WToken} token, including discount",
        "ru": "Стоимость одного токена {WToken} с учетом текущей скидки"
    },
    "InvestorDashboardCountdown": {
        "en": "Number of days, hours, minutes of the current discount validity",
        "ru": "Кол-во дней, часов, минут до окончания действия текущей скидки"
    },
    "InvestorDashboardDiscounts": {
        "en": "Discounts",
        "ru": "Скидки"
    },
    "InvestorDashboardDiscountsStages": {
        "en": "Crowdsale stage (UTC)",
        "ru": "Стадии (UTC)"
    },
    "InvestorDashboardDiscountsStagePercent": {
        "en": "Stage discount",
        "ru": "Скидка"
    },
    "InvestorDashboardDiscountsEthAmount": {
        "en": "ETH amount",
        "ru": "Сумма ETH"
    },
    "InvestorDashboardDiscountsVolumeBonus": {
        "en": "Volume bonus",
        "ru": "Бонус от объема"
    },
    "InvestorDashboardDiscountsTokenAmountVolumeBonus": {
        "en": "Number of Token including volume bonus",
        "ru": "Количество токенов с бонусом объема"
    },
    "InvestorDashboardDiscountsGainTotalPercent": {
        "en": "W-tokens gain, total (%)",
        "ru": "Коэффициент усиления W-токенов, всего (%)"
    },
    "InvestorDashboardCalculator": {
        "en": "Buy tokens {WToken}",
        "ru": "Купить токены {WToken}"
    },
    "InvestorDashboardCalculatorTokenAddress": {
        "en": "Token address:",
        "ru": "Адрес токена:"
    },
    "InvestorDashboardCalculatorTokenName": {
        "en": "Token name:",
        "ru": "Название токена:"
    },
    "InvestorDashboardCalculatorTokenSymbol": {
        "en": "Token symbol:",
        "ru": "Символ токена:"
    },
    "InvestorDashboardCalculatorTokenAmountPlaceholder": {
        "en": "Token amount",
        "ru": "Количество токенов"
    },
    "InvestorDashboardCalculatorDiscount": {
        "en": "Discount:",
        "ru": "Скидка:"
    },
    "InvestorDashboardCalculatorBonus": {
        "en": "Bonus:",
        "ru": "Бонус"
    },
    "InvestorDashboardCalculatorTotalBuy": {
        "en": "Total buy:",
        "ru": "Всего к покупке:"
    },
    "InvestorDashboardCalculatorBuy": {
        "en": "Buy",
        "ru": "Купить"
    },
    "InvestorDashboardExchangeTokens": {
        "en": "Exchange {WToken} for {Token}",
        "ru": "Обмен {WToken} на {Token}"
    },
    "InvestorDashboardExchangeTokensCourse": {
        "en": "Exchange rate 1 {WToken}",
        "ru": "Курс обмена 1 {WToken}"
    },
    "InvestorDashboardExchangeTokensBalance": {
        "en": "{WToken} Balance",
        "ru": "Баланс {WToken}"
    },
    "InvestorDashboardExchangeTokensUnVestingBalance": {
        "en": "Vested balance {WToken}",
        "ru": "Размороженный баланс {WToken}"
    },
    "InvestorDashboardExchangeTokensAmount": {
        "en": "Enter the number of {WToken}:",
        "ru": "Укажите количество {WToken}:"
    },
    "InvestorDashboardExchangeTokensAmountPlaceholder": {
        "en": "Token amount",
        "ru": "Количество токенов"
    },
    "InvestorDashboardExchangeTokensMessagesBeforeApprove": {
        "en": "This amount will result in return of:",
        "ru": "Данное количество позволит вернуть:"
    },
    "InvestorDashboardExchangeTokensApprove": {
        "en": "Approve",
        "ru": "Разрешить обмен"
    },
    "InvestorDashboardExchangeTokensMessagesBeforeSwap": {
        "en": "Exchange {allowance} {WToken} for {allowance} {Token}?",
        "ru": "Обменять {allowance} {WToken} на {allowance} {Token}?"
    },
    "InvestorDashboardExchangeTokensDecrease": {
        "en": "Cancel",
        "ru": "Отменить"
    },
    "InvestorDashboardExchangeTokensExchange": {
        "en": "Exchange",
        "ru": "Обменять"
    },
    "InvestorDashboardRefundEth": {
        "en": "REFUND. Return: {WToken}, get: ETH",
        "ru": "REFUND. Вернуть: {WToken}, получить: ETH"
    },
    "InvestorDashboardRefundEthInfoVolumeFrozen": {
        "en": "Volume of frozen tokens",
        "ru": "Объем замороженных токенов"
    },
    "InvestorDashboardRefundEthInfoAvailableReturn": {
        "en": "The volume of tokens available to return",
        "ru": "Объем доступных к возврату токенов"
    },
    "InvestorDashboardRefundEthInfoReturnOne": {
        "en": "Number of funds that can return 1 {WToken} to the nearest interval of the refund dates",
        "ru": "Кол-во средств, которые может вернуть 1 {WToken} в ближайший интервал дат возврата средств"
    },
    "InvestorDashboardRefundEthInfoInitial": {
        "en": "The cost of the initial purchase of 1 {WToken}",
        "ru": "Стоимость первоначальной покупки 1 {WToken}"
    },
    "InvestorDashboardRefundEthInfoFundBalance": {
        "en": "Fund balance",
        "ru": "Баланс фонда хранения средств"
    },
    "InvestorDashboardRefundEthInfoFundReturn": {
        "en": "% fund return",
        "ru": "% возврата фонда"
    },
    "InvestorDashboardRefundEthInfoBalance": {
        "en": "{WToken} balance on the currently selected Metamask account",
        "ru": "Баланс {WToken} на текущем выбранном аккаунте в Metamask"
    },
    "InvestorDashboardRefundEthInfoAllSold": {
        "en": "The cost of all {WToken} on the currently selected Metamask account:",
        "ru": "Все {WToken} на текущем выбранном аккаунте в Metamask можно продать за:"
    },
    "InvestorDashboardRefundEthCalculator": {
        "en": "Enter the number of {WToken}:",
        "ru": "Укажите количество {WToken}:"
    },
    "InvestorDashboardRefundEthCalculatorTokenAmountPlaceholder": {
        "en": "Token amount",
        "ru": "Количество токенов"
    },
    "InvestorDashboardRefundEthCalculatorMessage": {
        "en": "This amount will allow to return:",
        "ru": "Данное количество позволит вернуть:"
    },
    "InvestorDashboardRefundEthApprove": {
        "en": "Allow refund",
        "ru": "Разрешить возврат"
    },
    "InvestorDashboardRefundEthMessagesBeforeRefund": {
        "en": "Exchange {allowance} {WToken} for {refundAmount} ETH?",
        "ru": "Обменять {allowance} {WToken} на {refundAmount} ETH?"
    },
    "InvestorDashboardRefundEthDecreaseRefund": {
        "en": "Сancel",
        "ru": "Отменить"
    },
    "InvestorDashboardRefundEthTokensRefund": {
        "en": "Exchange",
        "ru": "Обменять"
    },
    "ProjectDashboard": {
        "en": "Project Dashboard",
        "ru": "Панель инструментов проекта"
    },
    "ProjectDashboardLoadLedger": {
        "en": "Loading smart contracts...",
        "ru": "Загрузка смарт-контрактов..."
    },
    "ProjectDashboardLoadSearchToken": {
        "en": "Search tokens ...",
        "ru": "Поиск токена..."
    },
    "ProjectDashboardLoadExpect": {
        "en": "Expect...",
        "ru": "Ожидайте..."
    },
    "ProjectDashboardSelectToken": {
        "en": "Select a token",
        "ru": "Выберите токен"
    },
    "ProjectDashboardSymbol": {
        "en": "Symbol:",
        "ru": "Символ:"
    },
    "ProjectDashboardDecimals": {
        "en": "Decimals",
        "ru": "Десятичные"
    },
    "ProjectDashboardFeeTokens": {
        "en": "Fee (tokens)",
        "ru": "Сбор (в токенах)"
    },
    "ProjectDashboardFeeEth": {
        "en": "Fee (ETH)",
        "ru": "Сбор (в эфире)"
    },
    "ProjectDashboardStageWhitelist": {
        "en": "Contact W12 to whitelist your token",
        "ru": "Связаться с W12, чтобы добавить токен в белый список"
    },
    "ProjectDashboardStageWhitelistStatusWhitelisted": {
        "en": "Whitelisted",
        "ru": "В белом списке"
    },
    "ProjectDashboardStageWhitelistStatusNotWhitelisted": {
        "en": "Not whitelisted",
        "ru": "Нет в белом списке"
    },
    "ProjectDashboardStageApprove": {
        "en": "Approve tokens to place",
        "ru": "Утвердить размещение токенов"
    },
    "ProjectDashboardStageApproveStatusPending": {
        "en": "Pending",
        "ru": "В ожидании"
    },
    "ProjectDashboardStageApproveStatusApproved": {
        "en": "Approved",
        "ru": "Утвержденный"
    },
    "ProjectDashboardStageApproveSpendFrom": {
        "en": "Spend from:",
        "ru": "Проведите от:"
    },
    "ProjectDashboardStageApproveAmountLabel": {
        "en": "Amount",
        "ru": "Количество"
    },
    "ProjectDashboardStageApproveAmountPlaceholder": {
        "en": "Max: {ownerBalance}",
        "ru": "Максимум: {ownerBalance}"
    },
    "ProjectDashboardStageApproveButton": {
        "en": "Approve",
        "ru": "Разрешить"
    },
    "ProjectDashboardStagePlace": {
        "en": "Place Tokens to Listing",
        "ru": "Добавить токены в листинг"
    },
    "ProjectDashboardStagePlaceStatusPending": {
        "en": "Pending",
        "ru": "В ожидании"
    },
    "ProjectDashboardStagePlaceStatusPlaced": {
        "en": "Placed",
        "ru": "Размещены"
    },
    "ProjectDashboardStagePlaceAmountLabel": {
        "en": "Place Amount",
        "ru": "Разместить токены"
    },
    "ProjectDashboardStagePlaceAmountPlaceholder": {
        "en": "Max: {tokensAmount}",
        "ru": "Максимум: {tokensAmount}"
    },
    "ProjectDashboardStagePlaceButton": {
        "en": "Place",
        "ru": "Разместить"
    },
    "ProjectDashboardStageConfigureCrowdsale": {
        "en": "Configure Crowdsale",
        "ru": "Настройка Crowdsale"
    },
    "ProjectDashboardStageConfigureCrowdsaleStatusPending": {
        "en": "Pending",
        "ru": "В ожидании"
    },
    "ProjectDashboardStageConfigureCrowdsaleStatusInitialized": {
        "en": "Initialized",
        "ru": "Инициализирован"
    },
    "ProjectDashboardStageConfigureCrowdsaleStartDateLabel": {
        "en": "Start date",
        "ru": "Дата начала"
    },
    "ProjectDashboardStageConfigureCrowdsalePrice": {
        "en": "Base token price",
        "ru": "Стоимость базового токена"
    },
    "ProjectDashboardStageConfigureCrowdsaleAmountForSaleLabel": {
        "en": "On sale",
        "ru": "Количество для продажи"
    },
    "ProjectDashboardStageConfigureCrowdsaleInitButton": {
        "en": "Configure",
        "ru": "Конфигурировать"
    },
    "ProjectDashboardStageConfigureCrowdsaleAddTokensLabel": {
        "en": "Добавить токены в краудсейл",
        "ru": "Add tokens to the crowdsdale"
    },
    "ProjectDashboardStageConfigureCrowdsaleAddButton": {
        "en": "Add",
        "ru": "Добавить"
    },
    "ProjectDashboardStageBonuses": {
        "en": "Configure Crowdsale Bonuses",
        "ru": "Настройка бонусов краудсейла"
    },
    "ProjectDashboardStageBonusesStage": {
        "en": "Stage",
        "ru": "Стадия"
    },
    "ProjectDashboardStageBonusesStartDateLabel": {
        "en": "Start Date",
        "ru": "Дата начала"
    },
    "ProjectDashboardStageBonusesRemove": {
        "en": "Remove stage",
        "ru": "Удалить стадию"
    },
    "ProjectDashboardStageBonusesEndDateLabel": {
        "en": "End date",
        "ru": "Дата окончания"
    },
    "ProjectDashboardStageBonusesDiscountLabel": {
        "en": "Discount",
        "ru": "Скидка"
    },
    "ProjectDashboardStageBonusesVestingDateLabel": {
        "en": "Vesting Date",
        "ru": "Дата разморозки"
    },
    "ProjectDashboardStageBonusesVolume": {
        "en": "Volume bonuses",
        "ru": "Бонусы от объема"
    },
    "ProjectDashboardStageBonusesFromEth": {
        "en": "From (ETH)",
        "ru": "От (ETH)"
    },
    "ProjectDashboardStageBonusesBonus": {
        "en": "Bonus",
        "ru": "Бонус"
    },
    "ProjectDashboardStageBonusesAddButton": {
        "en": "Add",
        "ru": "Добавить"
    },
    "ProjectDashboardStageBonusesSaveButton": {
        "en": "Save",
        "ru": "Сохранить"
    },
    "ProjectDashboardStageBonusesAddStageButton": {
        "en": "Add stage",
        "ru": "Добавить стадию"
    },
    "ProjectDashboardStageBonusesSaveStagesButton": {
        "en": "Save stages",
        "ru": "Сохранить стадии"
    },
    "Milestones": {
        "en": "Milestones",
        "ru": "Основные этапы"
    },
    "MilestonesAdd": {
        "en": "Add Milestone",
        "ru": "Добавить Milestone"
    },
    "MilestonesName": {
        "en": "Stage name",
        "ru": "Название этапа"
    },
    "MilestonesDescription": {
        "en": "Stage description",
        "ru": "Описание этапа"
    },
    "MilestonesTranche": {
        "en": "The amount of funds allocated to the project at the end of the stage in case the majority votes pro",
        "ru": "Количество средств, выделяемых проекту по окончании этапа в случае позитивного голосования"
    },
    "MilestonesRelativeTotal": {
        "en": "% of total",
        "ru": "% от общего количества"
    },
    "MilestonesDelete": {
        "en": "Delete stage",
        "ru": "Удалить этап"
    },
    "MilestonesDate": {
        "en": "Date of completion",
        "ru": "Дата завершения этапа"
    },
    "MilestonesDateEndVoting": {
        "en": "The date of the end of voting on stage completion",
        "ru": "Дата окончания голосования о завершении этапа"
    },
    "MilestonesDateEndWithdrawal": {
        "en": "End date of withdrawal in case majority votes contre",
        "ru": "Дата окончания вывода средств в случае негативного голосования"
    },
    "MilestonesSend": {
        "en": "Save Milestones to blockchain",
        "ru": "Сохранить этапы"
    },
    "trancheInformation": {
        "en": "Get ETH",
        "ru": "Получение ETH"
    },
    "trancheInformationFundBalance": {
        "en": "Fund balance",
        "ru": "Баланс фонда хранения средств"
    },
    "trancheInformationDateNextTranche": {
        "en": "Date and time of the next tranche",
        "ru": "Дата и время получения следующего транша"
    },
    "trancheInformationFundsMoment": {
        "en": "Currently available funds",
        "ru": "Средства, доступные для получения на данный момент"
    },
    "trancheInformationReceive": {
        "en": "Receive",
        "ru": "Получить"
    },
    "Receiving": {
        "en": "Receive {Token}",
        "ru": "Получение {Token}"
    },
    "ReceivingUnsold": {
        "en": "Unsold {Token} available for return",
        "ru": "Непроданные {Token}, доступные для возврата на данный момент"
    },
    "ReceivingRemaining": {
        "en": "{Token} backing {WToken}",
        "ru": "{Token}, оставшиеся в обеспечение {WToken}"
    },
    "ReceivingAfterExchanging": {
        "en": "{Token} relieved after are fully backed {WToken}",
        "ru": "{Token} токены, не участвующие в обеспечание {WToken}"
    },
    "ReceivingTotal": {
        "en": "TOTAL {Token} is available for return:",
        "ru": "ВСЕГО доступно {Token} для возврата:"
    },
    "ReceivingGetUnsold": {
        "en": "Get unsold {WToken}",
        "ru": "Получить непроданные {WToken}"
    },
    "ExchangeTokensProjects": {
        "en": "Exchange {Balance} {WToken} to {Balance} {Token}",
        "ru": "Обмен {Balance} {WToken} на {Balance} {Token}"
    },
    "ExchangeTokensProjectsApprove": {
        "en": "Approve amount of tokens to exchange",
        "ru": "Разрешить обмен"
    },
    "ExchangeTokensProjectsMessagesBeforeSwap": {
        "en": "Exchange {allowance} {WToken} for {allowance} {Token}?",
        "ru": "Обменять {allowance} {WToken} на {allowance} {Token}?"
    },
    "ExchangeTokensProjectsDecrease": {
        "en": "Cancel",
        "ru": "Отменить"
    },
    "ExchangeTokensProjectsExchange": {
        "en": "Exchange",
        "ru": "Обменять"
    },
    "ProjectDashboardStageApproveNoTokens": {
        "en": "No tokens on balance",
        "ru": "Нет токенов на балансе"
    },
    "ProjectDashboardStageApproveInsufficientTokens": {
        "en": "Insufficient tokens",
        "ru": "Недостаточно токенов"
    },
    "ProjectDashboardStagePlaceCongratulations": {
        "en": "Congratulations, {amount} {symbol} was successfully released, specify Crowdsale parameters for sale",
        "ru": "Поздравляем, было успешно выпущено {amount} {symbol}, укажите параметры Crowdsale для продажи"
    },
    "ProjectDashboardStagePlaceErrorAmount": {
        "en": "The specified amount, the higher the number of tokens allowed to write-off",
        "ru": "Указанное количество, превышает количество токенов, разрешенных к списанию"
    },
    "MilestoneTitle": {
        "en": "Stage",
        "ru": "Этап"
    },
    "GeneralTitle": {
        "en": "W12 Product v.1.0 in Rinkeby Test Network with Blockchain UI",
        "ru": "W12 Product v.1.0 в тестовой сети Rinkeby с пользовательским Blockchain UI"
    },
    "WaitingConfirm": {
        "en": "We are waiting for transaction confirmation",
        "ru": "Ожидаем подтверждение транзакции"
    },
    "ERROR_METAMASK_NOT_INSTALLED": {
        "en": "Please install Metamask to your browser",
        "ru": "Установите Метамаск в свой браузер"
    },
    "ERROR_METAMASK_IS_BLOCKED": {
        "en": "Metamask is locked  please, unlock Metamask",
        "ru": "Метамаск заблокирован, пожалуйста разблокируйте метамаск"
    },
    "ERROR_METAMASK_IS_RINKEBY_NETWORK": {
        "en": "Please connect to the Rinkeby network",
        "ru": "Пожалуйста подключитесь к сети Rinkeby"
    },
}