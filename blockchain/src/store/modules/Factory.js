export const FACTORY_ADD = "FACTORY_ADD";
export const FACTORY_RESET = "FACTORY_RESET";

export default {
    namespaced: true,
    state: {
        list: []
    },
    modules: {},
    getters: {},
    mutations: {
        [FACTORY_ADD](state, tokenAddress) {
            if(state.list.indexOf(tokenAddress) === -1 ){
                state.list.push(tokenAddress);
            }
        },
        [FACTORY_RESET](state) {
            state.list = [];
        },
    },
    actions: {
        async reset({commit}) {
            commit(FACTORY_RESET);
        },
    }
};
