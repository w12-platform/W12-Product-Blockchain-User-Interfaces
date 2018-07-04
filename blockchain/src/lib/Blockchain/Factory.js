export class ContractWrappersFactory {
    constructor(stategy) {
        this.strategy = stategy;
    }

    init() {
        return this.strategy.init();
    }

    get instance() {
        return this.strategy.instance;
    }

    at(address) {
        return this.strategy.at(address);
    }
}
