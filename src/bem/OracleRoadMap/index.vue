1<template>
    <div class="RoadMap buefy" v-if="currentToken && roadMapTableData && roadMapTableData.length">
        <h2 v-html="$t('RoadMapTableTitle')"></h2>
        <b-table :data="roadMapTableData" class="table table-striped table-bordered table-responsive-sm"
                 :mobile-cards="false">
            <template slot-scope="props">
                <b-table-column field="index" :label="$t('RoadMapIndex')" centered>
                    {{ props.row.index }}
                </b-table-column>
                <b-table-column field="stage" :label="$t('RoadMapStage')" centered>
                    {{ props.row.name }}
                </b-table-column>
                <b-table-column field="dates" :label="$t('RoadMapDates')" centered :title="props.row.datesFull">
                    {{ props.row.dates }}
                </b-table-column>
                <b-table-column field="refund" :label="$t('RoadMapRefund')" centered :title="props.row.refundFull">
                    {{ props.row.refund }}
                </b-table-column>
                <b-table-column field="refund" :label="$t('RoadMapReceipt')" centered :title="props.row.receiptFull">
                    {{ props.row.receipt }}
                </b-table-column>
                <b-table-column field="refund" :label="$t('RoadMapFinancing')" centered>
                    <b-tag class="is-success py-2">{{ props.row.financing }}%</b-tag>
                </b-table-column>

                <b-table-column field="vote" :label="$t('VoteResultRoadmapTable')" centered>
                    <b-tag v-if="props.row.vote_result() == 1" class="is-danger py-2">{{props.row.vote}}</b-tag>
                    <b-tag v-if="props.row.vote_result() == 2" class="is-success py-2">{{props.row.vote}}</b-tag>
                    <b-tag v-if="props.row.vote_result() == 0" >-/-/-</b-tag>
                </b-table-column>

                <b-table-column field="vote" :label="$t('VoteRoadmapTable')" centered>
                    <button @click="vote_y(props.row.index)" class="button is-success is-small sb1">Yes</button>
                    <button @click="vote_n(props.row.index)" class="button is-danger is-small">No</button>
                </b-table-column>

            </template>
        </b-table>
    </div>
</template>

<style scoped>
    .sb1
    {
        margin-bottom: 10px;
    }

</style>

<script>
    import './default.scss';
    import {createNamespacedHelpers} from "vuex";
    import Web3 from 'web3';
    import moment from "moment";

    const TokensListNS = createNamespacedHelpers("TokensList");

    const web3 = new Web3();

    export default {
        name: 'OracleRoadMap',
        template: '#OracleRoadMapTemplate',
        computed: {
            ...TokensListNS.mapState({
                tokensListMeta: 'meta',
                tokensList: 'list',
                currentToken: 'currentToken'
            }),
            roadMapTableData() {
                if (this.currentToken && this.currentToken.crowdSaleInformation) {
                    const list = this.currentToken.crowdSaleInformation.milestones.map((milestone, index, milestones) => {
                        if(index === 0 && milestone.tranchePercent === 0) return false;
                        return {
                            'index': index,
                            'name': milestone.name,
                            'dates': index === 0
                                ? this.$t('RoadMapDatesFirst', {to: this.dateFormat(milestone.endDate)})
                                : this.$t('RoadMapDatesFromTo', {
                                    from: this.dateFormat(milestones[index - 1].endDate),
                                    to: this.dateFormat(milestone.endDate)
                                }),
                            'datesFull': index === 0
                                ? this.$t('RoadMapDatesFirst', {to: this.fullDateFormat(milestone.endDate)})
                                : this.$t('RoadMapDatesFromTo', {
                                    from: this.fullDateFormat(milestones[index - 1].endDate),
                                    to: this.fullDateFormat(milestone.endDate)
                                }),
                            'refund': index === 0
                                ? "-"
                                : this.$t('RoadMapDatesFromTo', {
                                    from: this.dateFormat(milestone.endDate),
                                    to: this.dateFormat(milestone.withdrawalEndDate)
                                }),
                            'refundFull': index === 0
                                ? "-"
                                : this.$t('RoadMapDatesFromTo', {
                                    from: this.fullDateFormat(milestone.endDate),
                                    to: this.fullDateFormat(milestone.withdrawalEndDate)
                                }),
                            'receipt': index === (milestones.length - 1)
                                ? this.$t('RoadMapDatesLast', {
                                    from: this.dateFormat(milestone.withdrawalEndDate),
                                })
                                : this.$t('RoadMapDatesFromTo', {
                                    from: this.dateFormat(milestone.withdrawalEndDate),
                                    to: this.dateFormat(milestones[index + 1].endDate)
                                }),
                            'receiptFull': index === (milestones.length - 1)
                                ? this.$t('RoadMapDatesLast', {
                                    from: this.fullDateFormat(milestone.withdrawalEndDate),
                                })
                                : this.$t('RoadMapDatesFromTo', {
                                    from: this.fullDateFormat(milestone.withdrawalEndDate),
                                    to: this.fullDateFormat(milestones[index + 1].endDate)
                                }),
                            'financing': milestone.tranchePercent,

                            'vote': milestone.vote_y + '/' + milestone.vote_n + '/' + milestone.vote_all,

                            'vote_result': function()
                                {

                                    console.log('vote_result');
                                    console.log(milestone.vote_y);
                                    console.log(milestone.vote_n);
                                    console.log(milestone.vote_all);

                                    if(milestone.vote_y === undefined ||
                                    milestone.vote_n === undefined ||
                                    milestone.vote_all === undefined)
                                    {
                                        return 0;
                                    }

                                    var v_y = parseInt(milestone.vote_y);
                                    var v_n = parseInt(milestone.vote_n);
                                    var v_all = parseInt(milestone.vote_all);

                                    if(v_y > v_all / 2 | 0)
                                    {
                                        return 2;
                                    }

                                   return 1;

                                },
                        }
                    });
                    return list.filter(Boolean);
                }
            },
        },
        methods: {
            dateFormat(date) {
                return moment(date * 1000).utc().format("DD.MM.YYYY");
            },
            fullDateFormat(date) {
                return moment(date * 1000).utc().format("DD.MM.YYYY HH:mm");
            },
            vote_y(val)
            {
                window.login.send_vote(val, true);
            },
            vote_n(val)
            {
                window.login.send_vote(val, false);
            }
        }
    };

</script>