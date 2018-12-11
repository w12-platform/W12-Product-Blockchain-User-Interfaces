<template>
    <div class="ExchangeTokensProjects buefy" v-if="balance !== '0'">
        <h2>{{ $t('ExchangeTokensProjects', {Balance: balance, WToken: currentProject.symbol, Token:
            currentProject.tokenInformation.symbol})}}</h2>
        <div class="pm-2" v-if="isPendingTx">
            <p class="py-2">{{ $t('WaitingConfirm') }}:</p>
            <b-tag class="py-2">{{isPendingTx.hash}}</b-tag>
        </div>
        <div class="pm-2" v-if="isErrorTx">
            <p class="py-2">{{ $t('TransactionFailed') }}:</p>
            <b-tag class="py-2">{{isErrorTx.hash}}</b-tag>
            <div class="pt-2 text-left">
                <button class="btn btn-primary btn-sm" @click="TransactionsRetry(isErrorTx)">{{ $t('ToRetry') }}</button>
            </div>
        </div>
        <b-notification class="" v-if="error" @close="error = false" type="is-danger" has-icon>
            {{ error }}
        </b-notification>
        <div class="ExchangeTokensProjects__content" v-if="!isPendingTx && !isErrorTx">
            <div class="ExchangeTokensProjects__form">
                <div class="ExchangeTokensProjects__exchange py-2">
                    <button class="btn btn-primary py-2"
                            v-if="this.currentAccountData.allowanceForSwap === '0'" @click="approveSwapToSpend">{{
                        $t('ExchangeTokensProjectsApprove') }}
                    </button>

                    <div v-if="currentAccountData.allowanceForSwap !== '0'" class="py-2">
                        {{ $t('ExchangeTokensProjectsMessagesBeforeSwap', {
                        allowance: toEthDecimals(currentAccountData.allowanceForSwap),
                        WToken: currentProject.symbol,
                        Token: currentProject.tokenInformation.symbol,
                        })}}
                    </div>
                    <div v-if="this.currentAccountData.allowanceForSwap !== '0'" class="row pl-3 pr-3">

                        <button
                                class="btn btn-primary py-2"
                                :disabled="this.currentAccountData.allowanceForSwap === '0'"
                                @click="decreaseSwapApprovalToSpend">{{ $t('ExchangeTokensProjectsDecrease')}}
                        </button>
                        <button
                                class="btn btn-primary py-2 ml-3"
                                :disabled="this.currentAccountData.allowanceForSwap === '0'"
                                @click="exchange">{{ $t('ExchangeTokensProjectsExchange')}}
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <b-loading :is-full-page="false" :active="loading"></b-loading>
    </div>
</template>

