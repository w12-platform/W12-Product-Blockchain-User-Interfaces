import Web3 from 'web3';

const BigNumber = new Web3().BigNumber;
const MAX_UINT = new BigNumber(2).pow(256).minus(1);
const TOKEN_SYMBOL_RE = /^[a-zA-Z0-9]{3,5}$/;
const TOKEN_NAME_VALIDATION = (value) => /^([a-zA-Z0-9]+?\s?[a-zA-Z0-9]+?)+$/.test(value) && value.length < 51;
const TOKEN_DECIMALS_VALIDATION = (value) => { return value = parseInt(value), (1 < value && value < 19); };

export default ({
    tokenSymbolGetter,
    tokenNameGetter,
    tokenDecimalsGetter,
    tokenMintAmountGetter,
}) => {
    return {
        computed: {
            isTokenSymbolValid() {
                const value = tokenSymbolGetter(this);

                return TOKEN_SYMBOL_RE.test(value || '');
            },
            isTokenNameValid () {
                const value = tokenNameGetter(this);

                return TOKEN_NAME_VALIDATION(value || '');
            },
            isTokenDecimalsValid () {
                const value = tokenDecimalsGetter(this);

                return TOKEN_DECIMALS_VALIDATION(value);
            },
            isTokenMintAmountValid () {
                const value = new BigNumber(tokenMintAmountGetter(this) || 0);
                const decimals = new BigNumber(tokenDecimalsGetter(this) || 0);

                if (decimals.isNaN() || value.isNaN()) return false;

                const max = MAX_UINT.div(new BigNumber(10).pow(decimals));

                return value.lessThanOrEqualTo(max) && value.greaterThanOrEqualTo(100);
            },
        }
    };
}
