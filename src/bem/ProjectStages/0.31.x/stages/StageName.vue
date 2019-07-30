<template>
    <div class="ProjectStages__stage">
        <div class="row align-items-center justify-content-left">
            <div class="col-auto">
                <span class="ProjectDashboard__step-badge step-badge badge badge-pill badge-light">7</span>
            </div>
            <div class="col-sm-4"><span v-html="$t('ProjectDashboardStageName')"></span>
            </div>

<!--            <div class="col-sm-2 text-center">-->
<!--                <b-tag v-if="!hasPlacedWTokenAddress && !hasAllowance"-->
<!--                       type="is-success" v-html="$t('ProjectDashboardStageNameStatusPending')">-->
<!--                </b-tag>-->
<!--                <b-tag v-else type="is-success" v-html="$t('ProjectDashboardStagePlaceStatusPlaced')"></b-tag>-->
<!--            </div>-->

            <div class="col-12 text-left">
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
                <b-tag v-if="project_name" class="ProjectDashboard__placedWTokenAddress"
                       type="is-info">{{project_name}}
                </b-tag>
            </div>
            <div class="ProjectDashboard__placeForm col-12 text-right" v-if="!isPendingTx && !isErrorTx">
                <div class="text-left">
                    <div class="form-group">
                        <label for="SetName" v-html="$t('ProjectDashboardStageNameLabel')"></label>
                        <cleave
                                :placeholder="currentProject.name"
                                id="SpendFrom"
                                v-model="value"
                                class="form-control"
                                name="SetName"
                        ></cleave>
                    </div>
                    <b-notification class="ProjectStages__errorStage" v-if="error" @close="error = false" type="is-danger" has-icon>
                        {{ error }}
                    </b-notification>
                    <div class="text-right">
                        <button
                                class="btn btn-primary btn-sm"
                                @click="setName"
                                :disabled="disable5" v-html="$t('ProjectDashboardStageSetButton')">
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <b-loading :is-full-page="false" :active.sync="placeTokensLoading"></b-loading>
    </div>
</template>

<script>
    import './default.scss';
    import { errorMessageSubstitution, waitContractEventOnce } from '@/lib/utils';
    import Connector from 'lib/Blockchain/DefaultConnector.js';
    import { waitTransactionReceipt, formatNumber, toWeiDecimals, fromWeiDecimals} from 'lib/utils.js';
    import {UPDATE_TX, CONFIRM_TX} from "store/modules/Transactions.js";
    import Web3 from 'web3';
    import {createNamespacedHelpers} from "vuex";

    const ConfigNS = createNamespacedHelpers('Config');
    const ProjectNS = createNamespacedHelpers("Project");
    const LedgerNS = createNamespacedHelpers("Ledger");
    const AccountNS = createNamespacedHelpers("Account");
    const TransactionsNS = createNamespacedHelpers("Transactions");
    const web3 = new Web3();
    const BigNumber = web3.BigNumber;
    BigNumber.config({
        DECIMAL_PLACES: 36,
        FORMAT: {
            decimalSeparator: '.',
            groupSeparator: '',
            groupSize: 3,
            secondaryGroupSize: 0,
            fractionGroupSeparator: ' ',
            fractionGroupSize: 0
        }
    });

    export default {
        name: 'StageSetNamePlace',
        template: '#StageSetNameTemplate',
        watch: {},
        data() {
            return {
                placeTokensLoading: false,
                error: false,
                value: '',
                project_name: ''

            };
        },
        computed: {
            ...ProjectNS.mapState({
                currentProject: "currentProject",
            }),
            ...ProjectNS.mapGetters([
                'hasAllowance',
                'hasPlacedWTokenAddress',
                'ownerBalance'
            ]),
            ...AccountNS.mapState({
                currentAccount: "currentAccount",
                accountMeta: "meta",
            }),
            ...ConfigNS.mapState({
                W12Lister: "W12Lister"
            }),
            ...TransactionsNS.mapState({
                TransactionsList: "list"
            }),
            isErrorTx() {
                return this.TransactionsList && this.TransactionsList.length
                    ? this.TransactionsList.find((tr) => {
                        return tr.token
                        && tr.name
                        && tr.hash
                        && tr.status
                        && tr.token === this.currentProject.tokenAddress
                        && tr.name === "setName"
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
                        && tr.name === "setName"
                        && tr.status === "pending"
                            ? tr
                            : false
                    })
                    : false;
            },
            disable5()
            {
                console.log(this.currentProject.crowdsaleAddress);
                console.log(this.value.length);

                if(this.currentProject.crowdsaleAddress)
                {
                    if(this.value.length > 0 && this.value.length <= 32)
                    {
                        return false
                    }
                }
                return true;
            },
        },
        methods: {
            ...ProjectNS.mapActions({
                fetchProjects: "fetchProjects",
                upTokenAfterEvent: 'upTokenAfterEvent'
            }),
            ...LedgerNS.mapActions({
                fetchLedger: 'fetch',
            }),
            ...TransactionsNS.mapActions({
                TransactionsRetry: "retry"
            }),
            async setName()
            {
                if(this.currentProject.crowdsaleAddress)
                {
                    try
                    {
                        const {W12CrowdsaleFactory} = await this.fetchLedger(this.currentProject.version);
                        const {web3} = await Connector.connect();
                        const W12Crowdsale = W12CrowdsaleFactory.at(this.currentProject.crowdsaleAddress);
                        const tx = await W12Crowdsale.methods.setProjectName(this.value, {from: this.currentAccount});
                            this.$store.commit(`Transactions/${UPDATE_TX}`, {
                                crowdsale: this.currentProject.crowdsaleAddress,
                                name: "set name",
                                hash: tx,
                                status: "pending"
                            });
                            await waitTransactionReceipt(tx, web3);
                     }
                         catch(e)
                     {
                         this.error = errorMessageSubstitution(e);
                     }
                 }
            },
            async getName()
            {
                 if(this.currentProject.crowdsaleAddress)
                 {
                     try
                     {
                         const {W12CrowdsaleFactory} = await this.fetchLedger(this.currentProject.version);
                         const W12Crowdsale = W12CrowdsaleFactory.at(this.currentProject.crowdsaleAddress);
                         const name = await W12Crowdsale.methods.getProjectName({from: this.currentAccount});

                         this.project_name = name;

                         this.addr_flag = true;
                     }
                     catch(e)
                     {
                         this.error = errorMessageSubstitution(e);
                     }
                 }
            },
        },
        mounted: function()
        {
            this.update_flag = true;
            setInterval(async () =>
            {
                this.getName();
            }, 3000);
        }

    };
</script>
