<template>
    <div class="RefundInformation">
        <table class="table table-striped table-bordered table-hover table-responsive-sm">
            <tbody>
            <tr>
                <td>Объем замороженных токенов</td>
                <td>{{ data.freezeTokensVolume }} {{ data.tokenSymbol }}</td>
            </tr>
            <tr>
                <td>Объем доступных к возврату токенов</td>
                <td>{{ data.refundTokensVolume }} {{ data.tokenSymbol }}</td>
            </tr>
            <tr>
                <td>
                    Кол-во средств, которые может вернут 1 STK-W12 в ближайший интервал дат возврата средств
                </td>
                <td>{{ data.refundAmountPerToken }} ETH</td>
            </tr>
            <tr>
                <td>Стоимость первоначальной покупки 1 STK-W12</td>
                <td>{{ data.tokenPrice }} ETH</td>
            </tr>
            <tr>
                <td>Баланс фонда хранения средств</td>
                <td>{{ data.fundTokensBalance }} {{ data.tokenSymbol }} | {{ data.fundBalance }} ETH</td>
            </tr>
            <tr>
                <td>% возврата фонда</td>
                <td>{{ data.totalRefundPercent }} %</td>
            </tr>
            <tr>
                <td>Баланс STK-W12 на текущем выбранном аккаунте в Metamask</td>
                <td>{{ data.currentWalletBalanceInTokens }} {{ data.tokenSymbol }}</td>
            </tr>
            <tr>
                <td>Все STK-W12 на текущем выбранном аккаунте в Metamask можно продать за:</td>
                <td>{{ data.currentWalletBalanceInRefundAmount }} ETH</td>
            </tr>
            </tbody>
        </table>
    </div>
</template>
<script>
    import { RefundInformationModel } from './shared.js';


    export default {
        name: 'RefundInformation',
        props: {
            data: {
                type: RefundInformationModel,
                required: true
            }
        },
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
