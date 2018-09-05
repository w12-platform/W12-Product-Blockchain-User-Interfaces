import { countStringBytes, decodeStringFromBytes, encodeStringToBytes, promisify } from '../../utils.js';
import { BaseWrapper } from './BaseWrapper.js';

const moment = window.moment;
const DATE_FORMAT = 'YYYY-MM-DD';
const web3 = new Web3();

export class W12CrowdsaleWrapper extends BaseWrapper {
    async getStagesList() {
        const stagesLength = (await this.methods.stagesLength()).toNumber();
        const list = [];
        const startDate = (await this.methods.startDate()).toNumber();

        if (stagesLength > 0) {
            for(let i = stagesLength-1; i>=0; i--) {
                const stage = await this.methods.stages(i);
                const stagePrev = (i === stagesLength-1) ? false : await this.methods.stages(i+1);
                const bonusVolumes = await this.getBonusVolumesAtStage(i);
                const startDateStage = stagePrev ? stagePrev[0].toNumber()+1 : startDate;

                const internalStageStructure = {
                    startDate: startDateStage,
                    endDate: stage[0].toNumber(),
                    discount: stage[1].toString(),
                    vestingDate: stage[2].toNumber(),
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
                const boundary = web3.fromWei(boundaries[index], 'ether').toNumber();
                const bonus = bonuses[index].toString();

                result.push([boundary, bonus]);
            }
        }

        return result;
    }

    async setBonusVolumes(index, list) {
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
        const endDates = [];
        const discounts = [];
        const vestings = [];
        const format = (date) => moment(date).isValid() ? undefined : 'YYYY-MM-DD';

        for(let stage of stages) {
            endDates.push(
                moment(stage.endDate, format(stage.endDate)).utc().unix()
            );
            discounts.push(stage.discount);
            vestings.push(
                moment(stage.vestingDate, format(stage.endDate)).utc().unix()
            );
        }

        return await this.methods.setStages(endDates, discounts, vestings);
    }

    async setMilestones(milestones) {
        const dates = [];
        const tranchePercents = [];
        const offsets = [];
        const namesAndDescriptions = [];

        let lastOffset = 0;

        for (let milestone of milestones) {
            dates.push(
                milestone.endDate,
                milestone.voteEndDate,
                milestone.withdrawalEndDate
            );
            tranchePercents.push(milestone.tranchePercent);
            offsets.push(
                lastOffset += countStringBytes(milestone.name),
                lastOffset += countStringBytes(milestone.description),
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
                    tranchePercent: milestone[1].toString(),
                    endDate: milestone[0].toNumber(),
                    voteEndDate: milestone[2].toNumber(),
                    withdrawalEndDate: milestone[3].toNumber(),
                    wasCreated: true
                };

                list.push(data);
            }
        }

        return list;
    }
}
