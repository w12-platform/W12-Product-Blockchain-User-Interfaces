<template>
    <div class="Factory buefy" v-if="!langMeta.loading">
        <section class="container">
            <h2>{{ $t('TokensFactoryTitle') }}</h2>

            <b-notification class="AdminDashboard__error" v-if="isError && !isLoading" type="is-danger"
                            :closable="false" has-icon>
                <span v-if="ledgerMeta.loadingError">{{ $t(ledgerMeta.loadingError) }}</span>
                <span v-if="accountMeta.loadingError">{{ $t(accountMeta.loadingError)  }}</span>
            </b-notification>

            <b-notification v-if="isLoading && !isError" :closable="false" class="AdminDashboard__loader">
                <span v-if="ledgerMeta.loading">{{ $t('AdminDashboardLoadLedger') }}<br></span>

                <b-loading :is-full-page="false" :active="isLoading"></b-loading>
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
                        <b-table-column field="date" :label="$t('AdminDashboardTableToken')"
                                        :title="props.row.tokenAddress">
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

                    <b-loading :is-full-page="false" :active.sync="meta.loading"></b-loading>
                </b-table>
                <div class="pm-2" v-if="isPendingTx">
                    <p class="py-2">{{ $t('WaitingConfirm') }}:</p>
                    <b-tag class="py-2">{{isPendingTx.hash}}</b-tag>
                </div>
                <div class="pm-2" v-if="isErrorTx">
                    <p class="py-2">{{ $t('TransactionFailed') }}:</p>
                    <b-tag class="py-2">{{isErrorTx.hash}}</b-tag>
                    <div class="pt-2 text-left">
                        <button class="btn btn-primary btn-sm" @click="TransactionsRetry(isErrorTx)">{{ $t('ToRetry') }}</button>
                    </div>
                </div>
                <div v-if="!isPendingTx && !isErrorTx">
                    <div class="form-group">
                        <label for="FactoryName">{{ $t('TokensFactoryCreateFormName') }}</label>
                        <b-field
                            id="FactoryName"
                            :type="typeName"
                            :message="messageName"
                        >
                            <input type="text"
                                   class="form-control"
                                   v-model="createForm.name"/>
                        </b-field>
                    </div>
                    <div class="form-group">
                        <label for="FactorySymbol">{{ $t('TokensFactoryCreateFormSymbol') }}</label>
                        <b-field
                            id="FactorySymbol"
                            :type="typeSymbol"
                            :message="messageSymbol"
                        >
                            <input type="text"
                                   class="form-control"
                                   v-model="createForm.symbol"
                            />
                        </b-field>
                    </div>
                    <div class="form-group">
                        <label for="FactoryDecimals">{{ $t('TokensFactoryCreateFormDecimals') }}</label>
                        <b-field id="FactoryDecimals" :type="typeDecimals" :message="messageDecimals">
                            <cleave v-model="createForm.decimals"
                                    class="form-control"
                                    :options="optionsNumberDecimals"
                            ></cleave>
                        </b-field>
                    </div>
                    <div class="form-group">
                        <label for="FactoryAmount">{{ $t('TokensFactoryCreateFormAmount') }}</label>
                        <b-field id="FactoryAmount" :type="typeAmount" :message="messageAmount">
                            <cleave v-model="createForm.amount"
                                    class="form-control"
                                    :options="optionsNumber"
                                    min="0"
                            ></cleave>
                        </b-field>
                    </div>
                    <b-notification class="ProjectStages__errorStage" v-if="error" @close="error = false"
                                    type="is-danger" has-icon>{{ error }}
                    </b-notification>
                    <button class="btn btn-primary py-2 my-2" @click="create" :disabled="disable">{{
                        $t('TokensFactoryCreate') }}
                    </button>

                    <b-loading :is-full-page="false" :active.sync="meta.creating"></b-loading>
                </div>
            </div>
        </section>
        <Steps :number="3"></Steps>
    </div>
</template>

