import Connector from 'lib/Blockchain/DefaultConnector.js';
import {promisify, isZeroAddress} from "lib/utils";
import {map} from 'p-iteration';
import {UPDATE_TOKENS_APPROVED} from "./Project";

const moment = window.moment;
const web3 = new Web3();
const BigNumber = web3.BigNumber;

export const UPDATE_TX = "UPDATE_TX";
export const CONFIRM_TX = "CONFIRM_TX";
export const RESET = "RESET";

export default {
    namespaced: true,
    state: {
        list: [],
    },
    getters: {},
    mutations: {
        [UPDATE_TX](state, tx) {
            state.list.push(tx);
        },
        [CONFIRM_TX](state, tx) {
            state.list = state.list.filter((tr)=> tr.hash && tr.hash !== tx);
        },
        [RESET](state) {
            state.list = null;
        }
    },
    actions: {
        async updateStatusTx({commit, state}) {
            state.list.forEach(async (tr) => {
                if (tr.hash) {
                    const connectedWeb3 = (await Connector.connect()).web3;
                    connectedWeb3.eth.getTransaction(tr.hash, function (err, receipt) {
                        if (receipt && receipt.blockNumber && receipt.hash || (!err && !receipt)) {
                            commit(CONFIRM_TX, tr.hash);
                        }
                    });
                }
            });
        }
    }
};