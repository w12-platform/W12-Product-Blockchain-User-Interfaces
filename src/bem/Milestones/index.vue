<template>
    <div class="Milestones buefy" v-if="currentProject && isCrowdsaleInited && isStagesSave">
        <h2>{{ $t('Milestones') }}</h2>

        <div class="pm-2" v-if="isPendingTx">
            <p class="py-2">{{ $t('WaitingConfirm') }}:</p>
            <b-tag class="py-2">{{isPendingTx.hash}}</b-tag>
        </div>
        <div class="pm-2" v-if="isErrorTx">
            <p class="py-2">{{ $t('TransactionFailed') }}:</p>
            <b-tag class="py-2">{{isErrorTx.hash}}</b-tag>
            <div class="pt-2 text-left">
                <button class="btn btn-primary btn-sm" @click="TransactionsRetry(isErrorTx)">{{ $t('ToRetry') }}</button>
            </div>
        </div>
        <div class="card" v-if="!isPendingTx && !isErrorTx">
            <div class="card-content" v-if="tokenCrowdSaleMilestones.length">
                <div class="">
                    <div v-for="(item, idx) in tokenCrowdSaleMilestones">
                        <span class="Milestones__stageTitle">{{ $t('MilestoneTitle') }} #{{ idx }}</span>
                        <MilestoneCard
                                v-model="tokenCrowdSaleMilestones[idx]"
                                :stageIndex="idx"
                                @delete="onDelete"
                                :key="idx"
                        ></MilestoneCard>
                    </div>
                </div>
            </div>

            <b-notification class="ProjectStages__errorStage" v-if="tokenCrowdSaleMilestones.length && !isOneHundredPercent" type="is-danger" has-icon>
                {{ $t('MilestoneTitleErrorNotOneHundredPercent') }}
            </b-notification>

            <b-notification class="ProjectStages__errorStage" v-if="error" @close="error = false" type="is-danger" has-icon>
                {{ $t(error) }}
            </b-notification>

            <footer class="card-footer" v-if="!isStartCrowdSale">
                <a class="card-footer-item" @click="addStage">{{ $t('MilestonesAdd') }}</a>
                <a class="card-footer-item" @click="saveMilestones" v-if="saveDisable">{{
                    $t('MilestonesSend') }}</a>
            </footer>

            <b-loading :is-full-page="false" :active.sync="saveMilestonesLoading"></b-loading>
        </div>
    </div>
</template>

