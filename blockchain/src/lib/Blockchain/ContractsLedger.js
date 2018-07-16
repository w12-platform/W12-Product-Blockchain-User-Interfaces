import Connector from './DefaultConnector.js';
import { ContractWrappersFactory } from './Factory.js';
import { DetailedERC20FactoryStrategy } from './FactoryStrategies/DetailedERC20.js';
import { ERC20FactoryStrategy } from './FactoryStrategies/ERC20.js';
import { W12CrowdsaleFactoryStrategy } from './FactoryStrategies/W12Crowdsale.js';
import { W12CrowdsaleFactoryFactoryStrategy } from './FactoryStrategies/W12CrowdsaleFactory.js';
import { W12ListerFactoryStrategy } from './FactoryStrategies/W12Lister.js';
import { W12TokenFactoryStrategy } from './FactoryStrategies/W12Token.js';
import { W12TokenLedgerFactoryStrategy } from './FactoryStrategies/W12TokenLedger.js';
import { ERC20Wrapper } from './Wrappers/ERC20.js';
import { W12CrowdsaleWrapper } from './Wrappers/W12Crowdsale.js';
import { W12CrowdsaleFactoryWrapper } from './Wrappers/W12CrowdsaleFactory.js';
import { W12ListerWrapper } from './Wrappers/W12Lister.js';
import { W12TokenWrapper } from './Wrappers/W12Token.js';
import { W12TokenLedgerWrapper } from './Wrappers/W12TokenLedger.js';


async function loadContracts() {
    const ERC20Artifacts = await fetch('/blockchain/src/lib/Blockchain/contracts/ERC20.json')
        .then(data => data.json());

    const DetailedERC20Artifacts = await fetch('/blockchain/src/lib/Blockchain/contracts/DetailedERC20.json')
        .then(data => data.json());

    const W12ListerArtifacts = await fetch('/blockchain/src/lib/Blockchain/contracts/W12Lister.json')
        .then(data => data.json());

    const W12CrowdsaleFactoryArtifacts = await fetch('/blockchain/src/lib/Blockchain/contracts/W12CrowdsaleFactory.json')
        .then(data => data.json());

    const W12TokenArtifacts = await fetch('/blockchain/src/lib/Blockchain/contracts/WToken.json')
        .then(data => data.json());

    const W12TokenLedgerArtifacts = await fetch('/blockchain/src/lib/Blockchain/contracts/W12TokenLedger.json')
        .then(data => data.json());

    const W12CrowdsaleArtifacts = await fetch('/blockchain/src/lib/Blockchain/contracts/W12Crowdsale.json')
        .then(data => data.json());

    const W12Token = new ContractWrappersFactory(
        new W12TokenFactoryStrategy(W12TokenArtifacts, W12TokenWrapper, Connector)
    );
        await W12Token.init();

    const W12TokenLedger = new ContractWrappersFactory(
        new W12TokenLedgerFactoryStrategy(W12TokenLedgerArtifacts, W12TokenLedgerWrapper, Connector)
    );
        await W12TokenLedger.init();

    const ERC20 = new ContractWrappersFactory(
        new ERC20FactoryStrategy(ERC20Artifacts, ERC20Wrapper, Connector)
    );
        await ERC20.init();

    const DetailedERC20 = new ContractWrappersFactory(
        new DetailedERC20FactoryStrategy(DetailedERC20Artifacts, ERC20Wrapper, Connector)
    );
        await DetailedERC20.init();

    const W12Crowdsale = new ContractWrappersFactory(
        new W12CrowdsaleFactoryStrategy(W12CrowdsaleArtifacts, W12CrowdsaleWrapper, Connector)
    );
        await W12Crowdsale.init();

    const W12CrowdsaleFactoryInst = new ContractWrappersFactory(
        new W12CrowdsaleFactoryFactoryStrategy(W12CrowdsaleFactoryArtifacts, W12CrowdsaleFactoryWrapper, Connector)
    );
        await W12CrowdsaleFactoryInst.init();

    const W12Lister = new ContractWrappersFactory(
        new W12ListerFactoryStrategy(
            W12ListerArtifacts,
            W12ListerWrapper,
            Connector,
            W12Crowdsale,
            DetailedERC20,
            ERC20,
            W12TokenLedger
        )
    );
        await W12Lister.init();

    return {
        W12ListerFactory: W12Lister,
        W12CrowdsaleFactoryFactory: W12CrowdsaleFactoryInst,
        W12CrowdsaleFactory: W12Crowdsale,
        W12TokenFactory: W12Token,
        W12TokenLedgerFactory: W12TokenLedger,
        ERC20Factory: ERC20,
        DetailedERC20Factory: DetailedERC20
    };
}

const ledger = loadContracts();

export default ledger;
