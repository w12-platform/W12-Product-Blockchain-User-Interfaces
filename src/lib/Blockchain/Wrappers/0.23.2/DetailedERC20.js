import { BaseWrapper } from 'src/lib/Blockchain/Wrappers/NoVersion/BaseWrapper.js';
import {ErrorMessageSubstitution} from 'lib/utils';

export class DetailedERC20Wrapper extends BaseWrapper {
    async getDescription() {
        const name = await this.methods.name();
        const symbol = await this.methods.symbol();
        const decimals = await this.methods.decimals();
        const totalSupply = await this.methods.totalSupply();

        return {
            name,
            symbol,
            decimals,
            totalSupply
        };
    }

    async isCurrentAddressСompatibleWithToken() {
        try {
            await this.getDescription();
            return true;
        } catch (e) {
            ErrorMessageSubstitution(e);
            console.log(e);
            return false;
        }
    }
}