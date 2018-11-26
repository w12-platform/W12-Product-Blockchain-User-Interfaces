import { StoredCrowdsale } from '@/lib/models/StoredCrowdsale';
import { WhiteistedToken } from '@/lib/models/WhiteistedToken';


export class StoredToken {
    constructor(model) {
        this.listedToken = new WhiteistedToken(model.listedToken);
        this.crowdsales = [];

        if (Array.isArray(model.crowdsales)) {
            this.setCrowdsales(model.crowdsales);
        }
    }

    get version() {
        return this.listedToken ? this.listedToken.version : null;
    }

    get tokenAddress() {
        return this.listedToken ? this.listedToken.tokenAddress : null;
    }

    setCrowdsales(crowdsales) {
        this.crowdsales = crowdsales.map(c => new StoredCrowdsale(c));
    }
}
