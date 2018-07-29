export class MilestoneModel {
    constructor (model) {
        this.name = model.name;
        this.description = model.description;
        this.tranchePercents = model.tranchePercents;
        this.endDate = model.endDate;
        this.voteEndDate = model.voteEndDate;
        this.withdrawalEndDate = model.withdrawalEndDate;
    }
}
