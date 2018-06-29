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
        net: 'https://ropsten.infura.io/',
        key: '7orv4QUSQbFWWcCpqHmH'
    },
    // if true then infura will be used as fallback
    useInfuraAsFallbackNet: true,
    feePercent: 50,
    contracts: {
        W12Lister: {
            address: '0x145a16991800a352b445e02d1d8bc5a0d87c79d1'
        },
        W12CrowdsaleFactory: {
            address: '0xd9a28ded160e605a8d58d9c67f3903a9aea7bbe7'
        },
        WToken: {
            address: '0xda9a4395a4a4b03c2e7e0c46ac36e3e4020ee386'
        }
    }
}

