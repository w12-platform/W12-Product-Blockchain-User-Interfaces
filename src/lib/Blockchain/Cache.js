import stringHash from 'string-hash';
import store from 'store';
import {CACHE_MAP} from 'src/config';
import Web3 from 'web3';
import * as Sentry from "@sentry/browser";

const web3 = new Web3();
const BigNumber = web3.BigNumber;

export function cacheController(meta, info) {
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
                const title = [info.type,info.contract_name,info.name,info.version,info.address].join(' ');
                Sentry.configureScope((scope) => {
                    scope.setExtra("args", args);
                    scope.setExtra("result", result);
                    scope.setTag("Type", info.type);
                    scope.setTag("ContractName", info.contract_name);
                    scope.setTag("Name", info.name);
                    scope.setTag("Version", info.version);
                    scope.setTag("Address", info.address);
                });
                if (error != null) {
                    Sentry.configureScope((scope) => {
                        scope.setLevel("error");
                    });
                    Sentry.captureMessage(title);
                    reject(error);
                } else {
                    store.dispatch('Cache/set', {meta, hash, result, blockNumber, args: {...args}});
                    Sentry.configureScope((scope) => {
                        scope.setLevel("info");
                    });
                    Sentry.captureMessage(title);
                    accept(result);
                }
            };

            const functCache = (data) => {
                console.log(data.result);
                if(Array.isArray(data.result)){
                    console.log(data.meta.typesOutput);
                    accept(data.result.map((item, index) => {
                        if(data.meta.typesOutput[index].search(/(.*)int([0-9]*)$/gm) !== -1){
                            return new BigNumber(item);
                        } else {
                            return item;
                        }
                    }))
                } else {
                    if(data.meta.typesOutput[0].search(/(.*)int([0-9]*)$/gm) !== -1){
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
