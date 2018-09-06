<template>
    <div :class="isClasses" @click="isOpen = !isOpen">
        <span class="select__placeholder">{{ currentLang }}</span>
        <ul class="select__list">
            <li v-for="lang in allLang"  @click="select(lang)" :data-value="lang">{{lang}}</li>
        </ul>
        <input type="hidden" name="select-value">
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

            isClasses(){
                return {
                    "is-open" : this.isOpen,
                    "actions__select": true,
                    "select": true
                }
            }
        },
        data() {
            return {
                isOpen: false
            };
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
                    let labelsLang = [];
                    let arrayTranslations = {};

                    /* set local file */
                    let translations = LocalTranslations;
                    for (const label in LocalTranslations){
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

                    translations = response.data;
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
            }, (e) => {
                /* set local file */
                let labelsLang = [];
                let arrayTranslations = {};
                let translations = LocalTranslations;
                for (const label in LocalTranslations){
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
            });
        },
    };
</script>