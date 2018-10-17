<template>
    <b-field class="ListerSwitch">
        <b-select @input="selectLister" :value="W12Lister" :placeholder="$t('AdminDashboardSelectLister')" expanded :disabled="disabled">
            <option v-for="(lister, idx) in W12ListerList" :key="idx" :value="lister">
                {{ lister.address }}   v{{ lister.version }}
            </option>
        </b-select>
    </b-field>
</template>

<script>
    import './default.scss';

    import {createNamespacedHelpers} from "vuex";

    const ConfigNS = createNamespacedHelpers("Config");
    import { CONFIG_UPDATE } from "store/modules/Config.js";

    export default {
        name: 'ProjectSwitch',
        template: '#ProjectSwitchTemplate',
        props: {
            disabled: {
                type: Boolean,
                default: false
            }
        },
        components: {},
        watch: {},
        computed: {
            ...ConfigNS.mapState({
                W12ListerList: "W12ListerList",
                W12Lister: "W12Lister"
            }),

        },
        methods: {
            selectLister(lister){
                this.$store.commit(`Config/${CONFIG_UPDATE}`, {W12Lister: lister});
            }
        },
    };
</script>
