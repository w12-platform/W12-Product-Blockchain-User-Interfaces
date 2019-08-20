<template>
    <div v-if="!langMeta.loading">
        <h1 v-if="!langMeta.loading" class="content__heading" v-html="$t('GeneralTitle')"></h1>
        <div class="project-descr"><span class="project-descr__att">i</span>
            <div class="project-descr__info">
                <p v-html="$t('HomeDescrInfo1')"></p>
                <p v-html="$t('HomeDescrInfo2')"></p>
            </div>
        </div>
        <div class="test-steps">
            <h3 class="test-steps__heading" v-html="$t('HomeStepsHeading')"></h3>
            <div class="table-wrap">
                <div class="test-steps__table">
                    <div class="test-steps__row">
                        <span class="test-steps__head" v-html="$t('HomeStepsNumber')"></span>
                        <span class="test-steps__head" v-html="$t('HomeStepsName')"></span>
                        <span class="test-steps__head" v-html="$t('HomeStepsRole')"></span></div>
                    <div class="test-steps__row">
                        <div class="test-steps__cell"><span class="num">1</span></div>
                        <div class="test-steps__cell"><a target="_blank" href="https://metamask.io" v-html="$t('HomeStepsNum1')"></a>
                            <p v-html="$t('HomeStepsForMetamask')"></p>
                        </div>
                        <div class="test-steps__cell">
                            <span class="icon icon-blue" v-html="$t('HomeStepsProject')"></span>
                            <span class="icon icon-green" v-html="$t('HomeStepsBuyerTokens')"></span>
                            <span class="icon icon-red" v-html="$t('HomeStepsAdmin')"></span>
                        </div>
                    </div>
                    <div class="test-steps__row">
                        <div class="test-steps__cell"><span class="num">2</span></div>
                        <div class="test-steps__cell"><a target="_blank" href="https://w12.io/test-ethereum-reg/" v-html="$t('HomeStepsNum2')"></a>
                            <p v-html="$t('HomeStepsForTest')"></p>
                        </div>
                        <div class="test-steps__cell"><span class="icon icon-green" v-html="$t('HomeStepsBuyerTokens')"></span></div>
                    </div>
                    <div class="test-steps__row">
                        <div class="test-steps__cell"><span class="num">3</span></div>
                        <div class="test-steps__cell"><a href="/factory.html" v-html="$t('HomeStepsNum3')"></a></div>
                        <div class="test-steps__cell"><span class="icon icon-blue" v-html="$t('HomeStepsProject')"></span></div>
                    </div>
                    <div class="test-steps__row">
                        <div class="test-steps__cell"><span class="num">4</span></div>
                        <div class="test-steps__cell"><a href="/listing.html" v-html="$t('HomeStepsNum4')"></a></div>
                        <div class="test-steps__cell"><span class="icon icon-red" v-html="$t('HomeStepsAdmin')"></span></div>
                    </div>
                    <div class="test-steps__row">
                        <div class="test-steps__cell"><span class="num">5</span></div>
                        <div class="test-steps__cell"><a href="/project.html" v-html="$t('HomeStepsNum5')"></a>
                            <p v-html="$t('HomeStepsSale')"></p>
                        </div>
                        <div class="test-steps__cell"><span class="icon icon-blue" v-html="$t('HomeStepsProject')"></span></div>
                    </div>
                    <div class="test-steps__row">
                        <div class="test-steps__cell"><span class="num">6</span></div>
                        <div class="test-steps__cell"><a href="/crowdsale.html" v-html="$t('HomeStepsNum6')"></a></div>
                        <div class="test-steps__cell"><span class="icon icon-green" v-html="$t('HomeStepsBuyerTokens')"></span></div>
                    </div>
                    <div class="test-steps__row">
                        <div class="test-steps__cell"><span class="num">7</span></div>
                        <div class="test-steps__cell"><a href="/investor-refund.html" v-html="$t('HomeStepsNum7')"></a></div>
                        <div class="test-steps__cell"><span class="icon icon-green" v-html="$t('HomeStepsBuyerTokens')"></span></div>
                    </div>
                    <div class="test-steps__row">
                        <div class="test-steps__cell"><span class="num">8</span></div>
                        <div class="test-steps__cell"><a href="/investor-exchange.html" v-html="$t('HomeStepsNum8')"></a></div>
                        <div class="test-steps__cell"><span class="icon icon-green" v-html="$t('HomeStepsBuyerTokens')"></span></div>
                    </div>
                    <div class="test-steps__row">
                        <div class="test-steps__cell"><span class="num">9</span></div>
                        <div class="test-steps__cell"><a href="/tranche.html" v-html="$t('HomeStepsNum9')"></a></div>
                        <div class="test-steps__cell"><span class="icon icon-blue" v-html="$t('HomeStepsProject')"></span></div>
                    </div>
                    <div class="test-steps__row">
                        <div class="test-steps__cell"><span class="num">10</span></div>
                        <div class="test-steps__cell"><a href="/receiving.html" v-html="$t('HomeStepsNum10')"></a></div>
                        <div class="test-steps__cell"><span class="icon icon-blue" v-html="$t('HomeStepsProject')"></span></div>
                    </div>
                    <div class="test-steps__row">
                        <div class="test-steps__cell"><span class="num">11</span></div>
                        <div class="test-steps__cell"><a href="/oracle-edit.html" v-html="$t('HomeStepsNum11')"></a></div>
                        <div class="test-steps__cell"><span class="icon icon-red">{{ $t('HomeStepsAdmin') }}</span></div>
                    </div>
                    <div class="test-steps__row">
                        <div class="test-steps__cell"><span class="num">12</span></div>
                        <div class="test-steps__cell"><a href="/oracle-select.html" v-html="$t('HomeStepsNum12')"></a></div>
                        <div class="test-steps__cell"><span class="icon icon-red">{{ $t('HomeStepsAdmin') }}</span></div>
                    </div>
                    <div class="test-steps__row">
                        <div class="test-steps__cell"><span class="num">13</span></div>
                        <div class="test-steps__cell"><a href="/oracle-vote.html" v-html="$t('HomeStepsNum13')"></a></div>
                        <div class="test-steps__cell"><span class="icon oracle">{{ $t('HomeStepsOracle') }}</span></div>
                    </div>
