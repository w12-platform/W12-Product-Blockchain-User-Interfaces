<template>
    <div class="RefundCalculator buefy">
            <label for="Amount">{{ $t('InvestorDashboardRefundEthCalculator', {WToken: tokenSymbol}) }}</label>
            <b-field id="Amount">
                <b-input
                        :placeholder="$('InvestorDashboardRefundEthCalculatorTokenAmountPlaceholder')"
                        type="number"
                        min="0"
                        :step="1"
                        :max="decimals(refundInformation.currentWalletBalanceInTokens)"
                        v-model="inputValue"
                        @input="calculate"
                        icon="shopping">
                </b-input>
            </b-field>
        <div class="row">
            <div class="col">
                {{ $t('InvestorDashboardRefundEthCalculatorMessage') }}
            </div>
            <div class="col">
                {{ refundAmount | ETH }} ETH
            </div>
        </div>
    </div>
</template>
<script>
    import 'bem/RefundCalculator/default.scss';
    import Ledger from 'lib/Blockchain/ContractsLedger.js';
    import { RefundInformationModel } from 'bem/RefundInformation/shared.js';

    const web3 = new Web3();
    const BigNumber = web3.BigNumber.another({ EXPONENTIAL_AT: [-30, 30] });

    export default {
        name: 'RefundCalculator',
        filters: {
            ETH(value) {
              const result = web3.fromWei(value, 'ether');
              return new BigNumber(result).toString();
            }
        },
        props: {
            fundAddress: {
                type: [String]
            },
            accountAddress: {
                type: [String]
            },
            tokenSymbol: {
                type: [String]
            },
            tokenDecimals: {
                type: [String]
            },
            value: {
                required: true
            },
            refundInformation: {
                type: RefundInformationModel,
                required: true
            }
        },
        data() {
            return {
                loadingLedger: false,
                calculation: false,
                refundAmount: '0',
                inputValue: 0,
            }
        },
        watch: {
            fundAddress: {
                async handler() {
                    await this.updateHelpers();
                },
                immediate: true
            },
            accountAddress: {
                async handler () {
                    await this.calculate();
                },
                immediate: true
            },
            value: {
                async handler (value) {
                    await this.calculate();
                },
            },
        },
        methods: {
            decimals (value) {
                const d = this.refundInformation.tokenDecimals;
                const base = new BigNumber(10);
                value = new BigNumber(value);
                return value.div(base.pow(d)).toString();
            },
            async updateHelpers() {
                let ledger;

                this.loadingLedger = true;

                try {
                    ledger = await Ledger;

                    const {W12FundFactory} = ledger;

                    if (this.fundAddress) {
                        this.helpers = {
                            W12Fund: W12FundFactory.at(this.fundAddress)
                        };
                    }
                } catch (e) {
                    this.setErrorMessage(e.message);
                }

                this.loadingLedger = false;

                return ledger;
            },
            async calculate() {
                this.calculation = true;

                this.$emit('input', this.inputValue);

                try {
                    if (this.helpers) {
                        const {W12Fund} = this.helpers;
                        const multiplier = new BigNumber(10).pow(this.tokenDecimals);
                        const value = await W12Fund.methods.getRefundAmount(
                            (new BigNumber(this.inputValue || 0)).mul(multiplier).toString(),
                            {from: this.accountAddress}
                        );

                        this.refundAmount = value.toString();
                    }
                } catch (e) {
                    console.log(e);
                }

                this.calculation = false;
            }
        },
    };
</script>

