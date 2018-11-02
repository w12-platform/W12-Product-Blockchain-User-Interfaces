import {BigNumber} from '@/lib/utils';
import uniq from 'lodash/uniq';

export function getRefundAmountForOneToken(tokenAmount, fundedAssets, valueModificator = (v) => v) {
    tokenAmount = new BigNumber(tokenAmount || 0);

    const result = {};
    const assets = Object.keys(fundedAssets);

    for(const asset of assets) {
        // skip USD
        if (asset === 'USD') continue;

        result[asset] = new BigNumber(fundedAssets[asset] || 0);
        result[asset] = tokenAmount.eq(0)
            ? new BigNumber(0)
            : result[asset].eq(0)
                ? new BigNumber(0)
                : new BigNumber(result[asset].div(tokenAmount).toFixed(8));
        result[asset] = valueModificator(result[asset], asset);
    }

    return result;
}

export function getTokenPriceForInvestor(tokenAmount, fundedUSD) {
    tokenAmount = new BigNumber(tokenAmount || 0);
    fundedUSD = new BigNumber(fundedUSD || 0);

    if (fundedUSD.eq(0) || tokenAmount.eq(0)) return new BigNumber(0);

    return new BigNumber(fundedUSD.div(tokenAmount).toFixed(8));
}

export function getAssetBySymbol(assetsObject, symbol) {
    return assetsObject[symbol];
}

export function getTotalTokenRefundedPercent(total, refunded) {
    total = new BigNumber(total || 0);
    refunded = new BigNumber(refunded || 0);

    if (total.eq(0) || refunded.eq(0)) return new BigNumber(0);

    return refunded.div(total).mul(100);
}

export function getActualBalanceInToken(total, refunded) {
    total = new BigNumber(total || 0);
    refunded = new BigNumber(refunded || 0);

    if (refunded.greaterThan(total)) {
        throw new Error('Refunded amount should not be greater than total amount');
    }

    return total.minus(refunded);
}

export function getActualBalanceInAssets(total, released, valueModificator = (v) => v) {
    const assets = Object.keys(total);
    const result = {};

    for(const asset of assets) {
        const _total = new BigNumber(total[asset] || 0);
        const _released = new BigNumber(released[asset] || 0);

        if (_released.greaterThan(_total)) {
            throw new Error('Released amount should not be greater than total amount');
        }

        result[asset] = valueModificator(new BigNumber(_total.minus(_released).toFixed(8)), asset);
    }

    return result;
}

export function getRefundedAmountPerAsset(tokenAmount, assetAmountPerOneToken, valueModificator = (v) => v) {
    tokenAmount = new BigNumber(tokenAmount || 0);

    const result = {};
    const assets = Object.keys(assetAmountPerOneToken);

    for (const asset of assets) {
        // skip USD
        if (asset === 'USD') continue;

        result[asset] = new BigNumber(assetAmountPerOneToken[asset] || 0);
        result[asset] = tokenAmount.eq(0)
            ? new BigNumber(0)
            : result[asset].eq(0)
                ? new BigNumber(0)
                : new BigNumber(result[asset].mul(tokenAmount).toFixed(8));
        result[asset] = valueModificator(result[asset], asset);
    }

    return result;
}

export function getTrancheIntervals(tokenCrowdSaleMilestones) {
    return tokenCrowdSaleMilestones.reduce((out, item, idx, origin) => {
        if (out.length === 0) {
            out.push([item.endDate])
        } else if (idx + 1 === origin.length) {
            out[out.length - 1].push(item.endDate);
            out.push([item.withdrawalEndDate, Infinity]);
        } else {
            out[out.length - 1].push(item.endDate);
            out.push([item.voteEndDate]);
        }
        return out;
    }, []);
}