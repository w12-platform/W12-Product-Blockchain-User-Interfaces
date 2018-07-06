import Ledger from '../../lib/Blockchain/ContractsLedger.js';
import config from '../../config.js';
import {
    UNKNOWN_ERROR_WHILE_FETCH_TOKENS_LIST
} from '../../errors.js';
import Converter from '../Converter/index.js';


const moment = window.moment;
const web3 = new Web3();
const BigNumber = web3.BigNumber;

export default {
    name: 'InvestorDashboard',
    template: '#InvestorDashboardTemplate',
    components: {
        Converter
    },
    data () {
        return {
            fetchTokens: false,
            errorMessage: '',
            loadingLedger: false,
            tokensList: [],
            crawdsaleInformationByTokenAddress: {},
            preparedBuyAmountByTokenAddress: {}
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
                const {tokenAddress, name, symbol} = token;
                const crowdsaleInformation = this.crawdsaleInformationByTokenAddress[tokenAddress];

                if (!crowdsaleInformation) return;

                const {
                    tokenPrice,
                    startDate,
                    stages
                } = crowdsaleInformation;

                let bonusVolumes = [];

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
                    }

                    ranges.pop();

                    const currentDateUnix = moment.utc().unix();
                    const foundStage = ranges.find(item => {
                        return (
                            currentDateUnix >= item.range[0]
                                && currentDateUnix <= item.range[1]
                        );
                    });

                    if (foundStage) {
                        bonusVolumes = foundStage.stage.bonusVolumes;
                    }
                }

                return {
                    tokenAddress,
                    tokenPrice,
                    bonusVolumes,
                    name,
                    symbol
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
            let ledger

            this.loadingLedger = true;

            try {
                ledger = await Ledger;
            } catch (e) {
                this.setErrorMessage(e.message || UNKNOWN_ERROR_WHILE_FETCH_TOKENS_LIST);
            }

            this.loadingLedger = false;

            return ledger;
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
                const startDate = (await W12Crowdsale.methods.startDate()).toNumber();
                const stages = await W12Crowdsale.getStagesList();

                this.$set(this.crawdsaleInformationByTokenAddress, token.tokenAddress, {
                    tokenPrice: new BigNumber(1).dividedBy(tokenPrice).toString(),
                    startDate,
                    crowdsaleAddress: token.crowdsaleAddress,
                    stages
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
        await this.fetchCrawdsaleInformationForEachToken();
    }
};
