import Connector from 'src/lib/Blockchain/DefaultConnector.js';
import {map} from 'p-iteration';

export const UPDATE_TX = "UPDATE_TX";
export const CONFIRM_TX = "CONFIRM_TX";
export const CANCEL_TX = "CANCEL_TX";
export const RESET = "RESET";

export default {
    namespaced: true,
    state: {
        list: [],
    },
    getters: {
        isPending(state) {
            return ({name, hash}) => {
                if (!name && !hash) throw new Error('no filters');
                return state.list.some(item => {
                    return item.status === 'pending'
                        && (name ? item.name === name : true)
                        && (hash ? item.hash === hash : true)
                })
            }
        },
        isFail(state) {
            return ({name, hash}) => {
                if (!name && !hash) throw new Error('no filters');
                return state.list.some(item => {
                    return item.status === 'error'
                        && (name ? item.name === name : true)
                        && (hash ? item.hash === hash : true)
                })
            }
        },
        get(state) {
            return ({name, hash}) => {
                if (!name && !hash) throw new Error('no filters');
                return state.list.find(item => {
                    return (name ? item.name === name : true)
                        && (hash ? item.hash === hash : true)
                })
            }
        }
    },
    mutations: {
        [UPDATE_TX](state, tx) {
            state.list.push(tx);
        },
        [CONFIRM_TX](state, tx) {
            state.list = state.list.filter((tr)=> tr.hash && tr.hash !== tx);
        },
        [CANCEL_TX](state, tx) {
            state.list = state.list.filter((tr)=> tr.hash && tr.hash !== tx);
        },
        [RESET](state) {
            state.list = [];
        }
    },
    actions: {
        async updateStatusTx({commit, state}) {
            state.list.forEach(async (tr) => {
                if (tr.hash) {
                    const connectedWeb3 = (await Connector.connect()).web3;
                    connectedWeb3.eth.getTransactionReceipt(tr.hash, function (err, receipt) {
                        if(receipt && receipt.blockNumber){
                            if (receipt.status === '0x1' || receipt.status === 1) {
                                commit(CONFIRM_TX, tr.hash);
                            } else {
                                commit(CANCEL_TX, tr.hash);
                                tr.status = "error";
                                commit(UPDATE_TX, tr);
                            }
                        } else {
                            commit(CANCEL_TX, tr.hash);
                        }
                    });
                }
            });
        },
        async retry({commit, state}, tr){
            commit(CONFIRM_TX, tr.hash);
        }
    }
};
