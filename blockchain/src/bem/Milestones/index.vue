<template>
    <div class="Milestones buefy" v-if="currentProject && isCrowdsaleInited">
        <h2>{{ $t('Milestones') }}</h2>

        <b-collapse class="card">
            <div class="card-content" v-if="tokenCrowdSaleMilestones.length">
                <div class="content">
                    <div v-for="(item, idx) in tokenCrowdSaleMilestones">
                        <span class="Milestones__stageTitle">{{ $t('MilestoneTitle') }} #{{ idx+1 }}</span>
                        <MilestoneCard
                                v-model="tokenCrowdSaleMilestones[idx]"
                                @delete="onDelete"
                                :key="idx"
                        ></MilestoneCard>
                    </div>
                </div>
            </div>
            <footer class="card-footer">
                <a class="card-footer-item" @click="addStage">{{ $t('MilestonesAdd') }}</a>
                <a class="card-footer-item" @click="saveMilestones" v-if="tokenCrowdSaleMilestones.length">{{
                    $t('MilestonesSend') }}</a>
            </footer>

            <b-loading :is-full-page="false" :active.sync="saveMilestonesLoading" :can-cancel="true"></b-loading>
        </b-collapse>
    </div>
</template>

<script>
    import './default.scss';
    import MilestoneCard from 'bem/Milestones/MilestoneCard.vue';
    import {MilestoneModel} from 'bem/Milestones/shared.js';
    import Connector from 'lib/Blockchain/DefaultConnector.js';
    import {UPDATE_TX} from "store/modules/Transactions.js";
    import {waitTransactionReceipt} from 'lib/utils.js';

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
        },
        methods: {
            ...LedgerNS.mapActions({
                ledgerFetch: 'fetch',
            }),

            onDelete(value) {
                const index = this.tokenCrowdSaleMilestones.indexOf(value);
                if (index !== -1) {
                    this.tokenCrowdSaleMilestones.splice(index, 1);
                }
            },
            addStage() {
                const now = moment().unix();

                this.tokenCrowdSaleMilestones.push(new MilestoneModel({
                    name: '',
                    description: '',
                    tranchePercent: '10',
                    endDate: now,
                    voteEndDate: now,
                    withdrawalEndDate: now,
                    wasCreated: false
                }))
            },
            async saveMilestones() {
                this.saveMilestonesLoading = true;
                try {
                    const {W12CrowdsaleFactory} = await this.ledgerFetch();
                    const W12Crowdsale = W12CrowdsaleFactory.at(this.currentProject.crowdsaleAddress);
                    const tx = await W12Crowdsale.setMilestones(this.tokenCrowdSaleMilestones);
                    const connectedWeb3 = (await Connector.connect()).web3;
                    await waitTransactionReceipt(tx, connectedWeb3);
                    this.tokenCrowdsaleMilestones.forEach(stage => stage.wasCreated = true);
                } catch (e) {
                    console.log(e.message);
                    this.error = e.message;
                }
                this.saveMilestonesLoading = false;
            },
        },
        async created() {

        },
    };

</script>
