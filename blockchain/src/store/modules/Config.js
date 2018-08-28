export const CONFIG_UPDATE = "CONFIG_UPDATE";

export default {
    namespaced: true,
    state: {
        W12Lister: {
            address: "0xb59246fe3a2c38baf95bab59c0e549c624c06d94"
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
