// const lang = "ru";
// const VocabularyScript = {
//     "TokensFactoryTitle": {
//         "en": "Factory tokens",
//         "ru": "Фабрика токенов"
//     },
//     "TokensFactoryCreate": {
//         "en": "Create",
//         "ru": "Создать"
//     },
//     "TokensFactoryCreateFormName": {
//         "en": "Name",
//         "ru": "Название"
//     },
//     "TokensFactoryCreateFormSymbol": {
//         "en": "Symbol",
//         "ru": "Символ"
//     },
//     "TokensFactoryCreateFormDecimals": {
//         "en": "Decimals",
//         "ru": "Количество десятичных знаков после запятой"
//     },
//     "TokensFactoryCreateFormAmount": {
//         "en": "Amount",
//         "ru": "Количество"
//     },
//     "HeaderByuW12Tokens": {
//         "en": "BUY W12 TOKENS",
//         "ru": "КУПИТЬ W12 TOKENS"
//     },
//
//     "TokenInfoAddress": {
//         "en": "Token Address",
//         "ru": "Адрес токена"
//     },
//     "TokenInfoOwner": {
//         "en": "Project’s wallet",
//         "ru": "Кошелек проекта"
//     },
//     "TokenInfoName": {
//         "en": "Name",
//         "ru": "Название"
//     },
//     "TokenInfoSymbol": {
//         "en": "Symbol",
//         "ru": "Символ"
//     },
//     "TokenInfoDecimals": {
//         "en": "Decimals",
//         "ru": "Количество десятичных знаков после запятой"
//     },
//     "TokenInfoFeeTokens": {
//         "en": "Fee (tokens)",
//         "ru": "Сбор (в токенах)"
//     },
//     "TokenInfoFeeEth": {
//         "en": "Commission from the sale of tokens",
//         "ru": "Комиссия с продажи токенов"
//     },
//     "TokenInfoTrancheFeePercent": {
//         "en": "Commission for the withdrawal of project funds from the fund",
//         "ru": "Комиссия при выводе средств проектом из фонда"
//     },
//     "HomeDescrInfo1": {
//         "en": "This stand was created for convenient testing of product functions by auditors, projects, community W12.",
//         "ru": "Этот стенд создан для удобного тестирования функций продукта аудиторами, проектами, комьюнити W12."
//     },
//     "HomeDescrInfo2": {
//         "en": "The Smart W12 product contracts in the test network of the Etherium (Rinkeby) and the test ETH is used to purchase the tokens. To test the work of all the basic functions, you need to <b> go through all the steps in the table </b> below.",
//         "ru": "Смарт контракты продукта W12 задеплоины в тестовой сети Эфириума (Rinkeby) и для покупки токенов используется тестовый ETH. Чтобы протестировать работу всех основных функций, вам необходимо <b>пройти через все шаги в таблице </b>ниже."
//     },
//     "HomeStepsHeading": {
//         "en": "Steps for testing the product",
//         "ru": "Шаги тестирования продукта"
//     },
//     "HomeStepsNumber": {
//         "en": "Step number",
//         "ru": "№ шага"
//     },
//     "HomeStepsName": {
//         "en": "Function name",
//         "ru": "Название функции"
//     },
//     "HomeStepsRole": {
//         "en": "Role",
//         "ru": "Роль"
//     },
//     "HomeStepsNum1": {
//         "en": "Installing MetaMask",
//         "ru": "Установка MetaMask"
//     },
//     "HomeStepsProject": {
//         "en": "project",
//         "ru": "проект"
//     },
//     "HomeStepsBuyerTokens": {
//         "en": "buyer tokens",
//         "ru": "покупатель токенов"
//     },
//     "HomeStepsAdmin": {
//         "en": "W12 administrator",
//         "ru": "администратор W12"
//     },
//     "HomeStepsNum2": {
//         "en": "Getting the test ETH",
//         "ru": "Получение тестового ETH"
//     },
//     "HomeStepsForMetamask": {
//         "en": "A crypto-currency wallet-plug-in <br> for browsers Chrome, Firefox, Opera, Brave",
//         "ru": "Криптовалютный кошелёк-плагин <br>для браузеров Chrome, Firefox, Opera, Brave"
//     },
//     "HomeStepsForTest": {
//         "en": "for testing functions <br> customer tokens",
//         "ru": "для тестирования функций <br>покупателя токенов"
//     },
//     "HomeStepsNum3": {
//         "en": "Issue of project tokens",
//         "ru": "Выпуск токенов проектом"
//     },
//     "HomeStepsNum4": {
//         "en": "Adding a token to<br> a project in the white list",
//         "ru": "Добавление токена<br>проекта в белый список"
//     },
//     "HomeStepsNum5": {
//         "en": "Setting up the sale of tokens",
//         "ru": "Настройка продажи токенов"
//     },
//     "HomeStepsSale": {
//         "en": "date of sale of tokens, discounts and other",
//         "ru": "даты продажи токенов, <br>скидки и другое"
//     },
//     "HomeStepsNum6": {
//         "en": "Buying tokens",
//         "ru": "Покупка токенов"
//     },
//     "HomeStepsNum7": {
//         "en": "Refund of funds from the fund project",
//         "ru": "Возврат средств <br>из фонда проект"
//     },
//     "HomeStepsNum8": {
//         "en": "Exchange W-tokens for Original Tokens",
//         "ru": "Обмен W-tokens<br>на Original Tokens"
//     },
//     "HomeStepsNum9": {
//         "en": "Receipt of funds by the project after the end of the road map phase",
//         "ru": "Получение средств<br>проектом после окончания<br>этапа дорожной карты"
//     },
//     "HomeStepsNum10": {
//         "en": "Returning project tokens",
//         "ru": "Возврат токенов проектом"
//     },
//     "HomeBenefits": {
//         "en": "Advantages of the technical solution W12",
//         "ru": "Преимущества технического решения W12"
//     },
//     "HomeBenefitsMaxFlexibility": {
//         "en": "Maximum flexibility",
//         "ru": "Максимальная гибкость"
//     },
//     "HomeBenefits1": {
//         "en": "The project can independently issue markers and sell only part of its tokens on the W12 platform in accordance with the protected model. This will allow the W12 platform to quickly begin selling tokens of a large number of ICO-projects, buyers of tokens a large assortment and quickly occupy a large share of the ICO market.",
//         "ru": "Проект может самостоятельно выдавать маркеры и продавать только часть своих токенов на платформе W12 в соответствии с защищенной моделью. Это позволит платформе W12 быстро начать продавать токены большого количества ICO-проекты, покупатели токенов большой ассор-тимент и быстро занять большую долю ICO рынка."
//     },
//     "HomeBenefits2": {
//         "en": "The project can implement almost any logic for its token sale (by setting any intervals for sale rounds, discounts and bonuses, of the period of freezing purchased tokens).",
//         "ru": "Проект может реализовать практически любую логику для его продажи токенов (путем установки каких-либо интервалов для раундов продажи, скидок и бонусов, периода замораживания купленных жетонов)."
//     },
//     "HomeBenefits3": {
//         "en": "The project can issue tokens on the W12 platform and sell part of the tokens independently (for ex-ample, on its website). Due to what any project will have the opportunity not to write and auditing smart contracts crowdsale and to release tokens for free.",
//         "ru": "Проект может выдавать маркеры на платформе W12 и продавать часть жетонов самостоятельно (например, на своем веб-сайте). За счет чего любой проект будет иметь возможность не писать и не слушать-ровать смарт контракты crowdsale и выпустить токены бесплатно."
//     },
//     "HomeBenefits4": {
//         "en": "In the next versions of the product, the project can choose which cryptocurrencies to store money in the project fund (for example, you can store money in stable coins to reduce volatility); the higher the fraction of this money that is stored as W12 tokens, the lower the platform for the project.",
//         "ru": "В следующих версиях продукта проект может выбрать, какие криптовалюты хранить деньги в проектном фонде (например, вы можете хранить деньги в стабильных монетах для снижения волатильности); чем выше доля этих денег, которые хранятся в качестве токенов W12, тем ниже платформа для проекта."
//     },
//     "HomeBenefits5": {
//         "en": "Cross-block solution",
//         "ru": "Кросс-блокчейн решение"
//     },
//     "HomeBenefits6": {
//         "en": "The first product version (already developed) works based on the Ethereum blockchain. A crossblockchain solution will be implemented on the W12 platform along with the growth of populari-ty among the projects of other blockchains that allow creation of smart contracts for the ICO.",
//         "ru": "Первая версия продукта (уже разработанная) работает на основе блок-цепи Ethereum. Решение Crossblockchain будет реализовано на платформе W12 наряду с ростом популярности среди проектов других блоков, которые позволяют создавать интеллектуальные контракты для ICO."
//     },
//     "HomeBenefits7": {
//         "en": "Fully on-chain solution",
//         "ru": "Полностью on-chain решение"
//     },
//     "HomeBenefits8": {
//         "en": "When the product works, all operations take place in the blockroom. This makes the process of selling tokens transparent, easily audited and eliminates the need to trust a third party.",
//         "ru": "При работе продукта все операции происходят в блокчейне. Это делает процесс продажи токенов прозрачным, легко аудируемым и исключает необходимость доверять третьей стороне."
//     },
//     "HomeBenefits9": {
//         "en": "Integrability",
//         "ru": "Интегрируемость"
//     },
//     "HomeBenefits10": {
//         "en": "The W12 product is easily integrated into project sites and third-party platforms.",
//         "ru": "Продукт W12 легко интегрируется в сайты проектов и сторонние платформы."
//     },
//     "HomeVersions": {
//         "en": "Product Versions",
//         "ru": "Версии продукта"
//     },
//     "HomeVersionsVersionProduct": {
//         "en": "product<br>version",
//         "ru": "версия<br>продукта"
//     },
//     "HomeVersionsMainFunction": {
//         "en": "The main functions of the product",
//         "ru": "Основные функции продукта"
//     },
//
//     "HomeVersionsAdditionalFunctions": {
//         "en": "Additional functions",
//         "ru": "Дополнительные функции"
//     },
//     "HomeVersions1Func1": {
//         "en": "Supported blockhouses: Ethereum",
//         "ru": "Поддерживаемые блокчейны: Ethereum"
//     },
//     "HomeVersions1Func2": {
//         "en": "Supported project tokens: ERC20",
//         "ru": "Поддерживаемые токены проектов: ERC20"
//     },
//     "HomeVersions1Func3": {
//         "en": "Purchase tokens with: ETH",
//         "ru": "Покупка токенов с помощью: ETH"
//     },
//     "HomeVersions1Func4": {
//         "en": "Storage of funds in the project fund: ETH",
//         "ru": "Хранение средств в фонде проекта: ETH"
//     },
//     "HomeVersions1Func5": {
//         "en": "Issuance of funds to the project: ETH",
//         "ru": "Выдача средств проекту: ETH"
//     },
//     "HomeVersions1Func6": {
//         "en": "Type of project fund: fund number 1 (each user)",
//         "ru": "Тип фонда проекта: фонд №1 (каждый пользователь)"
//     },
//     "HomeVersions1Func7": {
//         "en": "Purchase of tokens with: W12, ERC20 stable coins, liquid ECR20 tokens",
//         "ru": "Покупка токенов с помощью: W12, ERC20 stable coins, ликвидных ECR20 tokens"
//     },
//     "HomeVersions1Func8": {
//         "en": "Storage of funds in the project fund: W12 token, ERC20 stable coins, liquid ECR20 tokens",
//         "ru": "Хранение средств в фонде проекта: W12 token, ERC20 stable coins, ликвидных ECR20 tokens"
//     },
//     "HomeVersions1Func9": {
//         "en": "Issuance of funds to the project: the currencies in which the funds are held in the project fund",
//         "ru": "Выдача средств проекту: валюты в которых хранятся средства в фонде проекта"
//     },
//     "HomeVersions1Func10": {
//         "en": "The ability for projects to store any part of the fund in W12 tokens (and thereby reduce the commission of the service)",
//         "ru": "Возможность для проектов хранить любую часть средств фонда в токенах W12 (и за счёт этого снижать комиссию сервиса)"
//     },
//     "HomeVersions1Func11": {
//         "en": "Purchase of tokens with: BTC, LTC and other popular crypto currency using the built-in crypto currency exchanger",
//         "ru": "Покупка токенов с помощью: BTC, LTC и других популярных криптовалют с помощью встроенного криптовалютного обменника"
//     },
//     "HomeVersions1Func12": {
//         "en": "Type of fund: fund number 2 (the decision is accepted by oracles)",
//         "ru": "Тип фонда: фонд №2 (решение принимается оракулами)"
//     },
//     "HomeVersions1Func13": {
//         "en": "Purchase of tokens with: credit cards (Visa, MasterCard, UnionPay, JCB), and bank transfers (SWIFT, SEPA)",
//         "ru": "Покупка токенов с помощью: кредитных карточек (Visa, MasterCard, UnionPay, JCB), и банковских переводов (SWIFT, SEPA)"
//     },
//     "HomeVersions1Func14": {
//         "en": "Issuance of funds to the project: bank transfer to the company's current account\n",
//         "ru": "Выдача средств проекту: банковский перевод на расчетный счёт компании"
//     },
//     "HomeVersions1Func15": {
//         "en": "Fund type: fund number 3 (the decision is made by voting buyers of tokens)",
//         "ru": "Тип фонда: фонд №3 (решение принимается голосованием покупателей токенов)"
//     },
//     "HomeVersions1Func16": {
//         "en": "The ability to quickly integrate the product into project sites",
//         "ru": "Возможность быстрой интеграции продукта в сайты проектов"
//     },
//     "HomeVersions1Func17": {
//         "en": "The ability to integrate the product into the marketplace",
//         "ru": "Возможность интеграция продукта в маркетплейсы"
//     },
//     "HomeVersions1Func18": {
//         "en": "Cross-block solution for the possibility of using tokens of a standard other than ERC20 (EOS, NEO, NEM, Stellar)",
//         "ru": "Кросс-блокчейн решение для возможности использования токенов стандарта отличного от ERC20 (EOS, NEO, NEM, Stellar)"
//     },
//     "SidebarMenuHowItWorks": {
//         "en": "HOW IT WORKS?",
//         "ru": "КАК ЭТО РАБОТАЕТ?"
//     },
//     "SidebarMenuViewCodeProduct": {
//         "en": "PRODUCT ON GITHUB",
//         "ru": "ПРОДУКТ НА GITHUB"
//     },
//     "SidebarMenuViewCodeUI": {
//         "en": "INTERFACES ON GITHUB",
//         "ru": "ИНТЕРФЕЙСЫ НА GITHUB"
//     },
//     "SidebarMenuGoMarketplace": {
//         "en": "GO TO MARKETPLACE",
//         "ru": "ПЕРЕЙТИ НА МАРКЕТПЛЕЙС"
//     },
//     "SidebarMenuReadWhitePaper": {
//         "en": "READ WHITE PAPER",
//         "ru": "ПРОЧИТАТЬ WHITE PAPER"
//     },
//     "SidebarMenuReadWhitePaperHref": {
//         "en": "https://tokensale.w12.io/W12-en.pdf",
//         "ru": "https://tokensale.w12.io/W12-ru.pdf"
//     },
//     "SidebarMenuTelegram": {
//         "en": "JOIN IN TELEGRAM CHAT",
//         "ru": "ВСТУПИТЬ В TELEGRAM ЧАТ"
//     },
//     "SidebarMenuTelegramHref": {
//         "en": "https://t.me/w12io",
//         "ru": "https://t.me/W12_chat_ru"
//     },
//     "FooterMenu1": {
//         "en": "About icoplate",
//         "ru": "О icoplate"
//     },
//     "FooterMenu2": {
//         "en": "How it Works",
//         "ru": "Как это работает"
//     },
//     "FooterMenu2Url": {
//         "en": "#",
//         "ru": "#"
//     },
//     "FooterMenu3": {
//         "en": "Whitepaper",
//         "ru": "Белая бумага"
//     },
//     "FooterMenu3Url": {
//         "en": "#",
//         "ru": "#"
//     },
//     "FooterMenu4": {
//         "en": "GitHub",
//         "ru": "GitHub"
//     },
//     "FooterMenu4Url": {
//         "en": "#",
//         "ru": "#"
//     },
//     "FooterMenu5": {
//         "en": "Privacy Policy",
//         "ru": "Политика конфиденциальности"
//     },
//     "FooterMenu5Url": {
//         "en": "#",
//         "ru": "#"
//     },
//     "FooterMenu6": {
//         "en": "Terms & Conditions",
//         "ru": "Условия и положения"
//     },
//     "FooterMenu6Url": {
//         "en": "#",
//         "ru": "#"
//     },
//     "FooterMenu7": {
//         "en": "W12 logos",
//         "ru": "W12 логотипы"
//     },
//     "FooterMenu7Url": {
//         "en": "#",
//         "ru": "#"
//     },
//     "FooterMenu8": {
//         "en": "Help",
//         "ru": "Помощь"
//     },
//     "FooterMenu9": {
//         "en": "Support",
//         "ru": "Поддержка"
//     },
//     "FooterMenu9Url": {
//         "en": "#",
//         "ru": "#"
//     },
//     "FooterMenu10": {
//         "en": "Upcoming pre-ICOs",
//         "ru": "Предстоящие до-ИОС"
//     },
//     "FooterMenu10Url": {
//         "en": "#",
//         "ru": "#"
//     },
//     "FooterMenu11": {
//         "en": "Upcoming ICOs",
//         "ru": "Предстоящие ICO"
//     },
//     "FooterMenu11Url": {
//         "en": "#",
//         "ru": "#"
//     },
//     "FooterMenu12": {
//         "en": "Blockchain project ICOs",
//         "ru": "Проект Blockchain ICOs"
//     },
//     "FooterMenu12Url": {
//         "en": "#",
//         "ru": "#"
//     },
//     "FooterMenu13": {
//         "en": "All projects",
//         "ru": "Все проекты"
//     },
//     "FooterMenu13Url": {
//         "en": "#",
//         "ru": "#"
//     },
//     "FooterActionsBrowseProjects": {
//         "en": "Browse projects",
//         "ru": "Просмотр проектов"
//     },
//     "FooterActionsBrowseProjectsUrl": {
//         "en": "#",
//         "ru": "#"
//     },
//     "FooterActionsStartProject": {
//         "en": "Start a project",
//         "ru": "Начать проект"
//     },
//     "FooterActionsStartProjectUrl": {
//         "en": "#",
//         "ru": "#"
//     },
//     "FooterActionsLogIn": {
//         "en": "Log in",
//         "ru": "Вход"
//     },
//     "FooterActionsLogInUrl": {
//         "en": "#",
//         "ru": "#"
//     },
//     "FooterActionsSignUp": {
//         "en": "Sign up",
//         "ru": "Решистрация"
//     },
//     "FooterActionsSignUpUrl": {
//         "en": "#",
//         "ru": "#"
//     },
//     "FooterForm1": {
//         "en": "SIGN UP FOR SPECIAL OFFERS",
//         "ru": "ПОДПИШИТЕСЬ НА СПЕЦИАЛЬНЫЕ ПРЕДЛОЖЕНИЯ"
//     },
//     "FooterForm2": {
//         "en": "Your email address",
//         "ru": "Ваш адрес электронной почты"
//     },
//     "FooterForm3": {
//         "en": "Sign up now",
//         "ru": "Подписаться"
//     },
//     "FooterForm4": {
//         "en": "Private, secure, spam-free",
//         "ru": "Частный, безопасный, без спама"
//     },
//     "FooterFollow": {
//         "en": "follow us",
//         "ru": "Подписывайтесь"
//     },
//     "FooterFollowFacebook": {
//         "en": "#",
//         "ru": "#"
//     },
//     "FooterFollowTelegram": {
//         "en": "#",
//         "ru": "#"
//     },
//     "FooterFollowTwitter": {
//         "en": "#",
//         "ru": "#"
//     },
//     "FooterFollowMedium": {
//         "en": "#",
//         "ru": "#"
//     },
//     "FooterFollowEnvelope": {
//         "en": "#",
//         "ru": "#"
//     },
//     //---
//
//     "ConfigDashboardTitle": {
//         "en": "Config Dashboard",
//         "ru": "Панель конфигурации"
//     },
//     "ConfigDashboardPlaceholder": {
//         "en": "Address of the W12Lister",
//         "ru": "Адрес W12Lister"
//     },
//     "ConfigDashboardSave": {
//         "en": "Save",
//         "ru": "Сохранить"
//     },
//     "AdminDashboard": {
//         "en": "Admin Dashboard",
//         "ru": "Панель управления администратора"
//     },
//     "AdminDashboardWhiteListForm": {
//         "en": "Add to whitelist",
//         "ru": "Добавить в белый список"
//     },
//     "AdminDashboardLoadLedger": {
//         "en": "Loading smart contracts...",
//         "ru": "Загрузка смарт-контрактов..."
//     },
//     "AdminDashboardLoadTokens": {
//         "en": "Loading a list of tokens...",
//         "ru": "Загрузка списка токенов..."
//     },
//     "AdminDashboardListingToken": {
//         "en": "Adding a token to the whitelist...",
//         "ru": "Добавление токена в whitelist..."
//     },
//     "AdminDashboardCheckingToken": {
//         "en": "Checking the token...",
//         "ru": "Проверка токена..."
//     },
//     "AdminDashboardFieldTokenLabel": {
//         "en": "Token Address",
//         "ru": "Адрес токена"
//     },
//     "AdminDashboardFieldTokenPlaceholder": {
//         "en": "Token address with checksum",
//         "ru": "Адрес токена с контрольной суммой"
//     },
//     "AdminDashboardFieldOwnerLabel": {
//         "en": "Owner Address",
//         "ru": "Адрес владельца"
//     },
//     "AdminDashboardFieldOwnerPlaceholder": {
//         "en": "Token owner address",
//         "ru": "Адрес владельца токена"
//     },
//     "AdminDashboardFieldSymbolLabel": {
//         "en": "Symbol",
//         "ru": "Символ"
//     },
//     "AdminDashboardFieldSymbolPlaceholder": {
//         "en": "3-4 letter abbreviation",
//         "ru": "Аббревиатуры 3-4 буквы"
//     },
//     "AdminDashboardFieldDecimalsLabel": {
//         "en": "The number of decimal places after the decimal point",
//         "ru": "Количество десятичных знаков после запятой"
//     },
//     "AdminDashboardFieldDecimalsPlaceholder": {
//         "en": "Default: 18",
//         "ru": "По умолчанию: 18"
//     },
//     "AdminDashboardFieldNameLabel": {
//         "en": "Name",
//         "ru": "Название"
//     },
//     "AdminDashboardFieldNamePlaceholder": {
//         "en": "Descriptive name of the token",
//         "ru": "Название токена"
//     },
//     "AdminDashboardFieldFeeTokensLabel": {
//         "en": "Fee in tokens",
//         "ru": "Сбор в токенах"
//     },
//     "AdminDashboardFieldFeeTokensLabelMessage": {
//         "en": "It is charged at the time of the project's transfer of its tokens for sale through the blocking protocol W12",
//         "ru": "Взимается в момент перевода проектом своих токенов для продажи через блокчейн протокол W12"
//     },
//     "AdminDashboardFieldFeeTokensPlaceholder": {
//         "en": "0 .. 100 percent",
//         "ru": "0 .. 100 процентов"
//     },
//     "AdminDashboardFieldFeeEthLabel": {
//         "en": "Fee in ETH",
//         "ru": "Сбор в эфире"
//     },
//     "AdminDashboardFieldFeeEthLabelMessage": {
//         "en": "Charged at the time of sale of the tokens",
//         "ru": "Взимается в момент продажи токенов"
//     },
//     "AdminDashboardFieldFeeEthPlaceholder": {
//         "en": "0 .. 99.99 percent",
//         "ru": "0 .. 99.99 процентов"
//     },
//     "AdminDashboardFieldWTokenSaleFeePercentLabel": {
//         "en": "Commission in project tokens",
//         "ru": "Комиссия в токенах проекта"
//     },
//     "AdminDashboardFieldWTokenSaleFeePercentLabelMessage": {
//         "en": "Charged at the time of sale of the tokens",
//         "ru": "Взимается в момент продажи токенов"
//     },
//     "AdminDashboardFieldWTokenSaleFeePercentPlaceholder": {
//         "en": "0 .. 99.99 percent",
//         "ru": "0 .. 99.99 процентов"
//     },
//     "AdminDashboardFieldTrancheFeePercentLabel": {
//         "en": "Commission in ETH",
//         "ru": "Комиссия в ETH"
//     },
//     "AdminDashboardFieldTrancheFeePercentLabelMessage": {
//         "en": "It is charged at the time of receipt of funds after the completion of the road map phase",
//         "ru": "Взимается в момент получения средств проектом после окончания этапа дорожной карты"
//     },
//     "AdminDashboardFieldTrancheFeePercentPlaceholder": {
//         "en": "0 .. 99.99 percent",
//         "ru": "0 .. 99.99 процентов"
//     },
//     "AdminDashboardWarning": {
//         "en": "Check the correctness of all fields, the correctness of the address of the token and the absence of a token in the table of the already added to WhiteList tokens",
//         "ru": "Проверьте корректность всех полей, корректность адреса токена и отсутствие токена в таблице уже добавленных в WhiteList токенов"
//     },
//     "AdminDashboardWhitelist": {
//         "en": "Add to whitelist",
//         "ru": "Добавить в белый список"
//     },
//     "AdminDashboardTableToken": {
//         "en": "Token",
//         "ru": "Токен"
//     },
//     "AdminDashboardTableOwner": {
//         "en": "Project’s wallet",
//         "ru": "Кошелек проекта"
//     },
//     "AdminDashboardTableSymbol": {
//         "en": "Symbol",
//         "ru": "Символ"
//     },
//     "AdminDashboardTableIndex": {
//         "en": "Index",
//         "ru": "Индекс"
//     },
//     "AdminDashboardTableName": {
//         "en": "Name",
//         "ru": "Название"
//     },
//     "AdminDashboardTableDecimals": {
//         "en": "Decimals",
//         "ru": "Десятичные"
//     },
//     "AdminDashboardTableFeeTokens": {
//         "en": "Fee (tokens)",
//         "ru": "Сбор в токенах"
//     },
//     "AdminDashboardTableFeeEth": {
//         "en": "Fee (ETH)",
//         "ru": "Сбор в эфире"
//     },
//     "AdminDashboardTableWTokenSaleFeePercent": {
//         "en": "Commission from the sale of tokens",
//         "ru": "Комиссия с продажи токенов"
//     },
//     "AdminDashboardTableTrancheFeePercent": {
//         "en": "Commission for the withdrawal of project funds from the fund",
//         "ru": "Комиссия при выводе средств проектом из фонда"
//     },
//     "AdminDashboardSelectLister": {
//         "en": "Select whitelist version",
//         "ru": "Выберите версию белого списка"
//     },
//     "InvestorDashboard": {
//         "en": "Investor Dashboard",
//         "ru": "Панель инструментов инвестора"
//     },
//     "InvestorDashboardLoadLedger": {
//         "en": "Loading smart contracts...",
//         "ru": "Загрузка смарт-контрактов..."
//     },
//     "InvestorDashboardLoadTokens": {
//         "en": "Loading a list of tokens...",
//         "ru": "Загрузка списка токенов..."
//     },
//     "InvestorDashboardShortName": {
//         "en": "Short name of the token",
//         "ru": "Краткое название токена"
//     },
//     "InvestorDashboardFullName": {
//         "en": "Full name of the token",
//         "ru": "Полное название токена"
//     },
//     "InvestorDashboardShortWName": {
//         "en": "Short name of secure token",
//         "ru": "Краткое название защищённого токена"
//     },
//     "InvestorDashboardFullWName": {
//         "en": "The full name of secure token",
//         "ru": "Полное название защищённого токена"
//     },
//     "InvestorDashboardStatus": {
//         "en": "Status",
//         "ru": "Статус"
//     },
//     "InvestorDashboardStartDate": {
//         "en": "Date and time of the tokens sale start",
//         "ru": "Дата и время начала продажи токенов"
//     },
//     "InvestorDashboardEndDate": {
//         "en": "Date and time of the tokens sale end",
//         "ru": "Дата и время окончания продажи токенов"
//     },
//     "InvestorDashboardTotalTokens": {
//         "en": "Total number of secure tokens",
//         "ru": "Общее количество защищённых токенов"
//     },
//     "InvestorDashboardTokensSold": {
//         "en": "Number of secure tokens sold",
//         "ru": "Количество проданных защищенных токенов"
//     },
//     "InvestorDashboardShareSoldTokens": {
//         "en": "Share of secure tokens sold",
//         "ru": "Доля проданных защищённых токенов"
//     },
//     "InvestorDashboardTokensOnSale": {
//         "en": "The number of protected tokens on sale",
//         "ru": "Кол-во защищенных токенов, которое осталось в продаже"
//     },
//     "InvestorDashboardPrice": {
//         "en": "The cost of one {WToken} token",
//         "ru": "Стоимость одного токена {WToken}"
//     },
//     "InvestorDashboardDiscountPercent": {
//         "en": "Discount on {WToken} in %",
//         "ru": "Скидка на {WToken} в %"
//     },
//     "InvestorDashboardPriceOneDiscount": {
//         "en": "The cost of one {WToken} token, including discount",
//         "ru": "Стоимость одного токена {WToken} с учетом текущей скидки"
//     },
//     "InvestorDashboardCountdown": {
//         "en": "Number of days, hours, minutes of the current discount validity",
//         "ru": "Кол-во дней, часов, минут до окончания действия текущей скидки"
//     },
//     "InvestorDashboardDiscounts": {
//         "en": "Discounts",
//         "ru": "Скидки"
//     },
//     "InvestorDashboardDiscountsStages": {
//         "en": "Crowdsale stage (UTC)",
//         "ru": "Стадии (UTC)"
//     },
//     "InvestorDashboardDiscountsStagePercent": {
//         "en": "Stage discount",
//         "ru": "Скидка"
//     },
//     "InvestorDashboardDiscountsEthAmount": {
//         "en": "ETH amount",
//         "ru": "Сумма ETH"
//     },
//     "InvestorDashboardDiscountsVolumeBonus": {
//         "en": "Volume bonus",
//         "ru": "Бонус от объема"
//     },
//     "InvestorDashboardDiscountsTokenAmountVolumeBonus": {
//         "en": "Number of Token including volume bonus",
//         "ru": "Количество токенов с бонусом объема"
//     },
//     "InvestorDashboardDiscountsGainTotalPercent": {
//         "en": "W-tokens gain, total (%)",
//         "ru": "Коэффициент усиления W-токенов, всего (%)"
//     },
//     "InvestorDashboardCalculator": {
//         "en": "Buy tokens {WToken}",
//         "ru": "Купить токены {WToken}"
//     },
//     "InvestorDashboardCalculatorTokenAddress": {
//         "en": "Token address:",
//         "ru": "Адрес токена:"
//     },
//     "InvestorDashboardCalculatorTokenName": {
//         "en": "Token name:",
//         "ru": "Название токена:"
//     },
//     "InvestorDashboardCalculatorTokenSymbol": {
//         "en": "Token symbol:",
//         "ru": "Символ токена:"
//     },
//     "InvestorDashboardCalculatorTokenAmountPlaceholder": {
//         "en": "Token amount",
//         "ru": "Количество токенов"
//     },
//     "InvestorDashboardCalculatorDiscount": {
//         "en": "Discount:",
//         "ru": "Скидка:"
//     },
//     "InvestorDashboardCalculatorBonus": {
//         "en": "Bonus:",
//         "ru": "Бонус"
//     },
//     "InvestorDashboardCalculatorTotalBuy": {
//         "en": "Total buy:",
//         "ru": "Всего к покупке:"
//     },
//     "InvestorDashboardCalculatorBuy": {
//         "en": "Buy",
//         "ru": "Купить"
//     },
//     "InvestorDashboardExchangeTokens": {
//         "en": "Exchange {WToken} for {Token}",
//         "ru": "Обмен {WToken} на {Token}"
//     },
//     "InvestorDashboardExchangeTokensCourse": {
//         "en": "Exchange rate 1 {WToken}",
//         "ru": "Курс обмена 1 {WToken}"
//     },
//     "InvestorDashboardExchangeTokensBalance": {
//         "en": "{WToken} Balance",
//         "ru": "Баланс {WToken}"
//     },
//     "InvestorDashboardExchangeTokensUnVestingBalance": {
//         "en": "Vested balance {WToken}",
//         "ru": "Размороженный баланс {WToken}"
//     },
//     "InvestorDashboardExchangeTokensAmount": {
//         "en": "Enter the number of {WToken}:",
//         "ru": "Укажите количество {WToken}:"
//     },
//     "InvestorDashboardExchangeTokensAmountPlaceholder": {
//         "en": "Token amount",
//         "ru": "Количество токенов"
//     },
//     "InvestorDashboardExchangeTokensMessagesBeforeApprove": {
//         "en": "This amount will result in return of:",
//         "ru": "Данное количество позволит вернуть:"
//     },
//     "InvestorDashboardExchangeTokensApprove": {
//         "en": "Approve",
//         "ru": "Разрешить обмен"
//     },
//     "InvestorDashboardExchangeTokensMessagesBeforeSwap": {
//         "en": "Exchange {allowance} {WToken} for {allowance} {Token}?",
//         "ru": "Обменять {allowance} {WToken} на {allowance} {Token}?"
//     },
//     "InvestorDashboardExchangeTokensDecrease": {
//         "en": "Cancel",
//         "ru": "Отменить"
//     },
//     "InvestorDashboardExchangeTokensExchange": {
//         "en": "Exchange",
//         "ru": "Обменять"
//     },
//     "InvestorDashboardRefundEth": {
//         "en": "REFUND. Return: {WToken}, get: ETH",
//         "ru": "REFUND. Вернуть: {WToken}, получить: ETH"
//     },
//     "InvestorDashboardRefundEthInfoVolumeFrozen": {
//         "en": "Volume of frozen tokens",
//         "ru": "Объем замороженных токенов"
//     },
//     "InvestorDashboardRefundEthInfoAvailableReturn": {
//         "en": "The volume of tokens available to return",
//         "ru": "Объем доступных к возврату токенов"
//     },
//     "InvestorDashboardRefundEthInfoReturnOne": {
//         "en": "Number of funds that can return 1 {WToken} to the nearest interval of the refund dates",
//         "ru": "Кол-во средств, которые может вернуть 1 {WToken} в ближайший интервал дат возврата средств"
//     },
//     "InvestorDashboardRefundEthInfoInitial": {
//         "en": "The cost of the initial purchase of 1 {WToken}",
//         "ru": "Стоимость первоначальной покупки 1 {WToken}"
//     },
//     "InvestorDashboardRefundEthInfoFundBalance": {
//         "en": "Fund balance",
//         "ru": "Баланс фонда хранения средств"
//     },
//     "InvestorDashboardRefundEthInfoFundReturn": {
//         "en": "% fund return",
//         "ru": "% возврата фонда"
//     },
//     "InvestorDashboardRefundEthInfoBalance": {
//         "en": "{WToken} balance on the currently selected Metamask account",
//         "ru": "Баланс {WToken} на текущем выбранном аккаунте в Metamask"
//     },
//     "InvestorDashboardRefundEthInfoAllSold": {
//         "en": "The cost of all {WToken} on the currently selected Metamask account:",
//         "ru": "Все {WToken} на текущем выбранном аккаунте в Metamask можно продать за:"
//     },
//     "InvestorDashboardRefundEthCalculator": {
//         "en": "Enter the number of {WToken}:",
//         "ru": "Укажите количество {WToken}:"
//     },
//     "InvestorDashboardRefundEthCalculatorTokenAmountPlaceholder": {
//         "en": "Token amount",
//         "ru": "Количество токенов"
//     },
//     "InvestorDashboardRefundEthCalculatorMessage": {
//         "en": "This amount will allow to return:",
//         "ru": "Данное количество позволит вернуть:"
//     },
//     "InvestorDashboardRefundEthApprove": {
//         "en": "Allow refund",
//         "ru": "Разрешить возврат"
//     },
//     "InvestorDashboardRefundEthMessagesBeforeRefund": {
//         "en": "Exchange {allowance} {WToken} for {refundAmount} ETH?",
//         "ru": "Обменять {allowance} {WToken} на {refundAmount} ETH?"
//     },
//     "InvestorDashboardRefundEthDecreaseRefund": {
//         "en": "Сancel",
//         "ru": "Отменить"
//     },
//     "InvestorDashboardRefundEthTokensRefund": {
//         "en": "Exchange",
//         "ru": "Обменять"
//     },
//     "ProjectDashboard": {
//         "en": "Project Dashboard",
//         "ru": "Панель инструментов проекта"
//     },
//     "ProjectDashboardLoadLedger": {
//         "en": "Loading smart contracts...",
//         "ru": "Загрузка смарт-контрактов..."
//     },
//     "ProjectDashboardLoadSearchToken": {
//         "en": "Search tokens ...",
//         "ru": "Поиск токена..."
//     },
//     "ProjectDashboardLoadExpect": {
//         "en": "Expect...",
//         "ru": "Ожидайте..."
//     },
//     "ProjectDashboardSelectToken": {
//         "en": "Select a token",
//         "ru": "Выберите токен"
//     },
//     "ProjectDashboardSymbol": {
//         "en": "Symbol:",
//         "ru": "Символ:"
//     },
//     "ProjectDashboardDecimals": {
//         "en": "Decimals",
//         "ru": "Количество десятичных знаков после запятой"
//     },
//     "ProjectDashboardFeeTokens": {
//         "en": "Fee (tokens)",
//         "ru": "Сбор (в токенах)"
//     },
//     "ProjectDashboardFeeEth": {
//         "en": "Fee (ETH)",
//         "ru": "Сбор (в эфире)"
//     },
//     "ProjectDashboardStageWhitelist": {
//         "en": "Contact W12 to whitelist your token",
//         "ru": "Связаться с W12, чтобы добавить токен в белый список"
//     },
//     "ProjectDashboardStageWhitelistStatusWhitelisted": {
//         "en": "Whitelisted",
//         "ru": "В белом списке"
//     },
//     "ProjectDashboardStageWhitelistStatusNotWhitelisted": {
//         "en": "Not whitelisted",
//         "ru": "Нет в белом списке"
//     },
//     "ProjectDashboardStageApprove": {
//         "en": "Approve tokens to place",
//         "ru": "Утвердить размещение токенов"
//     },
//     "ProjectDashboardStageApproveStatusPending": {
//         "en": "Pending",
//         "ru": "В ожидании"
//     },
//     "ProjectDashboardStageApproveStatusApproved": {
//         "en": "Approved",
//         "ru": "Утвержденный"
//     },
//     "ProjectDashboardStageApproveSpendFrom": {
//         "en": "Spend from:",
//         "ru": "Проведите от:"
//     },
//     "ProjectDashboardStageApproveAmountLabel": {
//         "en": "Amount",
//         "ru": "Количество"
//     },
//     "ProjectDashboardStageApproveAmountPlaceholder": {
//         "en": "Max: {ownerBalance}",
//         "ru": "Максимум: {ownerBalance}"
//     },
//     "ProjectDashboardStageApproveButton": {
//         "en": "Approve",
//         "ru": "Разрешить"
//     },
//     "ProjectDashboardStagePlace": {
//         "en": "Place Tokens to Listing",
//         "ru": "Добавить токены в листинг"
//     },
//     "ProjectDashboardStageCurrenciesList": {
//         "en": "Select list of allowed crypto-currencies",
//         "ru": "Выбрать список разрешенных криптовалют"
//     },
//     "ProjectDashboardStagePlaceStatusPending": {
//         "en": "Pending",
//         "ru": "В ожидании"
//     },
//     "ProjectDashboardStagePlaceStatusPlaced": {
//         "en": "Placed",
//         "ru": "Размещены"
//     },
//     "ProjectDashboardStagePlaceAmountLabel": {
//         "en": "Place Amount",
//         "ru": "Разместить токены"
//     },
//     "ProjectDashboardStagePlaceAmountPlaceholder": {
//         "en": "Max: {tokensAmount}",
//         "ru": "Максимум: {tokensAmount}"
//     },
//     "ProjectDashboardStagePlaceButton": {
//         "en": "Place",
//         "ru": "Разместить"
//     },
//     "ProjectDashboardStageConfigureCrowdsale": {
//         "en": "Configure Crowdsale",
//         "ru": "Настройка Crowdsale"
//     },
//     "ProjectDashboardStageConfigureCrowdsaleStatusPending": {
//         "en": "Pending",
//         "ru": "В ожидании"
//     },
//     "ProjectDashboardStageConfigureCrowdsaleStatusInitialized": {
//         "en": "Initialized",
//         "ru": "Инициализирован"
//     },
//     "ProjectDashboardStageConfigureCrowdsaleStartDateLabel": {
//         "en": "Start date",
//         "ru": "Дата начала"
//     },
//     "ProjectDashboardStageConfigureCrowdsalePrice": {
//         "en": "Base token price",
//         "ru": "Стоимость базового токена"
//     },
//     "ProjectDashboardStageConfigureCrowdsaleAmountForSaleLabel": {
//         "en": "On sale",
//         "ru": "Количество для продажи"
//     },
//     "ProjectDashboardStageConfigureCrowdsaleInitButton": {
//         "en": "Configure",
//         "ru": "Конфигурировать"
//     },
//     "ProjectDashboardStageConfigureCrowdsaleAddTokensLabel": {
//         "en": "Add tokens to the crowdsdale",
//         "ru": "Добавить токены в краудсейл"
//     },
//     "ProjectDashboardStageConfigureCrowdsaleAddButton": {
//         "en": "Add",
//         "ru": "Добавить"
//     },
//     "ProjectDashboardStageBonuses": {
//         "en": "Configure Crowdsale Bonuses",
//         "ru": "Настройка бонусов краудсейла"
//     },
//     "ProjectDashboardStageBonusesStage": {
//         "en": "Stage",
//         "ru": "Стадия"
//     },
//     "ProjectDashboardStageBonusesStartDateLabel": {
//         "en": "Start Date",
//         "ru": "Дата начала"
//     },
//     "ProjectDashboardStageBonusesRemove": {
//         "en": "Remove stage",
//         "ru": "Удалить стадию"
//     },
//     "ProjectDashboardStageBonusesEndDateLabel": {
//         "en": "End date",
//         "ru": "Дата окончания"
//     },
//     "ProjectDashboardStageBonusesDiscountLabel": {
//         "en": "Discount",
//         "ru": "Скидка"
//     },
//     "ProjectDashboardStageBonusesVestingDateLabel": {
//         "en": "Vesting Date",
//         "ru": "Дата разморозки"
//     },
//     "ProjectDashboardStageBonusesVolume": {
//         "en": "Volume bonuses",
//         "ru": "Бонусы от объема"
//     },
//     "ProjectDashboardStageBonusesFromEth": {
//         "en": "From (ETH)",
//         "ru": "От (ETH)"
//     },
//     "ProjectDashboardStageBonusesBonus": {
//         "en": "Bonus",
//         "ru": "Бонус"
//     },
//     "ProjectDashboardStageBonusesAddButton": {
//         "en": "Add",
//         "ru": "Добавить"
//     },
//     "ProjectDashboardStageBonusesSaveButton": {
//         "en": "Save",
//         "ru": "Сохранить"
//     },
//     "ProjectDashboardStageBonusesAddStageButton": {
//         "en": "Add stage",
//         "ru": "Добавить стадию"
//     },
//     "ProjectDashboardStageBonusesSaveStagesButton": {
//         "en": "Save stages",
//         "ru": "Сохранить стадии"
//     },
//     "Milestones": {
//         "en": "Milestones",
//         "ru": "Основные этапы"
//     },
//     "MilestonesAdd": {
//         "en": "Add Milestone",
//         "ru": "Добавить Milestone"
//     },
//     "MilestonesName": {
//         "en": "Stage name",
//         "ru": "Название этапа"
//     },
//     "MilestonesDescription": {
//         "en": "Stage description",
//         "ru": "Описание этапа"
//     },
//     "MilestonesTranche": {
//         "en": "The amount of funds allocated to the project at the end of the stage in case the majority votes pro",
//         "ru": "Количество средств, выделяемых проекту по окончании этапа в случае позитивного голосования"
//     },
//     "MilestonesRelativeTotal": {
//         "en": "% of total",
//         "ru": "% от общего количества"
//     },
//     "MilestonesDelete": {
//         "en": "Delete stage",
//         "ru": "Удалить этап"
//     },
//     "MilestonesDate": {
//         "en": "Date of completion",
//         "ru": "Дата завершения этапа"
//     },
//     "MilestonesDateEndVoting": {
//         "en": "The date of the end of voting on stage completion",
//         "ru": "Дата окончания голосования о завершении этапа"
//     },
//     "MilestonesDateEndWithdrawal": {
//         "en": "End date of withdrawal in case majority votes contre",
//         "ru": "Дата окончания вывода средств в случае негативного голосования"
//     },
//     "MilestonesSend": {
//         "en": "Save Milestones to blockchain",
//         "ru": "Сохранить этапы"
//     },
//     "SetupCrowdsale": {
//         "en": "Save to blockchain",
//         "ru": "Сохранить"
//     },
//     "trancheInformation": {
//         "en": "Get ETH",
//         "ru": "Получение ETH"
//     },
//     "trancheInformationFundBalance": {
//         "en": "Fund balance",
//         "ru": "Баланс фонда хранения средств"
//     },
//     "trancheInformationDateNextTranche": {
//         "en": "Date and time of the next tranche",
//         "ru": "Дата и время получения следующего транша"
//     },
//     "trancheInformationFundsMoment": {
//         "en": "Currently available funds",
//         "ru": "Средства, доступные для получения на данный момент"
//     },
//     "trancheInformationReceive": {
//         "en": "Receive",
//         "ru": "Получить"
//     },
//     "Receiving": {
//         "en": "Receive {Token}",
//         "ru": "Получение {Token}"
//     },
//     "ReceivingUnsold": {
//         "en": "Unsold {Token} available for return",
//         "ru": "Непроданные {Token}, доступные для возврата на данный момент"
//     },
//     "ReceivingRemaining": {
//         "en": "{Token} backing {WToken}",
//         "ru": "{Token}, оставшиеся в обеспечение {WToken}"
//     },
//     "ReceivingAfterExchanging": {
//         "en": "{Token} relieved after are fully backed {WToken}",
//         "ru": "{Token} токены, не участвующие в обеспечание {WToken}"
//     },
//     "ReceivingTotal": {
//         "en": "TOTAL {Token} is available for return:",
//         "ru": "ВСЕГО доступно {Token} для возврата:"
//     },
//     "ReceivingGetUnsold": {
//         "en": "Get unsold {WToken}",
//         "ru": "Получить непроданные {WToken}"
//     },
//     "ExchangeTokensProjects": {
//         "en": "Exchange {Balance} {WToken} to {Balance} {Token}",
//         "ru": "Обмен {Balance} {WToken} на {Balance} {Token}"
//     },
//     "ExchangeTokensProjectsApprove": {
//         "en": "Approve amount of tokens to exchange",
//         "ru": "Разрешить обмен"
//     },
//     "ExchangeTokensProjectsMessagesBeforeSwap": {
//         "en": "Exchange {allowance} {WToken} for {allowance} {Token}?",
//         "ru": "Обменять {allowance} {WToken} на {allowance} {Token}?"
//     },
//     "ExchangeTokensProjectsDecrease": {
//         "en": "Cancel",
//         "ru": "Отменить"
//     },
//     "ExchangeTokensProjectsExchange": {
//         "en": "Exchange",
//         "ru": "Обменять"
//     },
//     "ProjectDashboardStageApproveNoTokens": {
//         "en": "No tokens on balance",
//         "ru": "Нет токенов на балансе"
//     },
//     "ProjectDashboardStageApproveInsufficientTokens": {
//         "en": "Insufficient tokens",
//         "ru": "Недостаточно токенов"
//     },
//     "ProjectDashboardStagePlaceCongratulations": {
//         "en": "Congratulations, {amount} {symbol} was successfully released, specify Crowdsale parameters for sale",
//         "ru": "Поздравляем, было успешно выпущено {amount} {symbol}, укажите параметры Crowdsale для продажи"
//     },
//     "ProjectDashboardStagePlaceErrorAmount": {
//         "en": "The specified amount, the higher the number of tokens allowed to write-off",
//         "ru": "Указанное количество, превышает количество токенов, разрешенных к списанию"
//     },
//     "MilestoneTitle": {
//         "en": "Stage",
//         "ru": "Этап"
//     },
//     "GeneralTitle": {
//         "en": "W12 Product v.1.0 in Rinkeby Test Network with Blockchain UI",
//         "ru": "W12 Product v.1.0 в тестовой сети Rinkeby с пользовательским Blockchain UI"
//     },
//     "WaitingConfirm": {
//         "en": "We are waiting for transaction confirmation",
//         "ru": "Ожидаем подтверждение транзакции"
//     },
//     "ErrorMetamaskNotInstalled": {
//         "en": "Please install Metamask to your browser",
//         "ru": "Установите Метамаск в свой браузер"
//     },
//     "ErrorMetamaskIsBlocked": {
//         "en": "Metamask is locked  please, unlock Metamask",
//         "ru": "Метамаск заблокирован, пожалуйста разблокируйте метамаск"
//     },
//     "ErrorMetamaskIsRinkebyNetwork": {
//         "en": "Please connect to the Rinkeby network",
//         "ru": "Пожалуйста подключитесь к сети Rinkeby"
//     },
//     "ErrorCurrentEthereumNetworkIdIsNot1": {
//         "en": "Please connect to the Mainnet network",
//         "ru": "Пожалуйста подключитесь к сети Mainnet"
//     },
//     "ErrorCurrentEthereumNetworkIdIsNot4": {
//         "en": "Please connect to the Rinkeby network",
//         "ru": "Пожалуйста подключитесь к сети Rinkeby"
//     },
//     "MilestoneTitleErrorNotOneHundredPercent": {
//         "en": "The sum of all percentages is not 100",
//         "ru": "Сумма всех процентов не равно 100"
//     },
//     "ErrorValidDecimals": {
//         "en": "The number of decimal places after the decimal point can be only from 0 to 36",
//         "ru": "Количество десятичный знаков после запятой может быть только от 0 до 36"
//     },
//     "ErrorValidMaxAmount": {
//         "en": "The number of tokens can be from {min} to {max}",
//         "ru": "Количество токенов может быть от {min} до {max}"
//     },
//     "ErrorOnSaleMaxAmount": {
//         "en": "Only {max} tokens are available for sale",
//         "ru": "Для продажи доступно только {max} токенов"
//     },
//     "ErrorTokenNameIsNotValid": {
//         "en": "Имя токена должно состоять из символов a-zA-Z0-9 и длинной от 5 до 50",
//         "ru": "Имя токена должно состоять из символов a-zA-Z0-9 и длинной от 5 до 50"
//     },
//     "ErrorTokenSymbolsIsNotValid": {
//         "en": "Символ токена должно состоять из символов a-zA-Z0-9 и длинной от 3 до 5",
//         "ru": "Символ токена должно состоять из символов a-zA-Z0-9 и длинной от 3 до 5"
//     },
//     "StepsNext": {
//         "en": "Next step",
//         "ru": "Следующий шаг"
//     },
//     "StepsText": {
//         "en": "Step {number} of 10",
//         "ru": "Шаг {number} из 10"
//     },
//     "StepsBlockedTx": {
//         "en": "Please wait for confirmation of the transaction",
//         "ru": "Пожалуйста дождитесь подтверждения транзакции"
//     },
//     "FirstStageStartDateRecommendedDateInfoMessage": {
//         "en": "Дату начала первой стадии рекомендуется устанавливать больше текущей даты на час и выше",
//         "ru": "Дату начала первой стадии рекомендуется устанавливать больше текущей даты на час и выше"
//     },
//     "InvestorDashboardDiscountsStagesDefrosting": {
//         "en": "Date of defrosting",
//         "ru": "Дата разморозки",
//     },
//     "InvestorDashboardDiscountsStagesDefrostingNot": {
//         "en": "No freeze",
//         "ru": "Нет заморозки",
//     },
//     "InvestorDashboardCalculatorAmount": {
//         "en": "The number of tokens available to purchase",
//         "ru": "Количество токенов доступных к покупке",
//     },
//     "RoadMapTitle": {
//         "en": "Stages",
//         "ru": "Этапы",
//     },
//     "RoadMapStage": {
//         "en": "Stage",
//         "ru": "Этап",
//     },
//     "RoadMapDates": {
//         "en": "Dates",
//         "ru": "Даты",
//     },
//     "RoadMapRefund": {
//         "en": "Refund Period",
//         "ru": "Период возврата средств",
//     },
//     "RoadMapReceipt": {
//         "en": "Dates of receipt of funds by the project",
//         "ru": "Даты получения средств проектом",
//     },
//     "RoadMapFinancing": {
//         "en": "% financing",
//         "ru": "% финансирования",
//     },
//     "RoadMapIndex": {
//         "en": "№",
//         "ru": "№",
//     },
//     "RoadMapDatesFromTo": {
//         "en": "from {from} to {to}",
//         "ru": "c {from} по {to}",
//     },
//     "RoadMapDatesFirst": {
//         "en": "to {to}",
//         "ru": "по {to}",
//     },
//     "RoadMapDatesLast": {
//         "en": "from {from}",
//         "ru": "c {from}",
//     },
//     "UnexpectedError": {
//         "en": "An unexpected error has occurred. Reload page",
//         "ru": "Произошла непредвиденная ошибка. Перезагрузите страницу",
//     },
//     "Network4": {
//         "en": "Rinkeby Test Network",
//         "ru": "Тестовая сеть Rinkeby",
//     },
//     "Network1": {
//         "en": "Ethereum Main Network",
//         "ru": "Основная сеть Ethereum",
//     },
//     "NotMetaMask": {
//         "en": "Please install Metamask",
//         "ru": "Установите Метамаск"
//     },
// };
