<template>
    <div class="AdminDashboad">
        <section class=" container">
            <h2>{{ $t('AdminDashboard') }}</h2>
            <div v-if="isLoading" class="alert alert-info" role="alert">
                <span v-if="loadingLedger">{{ $t('AdminDashboardLoadLedger') }}<br></span>
                <span v-if="fetchTokens">{{ $t('AdminDashboardLoadTokens') }}<br></span>
                <span v-if="whitelistingToken">{{ $t('AdminDashboardListingToken') }}</span>
                <span v-if="checkingToken">{{ $t('AdminDashboardCheckingToken') }}</span>
            </div>
            <div v-if="errorMessage" class="alert alert-danger" role="alert">
                <span>{{ errorMessage }}</span>
            </div>
            <div v-if="!isLoading">
                <div class="form-group">
                    <label for="TokenAddress">{{ $t('AdminDashboardFieldTokenLabel') }}</label>
                    <input
                            :placeholder="$t('AdminDashboardFieldTokenPlaceholder')"
                            type="text"
                            class="form-control"
                            id="TokenAddress"
                            v-model="whiteListForm.tokenAddress">
                </div>
                <div class="form-group">
                    <label for="OwnerAddress">{{ $t('AdminDashboardFieldOwnerLabel') }}</label>
                    <input
                            :placeholder="$t('AdminDashboardFieldOwnerPlaceholder')"
                            type="text"
                            class="form-control"
                            id="OwnerAddress"
                            v-model="whiteListForm.ownerAddress">
                </div>
                <div class="form-group">
                    <label for="Symbol">{{ $t('AdminDashboardFieldSymbolLabel') }}</label>
                    <input
                            :placeholder="$t('AdminDashboardFieldSymbolPlaceholder')"
                            minlength="1"
                            maxlength="4"
                            type="text"
                            class="form-control"
                            id="Symbol"
                            v-model="whiteListForm.symbol">
                </div>
                <div class="form-group">
                    <label for="Decimals">{{ $t('AdminDashboardFieldDecimalsLabel') }}</label>
                    <input
                            :placeholder="$t('AdminDashboardFieldDecimalsPlaceholder')"
                            type="number"
                            minlength="1"
                            maxlength="2"
                            class="form-control"
                            id="Decimals"
                            v-model="whiteListForm.decimals">
                </div>
                <div class="form-group">
                    <label for="Name">{{ $t('AdminDashboardFieldNameLabel') }}</label>
                    <input
                            :placeholder="$t('AdminDashboardFieldNamePlaceholder')"
                            type="text"
                            class="form-control"
                            id="Name"
                            v-model="whiteListForm.name">
                </div>
                <div class="form-group">
                    <label for="FeeTokens">{{ $t('AdminDashboardFieldFeeTokensLabel') }}</label>
                    <input
                            :placeholder="$t('AdminDashboardFieldFeeTokensLabel')"
                            type="text"
                            minlength="1"
                            maxlength="3"
                            class="form-control"
                            id="FeeTokens"
                            v-model="whiteListForm.feePercent">
                </div>
                <div class="form-group">
                    <label for="FeeETH">{{ $t('AdminDashboardFieldFeeEthLabel') }}</label>
                    <input
                            :placeholder="$t('AdminDashboardFieldFeeEthPlaceholder')"
                            type="text"
                            minlength="1"
                            maxlength="3"
                            class="form-control"
                            id="FeeETH"
                            v-model="whiteListForm.feeETHPercent">
                </div>
                <div>
                    <p v-if="disableWhiteListButton" class="alert alert-warning">{{ $t('AdminDashboardWarning') }}</p>
                    <button class="btn btn-primary" @click="tryWhiteListToken" :disabled="disableWhiteListButton">{{ $t('AdminDashboardWhitelist') }}</button>
                </div>
                <div class="AdminDashboard__tokens-table" v-if="tokensListTableData.length">
                    <table class="table table-striped table-bordered table-hover table-responsive-sm">
                        <thead class="thead-dark">
                        <tr>
                            <th scope="col">{{ $t('AdminDashboardTableToken') }}</th>
                            <th scope="col">{{ $t('AdminDashboardTableOwner') }}</th>
                            <th scope="col">{{ $t('AdminDashboardTableSymbol') }}</th>
                            <th scope="col">{{ $t('AdminDashboardTableName') }}</th>
                            <th scope="col">{{ $t('AdminDashboardTableDecimals') }}</th>
                            <th scope="col">{{ $t('AdminDashboardTableFeeTokens') }}</th>
                            <th scope="col">{{ $t('AdminDashboardTableFeeEth') }}</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr v-for="(token, idx) in tokensListTableData" :key="idx">
                            <td>{{ token.address }}</td>
                            <td>{{ token.owner }}</td>
                            <td>{{ token.symbol }}</td>
                            <td>{{ token.name }}</td>
                            <td>{{ token.decimals }}</td>
                            <td>{{ token.feePercent }}%</td>
                            <td>{{ token.feeETHPercent }}%</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    </div>
