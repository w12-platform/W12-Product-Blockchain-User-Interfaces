import Vue from 'vue';
import Vuex from 'vuex';
import Config from "./modules/Config.js";
import Cache from "./modules/Cache.js";
import Ledger from "./modules/Ledger.js";
import Account from "./modules/Account.js";
import TokensList from "./modules/TokensList.js";
import Whitelist from "./modules/Whitelist.js";
import W12Lister from "./modules/W12Lister.js";
import Project from "./modules/Project.js";
import Transactions from "./modules/Transactions.js";
import Lang from "./modules/Lang.js";
import Factory from "./modules/Factory.js";
import Rates from "./modules/Rates.js";
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
        Cache,
        W12Lister,
        Account,
        TokensList,
        Whitelist,
        Project,
        Transactions,
        Lang,
        Factory,
        Rates
    },
    plugins: [
        PersistedStatePlugin({
            paths: [
                "Cache",
                "W12Lister",
                "Transactions.list",
                "Lang.current",
                "Lang.vocabulary",
                "Factory.list",
                "Rates"
            ],
        }),
    ]
};

export default new Vuex.Store(store);
