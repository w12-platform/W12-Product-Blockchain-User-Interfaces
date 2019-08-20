<template>

	<section class="container">
		<h2 class="content__heading sb30">{{ $t('OracleSelect') }}</h2>

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

		<div class="field">
			<b-switch v-model="proj_oracles">Project oracles</b-switch>
		</div>

		<div v-if="proj_oracles" class="OracleTable buefy">
			<b-table
					:data="voters_proj_view"
					:mobile-cards="true"
					paginated
					per-page="10"
					pagination-simple
					:selected.sync="selected_oracle"
					detailed>

				<template slot-scope="props">

					<b-table-column :label="$t('OracleTableAddress')" :title="props.row.addr">
						<span class="tag is-success">{{ props.row.addr | shortAddress }}</span>
					</b-table-column>

					<b-table-column :label="$t('OracleTableType')">
						{{ props.row.type }}
					</b-table-column>

					<b-table-column :label="$t('OracleTableStatus')" centered>
						{{ props.row.status }}
					</b-table-column>

				</template>


				<template slot="detail" slot-scope="props">
					<div class="WhiteListTable__detail">
					<span>
						{{props.row.addr}}
					</span>
					</div>
				</template>
			</b-table>

		</div>

		<div v-else class="OracleTable buefy">
			<b-table
					:data="voters"
					:mobile-cards="true"
					paginated
					per-page="10"
					pagination-simple
					:selected.sync="selected_oracle"
					detailed>

				<template slot-scope="props">

					<b-table-column :label="$t('OracleTableAddress')" :title="props.row.addr">
						<span class="tag is-success">{{ props.row.addr | shortAddress }}</span>
					</b-table-column>

					<b-table-column :label="$t('OracleTableType')">
						{{ props.row.type }}
					</b-table-column>

					<b-table-column :label="$t('OracleTableStatus')" centered>
						{{ props.row.status }}
					</b-table-column>

				</template>

				<template slot="detail" slot-scope="props">
					<div class="WhiteListTable__detail">
					<span>
						{{props.row.addr}}
					</span>
					</div>
				</template>
			</b-table>

		</div>

		<button
			v-if="proj_oracles"
			class="btn btn-primary py-2 my-2"
			:disabled="false"
			@click="unlink_oracle">{{
			$t('UnlinkOracleToProject')}}
		</button>

		<button
			v-else
			class="btn btn-primary py-2 my-2"
			:disabled="false"
			@click="link_oracle">{{
			$t('LinkOracleToProject')}}
		</button>

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
	import {ORACLE} from 'abi/OracleBallot.js'
	import config from '@/config.js';

	PAGE_SIZE = 10


	LedgerNS = createNamespacedHelpers("Ledger")
	AccountNS = createNamespacedHelpers("Account")
	WhitelistNS = createNamespacedHelpers("Whitelist")
	LangNS = createNamespacedHelpers("Lang")
	ConfigNS = createNamespacedHelpers("Config")


	log = (val...)->
		console.log val...


	export default
		name: 'OracleSelect'

		components: {ListerSwitch}

		data: ->
			meta: {loading: false}
			voters: []
			page: 0
			voters_proj: {}
			voters_proj_view: []
			page_proj: 0
			selected_oracle: null
			selected_proj: null
			proj_oracles: false


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

			@link_oracle = ->
			@unlink_oracle = ->



			@meta.loading = true;
			if @W12Lister and @W12ListerLastVersion and this.W12Lister.address isnt this.W12ListerLastVersion.address
				@updateLister({W12Lister: this.W12ListerLastVersion});
			else
				await @whitelistFetch()
			@meta.loading = false
			window.dispatchEvent new Event('resize')

			return


		mounted: ->
			@link_oracle = =>
				if login.oracle and @selected_oracle and @selected_proj and not @proj_oracles
					log @selected_oracle.addr
					log @selected_proj.wTokenAddress
					res = await login.oracle.linkOracle @selected_oracle.addr, @selected_proj.wTokenAddress,
						from: login.account

				return


			@unlink_oracle = ->
				if login.oracle
					res = await login.oracle.unlinkOracle @current_addr, @current_info, @current_oracle_type, @current_status,
						from: login.account
				return


			@select_project = (val)=>
				@selected_proj = val
				@test_voters()
				@voters_proj_view = @voters_proj[@selected_proj.wTokenAddress].voters
				return


			@test_voters = ->
				unless @voters_proj[@selected_proj.wTokenAddress]?
					@voters_proj[@selected_proj.wTokenAddress] = {page: 0, voters: []}
				return


			@scan = (scan_flag)->
				if window.login is undefined or window.login.eth is undefined
					window.login = {}
					if typeof(web3) is 'undefined'
						window.addEventListener 'message', ({data}) =>
							if data and data.type and data.type is 'ETHEREUM_PROVIDER_SUCCESS'
								window.login.eth = new Eth 'ethereum'
						window.postMessage {type: 'ETHEREUM_PROVIDER_REQUEST'}, '*'

					else
						window.login.eth = new Eth web3.currentProvider

				if login.eth
					try
						arr = await login.eth.accounts()
						if arr.length > 0
							login.account = arr[0]
						else
							login.account = null
					catch err
						login.account = null
					contract = new EthContract login.eth
					login.oracle = (contract(ORACLE)).at config.currentNetworkContractAddresses.Oracles

				if login.oracle
					res = await login.oracle.getOracles @page
					voters = []
					if res["0"]
						addrs = res['0']
						types = res['1']
						statuses = res['2']
						str = ((if v is true then 'Enabled' else 'Disabled') for v in statuses)
						for addr, i in addrs
							if addr isnt '0x0000000000000000000000000000000000000000'
								voters.push {addr, type: types[i].toString(), status: str[i], index: @page * PAGE_SIZE + i + 1}

						for voter, i in voters
							if @voters[i + @page * PAGE_SIZE]
								if @voters[i + @page * PAGE_SIZE].info isnt voter.info
									@voters[i + @page * PAGE_SIZE].info = voter.info
								if @voters[i + @page * PAGE_SIZE].type isnt voter.type
									@voters[i + @page * PAGE_SIZE].type = voter.type
								if @voters[i + @page * PAGE_SIZE].status isnt voter.status
									@voters[i + @page * PAGE_SIZE].status = voter.status
							else
								@voters.push voter

						if addr isnt '0x0000000000000000000000000000000000000000'
							@page = @page + 1
						else
							@page = 0


					if @selected_proj and @proj_oracles

						@test_voters()

						proj_key = @selected_proj.wTokenAddress

						res = await login.oracle.getProjOracles proj_key, @voters_proj[proj_key].page
						voters_proj = []
						if res["0"]
							addrs = res['0']
							types = res['1']
							statuses = res['2']
							str = ((if v is true then 'Enabled' else 'Disabled') for v in statuses)
							for addr, i in addrs
								if addr isnt '0x0000000000000000000000000000000000000000'
									voters_proj.push {addr, type: types[i].toString(), status: str[i], index: @page_proj * PAGE_SIZE + i + 1}

							for voter, i in voters_proj
								if @voters_proj[proj_key].voters[i + @page * PAGE_SIZE]
									if @voters_proj[proj_key].voters[i + @page * PAGE_SIZE].info isnt voter.info
										@voters_proj[proj_key].voters[i + @page * PAGE_SIZE].info = voter.info
									if @voters_proj[proj_key].voters[i + @page * PAGE_SIZE].type isnt voter.type
										@voters_proj[proj_key].voters[i + @page * PAGE_SIZE].type = voter.type
									if @voters_proj[proj_key].voters[i + @page * PAGE_SIZE].status isnt voter.status
										@voters_proj[proj_key].voters[i + @page * PAGE_SIZE].status = voter.status
								else
									@voters_proj[proj_key].voters.push voter

							if addr isnt '0x0000000000000000000000000000000000000000'
								@voters_proj[proj_key].page++
							else
								@voters_proj[proj_key].page = 0

				if scan_flag
					setTimeout =>
						@scan scan_flag
					, 10000

					return

			@scan true
			return


</script>




