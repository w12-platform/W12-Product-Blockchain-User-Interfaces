import Connector from './DefaultConnector.js';
import { ContractWrappersFactory } from './Factory.js';
import { DetailedERC20FactoryStrategy } from './FactoryStrategies/DetailedERC20.js';
import { ERC20FactoryStrategy } from './FactoryStrategies/ERC20.js';
import { W12CrowdsaleFactoryStrategy } from './FactoryStrategies/W12Crowdsale.js';
import { W12CrowdsaleFactoryFactoryStrategy } from './FactoryStrategies/W12CrowdsaleFactory.js';
import { W12ListerFactoryStrategy } from './FactoryStrategies/W12Lister.js';
import { W12TokenFactoryStrategy } from './FactoryStrategies/W12Token.js';
import { W12TokenLedgerFactoryStrategy } from './FactoryStrategies/W12TokenLedger.js';
import { W12FundFactoryStrategy } from './FactoryStrategies/W12Fund.js';
import { WTokenTestHelperFactoryStrategy } from './FactoryStrategies/WTokenTestHelper.js';
import { WTokenTestHelperWrapper } from './Wrappers/WTokenTestHelper.js';
import { DetailedERC20Wrapper } from './Wrappers/DetailedERC20.js';
import { ERC20Wrapper } from './Wrappers/ERC20.js';
import { W12CrowdsaleWrapper } from './Wrappers/W12Crowdsale.js';
import { W12CrowdsaleFactoryWrapper } from './Wrappers/W12CrowdsaleFactory.js';
import { W12ListerWrapper } from './Wrappers/W12Lister.js';
import { W12TokenWrapper } from './Wrappers/W12Token.js';
import { VersionsLedgerWrapper } from './Wrappers/VersionsLedger.js';
import { VersionableWrapper } from './Wrappers/Versionable.js';
import { W12TokenLedgerWrapper } from './Wrappers/W12TokenLedger.js';
import { W12FundWrapper } from './Wrappers/W12Fund.js';
import { W12AtomicSwapWrapper } from './Wrappers/W12AtomicSwap.js';
import { W12AtomicSwapFactoryStrategy } from "./FactoryStrategies/W12AtomicSwap";

async function loadContracts() {

    const VersionableArtifacts = await fetch('/blockchain/src/lib/Blockchain/contracts/v1/Versionable.json')
        .then(data => data.json());

    const VersionsLedgerArtifacts = await fetch('/blockchain/src/lib/Blockchain/contracts/v1/VersionsLedger.json')
        .then(data => data.json());

    const ERC20Artifacts = await fetch('/blockchain/src/lib/Blockchain/contracts/v1/ERC20.json')
        .then(data => data.json());

    const DetailedERC20Artifacts = await fetch('/blockchain/src/lib/Blockchain/contracts/v1/DetailedERC20.json')
        .then(data => data.json());

    const W12ListerArtifacts = await fetch('/blockchain/src/lib/Blockchain/contracts/v1/W12Lister.json')
        .then(data => data.json());

    const W12CrowdsaleFactoryArtifacts = await fetch('/blockchain/src/lib/Blockchain/contracts/v1/W12CrowdsaleFactory.json')
        .then(data => data.json());

    const W12TokenArtifacts = await fetch('/blockchain/src/lib/Blockchain/contracts/v1/WToken.json')
        .then(data => data.json());

    const W12TokenLedgerArtifacts = await fetch('/blockchain/src/lib/Blockchain/contracts/v1/W12TokenLedger.json')
        .then(data => data.json());

    const W12CrowdsaleArtifacts = await fetch('/blockchain/src/lib/Blockchain/contracts/v1/W12Crowdsale.json')
        .then(data => data.json());

    const W12FundArtifacts = await fetch('/blockchain/src/lib/Blockchain/contracts/v1/W12Fund.json')
        .then(data => data.json());

    const W12AtomicSwapArtifacts = await fetch('/blockchain/src/lib/Blockchain/contracts/v1/W12AtomicSwap.json')
        .then(data => data.json());

    const WTokenTestHelperArtifacts = await fetch('/blockchain/src/lib/Blockchain/contracts/v1/WTokenTestHelper.json')
        .then(data => data.json());

    const Versionable = new ContractWrappersFactory(
        new W12TokenFactoryStrategy(VersionableArtifacts, VersionableWrapper, Connector)
    );
    await Versionable.init();

    const VersionsLedger = new ContractWrappersFactory(
        new W12TokenFactoryStrategy(VersionsLedgerArtifacts, VersionsLedgerWrapper, Connector)
    );
    await VersionsLedger.init();

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
        new DetailedERC20FactoryStrategy(DetailedERC20Artifacts, DetailedERC20Wrapper, Connector)
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

    const W12Fund = new ContractWrappersFactory(
        new W12FundFactoryStrategy(W12FundArtifacts, W12FundWrapper, Connector, W12Crowdsale)
    );
        await W12Fund.init();

    const W12AtomicSwap = new ContractWrappersFactory(
        new W12AtomicSwapFactoryStrategy(W12AtomicSwapArtifacts, W12AtomicSwapWrapper, Connector)
    );
        await W12AtomicSwap.init();

    const WTokenTestHelper = new ContractWrappersFactory(
        new WTokenTestHelperFactoryStrategy(WTokenTestHelperArtifacts, WTokenTestHelperWrapper, Connector)
    );
        await WTokenTestHelper.init();

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
        DetailedERC20Factory: DetailedERC20,
        W12FundFactory: W12Fund,
        W12AtomicSwapFactory: W12AtomicSwap,
        WTokenTestHelperFactory: WTokenTestHelper,
        VersionsLedgerFactory: VersionsLedger,
        VersionableFactory: Versionable
    };
}

const ledger = loadContracts();

export default ledger;
