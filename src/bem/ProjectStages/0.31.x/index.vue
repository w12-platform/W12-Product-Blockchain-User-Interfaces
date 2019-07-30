<template>
    <div class="ProjectStages ProjectStages_v2" v-if="currentProject && currentAccount">
        <StageWhiteList></StageWhiteList>
        <StageApprove></StageApprove>
        <StagePlace></StagePlace>
        <StageConfigureCrowdsale
            @ready-status="crowdsaleInitReadyStatus = $event"
        ></StageConfigureCrowdsale>
        <StageCurrenciesList
            v-model="tokenCrowdSalePaymentMethods"
            :disabled="!crowdsaleInitReadyStatus"
            @ready-status="paymentMethodsReadyStatus = $event"
        ></StageCurrenciesList>
        <StageCrowdsaleSetup
            :stages.sync="tokenCrowdSaleStages"
            :milestones.sync="tokenCrowdSaleMilestones"
            @ready-status="stagesAndMilestonesReadyStatus = $event"
        ></StageCrowdsaleSetup>
        <button
            class="btn btn-primary btn-md btn-block"
            :disabled="!isAllReadyForSetupCrowdsale"
            @click="setupCrowdsale" v-html="$t('SetupCrowdsale')"
        ></button>


        <StageName></StageName>

        <StageType></StageType>

        <StageAddress></StageAddress>



    </div>
</template>

