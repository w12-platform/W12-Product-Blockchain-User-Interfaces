import { promisify, promisifyLogsResult, wait, promisifyLogsResultWarrantor, warrantor} from 'lib/utils.js';
import Web3 from 'web3';
import {cacheController, getCacheType} from 'src/lib/Blockchain/Cache.js';

const web3 = new Web3();
const BigNumber = web3.BigNumber;

export class BaseWrapper {
    constructor(contractArtifacts, { getter, sender, version, libVersion }) {
        this.artifact = contractArtifacts;
        this.getterInstance = getter;
        this.senderInstance = sender;
        this.version = version;
        this.libVersion = libVersion;

        const abi = this.artifact.abi;
        const methods = this.methods = {};
        const events = this.events = {};
        const beforeSendHook = this.beforeSendHook.bind(this);

        for (let i = 0; i < abi.length; i++) {
            const item = abi[i];

            if (item.type == "function") {
                const contract_name = this.artifact.contractName;
                const name = item.name;
                const address = this.getterInstance.address;
                const version = this.version;

                const optionsLogSetDefault = {
                    type: "SET",
                    name,
                    contract_name,
                    address,
                    version
                };
                const optionsLogGetDefault = {
                    type: "GET",
                    name,
                    contract_name,
                    address,
                    version
                };

                if (item.constant == true) {
                    methods[item.name] = cacheController({
                        version: this.version,
                        name: this.artifact.contractName,
                        method: item.name,
                        address: this.getterInstance.address,
                        funct: this.getterInstance[item.name],
                        typeCache: getCacheType(this.version, this.artifact.contractName, item.name),
                        inputTypes: item.inputs.map(i => i.type),
                        outputTypes: item.outputs.map(i => i.type)
                    }, optionsLogGetDefault);
                } else {
                    methods[item.name] = beforeSendHook(promisifyLogsResult(this.senderInstance[item.name], optionsLogGetDefault));
                }

                methods[item.name].call = promisifyLogsResultWarrantor(this.getterInstance[item.name].call, optionsLogGetDefault);
                methods[item.name].callWithSender = promisifyLogsResult(this.senderInstance[item.name].call, optionsLogGetDefault);
                methods[item.name].sendTransaction = beforeSendHook(promisifyLogsResult(this.senderInstance[item.name].sendTransaction, optionsLogSetDefault));
                methods[item.name].request = this.senderInstance[item.name].request;
                methods[item.name].getData = this.senderInstance[item.name].getData;
                methods[item.name].estimateGas = promisifyLogsResult(this.senderInstance[item.name].estimateGas, optionsLogGetDefault);
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

                        txParams.gasPrice = new BigNumber(await warrantor(this.senderInstance._eth.getGasPrice)()).mul(4);
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
