import axios from "axios";

import config from '@/config.js';

export const LANG_UPDATE = "LANG_UPDATE";
export const LANG_UPDATE_META = "LANG_UPDATE_META";
const params = new URLSearchParams(window.location.search);

export default {
    namespaced: true,
    state: {
        meta: {
            loading: true,
            loadingError: false,
            lock: false,
        },
        current: "en",
        vocabulary: {},
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
    actions: {
        async getLang({commit}) {
            const paramLang = params.has('lang') ? params.get('lang') : false;

            if(paramLang){
                commit(LANG_UPDATE, {current: paramLang});
            } else {
                if(typeof lang !== 'undefined') {
                    commit(LANG_UPDATE, {current: lang});
                }
            }
        },
        async getVocabulary({commit, state}) {
            if(typeof VocabularyScript !== 'undefined'){
                commit(LANG_UPDATE, {vocabulary: VocabularyScript});
                window.dispatchEvent(new Event('resize'));
            } else {
                if(!state.meta.lock){
                    commit(LANG_UPDATE_META, {lock: true});
                    await axios.get(config.apiTranslate).then((response) => {
                        if (response.data) {
                            commit(LANG_UPDATE, {vocabulary: response.data});
                        }
                        commit(LANG_UPDATE_META, {lock: false});
                        window.dispatchEvent(new Event('resize'));
                    }, (e) => {
                        commit(LANG_UPDATE_META, {lock: false});
                    });
                }
            }
        }
    }
};