<script>
    import './default.scss';
    import Connector from 'lib/Blockchain/DefaultConnector.js';
    import {waitTransactionReceipt, errorMessageSubstitution} from 'lib/utils.js';
    import {UPDATE_TX, CONFIRM_TX} from "store/modules/Transactions.js";
    import {FACTORY_ADD} from "store/modules/Factory.js";
    import tokenValidationMixinGenerator from '@/lib/views/mixins/validation/token-validation';
    import Web3 from 'web3';
    import Steps from "bem/Steps";

    import {createNamespacedHelpers} from "vuex";

    const web3 = new Web3();
    const BigNumber = web3.BigNumber;
    BigNumber.config({
        DECIMAL_PLACES: 36,
        FORMAT: {
            decimalSeparator: '.',
            groupSeparator: '',
            groupSize: 3,
            secondaryGroupSize: 0,
            fractionGroupSeparator: ' ',
            fractionGroupSize: 0
        }
    });

    const uintMaxValue = new BigNumber(2).pow(256).minus(1);

    const LedgerNS = createNamespacedHelpers("Ledger");
    const AccountNS = createNamespacedHelpers("Account");
    const LangNS = createNamespacedHelpers("Lang");
    const ConfigNS = createNamespacedHelpers('Config');
    const FactoryNS = createNamespacedHelpers('Factory');
    const TransactionsNS = createNamespacedHelpers("Transactions");

    export default {
        name: 'Factory',
        template: '#FactoryTemplate',
        mixins: [
            tokenValidationMixinGenerator({
                tokenSymbolGetter(component) {
                    return component.createForm.symbol;
                },
                tokenNameGetter(component) {
                    return component.createForm.name;
                },
                tokenDecimalsGetter(component) {
                    return component.createForm.decimals;
                },
                tokenMintAmountGetter(component) {
                    return component.createForm.amount;
                }
            })
        ],
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
                optionsNumberDecimals: {
                    prefix: '',
                    numeral: true,
                    numeralPositiveOnly: true,
                    noImmediatePrefix: true,
                    rawValueTrimPrefix: true,
                    numeralIntegerScale: 2,
                    numeralDecimalScale: 0,
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
                return value / 100;
            },
        },
        components: {
            Steps
        },
        computed: {
            ...LedgerNS.mapState({
                ledgerMeta: 'meta',
            }),
            ...ConfigNS.mapState({
                FactoryTokens: "FactoryTokens",
                Default: "Default"
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

            maxAmount() {
                const decimals = this.createForm.decimals ? this.createForm.decimals : 0;
                return uintMaxValue.div(new BigNumber(10).pow(decimals)).toFormat(0);
            },
            maxAmountPrecision(){
                return this.maxAmount ? (new BigNumber(this.maxAmount)).toPrecision (2, 1) : false;
            },
            lengthMaxAmount() {
                return this.maxAmount.length;
            },
            optionsNumber() {
                return {
                    prefix: '',
                    numeral: true,
                    numeralPositiveOnly: true,
                    noImmediatePrefix: true,
                    rawValueTrimPrefix: true,
                    numeralIntegerScale: this.lengthMaxAmount,
                    numeralDecimalScale: 0,
                };
            },
            typeAmount() {
                if (!this.createForm.amount) return '';

                return this.isTokenMintAmountValid ? "" : "is-danger";
            },
            messageAmount() {
                if (!this.createForm.amount) return '';

                return this.isTokenMintAmountValid ? "" : this.$t("ErrorValidMaxAmount", {
                    min: 100,
                    max: this.maxAmountPrecision,
                });
            },
            typeDecimals() {
                if (!this.createForm.decimals) return '';

                return this.isTokenDecimalsValid ? "" : "is-danger";
            },
            messageDecimals() {
                if (!this.createForm.decimals) return '';

                return this.isTokenDecimalsValid ? "" : this.$t("ErrorValidDecimals");
            },
            typeName() {
                if (!this.createForm.name) return '';

                return this.isTokenNameValid ? "" : "is-danger";
            },
            messageName() {
                if (!this.createForm.name) return '';

                return this.isTokenNameValid ? "" : this.$t("ErrorTokenNameIsNotValid");
            },
            typeSymbol() {
                if (!this.createForm.symbol) return '';

                return this.isTokenSymbolValid ? "" : "is-danger";
            },
            messageSymbol() {
                if (!this.createForm.symbol) return '';

                return this.isTokenSymbolValid ? "" : this.$t("ErrorTokenSymbolsIsNotValid");
            },
            isErrorTx() {
                return this.TransactionsList && this.TransactionsList.length
                    ? this.TransactionsList.find((tr) => {
                        return tr.name
                        && tr.hash
                        && tr.status
                        && tr.name === "createToken"
                        && tr.status === "error"
                            ? tr
                            : false
                    })
                    : false;
            },
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
                return !this.isTokenNameValid
                    || !this.isTokenSymbolValid
                    || !this.isTokenDecimalsValid
                    || !this.isTokenMintAmountValid;
            },
            isLoading() {
                return this.meta.loading;
            },
            isError() {
                return this.ledgerMeta.loadingError || this.accountMeta.loadingError;
            },
            nextStepBlocked(){
                return this.isPendingTx ? this.$t('StepsBlockedTx') : false;
            }
        },
        methods: {
            ...AccountNS.mapActions({
                watchCurrentAccount: 'watch',
            }),
            ...LedgerNS.mapActions({
                ledgerFetch: "fetch"
            }),
            ...TransactionsNS.mapActions({
                transactionsUpStatusTx: "updateStatusTx",
                TransactionsRetry: "retry"
            }),

            async create() {
                this.meta.creating = true;
                try {
                    const {WTokenTestHelperFactory} = await this.ledgerFetch(this.Default.version);
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
                    this.error = errorMessageSubstitution(e);
                }
                this.meta.creating = false;
            },
            async fetchList() {
                try {
                    const {DetailedERC20Factory} = await this.ledgerFetch(this.Default.version);
                    let listInfo = [];
                    await this.FactoryList.forEach(async (address) => {
                        const DetailedERC20 = DetailedERC20Factory.at(address);
                        const tokenInformation = await DetailedERC20.getDescription();
                        const {name, symbol, decimals} = tokenInformation;
                        listInfo.push({address, name, symbol, decimals});
                    });
                    this.list = listInfo;
                } catch (e) {
                    this.error = errorMessageSubstitution(e);
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
                    const {WTokenTestHelperFactory} = await this.ledgerFetch(this.Default.version);
                    const WTokenTestHelper = WTokenTestHelperFactory.at(this.FactoryTokens.address);
                    const NewToken = WTokenTestHelper.events.NewToken(null, null, this.onNewTokenEvent);

                    this.subscribedEvents = {
                        NewToken,
                    };
                } catch (e) {
                    this.error = errorMessageSubstitution(e);
                }

                this.subscribeToEventsLoading = false;
            },
            async onNewTokenEvent(error, result) {
                if (!error) {
                    await this.$store.dispatch('Cache/blockNumberUp');
                    const {tokenAddress} = result.args;
                    if (tokenAddress) {
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
            await this.transactionsUpStatusTx();

            window.dispatchEvent(new Event('resize'));
            this.meta.loading = false;
        },
    };
</script>
