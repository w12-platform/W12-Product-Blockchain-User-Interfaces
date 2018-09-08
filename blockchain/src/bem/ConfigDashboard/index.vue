<template>
    <div class="ConfigDashboad">
        <section class="container">
            <h2>{{ $t('ConfigDashboardTitle') }}</h2>
            <div>
                <div class="form-group">
                    <label for="W12ListerAddress">W12Lister<span class="ConfigDashboad__address" v-if="W12Lister.address"> - {{ W12Lister.address }}</span></label>
                    <input
                            type="text"
                            class="form-control"
                            id="W12ListerAddress"
                            @keyup.enter="saveConfig"
                            v-model="address">
                </div>
                <div class="form-group">
                    <label for="W12ListerAddress">FactoryTokens<span class="ConfigDashboad__address" v-if="FactoryTokens.address"> - {{ FactoryTokens.address }}</span></label>
                    <input
                            type="text"
                            class="form-control"
                            id="FactoryTokensAddress"
                            @keyup.enter="saveConfig"
                            v-model="factory">
                </div>
                <div>
                    <button class="btn btn-primary" @click="saveConfig">{{ $t('ConfigDashboardSave') }}</button>
                </div>
            </div>
        </section>
    </div>
</template>

<script>
    import "./default.scss";
    import { createNamespacedHelpers } from "vuex";
    import { CONFIG_UPDATE } from "store/modules/Config.js";

    const ConfigNS = createNamespacedHelpers('Config');
    const TokensListNS = createNamespacedHelpers('TokensList');
    const FactoryNS = createNamespacedHelpers('Factory');

    export default {
        name: 'ConfigDashboard',
        template: '#ConfigDashboardTemplate',
        data () {
            return {
                address: null,
                factory: null,
            };
        },
        computed: {
            ...ConfigNS.mapState({
                W12Lister: "W12Lister",
                FactoryTokens: "FactoryTokens"
            }),
        },
        methods: {
            ...TokensListNS.mapActions({
                reset: 'reset'
            }),
            ...FactoryNS.mapActions({
                FactoryReset: 'reset'
            }),

            saveConfig () {
                this.$store.commit(`Config/${CONFIG_UPDATE}`, {
                    W12Lister: { address: this.address },
                    FactoryTokens: { address: this.factory }
                });
                this.reset();
                this.FactoryReset();
                this.address = null;
                this.factory = null;
            },
        },
    };

</script>