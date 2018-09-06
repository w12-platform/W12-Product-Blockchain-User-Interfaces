import Connector from "lib/Blockchain/DefaultConnector";
import {promisify, isZeroAddress} from "lib/utils";
import {map} from 'p-iteration';

const moment = window.moment;
const web3 = new Web3();
const BigNumber = web3.BigNumber;

export const ERROR_FETCH_TOKENS_LIST = 'An unknown error while trying get tokens';

export const UPDATE_TIMER_ID = 'UPDATE_TIMER_ID';
export const TOKEN_SELECTED = "TOKEN_SELECTED";
export const PROJECT_SELECTED = "PROJECT_SELECTED";
export const UPDATE_META = "UPDATE_META";
export const UPDATE = "UPDATE";
export const UPDATE_PROJECTS = "UPDATE_PROJECTS";
export const RESET = "RESET";


export default {
    namespaced: true,
    state: {
        meta: {
            loading: true,
            loadingError: false,
            updated: false,
        },
        list: [],
        currentToken: false,
        timerId: false,
    },
    modules: {},
    mutations: {
        [UPDATE_TIMER_ID](state, payload) {
            clearInterval(this.state.TokensList.timerId);
            const timerId = payload ? payload.timerId || false : false;
            Object.assign(state, {timerId});
        },
        [TOKEN_SELECTED](state, payload) {
            Object.assign(state, payload);
        },
        [UPDATE_META](state, payload) {
            Object.assign(state.meta, payload);
        },
        [UPDATE](state, payload) {
            const list = payload.list || false;
            Object.assign(state, {list});
        },
        [UPDATE_PROJECTS](state, payload) {
            const projects = payload.projects || false;
            Object.assign(state, {projects});
        },
        [PROJECT_SELECTED](state, payload) {
            Object.assign(state, payload);
        },
        [RESET](state) {
            state.list = false;
            state.currentToken = false;
        },
    },
    actions: {
        async fetch({commit}) {
            commit(UPDATE_META, {loading: true});
            try {
                const {W12ListerFactory, DetailedERC20Factory, W12CrowdsaleFactory, W12TokenFactory, W12FundFactory} = await this.dispatch('Ledger/fetch');
                const W12Lister = W12ListerFactory.at(this.state.Config.W12Lister.address);
                let list = (await W12Lister.fetchAllTokensComposedInformation());
                list = list.filter((token) => !isZeroAddress(token.crowdsaleAddress));
                list = await map(list, async token => {
                    const {web3} = await Connector.connect();
                    const DetailedERC20 = DetailedERC20Factory.at(token.tokenAddress);
                    const W12Crowdsale = W12CrowdsaleFactory.at(token.crowdsaleAddress);
                    const WTokenAddress = token.wTokenAddress;
                    const W12FundAddress = (await W12Crowdsale.methods.fund());
                    const W12Token = W12TokenFactory.at(WTokenAddress);
                    const W12Fund = W12FundFactory.at(W12FundAddress);

                    const getBalance = promisify(web3.eth.getBalance.bind(web3.eth));
                    const foundBalanceInWei = (await getBalance(W12FundAddress)).toString();

                    const WTokenTotal = web3.fromWei(token.wTokensIssuedAmount, 'ether').toString();
                    const tokensOnSale = web3.fromWei((await W12Token.methods.balanceOf(token.crowdsaleAddress)).toString(), 'ether').toString();
                    const tokensForSaleAmount = web3.fromWei(token.tokensForSaleAmount, 'ether').toString();
                    const tokenPrice = web3.fromWei(await W12Crowdsale.methods.price(), 'ether').toString();
                    const stages = (await W12Crowdsale.getStagesList());
                    const startDate = stages.length ? stages[0].startDate : null;

                    let endDate = false;
                    let stageEndDate = false;
                    let timeLeft = false;
                    let status = false;
                    let stageDiscount = 0;
                    let bonusVolumes = [];

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

                            const stageEndDate = stage.endDate;
                            endDate = endDate < stageEndDate ? stageEndDate : endDate;
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
                            status = true;
                            bonusVolumes = foundStage.stage.bonusVolumes;
                            stageDiscount = foundStage.stage.discount;
                            stageEndDate = foundStage.stage.endDate;
                            timeLeft = stageEndDate - currentDateUnix;
                        }
                    }

                    token.tokenInformation = (await DetailedERC20.getDescription());
                    token.crowdSaleInformation = {
                        tokenPrice,
                        startDate: startDate,
                        crowdsaleAddress: token.crowdsaleAddress,
                        stages,
                        status,
                        bonusVolumes,
                        stageDiscount,
                        stageEndDate,
                        WTokenAddress,
                        endDate,
                        timeLeft,
                        WTokenTotal,
                        tokensForSaleAmount,
                        tokensOnSale,
                        fund: {
                            W12FundAddress,
                            foundBalanceInWei,
                            totalFunded: (await W12Fund.methods.totalFunded()).toString(),
                            totalRefunded: (await W12Fund.methods.totalRefunded()).toString()
                        },
                        saleAmount: new BigNumber(WTokenTotal).minus(tokensOnSale).toString(),
                        salePercent: new BigNumber(WTokenTotal).minus(tokensOnSale).div(WTokenTotal).mul(100).toString(),
                        price: new BigNumber(tokenPrice).mul(100 - stageDiscount).div(100).toString()
                    };
                    if (endDate) {
                        if (!this.state.TokensList.currentToken) {
                            commit(TOKEN_SELECTED, {currentToken: token});
                        }
                        return token;
                    }
                });
                commit(UPDATE, {list});
            } catch (e) {
                commit(UPDATE_META, {loading: false, loadingError: e.message || ERROR_FETCH_TOKENS_LIST});
            }
            commit(UPDATE_META, {loading: false});
        },
        async update({commit}, {Index}) {
            commit(UPDATE_META, {updated: true});
            try {
                const {W12CrowdsaleFactory, W12TokenFactory} = await this.dispatch('Ledger/fetch');
                let list = this.state.TokensList.list;
                list = await map(list, async token => {
                    if (token && token.index === Index) {
                        const {web3} = await Connector.connect();
                        const W12Crowdsale = W12CrowdsaleFactory.at(token.crowdsaleAddress);
                        const WTokenAddress = (await W12Crowdsale.methods.token());
                        const W12Token = W12TokenFactory.at(WTokenAddress);

                        const WTokenTotal = web3.fromWei(token.wTokensIssuedAmount, 'ether').toString();
                        const tokensOnSale = web3.fromWei((await W12Token.methods.balanceOf(token.crowdsaleAddress)).toString(), 'ether').toString();
                        const tokenPrice = web3.fromWei(await W12Crowdsale.methods.price(), 'ether').toString();
                        const stages = (await W12Crowdsale.getStagesList());
                        const startDate = stages.length ? stages[0].startDate : null;

                        let endDate = false;
                        let stageEndDate = false;
                        let status = false;
                        let stageDiscount = 0;

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

                                const stageEndDate = stage.endDate;
                                endDate = endDate < stageEndDate ? stageEndDate : endDate;
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
                                status = true;
                                stageDiscount = foundStage.stage.discount;
                                stageEndDate = foundStage.stage.endDate;
                            }
                        }

                        token.crowdSaleInformation.status = status;
                        token.crowdSaleInformation.saleAmount = new BigNumber(WTokenTotal).minus(tokensOnSale).toString();
                        token.crowdSaleInformation.salePercent = new BigNumber(WTokenTotal).minus(tokensOnSale).div(WTokenTotal).mul(100).toString();
                        token.crowdSaleInformation.tokensOnSale = tokensOnSale;
                        token.crowdSaleInformation.stageDiscount = stageDiscount;
                        token.crowdSaleInformation.stageEndDate = stageEndDate;
                        token.crowdSaleInformation.price = new BigNumber(tokenPrice).mul(100 - stageDiscount).div(100).toString();
                    }
                    return token;
                });
                commit(UPDATE, {list});
            } catch (e) {
                commit(UPDATE_META, {
                    loading: false,
                    updated: false,
                    loadingError: e.message || ERROR_FETCH_TOKENS_LIST
                });
            }
            commit(UPDATE_META, {updated: false});
        },
        async reset({commit}) {
            commit(RESET);
        },
    }
};