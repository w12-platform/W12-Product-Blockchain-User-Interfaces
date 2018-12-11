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
                <div class="pm-2" v-if="isErrorTx">
                    <p class="py-2">{{ $t('TransactionFailed') }}:</p>
                    <b-tag class="py-2">{{isErrorTx.hash}}</b-tag>
                    <div class="pt-2 text-left">
                        <button class="btn btn-primary btn-sm" @click="TransactionsRetry(isErrorTx)">{{ $t('ToRetry') }}</button>
                    </div>
                </div>
                <b-tag class="ProjectDashboard__placedWTokenAddress" v-if="hasPlacedWTokenAddress"
                       type="is-info">{{ currentProject.placedTokenAddress }}
                </b-tag>
            </div>
            <div class="ProjectDashboard__placeForm col-12 text-right" v-if="!isPendingTx && !isErrorTx">
                <div v-if="hasAllowance" class="text-left">
                    <div class="form-group">
                        <label for="PlaceAmount">{{ $t('ProjectDashboardStagePlaceAmountLabel') }}</label>
                        <cleave
                                :placeholder="$t('ProjectDashboardStagePlaceAmountPlaceholder', {tokensAmount: tokensAmountThatApprovedToPlaceByTokenOwnerToNumber})"
                                id="SpendFrom"
                                v-model="placeTokensForm.value"
                                :options="optionsNumber"
                                class="form-control"
                                name="PlaceAmount"
                                min="0"
                                :max="tokensAmountThatApprovedToPlaceByTokenOwnerToNumber"
                                @keyup.enter.native="placeTokens"
                        ></cleave>
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

        <b-loading :is-full-page="false" :active.sync="placeTokensLoading"></b-loading>
    </div>
</template>

<script>
    import './default.scss';
    import Connector from 'lib/Blockchain/DefaultConnector.js';
    import { waitTransactionReceipt, formatNumber, toWeiDecimals, fromWeiDecimals, errorMessageSubstitution} from 'lib/utils.js';
    import {UPDATE_TX} from "store/modules/Transactions.js";
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
            amountError(){
                if(this.placeTokensForm.value && this.currentProject.tokensAmountThatApprovedToPlaceByTokenOwner){
                    const value = toWeiDecimals(this.placeTokensForm.value, this.currentProject.decimals);
                    const limit = new BigNumber(this.currentProject.tokensAmountThatApprovedToPlaceByTokenOwner);

                    return !value.lessThanOrEqualTo(limit)
                }
                return false;
            },
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
            }),
            ...LedgerNS.mapActions({
                LedgerFetch: 'fetch',
            }),
            ...TransactionsNS.mapActions({
                TransactionsRetry: "retry"
            }),
            async placeTokens() {
                if(this.disable) return;

                const value = toWeiDecimals(this.placeTokensForm.value, this.currentProject.decimals);
                const limit = new BigNumber(this.currentProject.tokensAmountThatApprovedToPlaceByTokenOwner);

                if (!value.greaterThan(0) || !value.lessThanOrEqualTo(limit)) {
                    return;
                }

                this.placeTokensLoading = true;

                try {
                    const {W12ListerFactory} = await this.LedgerFetch(this.currentProject.version);
                    const W12Lister = W12ListerFactory.at(this.currentProject.listerAddress);
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
                    this.error = errorMessageSubstitution(e);
                }

                this.placeTokensLoading = false;
            },
        },
    };
</script>
