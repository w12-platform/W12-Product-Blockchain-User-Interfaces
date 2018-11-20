<template>
    <div class="SaleTable buefy" v-if="currentToken && saleTableData">
        <h2>{{ $t('InvestorDashboardDiscounts') }}</h2>
        <b-table :data="saleTableData" class="table table-striped table-bordered table-responsive-sm"
                 :mobile-cards="false">
            <template slot-scope="props">

                <b-table-column field="date" :label="$t('InvestorDashboardDiscountsStages')" centered :title="props.row.fullDate">
                    {{ props.row.date }}
                </b-table-column>
                <b-table-column field="sale" :label="$t('InvestorDashboardDiscountsStagePercent')" centered>
                    <span v-if="props.row.sale !== '0'" class="tag is-success">{{ props.row.sale }} %</span>
                </b-table-column>

                <b-table-column :visible="columnsVisible" field="volume" :label="$t('InvestorDashboardDiscountsEthAmount')" centered>
                    <div class="SaleTable__volumeElem" v-for="bonusVolume in props.row.bonusVolume.slice().reverse()">
                        <span>{{ bonusVolume[0] }}</span>
                    </div>
                </b-table-column>
                <b-table-column :visible="columnsVisible" field="bonusVolume" :label="$t('InvestorDashboardDiscountsVolumeBonus')" centered>
                    <div class="SaleTable__volumeElem" v-for="bonusVolume in props.row.bonusVolume.slice().reverse()">
                        <span>{{ bonusVolume[1] }} %</span>
                    </div>
                </b-table-column>

                <!--<b-table-column :visible="columnsVisible" field="bonusVolume" label="Token amount with discount" centered>-->
                <!--<div class="SaleTable__volumeElem" v-for="bonusVolume in props.row.bonusVolume.slice().reverse()">-->
                <!--<span>{{ (bonusVolume[0] * (1 / props.row.price)) / (1 - (props.row.sale/100)) }}</span>-->
                <!--</div>-->
                <!--</b-table-column>-->

                <!--<b-table-column :visible="columnsVisible" field="bonusVolume"-->
                                <!--:label="$t('InvestorDashboardDiscountsTokenAmountVolumeBonus')" centered>-->
                    <!--<div class="SaleTable__volumeElem" v-for="bonusVolume in props.row.bonusVolume.slice().reverse()">-->
                        <!--<span>{{-->
                            <!--((bonusVolume[0] * (1 / props.row.price)) / (1 - (props.row.sale/100)) +-->
                            <!--(bonusVolume[0] * (1 / props.row.price)) / (1 - (props.row.sale/100)) * (bonusVolume[1]/100))-->
                            <!--.toFixed(2)-->
                            <!--}}</span>-->
                    <!--</div>-->
                <!--</b-table-column>-->
                <!--<b-table-column :visible="columnsVisible" field="bonusVolume" :label="$t('InvestorDashboardDiscountsGainTotalPercent')"-->
                                <!--centered>-->
                    <!--<div class="SaleTable__volumeElem" v-for="bonusVolume in props.row.bonusVolume.slice().reverse()">-->
                        <!--<span>{{-->
                            <!--((((bonusVolume[0] * (1 / props.row.price)) / (1 - (props.row.sale/100))-->
                            <!--+ (bonusVolume[0] * (1 / props.row.price)) / (1 - (props.row.sale/100)) * (bonusVolume[1]/100))-->
                            <!--/ (bonusVolume[0] * (1 / props.row.price)) - 1)-->
                            <!--*100).toFixed(2)-->
                            <!--}} %</span>-->
                    <!--</div>-->
                <!--</b-table-column>-->
                <b-table-column field="vesting" :label="$t('InvestorDashboardDiscountsStagesDefrosting')" centered :title="props.row.vestingFull">
                    <span v-if="props.row.vesting">{{ props.row.vesting }}</span>
                    <span v-else v-html="$t('InvestorDashboardDiscountsStagesDefrostingNot')"></span>
                </b-table-column>
            </template>
        </b-table>
    </div>
</template>


<script>
    import './default.scss';
    import {createNamespacedHelpers} from "vuex";
    import Web3 from 'web3';

    const TokensListNS = createNamespacedHelpers("TokensList");

    const moment = window.moment;
    const web3 = new Web3();

    export default {
        name: 'SaleTable',
        template: '#SaleTableTemplate',
        components: {},
        watch: {},
        computed: {
            ...TokensListNS.mapState({
                tokensListMeta: 'meta',
                tokensList: 'list',
                currentToken: 'currentToken'
            }),
            saleTableData() {
                if (this.currentToken && this.currentToken.crowdSaleInformation) {
                    const list = this.currentToken.crowdSaleInformation.stages.map(stage => {
                        return {
                            'date': this.dateFormat(stage.startDate) + " - " + this.dateFormat(stage.endDate),
                            'fullDate': this.fullDateFormat(stage.startDate) + " - " + this.fullDateFormat(stage.endDate),
                            'vesting': stage.vestingDate !== 0 ? this.dateFormat(stage.vestingDate) : null,
                            'vestingFull': stage.vestingDate !== 0 ? this.fullDateFormat(stage.vestingDate) : null,
                            'sale': stage.discount,
                            'price': this.currentToken.crowdSaleInformation.tokenPrice,
                            'bonusVolume': stage.bonusVolumes
                        }
                    });
                    return list.filter(Boolean);
                }
            },
            columnsVisible() {
                return this.currentToken && this.currentToken.crowdSaleInformation
                    ? Boolean(this.currentToken.crowdSaleInformation.stages.filter(
                        (stage) => stage.bonusVolumes.length).length)
                    : true;
            },
            sumSale(x, y) {
                return (x) + parseFloat(y);
            }
        },
        methods: {
            dateFormat(date) {
                return moment(date * 1000).utc().format("DD.MM.YYYY");
            },
            fullDateFormat(date) {
                return moment(date * 1000).utc().format("DD.MM.YYYY HH:mm");
            }
        },
        async created() {
        }
    };

</script>