<script>
    import './default.scss';
    import Connector from "lib/Blockchain/DefaultConnector";
    import { waitTransactionReceipt, formatNumber, toWeiDecimals, fromWeiDecimals, fromWeiDecimalsString, errorMessageSubstitution} from 'lib/utils.js';
    import {createNamespacedHelpers} from "vuex";
    import {UPDATE_TX} from "store/modules/Transactions.js";
    import Web3 from 'web3';

    const web3 = new Web3();
    const BigNumber = web3.BigNumber;

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

    const AccountNS = createNamespacedHelpers("Account");
    const LedgerNS = createNamespacedHelpers("Ledger");
    const ConfigNS = createNamespacedHelpers("Config");
    const ProjectNS = createNamespacedHelpers("Project");
    const TransactionsNS = createNamespacedHelpers("Transactions");

    export default {
        name: 'ExchangeTokens',
        template: '#ExchangeTokensTemplate',
        components: {},
        data() {
            return {
                rate: 1,
                amount: 0,
                error: false,
                loading: false
            };
        },
        computed: {
            ...ConfigNS.mapState({
                configW12Lister: "W12Lister"
            }),
            ...AccountNS.mapState({
                currentAccount: "currentAccount",
                currentAccountData: "currentAccountData",
            }),
            ...ProjectNS.mapState({
                currentProject: "currentProject",
            }),
            ...TransactionsNS.mapState({
                TransactionsList: "list"
            }),

            balance() {
                return fromWeiDecimalsString(this.currentAccountData.balance, this.currentProject.decimals);
            },
            unVestingBalance() {
                return fromWeiDecimalsString(this.currentAccountData.unVestingBalance, this.currentProject.decimals);
            },
            vestingBalance() {
                return fromWeiDecimalsString(this.currentAccountData.vestingBalance, this.currentProject.decimals);
            },
            isErrorTx() {
                return this.TransactionsList && this.TransactionsList.length
                    ? this.TransactionsList.find((tr) => {
                        return tr.token
                        && tr.name
                        && tr.hash
                        && tr.status
                        && tr.token === this.currentProject.wTokenAddress
                        && tr.name === "exchangeProject"
                        && tr.status === "error"
                            ? tr
                            : false
                    })
                    : false;
            },
            isPendingTx() {
                return this.TransactionsList && this.TransactionsList.length
                    ? this.TransactionsList.find((tr) => {
                        return tr.token
                        && tr.name
                        && tr.hash
                        && tr.status
                        && tr.token === this.currentProject.wTokenAddress
                        && tr.name === "exchangeProject"
                        && tr.status === "pending"
                            ? tr
                            : false
                    })
                    : false;
            },
        },
        methods: {
            ...LedgerNS.mapActions({
                ledgerFetch: "fetch"
            }),
            ...AccountNS.mapActions({
                updateAccountData: 'updateAccountData',
            }),
            ...TransactionsNS.mapActions({
                TransactionsRetry: "retry"
            }),
            toEth(value) {
                value = value ? new BigNumber(value) : 0;
                return web3.fromWei(value, 'ether').toString();
            },
            toEthDecimals(value) {
                value = value ? new BigNumber(value) : 0;
                return fromWeiDecimalsString(value, this.currentProject.decimals);
            },
            async approveSwapToSpend() {
                this.loading = true;
                try {
                    const {W12TokenFactory, W12ListerFactory} = await this.ledgerFetch(this.currentProject.version);
                    const W12Lister = W12ListerFactory.at(this.currentProject.listerAddress);
                    const {web3} = await Connector.connect();
                    const W12Token = W12TokenFactory.at(this.currentProject.wTokenAddress);
                    const swapAddress = (await W12Lister.swap());

                    const tx = await W12Token.methods.approve(
                        swapAddress,
                        toWeiDecimals(this.balance, this.currentProject.decimals),
                        {from: this.currentAccount}
                    );
                    this.$store.commit(`Transactions/${UPDATE_TX}`, {
                        token: this.currentProject.wTokenAddress,
                        name: "exchangeProject",
                        hash: tx,
                        status: "pending"
                    });
                    await waitTransactionReceipt(tx, web3);
                    await this.updateAccountData();
                } catch (e) {
                    this.error = errorMessageSubstitution(e);
                }
                this.loading = false;
            },

            async decreaseSwapApprovalToSpend() {
                this.loading = true;
                try {
                    const {W12TokenFactory, W12ListerFactory} = await this.ledgerFetch(this.currentProject.version);
                    const W12Lister = W12ListerFactory.at(this.currentProject.listerAddress);
                    const {web3} = await Connector.connect();
                    const W12Token = W12TokenFactory.at(this.currentProject.wTokenAddress);
                    const swapAddress = (await W12Lister.swap());
                    const tx = await W12Token.methods.decreaseApproval(
                        swapAddress,
                        new BigNumber(this.currentAccountData.allowanceForSwap),
                        {from: this.currentAccount}
                    );
                    this.$store.commit(`Transactions/${UPDATE_TX}`, {
                        token: this.currentProject.wTokenAddress,
                        name: "exchangeProject",
                        hash: tx,
                        status: "pending"
                    });
                    await waitTransactionReceipt(tx, web3);
                    await this.updateAccountData();
                } catch (e) {
                    this.error = errorMessageSubstitution(e);
                }
                this.loading = false;
            },
            async exchange() {
                this.loading = true;
                try {
                    const {W12AtomicSwapFactory, W12ListerFactory, TokenExchangerFactory} = await this.ledgerFetch(this.currentProject.version);
                    const W12Lister = W12ListerFactory.at(this.currentProject.listerAddress);
                    const {web3} = await Connector.connect();
                    const swapAddress = (await W12Lister.swap());
                    const W12AtomicSwap = TokenExchangerFactory ? TokenExchangerFactory.at(swapAddress):W12AtomicSwapFactory.at(swapAddress);
                    const tx = await W12AtomicSwap.methods.exchange(
                        this.currentProject.wTokenAddress,
                        new BigNumber(this.currentAccountData.allowanceForSwap)
                    );
                    this.$store.commit(`Transactions/${UPDATE_TX}`, {
                        token: this.currentProject.wTokenAddress,
                        name: "exchangeProject",
                        hash: tx,
                        status: "pending"
                    });
                    await waitTransactionReceipt(tx, web3);
                    await this.updateAccountData();
                } catch (e) {
                    this.error = errorMessageSubstitution(e);
                }
                this.loading = false;
            },
        }
    };
</script>
