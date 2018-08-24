<template>
    <div class="ProjectDashboard buefy">
        <section class="container">
            <h2>{{ $t('ProjectDashboard') }}</h2>

            <b-notification class="ProjectDashboard__error" v-if="isError && !isLoading" type="is-danger" has-icon>
                <span v-if="ledgerMeta.loadingError">{{ ledgerMeta.loadingError }}</span>
                <span v-if="tokensListMeta.loadingError">{{ tokensListMeta.loadingError }}</span>
                <span v-if="accountMeta.loadingError">{{ accountMeta.loadingError }}</span>
                <span v-if="errorMessage">{{ errorMessage }}</span>
            </b-notification>

            <b-notification v-if="isLoading && !isError && !currentAccount" :closable="false" class="AdminDashboard__loader">
                <span v-if="loadingLedger">{{ $t('ProjectDashboardLoadLedger') }}<br></span>
                <span v-if="fetchingToken">{{ $t('ProjectDashboardLoadSearchToken') }}<br></span>
                <span v-else="!loadingLedger && !fetchingToken">{{ $t('ProjectDashboardLoadExpect') }}<br></span>

                <b-loading :is-full-page="false" :active.sync="isLoading" :can-cancel="true"></b-loading>
            </b-notification>

            <div v-if="!isLoading && currentAccount">
                <div v-if="!isLoading">

                    <b-field class="ProjectDashboard__select">
                        <b-field>
                            <b-select
                                    v-model="tokenAddress"
                                    @input="tokenSelected"
                                    v-if="W12ListerForCurrentAccount"
                                    :placeholder="$t('ProjectDashboardSelectToken')"
                                    expanded>
                                <option
                                        v-for="(token, idx) in W12ListerForCurrentAccount"
                                        :key="idx"
                                        :value="token.tokenAddress">{{ token.symbol }} - {{ token.tokenAddress }}
                                </option>
                            </b-select>
                        </b-field>
                    </b-field>

                    <div v-if="token"
                         class="ProjectDashboard__tokenInfo row align-items-center justify-content-around py-4">
                        <div>{{ $t('ProjectDashboardSymbol') }} {{ token.symbol }}</div>
                        <div>{{ $t('ProjectDashboardDecimals') }} {{ token.decimals }}</div>
                        <div>{{ $t('ProjectDashboardFeeTokens') }} {{ token.feePercent | percentFractional }}%</div>
                        <div>{{ $t('ProjectDashboardFeeEth') }} {{ token.feeETHPercent | percentFractional }}%</div>
                    </div>

                    <div class="ProjectDashboard__stages">
                        <div class="ProjectDashboard__stage">
                            <div class="row align-items-center justify-content-center">
                                <div class="col-auto">
                                    <span class="ProjectDashboard__step-badge step-badge badge badge-pill badge-light">1</span>
                                </div>
                                <div class="col-sm-4">
                                    {{ $t('ProjectDashboardStageWhitelist') }}
                                </div>
                                <div class="col-sm-2 text-center">
                                    <b-tag v-if="isWhiteListed" type="is-success">{{ $t('ProjectDashboardStageWhitelistStatusWhitelisted') }}</b-tag>
                                    <b-tag v-else type="is-info">{{ $t('ProjectDashboardStageWhitelistStatusNotWhitelisted') }}</b-tag>
                                </div>
                                <div class="col-sm text-right"></div>
                            </div>
                        </div>
                        <div class="ProjectDashboard__stage">
                            <div class="row align-items-center justify-content-left">
                                <div class="col-auto">
                                    <span class="ProjectDashboard__step-badge step-badge badge badge-pill badge-light">2</span>
                                </div>
                                <div class="col-sm-4">
                                    {{ $t('ProjectDashboardStageApprove') }}
                                </div>
                                <div class="col-sm-2 text-center">
                                    <b-tag v-if="!(hasAllowance || hasPlacedWTokenAddress) || !isWhiteListed"
                                           type="is-success">{{ $t('ProjectDashboardStageApproveStatusPending') }}
                                    </b-tag>
                                    <b-tag v-else type="is-success">{{ $t('ProjectDashboardStageApproveStatusApproved') }}</b-tag>
                                </div>
                                <div class="col-sm text-right">
                                    <span v-if="hasAllowance">{{ tokensAmountThatApprovedToPlaceByTokenOwnerToNumber }}</span>
                                    <div v-else-if="isWhiteListed" class="text-left">
                                        <b-tag class="ProjectDashboard__approveInfo" type="is-info">
                                            {{ $t('ProjectDashboardStageApproveSpendFrom') }} {{ currentAccount }}
                                        </b-tag>
                                        <div class="form-group">
                                            <label for="SpendFrom">{{ $t('ProjectDashboardStageApproveAmountLabel') }}</label>
                                            <input
                                                    :placeholder="$t('ProjectDashboardStageApproveAmountPlaceholder', {ownerBalanceToNumber})"
                                                    type="number"
                                                    min="0"
                                                    :max="ownerBalanceToNumber"
                                                    class="form-control"
                                                    id="SpendFrom"
                                                    v-model="approveForm.value">
                                        </div>
                                        <div class="text-right">
                                            <button class="btn btn-primary btn-sm" @click="approveTokensToSpend">{{ $t('ProjectDashboardStageApproveButton') }}</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="ProjectDashboard__stage">
                            <div class="row align-items-center justify-content-left">
                                <div class="col-auto">
                                    <span class="ProjectDashboard__step-badge step-badge badge badge-pill badge-light">3</span>
                                </div>
                                <div class="col-sm-4">
                                    {{ $t('ProjectDashboardStagePlace') }}
                                </div>
                                <div class="col-sm-2 text-center">
                                    <b-tag v-if="!hasPlacedWTokenAddress && (!hasAllowance || !isWhiteListed)"
                                           type="is-success">{{ $t('ProjectDashboardStagePlaceStatusPending') }}
                                    </b-tag>
                                    <b-tag v-else type="is-success">{{ $t('ProjectDashboardStagePlaceStatusPlaced') }}</b-tag>
                                </div>
                                <div class="col-12 text-left">
                                    <b-tag class="ProjectDashboard__placedWTokenAddress" v-if="hasPlacedWTokenAddress"
                                           type="is-info">{{ placedTokenAddress }}
                                    </b-tag>
                                </div>
                                <div class="ProjectDashboard__placeForm col-12 text-right">
                                    <div v-if="isWhiteListed && hasAllowance" class="text-left">
                                        <div class="form-group">
                                            <label for="PlaceAmount">{{ $t('ProjectDashboardStagePlaceAmountLabel') }}</label>
                                            <input
                                                    :placeholder="$t('ProjectDashboardStagePlaceAmountPlaceholder', {tokensAmount: tokensAmountThatApprovedToPlaceByTokenOwnerToNumber})"
                                                    type="number"
                                                    min="0"
                                                    :max="tokensAmountThatApprovedToPlaceByTokenOwnerToNumber"
                                                    class="form-control"
                                                    id="PlaceAmount"
                                                    v-model="placeTokensForm.value">
                                        </div>
                                        <div class="text-right">
                                            <button class="btn btn-primary btn-sm" @click="placeTokens">{{ $t('ProjectDashboardStagePlaceButton') }}</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="ProjectDashboard__stage">
                            <div class="row align-items-center justify-content-left">
                                <div class="col-auto">
                                    <span class="ProjectDashboard__step-badge step-badge badge badge-pill badge-light">4</span>
                                </div>
                                <div class="col-sm-4">
                                    {{ $t('ProjectDashboardStageConfigureCrowdsale') }}
                                </div>
                                <div class="col-sm-2 text-center">
                                    <b-tag v-if="!isCrowdsaleInited && (!hasPlacedWTokenAddress && (!hasAllowance || !isWhiteListed))"
                                           type="is-success">{{ $t('ProjectDashboardStageConfigureCrowdsaleStatusPending') }}
                                    </b-tag>
                                    <b-tag v-else type="is-success">{{ $t('ProjectDashboardStageConfigureCrowdsaleStatusInitialized') }}</b-tag>
                                </div>
                                <div class="ProjectDashboard__configureCrowdsale col-12 text-left">
                                    <b-tag class="ProjectDashboard__initCrowdsaleAddress" v-if="isCrowdsaleInited"
                                           type="is-info">{{ tokenCrowdsaleAddress }}
                                    </b-tag>

                                    <div v-else-if="isWhiteListed && hasPlacedWTokenAddress" class="text-left">
                                        <div class="form-group">
                                            <label for="StartDate">{{ $t('ProjectDashboardStageConfigureCrowdsaleStartDateLabel') }}</label>
                                            <b-field id="StartDate" class="ProjectDashboard__dateSelect bootstrap">
                                                <date-picker :min-date="minStartDate" v-model="crowdsaleInitForm.date" type="datetime" lang="en" format="YYYY-MM-DD hh:mm:ss" confirm></date-picker>
                                            </b-field>
                                        </div>
                                        <div class="form-group">
                                            <label for="BaseTokenPrice">{{ $t('ProjectDashboardStageConfigureCrowdsalePrice') }}</label>
                                            <b-field id="BaseTokenPrice">
                                                <b-input placeholder="ETH"
                                                         type="number"
                                                         min="0.000000000000000001"
                                                         :step="0.000000000000000001"
                                                         v-model="crowdsaleInitForm.price"
                                                         icon="ethereum">
                                                </b-input>
                                            </b-field>
                                        </div>
                                        <div class="form-group">
                                            <label for="AmountForSale">{{ $t('ProjectDashboardStageConfigureCrowdsaleAmountForSaleLabel') }}</label>
                                            <b-field id="AmountForSale">
                                                <b-input :placeholder="`${tokensForSaleAmountToNumber}`"
                                                         type="number"
                                                         min="0"
                                                         :step="0.01"
                                                         v-model="crowdsaleInitForm.amountForSale"
                                                         icon="shopping">
                                                </b-input>
                                            </b-field>
                                        </div>
                                        <div class="text-right">
                                            <button class="btn btn-primary btn-sm" @click="initCrawdsale">{{ $t('ProjectDashboardStageConfigureCrowdsaleInitButton') }}
                                            </button>
                                        </div>
                                    </div>
                                    <div class="pt-2" v-if="isCrowdsaleInited && isWhiteListed && hasPlacedWTokenAddress && tokensForAddCrowdsale !== '0'">
                                        <div class="form-group">
                                            <label for="AmountForSale">{{ $t('ProjectDashboardStageConfigureCrowdsaleAddTokensLabel') }}</label>
                                            <b-field id="AmountForSale">
                                                <b-input :placeholder="`${tokensForAddCrowdsale}`"
                                                         type="number"
                                                         min="0"
                                                         v-model="crowdsaleInitForm.amountForSale"
                                                         icon="shopping">
                                                </b-input>
                                            </b-field>
                                        </div>
                                        <div class="text-right">
                                            <button class="btn btn-primary btn-sm" @click="addTokensToCrowdsale">{{ $t('ProjectDashboardStageConfigureCrowdsaleAddButton') }}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="ProjectDashboard__stage">
                            <div class="row align-items-center justify-content-left">
                                <div class="col-auto">
                                    <span class="ProjectDashboard__step-badge step-badge badge badge-pill badge-light">5</span>
                                </div>
                                <div class="col-sm-5">
                                    {{ $t('ProjectDashboardStageBonuses') }}
                                </div>
                                <div class="col-12">
                                    <div v-if="isCrowdsaleInited && hasPlacedWTokenAddress" class="text-left">
                                        <b-collapse class="ProjectDashboard__bonuses card">
                                            <div class="card-content">
                                                <div class="content" v-if="tokenCrowdsaleStages.length">
                                                    <b-collapse class="ProjectDashboard__stageBonus card" v-for="(stage, stageIndex) in tokenCrowdsaleStages" :key="stageIndex">
                                                        <div class="col-12 pb-4">
                                                            <div class="p-3 row align-items-center justify-content-between">
                                                                <span class="ProjectDashboard__stageTitle">{{ $t('ProjectDashboardStageBonusesStage') }} #{{ stageIndex+1 }}</span>
                                                                <button class="btn btn-primary btn-sm" @click="deleteStageAt(stageIndex)">{{ $t('ProjectDashboardStageBonusesRemove') }}</button>
                                                            </div>
                                                            <div class="ProjectDashboard__stageBonus col-sm py-2">
                                                                <div class="row justify-content-between">
                                                                    <div class="col-sm py-2">
                                                                        <label>{{ $t('ProjectDashboardStageBonusesStartDateLabel') }}</label>
                                                                        <b-field class="ProjectDashboard__dateSelect">
                                                                            <date-picker v-model="tokenCrowdsaleStages[stageIndex].startDate" type="datetime" lang="en" format="YYYY-MM-DD hh:mm:ss" confirm></date-picker>
                                                                        </b-field>
                                                                    </div>
                                                                    <div class="col-sm py-2">
                                                                        <label>{{ $t('ProjectDashboardStageBonusesEndDateLabel') }}</label>
                                                                        <b-field class="ProjectDashboard__dateSelect">
                                                                            <date-picker v-model="tokenCrowdsaleStages[stageIndex].endDate" type="datetime" lang="en" format="YYYY-MM-DD hh:mm:ss" confirm></date-picker>
                                                                        </b-field>
                                                                    </div>
                                                                </div>
                                                                <div class="row justify-content-between">
                                                                    <div class="col-sm py-2">
                                                                        <label for="StageDiscount">{{ $t('ProjectDashboardStageBonusesDiscountLabel') }}</label>
                                                                        <b-field id="StageDiscount">
                                                                            <b-input
                                                                                    type="number"
                                                                                    min="0"
                                                                                    max="100"
                                                                                    v-model="tokenCrowdsaleStages[stageIndex].discount"
                                                                                    icon="sale">
                                                                            </b-input>
                                                                        </b-field>
                                                                    </div>
                                                                    <div class="col-sm py-2">
                                                                        <label for="StageVestingDate">{{ $t('ProjectDashboardStageBonusesVestingDateLabel') }}</label>
                                                                        <b-field id="StageVestingDate"
                                                                                 class="ProjectDashboard__dateSelect">
                                                                            <date-picker v-model="tokenCrowdsaleStages[stageIndex].vestingDate" type="datetime" lang="en" format="YYYY-MM-DD hh:mm:ss" confirm></date-picker>
                                                                        </b-field>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div class="p-3 row align-items-center justify-content-between">
                                                                <span class="ProjectDashboard__stageTitle">{{ $t('ProjectDashboardStageBonusesVolume') }}</span>
                                                            </div>
                                                            <div class="col-sm py-2">
                                                                <div v-for="(bonusVolume, bonusVolumeIndex) in stage.bonusVolumes" :key="bonusVolumeIndex">
                                                                    <div class="row justify-content-between">
                                                                        <div class="col-sm py-2">
                                                                            <label v-if="bonusVolumeIndex === 0" for="bonusVolumeETH">{{ $t('ProjectDashboardStageBonusesFromEth') }}</label>
                                                                            <b-field id="bonusVolumeETH">
                                                                                <b-input
                                                                                        placeholder="ETH"
                                                                                        type="number"
                                                                                        min="0"
                                                                                        :step="0.0001"
                                                                                        v-model="tokenCrowdsaleStages[stageIndex].bonusVolumes[bonusVolumeIndex][0]"
                                                                                        icon="ethereum">
                                                                                </b-input>
                                                                            </b-field>
                                                                        </div>
                                                                        <div class="col-sm py-2">
                                                                            <div class="row">
                                                                                <div class="col-md-8">
                                                                                    <label v-if="bonusVolumeIndex === 0" for="bonusVolumePercent">{{ $t('ProjectDashboardStageBonusesBonus') }}</label>
                                                                                    <b-field id="bonusVolumePercent">
                                                                                        <b-input
                                                                                                type="number"
                                                                                                min="0"
                                                                                                max="100"
                                                                                                v-model="tokenCrowdsaleStages[stageIndex].bonusVolumes[bonusVolumeIndex][1]"
                                                                                                icon="sale">
                                                                                        </b-input>
                                                                                    </b-field>
                                                                                </div>
                                                                                <div class="ProjectDashboard__deleteContainer col-md-2">
                                                                                    <a class="delete is-large"
                                                                                       @click="deleteBonusVolumesAt(stageIndex, bonusVolumeIndex)"></a>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                </div>
                                                                <div class="text-left pt-2">
                                                                    <button class="btn btn-primary btn-sm"
                                                                            :disabled="tokenCrowdsaleStagesChange"
                                                                            @click="addBonusVolumesAt(stageIndex)">
                                                                        {{ $t('ProjectDashboardStageBonusesAddButton') }}
                                                                    </button>
                                                                    <button v-if="stage.bonusVolumes.length"
                                                                            :disabled="tokenCrowdsaleStagesChange"
                                                                            class="btn btn-primary btn-sm"
                                                                            @click="saveBonusVolumesAt(stageIndex)">
                                                                        {{ $t('ProjectDashboardStageBonusesSaveButton') }}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </b-collapse>
                                                </div>

                                                <footer class="card-footer">
                                                    <a class="card-footer-item" @click="addStage">{{ $t('ProjectDashboardStageBonusesAddStageButton') }}</a>
                                                    <a class="card-footer-item" v-if="tokenCrowdsaleStages.length"
                                                       @click="saveStages">{{ $t('ProjectDashboardStageBonusesSaveStagesButton') }}</a>
                                                </footer>
                                            </div>

                                        </b-collapse>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Receiving
                        v-if="receiving"
                        :data="receiving"
                        @claimRemainingTokens="claimRemainingTokens"
                ></Receiving>
                <div v-if="token && isCrowdsaleInited">
                    <h2>{{ $t('Milestones') }}</h2>
                    <div class="box">
                        <MilestoneList v-model="tokenCrowdsaleMilestones"></MilestoneList>
                    </div>
                    <button class="btn btn-primary btn-sm btn-block" @click="saveMilestones">{{ $t('MilestonesSend') }}
                    </button>
                </div>
                <div v-if="trancheInformationData">
                    <h2>{{ $t('trancheInformation') }}</h2>
                    <TrancheInformation :data="trancheInformationData"></TrancheInformation>
                    <button class="btn btn-primary py-2 my-2" :disabled="!allowTranche" @click="tryTranche">{{ $t('trancheInformationReceive') }}</button>
                </div>
            </div>
        </section>
    </div>
