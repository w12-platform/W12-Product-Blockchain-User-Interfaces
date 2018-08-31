<template>
    <div class="TrancheInformation buefy" v-if="trancheInformationData">
        <h2>{{ $t('trancheInformation') }}</h2>

        <table class="table table-striped table-bordered table-hover table-responsive-sm">
            <tbody>
            <tr>
                <td>{{ $t('trancheInformationFundBalance') }}</td>
                <td>{{ trancheInformationData.fundBalanceInWei | weiToEth }} ETH</td>
            </tr>
            <tr>
                <td>{{ $t('trancheInformationDateNextTranche') }}</td>
                <td>{{ nextTrancheDate | formatDate }}</td>
            </tr>
            <tr>
                <td>{{ $t('trancheInformationFundsMoment') }}</td>
                <td>{{ trancheInformationData.trancheAmountInWei | weiToEth }} ETH</td>
            </tr>
            </tbody>
        </table>

        <button class="btn btn-primary py-2 my-2" :disabled="disable" @click="tryTranche">{{
            $t('trancheInformationReceive') }}
        </button>
    </div>
</template>
<script>
    import './default.scss';
    import {TrancheInformationModel} from 'bem/TrancheInformation/shared.js';
    import moment from 'moment';
    import {createNamespacedHelpers} from "vuex";
    import Connector from "lib/Blockchain/DefaultConnector";

    const ProjectNS = createNamespacedHelpers("Project");
    const LedgerNS = createNamespacedHelpers("Ledger");

    const web3 = new Web3();
    const BigNumber = web3.BigNumber;

    export default {
        name: 'TrancheInformation',
        filters: {
            weiToEth(value) {
                return web3.fromWei(value, 'ether');
            },
            formatDate(value) {
                return value ? moment.unix(value).format('DD.MM.YYYY[ г. ]hh:mm') : '-';
            }
        },
        computed: {
            ...ProjectNS.mapState({
                currentProject: "currentProject",
            }),

            disable(){
                return !(new BigNumber(this.currentProject.fundData.trancheAmount).gt(0));
            },

            nextTrancheDate() {
                const now = moment().unix();
                const found = this.trancheInformationData.trancheIntervals
                    .find(item => item[0] >= now);

                return found ? found[0] : null;
            },

            trancheInformationData() {
                if (this.currentProject && this.currentProject.fundData && this.currentProject.fundData.address) {
                    const trancheIntervals = this.currentProject.crowdSaleInformation.tokenCrowdSaleMilestones
                        .reduce((out, item, idx, origin) => {
                            if (out.length === 0) {
                                out.push([item.voteEndDate])
                            } else if (idx + 1 === origin.length) {
                                out[out.length - 1].push(item.endDate);
                                out.push([item.voteEndDate, Infinity]);
                            } else {
                                out[out.length - 1].push(item.endDate);
                                out.push([item.voteEndDate]);
                            }

                            return out;
                        }, []);

                    return new TrancheInformationModel({
                        fundBalanceInWei: this.currentProject.fundData.balanceWei,
                        fundBalanceInTokens: '0',
                        trancheIntervals,
                        trancheAmountInWei: this.currentProject.fundData.trancheAmount
                    });
                }
            },
        },
        methods: {
            ...LedgerNS.mapActions({
                ledgerFetch: "fetch"
            }),

            async tryTranche() {
                try {
                    const fundAddress = this.currentProject.fundData.address;
                    const {W12FundFactory} = await this.ledgerFetch();
                    const {web3} = await Connector.connect();
                    const W12Fund = W12FundFactory.at(fundAddress);
                    const tx = await W12Fund.methods.tranche();
                    await waitTransactionReceipt(tx, web3);
                } catch (e) {
                    this.error = e.message;
                }
             },
        }
    };
</script>
