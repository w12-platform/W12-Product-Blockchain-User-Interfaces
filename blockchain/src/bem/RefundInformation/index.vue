<template>
    <div class="RefundInformation buefy">
        <table class="table table-striped table-bordered table-hover table-responsive-sm">
            <tbody>
            <tr>
                <td>{{ $t('InvestorDashboardRefundEthInfoVolumeFrozen') }}</td>
                <td>{{ decimals(data.freezeTokensVolume) }} {{ data.tokenSymbol }}</td>
            </tr>
            <tr>
                <td>{{ $t('InvestorDashboardRefundEthInfoAvailableReturn') }}</td>
                <td>{{ decimals(data.refundTokensVolume) }} {{ data.tokenSymbol }}</td>
            </tr>
            <tr>
                <td>{{ $t('InvestorDashboardRefundEthInfoReturnOne', {WToken: data.tokenSymbol})}}</td>
                <td>{{ data.refundAmountPerToken }} ETH</td>
            </tr>
            <tr>
                <td>{{ $t('InvestorDashboardRefundEthInfoInitial', {WToken: data.tokenSymbol}) }}</td>
                <td>{{ data.tokenPrice }} ETH</td>
            </tr>
            <tr>
                <td>{{ $t('InvestorDashboardRefundEthInfoFundBalance') }}</td>
                <td>{{ decimals(data.fundTokensBalance) }} {{ data.tokenSymbol }} | {{ data.fundBalance }} ETH</td>
            </tr>
            <tr>
                <td>{{ $t('InvestorDashboardRefundEthInfoFundReturn') }}</td>
                <td>{{ data.totalRefundPercent }} %</td>
            </tr>
            <tr>
                <td>{{ $t('InvestorDashboardRefundEthInfoBalance', {WToken: data.tokenSymbol}) }}</td>
                <td>{{ decimals(data.currentWalletBalanceInTokens) }} {{ data.tokenSymbol }}</td>
            </tr>
            <tr>
                <td>{{ $t('InvestorDashboardRefundEthInfoAllSold', {WToken: data.tokenSymbol}) }}</td>
                <td>{{ data.currentWalletBalanceInRefundAmount }} ETH</td>
            </tr>
            </tbody>
        </table>
    </div>
</template>
<script>
    import {RefundInformationModel} from './shared.js';

    const web3 = new Web3();
    const BigNumber = web3.BigNumber;

    export default {
        name: 'RefundInformation',
        props: {
            data: {
                type: RefundInformationModel,
                required: true
            }
        },
        methods: {
            decimals(value) {
                const d = this.data.tokenDecimals;
                const base = new BigNumber(10);

                value = new BigNumber(value);

                return value.div(base.pow(d)).toString();
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
