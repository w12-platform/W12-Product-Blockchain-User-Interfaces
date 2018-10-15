export const RATES_UPDATE = "FACTORY_UPDATE";

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
            const {RatesFactory} = await this.dispatch('Ledger/fetch', this.state.Config.Rates.version);
            const Rates = await RatesFactory.at(this.state.Config.Rates.address);
            commit(RATES_UPDATE, {list: await Rates.getList()});
        },
    }
};
