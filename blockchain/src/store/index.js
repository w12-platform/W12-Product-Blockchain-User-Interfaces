import Vue from 'vue';
import Vuex from 'vuex';
import Config from "store/modules/Config.js";
import Ledger from "store/modules/Ledger.js";
import Account from "store/modules/Account.js";
import TokensList from "store/modules/TokensList.js";
import Whitelist from "store/modules/Whitelist.js";
import W12Lister from "store/modules/W12Lister.js";
import Project from "store/modules/Project.js";
import Transactions from "store/modules/Transactions.js";
import Lang from "store/modules/Lang.js";
import Factory from "store/modules/Factory.js";
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
        Project,
        Transactions,
        Lang,
        Factory
    },
    plugins: [
        PersistedStatePlugin({
            paths: [
                "Config",
                "W12Lister",
                "Transactions.list",
                "Lang.current",
                "Factory.list"
            ]
        })
    ]
};

export default new Vuex.Store(store);
