<template>
    <div class="WhiteListForm buefy">
        <h2>{{ $t('AdminDashboardWhiteListForm') }}</h2>

        <b-notification v-if="isLoading" :closable="false" class="WhiteListForm__loader">
            <span v-if="whitelistingToken">{{ $t('AdminDashboardListingToken') }}</span>
            <span v-if="checkingToken">{{ $t('AdminDashboardCheckingToken') }}</span>

            <b-loading :is-full-page="false" :active.sync="isLoading" :can-cancel="true"></b-loading>
        </b-notification>

        <div v-if="!isLoading" class="WhiteListForm__form">
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
                        type="text"
                        class="form-control"
                        id="Symbol"
                        v-model="whiteListForm.symbol"
                >
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

            <b-notification :closable="false" v-if="disableWhiteListButton">
                {{ $t('AdminDashboardWarning') }}
            </b-notification>
            <button class="btn btn-primary py-2 my-2" @click="tryWhiteListToken" :disabled="disableWhiteListButton">{{
                $t('AdminDashboardWhitelist') }}
            </button>
        </div>
    </div>
</template>

<script>
    import './default.scss';
    import Connector from 'lib/Blockchain/DefaultConnector.js';
    import {promisify} from 'lib/utils.js';
    import MaskedInput from 'vue-text-mask'

    import {createNamespacedHelpers} from "vuex";

    const LedgerNS = createNamespacedHelpers("Ledger");
    const WhitelistNS = createNamespacedHelpers("Whitelist");
    const ConfigNS = createNamespacedHelpers('Config');

    export default {
        name: 'WhiteListForm',
        template: '#WhiteListFormTemplate',
        components: {
            MaskedInput
        },
        data() {
            return {
                meta: {
                    loading: false,
                },
                whiteListForm: {
                    tokenAddress: '',
                    ownerAddress: '',
                    symbol: 'TN',
                    decimals: '18',
                    name: 'Token Name',
                    feePercent: '10',
                    feeETHPercent: '10'
                },

                whitelistingToken: false,
                checkingToken: false,
                isTokenExists: false,
                errorMessage: '',


            };
        },
        computed: {
            ...WhitelistNS.mapState({
                tokensList: "list"
            }),
            ...ConfigNS.mapState({
                W12Lister: "W12Lister"
            }),

            disableWhiteListButton() {
                return (
                    !this.whiteListForm.tokenAddress
                    || !this.whiteListForm.ownerAddress
                    || !this.whiteListForm.symbol
                    || !this.whiteListForm.decimals
                    || !this.whiteListForm.name
                    || !this.whiteListForm.feePercent
                    || !this.whiteListForm.feeETHPercent
                    || !this.tokenExistsAndAllowedToWhiteList
                );
            },
            tokenExistsAndAllowedToWhiteList() {
                const foundInList = this.tokensList.find(token => token.tokenAddress === this.whiteListForm.tokenAddress);
                const isTheSameOwner = foundInList ? foundInList.tokenOwner === this.whiteListForm.ownerAddress : false;
                const isWhiteListed = !!foundInList;

                return (
                    this.isTokenExists
                    && (!isWhiteListed || !isTheSameOwner)
                )
            },
            isLoading() {
                return this.whitelistingToken || this.checkingToken;
            },
        },
        watch: {
            'whiteListForm.symbol': {
                handler: 'onSymbolChange'
            },
            'whiteListForm.tokenAddress': {
                handler: 'onTokenAddressChange'
            },
            tokensList: {
                handler: 'onTokenListChange'
            }
        },
        methods: {
            ...LedgerNS.mapActions({
                ledgerFetch: "fetch"
            }),
            ...WhitelistNS.mapActions({
                whitelistFetch: "fetch",
            }),
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
                    this.whitelistFetch();
                } else {
                    this.setErrorMessage(errors.message);
                }
            },
            async whiteListToken(data) {
                this.whitelistingToken = true;

                const {W12ListerFactory} = await this.ledgerFetch();

                if (W12ListerFactory) {
                    try {
                        const W12Lister = W12ListerFactory.at(this.W12Lister.address);
                        const connectedWeb3 = (await Connector.connect()).web3;

                        console.log(data.ownerAddress,
                            data.tokenAddress,
                            data.name,
                            data.symbol,
                            data.decimals,
                            data.feePercent,
                            data.feeETHPercent);

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
            async checkToken() {
                const address = this.whiteListForm.tokenAddress;

                if (address) {
                    this.checkingToken = true;

                    const {DetailedERC20Factory} = await this.ledgerFetch();
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
                    const {DetailedERC20Factory} = await this.ledgerFetch();
                    const DetailedERC20 = DetailedERC20Factory.at(address);
                    const tokenInformation = await DetailedERC20.getDescription();
                    const {name, symbol, decimals} = tokenInformation;

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
                    const {W12ListerFactory} = await this.ledgerFetch();

                    if (W12ListerFactory) {
                        try {
                            const W12Lister = W12ListerFactory.at(this.W12Lister.address);
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
            onSymbolChange(){
              console.log("test");
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
        async created() {
            this.meta.loading = true;

            await this.createEventsHelpers();

            this.meta.loading = false;
        },
        errorCaptured(error, vm, info) {
            this.errorMessage = info || error.message;
        },
        beforeDestroy() {
            this.destroyEventsHelpers();
        }
    };
</script>
