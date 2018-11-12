import { decodeUSD } from '@/lib/utils';
import {map, forEach} from 'p-iteration';
import {BigNumber} from '@/lib/utils';


export const RATES_UPDATE = "RATES_UPDATE";

class Rate {
    constructor(model) {
        this.isToken = model.isToken;
        this.symbol = model.symbol;
        this.decimals = model.symbol === 'ETH' ? '18' : model.decimals;
        this.address = model.address;
        this.rate = model.rate;
    }
}

export default {
    namespaced: true,
    state: {
        list: []
    },
    modules: {},
    getters: {
    },
    mutations: {
        [RATES_UPDATE](state, payload) {
            const list = payload.list || false;
            Object.assign(state, {list});
        },
        UPDATE_RATE(state, payload) {
            const currentIndex = state.list.findIndex(record => record.symbol === payload.symbol);

            if (currentIndex === -1) {
                state.list.push(payload);
            } else {
                state.list.splice(currentIndex, 1, payload);
            }
        }
    },
    actions: {
        async fetch({commit, dispatch}) {
            const {RatesFactory} = await this.dispatch('Ledger/fetch', this.state.Config.W12Lister.version);
            const Rates = await RatesFactory.at(this.state.Config.Rates.address);

            const list = await forEach(await Rates.getList(), async (symbol) => dispatch('fetchBySymbol', symbol));
        },
        async fetchBySymbol({commit, state}, symbol) {
            const {RatesFactory, DetailedERC20Factory} = await this.dispatch('Ledger/fetch', this.state.Config.W12Lister.version);
            const Rates = await RatesFactory.at(this.state.Config.Rates.address);

            let isToken, address;

            const payload = new Rate({
                isToken: isToken = await Rates.isToken(symbol),
                symbol,
                address: isToken ? (address = await Rates.getTokenAddress(symbol)) : null,
                decimals: isToken ? (await DetailedERC20Factory.at(address).methods.decimals()) : null,
                rate: decodeUSD(await Rates.get(symbol))
            });

            commit('UPDATE_RATE', payload);

            return payload;
        },
        async resolveDecimals({ dispatch }, symbol) {
            const decimals = symbol === 'ETH'
                ? 18
                : symbol === 'USD'
                    ? 8
                    : (await dispatch('fetchBySymbol', symbol)).decimals

            return new BigNumber(decimals);
        }
    }
};
