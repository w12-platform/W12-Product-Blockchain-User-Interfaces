<template>
    <div class="CrowdSale buefy" v-if="currentToken">
        <table
               class="CrowdSale__table table table-striped table-bordered table-hover table-responsive-sm">
            <tbody>
            <tr>
                <td>{{ $t('InvestorDashboardShortName') }}</td>
                <td>{{ currentToken.tokenInformation.symbol }}</td>
            </tr>
            <tr>
                <td>{{ $t('InvestorDashboardFullName') }}</td>
                <td>
                    <a :href="'https://etherscan.io/token/' + currentToken.tokenAddress" target="_blank">
                        {{ currentToken.tokenInformation.name }}</a>
                </td>
            </tr>
            <tr>
                <td>{{ $t('InvestorDashboardShortWName') }}</td>
                <td>{{ currentToken.symbol }}</td>
            </tr>
            <tr>
                <td>{{ $t('InvestorDashboardFullWName') }}</td>
                <td>
                    <a :href="'https://etherscan.io/token/' + currentToken.crowdSaleInformation.WTokenAddress"
                       target="_blank">
                        {{ currentToken.name }}</a>
                </td>
            </tr>
            <tr>
                <td>{{ $t('InvestorDashboardStatus') }}</td>
                <td>
                    <span v-if="currentToken.crowdSaleInformation.status" class="tag is-success">Active</span>
                    <span v-else class="">Inactive</span>
                </td>
            </tr>
            <tr>
                <td>{{ $t('InvestorDashboardStartDate') }}</td>
                <td>
                    <span class="tag is-success">{{ currentToken.crowdSaleInformation.startDate|dateFormat }} UTC</span>
                </td>
            </tr>
            <tr>
                <td>{{ $t('InvestorDashboardEndDate') }}</td>
                <td>
                    <span class="tag is-danger">{{ currentToken.crowdSaleInformation.endDate|dateFormat }} UTC</span>
                </td>
            </tr>
            <!--<tr>-->
                <!--<td>{{ $t('InvestorDashboardTotalTokens') }}</td>-->
                <!--<td>{{ currentToken.crowdSaleInformation.WTokenTotal }}</td>-->
            <!--</tr>-->
            <!--<tr>-->
                <!--<td>{{ $t('InvestorDashboardTokensSold') }}</td>-->
                <!--<td>{{ currentToken.crowdSaleInformation.saleAmount }}</td>-->
            <!--</tr>-->
            <!--<tr>-->
                <!--<td>{{ $t('InvestorDashboardShareSoldTokens') }}</td>-->
                <!--<td>{{ currentToken.crowdSaleInformation.salePercent }}%</td>-->
            <!--</tr>-->
            <tr>
                <td>{{ $t('InvestorDashboardTokensOnSale') }}</td>
                <td><span class="restriction">{{ currentToken.crowdSaleInformation.tokensOnSale }}</span></td>
            </tr>
            <tr>
                <td>{{ $t('InvestorDashboardPrice', {'WToken': currentToken.symbol }) }}</td>
                <td>{{ currentToken.crowdSaleInformation.tokenPrice }} <span class="CrowdSale__eth">ETH</span></td>
            </tr>
            <tr v-if="currentToken.crowdSaleInformation.status && currentToken.crowdSaleInformation.stageDiscount !== '0'">
                <td>{{ $t('InvestorDashboardDiscountPercent', {'WToken': currentToken.symbol }) }}</td>
                <td>
                    <span v-if="currentToken.crowdSaleInformation.status" class="tag is-success">
                        {{ currentToken.crowdSaleInformation.stageDiscount }}%
                    </span>
                    <span v-else></span>
                </td>
            </tr>
            <tr v-if="currentToken.crowdSaleInformation.stageDiscount !== '0' && currentToken.crowdSaleInformation.status">
                <td>{{ $t('InvestorDashboardPriceOneDiscount', {'WToken': currentToken.symbol }) }}</td>
                <td>
                    <span v-if="currentToken.crowdSaleInformation.status">{{ currentToken.crowdSaleInformation.price }}
                        <span class="CrowdSale__eth">ETH</span>
                    </span>
                </td>
            </tr>
            <tr v-if="currentToken.crowdSaleInformation.status && countdown">
                <td>{{ $t('InvestorDashboardCountdown') }}</td>
                <td>{{ countdown }}</td>
            </tr>
            <tr v-if="currentToken.crowdSaleInformation.vestingDate">
                <td>{{ $t('InvestorDashboardCrowdsaleTableVestingDate') }}</td>
                <td>{{ currentToken.crowdSaleInformation.vestingDate | dateFormat }}</td>
            </tr>
            </tbody>
            <b-loading :is-full-page="false" :active="tokensListMeta.updated"></b-loading>
        </table>
    </div>
</template>

<script>
    import './default.scss';
    import {createNamespacedHelpers} from "vuex";
    import { waitTransactionReceipt, formatNumber, toWeiDecimals, fromWeiDecimals, fromWeiDecimalsString} from 'lib/utils.js';
    import Web3 from 'web3';
    import countdown from 'countdown';

    const TokensListNS = createNamespacedHelpers("TokensList");
    const moment = window.moment;
    const web3 = new Web3();
    const BigNumber = web3.BigNumber;

    BigNumber.config({
        DECIMAL_PLACES: 36,
        FORMAT: {
            decimalSeparator: '.',
            groupSeparator: '',
            groupSize: 3,
            secondaryGroupSize: 0,
            fractionGroupSeparator: ' ',
            fractionGroupSize: 0
        }
    });

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
        },
        watch: {
            currentToken: {
                handler: 'onCurrentTokenDeepUpdate',
                deep: true,
                immediate: true
            }
        },
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

            async onCurrentTokenDeepUpdate() {
                await this.watchCountdown();
            },

            async watchCountdown() {
                this.unwatchCountdown();

                const watcher = async () => {
                    if (this.currentToken){
                        const currentDate = moment().utc().unix();
                        const stageEndDate = this.currentToken.crowdSaleInformation.stageEndDate;
                        const EndDate = this.currentToken.crowdSaleInformation.endDate;

                        if (currentDate >= stageEndDate) {
                            if (currentDate <= EndDate) {
                                this.tokensListUpdate(this.currentToken);
                            }
                            this.unwatchCountdown();
                            this.countdown = false;
                        } else {
                            this.countdown = countdown(new Date(stageEndDate * 1000)).toString();
                        }
                    }
                };

                if (this.currentToken) {
                    this.countdownTmId = setInterval(watcher, 1000);
                }
            },
            unwatchCountdown() {
                clearInterval(this.countdownTmId);
            },
        },
        beforeDestroy() {
            this.unwatchCountdown();
        }
    };

</script>
