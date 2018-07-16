<template>
    <div class="CrowdsdalList">
        <b-table
                v-if="tableData"
                paginated
                per-page="5"
                :data="tableData"
                :selected.sync="selected"
                @select="selectTableRow"
        >
            <template slot-scope="props">

                <b-table-column field="symbol" label="Symbol" width="40" centered>
                    {{ props.row.symbol }}
                </b-table-column>

                <b-table-column field="name" label="Name" centered>
                    <a :href="'https://etherscan.io/token/' + props.row.tokenAddress" target="_blank">{{ props.row.name
                        }}</a>
                </b-table-column>

                <b-table-column field="symbolW" label="W-Symbol" width="80" centered>
                    {{ props.row.symbolW }}
                </b-table-column>

                <b-table-column field="nameW" label="W-Name" centered>
                    <a :href="'https://etherscan.io/token/' + props.row.WTokenAddress" target="_blank">{{
                        props.row.nameW }}</a>
                </b-table-column>

                <b-table-column field="status" label="Status" centered>
                    <span v-if="props.row.status" class="tag is-success">Active</span>
                    <span v-else class="tag is-white">Inactive</span>
                </b-table-column>

                <b-table-column field="startDate" label="Start Date (UTC)" centered>
                    <span class="tag is-success">
                        {{ props.row.startDate }}
                    </span>
                </b-table-column>

                <b-table-column field="endDate" label="End Date (UTC)" centered>
                    <span class="tag is-danger" v-if="props.row.endDate">
                        {{ props.row.endDate }}
                    </span>
                    <span v-else>---</span>
                </b-table-column>

                <b-table-column field="total" label="Total" centered>
                    {{ props.row.total }}
                </b-table-column>

                <b-table-column field="sold" label="Sold" centered>
                    {{ props.row.sold }}
                </b-table-column>

                <b-table-column field="soldPercent" label="Sold %" centered>
                    {{ props.row.soldPercent }}
                </b-table-column>

                <b-table-column field="onSale" label="On sale" centered>
                    {{ props.row.onSale }}
                </b-table-column>

                <b-table-column field="price" label="Price" centered>
                    {{ props.row.price }} <span class="CrowdsdalList__eth">ETH</span>
                </b-table-column>

                <b-table-column field="sale" label="Sale" centered>
                    <span v-if="props.row.status" class="tag is-danger">-{{ props.row.sale }}%</span>
                    <span v-else>---</span>
                </b-table-column>

                <b-table-column field="bonus" label="Bonus" centered>
                    {{ props.row.bonus }}
                </b-table-column>

                <b-table-column field="priceSale" label="Price Sale" centered>
                    <span v-if="props.row.status">{{ props.row.priceSale }} <span class="CrowdsdalList__eth">ETH</span></span>
                    <span v-else>---</span>
                </b-table-column>

                <b-table-column field="endSale" label="End Sale" centered>
                    <span v-if="props.row.endSale > 0" class="tag is-success">
                        {{ props.row.endSale }}
                    </span>
                    <span v-else>---</span>
                </b-table-column>

            </template>
        </b-table>
        <div v-if="!tableData">Нет краудсейлов</div>
        <transition name="fade">
            <div class="CrowdsdalList__selected" v-if="selected">
                <div class="CrowdsdalList__left">
                    <sale-table :selected="selected"></sale-table>
                </div>
                <div class="CrowdsdalList__center">
                    <bonus-table :selected="selected"></bonus-table>
                </div>
                <div class="CrowdsdalList__right">
                    <calculator :selected="selected"></calculator>
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
    import './default.scss';
    import SaleTable from '../SaleTable'
    import BonusTable from '../BonusTable'
    import Calculator from '../Calculator'

    const moment = window.moment;

    export default {
        name: 'CrowdsdalList',
        template: '#CrowdsdalListTemplate',
        components: {SaleTable, BonusTable, Calculator},
        props: {
            /* Массив краудсейлов */
            list: null
        },
        data() {
            return {
                selected: null,
            };
        },
        watch: {},
        computed: {
            tableData() {
                const list = this.list.map(token => {
                    console.log(token);
                    return {
                        'tokenAddress': token.tokenAddress,
                        'WTokenAddress': token.WTokenAddress,
                        'symbol': token.symbol,
                        'name': token.name,
                        'symbolW': token.symbolW,
                        'nameW': token.nameW,
                        'status': token.status,
                        'startDate': moment(token.startDate * 1000).format("YYYY-MM-DD"),
                        'endDate': token.endDate ? moment(token.endDate * 1000).format("YYYY-MM-DD") : null,
                        'price': token.tokenPrice,
                        'total': token.WTokenTotal,
                        'sale': token.stageDiscount,
                        'onSale': "---",
                        'priceSale': token.tokenPrice - (token.tokenPrice * (token.stageDiscount / 100)),
                        'endSale': token.timeLeft,
                        //рыба
                        'sold': "---",
                        'soldPercent': "---",
                        'bonus': "---",
                        'stages': token.stages
                    }
                });
                return list.filter(Boolean);
            },
        },
        methods: {
            selectTableRow(row) {
                this.selected = row;
            }
        },
        async created() {
        }
    };

</script>