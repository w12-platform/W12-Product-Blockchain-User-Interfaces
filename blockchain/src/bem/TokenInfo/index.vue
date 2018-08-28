<template>
    <div class="TokenInfo" v-if="currentProject">
        <div class="TokenInfo__row row align-items-center justify-content-around py-4">
            <div>{{ $t('ProjectDashboardSymbol') }} {{ currentProject.symbol }}</div>
            <div>{{ $t('ProjectDashboardDecimals') }} {{ currentProject.decimals }}</div>
            <div>{{ $t('ProjectDashboardFeeTokens') }} {{ currentProject.feePercent/100 }}%</div>
            <div>{{ $t('ProjectDashboardFeeEth') }} {{ currentProject.feeETHPercent/100 }}%</div>
        </div>
    </div>
</template>

<script>
    import './default.scss';

    import {createNamespacedHelpers} from "vuex";

    const ProjectNS = createNamespacedHelpers("Project");

    export default {
        name: 'TokenInfo',
        template: '#TokenInfoTemplate',
        components: {},
        watch: {},
        computed: {
            ...ProjectNS.mapState({
                currentProject: "currentProject",
            }),
        },
        methods: {},
    };
</script>