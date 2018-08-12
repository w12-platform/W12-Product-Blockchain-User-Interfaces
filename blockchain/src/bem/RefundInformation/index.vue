<template>
    <div class="RefundInformation">
        <table class="table table-striped table-bordered table-hover table-responsive-sm">
            <tbody>
            <tr>
                <td>Объем замороженных токенов</td>
                <td>{{ decimals(data.freezeTokensVolume) }} {{ data.tokenSymbol }}</td>
            </tr>
            <tr>
                <td>Объем доступных к возврату токенов</td>
                <td>{{ decimals(data.refundTokensVolume) }} {{ data.tokenSymbol }}</td>
            </tr>
            <tr>
                <td>Кол-во средств, которые может вернуть 1 {{ data.tokenSymbol }} в ближайший интервал дат возврата средств</td>
                <td>{{ data.refundAmountPerToken }} ETH</td>
            </tr>
            <tr>
                <td>Стоимость первоначальной покупки 1 {{ data.tokenSymbol }}</td>
                <td>{{ data.tokenPrice }} ETH</td>
            </tr>
            <tr>
                <td>Баланс фонда хранения средств</td>
                <td>{{ decimals(data.fundTokensBalance) }} {{ data.tokenSymbol }} | {{ data.fundBalance }} ETH</td>
            </tr>
            <tr>
                <td>% возврата фонда</td>
                <td>{{ data.totalRefundPercent }} %</td>
            </tr>
            <tr>
                <td>Баланс {{ data.tokenSymbol }} на текущем выбранном аккаунте в Metamask</td>
                <td>{{ decimals(data.currentWalletBalanceInTokens) }} {{ data.tokenSymbol }}</td>
            </tr>
            <tr>
                <td>Все {{ data.tokenSymbol }} на текущем выбранном аккаунте в Metamask можно продать за:</td>
                <td>{{ data.currentWalletBalanceInRefundAmount }} ETH</td>
            </tr>
            </tbody>
        </table>
    </div>
</template>
<script>
    import { RefundInformationModel } from './shared.js';

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
            decimals (value) {
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
        @import "~bulma";
        @import "~buefy/src/scss/buefy";

        font-size: 12px;
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
