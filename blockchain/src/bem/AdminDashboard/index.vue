<template>
    <div class="AdminDashboard buefy" v-if="!langMeta.loading">
        <section class="container">
            <h2>{{ $t('AdminDashboard') }}</h2>

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
                <WhiteListTable></WhiteListTable>
                <WhiteListForm></WhiteListForm>
            </div>
        </section>
    </div>
</template>

<script>
    import './default.scss';

    import WhiteListTable from 'bem/WhiteListTable';
    import WhiteListForm from 'bem/WhiteListForm';

    import {createNamespacedHelpers} from "vuex";

    const LedgerNS = createNamespacedHelpers("Ledger");
    const AccountNS = createNamespacedHelpers("Account");
    const WhitelistNS = createNamespacedHelpers("Whitelist");
    const LangNS = createNamespacedHelpers("Lang");

    export default {
        name: 'AdminDashboard',
        template: '#AdminDashboardTemplate',
        components: {
            WhiteListTable,
            WhiteListForm
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

            isLoading() {
                return this.tokensListMeta.loading && this.meta.loading;
            },
            isError() {
                return this.ledgerMeta.loadingError || this.tokensListMeta.loadingError || this.accountMeta.loadingError;
            },
        },
        methods: {
            ...WhitelistNS.mapActions({
                whitelistFetch: "fetch",
            }),
            ...AccountNS.mapActions({
                watchCurrentAccount: 'watch',
            }),
        },
        async created() {
            this.meta.loading = true;

            await this.watchCurrentAccount();
            await this.whitelistFetch();

            this.meta.loading = false;
        },
    };
</script>
