import stringHash from 'string-hash';
import store from 'store';
import {CACHE_MAP} from 'src/config';
import Web3 from 'web3';

const web3 = new Web3();
const BigNumber = web3.BigNumber;

export function cacheController(meta) {
    return function (...args) {
        return new Promise(async (accept, reject) => {
            const blockNumber = await store.dispatch('Cache/getBlockNumber');

            let hash;
            const argsLast = args.length && args[args.length - 1] ? args[args.length - 1] : null
            const type = argsLast && argsLast.cache ? argsLast.cache : null;
            meta.typeCache = type ? type : meta.typeCache;

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

            const functCache = (data) => {
                if(Array.isArray(data.result)){
                    accept(data.result.map((item, index) => data.meta.typesOutput[index].search(/int/) !== -1
                        ? new BigNumber(item)
                        : item))
                } else {
                    if(data.meta.typesOutput[0].search(/int/) !== -1){
                        accept(new BigNumber(data.result));
                    } else {
                        accept(data.result);
                    }
                }
            };

            const cacheData = store.getters["Cache/get"](hash);

            return cacheData ? functCache(cacheData) : meta.funct(...args, callback);
        });
    };
}

export function getCacheType(version, name, method) {
    for (let type in CACHE_MAP) {
        const versions = CACHE_MAP[type];
        const contracts = versions ? versions[version] : false;
        const methods = contracts ? contracts[name] : false;

        if (methods && methods.includes(method)) {
            return type;
        }
    }
    return false;
}
