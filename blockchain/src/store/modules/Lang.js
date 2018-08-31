export const LANG_UPDATE = "LANG_UPDATE";
export const LANG_UPDATE_META = "LANG_UPDATE_META";

export default {
    namespaced: true,
    state: {
        meta: {
            loading: true,
            loadingError: false
        },
        current: "en",
        all: ['en', 'ru']
    },
    mutations: {
        [LANG_UPDATE](state, payload) {
            Object.assign(state, payload);
        },
        [LANG_UPDATE_META](state, payload) {
            Object.assign(state.meta, payload);
        },
    },
};
