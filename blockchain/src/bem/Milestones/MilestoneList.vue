<template>
    <div class="MilestoneList">
        <MilestoneCard
                v-for="(item, idx) in observableData"
                v-model="observableData[idx]"
                @delete="onDelete"
                :key="idx"
        ></MilestoneCard>
        <button class="btn btn-sm btn-primary" @click="onAdd">Добавить Milestone</button>
    </div>
</template>
<script>
    import MilestoneCard from './MilestoneCard.vue';
    import { MilestoneModel } from './shared.js';
    import moment from 'moment';

    const web3 = new Web3();

    export default {
        name: 'MilestoneList',
        components: {
            MilestoneCard
        },
        props: {
            value: {
                type: Array,
                required: true
            }
        },
        data() {
            return {
                block: false,
                observableData: []
            };
        },
        watch: {
            value: {
                handler(value) {
                    this.block = true;

                    this.observableData = this.clone(value);

                    this.$nextTick(() => this.block = false);
                },
                immediate: true,
                deep: true
            },
            observableData: {
                handler (value) {
                    if (this.block) return;

                    this.$emit('input', this.clone(value));
                },
                deep: true
            },
        },
        methods: {
            clone(data) {
                return data.map(item => new MilestoneModel(item));
            },
            onDelete(value) {
                const index = this.observableData.indexOf(value);

                if (index !== -1) {
                    this.observableData.splice(index, 1);
                }
            },
            onAdd() {
                const now = moment().unix();

                this.observableData.push(new MilestoneModel({
                    name: '',
                    description: '',
                    tranchePercents: null,
                    endDate: now,
                    voteEndDate: now,
                    withdrawalEndDate: now
                }))
            }
        }
    };
</script>
<style lang="scss">
    .MilestoneList {
    }
</style>
