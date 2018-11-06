<template>
    <footer v-if="!langMeta.loading" class="footer">
        <div class="container">
            <div class="footer__line">
                <div class="footer-links first">
                    <h5 class="footer-links__heading" v-html="$t('FooterMenu1')"></h5>
                    <ul class="footer-links__list">
                        <li class="footer-links__item"><a class="footer-links__link" :href="$t('FooterMenu2Url')" v-html="$t('FooterMenu2')"></a></li>
                        <li class="footer-links__item"><a class="footer-links__link" :href="$t('FooterMenu3Url')" v-html="$t('FooterMenu3')"></a></li>
                        <li class="footer-links__item"><a class="footer-links__link" :href="$t('FooterMenu4Url')" v-html="$t('FooterMenu4')"></a></li>
                        <li class="footer-links__item"><a class="footer-links__link" :href="$t('FooterMenu5Url')" v-html="$t('FooterMenu5')"></a></li>
                        <li class="footer-links__item"><a class="footer-links__link" :href="$t('FooterMenu6Url')" v-html="$t('FooterMenu6')"></a></li>
                        <li class="footer-links__item"><a class="footer-links__link" :href="$t('FooterMenu7Url')" v-html="$t('FooterMenu7')"></a></li>
                    </ul>
                </div>
                <div class="footer-links">
                    <h5 class="footer-links__heading" v-html="$t('FooterMenu8')"></h5>
                    <ul class="footer-links__list">
                        <li class="footer-links__item"><a class="footer-links__link" :href="$t('FooterMenu9Url')" v-html="$t('FooterMenu9')"></a></li>
                        <li class="footer-links__item"><a class="footer-links__link" :href="$t('FooterMenu10Url')" v-html="$t('FooterMenu10')"></a></li>
                        <li class="footer-links__item"><a class="footer-links__link" :href="$t('FooterMenu11Url')" v-html="$t('FooterMenu11')"></a></li>
                        <li class="footer-links__item"><a class="footer-links__link" :href="$t('FooterMenu12Url')" v-html="$t('FooterMenu12')"></a></li>
                        <li class="footer-links__item"><a class="footer-links__link" :href="$t('FooterMenu13Url')" v-html="$t('FooterMenu13')"></a></li>
                    </ul>
                </div>
                <div class="footer-actions">
                    <div class="footer-actions__links">
                        <a :href="$t('FooterActionsBrowseProjectsUrl')" v-html="$t('FooterActionsBrowseProjects')"></a>
                        <a :href="$t('FooterActionsStartProjectUrl')" v-html="$t('FooterActionsStartProject')"></a>
                        <a :href="$t('FooterActionsLogInUrl')" v-html="$t('FooterActionsLogIn')"></a>
                        <a :href="$t('FooterActionsSignUpUrl')" v-html="$t('FooterActionsSignUp')"></a>
                    </div>
                    <!--
                    <form class="footer-form">
                        <label class="footer-form__label" v-html="$t('FooterForm1')"></label>
                        <div class="footer-form__row">
                            <input type="email" :placeholder="$t('FooterForm2')">
                            <button type="submit" v-html="$t('FooterForm3')"></button>
                        </div><span class="footer-form__tags" v-html="$t('FooterForm4')"></span>
                    </form>
                    -->
                    <div class="footer-follow"><span class="footer-follow__heading" v-html="$t('FooterFollow')"></span>
                        <div class="footer-follow__social">
                            <a :href="$t('FooterFollowFacebook')"><i class="fa fa-facebook"></i></a>
                            <a :href="$t('FooterFollowTelegram')"><i class="fa fa-telegram"></i></a>
                            <a :href="$t('FooterFollowTwitter')"><i class="fa fa-twitter"></i></a>
                            <a :href="$t('FooterFollowMedium')"><i class="fa fa-medium"></i></a>
                            <a :href="$t('FooterFollowEnvelope')"><i class="fa fa-envelope"></i></a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </footer>
</template>

<script>
    import {createNamespacedHelpers} from "vuex";

    const LangNS = createNamespacedHelpers("Lang");

    export default {
        name: 'Footer',
        template: '#FooterTemplate',
        computed: {
            ...LangNS.mapState({
                langMeta: 'meta'
            })
        },
        async created() {
            window.dispatchEvent(new Event('resize'));
        },
    };
</script>