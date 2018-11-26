<template>
    <div class="Calculator byefy" v-if="currentToken && currentToken.crowdSaleInformation && currentToken.crowdSaleInformation.status">
        <h2 v-html="$t('InvestorDashboardCalculator', {WToken:currentToken.symbol})"></h2>

        <div class="Calculator__content">
            <div class="Calculator__infoToken">
                <p><span v-html="$t('InvestorDashboardCalculatorTokenAddress')"></span>
                    <b-tag type="is-success">{{ currentToken.crowdSaleInformation.WTokenAddress }}</b-tag>
                </p>
                <p><span v-html="$t('InvestorDashboardCalculatorTokenName')"></span> {{ currentToken.name }}</p>
                <p><span v-html="$t('InvestorDashboardCalculatorTokenSymbol')"></span> {{ currentToken.symbol }}</p>
                <p v-if="maxSum"><span v-html="$t('InvestorDashboardCalculatorAmount')"></span>
                    {{ tokensOnSaleFixed }} {{ currentToken.symbol }} - ({{ maxSum }})</p>
            </div>

            <div class="Calculator__inputs">
                <div class="py-2">
                    <b-field :label="$t('InvestorDashboardCalculatorPaymentMethods')">
                        <b-select
                                v-model="paymentMethod"
                                :placeholder="$t('InvestorDashboardCalculatorPaymentMethodsSelect')"
                                :disabled="fetchingInvoice"
                        >
                            <option
                                    v-for="option in storedRatesList"
                                    :value="option.symbol"
                                    :key="option.symbol">
                                {{ option.symbol }}
                            </option>
                        </b-select>
                    </b-field>
                </div>
            </div>
            <div class="Calculator__inputs row">
                <div class="col-sm py-2">
                    <label for="Tokens">{{ currentToken.symbol }}</label>
                    <b-field id="Tokens">
                        <b-icon icon="shopping"></b-icon>
                        <cleave
                                :placeholder="$t('InvestorDashboardCalculatorTokenAmountPlaceholder')"
                                v-model="tokens"
                                class="form-control"
                                :options="optionsNumber"
                                :disabled="fetchingInvoice"
                                min="0"
                        ></cleave>
                    </b-field>
                </div>
                <div class="col-sm py-2">
                    <label for="PaymentMethod">{{ paymentMethod }}</label>
                    <b-field id="PaymentMethod">
                        <b-icon icon="credit-card"></b-icon>
                        <cleave
                                :placeholder="paymentMethod"
                                v-model="paymentAmount"
                                class="form-control"
                                :options="optionsNumber"
                                :disabled="fetchingInvoice"
                                min="0"
                        ></cleave>
                    </b-field>
                </div>
            </div>

            <div class="Calculator__info">
                <b-notification v-if="!isMaxTokenOnSaleAmount" type="is-danger" has-icon :closable="false"
                                v-html="$t('ErrorOnSaleMaxAmount', { max: currentToken.crowdSaleInformation.tokensOnSale })">
                </b-notification>

                <p v-if="currentToken.crowdSaleInformation.stageDiscount !== '0'"><span v-html="$t('InvestorDashboardCalculatorDiscount')"></span>
                    <b-tag type="is-success">{{ currentToken.crowdSaleInformation.stageDiscount }}%</b-tag>
                    <br><span v-html="$t('InvestorDashboardCalculatorDiscountBeforeEndTimeout', { countdown: countdown })"></span>
                </p>
                <p v-if="currentToken.crowdSaleInformation.vestingDate">
                    <span v-html="$t('InvestorDashboardCalculatorDiscountVestingEndDate', { date: dateFormat(this.currentToken.crowdSaleInformation.vestingDate) })"></span>
                    <br><span v-html="$t('InvestorDashboardCalculatorDiscountVestingDateCaution', {WToken:currentToken.symbol})"></span>
                </p>
                <p v-if="bonusVolume !== '0.00'"><span v-html="$t('InvestorDashboardCalculatorBonus')"></span>
                    <b-tag type="is-success">+{{ bonusVolume }} {{ currentToken.symbol }}</b-tag>
                </p>

                <div class="Calculator__total"><span v-html="$t('InvestorDashboardCalculatorTotalBuy')"></span> {{ this.invoice ? this.invoice.tokens : 0 }} {{ currentToken.symbol }} - {{ this.invoice ? this.invoice.cost : 0 }} {{ paymentMethod }}
                    <br>
                    <span v-html="$t('InvestorDashboardCalculatorTotalCost', { cost: this.invoice ? this.invoice.cost : 0 })"></span> {{ paymentMethod }}
                    <br>
                    <span v-html="$t('InvestorDashboardCalculatorChange', { change: this.invoice ? this.invoice.change : 0 })"></span> {{ paymentMethod }}
                    <br>
                    <span v-html="$t('InvestorDashboardCalculatorTotalProfit', { profit: profit })"></span> {{ paymentMethod }}
                    <span v-if="isToken">
                        <br>
                        <span v-html="$t('InvestorDashboardCalculatorNeedToApprove', { approve: needToApproveAmount })"></span> {{ paymentMethod }}
                    </span>
                </div>
            </div>

            <b-notification class="" v-if="error" @close="error = false" type="is-danger" has-icon>
                {{ $t(error) }}
            </b-notification>

            <div class="pm-2" v-if="isPendingTx">
                <p class="py-2"><span v-html="$t('WaitingConfirm')"></span>:</p>
                <b-tag class="py-2">{{isPendingTx.hash}}</b-tag>
            </div>
            <div class="pm-2" v-if="isErrorTx">
                <p class="py-2"><span v-html="$t('TransactionFailed')"></span>:</p>
                <b-tag class="py-2">{{isErrorTx.hash}}</b-tag>
                <div class="pt-2 text-left">
                    <button class="btn btn-primary btn-sm" @click="TransactionsRetry(isErrorTx)" v-html="$t('ToRetry')"></button>
                </div>
            </div>

            <div class="Calculator__buy" v-if="!isPendingTx && !isErrorTx">
                <button class="btn btn-primary" :disabled="disableBuy || fetchingInvoice" @click="buy" v-html="$t('InvestorDashboardCalculatorBuy')"></button>
                <button v-if="isNeedApprove" :disabled="fetchingInvoice" class="btn btn-primary" @click="approve" v-html="$t('InvestorDashboardCalculatorDoApprove')"></button>
            </div>
        </div>
        <b-loading :is-full-page="false" :active.sync="loading" :can-cancel="true"></b-loading>
    </div>
