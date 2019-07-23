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
<!--                <b-tag class="ProjectDashboard__placedWTokenAddress"-->
<!--                       type="is-info">{{currentProject.name}}-->
<!--                </b-tag>-->
            </div>
            <div class="ProjectDashboard__placeForm col-12 text-right" v-if="!isPendingTx && !isErrorTx">
                <div class="text-left">
                    <div class="form-group">
                        <label for="SetAddress" v-html="$t('ProjectDashboardStageAddressLabel')"></label>
                        <cleave
                                placeholder="0x..."
                                id="SpendFrom"
                                v-model="value"
                                class="form-control"
                                name="SetName"
                                @keyup.enter.native="setAddress"
                        ></cleave>
                    </div>
                    <b-notification class="ProjectStages__errorStage" v-if="error" @close="error = false" type="is-danger" has-icon>
                        {{ error }}
                    </b-notification>
                    <div class="text-right">
                        <button
                                class="btn btn-primary btn-sm"
                                @click="setAddress"
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
                value: ''
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
            optionsNumber() {
                return {
                    prefix: '',
                    numeral: true,
                    numeralPositiveOnly: true,
                    noImmediatePrefix: true,
                    rawValueTrimPrefix: true,
                    numeralIntegerScale: this.lengthMaxAmount,
                    numeralDecimalScale: this.currentProject.decimals,
                };
            },
            lengthMaxAmount() {
                return this.maxAmount.length;
            },
            maxAmount() {
                return this.currentProject.tokensAmountThatApprovedToPlaceByTokenOwner
                    ? fromWeiDecimals(this.currentProject.tokensAmountThatApprovedToPlaceByTokenOwner, this.currentProject.decimals).toFormat(0)
                    : "";
            },
            maxAmountFormat(){
                return formatNumber(this.maxAmount)
            },
            disable(){
                // if(this.placeTokensForm.value && this.currentProject.tokensAmountThatApprovedToPlaceByTokenOwner){
                //     const value = toWeiDecimals(this.placeTokensForm.value, this.currentProject.decimals);
                //     const limit = new BigNumber(this.currentProject.tokensAmountThatApprovedToPlaceByTokenOwner);
                //
                //     return !value.greaterThan(0) || !value.lessThanOrEqualTo(limit)
                // }
                // return true;
                return false;
            },
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
            async setAddress() {
                if(this.disable) return;

                const value = toWeiDecimals(this.placeTokensForm.value, this.currentProject.decimals);
                // const limit = new BigNumber(this.currentProject.tokensAmountThatApprovedToPlaceByTokenOwner);
                const limit = 50;

                if (!value.greaterThan(0) || !value.lessThanOrEqualTo(limit)) {
                    return;
                }

                this.placeTokensLoading = true;

                try {
                    const {W12ListerFactory} = await this.fetchLedger(this.currentProject.version);
                    const W12Lister = W12ListerFactory.at(this.currentProject.listerAddress);
                    const connectedWeb3 = (await Connector.connect()).web3;
                    const event = waitContractEventOnce(W12Lister, 'TokenPlaced', {
                        originalToken: this.currentProject.tokenAddress,
                        crowdsale: this.currentProject.tokenCrowdsaleAddress
                    });
                    // const tx = await W12Lister.methods.placeToken(
                    //     this.currentProject.tokenAddress,
                    //     this.currentProject.tokenCrowdsaleAddress,
                    //     value
                    // );
                    this.$store.commit(`Transactions/${UPDATE_TX}`, {
                        token: this.currentProject.tokenAddress,
                        name: "SetAddress",
                        hash: tx,
                        status: "pending"
                    });
                    await this.$nextTick();
                    await waitTransactionReceipt(tx, connectedWeb3);
                    await event;
                    await this.$nextTick();
                    await this.upTokenAfterEvent({Token: this.currentProject});
                    this.$store.commit(`Transactions/${CONFIRM_TX}`, tx);
                } catch (e) {
                    console.error(e);
                    this.error = errorMessageSubstitution(e.message);
                }

                this.placeTokensLoading = false;
            },
            disable(){
                if(this.placeTokensForm.value && this.currentProject.tokensAmountThatApprovedToPlaceByTokenOwner)
                {
                    if(value.length == 0 || value.length > 20)
                    {
                        return false
                    }


                }
                return true;
            },
        },
    };
</script>
