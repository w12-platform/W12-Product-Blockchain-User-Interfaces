<template>
    <div class="InvestorDashboard buefy" v-if="!langMeta.loading">
        <section class="container">
            <h2>{{ $t('InvestorDashboard') }}</h2>

            <b-notification class="InvestorDashboard__error" v-if="isError && !isLoading" type="is-danger" has-icon>
                <span v-if="ledgerMeta.loadingError">{{ ledgerMeta.loadingError }}</span>
                <span v-if="tokensListMeta.loadingError">{{ tokensListMeta.loadingError }}</span>
                <span v-if="accountMeta.loadingError">{{ accountMeta.loadingError }}</span>
            </b-notification>

            <b-notification v-if="isLoading && !currentToken && !currentAccountData" :closable="false" class="InvestorDashboard__loader">
                <span v-if="ledgerMeta.loading">{{ $t('InvestorDashboardLoadLedger') }}<br></span>
                <span v-if="tokensListMeta.loading">{{ $t('InvestorDashboardLoadTokens') }}<br></span>

                <b-loading :is-full-page="false" :active.sync="isLoading" :can-cancel="true"></b-loading>
            </b-notification>

            <div v-if="!isLoading && currentToken && currentAccountData">
                <TokenSwitch></TokenSwitch>
                <CrowdSale></CrowdSale>
                <SaleTable></SaleTable>
                <Calculator></Calculator>
                <ExchangeTokens></ExchangeTokens>
                <RefundEth></RefundEth>
            </div>
        </section>
    </div>
</template>

<script>
    import './default.scss';

    import {createNamespacedHelpers} from "vuex";

    import TokenSwitch from 'bem/TokenSwitch';
    import CrowdSale from 'bem/CrowdSale';
    import SaleTable from 'bem/SaleTable';
    import Calculator from 'bem/Calculator';
    import ExchangeTokens from 'bem/ExchangeTokens';
    import RefundEth from 'bem/RefundEth';

    const LedgerNS = createNamespacedHelpers("Ledger");
    const AccountNS = createNamespacedHelpers("Account");
    const TokensListNS = createNamespacedHelpers("TokensList");
    const LangNS = createNamespacedHelpers("Lang");
    const TransactionsNS = createNamespacedHelpers("Transactions");

    const moment = window.moment;
    const web3 = new Web3();
    const BigNumber = web3.BigNumber;

    export default {
        name: 'InvestorDashboard',
        filters: {
            toEth(value) {
                value = new BigNumber(value);
                return web3.fromWei(value, 'ether').toString();
            },
            decimals(value) {
                const d = this.currentToken ? this.currentToken.decimals : 0;
                const base = new BigNumber(10);
                value = new BigNumber(value);
                return value.div(base.pow(d)).toString();
            },
        },
        components: {
            TokenSwitch,
            CrowdSale,
            SaleTable,
            Calculator,
            ExchangeTokens,
            RefundEth
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
                return this.tokensListMeta.loading && this.meta.loading;
            },
            isError() {
                return this.ledgerMeta.loadingError || this.tokensListMeta.loadingError || this.accountMeta.loadingError;
            },
        },
        methods: {
            ...LedgerNS.mapActions({
                ledgerFetch: "fetch"
            }),
            ...TokensListNS.mapActions({
                tokensListFetch: "fetch",
                tokensListWatch: "watch"
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
                    await this.tokensListFetch();
                    await this.updateAccountData();
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

            this.meta.loading = false;
        }
    };
</script>