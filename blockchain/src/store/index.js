import Vue from 'vue';
import Vuex from 'vuex';
import config from "./modules/config";
import crowdsdalList from "./modules/crowdsdalList";
import PersistedStatePlugin from "vuex-persistedstate";

Vue.use(Vuex);

const store = {
    state: {},
    actions: {},
    mutations: {},
    getters: {},
    modules: {
        config,
        crowdsdalList
    },
    plugins: [
        PersistedStatePlugin({
            paths: [
                "config.W12Lister.address",
                "crowdsdalList.selected",
            ]
        })
    ]
};

export default new Vuex.Store(store);
