import Connector from './DefaultConnector.js';
import { ERC20Factory } from './Factories/ERC20.js';
import { W12CrowdsaleFactory } from './Factories/W12Crowdsale.js';
import { W12CrowdsaleFactoryFactory } from './Factories/W12CrowdsaleFactory.js';
import { W12ListerFactory } from './Factories/W12Lister.js';
import { W12TokenFactory } from './Factories/W12Token.js';
import { W12TokenLedgerFactory } from './Factories/W12TokenLedger.js';
import { ERC20Wrapper } from './Wrappers/ERC20.js';
import { W12CrowdsaleWrapper } from './Wrappers/W12Crowdsale.js';
import { W12CrowdsaleFactoryWrapper } from './Wrappers/W12CrowdsaleFactory.js';
import { W12ListerWrapper } from './Wrappers/W12Lister.js';
import { W12TokenWrapper } from './Wrappers/W12Token.js';
import { W12TokenLedgerWrapper } from './Wrappers/W12TokenLedger.js';


async function loadContracts() {
    const ERC20Artifacts = await fetch('/blockchain/src/lib/Blockchain/contracts/ERC20.json')
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

    const W12Lister = new W12ListerFactory(W12ListerArtifacts, W12ListerWrapper, Connector);
        await W12Lister.init();

    const W12Token = new W12TokenFactory(W12TokenArtifacts, W12TokenWrapper, Connector);
        await W12Token.init();

    const W12TokenLedger = new W12TokenLedgerFactory(W12TokenLedgerArtifacts, W12TokenLedgerWrapper, Connector);
        await W12TokenLedger.init();

    const ERC20 = new ERC20Factory(ERC20Artifacts, ERC20Wrapper, Connector);
        await ERC20.init();

    const W12Crowdsale = new W12CrowdsaleFactory(W12CrowdsaleArtifacts, W12CrowdsaleWrapper, Connector);
        await W12Crowdsale.init();

    const W12CrowdsaleFactoryInst = new W12CrowdsaleFactoryFactory(W12CrowdsaleFactoryArtifacts, W12CrowdsaleFactoryWrapper, Connector);
        await W12CrowdsaleFactoryInst.init();

    return {
        W12ListerFactory: W12Lister,
        W12CrowdsaleFactoryFactory: W12CrowdsaleFactoryInst,
        W12CrowdsaleFactory: W12Crowdsale,
        W12TokenFactory: W12Token,
        W12TokenLedgerFactory: W12TokenLedger,
        ERC20Factory: ERC20
    };
}

const ledger = loadContracts();

export default ledger;
