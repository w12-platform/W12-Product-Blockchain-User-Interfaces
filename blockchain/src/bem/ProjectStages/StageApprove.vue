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
                <span v-if="hasAllowance && !isPendingTx">{{ tokensAmountThatApprovedToPlaceByTokenOwnerToNumber }}</span>
                <div v-else class="text-left">
                    <div class="pm-2" v-if="isPendingTx">
                        <p class="py-2">{{ $t('WaitingConfirm') }}:</p>
                        <b-tag class="py-2">{{isPendingTx.hash}}</b-tag>
                    </div>
                    <b-tag class="ProjectDashboard__approveInfo" type="is-info" v-if="!isPendingTx">
                        {{ $t('ProjectDashboardStageApproveSpendFrom') }} {{ currentAccount }}
                    </b-tag>
                    <div v-if="!isPendingTx">
                        <div v-if="ownerBalance === '0'">
                            <b-tag class="ProjectDashboard__approveNoTokens" type="is-danger">
                                {{ $t('ProjectDashboardStageApproveNoTokens') }}
                            </b-tag>
                        </div>
                        <div v-else>
                            <div class="form-group">
                                <label for="SpendFrom">{{ $t('ProjectDashboardStageApproveAmountLabel') }}</label>
                                <input
                                        min="0"
                                        :max="currentProject.ownerBalance"
                                        class="form-control"
                                        id="SpendFrom"
                                        @keyup.enter="approveTokensToSpend"
                                        v-model.lazy="approveForm.value"
                                        v-money="{}">
                                <div class="description">{{ $t('ProjectDashboardStageApproveAmountPlaceholder', {ownerBalance}) }}</div>
                            </div>
                            <b-notification class="ProjectStages__errorStage" v-if="error" @close="error = false"
                                            type="is-danger" has-icon>{{ error }}
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

            <b-loading :is-full-page="false" :active.sync="approveTokensToSpendLoading" :can-cancel="true"></b-loading>
        </div>
    </div>
</template>

<script>
    import './default.scss';
    import Connector from 'lib/Blockchain/DefaultConnector.js';
    import {UPDATE_TX} from "store/modules/Transactions.js";
    import {waitTransactionReceipt, formatNumber} from 'lib/utils.js';

    import {createNamespacedHelpers} from "vuex";

    const ConfigNS = createNamespacedHelpers('Config');
    const ProjectNS = createNamespacedHelpers("Project");
    const LedgerNS = createNamespacedHelpers("Ledger");
    const AccountNS = createNamespacedHelpers("Account");
    const TransactionsNS = createNamespacedHelpers("Transactions");
    const web3 = new Web3();
    const BigNumber = web3.BigNumber;

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

            disable() {
                const value = formatNumber(this.approveForm.value) || null;
                const balance = parseFloat(this.currentProject.ownerBalance) || null;
                return this.approveForm.value && this.currentProject.ownerBalance
                    ? !(value > 0 && value <= balance)
                    : true;
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

            async approveTokensToSpend() {
                if(this.disable) return;

                const value = new BigNumber(formatNumber(this.approveForm.value));

                this.approveTokensToSpendLoading = true;

                try {
                    const {ERC20Factory} = await this.LedgerFetch();
                    const ERC20 = ERC20Factory.at(this.currentProject.tokenAddress);
                    const connectedWeb3 = (await Connector.connect()).web3;
                    const tx = await ERC20.methods.approve(this.W12Lister.address, web3.toWei(value, 'ether'));
                    this.$store.commit(`Transactions/${UPDATE_TX}`, {
                        token: this.currentProject.tokenAddress,
                        name: "ApproveTokens",
                        hash: tx,
                        status: "pending"
                    });
                    await waitTransactionReceipt(tx, connectedWeb3);
                } catch (e) {
                    this.error = e.message;
                }

                this.approveTokensToSpendLoading = false;
            },
        },
    };
</script>