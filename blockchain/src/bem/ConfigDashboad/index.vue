<template>
    <div class="ConfigDashboad">
        <section class="container">
            <h2>Config Dashboard</h2>
            <div>
                <div class="form-group">
                    <label for="W12ListerAddress">W12Lister<span class="ConfigDashboad__address" v-if="W12Lister.address"> - {{ W12Lister.address }}</span></label>
                    <input
                            placeholder="Address of the W12Lister"
                            type="text"
                            class="form-control"
                            id="W12ListerAddress"
                            @keyup.enter="saveConfig"
                            v-model="form.W12Lister.address">
                </div>
                <div>
                    <button class="btn btn-primary" @click="saveConfig">Save</button>
                </div>
            </div>
        </section>
    </div>
</template>

<script>
    import "bem/ConfigDashboad/default.scss";
    import { createNamespacedHelpers } from "vuex";
    import { CONFIG_UPDATE } from "store/modules/config";

    const ConfigNS = createNamespacedHelpers('config');

    export default {
        name: 'ConfigDashboard',
        template: '#ConfigDashboardTemplate',
        data () {
            return {
                form: {
                    W12Lister: {
                        address: null
                    }
                }
            };
        },
        computed: {
            ...ConfigNS.mapState({
                W12Lister: "W12Lister"
            }),
        },
        methods: {
            saveConfig () {
                this.$store.commit(`config/${CONFIG_UPDATE}`, { W12Lister: { address: this.form.W12Lister.address }});
                this.form.W12Lister.address = null;
                //удалить данные о выбранном токене

            },
        },
    };

</script>