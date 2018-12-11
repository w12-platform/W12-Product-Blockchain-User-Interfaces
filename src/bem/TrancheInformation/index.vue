<template>
    <div class="TrancheInformation buefy" v-if="trancheInformationData">
        <h2>{{ $t('trancheInformation') }}</h2>

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
                <td>{{ $t('trancheInformationFundBalance') }}</td>
                <td>{{ trancheInformationData.fundBalanceInWei | weiToEth }} ETH</td>
            </tr>
            <tr>
                <td>{{ $t('trancheInformationDateNextTranche') }}</td>
                <td>{{ nextTrancheDate | formatDate }}</td>
            </tr>
            <tr>
                <td>{{ $t('trancheInformationFundsMoment') }}</td>
                <td>{{ trancheInformationData.trancheAmountInWei | weiToEth }} ETH</td>
            </tr>
            </tbody>
        </table>

        <b-notification class="" v-if="error" @close="error = false" type="is-danger" has-icon>
            {{ error }}
        </b-notification>

        <button v-if="!isPendingTx && !isErrorTx" class="btn btn-primary py-2 my-2" :disabled="disable" @click="tryTranche">{{
            $t('trancheInformationReceive') }}
        </button>
        <b-loading :is-full-page="false" :active.sync="loading"></b-loading>
    </div>
</template>
<script>
    import './default.scss';
    import {TrancheInformationModel} from 'bem/TrancheInformation/shared.js';
    import moment from 'moment';
    import {createNamespacedHelpers} from "vuex";
    import Connector from "lib/Blockchain/DefaultConnector";
    import {UPDATE_TX} from "store/modules/Transactions.js";
    import {waitTransactionReceipt, errorMessageSubstitution} from 'lib/utils.js';
    import Web3 from 'web3';

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
                return !(new BigNumber(this.currentProject.fundData.trancheAmount).gt(0));
            },

            nextTrancheDate() {
                const now = moment().unix();
                const found = this.trancheInformationData.trancheIntervals
                    .find(item => item[0] >= now);

                return found ? found[0] : null;
            },

            trancheInformationData() {
                if (this.currentProject && this.currentProject.fundData && this.currentProject.fundData.address) {
                    const trancheIntervals = this.currentProject.crowdSaleInformation.tokenCrowdSaleMilestones
                        .reduce((out, item, idx, origin) => {
                            if (out.length === 0) {
                                out.push([item.voteEndDate])
                            } else if (idx + 1 === origin.length) {
                                out[out.length - 1].push(item.endDate);
                                out.push([item.voteEndDate, Infinity]);
                            } else {
                                out[out.length - 1].push(item.endDate);
                                out.push([item.voteEndDate]);
                            }

                            return out;
                        }, []);

                    return new TrancheInformationModel({
                        fundBalanceInWei: this.currentProject.fundData.balanceWei,
                        fundBalanceInTokens: '0',
                        trancheIntervals,
                        trancheAmountInWei: this.currentProject.fundData.trancheAmount
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
                    this.error = errorMessageSubstitution(e);
                }
                this.loading = false;
            },
        }
    };
</script>
