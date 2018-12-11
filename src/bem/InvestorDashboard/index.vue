<template>
    <div class="InvestorDashboard buefy" v-if="!langMeta.loading">
        <section class="container">
            <h2>{{ $t('InvestorDashboard') }}</h2>

            <b-notification class="InvestorDashboard__error" v-if="isError" type="is-danger" has-icon>
                <span v-if="ledgerMeta.loadingError">{{ $t(ledgerMeta.loadingError) }}</span>
                <span v-if="tokensListMeta.loadingError">{{ $t(tokensListMeta.loadingError) }}</span>
                <span v-if="accountMeta.loadingError">{{ $t(accountMeta.loadingError)  }}</span>
            </b-notification>

            <b-notification v-if="isLoading && !isError" :closable="false" class="InvestorDashboard__loader">
                <p v-html="$t('InvestorDashboardLoadLedger')"></p>

                <b-loading :is-full-page="false" :active="isLoading"></b-loading>
            </b-notification>

            <div v-if="!isLoading && currentToken">
                <TokenSwitch v-if="!isCurrentToken"></TokenSwitch>
                <Calculator></Calculator>
                <SaleTable></SaleTable>
                <RoadMap></RoadMap>
                <CrowdSale></CrowdSale>
            </div>
        </section>
        <Steps :number="6"></Steps>
    </div>
</template>

<script>
    import './default.scss';

    import {createNamespacedHelpers} from "vuex";
    import Web3 from 'web3';

    import TokenSwitch from 'bem/TokenSwitch';
    import CrowdSale from 'bem/CrowdSale';
    import SaleTable from 'bem/SaleTable';
    import Calculator from 'bem/Calculator';
    import Steps from "bem/Steps";
    import RoadMap from "bem/RoadMap";

    const LedgerNS = createNamespacedHelpers("Ledger");
    const AccountNS = createNamespacedHelpers("Account");
    const TokensListNS = createNamespacedHelpers("TokensList");
    const LangNS = createNamespacedHelpers("Lang");
    const TransactionsNS = createNamespacedHelpers("Transactions");

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
            Steps,
            RoadMap
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
                    window.dispatchEvent(new Event('resize'));
                    this.meta.loading = false;
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
        },
    };
</script>
