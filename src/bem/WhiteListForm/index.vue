<template>
    <div class="WhiteListForm buefy">
        <h2 v-html="$t('AdminDashboardWhiteListForm')"></h2>

        <div class="WhiteListForm__form">
            <div class="form-group">
                <label for="TokenAddress" v-html="$t('AdminDashboardFieldTokenLabel')"></label>
                <input
                        :placeholder="$t('AdminDashboardFieldTokenPlaceholder')"
                        type="text"
                        class="form-control"
                        id="TokenAddress"
                        v-model="whiteListForm.tokenAddress">
            </div>
            <div class="form-group">
                <b-field :label="$t('AdminDashboardFieldOwnerLabel')">
                    <b-taginput
                        :placeholder="$t('AdminDashboardFieldOwnerPlaceholder')"
                        v-model="whiteListForm.owners"
                        attached
                    >
                    </b-taginput>
                </b-field>
            </div>
            <div class="form-group">
                <b-field
                    :label="$t('AdminDashboardFieldSymbolLabel')"
                    label-for="Symbol"
                    :type="typeSymbol"
                    :message="messageSymbol"
                >
                    <input
                            :placeholder="$t('AdminDashboardFieldSymbolPlaceholder')"
                            minlength="1"
                            type="text"
                            @blur="onSymbolBlur"
                            class="form-control"
                            id="Symbol"
                            v-model="whiteListForm.symbol"
                    >
                </b-field>
            </div>
            <div class="form-group">
                <b-field
                        :label="$t('AdminDashboardFieldDecimalsLabel')"
                        label-for="Decimals"
                        :type="typeDecimals"
                        :message="messageDecimals"
                >
                    <input
                            :placeholder="$t('AdminDashboardFieldDecimalsPlaceholder')"
                            type="number"
                            minlength="1"
                            maxlength="2"
                            class="form-control"
                            id="Decimals"
                            v-model="whiteListForm.decimals">
                </b-field>
            </div>
            <div class="form-group">
                <b-field
                        :label="$t('AdminDashboardFieldNameLabel')"
                        label-for="Name"
                        :type="typeName"
                        :message="messageName"
                >
                    <input
                            :placeholder="$t('AdminDashboardFieldNamePlaceholder')"
                            type="text"
                            class="form-control"
                            id="Name"
                            v-model="whiteListForm.name">
                </b-field>
            </div>
            <div class="form-group">
                <label for="trancheFeePercent"><span v-html="$t('AdminDashboardFieldTrancheFeePercentLabel')"></span>
                    <span class="labelTooltip" v-tooltip="$t('AdminDashboardFieldTrancheFeePercentLabelMessage')">?</span>
                </label>
                <b-field id="trancheFeePercent">
                    <cleave
                            :placeholder="$t('AdminDashboardFieldTrancheFeePercentPlaceholder')"
                            v-model="whiteListForm.trancheFeePercent"
                            :options="optionsNumber"
                            class="form-control"
                    ></cleave>
                </b-field>
            </div>
            <div class="form-group">
                <label for="WTokenSaleFeePercent"><span v-html="$t('AdminDashboardFieldWTokenSaleFeePercentLabel')"></span>
                    <span class="labelTooltip" v-tooltip="$t('AdminDashboardFieldWTokenSaleFeePercentLabelMessage')">?</span>
                </label>
                <b-field id="WTokenSaleFeePercent">
                    <cleave
                            :placeholder="$t('AdminDashboardFieldWTokenSaleFeePercentPlaceholder')"
                            v-model="whiteListForm.WTokenSaleFeePercent"
                            :options="optionsNumber"
                            class="form-control"
                    ></cleave>
                </b-field>
            </div>
            <div class="form-group">
                <label for="FeeTokens"><span v-html="$t('AdminDashboardFieldFeeTokensLabel')"></span>
                    <span class="labelTooltip" v-tooltip="$t('AdminDashboardFieldFeeTokensLabelMessage')">?</span>
                </label>
                <b-field id="FeeTokens">
                    <cleave
                            :placeholder="$t('AdminDashboardFieldFeeTokensPlaceholder')"
                            v-model="whiteListForm.feePercent"
                            :options="optionsNumber"
                            class="form-control"
                    ></cleave>
                </b-field>
            </div>
            <div class="form-group">
                <label for="FeeETH"><span v-html="$t('AdminDashboardFieldFeeEthLabel')"></span>
                    <span class="labelTooltip" v-tooltip="$t('AdminDashboardFieldFeeEthLabelMessage')">?</span>
                </label>
                <b-field id="FeeETH">
                    <cleave
                            :placeholder="$t('AdminDashboardFieldFeeEthPlaceholder')"
                            v-model="whiteListForm.feeETHPercent"
                            :options="optionsNumber"
                            class="form-control"
                    ></cleave>
                </b-field>
                <div
                    v-for="(item, index) in whiteListForm.individualPurchaseFee"
                    :key="item.symbol"
                    class="columns is-vcentered is-marginless"
                >
                    <div class="column is-1">{{ item.symbol }}</div>
                    <div class="column">
                        <cleave
                            class="form-control"
                            :value="getIndividualPurchaseFee(item)"
                            @input="whiteListForm.individualPurchaseFee[index].fee = $event"
                            :disabled="!whiteListForm.individualPurchaseFee[index].enabled"
                            :placeholder="$t('AdminDashboardFieldFeeEthPlaceholder')"
                            :options="optionsNumber"
                        ></cleave>
                    </div>
                    <div class="column is-7">
                        <b-switch
                            v-model="whiteListForm.individualPurchaseFee[index].enabled"
                        >{{ $t('AdminDashboardPurchaseFeeEnableCustom') }}</b-switch>
                    </div>
                </div>
            </div>


            <b-notification :closable="false" v-if="disableWhiteListButton"><span v-html="$t('AdminDashboardWarning')"></span>
            </b-notification>
            <b-notification v-if="errorMessage !== ''" type="is-danger" has-icon>
                {{ errorMessage }}
            </b-notification>
            <div class="pm-2" v-if="isPendingTx">
                <p class="py-2"><span v-html="$t('WaitingConfirm')"></span>:</p>
                <b-tag class="py-2">{{whitelistingTransaction.hash}}</b-tag>
            </div>
            <div class="pm-2" v-if="isErrorTx">
                <p class="py-2"><span v-html="$t('TransactionFailed')"></span>:</p>
                <b-tag class="py-2">{{whitelistingTransaction.hash}}</b-tag>
                <div class="pt-2 text-left">
                    <button class="btn btn-primary btn-sm" @click="TransactionsRetry(isErrorTx)" v-html="$t('ToRetry')"></button>
                </div>
            </div>
            <button class="btn btn-primary py-2 my-2" @click="tryWhiteListToken" :disabled="disableWhiteListButton" v-html="$t('AdminDashboardWhitelist')">
            </button>
            <b-loading  :is-full-page="false" :active.sync="whitelistingToken"></b-loading>
        </div>
    </div>
