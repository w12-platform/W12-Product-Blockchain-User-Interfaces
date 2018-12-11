<template>
    <div class="Calculator byefy" v-if="currentToken && currentToken.crowdSaleInformation && currentToken.crowdSaleInformation.status">
        <h2>{{ $t('InvestorDashboardCalculator', {WToken:currentToken.symbol}) }}</h2>

        <div class="Calculator__content">
            <div class="Calculator__infoToken">
                <p>{{ $t('InvestorDashboardCalculatorTokenAddress') }}
                    <b-tag type="is-success">{{ currentToken.crowdSaleInformation.WTokenAddress }}</b-tag>
                </p>
                <p>{{ $t('InvestorDashboardCalculatorTokenName') }} {{ currentToken.name }}</p>
                <p>{{ $t('InvestorDashboardCalculatorTokenSymbol') }} {{ currentToken.symbol }}</p>
                <p><span v-html="$t('InvestorDashboardCalculatorAmount')"></span>
                    {{ tokensOnSaleFixed }} {{ currentToken.symbol }} - ({{ tokensOnSaleSumFixed }} ETH)</p>
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
                                min="0"
                        ></cleave>
                    </b-field>
                </div>
                <div class="col-sm py-2">
                    <label for="ETHs">ETHs</label>
                    <b-field id="ETHs">
                        <b-icon icon="ethereum"></b-icon>
                        <cleave
                                placeholder="ETH"
                                v-model="ETHs"
                                class="form-control"
                                :options="optionsNumber"
                                min="0"
                        ></cleave>
                    </b-field>
                </div>
            </div>

            <div class="Calculator__info">
                <b-notification v-if="!isMaxTokenOnSaleAmount" type="is-danger" has-icon :closable="false">
                    {{ $t('ErrorOnSaleMaxAmount', { max: currentToken.crowdSaleInformation.tokensOnSale }) }}
                </b-notification>

                <p v-if="currentToken.crowdSaleInformation.stageDiscount !== '0'">
                    {{$t('InvestorDashboardCalculatorDiscount')}}
                    <b-tag type="is-success">{{ currentToken.crowdSaleInformation.stageDiscount }}%</b-tag>
                    <br>{{$t('InvestorDashboardCalculatorDiscountBeforeEndTimeout', { countdown: countdown })}}
                    <!--{{ profitInEth }} ETH {{ countdown }}-->
                </p>
                <p>
                    {{$t('InvestorDashboardCalculatorDiscountVestingEndDate', { date: dateFormat(this.currentToken.crowdSaleInformation.vestingDate) })}}
                    <br><span v-html="$t('InvestorDashboardCalculatorDiscountVestingDateCaution', {WToken:currentToken.symbol})"></span>
                </p>
                <p v-if="bonusVolume !== '0.00'">{{$t('InvestorDashboardCalculatorBonus')}}
                    <b-tag type="is-success">+{{ bonusVolume }} {{ currentToken.symbol }}</b-tag>
                </p>

                <div class="Calculator__total">
                    {{$t('InvestorDashboardCalculatorTotalBuy')}} {{ totalToken }} {{ currentToken.symbol }} - {{ total }} ETH
                    <br>
                    {{$t('InvestorDashboardCalculatorTotalCost', { cost: totalCost })}} ETH
                    <br>
                    {{$t('InvestorDashboardCalculatorTotalProfit', { profit: profitInEth })}} ETH
                </div>
            </div>

            <b-notification class="" v-if="error" @close="error = false" type="is-danger" has-icon>
                {{ $t(error) }}
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

            <div class="Calculator__buy" v-if="!isPendingTx && !isErrorTx">
                <button class="btn btn-primary" :disabled="disable" @click="buy">{{$t('InvestorDashboardCalculatorBuy')}}</button>
            </div>
        </div>
        <b-loading :is-full-page="false" :active.sync="loading"></b-loading>
    </div>
</template>

