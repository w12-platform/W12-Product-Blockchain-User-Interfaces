<template>
    <div class="InvestorDashboard">
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
                <crowd-sale v-if="selected"></crowd-sale>

                <h2 v-if="selected">Скидки</h2>
                <sale-table v-if="selected"></sale-table>

                <h2 v-if="selected">Купить токены {{ selected.symbolW }}</h2>
                <calculator v-if="selected"></calculator>

                <h2 v-if="selected" class="m-3">REFUND. Вернуть: {{ selected.symbolW }}, получить: ETH</h2>
                <div v-if="refundInformation">
                    <RefundInformation v-if="refundInformation" :data="refundInformation"></RefundInformation>
                    <RefundCalculator v-if="refundInformation.currentWalletBalanceInRefundAmount"
                                      v-model="refundValue"
                                      :fundAddress="selected.fund.W12FundAddress"
                                      :accountAddress="currentAccount"
                                      :tokenSymbol="selected.symbolW"></RefundCalculator>
                    <p v-if="refundInformation.currentWalletBalanceInRefundAmount" class="alert alert-warning m-3">Вы должны будете подтвердить 2-е транзакции: подтвердить, что вы
                        согласны вывести токены со своего аккаунта и сам вывод</p>
                    <button v-if="refundInformation.currentWalletBalanceInRefundAmount" class="btn m-3" @click="refund" :disabled="!refundValue || refundValue == 0">Вернуть
                        средства
                    </button>
                </div>
            </div>
        </section>
    </div>
</template>

<script>
    import './default.scss';
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
        template: '#InvestorDashboardTemplate',
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
                refundValue: '0',
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
                selected: "selected"
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
                    const WTokenTotal = web3.fromWei(token.wTokensIssuedAmount, 'ether');
                    const tokensForSaleAmount = web3.fromWei(token.tokensForSaleAmount, 'ether');

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
                        totalSupply
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
                            const endDateUnix = moment.utc(stage.endDate, 'YYYY-MM-DD').unix();

                            if (last.range.length === 1) {
                                last.range.push(endDateUnix);
                                last.stage = stage;
                            }

                            ranges.push({
                                range: [endDateUnix],
                                stage: null
                            });

                            /* Получаем данные о дате окончания (последняя стадия) */
                            const stageEndDate = moment.utc(stage.endDate, 'YYYY-MM-DD').unix();
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
                            stageEndDate = moment.utc(foundStage.stage.endDate, 'YYYY-MM-DD').unix();
                            timeLeft = stageEndDate - this.currentDateUnix;
                        }
                    }

                    return {
                        tokensForSaleAmount,
                        WTokenTotal,
                        tokensOnSale,
                        WTokenAddress,
                        tokenAddress,
                        tokenPrice,
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
                        tokenPrice: web3.fromWei(tokenPrice, 'ether'),
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
                        tokensOnSale: web3.fromWei(tokensOnSale, 'ether')
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

                    const balance = (await W12Token.methods.balanceOf(this.currentAccount)).toString();
                    const vestingBalance = (await W12Token.methods.vestingBalanceOf(this.currentAccount, 0)).toString();
                    const refundForOneToken = (await W12Fund.methods.getRefundAmount(1)).toString();
                    const totalRefundAmount = (await W12Fund.methods.getRefundAmount(balance)).toString();
                    const investorInformation = await W12Fund.methods.getInvestmentsInfo(this.currentAccount);

                    const account = {
                        balance,
                        vestingBalance,
                        refundForOneToken,
                        totalRefundAmount,
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
            async refund() {
                try {
                    if (this.refundValue && this.selected) {
                        const {W12FundFactory, W12TokenFactory} = await this.loadLedger();
                        const { web3 } = await Connector.connect();
                        const W12Fund = W12FundFactory.at(this.selected.fund.W12FundAddress);
                        const W12Token = W12TokenFactory.at(this.selected.WTokenAddress);

                        // TODO: temporally solution. approve tokens amount to refund from buyer account
                        const approveTx = await W12Token.methods.approve(
                            this.selected.fund.W12FundAddress,
                            this.refundValue,
                            { from: this.currentAccount }
                        );

                        await waitTransactionReceipt(approveTx, web3, 10000);

                        const tx = await W12Fund.methods.refund(this.refundValue, { from: this.currentAccount });

                        await waitTransactionReceipt(tx, web3, 5000);

                        await this.updateAccountData();
                        await this.fetchCrowdSaleInformationForEachToken();
                    }
                } catch (e) {
                    console.log(e);
                    this.setErrorMessage(e.message);
                }
            }
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
