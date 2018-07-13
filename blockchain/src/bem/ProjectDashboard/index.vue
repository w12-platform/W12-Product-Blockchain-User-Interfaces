<template>
    <div class="ProjectDashboard">
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
        <div>
            <div class="form-group">
                <label for="ProjectDashboardTokenAddress">Token Address</label>
                <input
                        placeholder="Enter your token address to check status"
                        type="text"
                        class="form-control"
                        id="ProjectDashboardTokenAddress"
                        v-model="tokenAddress">
            </div>
            <div v-if="token" class="row align-items-center justify-content-around py-5">
                <div>Symbol: {{ token.symbol }}</div>
                <div>Decimals: {{ token.decimals }}</div>
                <div>Fee (tokens): {{ token.feePercent }}%</div>
                <div>Fee (ETH): {{ token.feeETHPercent }}%</div>
            </div>
            <div>
                <ul class="list-group">
                    <li class="list-group-item">
                        <div class="row align-items-center justify-content-center">
                            <div class="col-auto">
                                <span class="ProjectDashboard__step-badge step-badge badge badge-pill badge-light">1</span>
                            </div>
                            <div class="col-sm-4">
                                Contact W12 to whitelist your token
                            </div>
                            <div class="col-sm-2 text-center">
                                <span v-if="isWhiteListed" class="badge badge-success">Whitelisted</span>
                                <span v-else class="badge badge-info">Not whitelisted</span>
                            </div>
                            <div class="col-sm text-right"></div>
                        </div>
                    </li>
                    <li class="list-group-item">
                        <div class="row align-items-center justify-content-center">
                            <div class="col-auto">
                                <span class="ProjectDashboard__step-badge step-badge badge badge-pill badge-light">2</span>
                            </div>
                            <div class="col-sm-4">
                                Approve tokens to place
                            </div>
                            <div class="col-sm-2 text-center">
                                <span v-if="!(hasAllowance || hasPlacedWTokenAddress) || !isWhiteListed" class="badge badge-success">Pending</span>
                                <span v-else class="badge badge-success">Approved</span>
                            </div>
                            <div class="col-sm text-right">
                                <span v-if="hasAllowance">{{ tokensAmountThatApprovedToPlaceByTokenOwner }}</span>
                                <div v-else-if="isWhiteListed" class="text-left">
                                    <p>
                                        Spend from: {{ ownerAddress }}
                                    </p>
                                    <div class="form-group">
                                        <label for="SpendFrom">Amount</label>
                                        <input
                                                :placeholder="`Max: ${ownerBalance}`"
                                                type="text"
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
                    </li>
                    <li class="list-group-item">
                        <div class="row align-items-center justify-content-center">
                            <div class="col-auto">
                                <span class="ProjectDashboard__step-badge step-badge badge badge-pill badge-light">3</span>
                            </div>
                            <div class="col-sm-4">
                                Place Tokens to Listing
                            </div>
                            <div class="col-sm-2 text-center">
                                <span v-if="!hasPlacedWTokenAddress && (!hasAllowance || !isWhiteListed)"
                                      class="badge badge-success">Pending</span>
                                <span v-else class="badge badge-success">Placed</span>
                            </div>
                            <div class="col-sm text-right">
                                <span v-if="hasPlacedWTokenAddress">{{ placedTokenAddress }}</span>
                                <div v-else-if="isWhiteListed && hasAllowance" class="text-left">
                                    <div class="form-group">
                                        <label for="PlaceAmount">Place Amount</label>
                                        <input
                                                :placeholder="`Max: ${tokensAmountThatApprovedToPlaceByTokenOwner}`"
                                                type="text"
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
                    </li>
                    <li class="list-group-item">
                        <div class="row align-items-center justify-content-center">
                            <div class="col-auto">
                                <span class="ProjectDashboard__step-badge step-badge badge badge-pill badge-light">4</span>
                            </div>
                            <div class="col-sm-4">
                                Configure Crowdsale
                            </div>
                            <div class="col-sm-2 text-center">
                                <span v-if="!isCrowdsaleInited && (!hasPlacedWTokenAddress && (!hasAllowance || !isWhiteListed))"
                                      class="badge badge-success">Pending</span>
                                <span v-else class="badge badge-success">Inited</span>
                            </div>
                            <div class="col-sm text-right">
                                <span v-if="isCrowdsaleInited">{{ tokenCrowdsaleAddress }}</span>
                                <div v-else-if="isWhiteListed && hasPlacedWTokenAddress" class="text-left">
                                    <div class="form-group">
                                        <label for="StartDate">Start date (YYYY-MM-DD)</label>
                                        <input
                                                placeholder="YYYY-MM-DD"
                                                type="text"
                                                class="form-control"
                                                id="StartDate"
                                                v-model="crowdsaleInitForm.date">
                                    </div>
                                    <div class="form-group">
                                        <label for="BaseTokenPrice">Base token price</label>
                                        <input
                                                type="text"
                                                class="form-control"
                                                id="BaseTokenPrice"
                                                v-model="crowdsaleInitForm.price">
                                    </div>
                                    <div class="form-group">
                                        <label for="AmountForSale">Amount for sale</label>
                                        <input
                                                :placeholder="`Min: ${token.tokensForSaleAmount}`"
                                                type="text"
                                                class="form-control"
                                                id="AmountForSale"
                                                v-model="crowdsaleInitForm.amountForSale">
                                    </div>
                                    <div class="text-right">
                                        <button class="btn btn-primary btn-sm" @click="initCrawdsale">Configure</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </li>
                    <li class="list-group-item">
                        <div class="row align-items-center justify-content-center">
                            <div class="col-auto">
                                <span class="ProjectDashboard__step-badge step-badge badge badge-pill badge-light">5</span>
                            </div>
                            <div class="col-sm-4">
                                Configure Crowdsale Bonuses
                            </div>
                            <div class="col-sm">
                                <div v-if="isCrowdsaleInited && hasPlacedWTokenAddress"
                                     class="text-left">
                                    <div class="row" v-for="(stage, stageIndex) in tokenCrowdsaleStages" :key="stageIndex">
                                        <div class="col-sm">
                                            <div class="form-group">
                                                <label for="StageEndDate">End date (YYYY-MM-DD)</label>
                                                <input
                                                        placeholder="YYYY-MM-DD"
                                                        type="text"
                                                        class="form-control"
                                                        id="StageEndDate"
                                                        v-model="tokenCrowdsaleStages[stageIndex].endDate">
                                            </div>
                                            <div class="form-group">
                                                <label for="StageDiscount">Discount %</label>
                                                <input
                                                        type="text"
                                                        class="form-control"
                                                        id="StageDiscount"
                                                        v-model="tokenCrowdsaleStages[stageIndex].discount">
                                            </div>
                                            <div class="form-group">
                                                <label for="StageVestingDate">Vesting Date (YYYY-MM-DD)</label>
                                                <input
                                                        placeholder="YYYY-MM-DD"
                                                        type="text"
                                                        class="form-control"
                                                        id="StageVestingDate"
                                                        v-model="tokenCrowdsaleStages[stageIndex].vestingDate">
                                            </div>
                                            <div class="text-right">
                                                <button class="btn btn-primary btn-sm" @click="deleteStageAt(stageIndex)">
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                        <div class="col-sm">
                                            <div v-for="(bonusVolume, bonusVolumeIndex) in stage.bonusVolumes" :key="bonusVolumeIndex">
                                                <div class="form-row">
                                                    <div class="form-group col-md-6">
                                                        <label for="bonusVolumeETH">From (ETH)</label>
                                                        <input
                                                                placeholder="ETH"
                                                                type="text"
                                                                class="form-control"
                                                                id="bonusVolumeETH"
                                                                v-model="tokenCrowdsaleStages[stageIndex].bonusVolumes[bonusVolumeIndex][0]">
                                                    </div>
                                                    <div class="form-group col-md-6">
                                                        <label for="bonusVolumePercent">Bonus Percent</label>
                                                        <input
                                                                type="text"
                                                                class="form-control"
                                                                id="bonusVolumePercent"
                                                                v-model="tokenCrowdsaleStages[stageIndex].bonusVolumes[bonusVolumeIndex][1]">
                                                    </div>
                                                </div>
                                                <div class="text-right">
                                                    <button class="btn btn-primary btn-sm"
                                                            @click="deleteBonusVolumesAt(stageIndex, bonusVolumeIndex)">
                                                        delete
                                                    </button>
                                                </div>
                                            </div>
                                            <div class="text-center pt-2">
                                                <button class="btn btn-primary btn-sm"
                                                        @click="addBonusVolumesAt(stageIndex)">
                                                    Add
                                                </button>
                                                <button v-if="stage.bonusVolumes.length" class="btn btn-primary btn-sm"
                                                        @click="saveBonusVolumesAt(stageIndex)">
                                                    Save
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="text-center pt-3">
                                        <button class="btn btn-primary btn-sm" @click="addStage">
                                            Add stage
                                        </button>
                                        <button v-if="tokenCrowdsaleStages.length" class="btn btn-primary btn-sm" @click="saveStages">
                                            Save stages
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    </section>
    </div>
