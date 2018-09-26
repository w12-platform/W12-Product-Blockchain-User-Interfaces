import Ledger_v1 from "lib/Blockchain/ContractsLedger_v1.js";
import Ledger_v2 from "lib/Blockchain/ContractsLedger_v2.js";

export const ERROR_FETCH_LEDGER = 'LoadLedger: An unknown error';
export const UPDATE_META = "UPDATE_META";

export default {
    namespaced: true,
    state: {
        meta: {
            loading: false,
            loadingError: false,
        },
    },
    modules: {},
    getters: {},
    mutations: {
        [UPDATE_META](state, payload) {
            Object.assign(state.meta, payload);
        },
    },
    actions: {
        async fetch({commit, state}, version) {
            commit(UPDATE_META, {loading: true, loadingError: false});

            let ledger;

            try {
                if(version === '2'){
                    ledger = await Ledger_v2;
                } else {
                    ledger = await Ledger_v1;
                }
            } catch (e) {
                commit(UPDATE_META, {loading: false, loadingError: e.message || ERROR_FETCH_LEDGER});
            }

            commit(UPDATE_META, {loading: false, loadingError: false});

            return ledger;
        }
    }
};



