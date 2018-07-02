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
            const {W12ListerFactory, ERC20Factory, W12TokenLedgerFactory} = await this.loadLedger();

            if (
                !W12ListerFactory
                    || !ERC20Factory
                        || !W12TokenLedgerFactory
            ) {
                return;
            }

            if (tokenAddress) {
                try {
                    const W12Lister = W12ListerFactory.at(config.contracts.W12Lister.address);
                    const whiteListEvent = W12Lister.events.OwnerWhitelisted({tokenAddress}, { fromBlock: 0 });

                    const getEventRecord = promisify(whiteListEvent.get.bind(whiteListEvent));

                    const tokenIndex = (await W12Lister.methods.approvedTokensIndex(tokenAddress)).toNumber();

                    if (tokenIndex > 0) {
                        const eventRecord = await getEventRecord();

                        if (eventRecord.length > 0) {
                            const {
                                name,
                                symbol,
                                tokenAddress,
                                tokenOwner
                            } = eventRecord[0].args; // take first record by default


                            const listedToken = await W12Lister.methods.approvedTokens(tokenIndex);
                            const ledgerAddress = await W12Lister.methods.ledger();
                            const decimals = listedToken[2].toString();
                            const feePercent = listedToken[3].toString();
                            const feeETHPercent = listedToken[4].toString();
                            const crowdsaleAddress = listedToken[5].toString();
                            const tokensForSaleAmount = listedToken[6].toString();
                            const wTokensIssuedAmount = listedToken[7].toString();
                            const ERC20 = ERC20Factory.at(tokenAddress);
                            const W12TokenLedger = W12TokenLedgerFactory.at(ledgerAddress);

                            this.ContractInstances = {
                                ERC20Instance: ERC20,
                                W12TokenLedgerInstance: W12TokenLedger,
                                W12ListerInstance: W12Lister
                            };

                            this.token = {
                                index: tokenIndex,
                                ledgerAddress,
                                name,
                                symbol,
                                tokenAddress,
                                tokenOwner,
                                decimals,
                                feePercent,
                                feeETHPercent,
                                crowdsaleAddress,
                                tokensForSaleAmount,
                                wTokensIssuedAmount,
                                listedToken
                            };
                        }
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
                    || !date.isAfter(moment())
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
