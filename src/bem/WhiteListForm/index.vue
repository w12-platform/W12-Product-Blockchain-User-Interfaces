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
    import { encodePercent } from '@/lib/selectors/units';
    import { waitContractEventOnce } from '@/lib/utils';
    import { CANCEL_TX, CONFIRM_TX } from '@/store/modules/Transactions';
    import Connector from 'lib/Blockchain/DefaultConnector.js';
    import {promisify, waitTransactionReceipt, errorMessageSubstitution} from 'lib/utils.js';
    import {UPDATE_TX} from "store/modules/Transactions.js";
    import tokenValidationMixinGenerator from '@/lib/views/mixins/validation/token-validation';
    import {createNamespacedHelpers} from "vuex";
    import {web3, BigNumber} from '@/lib/utils';
    import pick from 'lodash/pick';

    const LedgerNS = createNamespacedHelpers("Ledger");
    const WhitelistNS = createNamespacedHelpers("Whitelist");
    const ConfigNS = createNamespacedHelpers('Config');
    const TransactionsNS = createNamespacedHelpers("Transactions");

    const EndOfSymbol = "W";
    const uintMaxValue = new BigNumber(2).pow(256).minus(1);

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
            }
        },
        methods: {
            ...LedgerNS.mapActions({
                fetchLedger: "fetch"
            }),
            ...WhitelistNS.mapActions({
                fetchWhitelist: "fetch",
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
                    const event = waitContractEventOnce(W12Lister, 'TokenWhitelisted', { token: data.tokenAddress });

                    const tx = await W12Lister.methods.whitelistToken(
                        data.tokenAddress,
                        data.name,
                        data.symbol,
                        data.decimals,
                        data.owners,
                        encodePercent(data.feePercent),
                        encodePercent(data.feeETHPercent),
                        encodePercent(data.WTokenSaleFeePercent),
                        encodePercent(data.trancheFeePercent)
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
                            'owners',
                            'feePercent',
                            'feeETHPercent',
                            'WTokenSaleFeePercent',
                            'trancheFeePercent'
                        ]));
                    } else {
                        const {web3} = await Connector.connect();
                        const getAccounts = promisify(web3.eth.getAccounts.bind(web3.eth));
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
                    ownerAddress: '',
                    name: '',
                    symbol: '',
                    decimals: '18'
                });
            }
        },
        errorCaptured(error, vm, info) {
            this.errorMessage = info || errorMessageSubstitution(error);
        }
    };
</script>
