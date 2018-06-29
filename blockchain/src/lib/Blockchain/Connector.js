import config from '../../config.js';
import { promisify } from '../utils.js';


const Web3 = window.Web3;
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
        this.web3 = null;
        this.inited = false;
    }

    async init(customProvider) {
        if (this.inited) return;

        const provider = customProvider
            ? customProvider
            : await this.getProvider();

        this.web3 = new Web3(provider);
        this.networkId = null;
        this.inited = true;
    }

    async getProvider () {
        await onLoad;

        // get metamask provider
        if (typeof window.web3 !== 'undefined') {
            return window.web3.currentProvider;
        } else if (config.useInfuraAsFallbackNet) {
            return new web3.providers.HttpProvider(`${config.infura.net}${config.infura.key}`);
        }

        throw new Error('provider is not found');
    }

    async connect() {
        const getNetwork = promisify(this.web3.version.getNetwork.bind(this.web3.version));
        const netId = await getNetwork();

        this.networkId = netId;

        return { web3: this.web3, netId };
    }

    setProvider(provider) {
        if (this.inited) {
            this.web3.setProvider(provider);
        }
    }

    isProvider(id) {
        if (!this.inited) return false;

        switch (id) {
            case Connector.PROVIDER_METAMASK:
                return (
                    this.web3.currentProvider.isMetaMask
                );
            default:
                return false;
        }
    }
}
