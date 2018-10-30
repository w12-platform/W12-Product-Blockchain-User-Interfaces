export class RefundInformationModel {
    constructor (model) {
        this.tokenSymbol = model.tokenSymbol;
        this.tokenDecimals = model.tokenDecimals;
        this.freezeTokensVolume = model.freezeTokensVolume;
        this.refundTokensVolume = model.refundTokensVolume;
        this.refundAmountPerToken = model.refundAmountPerToken;
        this.tokenPrice = model.tokenPrice;
        this.fundTokensBalance = model.fundTokensBalance;
        this.fundBalance = model.fundBalance;
        this.totalRefundPercent = model.totalRefundPercent;
        this.currentWalletBalanceInTokens = model.currentWalletBalanceInTokens;
        this.currentWalletBalanceInRefundAmount = model.currentWalletBalanceInRefundAmount;
        this.currentMilestoneNumber = model.currentMilestoneNumber;
        this.isRefundActive = model.isRefundActive;
        this.refundWindow = model.refundWindow;
    }
}
