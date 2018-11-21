import { countStringBytes, decodeStringFromBytes, encodeStringToBytes, promisify } from 'lib/utils.js';
import { BaseWrapper } from 'src/lib/Blockchain/Wrappers/NoVersion/BaseWrapper.js';
import {toWeiDecimals} from "../../../utils";
import Web3 from 'web3';


const moment = window.moment;
const web3 = new Web3();
const BigNumber = web3.BigNumber;

export class W12CrowdsaleWrapper extends BaseWrapper {
    encodeMilestoneParameters(name, description, tranchePercent, endDate, voteEndDate, withdrawalWindow) {
        const result = {
            dates: [
                endDate, voteEndDate, withdrawalWindow
            ],
            tranchePercent: tranchePercent * 100,
            offsets: [
                countStringBytes(name),
                countStringBytes(description)
            ],
            namesAndDescriptions: null,
            descriptionHex: encodeStringToBytes(description),
            nameHex: encodeStringToBytes(name)
        };

        result.namesAndDescriptions = `${result.nameHex}${result.descriptionHex.slice(2)}`;

        return result;
    }

    packSetupCrowdsaleParameters(stages, milestones) {
        const [pack1, pack2] = stages.reduce((result, stage, idx) => {

            const pack1 = [
                moment(stage.startDate).unix(),
                moment(stage.endDate).unix(),
                Math.floor((stage.discount?stage.discount:0) * 100),
                moment(stage.vestingDate).unix()
            ];

            if (stage.bonusVolumes.length === 0) {
                pack1.push(0, 0);
            } else {
                let volumeBoundaries = [];
                let bonusVolumes = [];

                const list = Array.from(stage.bonusVolumes);
                list.sort((a, b) => new BigNumber(a[0]).minus(b[0]).toNumber());

                list.forEach((bonus)=>{
                    volumeBoundaries.push(toWeiDecimals(bonus[0], 18));
                    bonusVolumes.push(Math.floor(bonus[1] * 100));
                });

                const lastOffset = result[1].length;

                pack1.push(lastOffset, lastOffset + bonusVolumes.length * 2);
                result[1].push(...bonusVolumes.reduce((result, v, idx) => (result.push(volumeBoundaries[idx], v), result), []));
            }

            result[0].push(pack1);
            return result;
        }, [[], []]);
        const [pack3, pack4, pack5] = milestones
            .map(m =>
                this.encodeMilestoneParameters(
                    m.name,
                    m.description,
                    m.tranchePercent,
                    m.endDate,
                    m.endDate + 1,
                    m.withdrawalEndDate
                )
            )
            .reduce((result, m, idx) => {
                result[0].push([...m.dates, m.tranchePercent]);
                result[1].push(...m.offsets);
                result[2] += m.namesAndDescriptions.slice(2);

                return result;
            }, [[], [], '0x']);
        return [pack1, pack2, pack3, pack4, pack5];
    }

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

        const stages = await this.methods.getStage(stageIndex);
        const boundaries = stages[4];
        const bonuses = stages[5];

        if (
            Array.isArray(boundaries)
                && Array.isArray(bonuses)
                    && boundaries.length > 0
                        && boundaries.length === bonuses.length) {
            for (let index in boundaries) {
                const boundary = new BigNumber(web3.fromWei(boundaries[index], 'ether').toString()).toNumber();
                const bonus = Math.floor(bonuses[index] / 100).toString();

                result.push([boundary, bonus]);
            }
        }

        return result;
    }

    async setup(stages, milestones){
        return await this.methods.setup(...this.packSetupCrowdsaleParameters(stages, milestones));
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
