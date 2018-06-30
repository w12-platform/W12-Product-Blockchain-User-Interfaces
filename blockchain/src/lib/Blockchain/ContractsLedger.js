import { W12ListerWrapper } from './Wrappers/W12Lister.js';
import Connector from './DefaultConnector.js';
import { W12TokenWrapper } from './Wrappers/W12Token.js';
import { W12TokenLedgerWrapper } from './Wrappers/W12TokenLedger.js';
import { ERC20Wrapper } from './Wrappers/ERC20.js';


async function loadContracts() {
    const ERC20 = await fetch('/blockchain/src/lib/Blockchain/contracts/ERC20.json')
        .then(data => data.json());

    const W12Lister = await fetch('/blockchain/src/lib/Blockchain/contracts/W12Lister.json')
        .then(data => data.json());

    const W12CrowdsaleFactory = await fetch('/blockchain/src/lib/Blockchain/contracts/W12CrowdsaleFactory.json')
            .then(data => data.json());

    const W12Token = await fetch('/blockchain/src/lib/Blockchain/contracts/WToken.json')
            .then(data => data.json());

    const W12TokenLedger = await fetch('/blockchain/src/lib/Blockchain/contracts/W12TokenLedger.json')
        .then(data => data.json());

    const Lister = new W12ListerWrapper(W12Lister, Connector);
        await Lister.init();

    const Token = new W12TokenWrapper(W12Token, Connector);
        await Token.init();

    const TokenLedger = new W12TokenLedgerWrapper(W12TokenLedger, Connector);
        await TokenLedger.init();

    const ERC20W = new ERC20Wrapper(ERC20, Connector);
        await ERC20W.init();

    return {
        W12Lister: Lister,
        W12CrowdsaleFactory,
        W12Token: Token,
        W12TokenLedger: TokenLedger,
        ERC20: ERC20W
    };
}

const ledger = loadContracts();

export default ledger;
