<template>
    <div class="ProjectStages ProjectStages_v2" v-if="currentProject && currentAccount">
        <StageWhiteList></StageWhiteList>
        <StageApprove></StageApprove>
        <StagePlace></StagePlace>
        <StageConfigureCrowdsale></StageConfigureCrowdsale>
        <StageBonuses></StageBonuses>
    </div>
</template>

<script>
    import './default.scss';

    import StageWhiteList from 'bem/ProjectStages/StageWhiteList';
    import StageApprove from 'bem/ProjectStages/StageApprove';
    import StagePlace from 'bem/ProjectStages/StagePlace';
    import StageConfigureCrowdsale from 'bem/ProjectStages/StageConfigureCrowdsale';
    import StageBonuses from 'bem/ProjectStages/StageBonuses';

    import {createNamespacedHelpers} from "vuex";
    import {CONFIRM_TX} from "store/modules/Transactions.js";
    import {isZeroAddress, errorMessageSubstitution} from 'lib/utils';

    const ConfigNS = createNamespacedHelpers('Config');
    const ProjectNS = createNamespacedHelpers("Project");
    const LedgerNS = createNamespacedHelpers("Ledger");
    const AccountNS = createNamespacedHelpers("Account");

    export default {
        name: 'ProjectStages',
        template: '#ProjectStagesTemplate',
        components: {
            StageWhiteList,
            StageApprove,
            StagePlace,
            StageConfigureCrowdsale,
            StageBonuses
        },
        watch: {
            'ProjectMeta.loadingProject': {
                handler: 'handleProjectChange',
                immediate: true
            },
        },
        data() {
            return {
                subscribeToEventsLoading: false,
                isSubscribedToEvent: false,
                error: false,
            };
        },
        computed: {
            ...ProjectNS.mapState({
                currentProject: "currentProject",
                ProjectMeta: "meta",
            }),
            ...AccountNS.mapState({
                currentAccount: "currentAccount",
                accountMeta: "meta",
            }),
            ...ConfigNS.mapState({
                W12Lister: "W12Lister"
            })
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
                fetchCrowdSaleAddressAndInfo: "fetchCrowdSaleAddressAndInfo",
                updateTokenInfo: "updateTokenInfo",
                updateOwnerBalance: "updateOwnerBalance",
                upTokenAfterEvent: "upTokenAfterEvent",
                fetchCrowdSaleStagesList: "fetchCrowdSaleStagesList",
                fetchCrowdSaleMilestonesList: "fetchCrowdSaleMilestonesList",
                updateReceivingInformation: "updateReceivingInformation",
                updateFundInformation: "updateFundInformation",
                updateProject: "updateProject"
            }),

            async handleProjectChange(loadingStatus) {
                if (loadingStatus === false) {
                    await this.updateAccountData();
                    this.unsubscribeFromEvents();
                    await this.subscribeToEvents();
                }
            },
            unsubscribeFromEvents() {
                if (!this.isSubscribedToEvent) return;
                if (!this.subscribedEvents) return;

                this.subscribedEvents.CrowdsaleInitialized.stopWatching();
                this.subscribedEvents.ApprovalEvent.stopWatching();
                if (this.subscribedEvents.ApprovalW12Event) {
                    this.subscribedEvents.ApprovalW12Event.stopWatching();
                }
                if(this.subscribedEvents.StagesUpdated){
                    this.subscribedEvents.StagesUpdated.stopWatching();
                }
                if(this.subscribedEvents.MilestonesUpdated){
                    this.subscribedEvents.MilestonesUpdated.stopWatching();
                }
                if(this.subscribedEvents.UnsoldTokenReturned){
                    this.subscribedEvents.UnsoldTokenReturned.stopWatching();
                }
                if(this.subscribedEvents.CrowdsaleTokenMinted){
                    this.subscribedEvents.CrowdsaleTokenMinted.stopWatching();
                }
                if(this.subscribedEvents.TrancheReleased){
                    this.subscribedEvents.TrancheReleased.stopWatching();
                }

                this.subscribedEvents.TokenPlaced.stopWatching();
                this.isSubscribedToEvent = false;
                this.subscribedEvents = null;
            },
            async subscribeToEvents() {
                if (!this.currentProject) return;
                if (this.subscribedEvents) return;
                if (this.isSubscribedToEvent) return;

                this.subscribeToEventsLoading = true;

                try {
                    const {ERC20Factory, W12ListerFactory, W12CrowdsaleFactory, W12TokenFactory, W12FundFactory} = await this.LedgerFetch(this.currentProject.version);
                    const ERC20 = ERC20Factory.at(this.currentProject.tokenAddress);
                    const W12Lister = W12ListerFactory.at(this.currentProject.listerAddress);
                    let ApprovalW12Event = null;
                    let StageUpdated = null;
                    let StagesUpdated = null;
                    let MilestonesUpdated = null;
                    let UnsoldTokenReturned = null;
                    let TrancheReleased = null;

                    if (!isZeroAddress(this.currentProject.tokenCrowdsaleAddress)) {
                        const W12Crowdsale = W12CrowdsaleFactory.at(this.currentProject.tokenCrowdsaleAddress);
                        const fundAddress = await W12Crowdsale.methods.fund();
                        const W12Fund = W12FundFactory.at(fundAddress);
                        StagesUpdated = W12Crowdsale.events.StagesUpdated(null, null, this.onStagesUpdatedEvent);
                        StageUpdated = W12Crowdsale.events.StageUpdated(null, null, this.onStageUpdatedEvent);
                        MilestonesUpdated = W12Crowdsale.events.MilestonesUpdated(null, null, this.onMilestonesUpdatedEvent);
                        UnsoldTokenReturned = W12Crowdsale.events.UnsoldTokenReturned(null, null, this.onUnsoldTokenReturnedEvent);
                        TrancheReleased = W12Fund.events.TrancheReleased(null, null, this.onTrancheReleasedEvent);
                    }

                    if (!isZeroAddress(this.currentProject.wTokenAddress)) {
                        const W12Token = W12TokenFactory.at(this.currentProject.wTokenAddress);
                        ApprovalW12Event = W12Token.events.Approval(null, null, this.onApprovalW12Event);
                    }

                    const ApprovalEvent = ERC20.events.Approval(null, null, this.onApprovalEvent);
                    const TokenPlaced = W12Lister.events.TokenPlaced(null, null, this.onTokenPlacedEvent);
                    const CrowdsaleInitialized = W12Lister.events.CrowdsaleInitialized(null, null, this.onCrowdsaleInitializedEvent);
                    const CrowdsaleTokenMinted = W12Lister.events.CrowdsaleTokenMinted(null, null, this.onCrowdsaleTokenMintedEvent);

                    this.subscribedEvents = {
                        ApprovalEvent,
                        ApprovalW12Event,
                        TokenPlaced,
                        CrowdsaleInitialized,
                        StagesUpdated,
                        StageUpdated,
                        MilestonesUpdated,
                        UnsoldTokenReturned,
                        CrowdsaleTokenMinted,
                        TrancheReleased
                    };
                } catch (e) {
                    this.error = errorMessageSubstitution(e);
                }

                this.isSubscribedToEvent = true;
                this.subscribeToEventsLoading = false;
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
            async onStageUpdatedEvent(error, result) {
                if (!error) {
                    await this.$store.dispatch('Cache/blockNumberUp');
                    await this.fetchCrowdSaleStagesList({Token: this.currentProject});
                    const tx = result.transactionHash;
                    this.$store.commit(`Transactions/${CONFIRM_TX}`, tx);
                }
            },
            async onMilestonesUpdatedEvent(error, result) {
                if (!error) {
                    await this.fetchCrowdSaleMilestonesList({Token: this.currentProject});
                    const tx = result.transactionHash;
                    this.$store.commit(`Transactions/${CONFIRM_TX}`, tx);
                }
            },
            async onStagesUpdatedEvent(error, result) {
                if (!error) {
                    await this.$store.dispatch('Cache/blockNumberUp');
                    await this.fetchCrowdSaleStagesList({Token: this.currentProject});
                    const tx = result.transactionHash;
                    this.$store.commit(`Transactions/${CONFIRM_TX}`, tx);
                }
            },
            async onApprovalEvent(error, result) {
                if (!error) {
                    await this.$store.dispatch('Cache/blockNumberUp');
                    const tx = result.transactionHash;
                    await this.updateTokensApprovedToPlaceValue({Token: this.currentProject});
                    await this.updateAccountData();
                    this.$store.commit(`Transactions/${CONFIRM_TX}`, tx);
                }
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
            async onTokenPlacedEvent(error, result) {
                if (!error) {
                    await this.$store.dispatch('Cache/blockNumberUp');
                    const {originalTokenAddress} = result.args;

                    const tx = result.transactionHash;
                    if (originalTokenAddress.toString() === this.currentProject.tokenAddress) {
                        await this.upTokenAfterEvent({Token: this.currentProject});
                    }
                    this.$store.commit(`Transactions/${CONFIRM_TX}`, tx);
                }
            },
            async onCrowdsaleInitializedEvent(error, result) {
                if (!error) {
                    await this.$store.dispatch('Cache/blockNumberUp');
                    const {tokenAddress} = result.args;

                    const tx = result.transactionHash;
                    if (tokenAddress.toString() === this.currentProject.tokenAddress) {
                        await this.upTokenAfterEvent({Token: this.currentProject});
                    }
                    this.$store.commit(`Transactions/${CONFIRM_TX}`, tx);
                }
            },
            async onCrowdsaleTokenMintedEvent(error, result) {
                if (!error) {
                    await this.$store.dispatch('Cache/blockNumberUp');
                    const {tokenAddress} = result.args;

                    const tx = result.transactionHash;
                    if (tokenAddress.toString() === this.currentProject.tokenAddress) {
                        await this.updateProject(this.currentProject);
                    }

                    this.$store.commit(`Transactions/${CONFIRM_TX}`, tx);
                }
            },
        },
    };
</script>
