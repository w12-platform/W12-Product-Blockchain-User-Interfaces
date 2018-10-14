<template>
    <div class="AdminDashboard buefy" v-if="!langMeta.loading">
        <section class="container">
            <h2>{{ $t('AdminDashboard') }}</h2>

            <ListerSwitch></ListerSwitch>

            <b-notification class="AdminDashboard__error" v-if="isError && !isLoading" type="is-danger" :closable="false" has-icon>
                <span v-if="ledgerMeta.loadingError">{{ ledgerMeta.loadingError }}</span>
                <span v-if="tokensListMeta.loadingError">{{ tokensListMeta.loadingError }}</span>
                <span v-if="accountMeta.loadingError">{{ accountMeta.loadingError }}</span>
            </b-notification>

            <b-notification v-if="isLoading && !isError" :closable="false" class="AdminDashboard__loader">
                <span v-if="ledgerMeta.loading">{{ $t('AdminDashboardLoadLedger') }}<br></span>
                <span v-if="tokensListMeta.loading">{{ $t('AdminDashboardLoadTokens') }}<br></span>

                <b-loading :is-full-page="false" :active.sync="isLoading" :can-cancel="true"></b-loading>
            </b-notification>

            <div v-if="!isLoading && this.currentAccount">
                <WhiteListTable :is="WhiteListTableVersion"></WhiteListTable>
                <WhiteListForm :is="WhiteListFormVersion"></WhiteListForm>
            </div>
        </section>
        <Steps :number="4" :blocked="nextStepBlocked" link="/project.html"></Steps>
    </div>
</template>

<script>
    import './default.scss';

    import ListerSwitch from 'bem/ListerSwitch';
    import Steps from "bem/Steps";

    import {createNamespacedHelpers} from "vuex";

    const LedgerNS = createNamespacedHelpers("Ledger");
    const AccountNS = createNamespacedHelpers("Account");
    const WhitelistNS = createNamespacedHelpers("Whitelist");
    const LangNS = createNamespacedHelpers("Lang");
    const ConfigNS = createNamespacedHelpers("Config");

    export default {
        name: 'AdminDashboard',
        template: '#AdminDashboardTemplate',
        components: {
            ListerSwitch,
            Steps
        },
        data() {
            return {
                meta: {
                    loading: false,
                }
            };
        },
        computed: {
            ...LedgerNS.mapState({
                ledgerMeta: 'meta',
            }),
            ...WhitelistNS.mapState({
                tokensListMeta: 'meta',
                tokensList: "list"
            }),
            ...AccountNS.mapState({
                currentAccount: "currentAccount",
                accountMeta: "meta",
            }),
            ...LangNS.mapState({
                langMeta: 'meta'
            }),
            ...ConfigNS.mapState({
                W12Lister: 'W12Lister'
            }),

            isLoading() {
                return this.tokensListMeta.loading && this.meta.loading;
            },
            isError() {
                return this.ledgerMeta.loadingError || this.tokensListMeta.loadingError || this.accountMeta.loadingError;
            },
            WhiteListTableVersion(){
                const v = this.W12Lister.version;
                return () => import("bem/WhiteListTable/" + v);
            },
            WhiteListFormVersion(){
                const v = this.W12Lister.version;
                return () => import("bem/WhiteListForm/" + v);
            },
            nextStepBlocked(){
                return this.isPendingTx ? this.$t('StepsBlockedTx') : false;
            }
        },
        methods: {
            ...WhitelistNS.mapActions({
                whitelistFetch: "fetch",
            }),
            ...AccountNS.mapActions({
                watchCurrentAccount: 'watch',
            }),

            async handleW12ListerChange(){
                await this.whitelistFetch();
            }
        },
        watch: {
            'W12Lister': {
                handler: 'handleW12ListerChange'
            },
        },
        async created() {
            this.meta.loading = true;

            await this.watchCurrentAccount();
            await this.whitelistFetch();

            this.meta.loading = false;
            window.dispatchEvent(new Event('resize'));
        },
    };
</script>
