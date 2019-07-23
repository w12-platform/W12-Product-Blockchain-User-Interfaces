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
                        <div class="test-steps__cell"><span class="icon icon-red">{{ $t('HomeStepsOracle') }}</span></div>
                    </div>
                </div>
            </div>
        </div>
        <div class="tech-adv">
            <div class="mobile-btn">
              <a class="btn actions__buytokens" href="https://w12.io/buy-w12/?utm_source=test-net&amp;utm_medium=demo_page" target="_blank" v-html="$t('HeaderByuW12Tokens')"></a>
            </div>
            <h3 class="tech-adv__heading" v-html="$t('HomeBenefits')"></h3>
            <h4 class="tech-adv__subheading" v-html="$t('HomeBenefitsMaxFlexibility')"></h4>
            <p class="tech-adv__text" v-html="$t('HomeBenefits1')"></p>
            <p class="tech-adv__text" v-html="$t('HomeBenefits2')"></p>
            <p class="tech-adv__text" v-html="$t('HomeBenefits3')"></p>
            <p class="tech-adv__text" v-html="$t('HomeBenefits4')"></p>
            <h4 class="tech-adv__subheading" v-html="$t('HomeBenefits5')"></h4>
            <p class="tech-adv__text no-points" v-html="$t('HomeBenefits6')"></p>
            <h4 class="tech-adv__subheading" v-html="$t('HomeBenefits7')"></h4>
            <p class="tech-adv__text no-points" v-html="$t('HomeBenefits8')"></p>
            <h4 class="tech-adv__subheading" v-html="$t('HomeBenefits9')"></h4>
            <p class="tech-adv__text no-points" v-html="$t('HomeBenefits10')"></p>
        </div>
        <div class="versions">
            <div class="mobile-btn">
              <a class="btn actions__buytokens" href="https://w12.io/buy-w12/?utm_source=test-net&amp;utm_medium=demo_page" target="_blank" v-html="$t('HeaderByuW12Tokens')"></a>
            </div>
            <h3 class="versions__heading" v-html="$t('HomeVersions')"></h3>
            <div class="table-wrap">
                <div class="versions__table">
                    <div class="versions__row">
                        <span class="versions__head" v-html="$t('HomeVersionsVersionProduct')"></span>
                        <span class="versions__head" v-html="$t('HomeVersionsMainFunction')"></span></div>
                    <div class="versions__row">
                        <div class="versions__cell"><span class="version">v.1</span></div>
                        <div class="versions__cell">
                            <p v-html="$t('HomeVersions1Func1')"></p>
                            <p v-html="$t('HomeVersions1Func2')"></p>
                            <p v-html="$t('HomeVersions1Func3')"></p>
                            <p v-html="$t('HomeVersions1Func4')"></p>
                            <p v-html="$t('HomeVersions1Func5')"></p>
                            <p v-html="$t('HomeVersions1Func6')"></p>
                        </div>
                    </div>
                    <div class="versions__row">
                        <div class="versions__cell"><span class="version">v.2</span></div>
                        <div class="versions__cell">
                            <h4 v-html="$t('HomeVersionsAdditionalFunctions')"></h4>
                            <p v-html="$t('HomeVersions1Func7')"></p>
                            <p v-html="$t('HomeVersions1Func8')"></p>
                            <p v-html="$t('HomeVersions1Func9')"></p>
                        </div>
                    </div>
                    <div class="versions__row">
                        <div class="versions__cell"><span class="version">v.3</span></div>
                        <div class="versions__cell">
                            <h4 v-html="$t('HomeVersionsAdditionalFunctions')"></h4>
                            <p v-html="$t('HomeVersions1Func10')"></p>
                        </div>
                    </div>
                    <div class="versions__row">
                        <div class="versions__cell"><span class="version">v.4</span></div>
                        <div class="versions__cell">
                            <h4 v-html="$t('HomeVersionsAdditionalFunctions')"></h4>
                            <p v-html="$t('HomeVersions1Func11')"></p>
                        </div>
                    </div>
                    <div class="versions__row">
                        <div class="versions__cell"><span class="version">v.5</span></div>
                        <div class="versions__cell">
                            <h4 v-html="$t('HomeVersionsAdditionalFunctions')"></h4>
                            <p v-html="$t('HomeVersions1Func12')"></p>
                        </div>
                    </div>
                    <div class="versions__row">
                        <div class="versions__cell"><span class="version">v.6</span></div>
                        <div class="versions__cell">
                            <h4 v-html="$t('HomeVersionsAdditionalFunctions')"></h4>
                            <p v-html="$t('HomeVersions1Func13')"></p>
                        </div>
                    </div>
                    <div class="versions__row">
                        <div class="versions__cell"><span class="version">v.7</span></div>
                        <div class="versions__cell">
                            <h4 v-html="$t('HomeVersionsAdditionalFunctions')"></h4>
                            <p v-html="$t('HomeVersions1Func14')"></p>
                        </div>
                    </div>
                    <div class="versions__row">
                        <div class="versions__cell"><span class="version">v.8</span></div>
                        <div class="versions__cell">
                            <h4 v-html="$t('HomeVersionsAdditionalFunctions')"></h4>
                            <p v-html="$t('HomeVersions1Func15')"></p>
                        </div>
                    </div>
                    <div class="versions__row">
                        <div class="versions__cell"><span class="version">v.9</span></div>
                        <div class="versions__cell">
                            <h4 v-html="$t('HomeVersionsAdditionalFunctions')"></h4>
                            <p v-html="$t('HomeVersions1Func16')"></p>
                        </div>
                    </div>
                    <div class="versions__row">
                        <div class="versions__cell"><span class="version">v.10</span></div>
                        <div class="versions__cell">
                            <h4 v-html="$t('HomeVersionsAdditionalFunctions')"></h4>
                            <p v-html="$t('HomeVersions1Func17')"></p>
                        </div>
                    </div>
                    <div class="versions__row">
                        <div class="versions__cell"><span class="version">v.11</span></div>
                        <div class="versions__cell">
                            <h4 v-html="$t('HomeVersionsAdditionalFunctions')"></h4>
                            <p v-html="$t('HomeVersions1Func18')"></p>
                        </div>
                    </div>
                </div>
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