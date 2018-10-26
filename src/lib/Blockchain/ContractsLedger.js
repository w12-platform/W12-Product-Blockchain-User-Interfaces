import { dynamicImport, jsonLoader } from 'lib/utils.js';

import Connector from './DefaultConnector.js';
import { ContractWrappersFactory } from './Factory.js';

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
    const {VersionableWrapper} = await dynamicImport("Wrappers", v, "Versionable");
    const {W12FundWrapper} = await dynamicImport("Wrappers", v, "W12Fund");
    const {W12ListerWrapper} = await dynamicImport("Wrappers", v, "W12Lister");

    let W12Lister = null;
    let W12AtomicSwap = null;
    let W12TokenLedger = null;
    let TokenExchanger = null;

    const W12ListerArtifacts = await jsonLoader(v, "W12Lister");
    const VersionableArtifacts = await jsonLoader(v, "Versionable");
    const VersionsLedgerArtifacts = await jsonLoader(v, "VersionsLedger");
    const ERC20Artifacts = await jsonLoader(v, "ERC20");
    const DetailedERC20Artifacts = await jsonLoader(v, "DetailedERC20");
    const W12CrowdsaleFactoryArtifacts = await jsonLoader(v, "W12CrowdsaleFactory");
    const W12TokenArtifacts = await jsonLoader(v, "WToken");
    const W12CrowdsaleArtifacts = await jsonLoader(v, "W12Crowdsale");
    const W12FundArtifacts = await jsonLoader(v, "W12Fund");
    const WTokenTestHelperArtifacts = await jsonLoader(v, "WTokenTestHelper");

    const VersionsLedger = new ContractWrappersFactory(
        new VersionsLedgerFactoryStrategy(VersionsLedgerArtifacts, VersionsLedgerWrapper, Connector)
    );
    await VersionsLedger.init();

    const W12Token = new ContractWrappersFactory(
        new W12TokenFactoryStrategy(W12TokenArtifacts, W12TokenWrapper, Connector)
    );
    await W12Token.init();

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

    const WTokenTestHelper = new ContractWrappersFactory(
        new WTokenTestHelperFactoryStrategy(WTokenTestHelperArtifacts, WTokenTestHelperWrapper, Connector)
    );
    await WTokenTestHelper.init();

    let Rates = null;

    if(['0.21.3', '0.23.2', '0.26.2'].includes(v)){
        const {RatesFactoryStrategy} = await dynamicImport("FactoryStrategies", v, "Rates");
        const {RatesWrapper} = await dynamicImport("Wrappers", v, "Rates");
        const RatesArtifacts = await jsonLoader(v, "Rates");

        Rates = new ContractWrappersFactory(
            new RatesFactoryStrategy(RatesArtifacts, RatesWrapper, Connector)
        );
        await Rates.init();
    }

    if(['0.23.2', '0.26.2'].includes(v)){
        const TokenExchangerArtifacts = await jsonLoader(v, "TokenExchanger");

        const {TokenExchangerFactoryStrategy} = await dynamicImport("FactoryStrategies", v, "TokenExchanger");

        const {TokenExchangerWrapper} = await dynamicImport("Wrappers", v, "TokenExchanger");

        TokenExchanger = new ContractWrappersFactory(
            new TokenExchangerFactoryStrategy(TokenExchangerArtifacts, TokenExchangerWrapper, Connector)
        );
        await TokenExchanger.init();

        W12Lister = new ContractWrappersFactory(
            new W12ListerFactoryStrategy(
                W12ListerArtifacts,
                W12ListerWrapper,
                Connector,
                W12Crowdsale,
                DetailedERC20,
                ERC20,
                TokenExchanger
            )
        );
        await W12Lister.init();
    } else {
        const W12TokenLedgerArtifacts = await jsonLoader(v, "W12TokenLedger");
        const W12AtomicSwapArtifacts = await jsonLoader(v, "W12AtomicSwap");

        const {W12TokenLedgerFactoryStrategy} = await dynamicImport("FactoryStrategies", v, "W12TokenLedger");
        const {W12AtomicSwapFactoryStrategy} = await dynamicImport("FactoryStrategies", v, "W12AtomicSwap");

        const {W12TokenLedgerWrapper} = await dynamicImport("Wrappers", v, "W12TokenLedger");
        const {W12AtomicSwapWrapper} = await dynamicImport("Wrappers", v, "W12AtomicSwap");

        W12AtomicSwap = new ContractWrappersFactory(
            new W12AtomicSwapFactoryStrategy(W12AtomicSwapArtifacts, W12AtomicSwapWrapper, Connector)
        );
        await W12AtomicSwap.init();

        W12TokenLedger = new ContractWrappersFactory(
            new W12TokenLedgerFactoryStrategy(W12TokenLedgerArtifacts, W12TokenLedgerWrapper, Connector)
        );
        await W12TokenLedger.init();

        W12Lister = new ContractWrappersFactory(
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
    }

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
        TokenExchangerFactory: TokenExchanger,
        RatesFactory: Rates
    };
}
