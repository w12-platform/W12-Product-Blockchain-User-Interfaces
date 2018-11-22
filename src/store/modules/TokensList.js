import { getEndDate } from '@/lib/selectors/crowdsaleStages';
import { fetchTokenFull as fetchTokenFull_v0_20_x } from '@/store/modules/TokensList/0.20.x/actions';
import { fetchTokenFull as fetchTokenFull_v0_27_x } from '@/store/modules/TokensList/0.27.x/actions';
import { fetchTokenFull as fetchTokenFull_v0_28_x } from '@/store/modules/TokensList/0.28.x/actions';
import semver from 'semver';
import { isZeroAddress, errorMessageSubstitution } from "src/lib/utils";
import {map, reduce} from 'p-iteration';

export const ERROR_FETCH_TOKENS_LIST = 'An unknown error while trying get tokens';

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
                const index = payload.list.findIndex(
                    t => t.index === state.currentToken.index && t.version === state.currentToken.version);

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
            state.list = false;
            state.currentToken = false;
        },
    },
    actions: {
        async fetchTokenMinimal({}, token){
            const {
                W12CrowdsaleFactory
            } = await this.dispatch('Ledger/fetch', token.version);
            const W12Crowdsale = W12CrowdsaleFactory.at(token.crowdsaleAddress);
            const stages = (await W12Crowdsale.getStagesList());
            const endDate = getEndDate(stages);
            token.crowdSaleInformation = {
                stages,
                endDate,
            };
            return endDate ? token : null;
        },
        async fetchTokenFull(context, payload){
            if (semver.satisfies(payload.version, '0.20.x - 0.26.x')) {
                return await fetchTokenFull_v0_20_x.call(this, context, payload);
            } else if (semver.satisfies(payload.version, '0.27.x')) {
                return await fetchTokenFull_v0_27_x.call(this, context, payload);
            } else if (semver.satisfies(payload.version, '>=0.28.x')) {
                return await fetchTokenFull_v0_28_x.call(this, context, payload);
            }

            throw new Error(`token version ${payload.version} does not supported`);
        },

        async fetch({commit, state}) {
            commit(UPDATE_META, {loading: true});
            try {
                const fetchToken = async (list, Lister) => {
                    const {W12ListerFactory} = await this.dispatch('Ledger/fetch', Lister.version);
                    const W12Lister = W12ListerFactory.at(Lister.address);
                    let tokens = (await W12Lister.fetchAllTokensComposedInformation()).filter(t => !isZeroAddress(t.crowdsaleAddress));
                    tokens = await map(tokens, async token => await this.dispatch('TokensList/fetchTokenMinimal', token));
                    return list.concat(tokens.filter(token => token && !isZeroAddress(token.tokenAddress)));
                };

                const list = await reduce(this.state.Config.W12ListerList, fetchToken, []);

                if (!state.currentToken && list.length) {
                    commit(TOKEN_SELECTED, {currentToken: await this.dispatch('TokensList/fetchTokenFull', list[0])});
                }

                commit(UPDATE, {list});
            } catch (e) {
                console.error(e);
                commit(UPDATE_META, {loading: false, loadingError: errorMessageSubstitution(e) || ERROR_FETCH_TOKENS_LIST});
            }
            commit(UPDATE_META, {loading: false});
        },
        async fetchTokenByCurrentToken({commit}, CurrentToken) {
            commit(UPDATE_META, {loading: true});
            try {
                const {W12ListerFactory} = await this.dispatch('Ledger/fetch', CurrentToken.version);
                const W12Lister = W12ListerFactory.at(CurrentToken.listerAddress);
                const token = await W12Lister.fetchComposedTokenInformationByTokenAddress(CurrentToken);
                commit(TOKEN_SELECTED, {currentToken: await this.dispatch('TokensList/fetchTokenFull', token)});
                commit(UPDATE, {list: [token]});
            } catch (e) {
                console.error(e);
                commit(UPDATE_META, {loading: false, loadingError: errorMessageSubstitution(e) || ERROR_FETCH_TOKENS_LIST});
            }
            commit(UPDATE_META, {loading: false});
        },
        async update({commit, dispatch}, token) {
            commit(UPDATE_META, {updated: true});
            try {
                commit(TOKEN_SELECTED, {currentToken: await this.dispatch('TokensList/fetchTokenFull', token)});
            } catch (e) {
                console.error(e);
                commit(UPDATE_META, {
                    loading: false,
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
