import {
    getSaleTokenAmountWithoutCommission,
    getTokenPriceWithDiscount, getSoldAmount,
    getSoldPercent
} from '@/lib/selectors/crowdsale';
import { getCurrentStage, getEndDate, getStartDate } from '@/lib/selectors/crowdsaleStages';
import { errorMessageSubstitution, isZeroAddress } from '@/lib/utils';
import Connector from "lib/Blockchain/DefaultConnector";
import semver from 'semver';
import { promisify, fromWeiDecimalsString, decodeUSD, warrantor } from "src/lib/utils";
import moment from 'moment';
import { map, reduce } from 'p-iteration';
import {
    UPDATE_TIMER_ID,
    TOKEN_SELECTED,
    PROJECT_SELECTED,
    UPDATE_META,
    UPDATE,
    UPDATE_PROJECTS,
    RESET
} from '../mutation';


const ERROR_FETCH_TOKENS_LIST = 'An unknown error while trying get tokens';

export async function fetchTokenFull({dispatch}, token) {
    const {
        DetailedERC20Factory,
        W12CrowdsaleFactory,
        W12TokenFactory,
        W12FundFactory,
    } = await dispatch('Ledger/fetch', token.version, {root: true});

    const {web3} = await Connector.connect();

    const DetailedERC20 = DetailedERC20Factory.at(token.tokenAddress);
    const W12Crowdsale = W12CrowdsaleFactory.at(token.crowdsaleAddress);
    const WTokenAddress = token.wTokenAddress;
    const W12FundAddress = (await W12Crowdsale.methods.fund());
    const W12Token = W12TokenFactory.at(WTokenAddress);
    const W12Fund = W12FundFactory.at(W12FundAddress);

    const WTokenDecimals = await W12Token.methods.decimals();
    const WTokenTotal = fromWeiDecimalsString(token.wTokensIssuedAmount, token.decimals);
    const tokensOnSale = fromWeiDecimalsString((await W12Token.methods.balanceOf(token.crowdsaleAddress)).toString(), token.decimals);
    const tokensForSaleAmount = fromWeiDecimalsString(token.tokensForSaleAmount, token.decimals);
    const tokenPrice = web3.fromWei(await W12Crowdsale.methods.price(), 'ether').toString();
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

    let totalFunded, totalRefunded, foundBalanceInWei;

    const getBalance = warrantor(web3.eth.getBalance.bind(web3.eth));
    foundBalanceInWei = (await getBalance(W12FundAddress)).toString();
    totalFunded = (await W12Fund.methods.totalFunded()).toString();
    totalRefunded = (await W12Fund.methods.totalRefunded()).toString();

    token.tokenInformation = (await DetailedERC20.getDescription());
    token.crowdSaleInformation = {
        tokenPrice,
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
            totalRefunded
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
            tokens = await map(tokens, async token => await dispatch('TokensList/fetchTokenMinimal', token, {root: true}));
            return list.concat(tokens.filter(token => token && !isZeroAddress(token.tokenAddress)));
        };

        const list = await reduce(rootState.Config.W12ListerList, fetchToken, []);

        if (!state.currentToken && list.length) {
            commit(TOKEN_SELECTED, {currentToken: await dispatch('TokensList/fetchTokenFull', list[0], {root: true})});
        }

        commit(UPDATE, {list});
    } catch (e) {
        console.error(e);
        commit(UPDATE_META, {loading: false, loadingError: errorMessageSubstitution(e.message) || ERROR_FETCH_TOKENS_LIST});
    }
    commit(UPDATE_META, {loading: false});
}

export async function fetchTokenMinimal({dispatch}, token){
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

export async function fetchTokenByCurrentToken({commit, dispatch}, CurrentToken) {
    commit(UPDATE_META, {loading: true});
    try {
        const {W12ListerFactory} = await dispatch('Ledger/fetch', CurrentToken.version, {root: true});
        const W12Lister = W12ListerFactory.at(CurrentToken.listerAddress);
        const token = await W12Lister.fetchComposedTokenInformationByTokenAddress(CurrentToken);
        commit(TOKEN_SELECTED, {currentToken: await dispatch('TokensList/fetchTokenFull', token)}, {root: true});
        commit(UPDATE, {list: [token]});
    } catch (e) {
        console.error(e);
        commit(UPDATE_META, {loading: false, loadingError: errorMessageSubstitution(e.message) || ERROR_FETCH_TOKENS_LIST});
    }
    commit(UPDATE_META, {loading: false});
}
