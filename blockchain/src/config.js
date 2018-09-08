const params = new URLSearchParams(window.location.search);

const net = params.has('net') ? params.get('net') : 'https://ropsten.infura.io/';
const key = params.has('key') ? params.get('key') : '7orv4QUSQbFWWcCpqHmH';
const feePercent = params.has('feePercent') ? params.get('feePercent') : '10';
//const W12Lister = "0x090fd7807410455b59b95c492fda165c4b5b5679";//params.has('W12Lister') ? params.get('W12Lister') : "";//store.state.Config.W12Lister.address;
//const W12CrowdsaleFactory = params.has('W12CrowdsaleFactory') ? params.get('W12CrowdsaleFactory') : null;

export default {
    // place here your app config
    infura: {
        /*
            Mainnet	production network	https://mainnet.infura.io/
            Ropsten	test network	https://ropsten.infura.io/
            INFURAnet	test network	https://infuranet.infura.io/
            Kovan	test network	https://kovan.infura.io/
            Rinkeby	test network	https://rinkeby.infura.io/
            IPFS	gateway	https://ipfs.infura.io
         */
        net,
        key
    },
    // if true then infura will be used as fallback
    useInfuraAsFallbackNet: true,
    feePercent,
    // contracts: {
    //     W12Lister: {
    //         address: W12Lister
    //     },
    //     W12CrowdsaleFactory: {
    //         address: W12CrowdsaleFactory
    //     }
    // }
}
