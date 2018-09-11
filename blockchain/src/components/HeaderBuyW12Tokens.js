import Vue from 'vue';
import vuexI18n from 'vuex-i18n';
import store from "store";

import HeaderBuyW12Tokens from 'bem/Header/BuyW12Tokens';

Vue.use(vuexI18n.plugin, store, {
    translateFilterName: 't'
});

import LangPlugin from 'plugin/LangPlugin';
Vue.use(LangPlugin);

new Vue({
    store,
    el: '#HeaderBuyW12Tokens',
    template: "<HeaderBuyW12Tokens></HeaderBuyW12Tokens>",
    components: {
        HeaderBuyW12Tokens
    }
});