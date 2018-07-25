<template>
    <div class="RefundCalculator">
        <div class="row">
            <div class="col">
                Укажите количество {{ tokenSymbol }}:
            </div>
            <div class="col">
                <input type="text" class="form-control" :value="value" @input="$emit('input', $event.target.value)">
            </div>
        </div>
        <div class="row">
            <div class="col">
                Данное колличество позволит вернуть:
            </div>
            <div class="col">
                {{ refundAmount | ETH }} ETH
            </div>
        </div>
    </div>
</template>
<script>
    import Ledger from '../../lib/Blockchain/ContractsLedger.js';

    const web3 = new Web3();
    const BigNumber = web3.BigNumber.another({ EXPONENTIAL_AT: [-30, 30] })

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
            value: {
                type: [String]
            },
        },
        data() {
            return {
                loadingLedger: false,
                calculation: false,
                refundAmount: '0'
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

                try {
                    if (this.helpers) {
                        const {W12Fund} = this.helpers;
                        const value = await W12Fund.methods.getRefundAmount(this.value || 0, {from: this.accountAddress});

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
<style lang="scss">
    .RefundCalculator {
    }
</style>
