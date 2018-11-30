import { BaseFactoryStrategy } from 'src/lib/Blockchain/FactoryStrategies/NoVersion/BaseFactoryStrategy.js';

export class W12FundFactoryStrategy extends BaseFactoryStrategy {
    constructor (
        contractArtifacts,
        ContractWrapper,
        connector,
        W12CrowdsaleFactory,
        version
    ) {
        super(contractArtifacts, ContractWrapper, connector, version);

        this.W12CrowdsaleFactory = W12CrowdsaleFactory;
    }

    at (address) {
        const origin = super.at(address);

        origin.setFactories({
            W12CrowdsaleFactory: this.W12CrowdsaleFactory
        });

        return origin;
    }
}