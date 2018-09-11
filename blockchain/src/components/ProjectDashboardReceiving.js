import Vue from 'vue';
import Buefy from 'buefy';
import vuexI18n from 'vuex-i18n';
import VueMask from 'v-mask';
import Cleave from 'vue-cleave-component';
import Tooltip from 'vue-directive-tooltip';
import 'vue-directive-tooltip/css/index.css';

import 'bem/buefy/default.scss';
import ProjectDashboardReceiving from 'bem/ProjectDashboardReceiving';
import store from "store";

Vue.use(VueMask);
Vue.use(Buefy);
Vue.use(Cleave);
Vue.use(Tooltip);

Vue.use(vuexI18n.plugin, store, {
    translateFilterName: 't'
});

import LangPlugin from 'plugin/LangPlugin';
Vue.use(LangPlugin);

new Vue({
    store,
    el: '#appProjectDashboardReceiving',
    template: "<project-dashboard-receiving></project-dashboard-receiving>",
    components: {
        ProjectDashboardReceiving
    }
});