<template>
    <div class="CrowdSale byefy">
        <table v-if="selected" class="table table-striped table-bordered table-hover table-responsive-sm">
            <tbody>
            <tr>
                <td>Краткое название токена</td>
                <td>{{ selected.symbol }}</td>
            </tr>
            <tr>
                <td>Полное название токена</td>
                <td>
                    <a :href="'https://etherscan.io/token/' + selected.tokenAddress" target="_blank">{{ selected.name }}</a>
                </td>
            </tr>
            <tr>
                <td>Краткое название защищённого токена</td>
                <td>{{ selected.symbolW }}</td>
            </tr>
            <tr>
                <td>Полное название защищённого токена</td>
                <td>
                    <a :href="'https://etherscan.io/token/' + selected.WTokenAddress" target="_blank">{{ selected.nameW }}</a>
                </td>
            </tr>
            <tr>
                <td>Статус</td>
                <td>
                    <span v-if="selected.status" class="tag is-success">Active</span>
                    <span v-else class="">Inactive</span>
                </td>
            </tr>
            <tr>
                <td>Дата и время начала продажи токенов</td>
                <td>
                <span class="tag is-success">
                        {{ dateFormat(selected.startDate) }}
                    </span>
                </td>
            </tr>
            <tr>
                <td>Дата и время окончания продажи токенов</td>
                <td>
                    <span class="tag is-danger" v-if="selected.endDate">
                        {{ dateFormat(selected.endDate) }}
                    </span>
                </td>
            </tr>
            <tr>
                <td>Общее количество защищённых токенов</td>
                <td>{{ decimals(selected.WTokenTotal) }}</td>
            </tr>
            <tr>
                <td>Кол-во проданных защищенных токенов</td>
                <td>{{ saleAmount }}</td>
            </tr>
            <tr>
                <td>Доля проданных защищённых токенов</td>
                <td>{{ salePercent }}%</td>
            </tr>
            <tr>
                <td>Кол-во защищенных токенов, которое осталось в продаже</td>
                <td>{{ decimals(selected.tokensOnSale) }}</td>
            </tr>
            <tr>
                <td>Стоимость одного токена {{ selected.symbolW }}</td>
                <td>{{ selected.tokenPrice }} <span class="CrowdSale__eth">ETH</span></td>
            </tr>
            <tr>
                <td>Скидка на {{ selected.symbolW }} в %</td>
                <td>
                    <span v-if="selected.status" class="tag is-danger">-{{ selected.stageDiscount }}%</span>
                    <span v-else></span>
                </td>

            </tr>
            <tr>
                <td>Стоимость одного токена {{ selected.symbolW }} с учетом текущей скидки</td>
                <td>
                    <span v-if="selected.status">{{ price }}
                        <span class="CrowdSale__eth">ETH</span>
                    </span>
                </td>
            </tr>
            <tr>
                <td>Кол-во дней, часов, минут до окончания действия текущей скидки</td>
                <td>
                    <span v-if="selected.status">{{ countdown }}</span>
                </td>
            </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
    import './default.scss';
    import {createNamespacedHelpers} from "vuex";
    import countdown from 'countdown';

    const crowdSaleListStore = createNamespacedHelpers("crowdSaleList");

    const moment = window.moment;
    const web3 = new Web3();
    const BigNumber = web3.BigNumber;

    export default {
        name: 'CrowdSale',
        template: '#CrowdsaleTemplate',
        components: {},
        data() {
            return {};
        },
        watch: {},
        computed: {
            ...crowdSaleListStore.mapState({
                selected: "selected"
            }),

            countdown() {
                return countdown(new Date(this.selected.stageEndDate*1000)).toString();
            },
            price() {
                if (!this.selected) return '0';

                const price = new BigNumber(this.selected.tokenPrice);

                return price.mul(100 - +selected.stageDiscount).div(100).toString();
            },
            saleAmount() {
                return new BigNumber(this.selected.WTokenTotal)
                    .minus(this.selected.tokensOnSale)
                    .toString();
            },
            salePercent() {
                return new BigNumber(this.selected.WTokenTotal)
                    .minus(this.selected.tokensOnSale)
                    .div(this.selected.WTokenTotal)
                    .div(100)
                    .toString();
            }
        },
        methods: {
            dateFormat(date) {
                return moment(date * 1000).format("DD.MM.YYYY hh:mm")
            },
            decimals(value) {
                // const d = this.selected.decimals;
                // const base = new BigNumber(10);

                value = new BigNumber(value);

                // return value.div(base.pow(d)).toString();
                return value.toString();
            },
        },
        created() {
        }
    };

</script>
