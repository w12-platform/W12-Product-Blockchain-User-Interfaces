import { isZeroAddress } from '@/lib/utils';


export class StoredCrowdsale {
    constructor(model) {
        // TODO: model for stage
        this.version = model.version;
        this.tokenAddress = model.tokenAddress;
        this.crowdsaleAddress = model.crowdsaleAddress;
        this.stages = model.stages || null;
        this.endDate = model.endDate || null;
    }

    isNotInitialized() {
        return (!this.crowdsaleAddress || isZeroAddress(this.crowdsaleAddress));
    }
}
