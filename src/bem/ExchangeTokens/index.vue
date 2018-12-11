<template>
    <div class="ExchangeTokens buefy" v-if="currentToken">
        <h2 class="ExchangeTokens__title">{{ $t('InvestorDashboardExchangeTokens', { WToken: currentToken.symbol, Token:
            currentToken.tokenInformation.symbol}) }}</h2>
        <div class="ExchangeTokens__content">
            <table v-if="currentToken && currentAccountData"
                   class="table table-striped table-bordered table-hover table-responsive-sm">
                <tbody>
                <tr>
                    <td>{{ $t('InvestorDashboardExchangeTokensCourse', { WToken: currentToken.symbol }) }}</td>
                    <td>{{ rate }} {{ currentToken.tokenInformation.symbol }}</td>
                </tr>
                <tr>
                    <td>{{ $t('InvestorDashboardExchangeTokensBalance', {WToken: currentToken.symbol}) }}</td>
                    <td>{{ balance }}
                    </td>
                </tr>
                <tr>
                    <td>{{ $t('InvestorDashboardExchangeTokensUnVestingBalance', {WToken: currentToken.symbol}) }}</td>
                    <td>{{ unVestingBalance }}</td>
                </tr>
                </tbody>
            </table>
            <b-notification class="" v-if="error" @close="error = false" type="is-danger" has-icon>
                {{ error }}
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
            <div class="ExchangeTokens__form" v-if="!isPendingTx && !isErrorTx">
                <label v-if="this.currentAccountData.allowanceForSwap === '0'" for="Amount">{{
                    $t('InvestorDashboardExchangeTokensAmount', {WToken: currentToken.symbol}) }}</label>
                <b-field v-if="this.currentAccountData.allowanceForSwap === '0'" id="Amount">
                    <b-icon icon="shopping"></b-icon>
                    <cleave
                            :placeholder="$t('InvestorDashboardExchangeTokensAmountPlaceholder')"
                            v-model="amount"
                            :options="optionsNumber"
                            class="form-control"
                            name="BaseTokenPrice"
                            min="0"
                            @keyup.enter.native="approveSwapToSpend"
                    ></cleave>
                </b-field>

                <div v-if="this.currentAccountData.allowanceForSwap === '0'">{{
                    $t('InvestorDashboardExchangeTokensMessagesBeforeApprove') }} {{ amount * rate }} {{
                    currentToken.tokenInformation.symbol }}
                </div>

                <div class="ExchangeTokens__exchange py-2">
                    <button class="btn btn-primary py-2" :disabled="disable"
                            v-if="this.currentAccountData.allowanceForSwap === '0'" @click="approveSwapToSpend">{{
                        $t('InvestorDashboardExchangeTokensApprove') }}
                    </button>

                    <div v-if="this.currentAccountData.allowanceForSwap !== '0'" class="py-2">
                        {{ $t('InvestorDashboardExchangeTokensMessagesBeforeSwap', {
                        allowance: toEthDecimals(currentAccountData.allowanceForSwap),
                        WToken: currentToken.symbol,
                        Token: currentToken.tokenInformation.symbol
                        })}}
                    </div>
                    <div v-if="this.currentAccountData.allowanceForSwap !== '0'" class="row pl-3 pr-3">

                        <button
                                class="btn btn-primary py-2"
                                :disabled="this.currentAccountData.allowanceForSwap === '0'"
                                @click="decreaseSwapApprovalToSpend">{{ $t('InvestorDashboardExchangeTokensDecrease') }}
                        </button>
                        <button
                                class="btn btn-primary py-2 ml-3"
                                :disabled="this.currentAccountData.allowanceForSwap === '0'"
                                @click="exchange">{{ $t('InvestorDashboardExchangeTokensExchange') }}
                        </button>
                    </div>
                    <table
                        v-if="currentToken && currentAccountData"
                        class="table table-striped table-bordered table-hover table-responsive-sm my-4"
                    >
                        <tbody>
                            <tr>
                                <td>{{ $t('InvestorDashboardExchangeTokensVestingBalance', {WToken: currentToken.symbol}) }}</td>
                                <td>{{ vestingBalance }}</td>
                            </tr>
                            <tr v-if="currentToken.crowdSaleInformation.vestingDate">
                                <td>{{ $t('InvestorDashboardExchangeTokensVestingDate') }}</td>
                                <td>{{ currentToken.crowdSaleInformation.vestingDate | dateFormat }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <b-loading :is-full-page="false" :active="tokensListMeta.updated"></b-loading>
    </div>
</template>

<script>
    import './default.scss';
    import Connector from "lib/Blockchain/DefaultConnector";
    import { waitTransactionReceipt, formatNumber, toWeiDecimals, fromWeiDecimals, fromWeiDecimalsString, errorMessageSubstitution} from 'lib/utils.js';
    import {createNamespacedHelpers} from "vuex";
    import {UPDATE_TX, CONFIRM_TX} from "store/modules/Transactions.js";
    import Web3 from 'web3';
    import moment from 'moment';

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

    const TokensListNS = createNamespacedHelpers("TokensList");
    const AccountNS = createNamespacedHelpers("Account");
    const LedgerNS = createNamespacedHelpers("Ledger");
    const ConfigNS = createNamespacedHelpers("Config");
    const TransactionsNS = createNamespacedHelpers("Transactions");


    export default {
        name: 'ExchangeTokens',
        template: '#ExchangeTokensTemplate',
        components: {},
        filters: {
            dateFormat (value) {
                return moment(value * 1000).utc().format("DD.MM.YYYY HH:mm");
            },
        },
        data() {
            return {
                loading: false,
                error: false,
                subscribeToEventsLoading: false,

                rate: 1,
                amount: 0,
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
            currentToken: {
                handler: 'handleSelectedChange',
                immediate: true
            }
        },
        computed: {
            ...ConfigNS.mapState({
                configW12Lister: "W12Lister"
            }),
            ...AccountNS.mapState({
                currentAccount: "currentAccount",
                currentAccountData: "currentAccountData",
            }),
            ...TokensListNS.mapState({
                tokensListMeta: 'meta',
                currentToken: "currentToken"
            }),
            ...TransactionsNS.mapState({
                TransactionsList: "list"
            }),

            balance() {
                return fromWeiDecimalsString(this.currentAccountData.balance, this.currentToken.decimals);
            },
            unVestingBalance() {
                return fromWeiDecimalsString(this.currentAccountData.unVestingBalance, this.currentToken.decimals);
            },
            vestingBalance() {
                return fromWeiDecimalsString(this.currentAccountData.vestingBalance, this.currentToken.decimals);
            },
            isErrorTx() {
                return this.TransactionsList && this.TransactionsList.length
                    ? this.TransactionsList.find((tr) => {
                        return tr.token
                        && tr.name
                        && tr.hash
                        && tr.status
                        && tr.token === this.currentToken.crowdSaleInformation.WTokenAddress
                        && tr.name === "exchangeTokens"
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
                        && tr.name === "exchangeTokens"
                        && tr.status === "pending"
                            ? tr
                            : false
                    })
                    : false;
            },
            disable() {
                return parseFloat(this.unVestingBalance) === 0
                    || (parseFloat(this.unVestingBalance) < parseFloat(this.amount))
                    || parseFloat(this.amount) <= 0
                    || !this.amount;
                // return new BigNumber(this.unVestingBalance).eq(0)
                //     || !this.amount
                //     || new BigNumber(this.unVestingBalance).lt(new BigNumber(this.amount)
                //         || new BigNumber(this.amount).lte(0);
            }
        },
        methods: {
            ...LedgerNS.mapActions({
                ledgerFetch: "fetch"
            }),
            ...TokensListNS.mapActions({
                tokensListUpdate: "update"
            }),
            ...AccountNS.mapActions({
                updateAccountData: 'updateAccountData',
            }),
            ...TransactionsNS.mapActions({
                TransactionsRetry: "retry"
            }),
            toEth(value) {
                value = value ? new BigNumber(value) : 0;
                return web3.fromWei(value, 'ether').toString();
            },
            toEthDecimals(value) {
                value = value ? new BigNumber(value) : 0;
                return fromWeiDecimalsString(value, this.currentToken.decimals);
            },
            async approveSwapToSpend() {
                this.loading = true;
                try {
                    const {W12TokenFactory, W12ListerFactory} = await this.ledgerFetch(this.currentToken.version);
                    const W12Lister = W12ListerFactory.at(this.currentToken.listerAddress);
                    const {web3} = await Connector.connect();
                    const W12Token = W12TokenFactory.at(this.currentToken.crowdSaleInformation.WTokenAddress);
                    const swapAddress = (await W12Lister.swap());
                    const tx = await W12Token.methods.approve(
                        swapAddress,
                        toWeiDecimals(this.amount, this.currentToken.decimals),
                        {from: this.currentAccount}
                    );
                    this.$store.commit(`Transactions/${UPDATE_TX}`, {
                        token: this.currentToken.crowdSaleInformation.WTokenAddress,
                        name: "exchangeTokens",
                        hash: tx,
                        status: "pending"
                    });
                    await waitTransactionReceipt(tx, web3);
                    await this.updateAccountData();
                } catch (e) {
                    this.error = errorMessageSubstitution(e);
                }
                this.loading = false;
            },

            async decreaseSwapApprovalToSpend() {
                this.loading = true;
                try {
                    const {W12TokenFactory, W12ListerFactory} = await this.ledgerFetch(this.currentToken.version);
                    const W12Lister = W12ListerFactory.at(this.currentToken.listerAddress);
                    const {web3} = await Connector.connect();
                    const W12Token = W12TokenFactory.at(this.currentToken.crowdSaleInformation.WTokenAddress);
                    const swapAddress = (await W12Lister.swap());

                    const tx = await W12Token.methods.decreaseApproval(
                        swapAddress,
                        new BigNumber(this.currentAccountData.allowanceForSwap),
                        {from: this.currentAccount}
                    );
                    this.$store.commit(`Transactions/${UPDATE_TX}`, {
                        token: this.currentToken.crowdSaleInformation.WTokenAddress,
                        name: "exchangeTokens",
                        hash: tx,
                        status: "pending"
                    });
                    await waitTransactionReceipt(tx, web3);
                    await this.updateAccountData();
                } catch (e) {
                    this.error = errorMessageSubstitution(e);
                }
                this.loading = false;
            },

            async exchange() {
                this.loading = true;
                try {
                    const {W12AtomicSwapFactory, W12ListerFactory, TokenExchangerFactory} = await this.ledgerFetch(this.currentToken.version);
                    const W12Lister = W12ListerFactory.at(this.currentToken.listerAddress);
                    const {web3} = await Connector.connect();
                    const swapAddress = (await W12Lister.swap());
                    const W12AtomicSwap = TokenExchangerFactory ? TokenExchangerFactory.at(swapAddress):W12AtomicSwapFactory.at(swapAddress);
                    const tx = await W12AtomicSwap.methods.exchange(
                        this.currentToken.crowdSaleInformation.WTokenAddress,
                        new BigNumber(this.currentAccountData.allowanceForSwap)
                    );
                    this.$store.commit(`Transactions/${UPDATE_TX}`, {
                        token: this.currentToken.crowdSaleInformation.WTokenAddress,
                        name: "exchangeTokens",
                        hash: tx,
                        status: "pending"
                    });
                    await waitTransactionReceipt(tx, web3);
                    await this.updateAccountData();
                } catch (e) {
                    this.error = errorMessageSubstitution(e);
                }
                this.loading = false;
            },
            async handleSelectedChange() {
                await this.updateAccountData();
                this.unsubscribeFromEvents();
                await this.subscribeToEvents();
            },

            unsubscribeFromEvents() {
                if (!this.subscribedEvents) return;

                if(this.subscribedEvents.ApprovalEvent){
                    this.subscribedEvents.ApprovalEvent.stopWatching();
                }
                if(this.subscribedEvents.ExchangeEvent){
                    this.subscribedEvents.ExchangeEvent.stopWatching();
                }

                this.subscribedEvents = null;
            },
            async subscribeToEvents() {
                if (!this.currentToken) return;
                if (this.subscribedEvents) return;

                this.subscribeToEventsLoading = true;

                try {
                    const {ERC20Factory, W12AtomicSwapFactory, W12ListerFactory, TokenExchangerFactory} = await this.ledgerFetch(this.currentToken.version);
                    const ERC20 = ERC20Factory.at(this.currentToken.crowdSaleInformation.WTokenAddress);
                    const W12Lister = W12ListerFactory.at(this.currentToken.listerAddress);
                    const swapAddress = (await W12Lister.swap());
                    const W12AtomicSwap = TokenExchangerFactory ? TokenExchangerFactory.at(swapAddress):W12AtomicSwapFactory.at(swapAddress);
                    const ApprovalEvent = ERC20.events.Approval(null, null, this.onApprovalEvent);
                    const ExchangeEvent = W12AtomicSwap.events.Exchange(null, null, this.onExchangeEvent);

                    this.subscribedEvents = {
                        ApprovalEvent,
                        ExchangeEvent
                    };
                } catch (e) {
                    this.error = errorMessageSubstitution(e);
                }

                this.subscribeToEventsLoading = false;
            },

            async onExchangeEvent(error, result) {
                if (!error) {
                    await this.$store.dispatch('Cache/blockNumberUp');
                    await this.updateAccountData();
                    const tx = result.transactionHash;
                    this.$store.commit(`Transactions/${CONFIRM_TX}`, tx);
                }
            },
            async onApprovalEvent(error, result) {
                if (!error) {
                    await this.$store.dispatch('Cache/blockNumberUp');
                    await this.updateAccountData();
                    const tx = result.transactionHash;
                    this.$store.commit(`Transactions/${CONFIRM_TX}`, tx);
                }
            },
        }
    };
</script>
