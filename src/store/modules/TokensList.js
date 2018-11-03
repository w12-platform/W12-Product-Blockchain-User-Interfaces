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
        async fetchTokenMinimal({}, token){
            const {
                W12CrowdsaleFactory
            } = await this.dispatch('Ledger/fetch', token.version);
            const W12Crowdsale = W12CrowdsaleFactory.at(token.crowdsaleAddress);
            const stages = (await W12Crowdsale.getStagesList());
            const endDate = getEndDate(stages);
            token.crowdSaleInformation = {
                stages,
                endDate,
            };
            return endDate ? token : null;
        },
        async fetchTokenFull({}, token){
            const {
                DetailedERC20Factory,
                W12CrowdsaleFactory,
                W12TokenFactory,
                W12FundFactory,
            } = await this.dispatch('Ledger/fetch', token.version);

            const {web3} = await Connector.connect();

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
            const tokenPrice = semver.satisfies(token.version, '>=0.26.0')
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

            if (semver.satisfies(token.version, '>=0.26.0')) {
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

            if (semver.satisfies(token.version, '<0.26.0')) {
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

            return token;
        },

        async fetch({commit, state}) {
            commit(UPDATE_META, {loading: true});
            try {
                const fetchToken = async (list, Lister) => {
                    const {W12ListerFactory} = await this.dispatch('Ledger/fetch', Lister.version);
                    const W12Lister = W12ListerFactory.at(Lister.address);
                    let tokens = (await W12Lister.fetchAllTokensComposedInformation()).filter(t => !isZeroAddress(t.crowdsaleAddress));
                    tokens = await map(tokens, async token => await this.dispatch('TokensList/fetchTokenMinimal', token));
                    return list.concat(tokens.filter(token => token && !isZeroAddress(token.tokenAddress)));
                };

                const list = await reduce(this.state.Config.W12ListerList, fetchToken, []);

                if (!state.currentToken && list.length) {
                    commit(TOKEN_SELECTED, {currentToken: await this.dispatch('TokensList/fetchTokenFull', list[0])});
                }

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
                const {W12ListerFactory} = await this.dispatch('Ledger/fetch', CurrentToken.version);
                const W12Lister = W12ListerFactory.at(CurrentToken.listerAddress);
                const token = await W12Lister.fetchComposedTokenInformationByTokenAddress(CurrentToken);
                commit(TOKEN_SELECTED, {currentToken: await this.dispatch('TokensList/fetchTokenFull', token)});
                commit(UPDATE, {list: [token]});
            } catch (e) {
                console.error(e);
                commit(UPDATE_META, {loading: false, loadingError: e.message || ERROR_FETCH_TOKENS_LIST});
            }
            commit(UPDATE_META, {loading: false});
        },
        async update({commit, dispatch}, token) {
            commit(UPDATE_META, {updated: true});
            try {
                commit(TOKEN_SELECTED, {currentToken: await this.dispatch('TokensList/fetchTokenFull', token)});
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
