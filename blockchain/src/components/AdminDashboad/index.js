import Ledger from '../../lib/Blockchain/ContractsLedger.js';
import config from '../../config.js';
import {
    UNKNOWN_ERROR_WHILE_FETCH_TOKENS_LIST,
    UNKNOWN_ERROR_WHILE_WHITELISTING_TOKEN
} from '../../errors.js';
import { promisify, waitTransactionReceipt } from '../../lib/utils.js';
import Connector from '../../lib/Blockchain/DefaultConnector.js';


export default {
    name: 'AdminDashboard',
    template: '#AdminDashboardTemplate',
    data () {
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
        isLoading () {
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
        async tryWhiteListToken () {
            this.clearErrorMessage();

            if (this.isLoading) return;

            await this.whiteListToken(this.whiteListForm);
        },
        clearErrorMessage () {
            this.errorMessage = '';
        },
        setErrorMessage (message) {
            this.errorMessage = message;
        },
        onOwnerWhitelistedEvent (errors, result) {
            if (!errors) {
                this.fetchTokensList();
            } else {
                this.setErrorMessage(errors.message);
            }
        },
        async whiteListToken (data) {
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
        async loadLedger () {
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
        async fetchTokensList () {
            this.fetchTokens = true;

            const {W12ListerFactory} = await this.loadLedger();

            if (W12ListerFactory) {
                try {
                    const W12Lister = W12ListerFactory.at(config.contracts.W12Lister.address);
                    const list = await W12Lister.fetchAllTokensComposedInformation();

                    this.tokensList = list.map(({ token }) => token);
                } catch (e) {
                    this.setErrorMessage(e.message || UNKNOWN_ERROR_WHILE_FETCH_TOKENS_LIST);
                }
            }

            this.fetchTokens = false;
        },
        async createEventsHelpers () {
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
        destroyEventsHelpers () {
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
    async created () {
        await this.createEventsHelpers();
        await this.fetchTokensList();
    },
    beforeDestroy () {
        this.destroyEventsHelpers();
    }
};
