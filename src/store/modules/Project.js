import { devLog } from '@/lib/dev';
import { updateTokenInfo as updateTokenInfo_v0_20_x } from '@/store/modules/Project/0.20.x/actions';
import { updateTokenInfo as updateTokenInfo_v0_28_x } from '@/store/modules/Project/0.28.x/actions';
import { updateReceivingInformation as updateReceivingInformation_v0_20_x } from '@/store/modules/Project/0.20.x/actions';
import { updateReceivingInformation as updateReceivingInformation_v0_28_x } from '@/store/modules/Project/0.28.x/actions';
import { fetchCrowdSaleAddressAndInfo as fetchCrowdSaleAddressAndInfo_v0_20_x } from '@/store/modules/Project/0.20.x/actions';
import { fetchCrowdSaleAddressAndInfo as fetchCrowdSaleAddressAndInfo_v0_28_x } from '@/store/modules/Project/0.28.x/actions';
import {promisify, isZeroAddress, fromWeiDecimalsString, errorMessageSubstitution} from "src/lib/utils";
import {map} from 'p-iteration';
import Connector from "src/lib/Blockchain/DefaultConnector";
import isEqual from 'lodash/isEqual'
import { BigNumber } from 'src/lib/utils';
import semver from 'semver';
import { reverseConversionByDecimals } from '@/lib/selectors/units';
import {
    UPDATE_PROJECT,
    UPDATE_TOKENS_APPROVED,
    UPDATE_PLACED_TOKEN_ADDRESS,
    UPDATE_OWNER_BALANCE,
    UPDATE_CROWD_SALE_ADDRESS,
    UPDATE_CROWD_SALE_INFO,
    UPDATE_CROWD_SALE_STAGES_LIST,
    UPDATE_CROWD_SALE_IS_START,
    UPDATE_CROWD_SALE_MILESTONES_LIST,
    REMEMBER_APPROVE_TOKENS_TX,
    UPDATE_RECEVING_INFO,
    UPDATE_FUND_DATA,
    UPDATE_PAYMENT_METHODS_LIST,
    UPDATE_META,
    UPDATE,
    RESET
} from './Project/mutations';

const filterTokensListForCurrentAccount = (list, listerVersion, currentAccount) => {
    if (semver.satisfies(listerVersion, '0.20.x - 0.27.x')) {
        list = list.filter((token) => token.tokenOwners.includes(currentAccount));
        list.sort((a, b) => (a.index - b.index));

        const counter = {}; // {[tokenAddress: string]: number}
        const actualList = [];

        if (list.length) {
            devLog('current account: ', currentAccount);
            devLog('lister version: ', listerVersion);
            devLog('tokens list for current account', list);

            for (const token of list) {
                if (counter[token.tokenAddress] == null) {
                    counter[token.tokenAddress] = 0;
                }

                const indexOfOwnerInList = token.tokenOwners.indexOf(currentAccount);

                if (indexOfOwnerInList === counter[token.tokenAddress]) {
                    // Here we get record of listed token that has been added with owner parameter
                    // equal to current account.
                    // For example:
                    //
                    // Records: [record1(tokenA), record2(tokenA)]
                    // Owners for tokenA: [owner1, owner2]. All record for tokenA has the same owners list.
                    // record1(tokenA) has been added with owner1
                    // record2(tokenA) has been added with owner2
                    // If current account equal to owner2, then we take record2(tokenA)
                    // If current account equal to owner1, then we take record1(tokenA)
                    actualList.push(token);
                }

                counter[token.tokenAddress]++;
            }
        }

        return actualList;
    }

    return list.filter(token => token.tokenOwners.includes(currentAccount));
};

BigNumber.config({
    DECIMAL_PLACES: 36,
    EXPONENTIAL_AT: 18,
    FORMAT: {
        decimalSeparator: '.',
        groupSeparator: '',
        groupSize: 3,
        secondaryGroupSize: 0,
        fractionGroupSeparator: ' ',
        fractionGroupSize: 0
    }
});

