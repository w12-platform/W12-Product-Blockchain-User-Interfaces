export const CONFIG_UPDATE = "CONFIG_UPDATE";

export default {
    namespaced: true,
    state: {
        W12Lister: {
            address: "0x2729b859ed267cc33f21cc44ebb0e9f4be8ad45c"
        },
        FactoryTokens: {
            address: "0x2729b859ed267cc33f21cc44ebb0e9f4be8ad45c"
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
