<template>
    <div class="ProjectStages__stage">
        <div class="row align-items-center justify-content-left">

            <div class="col-auto">
                <span class="ProjectDashboard__step-badge step-badge badge badge-pill badge-light">8</span>
            </div>
            <div class="col-sm-4"><span v-html="$t('ProjectDashboardStageType')"></span>
            </div>

            <div class="col-sm-2 text-center">
<!--                <b-tag v-if="!hasPlacedWTokenAddress && !hasAllowance"-->
<!--                       type="is-success" v-html="$t('ProjectDashboardStageNameStatusPending')">-->
<!--                </b-tag>-->
<!--                <b-tag v-else type="is-success" v-html="$t('ProjectDashboardStagePlaceStatusPlaced')"></b-tag>-->
            </div>

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
                <b-tag class="ProjectDashboard__placedWTokenAddress" v-if="current_type"
                       type="is-info">{{ current_type }}
                </b-tag>
            </div>

            <div class="ProjectDashboard__placeForm col-12 text-right" v-if="!isPendingTx && !isErrorTx">
                <div class="text-left">
                    <div class="form-group">
                        <label for="SetType" v-html="$t('ProjectDashboardStageTypeLabel')"></label>

                        <multiselect
                            :value="value"
                            @input="select_type($event)"
                            :options="project_types"
                            :multiple="false"
                            :close-on-select="true"
                            :clear-on-select="false"
                            :hide-selected="true"
                            :preserve-search="true"
                            :preselect-first="true">
                        </multiselect>

                    </div>
                    <b-notification class="ProjectStages__errorStage" v-if="error" @close="error = false" type="is-danger" has-icon>
                        {{ error }}
                    </b-notification>
                   <div class="text-right">
                        <button
                                class="btn btn-primary btn-sm"
                                @click="setType"
                                :disabled="!hasPlacedWTokenAddress" v-html="$t('ProjectDashboardStageSetButton')">
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

    const PROJ_TYPES = {0: 'ProjectTypeBasic', 1: 'ProjectTypeOracle', 2: 'ProjectTypeTender'};


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
        name: 'StageSetType',
        template: '#StageSetTypeTemplate',
        watch: {
            storedList:
            {
                handler(value)
                {
                  this.$emit('input', value);
                },

                immediate: true
            }
        },
        data() {
            return {
                placeTokensLoading: false,
                placeTokensForm: {
                    value: null
                },
                error: false,
                value: '',
                project_types: [this.$t('ProjectTypeBasic'), this.$t('ProjectTypeOracle'), this.$t('ProjectTypeTender')],
                current_type: null,
                crowdsale_project: window.PROJECT,
            };
        },
        computed: {
            ...ProjectNS.mapState({
                currentProject: "currentProject",
            }),
            ...ProjectNS.mapGetters([
                'hasAllowance',
                'hasPlacedWTokenAddress',
                'tokensAmountThatApprovedToPlaceByTokenOwnerToNumber',
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
            disable(){
                if(this.placeTokensForm.value && this.currentProject.tokensAmountThatApprovedToPlaceByTokenOwner){
                    const value = toWeiDecimals(this.placeTokensForm.value, this.currentProject.decimals);
                    const limit = new BigNumber(this.currentProject.tokensAmountThatApprovedToPlaceByTokenOwner);

                    return !value.greaterThan(0) || !value.lessThanOrEqualTo(limit)
                }
                return true;
            },
            isErrorTx() {
                return this.TransactionsList && this.TransactionsList.length
                    ? this.TransactionsList.find((tr) => {
                        return tr.token
                        && tr.name
                        && tr.hash
                        && tr.status
                        && tr.token === this.currentProject.tokenAddress
                        && tr.name === "PlaceTokens"
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
                        && tr.name === "PlaceTokens"
                        && tr.status === "pending"
                            ? tr
                            : false
                    })
                    : false;
            }
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

            select_type: function(e)
            {
               this.value = e;
            },
            async setType()
            {
                if(this.currentProject.crowdsaleAddress)
                {
                    try
                    {
                        const {W12CrowdsaleFactory} = await this.fetchLedger(this.currentProject.version);
                        const {web3} = await Connector.connect();
                        const W12Crowdsale = W12CrowdsaleFactory.at(this.currentProject.crowdsaleAddress);

                        var tmp = 0;

                        if(this.value == this.project_types[0])
                        {
                            tmp = 0;
                        }
                        if(this.value == this.project_types[1])
                        {
                            tmp = 1;
                        }
                        if(this.value == this.project_types[2])
                        {
                            tmp = 2;
                        }

                        const tx = await W12Crowdsale.methods.setProjectType(tmp, {from: this.currentAccount});
                            this.$store.commit(`Transactions/${UPDATE_TX}`, {
                                crowdsale: this.currentProject.crowdsaleAddress,
                                name: "set type",
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
            async getType()
            {
                 if(this.currentProject.crowdsaleAddress)
                 {
                     try
                     {
                         const {W12CrowdsaleFactory} = await this.fetchLedger(this.currentProject.version);
                         const W12Crowdsale = W12CrowdsaleFactory.at(this.currentProject.crowdsaleAddress);
                         const tmp = await W12Crowdsale.methods.getProjectType({from: this.currentAccount});

                         this.current_type = this.project_types[parseInt(tmp.toString())];

                         this.currentProject.PROJ_TYPE = parseInt(tmp.toString());
                     }
                     catch(e)
                     {
                         this.error = errorMessageSubstitution(e);
                     }
                 }
            },


        },
        mounted: function(e)
        {
            setInterval(async () =>
            {
                console.log('----------------------------');
                console.log(this.currentProject.crowdsaleAddress);
                this.getType();
            }, 3000);        }

    };
</script>
