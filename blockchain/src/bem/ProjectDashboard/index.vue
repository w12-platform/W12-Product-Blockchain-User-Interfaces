<template>
    <div class="ProjectDashboard buefy">
        <section class="container">
            <h2>Project Dashboard</h2>
            <div v-if="isLoading" class="alert alert-info" role="alert">
                <span v-if="loadingLedger">Загрузка смарт-контрактов...<br></span>
                <span v-if="fetchingToken">Поиск токена...<br></span>
                <span v-else="!loadingLedger && !fetchingToken">Ожидайте...<br></span>
            </div>
            <div v-if="errorMessage" class="alert alert-danger" role="alert">
                <span>{{ errorMessage }}</span>
            </div>
            <div v-if="!isLoading">

                <b-field class="ProjectDashboard__select">
                    <b-field>
                        <b-select
                                v-model="tokenAddress"
                                @input="tokenSelected"
                                v-if="W12Lister"
                                placeholder="Select a token"
                                expanded>
                            <option
                                    v-for="(token, idx) in W12Lister"
                                    :key="idx"
                                    :value="token.tokenAddress">{{ token.symbol }} - {{ token.tokenAddress }}
                            </option>
                        </b-select>
                    </b-field>
                </b-field>

                <div v-if="token"
                     class="ProjectDashboard__tokenInfo row align-items-center justify-content-around py-4">
                    <div>Symbol: {{ token.symbol }}</div>
                    <div>Decimals: {{ token.decimals }}</div>
                    <div>Fee (tokens): {{ token.feePercent }}%</div>
                    <div>Fee (ETH): {{ token.feeETHPercent }}%</div>
                </div>

                <div class="ProjectDashboard__stages">
                    <div class="ProjectDashboard__stage">
                        <div class="row align-items-center justify-content-center">
                            <div class="col-auto">
                                <span class="ProjectDashboard__step-badge step-badge badge badge-pill badge-light">1</span>
                            </div>
                            <div class="col-sm-4">
                                Contact W12 to whitelist your token
                            </div>
                            <div class="col-sm-2 text-center">
                                <b-tag v-if="isWhiteListed" type="is-success">Whitelisted</b-tag>
                                <b-tag v-else type="is-info">Not whitelisted</b-tag>
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
                                Approve tokens to place
                            </div>
                            <div class="col-sm-2 text-center">
                                <b-tag v-if="!(hasAllowance || hasPlacedWTokenAddress) || !isWhiteListed"
                                       type="is-success">Pending
                                </b-tag>
                                <b-tag v-else type="is-success">Approved</b-tag>
                            </div>
                            <div class="col-sm text-right">
                                <span v-if="hasAllowance">{{ tokensAmountThatApprovedToPlaceByTokenOwnerToNumber }}</span>
                                <div v-else-if="isWhiteListed" class="text-left">
                                    <b-tag class="ProjectDashboard__approveInfo" type="is-info">Spend from: {{
                                        ownerAddress }}
                                    </b-tag>
                                    <div class="form-group">
                                        <label for="SpendFrom">Amount</label>
                                        <input
                                                :placeholder="`Max: ${ownerBalanceToNumber}`"
                                                type="number"
                                                min="0"
                                                :max="ownerBalanceToNumber"
                                                class="form-control"
                                                id="SpendFrom"
                                                v-model="approveForm.value">
                                    </div>
                                    <div class="text-right">
                                        <button class="btn btn-primary btn-sm" @click="approveTokensToSpend">Approve
                                        </button>
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
                                Place Tokens to Listing
                            </div>
                            <div class="col-sm-2 text-center">
                                <b-tag v-if="!hasPlacedWTokenAddress && (!hasAllowance || !isWhiteListed)"
                                       type="is-success">Pending
                                </b-tag>
                                <b-tag v-else type="is-success">Placed</b-tag>
                            </div>
                            <div class="col-12 text-left">
                                <b-tag class="ProjectDashboard__placedWTokenAddress" v-if="hasPlacedWTokenAddress"
                                       type="is-info">{{ placedTokenAddress }}
                                </b-tag>
                            </div>
                            <div class="ProjectDashboard__placeForm col-12 text-right">
                                <div v-if="isWhiteListed && hasAllowance" class="text-left">
                                    <div class="form-group">
                                        <label for="PlaceAmount">Place Amount</label>
                                        <input
                                                :placeholder="`Max: ${tokensAmountThatApprovedToPlaceByTokenOwnerToNumber}`"
                                                type="number"
                                                min="0"
                                                :max="tokensAmountThatApprovedToPlaceByTokenOwnerToNumber"
                                                class="form-control"
                                                id="PlaceAmount"
                                                v-model="placeTokensForm.value">
                                    </div>
                                    <div class="text-right">
                                        <button class="btn btn-primary btn-sm" @click="placeTokens">Place</button>
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
                                Configure Crowdsale
                            </div>
                            <div class="col-sm-2 text-center">
                                <b-tag v-if="!isCrowdsaleInited && (!hasPlacedWTokenAddress && (!hasAllowance || !isWhiteListed))"
                                       type="is-success">Pending
                                </b-tag>
                                <b-tag v-else type="is-success">Inited</b-tag>
                            </div>
                            <div class="ProjectDashboard__configureCrowdsale col-12 text-left">
                                <b-tag class="ProjectDashboard__initCrowdsaleAddress" v-if="isCrowdsaleInited"
                                       type="is-info">{{ tokenCrowdsaleAddress }}
                                </b-tag>

                                <div v-else-if="isWhiteListed && hasPlacedWTokenAddress" class="text-left">
                                    <div class="form-group">
                                        <label for="StartDate">Start date</label>
                                        <b-field id="StartDate" class="ProjectDashboard__dateSelect">
                                            <b-datepicker
                                                    :min-date="minStartDate"
                                                    placeholder="Click to select..."
                                                    icon="calendar-today"
                                                    v-model="crowdsaleInitForm.date">
                                            </b-datepicker>
                                        </b-field>
                                    </div>
                                    <div class="form-group">
                                        <label for="BaseTokenPrice">Base token price</label>
                                        <b-field id="BaseTokenPrice">
                                            <b-input placeholder="ETH"
                                                     type="number"
                                                     :step="0.0001"
                                                     min="0"
                                                     v-model="crowdsaleInitForm.price"
                                                     icon="ethereum">
                                            </b-input>
                                        </b-field>
                                    </div>
                                    <div class="form-group">
                                        <label for="AmountForSale">Amount for sale</label>
                                        <b-field id="AmountForSale">
                                            <b-input :placeholder="`Min: ${tokensForSaleAmountToNumber}`"
                                                     type="number"
                                                     min="0"
                                                     v-model="crowdsaleInitForm.amountForSale"
                                                     icon="shopping">
                                            </b-input>
                                        </b-field>
                                    </div>
                                    <div class="text-right">
                                        <button class="btn btn-primary btn-sm" @click="initCrawdsale">Configure
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
                                Configure Crowdsale Bonuses
                            </div>
                            <div class="col-12">
                                <div v-if="isCrowdsaleInited && hasPlacedWTokenAddress" class="text-left">
                                    <b-collapse class="ProjectDashboard__bonuses card">
                                        <div class="card-content">
                                            <div class="content" v-if="tokenCrowdsaleStages.length">
                                                <b-collapse class="ProjectDashboard__stageBonus card" v-for="(stage, stageIndex) in tokenCrowdsaleStages" :key="stageIndex">
                                                    <div class="col-12 pb-4">
                                                        <div class="p-3 row align-items-center justify-content-between">
                                                            <span class="ProjectDashboard__stageTitle">Stage #{{ stageIndex+1 }}</span>
                                                            <button class="btn btn-primary btn-sm" @click="deleteStageAt(stageIndex)">Remove stage</button>
                                                        </div>
                                                        <div class="ProjectDashboard__stageBonus col-sm py-2">
                                                            <div class="row justify-content-between">
                                                                <div class="col-sm py-2">
                                                                    <label>Start date</label>
                                                                    <b-field class="ProjectDashboard__dateSelect">
                                                                        <b-datepicker
                                                                                disabled
                                                                                v-model="tokenCrowdsaleStages[stageIndex].startDate"
                                                                                placeholder="Click to select..."
                                                                                icon="calendar-today">
                                                                        </b-datepicker>
                                                                    </b-field>
                                                                </div>
                                                                <div class="col-sm py-2">
                                                                    <label>End date</label>
                                                                    <b-field class="ProjectDashboard__dateSelect">
                                                                        <b-datepicker
                                                                                v-model="tokenCrowdsaleStages[stageIndex].endDate"
                                                                                placeholder="Click to select..."
                                                                                icon="calendar-today">
                                                                        </b-datepicker>
                                                                    </b-field>
                                                                </div>
                                                            </div>
                                                            <div class="row justify-content-between">
                                                                <div class="col-sm py-2">
                                                                    <label for="StageDiscount">Discount</label>
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
                                                                    <label for="StageVestingDate">Vesting Date</label>
                                                                    <b-field id="StageVestingDate"
                                                                             class="ProjectDashboard__dateSelect">
                                                                        <b-datepicker
                                                                                v-model="tokenCrowdsaleStages[stageIndex].vestingDate"
                                                                                placeholder="Click to select..."
                                                                                icon="calendar-today">
                                                                        </b-datepicker>
                                                                    </b-field>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div class="p-3 row align-items-center justify-content-between">
                                                            <span class="ProjectDashboard__stageTitle">Volume bonuses</span>
                                                        </div>
                                                        <div class="col-sm py-2">
                                                            <div v-for="(bonusVolume, bonusVolumeIndex) in stage.bonusVolumes" :key="bonusVolumeIndex">
                                                                <div class="row justify-content-between">
                                                                    <div class="col-sm py-2">
                                                                        <label v-if="bonusVolumeIndex === 0" for="bonusVolumeETH">From (ETH)</label>
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
                                                                                <label v-if="bonusVolumeIndex === 0" for="bonusVolumePercent">Bonus</label>
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
                                                                    Add
                                                                </button>
                                                                <button v-if="stage.bonusVolumes.length"
                                                                        :disabled="tokenCrowdsaleStagesChange"
                                                                        class="btn btn-primary btn-sm"
                                                                        @click="saveBonusVolumesAt(stageIndex)">
                                                                    Save
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </b-collapse>
                                            </div>

                                            <footer class="card-footer">
                                                <a class="card-footer-item" @click="addStage">Add stage</a>
                                                <a class="card-footer-item" v-if="tokenCrowdsaleStages.length"
                                                   @click="saveStages">Save stages</a>
                                            </footer>
                                        </div>

                                    </b-collapse>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div v-if="token && isCrowdsaleInited">
                <h2>Milestones</h2>
                <div class="box">
                    <MilestoneList v-model="tokenCrowdsaleMilestones"></MilestoneList>
                </div>
                <button class="btn btn-primary btn-sm btn-block" @click="saveMilestones">Send Milestones to blockchain
                </button>
            </div>
            <div v-if="trancheInformationData">
                <h2>Получение ETH</h2>
                <TrancheInformation :data="trancheInformationData"></TrancheInformation>
                <button class="btn btn-primary" :disabled="!allowTranche" @click="tryTranche">Получить</button>
            </div>

            <Receiving
                    v-if="receiving"
                    :data="receiving"
                    @claimRemainingTokens="claimRemainingTokens"
            ></Receiving>
        </section>
    </div>
