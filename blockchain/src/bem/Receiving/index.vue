<template>
    <div class="ReturnToProject">

        <h2>{{ $t('Receiving', {Token:data.symbol})}}</h2>

        <table class="table table-striped table-bordered table-hover table-responsive-sm">
            <tbody>
            <tr>
                <td>{{ $t('ReceivingUnsold', {Token:data.symbol})}}</td>
                <td>{{ data.amountUnSold }} {{ data.symbol }}</td>
            </tr>
            <tr>
                <td>{{ $t('ReceivingRemaining', {Token:data.symbol, WToken:data.symbolW})}}</td>
                <td>{{ data.amountRemainingInTokenChanger }} {{ data.symbol }}</td>
            </tr>
            <tr>
                <td>{{ $t('ReceivingAfterExchanging', {Token:data.symbol, WToken:data.symbolW}) }}</td>
                <td>{{ data.amountRemainingAfterTheExchange }} {{ data.symbol }}</td>
            </tr>
            <tr>
                <td>{{ $t('ReceivingTotal', {Token:data.symbol}) }}</td>
                <td>{{ data.amountTotalAvailable }} {{ data.symbol }}</td>
            </tr>
            </tbody>
        </table>
        <button class="btn btn-primary py-2 my-2" @click="claimRemainingTokens">{{ $t('ReceivingGetUnsold',{WToken:data.symbolW})}}</button>
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