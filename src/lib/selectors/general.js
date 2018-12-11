import { encodePercent } from '@/lib/selectors/units';
import { BigNumber } from '@/lib/utils';

export function filterByVersion(version) {
    return (item) => item.version === version;
}

export function isValidCommissionPercent(value, limit = encodePercent(100)) {
    value = new BigNumber(value);
    return value.greaterThanOrEqualTo(0) && value.lessThan(limit);
}
