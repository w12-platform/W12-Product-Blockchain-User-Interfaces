<template>
    <div class="Calculator byefy" v-if="currentToken && currentToken.crowdSaleInformation.status">
        <h2>Купить токены {{ currentToken.symbol }}</h2>

        <div class="Calculator__content">
            <div class="Calculator__infoToken">
                <p>Token address:
                    <b-tag type="is-success">{{ currentToken.crowdSaleInformation.WTokenAddress }}</b-tag>
                </p>
                <p>Token name: {{ currentToken.name }}</p>
                <p>Token symbol: {{ currentToken.symbol }}</p>
            </div>

            <div class="Calculator__inputs row">
                <div class="col-sm py-2">
                    <label for="Tokens">{{ currentToken.symbol }}</label>
                    <b-field id="Tokens">
                        <b-input
                                placeholder="Token amount"
                                type="number"
                                min="0"
                                :step="0.000001"
                                v-model="tokens"
                                icon="shopping">
                        </b-input>
                    </b-field>
                </div>
                <div class="col-sm py-2">
                    <label for="ETHs">ETHs</label>
                    <b-field id="ETHs">
                        <b-input
                                placeholder="ETH"
                                type="number"
                                min="0"
                                :step="0.000001"
                                v-model="ETHs"
                                icon="ethereum">
                        </b-input>
                    </b-field>
                </div>
            </div>

            <div class="Calculator__info">
                <p v-if="currentToken.crowdSaleInformation.stageDiscount !== '0'">Discount:
                    <b-tag type="is-success">{{ currentToken.crowdSaleInformation.stageDiscount }}%</b-tag>
                    {{ profitInEth }} ETH
                </p>
                <p v-if="bonusVolume !== '0.00'">Bonus:
                    <b-tag type="is-success">+{{ bonusVolume }} {{ currentToken.symbol }}</b-tag>
                </p>

                <div class="Calculator__total">Total buy: {{ totalToken }} {{ currentToken.symbol }} - {{ total }} ETH
                </div>
            </div>

            <div class="Calculator__buy">
                <button class="btn btn-danger" @click="buy">Buy</button>
            </div>
        </div>
    </div>
</template>

