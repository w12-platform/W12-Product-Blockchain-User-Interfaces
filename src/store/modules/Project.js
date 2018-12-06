import {
    promisify,
    isZeroAddress,
    fromWeiDecimalsString,
    fromWeiDecimals,
    errorMessageSubstitution,
    warrantor
} from "src/lib/utils";
import {map} from 'p-iteration';

import {ReceivingModel} from 'src/bem/Receiving/model.js';
import {TrancheInformationModel} from 'src/bem/TrancheInformation/shared.js';
import {MilestoneModel} from 'src/bem/Milestones/shared.js';
import Connector from "src/lib/Blockchain/DefaultConnector";
import Web3 from 'web3';
import semver from 'semver';

const moment = window.moment;
const web3 = new Web3();
const BigNumber = web3.BigNumber;
const filterTokensListForCurrentAccount = (list, listerVersion, currentAccount) => {
    if (semver.satisfies(listerVersion, '>=0.20.x')) {
        list = list.filter((token) => token.tokenOwners.includes(currentAccount));
        list.sort((a, b) => (a.index - b.index));

        const counter = {}; // {[tokenAddress: string]: number}
        const actualList = [];

        if (list.length) {
            if (process.env.NODE_ENV === 'development') {
                console.log('current account: ', currentAccount);
                console.log('lister version: ', listerVersion);
                console.log('tokens list for current account', list);
            }

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
    FORMAT: {
        decimalSeparator: '.',
        groupSeparator: '',
        groupSize: 3,
        secondaryGroupSize: 0,
        fractionGroupSeparator: ' ',
        fractionGroupSize: 0
    }
});

export const UPDATE_PROJECT = "UPDATE_PROJECT";
export const UPDATE_TOKENS_APPROVED = "UPDATE_TOKENS_APPROVED";
export const UPDATE_PLACED_TOKEN_ADDRESS = "UPDATE_PLACED_TOKEN_ADDRESS";
export const UPDATE_OWNER_BALANCE = "UPDATE_OWNER_BALANCE";
export const UPDATE_CROWD_SALE_ADDRESS = "UPDATE_CROWD_SALE_ADDRESS";
export const UPDATE_CROWD_SALE_INFO = "UPDATE_CROWD_SALE_INFO";
export const UPDATE_CROWD_SALE_STAGES_LIST = "UPDATE_CROWD_SALE_STAGES_LIST";
export const UPDATE_CROWD_SALE_IS_START = "UPDATE_CROWD_SALE_IS_START";
export const UPDATE_CROWD_SALE_MILESTONES_LIST = "UPDATE_CROWD_SALE_MILESTONES_LIST";
export const REMEMBER_APPROVE_TOKENS_TX = "REMEMBER_APPROVE_TOKENS_TX";
export const UPDATE_RECEVING_INFO = "UPDATE_RECEVING_INFO";
export const UPDATE_FUND_DATA = "UPDATE_FUND_DATA";
export const UPDATE_META = "UPDATE_META";
export const UPDATE = "UPDATE";
export const RESET = "RESET";

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
                commit(UPDATE_META, {loadingProject: false, loadingProjectError: errorMessageSubstitution(e)});
            }
        },
        async updateTokenInfo({commit}, {Token}) {
            try {
                if (Token.tokenAddress) {
                    const {W12ListerFactory, DetailedERC20Factory} = await this.dispatch('Ledger/fetch', Token.version);
                    const W12Lister = W12ListerFactory.at(Token.listerAddress);
                    let token = await W12Lister.fetchComposedTokenInformationByTokenAddress(Token);
                    const DetailedERC20 = DetailedERC20Factory.at(token.tokenAddress);
                    token.tokenInformation = (await DetailedERC20.getDescription());

                    commit(UPDATE_PROJECT, {currentProject: token});
                } else {
                    commit(UPDATE_META, {loadingProject: false, loadingProjectError: "ERROR_FETCH_PROJECT"});
                }
            } catch (e) {
                commit(UPDATE_META, {loadingProject: false, loadingProjectError: errorMessageSubstitution(e)});
            }
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
                commit(UPDATE_META, {loadingProjectError: errorMessageSubstitution(e)});
            }
        },
        async fetchCrowdSaleAddressAndInfo({commit}, {Token}) {
            try {
                const {W12ListerFactory, W12CrowdsaleFactory} = await this.dispatch('Ledger/fetch', Token.version);
                const W12Lister = W12ListerFactory.at(Token.listerAddress);

                try {
                    const address = await W12Lister.methods.getTokenCrowdsale(
                        Token.tokenAddress,
                        this.state.Account.currentAccount
                    );
                    if (address && !isZeroAddress(address)) {
                        const W12Crowdsale = W12CrowdsaleFactory.at(address);
                        const tokensForSaleAmount = Token.wTokensIssuedAmount;
                        const tokenPrice = web3.fromWei(await W12Crowdsale.methods.price(), 'ether').toString();

                        commit(UPDATE_CROWD_SALE_ADDRESS, address);
                        commit(UPDATE_CROWD_SALE_INFO, {
                            tokensForSaleAmount,
                            tokenPrice
                        });
                    } else {
                        commit(UPDATE_CROWD_SALE_ADDRESS);
                    }
                } catch (e) {
                    commit(UPDATE_CROWD_SALE_ADDRESS);
                }
            } catch (e) {
                commit(UPDATE_META, {loadingProjectError: errorMessageSubstitution(e)});
            }
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
                commit(UPDATE_META, {loadingProjectError: errorMessageSubstitution(e)});
            }
        },
        async fetchCrowdSaleMilestonesList({commit}, {Token}) {
            try {
                const {W12CrowdsaleFactory} = await this.dispatch('Ledger/fetch', Token.version);
                const W12Crowdsale = W12CrowdsaleFactory.at(Token.tokenCrowdsaleAddress);
                if(Token.tokenCrowdsaleAddress) {
                    const milestones = await W12Crowdsale.getMilestones();
                    commit(UPDATE_CROWD_SALE_MILESTONES_LIST, milestones.map((obj) => new MilestoneModel(obj)));
                } else {
                    commit(UPDATE_CROWD_SALE_MILESTONES_LIST, []);
                }
            } catch (e) {
                commit(UPDATE_CROWD_SALE_MILESTONES_LIST, []);
                commit(UPDATE_META, {loadingProjectError: errorMessageSubstitution(e)});
            }
        },
        async updateReceivingInformation({commit, state}, {Token}) {
            try {
                const {W12TokenFactory, DetailedERC20Factory} = await this.dispatch('Ledger/fetch', Token.version);
                const W12Token = W12TokenFactory.at(Token.wTokenAddress);
                const DetailedERC20 = DetailedERC20Factory.at(Token.tokenAddress);
                const token = await DetailedERC20.getDescription();

                const receiving = new ReceivingModel({
                    symbol: token.symbol,
                    symbolW: Token.symbol,
                    amountUnSold: fromWeiDecimalsString(await W12Token.methods.balanceOf(Token.tokenCrowdsaleAddress), state.currentProject.decimals),
                    amountRemainingInTokenChanger: 0,
                    amountRemainingAfterTheExchange: 0,
                    amountTotalAvailable: 0,
                });
                commit(UPDATE_RECEVING_INFO, receiving);
            } catch (e) {
                commit(UPDATE_META, {loadingProjectError: errorMessageSubstitution(e)});
            }
        },
        async updateFundInformation({commit, state}, {Token}) {
            try {
                const {W12CrowdsaleFactory, W12FundFactory} = await this.dispatch('Ledger/fetch', Token.version);
                const W12Crowdsale = W12CrowdsaleFactory.at(Token.tokenCrowdsaleAddress);
                const fundAddress = await W12Crowdsale.methods.fund();
                const W12Fund = W12FundFactory.at(fundAddress);
                const {web3} = await Connector.connect();
                const getBalance = warrantor(web3.eth.getBalance.bind(web3.eth));

                const fundData = {
                    address: fundAddress,
                    balanceWei: (await getBalance(fundAddress)).toString(),
                };
                if(state.currentProject && state.currentProject.crowdSaleInformation && state.currentProject.crowdSaleInformation.isStartCrowdSale) {
                    fundData.trancheAmount = (await W12Fund.methods.getTrancheAmount()).toString();
                } else {
                    fundData.trancheAmount = 0;
                }
                commit(UPDATE_FUND_DATA, fundData);
            } catch (e) {
                commit(UPDATE_META, {loadingProjectError: errorMessageSubstitution(e)});
            }
        },
    }
};
