<template>
    <a v-if="!langMeta.loading" class="Header__buytokens btn actions__buytokens" href="https://w12.io/buy-w12/?utm_source=test-net&amp;utm_medium=demo_page" target="_blank">{{ $t('HeaderByuW12Tokens') }}</a>
</template>

<script>
    import './default.scss';
    import {createNamespacedHelpers} from "vuex";

    const LangNS = createNamespacedHelpers("Lang");

    export default {
        name: 'BuyW12Tokens',
        template: '#BuyW12TokensTemplate',
        computed: {
            ...LangNS.mapState({
                langMeta: 'meta'
            })
        },
    };
</script>