<template>
    <div class="AdminDashboad">
        <section class=" container">
            <h2>Admin Dashboard</h2>
            <div v-if="isLoading" class="alert alert-info" role="alert">
                <span v-if="loadingLedger">Загрузка смарт-контрактов...<br></span>
                <span v-if="fetchTokens">Загрузка списка токенов...<br></span>
                <span v-if="whitelistingToken">Добавление токена в whitelist...</span>
            </div>
            <div v-if="errorMessage" class="alert alert-danger" role="alert">
                <span>{{ errorMessage }}</span>
            </div>
            <div v-if="!isLoading">
                <div class="form-group">
                    <label for="TokenAddress">Token Address</label>
                    <input
                            placeholder="Token address with checksum"
                            type="text"
                            class="form-control"
                            id="TokenAddress"
                            v-model="whiteListForm.tokenAddress">
                </div>
                <div class="form-group">
                    <label for="OwnerAddress">Owner Address</label>
                    <input
                            placeholder="Token owner address"
                            type="text"
                            class="form-control"
                            id="OwnerAddress"
                            v-model="whiteListForm.ownerAddress">
                </div>
                <div class="form-group">
                    <label for="Symbol">Symbol</label>
                    <input
                            placeholder="3-4 letter abbreviation"
                            minlength="1"
                            maxlength="4"
                            type="text"
                            class="form-control"
                            id="Symbol"
                            v-model="whiteListForm.symbol">
                </div>
                <div class="form-group">
                    <label for="Decimals">Decimals</label>
                    <input
                            placeholder="Default: 18"
                            type="number"
                            minlength="1"
                            maxlength="2"
                            class="form-control"
                            id="Decimals"
                            v-model="whiteListForm.decimals">
                </div>
                <div class="form-group">
                    <label for="Name">Name</label>
                    <input
                            placeholder="Descriptive name of the token"
                            type="text"
                            class="form-control"
                            id="Name"
                            v-model="whiteListForm.name">
                </div>
                <div class="form-group">
                    <label for="FeeTokens">Fee (tokens)</label>
                    <input
                            placeholder="0 .. 100 percent"
                            type="text"
                            minlength="1"
                            maxlength="3"
                            class="form-control"
                            id="FeeTokens"
                            v-model="whiteListForm.feePercent">
                </div>
                <div class="form-group">
                    <label for="FeeETH">Fee (ETH)</label>
                    <input
                            placeholder="0 .. 100 percent"
                            type="text"
                            minlength="1"
                            maxlength="3"
                            class="form-control"
                            id="FeeETH"
                            v-model="whiteListForm.feeETHPercent">
                </div>
                <div>
                    <button class="btn btn-primary" @click="tryWhiteListToken">Whitelist</button>
                </div>
                <div class="AdminDashboard__tokens-table" v-if="tokensListTableData.length">
                    <table class="table table-striped table-bordered table-hover">
                        <thead class="thead-dark">
                        <tr>
                            <th scope="col">Token</th>
                            <th scope="col">Owner</th>
                            <th scope="col">Symbol</th>
                            <th scope="col">Name</th>
                            <th scope="col">Decimals</th>
                            <th scope="col">Fee (tokens)</th>
                            <th scope="col">Fee (ETH)</th>
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
    import './default.scss';

    import Ledger from '../../lib/Blockchain/ContractsLedger.js';
    import config from '../../config.js';
    import {
        UNKNOWN_ERROR_WHILE_FETCH_TOKENS_LIST,
        UNKNOWN_ERROR_WHILE_WHITELISTING_TOKEN
    } from '../../errors.js';
    import {promisify, waitTransactionReceipt} from '../../lib/utils.js';
    import Connector from '../../lib/Blockchain/DefaultConnector.js';

    export default {
        name: 'AdminDashboard',
        template: '#AdminDashboardTemplate',
        data() {
            return {
                loadingLedger: false,
                fetchTokens: false,
                whitelistingToken: false,
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
            isLoading() {
                return (
                    this.loadingLedger
                    || this.fetchTokens
                    || this.whitelistingToken
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
                        const W12Lister = W12ListerFactory.at(config.contracts.W12Lister.address);
                        const connectedWeb3 = (await Connector.connect()).web3;

                        console.log(data);

                        const tx = await W12Lister.methods.whitelistToken(
                            data.ownerAddress,
                            data.tokenAddress,
                            data.name,
                            data.symbol,
                            data.decimals,
                            data.feePercent,
                            data.feeETHPercent
                        );

                        waitTransactionReceipt(tx, connectedWeb3, 5000);
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
                        const W12Lister = W12ListerFactory.at(config.contracts.W12Lister.address);
                        const list = await W12Lister.fetchAllTokensComposedInformation();

                        this.tokensList = list.map(({token}) => token);
                    } catch (e) {
                        this.setErrorMessage(e.message || UNKNOWN_ERROR_WHILE_FETCH_TOKENS_LIST);
                    }
                }

                this.fetchTokens = false;
            },
            async createEventsHelpers() {
                if (!this.EventHelpers) {
                    const {W12ListerFactory} = await this.loadLedger();

                    if (W12ListerFactory) {
                        try {
                            const W12Lister = W12ListerFactory.at(config.contracts.W12Lister.address);
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