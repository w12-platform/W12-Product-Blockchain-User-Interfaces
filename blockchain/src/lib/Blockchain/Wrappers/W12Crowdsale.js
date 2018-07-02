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
            for(let i = 0; i< stagesLength; i++) {
                const stage = await this.methods.stages(i);
                const bonusVolumes = Array.isArray(stage[3])
                    ? stage[3].map((value, index) => [web3.fromWei(value, 'ether').toString(), stage[4][index].toString()])
                    : [];

                const internalStageStructure = {
                    endDate: moment.unix(stage[0].toNumber()).utc().format(DATE_FORMAT),
                    discount: stage[1].toString(),
                    vestingDate: moment.unix(stage[2].toNumber()).utc().format(DATE_FORMAT),
                    bonusVolumes,
                    wasCreated: true
                };

                list.push(internalStageStructure);
            }
        }

        return list;
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

        for(let stage of stages) {
            endDates.push(
                moment(stage.endDate, DATE_FORMAT).utc().unix()
            );
            discounts.push(stage.discount);
            vestings.push(
                moment(stage.vestingDate, DATE_FORMAT).utc().unix()
            );
        }

        return await this.methods.setStages(endDates, discounts, vestings);
    }
}
