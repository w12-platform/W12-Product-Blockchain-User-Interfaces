<template>
    <div class="ProjectStages__stage">
        <div class="row align-items-center justify-content-left">
            <div class="col-auto">
                <span class="ProjectDashboard__step-badge step-badge badge badge-pill badge-light">9</span>
            </div>
            <div class="col-sm-4"><span v-html="$t('ProjectDashboardStageAddress')"></span>
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
                <b-tag v-if="addr_flag" class="ProjectDashboard__placedWTokenAddress"
                       type="is-info">{{address}}
                </b-tag>
            </div>
            <div class="ProjectDashboard__placeForm col-12 text-right" v-if="!isPendingTx && !isErrorTx">
                <div class="text-left">
                    <div class="form-group">
                        <label for="SetAddress" v-html="$t('ProjectDashboardStageAddressLabel')"></label>

                   			<b-field>
				                    <input v-model="value" type="text" placeholder="0x..." class="form-control"/>
			                </b-field>


                    </div>
                    <b-notification class="ProjectStages__errorStage" v-if="error" @close="error = false" type="is-danger" has-icon>
                        {{ error }}
                    </b-notification>

                    <b-notification class="ProjectStages__errorStage" v-if="addressError" :closable="false" type="is-danger" has-icon><span v-html="$t('ProjectDashboardStageAddressError')"></span>
                    </b-notification>
                    <div class="text-right">
                        <button
                                class="btn btn-primary btn-sm"
                                @click="setAddress"
                                :disabled="disable" v-html="$t('ProjectDashboardStageSetButton')">
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <b-loading :is-full-page="false" :active.sync="placeTokensLoading"></b-loading>
    </div>
</template>

<script>

const log = function(...val) {
  var stack;
  stack = new Error().stack;
  console.log(...val);
  console.log(stack);
};

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
        name: 'StageSetAddress',
        template: '#StageSetAddressTemplate',
        watch: {},
        data() {
            return {
                placeTokensLoading: false,
                error: false,
                value: '',
                address: '',
                addr_flag: false,
                addressError: false
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
            disable(){
                if(this.currentProject.fundData)
                {
                    if(this.value.length == 42 && this.value.startsWith('0x'))
                    {
                        return false;
                    }
                }
                return true;
            },
        },
        methods: {
            ...ProjectNS.mapActions({
                fetchProjects: "fetchProjects",
                upTokenAfterEvent: 'upTokenAfterEvent',
                updateFundInformation: "updateFundInformation",
            }),
            ...LedgerNS.mapActions({
                fetchLedger: 'fetch',
            }),
            ...TransactionsNS.mapActions({
                TransactionsRetry: "retry"
            }),

            async setAddress()
            {
                if(this.currentProject.fundData)
                {

                    if(this.value.length == 42 && this.value.startsWith('0x'))
                    {
                        await this.updateFundInformation({Token: this.currentProject});
                        this.loading = true;
                        try
                        {
                            const fundAddress = this.currentProject.fundData.address;
                            const {W12FundFactory} = await this.fetchLedger(this.currentProject.version);
                            const {web3} = await Connector.connect();
                            const W12Fund = W12FundFactory.at(fundAddress);

                            this.currentProject.W12Fund = W12Fund;

                            const tx = await W12Fund.methods.setServiceWallet(this.value, {from: this.currentAccount});
                            this.$store.commit(`Transactions/${UPDATE_TX}`, {
                                fund: this.currentProject.fundData.address,
                                name: "set address",
                                hash: tx,
                                status: "pending"
                            });
                            await waitTransactionReceipt(tx, web3);
                        }
                        catch(e)
                        {
                            this.error = errorMessageSubstitution(e);
                        }
                        this.loading = false;
                    }
                    else
                    {
                        this.addressError = true;
                    }
                }
            },
            async getAddress()
            {
                if(this.currentProject.W12Fund)
                {
                    try
                    {
                        this.address = await this.currentProject.W12Fund.methods.getServiceWallet({from: this.currentAccount});
                        this.addr_flag = true;
                    }
                    catch(e)
                    {
                        console.log(e);
                        this.error = errorMessageSubstitution(e);
                    }
                    this.loading = false;
                }
                else if(this.currentProject.fundData)
                {
                    await this.updateFundInformation({Token: this.currentProject});

                    try
                    {
                        const fundAddress = this.currentProject.fundData.address;
                        const {W12FundFactory} = await this.fetchLedger(this.currentProject.version);
                        const W12Fund = W12FundFactory.at(fundAddress);

                        this.currentProject.W12Fund = W12Fund;

                        this.address = await this.currentProject.W12Fund.methods.getServiceWallet({from: this.currentAccount});
                        this.addr_flag = true;

                    } catch (e)
                    {
                        this.error = errorMessageSubstitution(e);
                    }
                    this.loading = false;
                }
            },
        },
        mounted: function()
        {
            this.update_flag = true;
            setInterval(async ()=>
            {
                if(this.currentProject && this.update_flag && !this.currentProject.fundData)
                {
                    await this.updateFundInformation({Token: this.currentProject});
                }

                if(this.update_flag)
                {
                    this.getAddress();
                }
            }, 3000);
        }
    };
</script>
