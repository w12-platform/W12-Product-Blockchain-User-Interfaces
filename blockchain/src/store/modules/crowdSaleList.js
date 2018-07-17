export const CROWDSALE_LIST_SELECTED = "CROWDSALE_LIST_SELECTED";

export default {
    namespaced: true,
    state: {
        selected: null
    },
    modules: {},
    getters: {},
    mutations: {
        [CROWDSALE_LIST_SELECTED](state, payload) {
            Object.assign(state, payload);
        },
    },
    actions: {}
};
