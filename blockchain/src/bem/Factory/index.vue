<template>
    <div class="Factory buefy" v-if="!langMeta.loading">
        <section class="container">
            <h2>{{ $t('TokensFactoryTitle') }}</h2>

            <b-notification class="AdminDashboard__error" v-if="isError && !isLoading" type="is-danger" :closable="false" has-icon>
                <span v-if="ledgerMeta.loadingError">{{ ledgerMeta.loadingError }}</span>
                <span v-if="accountMeta.loadingError">{{ accountMeta.loadingError }}</span>
            </b-notification>

            <b-notification v-if="isLoading && !isError" :closable="false" class="AdminDashboard__loader">
                <span v-if="ledgerMeta.loading">{{ $t('AdminDashboardLoadLedger') }}<br></span>

                <b-loading :is-full-page="false" :active.sync="isLoading" :can-cancel="true"></b-loading>
            </b-notification>

            <div v-if="!isLoading && this.currentAccount">
                <b-table
                        detailed
                        :data="list"
                        :mobile-cards="true"
                        paginated
                        per-page="10"
                        pagination-simple>
                    <template slot-scope="props">
                        <b-table-column field="date" :label="$t('AdminDashboardTableToken')" :title="props.row.tokenAddress">
                            <span class="tag is-success">{{ props.row.address | shortAddress }}</span>
                        </b-table-column>

                        <b-table-column field="date" :label="$t('AdminDashboardTableName')">
                            {{ props.row.name }}
                        </b-table-column>

                        <b-table-column field="date" :label="$t('AdminDashboardTableSymbol')" centered>
                            {{ props.row.symbol }}
                        </b-table-column>

                        <b-table-column field="date" :label="$t('AdminDashboardTableDecimals')" centered>
                            {{ props.row.decimals.toString() }}
                        </b-table-column>
                    </template>

                    <template slot="detail" slot-scope="props">
                        <div class="WhiteListTable__detail">
                            <div class="WhiteListTable__detailField">
                                {{ $t('AdminDashboardTableToken') }} :
                                <div class="WhiteListTable__detailToken">
                                    <span class="tag is-success">{{ props.row.address }}</span>
                                </div>
                            </div>
                        </div>
                    </template>

                    <b-loading :is-full-page="false" :active.sync="meta.loading" :can-cancel="true"></b-loading>
                </b-table>
                <div class="pm-2" v-if="isPendingTx">
                    <p class="py-2">{{ $t('WaitingConfirm') }}:</p>
                    <b-tag class="py-2">{{isPendingTx.hash}}</b-tag>
                </div>
                <div v-if="!isPendingTx">
                    <div class="form-group">
                        <label for="FactoryName">{{ $t('TokensFactoryCreateFormName') }}</label>
                        <b-field id="FactoryName">
                            <input type="text"
                                   class="form-control"
                                   v-model="createForm.name"/>
                        </b-field>
                    </div>
                    <div class="form-group">
                        <label for="FactorySymbol">{{ $t('TokensFactoryCreateFormSymbol') }}</label>
                        <b-field id="FactorySymbol">
                            <input type="text"
                                   class="form-control"
                                   v-model="createForm.symbol"/>
                        </b-field>
                    </div>
                    <div class="form-group">
                        <label for="FactoryDecimals">{{ $t('TokensFactoryCreateFormDecimals') }}</label>
                        <b-field id="FactoryDecimals">
                            <cleave v-model="createForm.decimals"
                                    class="form-control"
                                    :options="optionsNumber"
                                    min="0"
                                    max="255"
                            ></cleave>
                        </b-field>
                    </div>
                    <div class="form-group">
                        <label for="FactoryAmount">{{ $t('TokensFactoryCreateFormAmount') }}</label>
                        <b-field id="FactoryAmount">
                            <cleave v-model="createForm.amount"
                                    class="form-control"
                                    :options="optionsNumber"
                                    min="0"
                            ></cleave>
                        </b-field>
                    </div>
                    <b-notification class="ProjectStages__errorStage" v-if="error" @close="error = false" type="is-danger" has-icon>{{ error }}</b-notification>
                    <button class="btn btn-primary py-2 my-2" @click="create" :disabled="disable">{{
                        $t('TokensFactoryCreate') }}
                    </button>

                    <b-loading :is-full-page="false" :active.sync="meta.creating" :can-cancel="true"></b-loading>
                </div>
            </div>
        </section>
    </div>
</template>

