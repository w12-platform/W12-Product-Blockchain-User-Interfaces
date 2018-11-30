<template>
    <div class="MilestoneCard py-4 buefy">
        <div class="row justify-content-between">
            <div class="col-sm py-2">
                <label for="MilestoneCard__name">{{ $t('MilestonesName') }}</label>
                <b-field id="MilestoneCard__name">
                    <b-input
                            :disabled="isStartCrowdSale"
                            type="text"
                            :value="viewData.name"
                            @input="onInput('name', $event)"></b-input>
                </b-field>
                <label for="MilestoneCard__description">{{ $t('MilestonesDescription') }}</label>
                <b-field id="MilestoneCard__description">
                    <b-input
                            :disabled="isStartCrowdSale"
                            type="textarea"
                            :value="viewData.description"
                            @input="onInput('description', $event)"></b-input>
                </b-field>
                <label for="MilestoneCard__tranche">{{ $t('MilestonesTranche') }}</label>
                <b-field id="MilestoneCard__tranche">
                    <b-input
                            :disabled="isStartCrowdSale"
                            :value="viewData.tranchePercent"
                            @input="onInput('tranchePercent', $event)"
                            type="number"></b-input>
                </b-field>
                <p>{{ $t('MilestonesRelativeTotal') }}</p>

            </div>
            <div class="col-sm py-2">
                <label for="MilestoneCard__end">{{ $t('MilestonesDate') }}</label>
                <b-field id="MilestoneCard__end">
                    <date-picker
                            :not-before="getNotBeforeEndDate(stageIndex)"
                            :not-after="getNotAfterEndDate(stageIndex)"
                            v-model="viewData.endDate"
                            type="datetime"
                            @input="onInput('endDate', $event)"
                            :disabled="isStartCrowdSale"
                            :lang="translationsDef"
                            format="YYYY-MM-DD HH:mm"
                            confirm
                            :time-picker-options="{ start: '00:00', step: '00:10', end: '23:50'}"
                    ></date-picker>
                </b-field>
                <!--<label for="MilestoneCard__voteEnd">{{ $t('MilestonesDateEndVoting') }}</label>-->
                <!--<b-field id="MilestoneCard__voteEnd">-->
                <!--<date-picker-->
                <!--v-model="viewData.voteEndDate"-->
                <!--type="datetime"-->
                <!--@input="onInput('voteEndDate', $event)"-->
                <!--:disabled="isStartCrowdSale"-->
                <!--:lang="translationsDef"-->
                <!--format="YYYY-MM-DD HH:mm"-->
                <!--confirm-->
                <!--&gt;</date-picker>-->
                <!--</b-field>-->
                <label v-if="stageIndex > 0" for="MilestoneCard__withdrawalEnd">{{ $t('MilestonesDateEndWithdrawal') }}</label>
                <b-field  v-if="stageIndex > 0" id="MilestoneCard__withdrawalEnd">
                    <date-picker
                            :not-before="getNotBeforeWithdrawalEndDate(stageIndex)"
                            :not-after="getNotAfterWithdrawalEndDate(stageIndex)"
                            v-model="viewData.withdrawalEndDate"
                            @input="onInput('withdrawalEndDate', $event)"
                            type="datetime"
                            :disabled="isStartCrowdSale"
                            :lang="translationsDef"
                            format="YYYY-MM-DD HH:mm"
                            confirm
                            :time-picker-options="{ start: '00:00', step: '00:10', end: '23:50'}"
                    ></date-picker>
                </b-field>

                <button :disabled="isStartCrowdSale" class="btn btn-sm btn-primary mt-4" @click="onDelete">{{
                    $t('MilestonesDelete') }}
                </button>
            </div>
        </div>
    </div>
