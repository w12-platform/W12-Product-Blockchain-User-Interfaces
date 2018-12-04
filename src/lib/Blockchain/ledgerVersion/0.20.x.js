import { dynamicImport, jsonLoader } from 'lib/utils.js';
import Connector from '../DefaultConnector.js';
import { ContractWrappersFactory } from '../Factory.js';


export async function loadContracts(libVersion, realVersion) {
    const {DetailedERC20FactoryStrategy} = await dynamicImport("FactoryStrategies", libVersion, "DetailedERC20");
    const {ERC20FactoryStrategy} = await dynamicImport("FactoryStrategies", libVersion, "ERC20");
    const {W12CrowdsaleFactoryStrategy} = await dynamicImport("FactoryStrategies", libVersion, "W12Crowdsale");
    const {W12CrowdsaleFactoryFactoryStrategy} = await dynamicImport("FactoryStrategies", libVersion, "W12CrowdsaleFactory");
    const {W12TokenFactoryStrategy} = await dynamicImport("FactoryStrategies", libVersion, "W12Token");
    const {W12FundFactoryStrategy} = await dynamicImport("FactoryStrategies", libVersion, "W12Fund");
    const {WTokenTestHelperFactoryStrategy} = await dynamicImport("FactoryStrategies", libVersion, "WTokenTestHelper");
    const {W12ListerFactoryStrategy} = await dynamicImport("FactoryStrategies", libVersion, "W12Lister");
    const {VersionsLedgerFactoryStrategy} = await dynamicImport("FactoryStrategies", libVersion, "VersionsLedger");

    const {WTokenTestHelperWrapper} = await dynamicImport("Wrappers", libVersion, "WTokenTestHelper");
    const {DetailedERC20Wrapper} = await dynamicImport("Wrappers", libVersion, "DetailedERC20");
    const {ERC20Wrapper} = await dynamicImport("Wrappers", libVersion, "ERC20");
    const {W12CrowdsaleWrapper} = await dynamicImport("Wrappers", libVersion, "W12Crowdsale");
    const {W12CrowdsaleFactoryWrapper} = await dynamicImport("Wrappers", libVersion, "W12CrowdsaleFactory");
    const {W12TokenWrapper} = await dynamicImport("Wrappers", libVersion, "W12Token");
    const {VersionsLedgerWrapper} = await dynamicImport("Wrappers", libVersion, "VersionsLedger");
    const {W12FundWrapper} = await dynamicImport("Wrappers", libVersion, "W12Fund");
    const {W12ListerWrapper} = await dynamicImport("Wrappers", libVersion, "W12Lister");


    const W12ListerArtifacts = await jsonLoader(libVersion, "W12Lister");
    const VersionsLedgerArtifacts = await jsonLoader(libVersion, "VersionsLedger");
    const ERC20Artifacts = await jsonLoader(libVersion, "ERC20");
    const DetailedERC20Artifacts = await jsonLoader(libVersion, "DetailedERC20");
    const W12CrowdsaleFactoryArtifacts = await jsonLoader(libVersion, "W12CrowdsaleFactory");
    const W12TokenArtifacts = await jsonLoader(libVersion, "WToken");
    const W12CrowdsaleArtifacts = await jsonLoader(libVersion, "W12Crowdsale");
    const W12FundArtifacts = await jsonLoader(libVersion, "W12Fund");
    const WTokenTestHelperArtifacts = await jsonLoader(libVersion, "WTokenTestHelper");

    const VersionsLedger = new ContractWrappersFactory(
        new VersionsLedgerFactoryStrategy(VersionsLedgerArtifacts, VersionsLedgerWrapper, Connector, libVersion, realVersion)
    );
    await VersionsLedger.init();

    const W12Token = new ContractWrappersFactory(
        new W12TokenFactoryStrategy(W12TokenArtifacts, W12TokenWrapper, Connector, libVersion, realVersion)
    );
    await W12Token.init();

    const ERC20 = new ContractWrappersFactory(
        new ERC20FactoryStrategy(ERC20Artifacts, ERC20Wrapper, Connector, libVersion, realVersion)
    );
    await ERC20.init();

    const DetailedERC20 = new ContractWrappersFactory(
        new DetailedERC20FactoryStrategy(DetailedERC20Artifacts, DetailedERC20Wrapper, Connector, libVersion, realVersion)
    );
    await DetailedERC20.init();

    const W12Crowdsale = new ContractWrappersFactory(
        new W12CrowdsaleFactoryStrategy(W12CrowdsaleArtifacts, W12CrowdsaleWrapper, Connector, libVersion, realVersion)
    );
    await W12Crowdsale.init();

    const W12CrowdsaleFactoryInst = new ContractWrappersFactory(
        new W12CrowdsaleFactoryFactoryStrategy(W12CrowdsaleFactoryArtifacts, W12CrowdsaleFactoryWrapper, Connector, libVersion, realVersion)
    );
    await W12CrowdsaleFactoryInst.init();

    const W12Fund = new ContractWrappersFactory(
        new W12FundFactoryStrategy(W12FundArtifacts, W12FundWrapper, Connector, libVersion, realVersion, W12Crowdsale)
    );
    await W12Fund.init();

    const WTokenTestHelper = new ContractWrappersFactory(
        new WTokenTestHelperFactoryStrategy(WTokenTestHelperArtifacts, WTokenTestHelperWrapper, Connector, libVersion, realVersion)
    );
    await WTokenTestHelper.init();

    const W12TokenLedgerArtifacts = await jsonLoader(libVersion, "W12TokenLedger");
    const W12AtomicSwapArtifacts = await jsonLoader(libVersion, "W12AtomicSwap");

    const {W12TokenLedgerFactoryStrategy} = await dynamicImport("FactoryStrategies", libVersion, "W12TokenLedger");
    const {W12AtomicSwapFactoryStrategy} = await dynamicImport("FactoryStrategies", libVersion, "W12AtomicSwap");

    const {W12TokenLedgerWrapper} = await dynamicImport("Wrappers", libVersion, "W12TokenLedger");
    const {W12AtomicSwapWrapper} = await dynamicImport("Wrappers", libVersion, "W12AtomicSwap");

    const W12AtomicSwap = new ContractWrappersFactory(
        new W12AtomicSwapFactoryStrategy(W12AtomicSwapArtifacts, W12AtomicSwapWrapper, Connector, libVersion, realVersion)
    );
    await W12AtomicSwap.init();

    const W12TokenLedger = new ContractWrappersFactory(
        new W12TokenLedgerFactoryStrategy(W12TokenLedgerArtifacts, W12TokenLedgerWrapper, Connector, libVersion, realVersion)
    );
    await W12TokenLedger.init();

    const W12Lister = new ContractWrappersFactory(
        new W12ListerFactoryStrategy(
            W12ListerArtifacts,
            W12ListerWrapper,
            Connector,
            libVersion,
            realVersion,
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
        VersionsLedgerFactory: VersionsLedger
    };
}
