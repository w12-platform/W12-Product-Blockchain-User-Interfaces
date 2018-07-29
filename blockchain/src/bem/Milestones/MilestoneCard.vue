<template>
    <div class="MilestoneCard py-4 buefy">
        <div class="row">
            <div class="col-sm-6">
                <b-field
                        id="MilestoneCard__name"
                        label="Название milestone">
                    <b-input
                            :value="viewData.name"
                            @input="onInput('name', $event)"></b-input>
                </b-field>
                <b-field
                        id="MilestoneCard__description"
                        label="Описание milestone">
                    <b-input
                            type="textarea"
                            :value="viewData.description"
                            @input="onInput('description', $event)"></b-input>
                </b-field>
                <b-field
                        id="MilestoneCard__tranche"
                        label="Количество средств, выделяемых проекту по окончании milestone в случае позитивного голосования">
                    <b-input
                            :value="viewData.tranchePercents"
                            @input="onInput('tranchePercents', $event)"
                            type="number"></b-input>
                </b-field>
                <p>% относительно общего количества</p>
                <button class="btn btn-sm btn-primary mt-4" @click="onDelete">Удалить Milestone</button>
            </div>
            <div class="col-sm-6">
                <b-field
                        id="MilestoneCard__end"
                        label="Дата достижение milestone">
                    <b-datepicker
                            :value="viewData.endDate"
                            @input="onInput('endDate', $event)"
                            placeholder="Click to select..."
                            icon="calendar-today">
                    </b-datepicker>
                </b-field>
                <b-field
                        id="MilestoneCard__voteEnd"
                        label="Дата окончания голосования о достижении milestone">
                    <b-datepicker
                            :value="viewData.voteEndDate"
                            @input="onInput('voteEndDate', $event)"
                            placeholder="Click to select..."
                            icon="calendar-today">
                    </b-datepicker>
                </b-field>
                <b-field
                        id="MilestoneCard__withdrawalEnd"
                        label="Дата окончания вывода средств в случае негативного голосования">
                    <b-datepicker
                            :value="viewData.withdrawalEndDate"
                            @input="onInput('withdrawalEndDate', $event)"
                            placeholder="Click to select..."
                            icon="calendar-today">
                    </b-datepicker>
                </b-field>
            </div>
        </div>
    </div>
</template>
<script>
    import { MilestoneModel } from './shared.js';
    import moment from 'moment';

    const web3 = new Web3();

    export default {
        name: 'MilestoneCard',
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
