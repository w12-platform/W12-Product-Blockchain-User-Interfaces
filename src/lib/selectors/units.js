import { BigNumber } from '@/lib/utils';


export function convertionByDecimals(value, decimals) {
    value = new BigNumber(value);
    decimals = new BigNumber(decimals);

    return value.mul(BigNumber.TEN.pow(decimals));
}

export function reverseConversionByDecimals(value, decimals) {
    value = new BigNumber(value);
    decimals = new BigNumber(decimals);

    return value.div(BigNumber.TEN.pow(decimals));
}
