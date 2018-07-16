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
                <crowdsdal-list :list="filteredTokensList"></crowdsdal-list>
                <div
                        class="card p-5"
                        v-for="token in filteredTokensList"
                        :key="token.tokenAddress"
                >
                    <p>Token address: {{ token.tokenAddress }}</p>
                    <p>Token name: {{ token.name }}</p>
                    <p>Token symbol: {{ token.symbol }}</p>
                    <converter
                            :tokenPrice="token.tokenPrice"
                            :bonusConditions="token.bonusVolumes"
                            :fixedDiscountPercent="token.stageDiscount"
                            @change="handleConverterChange(token.tokenAddress, $event)"
                    ></converter>
                    <p>Total buy: {{ preparedBuyAmountByTokenAddress[token.tokenAddress] }} ETH</p>
                    <button class="btn btn-primary btn-sm" @click="handleBuyClick(token.tokenAddress)">
                        Buy
                    </button>
                </div>
            </div>
        </section>
    </div>
</template>

<script>
    import Ledger from '../../lib/Blockchain/ContractsLedger.js';
    import config from '../../config.js';
    import {
        UNKNOWN_ERROR_WHILE_FETCH_TOKENS_LIST
    } from '../../errors.js';
    import Converter from '../Converter';
    import CrowdsdalList from '../CrowdsdalList';

    const moment = window.moment;
    const web3 = new Web3();
    const BigNumber = web3.BigNumber;

    export default {
        name: 'InvestorDashboard',
        template: '#InvestorDashboardTemplate',
        components: {
            Converter,
            CrowdsdalList
        },
        data () {
            return {
                fetchTokens: false,
                errorMessage: '',
                loadingLedger: false,
                tokensList: [],
                crawdsaleInformationByTokenAddress: {},
                tokenInformationByTokenAddress: {},
                preparedBuyAmountByTokenAddress: {},
                currentDateUnix: moment.utc().unix()
            };
        },
        watch: {
            filteredTokensList: {
                handler: 'handleFilteredTokensListChange',
                immediate: true
            }
        },
        computed: {
            isLoading () {
                return !!(
                    this.loadingLedger
                    || this.fetchTokens
                );
            },
            filteredTokensList() {
                const list = this.tokensList.map(token => {
                    const tokenAddress = token.tokenAddress;
                    const nameW = token.name;
                    const symbolW = token.symbol;
                    //тут не точто тотал и OnSale
                    const WTokenTotal = token.wTokensIssuedAmount;
                    const WTokenOnSale = token.tokensForSaleAmount;

                    const crowdsaleInformation = this.crawdsaleInformationByTokenAddress[tokenAddress];
                    const tokensInformation = this.tokenInformationByTokenAddress[tokenAddress];

                    if (!crowdsaleInformation || !tokensInformation) return;

                    const {
                        tokenPrice,
                        startDate,
                        stages,
                        WTokenAddress
                    } = crowdsaleInformation;

                    const {
                        name,
                        symbol,
                        total,
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
                            },
                        ];

                        for(let stage of stages) {
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

                    //console.log(timeLeft);

                    return {
                        WTokenTotal,
                        WTokenOnSale,

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
                        total,
                        stages
                    };
                });

                return list.filter(Boolean);
            }
        },
        methods: {
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
            async fetchTokensInfo(){
                for (let token of this.tokensList) {
                    const {W12TokenFactory, W12TokenLedgerFactory} = await this.loadLedger();
                    const W12Token = W12TokenFactory.at(token.tokenAddress);

                    const name = (await W12Token.methods.name());
                    const symbol = (await W12Token.methods.symbol());
                    const total = (await W12Token.methods.totalSupply()).toNumber();

                    this.$set(this.tokenInformationByTokenAddress, token.tokenAddress, {
                        total,
                        symbol,
                        name,
                    });
                }
            },
            async fetchTokensList () {
                this.fetchTokens = true;

                const {W12ListerFactory} = await this.loadLedger();

                if (W12ListerFactory) {
                    try {


                        const W12Lister = W12ListerFactory.at(config.contracts.W12Lister.address);
                        let list = await W12Lister.fetchAllTokensComposedInformation();

                        list = list.filter(({ token }) => Boolean(token.crowdsaleAddress));

                        this.tokensList = list.map(({ token }) => token);
                    } catch (e) {
                        this.setErrorMessage(e.message || UNKNOWN_ERROR_WHILE_FETCH_TOKENS_LIST);
                    }
                }

                this.fetchTokens = false;
            },
            async fetchCrawdsaleInformationForEachToken() {
                for (let token of this.tokensList) {
                    const {W12CrowdsaleFactory} = await this.loadLedger();

                    const W12Crowdsale = W12CrowdsaleFactory.at(token.crowdsaleAddress);

                    const tokenPrice = (await W12Crowdsale.methods.price());
                    const WTokenAddress = (await  W12Crowdsale.methods.token());
                    const startDate = (await W12Crowdsale.methods.startDate()).toNumber();
                    const stages = await W12Crowdsale.getStagesList();

                    this.$set(this.crawdsaleInformationByTokenAddress, token.tokenAddress, {
                        tokenPrice: new BigNumber(1).dividedBy(tokenPrice).toString(),
                        startDate,
                        crowdsaleAddress: token.crowdsaleAddress,
                        stages,
                        token,
                        WTokenAddress
                    });
                }
            },

            handleFilteredTokensListChange(value) {
                this.preparedBuyAmountByTokenAddress = {};

                for (let token of value) {
                    this.$set(this.preparedBuyAmountByTokenAddress, token.tokenAddress, '0');
                }
            },
            handleConverterChange(tokenAddress, { tokens, ETHs }) {
                this.preparedBuyAmountByTokenAddress[tokenAddress] = ETHs;
            },
            async buy(tokenAddress, amount) {
                const crowdsaleInformation = this.crawdsaleInformationByTokenAddress[tokenAddress];

                const {W12CrowdsaleFactory} = await this.loadLedger();

                const W12Crowdsale = W12CrowdsaleFactory.at(crowdsaleInformation.crowdsaleAddress);

                await W12Crowdsale.methods.buyTokens({ value: web3.toWei(amount, 'ether') });
            },
            handleBuyClick(tokenAddress) {
                const amount = new BigNumber(this.preparedBuyAmountByTokenAddress[tokenAddress]);

                if (amount.greaterThan(0)) {
                    this.buy(tokenAddress, amount);
                }
            }
        },
        errorCaptured(error, vm, info) {
            this.errorMessage = info || error.message;
        },
        async created () {
            await this.fetchTokensList();
            await this.fetchTokensInfo();
            await this.fetchCrawdsaleInformationForEachToken();
        }
    };

</script>