export class BaseFactory {
    constructor (contractArtifacts, ContractWrapper, connector) {
        this.artifact = contractArtifacts;
        this.connector = connector;
        this.ContractWrapper = ContractWrapper;
        this.inited = false;
        this._instance = null;
    }

    async init () {
        if (this.inited) return;

        const {web3} = await this.connector.connect();

        this._instance = web3.eth.contract(this.artifact.abi);
        this.inited = true;
    }

    get instance () { return this._instance; }

    at(address) {
        return new this.ContractWrapper(this.artifact, this.instance.at(address));
    }
}
