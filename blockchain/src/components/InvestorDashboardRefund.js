import Vue from 'vue';
import Buefy from 'buefy';
import vuexI18n from 'vuex-i18n';
import VueMask from 'v-mask';
import Cleave from 'vue-cleave-component';
import Tooltip from 'vue-directive-tooltip';
import 'vue-directive-tooltip/css/index.css';

import 'bem/buefy/default.scss';
import InvestorDashboardRefund from 'bem/InvestorDashboardRefund';
import store from "store";
import LangSwitch from 'bem/LangSwitch';
import Footer from 'bem/Footer';
import SidebarMenu from 'bem/SidebarMenu';
import HeaderBuyW12Tokens from 'bem/Header/BuyW12Tokens';

Vue.use(VueMask);
Vue.use(Buefy);
Vue.use(Cleave);
Vue.use(Tooltip);

Vue.use(vuexI18n.plugin, store, {
    translateFilterName: 't'
});

new Vue({
    store,
    el: '#langSwitch',
    template: "<lang-switch></lang-switch>",
    components: {
        LangSwitch
    }
});

new Vue({
    store,
    el: '#appInvestorDashboardRefund',
    template: "<investor-dashboard-refund></investor-dashboard-refund>",
    components: {
        InvestorDashboardRefund
    }
});

new Vue({
    store,
    el: '#HeaderBuyW12Tokens',
    template: "<HeaderBuyW12Tokens></HeaderBuyW12Tokens>",
    components: {
        HeaderBuyW12Tokens
    }
});

new Vue({
    store,
    el: '#SidebarMenu',
    template: "<SidebarMenu></SidebarMenu>",
    components: {
        SidebarMenu
    }
});

new Vue({
    store,
    el: '#appFooter',
    template: "<Footer></Footer>",
    components: {
        Footer
    }
});