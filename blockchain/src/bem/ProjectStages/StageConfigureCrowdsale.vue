<template>
    <div class="ProjectStages__stage">
        <div class="row align-items-center justify-content-left">
            <div class="col-auto">
                <span class="ProjectDashboard__step-badge step-badge badge badge-pill badge-light">4</span>
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
                {{currentProject.crowdSaleInformation.tokensForSaleAmount | toEth}} {{currentProject.symbol}}
            </div>
            <div class="ProjectDashboard__configureCrowdsale col-12 text-left">
                <div class="pm-2" v-if="isPendingTx">
                    <p class="py-2">{{ $t('WaitingConfirm') }}:</p>
                    <b-tag class="py-2">{{isPendingTx.hash}}</b-tag>
                </div>
                <div v-if="!isPendingTx && !projectMeta.loadingProject">
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
                                <b-input placeholder="ETH"
                                         type="number"
                                         min="0"
                                         :step="0.000000000000000001"
                                         @keyup.enter.native="initCrawdsale"
                                         v-model="crowdsaleInitForm.price"
                                         icon="ethereum">
                                </b-input>
                            </b-field>
                        </div>
                        <div class="form-group">
                            <label for="AmountForSale">{{ $t('ProjectDashboardStageConfigureCrowdsaleAmountForSaleLabel')
                                }}</label>
                            <b-field id="AmountForSale">
                                <b-input :placeholder="$t('ProjectDashboardStagePlaceAmountPlaceholder', {tokensAmount: tokensForSaleAmountToNumber})"
                                         type="number"
                                         :max="tokensForSaleAmountToNumber"
                                         min="0"
                                         :step="0.000000000000000001"
                                         @keyup.enter.native="initCrawdsale"
                                         v-model="crowdsaleInitForm.amountForSale"
                                         icon="shopping">
                                </b-input>
                            </b-field>
                        </div>
                        <b-notification class="ProjectStages__errorStage" v-if="error" @close="error = false" type="is-danger" has-icon>
                            {{ error }}
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
                                <b-input :placeholder="$t('ProjectDashboardStagePlaceAmountPlaceholder', {tokensAmount: tokensForAddCrowdsale})"
                                         type="number"
                                         min="0"
                                         :step="0.000000000000000001"
                                         :max="tokensForAddCrowdsale"
                                         v-model="crowdsaleInitForm.amountForSale"
                                         @keyup.enter.native="addTokensToCrowdSale"
                                         icon="shopping">
                                </b-input>
                            </b-field>
                        </div>
                        <b-notification class="ProjectStages__errorStage" v-if="error" @close="error = false" type="is-danger" has-icon>
                            {{ error }}
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

        <b-loading :is-full-page="false" :active.sync="initCrawdsaleLoading" :can-cancel="true"></b-loading>
    </div>
</template>

<script>
    import './default.scss';
    import Connector from 'lib/Blockchain/DefaultConnector.js';
    import {waitTransactionReceipt} from 'lib/utils.js';

    import {createNamespacedHelpers} from "vuex";
    import {UPDATE_TX} from "store/modules/Transactions.js";
    const ConfigNS = createNamespacedHelpers('Config');
    const ProjectNS = createNamespacedHelpers("Project");
    const LedgerNS = createNamespacedHelpers("Ledger");
    const AccountNS = createNamespacedHelpers("Account");
    const TransactionsNS = createNamespacedHelpers("Transactions");
    import { CONFIRM_TX } from "store/modules/Transactions.js";

    const web3 = new Web3();
    const BigNumber = web3.BigNumber;

    export default {
        name: 'StageConfigureCrowdsale',
        template: '#StageConfigureCrowdsaleTemplate',
        watch: {},
        filters: {
            toEth(value) {
                value = new BigNumber(value);
                return web3.fromWei(value, 'ether').toString();
            },
        },
        data() {
            return {
                initCrawdsaleLoading: false,
                crowdsaleInitForm: {
                    amountForSale: null,
                    price: null
                },
                error: false,
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
                if(this.tokensForSaleAmountToNumber
                    && this.crowdsaleInitForm.amountForSale
                    && this.crowdsaleInitForm.price){
                    if(parseFloat(this.crowdsaleInitForm.price) > 0
                        && parseFloat(this.crowdsaleInitForm.amountForSale) <= parseFloat(this.tokensForSaleAmountToNumber)){
                        return false;
                    }
                }
                return true;
            },
            disableAdd(){
                if(this.tokensForAddCrowdsale && this.crowdsaleInitForm.amountForSale){
                    if(parseFloat(this.crowdsaleInitForm.amountForSale) > 0
                        && parseFloat(this.crowdsaleInitForm.amountForSale) <= parseFloat(this.tokensForAddCrowdsale)){
                        return false;
                    }
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

            async initCrawdsale() {
                const data = this.crowdsaleInitForm;
                const amountForSale = (new web3.BigNumber(web3.toWei(data.amountForSale, 'ether') || 0)).toString();
                const price = (new web3.BigNumber(web3.toWei(data.price, 'ether') || 0)).toString();

                this.initCrawdsaleLoading = true;

                try {
                    const {W12ListerFactory} = await this.LedgerFetch();
                    const W12Lister = W12ListerFactory.at(this.W12Lister.address);

                    const connectedWeb3 = (await Connector.connect()).web3;

                    const tx = await W12Lister.methods.initCrowdsale(
                        this.currentProject.tokenAddress,
                        amountForSale,
                        price
                    );
                    this.$store.commit(`Transactions/${UPDATE_TX}`, {
                        token: this.currentProject.tokenAddress,
                        name: "ConfigCrowdSale",
                        hash: tx,
                        status: "pending"
                    });
                    await waitTransactionReceipt(tx, connectedWeb3);
                } catch (e) {
                    this.error = e.message;
                }

                this.initCrawdsaleLoading = false;
            },
            async addTokensToCrowdSale() {
                    if (this.disableAdd) return;
                    const data = this.crowdsaleInitForm;
                    const amountForSale = new web3.BigNumber(web3.toWei(data.amountForSale, 'ether') || 0);

                    this.initCrawdsaleLoading = true;

                    try {
                        const {W12ListerFactory} = await this.LedgerFetch();
                        const W12Lister = W12ListerFactory.at(this.W12Lister.address);

                        const connectedWeb3 = (await Connector.connect()).web3;

                        const tx = await W12Lister.methods.addTokensToCrowdsale(
                            this.currentProject.tokenAddress,
                            amountForSale.toString(),
                        );
                        this.$store.commit(`Transactions/${UPDATE_TX}`, {
                            token: this.currentProject.tokenAddress,
                            name: "ConfigCrowdSale",
                            hash: tx,
                            status: "pending"
                        });

                        await waitTransactionReceipt(tx, connectedWeb3);
                    } catch (e) {
                        this.error = e.message;
                    }

                    this.initCrawdsaleLoading = false;
            },
        },
    }
</script>