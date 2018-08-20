<template>
    <div class="MilestoneCard py-4 buefy">
        <div class="row">
            <div class="col-sm-6">
                <b-field
                        id="MilestoneCard__name"
                        :label="$t('MilestonesName')">
                    <b-input
                            :value="viewData.name"
                            @input="onInput('name', $event)"></b-input>
                </b-field>
                <b-field
                        id="MilestoneCard__description"
                        :label="$t('MilestonesDescription')">
                    <b-input
                            type="textarea"
                            :value="viewData.description"
                            @input="onInput('description', $event)"></b-input>
                </b-field>
                <b-field
                        id="MilestoneCard__tranche"
                        :label="$t('MilestonesTranche')">
                    <b-input
                            :value="viewData.tranchePercent"
                            @input="onInput('tranchePercent', $event)"
                            type="number"></b-input>
                </b-field>
                <p>{{ $t('MilestonesRelativeTotal') }}</p>
                <button class="btn btn-sm btn-primary mt-4" @click="onDelete">{{ $t('MilestonesDelete') }}</button>
            </div>
            <div class="col-sm-6">
                <b-field
                        id="MilestoneCard__end"
                        :label="$t('MilestonesDate')">
                    <date-picker v-model="viewData.endDate" type="datetime" @input="onInput('endDate', $event)" lang="en" format="YYYY-MM-DD hh:mm:ss" confirm></date-picker>
                </b-field>
                <b-field
                        id="MilestoneCard__voteEnd"
                        :label="$t('MilestonesDateEndVoting')">
                    <date-picker v-model="viewData.voteEndDate" type="datetime" @input="onInput('voteEndDate', $event)" lang="en" format="YYYY-MM-DD hh:mm:ss" confirm></date-picker>
                </b-field>
                <b-field
                        id="MilestoneCard__withdrawalEnd"
                        :label="$t('MilestonesDateEndWithdrawal')">
                    <date-picker v-model="viewData.withdrawalEndDate" @input="onInput('withdrawalEndDate', $event)" type="datetime" lang="en" format="YYYY-MM-DD hh:mm:ss" confirm></date-picker>
                </b-field>
            </div>
        </div>
    </div>
</template>
<script>
    import { MilestoneModel } from './shared.js';
    import moment from 'moment';
    import DatePicker from 'vue2-datepicker';

    const web3 = new Web3();

    export default {
        name: 'MilestoneCard',
        components: {
            DatePicker
        },
        props: {
            value: {
                type: MilestoneModel,
                required: true
            }
        },
        data() {
            return {
                observableData: {},
                block: false
            };
        },
        computed: {
            viewData() {
                return this.convertToInternal(this.value);
            }
        },
        watch: {
            value: {
                handler(value) {
                    this.block = true;

                    const data = this.convertToInternal(value);
                    this.observableData = data;

                    this.$nextTick(() => this.block = false);
                },
                immediate: true,
                deep: true
            },
            observableData: {
                handler (value) {
                    if (this.block) return;

                    const data = this.convertFromInternal(value);

                    this.$emit('input', data);
                },
                deep: true
            },
        },
        methods: {
            convertToInternal(data) {
                return {
                    ...data,
                    endDate: new Date(data.endDate * 1000),
                    voteEndDate: new Date(data.voteEndDate * 1000),
                    withdrawalEndDate: new Date(data.withdrawalEndDate * 1000)
                };
            },
            convertFromInternal(data) {
                return new MilestoneModel({
                    ...data,
                    endDate: moment(data.endDate).unix(),
                    voteEndDate: moment(data.voteEndDate).unix(),
                    withdrawalEndDate: moment(data.withdrawalEndDate).unix()
                });
            },
            onDelete() {
                this.$emit('delete', this.value);
            },
            onInput(name, value) {
                this.observableData[name] = value;
            }
        }
    };
</script>
<style lang="scss">
    .MilestoneCard {
    }
</style>
