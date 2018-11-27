import contractAddresses from './contractAddresses';

export const CACHE_MAP = {
    permanent: {
        "0.20.5": {
            DetailedERC20: ['name', 'symbol', 'decimals'],
            IW12Crowdsale: ['getWToken'],
            WToken: ['name', 'symbol', 'decimals'],
            W12Lister: ['version', 'exchanger', 'serviceWallet', 'owner', 'factory', 'getTokenCrowdsale',
                'getExchanger'],
            W12TokenLedger: ['getWTokenByToken', 'getTokenByWToken', 'owner', 'version'],
            W12FundFactory: ['version'],
            W12CrowdsaleFactory: ['version'],
            W12AtomicSwap: ['owner', 'version', 'ledger'],
            TokenExchanger: ['getTokenByWToken', 'getWTokenByToken', 'owner', 'version'],
            W12Crowdsale: ['originToken', 'WTokenSaleFeePercent', 'version', 'serviceWallet',
                'swap', 'serviceFee', 'owner', 'fund', 'token', 'getWToken', 'getFund'],
            W12Fund: ['wToken', 'totalTranchePercentReleased', 'tokenDecimals', 'version', 'serviceWallet',
                'swap', 'owner', 'crowdsale', 'trancheFeePercent'],
        },
        "0.23.2": {
            DetailedERC20: ['name', 'symbol', 'decimals'],
            IW12Crowdsale: ['getWToken'],
            WToken: ['name', 'symbol', 'decimals'],
            W12Lister: ['version', 'exchanger', 'serviceWallet', 'owner', 'factory', 'getTokenCrowdsale',
                'getExchanger'],
            W12TokenLedger: ['getWTokenByToken', 'getTokenByWToken', 'owner', 'version'],
            W12FundFactory: ['version'],
            W12CrowdsaleFactory: ['version'],
            W12AtomicSwap: ['owner', 'version', 'ledger'],
            W12Crowdsale: ['originToken', 'WTokenSaleFeePercent', 'version', 'serviceWallet',
                'swap', 'serviceFee', 'owner', 'fund', 'token', 'getWToken', 'getFund'],
            W12Fund: ['wToken', 'totalTranchePercentReleased', 'tokenDecimals', 'version', 'serviceWallet',
                'swap', 'owner', 'crowdsale', 'trancheFeePercent'],
            TokenExchanger: ['version', 'owner', 'getTokenByWToken', 'getWTokenByToken',]
        },
        "0.27.1": {
            DetailedERC20: ['name', 'symbol', 'decimals'],
            IW12Crowdsale: ['getWToken'],
            WToken: ['name', 'symbol', 'decimals'],
            W12Lister: ['version', 'exchanger', 'serviceWallet', 'owner', 'factory', 'getTokenCrowdsale',
                'getExchanger'],
            W12TokenLedger: ['getWTokenByToken', 'getTokenByWToken', 'owner', 'version'],
            W12FundFactory: ['version'],
            W12CrowdsaleFactory: ['version'],
            W12AtomicSwap: ['owner', 'version', 'ledger'],
            W12Crowdsale: ['originToken', 'WTokenSaleFeePercent', 'version', 'serviceWallet',
                'swap', 'serviceFee', 'owner', 'fund', 'token', 'getWToken', 'getFund'],
            W12Fund: ['wToken', 'totalTranchePercentReleased', 'tokenDecimals', 'version', 'serviceWallet',
                'swap', 'owner', 'crowdsale', 'trancheFeePercent'],
            TokenExchanger: ['version', 'owner', 'getTokenByWToken', 'getWTokenByToken',]
        },
        "0.28.0": {
            DetailedERC20: ['name', 'symbol', 'decimals'],
            IW12Crowdsale: ['getWToken'],
            WToken: ['name', 'symbol', 'decimals'],
            W12Lister: ['version', 'exchanger', 'serviceWallet', 'owner', 'factory', 'getTokenCrowdsale',
                'getExchanger'],
            W12TokenLedger: ['getWTokenByToken', 'getTokenByWToken', 'owner', 'version'],
            W12FundFactory: ['version'],
            W12CrowdsaleFactory: ['version'],
            W12AtomicSwap: ['owner', 'version', 'ledger'],
            W12Crowdsale: ['originToken', 'WTokenSaleFeePercent', 'version', 'serviceWallet',
                'swap', 'serviceFee', 'owner', 'fund', 'token', 'getWToken', 'getFund'],
            W12Fund: ['wToken', 'totalTranchePercentReleased', 'tokenDecimals', 'version', 'serviceWallet',
                'swap', 'owner', 'crowdsale', 'trancheFeePercent'],
            TokenExchanger: ['version', 'owner', 'getTokenByWToken', 'getWTokenByToken',]
        },
    }
};

const providers = {
    1: process.env.BLOCKCHAIN_NETWORK_1_PROVIDER || 'https://mainnet.infura.io/v3/8df9df41a48b4dd290a1abbba80b9953',
    4: process.env.BLOCKCHAIN_NETWORK_4_PROVIDER || 'https://rinkeby.infura.io/v3/8df9df41a48b4dd290a1abbba80b9953',
    5777: process.env.BLOCKCHAIN_NETWORK_5777_PROVIDER || 'http://127.0.0.1:7545'
};

const sentry = {
    allowedLevel: "fatal error warning debug", //fatal error warning info debug
};

// noinspection JSUnresolvedVariable
const config = {
    sentry,
    providers,
    currentProvider: providers[BLOCKCHAIN_NETWORK_ID],
    contractAddresses,
    currentNetworkContractAddresses: contractAddresses[BLOCKCHAIN_NETWORK_ID],
    apiTranslate: process.env.TRANSLATIONS_JSON_URL || "https://w12.io/ru/api/translate/w12translations.json",
    blockchainNetworkId: BLOCKCHAIN_NETWORK_ID
};

export default config;
