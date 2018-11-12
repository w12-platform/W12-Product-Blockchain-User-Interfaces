<template>
    <div class="CrowdSale buefy" v-if="currentToken">
        <table
               class="CrowdSale__table table table-striped table-bordered table-hover table-responsive-sm">
            <tbody>
            <tr>
                <td v-html="$t('InvestorDashboardShortName')"></td>
                <td>{{ currentToken.tokenInformation.symbol }}</td>
            </tr>
            <tr>
                <td v-html="$t('InvestorDashboardFullName')"></td>
                <td>
                    <a :href="'https://etherscan.io/token/' + currentToken.tokenAddress" target="_blank">
                        {{ currentToken.tokenInformation.name }}</a>
                </td>
            </tr>
            <tr>
                <td v-html="$t('InvestorDashboardShortWName')"></td>
                <td>{{ currentToken.symbol }}</td>
            </tr>
            <tr>
                <td v-html="$t('InvestorDashboardFullWName')"></td>
                <td>
                    <a :href="'https://etherscan.io/token/' + currentToken.crowdSaleInformation.WTokenAddress"
                       target="_blank">
                        {{ currentToken.name }}</a>
                </td>
            </tr>
            <tr>
                <td v-html="$t('InvestorDashboardStatus')"></td>
                <td>
                    <span v-if="currentToken.crowdSaleInformation.status" class="tag is-success">Active</span>
                    <span v-else class="">Inactive</span>
                </td>
            </tr>
            <tr>
                <td v-html="$t('InvestorDashboardStartDate')"></td>
                <td>
                    <span class="tag is-success">{{ currentToken.crowdSaleInformation.startDate|dateFormat }} UTC</span>
                </td>
            </tr>
            <tr>
                <td v-html="$t('InvestorDashboardEndDate')"></td>
                <td>
                    <span class="tag is-danger">{{ currentToken.crowdSaleInformation.endDate|dateFormat }} UTC</span>
                </td>
            </tr>
            <tr>
                <td v-html="$t('InvestorDashboardTotalTokens')"></td>
                <td>{{ currentToken.crowdSaleInformation.WTokenTotal }}</td>
            </tr>
            <tr>
                <td v-html="$t('InvestorDashboardTokensSold')"></td>
                <td>{{ currentToken.crowdSaleInformation.saleAmount }}</td>
            </tr>
            <tr>
                <td v-html="$t('InvestorDashboardShareSoldTokens')"></td>
                <td>{{ currentToken.crowdSaleInformation.salePercent }}%</td>
            </tr>
            <tr>
                <td v-html="$t('InvestorDashboardTokensOnSale')"></td>
                <td><span class="restriction">{{ currentToken.crowdSaleInformation.tokensOnSale }}</span></td>
            </tr>
            <tr>
                <td v-html="$t('InvestorDashboardPrice', {'WToken': currentToken.symbol })"></td>
                <td>{{ currentToken.crowdSaleInformation.tokenPrice }} <span class="CrowdSale__eth">ETH</span></td>
            </tr>
            <tr v-if="currentToken.crowdSaleInformation.status && currentToken.crowdSaleInformation.stageDiscount !== '0'">
                <td v-html="$t('InvestorDashboardDiscountPercent', {'WToken': currentToken.symbol })"></td>
                <td>
                    <span v-if="currentToken.crowdSaleInformation.status" class="tag is-success">
                        {{ currentToken.crowdSaleInformation.stageDiscount }}%
                    </span>
                    <span v-else></span>
                </td>
            </tr>
            <tr v-if="currentToken.crowdSaleInformation.stageDiscount !== '0' && currentToken.crowdSaleInformation.status">
                <td v-html="$t('InvestorDashboardPriceOneDiscount', {'WToken': currentToken.symbol })"></td>
                <td>
                    <span v-if="currentToken.crowdSaleInformation.status">{{ currentToken.crowdSaleInformation.price }}
                        <span class="CrowdSale__eth">ETH</span>
                    </span>
                </td>
            </tr>
            <tr v-if="currentToken.crowdSaleInformation.status && countdown">
                <td v-html="$t('InvestorDashboardCountdown')"></td>
                <td>{{ countdown }}</td>
            </tr>
            <tr v-if="currentToken.crowdSaleInformation.vestingDate">
                <td v-html="$t('InvestorDashboardCrowdsaleTableVestingDate')"></td>
                <td>{{ currentToken.crowdSaleInformation.vestingDate | dateFormat }}</td>
            </tr>
            </tbody>
            <b-loading :is-full-page="false" :active="tokensListMeta.updated" :can-cancel="true"></b-loading>
        </table>
    </div>
</template>

<script>
    import './default.scss';
    import {createNamespacedHelpers} from "vuex";
    import { waitTransactionReceipt, formatNumber, toWeiDecimals, fromWeiDecimals, fromWeiDecimalsString} from 'lib/utils.js';
    import Web3 from 'web3';
    import countdown from 'countdown';
    import moment from "moment";

    const TokensListNS = createNamespacedHelpers("TokensList");
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
                                const Index = this.currentToken.index;
                                setTimeout(() => {
                                    this.tokensListUpdate(this.currentToken);
                                }, 1000);
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
