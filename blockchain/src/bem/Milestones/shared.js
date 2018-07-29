export class MilestoneModel {
    constructor (model) {
        this.name = model.name;
        this.description = model.description;
        this.tranchePercent = model.tranchePercent;
        this.endDate = model.endDate;
        this.voteEndDate = model.voteEndDate;
        this.withdrawalEndDate = model.withdrawalEndDate;
        this.wasCreated = model.wasCreated;
    }
}
