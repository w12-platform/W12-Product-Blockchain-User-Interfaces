import Vue from 'vue';
import Vuex from 'vuex';
import config from "store/modules/config";
import crowdSaleList from "store/modules/crowdSaleList";
import W12Lister from "store/modules/W12Lister";
import PersistedStatePlugin from "vuex-persistedstate";

Vue.use(Vuex);

const store = {
    state: {},
    actions: {},
    mutations: {},
    getters: {},
    modules: {
        config,
        crowdSaleList,
        W12Lister,
    },
    plugins: [
        PersistedStatePlugin({
            paths: [
                "config.W12Lister.address",
                "W12Lister"
            ]
        })
    ]
};

export default new Vuex.Store(store);
