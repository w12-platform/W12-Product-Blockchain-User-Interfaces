<template>
    <div class="RefundCalculator buefy">
            <label for="Amount">{{ $t('InvestorDashboardRefundEthCalculator', {WToken: tokenSymbol}) }}</label>
            <b-field id="Amount">
                <b-icon icon="shopping"></b-icon>
                <cleave
                        :placeholder="$t('InvestorDashboardRefundEthCalculatorTokenAmountPlaceholder')"
                        :max="decimals(refundInformation.currentWalletBalanceInTokens)"
                        v-model="inputValue"
                        @input.native="calculate"
                        :options="optionsNumber"
                        class="form-control"
                        min="0"
                        @keyup.enter.native="$emit('approve')"
                ></cleave>
            </b-field>
        <div class="row">
            <div class="col">
                {{ $t('InvestorDashboardRefundEthCalculatorMessage') }}
            </div>
            <div class="col">
                {{ refundAmount | ETH }} ETH
            </div>
        </div>
        <b-loading :is-full-page="false" :active.sync="calculation"></b-loading>
    </div>
</template>
<script>
    import 'src/bem/RefundCalculator/default.scss';
    import { RefundInformationModel } from 'bem/RefundInformation/shared.js';
    import { toWeiDecimals } from 'lib/utils.js';
    import Web3 from 'web3';

    const web3 = new Web3();
    const BigNumber = web3.BigNumber.another({ EXPONENTIAL_AT: [-30, 30] });
    import {createNamespacedHelpers} from "vuex";

    const LedgerNS = createNamespacedHelpers("Ledger");
    const TokensListNS = createNamespacedHelpers("TokensList");

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
                optionsNumber: {
                    prefix: '',
                    numeral: true,
                    numeralPositiveOnly: true,
                    noImmediatePrefix: true,
                    rawValueTrimPrefix: true,
                    numeralIntegerScale: 18,
                    numeralDecimalScale: 18
                }
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
            inputValue: {
                async handler (value) {
                    await this.calculate();
                },
            },
        },
        computed: {
            ...TokensListNS.mapState({
                currentToken: "currentToken"
            }),
        },
        methods: {
            ...LedgerNS.mapActions({
                ledgerFetch: "fetch"
            }),
            decimals (value) {
                const d = this.refundInformation.tokenDecimals;
                const base = new BigNumber(10);
                value = new BigNumber(value);
                return value.div(base.pow(d)).toString();
            },
            async updateHelpers() {
                this.loadingLedger = true;

                try {
                    const {W12FundFactory} = await this.ledgerFetch(this.currentToken.version);

                    if (this.fundAddress) {
                        this.helpers = {
                            W12Fund: W12FundFactory.at(this.fundAddress)
                        };
                    }
                } catch (e) {
                    console.log(e);
                }

                this.loadingLedger = false;
            },
            async calculate() {
                this.calculation = true;

                this.$emit('input', this.inputValue);
                try {
                    if (this.helpers) {
                        const {W12Fund} = this.helpers;

                        const value = await W12Fund.methods.getRefundAmount(
                            toWeiDecimals(this.inputValue, this.currentToken.decimals),
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
