import { promisify } from '../../utils.js';
import { BaseWrapper } from './BaseWrapper.js';

const moment = window.moment;
const DATE_FORMAT = 'YYYY-MM-DD';
const web3 = new Web3();

export class W12CrowdsaleWrapper extends BaseWrapper {
    async getStagesList() {
        const stagesLength = (await this.methods.stagesLength()).toNumber();
        const list = [];

        if (stagesLength > 0) {
            for(let i = stagesLength-1; i>=0; i--) {
                const stage = await this.methods.stages(i);
                const bonusVolumes = await this.getBonusVolumesAtStage(i);

                const internalStageStructure = {
                    startDate: null,
                    endDate: stage[2].toNumber(),
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
}
