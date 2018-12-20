<template>
    <div class="WhiteListForm buefy">
        <h2>{{ $t('AdminDashboardWhiteListForm') }}</h2>

        <div class="WhiteListForm__form">
            <div class="form-group">
                <label for="TokenAddress">{{ $t('AdminDashboardFieldTokenLabel') }}</label>
                <input
                        :placeholder="$t('AdminDashboardFieldTokenPlaceholder')"
                        type="text"
                        class="form-control"
                        id="TokenAddress"
                        v-model="whiteListForm.tokenAddress">
            </div>
            <div class="form-group">
                <label for="OwnerAddress">{{ $t('AdminDashboardFieldOwnerLabel') }}</label>
                <input
                        :placeholder="$t('AdminDashboardFieldOwnerPlaceholder')"
                        type="text"
                        class="form-control"
                        id="OwnerAddress"
                        v-model="whiteListForm.ownerAddress">
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
                <label for="trancheFeePercent">
                    {{ $t('AdminDashboardFieldTrancheFeePercentLabel') }}
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
                <label for="WTokenSaleFeePercent">
                    {{ $t('AdminDashboardFieldWTokenSaleFeePercentLabel') }}
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
                <label for="FeeTokens">{{ $t('AdminDashboardFieldFeeTokensLabel') }}
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
                <label for="FeeETH">{{ $t('AdminDashboardFieldFeeEthLabel') }}
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


            <b-notification :closable="false" v-if="disableWhiteListButton">
                {{ $t('AdminDashboardWarning') }}
            </b-notification>
            <b-notification v-if="errorMessage !== ''" type="is-danger" has-icon>
                {{ $t(errorMessage) }}
            </b-notification>
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
            <button class="btn btn-primary py-2 my-2" @click="tryWhiteListToken" :disabled="disableWhiteListButton">{{
                $t('AdminDashboardWhitelist') }}
            </button>
            <b-loading  :is-full-page="false" :active.sync="whitelistingToken"></b-loading>
        </div>
    </div>
</template>

