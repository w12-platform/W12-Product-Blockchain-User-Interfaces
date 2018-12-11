<template>
    <div class="ConfigDashboad buefy">
        <section class="container">
            <h2>{{ $t('ConfigDashboardTitle') }}</h2>
            <div>
                <div class="form-group">
                    <label class="mt-4">W12ListerList</label>
                    <div class="ConfigDashboad__W12ListerList row mb-2" v-for="(elem, idx) in list" :key="idx">
                        <div class="col-md-9">
                            <input type="text"
                                   class="form-control"
                                   @keyup.enter="saveConfig"
                                   v-model="elem.address">
                        </div>
                        <div class="col-md-2 my-1">
                            <span v-if="elem.version">v: {{ elem.version }}</span>
                        </div>
                        <div class="col-md-1">
                            <a class="delete is-large" @click="deleteElemList(idx)">удалить</a>
                        </div>
                    </div>
                </div>
                <div>
                    <button class="btn btn-primary" @click="addList">Add list</button>
                    <button class="btn btn-primary" @click="saveW12ListerList">{{ $t('ConfigDashboardSave') }}</button>
                </div>

                <div class="form-group">
                    <label class="mt-4">FactoryTokens<span class="ConfigDashboad__address" v-if="FactoryTokens.address"> - {{ FactoryTokens.address }}</span></label>
                    <input
                            type="text"
                            class="form-control"
                            @keyup.enter="saveConfig"
                            v-model="factory">
                </div>
                <div>
                    <button class="btn btn-primary" @click="saveFactory">{{ $t('ConfigDashboardSave') }}</button>
                </div>

                <div class="form-group">
                    <label class="mt-4">Rates<span class="ConfigDashboad__address" v-if="Rates.address"> - {{ Rates.address }}</span></label>
                    <input
                            type="text"
                            class="form-control"
                            @keyup.enter="saveRates"
                            v-model="rates">
                </div>
                <div>
                    <button class="btn btn-primary" @click="saveFactory">{{ $t('ConfigDashboardSave') }}</button>
                </div>
            </div>
            <b-loading :is-full-page="false" :active.sync="loading"></b-loading>
        </section>
    </div>
</template>

<script>
    import "./default.scss";
    import { createNamespacedHelpers } from "vuex";
    import { CONFIG_UPDATE } from "store/modules/Config.js";
    import { decode } from '@redtea/semint';
    import Web3 from 'web3';

    const ConfigNS = createNamespacedHelpers('Config');
    const TokensListNS = createNamespacedHelpers('TokensList');
    const FactoryNS = createNamespacedHelpers('Factory');
    const LedgerNS = createNamespacedHelpers("Ledger");

    const web3 = new Web3();
    const BigNumber = web3.BigNumber;

    export default {
        name: 'ConfigDashboard',
        template: '#ConfigDashboardTemplate',
        data () {
            return {
                loading: false,
                factory: null,
                rates: null,
                list: [{
                    address: "",
                    version: ""
                }]
            };
        },
        watch: {
            'W12ListerList': {
                handler: 'handleW12ListerListChange',
                immediate: true
            },
        },
        computed: {
            ...ConfigNS.mapState({
                W12Lister: "W12Lister",
                FactoryTokens: "FactoryTokens",
                W12ListerList: "W12ListerList",
                Rates: "Rates",
                Default: "Default"
            }),
        },
        methods: {
            ...TokensListNS.mapActions({
                reset: 'reset'
            }),
            ...FactoryNS.mapActions({
                FactoryReset: 'reset'
            }),
            ...LedgerNS.mapActions({
                ledgerFetch: "fetch"
            }),
            async saveW12ListerList () {
                this.loading = true;
                const ListSave = this.list.map(async(item) => {
                    const {W12ListerFactory} = await this.ledgerFetch(this.Default.version);
                    const W12Lister = W12ListerFactory.at(item.address);
                    item.version = decode(parseInt(await new BigNumber(await W12Lister.methods.version()).toString()), 4);
                    return item;
                });
                Promise.all(ListSave).then((completed) => {
                    this.$store.commit(`Config/${CONFIG_UPDATE}`, {"W12ListerList": completed});
                });
                this.loading = false;
            },
            saveFactory () {
                this.$store.commit(`Config/${CONFIG_UPDATE}`, {FactoryTokens: { address: this.factory }});
            },
            saveRates () {
                this.$store.commit(`Config/${CONFIG_UPDATE}`, {Rates: { address: this.rates }});
            },
            addList(){
                this.list.push({
                    address: "",
                    version: ""
                });
            },
            deleteElemList(id) {
                this.list.splice(id, 1);
            },
            async handleW12ListerListChange(value) {
                this.list = value;
            },
        },
    };

</script>
