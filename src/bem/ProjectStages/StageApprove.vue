<template>
    <div class="ProjectStages__stage">
        <div class="row align-items-center justify-content-left">
            <div class="col-auto">
                <span class="ProjectDashboard__step-badge step-badge badge badge-pill badge-light">2</span>
            </div>
            <div class="col-sm-4">
                {{ $t('ProjectDashboardStageApprove') }}
            </div>
            <div class="col-sm-2 text-center">
                <b-tag v-if="!(hasAllowance || hasPlacedWTokenAddress)"
                       type="is-success">{{ $t('ProjectDashboardStageApproveStatusPending') }}
                </b-tag>
                <b-tag v-else type="is-success">{{ $t('ProjectDashboardStageApproveStatusApproved') }}</b-tag>
            </div>
            <div class="col-sm text-right">
                <span v-if="hasAllowance && !isPendingTx && !isErrorTx">{{ tokensAmountThatApprovedToPlaceByTokenOwnerToNumber }}</span>
                <div v-else class="text-left">
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
                    <b-tag class="ProjectDashboard__approveInfo" type="is-info" v-if="!isPendingTx && !isErrorTx">
                        {{ $t('ProjectDashboardStageApproveSpendFrom') }} {{ currentAccount }}
                    </b-tag>
                    <div v-if="!isPendingTx && !isErrorTx">
                        <div v-if="ownerBalance === '0'">
                            <b-tag class="ProjectDashboard__approveNoTokens" type="is-danger">
                                {{ $t('ProjectDashboardStageApproveNoTokens') }}
                            </b-tag>
                        </div>
                        <div v-else>
                            <div class="form-group">
                                <label for="SpendFrom">{{ $t('ProjectDashboardStageApproveAmountLabel') }}</label>
                                <cleave
                                        :placeholder="$t('ProjectDashboardStageApproveAmountPlaceholder', {ownerBalance: maxAmountFormat})"
                                        id="SpendFrom"
                                        v-model="approveForm.value"
                                        :options="optionsNumber"
                                        class="form-control"
                                        name="SpendFrom"
                                        @keyup.enter.native="approveTokensToSpend"
                                ></cleave>
                            </div>
                            <b-notification class="ProjectStages__errorStage" v-if="error" @close="error = false"
                                            type="is-danger" has-icon>{{ error }}
                            </b-notification>
                            <b-notification class="ProjectStages__errorStage" v-if="amountError" :closable="false" type="is-danger" has-icon>
                                {{ $t('ProjectDashboardStageApproveInsufficientTokens') }}
                            </b-notification>
                            <div class="text-right">
                                <button
                                        class="btn btn-primary btn-sm"
                                        @click="approveTokensToSpend"
                                        :disabled="disable">{{ $t('ProjectDashboardStageApproveButton') }}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <b-loading :is-full-page="false" :active.sync="approveTokensToSpendLoading"></b-loading>
        </div>
    </div>
</template>

<script>
    import './default.scss';
    import Connector from 'lib/Blockchain/DefaultConnector.js';
    import {UPDATE_TX} from "store/modules/Transactions.js";
    import {waitTransactionReceipt, formatNumber, toWeiDecimals, errorMessageSubstitution} from 'lib/utils.js';
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
        name: 'StageApprove',
        template: '#StageApproveTemplate',
        watch: {},
        data() {
            return {
                approveTokensToSpendLoading: false,
                approveForm: {
                    value: null
                },
                tx: null,
                error: false,
            };
        },
        computed: {
            ...ProjectNS.mapState({
                currentProject: "currentProject",
                ProjectMeta: "meta",
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

            maxAmount() {
                return this.ownerBalance ? new BigNumber(this.ownerBalance).toFormat(0) : "";
            },
            maxAmountFormat(){
                return formatNumber(this.maxAmount)
            },
            lengthMaxAmount() {
                return this.maxAmount.length;
            },
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

            amountError(){
                const value = this.approveForm.value ? new BigNumber(this.approveForm.value) : null;
                const balance = this.currentProject.ownerBalance ? new BigNumber(this.currentProject.ownerBalance) : null;
                return value && balance ? !(value.gte(0) && value.lte(balance)) : false;
            },
            disable() {
                const value = this.approveForm.value ? new BigNumber(this.approveForm.value) : null;
                const balance = this.currentProject.ownerBalance ? new BigNumber(this.currentProject.ownerBalance) : null;
                return value && balance ? !(value.gt(0) && value.lte(balance)) : true;
            },
            isErrorTx() {
                return this.TransactionsList && this.TransactionsList.length
                    ? this.TransactionsList.find((tr) => {
                        return tr.token
                        && tr.name
                        && tr.hash
                        && tr.status
                        && tr.token === this.currentProject.tokenAddress
                        && tr.name === "ApproveTokens"
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
                        && tr.name === "ApproveTokens"
                        && tr.status === "pending"
                            ? tr
                            : false
                    })
                    : false;
            }
        },
        methods: {
            ...LedgerNS.mapActions({
                LedgerFetch: 'fetch',
            }),
            ...TransactionsNS.mapActions({
                TransactionsRetry: "retry"
            }),
            async approveTokensToSpend() {
                if(this.disable) return;

                const value = toWeiDecimals(this.approveForm.value, this.currentProject.decimals);

                this.approveTokensToSpendLoading = true;

                try {
                    const {ERC20Factory} = await this.LedgerFetch(this.currentProject.version);
                    const ERC20 = ERC20Factory.at(this.currentProject.tokenAddress);
                    const connectedWeb3 = (await Connector.connect()).web3;
                    const tx = await ERC20.methods.approve(this.currentProject.listerAddress, value);
                    this.$store.commit(`Transactions/${UPDATE_TX}`, {
                        token: this.currentProject.tokenAddress,
                        name: "ApproveTokens",
                        hash: tx,
                        status: "pending"
                    });
                    await waitTransactionReceipt(tx, connectedWeb3);
                } catch (e) {
                    this.error = errorMessageSubstitution(e);
                }

                this.approveTokensToSpendLoading = false;
            },
        },
    };
</script>
