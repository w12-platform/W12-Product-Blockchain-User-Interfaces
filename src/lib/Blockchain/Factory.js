export class ContractWrappersFactory {
    constructor(stategy) {
        this.strategy = stategy;
    }

    init() {
        return this.strategy.init();
    }

    // TODO: remove in the future
    // backward compatibility
    get instance() {
        return this.strategy.instanceSender;
    }

    get instanceGetter() {
        return this.strategy.instanceGetter;
    }

    get instanceSender() {
        return this.strategy.instanceSender;
    }

    at(address) {
        return this.strategy.at(address);
    }
}
