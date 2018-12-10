import { BaseFactoryStrategy } from 'src/lib/Blockchain/FactoryStrategies/NoVersion/BaseFactoryStrategy.js';

export class W12ListerFactoryStrategy extends BaseFactoryStrategy {
    constructor(
        contractArtifacts,
        ContractWrapper,
        connector,
        libVersion,
        realVersion,
        W12CrowdsaleFactory,
        ERC20DetailedFactory,
        ERC20Factory,
        TokenExchangerFactory
    ) {
        super(contractArtifacts, ContractWrapper, connector, libVersion, realVersion);

        this.W12CrowdsaleFactory = W12CrowdsaleFactory;
        this.ERC20Factory = ERC20Factory;
        this.ERC20DetailedFactory = ERC20DetailedFactory;
        this.TokenExchangerFactory = TokenExchangerFactory;
    }

    at(address) {
        const origin = super.at(address);

        origin.setFactories({
            W12CrowdsaleFactory: this.W12CrowdsaleFactory,
            ERC20Factory: this.ERC20Factory,
            TokenExchangerFactory: this.TokenExchangerFactory,
        });

        return origin;
    }
}