<script>
    import './default.scss';
    import {createNamespacedHelpers} from "vuex";
    import {waitTransactionReceipt} from 'lib/utils.js';

    const LedgerNS = createNamespacedHelpers("Ledger");
    const AccountNS = createNamespacedHelpers("Account");
    const TokensListNS = createNamespacedHelpers("TokensList");

    const web3 = new Web3();
    const BigNumber = web3.BigNumber;
    import Connector from 'lib/Blockchain/DefaultConnector.js';

    export default {
        name: 'Calculator',
        template: '#CalculatorTemplate',
        data() {
            return {
                tokens: '0',
                tokensWithoutDiscount: '0',
                ETHs: '0',
                ETHsWithoutDiscount: '0',
                blockChangeTokens: false,
                blockChangeETHs: false,
                total: 0,
            };
        },
        watch: {
            tokens: {
                handler: 'handleTokensChange',
                immediate: true
            },
            ETHs: {
                handler: 'handleETHsChange',
                immediate: true
            },
            currentToken: {
                handler: 'handleSelectedChange',
                immediate: true
            }
        },
        computed: {
            ...TokensListNS.mapState({
                tokensListMeta: 'meta',
                tokensList: 'list',
                currentToken: 'currentToken',
            }),
            tokenPrice() {
                return this.currentToken.crowdSaleInformation.tokenPrice;
            },
            bonusConditions() {
                return this.currentToken.crowdSaleInformation.bonusVolumes;
            },
            fixedDiscountPercent() {
                return this.currentToken.crowdSaleInformation.stageDiscount;
            },
            profitInEth() {
                const ETHs = isNaN(parseFloat(this.ETHs))
                    ? '0'
                    : this.ETHs;

                return new BigNumber(this.ETHsWithoutDiscount).minus(ETHs).toFixed(4).toString();
            },
            bonusVolume() {
                const amount = this.ETHs ? this.ETHs : 0;
                const price = this.getPrice();
                const bonusMultiplier = amount ? this.getBonusMultiplierByEth(amount) : new BigNumber(1);

                return new BigNumber(amount).mul(bonusMultiplier).div(price).minus(
                    new BigNumber(amount).div(price)
                ).toFixed(2).toString();
            },
            totalToken() {
                const amount = this.ETHs ? this.ETHs : 0;
                const price = this.getPrice();
                const bonusMultiplier = amount ? this.getBonusMultiplierByEth(amount) : new BigNumber(1);

                return new BigNumber(amount).mul(bonusMultiplier).div(price).toFixed(2).toString();
            }
        },
        methods: {
            ...LedgerNS.mapActions({
                ledgerFetch: "fetch"
            }),
            ...AccountNS.mapActions({
                updateAccountData: 'updateAccountData'
            }),
            ...TokensListNS.mapActions({
                tokensListUpdate: "update"
            }),
            findMatchBonusRange(eth) {
                const ranges = this.bonusConditions.reduce(
                    (result, item) => {
                        const last = result[result.length - 1];

                        let start = new BigNumber(item[0]);
                        let bonusPercent = new BigNumber(item[1]);

                        if (result.length > 0 && !last.end.isFinite()) {
                            last.end = start.minus(web3.fromWei(1, 'ether'));
                        }

                        result.push({
                            start: start,
                            end: new BigNumber(Infinity),
                            bonusPercent: bonusPercent
                        });

                        return result;
                    },
                    []
                );

                return ranges.find(
                    (range) =>
                        range.start.lessThanOrEqualTo(eth)
                        && range.end.greaterThanOrEqualTo(eth)
                );
            },
            getPrice() {
                const discount = new BigNumber(1).minus(
                    new BigNumber(this.fixedDiscountPercent).dividedBy(100)
                );

                return new BigNumber(this.currentToken.crowdSaleInformation.tokenPrice).mul(discount);
            },
            getBonusMultiplierByEth(amount) {
                const range = this.findMatchBonusRange(amount);

                let discount = new BigNumber(1);

                if (range) {
                    discount = discount.plus(range.bonusPercent.div(100));
                }

                return discount;
            },
            getBonusMultiplierByTokens(amount) {
                const inEth = this.convertTokensToEth(amount, this.currentToken.crowdSaleInformation.tokenPrice, 1);
                const discount = this.getBonusMultiplierByEth(inEth);

                return discount;
            },
            convertTokensToEth(amount, price, bonusMultiplier) {

                price = price != null
                    ? new BigNumber(price)
                    : this.getPrice();

                bonusMultiplier = bonusMultiplier != null
                    ? new BigNumber(bonusMultiplier)
                    : this.getBonusMultiplierByTokens(amount);

                return new BigNumber(amount).mul(price);
            },
            convertEthToTokens(amount, price, bonusMultiplier) {
                price = price
                    ? new BigNumber(price)
                    : this.getPrice();

                bonusMultiplier = bonusMultiplier
                    ? new BigNumber(bonusMultiplier)
                    : this.getBonusMultiplierByEth(amount);

                return new BigNumber(amount).div(price);
            },

            handleTokensChange(value, prevValue) {
                value = isNaN(parseFloat(value))
                    ? '0'
                    : value;

                if (this.blockChangeETHs) {
                    return;
                }

                const withDiscount = this.convertTokensToEth(value);
                const withoutDiscount = this.convertTokensToEth(value, this.currentToken.crowdSaleInformation.tokenPrice, 1);
                const tokensWithoutDiscount = this.convertEthToTokens(withDiscount, this.currentToken.crowdSaleInformation.tokenPrice, 1);

                this.blockChangeTokens = true;

                this.ETHs = withDiscount.toString();
                this.ETHsWithoutDiscount = withoutDiscount.toString();
                this.tokensWithoutDiscount = tokensWithoutDiscount.toString();

                this.total = this.ETHs;

                this.$nextTick(() => {
                    this.blockChangeTokens = false;
                });
            },
            handleETHsChange(value, prevValue) {
                value = isNaN(parseFloat(value))
                    ? '0'
                    : value;

                if (this.blockChangeTokens) {
                    return;
                }

                const withDiscount = this.convertEthToTokens(value);
                const withoutDiscount = this.convertEthToTokens(value, this.currentToken.crowdSaleInformation.tokenPrice, 1);
                const ethWithoutDiscount = this.convertTokensToEth(withDiscount, this.currentToken.crowdSaleInformation.tokenPrice, 1);

                this.blockChangeETHs = true;

                this.tokens = withDiscount.toString();
                this.tokensWithoutDiscount = withoutDiscount.toString();
                this.ETHsWithoutDiscount = ethWithoutDiscount.toString();

                this.total = this.ETHs;

                this.$nextTick(() => {
                    this.blockChangeETHs = false;
                });
            },

            async buy() {
                const amount = new BigNumber(this.total);

                if (amount.greaterThan(0)) {
                    const {W12CrowdsaleFactory} = await this.ledgerFetch();
                    const connectedWeb3 = (await Connector.connect()).web3;
                    const W12Crowdsale = W12CrowdsaleFactory.at(this.currentToken.crowdSaleInformation.crowdsaleAddress);
                    const tx = await W12Crowdsale.methods.buyTokens({value: web3.toWei(amount.toFixed(6), 'ether')});
                    await waitTransactionReceipt(tx, connectedWeb3);
                    setTimeout(async ()=>{
                        await this.updateAccountData();
                        await this.tokensListUpdate({Index: this.currentToken.index});
                    }, 5000);
                }
            },

            handleSelectedChange(newSelected, oldSelected) {
                if (newSelected && oldSelected && newSelected.name !== oldSelected.name) {
                    this.total = 0;
                    this.ETHs = 0;
                    this.tokens = 0;
                }
            }
        },
    };

</script>