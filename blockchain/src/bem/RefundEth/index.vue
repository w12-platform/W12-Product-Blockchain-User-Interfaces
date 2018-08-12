<template>
    <div class="RefundEth byefy">
        <h2>REFUND. Вернуть: {{ currentToken.symbol }}, получить: ETH</h2>
        <RefundInformation v-if="refundInformation" :data="refundInformation"></RefundInformation>
        <div v-if="refundInformation">
            <RefundCalculator v-if="refundInformation.currentWalletBalanceInRefundAmount"
                              v-model="refundValueInTokens"
                              :refundInformation="refundInformation"
                              :fundAddress="currentToken.crowdSaleInformation.fund.W12FundAddress"
                              :accountAddress="currentAccount"
                              :tokenSymbol="currentToken.symbol"
                              :tokenDecimals="currentToken.decimals">
            </RefundCalculator>
            <div class="py-2">
                <button class="btn btn-primary py-2"
                        @click="approveTheFundToSpend"
                >Разрешить возврат
                </button>
            </div>
            <div v-if="this.currentAccountData.allowanceForTheFund !== '0'" class="py-2">Обменять {{
                currentAccountData.allowanceForTheFund | toEth }} {{ currentToken.symbol }} на {{
                currentAccountData.allowanceForTheFundInRefundAmount | toEth }} ETH?
            </div>
            <div v-if="this.currentAccountData.allowanceForTheFund !== '0'" class="row pl-3 pr-3">

                <button
                        class="btn btn-primary py-2"
                        @click="decreaseTheFundApprovalToSpend">Отменить
                </button>
                <button
                        class="btn btn-primary py-2 ml-3"
                        @click="refund">Обменять
                </button>
            </div>
        </div>
    </div>
</template>

<script>
    import './default.scss';
    import Connector from "lib/Blockchain/DefaultConnector";
    import {waitTransactionReceipt} from 'lib/utils.js';
    import {createNamespacedHelpers} from "vuex";
    import RefundInformation from 'bem/RefundInformation';
    import RefundCalculator from 'bem/RefundCalculator';
    import {RefundInformationModel} from 'bem/RefundInformation/shared.js';

    const web3 = new Web3();
    const BigNumber = web3.BigNumber;

    const TokensListNS = createNamespacedHelpers("TokensList");
    const AccountNS = createNamespacedHelpers("Account");
    const LedgerNS = createNamespacedHelpers("Ledger");
    const ConfigNS = createNamespacedHelpers("Config");

    export default {
        name: 'RefundEth',
        template: '#RefundEthTemplate',
        components: {
            RefundInformation,
            RefundCalculator,
        },
        filters: {
            toEth(value) {
                value = new BigNumber(value);
                return web3.fromWei(value, 'ether').toString();
            },
        },
        data() {
            return {
                refundValueInTokens: '0',
            };
        },
        watch: {},
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
                        currentWalletBalanceInRefundAmount: web3.fromWei(this.currentAccountData.totalRefundAmount, 'ether').toString()
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

            async approveTheFundToSpend() {
                try {
                    const {W12TokenFactory} = await this.ledgerFetch();
                    const {web3} = await Connector.connect();
                    const W12Token = W12TokenFactory.at(this.currentToken.crowdSaleInformation.WTokenAddress);

                    const approveTx = await W12Token.methods.approve(
                        this.currentToken.crowdSaleInformation.fund.W12FundAddress,
                        web3.toWei(this.refundValueInTokens, 'ether'),
                        {from: this.currentAccount}
                    );

                    await waitTransactionReceipt(approveTx, web3);
                    setTimeout(async () => {
                        await this.updateAccountData();
                    }, 5000);
                } catch (e) {
                    console.log(e);
                }
            },
            async decreaseTheFundApprovalToSpend() {
                try {
                    const value = new BigNumber(this.currentAccountData.allowanceForTheFund);
                    const {W12TokenFactory} = await this.ledgerFetch();
                    const {web3} = await Connector.connect();
                    const W12Token = W12TokenFactory.at(this.currentToken.crowdSaleInformation.WTokenAddress);

                    const approveTx = await W12Token.methods.decreaseApproval(
                        this.currentToken.crowdSaleInformation.fund.W12FundAddress,
                        value,
                        {from: this.currentAccount}
                    );

                    await waitTransactionReceipt(approveTx, web3);
                    setTimeout(async () => {
                        await this.updateAccountData();
                    }, 5000);
                } catch (e) {
                    console.log(e);
                }
            },
            async refund() {
                try {
                    const value = new BigNumber(this.currentAccountData.allowanceForTheFund);

                    if (value.gt(0)) {
                        const {W12FundFactory} = await this.ledgerFetch();
                        const {web3} = await Connector.connect();
                        const W12Fund = W12FundFactory.at(this.currentToken.crowdSaleInformation.fund.W12FundAddress);

                        const tx = await W12Fund.methods.refund(value, {from: this.currentAccount});

                        await waitTransactionReceipt(tx, web3);

                        setTimeout(async () => {
                            await this.updateAccountData();
                        }, 5000);
                    }
                } catch (e) {
                    console.log(e);
                }
            }
        }
    }
</script>