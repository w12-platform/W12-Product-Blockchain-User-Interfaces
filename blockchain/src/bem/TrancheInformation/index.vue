<template>
    <div class="TrancheInformation">
        <table class="table table-striped table-bordered table-hover table-responsive-sm">
            <tbody>
                <tr>
                    <td>Баланс фонда хранения средств</td>
                    <td>{{ data.fundBalanceInWei | weiToEth }} ETH | __</td>
                </tr>
                <tr>
                    <td>Дата и время получения следующего транша</td>
                    <td>__</td>
                </tr>
                <tr>
                    <td>Средства, доступные для получения на данный момент</td>
                    <td>{{ data.trancheAmountInWei | weiToEth }} ETH</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>
<script>
    import { TrancheInformationModel } from './shared.js';


    const web3 = new Web3();

    export default {
        filters: {
            weiToEth (value) {
                return web3.fromWei(value, 'ether');
            }
        },
        name: 'TrancheInformation',
        props: {
            data: {
                type: TrancheInformationModel,
                required: true
            }
        }
    };
</script>
<style lang="scss">
    .TrancheInformation {
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
