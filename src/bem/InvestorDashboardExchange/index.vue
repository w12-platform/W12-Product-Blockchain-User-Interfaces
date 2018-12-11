<template>
    <div class="InvestorDashboardExchange buefy" v-if="!langMeta.loading">
        <section class="container">
            <h2>{{ $t('InvestorDashboard') }}</h2>

            <b-notification class="InvestorDashboardExchange__error" v-if="isError" type="is-danger" has-icon>
                <span v-if="ledgerMeta.loadingError">{{ $t(ledgerMeta.loadingError) }}</span>
                <span v-if="tokensListMeta.loadingError">{{ $t(tokensListMeta.loadingError) }}</span>
                <span v-if="accountMeta.loadingError">{{ $t(accountMeta.loadingError)  }}</span>
            </b-notification>

            <b-notification v-if="isLoading && !isError" :closable="false" class="InvestorDashboardExchange__loader">
                <p v-html="$t('InvestorDashboardLoadLedger')"></p>

                <b-loading :is-full-page="false" :active="isLoading"></b-loading>
            </b-notification>

            <div v-if="!isLoading">
                <TokenSwitch v-if="!isCurrentToken"></TokenSwitch>
                <ExchangeTokens></ExchangeTokens>
            </div>
        </section>
        <Steps :number="8"></Steps>
    </div>
</template>

<script>
    import './default.scss';
    import Web3 from 'web3';
    import {createNamespacedHelpers} from "vuex";

    import TokenSwitch from 'bem/TokenSwitch';
    import ExchangeTokens from 'bem/ExchangeTokens';
    import Steps from "bem/Steps";

    const LedgerNS = createNamespacedHelpers("Ledger");
    const AccountNS = createNamespacedHelpers("Account");
    const TokensListNS = createNamespacedHelpers("TokensList");
    const LangNS = createNamespacedHelpers("Lang");
    const TransactionsNS = createNamespacedHelpers("Transactions");

    const web3 = new Web3();
    const BigNumber = web3.BigNumber;

    export default {
        name: 'InvestorDashboardExchange',
        components: {
            TokenSwitch,
            ExchangeTokens,
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
            isCurrentToken(){
                return typeof CurrentToken !== 'undefined';
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
                    if(this.isCurrentToken){
                        await this.FetchTokenByCurrentToken(CurrentToken);
                    } else {
                        await this.tokensListFetch();
                    }
                    await this.updateAccountData();
                    this.meta.loading = false;
                    window.dispatchEvent(new Event('resize'));
                }
            }
        },
        watch: {
            'currentAccount': {
                handler: 'handleCurrentAccountChange',
                immediate: true
            },
        },
        async created() {
            this.meta.loading = true;
            await this.watchCurrentAccount();
        }
    };
</script>
