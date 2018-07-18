import Vue from 'vue';
import Buefy from 'buefy'

import ConfigDashboad from './bem/ConfigDashboad';
import AdminDashboard from './bem/AdminDashboad';
import ProjectDashboard from './bem/ProjectDashboard';
import InvestorDashboard from './bem/InvestorDashboard';
import store from "./store";

Vue.use(Buefy);

const appConfigDashboad = new Vue({
    store,
    el: '#appConfigDashboad',
    template: "<config-dashboad></config-dashboad>",
    components: {
        ConfigDashboad
    }
});

const appAdminDashboard = new Vue({
    store,
    el: '#appAdminDashboard',
    template: "<admin-dashboard></admin-dashboard>",
    components: {
        AdminDashboard
    }
});

const appProjectDashboard = new Vue({
    store,
    el: '#appProjectDashboard',
    template: "<project-dashboard></project-dashboard>",
    components: {
        ProjectDashboard
    }
});

const appInvestorDashboard = new Vue({
    store,
    el: '#appInvestorDashboard',
    template: "<investor-dashboard></investor-dashboard>",
    components: {
        InvestorDashboard
    }
});

