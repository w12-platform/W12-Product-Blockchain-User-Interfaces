<template>
    <div class="CrowdSale">
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
                    <span v-else>---</span>
                </td>
            </tr>
            <tr>
                <td>Общее количество защищённых токенов</td>
                <td>{{ selected.WTokenTotal }}</td>
            </tr>
            <tr>
                <td>Кол-во проданных защищенных токенов</td>
                <td>---</td>
            </tr>
            <tr>
                <td>Доля проданных защищённых токенов</td>
                <td>---</td>
            </tr>
            <tr>
                <td>Кол-во защищенных токенов, которое осталось в продаже</td>
                <td>---</td>
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
                    <span v-if="selected.status">{{ selected.tokenPrice - (selected.tokenPrice * (selected.stageDiscount / 100)) }}
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

    const crowdSaleListStore = createNamespacedHelpers("crowdSaleList");

    const moment = window.moment;

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
                let countdownValue = '';
                let days = Math.floor(this.selected.timeLeft / (60 * 60 * 24));
                if(days) {
                    countdownValue += days + "d ";
                }
                let hours = Math.floor((this.selected.timeLeft - (days * 60 * 60 * 24)) / (60 * 60));
                if(hours) {
                    countdownValue += hours + "h ";
                }
                let minuts = Math.floor((this.selected.timeLeft - (days * 60 * 60 * 24) - (hours * 60 * 60)) / (60));
                if(minuts) {
                    countdownValue += minuts + "m ";
                }
                let sek = Math.floor((this.selected.timeLeft - (days * 60 * 60 * 24) - (hours * 60 * 60) - (minuts * 60)));
                if(sek) {
                    countdownValue += sek + "s ";
                }
                return countdownValue;
            }
        },
        methods: {
            dateFormat(date) {
                return moment(date * 1000).format("DD.MM.YYYY hh:mm")
            }
        },
        created() {
        }
    };

</script>