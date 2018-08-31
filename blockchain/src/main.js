import Vue from 'vue';
import Buefy from 'buefy';
import vuexI18n from 'vuex-i18n';
import VueMask from 'v-mask';
import Cleave from 'vue-cleave-component';

import 'bem/buefy/default.scss';
import ConfigDashboad from 'bem/ConfigDashboad';
import AdminDashboard from 'bem/AdminDashboard';
import ProjectDashboard from 'bem/ProjectDashboard';
import InvestorDashboard from 'bem/InvestorDashboard';
import store from "store";

Vue.use(VueMask);
Vue.use(Buefy);
Vue.use(Cleave);

Vue.use(vuexI18n.plugin, store, {
    translateFilterName: 't'
});
Vue.i18n.set(translationsDef);

let arrayTranslations = {};
for (const label in translations) {
    for (const language in translations[label]) {
        if (translations[label].hasOwnProperty(language)) {
            if (!arrayTranslations.hasOwnProperty(language)) {
                arrayTranslations[language] = {};
            }
            arrayTranslations[language][label] = translations[label][language];
        }
    }
}
for (const language in arrayTranslations) {
    if (arrayTranslations.hasOwnProperty(language)) {
        Vue.i18n.add(language, arrayTranslations[language]);
    }
}

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

new Vue({
    el: '#appTitle',
    template: "<h1 class='text-center purchase-heading'>{{ $t('GeneralTitle') }}</h1>",
});
