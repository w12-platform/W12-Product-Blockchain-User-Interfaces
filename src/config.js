import contractAddresses from './contractAddresses';

export const CACHE_MAP = {
    permanent: {
        "0.20.5": {
            DetailedERC20: ['name', 'symbol', 'decimals'],
            WToken: ['name', 'symbol', 'decimals'],
            W12Lister: ['version', 'exchanger', 'serviceWallet', 'factory', 'getExchanger'],
            W12TokenLedger: ['version'],
            W12FundFactory: ['version'],
            W12CrowdsaleFactory: ['version'],
            W12AtomicSwap: ['version', 'ledger'],
            W12Crowdsale: [
                'originToken', 'WTokenSaleFeePercent', 'version', 'serviceWallet',
                'swap', 'serviceFee', 'fund', 'token', 'getWToken', 'getFund'
            ],
            W12Fund: [
                'wToken', 'totalTranchePercentReleased', 'tokenDecimals', 'version', 'serviceWallet',
                'swap', 'crowdsale', 'trancheFeePercent'
            ],
        },
        "0.21.3": {
            DetailedERC20: ['name', 'symbol', 'decimals'],
            WToken: ['name', 'symbol', 'decimals'],
            W12Lister: ['version', 'exchanger', 'serviceWallet', 'factory', 'getExchanger'],
            W12TokenLedger: ['version'],
            W12FundFactory: ['version'],
            W12CrowdsaleFactory: ['version'],
            W12AtomicSwap: ['version', 'ledger'],
            W12Crowdsale: [
                'originToken', 'WTokenSaleFeePercent', 'version', 'serviceWallet',
                'swap', 'serviceFee', 'fund', 'token', 'getWToken', 'getFund'
            ],
            W12Fund: [
                'wToken', 'totalTranchePercentReleased', 'tokenDecimals', 'version', 'serviceWallet',
                'swap', 'crowdsale', 'trancheFeePercent'
            ],
        },
        "0.23.2": {
            DetailedERC20: ['name', 'symbol', 'decimals'],
            WToken: ['name', 'symbol', 'decimals'],
            W12Lister: ['version', 'exchanger', 'serviceWallet', 'factory', 'getExchanger'],
            W12TokenLedger: ['version'],
            W12FundFactory: ['version'],
            W12CrowdsaleFactory: ['version'],
            W12AtomicSwap: ['version', 'ledger'],
            W12Crowdsale: [
                'originToken', 'WTokenSaleFeePercent', 'version', 'serviceWallet',
                'swap', 'serviceFee', 'fund', 'token', 'getWToken', 'getFund'
            ],
            W12Fund: [
                'wToken', 'totalTranchePercentReleased', 'tokenDecimals', 'version', 'serviceWallet',
                'swap', 'crowdsale', 'trancheFeePercent'
            ],
            TokenExchanger: ['version']
        }
    }
};

const providers = {
    1: BLOCKCHAIN_NETWORK_1_PROVIDER || 'https://mainnet.infura.io/v3/8df9df41a48b4dd290a1abbba80b9953',
    4: BLOCKCHAIN_NETWORK_4_PROVIDER || 'https://rinkeby.infura.io/v3/8df9df41a48b4dd290a1abbba80b9953',
    5777: BLOCKCHAIN_NETWORK_5777_PROVIDER || 'http://127.0.0.1:7545'
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
    apiTranslate: TRANSLATIONS_JSON_URL || "https://w12.io/ru/api/translate/w12translations.json",
    blockchainNetworkId: BLOCKCHAIN_NETWORK_ID
};

export default config;
