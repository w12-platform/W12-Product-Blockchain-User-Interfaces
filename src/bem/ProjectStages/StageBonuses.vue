<template>
    <div class="ProjectStages__stage">
        <div class="row align-items-center justify-content-left">
            <div class="col-auto">
                <span class="ProjectDashboard__step-badge step-badge badge badge-pill badge-light">5</span>
            </div>
            <div class="col-sm-5">
                {{ $t('ProjectDashboardStageBonuses') }}
            </div>
            <div class="col-12">
                <div v-if="isCrowdsaleInited && hasPlacedWTokenAddress" class="text-left">
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

                    <div class="ProjectDashboard__bonuses card" v-if="!isPendingTx && !isErrorTx">
                        <div class="card-content">
                            <div class="content" v-if="tokenCrowdSaleStages.length">
                                <div class="ProjectDashboard__stageBonus card"
                                            v-for="(stage, stageIndex) in tokenCrowdSaleStages" :key="stageIndex">
                                    <div class="col-12 pb-4">
                                        <div class="p-3 row align-items-center justify-content-between">
                                            <span class="ProjectDashboard__stageTitle">{{ $t('ProjectDashboardStageBonusesStage') }} #{{ stageIndex+1 }}</span>
                                            <button class="btn btn-primary btn-sm" :disabled="isStartCrowdSale"
                                                    @click="deleteStageAt(stageIndex)">{{
                                                $t('ProjectDashboardStageBonusesRemove') }}
                                            </button>
                                        </div>
                                        <div class="ProjectDashboard__stageBonus col-sm py-2">
                                            <div class="row justify-content-between">
                                                <div class="col-sm py-2">
                                                    <label>{{ $t('ProjectDashboardStageBonusesStartDateLabel')
                                                        }}</label>
                                                    <b-field
                                                            class="ProjectDashboard__dateSelect"
                                                            :type="stageIndex === 0 ? firstStageStartDateFieldType : null"
                                                            :message="stageIndex === 0 ? firstStageStartDateMessage : null"
                                                    >
                                                        <date-picker
                                                                :not-before="getNotBeforeStart(stageIndex)"
                                                                :not-after="getNotAfterStart(stageIndex)"
                                                                v-model="tokenCrowdSaleStages[stageIndex].startDate"
                                                                type="datetime"
                                                                :lang="translationsDef"
                                                                format="YYYY-MM-DD HH:mm"
                                                                :disabled="isStartCrowdSale"
                                                                @change="changeAnyInputsForBonuses"
                                                                confirm
                                                                :time-picker-options="{ start: '00:00', step: '00:10', end: '23:50'}"
                                                        ></date-picker>
                                                    </b-field>
                                                </div>
                                                <div class="col-sm py-2">
                                                    <label>{{ $t('ProjectDashboardStageBonusesEndDateLabel') }}</label>
                                                    <b-field class="ProjectDashboard__dateSelect">
                                                        <date-picker
                                                                :not-before="getNotBeforeEnd(stageIndex)"
                                                                :not-after="getNotAfterEnd(stageIndex)"
                                                                v-model="tokenCrowdSaleStages[stageIndex].endDate"
                                                                type="datetime"
                                                                :lang="translationsDef"
                                                                :disabled="isStartCrowdSale"
                                                                format="YYYY-MM-DD HH:mm"
                                                                @change="changeAnyInputsForBonuses"
                                                                confirm
                                                                :time-picker-options="{ start: '00:00', step: '00:10', end: '23:50'}"
                                                        ></date-picker>
                                                    </b-field>
                                                </div>
                                            </div>
                                            <div class="row justify-content-between">
                                                <div class="col-sm py-2">
                                                    <label for="StageDiscount">{{
                                                        $t('ProjectDashboardStageBonusesDiscountLabel') }}</label>
                                                    <b-field id="StageDiscount">
                                                        <b-input
                                                                type="number"
                                                                min="0"
                                                                max="100"
                                                                :disabled="isStartCrowdSale"
                                                                @input.native="changeAnyInputsForBonuses"
                                                                v-model="tokenCrowdSaleStages[stageIndex].discount"
                                                                icon="sale">
                                                        </b-input>
                                                    </b-field>
                                                </div>
                                                <div class="col-sm py-2">
                                                    <label for="StageVestingDate">{{
                                                        $t('ProjectDashboardStageBonusesVestingDateLabel') }}</label>
                                                    <b-field id="StageVestingDate"
                                                             class="ProjectDashboard__dateSelect">
                                                        <date-picker
                                                                v-model="tokenCrowdSaleStages[stageIndex].vestingDate"
                                                                type="datetime"
                                                                :lang="translationsDef"
                                                                :disabled="isStartCrowdSale"
                                                                format="YYYY-MM-DD HH:mm"
                                                                @change="changeAnyInputsForBonuses"
                                                                :time-picker-options="{ start: '00:00', step: '00:10', end: '23:50'}"
                                                                confirm></date-picker>
                                                    </b-field>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="p-3 row align-items-center justify-content-between">
                                            <span class="ProjectDashboard__stageTitle">{{ $t('ProjectDashboardStageBonusesVolume') }}</span>
                                        </div>
                                        <div class="col-sm py-2">
                                            <div v-for="(bonusVolume, bonusVolumeIndex) in stage.bonusVolumes"
                                                 :key="bonusVolumeIndex">
                                                <div class="row justify-content-between">
                                                    <div class="col-sm py-2">
                                                        <label v-if="bonusVolumeIndex === 0" for="bonusVolumeETH">{{
                                                            $t('ProjectDashboardStageBonusesFromEth') }}</label>
                                                        <b-field id="bonusVolumeETH">
                                                            <b-input
                                                                    placeholder="ETH"
                                                                    type="number"
                                                                    :disabled="isStartCrowdSale"
                                                                    min="0"
                                                                    :step="0.0001"
                                                                    v-model="tokenCrowdSaleStages[stageIndex].bonusVolumes[bonusVolumeIndex][0]"
                                                                    icon="ethereum">
                                                            </b-input>
                                                        </b-field>
                                                    </div>
                                                    <div class="col-sm py-2">
                                                        <div class="row">
                                                            <div class="col-md-8">
                                                                <label v-if="bonusVolumeIndex === 0"
                                                                       for="bonusVolumePercent">{{
                                                                    $t('ProjectDashboardStageBonusesBonus') }}</label>
                                                                <b-field id="bonusVolumePercent">
                                                                    <b-input
                                                                            type="number"
                                                                            min="0"
                                                                            :disabled="isStartCrowdSale"
                                                                            max="100"
                                                                            v-model="tokenCrowdSaleStages[stageIndex].bonusVolumes[bonusVolumeIndex][1]"
                                                                            icon="sale">
                                                                    </b-input>
                                                                </b-field>
                                                            </div>
                                                            <div class="ProjectDashboard__deleteContainer col-md-2">
                                                                <a class="delete is-large"
                                                                   v-if="!isStartCrowdSale"
                                                                   @click="deleteBonusVolumesAt(stageIndex, bonusVolumeIndex)"></a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                            </div>
                                            <div class="text-left pt-2">
                                                <button class="btn btn-primary btn-sm"
                                                        :disabled="tokenCrowdSaleStagesChange || isStartCrowdSale"
                                                        @click="addBonusVolumesAt(stageIndex)">
                                                    {{ $t('ProjectDashboardStageBonusesAddButton') }}
                                                </button>
                                                <button v-if="stage.bonusVolumes.length"
                                                        :disabled="tokenCrowdSaleStagesChange || isStartCrowdSale"
                                                        class="btn btn-primary btn-sm"
                                                        @click="saveBonusVolumesAt(stageIndex)">
                                                    {{ $t('ProjectDashboardStageBonusesSaveButton') }}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <b-notification class="ProjectStages__errorStage" v-if="error" @close="error = false"
                                                type="is-danger" has-icon>{{ error }}
                                </b-notification>
                            </div>

                            <footer class="card-footer">
                                <a class="card-footer-item"
                                   v-if="!isStartCrowdSale"
                                   @click="addStage"
                                >{{$t('ProjectDashboardStageBonusesAddStageButton') }}</a>
                                <a class="card-footer-item"
                                   v-if="tokenCrowdSaleStages.length && tokenCrowdSaleStagesChange && !isStartCrowdSale"
                                   @click="saveStages"
                                >{{ $t('ProjectDashboardStageBonusesSaveStagesButton') }}</a>
                            </footer>
                        </div>

                    </div>

                </div>
            </div>
        </div>
        <b-loading :is-full-page="false" :active.sync="setStagesLoading"></b-loading>
    </div>