<!--                    <div class="test-steps__row">-->
<!--                        <div class="test-steps__cell"><span class="num">14</span></div>-->
<!--                        <div class="test-steps__cell"><a href="/project-settings.html" v-html="$t('HomeStepsNum14')"></a></div>-->
<!--                        <div class="test-steps__cell"><span class="icon icon-red">{{ $t('HomeStepsAdmin') }}</span></div>-->
<!--                    </div>-->
                </div>
            </div>
        </div>
        <div class="tech-adv">
            <div class="mobile-btn">
              <a class="btn actions__buytokens" href="https://w12.io/buy-w12/?utm_source=test-net&amp;utm_medium=demo_page" target="_blank" v-html="$t('HeaderByuW12Tokens')"></a>
            </div>


        </div>
        <div class="versions">
            <div class="mobile-btn">
              <a class="btn actions__buytokens" href="https://w12.io/buy-w12/?utm_source=test-net&amp;utm_medium=demo_page" target="_blank" v-html="$t('HeaderByuW12Tokens')"></a>
            </div>

            <div class="mobile-btn">
              <a class="btn actions__buytokens" href="https://w12.io/buy-w12/?utm_source=test-net&amp;utm_medium=demo_page" target="_blank" v-html="$t('HeaderByuW12Tokens')"></a>
            </div>
        </div>
    </div>
</template>

<script>
    import './default.scss';
    import {createNamespacedHelpers} from "vuex";

    const LangNS = createNamespacedHelpers("Lang");

    export default {
        name: 'Home',
        template: '#HomeTemplate',
        computed: {
            ...LangNS.mapState({
                langMeta: 'meta'
            })
        },
    };
</script>