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
    import { promisify } from '../../lib/utils.js';
    import CrowdSaleSwitch from '../CrowdSaleSwitch';
    import CrowdSale from '../CrowdSale';
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
            Calculator
        },
        data () {
            return {
                fetchTokens: false,
                errorMessage: '',
                loadingLedger: false,
                tokensList: [],
                crawdsaleInformationByTokenAddress: {},
                tokenInformationByTokenAddress: {},
                currentDateUnix: moment.utc().unix(),
                currentAccount: null,
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
            filteredTokensList() {
                const list = this.tokensList.map(token => {
                    const tokenAddress = token.tokenAddress;
                    const nameW = token.name;
                    const symbolW = token.symbol;
                    const WTokenTotal = token.wTokensIssuedAmount;

                    const crowdsaleInformation = this.crawdsaleInformationByTokenAddress[tokenAddress];
                    const tokensInformation = this.tokenInformationByTokenAddress[tokenAddress];

                    if (!crowdsaleInformation || !tokensInformation) return;

                    const {
                        tokenPrice,
                        startDate,
                        stages,
                        WTokenAddress,
                        crowdsaleAddress,
                        tokensOnSale
                    } = crowdsaleInformation;

                    const {
                        name,
                        symbol,
                        totalSupply,
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

                    return {
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
                        crowdsaleAddress
                    };
                });

                return list.filter(Boolean);
            }
        },
        methods: {
            watchCurrentAccountAddress() {
                this.unwatchCurrentAccountAddress();
                const watcher = async () => {
                    try {
                        const connectedWeb3 = (await Connector.connect()).web3;
                        const getAccounts = promisify(connectedWeb3.eth.getAccounts.bind(connectedWeb3.eth.getAccounts));

                        const currentAccount = (await getAccounts())[0];

                        this.currentAccount = currentAccount;
                    } catch (e) {
                        console.log(e);
                    }
                };

                watcher();
                this.currentAccountWatcherTmId = setInterval(watcher, 5000);
            },
            unwatchCurrentAccountAddress() {
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
            async fetchTokensInfo(){
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

                        list = list.filter(({ token }) => Boolean(token.crowdsaleAddress));

                        this.tokensList = list.map(({ token }) => token);
                    } catch (e) {
                        this.setErrorMessage(e.message || UNKNOWN_ERROR_WHILE_FETCH_TOKENS_LIST);
                    }
                }

                this.fetchTokens = false;
            },
            async fetchCrawdSaleInformationForEachToken() {
                for (let token of this.tokensList) {
                    const {W12CrowdsaleFactory} = await this.loadLedger();

                    const W12Crowdsale = W12CrowdsaleFactory.at(token.crowdsaleAddress);

                    const tokenPrice = (await W12Crowdsale.methods.price());
                    const WTokenAddress = (await  W12Crowdsale.methods.token());
                    const startDate = (await W12Crowdsale.methods.startDate()).toNumber();
                    const stages = await W12Crowdsale.getStagesList();

                    const {DetailedERC20Factory} = await this.loadLedger();
                    const DetailedERC20 = DetailedERC20Factory.at(WTokenAddress);

                    const tokensOnSale = (await DetailedERC20.methods.balanceOf(token.crowdsaleAddress)).toString();

                    this.$set(this.crawdsaleInformationByTokenAddress, token.tokenAddress, {
                        tokenPrice: new BigNumber(tokenPrice).toString(),
                        startDate,
                        crowdsaleAddress: token.crowdsaleAddress,
                        stages,
                        token,
                        WTokenAddress,
                        tokensOnSale
                    });
                }
            },
        },
        errorCaptured(error, vm, info) {
            this.errorMessage = info || error.message;
        },
        async created () {
            this.watchCurrentAccountAddress();

            await this.fetchTokensList();
            await this.fetchTokensInfo();
            await this.fetchCrawdSaleInformationForEachToken();

            setInterval(()=>{ this.currentDateUnix = moment.utc().unix() }, 1000);
        }
    };

</script>