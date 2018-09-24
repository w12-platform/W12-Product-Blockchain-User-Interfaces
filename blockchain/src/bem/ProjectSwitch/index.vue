<template>
    <b-field class="ProjectSwitch">
        <b-select @input="FetchProject" :placeholder="$t('ProjectDashboardSelectToken')" expanded>
            <option v-for="(project, idx) in projectsForCurrentAccount" :key="idx" :value="project">
                {{ project.symbol }} - {{ project.tokenAddress }} - v{{ project.version }}
            </option>
        </b-select>
    </b-field>
</template>

<script>
    import './default.scss';

    import {createNamespacedHelpers} from "vuex";

    const ProjectNS = createNamespacedHelpers("Project");
    const AccountNS = createNamespacedHelpers("Account");

    export default {
        name: 'ProjectSwitch',
        template: '#ProjectSwitchTemplate',
        components: {},
        watch: {},
        computed: {
            ...ProjectNS.mapState({
                ProjectList: "list"
            }),
            ...AccountNS.mapState({
                currentAccount: "currentAccount",
                accountMeta: "meta",
                currentAccountData: "currentAccountData",
            }),

            projectsForCurrentAccount(){
                return this.ProjectList.filter((project)=>project.tokenOwners.indexOf(this.currentAccount) !== -1);
            }
        },
        methods: {
            ...ProjectNS.mapActions({
                FetchProject: "fetchProject"
            }),
        },
    };
</script>