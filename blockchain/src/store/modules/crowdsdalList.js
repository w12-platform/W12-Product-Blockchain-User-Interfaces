export const CROWDSDAL_LIST_SELECTED = "CROWDSDAL_LIST_SELECTED";

export default {
    namespaced: true,
    state: {
        selected: null
    },
    modules: {},
    getters: {},
    mutations: {
        [CROWDSDAL_LIST_SELECTED](state, payload) {
            Object.assign(state, payload);
        },
    },
    actions: {}
};
