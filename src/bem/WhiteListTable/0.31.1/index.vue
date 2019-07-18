<template>
    <div class="WhiteListTable WhiteListTable_v2 buefy">

        <b-notification v-if="isLoading" :closable="false" class="WhiteListTable__loader">
            <b-loading :is-full-page="false" :active="isLoading"></b-loading>
        </b-notification>

        <b-table
                v-if="!isLoading"
                detailed
                :data="tokensList"
                :mobile-cards="true"
                paginated
                per-page="10"
                pagination-simple>
            <template slot-scope="props">

                <b-table-column field="date" :label="$t('AdminDashboardTableToken')" :title="props.row.tokenAddress">
                    <span class="tag is-success">{{ props.row.tokenAddress | shortAddress }}</span>
                </b-table-column>

                <b-table-column field="date" :label="$t('AdminDashboardTableOwner')">
                    <span v-if="props.row.tokenOwners.length > 1" class="tag is-primary">
                        x{{ props.row.tokenOwners.length }}
                    </span>
                    <span v-else class="tag is-primary">
                        {{ props.row.tokenOwners[0] | shortAddress}}
                    </span>
                </b-table-column>

                <b-table-column field="date" :label="$t('AdminDashboardTableName')">
                    {{ props.row.name }}
                </b-table-column>

                <b-table-column field="date" :label="$t('AdminDashboardTableSymbol')" centered>
                    {{ props.row.symbol }}
                </b-table-column>
            </template>

            <template slot="detail" slot-scope="props">
                <div class="WhiteListTable__detail">
                    <div class="WhiteListTable__detailField">
                        {{ $t('AdminDashboardTableIndex') }} :
                        <div class="WhiteListTable__detailDecimals">
                            <span>{{ props.row.index }}</span>
                        </div>
                    </div>
                    <div class="WhiteListTable__detailField">
                        {{ $t('AdminDashboardTableToken') }} :
                        <div class="WhiteListTable__detailToken">
                            <span class="tag is-success">{{ props.row.tokenAddress }}</span>
                        </div>
                    </div>
                    <div class="WhiteListTable__detailField">
                        {{ $t('AdminDashboardTableOwner') }} :
                        <div class="WhiteListTable__detailOwner" v-for="owner in props.row.tokenOwners">
                            <span class="tag is-primary">{{ owner }}</span>
                        </div>
                    </div>
                    <div class="WhiteListTable__detailField">
                        {{ $t('AdminDashboardTableDecimals') }} :
                        <div class="WhiteListTable__detailDecimals">
                            <span>{{ props.row.decimals }}</span>
                        </div>
                    </div>
                    <div class="WhiteListTable__detailField">
                        {{ $t('AdminDashboardTableWTokenSaleFeePercent') }} :
                        <div class="WhiteListTable__detailDecimals">
                            <span>{{ props.row.WTokenSaleFeePercent | percentFractional }}%</span>
                        </div>
                    </div>
                    <div class="WhiteListTable__detailField">
                        {{ $t('AdminDashboardTableTrancheFeePercent') }} :
                        <div class="WhiteListTable__detailDecimals">
                            <span>{{ props.row.trancheFeePercent | percentFractional }}%</span>
                        </div>
                    </div>
                    <div class="WhiteListTable__detailField">
                        {{ $t('AdminDashboardTableFeeTokens') }} :
                        <div class="WhiteListTable__detailDecimals">
                            <span>{{ props.row.feePercent | percentFractional }}%</span>
                        </div>
                    </div>
                    <div class="WhiteListTable__detailField">
                        {{ $t('AdminDashboardTableFeeEth') }} :
                        <div class="WhiteListTable__detailDecimals">
                            <span>{{ props.row.feeETHPercent | percentFractional }}%</span>
                        </div>
                    </div>
                </div>
            </template>
        </b-table>
    </div>
</template>

<script>
    import './default.scss';

    import {createNamespacedHelpers} from "vuex";

    const WhitelistNS = createNamespacedHelpers("Whitelist");

    export default {
        name: 'WhiteListTable',
        template: '#WhiteListTableTemplate',
        filters: {
            shortAddress(value) {
                const length = value.length;
                return value.slice(0, 8) + " ... " + value.slice(length - 8, length);
            },
            percentFractional(value) {
                return value/100;
            },
        },
        computed: {
            ...WhitelistNS.mapState({
                tokensList: "list",
                whiteMeta: "meta"
            }),

            isLoading() {
                return this.whiteMeta.loading;
            },
        },
    };
</script>
