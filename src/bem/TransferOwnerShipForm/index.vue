<template>
    <div class="TransferOwnerShipForm" v-if="isAdmin">
        <div class="pm-2" v-if="isPendingTx">
            <p class="py-2"><span v-html="$t('WaitingConfirm')"></span>:</p>
            <b-tag class="py-2">{{isPendingTx.hash}}</b-tag>
        </div>
        <div class="pm-2" v-if="isErrorTx">
            <p class="py-2"><span v-html="$t('TransactionFailed')"></span>:</p>
            <b-tag class="py-2">{{isErrorTx.hash}}</b-tag>
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

            <div class="TransferOwnerShipForm__buttons">
                <button class="btn btn-primary py-2 my-2" :disabled="disableAddAdmin" @click="addAdmin()" v-html="$t('AdminDashboardTableAddAdmin')"></button>
                <button class="btn btn-primary py-2 my-2" :disabled="disableRemoveAdmin" @click="removeAdmin()" v-html="$t('AdminDashboardTableRemoveAdmin')"></button>

                <b-loading :is-full-page="false" :active.sync="meta.loadingCheckAdmin"></b-loading>
            </div>


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
    import Web3 from 'web3';
    import {UPDATE_TX, CONFIRM_TX} from "store/modules/Transactions.js";
    import {waitTransactionReceipt, errorMessageSubstitution} from 'lib/utils.js';
    import Connector from 'lib/Blockchain/DefaultConnector.js';

    const web3 = new Web3();
    const BigNumber = web3.BigNumber;
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
                    loading: false,
                    loadingCheckAdmin: false,
                },
                form: {
                    address: null,
                },
                isAdmin: true,
                isAdminFormAddress: false,
            };
        },
        watch: {
            'form.address': {
                handler: 'handleFormAddressChange',
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
            ...TransactionsNS.mapState({
                TransactionsList: "list"
            }),
            isErrorTx() {
                return this.TransactionsList && this.TransactionsList.length
                    ? this.TransactionsList.find((tr) => {
                        return tr.name
                        && tr.hash
                        && tr.status
                        && tr.name === "admin"
                        && tr.status === "error"
                            ? tr
                            : false
                    })
                    : false;
            },
            isPendingTx() {
                return this.TransactionsList && this.TransactionsList.length
                    ? this.TransactionsList.find((tr) => {
                        return tr.name
                        && tr.hash
                        && tr.status
                        && tr.name === "admin"
                        && tr.status === "pending"
                            ? tr
                            : false
                    })
                    : false;
            },

            isValidAddress() {
                return web3.isAddress(this.form.address) || this.meta.loading;
            },
            disableAddAdmin(){
                return !(this.isValidAddress && !this.isAdminFormAddress);
            },
            disableRemoveAdmin(){
                return !(this.isValidAddress && this.isAdminFormAddress);
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

            async handleFormAddressChange(address) {
                if(this.isValidAddress){
                    this.meta.loadingCheckAdmin = true;

                    const {W12TokenFactory} = await this.ledgerFetch(this.Default.version);
                    const W12Token = W12TokenFactory.at(this.tokenAddress);
                    this.isAdminFormAddress = await W12Token.methods.isAdmin(address);

                    this.meta.loadingCheckAdmin = false;
                }
            },

            async addAdmin() {
                this.meta.loading = true;
                try {
                    const {W12TokenFactory} = await this.ledgerFetch(this.Default.version);
                    const W12Token = W12TokenFactory.at(this.tokenAddress);
                    const connectedWeb3 = (await Connector.connect()).web3;

                    const tx = await W12Token.methods.addAdmin(this.form.address);

                    this.$store.commit(`Transactions/${UPDATE_TX}`, {
                        name: "admin",
                        hash: tx,
                        status: "pending"
                    });

                    await waitTransactionReceipt(tx, connectedWeb3);

                    this.$store.commit(`Transactions/${CONFIRM_TX}`, tx);
                    this.update();
                } catch (e) {
                    console.error(e);
                    this.error = errorMessageSubstitution(e);
                }
                this.meta.loading = false;
            },

            async removeAdmin() {
                this.meta.loading = true;
                try {
                    const {W12TokenFactory} = await this.ledgerFetch(this.Default.version);
                    const W12Token = W12TokenFactory.at(this.tokenAddress);
                    const connectedWeb3 = (await Connector.connect()).web3;

                    const tx = await W12Token.methods.removeAdmin(this.form.address);

                    this.$store.commit(`Transactions/${UPDATE_TX}`, {
                        name: "admin",
                        hash: tx,
                        status: "pending"
                    });

                    await waitTransactionReceipt(tx, connectedWeb3);

                    this.$store.commit(`Transactions/${CONFIRM_TX}`, tx);
                    this.update();
                } catch (e) {
                    console.error(e);
                    this.error = errorMessageSubstitution(e);
                }
                this.meta.loading = false;
            },

            async update(){
                const {W12TokenFactory} = await this.ledgerFetch(this.Default.version);
                const W12Token = W12TokenFactory.at(this.tokenAddress);
                this.isAdmin = await W12Token.methods.isAdmin(this.currentAccount);
            }
        },
        async created() {
            this.meta.loading = true;

            const {W12TokenFactory} = await this.ledgerFetch(this.Default.version);
            const W12Token = W12TokenFactory.at(this.tokenAddress);
            this.isAdmin = await W12Token.methods.isAdmin(this.currentAccount);

            this.meta.loading = false;
        }
    };
</script>
