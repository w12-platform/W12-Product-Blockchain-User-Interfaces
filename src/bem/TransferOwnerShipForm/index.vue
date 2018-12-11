<template>
    <div class="TransferOwnerShipForm" v-if="isPrimary">
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
                    :label="$t('TokensOwnerShipAddress')"
                    label-for="tokenOwnerShipAddress"
                    :type="typeAddress"
                    :message="messageAddress">
                <input
                        :placeholder="$t('TokensOwnerShipAddressPlaceholder')"
                        type="text"
                        class="form-control"
                        id="tokenOwnerShipAddress"
                        v-model="form.address"/>
            </b-field>

            <button class="btn btn-primary py-2 my-2" :disabled="disable" @click="transferPrimary()" v-html="$t('AdminDashboardTableTransfer')"></button>

            <b-loading :is-full-page="false" :active="meta.loading"></b-loading>
        </div>
    </div>
    <div v-else>
        {{ $t('TokensNotIsPrimary') }}
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
        name: 'TransferOwnerShipForm',
        template: '#TransferOwnerShipFormTemplate',
        props: {
            tokenAddress: {
                type: String,
                required: true,
            },
        },
        data() {
            return {
                meta: {
                    loading: true,
                },
                form: {
                    address: null,
                },
                isPrimary: false,
            };
        },
        watch: {
            'currentAccount': {
                handler: 'handleCurrentAccountChange',
                immediate: true
            },
        },
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
                return this.isTransactionFail({ name: 'admin' });
            },
            isPendingTx() {
                return this.isTransactionPending({ name: 'admin' });
            },
            transaction(){
                return this.getTransaction({ name: 'admin' });
            },

            isValidAddress() {
                return web3.isAddress(this.form.address) || this.meta.loading;
            },
            disable(){
                return !this.isValidAddress;
            },
            typeAddress () {
                return this.isValidAddress ? "" : "is-danger";
            },
            messageAddress() {
                return this.isValidAddress || !this.form.address ? "" : this.$t('InvalidAddress');
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

            async handleCurrentAccountChange(currentAccount) {
                this.update();
            },

            async transferPrimary() {
                this.meta.loading = true;
                try {
                    const {W12TokenFactory} = await this.ledgerFetch(this.Default.version);
                    const W12Token = W12TokenFactory.at(this.tokenAddress);
                    const connectedWeb3 = (await Connector.connect()).web3;

                    const tx = await W12Token.methods.transferPrimary(this.form.address);

                    this.$store.commit(`Transactions/${UPDATE_TX}`, {
                        name: "transferPrimary",
                        hash: tx,
                        status: "pending"
                    });

                    await waitTransactionReceipt(tx, connectedWeb3);

                    this.update();
                } catch (e) {
                    console.error(e);
                    this.error = errorMessageSubstitution(e);
                }
                this.meta.loading = false;
            },

            async update(){
                this.meta.loading = true;
                const {W12TokenFactory} = await this.ledgerFetch(this.Default.version);
                const W12Token = W12TokenFactory.at(this.tokenAddress);
                this.isPrimary = (await W12Token.methods.primary()) === this.currentAccount;
                this.meta.loading = false;
            }
        },
        async created() {
            this.update();
        }
    };
</script>
