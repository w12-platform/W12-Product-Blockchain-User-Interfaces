<template>
    <div class="RefundInformation buefy">
        <table class="table table-striped table-bordered table-hover table-responsive-sm">
            <tbody>
                <tr>
                    <td>{{ $t('InvestorDashboardRefundEthInfoVolumeFrozen') }}</td>
                    <td>{{ data.freezeTokensVolume }} {{ data.tokenSymbol }}</td>
                </tr>
                <tr>
                    <td>{{ $t('InvestorDashboardRefundEthInfoAvailableReturn') }}</td>
                    <td>{{ data.refundTokensVolume }} {{ data.tokenSymbol }}</td>
                </tr>
                <tr>
                    <td>{{ $t('InvestorDashboardRefundEthInfoReturnOne', {WToken: data.tokenSymbol})}}</td>
                    <td>
                        <span v-for="(value, symbol) in data.refundAmountPerToken" :key="symbol">
                            {{ value }} {{ symbol }}
                            <br>
                        </span>
                    </td>
                </tr>
                <tr>
                    <td>{{ $t('InvestorDashboardRefundEthInfoInitial', {WToken: data.tokenSymbol}) }}</td>
                    <td>{{ data.tokenPrice }} USD</td>
                </tr>
                <tr>
                    <td>{{ $t('InvestorDashboardRefundEthInfoFundBalance') }}</td>
                    <td>
                        <span>
                            {{ data.fundTokensBalance }} {{ data.tokenSymbol }}
                            <br>
                        </span>
                        <span v-for="(value, symbol) in data.fundBalancePerAsset" :key="symbol">
                            {{ value }} {{ symbol }}
                            <br>
                        </span>
                    </td>
                </tr>
                <tr>
                    <td>{{ $t('InvestorDashboardRefundEthInfoFundReturn') }}</td>
                    <td>{{ data.totalRefundPercent }} %</td>
                </tr>
                <tr>
                    <td>{{ $t('InvestorDashboardRefundEthInfoBalance', {WToken: data.tokenSymbol}) }}</td>
                    <td>{{ data.currentWalletBalanceInTokens }} {{ data.tokenSymbol }}</td>
                </tr>
                <tr>
                    <td>{{ $t('InvestorDashboardRefundEthInfoAllSold', {WToken: data.tokenSymbol}) }}</td>
                    <td>
                        <span v-for="(value, symbol) in data.currentWalletBalanceInRefundedAssets" :key="symbol">
                            {{ value }} {{ symbol }}
                            <br>
                        </span>
                    </td>
                </tr>
                <tr v-if="data.currentMilestoneNumber !== null">
                    <td>{{ $t('InvestorDashboardRefundMilestoneNumberTitle') }}</td>
                    <td>{{ data.currentMilestoneNumber }}</td>
                </tr>
                <tr>
                    <td>{{ $t('InvestorDashboardRefundActiveStatusTitle') }}</td>
                    <td>{{
                        data.isRefundActive
                            ? $t('InvestorDashboardRefundActiveStatusActive')
                            : $t('InvestorDashboardRefundActiveStatusNotActive')
                    }}</td>
                </tr>
                <tr v-if="data.refundWindow">
                    <td>{{ $t('InvestorDashboardRefundWindowTitle') }}</td>
                    <td>{{
                        $t('InvestorDashboardRefundWindowDates', {
                            from: dateFormat(data.refundWindow[0]),
                            to: dateFormat(data.refundWindow[1])
                        })
                    }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>
<script>
    import {RefundInformationModel} from './shared.js';
    import moment from 'moment';

    export default {
        name: 'RefundInformation',
        props: {
            data: {
                type: RefundInformationModel,
                required: true
            }
        },
        methods: {
            dateFormat (value) {
                return moment(value * 1000).utc().format("DD.MM.YYYY HH:mm");
            },
        }
    };
</script>
<style lang="scss">
    .RefundInformation {
        margin: 20px 0;

        table {
            td {
                vertical-align: middle !important;
            }

            tr {
                td:first-child {
                    width: 50%
                }

                td:last-child {
                    text-align: center;
                }
            }
        }

        &__volumeElem {
            margin: 3px;
        }
    }
</style>