</template>

<script>
    import './default.scss';
    import { conversionByDecimals, reverseConversionByDecimals } from '@/lib/selectors/units';
    import { round, waitContractEventOnce } from '@/lib/utils';
    import { CANCEL_TX } from '@/store/modules/Transactions';
    import {createNamespacedHelpers} from "vuex";
    import {waitTransactionReceipt, errorMessageSubstitution} from 'lib/utils.js';
    import {UPDATE_TX, CONFIRM_TX} from "store/modules/Transactions.js";
    import {web3, BigNumber} from 'lib/utils';
    import countdown from 'countdown';
    import moment from 'moment';

    const LedgerNS = createNamespacedHelpers("Ledger");
    const RatesNS = createNamespacedHelpers("Rates");
    const AccountNS = createNamespacedHelpers("Account");
    const TokensListNS = createNamespacedHelpers("TokensList");
    const TransactionsNS = createNamespacedHelpers("Transactions");

    import Connector from 'lib/Blockchain/DefaultConnector.js';

    export default {
        name: 'Calculator',
        template: '#CalculatorTemplate',
        data() {
            return {
                loading: false,
                fetchingInvoice: false,
                error: false,
                subscribeToEventsLoading: false,
                paymentMethod: '',
                tokens: '0',
                paymentAmount: '0',
                invoice: null,
                countdownTmId: false,
                countdown: false,
                allowance: '0',
                maxSum: null
            };
        },
        watch: {
            tokens: {
                handler: 'handleTokensChange',
                immediate: true
            },
            paymentAmount: {
                handler: 'handlePaymentAmountChange',
                immediate: true
            },
            paymentMethod: {
                handler: 'handlePaymentMethodChange',
                immediate: true
            },
            currentToken: {
                handler: 'onCurrentTokenDeepUpdate',
                deep: true,
                immediate: true
            }
        },
        computed: {
            ...TokensListNS.mapState({
                tokensListMeta: 'meta',
                tokensList: 'list',
                currentToken: 'currentToken',
            }),
            ...TransactionsNS.mapState({
                TransactionsList: "list"
            }),
            ...AccountNS.mapState({
                currentAccount: 'currentAccount'
            }),
            ...RatesNS.mapGetters({
                filterRates: "filter"
            }),
            storedRatesList() {
                return this.filterRates({version: this.currentToken.version});
            },
            isMaxTokenOnSaleAmount() {
                return this.currentToken.crowdSaleInformation.tokensOnSale && this.tokens
                    ? new BigNumber(this.tokens).lte(this.currentToken.crowdSaleInformation.tokensOnSale)
                    : !this.tokens;
            },
            tokenPrice() {
                return this.currentToken.crowdSaleInformation.tokenPrice;
            },
            bonusConditions() {
                return this.currentToken.crowdSaleInformation.bonusVolumes;
            },
            fixedDiscountPercent() {
                return this.currentToken.crowdSaleInformation.stageDiscount;
            },
            profit() {
                if (this.paymentMethodExtendInfo && this.invoice) {
                    const cost = new BigNumber(this.invoice.cost);
                    const tokens = new BigNumber(this.invoice.tokens);
                    const tokenPrice = this.currentToken.crowdSaleInformation.tokenPrice;
                    const paymentMethodPrice = this.paymentMethodExtendInfo.rate;
                    const paymentWithoutFees = tokens.mul(tokenPrice).div(paymentMethodPrice);

                    return paymentWithoutFees.minus(cost).toString();
                }

                return '0';
            },
            bonusVolume() {
                if (this.paymentMethodExtendInfo && this.invoice) {
                    const cost = new BigNumber(this.invoice.cost);
                    const tokens = new BigNumber(this.invoice.tokens);
                    const tokenPrice = this.currentToken.crowdSaleInformation.tokenPrice;
                    const paymentMethodPrice = this.paymentMethodExtendInfo.rate;
                    const tokenWithoutFees = cost.mul(paymentMethodPrice).div(tokenPrice);

                    return tokens.minus(tokenWithoutFees).toString();
                }

                return '0';
            },
            totalToken() {
                return '0';
            },
            isErrorTx() {
                return this.TransactionsList && this.TransactionsList.length
                    ? this.TransactionsList.find((tr) => {
                        return tr.token
                        && tr.name
                        && tr.hash
                        && tr.status
                        && tr.token === this.currentToken.crowdSaleInformation.WTokenAddress
                        && tr.name === "buy"
                        && tr.status === "error"
                            ? tr
                            : false
                    })
                    : false;
            },
            isPendingTx() {
                return this.TransactionsList && this.TransactionsList.length
                    ? this.TransactionsList.find((tr) => {
                        return tr.token
                        && tr.name
                        && tr.hash
                        && tr.status
                        && tr.token === this.currentToken.crowdSaleInformation.WTokenAddress
                        && tr.name === "buy"
                        && tr.status === "pending"
                            ? tr
                            : false
                    })
                    : false;
            },
            disableBuy() {
                return (
                    this.isNeedApprove
                    || !this.invoice
                    || !new BigNumber(this.invoice.cost).greaterThan(0)
                    || !this.isMaxTokenOnSaleAmount
                );
            },
            optionsNumber() {
                return {
                    prefix: '',
                    numeral: true,
                    numeralPositiveOnly: true,
                    noImmediatePrefix: true,
                    rawValueTrimPrefix: true,
                    numeralIntegerScale: 18,
                    numeralDecimalScale: 18
                };
            },
            paymentMethodExtendInfo() {
                if (this.paymentMethod) {
                    return this.storedRatesList.find(r => r.symbol === this.paymentMethod);
                }

                return null;
            },
            isToken() {
                return (
                    this.paymentMethodExtendInfo
                    && this.paymentMethodExtendInfo.isToken
                );
            },
            isNeedApprove() {
                return new BigNumber(this.needToApproveAmount).gt(0);
            },
            needToApproveAmount() {
                if (
                    this.isToken
                    && this.invoice
                ) {
                    const cost = new BigNumber(this.invoice.cost);

                    if (cost.lessThan(this.allowance)) return '0';

                    return cost.minus(this.allowance);
                }

                return '0';
            },
            tokensOnSaleFixed(){
                return new BigNumber(this.currentToken.crowdSaleInformation.tokensOnSale).toFixed(2);
            },
        },
        methods: {
            ...LedgerNS.mapActions({
                fetchLedger: "fetch"
            }),
            ...AccountNS.mapActions({
                updateAccountData: 'updateAccountData'
            }),
            ...TokensListNS.mapActions({
                tokensListUpdate: "update",
                TransactionsRetry: "retry"
            }),
            ...RatesNS.mapActions({
                fetchRates: "fetch"
            }),
            dateFormat (value) {
                return moment(value * 1000).utc().format("DD.MM.YYYY HH:mm");
            },
            async handleTokensChange(value, prevValue) {
                await this.fetchInvoiceByTokenAmount();
            },
            async handlePaymentAmountChange() {
                await this.fetchInvoiceByPaymentAmount();
            },
            async handlePaymentMethodChange() {
                await this.fetchMaxSumInvoiceByTokensOnSale();
                await this.fetchInvoiceByPaymentAmount();
            },
            async buy() {
                if(this.disableBuy) return;

                this.loading = true;
                
                let tx;
                
                try {
                    const {W12CrowdsaleFactory} = await this.fetchLedger(this.currentToken.version);
                    const connectedWeb3 = (await Connector.connect()).web3;
                    const Crowdsale = W12CrowdsaleFactory.at(this.currentToken.crowdSaleInformation.crowdsaleAddress);
                    const amount = conversionByDecimals(this.invoice.cost, this.paymentMethodExtendInfo.decimals);
                    const event = waitContractEventOnce(Crowdsale, 'TokenPurchase', { buyer: this.currentAccount });
                    
                    tx = await Crowdsale.buyTokens(
                        this.paymentMethod,
                        amount,
                        {
                            value: this.paymentMethod === 'ETH'
                                ? amount
                                : 0
                        }
                    );

                    this.$store.commit(`Transactions/${UPDATE_TX}`, {
                        token: this.currentToken.crowdSaleInformation.WTokenAddress,
                        name: "buy",
                        hash: tx,
                        status: "pending"
                    });
                    await this.$nextTick()
                    
                    await waitTransactionReceipt(tx, connectedWeb3);
                    await event;

                    this.$store.commit(`Transactions/${CONFIRM_TX}`, tx);
                    await this.$nextTick();

                    await this.updateAllowanceAmount();
                    await this.updateAccountData();
                    await this.tokensListUpdate(this.currentToken);
                } catch (e) {
                    console.error(e);
                    this.error = errorMessageSubstitution(e);

                    if (tx) {
                        this.$store.commit(`Transactions/${CANCEL_TX}`, tx);
                    }
                }

                this.loading = false;
            },
            async approve() {
                if (!this.isNeedApprove) return;

                const value = conversionByDecimals(this.invoice.cost, this.paymentMethodExtendInfo.decimals);

                try {
                    const {ERC20Factory} = await this.fetchLedger(this.currentToken.version);
                    const connectedWeb3 = (await Connector.connect()).web3;
                    const Token = ERC20Factory.at(this.paymentMethodExtendInfo.address);

                    const tx = await Token.methods.approve(this.currentToken.crowdsaleAddress, value);

                    await waitTransactionReceipt(tx, connectedWeb3);
                    await this.updateAllowanceAmount();
                } catch (e) {
                    console.error(e);
                    this.error = errorMessageSubstitution(e);
                }
            },
            async updateAllowanceAmount() {
                if(
                    !this.paymentMethodExtendInfo
                    || !this.paymentMethodExtendInfo.isToken
                ) {
                    this.allowance = '0';
                    return;
                }

                try {
                    const {ERC20DetailedFactory} = await this.fetchLedger(this.currentToken.version);
                    const Token = ERC20DetailedFactory.at(this.paymentMethodExtendInfo.address);

                    this.allowance = reverseConversionByDecimals(
                        await Token.methods.allowance(
                            this.currentAccount,
                            this.currentToken.crowdsaleAddress
                        ),
                        this.paymentMethodExtendInfo.decimals
                    );
                } catch (e) {
                    console.error(e);
                    this.error = errorMessageSubstitution(e);
                }
            },
            async handleSelectedChange(newSelected, oldSelected) {
                if (newSelected && oldSelected && newSelected.name !== oldSelected.name) {
                    this.paymentAmount = 0;
                    this.tokens = 0;
                }
                await this.updateAccountData();
            },
            async watchCountdown () {
                this.unwatchCountdown();

                const watcher = async () => {
                    if (this.currentToken) {
                        const currentDate = moment().utc().unix();
                        const stageEndDate = this.currentToken.crowdSaleInformation.stageEndDate;
                        const EndDate = this.currentToken.crowdSaleInformation.endDate;

                        if (currentDate >= stageEndDate) {
                            this.unwatchCountdown();
                            this.countdown = false;
                        } else {
                            this.countdown = countdown(new Date(stageEndDate * 1000)).toString();
                        }
                    }
                };

                if (this.currentToken) {
                    this.countdownTmId = setInterval(watcher, 1000);
                }
            },
            unwatchCountdown () {
                clearInterval(this.countdownTmId);
            },
            async fetchInvoiceByPaymentAmount() {
                if (this.fetchingInvoice) return;
                if (!this.paymentMethod) return;

                this.error = '';
                this.fetchingInvoice = true;

                try {
                    const {W12CrowdsaleFactory} = await this.fetchLedger(this.currentToken.version);
                    const Crowdsale = W12CrowdsaleFactory.at(this.currentToken.crowdsaleAddress);
                    const decimals = this.paymentMethodExtendInfo.decimals;

                    let invoice = ['0', '0', '0', '0', '0'];

                    if (new BigNumber(this.paymentAmount || 0).gt(0)) {
                        invoice = await Crowdsale.getInvoice(
                            this.paymentMethod,
                            conversionByDecimals(this.paymentAmount, decimals)
                        );
                    }

                    this.tokens = reverseConversionByDecimals(invoice[0], this.currentToken.decimals).toString();
                    this.invoice = {
                        tokens: this.tokens,
                        cost: reverseConversionByDecimals(invoice[1], decimals).toString(),
                        change: reverseConversionByDecimals(invoice[3], decimals).toString()
                    };
                } catch (e) {
                    console.error(e);
                    this.error = errorMessageSubstitution(e);
                }

                await this.updateAllowanceAmount();
                await this.$nextTick();
                this.fetchingInvoice = false;
            },
            async fetchInvoiceByTokenAmount() {
                if (this.fetchingInvoice) return;
                if (!this.paymentMethod) return;

                this.error = '';
                this.fetchingInvoice = true;

                try {
                    const {W12CrowdsaleFactory} = await this.fetchLedger(this.currentToken.version);
                    const Crowdsale = W12CrowdsaleFactory.at(this.currentToken.crowdsaleAddress);

                    let invoice = ['0', '0', '0', '0', '0'];

                    if (new BigNumber(this.tokens || 0).gt(0)) {
                        invoice = await Crowdsale.getInvoiceByTokenAmount(
                            this.paymentMethod,
                            conversionByDecimals(this.tokens, this.currentToken.decimals)
                        );
                    }

                    this.paymentAmount = reverseConversionByDecimals(invoice[1], this.paymentMethodExtendInfo.decimals).toString();
                    this.invoice = {
                        tokens: reverseConversionByDecimals(invoice[0], this.currentToken.decimals).toString(),
                        cost: this.paymentAmount,
                        change: reverseConversionByDecimals(invoice[3], this.paymentMethodExtendInfo.decimals).toString()
                    };
                } catch (e) {
                    console.error(e);
                    this.error = errorMessageSubstitution(e);
                }

                await this.updateAllowanceAmount();
                await this.$nextTick();
                this.fetchingInvoice = false;
            },
            async fetchMaxSumInvoiceByTokensOnSale(){
                if (!this.paymentMethod) return;

                try {
                    const {W12CrowdsaleFactory} = await this.fetchLedger(this.currentToken.version);
                    const Crowdsale = W12CrowdsaleFactory.at(this.currentToken.crowdsaleAddress);

                    let invoice = ['0', '0', '0', '0', '0'];

                    if (new BigNumber(this.currentToken.crowdSaleInformation.tokensOnSale || 0).gt(0)) {
                        invoice = await Crowdsale.getInvoiceByTokenAmount(
                            this.paymentMethod,
                            conversionByDecimals(this.currentToken.crowdSaleInformation.tokensOnSale, this.currentToken.decimals)
                        );
                    }
                    this.maxSum = reverseConversionByDecimals(invoice[1], this.paymentMethodExtendInfo.decimals).toFixed(2) + " " + this.paymentMethod;
                } catch (e) {
                    console.error(e);
                    this.error = errorMessageSubstitution(e);
                }
            },
            async onCurrentTokenDeepUpdate (value, prevValue) {
                await this.fetchRates({version: value.version});
                if (!this.paymentMethod) {
                    this.paymentMethod = value.crowdSaleInformation.paymentMethods[0];
                    await this.fetchInvoiceByPaymentAmount();
                }
                await this.watchCountdown();
                await this.handleSelectedChange();
            },
        },
    };
</script>
