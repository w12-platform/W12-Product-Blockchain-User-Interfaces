<template>
	<div class="ProjectStages__stage">
		<div class="row align-items-center justify-content-left">
			<div class="col-auto">
				<span class="ProjectDashboard__step-badge step-badge badge badge-pill badge-light">10</span>
			</div>
			<div class="col-sm-4"><span v-html="$t('ProjectDashboardStageRefundDate')"></span>
			</div>

				<div class="text-left">
					<div class="form-group">
					<label v-html="$t('ProjectDashboardStageRefundDateLabel')"></label>

					<b-tag v-if="project_refund_date" class="ProjectDashboard__placedWTokenAddress"
						type="is-info">{{project_refund_date}}
					</b-tag>

						<date-picker
								v-model="refund_date"
								type="datetime"
								:lang="translationsDef"
								format="YYYY-MM-DD HH:mm"
								confirm
								:time-picker-options="{ start: '00:00', step: '00:10', end: '23:50'}"
						></date-picker>
					</div>

					<div class="text-right">
						<button
								class="btn btn-primary btn-sm"
								@click="setRefundDate"
								:disabled="disable5" v-html="$t('ProjectDashboardStageSetButton')">
						</button>
					</div>
				</div>
		</div>

		<b-loading :is-full-page="false" :active.sync="placeTokensLoading"></b-loading>
	</div>
</template>

<script>
	import './default.scss';
	import {errorMessageSubstitution, waitContractEventOnce} from '@/lib/utils';
	import Connector from 'lib/Blockchain/DefaultConnector.js';
	import DatePicker from 'vue2-datepicker';
	import {waitTransactionReceipt, formatNumber, toWeiDecimals, fromWeiDecimals} from 'lib/utils.js';
	import {UPDATE_TX, CONFIRM_TX} from "store/modules/Transactions.js";
	import Web3 from 'web3';
	import {createNamespacedHelpers} from "vuex";

	const ConfigNS = createNamespacedHelpers('Config');
	const ProjectNS = createNamespacedHelpers("Project");
	const LedgerNS = createNamespacedHelpers("Ledger");
	const AccountNS = createNamespacedHelpers("Account");
	const TransactionsNS = createNamespacedHelpers("Transactions");
	const LangNS = createNamespacedHelpers("Lang");
	const web3 = new Web3();
	const BigNumber = web3.BigNumber;
	import moment from "moment";


	BigNumber.config({
		DECIMAL_PLACES: 36,
		FORMAT: {
			decimalSeparator: '.',
			groupSeparator: '',
			groupSize: 3,
			secondaryGroupSize: 0,
			fractionGroupSeparator: ' ',
			fractionGroupSize: 0
		}
	});

	export default
	{
		name: 'StageSetRefundDate',
		template: '#StageSetRefundDateTemplate',
		components:
				{
					DatePicker
				},
		watch: {},
		data()
		{
			return {
				placeTokensLoading: false,
				error: false,
				value: '',
				refund_date: {},
				project_refund_date: ''

			};
		},
		computed: {
			...ProjectNS.mapState({
				currentProject: "currentProject",
			}),
			...ProjectNS.mapGetters([
				'hasAllowance',
				'hasPlacedWTokenAddress',
				'ownerBalance'
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
			...LangNS.mapState({
				translationsDef: 'current'
			}),

			isErrorTx()
			{
				return this.TransactionsList && this.TransactionsList.length
						? this.TransactionsList.find((tr) => {
							return tr.token
							&& tr.name
							&& tr.hash
							&& tr.status
							&& tr.token === this.currentProject.tokenAddress
							&& tr.name === "setName"
							&& tr.status === "error"
									? tr
									: false
						})
						: false;
			},
			isPendingTx()
			{
				return this.TransactionsList && this.TransactionsList.length
						? this.TransactionsList.find((tr) => {
							return tr.token
							&& tr.name
							&& tr.hash
							&& tr.status
							&& tr.token === this.currentProject.tokenAddress
							&& tr.name === "setName"
							&& tr.status === "pending"
									? tr
									: false
						})
						: false;
			},
			disable5()
			{
				console.log(this.currentProject.crowdsaleAddress);
				// console.log(this.value.length);

				if(this.currentProject.crowdsaleAddress)
				{
						return false
				}
				return true;
			},
		},
		methods: {
			...ProjectNS.mapActions({
				fetchProjects: "fetchProjects",
				upTokenAfterEvent: 'upTokenAfterEvent'
			}),
			...LedgerNS.mapActions({
				fetchLedger: 'fetch',
			}),
			...TransactionsNS.mapActions({
				TransactionsRetry: "retry"
			}),
			async setRefundDate()
			{
				if(this.currentProject.crowdsaleAddress)
				{
					try
					{
						const {W12CrowdsaleFactory} = await this.fetchLedger(this.currentProject.version);
						const {web3} = await Connector.connect();
						const W12Crowdsale = W12CrowdsaleFactory.at(this.currentProject.crowdsaleAddress);
						const tx = await W12Crowdsale.methods.setRefundDate(moment(this.refund_date).format('X'), {from: this.currentAccount});
						this.$store.commit(`Transactions/${UPDATE_TX}`, {
							crowdsale: this.currentProject.crowdsaleAddress,
							name: "set refund date",
							hash: tx,
							status: "pending"
						});
						await waitTransactionReceipt(tx, web3);
					}
					catch(e)
					{
						this.error = errorMessageSubstitution(e);
					}
				}
			},
			async getRefundDate()
			{
				if(this.currentProject.crowdsaleAddress)
				{
					try
					{
						const {W12CrowdsaleFactory} = await this.fetchLedger(this.currentProject.version);
						const W12Crowdsale = W12CrowdsaleFactory.at(this.currentProject.crowdsaleAddress);
						var ref_date = await W12Crowdsale.methods.getRefundDate({from: this.currentAccount});

						ref_date = parseInt(ref_date.toString());


						if(ref_date == 0)
						{
							this.project_refund_date = '';
						}
						else
						{
							this.project_refund_date = moment(ref_date * 1000).format('LLL');
						}



						// console.log(moment(ref_date).toDate());

						// this.project_name = name;
					}
					catch(e)
					{
						this.error = errorMessageSubstitution(e);
						console.log(e);
					}
				}
			},
		},
		mounted: function() {
			setInterval(async () => {
				this.getRefundDate();
			}, 5000);
		}

	};
</script>
