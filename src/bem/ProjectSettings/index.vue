<template>

	<section class="container">
		<h2 class="content__heading sb30">{{ $t('ProjectSettings') }}</h2>

		<ListerSwitch></ListerSwitch>

		<b-notification class="AdminDashboard__error" v-if="isError && !isLoading" type="is-danger" :closable="false"
										has-icon>
			<span v-if="ledgerMeta.loadingError">{{ $t(ledgerMeta.loadingError) }}</span>
			<span v-if="tokensListMeta.loadingError">{{ $t(tokensListMeta.loadingError) }}</span>
			<span v-if="accountMeta.loadingError">{{ $t(accountMeta.loadingError)  }}</span>
		</b-notification>

		<b-notification v-if="isLoading && !isError" :closable="false" class="AdminDashboard__loader">
			<p v-html="$t('InvestorDashboardLoadLedger')"></p>

			<b-loading :is-full-page="false" :active="isLoading"></b-loading>
		</b-notification>

		<div v-if="!isLoading && this.currentAccount">
			<WhiteListTable v-on:selected="select_project" :selectable="true" :is="WhiteListTableVersion"></WhiteListTable>
		</div>

		<div class="form-group sb30">
			<label>{{ $t('ProjectName') }}</label>
			<b-field>
				<input v-model="current_addr" type="text" class="form-control"/>
			</b-field>
		</div>

		<p>{{$t('ProjectSelectType')}}</p>

		<select class="sb2" v-model="current_oracle_type" @input="input55">
			<option :value="0">0</option>
			<option :value="1">1</option>
		</select>

		<div>
			<button
				class="btn sb100 btn-primary py-2 my-2"
				:disabled="false"
				@click="set_project">
				{{$t('OracleSubmit')}}
			</button>
		</div>


	</section>

</template>


<script lang="coffee">


	import './default.scss'
	import {resolveAbiVersion} from '@/lib/Blockchain/ContractsLedger'
	import ListerSwitch from 'bem/ListerSwitch'
	import Steps from "bem/Steps"
	import WhiteListForm from "bem/WhiteListForm"

	import {createNamespacedHelpers} from "vuex"
	import {CONFIG_UPDATE} from 'store/modules/Config'

	import Eth from 'ethjs'
	import EthContract from 'ethjs-contract'
	import {ORACLE, ORACLE_ADDR} from 'abi/OracleBallot.js'

	PAGE_SIZE = 10


	LedgerNS = createNamespacedHelpers("Ledger")
	AccountNS = createNamespacedHelpers("Account")
	WhitelistNS = createNamespacedHelpers("Whitelist")
	LangNS = createNamespacedHelpers("Lang")
	ConfigNS = createNamespacedHelpers("Config")


	log = (val...)->
		console.log val...


	export default
		components: {ListerSwitch}

		data: ->
			meta: {loading: false}
			voters: []
			page: 0
			page_proj: 0
			selected_proj: null
			current_addr: ''
			current_oracle_type: '0'
			set_project: ->



		filters:
			shortAddress: (value)->
				length = value.length
				value.slice(0, 8) + " ... " + value.slice(length - 8, length)

			percentFractional: (value)->
				value / 100


		computed: `
		{
			...LedgerNS.mapState({ledgerMeta: 'meta'}),
			...WhitelistNS.mapState({tokensListMeta: 'meta', tokensList: "list"}),
			...AccountNS.mapState({currentAccount: "currentAccount", accountMeta: "meta"}),
			...LangNS.mapState({langMeta: 'meta'}),
			...ConfigNS.mapState({W12Lister: 'W12Lister', W12ListerList: 'W12ListerList'}),
			...ConfigNS.mapGetters({W12ListerLastVersion: 'W12ListerLastVersion'}),

			isLoading()
			{
				return this.tokensListMeta.loading && this.meta.loading;
			},

			isError()
			{
				return this.ledgerMeta.loadingError || this.tokensListMeta.loadingError || this.accountMeta.loadingError;
			},

			WhiteListTableVersion()
			{
				// const v = resolveAbiVersion(this.W12Lister.version);
				return () => import("bem/WhiteListTable/" + '0.31.1');
			},

			nextStepBlocked()
			{
				return this.isPendingTx ? this.$t('StepsBlockedTx') : false;
			}

		}`

		watch:
			'project_oracles': (to, from)->
				log to
				return


		methods: `
		{
			...
				WhitelistNS.mapActions({
					whitelistFetch: "fetch",
				}),
			...
				AccountNS.mapActions({
					watchCurrentAccount: 'watch',
				}),
			...
				ConfigNS.mapMutations({
					updateLister: CONFIG_UPDATE,
				}),
				async handleW12ListerChange()
				{
					await this.whitelistFetch();
				}
			,
				input55()
				{

				}
			,
			}`

		created: ->

#			@meta.loading = true;
#			if @W12Lister and @W12ListerLastVersion and this.W12Lister.address isnt this.W12ListerLastVersion.address
#				@updateLister({W12Lister: this.W12ListerLastVersion});
#			else
#				await @whitelistFetch()
#			@meta.loading = false
#			window.dispatchEvent new Event('resize')


			return


		mounted: ->
			return



</script>
