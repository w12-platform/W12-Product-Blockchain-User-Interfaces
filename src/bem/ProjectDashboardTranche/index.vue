<template>
    <div class="ProjectDashboardTranche buefy" v-if="!langMeta.loading">
        <section class="container">
            <h2 v-html="$t('ProjectDashboard')"></h2>

            <b-notification v-if="isError" type="is-danger" :closable="false" has-icon>
                <span v-if="ledgerMeta.loadingError">{{ ledgerMeta.loadingError }}</span>
                <span v-if="ProjectMeta.loadingError">{{ ProjectMeta.loadingError }}</span>
                <span v-if="accountMeta.loadingError">{{ accountMeta.loadingError }}</span>
            </b-notification>

            <b-notification v-if="!isError && isLoading" :closable="false"><span v-html="$t('ProjectDashboardLoadExpect')"></span>
                <b-loading :is-full-page="false" :active="isLoading" :can-cancel="true"></b-loading>
            </b-notification>

            <div v-if="!isLoading">
                <ProjectSwitch v-if="!isCurrentToken"></ProjectSwitch>

                <b-notification v-if="ProjectMeta.loadingProjectError" :closable="false">
                    {{ ProjectMeta.loadingProjectError }}
                </b-notification>

                <div class="ProjectDashboardTranche__project" >
                    <!--<TrancheInformation v-if="!ProjectMeta.loadingProjectError"></TrancheInformation>-->
                    <component :is="TrancheInformationComponent"  v-if="!ProjectMeta.loadingProjectError"></component>

                    <b-loading :is-full-page="false" :active="ProjectMeta.loadingProject" :can-cancel="true"></b-loading>
                </div>
            </div>
        </section>
        <Steps :number="9"></Steps>
    </div>
</template>

<script>
    import './default.scss';
    import { resolveAbiVersion } from '@/lib/Blockchain/ContractsLedger';
    import ProjectSwitch from 'bem/ProjectSwitch';
    import Receiving from 'bem/Receiving';
    import Steps from "bem/Steps";

    import {CONFIRM_TX} from "store/modules/Transactions.js";
    import {createNamespacedHelpers} from 'vuex';
    import {isZeroAddress} from 'lib/utils';

    const LedgerNS = createNamespacedHelpers("Ledger");
    const AccountNS = createNamespacedHelpers("Account");
    const ProjectNS = createNamespacedHelpers("Project");
    const LangNS = createNamespacedHelpers("Lang");
    const ConfigNS = createNamespacedHelpers('Config');

    export default {
        name: 'ProjectDashboardTranche',
        components: {
            ProjectSwitch,
            Receiving,
            Steps
        },
        data() {
            return {

            };
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
            },
            TrancheInformationComponent() {
                if (!this.currentProject) return () => {};
                const version = resolveAbiVersion(this.currentProject.version);
                return () => import(`@/bem/TrancheInformation/${version}/index.vue`);
            },
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
            ...AccountNS.mapActions({
                watchCurrentAccount: 'watch',
                updateAccountData: 'updateAccountData',
            }),
            ...ProjectNS.mapActions({
                ProjectFetchList: "fetchList",
                updateFundInformation: "updateFundInformation",
                FetchProjectByCurrentToken: "fetchProjectByCurrentToken"
            }),
            ...LedgerNS.mapActions({
                LedgerFetch: 'fetch',
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

                if(this.subscribedEvents.StagesUpdated){
                    this.subscribedEvents.TrancheReleased.stopWatching();
                }

                this.subscribedEvents = null;
            },
            async subscribeToEvents() {
                if (!this.currentProject) return;
                if (this.subscribedEvents) return;

                this.subscribeToEventsLoading = true;

                try {
                    const {W12CrowdsaleFactory, W12FundFactory} = await this.LedgerFetch(this.currentProject.version);
                    let TrancheReleased = null;

                    if (!isZeroAddress(this.currentProject.tokenCrowdsaleAddress)) {
                        const W12Crowdsale = W12CrowdsaleFactory.at(this.currentProject.tokenCrowdsaleAddress);
                        const fundAddress = await W12Crowdsale.methods.fund();
                        const W12Fund = W12FundFactory.at(fundAddress);
                        TrancheReleased = W12Fund.events.TrancheReleased(null, null, this.onTrancheReleasedEvent);
                    }

                    this.subscribedEvents = {
                        TrancheReleased,
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
        },
        async created() {
            await this.watchCurrentAccount();
        },
    };
</script>
