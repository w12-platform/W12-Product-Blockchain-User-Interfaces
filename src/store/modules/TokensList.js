import {
    getSaleTokenAmountWithoutCommission,
    getTokenPriceWithDiscount, getSoldAmount,
    getSoldPercent
} from '@/lib/selectors/crowdsale';
import { getCurrentStage, getEndDate, getStartDate } from '@/lib/selectors/crowdsaleStages';
import { convertionByDecimals, reverseConversionByDecimals } from '@/lib/selectors/units';
import Connector from "lib/Blockchain/DefaultConnector";
import semver from 'semver';
import { promisify, isZeroAddress, fromWeiDecimalsString, decodeUSD } from "src/lib/utils";
import {map, reduce} from 'p-iteration';
import {web3, BigNumber} from 'src/lib/utils';
import moment from 'moment';
import zipObject from 'lodash/zipObject';

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

            if(state.currentToken) {
                const index = payload.list.findIndex(
                    t => t.index === state.currentToken.index && t.version === state.currentToken.version);

                state.currentToken = index === -1 ? null : payload.list[index];
            }
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
        async fetch({commit, dispatch}) {
            commit(UPDATE_META, {loading: true});

            const {web3} = await Connector.connect();

            try {
                const listers = this.state.Config.W12ListerList;
                const fetchToken = async (list, Lister) => {
                    const {
                        DetailedERC20Factory,
                        W12CrowdsaleFactory,
                        W12TokenFactory,
                        W12FundFactory,
                        W12ListerFactory
                    } = await this.dispatch('Ledger/fetch', Lister.version);
                    const W12Lister = W12ListerFactory.at(Lister.address);

                    let tokens = (await W12Lister.fetchAllTokensComposedInformation())
                        .filter(t => !isZeroAddress(t.crowdsaleAddress));

                    tokens.forEach((token, index) => {
                        token.index = index + 1;
                    });

                    tokens = await map(tokens, async (token) => {
                        const DetailedERC20 = DetailedERC20Factory.at(token.tokenAddress);
                        const W12Crowdsale = W12CrowdsaleFactory.at(token.crowdsaleAddress);
                        const WTokenAddress = token.wTokenAddress;
                        const W12FundAddress = (await W12Crowdsale.methods.fund());
                        const W12Token = W12TokenFactory.at(WTokenAddress);
                        const W12Fund = W12FundFactory.at(W12FundAddress);

                        const getBalance = promisify(web3.eth.getBalance.bind(web3.eth));

                        const WTokenDecimals = await W12Token.methods.decimals();
                        const WTokenTotal = fromWeiDecimalsString(token.wTokensIssuedAmount, token.decimals);
                        const tokensOnSale = fromWeiDecimalsString((await W12Token.methods.balanceOf(token.crowdsaleAddress)).toString(), token.decimals);
                        const tokensForSaleAmount = fromWeiDecimalsString(token.tokensForSaleAmount, token.decimals);
                        const tokenPrice = semver.satisfies(Lister.version, '>=0.26.0')
                            ? decodeUSD(await W12Crowdsale.methods.price()).toString()
                            : web3.fromWei(await W12Crowdsale.methods.price(), 'ether').toString()
                        const stages = (await W12Crowdsale.getStagesList());
                        const milestones = (await W12Crowdsale.getMilestones());
                        const startDate = getStartDate(stages);
                        const endDate = getEndDate(stages);
                        const currentDateUnix = moment.utc().unix();
                        const currentStage = getCurrentStage(stages);
                        const timeLeft = currentStage ? currentStage.endDate - currentDateUnix : 0;
                        const status = !!currentStage;
                        const stageDiscount = currentStage ? currentStage.discount : 0;

                        let currentMilestoneIndex = (await W12Crowdsale.methods.getCurrentMilestoneIndex());

                        currentMilestoneIndex = currentMilestoneIndex[1]
                            ? currentMilestoneIndex[0].toNumber()
                            : null;

                        let totalFundedPerAsset,
                            totalReleasedPerAsset,
                            totalTokenBought,
                            totalTokenRefunded,
                            paymentMethods;

                        if (semver.satisfies(Lister.version, '>=0.26.0')) {
                            const symbols = await W12Fund.getTotalFundedAssetsSymbols();
                            const funded = await map(symbols, async (s) => {
                                const amount = await W12Fund.getTotalFundedAmount(s);
                                const decimals = await dispatch('Rates/resolveDecimals', s, {root: true});

                                return reverseConversionByDecimals(amount, decimals);

                            });
                            const released = await map(symbols, async (s) => {
                                const amount = await W12Fund.getTotalFundedReleased(s);
                                const decimals = await dispatch('Rates/resolveDecimals', s, {root: true});

                                return reverseConversionByDecimals(amount, decimals);
                            });

                            totalFundedPerAsset = zipObject(symbols, funded);
                            totalReleasedPerAsset = zipObject(symbols, released);
                            paymentMethods = await W12Crowdsale.getPaymentMethodsList();
                            totalTokenBought = reverseConversionByDecimals(
                                await W12Fund.methods.totalTokenBought(),
                                WTokenDecimals
                            )
                                .toString();
                            totalTokenRefunded = reverseConversionByDecimals(
                                await W12Fund.methods.totalTokenRefunded(),
                                WTokenDecimals
                            )
                                .toString();
                        }

                        let totalFunded, totalRefunded, foundBalanceInWei;

                        if (semver.satisfies(Lister.version, '<0.26.0')) {
                            foundBalanceInWei = (await getBalance(W12FundAddress)).toString();
                            totalFunded = (await W12Fund.methods.totalFunded()).toString();
                            totalRefunded = (await W12Fund.methods.totalRefunded()).toString();
                        }

                        token.tokenInformation = (await DetailedERC20.getDescription());
                        token.crowdSaleInformation = {
                            tokenPrice,
                            paymentMethods,
                            startDate,
                            crowdsaleAddress: token.crowdsaleAddress,
                            stages,
                            status,
                            bonusVolumes: currentStage ? currentStage.bonusVolumes : [],
                            stageDiscount,
                            stageEndDate: currentStage ? currentStage.endDate : null,
                            vestingDate: currentStage ? currentStage.vestingDate : null,
                            WTokenAddress,
                            WTokenDecimals,
                            endDate,
                            timeLeft,
                            WTokenTotal,
                            currentMilestoneIndex,
                            milestones,
                            tokensForSaleAmount,
                            tokensOnSale: getSaleTokenAmountWithoutCommission(tokensOnSale, token.WTokenSaleFeePercent).toString(),
                            fund: {
                                W12FundAddress,
                                foundBalanceInWei,
                                totalFunded,
                                totalRefunded,
                                totalFundedPerAsset,
                                totalReleasedPerAsset,
                                totalTokenBought,
                                totalTokenRefunded
                            },
                            saleAmount: getSoldAmount(WTokenTotal, tokensOnSale).toString(),
                            salePercent: getSoldPercent(WTokenTotal, tokensOnSale).toString(),
                            price: getTokenPriceWithDiscount(tokenPrice, stageDiscount).toString()
                        };

                        if (endDate) {
                            if (!this.state.TokensList.currentToken) {
                                commit(TOKEN_SELECTED, {currentToken: token});
                            }
                            return token;
                        }
                    });

                    list = list.concat(tokens);

                    return list;
                };

                const list = await reduce(listers, fetchToken, []);

                commit(UPDATE, {list});
            } catch (e) {
                console.error(e);
                commit(UPDATE_META, {loading: false, loadingError: e.message || ERROR_FETCH_TOKENS_LIST});
            }
            commit(UPDATE_META, {loading: false});
        },
        async fetchTokenByCurrentToken({commit}, CurrentToken) {
            commit(UPDATE_META, {loading: true});
            try {
                const {DetailedERC20Factory, W12CrowdsaleFactory, W12TokenFactory, W12FundFactory, W12ListerFactory} = await this.dispatch('Ledger/fetch', CurrentToken.version);
                const W12Lister = W12ListerFactory.at(CurrentToken.listerAddress);
                const Token = await W12Lister.fetchComposedTokenInformationByTokenAddress(CurrentToken);

                let list = [Token];
                let index = 1;
                list.map((item)=>{
                    item.index = index++;
                });
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

                    const WTokenTotal = fromWeiDecimalsString(token.wTokensIssuedAmount, token.decimals);
                    const tokensOnSale = fromWeiDecimalsString((await W12Token.methods.balanceOf(token.crowdsaleAddress)).toString(), token.decimals);
                    const tokensForSaleAmount = fromWeiDecimalsString(token.tokensForSaleAmount, token.decimals);
                    const tokenPrice = (await W12Crowdsale.methods.price()).toString();
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
                        tokensOnSale: new BigNumber(tokensOnSale)
                            .mul((new BigNumber(tokensOnSale)))
                            .div(new BigNumber(tokensOnSale)
                                .mul(1 + token.WTokenSaleFeePercent / (100 ** 2)))
                            .toString(),
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
        // TODO: rename action name it should mean update only one token not whole list
        // FIXME: should fetch and update only one token. we must provide token index|address|lister version
        //        and then action fetch information for that token and replace in the store
        async update({commit, dispatch}) {
            commit(UPDATE_META, {updated: true});

            try {
                await dispatch('fetch');
            } catch (e) {
                console.error(e);
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
