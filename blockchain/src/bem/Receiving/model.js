export class ReceivingModel {
    constructor (model) {
        this.symbol = model.symbol;
        this.symbolW = model.symbolW;
        this.amountUnSold = model.amountUnSold;
        this.amountRemainingInTokenChanger = model.amountRemainingInTokenChanger;
        this.amountRemainingAfterTheExchange = model.amountRemainingAfterTheExchange;
        this.amountTotalAvailable = model.amountTotalAvailable;
    }
}
