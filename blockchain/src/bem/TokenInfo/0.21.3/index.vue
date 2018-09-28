<template>
    <div class="TokenInfo_v2" v-if="currentProject">
        <table class="table table-striped table-bordered table-hover table-responsive-sm">
            <tbody>
            <tr>
                <td>{{ $t('TokenInfoAddress') }}</td>
                <td>
                    <b-tag type="is-info">{{ currentProject.tokenAddress }}</b-tag>
                </td>
            </tr>
            <tr>
                <td>{{ $t('TokenInfoOwner') }}</td>
                <td>
                    <div class="TokenInfo__detailOwner" v-for="owner in currentProject.tokenOwners">
                        <span class="tag is-primary">{{ owner }}</span>
                    </div>
                </td>
            </tr>
            <tr>
                <td>{{ $t('TokenInfoName') }}</td>
                <td>{{ currentProject.name }}</td>
            </tr>
            <tr>
                <td>{{ $t('TokenInfoSymbol') }}</td>
                <td>{{ currentProject.symbol }}</td>
            </tr>
            <tr>
                <td>{{ $t('TokenInfoDecimals') }}</td>
                <td>{{ currentProject.decimals }}</td>
            </tr>
            <tr>
                <td>{{ $t('AdminDashboardTableWTokenSaleFeePercent')  }}</td>
                <td>{{ currentProject.WTokenSaleFeePercent | percentFractional }}%</td>
            </tr>
            <tr>
                <td>{{ $t('AdminDashboardTableTrancheFeePercent') }}</td>
                <td>{{ currentProject.trancheFeePercent | percentFractional }}%</td>
            </tr>
            <tr>
                <td>{{ $t('AdminDashboardTableFeeTokens') }}</td>
                <td>{{ currentProject.feePercent/100 }}%</td>
            </tr>
            <tr>
                <td>{{ $t('AdminDashboardTableFeeEth') }}</td>
                <td>{{ currentProject.feeETHPercent/100 }}%</td>
            </tr>
            </tbody>
        </table>
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
        filters: {
            percentFractional(value) {
                return value/100;
            },
        },
        computed: {
            ...ProjectNS.mapState({
                currentProject: "currentProject",
            }),
        },
        methods: {},
    };
</script>