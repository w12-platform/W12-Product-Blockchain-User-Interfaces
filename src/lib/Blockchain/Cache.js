import stringHash from 'string-hash';
import store from 'store';

export function cacheController(meta) {
    return function (...args) {
        return new Promise(async (accept, reject) => {
            const blockNumber = await store.dispatch('Cache/getBlockNumber');

            let hash;

            switch (meta.typeCache) {
                case 'permanent':
                    hash = stringHash(meta.address + meta.method + args.toString());
                    break;

                default:
                    hash = stringHash(meta.address + meta.method + args.toString() + blockNumber);
                    break;
            }

            const callback = function (error, result) {
                if (error != null) {
                    reject(error);
                } else {
                    store.dispatch('Cache/set', {meta, hash, result, blockNumber, args: {...args}});
                    accept(result);
                }
            };

            const functCache = (data) => accept(data.result);

            const cacheData = await store.dispatch('Cache/get');

            return cacheData ? functCache(cacheData) : meta.funct(...args, callback);
        });
    };
}

export function getCacheType(version, name, method) {
    const cacheMap = getCacheMap();
    for (let type in cacheMap) {
        const versions = cacheMap[type];
        const contracts = versions ? versions[version] : false;
        const methods = contracts ? contracts[name] : false;

        if (methods && methods.find(item => item === method)) {
            return type;
        }
    }
    return false;
}

export function getCacheMap() {
    return {
        /* Permanent caching */
        permanent: {
            "0.20.5": {
                DetailedERC20: ['name', 'symbol', 'decimals'],
                IW12Crowdsale: ['getWToken'],
                WToken: ['name', 'symbol', 'decimals', 'owner'],
                W12Lister: ['version', 'exchanger', 'serviceWallet', 'owner', 'factory', 'getTokenCrowdsale',
                    'getExchanger'],
                W12TokenLedger: ['getWTokenByToken', 'getTokenByWToken', 'owner', 'version'],
                W12FundFactory: ['version'],
                W12CrowdsaleFactory: ['version'],
                W12AtomicSwap: ['owner', 'version', 'ledger'],
                TokenExchanger: ['getTokenByWToken', 'getWTokenByToken', 'owner', 'version'],
                W12Crowdsale: ['originToken', 'WTokenSaleFeePercent', 'version', 'serviceWallet',
                    'swap', 'serviceFee', 'owner', 'price', 'fund', 'token', 'getWToken', 'getFund'],
                W12Fund: ['wToken', 'totalTranchePercentReleased', 'tokenDecimals', 'version', 'serviceWallet',
                    'swap', 'owner', 'crowdsale', 'trancheFeePercent'],
            },
            "0.21.3": {
                DetailedERC20: ['name', 'symbol', 'decimals'],
                IW12Crowdsale: ['getWToken'],
                WToken: ['name', 'symbol', 'decimals', 'owner'],
                W12Lister: ['version', 'exchanger', 'serviceWallet', 'owner', 'factory', 'getTokenCrowdsale',
                    'getExchanger'],
                W12TokenLedger: ['getWTokenByToken', 'getTokenByWToken', 'owner', 'version'],
                W12FundFactory: ['version'],
                W12CrowdsaleFactory: ['version'],
                W12AtomicSwap: ['owner', 'version', 'ledger'],
                W12Crowdsale: ['originToken', 'WTokenSaleFeePercent', 'version', 'serviceWallet', 'swap',
                    'serviceFee', 'owner', 'price', 'fund', 'token', 'getWToken', 'getFund'],
                W12Fund: ['wToken', 'totalTranchePercentReleased', 'tokenDecimals', 'version', 'serviceWallet',
                    'swap', 'owner', 'crowdsale', 'trancheFeePercent'],
            },
            "0.23.2": {
                DetailedERC20: ['name', 'symbol', 'decimals'],
                IW12Crowdsale: ['getWToken'],
                WToken: ['name', 'symbol', 'decimals', 'owner'],
                W12Lister: ['version', 'exchanger', 'serviceWallet', 'owner', 'factory', 'getTokenCrowdsale',
                    'getExchanger'],
                W12TokenLedger: ['getWTokenByToken', 'getTokenByWToken', 'owner', 'version'],
                W12FundFactory: ['version'],
                W12CrowdsaleFactory: ['version'],
                W12AtomicSwap: ['owner', 'version', 'ledger'],
                W12Crowdsale: ['originToken', 'WTokenSaleFeePercent', 'version', 'serviceWallet',
                    'swap', 'serviceFee', 'owner', 'price', 'fund', 'token', 'getWToken', 'getFund'],
                W12Fund: ['wToken', 'totalTranchePercentReleased', 'tokenDecimals', 'version', 'serviceWallet',
                    'swap', 'owner', 'crowdsale', 'trancheFeePercent']
            },
        },
    }
}