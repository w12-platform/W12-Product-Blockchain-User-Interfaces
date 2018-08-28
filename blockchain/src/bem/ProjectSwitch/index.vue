<template>
    <b-field class="ProjectSwitch">
        <b-select @input="projectSelected" :placeholder="$t('ProjectDashboardSelectToken')" expanded>
            <option v-for="(project, idx) in ProjectList" :key="idx" :value="project">
                {{ project.symbol }} - {{ project.tokenAddress }}
            </option>
        </b-select>
    </b-field>
</template>

<script>
    import './default.scss';

    import {createNamespacedHelpers} from "vuex";

    const ProjectNS = createNamespacedHelpers("Project");

    export default {
        name: 'ProjectSwitch',
        template: '#ProjectSwitchTemplate',
        components: {},
        watch: {},
        computed: {
            ...ProjectNS.mapState({
                ProjectList: "list"
            }),
        },
        methods: {
            ...ProjectNS.mapActions({
                FetchProject: "fetchProject"
            }),
            projectSelected(token) {
                this.FetchProject({Token: token});
            },
        },
    };
</script>