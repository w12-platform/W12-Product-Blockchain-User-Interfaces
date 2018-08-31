<template>
    <div class="ReturnToProject" v-if="currentProject && currentProject.receiving">

        <h2>{{ $t('Receiving', {Token:currentProject.receiving.symbol})}}</h2>

        <table class="table table-striped table-bordered table-hover table-responsive-sm">
            <tbody>
            <tr>
                <td>{{ $t('ReceivingUnsold', {Token:currentProject.receiving.symbol})}}</td>
                <td>{{ currentProject.receiving.amountUnSold }} {{ currentProject.receiving.symbol }}</td>
            </tr>
            <!--<tr>-->
                <!--<td>{{ $t('ReceivingRemaining', {Token:currentProject.receiving.symbol, WToken:currentProject.receiving.symbolW})}}-->
                <!--</td>-->
                <!--<td>{{ currentProject.receiving.amountRemainingInTokenChanger }} {{ currentProject.receiving.symbol }}</td>-->
            <!--</tr>-->
            <!--<tr>-->
                <!--<td>{{ $t('ReceivingAfterExchanging', {Token:currentProject.receiving.symbol, WToken:currentProject.receiving.symbolW}) }}-->
                <!--</td>-->
                <!--<td>{{ currentProject.receiving.amountRemainingAfterTheExchange }} {{ currentProject.receiving.symbol }}</td>-->
            <!--</tr>-->
            <!--<tr>-->
                <!--<td>{{ $t('ReceivingTotal', {Token:currentProject.receiving.symbol}) }}</td>-->
                <!--<td>{{ currentProject.receiving.amountTotalAvailable }} {{ currentProject.receiving.symbol }}</td>-->
            <!--</tr>-->
            </tbody>
        </table>
        <button class="btn btn-primary py-2 my-2" @click="claimRemainingTokens">{{
            $t('ReceivingGetUnsold',{WToken:currentProject.receiving.symbolW})}}
        </button>
        <ExchangeTokensProjects></ExchangeTokensProjects>
    </div>
</template>
<script>
    import "./default.scss";
    import ExchangeTokensProjects from 'bem/ExchangeTokensProjects';
    import {waitTransactionReceipt} from 'lib/utils.js';
    import Connector from 'lib/Blockchain/DefaultConnector.js';

    import {createNamespacedHelpers} from 'vuex';

    const ProjectNS = createNamespacedHelpers("Project");
    const LedgerNS = createNamespacedHelpers("Ledger");

    export default {
        name: 'Receiving',
        filters: {},
        components: {
            ExchangeTokensProjects
        },
        computed: {
            ...ProjectNS.mapState({
                currentProject: "currentProject",
            }),
        },
        data() {
            return {
                error: false,
            };
        },
        methods: {
            ...LedgerNS.mapActions({
                LedgerFetch: 'fetch',
            }),
            async claimRemainingTokens() {
                try {
                    const {W12CrowdsaleFactory} = await this.LedgerFetch();
                    const W12Crowdsale = W12CrowdsaleFactory.at(this.currentProject.crowdsaleAddress);
                    const connectedWeb3 = (await Connector.connect()).web3;
                    const tx = await W12Crowdsale.methods.claimRemainingTokens();
                    await waitTransactionReceipt(tx, connectedWeb3);
                    //await this.updateReceivingInformation();
                    //событие проверить
                } catch (e) {
                    this.error = e.message;
                }
            },
        }
    };
</script>