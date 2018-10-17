<template>
    <div class="Converter">
        <div class="form-group col-md-6">
            <label for="Tokens">Tokens</label>
            <input
                    type="text"
                    class="form-control"
                    id="Tokens"
                    v-model="tokens">
        </div>
        <div class="form-group col-md-6">
            <label for="ETHs">ETHs</label>
            <input
                    type="text"
                    class="form-control"
                    id="ETHs"
                    v-model="ETHs">
        </div>
        <p>
            Profit: {{ profitInEth }} ETH
        </p>
    </div>
</template>

<script>
    import './default.scss';
    import Web3 from 'web3';

    const web3 = new Web3();
    const BigNumber = web3.BigNumber;

    export default {
        name: 'Converter',
        template: '#ConverterTemplate',
        props: {
            tokenPrice: {
                type: String,
                required: true
            },
            bonusConditions: {
                type: Array,
                required: true
            },
            fixedDiscountPercent: {
                type: String,
                default: '0'
            }
        },
        data () {
            return {
                tokens: '0',
                tokensWithoutDiscount: '0',
                ETHs: '0',
                ETHsWithoutDiscount: '0',
                blockChangeTokens: false,
                blockChangeETHs: false,
            };
        },
        computed: {
            profitInEth() {
                const ETHs = isNaN(parseFloat(this.ETHs))
                    ? '0'
                    : this.ETHs;

                return new BigNumber(this.ETHsWithoutDiscount).minus(ETHs).toString();
            }
        },
        watch: {
            tokens: {
                handler: 'handleTokensChange',
                immediate: true
            },
            ETHs: {
                handler: 'handleETHsChange',
                immediate: true
            }
        },
        methods: {
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

                return new BigNumber(this.tokenPrice).mul(discount);
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
                const inEth = this.convertTokensToEth(amount, this.tokenPrice, 1);
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
                const withoutDiscount = this.convertTokensToEth(value, this.tokenPrice, 1);
                const tokensWithoutDiscount = this.convertEthToTokens(withDiscount, this.tokenPrice, 1);

                this.blockChangeTokens = true;

                this.ETHs = withDiscount.toString();
                this.ETHsWithoutDiscount = withoutDiscount.toString();
                this.tokensWithoutDiscount = tokensWithoutDiscount.toString();

                this.$emit('change', {
                    tokens: this.tokens,
                    ETHs: this.ETHs
                });

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
                const withoutDiscount = this.convertEthToTokens(value, this.tokenPrice, 1);
                const ethWithoutDiscount = this.convertTokensToEth(withDiscount, this.tokenPrice, 1);

                this.blockChangeETHs = true;

                this.tokens = withDiscount.toString();
                this.tokensWithoutDiscount = withoutDiscount.toString();
                this.ETHsWithoutDiscount = ethWithoutDiscount.toString();

                this.$emit('change', {
                    tokens: this.tokens,
                    ETHs: this.ETHs
                });

                this.$nextTick(() => {
                    this.blockChangeETHs = false;
                });
            }
        }
    };
</script>
