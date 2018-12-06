import { getEndDate } from '@/lib/selectors/crowdsaleStages';
import { fetchTokenFull as fetchTokenFull_v0_20_x } from '@/store/modules/TokensList/0.20.x/actions';
import { fetchTokenMinimal as fetchTokenMinimal_v0_20_x } from '@/store/modules/TokensList/0.20.x/actions';
import { fetch as fetch_v0_20_x } from '@/store/modules/TokensList/0.20.x/actions';
import { fetchTokenByCurrentToken as fetchTokenByCurrentToken_v0_20_x } from '@/store/modules/TokensList/0.20.x/actions';
import semver from 'semver';
import { errorMessageSubstitution } from "src/lib/utils";
const ERROR_FETCH_TOKENS_LIST = 'An unknown error while trying get tokens';

export const UPDATE_TIMER_ID = 'UPDATE_TIMER_ID';
export const TOKEN_SELECTED = "TOKEN_SELECTED";
export const PROJECT_SELECTED = "PROJECT_SELECTED";
export const UPDATE_META = "UPDATE_META";
export const UPDATE = "UPDATE";
export const UPDATE_PROJECTS = "UPDATE_PROJECTS";
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
        currentToken: false,
        timerId: false,
    },
    modules: {},
    mutations: {
        [UPDATE_TIMER_ID](state, payload) {
            clearInterval(this.state.TokensList.timerId);
            const timerId = payload ? payload.timerId || false : false;
            Object.assign(state, {timerId});
        },
        [TOKEN_SELECTED](state, payload) {
            Object.assign(state, payload);
        },
        [UPDATE_META](state, payload) {
            Object.assign(state.meta, payload);
        },
        [UPDATE](state, payload) {
            const list = payload.list || false;
            Object.assign(state, {list});

            if(state.currentToken) {
                const index = payload.list.findIndex(t => {
                    return t.index === state.currentToken.index
                        && t.tokenAddress === state.currentToken.tokenAddress
                        && t.version === state.currentToken.version;
                });

                state.currentToken = index === -1 ? null : payload.list[index];
            }
        },
        [UPDATE_PROJECTS](state, payload) {
            const projects = payload.projects || false;
            Object.assign(state, {projects});
        },
        [PROJECT_SELECTED](state, payload) {
            Object.assign(state, payload);
        },
        [RESET](state) {
            state.list = [];
            state.currentToken = null;
        },
    },
    actions: {
        async fetchTokenMinimal(context, payload){
            if (semver.satisfies(payload.version, '0.20.x - 0.27.x')) {
                return await fetchTokenMinimal_v0_20_x.call(this, context, payload);
            }

            throw new Error(`token version ${payload.version} does not supported`);
        },
        async fetchTokenFull(context, payload){
            if (semver.satisfies(payload.version, '0.20.x - 0.26.x')) {
                return await fetchTokenFull_v0_20_x.call(this, context, payload);
            }

            throw new Error(`token version ${payload.version} does not supported`);
        },
        async fetch(context, payload) {
            const version = context.rootState.Config.W12Lister.version;

            if (semver.satisfies(version, '0.20.x - 0.27.x')) {
                return await fetch_v0_20_x.call(this, context, payload);
            }

            throw new Error(`token version ${payload.version} does not supported`);
        },
        async fetchTokenByCurrentToken(context, payload) {
            if (semver.satisfies(payload.version, '0.20.x - 0.27.x')) {
                return await fetchTokenByCurrentToken_v0_20_x.call(this, context, payload);
            }

            throw new Error(`token version ${payload.version} does not supported`);
        },
        async update({commit, dispatch}, token) {
            commit(UPDATE_META, {updated: true});
            try {
                commit(TOKEN_SELECTED, {currentToken: await dispatch('fetchTokenFull', token)});
            } catch (e) {
                commit(UPDATE_META, {
                    updated: false,
                    loadingError: errorMessageSubstitution(e) || ERROR_FETCH_TOKENS_LIST
                });
            }

            commit(UPDATE_META, {updated: false});
        },
        async reset({commit}) {
            commit(RESET);
        },
    }
};
