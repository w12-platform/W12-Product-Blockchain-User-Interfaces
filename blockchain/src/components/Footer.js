import Vue from 'vue';
import vuexI18n from 'vuex-i18n';
import store from "store";

import Footer from 'bem/Footer';

Vue.use(vuexI18n.plugin, store, {
    translateFilterName: 't'
});

import LangPlugin from 'plugin/LangPlugin';
Vue.use(LangPlugin);

new Vue({
    store,
    el: '#appFooter',
    template: "<Footer></Footer>",
    components: {
        Footer
    }
});