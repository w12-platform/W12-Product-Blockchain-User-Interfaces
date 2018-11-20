<template>
    <div class="RoadMap buefy" v-if="currentToken && roadMapTableData && roadMapTableData.length">
        <h2 v-html="$t('RoadMapTitle')"></h2>
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
            </template>
        </b-table>
    </div>
</template>


<script>
    import './default.scss';
    import {createNamespacedHelpers} from "vuex";
    import Web3 from 'web3';
    import moment from "moment";

    const TokensListNS = createNamespacedHelpers("TokensList");

    const web3 = new Web3();

    export default {
        name: 'RoadMap',
        template: '#RoadMapTemplate',
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
            }
        }
    };

</script>