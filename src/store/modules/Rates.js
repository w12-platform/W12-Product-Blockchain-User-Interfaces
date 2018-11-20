import { filterByVersion } from '@/lib/selectors/general';
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
        this.version = model.version;
    }
}

export default {
    namespaced: true,
    state: {
        list: []
    },
    modules: {},
    getters: {
        filter(state) {
            return ({ version }) => state.list.filter(filterByVersion(version));
        }
    },
    mutations: {
        [RATES_UPDATE](state, payload) {
            const list = payload.list || false;
            Object.assign(state, {list});
        },
        UPDATE_RATE(state, payload) {
            const current = state.list
                .filter(filterByVersion(payload.version))
                .find(record => record.symbol === payload.symbol);

            if (!current) {
                state.list.push(payload);
            } else {
                state.list.splice(state.list.indexOf(current), 1, payload);
            }
        }
    },
    actions: {
        async fetch({commit, dispatch, rootState}, {version}) {
            version = version || rootState.Config.W12Lister.version;
            const {RatesFactory} = await dispatch('Ledger/fetch', version, {root:true});
            const Rates = await RatesFactory.at(rootState.Config.Rates.find(filterByVersion(version)).address);

            const list = await forEach(await Rates.getList(), async (symbol) => dispatch('fetchBySymbol', {symbol, version}));

            return list;
        },
        async fetchBySymbol({commit, state, dispatch, rootState}, {symbol, version}) {
            version = version || rootState.Config.W12Lister.version;
            const {RatesFactory, ERC20DetailedFactory} = await dispatch('Ledger/fetch', version, {root:true});
            const Rates = await RatesFactory.at(rootState.Config.Rates.find(filterByVersion(version)).address);

            let isToken, address;

            const payload = new Rate({
                isToken: isToken = await Rates.isToken(symbol),
                symbol,
                address: isToken ? (address = await Rates.getTokenAddress(symbol)) : null,
                decimals: isToken ? (await ERC20DetailedFactory.at(address).methods.decimals()) : null,
                rate: decodeUSD(await Rates.get(symbol)),
                version
            });

            commit('UPDATE_RATE', payload);

            return payload;
        },
        async resolveDecimals({ dispatch, }, {symbol, version}) {
            const decimals = symbol === 'ETH'
                ? 18
                : symbol === 'USD'
                    ? 8
                    : (await dispatch('fetchBySymbol', {symbol, version})).decimals

            return new BigNumber(decimals);
        }
    }
};
