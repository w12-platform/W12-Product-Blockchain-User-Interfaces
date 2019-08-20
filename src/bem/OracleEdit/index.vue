<template>
	<section class="container">
		<h2 class="content__heading sb30">{{ $t('OracleEdit') }}</h2>

		<div class="OracleTable buefy">
			<b-table
					:data="voters"
					:mobile-cards="true"
					paginated
					per-page="10"
					pagination-simple
					:selected.sync="selected_oracle"
					@click="table_click"
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

		<div class="form-group sb30">
			<label>{{ $t('OracleAddress') }}</label>
			<b-field>
				<input v-model="current_addr" type="text" class="form-control"/>
			</b-field>
		</div>

		<div class="form-group sb30 sb2">
			<label>{{ $t('OracleInfo') }}</label>
			<b-field>
				<textarea v-model="current_info" type="text" class="form-control"/>
			</b-field>
		</div>

		<p>{{$t('OracleSelectStatus')}}</p>

		<select class="sb2" v-model="current_status" @input="input55">
			<option :value="false">Disabled</option>
			<option :value="true">Enabled</option>
		</select>

		<p>{{$t('OracleSelectType')}}</p>

		<select class="sb2" v-model="current_oracle_type" @input="input55">
			<option :value="0">0</option>
			<option :value="1">1</option>
			<option :value="2">2</option>
			<option :value="3">3</option>
			<option :value="4">4</option>
		</select>

		<div>
			<button
				class="btn sb100 btn-primary py-2 my-2"
				:disabled="false"
				@click="set_oracle">
				{{$t('OracleSubmit')}}
			</button>
		</div>

	</section>
</template>

<script lang="coffee">

import './default.scss'
import Eth from 'ethjs'
import EthContract from 'ethjs-contract'
import {ORACLE} from 'abi/OracleBallot.js'
import config from '@/config'

log = (val...)->
	console.log val...

PAGE_SIZE = 10


export default

	data: ->
		voters: []
		page: 0
		selected_oracle: null
		current_addr: ''
		current_info: ''
		current_oracle_type: '0'
		current_status: 'false'


	filters:
		shortAddress: (value)->
			length = value.lengtеh
			value.slice(0, 8) + " ... " + value.slice(length - 8, length)

		percentFractional: (value)->
			value / 100


	watch:
		'selected_oracle': (to, from)->

			@current_addr = to.addr

			if login.oracle
				res = await login.oracle.getOracle to.index
				@current_info = res.info
				@current_oracle_type = res.oracle_type.toString()
				@current_status = res.status
			return


	methods:
		input55: ->
			return


		set_oracle: ->
			if login.oracle
				res = await login.oracle.setOracle @current_addr, @current_info, @current_oracle_type, @current_status,
					from: login.account
				@scan false
			return


		table_click: ->
			return


		scan: (scan_flag)->
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
				log ORACLE
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


			if scan_flag
				setTimeout =>
					@scan scan_flag
				, 10000

				return

			return

	mounted: ->
		@scan true
		return

</script>
