import { WhitelistedCrowdsale } from '@/lib/models/WhitelistedCrowdsale';


export class WhiteistedToken {
    constructor(model) {
        this.version = model.version;
        this.tokenAddress = model.tokenAddress;
        this.listerAddress = model.listerAddress;
        this.ledgerAddress = model.ledgerAddress;
        this.wTokenAddress = model.wTokenAddress;
        this.name = model.name;
        this.symbol = model.symbol;
        this.decimals = model.decimals;
        this.feePercent = model.feePercent;
        this.feeETHPercent = model.feeETHPercent;
        this.WTokenSaleFeePercent = model.WTokenSaleFeePercent;
        this.trancheFeePercent = model.trancheFeePercent;
        this.crowdsales = model.crowdsales.map(c => new WhitelistedCrowdsale(c));
        this.owners = model.owners || [];
    }

    hasNotInitializedCrowdsale() {
        return this.crowdsales.some(c => c.isNotInitialized());
    }

    getNotInitializedCrowdsale() {
        return this.crowdsales.find(c => c.isNotInitialized());
    }

    getCrowdsaleByAddress(crowdsaleAddress) {
        return this.crowdsales.find(c => c.crowdsaleAddress === crowdsaleAddress);
    }
}
