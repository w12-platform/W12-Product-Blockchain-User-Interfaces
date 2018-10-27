import { BaseWrapper } from 'src/lib/Blockchain/Wrappers/NoVersion/BaseWrapper.js';
import { web3 } from '@/lib/utils';

export class RatesWrapper extends BaseWrapper {
    async getList() {
        return (await this.methods.getSymbolsList()).map((item) => web3.toUtf8(item));
    }

    async isToken(symbol) {
        return await this.methods.isToken(web3.fromUtf8(symbol));
    }

    async getTokenAddress(symbol) {
        return await this.methods.getTokenAddress(web3.fromUtf8(symbol));
    }

    async get(symbol) {
        return await this.methods.get(web3.fromUtf8(symbol));
    }
}
