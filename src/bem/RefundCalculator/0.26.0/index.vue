<template>
    <div class="RefundCalculator buefy">
        <label for="Amount" v-html="$t('InvestorDashboardRefundEthCalculator', {WToken: tokenSymbol})"></label>
        <b-field id="Amount">
            <b-icon icon="shopping"></b-icon>
            <cleave
                :placeholder="$t('InvestorDashboardRefundEthCalculatorTokenAmountPlaceholder')"
                :max="refundInformation.currentWalletBalanceInTokens"
                :value="value"
                @input="$emit('input', $event)"
                :options="optionsNumber"
                class="form-control"
                min="0"
                @keyup.enter.native="$emit('approve')"
            ></cleave>
        </b-field>
        <div class="row">
            <div class="col"><span v-html="$t('InvestorDashboardRefundEthCalculatorMessage')"></span>
            </div>
            <div v-if="!refundedAmountPerAsset" class="col">-</div>
            <div v-else class="col">
                <span v-for="(value, symbol) in refundedAmountPerAsset" :key="symbol">
                    {{ value }} {{ symbol }}
                    <br>
                </span>
            </div>
        </div>
    </div>
</template>
<script>
    import './default.scss';
    import { getRefundedAmountPerAsset } from '@/lib/selectors/fund';
    import { RefundInformationModel } from 'bem/RefundInformation/0.26.0/shared.js';
    import {web3, toWeiDecimals} from 'lib/utils';

    import {createNamespacedHelpers} from "vuex";

    const BigNumber = web3.BigNumber.another({ EXPONENTIAL_AT: [-30, 30] });

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
        computed: {
            ...TokensListNS.mapState({
                currentToken: "currentToken"
            }),

            refundedAmountPerAsset() {
                if (!this.refundInformation) return null;

                return getRefundedAmountPerAsset(
                    this.value,
                    this.refundInformation.refundAmountPerToken,
                    (v, a) =>
                        v.greaterThan(this.refundInformation.currentWalletBalanceInRefundedAssets[a])
                            ? this.refundInformation.currentWalletBalanceInRefundedAssets[a]
                            : v.toString()
                );
            }
        }
    };
</script>
