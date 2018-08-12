<template>
    <div class="TrancheInformation buefy">
        <table class="table table-striped table-bordered table-hover table-responsive-sm">
            <tbody>
                <tr>
                    <td>Баланс фонда хранения средств</td>
                    <td>{{ data.fundBalanceInWei | weiToEth }} ETH | __</td>
                </tr>
                <tr>
                    <td>Дата и время получения следующего транша</td>
                    <td>{{ nextTrancheDate | formatDate }}</td>
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
    import moment from 'moment';


    const web3 = new Web3();

    export default {
        name: 'TrancheInformation',
        filters: {
            weiToEth (value) {
                return web3.fromWei(value, 'ether');
            },
            formatDate (value) {
                return value ? moment.unix(value).format('DD.MM.YYYY[ г. ]hh:mm') : '-';
            }
        },
        props: {
            data: {
                type: TrancheInformationModel,
                required: true
            }
        },
        computed: {
            nextTrancheDate () {
                const now = moment().unix();
                const found = this.data.trancheIntervals
                    .find(item => item[0] >= now);

                return found ? found[0] : null;
            }
        },
    };
</script>
<style lang="scss">
    .TrancheInformation {
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
