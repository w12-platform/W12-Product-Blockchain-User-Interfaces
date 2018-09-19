<template>
    <div class="Calculator">
        <div v-if="errorMessage" class="alert alert-danger" role="alert">
            <span>{{ errorMessage }}</span>
        </div>
        <p>Token address: {{ selected.WTokenAddress }}</p>
        <p>Token name: {{ selected.nameW }}</p>
        <p>Token symbol: {{ selected.symbolW }}</p>

        <div class="Calculator__inputs">
            <div class="Calculator__inputTokens">
                <label for="Tokens">{{ selected.symbolW }}</label>
                <input type="text" class="form-control" id="Tokens" v-model="tokens">
            </div>
            <div class="Calculator__inputEth">
                <label for="ETHs">ETHs</label>
                <input type="text" class="form-control" id="ETHs" v-model="ETHs">
            </div>
        </div>

        <div class="Calculator__info">
            <span>Profit: {{ profitInEth }} ETH</span>
            <p>Total buy: {{ total }} ETH</p>
        </div>

        <div class="Calculator__buy">
            <button class="btn btn-primary" @click="buy">Buy</button>
        </div>
    </div>
</template>

<script>
    import './default.scss';
    import {createNamespacedHelpers} from "vuex";
    import {
        UNKNOWN_ERROR_WHILE_FETCH_TOKENS_LIST
    } from '../../errors.js';
    import Ledger from '../../lib/Blockchain/ContractsLedger.js';
    const crowdsdalListStore = createNamespacedHelpers("crowdsdalList");
    const web3 = new Web3();
    const BigNumber = web3.BigNumber;

    export default {
        name: 'Calculator',
        template: '#CalculatorTemplate',
        components: {

        },
        data() {
            return {
                loadingLedger: false,
                tokens: '0',
                tokensWithoutDiscount: '0',
                ETHs: '0',
                ETHsWithoutDiscount: '0',
                blockChangeTokens: false,
                blockChangeETHs: false,
                total: 0,
                errorMessage: '',
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
            selected: {
                handler: 'handleSelectedChange',
                immediate: true
            }
        },
        computed: {
            ...crowdsdalListStore.mapState({
                selected: "selected"
            }),
            tokenPrice(){
                return this.selected.tokenPrice;
            },
            bonusConditions() {
                return this.selected.bonusVolumes;
            },
            fixedDiscountPercent() {
                return this.selected.stageDiscount;
            },
            profitInEth() {
                const ETHs = isNaN(parseFloat(this.ETHs))
                    ? '0'
                    : this.ETHs;

                return new BigNumber(this.ETHsWithoutDiscount).minus(ETHs).toString();
            }
        },
        methods: {
            clearErrorMessage () {
                this.errorMessage = '';
            },
            setErrorMessage (message) {
                this.errorMessage = message;
            },
            async loadLedger () {
                let ledger;

                this.loadingLedger = true;

                try {
                    ledger = await Ledger;
                } catch (e) {
                    this.setErrorMessage(e.message || UNKNOWN_ERROR_WHILE_FETCH_TOKENS_LIST);
                }

                this.loadingLedger = false;

                return ledger;
            },
            findMatchBonusRange(eth) {
                const ranges = this.bonusConditions.reduce(
                    (result, item) => {
                        const last = result[result.length - 1];

                        let start = new BigNumber(item[0]);
                        let bonusPercent = new BigNumber(item[1]);

                        if (result.length > 0 && !last.end.isFinite()) {
                            last.end = start;

                            start = start.plus(web3.fromWei(1, 'ether'));
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

                return new BigNumber(this.selected.tokenPrice).mul(discount);
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
                const inEth = this.convertTokensToEth(amount, this.selected.tokenPrice, 1);
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

                return new BigNumber(amount).div(bonusMultiplier).mul(price);
            },
            convertEthToTokens(amount, price, bonusMultiplier) {
                price = price
                    ? new BigNumber(price)
                    : this.getPrice();

                bonusMultiplier = bonusMultiplier
                    ? new BigNumber(bonusMultiplier)
                    : this.getBonusMultiplierByEth(amount);

                return new BigNumber(amount).mul(bonusMultiplier).div(price);
            },

            handleTokensChange(value, prevValue) {
                value = isNaN(parseFloat(value))
                    ? '0'
                    : value;

                if (this.blockChangeETHs) {
                    return;
                }

                const withDiscount = this.convertTokensToEth(value);
                const withoutDiscount = this.convertTokensToEth(value, this.selected.tokenPrice, 1);
                const tokensWithoutDiscount = this.convertEthToTokens(withDiscount, this.selected.tokenPrice, 1);

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
                const withoutDiscount = this.convertEthToTokens(value, this.selected.tokenPrice, 1);
                const ethWithoutDiscount = this.convertTokensToEth(withDiscount, this.selected.tokenPrice, 1);

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
                    const {W12CrowdsaleFactory} = await this.loadLedger();
                    const W12Crowdsale = W12CrowdsaleFactory.at(this.selected.crowdsaleAddress);
                    console.log("croudsale");
                    console.log(W12Crowdsale);
                    await W12Crowdsale.methods.buyTokens({ value: web3.toWei(amount, 'ether') });
                }
            },

            handleSelectedChange(newSelected,oldSelected){
                if(newSelected && oldSelected && newSelected.name !== oldSelected.name) {
                    this.total = 0;
                    this.ETHs = 0;
                    this.tokens = 0;
                }
            }
        },
        async created() {
        }
    };

</script>