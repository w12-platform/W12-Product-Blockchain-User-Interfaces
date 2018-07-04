import Ledger from '../../lib/Blockchain/ContractsLedger.js';
import config from '../../config.js';
import {
    UNKNOWN_ERROR_WHILE_FETCH_TOKENS_LIST
} from '../../errors.js';


export default {
    name: 'InvestorDashboard',
    template: '#InvestorDashboardTemplate',
    data () {
        return {
            fetchTokens: false,
            errorMessage: '',
            loadingLedger: false,
            tokensList: []
        };
    },
    computed: {
        isLoading () {
            return (
                this.loadingLedger
                    || this.whitelistingToken
            );
        }
    },
    methods: {
        clearErrorMessage () {
            this.errorMessage = '';
        },
        setErrorMessage (message) {
            this.errorMessage = message;
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
    },
    errorCaptured(error, vm, info) {
      this.errorMessage = info || error.message;
    },
    async created () {
        await this.fetchTokensList();
    }
};
