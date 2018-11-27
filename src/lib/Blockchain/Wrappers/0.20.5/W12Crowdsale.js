import { countStringBytes, decodeStringFromBytes, encodeStringToBytes, promisify } from 'lib/utils.js';
import { BaseWrapper } from 'src/lib/Blockchain/Wrappers/NoVersion/BaseWrapper.js';
import Web3 from 'web3';

const moment = window.moment;
const DATE_FORMAT = 'YYYY-MM-DD';
const web3 = new Web3();
const BigNumber = web3.BigNumber;

export class W12CrowdsaleWrapper extends BaseWrapper {
    async getStagesList() {
        const stagesLength = (await this.methods.stagesLength()).toNumber();
        const list = [];

        if (stagesLength > 0) {
            for(let i = 0; i<stagesLength; i++) {
                const stage = await this.methods.stages(i);
                const bonusVolumes = await this.getBonusVolumesAtStage(i);

                const internalStageStructure = {
                    startDate: stage[0].toNumber(),
                    endDate: stage[1].toNumber(),
                    discount: stage[2].toNumber() / 100,
                    vestingDate: stage[3].toNumber(),
                    bonusVolumes,
                    wasCreated: true
                };

                list.push(internalStageStructure);
            }
        }

        return list;
    }

    async getBonusVolumesAtStage(stageIndex) {
        const result = [];

        const boundaries = await this.methods.getStageVolumeBoundaries(stageIndex);
        const bonuses = await this.methods.getStageVolumeBonuses(stageIndex);

        if (
            Array.isArray(boundaries)
                && Array.isArray(bonuses)
                    && boundaries.length > 0
                        && boundaries.length === bonuses.length) {
            for (let index in boundaries) {
                const boundary = new BigNumber(web3.fromWei(boundaries[index], 'ether').toString()).toNumber();
                const bonus = bonuses[index].toString();

                result.push([boundary, bonus]);
            }
        }

        return result;
    }

    async setBonusVolumes(index, list) {
        list = Array.from(list);
        list.sort((a, b) => new BigNumber(a[0]).minus(b[0]).toNumber());

        const volumeBoundaries = [];
        const volumeBonuses = [];

        for (let item of list) {
            volumeBoundaries.push(
                web3.toWei(item[0], 'ether').toString()
            );
            volumeBonuses.push(item[1]);
        }

        return await this.methods.setStageVolumeBonuses(index, volumeBoundaries, volumeBonuses);
    }

    async setStages(stages) {
        const dates = [];
        const discounts = [];
        const vestings = [];
        const format = (date) => moment(date).isValid() ? undefined : 'YYYY-MM-DD';

        for(let stage of stages) {
            dates.push(
                [moment(stage.startDate, format(stage.endDate)).utc().unix(), moment(stage.endDate, format(stage.endDate)).utc().unix()]
            );
            discounts.push(Math.floor(stage.discount * 100));
            vestings.push(
                moment(stage.vestingDate, format(stage.endDate)).utc().unix()
            );
        }

        return await this.methods.setStages(dates, discounts, vestings);
    }

    async setMilestones(milestones) {
        const dates = [];
        const tranchePercents = [];
        const offsets = [];
        const namesAndDescriptions = [];

        for (let milestone of milestones) {
            dates.push(
                milestone.endDate,
                milestone.endDate+1, //voteEndDate remove vote
                milestone.withdrawalEndDate
            );
            tranchePercents.push(Math.floor(milestone.tranchePercent * 100));
            offsets.push(
                countStringBytes(milestone.name),
                countStringBytes(milestone.description),
            );
            namesAndDescriptions.push(
                encodeStringToBytes(milestone.name),
                encodeStringToBytes(milestone.description)
            )
        }

        const a = namesAndDescriptions.reduce((output, el) => output + el.slice(2), '0x');

        return await this.methods.setMilestones(
            dates,
            tranchePercents,
            offsets,
            a
        );
    }

    async getMilestones() {
        const milestonesLenght = (await this.methods.milestonesLength()).toNumber();
        const list = [];

        if (milestonesLenght > 0) {
            for (let i = 0; i < milestonesLenght; i++) {
                const milestone = await this.methods.milestones(i);

                const data = {
                    name: decodeStringFromBytes(milestone[4]),
                    description: decodeStringFromBytes(milestone[5]),
                    tranchePercent: milestone[1].toString() / 100,
                    endDate: milestone[0].toNumber(),
                    voteEndDate:  milestone[2].toNumber(),
                    withdrawalEndDate: milestone[3].toNumber(),
                    wasCreated: true
                };

                list.push(data);
            }
        }

        return list;
    }
}
