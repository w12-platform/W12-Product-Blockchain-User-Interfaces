import Vue from 'vue';
import vuexI18n from 'vuex-i18n';
import store from "store";
import SidebarMenu from 'bem/SidebarMenu';

Vue.use(vuexI18n.plugin, store, {
    translateFilterName: 't'
});

import LangPlugin from 'plugin/LangPlugin';
Vue.use(LangPlugin);

new Vue({
    store,
    el: '#SidebarMenu',
    template: "<SidebarMenu></SidebarMenu>",
    components: {
        SidebarMenu
    }
});
