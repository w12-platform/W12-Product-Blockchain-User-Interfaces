<template>
    <div class="ReturnToProject">

        <h2>Получение {{ data.symbol }}</h2>

        <table class="table table-striped table-bordered table-hover table-responsive-sm">
            <tbody>
            <tr>
                <td>Непроданные {{ data.symbol }}, доступные для возврата на данный момент</td>
                <td>{{ data.amountUnSold }} {{ data.symbol }}</td>
            </tr>
            <tr>
                <td>{{ data.symbol }}, оставшиеся в Token Changer после возврата средств покупателями токенов {{ data.symbolW }}, доступные для
                    возврата на данный момент
                </td>
                <td>{{ data.amountRemainingInTokenChanger }} {{ data.symbol }}</td>
            </tr>
            <tr>
                <td>STK токены, оставшиеся после обмена {{ data.symbolW }} на {{ data.symbol }} до истечения периода заморозки</td>
                <td>{{ data.amountRemainingAfterTheExchange }} {{ data.symbol }}</td>
            </tr>
            <tr>
                <td>ВСЕГО доступно {{ data.symbol }} для возврата на данный момент:</td>
                <td>{{ data.amountTotalAvailable }} {{ data.symbol }}</td>
            </tr>
            </tbody>
        </table>

        <button class="btn btn-primary py-2 my-2" @click="claimRemainingTokens">Получить непроданные {{ data.symbolW }}</button>
        <ExchangeTokensProjects></ExchangeTokensProjects>
    </div>
</template>
<script>
    import "./default.scss";
    import {ReceivingModel} from './model.js';
    import ExchangeTokensProjects from 'bem/ExchangeTokensProjects';

    export default {
        name: 'Receiving',
        filters: {},
        props: {
            data: {
                type: ReceivingModel,
                required: true
            }
        },
        components: {
            ExchangeTokensProjects
        },
        computed: {},
        methods: {
            claimRemainingTokens(){
                this.$emit('claimRemainingTokens');
            },
            exchange(){
                this.$emit('exchange');
            }
        }
    };
</script>