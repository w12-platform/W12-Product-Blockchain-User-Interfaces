<template>
    <div class="SaleTable buefy">
        <b-table v-if="saleTableData" :data="saleTableData" class="table table-striped table-bordered table-responsive-sm" :mobile-cards="false">
            <template slot-scope="props">

                <b-table-column field="date" label="Crowdsale stage (UTC)" centered :title="props.row.fullDate">
                    {{ props.row.date }}
                </b-table-column>
                <b-table-column field="sale" label="Stage discount" centered>
                    <span v-if="props.row.sale !== '0'" class="tag is-success">{{ props.row.sale }} %</span>
                </b-table-column>

                <b-table-column v-if="props.row.bonusVolume.length" field="volume" label="ETH amount" centered>
                    <div class="SaleTable__volumeElem" v-for="bonusVolume in props.row.bonusVolume.slice().reverse()">
                        <span>{{ bonusVolume[0] }}</span>
                    </div>
                </b-table-column>
                <b-table-column v-if="props.row.bonusVolume.length" field="bonusVolume" label="Volume bonus" centered>
                    <div class="SaleTable__volumeElem" v-for="bonusVolume in props.row.bonusVolume.slice().reverse()">
                        <span>{{ bonusVolume[1] }} %</span>
                    </div>
                </b-table-column>

                <!--<b-table-column v-if="props.row.bonusVolume.length" field="bonusVolume" label="Token amount with discount" centered>-->
                    <!--<div class="SaleTable__volumeElem" v-for="bonusVolume in props.row.bonusVolume.slice().reverse()">-->
                        <!--<span>{{ (bonusVolume[0] * (1 / props.row.price)) / (1 - (props.row.sale/100)) }}</span>-->
                    <!--</div>-->
                <!--</b-table-column>-->

                <b-table-column v-if="props.row.bonusVolume.length" field="bonusVolume" label="Token amount with volume bonus" centered>
                    <div class="SaleTable__volumeElem" v-for="bonusVolume in props.row.bonusVolume.slice().reverse()">
                        <span>{{
                            ((bonusVolume[0] * (1 / props.row.price)) / (1 - (props.row.sale/100)) +
                            (bonusVolume[0] * (1 / props.row.price)) / (1 - (props.row.sale/100)) * (bonusVolume[1]/100))
                            .toFixed(2)
                            }}</span>
                    </div>
                </b-table-column>
                <b-table-column v-if="props.row.bonusVolume.length" field="bonusVolume" label="W-tokens gain, total (%)" centered>
                    <div class="SaleTable__volumeElem" v-for="bonusVolume in props.row.bonusVolume.slice().reverse()">
                        <span>{{
                            ((((bonusVolume[0] * (1 / props.row.price)) / (1 - (props.row.sale/100))
                            + (bonusVolume[0] * (1 / props.row.price)) / (1 - (props.row.sale/100)) * (bonusVolume[1]/100))
                            / (bonusVolume[0] * (1 / props.row.price)) - 1)
                            *100).toFixed(2)
                            }} %</span>
                    </div>
                </b-table-column>

            </template>
        </b-table>
    </div>
</template>


<script>
    import './default.scss';
    import {createNamespacedHelpers} from "vuex";
    import moment from 'moment';

    const crowdSaleListStore = createNamespacedHelpers("crowdSaleList");

    export default {
        name: 'SaleTable',
        template: '#SaleTableTemplate',
        components: {},
        data() {
            return {};
        },
        watch: {},
        computed: {
            ...crowdSaleListStore.mapState({
                selected: "selected"
            }),
            saleTableData() {
                const list = this.selected.stages.map(stage => {

                    // stage.bonusVolumes.map((bonus)=>{
                    //     console.log(bonus);
                    //     return 1;
                    // });

                    return {
                        'date': this.dateFormat(stage.startDate) + " - " + this.dateFormat(stage.endDate),
                        'fullDate': this.fullDateFormat(stage.startDate) + " - " + this.fullDateFormat(stage.endDate),
                        'sale': stage.discount,
                        'price': this.selected.tokenPrice,
                        'bonusVolume': stage.bonusVolumes
                    }
                });
                return list.filter(Boolean);
            },
            sumSale(x, y){
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
