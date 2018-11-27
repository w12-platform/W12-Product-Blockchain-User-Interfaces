import stringHash from 'string-hash';
import store from 'store';
import {CACHE_MAP} from 'src/config';

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

            const cacheData = store.getters["Cache/get"](hash);
            console.log(cacheData);

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
