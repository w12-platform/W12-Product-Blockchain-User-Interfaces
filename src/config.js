import contractAddresses from './contractAddresses';

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
