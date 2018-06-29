export class BaseWrapper {
    constructor(contractArtifacts, connector) {
        this.artifact = contractArtifacts;
        this.connector = connector;
        this.inited = false;
        this._instance = null;
    }

    async init() {
        if (this.inited) return;

        await this.connector.init();
        const { web3 } = await this.connector.connect();

        this._instance = web3.eth.contract(this.artifact.abi);
        this.inited = true;
    }

    get instance() { return this._instance; }
}