</template>

<script>
    import Ledger from '../../lib/Blockchain/ContractsLedger.js';
    import config from '../../config.js';
    import { promisify } from '../../lib/utils.js';
    import Connector from '../../lib/Blockchain/DefaultConnector.js';
    import { waitTransactionReceipt } from '../../lib/utils.js';

    const moment = window.moment;

    // as utils
    const web3 = new Web3();

    export default {
        name: 'ProjectDashboard',
        template: '#ProjectDashboardTemplate',
        data () {
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
                fetchCrowdsaleStagesListLoading:false,
                setStagesLoading:false,
                loading: false,
                tokenAddress: '',
                errorMessage: '',
                infoMessage: '',
                token: null,
                tokensAmountThatApprovedToPlaceByTokenOwner: '0',
                placedTokenAddress: null,
                ownerBalance: '0',
                tokenCrowdsaleAddress: null,
                ownerAddress: '',
                tokenCrowdsaleStages: [],
                approveForm: {
                    value: '0'
                },
                placeTokensForm: {
                    value: '0'
                },
                crowdsaleInitForm: {
                    date: '',
                    amountForSale: '0',
                    price: ''
                },
                crowdsaleStagesToAdd: [],
            };
        },
        computed: {
            isLoading () {
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
            isChecksumAddress () {
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
            isWhiteListed () {
                return Boolean(this.token);
            },
            hasPlacedWTokenAddress() {
                return Boolean(this.placedTokenAddress);
            },
            isCrowdsaleInited() {
                return Boolean(this.tokenCrowdsaleAddress);
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
            clearErrorMessage () {
                this.errorMessage = '';
            },
            setErrorMessage (message) {
                this.errorMessage = message;
            },
            handleTokenAddressChange(value, prevValue) {
                this.clearErrorMessage();

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
            async handleTokenChange(value, prevValue) {
                this.unsubscribeFromEvents();
                await this.subscribeToEvents();
                await this.updateOwnerBalance();
                await this.updateTokensApprovedToPlaceValue();
                await this.updatePlacedTokenStatus();
                await this.fetchCrowdsaleAddressAndCreateContractInstance();
                await this.fetchCrowdsaleStagesList();
            },
            async loadLedger () {
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
            async fetchToken () {
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

                    console.log(currentAccount, W12ListerAddress);

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
            async updatePlacedTokenStatus () {
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
                            && result != '0x0000000000000000000000000000000000000000'
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
            async fetchCrowdsaleAddressAndCreateContractInstance () {
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
                            && address != '0x0000000000000000000000000000000000000000'
                        ) {

                            const { W12CrowdsaleFactory } = await this.loadLedger();
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

                    await ERC20Instance.methods.approve(W12ListerAddress, value.toString());
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

                    await W12ListerInstance.methods.placeToken(tokenAddress, value.toString());
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
                const amountForSale = new web3.BigNumber(data.amountForSale || 0);
                const price = new web3.BigNumber(data.price || 0);
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

                    await waitTransactionReceipt(txhash, connectedWeb3, 5000);
                    await this.fetchCrowdsaleAddressAndCreateContractInstance();
                } catch (e) {
                    this.setErrorMessage(e.message);
                }

                this.initCrawdsaleLoading = false;
            },
            async updateOwnerBalance () {
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

                    this.tokenCrowdsaleStages = list;
                } catch (e) {
                    this.tokenCrowdsaleStages = [];
                    this.setErrorMessage(e.message);
                }

                this.fetchCrowdsaleStagesListLoading = false;
            },
            async setStages (stages) {
                if (!this.token) return;
                if (!this.isCrowdsaleInited) return;

                this.setStagesLoading = true;

                try {
                    const {
                        W12CrowdsaleInstance
                    } = this.ContractInstances;

                    const tx = await W12CrowdsaleInstance.setStages(stages);
                    const connectedWeb3 = (await Connector.connect()).web3;

                    await waitTransactionReceipt(tx, connectedWeb3, 5000);

                    stages.forEach(stage => stage.wasCreated = true);
                } catch (e) {
                    this.setErrorMessage(e.message);
                }

                this.setStagesLoading = false;
            },
            async setBonusVolumes (stageIndex, list) {
                if (!this.token) return;
                if (!this.isCrowdsaleInited) return;

                this.setStagesLoading = true;

                try {
                    const {
                        W12CrowdsaleInstance
                    } = this.ContractInstances;

                    const tx = await W12CrowdsaleInstance.setBonusVolumes(stageIndex, list);
                    const connectedWeb3 = (await Connector.connect()).web3;

                    await waitTransactionReceipt(tx, connectedWeb3, 5000);
                } catch (e) {
                    this.setErrorMessage(e.message);
                }

                this.setStagesLoading = false;
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
            onTokenPlacedEvent (error, result) {
                if (!error) {
                    const {originalTokenAddress} = result.args;

                    if (originalTokenAddress.toString() == this.tokenAddress) {
                        this.updatePlacedTokenStatus();
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
                this.tokenCrowdsaleStages.push({
                    endDate: '',
                    discount: '',
                    vestingDate: '',
                    bonusVolumes: [],
                    wasCreated: false
                });
            },
            deleteStageAt(stageIndex) {
                this.tokenCrowdsaleStages.splice(stageIndex, 1);
            },
            saveStages() {
                this.setStages(this.tokenCrowdsaleStages);
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
            this.watchCurrentAccountAddress();
        },
        beforeDestroy() {
            this.unwatchCurrentAccountAddress();
            this.unsubscribeFromEvents();
        }
    };

</script>