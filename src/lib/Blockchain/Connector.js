import config from '../../config.js';
import { promisify, warrantor } from '../utils.js';
import Web3 from 'web3';
import HttpProvider from 'web3-providers-http';


HttpProvider.prototype.sendAsync = HttpProvider.prototype.send;

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
        this.defaultAccountWatcherId = null;
        this.isWatchingAccount = false;
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
        this.updateAccountWatcher();
        this.inited = true;
    }

    updateAccountWatcher() {
        if (this.isWatchingAccount) clearInterval(this.defaultAccountWatcherId);

        this.defaultAccountWatcherId = setInterval(async () => {
            const address = (await warrantor(this.web3send.eth.getAccounts)())[0];

            this.web3send.eth.defaultAccount = address;
            this.web3get.eth.defaultAccount = address;

        }, 1000);
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
            } catch (e) {
                throw new Error('User denied account access...');
            }
        } else if (typeof window.web3 !== 'undefined') {
            return window.web3.currentProvider;
        } else if (config.currentProvider) {
            return new web3.providers.HttpProvider(config.currentProvider);
        }

        throw new Error('provider is not found');
    }

    async syncProviders() {
        let theSame = false;

        const senderNetId = await warrantor(this.web3send.version.getNetwork.bind(this.web3send.version))();

        if (!this.web3get && !config.providers[senderNetId]) {
            throw new Error(`no matching network with id "${senderNetId}" in the configuration`);
        }

        if (this.web3get) {
            const getterNetId = await warrantor(this.web3get.version.getNetwork.bind(this.web3get.version))();

            theSame = getterNetId != senderNetId;
        }

        if (!theSame) {
            this.web3get = new Web3(new HttpProvider(config.providers[senderNetId]));
        }
    }

    async connect() {
        if (!this.inited) await this.init();

        await this.syncProviders();

        const netId = await warrantor(this.web3send.version.getNetwork.bind(this.web3send.version))();

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
