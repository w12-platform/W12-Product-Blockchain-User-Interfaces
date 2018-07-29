<template>
    <div class="InvestorDashboard buefy">
        <section class="container">
            <h2>Investor Dashboard</h2>
            <div v-if="isLoading" class="alert alert-info" role="alert">
                <span v-if="loadingLedger">Загрузка смарт-контрактов...<br></span>
                <span v-if="fetchTokens">Загрузка списка токенов...<br></span>
            </div>
            <div v-if="errorMessage" class="alert alert-danger" role="alert">
                <span>{{ errorMessage }}</span>
            </div>
            <div v-if="!isLoading">
                <crowd-sale-switch :list="filteredTokensList"></crowd-sale-switch>
                <crowd-sale @updateCrowdSale="updateCrowdSale" v-if="selected"></crowd-sale>

                <h2 v-if="selected">Скидки</h2>
                <sale-table v-if="selected"></sale-table>

                <h2 v-if="selected && selected.status">Купить токены {{ selected.symbolW }}</h2>
                <calculator v-if="selected && selected.status"></calculator>

                <h2 v-if="selected" class="m-3">REFUND. Вернуть: {{ selected.symbolW }}, получить: ETH</h2>
                <div v-if="refundInformation">
                    <RefundInformation v-if="refundInformation" :data="refundInformation"></RefundInformation>
                    <hr>
                    <RefundCalculator v-if="refundInformation.currentWalletBalanceInRefundAmount"
                                      v-model="refundValueInTokens"
                                      :fundAddress="selected.fund.W12FundAddress"
                                      :accountAddress="currentAccount"
                                      :tokenSymbol="selected.symbolW"
                                      :tokenDecimals="selected.decimals">
                    </RefundCalculator>
                    <div>
                        <button class="btn m-3 btn-sm"
                                @click="approveTheFundToSpend" :disabled="isApproveButtonDisabled">
                            Разрешить возврат
                        </button>
                    </div>
                    <hr>
                    <div>
                        Ожидается обработка операции разрешения, через некоторое время потребуется Ваше подтверждение
                        <br><br>
                        <span>{{ currentAccountData.allowanceForTheFund }} {{ selected.symbolW }} на {{ currentAccountData.allowanceForTheFundInRefundAmount | toEth }} ETH</span>
                    </div>
                    <hr>
                    <div>
                        Подтвердите операцию возврата
                        <br><br>
                        <span>{{ currentAccountData.allowanceForTheFund }} {{ selected.symbolW }} на {{ currentAccountData.allowanceForTheFundInRefundAmount | toEth }} ETH</span>
                        <div>
                            <button class="btn m-3 btn-sm"
                                    @click="decreaseTheFundApprovalToSpend" :disabled="isRejectApprovalDisabled">
                                Отменить
                            </button>
                            <button class="btn m-3 btn-sm"
                                    @click="refund" :disabled="isConfirmRefundDisabled">
                                Подтвердить возврать средств
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    </div>
</template>