<script>
    import './default.scss';
    import {createNamespacedHelpers} from "vuex";
    import {waitTransactionReceipt, errorMessageSubstitution} from 'lib/utils.js';
    import {UPDATE_TX, CONFIRM_TX} from "store/modules/Transactions.js";
    import Web3 from 'web3';
    import countdown from 'countdown';
    import moment from 'moment';

    const LedgerNS = createNamespacedHelpers("Ledger");
    const AccountNS = createNamespacedHelpers("Account");
    const TokensListNS = createNamespacedHelpers("TokensList");
    const TransactionsNS = createNamespacedHelpers("Transactions");

    const web3 = new Web3();
    const BigNumber = web3.BigNumber;
    import Connector from 'lib/Blockchain/DefaultConnector.js';

    export default {
        name: 'Calculator',
        template: '#CalculatorTemplate',
        data() {
            return {
                loading: false,
                error: false,
                subscribeToEventsLoading: false,

                tokens: '0',
                tokensWithoutDiscount: '0',
                ETHs: '0',
                ETHsWithoutDiscount: '0',
                blockChangeTokens: false,
                blockChangeETHs: false,
                total: 0,
                countdownTmId: false,
                countdown: false,
                optionsNumber: {
                    prefix: '',
                    numeral: true,
                    numeralPositiveOnly: true,
                    noImmediatePrefix: true,
                    rawValueTrimPrefix: true,
                    numeralIntegerScale: 18,
                    numeralDecimalScale: 18
                }
            };
        },
        watch: {
            tokens: {
                handler: 'handleTokensChange',
                immediate: true
            },
            ETHs: {
                handler: 'handleETHsChange',
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
            profitInEth() {
                const ETHs = isNaN(parseFloat(this.ETHs))
                    ? '0'
                    : this.ETHs;

                return new BigNumber(this.ETHsWithoutDiscount).minus(ETHs).toFixed(4).toString();
            },
            totalCost () {
                const ETHs = isNaN(parseFloat(this.ETHs))
                    ? '0'
                    : this.ETHs;

                return new BigNumber(ETHs).toFixed(4).toString();
            },
            bonusVolume() {
                const amount = this.ETHs ? this.ETHs : 0;
                const price = this.getPrice();
                const bonusMultiplier = amount ? this.getBonusMultiplierByEth(amount) : new BigNumber(1);

                return new BigNumber(amount).mul(bonusMultiplier).div(price).minus(
                    new BigNumber(amount).div(price)
                ).toFixed(2).toString();
            },
            totalToken() {
                const amount = this.ETHs ? this.ETHs : 0;
                const price = this.getPrice();
                const bonusMultiplier = amount ? this.getBonusMultiplierByEth(amount) : new BigNumber(1);

                return new BigNumber(amount).mul(bonusMultiplier).div(price).toFixed(2).toString();
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
            disable() {
                const amount = new BigNumber(this.total);
                return !amount.greaterThan(0) || !this.isMaxTokenOnSaleAmount;
            },
            tokensOnSaleFixed(){
                return new BigNumber(this.currentToken.crowdSaleInformation.tokensOnSale).toFixed(2);
            },
            tokensOnSaleSumFixed(){
                return new BigNumber(this.currentToken.crowdSaleInformation.tokensOnSale)
                    .mul(new BigNumber(this.currentToken.crowdSaleInformation.tokenPrice))
                    .toFixed(2);
            }
        },
        methods: {
            ...LedgerNS.mapActions({
                ledgerFetch: "fetch"
            }),
            ...AccountNS.mapActions({
                updateAccountData: 'updateAccountData'
            }),
            ...TokensListNS.mapActions({
                tokensListUpdate: "update",
                TransactionsRetry: "retry"
            }),
            findMatchBonusRange(eth) {
                const ranges = this.bonusConditions.reduce(
                    (result, item) => {
                        const last = result[result.length - 1];

                        let start = new BigNumber(item[0]);
                        let bonusPercent = new BigNumber(item[1]);

                        if (result.length > 0 && !last.end.isFinite()) {
                            last.end = start.minus(web3.fromWei(1, 'ether'));
                        }

                        result.push({
                            start: start,
                            end: new BigNumber(Infinity),
                            bonusPercent: bonusPercent
                        });

                        return result;
                    },
                    []
                );

                return ranges.find(
                    (range) =>
                        range.start.lessThanOrEqualTo(eth)
                        && range.end.greaterThanOrEqualTo(eth)
                );
            },
            dateFormat (value) {
                return moment(value * 1000).utc().format("DD.MM.YYYY HH:mm");
            },
            getPrice() {
                const discount = new BigNumber(1).minus(
                    new BigNumber(this.fixedDiscountPercent).dividedBy(100)
                );

                return new BigNumber(this.currentToken.crowdSaleInformation.tokenPrice).mul(discount);
            },
            getBonusMultiplierByEth(amount) {
                const range = this.findMatchBonusRange(amount);

                let discount = new BigNumber(1);

                if (range) {
                    discount = discount.plus(range.bonusPercent.div(100));
                }

                return discount;
            },
            getBonusMultiplierByTokens(amount) {
                const inEth = this.convertTokensToEth(amount, this.currentToken.crowdSaleInformation.tokenPrice, 1);
                const discount = this.getBonusMultiplierByEth(inEth);

                return discount;
            },
            convertTokensToEth(amount, price, bonusMultiplier) {

                price = price != null
                    ? new BigNumber(price)
                    : this.getPrice();

                bonusMultiplier = bonusMultiplier != null
                    ? new BigNumber(bonusMultiplier)
                    : this.getBonusMultiplierByTokens(amount);

                return new BigNumber(amount).mul(price);
            },
            convertEthToTokens(amount, price, bonusMultiplier) {
                price = price
                    ? new BigNumber(price)
                    : this.getPrice();

                bonusMultiplier = bonusMultiplier
                    ? new BigNumber(bonusMultiplier)
                    : this.getBonusMultiplierByEth(amount);

                return new BigNumber(amount).div(price);
            },
            handleTokensChange(value, prevValue) {
                value = isNaN(parseFloat(value))
                    ? '0'
                    : value;

                if (this.blockChangeETHs || !this.currentToken.crowdSaleInformation) {
                    return;
                }

                const withDiscount = this.convertTokensToEth(value);
                const withoutDiscount = this.convertTokensToEth(value, this.currentToken.crowdSaleInformation.tokenPrice, 1);
                const tokensWithoutDiscount = this.convertEthToTokens(withDiscount, this.currentToken.crowdSaleInformation.tokenPrice, 1);

                this.blockChangeTokens = true;

                this.ETHs = withDiscount.toString();
                this.ETHsWithoutDiscount = withoutDiscount.toString();
                this.tokensWithoutDiscount = tokensWithoutDiscount.toString();

                this.total = this.ETHs;

                this.$nextTick(() => {
                    this.blockChangeTokens = false;
                });
            },
            handleETHsChange(value, prevValue) {
                value = isNaN(parseFloat(value))
                    ? '0'
                    : value;

                if (this.blockChangeTokens || !this.currentToken.crowdSaleInformation) {
                    return;
                }

                const withDiscount = this.convertEthToTokens(value);
                const withoutDiscount = this.convertEthToTokens(value, this.currentToken.crowdSaleInformation.tokenPrice, 1);
                const ethWithoutDiscount = this.convertTokensToEth(withDiscount, this.currentToken.crowdSaleInformation.tokenPrice, 1);

                this.blockChangeETHs = true;

                this.tokens = withDiscount.toString();
                this.tokensWithoutDiscount = withoutDiscount.toString();
                this.ETHsWithoutDiscount = ethWithoutDiscount.toString();

                this.total = this.ETHs;

                this.$nextTick(() => {
                    this.blockChangeETHs = false;
                });
            },
            async buy() {
                if(this.disable) return;

                const amount = new BigNumber(this.total);

                this.loading = true;
                try {
                    const {W12CrowdsaleFactory} = await this.ledgerFetch(this.currentToken.version);
                    const connectedWeb3 = (await Connector.connect()).web3;
                    const W12Crowdsale = W12CrowdsaleFactory.at(this.currentToken.crowdSaleInformation.crowdsaleAddress);
                    const tx = await W12Crowdsale.methods.buyTokens({value: web3.toWei(amount.toFixed(18), 'ether')}); //amount.toFixed(6)
                    this.$store.commit(`Transactions/${UPDATE_TX}`, {
                        token: this.currentToken.crowdSaleInformation.WTokenAddress,
                        name: "buy",
                        hash: tx,
                        status: "pending"
                    });
                    await waitTransactionReceipt(tx, connectedWeb3);
                } catch (e) {
                    console.error(e);
                    this.error = errorMessageSubstitution(e);
                }
                this.loading = false;
            },
            async handleSelectedChange(newSelected, oldSelected) {
                if (newSelected && oldSelected && newSelected.name !== oldSelected.name) {
                    this.total = 0;
                    this.ETHs = 0;
                    this.tokens = 0;
                }
                await this.updateAccountData();
                this.unsubscribeFromEvents();
                await this.subscribeToEvents();
            },
            unsubscribeFromEvents() {
                if (!this.subscribedEvents) return;

                this.subscribedEvents.TokenPurchase.stopWatching();
                this.subscribedEvents = null;
            },
            async subscribeToEvents() {
                if (!this.currentToken) return;
                if (this.subscribedEvents) return;

                this.subscribeToEventsLoading = true;

                try {
                    const {W12CrowdsaleFactory} = await this.ledgerFetch(this.currentToken.version);
                    const W12Crowdsale = W12CrowdsaleFactory.at(this.currentToken.crowdSaleInformation.crowdsaleAddress);
                    const TokenPurchase = W12Crowdsale.events.TokenPurchase(null, null, this.onTokenPurchaseEvent);

                    this.subscribedEvents = {
                        TokenPurchase,
                    };
                } catch (e) {
                    this.error = errorMessageSubstitution(e);
                }

                this.subscribeToEventsLoading = false;
            },
            async onTokenPurchaseEvent(error, result) {
                if (!error) {
                    await this.$store.dispatch('Cache/blockNumberUp');
                    const tx = result.transactionHash;
                    await this.updateAccountData();
                    await this.tokensListUpdate(this.currentToken);
                    this.$store.commit(`Transactions/${CONFIRM_TX}`, tx);
                }
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
            async onCurrentTokenDeepUpdate () {
                await this.watchCountdown();
                await this.handleSelectedChange();
            },
        },
    };
</script>
