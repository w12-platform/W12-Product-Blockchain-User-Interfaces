<template>
    <div :class="metaMaskClass">
        <div class="MetaMask__icon"></div>
        <div class="MetaMask__info" v-if="!accountMeta.loading">
            <div class="MetaMask__balance" v-if="ethBalance && !accountMeta.loadingErrorLabel">{{ ethBalanceFixes }} ETH</div>
            <div class="MetaMask__status" v-if="networkId && !accountMeta.loadingErrorLabel">{{ getNameNet }}</div>

            <div class="MetaMask__notInstalled" v-if="accountMeta.loadingErrorLabel === 'notInstall'">
                <a target="_blank" href="https://metamask.io/">{{ $t('ErrorMetamaskNotInstalled') }}</a>
            </div>
            <div class="MetaMask__isBlocked" v-if="accountMeta.loadingErrorLabel === 'isBlocked'">
                {{ $t('ErrorMetamaskIsBlocked') }}
            </div>
        </div>
        <div class="MetaMask__preloader" v-if="accountMeta.loading">
            <b-loading :is-full-page="false" :active="true"></b-loading>
        </div>
    </div>
</template>

<script>
    import './default.scss';
    import {createNamespacedHelpers} from "vuex";
    import {web3, BigNumber} from '@/lib/utils';

    const AccountNS = createNamespacedHelpers("Account");

    export default {
        name: 'MetaMask',
        template: '#MetaMaskTemplate',
        props: {
            mobile: {
                type: Boolean,
                default: false
            }
        },
        computed: {
            ...AccountNS.mapState({
                currentAccount: "currentAccount",
                accountMeta: "meta",
                ethBalance: "ethBalance",
                networkId: "networkId"
            }),

            metaMaskClass(){
                return {
                    'MetaMask': true,
                    'buefy': true,
                    'mobile': this.mobile,
                };
            },

            ethBalanceFixes() {
                if(this.ethBalance.length > 6) {
                    return new BigNumber(this.ethBalance).toFixed(4);
                } else {
                    return this.ethBalance;
                }
            },
            getNameNet() {
                switch (this.networkId) {
                    case "1":
                        return this.$t('Network1');
                    case "4":
                        return this.$t('Network4');
                    default:
                        return "";
                }
            }
        },
        methods: {
            ...AccountNS.mapActions({
                watchCurrentAccount: 'watch',
                updateAccountData: 'updateAccountData',
            }),
        },
        async created(){
            await this.watchCurrentAccount();
        }
    };
</script>