</template>
<script>
    import {MilestoneModel} from './shared.js';
    import moment from 'moment';
    import DatePicker from 'vue2-datepicker';
    import {createNamespacedHelpers} from "vuex";
    import Web3 from 'web3';

    const ProjectNS = createNamespacedHelpers("Project");
    const LangNS = createNamespacedHelpers("Lang");

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
            },
            stageIndex: {
                required: true
            }
        },
        data() {
            return {
                observableData: {},
                block: false,
            };
        },
        computed: {
            viewData() {
                return this.convertToInternal(this.value);
            },
            ...ProjectNS.mapGetters([
                'isStartCrowdSale',
                'endDateCrowdSale',
                'tokenCrowdSaleMilestonesNS'
            ]),
            ...LangNS.mapState({
                translationsDef: 'current'
            })

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
                handler(value) {
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
                this.observableData['withdrawalEndDate'] = this.stageIndex === 0 && name === "endDate"
                    ? new Date(moment(value).add(2, 'second').unix() * 1000)
                    : this.observableData['withdrawalEndDate'];
            },
            getNotBeforeEndDate(stageIndex) {
                if (this.tokenCrowdSaleMilestonesNS[stageIndex - 1]) {
                    for (let i = stageIndex - 1; i >= 0; i--) {
                        if (this.tokenCrowdSaleMilestonesNS[i]) {
                            if (this.tokenCrowdSaleMilestonesNS[i].withdrawalEndDate  * 1000) {
                                return moment(this.tokenCrowdSaleMilestonesNS[i].withdrawalEndDate  * 1000).add(10, 'm').toDate();
                            }
                            if (this.tokenCrowdSaleMilestonesNS[i].endDate) {
                                return moment(this.tokenCrowdSaleMilestonesNS[i].endDate  * 1000).add(10, 'm').toDate();
                            }
                        }
                    }
                }
                return this.endDateCrowdSale ? moment(this.endDateCrowdSale).add(10, 'm').toDate() : moment().add(10, 'm').toDate();
            },
            getNotAfterEndDate(stageIndex) {
                if (this.tokenCrowdSaleMilestonesNS[stageIndex].withdrawalEndDate && stageIndex !== 0) {
                    return moment(this.tokenCrowdSaleMilestonesNS[stageIndex].withdrawalEndDate * 1000).subtract(10, 'm').toDate();
                } else {
                    for (let i = stageIndex + 1; i <= this.tokenCrowdSaleMilestonesNS.length; i++) {
                        if (this.tokenCrowdSaleMilestonesNS[i]) {
                            if (this.tokenCrowdSaleMilestonesNS[i].endDate) {
                                return moment(this.tokenCrowdSaleMilestonesNS[i].endDate * 1000).subtract(10, 'm').toDate();
                            }
                            if (this.tokenCrowdSaleMilestonesNS[i].withdrawalEndDate && stageIndex !== 0) {
                                return moment(this.tokenCrowdSaleMilestonesNS[i].withdrawalEndDate  * 1000).subtract(10, 'm').toDate();
                            }
                        }
                    }
                    return false;
                }
            },
            getNotBeforeWithdrawalEndDate(stageIndex) {
                if (this.tokenCrowdSaleMilestonesNS[stageIndex].endDate) {
                    return moment(this.tokenCrowdSaleMilestonesNS[stageIndex].endDate  * 1000).add(10, 'm').toDate();
                } else {
                    for (let i = stageIndex - 1; i >= 0; i--) {
                        if (this.tokenCrowdSaleMilestonesNS[i]) {
                            if (this.tokenCrowdSaleMilestonesNS[i].withdrawalEndDate) {
                                return moment(this.tokenCrowdSaleMilestonesNS[i].withdrawalEndDate * 1000).add(10, 'm').toDate();
                            }
                            if (this.tokenCrowdSaleMilestonesNS[i].endDate) {
                                return moment(this.tokenCrowdSaleMilestonesNS[i].endDate * 1000).add(10, 'm').toDate();
                            }
                        }
                    }
                    return this.endDateCrowdSale ? moment(this.endDateCrowdSale).add(10, 'm').toDate():moment().add(10, 'm').toDate();
                }
            },
            getNotAfterWithdrawalEndDate(stageIndex) {
                if (this.tokenCrowdSaleMilestonesNS[stageIndex + 1]) {
                    for (let i = stageIndex + 1; i <= this.tokenCrowdSaleMilestonesNS.length; i++) {
                        if (this.tokenCrowdSaleMilestonesNS[i]) {
                            if (this.tokenCrowdSaleMilestonesNS[i].endDate) {
                                return moment(this.tokenCrowdSaleMilestonesNS[i].endDate * 1000).subtract(10, 'm').toDate();
                            }
                            if (this.tokenCrowdSaleMilestonesNS[i].withdrawalEndDate) {
                                return moment(this.tokenCrowdSaleMilestonesNS[i].withdrawalEndDate * 1000).subtract(10, 'm').toDate();
                            }
                        }
                    }
                }
                return false;
            },
        }
    };
</script>
