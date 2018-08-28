<template>
    <div class="ExchangeTokens buefy" v-if="balance !== '0'">
        <h2>{{ $t('ExchangeTokensProjects', {Balance: balance, WToken: currentToken.symbol, Token: currentToken.tokenInformation.symbol})}}</h2>
        <div class="ExchangeTokens__content">
            <div class="ExchangeTokens__form">
                <div class="ExchangeTokens__exchange py-2">
                    <button class="btn btn-primary py-2" @click="approveSwapToSpend">{{ $t('ExchangeTokensProjectsApprove') }}</button>

                    <div v-if="this.currentAccountData.allowanceForSwap !== '0'" class="py-2">
                        {{ $t('ExchangeTokensProjectsMessagesBeforeSwap', {
                            allowance: toEth(currentAccountData.allowanceForSwap),
                            WToken: currentToken.symbol,
                            Token: currentToken.tokenInformation.symbol,
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
    </div>
</template>

<script>
    import './default.scss';
    import Connector from "lib/Blockchain/DefaultConnector";
    import {waitTransactionReceipt} from 'lib/utils.js';
    import {createNamespacedHelpers} from "vuex";

    const web3 = new Web3();
    const BigNumber = web3.BigNumber;

    const TokensListNS = createNamespacedHelpers("TokensList");
    const AccountNS = createNamespacedHelpers("Account");
    const LedgerNS = createNamespacedHelpers("Ledger");
    const ConfigNS = createNamespacedHelpers("Config");

    export default {
        name: 'ExchangeTokens',
        template: '#ExchangeTokensTemplate',
        components: {},
        filters: {
            toEth(value) {
                value = value ? new BigNumber(value):0;
                return web3.fromWei(value, 'ether').toString();
            },
            decimals(value) {
                const d = this.currentToken ? this.currentToken.decimals : 0;
                const base = new BigNumber(10);
                value = new BigNumber(value);
                return value.div(base.pow(d)).toString();
            },
        },
        data() {
            return {
                rate: 1,
                amount: 0,
            };
        },
        watch: {},
        computed: {
            ...ConfigNS.mapState({
                configW12Lister: "W12Lister"
            }),
            ...AccountNS.mapState({
                currentAccount: "currentAccount",
                currentAccountData: "currentAccountData",
            }),
            ...TokensListNS.mapState({
                currentToken: "currentToken"
            }),

            balance() {
                return web3.fromWei(this.currentAccountData.balance, 'ether').toString();
            },
            unVestingBalance() {
                return web3.fromWei(this.currentAccountData.unVestingBalance, 'ether').toString();
            },
            vestingBalance() {
                return web3.fromWei(this.currentAccountData.vestingBalance, 'ether').toString();
            }
        },
        methods: {
            ...LedgerNS.mapActions({
                ledgerFetch: "fetch"
            }),
            ...TokensListNS.mapActions({
                tokensListUpdate: "update"
            }),
            ...AccountNS.mapActions({
                updateAccountData: 'updateAccountData',
            }),
            toEth(value) {
                value = value ? new BigNumber(value):0;
                return web3.fromWei(value, 'ether').toString();
            },
            async approveSwapToSpend() {
                try {
                    const {W12TokenFactory, W12ListerFactory} = await this.ledgerFetch();
                    const W12Lister = W12ListerFactory.at(this.configW12Lister.address);
                    const {web3} = await Connector.connect();
                    const W12Token = W12TokenFactory.at(this.currentToken.crowdSaleInformation.WTokenAddress);
                    const swapAddress = (await W12Lister.methods.swap());
                    const approveTx = await W12Token.methods.approve(
                        swapAddress,
                        web3.toWei(this.balance, 'ether'),
                        {from: this.currentAccount}
                    );
                    await waitTransactionReceipt(approveTx, web3);
                    setTimeout(async () => {
                        await this.updateAccountData();
                    }, 5000);
                } catch (e) {
                    console.log(e);
                }
            },

            async decreaseSwapApprovalToSpend() {
                try {
                    const {W12TokenFactory, W12ListerFactory} = await this.ledgerFetch();
                    const W12Lister = W12ListerFactory.at(this.configW12Lister.address);
                    const {web3} = await Connector.connect();
                    const W12Token = W12TokenFactory.at(this.currentToken.crowdSaleInformation.WTokenAddress);
                    const swapAddress = (await W12Lister.methods.swap());

                    const approveTx = await W12Token.methods.decreaseApproval(
                        swapAddress,
                        new BigNumber(this.currentAccountData.allowanceForSwap),
                        {from: this.currentAccount}
                    );

                    await waitTransactionReceipt(approveTx, web3);
                    setTimeout(async () => {
                        await this.updateAccountData();
                    }, 5000);
                } catch (e) {
                    console.log(e);
                }
            },

            async exchange(){
                const {W12AtomicSwapFactory, W12ListerFactory} = await this.ledgerFetch();
                const W12Lister = W12ListerFactory.at(this.configW12Lister.address);
                const {web3} = await Connector.connect();
                const swapAddress = (await W12Lister.methods.swap());
                const W12AtomicSwap = W12AtomicSwapFactory.at(swapAddress);

                const tx = await W12AtomicSwap.methods.exchange(
                    this.currentToken.crowdSaleInformation.WTokenAddress,
                    new BigNumber(this.currentAccountData.allowanceForSwap)
                );

                await waitTransactionReceipt(tx, web3);
                setTimeout(async () => {
                    await this.updateAccountData();
                }, 5000);
            },
        }
    };
</script>