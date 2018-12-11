<template>
    <div class="ProjectStages__stage">
        <div class="row align-items-center justify-content-left">
            <div class="col-auto">
                <span class="ProjectDashboard__step-badge step-badge badge badge-pill badge-light">5</span>
            </div>
            <div class="col-sm-4">
                {{ $t('ProjectDashboardStageConfigureCrowdsale') }}
            </div>
            <div class="col-sm-3 text-center">
                <b-tag v-if="!isCrowdsaleInited"
                       type="is-success">{{ $t('ProjectDashboardStageConfigureCrowdsaleStatusPending') }}
                </b-tag>
                <b-tag v-else type="is-success">{{ $t('ProjectDashboardStageConfigureCrowdsaleStatusInitialized') }}
                </b-tag>

            </div>
            <div v-if="isCrowdsaleInited" class="col-sm text-right">
                {{currentProject.crowdSaleInformation.tokenPrice}} ETH<br>
                {{ toEth(currentProject.crowdSaleInformation.tokensForSaleAmount) }} {{currentProject.symbol}}
            </div>
            <div class="ProjectDashboard__configureCrowdsale col-12 text-left">
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
                <div v-if="!isPendingTx && !isErrorTx && !projectMeta.loadingProject">
                    <b-tag class="ProjectDashboard__initCrowdsaleAddress" v-if="isCrowdsaleInited"
                           type="is-info">{{ currentProject.tokenCrowdsaleAddress }}
                    </b-tag>

                    <div v-else-if="hasPlacedWTokenAddress && !isCrowdsaleInited" class="text-left">
                        <b-notification class="ProjectStages__errorStage" type="is-success">
                            {{ $t('ProjectDashboardStagePlaceCongratulations', {amount: tokensForSaleAmountToNumber, symbol: currentProject.symbol }) }}
                        </b-notification>
                        <div class="form-group">
                            <label for="BaseTokenPrice">{{ $t('ProjectDashboardStageConfigureCrowdsalePrice') }}</label>
                            <b-field id="BaseTokenPrice">
                                <b-icon icon="ethereum"></b-icon>
                                <cleave
                                        placeholder="ETH"
                                        v-model="crowdsaleInitForm.price"
                                        :options="optionsNumberPrice"
                                        class="form-control"
                                        name="BaseTokenPrice"
                                        min="0"
                                        :max="currentProject.ownerBalance"
                                        @keyup.enter.native="initCrawdsale"
                                ></cleave>
                            </b-field>
                        </div>
                        <div class="form-group">
                            <label for="AmountForSale">{{ $t('ProjectDashboardStageConfigureCrowdsaleAmountForSaleLabel')
                                }}</label>
                            <b-field id="AmountForSale">
                                <b-icon icon="shopping"></b-icon>
                                <cleave
                                        :placeholder="$t('ProjectDashboardStagePlaceAmountPlaceholder', {tokensAmount: tokensForSaleAmountToNumber})"
                                        v-model="crowdsaleInitForm.amountForSale"
                                        :options="optionsNumber"
                                        class="form-control"
                                        name="BaseTokenPrice"
                                        @keyup.enter.native="initCrawdsale"
                                ></cleave>
                            </b-field>
                        </div>
                        <b-notification class="ProjectStages__errorStage" v-if="error" @close="error = false" type="is-danger" has-icon>
                            {{ $t(error) }}
                        </b-notification>
                        <div class="text-right">
                            <button class="btn btn-primary btn-sm" :disabled="disable" @click="initCrawdsale">{{
                                $t('ProjectDashboardStageConfigureCrowdsaleInitButton') }}
                            </button>
                        </div>
                    </div>
                    <div class="pt-2" v-if="isCrowdsaleInited && hasPlacedWTokenAddress && tokensForAddCrowdsale !== '0'">
                        <div class="form-group">
                            <label for="AmountForSale">{{ $t('ProjectDashboardStageConfigureCrowdsaleAddTokensLabel') }}</label>
                            <b-field id="AmountForSale">
                                <b-icon icon="shopping"></b-icon>
                                <cleave
                                        :placeholder="$t('ProjectDashboardStagePlaceAmountPlaceholder', {tokensAmount: tokensForAddCrowdsale})"
                                        v-model="crowdsaleInitForm.amountForSale"
                                        :options="optionsNumber"
                                        class="form-control"
                                        @keyup.enter.native="addTokensToCrowdSale"
                                        icon="shopping"
                                ></cleave>
                            </b-field>
                        </div>
                        <b-notification class="ProjectStages__errorStage" v-if="error" @close="error = false" type="is-danger" has-icon>
                            {{ $t(error) }}
                        </b-notification>
                        <div class="text-right">
                            <button class="btn btn-primary btn-sm" :disabled="disableAdd" @click="addTokensToCrowdSale">{{
                                $t('ProjectDashboardStageConfigureCrowdsaleAddButton') }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <b-loading :is-full-page="false" :active.sync="initCrawdsaleLoading"></b-loading>
    </div>
</template>

<script>
    import './default.scss';
    import Connector from 'lib/Blockchain/DefaultConnector.js';
    import { waitTransactionReceipt, formatNumber, toWeiDecimals, fromWeiDecimals, fromWeiDecimalsString, errorMessageSubstitution} from 'lib/utils.js';

    import {createNamespacedHelpers} from "vuex";
    import {UPDATE_TX} from "store/modules/Transactions.js";
    const ConfigNS = createNamespacedHelpers('Config');
    const ProjectNS = createNamespacedHelpers("Project");
    const LedgerNS = createNamespacedHelpers("Ledger");
    import Web3 from 'web3';
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
        name: 'StageConfigureCrowdsale',
        template: '#StageConfigureCrowdsaleTemplate',
        watch: {},
        data() {
            return {
                initCrawdsaleLoading: false,
                crowdsaleInitForm: {
                    amountForSale: null,
                    price: null
                },
                error: false,
                optionsNumberPrice: {
                    prefix: '',
                    numeral: true,
                    numeralPositiveOnly: true,
                    noImmediatePrefix: true,
                    rawValueTrimPrefix: true,
                    numeralIntegerScale: 36,
                    numeralDecimalScale: 18
                }
            };
        },
        computed: {
            ...ProjectNS.mapState({
                currentProject: "currentProject",
                projectMeta: "meta"
            }),
            ...ProjectNS.mapGetters([
                'hasAllowance',
                'hasPlacedWTokenAddress',
                'tokensAmountThatApprovedToPlaceByTokenOwnerToNumber',
                'ownerBalance',
                'isCrowdsaleInited',
                'tokensForAddCrowdsale',
                'tokensForSaleAmountToNumber'
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
                return this.tokensForSaleAmountToNumber ? this.tokensForSaleAmountToNumber.length : 0;
            },
            isErrorTx() {
                return this.TransactionsList && this.TransactionsList.length
                    ? this.TransactionsList.find((tr) => {
                        return tr.token
                        && tr.name
                        && tr.hash
                        && tr.status
                        && tr.token === this.currentProject.tokenAddress
                        && tr.name === "ConfigCrowdSale"
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
                        && tr.name === "ConfigCrowdSale"
                        && tr.status === "pending"
                            ? tr
                            : false
                    })
                    : false;
            },
            disable() {
                if(this.tokensForSaleAmountToNumber && this.crowdsaleInitForm.amountForSale && this.crowdsaleInitForm.price){
                    const value = new BigNumber(this.crowdsaleInitForm.amountForSale);
                    const price = new BigNumber(this.crowdsaleInitForm.price);
                    const limit = new BigNumber(this.tokensForSaleAmountToNumber);

                    return !(price.gt(0) && value.gt(0) && value.lte(limit));
                }
                return true;
            },
            disableAdd(){
                if(this.tokensForAddCrowdsale && this.crowdsaleInitForm.amountForSale){
                    const value = new BigNumber(this.crowdsaleInitForm.amountForSale);
                    const limit = new BigNumber(this.tokensForSaleAmountToNumber);

                    return !(value.gt(0) && value.lte(limit))
                }
                return true;
            }
        },
        methods: {
            ...LedgerNS.mapActions({
                LedgerFetch: 'fetch',
            }),
            ...ProjectNS.mapActions({
                updateTokensApprovedToPlaceValue: 'updateTokensApprovedToPlaceValue',
                updatePlacedTokenStatus: 'updatePlacedTokenStatus',
                fetchProject: "fetchProject",
                fetchCrowdSaleAddressAndInfo: "fetchCrowdSaleAddressAndInfo",
                updateTokenInfo: "updateTokenInfo",
                updateOwnerBalance: "updateOwnerBalance",
                upTokenAfterEvent: "upTokenAfterEvent"
            }),
            ...TransactionsNS.mapActions({
                TransactionsRetry: "retry"
            }),
            toEth(value) {
                value = new BigNumber(value);
                return this.currentProject ? fromWeiDecimalsString(value, this.currentProject.decimals) : "";
            },
            async initCrawdsale() {
                const data = this.crowdsaleInitForm;
                const amountForSale = toWeiDecimals(data.amountForSale, this.currentProject.decimals);
                const price = new web3.BigNumber(web3.toWei(data.price, 'ether') || 0);

                this.initCrawdsaleLoading = true;

                try {
                    const {W12ListerFactory} = await this.LedgerFetch(this.currentProject.version);
                    const W12Lister = W12ListerFactory.at(this.currentProject.listerAddress);

                    const connectedWeb3 = (await Connector.connect()).web3;

                    const tx = await W12Lister.methods.initCrowdsale(
                        this.currentProject.tokenAddress,
                        amountForSale,
                        price,
                        {from: this.currentAccount}
                    );
                    this.$store.commit(`Transactions/${UPDATE_TX}`, {
                        token: this.currentProject.tokenAddress,
                        name: "ConfigCrowdSale",
                        hash: tx,
                        status: "pending"
                    });
                    await waitTransactionReceipt(tx, connectedWeb3);
                } catch (e) {
                    this.error = errorMessageSubstitution(e);
                }

                this.initCrawdsaleLoading = false;
            },
            async addTokensToCrowdSale() {
                    if (this.disableAdd) return;
                    const data = this.crowdsaleInitForm;
                    const amountForSale = toWeiDecimals(data.amountForSale, this.currentProject.decimals);

                    this.initCrawdsaleLoading = true;

                    try {
                        const {W12ListerFactory} = await this.LedgerFetch(this.currentProject.version);
                        const W12Lister = W12ListerFactory.at(this.currentProject.listerAddress);

                        const connectedWeb3 = (await Connector.connect()).web3;

                        const tx = await W12Lister.methods.addTokensToCrowdsale(
                            this.currentProject.tokenAddress,
                            amountForSale,
                        );
                        this.$store.commit(`Transactions/${UPDATE_TX}`, {
                            token: this.currentProject.tokenAddress,
                            name: "ConfigCrowdSale",
                            hash: tx,
                            status: "pending"
                        });

                        await waitTransactionReceipt(tx, connectedWeb3);
                    } catch (e) {
                        this.error = errorMessageSubstitution(e);
                    }

                    this.initCrawdsaleLoading = false;
            },
        },
    }
</script>
