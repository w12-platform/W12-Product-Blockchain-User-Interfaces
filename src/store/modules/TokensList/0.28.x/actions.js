import { StoredCrowdsale } from '@/lib/models/StoredCrowdsale';
import { StoredToken } from '@/lib/models/StoredToken';
import {
    getSaleTokenAmountWithoutCommission,
    getTokenPriceWithDiscount, getSoldAmount,
    getSoldPercent
} from '@/lib/selectors/crowdsale';
import { getCurrentStage, getEndDate, getStartDate } from '@/lib/selectors/crowdsaleStages';
import { reverseConversionByDecimals } from '@/lib/selectors/units';
import { errorMessageSubstitution, instanceOf } from '@/lib/utils';
import { TOKEN_SELECTED, UPDATE, UPDATE_META } from '@/store/modules/TokensList/mutation';
import Connector from "lib/Blockchain/DefaultConnector";
import semver from 'semver';
import { promisify, fromWeiDecimalsString, decodeUSD, isZeroAddress } from "src/lib/utils";
import { map, reduce } from 'p-iteration';
import moment from 'moment';
import zipObject from 'lodash/zipObject';


const ERROR_FETCH_TOKENS_LIST = 'An unknown error while trying get tokens';

export async function fetchTokenFull({dispatch}, token) {
    // TODO: refactoring
    // instanceOf(token, StoredToken);
    const {
        ERC20DetailedFactory,
        W12CrowdsaleFactory,
        W12TokenFactory,
        W12FundFactory,
    } = await dispatch('Ledger/fetch', token.version, {root: true});

    const ERC20Detailed = ERC20DetailedFactory.at(token.tokenAddress);
    const W12Crowdsale = W12CrowdsaleFactory.at(token.crowdsaleAddress);
    const WTokenAddress = token.wTokenAddress;
    const W12FundAddress = (await W12Crowdsale.methods.fund());
    const W12Token = W12TokenFactory.at(WTokenAddress);
    const W12Fund = W12FundFactory.at(W12FundAddress);
    const WTokenDecimals = await W12Token.methods.decimals();
    const WTokenTotal = fromWeiDecimalsString(token.wTokensIssuedAmount, token.decimals);
    const tokensOnSale = fromWeiDecimalsString((await W12Token.methods.balanceOf(token.crowdsaleAddress)).toString(), token.decimals);
    const tokensForSaleAmount = fromWeiDecimalsString(token.tokensForSaleAmount, token.decimals);
    const tokenPrice = decodeUSD(await W12Crowdsale.methods.price()).toString();
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

    const symbols = await W12Fund.getTotalFundedAssetsSymbols();
    const funded = await map(symbols, async (s) => {
        const amount = await W12Fund.getTotalFundedAmount(s);
        const decimals = await dispatch('Rates/resolveDecimals', {symbol: s, version: token.version}, {root: true});

        return reverseConversionByDecimals(amount, decimals);

    });
    const released = await map(symbols, async (s) => {
        const amount = await W12Fund.getTotalFundedReleased(s);
        const decimals = await dispatch('Rates/resolveDecimals', {symbol: s, version: token.version}, {root: true});

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

    token.tokenInformation = (await ERC20Detailed.getDescription());
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
}

export async function fetch({commit, state, dispatch, rootState}) {
    commit(UPDATE_META, {loading: true});
    try {
        const fetchToken = async (list, Lister) => {
            const {W12ListerFactory} = await dispatch('Ledger/fetch', Lister.version, {root: true});
            const W12Lister = W12ListerFactory.at(Lister.address);
            let tokens = (await W12Lister.fetchAllTokensComposedInformation()).filter(t => !isZeroAddress(t.crowdsaleAddress));
            tokens = await map(tokens, async token => await dispatch('fetchTokenMinimal', token));
            return list.concat(tokens.filter(token => token && !isZeroAddress(token.tokenAddress)));
        };

        const list = await reduce(rootState.Config.W12ListerList, fetchToken, []);

        if (!state.currentToken && list.length) {
            commit(TOKEN_SELECTED, {currentToken: await dispatch('fetchTokenFull', list[0])});
        }

        commit(UPDATE, {list});
    } catch (e) {
        console.error(e);
        commit(UPDATE_META, {loading: false, loadingError: errorMessageSubstitution(e.message) || ERROR_FETCH_TOKENS_LIST});
    }
    commit(UPDATE_META, {loading: false});
}

export async function fetchListCurrentToken({commit, state, dispatch, rootState}, CurrentToken) {
    commit(UPDATE_META, {loading: true});
    try {
        const {W12ListerFactory} = await dispatch('Ledger/fetch', CurrentToken.version, {root: true});
        const W12Lister = W12ListerFactory.at(CurrentToken.listerAddress);
        let tokens = (await W12Lister.fetchTokensComposedInformation([CurrentToken.tokenAddress])).filter(t => !isZeroAddress(t.crowdsaleAddress));
        const list = await map(tokens, async token => await dispatch('fetchTokenMinimal', token));

        if (!state.currentToken && list.length) {
            commit(TOKEN_SELECTED, {currentToken: await dispatch('fetchTokenFull', list[0])});
        }

        commit(UPDATE, {list});
    } catch (e) {
        console.error(e);
        commit(UPDATE_META, {loading: false, loadingError: errorMessageSubstitution(e.message) || ERROR_FETCH_TOKENS_LIST});
    }
    commit(UPDATE_META, {loading: false});
}

// TODO: replace the old with it when refactoring
// export async function fetch({commit, state, dispatch}) {
//     commit(UPDATE_META, {loading: true});
//     try {
//         const fetchToken = async (list, Lister) => {
//             const {W12ListerFactory} = await dispatch('Ledger/fetch', Lister.version, {root: true});
//             const W12Lister = W12ListerFactory.at(Lister.address);
//
//             const listedTokens = await W12Lister.getTokensExtended();
//             const tokens = await map(listedTokens, async listedToken => {
//                 await dispatch('fetchTokenMinimal', token)
//             });
//             return list.concat(tokens);
//         };
//
//         const list = await reduce(this.state.Config.W12ListerList, fetchToken, []);
//
//         if (!state.currentToken && list.length) {
//             commit(TOKEN_SELECTED, {currentToken: await dispatch('fetchTokenFull', list[0])});
//         }
//
//         commit(UPDATE, {list});
//     } catch (e) {
//         console.error(e);
//         commit(UPDATE_META, {loading: false, loadingError: errorMessageSubstitution(e.message) || ERROR_FETCH_TOKENS_LIST});
//     }
//     commit(UPDATE_META, {loading: false});
// }

export async function fetchTokenMinimal({dispatch}, token) {
    const {
        W12CrowdsaleFactory
    } = await dispatch('Ledger/fetch', token.version, {root: true});
    const W12Crowdsale = W12CrowdsaleFactory.at(token.crowdsaleAddress);
    const stages = (await W12Crowdsale.getStagesList());
    const endDate = getEndDate(stages);
    token.crowdSaleInformation = {
        stages,
        endDate,
    };
    return endDate ? token : null;
}

// TODO: replace the old with it when refactoring
// export async function fetchTokenMinimal({dispatch}, token) {
//     instanceOf(token, StoredToken);
//
//     const {
//         W12CrowdsaleFactory
//     } = await dispatch('Ledger/fetch', token.version, {root: true});
//     const crowdsales = await map(token.listedToken.crowdsales, async crowdsale => {
//         return new StoredCrowdsale({
//             version: token.version,
//             tokenAddress: token.tokenAddress,
//         })
//     });
//     // TODO: rewrite
//     const W12Crowdsale = W12CrowdsaleFactory.at(token.crowdsaleAddress);
//     const stages = (await W12Crowdsale.getStagesList());
//     const endDate = getEndDate(stages);
//     token.crowdSaleInformation = {
//         stages,
//         endDate,
//     };
//     return endDate ? token : null;
// }

export async function fetchTokenByCurrentToken({commit, dispatch}, CurrentToken) {
    commit(UPDATE_META, {loading: true});
    try {
        const {W12ListerFactory} = await dispatch('Ledger/fetch', CurrentToken.version, {root: true});
        const W12Lister = W12ListerFactory.at(CurrentToken.listerAddress);
        const token = await W12Lister.fetchComposedTokenInformationByTokenAddress(CurrentToken);
        commit(TOKEN_SELECTED, {currentToken: await dispatch('fetchTokenFull', token)});
        commit(UPDATE, {list: [token]});
    } catch (e) {
        console.error(e);
        commit(UPDATE_META, {loading: false, loadingError: errorMessageSubstitution(e.message) || ERROR_FETCH_TOKENS_LIST});
    }
    commit(UPDATE_META, {loading: false});
}
