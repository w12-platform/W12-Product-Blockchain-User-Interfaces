<template>
    <div class="ProjectDashboardReceiving buefy" v-if="!langMeta.loading">
        <section class="container">
            <h2>{{ $t('ProjectDashboard') }}</h2>

            <b-notification v-if="isError" type="is-danger" :closable="false" has-icon>
                <span v-if="ledgerMeta.loadingError">{{ $t(ledgerMeta.loadingError) }}</span>
                <span v-if="ProjectMeta.loadingError">{{ $t(ProjectMeta.loadingError) }}</span>
                <span v-if="accountMeta.loadingError">{{ $t(accountMeta.loadingError) }}</span>
            </b-notification>

            <b-notification v-if="!isError && isLoading" :closable="false">
                {{ $t('ProjectDashboardLoadExpect') }}
                <b-loading :is-full-page="false" :active="isLoading"></b-loading>
            </b-notification>

            <div v-if="!isLoading">
                <ProjectSwitch v-if="!isCurrentToken"></ProjectSwitch>

                <b-notification v-if="ProjectMeta.loadingProjectError" :closable="false">
                    {{ ProjectMeta.loadingProjectError }}
                </b-notification>

                <div class="ProjectDashboardReceiving__project">
                    <Receiving v-if="!ProjectMeta.loadingProjectError"></Receiving>

                    <b-loading :is-full-page="false" :active="ProjectMeta.loadingProject"></b-loading>
                </div>
            </div>
        </section>
        <Steps :number="10"></Steps>
    </div>
</template>

