import config from '../../config.js';
import { promisify } from '../utils.js';
import Web3 from 'web3';


const web3 = new Web3();
const onLoad = new Promise((resolve, reject) => {
    if (typeof window !== 'undefined') {
        window.addEventListener('load', () => resolve());
    } else {
        reject();
    }
});


export class Connector {
    static get PROVIDER_METAMASK() { return 'metamask'; }

    constructor () {
        this.web3send = null;
        this.web3get = null;
        this.inited = false;
    }

    async init(customProvider) {
        if (this.inited) return;

        const provider = customProvider
            ? customProvider
            : await this.getProvider();

        this.web3send = new Web3(provider);
        this.web3get = null;
        this.networkId = null;
        this.inited = true;
    }

    async getProvider () {
        await onLoad;

        // get metamask provider
        if (window.ethereum) {
            window.web3 = new Web3(ethereum);
            try {
                // Request account access if needed
                await ethereum.enable();
                return window.web3.currentProvider;
            } catch (error) {
                throw new Error('User denied account access...');
            }
        } else if (typeof window.web3 !== 'undefined') {
            return window.web3.currentProvider;
        } else {
            return new web3.providers.HttpProvider(config.provider);
        }

        throw new Error('provider is not found');
    }

    async syncProviders() {
        let theSame = false;

        const senderNetId = await promisify(this.web3send.version.getNetwork.bind(this.web3send.version))();

        if (!this.web3get && !config.providers[senderNetId]) {
            throw new Error(`no matching network with id "${senderNetId}" in the configuration`);
        }

        if (!this.web3get) {
            this.web3get = new Web3(new web3.providers.HttpProvider(config.providers[senderNetId]));
            theSame = true;
        }

        if (!theSame) {
            const getterNetId = await promisify(this.web3get.version.getNetwork.bind(this.web3get.version))();

            if (getterNetId != senderNetId) {
                throw new Error('net id of the sender is not match net id of the getter');
            }
        }
    }

    async connect() {
        if (!this.inited) await this.init();

        await this.syncProviders();

        const netId = await promisify(this.web3send.version.getNetwork.bind(this.web3send.version))();

        this.networkId = netId;

        return {
            web3send: this.web3send,
            web3get: this.web3get,
            // TODO: remove in the future
            // backward compatibility
            web3: this.web3send,
            netId
        };
    }

    async setProvider(provider) {
        if (this.inited) {
            this.web3send.setProvider(provider);
            this.web3get = null;
        }
    }

    // TODO: remove in the future
    // backward compatibility
    isProvider(id) {
        if (!this.inited) return false;

        switch (id) {
            case Connector.PROVIDER_METAMASK:
                return (
                    this.web3send.currentProvider.isMetaMask
                );
            default:
                return false;
        }
    }

    isGetterProvider (id) {
        if (!this.inited) return false;

        switch (id) {
            case Connector.PROVIDER_METAMASK:
                return (
                    this.web3get.currentProvider.isMetaMask
                );
            default:
                return false;
        }
    }

    isSenderProvider (id) {
        if (!this.inited) return false;

        switch (id) {
            case Connector.PROVIDER_METAMASK:
                return (
                    this.web3send.currentProvider.isMetaMask
                );
            default:
                return false;
        }
    }
}
