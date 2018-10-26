import { BaseWrapper } from 'src/lib/Blockchain/Wrappers/NoVersion/BaseWrapper.js';
import { web3 } from '@/lib/utils';

export class RatesWrapper extends BaseWrapper {
    async getList() {
        return (await this.methods.getSymbolsList()).map((item) => web3.toUtf8(item));
    }
}
