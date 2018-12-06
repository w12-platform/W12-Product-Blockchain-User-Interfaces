<template>
    <div class="RefundEth byefy" v-if="currentToken && currentAccountData">
        <h2>{{ $t('InvestorDashboardRefundEth', { WToken: currentToken.symbol }) }}</h2>
        <div v-if="refundInformation && !isPendingTx && !isErrorTx">
            <RefundCalculator v-if="refundInformation.currentWalletBalanceInRefundAmount"
                              v-model="refundValueInTokens"
                              :refundInformation="refundInformation"
                              :fundAddress="currentToken.crowdSaleInformation.fund.W12FundAddress"
                              :accountAddress="currentAccount"
                              :tokenSymbol="currentToken.symbol"
                              :tokenDecimals="currentToken.decimals"
                              @approve="approveTheFundToSpend"
            >
            </RefundCalculator>
            <div class="py-2">
                <button class="btn btn-primary py-2" :disabled="disable"
                        @click="approveTheFundToSpend">{{ $t('InvestorDashboardRefundEthApprove') }}
                </button>
            </div>
            <div v-if="this.currentAccountData.allowanceForTheFund !== '0'" class="py-2">
                {{ $t('InvestorDashboardRefundEthMessagesBeforeRefund', {
                allowance: toEth(currentAccountData.allowanceForTheFund),
                WToken: currentToken.symbol,
                refundAmount: toEth(currentAccountData.allowanceForTheFundInRefundAmount)
                }) }}
            </div>
            <div v-if="this.currentAccountData.allowanceForTheFund !== '0'" class="row pl-3 pr-3">

                <button
                        class="btn btn-primary py-2"
                        @click="decreaseTheFundApprovalToSpend">{{ $t('InvestorDashboardRefundEthDecreaseRefund') }}
                </button>
                <button
                        class="btn btn-primary py-2 ml-3"
                        @click="refund">{{ $t('InvestorDashboardRefundEthTokensRefund') }}
                </button>
            </div>
        </div>
        <RefundInformation v-if="refundInformation" :data="refundInformation"></RefundInformation>

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

    </div>
</template>

