<template>
    <div class="MintForm" v-if="isAdmin">
        <div class="pm-2" v-if="isPendingTx">
            <p class="py-2"><span v-html="$t('WaitingConfirm')"></span>:</p>
            <b-tag class="py-2">{{transaction.hash}}</b-tag>
        </div>
        <div class="pm-2" v-if="isErrorTx">
            <p class="py-2"><span v-html="$t('TransactionFailed')"></span>:</p>
            <b-tag class="py-2">{{transaction.hash}}</b-tag>
            <div class="pt-2 text-left">
                <button class="btn btn-primary btn-sm" @click="TransactionsRetry(isErrorTx)" v-html="$t('ToRetry')"></button>
            </div>
        </div>
        <div v-if="!isPendingTx && !isErrorTx">
            <b-field
                    :label="$t('TokensMintAddress')"
                    label-for="tokenMintAddress"
                    :type="typeAddress"
                    :message="messageAddress">
                <input
                        :placeholder="$t('TokensMintAddressPlaceholder')"
                        type="text"
                        class="form-control"
                        id="tokenMintAddress"
                        v-model="form.address"/>
            </b-field>

            <b-field
                    :label="$t('TokensMintAmount')"
                    label-for="tokenMintAmount"
                    :type="typeAmount">
                <cleave
                        :placeholder="$t('TokensMintAddressPlaceholder')"
                        type="text"
                        class="form-control"
                        id="tokenMintAmount"
                        min="1"
                        :options="optionsNumber"
                        v-model="form.amount"
                ></cleave>
            </b-field>

            <button class="btn btn-primary py-2 my-2" :disabled="disable" @click="mint()" v-html="$t('AdminDashboardTableMint')"></button>

            <b-loading :is-full-page="false" :active.sync="meta.loading"></b-loading>
        </div>
    </div>
    <div v-else>
        {{ $t('TokensNotIsAdmin') }}
    </div>
</template>

<script>
    import './default.scss';
    import {createNamespacedHelpers} from "vuex";
    import {UPDATE_TX} from "store/modules/Transactions.js";
    import {waitTransactionReceipt, errorMessageSubstitution, web3, BigNumber} from 'lib/utils.js';
    import Connector from 'lib/Blockchain/DefaultConnector.js';

    BigNumber.config({
        DECIMAL_PLACES: 36,
        FORMAT: {
            decimalSeparator: '.',
            groupSeparator: '',
            groupSize: 3,
            secondaryGroupSize: 0,
            fractionGroupSeparator: ' ',
            fractionGroupSize: 0
        }
    });

    const LedgerNS = createNamespacedHelpers("Ledger");
    const AccountNS = createNamespacedHelpers("Account");
    const ConfigNS = createNamespacedHelpers('Config');
    const TransactionsNS = createNamespacedHelpers("Transactions");

    export default {
        name: 'MintForm',
        template: '#MintFormTemplate',
        props: {
            tokenAddress: {
                type: String,
                required: true,
            },
        },
        data() {
            return {
                meta: {
                    loading: false,
                },
                form: {
                    address: null,
                    amount: 10000,
                },
                isAdmin: true,
                tokenInfo: null,
            };
        },
        watch: {},
        computed: {
            ...AccountNS.mapState({
                currentAccount: "currentAccount",
                accountMeta: "meta",
            }),
            ...ConfigNS.mapState({
                FactoryTokens: "FactoryTokens",
                Default: "Default"
            }),
            ...TransactionsNS.mapGetters({
                isTransactionPending: "isPending",
                isTransactionFail: "isFail",
                getTransaction: "get"
            }),

            isErrorTx() {
                return this.isTransactionFail({ name: 'mintToken' });
            },
            isPendingTx() {
                return this.isTransactionPending({ name: 'mintToken' });
            },
            transaction(){
                return this.getTransaction({ name: 'mintToken' });
            },

            isValidAddress() {
                return web3.isAddress(this.form.address) || this.meta.loading;
            },
            isValidAmount() {
                return this.form.amount > 0;
            },
            disable(){
                return !(this.isValidAddress && this.isValidAmount);
            },
            typeAddress () {
                return this.isValidAddress ? "" : "is-danger";
            },
            typeAmount () {
                return this.isValidAmount ? "" : "is-danger";
            },
            messageAddress() {
                return this.isValidAddress ? "" : this.$t('InvalidAddress');
            },
            maxAmount() {
                const decimals = this.tokenInfo && this.tokenInfo.decimals ? this.tokenInfo.decimals : 0;
                return BigNumber.UINT_MAX.div(new BigNumber(10).pow(decimals)).toFormat(0);
            },
            maxAmountPrecision(){
                return this.maxAmount ? (new BigNumber(this.maxAmount)).toPrecision (2, 1) : false;
            },
            lengthMaxAmount() {
                return this.maxAmount.length;
            },
            optionsNumber() {
                return {
                    prefix: '',
                    numeral: true,
                    numeralPositiveOnly: true,
                    noImmediatePrefix: true,
                    rawValueTrimPrefix: true,
                    numeralIntegerScale: this.lengthMaxAmount,
                    numeralDecimalScale: 0,
                };
            },
        },
        methods: {
            ...LedgerNS.mapActions({
                ledgerFetch: "fetch"
            }),
            ...TransactionsNS.mapActions({
                transactionsUpStatusTx: "updateStatusTx",
                TransactionsRetry: "retry"
            }),

            async mint() {
                this.meta.loading = true;
                try {
                    const {WTokenTestHelperFactory} = await this.ledgerFetch(this.Default.version);
                    const WTokenTestHelper = WTokenTestHelperFactory.at(this.FactoryTokens.address);
                    const connectedWeb3 = (await Connector.connect()).web3;

                    const tx = await WTokenTestHelper.methods.mint(
                        this.tokenAddress, this.form.address, this.form.amount, 0);

                    this.$store.commit(`Transactions/${UPDATE_TX}`, {
                        name: "mintToken",
                        hash: tx,
                        status: "pending"
                    });

                    await waitTransactionReceipt(tx, connectedWeb3);
                } catch (e) {
                    console.error(e);
                    this.error = errorMessageSubstitution(e);
                }
                this.meta.loading = false;
            },
        },
        async created() {
            this.meta.loading = true;

            const {W12TokenFactory, ERC20DetailedFactory} = await this.ledgerFetch(this.Default.version);
            const W12Token = W12TokenFactory.at(this.tokenAddress);
            this.isAdmin = await W12Token.methods.isAdmin(this.currentAccount);
            const ERC20Detailed = ERC20DetailedFactory.at(this.tokenAddress);
            this.tokenInfo = await ERC20Detailed.getDescription();
            this.form.address = this.currentAccount;

            this.meta.loading = false;
        }
    };
</script>
