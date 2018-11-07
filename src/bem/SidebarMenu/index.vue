<template>
    <div v-if="!langMeta.loading">
        <a class="btn sidebar-btn warn" href="https://tokensale.w12.io/?utm_source=test-net&amp;utm_medium=demo_page" data-warn="!" target="_blank" v-html="$t('SidebarMenuHowItWorks')"></a>
        <a class="btn sidebar-btn" target="_blank" href="https://github.com/w12-platform/W12-Product-Blockchain-Protocol" v-html="$t('SidebarMenuViewCodeProduct')"></a>
        <a class="btn sidebar-btn" target="_blank" href="https://github.com/w12-platform/W12-Product-Blockchain-User-Interfaces" v-html="$t('SidebarMenuViewCodeUI')"></a>
        <a class="btn sidebar-btn" target="_blank" :href="$t('SidebarMenuReadYellowpaperHref')" v-html="$t('SidebarMenuReadYellowpaper')"></a>
        <a class="btn sidebar-btn" target="_blank" href="https://tokensale.w12.io/?utm_source=test-net&amp;utm_medium=demo_page" v-html="$t('SidebarMenuGoMarketplace')"></a>
        <a class="btn sidebar-btn" target="_blank" :href="$t('SidebarMenuReadWhitePaperHref')" v-html="$t('SidebarMenuReadWhitePaper')"></a>
        <a class="btn sidebar-btn" target="_blank" :href="$t('SidebarMenuTelegramHref')" v-html="$t('SidebarMenuTelegram')"></a>
    </div>
</template>

<script>
    import {createNamespacedHelpers} from "vuex";

    const LangNS = createNamespacedHelpers("Lang");

    export default {
        name: 'SidebarMenu',
        template: '#SidebarMenuTemplate',
        computed: {
            ...LangNS.mapState({
                langMeta: 'meta'
            })
        },
    };
</script>