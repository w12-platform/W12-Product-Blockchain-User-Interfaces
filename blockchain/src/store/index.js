import Vue from 'vue';
import Vuex from 'vuex';
import config from "./modules/config";
import crowdSaleList from "./modules/crowdSaleList";
import PersistedStatePlugin from "vuex-persistedstate";

Vue.use(Vuex);

const store = {
    state: {},
    actions: {},
    mutations: {},
    getters: {},
    modules: {
        config,
        crowdSaleList
    },
    plugins: [
        PersistedStatePlugin({
            paths: [
                "config.W12Lister.address",
                "crowdSaleList.selected",
            ]
        })
    ]
};

export default new Vuex.Store(store);
