import { promisify } from 'lib/utils.js';

export class BaseWrapper {
    constructor(contractArtifacts, instance) {
        this.artifact = contractArtifacts;
        this.instance = instance;

        const abi = this.artifact.abi;
        const contractInter = this.instance;
        const methods = this.methods = {};
        const events = this.events = {};

        for (let i = 0; i < abi.length; i++) {
            const item = abi[i];

            if (item.type == "function") {
                if (item.constant == true) {
                    methods[item.name] = promisify(contractInter[item.name].bind(contractInter));
                } else {
                    methods[item.name] = promisify(contractInter[item.name].bind(contractInter));
                }

                methods[item.name].call = promisify(contractInter[item.name].call.bind(contractInter[item.name]));
                methods[item.name].sendTransaction = promisify(contractInter[item.name].sendTransaction.bind(contractInter[item.name]));
                methods[item.name].request = contractInter[item.name].request.bind(contractInter[item.name]);
                methods[item.name].getData = contractInter[item.name].getData.bind(contractInter[item.name]);
                // methods[item.name].toPayload = contractInter[item.name].toPayload;
                methods[item.name].estimateGas = promisify(contractInter[item.name].estimateGas.bind(contractInter[item.name]));
            }

            if (item.type == "event") {
                events[item.name] = contractInter[item.name].bind(contractInter);
            }
        }
    }
}