export default {
    namespaced: true,
    state: {
        meta: {
            loading: true,
            loadingError: false,
            loadingProject: false,
            loadingProjectError: false,
        },
        list: [],
        currentProject: null,
    },
    getters: {
        hasAllowance: state => {
            return (
                state.currentProject
                && state.currentProject.tokensAmountThatApprovedToPlaceByTokenOwner
                && state.currentProject.tokensAmountThatApprovedToPlaceByTokenOwner !== '0'
            );
        },
        hasPlacedWTokenAddress: state => {
            return Boolean(state.currentProject && state.currentProject.placedTokenAddress);
        },
        ownerBalance: state => {
            return state.currentProject && state.currentProject.ownerBalance ? state.currentProject.ownerBalance : "";
        },
        tokensAmountThatApprovedToPlaceByTokenOwnerToNumber: state => {
            return state.currentProject && state.currentProject.tokensAmountThatApprovedToPlaceByTokenOwner
                    ? fromWeiDecimalsString(state.currentProject.tokensAmountThatApprovedToPlaceByTokenOwner, state.currentProject.decimals)
                    : '0';
        },
        tokensForAddCrowdsale: state => {
            return state.currentProject && state.currentProject.wTokensIssuedAmount && state.currentProject.tokensForSaleAmount
                ? fromWeiDecimalsString(new BigNumber(state.currentProject.tokensForSaleAmount).minus(state.currentProject.wTokensIssuedAmount), state.currentProject.decimals)
                : 0;
        },
        isCrowdsaleInited: state => {
            return Boolean(state.currentProject && state.currentProject.tokenCrowdsaleAddress);
        },
        tokensForSaleAmountToNumber: state => {
            return state.currentProject && state.currentProject.tokensForSaleAmount
                ? fromWeiDecimalsString(state.currentProject.tokensForSaleAmount, state.currentProject.decimals)
                : 0;
        },
        tokenCrowdSaleStagesNS: state => {
            return state.currentProject
            && state.currentProject.crowdSaleInformation
            && state.currentProject.crowdSaleInformation.tokenCrowdSaleStages
                ? state.currentProject.crowdSaleInformation.tokenCrowdSaleStages
                : [];
        },
        tokenCrowdSaleMilestonesNS: state => {
            return state.currentProject
            && state.currentProject.crowdSaleInformation
            && state.currentProject.crowdSaleInformation.tokenCrowdSaleMilestones
                ? state.currentProject.crowdSaleInformation.tokenCrowdSaleMilestones
                : [];
        },
        isStartCrowdSale: state => {
            return state.currentProject
            && state.currentProject.crowdSaleInformation
            && state.currentProject.crowdSaleInformation.isStartCrowdSale
                ? state.currentProject.crowdSaleInformation.isStartCrowdSale
                : false;
        },
        endDateCrowdSale: state => {
            if(state.currentProject
                && state.currentProject.crowdSaleInformation
                && state.currentProject.crowdSaleInformation.tokenCrowdSaleStages
                && state.currentProject.crowdSaleInformation.tokenCrowdSaleStages.length){
                const length = state.currentProject.crowdSaleInformation.tokenCrowdSaleStages.length;
                return state.currentProject.crowdSaleInformation.tokenCrowdSaleStages[length-1].endDate;
            }
            return false;
        }
    },
    mutations: {
        [UPDATE_META](state, payload) {
            Object.assign(state.meta, payload);
        },
        [UPDATE](state, payload) {
            const list = payload.list || [];
            Object.assign(state, {list});
        },
        [UPDATE_PROJECT](state, payload) {
            const currentProject = payload.currentProject || null;
            Object.assign(state, {currentProject});
        },
        [RESET](state) {
            const list = [];
            Object.assign(state, {list});
            const currentProject = null;
            Object.assign(state, {currentProject});
        },

        [UPDATE_TOKENS_APPROVED](state, payload) {
            state.currentProject = {
                ...state.currentProject,
                tokensAmountThatApprovedToPlaceByTokenOwner: payload.allowance ? payload.allowance : '0'
            }
        },
        [UPDATE_PLACED_TOKEN_ADDRESS](state, placedTokenAddress) {
            state.currentProject = {
                ...state.currentProject,
                placedTokenAddress: placedTokenAddress ? placedTokenAddress : null
            }
        },
        [UPDATE_OWNER_BALANCE](state, balance) {
            state.currentProject = {
                ...state.currentProject,
                ownerBalance: balance ? balance : "0"
            }
        },
        [UPDATE_CROWD_SALE_ADDRESS](state, address) {
            state.currentProject = {
                ...state.currentProject,
                tokenCrowdsaleAddress: address ? address : null
            }
        },
        [UPDATE_CROWD_SALE_INFO](state, crowdSaleInformation) {
            state.currentProject = {
                ...state.currentProject,
                crowdSaleInformation
            }
        },
        [UPDATE_CROWD_SALE_STAGES_LIST](state, tokenCrowdSaleStages) {
            state.currentProject = {
                ...state.currentProject,
                crowdSaleInformation: {
                    ...state.currentProject.crowdSaleInformation,
                    tokenCrowdSaleStages
                }
            }
        },
        [UPDATE_CROWD_SALE_MILESTONES_LIST](state, tokenCrowdSaleMilestones) {
            state.currentProject = {
                ...state.currentProject,
                crowdSaleInformation: {
                    ...state.currentProject.crowdSaleInformation,
                    tokenCrowdSaleMilestones
                }
            }
        },
        [UPDATE_CROWD_SALE_IS_START](state, isStartCrowdSale) {
            state.currentProject = {
                ...state.currentProject,
                crowdSaleInformation: {
                    ...state.currentProject.crowdSaleInformation,
                    isStartCrowdSale
                }
            }
        },
        [REMEMBER_APPROVE_TOKENS_TX](state, tx) {
            state.currentProject = {
                ...state.currentProject,
                approveTokensTx: tx
            }
        },
        [UPDATE_RECEVING_INFO](state, receiving) {
            state.currentProject = {
                ...state.currentProject,
                receiving: receiving
            }
        },
        [UPDATE_FUND_DATA](state, fundData) {
            state.currentProject = {
                ...state.currentProject,
                fundData: fundData
            }
        },
        [UPDATE_PAYMENT_METHODS_LIST](state, list) {
            state.currentProject = {
                ...state.currentProject,
                paymentMethodsList: list
            };
        }
    },
    actions: {
        async upTokenAfterEvent({commit, getters, state}, {Token}) {
            commit(UPDATE_META, {loadingProject: true});
            await this.dispatch('Project/updateTokenInfo', {Token});
            await this.dispatch('Project/updateOwnerBalance', {Token});
            await this.dispatch('Project/updatePlacedTokenStatus', {Token});
            await this.dispatch('Project/updateTokensApprovedToPlaceValue', {Token});
            await this.dispatch('Project/fetchCrowdSaleAddressAndInfo', {Token});
            commit(UPDATE_META, {loadingProject: false});
        },
        async fetchList({commit, rootState}) {
            commit(UPDATE_META, {loading: true});
            try {
                const account = rootState.Account.currentAccount;
                const listPromise = this.state.Config.W12ListerList.map(async (Lister)=>{
                    const {W12ListerFactory} = await this.dispatch('Ledger/fetch', Lister.version);
                    const W12Lister = W12ListerFactory.at(Lister.address);
                    const list = await W12Lister.fetchAllTokensInWhiteList();

                    return filterTokensListForCurrentAccount(list, Lister.version, account);
                });
                Promise.all(listPromise).then((completed) => {
                    let list = [];
                    completed.forEach((item)=>{
                        list = list.concat(item);
                    });
                    commit(UPDATE, {list});
                    commit(UPDATE_META, {loading: false});
                });
            } catch (e) {
                console.error(e);
                commit(UPDATE_META, {loading: false, loadingError: errorMessageSubstitution(e)});
            }
        },
        async fetchProject({commit}, Token) {
            commit(UPDATE_META, {loadingProject: true});
            await this.dispatch('Project/updateProject', Token);
            commit(UPDATE_META, {loadingProject: false});
        },
        async fetchProjectByCurrentToken({commit}, CurrentToken) {
            commit(UPDATE_META, {loadingProject: true, loading: true});
            const {W12ListerFactory} = await this.dispatch('Ledger/fetch', CurrentToken.version);
            const W12Lister = W12ListerFactory.at(CurrentToken.listerAddress);
            const Token = await W12Lister.fetchComposedTokenInformationByTokenAddress(CurrentToken);
            await this.dispatch('Project/updateProject', Token);
            commit(UPDATE_META, {loadingProject: false, loading: false});
        },
        async updateProject({commit, getters, state}, Token) {
            try {
                if (Token.tokenAddress && Token.tokenOwners) {
                    await this.dispatch('Project/updateTokenInfo', {Token});
                    await this.dispatch('Transactions/updateStatusTx');
                    await this.dispatch('Project/updateOwnerBalance', {Token});
                    await this.dispatch('Project/updateTokensApprovedToPlaceValue', {Token});
                    await this.dispatch('Project/updatePlacedTokenStatus', {Token: state.currentProject});
                    await this.dispatch('Project/fetchCrowdSaleAddressAndInfo', {Token: state.currentProject});

                    if (getters.isCrowdsaleInited) {
                        await this.dispatch('Project/fetchCrowdSaleStagesList', {Token: state.currentProject});
                        await this.dispatch('Project/upCrowdSaleStart', {Token: state.currentProject});
                        if (semver.satisfies(Token.version, '>=0.26.0')) {
                            await this.dispatch('Project/fetchPaymentMethodsList', {Token: state.currentProject});
                        }

                        if (state.currentProject.crowdSaleInformation.tokenCrowdSaleStages.length) {
                            await this.dispatch('Project/fetchCrowdSaleMilestonesList', {Token: state.currentProject});
                            await this.dispatch('Project/updateReceivingInformation', {Token: state.currentProject});
                            await this.dispatch('Project/updateFundInformation', {Token: state.currentProject});
                        }
                    }
                    await this.dispatch('Account/updateAccountData');
                } else {
                    commit(UPDATE_META, {loadingProject: false, loadingProjectError: "ERROR_FETCH_PROJECT"});
                }
            } catch (e) {
                console.error(e);
                commit(UPDATE_META, {loadingProject: false, loadingProjectError: errorMessageSubstitution(e)});
            }
        },
        async updateTokenInfo(context, payload) {
            if (semver.satisfies(payload.Token.version, '0.20.x - 0.27.x')) {
                return await updateTokenInfo_v0_20_x.call(this, context, payload);
            } else if (semver.satisfies(payload.Token.version, '>=0.28.x')) {
                return await updateTokenInfo_v0_28_x.call(this, context, payload);
            }

            throw new Error(`token version ${payload.Token.version} does not supported`);
        },
        async updateTokensApprovedToPlaceValue({commit}, {Token}) {
            try {
                const {ERC20Factory} = await this.dispatch('Ledger/fetch', Token.version);
                const ERC20 = ERC20Factory.at(Token.tokenAddress);

                const allowance = (await ERC20.methods.allowance(
                        this.state.Account.currentAccount,
                        Token.listerAddress)
                ).toString();

                commit(UPDATE_TOKENS_APPROVED, {allowance});
            } catch (e) {
                console.error(e);
                commit(UPDATE_META, {loadingProjectError: errorMessageSubstitution(e)});
            }
        },
        async updatePlacedTokenStatus({commit}, {Token}) {
            try {
                const {W12TokenLedgerFactory, TokenExchangerFactory} = await this.dispatch('Ledger/fetch', Token.version);
                const W12TokenLedger = W12TokenLedgerFactory ? W12TokenLedgerFactory.at(Token.ledgerAddress) : TokenExchangerFactory.at(Token.ledgerAddress);

                const placedTokenAddress = await W12TokenLedger.methods.getWTokenByToken(Token.tokenAddress);

                if (placedTokenAddress && !isZeroAddress(placedTokenAddress)) {
                    commit(UPDATE_PLACED_TOKEN_ADDRESS, placedTokenAddress);
                } else {
                    commit(UPDATE_PLACED_TOKEN_ADDRESS);
                }
            } catch (e) {
                console.error(e);
                commit(UPDATE_PLACED_TOKEN_ADDRESS);
                commit(UPDATE_META, {loadingProjectError: errorMessageSubstitution(e)});
            }
        },
        async updateOwnerBalance({commit}, {Token}) {
            try {
                const {ERC20Factory} = await this.dispatch('Ledger/fetch', Token.version);
                const ERC20 = ERC20Factory.at(Token.tokenAddress);

                const balance = (new BigNumber(await ERC20.methods.balanceOf(this.state.Account.currentAccount))
                    .div(new BigNumber(10).pow(Token.decimals))).toString();

                commit(UPDATE_OWNER_BALANCE, balance);
            } catch (e) {
                console.error(e);
                commit(UPDATE_META, {loadingProjectError: errorMessageSubstitution(e)});
            }
        },
        async fetchCrowdSaleAddressAndInfo(context, payload) {
            if (semver.satisfies(payload.Token.version, '0.20.x - 0.27.x')) {
                return await fetchCrowdSaleAddressAndInfo_v0_20_x.call(this, context, payload);
            } else if (semver.satisfies(payload.Token.version, '>=0.28.x')) {
                return await fetchCrowdSaleAddressAndInfo_v0_28_x.call(this, context, payload);
            }

            throw new Error(`token version ${payload.Token.version} does not supported`);
        },
        async fetchCrowdSaleStagesList({commit}, {Token}) {
            try {
                const {W12CrowdsaleFactory} = await this.dispatch('Ledger/fetch', Token.version);
                const W12Crowdsale = W12CrowdsaleFactory.at(Token.tokenCrowdsaleAddress);

                const list = await W12Crowdsale.getStagesList();

                list.forEach(stage => {
                    stage.startDate = new Date(stage.startDate * 1000);
                    stage.endDate = new Date(stage.endDate * 1000);
                    stage.vestingDate = stage.vestingDate ? new Date(stage.vestingDate * 1000) : null;
                });

                commit(UPDATE_CROWD_SALE_STAGES_LIST, list);
            } catch (e) {
                console.error(e);
                commit(UPDATE_CROWD_SALE_STAGES_LIST, []);
                commit(UPDATE_META, {loadingProjectError: errorMessageSubstitution(e)});
            }
        },
        async upCrowdSaleStart({commit}, {Token}) {
            try {
                if (Token.crowdSaleInformation.tokenCrowdSaleStages.length) {
                    const {W12CrowdsaleFactory} = await this.dispatch('Ledger/fetch', Token.version);
                    const W12Crowdsale = W12CrowdsaleFactory.at(Token.tokenCrowdsaleAddress);
                    const isSaleActive = await W12Crowdsale.methods.isSaleActive();
                    const isEnded = await W12Crowdsale.methods.isEnded();
                    const isStartCrowdSale = !(!isSaleActive && !isEnded);
                    commit(UPDATE_CROWD_SALE_IS_START, isStartCrowdSale);
                } else {
                    commit(UPDATE_CROWD_SALE_IS_START, false);
                }
            } catch (e) {
                console.error(e);
                commit(UPDATE_META, {loadingProjectError: errorMessageSubstitution(e)});
            }
        },
        async fetchCrowdSaleMilestonesList({commit}, {Token}) {
            try {
                const {W12CrowdsaleFactory} = await this.dispatch('Ledger/fetch', Token.version);
                const W12Crowdsale = W12CrowdsaleFactory.at(Token.tokenCrowdsaleAddress);
                if(Token.tokenCrowdsaleAddress) {
                    const milestones = await W12Crowdsale.getMilestones();
                    commit(UPDATE_CROWD_SALE_MILESTONES_LIST, milestones);
                } else {
                    commit(UPDATE_CROWD_SALE_MILESTONES_LIST, []);
                }
            } catch (e) {
                console.error(e);
                commit(UPDATE_CROWD_SALE_MILESTONES_LIST, []);
                commit(UPDATE_META, {loadingProjectError: errorMessageSubstitution(e)});
            }
        },
        async updateReceivingInformation(context, payload) {
            if (semver.satisfies(payload.Token.version, '0.20.x - 0.27.x')) {
                return await updateReceivingInformation_v0_20_x.call(this, context, payload);
            } else if (semver.satisfies(payload.Token.version, '>=0.28.x')) {
                return await updateReceivingInformation_v0_28_x.call(this, context, payload);
            }

            throw new Error(`token version ${payload.Token.version} does not supported`);
        },
        async updateFundInformation({commit, state}, {Token}) {
            try {
                const {W12CrowdsaleFactory, W12FundFactory} = await this.dispatch('Ledger/fetch', Token.version);
                const W12Crowdsale = W12CrowdsaleFactory.at(Token.tokenCrowdsaleAddress);
                const fundAddress = await W12Crowdsale.methods.fund();
                const W12Fund = W12FundFactory.at(fundAddress);
                const {web3} = await Connector.connect();
                const getBalance = promisify(web3.eth.getBalance.bind(web3.eth));
                const fundData = {
                    address: fundAddress,
                    balanceWei: (await getBalance(fundAddress)).toString(),
                };

                if (semver.satisfies(Token.version, '<0.26.2')) {
                    if (state.currentProject && state.currentProject.crowdSaleInformation && state.currentProject.crowdSaleInformation.isStartCrowdSale) {
                        fundData.trancheAmount = (await W12Fund.methods.getTrancheAmount()).toString();
                    } else {
                        fundData.trancheAmount = 0;
                    }
                } else {
                    const invoice = await W12Fund.methods.getTrancheInvoice();
                    const totalTokenBought = await W12Fund.methods.totalTokenBought();
                    const totalTokenRefunded = await W12Fund.methods.totalTokenRefunded();
                    const percent = invoice[0].div(100);

                    fundData.trancheInfo = await map((await W12Fund.getTotalFundedAssetsSymbols()),
                        async (symbol) => {
                            const decimals = await this.dispatch('Rates/resolveDecimals', {symbol, version: Token.version});
                            const totalAmount = await W12Fund.getTotalFundedAmount(symbol);
                            const totalReleased = await W12Fund.getTotalFundedReleased(symbol);

                            const balance = reverseConversionByDecimals(totalAmount.minus(totalReleased), decimals);

                            let trancheAmount = reverseConversionByDecimals(totalAmount, decimals).mul(percent.div(100));
                            trancheAmount = trancheAmount.minus(trancheAmount.mul(totalTokenRefunded.div(totalTokenBought)));

                            return {
                                "Symbol": symbol,
                                "Balance": balance.toString(),
                                "TrancheAmount": trancheAmount.toString(),
                            };
                        }
                    );
                    fundData.trancheTransferAllowed =  await W12Fund.methods.trancheTransferAllowed();
                }

                commit(UPDATE_FUND_DATA, fundData);
            } catch (e) {
                console.error(e);
                commit(UPDATE_META, {loadingProjectError: errorMessageSubstitution(e)});
            }
        },
        async fetchPaymentMethodsList({commit, state}, {Token}) {
            try {
                let list = [];

                if (!isZeroAddress(Token.tokenCrowdsaleAddress)) {
                    const {W12CrowdsaleFactory} = await this.dispatch('Ledger/fetch', Token.version);
                    const W12Crowdsale = W12CrowdsaleFactory.at(Token.tokenCrowdsaleAddress);

                    list = await W12Crowdsale.getPaymentMethodsList();
                }

                if (
                    state.currentProject
                    && !isEqual(state.currentProject.paymentMethodsList, list)
                ) {
                    commit(UPDATE_PAYMENT_METHODS_LIST, list);
                }
            } catch (e) {
                console.error(e);
                commit(UPDATE_META, {loadingProjectError: errorMessageSubstitution(e)});
            }
        },
    }
};