<script>
    import './default.scss';
    import ProjectSwitch from 'bem/ProjectSwitch';
    import Receiving from 'bem/Receiving';
    import {CONFIRM_TX} from "store/modules/Transactions.js";
    import Steps from "bem/Steps";

    import {createNamespacedHelpers} from 'vuex';
    import {isZeroAddress, errorMessageSubstitution} from 'lib/utils';

    const ConfigNS = createNamespacedHelpers('Config');
    const LedgerNS = createNamespacedHelpers("Ledger");
    const AccountNS = createNamespacedHelpers("Account");
    const ProjectNS = createNamespacedHelpers("Project");
    const LangNS = createNamespacedHelpers("Lang");

    export default {
        name: 'ProjectDashboardReceiving',
        components: {
            ProjectSwitch,
            Receiving,
            Steps
        },
        computed: {
            ...LedgerNS.mapState({
                ledgerMeta: 'meta',
            }),
            ...AccountNS.mapState({
                currentAccount: "currentAccount",
                accountMeta: "meta",
                currentAccountData: "currentAccountData",
            }),
            ...ProjectNS.mapState({
                currentProject: "currentProject",
                ProjectMeta: "meta",
            }),
            ...LangNS.mapState({
                langMeta: 'meta'
            }),
            ...ConfigNS.mapState({
                W12Lister: "W12Lister"
            }),

            isError() {
                return this.ledgerMeta.loadingError || this.ProjectMeta.loadingError || this.accountMeta.loadingError;
            },
            isLoading() {
                return (
                    this.accountMeta.loading
                    || this.ProjectMeta.loading
                );
            },
            isCurrentToken(){
                return typeof CurrentToken !== 'undefined';
            }
        },
        watch: {
            'currentAccount': {
                handler: 'handleCurrentAccountChange',
                immediate: true
            },
            'ProjectMeta': {
                handler: 'handleProjectMetaChange',
                deep: true,
            }
        },
        methods: {
            ...LedgerNS.mapActions({
                LedgerFetch: 'fetch',
            }),
            ...AccountNS.mapActions({
                watchCurrentAccount: 'watch',
                updateAccountData: 'updateAccountData',
            }),
            ...ProjectNS.mapActions({
                updateTokensApprovedToPlaceValue: 'updateTokensApprovedToPlaceValue',
                updatePlacedTokenStatus: 'updatePlacedTokenStatus',
                fetchProject: "fetchProject",
                ProjectFetchList: "fetchList",
                fetchCrowdSaleAddressAndInfo: "fetchCrowdSaleAddressAndInfo",
                updateTokenInfo: "updateTokenInfo",
                updateOwnerBalance: "updateOwnerBalance",
                upTokenAfterEvent: "upTokenAfterEvent",
                fetchCrowdSaleStagesList: "fetchCrowdSaleStagesList",
                fetchCrowdSaleMilestonesList: "fetchCrowdSaleMilestonesList",
                updateReceivingInformation: "updateReceivingInformation",
                updateFundInformation: "updateFundInformation",
                FetchProjectByCurrentToken: "fetchProjectByCurrentToken"
            }),
            async handleCurrentAccountChange(currentAccount) {
                if(currentAccount){
                    if(this.isCurrentToken){
                        await this.FetchProjectByCurrentToken(CurrentToken);
                    } else {
                        await this.ProjectFetchList();
                    }
                }
            },
            async handleProjectMetaChange(meta) {
                if(!meta.loadingProject) {
                    await this.updateAccountData();
                    this.unsubscribeFromEvents();
                    await this.subscribeToEvents();
                    window.dispatchEvent(new Event('resize'));
                }
            },
            unsubscribeFromEvents() {
                if (!this.subscribedEvents) return;

                if (this.subscribedEvents.ApprovalW12Event) {
                    this.subscribedEvents.ApprovalW12Event.stopWatching();
                }
                if (this.subscribedEvents.UnsoldTokenReturned) {
                    this.subscribedEvents.UnsoldTokenReturned.stopWatching();
                }
                if (this.subscribedEvents.Exchange) {
                    this.subscribedEvents.Exchange.stopWatching();
                }

                this.subscribedEvents = null;
            },
            async subscribeToEvents() {
                if (!this.currentProject) return;
                if (this.subscribedEvents) return;

                this.subscribeToEventsLoading = true;

                try {
                    const {W12CrowdsaleFactory, W12ListerFactory, W12TokenFactory, W12AtomicSwapFactory, TokenExchangerFactory} = await this.LedgerFetch(this.currentProject.version);
                    let ApprovalW12Event = null;
                    let UnsoldTokenReturned = null;
                    let Exchange = null;

                    if (!isZeroAddress(this.currentProject.tokenCrowdsaleAddress)) {
                        const W12Crowdsale = W12CrowdsaleFactory.at(this.currentProject.tokenCrowdsaleAddress);
                        UnsoldTokenReturned = W12Crowdsale.events.UnsoldTokenReturned(null, null, this.onUnsoldTokenReturnedEvent);
                        const W12Lister = W12ListerFactory.at(this.currentProject.listerAddress);
                        const swapAddress = await W12Lister.swap();
                        const W12AtomicSwap = TokenExchangerFactory ? TokenExchangerFactory.at(swapAddress):W12AtomicSwapFactory.at(swapAddress);
                        Exchange = W12AtomicSwap.events.Exchange(null, null, this.onExchangeEvent);
                    }

                    if (!isZeroAddress(this.currentProject.wTokenAddress)) {
                        const W12Token = W12TokenFactory.at(this.currentProject.wTokenAddress);
                        ApprovalW12Event = W12Token.events.Approval(null, null, this.onApprovalW12Event);
                    }

                    this.subscribedEvents = {
                        Exchange,
                        ApprovalW12Event,
                        UnsoldTokenReturned,
                    };
                } catch (e) {
                    this.error = errorMessageSubstitution(e);
                }

                this.subscribeToEventsLoading = false;
            },

            async onApprovalW12Event(error, result) {
                if (!error) {
                    await this.$store.dispatch('Cache/blockNumberUp');
                    const tx = result.transactionHash;
                    await this.updateTokensApprovedToPlaceValue({Token: this.currentProject});
                    await this.updateAccountData();
                    this.$store.commit(`Transactions/${CONFIRM_TX}`, tx);
                }
            },
            async onExchangeEvent(error, result){
                if (!error) {
                    await this.$store.dispatch('Cache/blockNumberUp');
                    await this.updateFundInformation({Token: this.currentProject});
                    await this.updateAccountData();
                    const tx = result.transactionHash;
                    this.$store.commit(`Transactions/${CONFIRM_TX}`, tx);
                }
            },
            async onTrancheReleasedEvent(error, result) {
                if (!error) {
                    await this.$store.dispatch('Cache/blockNumberUp');
                    await this.updateFundInformation({Token: this.currentProject});
                    await this.updateAccountData();
                    const tx = result.transactionHash;
                    this.$store.commit(`Transactions/${CONFIRM_TX}`, tx);
                }
            },
            async onUnsoldTokenReturnedEvent(error, result) {
                if (!error) {
                    await this.$store.dispatch('Cache/blockNumberUp');
                    await this.updateReceivingInformation({Token: this.currentProject});
                    await this.updateAccountData();
                    const tx = result.transactionHash;
                    this.$store.commit(`Transactions/${CONFIRM_TX}`, tx);
                }
            },
        },
        async created() {
            await this.watchCurrentAccount();
        },
    };
</script>
