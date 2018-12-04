<template>
    <b-field class="ProjectSwitch">
        <b-select @input="FetchProject" :placeholder="$t('ProjectDashboardSelectToken')" expanded>
            <option v-for="(project, idx) in ProjectList" :key="idx" :value="project">
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
    const LedgerNS = createNamespacedHelpers("Ledger");

    export default {
        name: 'ProjectSwitch',
        template: '#ProjectSwitchTemplate',
        components: {},
        watch: {},
        computed: {
            ...ProjectNS.mapState({
                ProjectList: "list"
            }),
            ...LedgerNS.mapState({
                ledgerMeta: 'meta',
            }),
            ...AccountNS.mapState({
                currentAccount: "currentAccount",
                accountMeta: "meta",
                currentAccountData: "currentAccountData",
            })
        },
        methods: {
            ...ProjectNS.mapActions({
                FetchProject: "fetchProject"
            }),
        },
    };
</script>
