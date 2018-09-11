import {createNamespacedHelpers} from "vuex";
import { LANG_UPDATE_META } from "store/modules/Lang.js";
const LangNS = createNamespacedHelpers("Lang");

const LangPlugin = {
    install(Vue, options) {
        Vue.mixin({
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
                        //this.$store.commit(`Lang/${LANG_UPDATE}`, {all: labelsLang});
                        window.dispatchEvent(new Event('resize'));
                    }
                }
            }
        })
    },
};
export default LangPlugin;