<script>
    import './default.scss';
    import MilestoneCard from 'bem/Milestones/MilestoneCard.vue';
    import {MilestoneModel} from 'bem/Milestones/shared.js';
    import Connector from 'lib/Blockchain/DefaultConnector.js';
    import {UPDATE_TX} from "store/modules/Transactions.js";
    import {waitTransactionReceipt, errorMessageSubstitution} from 'lib/utils.js';

    import {createNamespacedHelpers} from "vuex";

    const ConfigNS = createNamespacedHelpers('Config');
    const ProjectNS = createNamespacedHelpers("Project");
    const LedgerNS = createNamespacedHelpers("Ledger");
    const AccountNS = createNamespacedHelpers("Account");
    const TransactionsNS = createNamespacedHelpers("Transactions");

    export default {
        name: 'Milestones',
        template: '#MilestonesTemplate',
        components: {
            MilestoneCard
        },
        data() {
            return {
                saveMilestonesLoading: false,
                block: false,
                tokenCrowdSaleMilestones: [],
                error: false,
            };
        },
        filters: {},
        watch: {
            'tokenCrowdSaleMilestonesNS': {
                handler(value) {
                    this.tokenCrowdSaleMilestones = value;
                },
            },
        },
        computed: {
            ...ProjectNS.mapState({
                currentProject: "currentProject",
                ProjectMeta: "meta",
            }),
            ...ProjectNS.mapGetters([
                'hasAllowance',
                'hasPlacedWTokenAddress',
                'tokensAmountThatApprovedToPlaceByTokenOwnerToNumber',
                'ownerBalance',
                'isCrowdsaleInited',
                'tokenCrowdSaleMilestonesNS',
                'isStartCrowdSale',
                'endDateCrowdSale',
            ]),
            ...AccountNS.mapState({
                currentAccount: "currentAccount",
                accountMeta: "meta",
            }),
            ...ConfigNS.mapState({
                W12Lister: "W12Lister"
            }),
            ...TransactionsNS.mapState({
                TransactionsList: "list"
            }),
            isStagesSave(){
                if(this.currentProject
                    && this.currentProject.crowdSaleInformation
                    && this.currentProject.crowdSaleInformation.tokenCrowdSaleStages
                    && this.currentProject.crowdSaleInformation.tokenCrowdSaleStages.length
                ){
                    return this.currentProject.crowdSaleInformation.tokenCrowdSaleStages.filter((stage)=>Boolean(stage.wasCreated)).length;
                }
                return false;
            },
            isOneHundredPercent(){
                if(this.tokenCrowdSaleMilestones
                   && this.tokenCrowdSaleMilestones.length){
                    let percent = 0;
                    this.tokenCrowdSaleMilestones.forEach((ml)=>{
                        percent = percent + parseFloat(ml.tranchePercent);
                    });
                    return percent === 100;
                }
                return false;
            },
            isEmpty(){
                if(this.tokenCrowdSaleMilestones && this.tokenCrowdSaleMilestones.length){
                    return this.tokenCrowdSaleMilestones.length === this.tokenCrowdSaleMilestones.filter(
                        (ml)=> ml.description && ml.endDate && ml.name && ml.tranchePercent && ml.withdrawalEndDate
                    ).length;
                }
                return false;
            },
            saveDisable(){
                return this.isOneHundredPercent && this.tokenCrowdSaleMilestones.length && this.isEmpty;
            },
            isErrorTx() {
                return this.TransactionsList && this.TransactionsList.length
                    ? this.TransactionsList.find((tr) => {
                        return tr.token
                        && tr.name
                        && tr.hash
                        && tr.status
                        && tr.token === this.currentProject.tokenAddress
                        && tr.name === "saveMilestones"
                        && tr.status === "error"
                            ? tr
                            : false
                    })
                    : false;
            },
            isPendingTx() {
                return this.TransactionsList && this.TransactionsList.length
                    ? this.TransactionsList.find((tr) => {
                        return tr.token
                        && tr.name
                        && tr.hash
                        && tr.status
                        && tr.token === this.currentProject.tokenAddress
                        && tr.name === "saveMilestones"
                        && tr.status === "pending"
                            ? tr
                            : false
                    })
                    : false;
            }
        },
        methods: {
            ...LedgerNS.mapActions({
                ledgerFetch: 'fetch',
            }),
            ...TransactionsNS.mapActions({
                TransactionsRetry: "retry"
            }),
            onDelete(value) {
                const index = this.tokenCrowdSaleMilestones.indexOf(value);
                if (index !== -1) {
                    this.tokenCrowdSaleMilestones.splice(index, 1);
                }
            },
            addStage() {
                this.tokenCrowdSaleMilestones.push(new MilestoneModel({
                    name: '',
                    description: '',
                    tranchePercent: '100',
                    wasCreated: false
                }))
            },
            async saveMilestones() {
                this.saveMilestonesLoading = true;
                try {
                    const {W12CrowdsaleFactory} = await this.ledgerFetch(this.currentProject.version);
                    const W12Crowdsale = W12CrowdsaleFactory.at(this.currentProject.tokenCrowdsaleAddress);
                    const tx = await W12Crowdsale.setMilestones(this.tokenCrowdSaleMilestones);
                    this.$store.commit(`Transactions/${UPDATE_TX}`, {
                        token: this.currentProject.tokenAddress,
                        name: "saveMilestones",
                        hash: tx,
                        status: "pending"
                    });
                    const connectedWeb3 = (await Connector.connect()).web3;
                    await waitTransactionReceipt(tx, connectedWeb3);
                    this.tokenCrowdSaleMilestones.forEach(stage => stage.wasCreated = true);
                } catch (e) {
                    this.error = errorMessageSubstitution(e);
                }
                this.saveMilestonesLoading = false;
            },
        },
        async created() {

        },
    };

</script>
