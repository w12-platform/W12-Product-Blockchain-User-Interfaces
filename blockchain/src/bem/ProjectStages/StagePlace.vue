<template>
    <div class="ProjectStages__stage">
        <div class="row align-items-center justify-content-left">
            <div class="col-auto">
                <span class="ProjectDashboard__step-badge step-badge badge badge-pill badge-light">3</span>
            </div>
            <div class="col-sm-4">
                {{ $t('ProjectDashboardStagePlace') }}
            </div>
            <div class="col-sm-2 text-center">
                <b-tag v-if="!hasPlacedWTokenAddress && !hasAllowance"
                       type="is-success">{{ $t('ProjectDashboardStagePlaceStatusPending') }}
                </b-tag>
                <b-tag v-else type="is-success">{{ $t('ProjectDashboardStagePlaceStatusPlaced') }}</b-tag>
            </div>
            <div class="col-12 text-left">
                <div class="pm-2" v-if="isPendingTx">
                    <p class="py-2">{{ $t('WaitingConfirm') }}:</p>
                    <b-tag class="py-2">{{isPendingTx.hash}}</b-tag>
                </div>
                <b-tag class="ProjectDashboard__placedWTokenAddress" v-if="hasPlacedWTokenAddress"
                       type="is-info">{{ currentProject.placedTokenAddress }}
                </b-tag>
            </div>
            <div class="ProjectDashboard__placeForm col-12 text-right" v-if="!isPendingTx">
                <div v-if="hasAllowance" class="text-left">
                    <div class="form-group">
                        <label for="PlaceAmount">{{ $t('ProjectDashboardStagePlaceAmountLabel') }}</label>
                        <input
                                :placeholder="$t('ProjectDashboardStagePlaceAmountPlaceholder', {tokensAmount: tokensAmountThatApprovedToPlaceByTokenOwnerToNumber})"
                                min="0"
                                :max="tokensAmountThatApprovedToPlaceByTokenOwnerToNumber"
                                class="form-control"
                                id="PlaceAmount"
                                @keyup.enter="placeTokens"
                                v-model.lazy="placeTokensForm.value"
                                @focus="onMoneyFormatFocus"
                                @blur="onMoneyFormatBlur"
                                v-money="placeMoneyFormat">
                    </div>
                    <b-notification class="ProjectStages__errorStage" v-if="error" @close="error = false" type="is-danger" has-icon>
                        {{ error }}
                    </b-notification>
                    <b-notification class="ProjectStages__errorStage" v-if="amountError" :closable="false" type="is-danger" has-icon>
                        {{ $t('ProjectDashboardStagePlaceErrorAmount') }}
                    </b-notification>
                    <div class="text-right">
                        <button
                                class="btn btn-primary btn-sm"
                                @click="placeTokens"
                                :disabled="disable">
                            {{ $t('ProjectDashboardStagePlaceButton') }}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <b-loading :is-full-page="false" :active.sync="placeTokensLoading" :can-cancel="true"></b-loading>
    </div>
</template>

<script>
    import './default.scss';
    import Connector from 'lib/Blockchain/DefaultConnector.js';
    import { waitTransactionReceipt, formatNumber } from 'lib/utils.js';
    import {UPDATE_TX} from "store/modules/Transactions.js";

    import {createNamespacedHelpers} from "vuex";

    const ConfigNS = createNamespacedHelpers('Config');
    const ProjectNS = createNamespacedHelpers("Project");
    const LedgerNS = createNamespacedHelpers("Ledger");
    const AccountNS = createNamespacedHelpers("Account");
    const TransactionsNS = createNamespacedHelpers("Transactions");
    const web3 = new Web3();
    const BigNumber = web3.BigNumber;

    const placeMoneyFormatDefault = {};

    export default {
        name: 'StagePlace',
        template: '#StagePlaceTemplate',
        watch: {},
        data() {
            return {
                placeTokensLoading: false,
                placeTokensForm: {
                    value: null
                },
                error: false,
                placeMoneyFormat: false,
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
            amountError(){
                if(this.placeTokensForm.value && this.currentProject.tokensAmountThatApprovedToPlaceByTokenOwner){
                    const value = new BigNumber(web3.toWei(formatNumber(this.placeTokensForm.value), 'ether'));
                    const limit = new BigNumber(this.currentProject.tokensAmountThatApprovedToPlaceByTokenOwner);

                    return !value.lessThanOrEqualTo(limit)
                }
                return false;
            },
            disable(){
                if(this.placeTokensForm.value && this.currentProject.tokensAmountThatApprovedToPlaceByTokenOwner){
                    const value = new BigNumber(web3.toWei(formatNumber(this.placeTokensForm.value), 'ether'));
                    const limit = new BigNumber(this.currentProject.tokensAmountThatApprovedToPlaceByTokenOwner);

                    return !value.greaterThan(0) || !value.lessThanOrEqualTo(limit)
                }
                return true;
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
            }),
            ...LedgerNS.mapActions({
                LedgerFetch: 'fetch',
            }),

            async placeTokens() {
                if(this.disable) return;

                const value = new BigNumber(web3.toWei(formatNumber(this.placeTokensForm.value), 'ether'));
                const limit = new BigNumber(this.currentProject.tokensAmountThatApprovedToPlaceByTokenOwner);

                if (!value.greaterThan(0) || !value.lessThanOrEqualTo(limit)) {
                    return;
                }

                this.placeTokensLoading = true;

                try {
                    const {W12ListerFactory} = await this.LedgerFetch();
                    const W12Lister = W12ListerFactory.at(this.W12Lister.address);
                    const connectedWeb3 = (await Connector.connect()).web3;
                    const tx = await W12Lister.methods.placeToken(
                        this.currentProject.tokenAddress,
                        value
                    );
                    this.$store.commit(`Transactions/${UPDATE_TX}`, {
                        token: this.currentProject.tokenAddress,
                        name: "PlaceTokens",
                        hash: tx,
                        status: "pending"
                    });
                    await waitTransactionReceipt(tx, connectedWeb3);
                } catch (e) {
                    this.error = e.message;
                }

                this.placeTokensLoading = false;
            },
            onMoneyFormatFocus(){
                this.placeMoneyFormat = placeMoneyFormatDefault;
            },
            onMoneyFormatBlur(){
                this.placeMoneyFormat = this.placeTokensForm.value ? placeMoneyFormatDefault : false;
                if(formatNumber(this.placeTokensForm.value) === 0){
                    this.placeTokensForm.value = null;
                    this.placeMoneyFormat = false;
                }
            },
        },
    };
</script>