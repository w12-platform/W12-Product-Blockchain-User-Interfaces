import Connector from 'lib/Blockchain/DefaultConnector.js';
import {promisify, errorMessageSubstitution, warrantor, fromWeiDecimalsString} from 'lib/utils.js';
import config from '@/config.js';
import Web3 from 'web3';
import * as Sentry from '@sentry/browser';

export const ERROR_FETCH_ACCOUNT = 'LoadLedger: An unknown error';

export const UPDATE_META = "UPDATE_META";
export const UPDATE = 'UPDATE';
export const UPDATE_DATA = 'UPDATE_DATA';
export const UPDATE_TIMER_ID = 'UPDATE_TIMER_ID';
export const RESET = 'RESET';
export const INTERVAL_UP = 5000;

const web3 = new Web3();
const BigNumber = web3.BigNumber;

export default {
    namespaced: true,
    state: {
        meta: {
            loading: true,
            loadingErrorLabel: false, // notInstall || isBlocked
            updated: false,
        },
        timerId: false,
        currentAccount: false,
        currentAccountData: false,
        ethBalance: false,
        networkId: null,
    },
    modules: {},
    getters: {},
    mutations: {
        [UPDATE_META](state, payload) {
            Object.assign(state.meta, payload);
        },
        [UPDATE_TIMER_ID](state, payload) {
            clearInterval(this.state.Account.timerId);
            const timerId = payload ? payload.timerId || false : false;
            Object.assign(state, {timerId});
        },
        UPDATE_NETWORK_ID(state, payload) {
            Object.assign(state, {networkId: payload});
        },
        UPDATE_ETH_BALANCE(state, payload) {
            Object.assign(state, {ethBalance: payload});
        },
        [UPDATE](state, payload) {
            const currentAccount = payload.currentAccount || false;

            Object.assign(state, {currentAccount});
        },
        [UPDATE_DATA](state, payload) {
            const currentAccountData = payload.currentAccountData || false;
            Object.assign(state, {currentAccountData});
        },
        [RESET](state) {
            state.ledger = false;
        },
    },
    actions: {
        async watch({commit}) {
            commit(UPDATE_META, {loading: true, loadingError: false});
            await this.dispatch('Account/unWatch');
            const watcher = async () => {
                try {
                    const { web3: connectedWeb3, netId } = await Connector.connect();
                    const getAccounts = warrantor(connectedWeb3.eth.getAccounts.bind(connectedWeb3.eth.getAccounts));
                    const currentAccount = (await getAccounts())[0];
                    if(currentAccount){
                        const getBalance = warrantor(connectedWeb3.eth.getBalance.bind(connectedWeb3.eth));
                        const ethBalance = fromWeiDecimalsString((await getBalance(currentAccount)), 18);

                        commit('UPDATE_ETH_BALANCE', ethBalance);
                    }
                    commit('UPDATE_NETWORK_ID', netId);

                    Sentry.configureScope(scope => {
                        scope.setUser({
                            id: currentAccount || 'unknown',
                            account: currentAccount || 'unknown',
                        });
                        scope.setTag('network_id', netId);
                        scope.setTag('provider', Connector.isProvider('metamask') ? 'metamask' : 'unknown');
                    });

                    if (Connector.isProvider('metamask')) {
                        if(netId != config.blockchainNetworkId){
                            commit(UPDATE, {});
                            commit(UPDATE_DATA, {});
                            commit(UPDATE_META, {
                                loading: false,
                                loadingError: this._vm.$t(`ErrorCurrentEthereumNetworkIdIsNot${config.blockchainNetworkId}`)
                            });
                        } else {
                            if (!currentAccount) {
                                commit(UPDATE, {});
                                commit(UPDATE_DATA, {});
                                commit(UPDATE_META, {
                                    loading: false,
                                    loadingError: this._vm.$t('ErrorMetamaskIsBlocked'),
                                    loadingErrorLabel: 'isBlocked',
                                });
                            } else {
                                if (this.state.Account.currentAccount !== currentAccount) {
                                    commit(UPDATE, {currentAccount});
                                    await this.dispatch('Account/updateAccountData');
                                    commit(UPDATE_META, {loading: false, loadingError: false, loadingErrorLabel: false});
                                }
                            }
                        }
                    } else {
                        commit(UPDATE_META, {
                            loading: false,
                            loadingError: this._vm.$t('ErrorMetamaskNotInstalled'),
                            loadingErrorLabel: 'notInstall',
                        });
                    }
                } catch (e) {
                    commit(UPDATE_META, {loading: false, loadingError: errorMessageSubstitution(e) || ERROR_FETCH_ACCOUNT});
                }
            };

            await watcher();

            this.state.Account.timerId = this.state.Account.timerId
                ? this.state.Account.timerId
                : setInterval(async () => {
                    await watcher();
                }, INTERVAL_UP);

            commit(UPDATE_META, {loading: false, loadingError: false});
        },
        async unWatch({commit}) {
            commit(UPDATE_TIMER_ID);
        },
        async updateAccountData({commit}) {
            const selectedToken = this.state.TokensList.currentToken;
            const currentProject = this.state.Project.currentProject;
            
            if (!selectedToken && !currentProject) return;
            if(currentProject && !currentProject.fundData) return;

            commit(UPDATE_META, {updated: true});

            const listerAddress = selectedToken ? selectedToken.listerAddress : currentProject.listerAddress;
            const version = selectedToken ? selectedToken.version : currentProject.version;
            try {
                const {W12TokenFactory, W12FundFactory, W12ListerFactory} = await this.dispatch('Ledger/fetch', version);
                const W12Lister = W12ListerFactory.at(listerAddress);
                const wTokenAddress = selectedToken ? selectedToken.crowdSaleInformation.WTokenAddress : currentProject.wTokenAddress;
                const fundAddress = selectedToken ? selectedToken.crowdSaleInformation.fund.W12FundAddress : currentProject.fundData.address;
                const W12Token = W12TokenFactory.at(wTokenAddress);
                const W12Fund = W12FundFactory.at(fundAddress);
                const decimals = selectedToken ? selectedToken.decimals : currentProject.decimals;
                const oneToken = new BigNumber(10).pow(decimals);
                const balance = (await W12Token.methods.balanceOf(this.state.Account.currentAccount)).toString();
                const allowanceForTheFund = (await W12Token.methods.allowance(this.state.Account.currentAccount, fundAddress)).toString();
                const swapAddress = (await W12Lister.swap());
                const allowanceForSwap = (await W12Token.methods.allowance(this.state.Account.currentAccount, swapAddress)).toString();
                const allowanceForTheFundInRefundAmount = (await W12Fund.methods.getRefundAmount(allowanceForTheFund)).toString();
                const unVestingBalance = (await W12Token.methods.accountBalance(this.state.Account.currentAccount)).toString();
                const vestingBalance = new BigNumber(balance).minus(unVestingBalance).toString();
                const refundForOneToken = (await W12Fund.methods.getRefundAmount(oneToken)).toString();
                const totalRefundAmount = (await W12Fund.methods.getRefundAmount(balance)).toString();
                const investorInformation = await W12Fund.methods.getInvestmentsInfo(this.state.Account.currentAccount);
                const fundTokensBalance = (await W12Token.methods.balanceOf(fundAddress)).toString();

                const currentAccountData = {
                    balance,
                    vestingBalance,
                    unVestingBalance,
                    refundForOneToken,
                    totalRefundAmount,
                    fundTokensBalance,
                    allowanceForSwap,
                    allowanceForTheFund,
                    allowanceForTheFundInRefundAmount,
                    investorInformation: {
                        totalBought: investorInformation[0].toString(),
                        averageTokenPrice: investorInformation[1].toString()
                    }
                };
                commit(UPDATE_DATA, {currentAccountData});
            } catch (e) {
                commit(UPDATE_META, {loading: false, updated: false, loadingError: errorMessageSubstitution(e) || ERROR_FETCH_ACCOUNT});
            }

            commit(UPDATE_META, {updated: false});
        },
    }
};
