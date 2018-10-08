export const CONFIG_UPDATE = "CONFIG_UPDATE";

export default {
    namespaced: true,
    state: {
        W12Lister: {
            address: "0x0d60b4c74be0670166dc8f5588d35c8d50f4929d"
        },
        FactoryTokens: {
            address: "0x15bfbebcace798a18c42c2ff1f23388449355ea4"
        }
    },
    modules: {},
    getters: {},
    mutations: {
        [CONFIG_UPDATE](state, payload) {
            Object.assign(state, payload);
        },
    },
    actions: {}
};
