export const W12LISTER_UPDATE = "W12LISTER_UPDATE";

export default {
    namespaced: true,
    state: {
        list: []
    },
    modules: {},
    getters: {
        
    },
    mutations: {
        [W12LISTER_UPDATE](state, payload) {
            Object.assign(state, payload);
        },
    },
    actions: {
    }
};
