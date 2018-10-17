import { promisify } from 'lib/utils.js';

export class BaseWrapper {
    constructor(contractArtifacts, { getter, sender }) {
        this.artifact = contractArtifacts;
        this.getterInstance = getter;
        this.senderInstance = sender;

        const abi = this.artifact.abi;
        const methods = this.methods = {};
        const events = this.events = {};

        for (let i = 0; i < abi.length; i++) {
            const item = abi[i];

            if (item.type == "function") {
                if (item.constant == true) {
                    methods[item.name] = promisify(this.getterInstance[item.name]);
                } else {
                    methods[item.name] = promisify(this.senderInstance[item.name]);
                }

                methods[item.name].call = promisify(this.getterInstance[item.name].call);
                methods[item.name].callWithSender = promisify(this.senderInstance[item.name].call);
                methods[item.name].sendTransaction = promisify(this.senderInstance[item.name].sendTransaction);
                methods[item.name].request = this.senderInstance[item.name].request;
                methods[item.name].getData = this.senderInstance[item.name].getData;
                methods[item.name].estimateGas = promisify(this.senderInstance[item.name].estimateGas);
            }

            if (item.type == "event") {
                events[item.name] = this.senderInstance[item.name];
            }
        }
    }

    // TODO: remove in the future
    // backward compatibility
    get instance() {
        return this.senderInstance;
    }
}
