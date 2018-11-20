import {
    getSaleTokenAmountWithoutCommission,
    getTokenPriceWithDiscount, getSoldAmount,
    getSoldPercent
} from '@/lib/selectors/crowdsale';
import { getCurrentStage, getEndDate, getStartDate } from '@/lib/selectors/crowdsaleStages';
import Connector from "lib/Blockchain/DefaultConnector";
import semver from 'semver';
import { promisify, fromWeiDecimalsString, decodeUSD } from "src/lib/utils";
import moment from 'moment';

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

    const getBalance = promisify(web3.eth.getBalance.bind(web3.eth));

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
