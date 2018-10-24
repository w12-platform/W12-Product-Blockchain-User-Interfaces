import { promisify } from 'lib/utils.js';
import Web3 from 'web3';
import { wait } from '../../../utils';

const web3 = new Web3();
const BigNumber = web3.BigNumber;

export class BaseWrapper {
    constructor(contractArtifacts, { getter, sender }) {
        this.artifact = contractArtifacts;
        this.getterInstance = getter;
        this.senderInstance = sender;

        const abi = this.artifact.abi;
        const methods = this.methods = {};
        const events = this.events = {};
        const beforeSendHook = this.beforeSendHook.bind(this);

        for (let i = 0; i < abi.length; i++) {
            const item = abi[i];

            if (item.type == "function") {
                if (item.constant == true) {
                    methods[item.name] = promisify(this.getterInstance[item.name]);
                } else {
                    methods[item.name] = beforeSendHook(promisify(this.senderInstance[item.name]));
                }

                methods[item.name].call = promisify(this.getterInstance[item.name].call);
                methods[item.name].callWithSender = promisify(this.senderInstance[item.name].call);
                methods[item.name].sendTransaction = beforeSendHook(promisify(this.senderInstance[item.name].sendTransaction));
                methods[item.name].request = this.senderInstance[item.name].request;
                methods[item.name].getData = this.senderInstance[item.name].getData;
                methods[item.name].estimateGas = promisify(this.senderInstance[item.name].estimateGas);
            }

            if (item.type == "event") {
                events[item.name] = this.senderInstance[item.name];
            }
        }
    }

    beforeSendHook(funct) {
        return async (...args) => {
            if (
                !args.length
                || typeof args[args.length - 1] !== 'object'
                || typeof args[args.length - 1].toNumber === 'function'
            ) {
                args.push({});
            }

            if (
                typeof args[args.length - 1] === 'object'
                && !args[args.length - 1].toNumber
            ) {
                const txParams = args[args.length - 1];

                // try get gasPrice from external resource
                if (!txParams.hasOwnProperty('gasPrice')) {
                    try {
                        await wait(300);

                        const externalEstimations = await(await fetch('https://ethgasstation.info/json/ethgasAPI.json')).json();

                        txParams.gasPrice = web3.toWei(new BigNumber(externalEstimations.fast).mul(100), 'mwei');
                    } catch (e) {
                        console.error(e);

                        txParams.gasPrice = new BigNumber(await promisify(this.senderInstance._eth.getGasPrice)()).mul(4);
                    }
                }
            }

            return await funct(...args);
        }
    }

    // TODO: remove in the future
    // backward compatibility
    get instance() {
        return this.senderInstance;
    }
}
