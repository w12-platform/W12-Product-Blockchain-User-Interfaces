<template>
    <div class="CrowdSale buefy" v-if="currentToken">
        <table
               class="CrowdSale__table table table-striped table-bordered table-hover table-responsive-sm">
            <tbody>
            <tr>
                <td>Краткое название токена</td>
                <td>{{ currentToken.tokenInformation.symbol }}</td>
            </tr>
            <tr>
                <td>Полное название токена</td>
                <td>
                    <a :href="'https://etherscan.io/token/' + currentToken.tokenAddress" target="_blank">
                        {{ currentToken.tokenInformation.name }}</a>
                </td>
            </tr>
            <tr>
                <td>Краткое название защищённого токена</td>
                <td>{{ currentToken.symbol }}</td>
            </tr>
            <tr>
                <td>Полное название защищённого токена</td>
                <td>
                    <a :href="'https://etherscan.io/token/' + currentToken.crowdSaleInformation.WTokenAddress"
                       target="_blank">
                        {{ currentToken.name }}</a>
                </td>
            </tr>
            <tr>
                <td>Статус</td>
                <td>
                    <span v-if="currentToken.crowdSaleInformation.status" class="tag is-success">Active</span>
                    <span v-else class="">Inactive</span>
                </td>
            </tr>
            <tr>
                <td>Дата и время начала продажи токенов</td>
                <td>
                    <span class="tag is-success">{{ currentToken.crowdSaleInformation.startDate|dateFormat }} UTC</span>
                </td>
            </tr>
            <tr>
                <td>Дата и время окончания продажи токенов</td>
                <td>
                    <span class="tag is-danger">{{ currentToken.crowdSaleInformation.endDate|dateFormat }} UTC</span>
                </td>
            </tr>
            <tr>
                <td>Общее количество защищённых токенов</td>
                <td>{{ currentToken.crowdSaleInformation.WTokenTotal|decimals }}</td>
            </tr>
            <tr>
                <td>Кол-во проданных защищенных токенов</td>
                <td>{{ currentToken.crowdSaleInformation.saleAmount }}</td>
            </tr>
            <tr>
                <td>Доля проданных защищённых токенов</td>
                <td>{{ currentToken.crowdSaleInformation.salePercent }}%</td>
            </tr>
            <tr>
                <td>Кол-во защищенных токенов, которое осталось в продаже</td>
                <td>{{ currentToken.crowdSaleInformation.tokensOnSale|decimals }}</td>
            </tr>
            <tr>
                <td>Стоимость одного токена {{ currentToken.symbol }}</td>
                <td>{{ currentToken.crowdSaleInformation.tokenPrice }} <span class="CrowdSale__eth">ETH</span></td>
            </tr>
            <tr v-if="currentToken.crowdSaleInformation.status && currentToken.crowdSaleInformation.stageDiscount !== '0'">
                <td>Скидка на {{ currentToken.symbol }} в %</td>
                <td>
                    <span v-if="currentToken.crowdSaleInformation.status" class="tag is-success">
                        {{ currentToken.crowdSaleInformation.stageDiscount }}%
                    </span>
                    <span v-else></span>
                </td>
            </tr>
            <tr v-if="currentToken.crowdSaleInformation.stageDiscount !== '0' && currentToken.crowdSaleInformation.status">
                <td>Стоимость одного токена {{ currentToken.symbol }} с учетом текущей скидки</td>
                <td>
                    <span v-if="currentToken.crowdSaleInformation.status">{{ currentToken.crowdSaleInformation.price }}
                        <span class="CrowdSale__eth">ETH</span>
                    </span>
                </td>
            </tr>
            <tr v-if="currentToken.crowdSaleInformation.status && countdown">
                <td>Кол-во дней, часов, минут до окончания действия текущей скидки</td>
                <td>{{ countdown }}</td>
            </tr>
            </tbody>
            <b-loading :is-full-page="false" :active.sync="tokensListMeta.updated" :can-cancel="true"></b-loading>
        </table>
    </div>
</template>

<script>
    import './default.scss';
    import {createNamespacedHelpers} from "vuex";

    const TokensListNS = createNamespacedHelpers("TokensList");
    import countdown from 'countdown';

    const moment = window.moment;
    const web3 = new Web3();
    const BigNumber = web3.BigNumber;

    export default {
        name: 'CrowdSale',
        template: '#CrowdsaleTemplate',
        components: {},
        data() {
            return {
                countdownTmId: false,
                countdown: false,
            }
        },
        filters: {
            dateFormat(value) {
                return moment(value * 1000).utc().format("DD.MM.YYYY HH:mm");
            },
            decimals(value) {
                return new BigNumber(value).toString();
            },
        },
        watch: {},
        computed: {
            ...TokensListNS.mapState({
                tokensListMeta: 'meta',
                tokensList: 'list',
                currentToken: 'currentToken'
            }),
        },
        methods: {
            ...TokensListNS.mapActions({
                tokensListFetch: "fetch",
                tokensListUpdate: "update",
                tokensListWatch: "watch",
            }),

            async watchCountdown() {
                this.unwatchCountdown();

                const watcher = async () => {
                    if (this.currentToken){
                        const currentDate = moment().utc().unix();
                        const stageEndDate = this.currentToken.crowdSaleInformation.stageEndDate;
                        const EndDate = this.currentToken.crowdSaleInformation.endDate;

                        if (currentDate >= stageEndDate) {
                            if (currentDate <= EndDate) {
                                const Index = this.currentToken.index;
                                setTimeout(() => {
                                    this.tokensListUpdate({Index});
                                }, 1000);
                            }
                            this.unwatchCountdown();
                            this.countdown = false;
                        } else {
                            this.countdown = countdown(new Date(stageEndDate * 1000)).toString();
                        }
                    }
                };

                this.countdownTmId = setInterval(watcher, 1000);
            },
            unwatchCountdown() {
                clearInterval(this.countdownTmId);
            },
        },
        async created() {
            await this.watchCountdown();
        },
        beforeDestroy() {
            this.unwatchCountdown();
        }
    };

</script>
