<template>
    <div class="InvestorDashboardRefund buefy" v-if="!langMeta.loading">
        <section class="container">
            <h2 v-html="$t('InvestorDashboard')"></h2>

            <b-notification class="InvestorDashboardRefund__error" v-if="isError" type="is-danger" has-icon>
                <span v-if="ledgerMeta.loadingError">{{ ledgerMeta.loadingError }}</span>
                <span v-if="tokensListMeta.loadingError">{{ tokensListMeta.loadingError }}</span>
                <span v-if="accountMeta.loadingError">{{ accountMeta.loadingError }}</span>
            </b-notification>

            <b-notification v-if="isLoading && !isError" :closable="false" class="InvestorDashboardRefund__loader">
                <p v-html="$t('InvestorDashboardLoadLedger')"></p>

                <b-loading :is-full-page="false" :active="isLoading" :can-cancel="true"></b-loading>
            </b-notification>

            <div v-if="!isLoading">
                <TokenSwitch v-if="!hasCurrentToken"></TokenSwitch>
                <component :is="RefundEthComponent"></component>
            </div>
        </section>
        <Steps :number="7"></Steps>
    </div>
</template>

<script>
    import './default.scss';

    import semver from 'semver';
    import {createNamespacedHelpers} from "vuex";

    import TokenSwitch from 'bem/TokenSwitch';
    import Steps from "bem/Steps";

    const LedgerNS = createNamespacedHelpers("Ledger");
    const AccountNS = createNamespacedHelpers("Account");
    const TokensListNS = createNamespacedHelpers("TokensList");
    const LangNS = createNamespacedHelpers("Lang");
    const TransactionsNS = createNamespacedHelpers("Transactions");

    export default {
        name: 'InvestorDashboardRefund',
        components: {
            TokenSwitch,
            Steps
        },
        data() {
            return {
                meta: {
                    loading: false,
                },
                hasCurrentToken: !!window.CurrentToken
            };
        },
        computed: {
            ...LedgerNS.mapState({
                ledgerMeta: 'meta',
            }),
            ...TokensListNS.mapState({
                list: "list",
                tokensListMeta: 'meta',
                currentToken: "currentToken"
            }),
            ...AccountNS.mapState({
                currentAccount: "currentAccount",
                currentAccountData: "currentAccountData",
                accountMeta: "meta",
            }),
            ...LangNS.mapState({
                langMeta: 'meta'
            }),

            isLoading() {
                return this.tokensListMeta.loading || this.meta.loading || !this.currentToken || !this.list.length;
            },
            isError() {
                return this.ledgerMeta.loadingError || this.tokensListMeta.loadingError || this.accountMeta.loadingError;
            },
            RefundEthComponent() {
                if (!this.currentToken) return;

                const {version} = this.currentToken;

                if (semver.satisfies(version, '<0.26.0')) {
                    return () => import('@/bem/RefundEth/0.20.5/index.vue');
                } else if (semver.satisfies(version, '>=0.26.0')) {
                    return () => import('@/bem/RefundEth/0.27.1/index.vue');
                }
            }
        },
        methods: {
            ...LedgerNS.mapActions({
                ledgerFetch: "fetch"
            }),
            ...TokensListNS.mapActions({
                tokensListFetch: "fetch",
                tokensListWatch: "watch",
                FetchTokenByCurrentToken: "fetchTokenByCurrentToken"
            }),
            ...AccountNS.mapActions({
                watchCurrentAccount: 'watch',
                updateAccountData: 'updateAccountData',
            }),
            ...TransactionsNS.mapActions({
                transactionsUpStatusTx: "updateStatusTx"
            }),

            async handleCurrentAccountChange(currentAccount) {
                if(currentAccount){
                    await this.transactionsUpStatusTx();
                    if(this.hasCurrentToken){
                        await this.FetchTokenByCurrentToken(window.CurrentToken);
                    } else {
                        await this.tokensListFetch();
                    }
                    await this.updateAccountData();
                    window.dispatchEvent(new Event('resize'));
                    this.meta.loading = false;
                }
            },

            async handleCurrentTokenChange(currentToken) {
                await this.updateAccountData();
            }
        },
        watch: {
            'currentAccount': {
                handler: 'handleCurrentAccountChange',
                immediate: true
            },
            'currentToken': {
                handler: 'handleCurrentTokenChange',
                immediate: true
            }
        },
        async created() {
            this.meta.loading = true;
            await this.watchCurrentAccount();
        }
    };
</script>
