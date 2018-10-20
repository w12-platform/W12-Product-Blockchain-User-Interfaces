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
    import { LANG_UPDATE } from "@/store/modules/Lang.js";
    import {createNamespacedHelpers} from "vuex";

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
                this.$store.commit(`Lang/${LANG_UPDATE}`, {current: lang});
                document.location.replace(window.location.origin + window.location.pathname + "?lang=" + lang);
            }
        },
    };
</script>