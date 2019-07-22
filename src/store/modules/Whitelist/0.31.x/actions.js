import { devLog } from '@/lib/dev';
import { errorMessageSubstitution } from '@/lib/utils';
import {
    UPDATE_META,
    UPDATE,
    RESET
} from '../mutations';


const ERROR_FETCH_TOKENS_LIST = 'An unknown error while trying get tokens';

export async function fetch({commit, dispatch, rootState}) {
    commit(UPDATE_META, {loading: true});
    try {
        const {W12ListerFactory} = await dispatch('Ledger/fetch', this.state.Config.W12Lister.version, {root: true});
        const W12Lister = W12ListerFactory.at(rootState.Config.W12Lister.address);
        const list = await W12Lister.getTokensExtended();
        devLog('[Vuex: Whitelist.fetch v0.28.0] tokens', list);
        commit(UPDATE, {list});
    } catch (e) {
        console.error(e);
        commit(UPDATE_META, {loading: false, loadingError: errorMessageSubstitution(e.message) || ERROR_FETCH_TOKENS_LIST});
    }
    commit(UPDATE_META, {loading: false});
}
