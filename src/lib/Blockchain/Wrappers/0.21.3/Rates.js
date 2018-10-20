import { BaseWrapper } from 'src/lib/Blockchain/Wrappers/NoVersion/BaseWrapper.js';
import {decodeStringFromBytes} from "src/lib/utils";

export class RatesWrapper extends BaseWrapper {
    async getList() {
        return (await this.methods.getSymbolsList()).map((item) => decodeStringFromBytes(item));
    }
}