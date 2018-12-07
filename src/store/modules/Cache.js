import Connector from "lib/Blockchain/DefaultConnector";
export const CACHE_SET = "CACHE_SET";
export const CACHE_CLEAR = "CACHE_CLEAR";
export const CACHE_CLEAR_TEMP = "CACHE_CLEAR_TEMP";
export const CACHE_LAST_BLOCK_UP = "CACHE_LAST_BLOCK_UP";
export const CACHE_UI_VERSION_UP = "CACHE_UI_VERSION_UP";
import Web3 from 'web3';
const web3 = new Web3();

export default {
    namespaced: true,
    state: {
        UIVersion: false,
        lastBlockNumber: false,
        results: [],
    },
    modules: {},
    getters: {
        get(state) { return (hash) => state.results.find(i => i.hash === hash) }
    },
    mutations: {
        [CACHE_LAST_BLOCK_UP](state, payload) {
            state.lastBlockNumber = payload;
        },
        [CACHE_UI_VERSION_UP](state, payload) {
            state.UIVersion = payload;
        },
        [CACHE_SET](state, payload) {
            state.results.push(payload);
        },
        [CACHE_CLEAR_TEMP](state) {
            state.results = state.results.filter(result => result.blockNumber === state.lastBlockNumber || result.meta.typeCache === 'permanent');
        },
        [CACHE_CLEAR](state) {
            state.results = [];
        },
    },
    actions: {
        set({state, commit}, data) {
            state.lastBlockNumber = data.blockNumber > state.lastBlockNumber ? data.blockNumber : state.lastBlockNumber;
            const findResult = state.results.find((result) => result.hash === data.hash);
            if(!findResult){
                commit(CACHE_SET, data);
            }
        },
        async getBlockNumber({state}) {
            return state.lastBlockNumber ? state.lastBlockNumber : await this.dispatch('Cache/blockNumberUp');
        },
        async startWatchBlockNumberUpdate({state, commit}){
            const {web3} = await Connector.connect();

            const currentUIVersion = (await fetch(PACKAGE_JSON_PATH).then(data => data.json())).version;
            if(!state.UIVersion || state.UIVersion !== currentUIVersion){
                commit(CACHE_UI_VERSION_UP, currentUIVersion);
                commit(CACHE_CLEAR);
            }
            web3.eth.filter('latest').watch(async () => {
                await this.dispatch('Cache/blockNumberUp')
            });
        },
        async blockNumberUp({commit}) {
            const {web3} = await Connector.connect();

            const blockNumber = await new Promise((accept, reject) => {
                web3.eth.getBlockNumber(async (error, result) => {
                    if (error != null) {
                        reject(error);
                    } else {
                        accept(result);
                    }
                });
            });
            commit(CACHE_LAST_BLOCK_UP, blockNumber);
            commit(CACHE_CLEAR_TEMP);
            return blockNumber;
        }
    }
};
