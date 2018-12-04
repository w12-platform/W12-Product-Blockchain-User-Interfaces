import { BaseFactoryStrategy } from 'src/lib/Blockchain/FactoryStrategies/NoVersion/BaseFactoryStrategy.js';

export class W12ListerFactoryStrategy extends BaseFactoryStrategy {
    constructor(
        contractArtifacts,
        ContractWrapper,
        connector,
        libVersion,
        realVersion,
        W12CrowdsaleFactory,
        DetailedERC20Factory,
        ERC20Factory,
        W12TokenLedgerFactory
    ) {
        super(contractArtifacts, ContractWrapper, connector, libVersion, realVersion);

        this.W12CrowdsaleFactory = W12CrowdsaleFactory;
        this.ERC20Factory = ERC20Factory;
        this.DetailedERC20Factory = DetailedERC20Factory;
        this.W12TokenLedgerFactory = W12TokenLedgerFactory;
    }

    at(address) {
        const origin = super.at(address);

        origin.setFactories({
            W12CrowdsaleFactory: this.W12CrowdsaleFactory,
            ERC20Factory: this.ERC20Factory,
            W12TokenLedgerFactory: this.W12TokenLedgerFactory,
        });

        return origin;
    }
}
