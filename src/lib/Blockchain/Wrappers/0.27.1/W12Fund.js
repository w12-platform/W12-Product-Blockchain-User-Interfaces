import { web3 } from '@/lib/utils';
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
}
