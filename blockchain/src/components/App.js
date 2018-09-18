import Vue from 'vue';
import Buefy from 'buefy';
import vuexI18n from 'vuex-i18n';
import VueMask from 'v-mask';
import Cleave from 'vue-cleave-component';
import Tooltip from 'vue-directive-tooltip';
import 'vue-directive-tooltip/css/index.css';
import LangPlugin from 'plugin/LangPlugin';

import 'bem/buefy/default.scss';
import store from "store";

Vue.use(VueMask);
Vue.use(Buefy);
Vue.use(Cleave);
Vue.use(Tooltip);

Vue.use(vuexI18n.plugin, store, {
    translateFilterName: 't'
});

Vue.use(LangPlugin);

import AdminDashboard from 'bem/AdminDashboard';
import LangSwitch from 'bem/LangSwitch';
import SidebarMenu from 'bem/SidebarMenu';
import AppFooter from 'bem/Footer';
import Factory from 'bem/Factory';
import ConfigDashboard from 'bem/ConfigDashboard';
import HeaderBuyW12Tokens from 'bem/Header/BuyW12Tokens';
import Home from 'bem/Home';
import InvestorDashboard from 'bem/InvestorDashboard';
import InvestorDashboardExchange from 'bem/InvestorDashboardExchange';
import InvestorDashboardRefund from 'bem/InvestorDashboardRefund';
import ProjectDashboard from 'bem/ProjectDashboard';
import ProjectDashboardReceiving from 'bem/ProjectDashboardReceiving';
import ProjectDashboardTranche from 'bem/ProjectDashboardTranche';

new Vue({
    store,
    el: '#app',
    components: {
        LangSwitch,
        HeaderBuyW12Tokens,
        AdminDashboard,
        SidebarMenu,
        AppFooter,
        Factory,
        ConfigDashboard,
        Home,
        InvestorDashboard,
        InvestorDashboardExchange,
        InvestorDashboardRefund,
        ProjectDashboard,
        ProjectDashboardReceiving,
        ProjectDashboardTranche,
    }
});