<script>
    import './default.scss';
    import 'bem/buefy/default.scss';
    import { createNamespacedHelpers } from "vuex";
    import Ledger from '../../lib/Blockchain/ContractsLedger.js';
    import {
        UNKNOWN_ERROR_WHILE_FETCH_TOKENS_LIST
    } from '../../errors.js';
    import Converter from '../Converter';
    import { promisify, waitTransactionReceipt } from '../../lib/utils.js';
    import CrowdSaleSwitch from '../CrowdSaleSwitch';
    import CrowdSale from '../CrowdSale';
    import RefundInformation from '../RefundInformation';
    import RefundCalculator from '../RefundCalculator';
    import { RefundInformationModel } from '../RefundInformation/shared.js';
    import Connector from '../../lib/Blockchain/DefaultConnector.js';

    const configStore = createNamespacedHelpers("config");
    const crowdSaleListStore = createNamespacedHelpers("crowdSaleList");

    const moment = window.moment;
    const web3 = new Web3();
    const BigNumber = web3.BigNumber;

    import SaleTable from '../SaleTable'
    import Calculator from '../Calculator'

    export default {
        name: 'InvestorDashboard',
        filters: {
            toEth(value) {
                value = new BigNumber(value);

                return web3.fromWei(value, 'ether').toString();
            }
        },
        components: {
            Converter,
            CrowdSale,
            CrowdSaleSwitch,
            SaleTable,
            Calculator,
            RefundInformation,
            RefundCalculator
        },
        data () {
            return {
                fetchTokens: false,
                errorMessage: '',
                refundValueInTokens: '0',
                loadingLedger: false,
                tokensList: [],
                crowdsaleInformationByTokenAddress: {},
                tokenInformationByTokenAddress: {},
                currentDateUnix: moment.utc().unix(),
                currentAccount: null,
                currentAccountData: {
                    balance: 0,
                    vestingBalance: 0,
                    refundForOneToken: 0,
                    totalRefundAmount: 0,
                    allowanceForTheFund: 0,
                    allowanceForTheFundInRefundAmount: 0,
                    investorInformation: {
                        totalBought: 0,
                        averageTokenPrice: 0
                    }
                }
            };
        },
        computed: {
            ...configStore.mapState({
                W12Lister: "W12Lister"
            }),
            ...crowdSaleListStore.mapState({
                selected: state => state.selected
            }),

            isLoading () {
                return !!(
                    this.loadingLedger
                    || this.fetchTokens
                );
            },
            filteredTokensList () {
                const list = this.tokensList.map(token => {
                    const tokenAddress = token.tokenAddress;
                    const nameW = token.name;
                    const symbolW = token.symbol;
                    const WTokenTotal = web3.fromWei(token.wTokensIssuedAmount, 'ether').toString();
                    const tokensForSaleAmount = web3.fromWei(token.tokensForSaleAmount, 'ether').toString();

                    const crowdsaleInformation = this.crowdsaleInformationByTokenAddress[tokenAddress];
                    const tokensInformation = this.tokenInformationByTokenAddress[tokenAddress];
                    const refundInformationData = {};

                    if (!crowdsaleInformation || !tokensInformation) return;

                    const {
                        tokenPrice,
                        startDate,
                        stages,
                        WTokenAddress,
                        crowdsaleAddress,
                        tokensOnSale,
                        fund
                    } = crowdsaleInformation;

                    const {
                        name,
                        symbol,
                        totalSupply,
                        decimals
                    } = tokensInformation;

                    let bonusVolumes = [];
                    let stageDiscount = '0';
                    let endDate = null;
                    let status = false;
                    let stageEndDate = null;
                    let timeLeft = null;

                    if (stages.length) {
                        const ranges = [
                            {
                                range: [startDate],
                                stage: null
                            }
                        ];

                        for (let stage of stages) {
                            const last = ranges[ranges.length - 1];
                            const endDateUnix = stage.endDate;

                            if (last.range.length === 1) {
                                last.range.push(endDateUnix);
                                last.stage = stage;
                            }

                            ranges.push({
                                range: [endDateUnix],
                                stage: null
                            });

                            /* Получаем данные о дате окончания (последняя стадия) */
                            const stageEndDate = stage.endDate;
                            endDate = endDate < stageEndDate ? stageEndDate : endDate;
                        }


                        ranges.pop();

                        const foundStage = ranges.find(item => {
                            return (
                                this.currentDateUnix >= item.range[0]
                                && this.currentDateUnix <= item.range[1]
                            );
                        });


                        if (foundStage) {
                            status = true;
                            bonusVolumes = foundStage.stage.bonusVolumes;
                            stageDiscount = foundStage.stage.discount;
                            stageEndDate = foundStage.stage.endDate;
                            timeLeft = stageEndDate - this.currentDateUnix;
                        }
                    }

                    if(!endDate){
                        return null;
                    }

                    return {
                        tokensForSaleAmount,
                        WTokenTotal,
                        tokensOnSale,
                        WTokenAddress,
                        tokenAddress,
                        tokenPrice,
                        decimals: decimals.toString(),
                        bonusVolumes,
                        stageDiscount,
                        stageEndDate,
                        timeLeft,
                        nameW,
                        symbolW,
                        name,
                        symbol,
                        startDate,
                        endDate,
                        status,
                        totalSupply,
                        stages,
                        crowdsaleAddress,
                        refundInformationData,
                        fund
                    };
                });

                return list.filter(Boolean);
            },
            refundInformation () {
                if (this.selected) {
                    const freezeTokensVolume = new BigNumber(this.currentAccountData.balance)
                        .minus(this.currentAccountData.vestingBalance)
                        .toString();
                    const totalRefundPercent = new BigNumber(this.selected.fund.totalRefunded).eq(0)
                        ? '0'
                        : new BigNumber(this.selected.fund.totalRefunded)
                            .div(this.selected.fund.totalFunded)
                            .mul(100)
                            .toFixed(2)
                            .toString();

                    return new RefundInformationModel({
                        tokenSymbol: this.selected.symbolW,
                        tokenDecimals: this.selected.decimals,
                        freezeTokensVolume,
                        refundTokensVolume: this.currentAccountData.balance,
                        refundAmountPerToken: web3.fromWei(this.currentAccountData.refundForOneToken, 'ether').toString(),
                        tokenPrice: web3.fromWei(this.currentAccountData.investorInformation.averageTokenPrice, 'ether').toString(),
                        fundTokensBalance: 0,
                        fundBalance: web3.fromWei(this.selected.fund.foundBalanceInWei, 'ether').toString(),
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
            isConfirmRefundDisabled () {
                const value = new BigNumber(this.currentAccountData.allowanceForTheFundInRefundAmount || 0);

                return (
                    value.eq(0)
                );
            },
            adjustedRefundValueInTokens() {
                const value = new BigNumber(this.refundValueInTokens || 0);
                const decimals = this.selected ? this.selected.decimals : 0;

                return value.mul(new BigNumber(10).pow(decimals)).toString();
            }
        },
        watch: {
            currentAccount () {
                this.updateAccountData();
            },
            selected: {
                handler () { this.updateAccountData(); },
                deep: true
            }
        },
        methods: {
            async updateCrowdSale(){
                this.currentDateUnix = moment.utc().unix();
                await this.fetchCrowdSaleInformationForEachToken();
            },
            watchCurrentAccountAddress () {
                this.unwatchCurrentAccountAddress();
                const watcher = async () => {
                    try {
                        const connectedWeb3 = (await Connector.connect()).web3;
                        const getAccounts = promisify(connectedWeb3.eth.getAccounts.bind(connectedWeb3.eth.getAccounts));

                        const currentAccount = (await getAccounts())[0];

                        if (this.currentAccount !== currentAccount) {
                            this.currentAccount = currentAccount;
                        }
                    } catch (e) {
                        console.log(e);
                    }
                };

                watcher();
                this.currentAccountWatcherTmId = setInterval(watcher, 5000);
            },
            unwatchCurrentAccountAddress () {
                clearInterval(this.currentAccountWatcherTmId);
            },
            clearErrorMessage () {
                this.errorMessage = '';
            },
            setErrorMessage (message) {
                this.errorMessage = message;
            },
            async loadLedger () {
                let ledger;

                this.loadingLedger = true;

                try {
                    ledger = await Ledger;
                } catch (e) {
                    this.setErrorMessage(e.message || UNKNOWN_ERROR_WHILE_FETCH_TOKENS_LIST);
                }

                this.loadingLedger = false;

                return ledger;
            },
            async fetchTokensInfo () {
                for (let token of this.tokensList) {
                    const {DetailedERC20Factory} = await this.loadLedger();
                    const DetailedERC20 = DetailedERC20Factory.at(token.tokenAddress);

                    this.$set(this.tokenInformationByTokenAddress, token.tokenAddress, await DetailedERC20.getDescription());
                }
            },
            async fetchTokensList () {
                this.fetchTokens = true;

                const {W12ListerFactory} = await this.loadLedger();

                if (W12ListerFactory) {
                    try {
                        const W12Lister = W12ListerFactory.at(this.W12Lister.address);
                        let list = await W12Lister.fetchAllTokensComposedInformation();

                        list = list.filter(({token}) => Boolean(token.crowdsaleAddress));

                        this.tokensList = list.map(({token}) => token);
                    } catch (e) {
                        this.setErrorMessage(e.message || UNKNOWN_ERROR_WHILE_FETCH_TOKENS_LIST);
                    }
                }

                this.fetchTokens = false;
            },
            async fetchCrowdSaleInformationForEachToken () {
                for (let token of this.tokensList) {
                    const {W12CrowdsaleFactory} = await this.loadLedger();
                    const {web3} = await Connector.connect();
                    const W12Crowdsale = W12CrowdsaleFactory.at(token.crowdsaleAddress);

                    const tokenPrice = await W12Crowdsale.methods.price();
                    const WTokenAddress = await W12Crowdsale.methods.token();
                    const W12FundAddress = await W12Crowdsale.methods.fund();
                    const startDate = (await W12Crowdsale.methods.startDate()).toNumber();
                    const stages = await W12Crowdsale.getStagesList();

                    const {W12TokenFactory, W12FundFactory} = await this.loadLedger();

                    const W12Token = W12TokenFactory.at(WTokenAddress);
                    const W12Fund = W12FundFactory.at(W12FundAddress);

                    const tokensOnSale = (await W12Token.methods.balanceOf(token.crowdsaleAddress)).toString();
                    const getBalance = promisify(web3.eth.getBalance.bind(web3.eth));
                    const foundBalanceInWei = (await getBalance(W12FundAddress)).toString();

                    this.$set(this.crowdsaleInformationByTokenAddress, token.tokenAddress, {
                        tokenPrice: web3.fromWei(tokenPrice, 'ether').toString(),
                        startDate,
                        crowdsaleAddress: token.crowdsaleAddress,
                        stages,
                        token,
                        WTokenAddress,
                        fund: {
                            W12FundAddress,
                            foundBalanceInWei,
                            totalFunded: (await W12Fund.methods.totalFunded()).toString(),
                            totalRefunded: (await W12Fund.methods.totalRefunded()).toString()
                        },
                        tokensOnSale: web3.fromWei(tokensOnSale, 'ether').toString()
                    });
                }
            },
            async updateAccountData () {
                const selectedToken = this.selected;

                if (!selectedToken) return;

                const {web3} = await Connector.connect();
                const {W12TokenFactory, W12FundFactory} = await this.loadLedger();

                try {
                    const wTokenAddress = selectedToken.WTokenAddress;
                    const fundAddress = selectedToken.fund.W12FundAddress;
                    const W12Token = W12TokenFactory.at(wTokenAddress);
                    const W12Fund = W12FundFactory.at(fundAddress);
                    const decimals = selectedToken.decimals;
                    const oneToken = new BigNumber(10).pow(decimals);

                    const balance = (await W12Token.methods.balanceOf(this.currentAccount)).toString();
                    const allowanceForTheFund = (await W12Token.methods.allowance(this.currentAccount, fundAddress)).toString();
                    const allowanceForTheFundInRefundAmount = (await W12Fund.methods.getRefundAmount(allowanceForTheFund)).toString();
                    const vestingBalance = (await W12Token.methods.vestingBalanceOf(this.currentAccount, 0)).toString();
                    const refundForOneToken = (await W12Fund.methods.getRefundAmount(oneToken)).toString();
                    const totalRefundAmount = (await W12Fund.methods.getRefundAmount(balance)).toString();
                    const investorInformation = await W12Fund.methods.getInvestmentsInfo(this.currentAccount);

                    const account = {
                        balance,
                        vestingBalance,
                        refundForOneToken,
                        totalRefundAmount,
                        allowanceForTheFund,
                        allowanceForTheFundInRefundAmount,
                        investorInformation: {
                            totalBought: investorInformation[0].toString(),
                            averageTokenPrice: investorInformation[1].toString()
                        }
                    };

                    this.currentAccountData = account;
                } catch (e) {
                    console.log(e);
                    this.setErrorMessage(e.message);
                }
            },
            async approveTheFundToSpend() {
                try {
                    const value = new BigNumber(this.adjustedRefundValueInTokens);

                    if (value.gt(0) && this.selected) {
                        const {W12TokenFactory} = await this.loadLedger();
                        const {web3} = await Connector.connect();
                        const W12Token = W12TokenFactory.at(this.selected.WTokenAddress);

                        const approveTx = await W12Token.methods.approve(
                            this.selected.fund.W12FundAddress,
                            value,
                            {from: this.currentAccount}
                        );

                        await waitTransactionReceipt(approveTx, web3, 10000);
                        await this.updateAccountData();
                    }
                } catch (e) {
                    console.log(e);
                    this.setErrorMessage(e.message);
                }
            },
            async decreaseTheFundApprovalToSpend () {
                try {
                    if (this.selected) {
                        const value = new BigNumber(this.currentAccountData.allowanceForTheFund);

                        if (value.gt(0)) {
                            const {W12TokenFactory} = await this.loadLedger();
                            const {web3} = await Connector.connect();
                            const W12Token = W12TokenFactory.at(this.selected.WTokenAddress);

                            // TODO: temporally solution. approve tokens amount to refund from buyer account
                            const approveTx = await W12Token.methods.decreaseApproval(
                                this.selected.fund.W12FundAddress,
                                value,
                                {from: this.currentAccount}
                            );

                            await waitTransactionReceipt(approveTx, web3, 10000);
                            await this.updateAccountData();
                        }
                    }
                } catch (e) {
                    console.log(e);
                    this.setErrorMessage(e.message);
                }
            },
            async refund() {
                try {
                    const value = new BigNumber(this.adjustedRefundValueInTokens);

                    if (value.gt(0) && this.selected) {
                        const value = new BigNumber(this.currentAccountData.allowanceForTheFundInRefundAmount);

                        if (value.gt(0)) {
                            const {W12FundFactory} = await this.loadLedger();
                            const { web3 } = await Connector.connect();
                            const W12Fund = W12FundFactory.at(this.selected.fund.W12FundAddress);

                            const tx = await W12Fund.methods.refund(value, { from: this.currentAccount });

                            await waitTransactionReceipt(tx, web3, 5000);

                            await this.updateAccountData();
                            await this.fetchCrowdSaleInformationForEachToken();
                        }
                    }
                } catch (e) {
                    console.log(e);
                    this.setErrorMessage(e.message);
                }
            },

            decimals (value) {
                const d = this.selected ? this.selected.decimals : 0;
                const base = new BigNumber(10);

                value = new BigNumber(value);

                return value.div(base.pow(d)).toString();
                // return value.toString();
            },
        },
        errorCaptured (error, vm, info) {
            this.errorMessage = info || error.message;
        },
        async created () {
            this.watchCurrentAccountAddress();

            await this.fetchTokensList();
            await this.fetchTokensInfo();
            await this.fetchCrowdSaleInformationForEachToken();
            await this.updateAccountData();

            // TODO: fix it, it trigger full rerender
            // setInterval(() => { this.currentDateUnix = moment.utc().unix() }, 1000);
        }
    };

</script>
