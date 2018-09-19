<template>
    <div class="SaleTable">
        <b-table v-if="saleTableData" :data="saleTableData" class="table table-striped table-bordered table-responsive-sm">
            <template slot-scope="props">
                <b-table-column field="date" label="Даты периода Crowdsale" centered>
                    {{ props.row.date }}
                </b-table-column>
                <b-table-column field="sale" label="Скидка за период Crowdsale" centered>
                    <span class="tag is-danger">-{{ props.row.sale }} %</span>
                </b-table-column>
                <b-table-column v-if="props.row.bonusVolume.length" field="volume" label="Объем покупки W-tokens" centered>
                    <div class="SaleTable__volumeElem" v-for="bonusVolume in props.row.bonusVolume">
                        <span class="tag">{{ bonusVolume[0] }}</span>
                    </div>
                </b-table-column>
                <b-table-column v-if="props.row.bonusVolume.length" field="bonusVolume" label="Бонус за объем покупки" centered>
                    <div class="SaleTable__volumeElem" v-for="bonusVolume in props.row.bonusVolume">
                        <span class="tag is-danger">-{{ bonusVolume[1] }} %</span>
                    </div>
                </b-table-column>
                <b-table-column v-if="props.row.bonusVolume.length" field="bonusVolume" label="Общий % W-tokens, получаемых бесплатно" centered>
                    <div class="SaleTable__volumeElem" v-for="bonusVolume in props.row.bonusVolume">
                        <span class="tag is-danger">-{{ parseFloat(bonusVolume[1]) + parseFloat(props.row.sale) }} %</span>
                    </div>
                </b-table-column>
            </template>
        </b-table>
    </div>
</template>


<script>
    import './default.scss';
    import {createNamespacedHelpers} from "vuex";

    const crowdsdalListStore = createNamespacedHelpers("crowdsdalList");

    export default {
        name: 'SaleTable',
        template: '#SaleTableTemplate',
        components: {},
        data() {
            return {};
        },
        watch: {},
        computed: {
            ...crowdsdalListStore.mapState({
                selected: "selected"
            }),
            saleTableData() {
                const list = this.selected.stages.map(stage => {
                    //console.log(stage);
                    return {
                        'date': stage.endDate,
                        'sale': stage.discount,
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
                return moment(date * 1000).format("DD.MM.YYYY hh:mm")
            }
        },
        async created() {
        }
    };

</script>