<script>
    import './default.scss';
    import 'bem/labelTooltip/default.scss';
    import Connector from 'lib/Blockchain/DefaultConnector.js';
    import {promisify, waitTransactionReceipt, errorMessageSubstitution, warrantor} from 'lib/utils.js';
    import {UPDATE_TX} from "store/modules/Transactions.js";
    import tokenValidationMixinGenerator from '@/lib/views/mixins/validation/token-validation';
    import {createNamespacedHelpers} from "vuex";
    import Web3 from "web3";

    const web3 = new Web3();
    const BigNumber = web3.BigNumber;

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
                    ownerAddress: '',
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
            ...ConfigNS.mapState({
                W12Lister: "W12Lister"
            }),
            ...TransactionsNS.mapState({
                TransactionsList: "list"
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
                    || !this.whiteListForm.ownerAddress
                    || !this.whiteListForm.symbol
                    || !this.whiteListForm.decimals
                    || !this.whiteListForm.name
                    || !this.whiteListForm.feePercent
                    || !this.whiteListForm.feeETHPercent
                    || !this.tokenExistsAndAllowedToWhiteList
                );
            },
            tokenExistsAndAllowedToWhiteList() {
                const foundInList = this.tokensList.find(token => token.tokenAddress === this.whiteListForm.tokenAddress);
                const isTheSameOwner = foundInList ? foundInList.tokenOwner === this.whiteListForm.ownerAddress : false;
                const isWhiteListed = !!foundInList;

                return (
                    this.isTokenExists
                    && (!isWhiteListed || !isTheSameOwner)
                )
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
            isErrorTx() {
                return this.TransactionsList && this.TransactionsList.length
                    ? this.TransactionsList.find((tr) => {
                        return tr.name
                        && tr.hash
                        && tr.status
                        && tr.name === "whitelistToken"
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
                        && tr.name === "whitelistToken"
                        && tr.status === "pending"
                            ? tr
                            : false
                    })
                    : false;
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
                ledgerFetch: "fetch"
            }),
            ...WhitelistNS.mapActions({
                whitelistFetch: "fetch",
            }),
            ...TransactionsNS.mapActions({
                updateStatusTx: "updateStatusTx",
                TransactionsRetry: "retry"
            }),
            async tryWhiteListToken() {
                this.clearErrorMessage();
                await this.whiteListToken(this.whiteListForm);
            },
            clearErrorMessage() {
                this.errorMessage = '';
            },
            setErrorMessage(message) {
                this.errorMessage = message;
            },
            async onOwnerWhitelistedEvent(errors) {
                if (!errors) {
                    await this.$store.dispatch('Cache/blockNumberUp');
                    await this.whitelistFetch();
                    await this.updateStatusTx();
                } else {
                    this.setErrorMessage(errors.message);
                }
            },
            async whiteListToken(data) {
                this.whitelistingToken = true;
                const {W12ListerFactory} = await this.ledgerFetch(this.W12Lister.version);

                if (W12ListerFactory) {
                    try {
                        const W12Lister = W12ListerFactory.at(this.W12Lister.address);
                        const connectedWeb3 = (await Connector.connect()).web3;
                        const tx = await W12Lister.methods.whitelistToken(
                            data.ownerAddress,
                            data.tokenAddress,
                            data.name,
                            data.symbol,
                            data.decimals,
                            parseInt((parseFloat(data.feePercent).toFixed(2) * 100)),
                            parseInt((parseFloat(data.feeETHPercent).toFixed(2) * 100)),
                            parseInt((parseFloat(data.WTokenSaleFeePercent).toFixed(2) * 100)),
                            parseInt((parseFloat(data.trancheFeePercent).toFixed(2) * 100))
                        );
                        this.$store.commit(`Transactions/${UPDATE_TX}`, {
                            name: "whitelistToken",
                            hash: tx,
                            status: "pending"
                        });
                        await waitTransactionReceipt(tx, connectedWeb3);
                        this.endTokenWhiteListOperation();
                    } catch (e) {
                        this.setErrorMessage(errorMessageSubstitution(e));
                    }
                }

                this.whitelistingToken = false;
            },
            async checkToken() {
                const address = this.whiteListForm.tokenAddress;

                if (address) {
                    this.checkingToken = true;

                    const {DetailedERC20Factory} = await this.ledgerFetch(this.W12Lister.version);
                    const DetailedERC20 = DetailedERC20Factory.at(address);
                    const isExists = await DetailedERC20.isCurrentAddressСompatibleWithToken();

                    this.isTokenExists = isExists;
                    this.checkingToken = false;
                }
            },
            async predefineTokenInformation() {
                const address = this.whiteListForm.tokenAddress;
                const {web3} = await Connector.connect();
                const getAccounts = warrantor(web3.eth.getAccounts.bind(web3.eth));
                const currentAccount = (await getAccounts())[0];

                if (this.isTokenExists) {
                    const {DetailedERC20Factory} = await this.ledgerFetch(this.W12Lister.version);
                    const DetailedERC20 = DetailedERC20Factory.at(address);
                    const tokenInformation = await DetailedERC20.getDescription();
                    const {name, symbol, decimals} = tokenInformation;

                    Object.assign(this.whiteListForm, {
                        name,
                        symbol: symbol + EndOfSymbol,
                        ownerAddress: currentAccount,
                        decimals: decimals.toString()
                    });
                }
            },
            async createEventsHelpers() {
                if (!this.EventHelpers) {
                    const {W12ListerFactory} = await this.ledgerFetch(this.W12Lister.version);

                    if (W12ListerFactory) {
                        try {
                            const W12Lister = W12ListerFactory.at(this.W12Lister.address);
                            const OwnerWhitelisted = W12Lister.events.OwnerWhitelisted(null, null, this.onOwnerWhitelistedEvent);

                            this.EventHelpers = {
                                OwnerWhitelisted,
                            };
                        } catch (e) {
                            this.setErrorMessage(errorMessageSubstitution(e));
                        }
                    }
                }
            },
            destroyEventsHelpers() {
                if (this.EventHelpers) {
                    this.EventHelpers.OwnerWhitelisted.stopWatching();
                    delete this.EventHelpers;
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
            endTokenWhiteListOperation() {
                Object.assign(this.whiteListForm, {
                    tokenAddress: '',
                    ownerAddress: '',
                    name: '',
                    symbol: '',
                    decimals: '18'
                });
            }
        },
        async created() {
            this.meta.loading = true;

            await this.createEventsHelpers();
            await this.updateStatusTx();

            this.meta.loading = false;
        },
        errorCaptured(error, vm, info) {
            this.errorMessage = info || error.message;
        },
        beforeDestroy() {
            this.destroyEventsHelpers();
        }
    };
</script>
