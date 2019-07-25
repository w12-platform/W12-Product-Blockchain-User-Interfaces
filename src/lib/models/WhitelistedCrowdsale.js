import { isZeroAddress } from '@/lib/utils';


export class WhitelistedCrowdsale {
    constructor(model) {
        this.version = model.version;
        this.tokenAddress = model.tokenAddress;
        this.crowdsaleAddress = model.crowdsaleAddress;
        this.feePercent = model.feePercent;
        this.feeETHPercent = model.feeETHPercent;
        this.WTokenSaleFeePercent = model.WTokenSaleFeePercent;
        this.trancheFeePercent = model.trancheFeePercent;
        this.tokensForSaleAmount = model.tokensForSaleAmount;
        this.wTokensIssuedAmount = model.wTokensIssuedAmount;
        this.owners = model.owners || [];
        this.individualPurchaseFee = model.individualPurchaseFee || {};
    }

    isNotInitialized() {
        return (!this.crowdsaleAddress || isZeroAddress(this.crowdsaleAddress));
    }
}
