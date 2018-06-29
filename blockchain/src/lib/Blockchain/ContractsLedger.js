import { W12ListerWrapper } from './Wrappers/W12Lister.js';
import { Connector } from './Connector.js';


async function loadContracts() {
    const W12Lister = await fetch('/blockchain/src/lib/Blockchain/contracts/W12Lister.json')
        .then(data => data.json());

    const W12CrowdsaleFactory = await fetch('/blockchain/src/lib/Blockchain/contracts/W12CrowdsaleFactory.json')
            .then(data => data.json());

    const WToken = await fetch('/blockchain/src/lib/Blockchain/contracts/WToken.json')
            .then(data => data.json());

    const W12ListerW = new W12ListerWrapper(W12Lister, new Connector());
        await W12ListerW.init();

    return {
        W12Lister: W12ListerW,
        W12CrowdsaleFactory,
        WToken
    };
}

const ledger = loadContracts();

export default ledger;
