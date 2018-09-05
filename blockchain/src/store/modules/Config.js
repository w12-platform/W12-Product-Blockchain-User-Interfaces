export const CONFIG_UPDATE = "CONFIG_UPDATE";

export default {
    namespaced: true,
    state: {
        W12Lister: {
            address: "0x090fd7807410455b59b95c492fda165c4b5b5679"
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
