<template>
    <div class="RefundEth byefy" v-if="currentToken && currentAccountData">
        <h2>{{ $t('InvestorDashboardRefundEth', { WToken: currentToken.symbol }) }}</h2>
        <div v-if="refundInformation && !isPendingTx && !isErrorTx">
            <RefundCalculator v-if="canUserRefund"
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
            <div v-if="exchangeAmountPerAsset" class="row py-2">
                <div class="col">
                    {{
                        $t('InvestorDashboardRefundExchangeForAssetsTitle', {
                            amount: allowanceForRefunding,
                            symbols: currentToken.symbol
                        })
                    }}
                </div>
                <div v-if="!exchangeAmountPerAsset" class="col">-</div>
                <div v-else class="col">
                    <span v-for="(value, symbol) in exchangeAmountPerAsset" :key="symbol">
                        {{ value }} {{ symbol }}
                        <br>
                    </span>
                </div>
            </div>
            <div v-if="exchangeAmountPerAsset" class="pl-3 pr-3">
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

    </div>
</template>

<script>
    import './default.scss';
    import { getMilestoneNumber } from '@/lib/selectors/crowdsale';
    import {
        getActualBalanceInAssets,
        getActualBalanceInToken,
        getAssetBySymbol,
        getRefundAmountForOneToken, getRefundedAmountPerAsset,
        getTokenPriceForInvestor,
        getTotalTokenRefundedPercent
    } from '@/lib/selectors/fund';
    import { convertionByDecimals, reverseConversionByDecimals } from '@/lib/selectors/units';
    import { CANCEL_TX } from '@/store/modules/Transactions';
    import Connector from "lib/Blockchain/DefaultConnector";
    import { waitTransactionReceipt } from 'lib/utils.js';
    import {createNamespacedHelpers} from "vuex";
    import RefundInformation from 'bem/RefundInformation/0.26.0';
    import RefundCalculator from 'bem/RefundCalculator/0.26.0';
    import {RefundInformationModel} from 'bem/RefundInformation/0.26.0/shared.js';
    import {UPDATE_TX, CONFIRM_TX} from "store/modules/Transactions.js";
    import { getRefundWindow, isRefundActive, web3, BigNumber, waitContractEventOnce } from '@/lib/utils';

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
                if (this.currentToken && this.currentAccountData) {
                    const refundAmountPerToken = getRefundAmountForOneToken(
                        this.currentAccountData.investorInformation.totalBought,
                        this.currentAccountData.investorInformation.fundedAmountPerAsset,
                        (v) => v.toString()
                    );
                    const freezeTokensVolume = reverseConversionByDecimals(
                        this.currentAccountData.vestingBalance,
                        this.currentToken.crowdSaleInformation.WTokenDecimals
                    )
                        .toString();
                    const refundTokensVolume = reverseConversionByDecimals(
                        this.currentAccountData.unVestingBalance,
                        this.currentToken.crowdSaleInformation.WTokenDecimals
                    )
                        .toString();
                    const currentWalletBalanceInTokens = reverseConversionByDecimals(
                        this.currentAccountData.balance,
                        this.currentToken.crowdSaleInformation.WTokenDecimals
                    )
                        .toString();
                    const currentWalletBalanceInRefundedAssets = getRefundedAmountPerAsset(
                        refundTokensVolume,
                        refundAmountPerToken,
                        (v) => v.toString()
                    );

                    return new RefundInformationModel({
                        tokenSymbol: this.currentToken.symbol,
                        tokenDecimals: this.currentToken.decimals,
                        freezeTokensVolume,
                        refundTokensVolume,
                        refundAmountPerToken,
                        tokenPrice: getTokenPriceForInvestor(
                            this.currentAccountData.investorInformation.totalBought,
                            getAssetBySymbol(this.currentAccountData.investorInformation.fundedAmountPerAsset, 'USD')
                        )
                            .toString(),
                        fundTokensBalance: getActualBalanceInToken(
                            this.currentToken.crowdSaleInformation.fund.totalTokenBought,
                            this.currentToken.crowdSaleInformation.fund.totalTokenRefunded
                        )
                            .toString()
                        ,
                        fundBalancePerAsset: getActualBalanceInAssets(
                            this.currentToken.crowdSaleInformation.fund.totalFundedPerAsset,
                            this.currentToken.crowdSaleInformation.fund.totalReleasedPerAsset,
                            (v) => v.toString()
                        ),
                        totalRefundPercent: getTotalTokenRefundedPercent(
                            this.currentToken.crowdSaleInformation.fund.totalTokenBought,
                            this.currentToken.crowdSaleInformation.fund.totalTokenRefunded
                        )
                            .toFixed(2)
                            .toString()
                        ,
                        currentWalletBalanceInTokens,
                        currentWalletBalanceInRefundedAssets,
                        currentMilestoneNumber: getMilestoneNumber(this.currentToken.crowdSaleInformation.currentMilestoneIndex) > 1
                            ? getMilestoneNumber(this.currentToken.crowdSaleInformation.currentMilestoneIndex)
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
            allowanceForRefunding() {
                if (!this.currentAccountData || !this.currentToken) return new BigNumber(0);

                return reverseConversionByDecimals(
                    this.currentAccountData.allowanceForTheFund,
                    this.currentToken.crowdSaleInformation.WTokenDecimals
                )
            },
            exchangeAmountPerAsset() {
                if (
                    !this.refundInformation
                    || new BigNumber(this.allowanceForRefunding).eq(0)
                ) {
                    return null;
                }

                return getRefundedAmountPerAsset(
                    this.allowanceForRefunding,
                    this.refundInformation.refundAmountPerToken,
                    (v) => v.toString()
                );
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
                const decimals = this.currentToken ? this.currentToken.crowdSaleInformation.WTokenDecimals : 0;

                if (value.isNaN() || value.lessThan(0)) {
                    return '0';
                }

                return convertionByDecimals(value, decimals).toString();
            },
            isRefundActive() {
                if (getMilestoneNumber(this.currentToken.crowdSaleInformation.currentMilestoneIndex) === 0) {
                    return false;
                }

                return isRefundActive(
                    this.currentToken.crowdSaleInformation.milestones,
                    this.currentToken.crowdSaleInformation.currentMilestoneIndex,
                );
            },
            actualFundBalanceInToken() {
                if (!this.currentToken) {
                    return '0';
                }

                return getActualBalanceInToken(
                    this.currentToken.crowdSaleInformation.fund.totalTokenBought,
                    this.currentToken.crowdSaleInformation.fund.totalTokenRefunded
                )
                    .toString();
            },
            canUserRefund() {
                if (!this.currentAccountData) {
                    return false;
                }

                return (
                    this.isRefundActive
                    && new BigNumber(this.currentAccountData.investorInformation.totalBought).gt(0)
                    && new BigNumber(this.actualFundBalanceInToken).gt(0)
                );
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
                return (
                    new BigNumber(this.refundValueInTokens || 0).eq(0)
                    || new BigNumber(this.refundInformation.refundTokensVolume || 0).eq(0)
                    || new BigNumber(this.refundTokensVolume || 0)
                        .greaterThan(this.refundInformation.refundTokensVolume || 0)
                );
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

                let tx;

                try {
                    const {W12TokenFactory} = await this.ledgerFetch(this.currentToken.version);
                    const {web3} = await Connector.connect();
                    const W12Token = W12TokenFactory.at(this.currentToken.crowdSaleInformation.WTokenAddress);

                    const event = waitContractEventOnce(W12Token, 'Approval', {
                        owner: this.currentAccount,
                        spender: this.currentToken.crowdSaleInformation.fund.W12FundAddress
                    });

                    tx = await W12Token.methods.approve(
                        this.currentToken.crowdSaleInformation.fund.W12FundAddress,
                        this.adjustedRefundValueInTokens
                    );

                    this.$store.commit(`Transactions/${UPDATE_TX}`, {
                        token: this.currentToken.crowdSaleInformation.WTokenAddress,
                        name: "refund",
                        hash: tx,
                        status: "pending"
                    });

                    await waitTransactionReceipt(tx, web3);
                    await event;

                    this.$store.commit(`Transactions/${CONFIRM_TX}`, tx);

                    await this.tokensListUpdate({ Index: this.currentToken.index });
                    await this.updateAccountData();
                } catch (e) {
                    console.error(e);
                    this.error = e.message;

                    if (tx) {
                        this.$store.commit(`Transactions/${CANCEL_TX}`, tx);
                    }
                }
                this.loading = false;
            },
            async decreaseTheFundApprovalToSpend() {
                this.loading = true;

                let tx;

                try {
                    const value = new BigNumber(this.currentAccountData.allowanceForTheFund);
                    const {W12TokenFactory} = await this.ledgerFetch(this.currentToken.version);
                    const {web3} = await Connector.connect();
                    const W12Token = W12TokenFactory.at(this.currentToken.crowdSaleInformation.WTokenAddress);

                    const event = waitContractEventOnce(W12Token, 'Approval', {
                        owner: this.currentAccount,
                        spender: this.currentToken.crowdSaleInformation.fund.W12FundAddress
                    });

                    tx = await W12Token.methods.decreaseApproval(
                        this.currentToken.crowdSaleInformation.fund.W12FundAddress,
                        value
                    );

                    this.$store.commit(`Transactions/${UPDATE_TX}`, {
                        token: this.currentToken.crowdSaleInformation.WTokenAddress,
                        name: "refund",
                        hash: tx,
                        status: "pending"
                    });

                    await waitTransactionReceipt(tx, web3);
                    await event;

                    this.$store.commit(`Transactions/${CONFIRM_TX}`, tx);

                    await this.tokensListUpdate({ Index: this.currentToken.index });
                    await this.updateAccountData();
                } catch (e) {
                    console.error(e);
                    this.error = e.message;

                    if (tx) {
                        this.$store.commit(`Transactions/${CANCEL_TX}`, tx);
                    }
                }

                this.loading = false;
            },
            async refund() {
                this.loading = true;

                let tx;

                try {
                    const value = new BigNumber(this.currentAccountData.allowanceForTheFund);

                    if (value.gt(0)) {
                        const {W12FundFactory} = await this.ledgerFetch(this.currentToken.version);
                        const {web3} = await Connector.connect();
                        const W12Fund = W12FundFactory.at(this.currentToken.crowdSaleInformation.fund.W12FundAddress);

                        const event = waitContractEventOnce(W12Fund, 'TokenRefunded', {
                            investor: this.currentAccount
                        });

                        tx = await W12Fund.methods.refund(value);

                        this.$store.commit(`Transactions/${UPDATE_TX}`, {
                            token: this.currentToken.crowdSaleInformation.WTokenAddress,
                            name: "refund",
                            hash: tx,
                            status: "pending"
                        });

                        await waitTransactionReceipt(tx, web3);
                        await event;

                        this.$store.commit(`Transactions/${CONFIRM_TX}`, tx);

                        await this.updateAccountData();
                        await this.tokensListUpdate({ Index: this.currentToken.index });
                    }
                } catch (e) {
                    console.error(e);
                    this.error = e.message;

                    if (tx) {
                        this.$store.commit(`Transactions/${CANCEL_TX}`, tx);
                    }
                }

                this.loading = false;
            },
            async handleSelectedChange() {
                await this.updateAccountData();
                window.dispatchEvent(new Event('resize'));
            }
        }
    }
</script>
