<template>
    <div class="TokenSwitch buefy">
        <div v-for="(token, idx) in list"
             :key="idx"
             :class="tagClass(token)"
             @click="onSelect(token)"
             v-if="token"
        >{{ token.name }}</div>
    </div>
</template>

<script>
    import './default.scss';

    import { TOKEN_SELECTED } from "store/modules/TokensList";
    import { createNamespacedHelpers } from "vuex";

    const TokensListNS = createNamespacedHelpers("TokensList");

    export default {
        name: 'TokenSwitch',
        template: '#TokenSwitchTemplate',
        components: {},
        watch: {},
        computed: {
            ...TokensListNS.mapState({
                list: "list",
                currentToken: "currentToken"
            }),
        },
        methods: {
            ...TokensListNS.mapActions({
                tokensListUpdate: "update"
            }),

            async onSelect(token){
                this.tokensListUpdate(token);
            },
            tagClass(token){
                return {
                    'TokenSwitch__tag': true,
                    'TokenSwitch__selected': token.hasOwnProperty('index') && token.hasOwnProperty('version')
                        ? this.currentToken.index === token.index && this.currentToken.version === token.version
                        : false,
                }
            },
        }
    };
</script>