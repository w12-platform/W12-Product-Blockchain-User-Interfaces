import {
    UPDATE_META,
    UPDATE,
    RESET
} from './Whitelist/mutations';
import semver from 'semver';
import {fetch as fetch_v0_20_x} from './Whitelist/0.20.x/actions';
import {fetch as fetch_v0_28_x} from './Whitelist/0.28.x/actions';

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
            const list = payload.list || [];
            Object.assign(state, {list});
        },
        [RESET](state) {
            state.list = [];
        },
    },
    actions: {
        async fetch(context, payload) {
            const version = context.rootState.Config.W12Lister.version;

            if (semver.satisfies(version, '0.20.x - 0.27.x')) {
                return await fetch_v0_20_x.call(this, context, payload);
            } else if (semver.satisfies(version, '>=0.28.x')) {
                return await fetch_v0_28_x.call(this, context, payload);
            }

            throw new Error(`version ${version} does not supported`);
        },
        async reset({commit}) {
            commit(RESET);
        },
    }
};