</template>

<script>
    import './default.scss';
    import 'bem/labelTooltip/default.scss';
    import { decodePercent, encodePercent } from '@/lib/selectors/units';
    import { waitContractEventOnce } from '@/lib/utils';
    import { CANCEL_TX, CONFIRM_TX } from '@/store/modules/Transactions';
    import Connector from 'lib/Blockchain/DefaultConnector.js';
    import {promisify, waitTransactionReceipt, errorMessageSubstitution} from 'lib/utils.js';
    import {UPDATE_TX} from "store/modules/Transactions.js";
    import tokenValidationMixinGenerator from '@/lib/views/mixins/validation/token-validation';
    import {createNamespacedHelpers} from "vuex";
    import {web3, BigNumber, warrantor} from '@/lib/utils';
    import pick from 'lodash/pick';

    const LedgerNS = createNamespacedHelpers("Ledger");
    const WhitelistNS = createNamespacedHelpers("Whitelist");
    const ConfigNS = createNamespacedHelpers('Config');
    const TransactionsNS = createNamespacedHelpers("Transactions");
    const RatesNS = createNamespacedHelpers("Rates");

    const EndOfSymbol = "W";
    const uintMaxValue = new BigNumber(2).pow(256).minus(1);
    const filterByEnabled = (i) => i.enabled;
    const individualPurchaseFeeToObjectReducer = (obj, i) => {
        if (i.enabled) obj[i.symbol] = i.fee;
        return obj;
    };
    const individualPurchaseFeeObjectToArray = (obj, processor = val => val) => {
        return Object.keys(obj).map(i => new IndividualPurchaseFee({ symbol: i, fee: processor(obj[i]), enabled: true }));
    };
    class IndividualPurchaseFee {
        constructor(model) {
            this.symbol = model.symbol;
            this.fee = model.fee || null;
            this.enabled = model.enabled || false;
        }
    }

    export default {
        name: 'WhiteListForm',
        template: '#WhiteListFormTemplate',
        mixins: [
            tokenValidationMixinGenerator({
                tokenSymbolGetter (component) {
                    return component.whiteListForm.symbol;
                },
                tokenNameGetter (component) {
                    return component.whiteListForm.name;
                },
                tokenDecimalsGetter (component) {
                    return component.whiteListForm.decimals;
                },
                tokenMintAmountGetter (component) {
                    return component.whiteListForm.amount;
                }
            })
        ],
        data() {
            return {
                meta: {
                    loading: false,
                },
                whiteListForm: {
                    tokenAddress: '',
                    owners: [],
                    symbol: 'TN' + EndOfSymbol,
                    decimals: '18',
                    name: 'Token Name',
                    feePercent: null,
                    feeETHPercent: null,
                    WTokenSaleFeePercent: null,
                    trancheFeePercent: null,
                    individualPurchaseFee: []
                },
                whitelistingToken: false,
                checkingToken: false,
                isTokenExists: false,
                errorMessage: '',
            };
        },
        computed: {
            ...WhitelistNS.mapState({
                tokensList: "list",
                whiteMeta: "meta"
            }),
            ...ConfigNS.mapGetters({
                W12Lister: "W12ListerLastVersion"
            }),
            ...TransactionsNS.mapState({
                TransactionsList: "list"
            }),
            ...TransactionsNS.mapGetters({
                isTransactionPending: "isPending",
                isTransactionFail: "isFail",
                getTransaction: "get"
            }),
            ...RatesNS.mapGetters({
                filteredRates: 'filter'
            }),

            ratesList() {
                return this.filteredRates({ version: this.W12Lister.version });
            },

            optionsNumber() {
                return {
                    prefix: '',
                    numeral: true,
                    numeralPositiveOnly: true,
                    noImmediatePrefix: true,
                    rawValueTrimPrefix: true,
                    numeralIntegerScale: 2,
                    numeralDecimalScale: 2,
                };
            },
            disableWhiteListButton() {
                return (
                    !this.whiteListForm.tokenAddress
                    || !this.whiteListForm.owners.length
                    || !this.whiteListForm.symbol
                    || !this.whiteListForm.decimals
                    || !this.whiteListForm.name
                    || !this.whiteListForm.feePercent
                    || !this.whiteListForm.feeETHPercent
                    || !this.isTokenExists
                );
            },
            typeDecimals () {
                if (!this.whiteListForm.decimals) return '';

                return this.isTokenDecimalsValid ? "" : "is-danger";
            },
            messageDecimals () {
                if (!this.whiteListForm.decimals) return '';

                return this.isTokenDecimalsValid ? "" : this.$t("ErrorValidDecimals");
            },
            typeName () {
                if (!this.whiteListForm.name) return '';

                return this.isTokenNameValid ? "" : "is-danger";
            },
            messageName () {
                if (!this.whiteListForm.name) return '';

                return this.isTokenNameValid ? "" : this.$t("ErrorTokenNameIsNotValid");
            },
            typeSymbol () {
                if (!this.whiteListForm.symbol) return '';

                return this.isTokenSymbolValid ? "" : "is-danger";
            },
            messageSymbol () {
                if (!this.whiteListForm.symbol) return '';

                return this.isTokenSymbolValid ? "" : this.$t("ErrorTokenSymbolsIsNotValid");
            },
            whitelistingTransaction() {
                return this.getTransaction({ name: 'whitelistToken' });
            },
            isErrorTx() {
                return this.isTransactionFail({ name: 'whitelistToken' });
            },
            isPendingTx() {
                return this.isTransactionPending({ name: 'whitelistToken' });
            },
        },
        watch: {
            'whiteListForm.tokenAddress': {
                handler: 'onTokenAddressChange'
            },
            tokensList: {
                handler: 'onTokenListChange'
            },
            ratesList: {
                handler: 'onChangeRatesList',
                immediate: true,
                deep: true
            }
        },
        methods: {
            ...LedgerNS.mapActions({
                fetchLedger: "fetch"
            }),
            ...WhitelistNS.mapActions({
                fetchWhitelist: "fetch",
            }),
            ...RatesNS.mapActions({
                fetchRates: 'fetch'
            }),
            async tryWhiteListToken() {
                this.clearErrorMessage();
                await this.whitelistToken(this.whiteListForm);
            },
            clearErrorMessage() {
                this.errorMessage = '';
            },
            setErrorMessage(message) {
                this.errorMessage = message;
            },
            async whitelistToken(data) {
                this.whitelistingToken = true;
                const {W12ListerFactory} = await this.fetchLedger(this.W12Lister.version);

                try {
                    const W12Lister = W12ListerFactory.at(this.W12Lister.address);
                    const connectedWeb3 = (await Connector.connect()).web3;
                    const individualPurchaseFee = data.individualPurchaseFee
                        .reduce(individualPurchaseFeeToObjectReducer, {});
                    const event = waitContractEventOnce(W12Lister, 'TokenWhitelisted', { token: data.tokenAddress });

                    const tx = await W12Lister.whitelistToken(
                        data.tokenAddress,
                        data.name,
                        data.symbol,
                        data.decimals,
                        data.owners,
                        [
                            data.feePercent,
                            data.feeETHPercent,
                            data.WTokenSaleFeePercent,
                            data.trancheFeePercent
                        ],
                        individualPurchaseFee
                    );

                    this.$store.commit(`Transactions/${UPDATE_TX}`, {
                        name: "whitelistToken",
                        hash: tx,
                        status: "pending"
                    });

                    await this.$nextTick();
                    await waitTransactionReceipt(tx, connectedWeb3);
                    await event;
                    await this.fetchWhitelist();
                    this.resetWhitelistForm();
                    this.$store.commit(`Transactions/${CONFIRM_TX}`, tx);
                } catch (e) {
                    console.error(e);
                    this.setErrorMessage(errorMessageSubstitution(e));
                }

                this.whitelistingToken = false;
            },
            async checkToken() {
                const address = this.whiteListForm.tokenAddress;

                if (address) {
                    this.checkingToken = true;

                    const {ERC20DetailedFactory} = await this.fetchLedger(this.W12Lister.version);
                    const ERC20Detailed = ERC20DetailedFactory.at(address);

                    this.isTokenExists = await ERC20Detailed.isCurrentAddressCompatibleWithToken();
                    this.checkingToken = false;
                }
            },
            async predefineTokenInformation() {
                const {tokenAddress} = this.whiteListForm;

                if (this.isTokenExists) {
                    const {W12ListerFactory, ERC20DetailedFactory} = await this.fetchLedger(this.W12Lister.version);
                    const W12Lister = W12ListerFactory.at(this.W12Lister.address);
                    const isTokenWhitelisted = await W12Lister.methods.isTokenWhitelisted(tokenAddress);

                    if (isTokenWhitelisted) {
                        const tokenRecord = await W12Lister.getTokenExtended(tokenAddress);
                        Object.assign(this.whiteListForm, pick(tokenRecord, [
                            'name',
                            'symbol',
                            'decimals',
                            'owners'
                        ]));
                        this.whiteListForm.feePercent = decodePercent(tokenRecord.feePercent).toString();
                        this.whiteListForm.feeETHPercent = decodePercent(tokenRecord.feeETHPercent).toString();
                        this.whiteListForm.WTokenSaleFeePercent = decodePercent(tokenRecord.WTokenSaleFeePercent).toString();
                        this.whiteListForm.trancheFeePercent = decodePercent(tokenRecord.trancheFeePercent).toString();
                        this.whiteListForm.individualPurchaseFee = this.mergeIndividualPurchaseFeeModels(
                            individualPurchaseFeeObjectToArray(
                                tokenRecord.individualPurchaseFee,
                                val => decodePercent(val).toString()
                            ),
                            this.getIndividualPurchaseFeeFromRatesList()
                        );
                    } else {
                        const {web3} = await Connector.connect();
                        const getAccounts = warrantor(web3.eth.getAccounts.bind(web3.eth));
                        const currentAccount = (await getAccounts())[0];
                        const ERC20Detailed = ERC20DetailedFactory.at(tokenAddress);
                        const tokenInformation = await ERC20Detailed.getDescription();
                        const {name, symbol, decimals} = tokenInformation;

                        Object.assign(this.whiteListForm, {
                            name,
                            symbol: symbol + EndOfSymbol,
                            owners: [currentAccount],
                            decimals: decimals.toString()
                        });
                    }
                }
            },
            async onSymbolBlur(){
                const length = this.whiteListForm.symbol.length;
                const end = this.whiteListForm.symbol.slice(length - EndOfSymbol.length, length);
                if(end !== EndOfSymbol){
                    this.whiteListForm.symbol += EndOfSymbol;
                }
            },
            async onTokenAddressChange(value) {
                if (value) {
                    await this.checkToken();
                    await this.predefineTokenInformation();
                }
            },
            async onTokenListChange() {
                await this.checkToken();
            },
            resetWhitelistForm() {
                Object.assign(this.whiteListForm, {
                    tokenAddress: '',
                    owners: [],
                    name: '',
                    symbol: '',
                    decimals: '18',
                    individualPurchaseFee: this.getIndividualPurchaseFeeFromRatesList()
                });
            },
            getIndividualPurchaseFeeFromRatesList(list = this.ratesList) {
                return list.map(i => (new IndividualPurchaseFee({ symbol: i.symbol, fee: null, enabled: false })));
            },
            mergeIndividualPurchaseFeeModels(from, to) {
                return to.map(i => {
                    const found = from.find(ii => ii.symbol === i.symbol);
                    if (found) {
                        return Object.assign({}, found);
                    }
                    return Object.assign({}, i);
                });
            },
            getIndividualPurchaseFee(model) {
                if (model.enabled) {
                    return model.fee;
                }
                return this.whiteListForm.feeETHPercent;
            },
            onChangeRatesList(value, prevValue) {
                const newList = this.getIndividualPurchaseFeeFromRatesList(value);
                this.whiteListForm.individualPurchaseFee = this.mergeIndividualPurchaseFeeModels(
                    this.whiteListForm.individualPurchaseFee,
                    newList
                );
            }
        },
        errorCaptured(error, vm, info) {
            this.errorMessage = info || errorMessageSubstitution(error);
        },
        async created() {
            await this.fetchRates({ version: this.W12Lister.version });
        }
    };
</script>
