<template>
    <div class="header-lang">
        <a href="#" id="p-lang" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><span>{{ currentLang }}</span></a>
        <div class="dropdown-menu" aria-labelledby="p-lang">
            <a v-for="lang in allLang" class="dropdown-item" @click="select(lang)">{{lang}}</a>
        </div>
    </div>
</template>

<script>
    import { LANG_UPDATE, LANG_UPDATE_META } from "store/modules/Lang.js";
    import {createNamespacedHelpers} from "vuex";
    import axios from "axios";

    const LangNS = createNamespacedHelpers("Lang");

    export default {
        name: 'LangSwitch',
        template: '#LangSwitchTemplate',
        computed: {
            ...LangNS.mapState({
                currentLang: "current",
                allLang: "all"
            }),
        },
        methods: {
            select(lang){
                this.$i18n.set(lang);
                this.$store.commit(`Lang/${LANG_UPDATE}`, {current: lang});
            }
        },
        created(){
            this.$i18n.set(this.currentLang);

            axios.get("/ru/api/translate/w12translations.json").then((response) =>{
                if (response.data) {
                    let translations = response.data;
                    let labelsLang = [];
                    let arrayTranslations = {};

                    for (const label in translations) {
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
                    this.$store.commit(`Lang/${LANG_UPDATE}`, {all: labelsLang});
                }
            }, function (e) {
                this.$store.commit(`Lang/${LANG_UPDATE_META}`, {loadingError: e.message});
            });
        },
    };
</script>