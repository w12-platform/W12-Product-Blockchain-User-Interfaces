<template>
    <div class="RoadMap buefy" v-if="currentToken && roadMapTableData && roadMapTableData.length">
        <h2 v-html="$t('RoadMapTitle')"></h2>
        <b-table :data="roadMapTableData" class="table table-striped table-bordered table-responsive-sm"
                 :mobile-cards="false">
            <template slot-scope="props">
                <b-table-column field="stage" :label="$t('RoadMapStage')" centered>
                    {{ props.row.name }}
                </b-table-column>
                <b-table-column field="dates" :label="$t('RoadMapDates')" centered :title="props.row.datesFull">
                    {{ props.row.dates }}
                </b-table-column>
                <b-table-column field="refund" :label="$t('RoadMapRefund')" centered>
                    {{ props.row.refund }}
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
                        return {
                            'name': milestone.name,
                            'dates': index === 0
                                ? this.dateFormat(this.currentToken.crowdSaleInformation.endDate) + " - " + this.dateFormat(milestone.voteEndDate)
                                : this.dateFormat(milestone.endDate) + " - " + this.dateFormat(milestone.voteEndDate),
                            'datesFull': index === 0
                                ? this.fullDateFormat(this.currentToken.crowdSaleInformation.endDate) + " - " + this.fullDateFormat(milestone.voteEndDate)
                                : this.fullDateFormat(milestone.endDate) + " - " + this.fullDateFormat(milestone.voteEndDate),
                            'refund': index === 0
                                ? "-"
                                : this.fullDateFormat(milestone.voteEndDate) + " - " + ((index === milestones.length - 1)
                                    ? "..." : this.fullDateFormat(milestone.withdrawalEndDate)),
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
