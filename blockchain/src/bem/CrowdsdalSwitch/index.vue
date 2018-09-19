<template>
    <div class="CrowdsdalSwitch">
        <div v-for="(token, idx) in list" :key="idx" @click="onSelect(token)" :class="{ 'CrowdsdalSwitch__tag': true, 'selected': checkSelection(token),}">
            {{ token.name }}
        </div>
    </div>
</template>

<script>
    import './default.scss';
    import { CROWDSDAL_LIST_SELECTED } from "../../store/modules/crowdsdalList";
    import { createNamespacedHelpers } from "vuex";
    const crowdsdalListStore = createNamespacedHelpers("crowdsdalList");

    export default {
        name: 'CrowdsdalSwitch',
        template: '#CrowdsdalSwitchTemplate',
        components: {},
        props: {
            /* Массив краудсейлов */
            list: Array,
            required: true
        },
        data() {
            return {
                selectedFlag: false
            };
        },
        watch: {},
        computed: {
            ...crowdsdalListStore.mapState({
                selected: "selected"
            }),
        },
        methods: {
            onSelect(token){
                this.flag = true;
                this.$store.commit(`crowdsdalList/${CROWDSDAL_LIST_SELECTED}`, { selected: token });
            },
            checkSelection(token){
                if(!this.selected && this.list[0] || !this.flag) {
                    this.onSelect(this.list[0]);
                } else {
                    if(this.selected.name === token.name){
                        this.$store.commit(`crowdsdalList/${CROWDSDAL_LIST_SELECTED}`, { selected: token });
                    }
                }
                return this.selected && token && token.name === this.selected.name
            }
        },
        created() {

        }
    };

</script>