<template>
    <div class="ExchangeTokens buefy" v-if="currentToken">
        <h2>Обмен {{ currentToken.symbol }} на {{ currentToken.tokenInformation.symbol }}</h2>
        <div class="ExchangeTokens__content">
            <table v-if="currentToken && currentAccountData"
                   class="table table-striped table-bordered table-hover table-responsive-sm">
                <tbody>
                <tr>
                    <td>Курс обмена 1 {{ currentToken.symbol }}</td>
                    <td>{{ rate }} {{ currentToken.tokenInformation.symbol }}</td>
                </tr>
                <tr>
                    <td>Баланс {{ currentToken.symbol }}</td>
                    <td>{{ balance }}
                    </td>
                </tr>
                <tr>
                    <td>Размороженный баланс {{ currentToken.symbol }}</td>
                    <td>{{ unVestingBalance }}</td>
                </tr>
                </tbody>
            </table>

            <div class="ExchangeTokens__form">
                <label for="Amount">Укажите количество {{ currentToken.symbol }}:</label>
                <b-field id="Amount">
                    <b-input
                            placeholder="Token amount"
                            type="number"
                            min="0"
                            :step="0.000001"
                            v-model="amount"
                            icon="shopping">
                    </b-input>
                </b-field>

                <div>Данное колличество позволит вернуть: {{ amount * rate }} {{ currentToken.tokenInformation.symbol
                    }}
                </div>

                <div class="ExchangeTokens__exchange py-2">
                    <button class="btn btn-primary py-2" @click="approveSwapToSpend">Разрешить обмен</button>

                    <div v-if="this.currentAccountData.allowanceForSwap !== '0'" class="py-2">Обменять {{
                        currentAccountData.allowanceForSwap | toEth }} {{ currentToken.symbol }} на {{
                        currentAccountData.allowanceForSwap | toEth }} {{ currentToken.tokenInformation.symbol }}?
                    </div>
                    <div v-if="this.currentAccountData.allowanceForSwap !== '0'" class="row pl-3 pr-3">

                        <button
                                class="btn btn-primary py-2"
                                :disabled="this.currentAccountData.allowanceForSwap === '0'"
                                @click="decreaseSwapApprovalToSpend">Отменить
                        </button>
                        <button
                                class="btn btn-primary py-2 ml-3"
                                :disabled="this.currentAccountData.allowanceForSwap === '0'"
                                @click="exchange">Обменять
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

            async approveSwapToSpend() {
                try {
                    const {W12TokenFactory, W12ListerFactory} = await this.ledgerFetch();
                    const W12Lister = W12ListerFactory.at(this.configW12Lister.address);
                    const {web3} = await Connector.connect();
                    const W12Token = W12TokenFactory.at(this.currentToken.crowdSaleInformation.WTokenAddress);
                    const swapAddress = (await W12Lister.methods.swap());
                    const approveTx = await W12Token.methods.approve(
                        swapAddress,
                        web3.toWei(this.amount, 'ether'),
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