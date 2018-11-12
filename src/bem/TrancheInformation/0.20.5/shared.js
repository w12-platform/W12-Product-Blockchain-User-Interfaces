export class TrancheInformationModel {
    constructor (model) {
        this.fundBalanceInWei = model.fundBalanceInWei;
        this.fundBalanceInTokens = model.fundBalanceInTokens;
        this.trancheIntervals = model.trancheIntervals;
        this.trancheAmountInWei = model.trancheAmountInWei;
    }
}
