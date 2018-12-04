export class BaseFactoryStrategy {
    constructor (contractArtifacts, ContractWrapper, connector, libVersion, realVersion) {
        this.artifact = contractArtifacts;
        this.connector = connector;
        this.ContractWrapper = ContractWrapper;
        this.inited = false;
        this._instanceGetter = null;
        this._instanceSender = null;
        this.version = realVersion;
        this.libVersion = libVersion;
    }

    async init () {
        if (this.inited) return;

        const {web3send, web3get} = await this.connector.connect();

        this._instanceGetter = web3get.eth.contract(this.artifact.abi);
        this._instanceSender = web3send.eth.contract(this.artifact.abi);
        this.inited = true;
    }

    get instanceGetter () { return this._instanceGetter; }

    get instanceSender () { return this._instanceSender; }

    at(address) {
        return new this.ContractWrapper(
            this.artifact,
            {
                sender: this.instanceSender.at(address),
                getter: this.instanceGetter.at(address),
                version: this.version,
                libVersion: this.libVersion
            }
        );
    }
}