<script>
    import './default.scss';
    import { errorMessageSubstitution, waitContractEventOnce, waitTransactionReceipt, warrantor } from '@/lib/utils';
    import { CANCEL_TX } from '@/store/modules/Transactions';
    import cloneDeep from 'lodash/cloneDeep';
    import Connector from 'lib/Blockchain/DefaultConnector.js';

    import StageWhiteList from 'bem/ProjectStages/StageWhiteList';
    import StageApprove from 'bem/ProjectStages/StageApprove';
    import StagePlace from './stages/StagePlace';
    import StageName from './stages/StageName';
    import StageType from './stages/StageType';
    import StageAddress from './stages/StageAddress';
    import StageCurrenciesList from './stages/StageCurrenciesList';
    import StageConfigureCrowdsale from './stages/StageConfigureCrowdsale';
    import StageCrowdsaleSetup from 'bem/StageCrowdsaleSetup/0.31.1';

    import {createNamespacedHelpers} from "vuex";
    import {CONFIRM_TX, UPDATE_TX} from "store/modules/Transactions.js";
    import {isZeroAddress} from 'lib/utils';

    const ConfigNS = createNamespacedHelpers('Config');
    const ProjectNS = createNamespacedHelpers("Project");
    const LedgerNS = createNamespacedHelpers("Ledger");
    const AccountNS = createNamespacedHelpers("Account");

    const markAsWasCreated = (list) => {
        list = cloneDeep(list)
            .forEach(item => item.wasCreated = true);

        return list;
    };

    export default {
        name: 'ProjectStages',
        template: '#ProjectStagesTemplate',
        components: {
            StageWhiteList,
            StageApprove,
            StagePlace,
            StageName,
            StageType,
            StageAddress,
            StageCurrenciesList,
            StageConfigureCrowdsale,
            StageCrowdsaleSetup
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

                crowdsaleInitReadyStatus: false,
                stagesAndMilestonesReadyStatus: false,
                tokenCrowdSaleStages: [],
                tokenCrowdSaleMilestones: [],

                paymentMethodsReadyStatus: false,
                tokenCrowdSalePaymentMethods: []
            };
        },
        computed: {
            ...ProjectNS.mapState({
                currentProject: "currentProject",
                ProjectMeta: "meta",
            }),
            ...ProjectNS.mapGetters({
                isStartCrowdSale: 'isStartCrowdSale',
            }),
            ...AccountNS.mapState({
                currentAccount: "currentAccount",
                accountMeta: "meta",
            }),
            ...ConfigNS.mapState({
                W12Lister: "W12Lister"
            }),

            isAllReadyForSetupCrowdsale() {
                return (
                    this.stagesAndMilestonesReadyStatus
                    && this.paymentMethodsReadyStatus
                    && !this.isStartCrowdSale
                );
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
                fetchCrowdSaleAddressAndInfo: "fetchCrowdSaleAddressAndInfo",
                updateTokenInfo: "updateTokenInfo",
                updateOwnerBalance: "updateOwnerBalance",
                upTokenAfterEvent: "upTokenAfterEvent",
                fetchCrowdSaleStagesList: "fetchCrowdSaleStagesList",
                fetchCrowdSaleMilestonesList: "fetchCrowdSaleMilestonesList",
                fetchPaymentMethodsList: "fetchPaymentMethodsList",
                updateReceivingInformation: "updateReceivingInformation",
                updateFundInformation: "updateFundInformation",
                updateProject: "updateProject"
            }),

            async handleProjectChange (loadingStatus) {
                if (loadingStatus === false) {
                    await this.updateAccountData();
                    this.unsubscribeFromEvents();
                    await this.subscribeToEvents();
                }
            },
            unsubscribeFromEvents() {
                if (!this.isSubscribedToEvent) return;
                if (!this.subscribedEvents) return;

                this.subscribedEvents.ApprovalEvent.stopWatching();
                if (this.subscribedEvents.ApprovalW12Event) {
                    this.subscribedEvents.ApprovalW12Event.stopWatching();
                }
                if(this.subscribedEvents.UnsoldTokenReturned){
                    this.subscribedEvents.UnsoldTokenReturned.stopWatching();
                }
                if(this.subscribedEvents.TrancheReleased){
                    this.subscribedEvents.TrancheReleased.stopWatching();
                }

                this.isSubscribedToEvent = false;
                this.subscribedEvents = null;
            },
            async subscribeToEvents() {
                if (!this.currentProject) return;
                if (this.subscribedEvents) return;
                if (this.isSubscribedToEvent) return;

                this.subscribeToEventsLoading = true;

                try {
                    // TODO: write small utils to fetch factories faster
                    const {ERC20Factory, W12ListerFactory, W12CrowdsaleFactory, W12TokenFactory, W12FundFactory} = await this.LedgerFetch(this.currentProject.version);
                    const ERC20 = ERC20Factory.at(this.currentProject.tokenAddress);
                    const W12Lister = W12ListerFactory.at(this.currentProject.listerAddress);
                    const {web3} = await Connector.connect();
                    const getBlockNumber = warrantor(web3.eth.getBlockNumber);
                    // subscribe to event from next block to prevent triggering immediatly after subscribed
                    const fromBlock = (await getBlockNumber()) + 1;
                    let ApprovalW12Event = null;
                    // let CrowdsaleSetUpEvent = null;
                    let UnsoldTokenReturned = null;
                    let TrancheReleased = null;

                    if (!isZeroAddress(this.currentProject.tokenCrowdsaleAddress)) {
                        const W12Crowdsale = W12CrowdsaleFactory.at(this.currentProject.tokenCrowdsaleAddress);
                        const fundAddress = await W12Crowdsale.methods.fund();
                        const W12Fund = W12FundFactory.at(fundAddress);
                        // TODO: write something to watch event more clearly and faster
                        // CrowdsaleSetUpEvent = W12Crowdsale.events.CrowdsaleSetUpDone(null, null, this.onCrowdsaleSetUpEvent);
                        UnsoldTokenReturned = W12Crowdsale.events.UnsoldTokenReturned(null, { fromBlock }, this.onUnsoldTokenReturnedEvent);
                        TrancheReleased = W12Fund.events.TrancheReleased(null, { fromBlock }, this.onTrancheReleasedEvent);
                    }

                    if (!isZeroAddress(this.currentProject.wTokenAddress)) {
                        const W12Token = W12TokenFactory.at(this.currentProject.wTokenAddress);
                        ApprovalW12Event = W12Token.events.Approval(null, { fromBlock }, this.onApprovalW12Event);
                    }

                    const ApprovalEvent = ERC20.events.Approval(null, { fromBlock }, this.onApprovalEvent);

                    this.subscribedEvents = {
                        ApprovalEvent,
                        ApprovalW12Event,
                        // CrowdsaleInitialized,
                        // CrowdsaleSetUpEvent,
                        UnsoldTokenReturned,
                        TrancheReleased
                    };
                } catch (e) {
                    console.error(e);
                    this.error = errorMessageSubstitution(e.message);
                }

                this.subscribeToEventsLoading = false;
                this.isSubscribedToEvent = true;
            },

            async onTrancheReleasedEvent(error, result) {
                if (!error) {
                    await this.$store.dispatch('Cache/blockNumberUp');
                    await this.$nextTick();

                    await this.updateFundInformation({Token: this.currentProject});
                    await this.updateAccountData();
                    const tx = result.transactionHash;
                    this.$store.commit(`Transactions/${CONFIRM_TX}`, tx);
                }
            },
            async onUnsoldTokenReturnedEvent(error, result) {
                if (!error) {
                    await this.$store.dispatch('Cache/blockNumberUp');
                    await this.$nextTick();

                    await this.updateReceivingInformation({Token: this.currentProject});
                    await this.updateAccountData();
                    const tx = result.transactionHash;
                    this.$store.commit(`Transactions/${CONFIRM_TX}`, tx);
                }
            },
            async onApprovalEvent(error, result) {
                if (!error) {
                    await this.$store.dispatch('Cache/blockNumberUp');
                    await this.$nextTick();

                    const tx = result.transactionHash;
                    await this.updateTokensApprovedToPlaceValue({Token: this.currentProject});
                    await this.updateAccountData();
                    this.$store.commit(`Transactions/${CONFIRM_TX}`, tx);
                }
            },
            async onApprovalW12Event(error, result) {
                if (!error) {
                    await this.$store.dispatch('Cache/blockNumberUp');
                    await this.$nextTick();

                    const tx = result.transactionHash;
                    await this.updateTokensApprovedToPlaceValue({Token: this.currentProject});
                    await this.updateAccountData();
                    this.$store.commit(`Transactions/${CONFIRM_TX}`, tx);
                }
            },
            async setupCrowdsale() {
                let tx;

                try {
                    const {W12CrowdsaleFactory} = await this.LedgerFetch(this.currentProject.version);
                    const W12Crowdsale = W12CrowdsaleFactory.at(this.currentProject.tokenCrowdsaleAddress);
                    const connectedWeb3 = (await Connector.connect()).web3get;
                    const event = waitContractEventOnce(W12Crowdsale, 'CrowdsaleSetUpDone');

                    tx = await W12Crowdsale.setup(
                        this.tokenCrowdSaleStages,
                        this.tokenCrowdSaleMilestones,
                        this.tokenCrowdSalePaymentMethods
                    );

                    this.$store.commit(`Transactions/${UPDATE_TX}`, {
                        token: this.currentProject.tokenAddress,
                        name: "crowdsaleSetup",
                        hash: tx,
                        status: "pending"
                    });
                    await this.$nextTick();

                    await waitTransactionReceipt(tx, connectedWeb3);
                    await event;

                    await this.$nextTick();

                    await this.fetchCrowdSaleStagesList({Token: this.currentProject});
                    await this.fetchCrowdSaleMilestonesList({Token: this.currentProject});
                    await this.fetchPaymentMethodsList({Token: this.currentProject});
                    this.$store.commit(`Transactions/${CONFIRM_TX}`, tx);
                } catch (e) {
                    console.error(e);
                    this.error = errorMessageSubstitution(e.message);

                    if (tx) {
                        this.$store.commit(`Transactions/${CANCEL_TX}`, tx);
                    }
                }
            },
        },
    };
</script>
