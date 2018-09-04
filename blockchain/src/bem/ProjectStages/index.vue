<template>
    <div class="ProjectStages" v-if="currentProject && currentAccount">
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
    import { CONFIRM_TX } from "store/modules/Transactions.js";

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
            'currentProject.tokenAddress': {
                handler: 'handleProjectChange'
            },
        },
        data() {
            return {
                subscribeToEventsLoading: false,
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
            }),

            async handleProjectChange() {
                await this.updateAccountData();
                this.unsubscribeFromEvents();
                await this.subscribeToEvents();
            },
            unsubscribeFromEvents() {
                if (!this.subscribedEvents) return;

                this.subscribedEvents.CrowdsaleInitialized.stopWatching();
                this.subscribedEvents.ApprovalEvent.stopWatching();
                this.subscribedEvents.ApprovalW12Event.stopWatching();
                this.subscribedEvents.TokenPlaced.stopWatching();
                this.subscribedEvents.StagesUpdated.stopWatching();
                this.subscribedEvents.MilestonesUpdated.stopWatching();
                this.subscribedEvents.UnsoldTokenReturned.stopWatching();
                this.subscribedEvents.CrowdsaleTokenMinted.stopWatching();
                this.subscribedEvents.TrancheReleased.stopWatching();

                this.subscribedEvents = null;
            },
            async subscribeToEvents() {
                if (!this.currentProject) return;
                if (this.subscribedEvents) return;

                this.subscribeToEventsLoading = true;

                try {
                    const {ERC20Factory, W12ListerFactory, W12CrowdsaleFactory, W12TokenFactory, W12FundFactory} = await this.LedgerFetch();
                    const ERC20 = ERC20Factory.at(this.currentProject.tokenAddress);
                    const W12Token = W12TokenFactory.at(this.currentProject.wTokenAddress);
                    const W12Lister = W12ListerFactory.at(this.W12Lister.address);
                    const W12Crowdsale = W12CrowdsaleFactory.at(this.currentProject.crowdsaleAddress);
                    const fundAddress = await W12Crowdsale.methods.fund();
                    const W12Fund = W12FundFactory.at(fundAddress);

                    const ApprovalEvent = ERC20.events.Approval(null, null, this.onApprovalEvent);
                    const ApprovalW12Event = W12Token.events.Approval(null, null, this.onApprovalW12Event);

                    const TokenPlaced = W12Lister.events.TokenPlaced(null, null, this.onTokenPlacedEvent);
                    const CrowdsaleInitialized = W12Lister.events.CrowdsaleInitialized(null, null, this.onCrowdsaleInitializedEvent);
                    const StagesUpdated = W12Crowdsale.events.StagesUpdated(null, null, this.onStagesUpdatedEvent);
                    const StageUpdated = W12Crowdsale.events.StageUpdated(null, null, this.onStageUpdatedEvent);
                    const CrowdsaleTokenMinted = W12Lister.events.CrowdsaleTokenMinted(null, null, this.onCrowdsaleTokenMintedEvent);
                    const MilestonesUpdated = W12Crowdsale.events.MilestonesUpdated(null, null, this.onMilestonesUpdatedEvent);
                    const UnsoldTokenReturned = W12Crowdsale.events.UnsoldTokenReturned(null, null, this.onUnsoldTokenReturnedEvent);
                    const TrancheReleased = W12Fund.events.TrancheReleased(null, null, this.onTrancheReleasedEvent);

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
                    this.error = e.message;
                }

                this.subscribeToEventsLoading = false;
            },

            async onTrancheReleasedEvent(error, result) {
                if (!error) {
                    await this.updateFundInformation({Token: this.currentProject});
                    await this.updateAccountData();
                    const tx = result.transactionHash;
                    this.$store.commit(`Transactions/${CONFIRM_TX}`, tx);
                }
            },
            async onUnsoldTokenReturnedEvent(error, result) {
                if (!error) {
                    await this.updateReceivingInformation({Token: this.currentProject});
                    await this.updateAccountData();
                    const tx = result.transactionHash;
                    this.$store.commit(`Transactions/${CONFIRM_TX}`, tx);
                }
            },
            async onStageUpdatedEvent(error, result) {
                if (!error) {
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
                    await this.fetchCrowdSaleStagesList({Token: this.currentProject});
                    const tx = result.transactionHash;
                    this.$store.commit(`Transactions/${CONFIRM_TX}`, tx);
                }
            },
            async onApprovalEvent(error, result) {
                if (!error) {
                    const {spender} = result.args;
                    const tx = result.transactionHash;
                    if (spender.toString() === this.W12Lister.address) {
                        await this.updateTokensApprovedToPlaceValue({Token : this.currentProject});
                    }
                    await this.updateAccountData();
                    this.$store.commit(`Transactions/${CONFIRM_TX}`, tx);
                }
            },
            async onApprovalW12Event(error, result) {
                console.log("onApprovalW12Event");
                if (!error) {
                    const tx = result.transactionHash;
                    await this.updateTokensApprovedToPlaceValue({Token : this.currentProject});
                    await this.updateAccountData();
                    this.$store.commit(`Transactions/${CONFIRM_TX}`, tx);
                }
            },
            async onTokenPlacedEvent(error, result) {
                if (!error) {
                    const {originalTokenAddress} = result.args;

                    const tx = result.transactionHash;
                    if (originalTokenAddress.toString() === this.currentProject.tokenAddress) {
                        await this.upTokenAfterEvent({Token : this.currentProject});
                    }
                    this.$store.commit(`Transactions/${CONFIRM_TX}`, tx);
                }
            },
            async onCrowdsaleInitializedEvent(error, result) {
                if (!error) {
                    const {tokenAddress} = result.args;

                    const tx = result.transactionHash;
                    if (tokenAddress.toString() === this.currentProject.tokenAddress) {
                        await this.upTokenAfterEvent({Token : this.currentProject});
                    }
                    this.$store.commit(`Transactions/${CONFIRM_TX}`, tx);
                }
            },
            async onCrowdsaleTokenMintedEvent(error, result) {
                if (!error) {
                    const {tokenAddress} = result.args;

                    const tx = result.transactionHash;
                    if (tokenAddress.toString() === this.currentProject.tokenAddress) {
                        await this.fetchProject(this.currentProject);
                    }
                    this.$store.commit(`Transactions/${CONFIRM_TX}`, tx);
                }
            },
        },
    };
</script>