<template>
    <div class="ProjectStages__stage">
        <div class="row align-items-center justify-content-left">
            <div class="col-auto">
                <span class="ProjectDashboard__step-badge step-badge badge badge-pill badge-light">4</span>
            </div>
            <div class="col-sm-4">
                {{ $t('ProjectDashboardStageCurrenciesList') }}
            </div>
            <div class="col-sm-2 text-center">
            </div>
            <div class="col-sm text-right">
            </div>
            <b-loading :is-full-page="false" :active.sync="loading" :can-cancel="true"></b-loading>
        </div>

        <multiselect
            :value="value"
            @input="$emit('input', $event)"
            :options="RatesList"
            :multiple="true"
            :close-on-select="false"
            :clear-on-select="false"
            :hide-selected="true"
            :preserve-search="true"
            :placeholder="$t('ProjectDashboardStageCurrenciesListPickCurrencies')"
            :preselect-first="true"
            :disabled="disabled || isStartCrowdSale"
        >
            <template slot="tag" slot-scope="props">
                <b-taglist class="ProjectStages__tag" attached>
                    <b-tag type="is-dark">{{ props.option }}</b-tag>
                    <b-tag type="is-white" @click.native.stop="props.remove(props.option)">❌</b-tag>
                </b-taglist>
            </template>
        </multiselect>
    </div>
</template>

<script>
    import 'vue-multiselect/dist/vue-multiselect.min.css';
    import './default.scss';
    import BTag from 'buefy/src/components/tag/Tag';
    import { createNamespacedHelpers } from "vuex";

    const RatesNS = createNamespacedHelpers("Rates");
    const ProjectNS = createNamespacedHelpers("Project");

    export default {
        name: 'StageCurrenciesList',
        components: {BTag},
        template: '#StageCurrenciesListTemplate',
        async created() {
            this.__statusWatcher = this.$watch(
                () => this.isAllReadyToSetup,
                (value, prevValue) => this.$emit('ready-status', value),
                {immediate: true}
            );

            await this.ratesFetch();
        },
        beforeDestroy() {
            this.__statusWatcher();
        },
        props: {
            disabled: Boolean,
            value: {
                type: Array,
                default() { return []; }
            }
        },
        watch: {
            storedList: {
                handler(value) { this.$emit('input', value); },
                immediate: true
            }
        },
        data() {
            return {
                loading: false,
            };
        },
        computed: {
            ...RatesNS.mapState({
                RatesList: "list",
            }),
            ...ProjectNS.mapState({
                storedList: (state) =>
                    (state.currentProject && state.currentProject.paymentMethodsList)
                    || []
                ,
            }),
            ...ProjectNS.mapGetters({
                isStartCrowdSale: 'isStartCrowdSale',
            }),
            isAllReadyToSetup() {
                return this.value.length > 0;
            }
        },
        methods: {
            ...RatesNS.mapActions({
                ratesFetch: "fetch"
            })
        }
    };
</script>
