import { BigNumber } from '@/lib/utils';


export function conversionByDecimals(value, decimals) {
    value = new BigNumber(value);
    decimals = new BigNumber(decimals);

    return value.mul(BigNumber.TEN.pow(decimals));
}

export function reverseConversionByDecimals(value, decimals) {
    value = new BigNumber(value);
    decimals = new BigNumber(decimals);

    return value.div(BigNumber.TEN.pow(decimals));
}

export function encodePercent(percent) {
    percent = new BigNumber(percent);
    return new BigNumber(percent.toFixed(2)).mul(100);
}

export function decodePercent(percent) {
    percent = new BigNumber(percent);
    return percent.div(100);
}