<script>
    import './default.scss';
    import Connector from "lib/Blockchain/DefaultConnector";
    import { waitTransactionReceipt, formatNumber, toWeiDecimals, fromWeiDecimals, fromWeiDecimalsString, errorMessageSubstitution} from 'lib/utils.js';
    import {createNamespacedHelpers} from "vuex";
    import RefundInformation from 'bem/RefundInformation';
    import RefundCalculator from 'bem/RefundCalculator';
    import {RefundInformationModel} from 'bem/RefundInformation/shared.js';
    import {UPDATE_TX, CONFIRM_TX} from "store/modules/Transactions.js";
    import Web3 from 'web3';
    import { getRefundWindow, isRefundActive } from '../../lib/utils';

    const web3 = new Web3();
    const BigNumber = web3.BigNumber;

    const TokensListNS = createNamespacedHelpers("TokensList");
    const AccountNS = createNamespacedHelpers("Account");
    const LedgerNS = createNamespacedHelpers("Ledger");
    const ConfigNS = createNamespacedHelpers("Config");
    const TransactionsNS = createNamespacedHelpers("Transactions");

    export default {
        name: 'RefundEth',
        template: '#RefundEthTemplate',
        components: {
            RefundInformation,
            RefundCalculator,
        },
        filters: {
            toEth(value) {
                value = value ? new BigNumber(value):0;
                return web3.fromWei(value, 'ether').toString();
            },
        },
        data() {
            return {
                refundValueInTokens: '0',
                loading: false,
                error: false,
                subscribeToEventsLoading: false,
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
                currentToken: "currentToken"
            }),
            ...TransactionsNS.mapState({
                TransactionsList: "list"
            }),

            refundInformation() {
                if (this.currentToken) {
                    const totalRefundPercent = new BigNumber(this.currentToken.crowdSaleInformation.fund.totalRefunded).eq(0)
                        ? '0'
                        : new BigNumber(this.currentToken.crowdSaleInformation.fund.totalRefunded)
                            .div(this.currentToken.crowdSaleInformation.fund.totalFunded)
                            .mul(100)
                            .toFixed(2)
                            .toString();

                    return new RefundInformationModel({
                        tokenSymbol: this.currentToken.symbol,
                        tokenDecimals: this.currentToken.decimals,
                        freezeTokensVolume: new BigNumber(this.currentAccountData.vestingBalance).toString(),   //??? тут возможна ошибка
                        refundTokensVolume: new BigNumber(this.currentAccountData.unVestingBalance).toString(), //???
                        refundAmountPerToken: web3.fromWei(this.currentAccountData.refundForOneToken, 'ether').toString(),
                        tokenPrice: web3.fromWei(this.currentAccountData.investorInformation.averageTokenPrice, 'ether').toString(),
                        fundTokensBalance: web3.fromWei(this.currentAccountData.fundTokensBalance, 'ether').toString(),
                        fundBalance: web3.fromWei(this.currentToken.crowdSaleInformation.fund.foundBalanceInWei, 'ether').toString(),
                        totalRefundPercent,
                        currentWalletBalanceInTokens: this.currentAccountData.balance,
                        currentWalletBalanceInRefundAmount: web3.fromWei(this.currentAccountData.totalRefundAmount, 'ether').toString(),
                        currentMilestoneNumber: this.currentToken.crowdSaleInformation.currentMilestoneIndex > 0
                            ? this.currentToken.crowdSaleInformation.currentMilestoneIndex + 1
                            : null
                        ,
                        isRefundActive: isRefundActive(
                            this.currentToken.crowdSaleInformation.milestones,
                            this.currentToken.crowdSaleInformation.currentMilestoneIndex,
                        ),
                        refundWindow: getRefundWindow(
                            this.currentToken.crowdSaleInformation.milestones,
                            this.currentToken.crowdSaleInformation.currentMilestoneIndex,
                        )
                    });
                }
            },
            isApproveButtonDisabled() {
                const currentRefund = new BigNumber(this.refundValueInTokens || 0);
                const prevRefund = new BigNumber(this.currentAccountData.allowanceForTheFund || 0);

                return (
                    currentRefund.eq(0)
                    || prevRefund.gt(0)
                );
            },
            isRejectApprovalDisabled() {
                const value = new BigNumber(this.currentAccountData.allowanceForTheFund || 0);

                return (
                    value.eq(0)
                );
            },
            isConfirmRefundDisabled() {
                const value = new BigNumber(this.currentAccountData.allowanceForTheFundInRefundAmount || 0);

                return (
                    value.eq(0)
                );
            },
            adjustedRefundValueInTokens() {
                const value = new BigNumber(this.refundValueInTokens || 0);
                const decimals = this.currentToken ? this.currentToken.decimals : 0;
                return value.mul(new BigNumber(10).pow(decimals)).toString();
            },

            isErrorTx() {
                return this.TransactionsList && this.TransactionsList.length
                    ? this.TransactionsList.find((tr) => {
                        return tr.token
                        && tr.name
                        && tr.hash
                        && tr.status
                        && tr.token === this.currentToken.crowdSaleInformation.WTokenAddress
                        && tr.name === "refund"
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
                        && tr.name === "refund"
                        && tr.status === "pending"
                            ? tr
                            : false
                    })
                    : false;
            },
            disable() {
                return !this.refundValueInTokens
                    || !this.refundInformation.refundTokensVolume
                    || this.refundValueInTokens === "0"
                    || !new BigNumber(this.refundInformation.refundTokensVolume).gte(new BigNumber(this.adjustedRefundValueInTokens));
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
                value = value ? new BigNumber(value):0;
                return web3.fromWei(value, 'ether').toString();
            },
            async approveTheFundToSpend() {
                this.loading = true;
                try {
                    const {W12TokenFactory} = await this.ledgerFetch(this.currentToken.version);
                    const {web3} = await Connector.connect();
                    const W12Token = W12TokenFactory.at(this.currentToken.crowdSaleInformation.WTokenAddress);

                    const tx = await W12Token.methods.approve(
                        this.currentToken.crowdSaleInformation.fund.W12FundAddress,
                        web3.toWei(this.refundValueInTokens, 'ether'),
                        {from: this.currentAccount}
                    );
                    this.$store.commit(`Transactions/${UPDATE_TX}`, {
                        token: this.currentToken.crowdSaleInformation.WTokenAddress,
                        name: "refund",
                        hash: tx,
                        status: "pending"
                    });
                    await waitTransactionReceipt(tx, web3);
                    await this.updateAccountData();
                } catch (e) {
                    this.error = errorMessageSubstitution(e)
                }
                this.loading = false;
            },
            async decreaseTheFundApprovalToSpend() {
                this.loading = true;
                try {
                    const value = new BigNumber(this.currentAccountData.allowanceForTheFund);
                    const {W12TokenFactory} = await this.ledgerFetch(this.currentToken.version);
                    const {web3} = await Connector.connect();
                    const W12Token = W12TokenFactory.at(this.currentToken.crowdSaleInformation.WTokenAddress);

                    const tx = await W12Token.methods.decreaseApproval(
                        this.currentToken.crowdSaleInformation.fund.W12FundAddress,
                        value,
                        {from: this.currentAccount}
                    );
                    this.$store.commit(`Transactions/${UPDATE_TX}`, {
                        token: this.currentToken.crowdSaleInformation.WTokenAddress,
                        name: "refund",
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
            async refund() {
                this.loading = true;
                try {
                    const value = new BigNumber(this.currentAccountData.allowanceForTheFund);

                    if (value.gt(0)) {
                        const {W12FundFactory} = await this.ledgerFetch(this.currentToken.version);
                        const {web3} = await Connector.connect();
                        const W12Fund = W12FundFactory.at(this.currentToken.crowdSaleInformation.fund.W12FundAddress);

                        const tx = await W12Fund.methods.refund(value, {from: this.currentAccount});
                        this.$store.commit(`Transactions/${UPDATE_TX}`, {
                            token: this.currentToken.crowdSaleInformation.WTokenAddress,
                            name: "refund",
                            hash: tx,
                            status: "pending"
                        });
                        await waitTransactionReceipt(tx, web3);
                        await this.updateAccountData();
                    }
                } catch (e) {
                    this.error = errorMessageSubstitution(e);
                }
                this.loading = false;
            },
            async handleSelectedChange() {
                await this.updateAccountData();
                this.unsubscribeFromEvents();
                await this.subscribeToEvents();
                window.dispatchEvent(new Event('resize'));
            },

            unsubscribeFromEvents() {
                if (!this.subscribedEvents) return;

                this.subscribedEvents.FundsRefunded.stopWatching();
                this.subscribedEvents.ApprovalW12Event.stopWatching();

                this.subscribedEvents = null;
            },
            async subscribeToEvents() {
                if (!this.currentToken) return;
                if (this.subscribedEvents) return;

                this.subscribeToEventsLoading = true;

                try {
                    const {W12FundFactory, W12TokenFactory} = await this.ledgerFetch(this.currentToken.version);
                    const fundAddress = this.currentToken.crowdSaleInformation.fund.W12FundAddress;
                    const W12Fund = W12FundFactory.at(fundAddress);
                    const FundsRefunded = W12Fund.events.FundsRefunded(null, null, this.onFundsRefundedEvent);

                    const W12Token = W12TokenFactory.at(this.currentToken.wTokenAddress);
                    const ApprovalW12Event = W12Token.events.Approval(null, null, this.onApprovalW12Event);

                    this.subscribedEvents = {
                        ApprovalW12Event,
                        FundsRefunded,
                    };
                } catch (e) {
                    this.error = errorMessageSubstitution(e);
                }

                this.subscribeToEventsLoading = false;
            },
            async onFundsRefundedEvent(error, result) {
                if (!error) {
                    await this.$store.dispatch('Cache/blockNumberUp');
                    const tx = result.transactionHash;
                    await this.updateAccountData();
                    await this.tokensListUpdate(this.currentToken);
                    this.$store.commit(`Transactions/${CONFIRM_TX}`, tx);
                }
            },
            async onApprovalW12Event(error, result) {
                if (!error) {
                    await this.$store.dispatch('Cache/blockNumberUp');
                    const tx = result.transactionHash;
                    await this.tokensListUpdate(this.currentToken);
                    await this.updateAccountData();
                    this.$store.commit(`Transactions/${CONFIRM_TX}`, tx);
                }
            },
        }
    }
</script>
