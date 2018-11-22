import {map} from 'p-iteration';
import {errorMessageSubstitution} from 'lib/utils';

const moment = window.moment;

export const ERROR_FETCH_TOKENS_LIST = 'An unknown error while trying get tokens';

export const UPDATE_META = "UPDATE_META";
export const UPDATE = "UPDATE";
export const RESET = "RESET";


export default {
    namespaced: true,
    state: {
        meta: {
            loading: true,
            loadingError: false,
            updated: false,
        },
        list: [],
    },
    modules: {},
    getters: {},
    mutations: {
        [UPDATE_META](state, payload) {
            Object.assign(state.meta, payload);
        },
        [UPDATE](state, payload) {
            const list = payload.list || false;
            Object.assign(state, {list});
        },
        [RESET](state) {
            state.list = false;
        },
    },
    actions: {
        async fetch({commit}) {
            commit(UPDATE_META, {loading: true});
            try {
                const {W12ListerFactory} = await this.dispatch('Ledger/fetch', this.state.Config.W12Lister.version);
                const W12Lister = W12ListerFactory.at(this.state.Config.W12Lister.address);
                let list = (await W12Lister.fetchAllTokensComposedInformation());
                list = list.filter((token) => Boolean(token.tokenAddress));
                commit(UPDATE, {list});
            } catch (e) {
                commit(UPDATE_META, {loading: false, loadingError: errorMessageSubstitution(e) || ERROR_FETCH_TOKENS_LIST});
            }
            commit(UPDATE_META, {loading: false});
        },
        async reset({commit}) {
            commit(RESET);
        },
    }
};