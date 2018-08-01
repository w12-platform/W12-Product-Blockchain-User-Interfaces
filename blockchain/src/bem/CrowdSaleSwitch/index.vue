<template>
    <div class="CrowdSaleSwitch">
        <div v-for="(token, idx) in list" :key="idx" @click="onSelect(token)" :class="{ 'CrowdSaleSwitch__tag': true, 'selected': checkSelection(token),}">
            {{ token.name }}
        </div>
    </div>
</template>

<script>
    import './default.scss';
    import { CROWDSALE_LIST_SELECTED } from "store/modules/crowdSaleList";
    import { createNamespacedHelpers } from "vuex";
    const crowdSaleListStore = createNamespacedHelpers("crowdSaleList");

    export default {
        name: 'CrowdSaleSwitch',
        template: '#CrowdSaleSwitchTemplate',
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
            ...crowdSaleListStore.mapState({
                selected: "selected"
            }),
        },
        methods: {
            onSelect(token){
                this.flag = true;
                this.$store.commit(`crowdSaleList/${CROWDSALE_LIST_SELECTED}`, { selected: token });
            },
            checkSelection(token){
                //console.log(token);
                if(!this.selected && this.list[0] && !this.flag) {
                    this.onSelect(this.list[0]);
                } else {
                    // if(this.selected.name === token.name){
                    //     this.$store.commit(`crowdSaleList/${CROWDSALE_LIST_SELECTED}`, { selected: token });
                    // }
                }
                return false;//this.selected && token && token.name === this.selected.name
            }
        },
        created() {

        }
    };

</script>