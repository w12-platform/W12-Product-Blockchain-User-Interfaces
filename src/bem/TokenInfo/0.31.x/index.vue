<template>
    <div class="TokenInfo_v2" v-if="currentProject">
        <table class="table table-striped table-bordered table-hover table-responsive-sm">
            <tbody>
            <tr>
                <td v-html="$t('TokenInfoAddress')"></td>
                <td>
                    <b-tag type="is-info">{{ currentProject.tokenAddress }}</b-tag>
                </td>
            </tr>
            <tr>
                <td v-html="$t('TokenInfoOwner')"></td>
                <td>
                    <div class="TokenInfo__detailOwner" v-for="owner in currentProject.tokenOwners">
                        <span class="tag is-primary">{{ owner }}</span>
                    </div>
                </td>
            </tr>
            <tr>
                <td v-html="$t('TokenInfoName')"></td>
                <td>{{ currentProject.name }}</td>
            </tr>
            <tr>
                <td v-html="$t('TokenInfoSymbol')"></td>
                <td>{{ currentProject.symbol }}</td>
            </tr>
            <tr>
                <td v-html="$t('TokenInfoDecimals')"></td>
                <td>{{ currentProject.decimals }}</td>
            </tr>
            <tr>
                <td v-html="$t('AdminDashboardTableWTokenSaleFeePercent')"></td>
                <td>{{ currentProject.WTokenSaleFeePercent | percentFractional }}%</td>
            </tr>
            <tr>
                <td v-html="$t('AdminDashboardTableTrancheFeePercent')"></td>
                <td>{{ currentProject.trancheFeePercent | percentFractional }}%</td>
            </tr>
            <tr>
                <td v-html="$t('AdminDashboardTableFeeTokens')"></td>
                <td>{{ currentProject.feePercent | percentFractional }}%</td>
            </tr>
            <tr>
                <td v-html="$t('AdminDashboardTableFeeEth')"></td>
                <td>
                    {{ currentProject.feeETHPercent | percentFractional}}%
                    <span v-for="(value, key) in currentProject.individualPurchaseFee">
                        <br>- {{ key }}: {{ value | percentFractional}}%
                    </span>
                </td>
            </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
    import './default.scss';
    import { decodePercent } from '@/lib/selectors/units';

    import {createNamespacedHelpers} from "vuex";

    const ProjectNS = createNamespacedHelpers("Project");

    export default {
        name: 'TokenInfo',
        template: '#TokenInfoTemplate',
        components: {},
        watch: {},
        filters: {
            percentFractional(value) {
                return decodePercent(value).toString();
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
