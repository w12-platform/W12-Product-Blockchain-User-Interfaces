<template>
	<div class="InvestorDashboard buefy" v-if="!langMeta.loading">
		<section class="container">
			<h2>{{ $t('VotingDashboard') }}</h2>

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

<!--		<OracleRoadMap></OracleRoadMap>-->

		</section>
	</div>
</template>


<script lang="coffee">


	import './default.scss'
	import {resolveAbiVersion} from '@/lib/Blockchain/ContractsLedger'
	import ListerSwitch from 'bem/ListerSwitch'
	import Steps from "bem/Steps"
	import WhiteListForm from "bem/WhiteListForm"
	import OracleRoadMap from 'bem/OracleRoadMap'

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
	TokensListNS = createNamespacedHelpers("TokensList")


	log = (val...)->
		console.log val...



	```
	var TOKEN = { "version": "0.23.2", "listerAddress": "0xdb1278fbc18d0188ba237cf5e44bc2d930223d45", "index": 22, "ledgerAddress": "0xe00058bb67b6a65c04a6dd47ef38ce9e4ea6692f", "wTokenAddress": "0x840316f0e047f2a6942a5fb5079faefeeffc5107", "name": "tv1", "symbol": "TV1W", "tokenAddress": "0x3515809255ff273a61e546b2e50e01417e45277c", "decimals": "18", "feePercent": "0", "feeETHPercent": "0", "WTokenSaleFeePercent": "0", "trancheFeePercent": "0", "crowdsaleAddress": "0x2bf0becf7793f3b51fbc2c040f2003141a19da92", "tokensForSaleAmount": "1e+22", "wTokensIssuedAmount": "1e+22", "tokenOwners": [ "0xd9d44935b19ce0bd828498be1bd99e5453f5061e" ] };
		```

	export default

		name: 'OracleVote'

		components: {ListerSwitch, OracleRoadMap},

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
			current_token: null
			milestone: 0


		filters:
			shortAddress: (value)->
				length = value.length
				value.slice(0, 8) + " ... " + value.slice(length - 8, length)

			percentFractional: (value)->
				value / 100

		computed:`
		{
			...LedgerNS.mapState({ledgerMeta: 'meta'}),
			...WhitelistNS.mapState({tokensListMeta: 'meta', tokensList: "list"}),
			...AccountNS.mapState({currentAccount: "currentAccount", accountMeta: "meta"}),
			...LangNS.mapState({langMeta: 'meta'}),
			...ConfigNS.mapState({W12Lister: 'W12Lister', W12ListerList: 'W12ListerList'}),
			...ConfigNS.mapGetters({W12ListerLastVersion: 'W12ListerLastVersion'}),
			...TokensListNS.mapState({tokensListMeta: 'meta', tokensList: 'list', currentToken: 'currentToken'}),

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
				console.log('asdasdasd');
				// const v = resolveAbiVersion(this.W12Lister.version);
				return () => import("bem/WhiteListTable/" + '0.31.1');
			},

			nextStepBlocked()
			{
				return this.isPendingTx ? this.$t('StepsBlockedTx') : false;
			}

		},

		methods:
		{
			...TokensListNS.mapActions({fetch_full: "update"}),
			...WhitelistNS.mapActions({whitelistFetch: "fetch"}),
			...AccountNS.mapActions({watchCurrentAccount: 'watch'}),
			...ConfigNS.mapMutations({updateLister: CONFIG_UPDATE}),

			async handleW12ListerChange()
			{
				await this.whitelistFetch();
			}
		}`


		created: ->
			@meta.loading = true;
			if @W12Lister and @W12ListerLastVersion and this.W12Lister.address isnt this.W12ListerLastVersion.address
				@updateLister({W12Lister: this.W12ListerLastVersion});
			else
				await @whitelistFetch()
			@meta.loading = false
			window.dispatchEvent new Event('resize')

			return

		mounted: ->

			log 'mount'

			@select_project = (val)=>
				@selected_proj = val

#				@test_voters()
#				@voters_proj_view = @voters_proj[@selected_proj.wTokenAddress].voters

				await @fetch_full val

				log @currentToken

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
					login.oracle = (contract(ORACLE)).at ORACLE_ADDR

				if login.oracle and @selected_proj
					if @currentToken.crowdSaleInformation and @currentToken.crowdSaleInformation.milestones
						if @currentToken.crowdSaleInformation.milestones.length > 0
							res = await login.oracle.get_vote_result @selected_proj.crowdsaleAddress, @milestone
							@currentToken.crowdSaleInformation.milestones[@milestone].vote_y = parseInt(res.vote_y.toString())
							@currentToken.crowdSaleInformation.milestones[@milestone].vote_n = parseInt(res.vote_n.toString())
							@currentToken.crowdSaleInformation.milestones[@milestone].vote_all = parseInt(res.vote_all.toString())

							unless @currentToken.asd
								@$set(@currentToken, 'asd', 1)
							else
								@$set(@currentToken, 'asd', @currentToken.asd + 1)

							@milestone++
							if @milestone >= @currentToken.crowdSaleInformation.milestones.length
								@milestone = 0


				if scan_flag
					setTimeout =>
						@scan scan_flag
					, 10000

					return

			@scan true

			return

</script>
