import { encode } from '@redtea/semint';
import cloneDeep from 'lodash/cloneDeep';
import config from '@/config';

const getLastVersionInList = (list) => {
    list = Array.from(list)
        .sort((a, b) => encode(a.version, 4) - encode(b.version, 4));
    return list.length != 0 ? list[list.length - 1] : null;
};

export const CONFIG_UPDATE = "CONFIG_UPDATE";

export default {
    namespaced: true,
    state: {
        FactoryTokens: cloneDeep(config.currentNetworkContractAddresses.FactoryTokens),
        W12Lister: cloneDeep(getLastVersionInList(config.currentNetworkContractAddresses.W12Lister)),
        Default: {
            version: getLastVersionInList(config.currentNetworkContractAddresses.W12Lister).version
        },
        W12ListerList: cloneDeep(config.currentNetworkContractAddresses.W12Lister),
        // TODO: move out to config
        Rates: {
            address: "0x811b10cde932759f6af53ba97e006ffe7796159b",
            version: "0.21.3"
        }
    },
    modules: {},
    getters: {
        W12ListerLastVersion (state) {
            return getLastVersionInList(state.W12ListerList);
        }
    },
    mutations: {
        [CONFIG_UPDATE](state, payload) {
            Object.assign(state, payload);
        },
    },
    actions: {}
};
