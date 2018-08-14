<template>
    <div class="MilestoneList">
        <MilestoneCard
                v-for="(item, idx) in observableData"
                v-model="observableData[idx]"
                @delete="onDelete"
                :key="idx"
        ></MilestoneCard>
        <button class="btn btn-sm btn-primary btn-block" @click="onAdd">Добавить Milestone</button>
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
                    tranchePercent: '10',
                    endDate: now,
                    voteEndDate: now,
                    withdrawalEndDate: now,
                    wasCreated: false
                }))
            }
        }
    };
</script>
<style lang="scss">
    .MilestoneList {
        .mx-datepicker {
            width: 100%;
            .mx-input-append {
                left: 0;
            }
            .mx-input {
                padding: 6px 10px;
                padding-left: 30px;
            }
            .mx-time-list {
                margin: auto !important;
            }
            .mx-panel-date {
                thead {
                    tr {
                        th {
                            padding: 0;
                            text-align: center;
                            vertical-align: middle;
                        }
                    }
                }
                tbody {
                    tr {
                        td {
                            text-align: center;
                            border: none;
                        }
                    }
                }
            }
        }
    }
</style>
