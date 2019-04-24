import clone from "lodash/cloneDeep";

export const CROWDSALE_LIST_SELECTED = "CROWDSALE_LIST_SELECTED";
export const CROWDSALE_LIST_RESET = "CROWDSALE_LIST_RESET";


const initialState = {
    selected: null
};

export default {
    namespaced: true,
    state: clone(initialState),
    modules: {},
    getters: {},
    mutations: {
        [CROWDSALE_LIST_SELECTED](state, payload) {
            Object.assign(state, payload);
        },
        [CROWDSALE_LIST_RESET](state) {
            Object.assign(state, clone(initialState));
        }
    },
    actions: {}
};
