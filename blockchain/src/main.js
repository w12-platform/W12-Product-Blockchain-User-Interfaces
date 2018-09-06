import Vue from 'vue';
import Buefy from 'buefy';
import vuexI18n from 'vuex-i18n';
import VueMask from 'v-mask';
import Cleave from 'vue-cleave-component';

import 'bem/buefy/default.scss';
import Factory from 'bem/Factory';
import ConfigDashboad from 'bem/ConfigDashboad';
import AdminDashboard from 'bem/AdminDashboard';
import ProjectDashboard from 'bem/ProjectDashboard';
import InvestorDashboard from 'bem/InvestorDashboard';
import LangSwitch from 'bem/LangSwitch';
import Title from 'bem/Title';
import SidebarMenu from 'bem/SidebarMenu';
import HeaderBuyW12Tokens from 'bem/Header/BuyW12Tokens';
import store from "store";

Vue.use(VueMask);
Vue.use(Buefy);
Vue.use(Cleave);

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

const patch = window.location.pathname;

const appConfigDashboad = (patch === "/config") || (patch === "/config.html") ? new Vue({
    store,
    el: '#appConfigDashboad',
    template: "<config-dashboad></config-dashboad>",
    components: {
        ConfigDashboad
    }
}):null;

const appAdminDashboard = (patch === "/listing") || (patch === "/listing.html") ? new Vue({
    store,
    el: '#appAdminDashboard',
    template: "<admin-dashboard></admin-dashboard>",
    components: {
        AdminDashboard
    }
}):null;

const appFactory = (patch === "/factory") || (patch === "/factory.html") ? new Vue({
    store,
    el: '#appFactory',
    template: "<factory></factory>",
    components: {
        Factory
    }
}):null;

const appProjectDashboard = (patch === "/project") || (patch === "/project.html") ? new Vue({
    store,
    el: '#appProjectDashboard',
    template: "<project-dashboard></project-dashboard>",
    components: {
        ProjectDashboard
    }
}):null;

const appInvestorDashboard = (patch === "/crowdsale") || (patch === "/crowdsale.html") ? new Vue({
    store,
    el: '#appInvestorDashboard',
    template: "<investor-dashboard></investor-dashboard>",
    components: {
        InvestorDashboard
    }
}):null;

const appTitle = (patch === "/") || (patch === "/index.html") ? new Vue({
    store,
    el: '#appTitle',
    template: "<Title></Title>",
    components: {
        Title
    }
}):null;

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