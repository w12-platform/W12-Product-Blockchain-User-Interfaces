import { BaseFactoryStrategy } from 'src/lib/Blockchain/FactoryStrategies/NoVersion/BaseFactoryStrategy.js';

export class W12FundFactoryStrategy extends BaseFactoryStrategy {
    constructor (
        contractArtifacts,
        ContractWrapper,
        connector,
        libVersion,
        realVersion,
        W12CrowdsaleFactory,
    ) {
        super(contractArtifacts, ContractWrapper, connector, libVersion, realVersion);

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
