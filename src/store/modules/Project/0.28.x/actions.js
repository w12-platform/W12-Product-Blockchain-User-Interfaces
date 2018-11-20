import { ReceivingModel } from '@/bem/Receiving/model';
import { fromWeiDecimalsString } from '@/lib/utils';
import { UPDATE_META, UPDATE_PROJECT, UPDATE_RECEVING_INFO } from '../mutations';

export async function updateTokenInfo({commit, dispatch}, {Token}) {
    try {
        if (Token.tokenAddress) {
            const {W12ListerFactory, ERC20DetailedFactory} = await dispatch('Ledger/fetch', Token.version, {root: true});
            const W12Lister = W12ListerFactory.at(Token.listerAddress);
            let token = await W12Lister.fetchComposedTokenInformationByTokenAddress(Token);
            const ERC20Detailed = ERC20DetailedFactory.at(token.tokenAddress);
            token.tokenInformation = (await ERC20Detailed.getDescription());

            commit(UPDATE_PROJECT, {currentProject: token});
        } else {
            commit(UPDATE_META, {loadingProject: false, loadingProjectError: "ERROR_FETCH_PROJECT"});
        }
    } catch (e) {
        console.error(e);
        commit(UPDATE_META, {loadingProject: false, loadingProjectError: e.message});
    }
}

export async function updateReceivingInformation({commit, state, dispatch}, {Token}) {
    try {
        const {W12TokenFactory, ERC20DetailedFactory} = await dispatch('Ledger/fetch', Token.version, {root: true});
        const W12Token = W12TokenFactory.at(Token.wTokenAddress);
        const ERC20Detailed = ERC20DetailedFactory.at(Token.tokenAddress);
        const token = await ERC20Detailed.getDescription();

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
        console.error(e);
        commit(UPDATE_META, {loadingProjectError: e.message});
    }
}
