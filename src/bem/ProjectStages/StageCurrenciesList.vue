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
            <b-loading :is-full-page="false" :active.sync="loading"></b-loading>
        </div>

        <!--<multiselect v-model="value" :options="ratesFetch" :multiple="true" :close-on-select="false" :clear-on-select="false" :hide-selected="true" :preserve-search="true" placeholder="Pick some" :preselect-first="true">-->
            <!--<template slot="tag" slot-scope="props"><span class="custom__tag"><span>{{ props }}</span><span class="custom__remove" @click="props.remove(props)">❌</span></span></template>-->
        <!--</multiselect>-->
    </div>
</template>

<script>
    import 'vue-multiselect/dist/vue-multiselect.min.css';
    import './default.scss';

    import {createNamespacedHelpers} from "vuex";

    const RatesNS = createNamespacedHelpers("Rates");

    export default {
        name: 'StageCurrenciesList',
        template: '#StageCurrenciesListTemplate',
        watch: {},
        data() {
            return {
                loading: false,
                value: null,
            };
        },
        computed: {
            ...RatesNS.mapState({
                RatesList: "list",
            }),
        },
        methods: {
            ...RatesNS.mapActions({
                ratesFetch: "fetch"
            })
        },
        async created(){
            await this.ratesFetch();
        }
    };
</script>