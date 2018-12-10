import Vue from 'vue';
import Buefy from 'buefy';
import vuexI18n from 'vuex-i18n';
import Cleave from 'vue-cleave-component';
import Tooltip from 'vue-directive-tooltip';
import MultiSelect from 'vue-multiselect'
import 'vue-directive-tooltip/css/index.css';
import {createNamespacedHelpers} from "vuex";
import { LANG_UPDATE_META } from "@/store/modules/Lang.js";
const LangNS = createNamespacedHelpers("Lang");
import Config from '@/config';
import * as Sentry from '@sentry/browser';
import pkg from '../package';
import 'src/bem/buefy/default.scss';
import store from "store";

Sentry.init({
    dsn: 'https://9accf8a0540e45cebd4205d53297ca13@sentry.io/1309666',
    release: pkg.version,
    environment: process.env.NODE_ENV,
    beforeSend(event) {
        if(event.level){
            return Config.sentry.allowedLevel.match(event.level) ? event : null;
        }
        return event;
    }
});

Vue.use(Buefy);
Vue.use(Cleave);
Vue.use(Tooltip);
Vue.component('multiselect', MultiSelect);

Vue.use(vuexI18n.plugin, store, {
    translateFilterName: 't'
});

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
import Versions from 'bem/Versions';
import MetaMask from 'bem/MetaMask';

new Vue({
    store,
    el: '#app',
    components: {
        LangSwitch,
        HeaderBuyW12Tokens,
        MetaMask,
        AdminDashboard,
        SidebarMenu,
        AppFooter,
        Factory,
        ConfigDashboard: (
            process.env.NODE_ENV === 'development'
                ? ConfigDashboard
                : undefined
        ),
        Home,
        InvestorDashboard,
        InvestorDashboardExchange,
        InvestorDashboardRefund,
        ProjectDashboard,
        ProjectDashboardReceiving,
        ProjectDashboardTranche,
        Versions,
    },
    computed: {
        ...LangNS.mapState({
            currentLang: 'current',
            vocabulary: 'vocabulary'
        }),
    },
    methods: {
        ...LangNS.mapActions({
            getLang: "getLang",
            getVocabulary: "getVocabulary"
        }),
    },
    async created() {
        if(this.$store){
            await this.getLang();
            await this.getVocabulary();
            if(this.$i18n && this.vocabulary && this.currentLang){
                this.$i18n.set(this.currentLang);

                let labelsLang = [];
                let arrayTranslations = {};
                let translations = this.vocabulary;
                for (const label in translations){
                    for (const language in translations[label]) {
                        if(labelsLang.indexOf(language) === -1 ){
                            labelsLang.push(language);
                        }
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
                        this.$i18n.add(language, arrayTranslations[language]);
                    }
                }

                this.$store.commit(`Lang/${LANG_UPDATE_META}`, {loading: false});
                window.dispatchEvent(new Event('resize'));
            }
            await this.$store.dispatch('Cache/startWatchBlockNumberUpdate');
        }
    }
});
