import Ledger from '../../lib/Blockchain/ContractsLedger.js';
import config from '../../config.js';
import {
    UNKNOWN_ERROR_WHILE_FETCH_TOKENS_LIST,
    UNKNOWN_ERROR_WHILE_WHITELISTING_TOKEN
} from '../../errors.js';
import { promisify } from '../../lib/utils.js';
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
                symbol: 'TT',
                decimals: '18',
                name: 'TestToken'
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
                decimals: item.decimals
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

            const {W12Lister} = await this.loadLedger();

            if (W12Lister) {
                try {
                    const deployed = W12Lister.instance.at(config.contracts.W12Lister.address);
                    const whitelistToken = promisify(deployed.whitelistToken.bind(deployed));

                    console.log(data);

                    await whitelistToken(
                        data.ownerAddress,
                        data.tokenAddress,
                        data.name,
                        data.symbol,
                        data.decimals,
                        config.feePercent
                    );
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

            const {W12Lister} = await this.loadLedger();

            if (W12Lister) {
                try {
                    const deployed = W12Lister.instance.at(config.contracts.W12Lister.address);
                    const approvedTokensIndex = promisify(deployed.approvedTokensIndex.bind(deployed));
                    const approvedTokens = promisify(deployed.approvedTokens.bind(deployed));
                    const getRecords = promisify(this.EventHelpers.all.get.bind(this.EventHelpers.all));

                    const records = await getRecords();
                    const list = [];

                    for (let idx in records) {
                        const record = records[idx];
                        const {
                            name,
                            symbol,
                            tokenAddress,
                            tokenOwner
                        } = record.args;

                        const tokenIndex = (await approvedTokensIndex(tokenAddress)).toNumber();
                        const listedToken = await approvedTokens(tokenIndex);
                        const decimals = listedToken[2].toString();
                        const feePercent = listedToken[3].toString();

                        list.push({
                            index: tokenIndex,
                            name,
                            symbol,
                            tokenAddress,
                            tokenOwner,
                            decimals,
                            feePercent,
                            listedToken
                        });
                    }

                    this.tokensList = list;
                } catch (e) {
                    this.setErrorMessage(e.message || UNKNOWN_ERROR_WHILE_FETCH_TOKENS_LIST);
                }
            }

            this.fetchTokens = false;
        },
        async createEventsHelpers () {
            if (!this.EventHelpers) {
                const {W12Lister} = await this.loadLedger();

                if (W12Lister) {
                    try {
                        const deployed = W12Lister.instance.at(config.contracts.W12Lister.address);
                        // const {web3} = await Connector.connect();
                        // const getBlock = promisify(web3.eth.getBlock.bind(web3.eth));
                        // const latestBlock = await getBlock('latest');

                        const all = deployed.OwnerWhitelisted(null, {
                            fromBlock: 0
                        });

                        const latests = deployed.OwnerWhitelisted(null, {
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
