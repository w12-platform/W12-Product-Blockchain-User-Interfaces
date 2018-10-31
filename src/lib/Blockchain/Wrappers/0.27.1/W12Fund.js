import { web3, round, BigNumber } from '@/lib/utils';
import { BaseWrapper } from 'src/lib/Blockchain/Wrappers/NoVersion/BaseWrapper.js';

export class W12FundWrapper extends BaseWrapper {
    setFactories ({
        W12CrowdsaleFactory,
    }) {
        this.W12CrowdsaleFactory = W12CrowdsaleFactory;
    }

    async getTotalFundedAssetsSymbols() {
        return (await this.methods.getTotalFundedAssetsSymbols()).map((s) => web3.toUtf8(s));
    }

    async getTotalFundedAmount(symbol) {
        return await this.methods.getTotalFundedAmount(web3.fromUtf8(symbol));
    }

    async getTotalFundedReleased(symbol) {
        return await this.methods.getTotalFundedReleased(web3.fromUtf8(symbol));
    }

    async getInvestorFundedAssetsSymbols(investor) {
        return (await this.methods.getInvestorFundedAssetsSymbols(investor))
            .map((s) => web3.toUtf8(s));
    }

    // TODO: wait for contracts realisation
    async getInvestorFundedAmount(investor, symbol) {
        const trancheReleased = await this.methods.totalTranchePercentReleased();
        const amount = await this.methods.getInvestorFundedAmount(investor, web3.fromUtf8(symbol));
        const maxPercent = new BigNumber(10000);

        if (amount.eq(0) || trancheReleased.eq(0)) return amount;

        return round(amount.mul(maxPercent.minus(trancheReleased)).div(maxPercent));
    }
}
