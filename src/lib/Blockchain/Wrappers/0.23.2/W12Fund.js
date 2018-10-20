import { BaseWrapper } from 'src/lib/Blockchain/Wrappers/NoVersion/BaseWrapper.js';

export class W12FundWrapper extends BaseWrapper {
    setFactories ({
                      W12CrowdsaleFactory,
                  }) {
        this.W12CrowdsaleFactory = W12CrowdsaleFactory;
    }
}