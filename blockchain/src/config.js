const params = new URLSearchParams(window.location.search);

const provider4 = 'https://rinkeby.infura.io/v3/8df9df41a48b4dd290a1abbba80b9953';
const provider1 = 'https://mainnet.infura.io/v3/8df9df41a48b4dd290a1abbba80b9953';
const feePercent = params.has('feePercent') ? params.get('feePercent') : '10';
const apiTranslate = "https://w12.io/ru/api/translate/w12translations.json"
const blockchainNetworkId = process.env.BLOCKCHAIN_NETWORK_ID || '4';
//const W12Lister = "0x090fd7807410455b59b95c492fda165c4b5b5679";//params.has('W12Lister') ? params.get('W12Lister') : "";//store.state.Config.W12Lister.address;
//const W12CrowdsaleFactory = params.has('W12CrowdsaleFactory') ? params.get('W12CrowdsaleFactory') : null;

export default {
    providers: {
        4: provider4,
        1: provider1
    },
    // if true then infura will be used as fallback
    useInfuraAsFallbackNet: true,
    feePercent,
    apiTranslate,
    blockchainNetworkId,
    // contracts: {
    //     W12Lister: {
    //         address: W12Lister
    //     },
    //     W12CrowdsaleFactory: {
    //         address: W12CrowdsaleFactory
    //     }
    // }
}
