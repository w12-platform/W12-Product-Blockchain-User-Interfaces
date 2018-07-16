import Vue from 'vue';
import Vuex from 'vuex';
import config from "./modules/config";
import PersistedStatePlugin from "vuex-persistedstate";

Vue.use(Vuex);

const store = {
    state: {},
    actions: {},
    mutations: {},
    getters: {},
    modules: {
        config
    },
    plugins: [
        PersistedStatePlugin({
            paths: [
                "config.W12Lister.address",
            ]
        })
    ]
};

export default new Vuex.Store(store);