</template>

<script>
    import config from '../../config.js';
    import 'bem/ProjectDashboard/default.scss';
    import DatePicker from 'vue2-datepicker';

    import Connector from 'lib/Blockchain/DefaultConnector.js';
    import { promisify, wait } from '../../lib/utils.js';
    import { isZeroAddress, waitTransactionReceipt } from 'lib/utils.js';
    import {createNamespacedHelpers} from 'vuex';
    import TrancheInformation from '../TrancheInformation';
    import MilestoneList from 'bem/Milestones/MilestoneList.vue';
    import { TrancheInformationModel } from 'bem/TrancheInformation/shared.js';
    import Receiving from 'bem/Receiving';
    import { ReceivingModel } from 'bem/Receiving/model.js';

    import {W12LISTER_UPDATE} from "store/modules/W12Lister";

    const ConfigNS = createNamespacedHelpers('Config');
    const LedgerNS = createNamespacedHelpers("Ledger");
    const WhitelistNS = createNamespacedHelpers("Whitelist");
    const W12ListerNS = createNamespacedHelpers('W12Lister');
    const AccountNS = createNamespacedHelpers("Account");
    const moment = window.moment;

    // as utils
    const web3 = new Web3();
    const BigNumber = web3.BigNumber;

    export default {
        name: 'ProjectDashboard',
        components: {
            TrancheInformation,
            MilestoneList,
            Receiving,
            DatePicker
        },
        filters: {
            percentFractional(value) {
                return value/100;
            },
        },
        data() {
            return {
                loadingLedger: false,
                fetchingToken: false,
                updateTokensApprovedToPlaceValueLoading: false,
                updatePlacedTokenStatusLoading: false,
                fetchCrowdsaleAddressLoading: false,
                approveTokensToSpendLoading: false,
                placeTokensLoading: false,
                initCrawdsaleLoading: false,
                updateOwnerBalanceLoading: false,
                subscribeToEventsLoading: false,
                fetchCrowdsaleStagesListLoading: false,
                setStagesLoading: false,
                loading: false,
                tokenAddress: null,
                errorMessage: '',
                infoMessage: '',
                token: null,
                tokensAmountThatApprovedToPlaceByTokenOwner: '0',
                placedTokenAddress: null,
                ownerBalance: '0',
                tokenCrowdsaleAddress: null,
                tokenCrowdsaleStagesChange: false,
                tokenCrowdsaleStages: [],
                tokenCrowdsaleMilestones: [],
                approveForm: {
                    value: null
                },
                placeTokensForm: {
                    value: null
                },
                crowdsaleInitForm: {
                    date: null,
                    config: {
                        format: 'DD/MM/YYYY h:mm:ss',
                        useCurrent: false,
                        showClear: true,
                        showClose: true,
                    },
                    amountForSale: null,
                    price: null
                },
                crowdsaleStagesToAdd: [],
                fundData: {
                    address: null,
                    balanceWei: '0',
                    trancheAmount: '0'
                },
                receiving: null,
            };
        },
        computed: {
            ...ConfigNS.mapState({
                W12ListerAddress: state => state.W12Lister.address
            }),
            ...W12ListerNS.mapState({
                W12Lister: state => state.list
            }),
            ...AccountNS.mapState({
                currentAccount: "currentAccount",
                currentAccountData: "currentAccountData",
                accountMeta: "meta",
            }),
            ...LedgerNS.mapState({
                ledgerMeta: 'meta',
            }),
            ...WhitelistNS.mapState({
                tokensListMeta: 'meta',
                tokensList: "list"
            }),

            isError() {
                return this.ledgerMeta.loadingError || this.tokensListMeta.loadingError || this.accountMeta.loadingError || this.errorMessage;
            },
            W12ListerForCurrentAccount(){
                return this.W12Lister.filter((obj)=>obj.tokenOwners.indexOf(this.currentAccount) !== -1);
            },
            minStartDate() {
                const today = new Date();
                return new Date(today.getFullYear(), today.getMonth(), today.getDate());
            },
            isLoading() {
                return (
                    this.loadingLedger
                    || this.fetchingToken
                    || this.updateTokensApprovedToPlaceValueLoading
                    || this.updatePlacedTokenStatusLoading
                    || this.fetchCrowdsaleAddressLoading
                    || this.approveTokensToSpendLoading
                    || this.placeTokensLoading
                    || this.initCrawdsaleLoading
                    || this.updateOwnerBalanceLoading
                    || this.subscribeToEventsLoading
                    || this.fetchCrowdsaleStagesListLoading
                    || this.setStagesLoading
                );
            },
            isAddress() {
                return web3.isAddress(this.tokenAddress);
            },
            isChecksumAddress() {
                return web3.isChecksumAddress(this.tokenAddress);
            },
            isValidAddress() {
                return (
                    this.isAddress
                    || this.isChecksumAddress
                );
            },
            hasAllowance() {
                return (
                    this.tokensAmountThatApprovedToPlaceByTokenOwner
                    && (parseFloat(this.tokensAmountThatApprovedToPlaceByTokenOwner) !== 0)
                );
            },
            isWhiteListed() {
                return Boolean(this.token);
            },
            hasPlacedWTokenAddress() {
                return Boolean(this.placedTokenAddress);
            },
            isCrowdsaleInited() {
                return Boolean(this.tokenCrowdsaleAddress);
            },
            trancheInformationData() {
                if (this.fundData.address) {
                    const trancheIntervals = this.tokenCrowdsaleMilestones
                        .reduce((out, item, idx, origin) => {
                            if (out.length === 0) {
                                out.push([item.voteEndDate])
                            } else if (idx + 1 === origin.length) {
                                out[out.length - 1].push(item.endDate);
                                out.push([item.voteEndDate, Infinity]);
                            } else {
                                out[out.length - 1].push(item.endDate);
                                out.push([item.voteEndDate]);
                            }

                            return out;
                        }, []);

                    return new TrancheInformationModel({
                        fundBalanceInWei: this.fundData.balanceWei,
                        fundBalanceInTokens: '0',
                        trancheIntervals,
                        trancheAmountInWei: this.fundData.trancheAmount
                    });
                }
            },
            allowTranche() {
                return (
                    new BigNumber(this.fundData.trancheAmount).gt(0)
                );
            },
            ownerBalanceToNumber() {
                return this.ownerBalance
                    ? web3.fromWei(this.ownerBalance, 'ether').toString()
                    : 0;
            },
            tokensAmountThatApprovedToPlaceByTokenOwnerToNumber() {
                return this.tokensAmountThatApprovedToPlaceByTokenOwner
                    ? web3.fromWei(this.tokensAmountThatApprovedToPlaceByTokenOwner, 'ether').toString()
                    : '0';
            },
            tokensForSaleAmountToNumber() {
                return this.token.tokensForSaleAmount
                    ? web3.fromWei(this.token.tokensForSaleAmount, 'ether').toString()
                    : 0;
            },
            tokensForAddCrowdsale(){
                return this.token && this.token.wTokensIssuedAmount && this.token.tokensForSaleAmount
                    ? web3.fromWei(new BigNumber(this.token.tokensForSaleAmount).minus(this.token.wTokensIssuedAmount), 'ether').toString()
                    : 0;
            }
        },
        watch: {
            tokenAddress: {
                handler: 'handleTokenAddressChange',
                immediate: true
            },
            token: {
                handler: 'handleTokenChange'
            },
            'currentAccount': {
                handler: 'handleCurrentAccountChange',
                immediate: true
            },
        },
        methods: {
            ...AccountNS.mapActions({
                watchCurrentAccount: 'watch',
                updateAccountData: 'updateAccountData',
            }),
            ...LedgerNS.mapActions({
                ledgerFetch: "fetch"
            }),

            async handleCurrentAccountChange(currentAccount) {
                if(currentAccount){
                    this.fetchTokensList();
                }
            },
            clearErrorMessage() {
                this.errorMessage = '';
            },
            setErrorMessage(message) {
                this.errorMessage = message;
            },
            handleTokenAddressChange(value, prevValue) {
                this.clearErrorMessage();

                this.tokenCrowdsaleStages = [];
                this.tokenCrowdsaleMilestones = [];

                if (
                    value
                    && (
                        !web3.isAddress(value)
                        && !web3.isChecksumAddress(value)
                    )
                ) {
                    this.setErrorMessage('Enter valid ethereum address');
                    return;
                }

                this.fetchToken();
            },

            tokenSelected(value) {
                this.tokenAddress = value;
            },
            async handleTokenChange() {
                this.unsubscribeFromEvents();
                await this.subscribeToEvents();
                await this.updateOwnerBalance();
                await this.updateTokensApprovedToPlaceValue();
                await this.updatePlacedTokenStatus();
                await this.fetchCrowdsaleAddressAndCreateContractInstance();
                if(this.isCrowdsaleInited) {
                    await this.fetchCrowdsaleStagesList();
                    await this.fetchCrowdsaleMilestonesList();
                    await this.updateFundInformation();
                    await this.updateReceivingInformation();
                }
            },
            async fetchTokensList() {
                this.fetchTokens = true;

                const {W12ListerFactory} = await this.ledgerFetch();

                if (W12ListerFactory) {
                    try {
                        const W12Lister = W12ListerFactory.at(this.W12ListerAddress);
                        const list = await W12Lister.fetchAllTokensComposedInformation();

                        this.$store.commit(`W12Lister/${W12LISTER_UPDATE}`, {list: list.map(({token}) => token)});
                    } catch (e) {
                        this.setErrorMessage(e.message);
                    }
                }

                this.fetchTokens = false;
            },
            async fetchToken() {
                if (this.isLoading) return;

                this.fetchingToken = true;

                const tokenAddress = this.tokenAddress;
                const {W12ListerFactory} = await this.ledgerFetch();

                if (
                    !W12ListerFactory
                ) {
                    return;
                }

                if (tokenAddress) {
                    try {
                        const W12Lister = W12ListerFactory.at(config.contracts.W12Lister.address);
                        const data = await W12Lister.fetchComposedTokenInformationByTokenAddress(tokenAddress, this.currentAccount);

                        if (data) {
                            this.ContractInstances = {
                                ...data.links,
                                W12ListerInstance: W12Lister
                            };

                            this.token = data.token;
                        } else {
                            this.token = null;
                            this.ContractInstances = null;
                        }
                    } catch (e) {
                        this.token = null;
                        this.setErrorMessage(e.message);
                    }
                }

                this.fetchingToken = false;
            },
            async updateTokensApprovedToPlaceValue() {
                if (!this.token) return;

                this.updateTokensApprovedToPlaceValueLoading = true;

                try {
                    const {
                        ERC20Instance
                    } = this.ContractInstances;

                    const connectedWeb3 = (await Connector.connect()).web3;
                    const getAccounts = promisify(connectedWeb3.eth.getAccounts.bind(connectedWeb3.eth.getAccounts));

                    const currentAccount = (await getAccounts())[0];
                    const W12ListerAddress = config.contracts.W12Lister.address;

                    if (!currentAccount || !W12ListerAddress) {
                        throw new Error('not enough information to do request');
                    }

                    const allowanceValue = (await ERC20Instance.methods.allowance(currentAccount, W12ListerAddress)).toString();

                    this.tokensAmountThatApprovedToPlaceByTokenOwner = allowanceValue;
                } catch (e) {
                    console.log(e);
                    this.setErrorMessage(e.message);
                }

                this.updateTokensApprovedToPlaceValueLoading = false;
            },
            async updatePlacedTokenStatus() {
                if (!this.token) return;

                this.updatePlacedTokenStatusLoading = false;

                try {
                    const {
                        W12TokenLedgerInstance
                    } = this.ContractInstances;

                    const tokenAddress = this.tokenAddress;

                    if (!tokenAddress) {
                        throw new Error('not enough information to do request');
                    }

                    try {
                        const result = await W12TokenLedgerInstance.methods.getWTokenByToken(this.tokenAddress);

                        if (
                            result
                            && !isZeroAddress(result)
                        ) {
                            this.placedTokenAddress = result;
                        } else {
                            this.placedTokenAddress = null;
                        }
                    } catch (e) {
                        this.placedTokenAddress = null;
                        console.log('updatePlacedTokenStatus', e);
                    }
                } catch (e) {
                    this.placedTokenAddress = null;
                    this.setErrorMessage(e.message);
                }

                this.updatePlacedTokenStatusLoading = false;
            },
            async fetchCrowdsaleAddressAndCreateContractInstance() {
                if (!this.token) return;

                this.fetchCrowdsaleAddressLoading = true;

                try {

                    const {
                        W12ListerInstance
                    } = this.ContractInstances;

                    const tokenAddress = this.tokenAddress;

                    if (!tokenAddress) {
                        throw new Error('not enough information to do request');
                    }

                    try {
                        const address = await W12ListerInstance.methods.getTokenCrowdsale(tokenAddress, this.currentAccount);
                        if (
                            address
                            && !isZeroAddress(address)
                        ) {
                            const {W12CrowdsaleFactory} = await this.ledgerFetch();
                            const W12CrowdsaleInstance = W12CrowdsaleFactory.at(address);

                            this.ContractInstances.W12CrowdsaleInstance = W12CrowdsaleInstance;
                            this.tokenCrowdsaleAddress = address;
                        } else {
                            this.tokenCrowdsaleAddress = null;
                        }
                    } catch (e) {
                        this.tokenCrowdsaleAddress = null;
                    }
                } catch (e) {
                    this.tokenCrowdsaleAddress = null;
                }

                this.fetchCrowdsaleAddressLoading = false;
            },
            async approveTokensToSpend() {
                if (!this.token) return;

                const value = new web3.BigNumber(this.approveForm.value);
                const balance = new web3.BigNumber(this.ownerBalance);

                if (!value.greaterThan(0) || !value.lessThanOrEqualTo(balance)) {
                    return;
                }

                this.approveTokensToSpendLoading = true;

                try {
                    const {
                        ERC20Instance
                    } = this.ContractInstances;

                    const tokenAddress = this.tokenAddress;
                    const connectedWeb3 = (await Connector.connect()).web3;
                    const getAccounts = promisify(connectedWeb3.eth.getAccounts.bind(connectedWeb3.eth.getAccounts));

                    const currentAccount = (await getAccounts())[0];
                    const W12ListerAddress = config.contracts.W12Lister.address;

                    if (!tokenAddress && !currentAccount && !W12ListerAddress) {
                        throw new Error('not enough information to do request');
                    }

                    const txhash = await ERC20Instance.methods.approve(W12ListerAddress, web3.toWei(value, 'ether'));

                    await waitTransactionReceipt(txhash, connectedWeb3);
                    await this.handleTokenChange();
                    await this.fetchToken();
                } catch (e) {
                    this.placedTokenStatus = false;
                    this.setErrorMessage(e.message);
                }

                this.approveTokensToSpendLoading = false;
            },
            async placeTokens() {
                if (!this.token) return;

                const value = new web3.BigNumber(this.placeTokensForm.value);
                const limit = new web3.BigNumber(this.tokensAmountThatApprovedToPlaceByTokenOwner);

                if (!value.greaterThan(0) || !value.lessThanOrEqualTo(limit)) {
                    return;
                }

                this.placeTokensLoading = true;

                try {
                    const {
                        W12ListerInstance
                    } = this.ContractInstances;

                    const tokenAddress = this.tokenAddress;
                    const connectedWeb3 = (await Connector.connect()).web3;

                    if (!tokenAddress) {
                        throw new Error('not enough information to do request');
                    }

                    const txhash = await W12ListerInstance.methods.placeToken(tokenAddress, web3.toWei(value, 'ether'));

                    await waitTransactionReceipt(txhash, connectedWeb3);
                    await this.handleTokenChange();
                    await this.fetchToken();
                } catch (e) {
                    this.placedTokenStatus = false;
                    this.setErrorMessage(e.message);
                }

                this.placeTokensLoading = false;
            },
            async initCrawdsale() {
                if (!this.token) return;
                if (this.isCrowdsaleInited) return;

                const data = this.crowdsaleInitForm;
                const date = moment(data.date, 'YYYY-MM-DD hh:mm:ss');
                const amountForSale = new web3.BigNumber(web3.toWei(data.amountForSale, 'ether') || 0);
                const price = new web3.BigNumber(web3.toWei(data.price, 'ether') || 0);
                const tokensForSaleAmount = new web3.BigNumber(this.token.tokensForSaleAmount || 0);
                const wTokensIssuedAmount = new web3.BigNumber(this.token.wTokensIssuedAmount || 0);
                const limit = amountForSale.plus(wTokensIssuedAmount);

                if (
                    !date.isValid()
                    || !date.isSameOrAfter(moment())
                    || !amountForSale.greaterThan(0)
                    || !price.greaterThan(0)
                    || !price.lessThanOrEqualTo(amountForSale)
                    || !tokensForSaleAmount.greaterThanOrEqualTo(limit)
                ) {
                    return;
                }

                this.initCrawdsaleLoading = true;

                try {
                    const {
                        W12ListerInstance
                    } = this.ContractInstances;

                    const tokenAddress = this.tokenAddress;
                    const connectedWeb3 = (await Connector.connect()).web3;

                    if (!tokenAddress) {
                        throw new Error('not enough information to do request');
                    }

                    const txhash = await W12ListerInstance.methods.initCrowdsale(
                        date.utc().unix(),
                        tokenAddress,
                        amountForSale.toString(),
                        price.toString()
                    );

                    await waitTransactionReceipt(txhash, connectedWeb3);
                    await this.handleTokenChange();
                    await this.fetchToken();
                } catch (e) {
                    this.setErrorMessage(e.message);
                }

                this.initCrawdsaleLoading = false;
            },
            async addTokensToCrowdsale() {
                if (!this.token) return;
                if (!this.isCrowdsaleInited) return;

                const data = this.crowdsaleInitForm;
                const amountForSale = new web3.BigNumber(web3.toWei(data.amountForSale, 'ether') || 0);
                const tokensForSaleAmount = new web3.BigNumber(this.token.tokensForSaleAmount || 0);
                const wTokensIssuedAmount = new web3.BigNumber(this.token.wTokensIssuedAmount || 0);
                const limit = amountForSale.plus(wTokensIssuedAmount);

                if (
                    !amountForSale.greaterThan(0)
                    || !tokensForSaleAmount.lessThanOrEqualTo(limit)
                ) {
                    return;
                }

                this.initCrawdsaleLoading = true;

                try {
                    const {
                        W12ListerInstance
                    } = this.ContractInstances;

                    const tokenAddress = this.tokenAddress;
                    const connectedWeb3 = (await Connector.connect()).web3;

                    if (!tokenAddress) {
                        throw new Error('not enough information to do request');
                    }

                    const txhash = await W12ListerInstance.methods.addTokensToCrowdsale(
                        tokenAddress,
                        amountForSale.toString(),
                    );

                    await waitTransactionReceipt(txhash, connectedWeb3);
                    await this.fetchToken();
                    await this.handleTokenChange();
                } catch (e) {
                    this.setErrorMessage(e.message);
                }

                this.initCrawdsaleLoading = false;
            },
            async updateOwnerBalance() {
                if (!this.token) return;

                this.updateOwnerBalanceLoading = true;

                try {
                    const {
                        ERC20Instance
                    } = this.ContractInstances;

                    const connectedWeb3 = (await Connector.connect()).web3;
                    const getAccounts = promisify(connectedWeb3.eth.getAccounts.bind(connectedWeb3.eth.getAccounts));

                    const currentAccount = (await getAccounts())[0];

                    if (!currentAccount) {
                        throw new Error('not enough information to do request');
                    }

                    const balance = await ERC20Instance.methods.balanceOf(currentAccount);

                    this.ownerBalance = balance.toString();
                } catch (e) {
                    this.setErrorMessage(e.message);
                }

                this.updateOwnerBalanceLoading = false;
            },
            async fetchCrowdsaleStagesList() {
                if (!this.token) return;
                if (!this.isCrowdsaleInited) return;

                this.fetchCrowdsaleStagesListLoading = true;

                try {
                    const {
                        W12CrowdsaleInstance
                    } = this.ContractInstances;

                    const list = await W12CrowdsaleInstance.getStagesList();

                    list.forEach(stage => {
                        stage.startDate = new Date(stage.startDate * 1000);
                        stage.endDate = new Date(stage.endDate * 1000);
                        stage.vestingDate = stage.vestingDate ? new Date(stage.vestingDate * 1000) : null;
                    });

                    this.tokenCrowdsaleStages = list;
                } catch (e) {
                    this.tokenCrowdsaleStages = [];
                    this.setErrorMessage(e.message);
                }

                this.fetchCrowdsaleStagesListLoading = false;
            },
            async fetchCrowdsaleMilestonesList () {
                if (!this.token) return;
                if (!this.isCrowdsaleInited) return;

                try {
                    const {
                        W12CrowdsaleInstance
                    } = this.ContractInstances;

                    const list = await W12CrowdsaleInstance.getMilestones();

                    this.tokenCrowdsaleMilestones = list;
                } catch (e) {
                    this.tokenCrowdsaleMilestones = [];
                    this.setErrorMessage(e.message);
                }
            },
            async setMilestines (milestones) {
                if (!this.token) return;
                if (!this.isCrowdsaleInited) return;

                try {
                    const {
                        W12CrowdsaleInstance
                    } = this.ContractInstances;

                    const tx = await W12CrowdsaleInstance.setMilestones(milestones);
                    const connectedWeb3 = (await Connector.connect()).web3;

                    await waitTransactionReceipt(tx, connectedWeb3);

                    milestones.forEach(stage => stage.wasCreated = true);
                } catch (e) {
                    this.setErrorMessage(e.message);
                }
            },
            async setStages(stages) {
                if (!this.token) return;
                if (!this.isCrowdsaleInited) return;

                this.setStagesLoading = true;

                try {
                    const {
                        W12CrowdsaleInstance
                    } = this.ContractInstances;

                    const tx = await W12CrowdsaleInstance.setStages(stages);
                    const connectedWeb3 = (await Connector.connect()).web3;

                    await waitTransactionReceipt(tx, connectedWeb3);

                    stages.forEach(stage => stage.wasCreated = true);
                    this.tokenCrowdsaleStagesChange = false;
                } catch (e) {
                    this.setErrorMessage(e.message);
                }

                this.setStagesLoading = false;
            },
            async setBonusVolumes(stageIndex, list) {
                if (!this.token) return;
                if (!this.isCrowdsaleInited) return;

                this.setStagesLoading = true;

                try {
                    const {
                        W12CrowdsaleInstance
                    } = this.ContractInstances;

                    const tx = await W12CrowdsaleInstance.setBonusVolumes(this.tokenCrowdsaleStages.length-stageIndex-1, list);
                    const connectedWeb3 = (await Connector.connect()).web3;

                    await waitTransactionReceipt(tx, connectedWeb3);
                } catch (e) {
                    this.setErrorMessage(e.message);
                }

                this.setStagesLoading = false;
            },
            async updateReceivingInformation(){
                if (!this.token || !this.tokenCrowdsaleAddress) return;

                try {
                    const { W12TokenFactory, W12CrowdsaleFactory, DetailedERC20Factory } = await this.ledgerFetch();
                    const {W12TokenLedgerInstance} = this.ContractInstances;
                    const W12Crowdsale = W12CrowdsaleFactory.at(this.tokenCrowdsaleAddress);
                    const wTokenAddress = await W12Crowdsale.methods.getWToken();
                    const W12Token = W12TokenFactory.at(wTokenAddress);
                    const tokenAddress = await W12TokenLedgerInstance.methods.getTokenByWToken(wTokenAddress);
                    const DetailedERC20 = DetailedERC20Factory.at(tokenAddress);
                    const token = await DetailedERC20.getDescription();


                    this.receiving = new ReceivingModel({
                        symbol: token.symbol,
                        symbolW: this.token.symbol,
                        amountUnSold: web3.fromWei(await W12Token.methods.balanceOf(this.tokenCrowdsaleAddress), 'ether').toString(),
                        amountRemainingInTokenChanger: 0,
                        amountRemainingAfterTheExchange: 0,
                        amountTotalAvailable: 0,
                    });
                } catch (e) {
                    this.setErrorMessage(e.message);
                }
            },
            async updateFundInformation() {
                if (!this.token || !this.tokenCrowdsaleAddress) return;

                try {
                    const crowdsaleAddress = this.tokenCrowdsaleAddress;
                    const { W12CrowdsaleFactory, W12FundFactory } = await this.ledgerFetch();
                    const {web3} = await Connector.connect();
                    const W12Crowdsale = W12CrowdsaleFactory.at(crowdsaleAddress);
                    const fundAddress = await W12Crowdsale.methods.fund();
                    const W12Fund = W12FundFactory.at(fundAddress);
                    const getBalance = promisify(web3.eth.getBalance.bind(web3.eth));
                    const data = {
                        address: fundAddress,
                        balanceWei: (await getBalance(fundAddress)).toString(),
                        trancheAmount: (await W12Fund.methods.getTrancheAmount()).toString(),
                    };

                    this.fundData = data;
                } catch (e) {
                    console.log(e.message);
                    //this.setErrorMessage(e.message);
                }
            },
            async tryTranche() {
                const trancheAmount = new BigNumber(this.fundData.trancheAmount);

                if (
                    !this.token
                    || !this.tokenCrowdsaleAddress
                    || !this.fundData.address
                    || !trancheAmount.gt(0)
                ) return;

                try {
                    const fundAddress = this.fundData.address;
                    const { W12FundFactory} = await this.ledgerFetch();
                    const {web3} = await Connector.connect();
                    const W12Fund = W12FundFactory.at(fundAddress);

                    const tx = await W12Fund.methods.tranche();

                    await waitTransactionReceipt(tx, web3);
                    await this.updateFundInformation();
                } catch (e) {
                    this.setErrorMessage(e.message);
                }
            },

            async claimRemainingTokens() {

                if (
                    !this.token
                    || !this.tokenCrowdsaleAddress
                ) return;

                try {
                    const crowdsaleAddress = this.tokenCrowdsaleAddress;
                    const { W12CrowdsaleFactory } = await this.ledgerFetch();
                    const {web3} = await Connector.connect();

                    const W12Crowdsale = W12CrowdsaleFactory.at(crowdsaleAddress);
                    const tx = await W12Crowdsale.methods.claimRemainingTokens();

                    await waitTransactionReceipt(tx, web3);
                    await this.updateReceivingInformation();
                } catch (e) {
                    this.setErrorMessage(e.message);
                }
            },
            onApprovalEvent(error, result) {
                if (!error) {
                    const {spender} = result.args;
                    const W12ListerAddress = config.contracts.W12Lister.address;

                    if (spender.toString() == W12ListerAddress) {
                        this.updateTokensApprovedToPlaceValue();
                    }
                }
            },
            async onTokenPlacedEvent (error, result) {
                if (!error) {
                    const {originalTokenAddress} = result.args;

                    if (originalTokenAddress.toString() == this.tokenAddress) {
                        await this.updatePlacedTokenStatus();
                        await this.updateTokensApprovedToPlaceValue();
                    }
                }
            },
            async subscribeToEvents() {
                if (!this.token) return;
                if (this.subscribedEvents) return;

                this.subscribeToEventsLoading = true;

                try {
                    const {
                        ERC20Instance,
                        W12ListerInstance
                    } = this.ContractInstances;

                    const ApprovalEvent = ERC20Instance.events.Approval(null, null, this.onApprovalEvent);
                    const TokenPlaced = W12ListerInstance.events.TokenPlaced(null, null, this.onTokenPlacedEvent);

                    this.subscribedEvents = {
                        ApprovalEvent,
                        TokenPlaced
                    };
                } catch (e) {
                    this.setErrorMessage(e.message);
                }

                this.subscribeToEventsLoading = false;
            },
            unsubscribeFromEvents() {
                if (!this.subscribedEvents) return;

                this.subscribedEvents.ApprovalEvent.stopWatching();
                this.subscribedEvents.TokenPlaced.stopWatching();
                this.subscribedEvents = null;
            },
            addStage() {
                this.tokenCrowdsaleStagesChange = true;
                this.tokenCrowdsaleStages.push({
                    startDate: null,
                    endDate: null,
                    discount: null,
                    vestingDate: null,
                    bonusVolumes: [],
                    wasCreated: false
                });
            },
            deleteStageAt(stageIndex) {
                this.tokenCrowdsaleStages.splice(stageIndex, 1);
                this.tokenCrowdsaleStagesChange = true;
            },
            saveStages() {
                this.setStages(this.tokenCrowdsaleStages);
            },
            saveMilestones () {
                this.setMilestines(this.tokenCrowdsaleMilestones);
            },
            saveBonusVolumesAt(stageIndex) {
                const stage = this.tokenCrowdsaleStages[stageIndex];

                if (stage.wasCreated) {
                    this.setBonusVolumes(stageIndex, stage.bonusVolumes);
                }
            },
            addBonusVolumesAt(stageIndex) {
                this.tokenCrowdsaleStages[stageIndex].bonusVolumes.push(['', '']);
            },
            deleteBonusVolumesAt(stageIndex, volumeIndex) {
                this.tokenCrowdsaleStages[stageIndex].bonusVolumes.splice(volumeIndex, 1);
            }
        },
        errorCaptured(error, vm, info) {
            this.errorMessage = info || error.message;
        },
        async created() {
            await this.watchCurrentAccount();
        },
        beforeDestroy() {
            this.unsubscribeFromEvents();
        }
    };

</script>
