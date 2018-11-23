<template>
    <div class="TrancheInformation buefy" v-if="trancheInformationData">
        <h2 v-html="$t('trancheInformation')"></h2>

        <div class="pm-2" v-if="isPendingTx">
            <p class="py-2"><span v-html="$t('WaitingConfirm')"></span>:</p>
            <b-tag class="py-2">{{isPendingTx.hash}}</b-tag>
        </div>
        <div class="pm-2" v-if="isErrorTx">
            <p class="py-2"><span v-html="$t('TransactionFailed')"></span>:</p>
            <b-tag class="py-2">{{isErrorTx.hash}}</b-tag>
            <div class="pt-2 text-left">
                <button class="btn btn-primary btn-sm" @click="TransactionsRetry(isErrorTx)" v-html="$t('ToRetry')"></button>
            </div>
        </div>
        <table v-if="!isPendingTx && !isErrorTx" class="table table-striped table-bordered table-hover table-responsive-sm">
            <tbody>
            <tr>
                <td v-html="$t('trancheInformationFundBalance')"></td>
                <td>
                    <div v-for="info in trancheInformationData.trancheInfo">
                        {{ info.Balance }} {{ info.Symbol }}
                    </div>
                </td>
            </tr>
            <tr>
                <td v-html="$t('trancheInformationDateNextTranche')"></td>
                <td>{{ nextTrancheDate | formatDate }}</td>
            </tr>
            <tr>
                <td v-html="$t('trancheInformationFundsMoment')"></td>
                <td>
                    <div v-for="info in trancheInformationData.trancheInfo">
                        {{ info.TrancheAmount }} {{ info.Symbol }}
                    </div>
                </td>
            </tr>
            </tbody>
        </table>

        <b-notification class="" v-if="error" @close="error = false" type="is-danger" has-icon>
            {{ $t(error) }}
        </b-notification>

        <button v-if="!isPendingTx && !isErrorTx" class="btn btn-primary py-2 my-2" :disabled="disable" @click="tryTranche" v-html="$t('trancheInformationReceive')">
        </button>
        <b-loading :is-full-page="false" :active.sync="loading" :can-cancel="true"></b-loading>
    </div>
</template>
<script>
    import './default.scss';
    import {TrancheInformationModel} from './shared.js';
    import moment from 'moment';
    import {createNamespacedHelpers} from "vuex";
    import Connector from "lib/Blockchain/DefaultConnector";
    import {UPDATE_TX} from "store/modules/Transactions.js";
    import {waitTransactionReceipt, errorMessageSubstitution} from 'lib/utils.js';
    import Web3 from 'web3';
    import {getTrancheIntervals} from '@/lib/selectors/fund';

    const ProjectNS = createNamespacedHelpers("Project");
    const LedgerNS = createNamespacedHelpers("Ledger");
    const TransactionsNS = createNamespacedHelpers("Transactions");

    const web3 = new Web3();
    const BigNumber = web3.BigNumber;

    export default {
        name: 'TrancheInformation',
        filters: {
            weiToEth(value) {
                return web3.fromWei(value, 'ether');
            },
            formatDate(value) {
                return value ? moment.unix(value).format('DD.MM.YYYY[ г. ]hh:mm') : '-';
            }
        },
        data() {
            return {
                loading: false,
                error: false,
            };
        },

        computed: {
            ...ProjectNS.mapState({
                currentProject: "currentProject",
            }),
            ...TransactionsNS.mapState({
                TransactionsList: "list"
            }),
            isErrorTx() {
                return this.TransactionsList && this.TransactionsList.length
                    ? this.TransactionsList.find((tr) => {
                        return tr.fund
                        && tr.name
                        && tr.hash
                        && tr.status
                        && tr.fund === this.currentProject.fundData.address
                        && tr.name === "tranche"
                        && tr.status === "error"
                            ? tr
                            : false
                    })
                    : false;
            },
            isPendingTx() {
                return this.TransactionsList && this.TransactionsList.length
                    ? this.TransactionsList.find((tr) => {
                        return tr.fund
                        && tr.name
                        && tr.hash
                        && tr.status
                        && tr.fund === this.currentProject.fundData.address
                        && tr.name === "tranche"
                        && tr.status === "pending"
                            ? tr
                            : false
                    })
                    : false;
            },
            disable(){
                return !this.trancheInformationData.trancheTransferAllowed;
            },

            nextTrancheDate() {
                const now = moment().unix();
                const found = this.trancheInformationData.trancheIntervals
                    .find(item => item[0] >= now);

                return found ? found[0] : null;
            },

            trancheInformationData() {
                if (this.currentProject && this.currentProject.fundData && this.currentProject.fundData.trancheInfo) {
                    return new TrancheInformationModel({
                        trancheIntervals: getTrancheIntervals(this.currentProject.crowdSaleInformation.tokenCrowdSaleMilestones),
                        trancheInfo: this.currentProject.fundData.trancheInfo,
                        trancheTransferAllowed: this.currentProject.fundData.trancheTransferAllowed
                    });
                }
            },
        },
        methods: {
            ...LedgerNS.mapActions({
                ledgerFetch: "fetch"
            }),
            ...TransactionsNS.mapActions({
                TransactionsRetry: "retry"
            }),
            async tryTranche() {
                this.loading = true;
                try {
                    const fundAddress = this.currentProject.fundData.address;
                    const {W12FundFactory} = await this.ledgerFetch(this.currentProject.version);
                    const {web3} = await Connector.connect();
                    const W12Fund = W12FundFactory.at(fundAddress);
                    const tx = await W12Fund.methods.tranche({from: this.currentAccount});
                    this.$store.commit(`Transactions/${UPDATE_TX}`, {
                        fund: this.currentProject.fundData.address,
                        name: "tranche",
                        hash: tx,
                        status: "pending"
                    });
                    await waitTransactionReceipt(tx, web3);
                } catch (e) {
                    console.error(e);
                    this.error = errorMessageSubstitution(e);
                }
                this.loading = false;
            },
        }
    };
</script>
