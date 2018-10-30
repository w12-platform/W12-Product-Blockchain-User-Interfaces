import { decodeUSD } from '@/lib/utils';
import {map} from 'p-iteration';


export const RATES_UPDATE = "FACTORY_UPDATE";

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
    getters: {},
    mutations: {
        [RATES_UPDATE](state, payload) {
            const list = payload.list || false;
            Object.assign(state, {list});
        },
    },
    actions: {
        async fetch({commit}) {
            const {RatesFactory, DetailedERC20Factory} = await this.dispatch('Ledger/fetch', this.state.Config.W12Lister.version);
            const Rates = await RatesFactory.at(this.state.Config.Rates.address);

            let isToken, address;
            const list = await map(await Rates.getList(), async (symbol) => new Rate({
                isToken: isToken = await Rates.isToken(symbol),
                symbol,
                address: isToken ? (address = await Rates.getTokenAddress(symbol)) : null,
                decimals: isToken ? (await DetailedERC20Factory.at(address).methods.decimals()) : null,
                rate: decodeUSD(await Rates.get(symbol))
            }));

            commit(RATES_UPDATE, { list });
        },
    }
};