</template>

<script>
    import './default.scss';
    import Connector from 'lib/Blockchain/DefaultConnector.js';
    import {waitTransactionReceipt, errorMessageSubstitution} from 'lib/utils.js';
    import DatePicker from 'vue2-datepicker';
    import Web3 from 'web3';
    import {createNamespacedHelpers} from "vuex";
    import {UPDATE_TX} from "store/modules/Transactions.js";

    const ConfigNS = createNamespacedHelpers('Config');
    const ProjectNS = createNamespacedHelpers("Project");
    const LedgerNS = createNamespacedHelpers("Ledger");
    const AccountNS = createNamespacedHelpers("Account");
    const TransactionsNS = createNamespacedHelpers("Transactions");
    const LangNS = createNamespacedHelpers("Lang");

    const web3 = new Web3();
    const BigNumber = web3.BigNumber;
    const moment = window.moment;

    export default {
        name: 'StageConfigureCrowdsaleBonuses',
        template: '#StageConfigureCrowdsaleBonusesTemplate',
        data() {
            return {
                setStagesLoading: false,
                tokenCrowdSaleStagesChange: false,
                error: false,
                tokenCrowdSaleStages: []
            };
        },
        components: {
            DatePicker
        },
        watch: {
            'tokenCrowdSaleStagesNS': {
                handler(value) {
                    this.tokenCrowdSaleStages = value;
                },
                immediate: true
            },
        },
        computed: {
            ...ProjectNS.mapState({
                currentProject: "currentProject",
            }),
            ...LangNS.mapState({
                translationsDef: 'current'
            }),
            ...ProjectNS.mapGetters([
                'hasAllowance',
                'hasPlacedWTokenAddress',
                'tokensAmountThatApprovedToPlaceByTokenOwnerToNumber',
                'ownerBalanceToNumber',
                'isCrowdsaleInited',
                'tokensForAddCrowdsale',
                'tokensForSaleAmountToNumber',
                'tokenCrowdSaleStagesNS',
                'isStartCrowdSale'
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
            // returns bool if first stage and first stage start date exists, otherwise undefined
            isFirstStageStartDateGreaterOrEqualRecommended () {
                if (this.tokenCrowdSaleStages.length) {
                    const first = this.tokenCrowdSaleStages[0];

                    if (first.startDate) {
                        const startDate = moment(first.startDate);
                        const recommended = moment().add(1, 'h');

                        return startDate.isSameOrAfter(recommended);
                    }
                }

                return;
            },
            firstStageStartDateFieldType () {
                if (this.tokenCrowdSaleStages.length) {
                    if (!this.isFirstStageStartDateGreaterOrEqualRecommended) {
                        return 'is-info';
                    }
                }
            },
            firstStageStartDateMessage () {
                if (this.tokenCrowdSaleStages.length) {
                    if (!this.isFirstStageStartDateGreaterOrEqualRecommended) {
                        return this.$t('FirstStageStartDateRecommendedDateInfoMessage');
                    }
                }
            },
            isErrorTx(){
                return this.TransactionsList && this.TransactionsList.length
                    ? this.TransactionsList.find((tr) => {
                        return tr.token
                        && tr.name
                        && tr.hash
                        && tr.status
                        && tr.token === this.currentProject.tokenAddress
                        && tr.name === "setStages"
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
                        && tr.name === "setStages"
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

            changeAnyInputsForBonuses() {
                this.tokenCrowdSaleStagesChange = true;
            },
            minStartDate(stageIndex) {
                console.log(stageIndex);
                const today = new Date();
                return new Date(today.getFullYear(), today.getMonth(), today.getDate());
            },

            addStage() {
                this.tokenCrowdSaleStagesChange = true;
                this.tokenCrowdSaleStages.push({
                    startDate: null,
                    endDate: null,
                    discount: null,
                    vestingDate: null,
                    bonusVolumes: [],
                    wasCreated: false
                });
            },
            saveStages() {
                this.setStages(this.tokenCrowdSaleStages);
            },
            async setStages(stages) {
                if (!this.isCrowdsaleInited) return;

                this.setStagesLoading = true;
                try {
                    const {W12CrowdsaleFactory} = await this.LedgerFetch(this.currentProject.version);
                    const W12Crowdsale = W12CrowdsaleFactory.at(this.currentProject.tokenCrowdsaleAddress);
                    const tx = await W12Crowdsale.setStages(stages);
                    const connectedWeb3 = (await Connector.connect()).web3;
                    this.$store.commit(`Transactions/${UPDATE_TX}`, {
                        token: this.currentProject.tokenAddress,
                        name: "setStages",
                        hash: tx,
                        status: "pending"
                    });
                    await waitTransactionReceipt(tx, connectedWeb3);
                    stages.forEach(stage => stage.wasCreated = true);
                    this.tokenCrowdSaleStagesChange = false;
                } catch (e) {
                    this.error = errorMessageSubstitution(e);
                }

                this.setStagesLoading = false;
            },
            deleteStageAt(stageIndex) {
                this.tokenCrowdSaleStages.splice(stageIndex, 1);
                this.tokenCrowdSaleStagesChange = true;
            },

            saveBonusVolumesAt(stageIndex) {
                const stage = this.tokenCrowdSaleStages[stageIndex];

                if (stage.wasCreated) {
                    this.setBonusVolumes(stageIndex, stage.bonusVolumes);
                }
            },
            addBonusVolumesAt(stageIndex) {
                this.tokenCrowdSaleStages[stageIndex].bonusVolumes.push(['', '']);
            },
            deleteBonusVolumesAt(stageIndex, volumeIndex) {
                this.tokenCrowdSaleStages[stageIndex].bonusVolumes.splice(volumeIndex, 1);
            },
            async setBonusVolumes(stageIndex, list) {
                if (!this.isCrowdsaleInited) return;
                this.setStagesLoading = true;
                try {
                    const {W12CrowdsaleFactory} = await this.LedgerFetch(this.currentProject.version);
                    const W12Crowdsale = W12CrowdsaleFactory.at(this.currentProject.tokenCrowdsaleAddress);

                    const tx = await W12Crowdsale.setBonusVolumes(stageIndex, list);
                    this.$store.commit(`Transactions/${UPDATE_TX}`, {
                        token: this.currentProject.tokenAddress,
                        name: "setStages",
                        hash: tx,
                        status: "pending"
                    });
                    const connectedWeb3 = (await Connector.connect()).web3;
                    await waitTransactionReceipt(tx, connectedWeb3);
                } catch (e) {
                    this.error = errorMessageSubstitution(e);
                }

                this.setStagesLoading = false;
            },
            getNotBeforeStart(stageIndex) {
                if (this.tokenCrowdSaleStages[stageIndex - 1]) {
                    for (let i = stageIndex - 1; i >= 0; i--) {
                        if (this.tokenCrowdSaleStages[i]) {
                            if (this.tokenCrowdSaleStages[i].endDate) {
                                return moment(this.tokenCrowdSaleStages[i].endDate).add(10, 'm').toDate();
                            }
                            if (this.tokenCrowdSaleStages[i].startDate) {
                                return moment(this.tokenCrowdSaleStages[i].startDate).add(10, 'm').toDate();
                            }
                        }
                    }
                }
                return new Date();
            },
            getNotAfterStart(stageIndex) {
                if (this.tokenCrowdSaleStages[stageIndex].endDate) {
                    return moment(this.tokenCrowdSaleStages[stageIndex].endDate).subtract(10, 'm').toDate();
                } else {
                    for (let i = stageIndex + 1; i <= this.tokenCrowdSaleStages.length; i++) {
                        if (this.tokenCrowdSaleStages[i]) {
                            if (this.tokenCrowdSaleStages[i].startDate) {
                                return moment(this.tokenCrowdSaleStages[i].startDate).subtract(10, 'm').toDate();
                            }
                            if (this.tokenCrowdSaleStages[i].endDate) {
                                return moment(this.tokenCrowdSaleStages[i].endDate).subtract(10, 'm').toDate();
                            }
                        }
                    }
                    return false;
                }
            },
            getNotBeforeEnd(stageIndex) {
                if (this.tokenCrowdSaleStages[stageIndex].startDate) {
                    return moment(this.tokenCrowdSaleStages[stageIndex].startDate).add(10, 'm').toDate();
                } else {
                    for (let i = stageIndex - 1; i >= 0; i--) {
                        if (this.tokenCrowdSaleStages[i]) {
                            if (this.tokenCrowdSaleStages[i].endDate) {
                                return moment(this.tokenCrowdSaleStages[i].endDate).add(10, 'm').toDate();
                            }
                            if (this.tokenCrowdSaleStages[i].startDate) {
                                return moment(this.tokenCrowdSaleStages[i].startDate).add(10, 'm').toDate();
                            }

                        }
                    }
                    return new Date();
                }
            },
            getNotAfterEnd(stageIndex) {
                if (this.tokenCrowdSaleStages[stageIndex + 1]) {
                    for (let i = stageIndex + 1; i <= this.tokenCrowdSaleStages.length; i++) {
                        if (this.tokenCrowdSaleStages[i]) {
                            if (this.tokenCrowdSaleStages[i].startDate) {
                                return moment(this.tokenCrowdSaleStages[i].startDate).subtract(10, 'm').toDate();
                            }
                            if (this.tokenCrowdSaleStages[i].endDate) {
                                return moment(this.tokenCrowdSaleStages[i].endDate).subtract(10, 'm').toDate();
                            }
                        }
                    }
                }
                return false;
            },
        },
    };
</script>