</template>

<script>
    import Ledger from 'lib/Blockchain/ContractsLedger.js';
    import {
        UNKNOWN_ERROR_WHILE_FETCH_TOKENS_LIST,
        UNKNOWN_ERROR_WHILE_WHITELISTING_TOKEN
    } from '../../errors.js';
    import {promisify, waitTransactionReceipt} from '../../lib/utils.js';
    import Connector from '../../lib/Blockchain/DefaultConnector.js';
    import { createNamespacedHelpers } from 'vuex';

    const ConfigNS = createNamespacedHelpers('Config');

    export default {
        name: 'AdminDashboard',
        template: '#AdminDashboardTemplate',
        data() {
            return {
                loadingLedger: false,
                fetchTokens: false,
                whitelistingToken: false,
                checkingToken: false,
                isTokenExists: false,
                errorMessage: '',
                whiteListForm: {
                    tokenAddress: '',
                    ownerAddress: '',
                    symbol: 'TN',
                    decimals: '18',
                    name: 'Token Name',
                    feePercent: '10',
                    feeETHPercent: '10'
                },
                tokensList: []
            };
        },
        computed: {
            ...ConfigNS.mapState({
                W12ListerAddress: state => state.W12Lister.address
            }),
            isLoading() {
                return (
                    this.loadingLedger
                    || this.fetchTokens
                    || this.whitelistingToken
                    || this.checkingToken
                );
            },
            disableWhiteListButton() {
                return (
                    this.isLoading
                    || !this.whiteListForm.tokenAddress
                    || !this.whiteListForm.ownerAddress
                    || !this.whiteListForm.symbol
                    || !this.whiteListForm.decimals
                    || !this.whiteListForm.name
                    || !this.whiteListForm.feePercent
                    || !this.whiteListForm.feeETHPercent
                    || !this.tokenExistsAndAllowedToWhiteList
                );
            },
            tokensListTableData() {
                return this.tokensList.map(item => ({
                    address: item.tokenAddress,
                    owner: item.tokenOwner,
                    symbol: item.symbol,
                    name: item.name,
                    decimals: item.decimals,
                    feePercent: item.feePercent,
                    feeETHPercent: item.feeETHPercent
                }));
            },
            tokenExistsAndAllowedToWhiteList() {
                const foundInList = this.tokensList.find(token => token.tokenAddress === this.whiteListForm.tokenAddress);
                const isTheSameOwner = foundInList ? foundInList.tokenOwner === this.whiteListForm.ownerAddress : false;
                const isWhiteListed = !!foundInList;

                return (
                    this.isTokenExists
                        && (!isWhiteListed || !isTheSameOwner)
                )
            }
        },
        watch: {
            W12ListerAddress: {
                handler: 'onW12ListerAddressChange',
            },
            'whiteListForm.tokenAddress': {
                handler: 'onTokenAddressChange'
            },
            tokensList: {
                handler: 'onTokenListChange'
            }
        },
        methods: {
            async tryWhiteListToken() {
                this.clearErrorMessage();

                if (this.isLoading) return;

                await this.whiteListToken(this.whiteListForm);
            },
            clearErrorMessage() {
                this.errorMessage = '';
            },
            setErrorMessage(message) {
                this.errorMessage = message;
            },
            onOwnerWhitelistedEvent(errors, result) {
                if (!errors) {
                    this.fetchTokensList();
                } else {
                    this.setErrorMessage(errors.message);
                }
            },
            async whiteListToken(data) {
                this.whitelistingToken = true;

                const {W12ListerFactory} = await this.loadLedger();

                if (W12ListerFactory) {
                    try {
                        const W12Lister = W12ListerFactory.at(this.W12ListerAddress);
                        const connectedWeb3 = (await Connector.connect()).web3;

                        const tx = await W12Lister.methods.whitelistToken(
                            data.ownerAddress,
                            data.tokenAddress,
                            data.name,
                            data.symbol,
                            data.decimals,
                            data.feePercent,
                            data.feeETHPercent
                        );

                        await waitTransactionReceipt(tx, connectedWeb3);
                        this.endTokenWhiteListOperation();
                    } catch (e) {
                        this.setErrorMessage(e.message || UNKNOWN_ERROR_WHILE_WHITELISTING_TOKEN);
                    }
                }

                this.whitelistingToken = false;
            },
            async loadLedger() {
                let ledger

                this.loadingLedger = true;

                try {
                    ledger = await Ledger;
                } catch (e) {
                    this.setErrorMessage(e.message || UNKNOWN_ERROR_WHILE_FETCH_TOKENS_LIST);
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

                        this.tokensList = list.map(({token}) => token);
                    } catch (e) {
                        this.setErrorMessage(e.message || UNKNOWN_ERROR_WHILE_FETCH_TOKENS_LIST);
                    }
                }

                this.fetchTokens = false;
            },
            async checkToken() {
                const address = this.whiteListForm.tokenAddress;

                if (address) {
                    this.checkingToken = true;

                    const { DetailedERC20Factory } = await this.loadLedger();
                    const DetailedERC20 = DetailedERC20Factory.at(address);
                    const isExists = await DetailedERC20.isCurrentAddressСompatibleWithToken();

                    this.isTokenExists = isExists;
                    this.checkingToken = false;
                }
            },
            async predefineTokenInformation() {
                const address = this.whiteListForm.tokenAddress;
                const {web3} = await Connector.connect();
                const getAccounts = promisify(web3.eth.getAccounts.bind(web3.eth));
                const currentAccount = (await getAccounts())[0];

                if (this.isTokenExists) {
                    const {DetailedERC20Factory} = await this.loadLedger();
                    const DetailedERC20 = DetailedERC20Factory.at(address);
                    const tokenInformation = await DetailedERC20.getDescription();
                    const { name, symbol, decimals } = tokenInformation;

                    Object.assign(this.whiteListForm, {
                        name,
                        symbol,
                        ownerAddress: currentAccount,
                        decimals: decimals.toString()
                    });
                }
            },
            async createEventsHelpers() {
                if (!this.EventHelpers) {
                    const {W12ListerFactory} = await this.loadLedger();

                    if (W12ListerFactory) {
                        try {
                            const W12Lister = W12ListerFactory.at(this.W12ListerAddress);
                            // const {web3} = await Connector.connect();
                            // const getBlock = promisify(web3.eth.getBlock.bind(web3.eth));
                            // const latestBlock = await getBlock('latest');

                            const all = W12Lister.events.OwnerWhitelisted(null, {
                                fromBlock: 0
                            });

                            const latests = W12Lister.events.OwnerWhitelisted(null, {
                                fromBlock: 'latest'
                            });

                            latests.watch(this.onOwnerWhitelistedEvent);

                            this.EventHelpers = {
                                all,
                                fromLatestBlock: latests
                            };
                        } catch (e) {
                            this.setErrorMessage(e.message);
                        }
                    }
                }
            },
            destroyEventsHelpers() {
                if (this.EventHelpers) {
                    this.EventHelpers.all.stopWatching();
                    this.EventHelpers.fromLatestBlock.stopWatching();
                    delete this.EventHelpers;
                }
            },

            async onW12ListerAddressChange(value) {
                this.setErrorMessage('');
                this.destroyEventsHelpers();
                await this.createEventsHelpers();
                await this.fetchTokensList();
            },
            async onTokenAddressChange(value) {
                if (value) {
                    await this.checkToken();
                    await this.predefineTokenInformation();
                }
            },
            async onTokenListChange() {
                await this.checkToken();
            },
            endTokenWhiteListOperation() {
                Object.assign(this.whiteListForm, {
                    tokenAddress: '',
                    ownerAddress: '',
                    name: '',
                    symbol: '',
                    decimals: '18'
                });
            }
        },
        errorCaptured(error, vm, info) {
            this.errorMessage = info || error.message;
        },
        async created() {
            await this.createEventsHelpers();
            await this.fetchTokensList();
        },
        beforeDestroy() {
            this.destroyEventsHelpers();
        }
    };
</script>
<style lang="scss">
    .AdminDashboard {
        &__tokens-table {
            margin-top: 24px;
            overflow: auto;
        }
    }
</style>
