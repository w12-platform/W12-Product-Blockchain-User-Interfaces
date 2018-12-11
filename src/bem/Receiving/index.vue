<template>
    <div class="Receiving buefy" v-if="currentProject && currentProject.receiving">

        <h2>{{ $t('Receiving', {Token:currentProject.receiving.symbol})}}</h2>

        <div class="pm-2" v-if="isPendingTx">
            <p class="py-2">{{ $t('WaitingConfirm') }}:</p>
            <b-tag class="py-2">{{isPendingTx.hash}}</b-tag>
        </div>
        <div class="pm-2" v-if="isErrorTx">
            <p class="py-2">{{ $t('TransactionFailed') }}:</p>
            <b-tag class="py-2">{{isErrorTx.hash}}</b-tag>
            <div class="pt-2 text-left">
                <button class="btn btn-primary btn-sm" @click="TransactionsRetry(isErrorTx)">{{ $t('ToRetry') }}</button>
            </div>
        </div>
        <table v-if="!isPendingTx && !isErrorTx" class="table table-striped table-bordered table-hover table-responsive-sm">
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
        <b-notification class="ProjectStages__errorStage" v-if="error" @close="error = false" type="is-danger" has-icon>
            {{ error }}
        </b-notification>
        <button
                v-if="!isPendingTx && !isErrorTx && currentProject.receiving.amountUnSold !== '0'"
                class="btn btn-primary py-2 my-2"
                @click="claimRemainingTokens"
                :disabled="!currentProject.receiving.amountUnSold">{{
            $t('ReceivingGetUnsold',{WToken:currentProject.receiving.symbolW})}}
        </button>
        <ExchangeTokensProjects v-if="!isPendingTx && !isErrorTx"></ExchangeTokensProjects>
        <b-loading :is-full-page="false" :active.sync="loadingClaim"></b-loading>
    </div>
</template>
<script>
    import "./default.scss";
    import ExchangeTokensProjects from 'bem/ExchangeTokensProjects';
    import {waitTransactionReceipt, errorMessageSubstitution} from 'lib/utils.js';
    import Connector from 'lib/Blockchain/DefaultConnector.js';
    import {UPDATE_TX} from "store/modules/Transactions.js";
    import Web3 from 'web3';
    import {createNamespacedHelpers} from 'vuex';


    const web3 = new Web3();
    const BigNumber = web3.BigNumber;

    const ProjectNS = createNamespacedHelpers("Project");
    const AccountNS = createNamespacedHelpers("Account");
    const LedgerNS = createNamespacedHelpers("Ledger");
    const TransactionsNS = createNamespacedHelpers("Transactions");

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
            ...TransactionsNS.mapState({
                TransactionsList: "list"
            }),
            ...AccountNS.mapState({
                currentAccount: "currentAccount",
                currentAccountData: "currentAccountData",
            }),
            isErrorTx() {
                return this.TransactionsList && this.TransactionsList.length
                    ? this.TransactionsList.find((tr) => {
                        return tr.token
                        && tr.name
                        && tr.hash
                        && tr.status
                        && tr.token === this.currentProject.tokenAddress
                        && tr.name === "claimRemainingTokens"
                        && tr.status === "error"
                            ? tr
                            : false
                    })
                    : false;
            },
            isPendingTx() {
                return this.TransactionsList && this.TransactionsList.length
                    ? this.TransactionsList.find((tr) => {
                        return tr.token
                        && tr.name
                        && tr.hash
                        && tr.status
                        && tr.token === this.currentProject.tokenAddress
                        && tr.name === "claimRemainingTokens"
                        && tr.status === "pending"
                            ? tr
                            : false
                    })
                    : false;
            },
            balance() {
                return web3.fromWei(this.currentAccountData.balance, 'ether').toString();
            },
            disable() {
                return !this.currentProject.receiving.amountUnSold
                    || parseFloat(this.currentProject.receiving.amountUnSold) <= 0;
            }
        },
        data() {
            return {
                loadingClaim: false,
                error: false,
            };
        },
        methods: {
            ...LedgerNS.mapActions({
                LedgerFetch: 'fetch',
            }),
            ...TransactionsNS.mapActions({
                TransactionsRetry: "retry"
            }),
            async claimRemainingTokens() {
                this.loadingClaim = true;
                try {
                    const {W12CrowdsaleFactory} = await this.LedgerFetch(this.currentProject.version);
                    const W12Crowdsale = W12CrowdsaleFactory.at(this.currentProject.tokenCrowdsaleAddress);
                    const connectedWeb3 = (await Connector.connect()).web3;
                    const tx = await W12Crowdsale.methods.claimRemainingTokens();
                    this.$store.commit(`Transactions/${UPDATE_TX}`, {
                        token: this.currentProject.tokenAddress,
                        name: "claimRemainingTokens",
                        hash: tx,
                        status: "pending"
                    });
                    await waitTransactionReceipt(tx, connectedWeb3);
                } catch (e) {
                    this.error = errorMessageSubstitution(e);
                }
                this.loadingClaim = false;
            },
        }
    };
</script>
