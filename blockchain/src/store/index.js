import Vue from 'vue';
import Vuex from 'vuex';
import Config from "store/modules/Config.js";
import Ledger from "store/modules/Ledger.js";
import Account from "store/modules/Account.js";
import TokensList from "store/modules/TokensList.js";
import Whitelist from "store/modules/Whitelist.js";
import W12Lister from "store/modules/W12Lister.js";
import PersistedStatePlugin from "vuex-persistedstate";

Vue.use(Vuex);

const store = {
    state: {},
    actions: {},
    mutations: {},
    getters: {},
    modules: {
        Ledger,
        Config,
        W12Lister,
        Account,
        TokensList,
        Whitelist,
    },
    plugins: [
        PersistedStatePlugin({
            paths: [
                "Config.W12Lister.address",
                "W12Lister",
            ]
        })
    ]
};

export default new Vuex.Store(store);
