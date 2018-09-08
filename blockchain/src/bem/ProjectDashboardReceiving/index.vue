<template>
    <div class="ProjectDashboard buefy" v-if="!langMeta.loading">
        <section class="container">
            <h2>{{ $t('ProjectDashboard') }}</h2>

            <b-notification v-if="isError" type="is-danger" :closable="false" has-icon>
                <span v-if="ledgerMeta.loadingError">{{ ledgerMeta.loadingError }}</span>
                <span v-if="ProjectMeta.loadingError">{{ ProjectMeta.loadingError }}</span>
                <span v-if="accountMeta.loadingError">{{ accountMeta.loadingError }}</span>
            </b-notification>

            <b-notification v-if="!isError && isLoading" :closable="false">
                {{ $t('ProjectDashboardLoadExpect') }}
                <b-loading :is-full-page="false" :active.sync="isLoading" :can-cancel="true"></b-loading>
            </b-notification>

            <div v-if="!isLoading">
                <ProjectSwitch></ProjectSwitch>

                <b-notification v-if="ProjectMeta.loadingProjectError" :closable="false">
                    {{ ProjectMeta.loadingProjectError }}
                </b-notification>

                <div class="ProjectDashboard__project" v-if="!ProjectMeta.loadingProjectError">
                    <Receiving></Receiving>

                    <b-loading :is-full-page="false" :active.sync="ProjectMeta.loadingProject" :can-cancel="true"></b-loading>
                </div>
            </div>
        </section>
    </div>
</template>

<script>
    import './default.scss';
    import ProjectSwitch from 'bem/ProjectSwitch';
    import TokenInfo from 'bem/TokenInfo';
    import ProjectStages from 'bem/ProjectStages';
    import Receiving from 'bem/Receiving';
    import Milestones from 'bem/Milestones';
    import TrancheInformation from 'bem/TrancheInformation';

    import {createNamespacedHelpers} from 'vuex';

    const LedgerNS = createNamespacedHelpers("Ledger");
    const AccountNS = createNamespacedHelpers("Account");
    const ProjectNS = createNamespacedHelpers("Project");
    const LangNS = createNamespacedHelpers("Lang");

    export default {
        name: 'ProjectDashboard',
        components: {
            ProjectSwitch,
            TokenInfo,
            ProjectStages,
            Milestones,
            Receiving,
            TrancheInformation,
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
                ProjectMeta: "meta",
            }),
            ...LangNS.mapState({
                langMeta: 'meta'
            }),

            isError() {
                return this.ledgerMeta.loadingError || this.ProjectMeta.loadingProjectError || this.accountMeta.loadingError;
            },
            isLoading() {
                return (
                    this.accountMeta.loading
                    || this.ProjectMeta.loading
                );
            },
        },
        watch: {
            'currentAccount': {
                handler: 'handleCurrentAccountChange',
                immediate: true
            },
        },
        methods: {
            ...AccountNS.mapActions({
                watchCurrentAccount: 'watch',
                updateAccountData: 'updateAccountData',
            }),
            ...ProjectNS.mapActions({
                ProjectFetchList: "fetchList"
            }),

            async handleCurrentAccountChange(currentAccount) {
                if(currentAccount){
                    await this.ProjectFetchList();
                }
            }
        },
        async created() {
            await this.watchCurrentAccount();
        },
    };
</script>
