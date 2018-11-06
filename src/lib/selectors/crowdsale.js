import { BigNumber } from '@/lib/utils';


export function getSaleTokenAmountWithoutCommission(originValue, comission = 0) {
    originValue = new BigNumber(originValue);
    comission = new BigNumber(comission);

    return !originValue.eq(0) ? originValue
        .mul(originValue)
        .div(
            originValue
                .mul(comission.div(10000).plus(1))
        ) : originValue;
}

export function getTokenPriceWithDiscount(originValue, discount = 0) {
    originValue = new BigNumber(originValue);
    discount = new BigNumber(discount);

    return originValue.mul(100 - discount).div(100);
}

export function getSoldAmount(total, unsold) {
    total = new BigNumber(total);
    unsold = new BigNumber(unsold);

    return total.minus(unsold);
}

export function getSoldPercent(total, unsold) {
    total = new BigNumber(total);
    const sold = getSoldAmount(total, unsold);

    return sold.div(total).mul(100);
}

export function getMilestoneNumber(index) {
    if (index == null) return  null;

    index = new BigNumber(index);

    return index.plus(1).toNumber();
}
