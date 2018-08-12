import Vue from 'vue';
import Vuex from 'vuex';
import Config from "store/modules/config";
import Ledger from "store/modules/Ledger";
import Account from "store/modules/Account";
import TokensList from "store/modules/TokensList";
import W12Lister from "store/modules/W12Lister";
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