<script>
    import './default.scss';
    import Connector from 'lib/Blockchain/DefaultConnector.js';
    import {waitTransactionReceipt} from 'lib/utils.js';
    import {UPDATE_TX, CONFIRM_TX} from "store/modules/Transactions.js";
    import {FACTORY_ADD} from "store/modules/Factory.js";

    import {createNamespacedHelpers} from "vuex";

    const web3 = new Web3();

    const LedgerNS = createNamespacedHelpers("Ledger");
    const AccountNS = createNamespacedHelpers("Account");
    const LangNS = createNamespacedHelpers("Lang");
    const ConfigNS = createNamespacedHelpers('Config');
    const FactoryNS = createNamespacedHelpers('Factory');
    const TransactionsNS = createNamespacedHelpers("Transactions");

    export default {
        name: 'Factory',
        template: '#FactoryTemplate',
        data() {
            return {
                createForm: {
                    name: null,
                    symbol: null,
                    decimals: 18,
                    amount: 100000
                },
                meta: {
                    loading: false,
                    creating: false
                },
                optionsNumber: {
                    prefix: '',
                    numeral: true,
                    numeralPositiveOnly: true,
                    noImmediatePrefix: true,
                    rawValueTrimPrefix: true,
                    numeralIntegerScale: 18,
                    numeralDecimalScale: 18
                },
                error: false,
                subscribeToEventsLoading: false,
                list: []
            };
        },
        filters: {
            shortAddress(value) {
                const length = value.length;
                return value.slice(0, 4) + ".." + value.slice(length - 2, length);
            },
            percentFractional(value) {
                return value/100;
            },
        },
        computed: {
            ...LedgerNS.mapState({
                ledgerMeta: 'meta',
            }),
            ...ConfigNS.mapState({
                FactoryTokens: "FactoryTokens"
            }),
            ...AccountNS.mapState({
                currentAccount: "currentAccount",
                accountMeta: "meta",
            }),
            ...LangNS.mapState({
                langMeta: 'meta'
            }),
            ...TransactionsNS.mapState({
                TransactionsList: "list"
            }),
            ...FactoryNS.mapState({
                FactoryList: "list"
            }),

            isPendingTx() {
                return this.TransactionsList && this.TransactionsList.length
                    ? this.TransactionsList.find((tr) => {
                        return tr.name
                        && tr.hash
                        && tr.status
                        && tr.name === "createToken"
                        && tr.status === "pending"
                            ? tr
                            : false
                    })
                    : false;
            },
            disable() {
                return !this.createForm.name
                    || !this.createForm.symbol
                    || !this.createForm.decimals
                    || !this.createForm.amount;
            },
            isLoading() {
                return this.meta.loading;
            },
            isError() {
                return this.ledgerMeta.loadingError || this.accountMeta.loadingError;
            },
        },
        methods: {
            ...AccountNS.mapActions({
                watchCurrentAccount: 'watch',
            }),
            ...LedgerNS.mapActions({
                ledgerFetch: "fetch"
            }),

            async create() {
                this.meta.creating = true;
                try {
                    const {WTokenTestHelperFactory} = await this.ledgerFetch();
                    const WTokenTestHelper = WTokenTestHelperFactory.at(this.FactoryTokens.address);
                    const connectedWeb3 = (await Connector.connect()).web3;

                    const tx = await WTokenTestHelper.methods.createToken(
                        this.createForm.name,
                        this.createForm.symbol,
                        this.createForm.decimals,
                        this.createForm.amount,
                    );

                    this.$store.commit(`Transactions/${UPDATE_TX}`, {
                        name: "createToken",
                        hash: tx,
                        status: "pending"
                    });
                    this.createForm.name = null;
                    this.createForm.symbol = null;

                    await waitTransactionReceipt(tx, connectedWeb3);
                } catch (e) {
                    this.error = e.message;
                }
                this.meta.creating = false;
            },
            async fetchList() {
                try {
                    const {DetailedERC20Factory} = await this.ledgerFetch();
                    let listInfo = [];
                    await this.FactoryList.forEach(async (address) => {
                        const DetailedERC20 = DetailedERC20Factory.at(address);
                        const tokenInformation = await DetailedERC20.getDescription();
                        const {name, symbol, decimals} = tokenInformation;
                        listInfo.push({ address, name, symbol, decimals });
                    });
                    this.list = listInfo;
                } catch (e) {
                    this.error = e.message;
                }
            },
            unsubscribeFromEvents() {
                if (!this.subscribedEvents) return;

                this.subscribedEvents.NewToken.stopWatching();
                this.subscribedEvents = null;
            },
            async subscribeToEvents() {
                if (this.subscribedEvents) return;
                this.subscribeToEventsLoading = true;

                try {
                    const {WTokenTestHelperFactory} = await this.ledgerFetch();
                    const WTokenTestHelper = WTokenTestHelperFactory.at(this.FactoryTokens.address);
                    const NewToken = WTokenTestHelper.events.NewToken(null, null, this.onNewTokenEvent);

                    this.subscribedEvents = {
                        NewToken,
                    };
                } catch (e) {
                    this.error = e.message;
                }

                this.subscribeToEventsLoading = false;
            },
            async onNewTokenEvent(error, result) {
                if (!error) {
                    const {tokenAddress} = result.args;
                    if(tokenAddress) {
                        this.$store.commit(`Factory/${FACTORY_ADD}`, tokenAddress);
                    }
                    const tx = result.transactionHash;
                    this.$store.commit(`Transactions/${CONFIRM_TX}`, tx);
                    await this.fetchList();
                }
            },
        },

        async created() {
            this.meta.loading = true;

            await this.watchCurrentAccount();
            this.unsubscribeFromEvents();
            await this.subscribeToEvents();
            await this.fetchList();

            this.meta.loading = false;
        },
    };
</script>
