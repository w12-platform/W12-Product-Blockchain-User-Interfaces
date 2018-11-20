import { dynamicImport, jsonLoader } from 'lib/utils.js';
import Connector from '../DefaultConnector.js';
import { ContractWrappersFactory } from '../Factory.js';


export async function loadContracts(v) {
    const {DetailedERC20FactoryStrategy} = await dynamicImport("FactoryStrategies", v, "DetailedERC20");
    const {ERC20FactoryStrategy} = await dynamicImport("FactoryStrategies", v, "ERC20");
    const {W12CrowdsaleFactoryStrategy} = await dynamicImport("FactoryStrategies", v, "W12Crowdsale");
    const {W12CrowdsaleFactoryFactoryStrategy} = await dynamicImport("FactoryStrategies", v, "W12CrowdsaleFactory");
    const {W12TokenFactoryStrategy} = await dynamicImport("FactoryStrategies", v, "W12Token");
    const {W12FundFactoryStrategy} = await dynamicImport("FactoryStrategies", v, "W12Fund");
    const {WTokenTestHelperFactoryStrategy} = await dynamicImport("FactoryStrategies", v, "WTokenTestHelper");
    const {W12ListerFactoryStrategy} = await dynamicImport("FactoryStrategies", v, "W12Lister");
    const {VersionsLedgerFactoryStrategy} = await dynamicImport("FactoryStrategies", v, "VersionsLedger");

    const {WTokenTestHelperWrapper} = await dynamicImport("Wrappers", v, "WTokenTestHelper");
    const {DetailedERC20Wrapper} = await dynamicImport("Wrappers", v, "DetailedERC20");
    const {ERC20Wrapper} = await dynamicImport("Wrappers", v, "ERC20");
    const {W12CrowdsaleWrapper} = await dynamicImport("Wrappers", v, "W12Crowdsale");
    const {W12CrowdsaleFactoryWrapper} = await dynamicImport("Wrappers", v, "W12CrowdsaleFactory");
    const {W12TokenWrapper} = await dynamicImport("Wrappers", v, "W12Token");
    const {VersionsLedgerWrapper} = await dynamicImport("Wrappers", v, "VersionsLedger");
    const {W12FundWrapper} = await dynamicImport("Wrappers", v, "W12Fund");
    const {W12ListerWrapper} = await dynamicImport("Wrappers", v, "W12Lister");

    const W12ListerArtifacts = await jsonLoader(v, "W12Lister");
    const VersionsLedgerArtifacts = await jsonLoader(v, "VersionsLedger");
    const ERC20Artifacts = await jsonLoader(v, "ERC20");
    const DetailedERC20Artifacts = await jsonLoader(v, "DetailedERC20");
    const W12CrowdsaleFactoryArtifacts = await jsonLoader(v, "W12CrowdsaleFactory");
    const W12TokenArtifacts = await jsonLoader(v, "WToken");
    const W12CrowdsaleArtifacts = await jsonLoader(v, "W12Crowdsale");
    const W12FundArtifacts = await jsonLoader(v, "W12Fund");
    const WTokenTestHelperArtifacts = await jsonLoader(v, "WTokenTestHelper");

    const VersionsLedger = new ContractWrappersFactory(
        new VersionsLedgerFactoryStrategy(VersionsLedgerArtifacts, VersionsLedgerWrapper, Connector, v)
    );
    await VersionsLedger.init();

    const W12Token = new ContractWrappersFactory(
        new W12TokenFactoryStrategy(W12TokenArtifacts, W12TokenWrapper, Connector, v)
    );
    await W12Token.init();

    const ERC20 = new ContractWrappersFactory(
        new ERC20FactoryStrategy(ERC20Artifacts, ERC20Wrapper, Connector, v)
    );
    await ERC20.init();

    const DetailedERC20 = new ContractWrappersFactory(
        new DetailedERC20FactoryStrategy(DetailedERC20Artifacts, DetailedERC20Wrapper, Connector, v)
    );
    await DetailedERC20.init();

    const ERC20Detailed = new ContractWrappersFactory(
        new DetailedERC20FactoryStrategy(DetailedERC20Artifacts, DetailedERC20Wrapper, Connector, v)
    );
    await ERC20Detailed.init();

    const W12Crowdsale = new ContractWrappersFactory(
        new W12CrowdsaleFactoryStrategy(W12CrowdsaleArtifacts, W12CrowdsaleWrapper, Connector, v)
    );
    await W12Crowdsale.init();

    const W12CrowdsaleFactoryInst = new ContractWrappersFactory(
        new W12CrowdsaleFactoryFactoryStrategy(W12CrowdsaleFactoryArtifacts, W12CrowdsaleFactoryWrapper, Connector, v)
    );
    await W12CrowdsaleFactoryInst.init();

    const W12Fund = new ContractWrappersFactory(
        new W12FundFactoryStrategy(W12FundArtifacts, W12FundWrapper, Connector, v, W12Crowdsale)
    );
    await W12Fund.init();

    const WTokenTestHelper = new ContractWrappersFactory(
        new WTokenTestHelperFactoryStrategy(WTokenTestHelperArtifacts, WTokenTestHelperWrapper, Connector, v)
    );
    await WTokenTestHelper.init();

    const {RatesFactoryStrategy} = await dynamicImport("FactoryStrategies", v, "Rates");
    const {RatesWrapper} = await dynamicImport("Wrappers", v, "Rates");
    const RatesArtifacts = await jsonLoader(v, "Rates");

    const Rates = new ContractWrappersFactory(
        new RatesFactoryStrategy(RatesArtifacts, RatesWrapper, Connector, v)
    );
    await Rates.init();

    const TokenExchangerArtifacts = await jsonLoader(v, "TokenExchanger");

    const {TokenExchangerFactoryStrategy} = await dynamicImport("FactoryStrategies", v, "TokenExchanger");

    const {TokenExchangerWrapper} = await dynamicImport("Wrappers", v, "TokenExchanger");

    const TokenExchanger = new ContractWrappersFactory(
        new TokenExchangerFactoryStrategy(TokenExchangerArtifacts, TokenExchangerWrapper, Connector, v)
    );
    await TokenExchanger.init();

    const W12Lister = new ContractWrappersFactory(
        new W12ListerFactoryStrategy(
            W12ListerArtifacts,
            W12ListerWrapper,
            Connector,
            v,
            W12Crowdsale,
            DetailedERC20,
            ERC20,
            TokenExchanger
        )
    );
    await W12Lister.init();


    return {
        W12ListerFactory: W12Lister,
        W12CrowdsaleFactoryFactory: W12CrowdsaleFactoryInst,
        W12CrowdsaleFactory: W12Crowdsale,
        W12TokenFactory: W12Token,
        ERC20Factory: ERC20,
        DetailedERC20Factory: DetailedERC20,
        ERC20DetailedFactory: ERC20Detailed,
        W12FundFactory: W12Fund,
        WTokenTestHelperFactory: WTokenTestHelper,
        VersionsLedgerFactory: VersionsLedger,
        TokenExchangerFactory: TokenExchanger,
        RatesFactory: Rates
    };
}
