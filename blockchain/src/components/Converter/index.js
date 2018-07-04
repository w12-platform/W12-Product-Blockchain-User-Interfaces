import Ledger from '../../lib/Blockchain/ContractsLedger.js';
import config from '../../config.js';
import {
    UNKNOWN_ERROR_WHILE_FETCH_TOKENS_LIST
} from '../../errors.js';

const web3 = new Web3();
const BigNumber = web3.BigNumber;

export default {
    name: 'Converter',
    template: '#ConverterTemplate',
    props: {
        tokenPriceInETH: {
            type: String,
            required: true
        },
        bonusConditions: {
            type: Array,
            required: true
        }
    },
    data () {
        return {
            tokens: '0',
            tokensWithoutDiscount: '0',
            ETHs: '0',
            ETHsWithoutDiscount: '0',
            currentDiscountPercent: '0'
        };
    },
    methods: {
        findMatchBonusRange(eth) {
            const ranges = this.bonusConditions.reduce(
                (result, item) => {
                    const last = result[result.length - 1];

                    let start = BigNumber(item[0]);
                    let bonusPercent = BigNumber(item[1]);

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
        getDiscountByEth(amount) {
            const range = this.findMatchBonusRange(amount);

            if (range) {
                return range.bonusPercent;
            }

            return new BigNumber(0);
        },
        getDiscountByTokens(amount) {
            const inEth = this.convertTokensToEth(amount, this.tokenPriceInETH, 0);
            const discount = this.getDiscountByEth(inEth);

            return discount;
        },
        convertTokensToEth(amount, price, discount) {
            price = price
                ? new BigNumber(price)
                : new BigNumber(this.tokenPriceInETH);

            discount = discount
                ? new BigNumber(discount)
                : this.getDiscountByTokens(amount);

            const priceMultiplier = new BigNumber(1).minus(discount.divideBy(100));

            return amount.mul(price.mul(priceMultiplier));
        },
        convertEthToTokens(amount, price, discount) {
            price = price
                ? new BigNumber(price)
                : new BigNumber(this.tokenPriceInETH);

            discount = discount
                ? new BigNumber(discount)
                : this.getDiscountByEth(amount);

            const priceMultiplier = new BigNumber(1).minus(discount.divideBy(100));

            return amount.dividedBy(price.mul(priceMultiplier));
        }
    }
};