</template>

<script>
    import config from '../../config.js'; //нужно переместить конфиг и убрать ../../ дабавив alias в вебпак
    import 'bem/buefy/default.scss';
    import 'bem/ProjectDashboard/default.scss';

    import Ledger from 'lib/Blockchain/ContractsLedger.js';
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
    const W12ListerNS = createNamespacedHelpers('W12Lister');
    const moment = window.moment;

    // as utils
    const web3 = new Web3();
    const BigNumber = web3.BigNumber;

    export default {
        name: 'ProjectDashboard',
        components: {
            TrancheInformation,
            MilestoneList,
            Receiving
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
                ownerAddress: '',
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
            minStartDate() {
                const today = new Date();
                return new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
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
            }
        },
        watch: {
            tokenAddress: {
                handler: 'handleTokenAddressChange',
                immediate: true
            },
            token: {
                handler: 'handleTokenChange'
            }
        },
        methods: {
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
            async handleTokenChange(value, prevValue) {
                this.unsubscribeFromEvents();
                await this.subscribeToEvents();
                await this.updateOwnerBalance();
                await this.updateTokensApprovedToPlaceValue();
                await this.updatePlacedTokenStatus();
                await this.fetchCrowdsaleAddressAndCreateContractInstance();
                await this.fetchCrowdsaleStagesList();
                await this.fetchCrowdsaleMilestonesList();
                await this.updateFundInformation();
                await this.updateReceivingInformation();
            },
            async loadLedger() {
                let ledger

                this.loadingLedger = true;

                try {
                    ledger = await Ledger;
                } catch (e) {
                    this.setErrorMessage(e.message);
                }

                this.loadingLedger = false;

                return ledger;
            },
            async fetchTokensList() {
                this.fetchTokens = true;

                const {W12ListerFactory} = await this.loadLedger();

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
                const {W12ListerFactory} = await this.loadLedger();

                if (
                    !W12ListerFactory
                ) {
                    return;
                }

                if (tokenAddress) {
                    try {
                        const W12Lister = W12ListerFactory.at(config.contracts.W12Lister.address);
                        const data = await W12Lister.fetchComposedTokenInformationByTokenAddress(tokenAddress);

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
                    console.log(allowanceValue);

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

                        console.log(result);

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
                        const address = await W12ListerInstance.methods.getTokenCrowdsale(this.tokenAddress);

                        if (
                            address
                            && !isZeroAddress(address)
                        ) {

                            const {W12CrowdsaleFactory} = await this.loadLedger();
                            const W12CrowdsaleInstance = W12CrowdsaleFactory.at(address);

                            this.ContractInstances.W12CrowdsaleInstance = W12CrowdsaleInstance;
                            this.tokenCrowdsaleAddress = address;
                        } else {
                            this.tokenCrowdsaleAddress = null;
                        }
                    } catch (e) {
                        this.tokenCrowdsaleAddress = null;
                        console.log('fetchCrowdsaleAddressAndCreateContractInstance', e);
                    }
                } catch (e) {
                    this.tokenCrowdsaleAddress = null;
                    this.setErrorMessage(e.message);
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

                    await ERC20Instance.methods.approve(W12ListerAddress, web3.toWei(value, 'ether'));
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

                    if (!tokenAddress) {
                        throw new Error('not enough information to do request');
                    }

                    await W12ListerInstance.methods.placeToken(tokenAddress, web3.toWei(value, 'ether'));
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
                const date = moment(data.date, 'YYYY-MM-DD');
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

                    const txhash = await W12ListerInstance.methods.initCrowdsale(
                        date.utc().unix(),
                        tokenAddress,
                        amountForSale.toString(),
                        price.toString()
                    );

                    await waitTransactionReceipt(txhash, connectedWeb3);
                    await this.fetchCrowdsaleAddressAndCreateContractInstance();
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
                    const { W12TokenFactory, W12CrowdsaleFactory, DetailedERC20Factory } = await this.loadLedger();
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
                    const { W12CrowdsaleFactory, W12FundFactory } = await this.loadLedger();
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
                    this.setErrorMessage(e.message);
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
                    const { W12FundFactory} = await this.loadLedger();
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
                    const { W12CrowdsaleFactory } = await this.loadLedger();
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
            watchCurrentAccountAddress() {
                this.unwatchCurrentAccountAddress();

                const watcher = async () => {
                    try {
                        const connectedWeb3 = (await Connector.connect()).web3;
                        const getAccounts = promisify(connectedWeb3.eth.getAccounts.bind(connectedWeb3.eth.getAccounts));

                        const currentAccount = (await getAccounts())[0];

                        this.ownerAddress = currentAccount;
                    } catch (e) {
                        console.log(e);
                    }
                }

                watcher();
                this.currentAccountWatcherTmId = setInterval(watcher, 5000);
            },
            unwatchCurrentAccountAddress() {
                clearInterval(this.currentAccountWatcherTmId);
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
        created() {
            this.fetchTokensList();
            this.watchCurrentAccountAddress();
        },
        beforeDestroy() {
            this.unwatchCurrentAccountAddress();
            this.unsubscribeFromEvents();
        }
    };

</script>
