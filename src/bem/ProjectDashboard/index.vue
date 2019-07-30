<template>
    <div class="ProjectDashboard buefy" v-if="!langMeta.loading">
        <section class="container">
            <h2 v-html="$t('ProjectDashboard')"></h2>

            <b-notification v-if="isError" type="is-danger" :closable="false" has-icon>
                <span v-if="ledgerMeta.loadingError">{{ $t(ledgerMeta.loadingError) }}</span>
                <span v-if="ProjectMeta.loadingError">{{ $t(ProjectMeta.loadingError) }}</span>
                <span v-if="accountMeta.loadingError">{{ $t(accountMeta.loadingError) }}</span>
            </b-notification>

            <b-notification v-if="!isError && isLoading" :closable="false"><span v-html="$t('ProjectDashboardLoadExpect')"></span>
                <b-loading :is-full-page="false" :active="isLoading"></b-loading>
            </b-notification>

            <div v-if="!isLoading">
                <ProjectSwitch v-if="isViewSwitch"></ProjectSwitch>

                <b-notification v-if="ProjectMeta.loadingProjectError" :closable="false">
                    {{ ProjectMeta.loadingProjectError }}
                </b-notification>

                <div class="ProjectDashboard__project">
                    <TokenInfo v-if="!ProjectMeta.loadingProjectError && currentProject && currentProject.version" :is="TokenInfoVersion"></TokenInfo>
                    <keep-alive>
                    <ProjectStages v-if="!ProjectMeta.loadingProjectError && currentProject && currentProject.version" :is="ProjectStagesVersion"></ProjectStages>
                    </keep-alive>

                    <b-loading :is-full-page="false" :active="ProjectMeta.loadingProject"></b-loading>
                </div>
            </div>
        </section>
        <Steps :number="5"></Steps>
    </div>
</template>

<script>
    import './default.scss';
    import { resolveComponentVersion } from '@/bem/utils';
    import ProjectSwitch from 'bem/ProjectSwitch';
    import Steps from "bem/Steps";
    import semver from 'semver';

    import {createNamespacedHelpers} from 'vuex';

    const LedgerNS = createNamespacedHelpers("Ledger");
    const AccountNS = createNamespacedHelpers("Account");
    const ProjectNS = createNamespacedHelpers("Project");
    const LangNS = createNamespacedHelpers("Lang");

    export default {
        name: 'ProjectDashboard',
        components: {
            ProjectSwitch,
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
            isError() {
                return this.ledgerMeta.loadingError || this.ProjectMeta.loadingError || this.accountMeta.loadingError;
            },
            isLoading() {
                return (
                    this.accountMeta.loading
                    || this.ProjectMeta.loading
                );
            },
            TokenInfoVersion(){
                const v = resolveComponentVersion(this.currentProject.version, 'TokenInfo');
                return () => import("bem/TokenInfo/" + v);
            },
            ProjectStagesVersion(){
                const v = resolveComponentVersion(this.currentProject.version, 'ProjectStages');
                return () => import("bem/ProjectStages/" + v);
            },
            isCurrentToken(){
                return typeof window.CurrentToken !== 'undefined';
            },
            isViewSwitch(){
                return this.isCurrentToken ? !!semver.satisfies(window.CurrentToken.version, '>=0.28.0') : true;
            }
        },
        watch: {
            'currentAccount': {
                handler: 'handleCurrentAccountChange',
                immediate: true
            },
            'currentProject': {
                handler: 'handleCurrentProjectChange',
                immediate: true
            }
        },
        methods: {
            ...AccountNS.mapActions({
                watchCurrentAccount: 'watch',
                updateAccountData: 'updateAccountData',
            }),
            ...ProjectNS.mapActions({
                ProjectFetchList: "fetchList",
                ProjectFetchListCurrentToken: "fetchListCurrentToken",
                FetchProjectByCurrentToken: "fetchProjectByCurrentToken"
            }),

            async handleCurrentAccountChange(currentAccount) {
                if(currentAccount){
                    if(this.isCurrentToken){
                        window.CurrentToken.__customerPointer = true;
                        if(semver.satisfies(window.CurrentToken.version, '>=0.28.0')) {
                            await this.ProjectFetchListCurrentToken(window.CurrentToken);
                        } else {
                            await this.FetchProjectByCurrentToken(window.CurrentToken);
                        }
                    } else {
                        await this.ProjectFetchList();
                    }
                }
            },
            async handleCurrentProjectChange() {
                window.dispatchEvent(new Event('resize'));
            }
        },
        async created() {
            await this.watchCurrentAccount();
        },
        mounted: function()
        {
            console.log('dashboard');
        }
    }
</script>
