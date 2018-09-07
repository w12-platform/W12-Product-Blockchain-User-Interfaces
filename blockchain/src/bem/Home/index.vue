<template>
    <div v-if="!langMeta.loading">
        <div class="project-descr"><span class="project-descr__att">i</span>
            <div class="project-descr__info">
                <p>Этот стенд создан для удобного тестирования функций продукта аудиторами, проектами, комьюнити W12. </p>
                <p>Смарт контракты продукта W12 задеплоины в тестовой сети Эфириума (Rinkeby) и для покупки токенов используется тестовый ETH. Чтобы протестировать работу всех основных функций, вам необходимо <b>пройти через все шаги в таблице </b>ниже.</p>
            </div>
        </div>
        <div class="test-steps">
            <h3 class="test-steps__heading">Шаги тестирования продукта</h3>
            <div class="table-wrap">
                <div class="test-steps__table">
                    <div class="test-steps__row"><span class="test-steps__head">№ шага</span><span class="test-steps__head">Название функции</span><span class="test-steps__head">Роль</span></div>
                    <div class="test-steps__row">
                        <div class="test-steps__cell"><span class="num">1</span></div>
                        <div class="test-steps__cell"><a href="#">Установка MetaMask</a></div>
                        <div class="test-steps__cell"><span class="icon icon-blue">проект,</span><span class="icon icon-green">покупатель токенов,</span><span class="icon icon-red">администратор W12</span></div>
                    </div>
                    <div class="test-steps__row">
                        <div class="test-steps__cell"><span class="num">2</span></div>
                        <div class="test-steps__cell"><a href="#">Получение тестового ETH</a>
                            <p>для тестирования функций <br>покупателя токенов</p>
                        </div>
                        <div class="test-steps__cell"><span class="icon icon-green">покупатель токенов</span></div>
                    </div>
                    <div class="test-steps__row">
                        <div class="test-steps__cell"><span class="num">3</span></div>
                        <div class="test-steps__cell"><a href="/factory.html">Выпуск токенов проектом</a></div>
                        <div class="test-steps__cell"><span class="icon icon-blue">проект</span></div>
                    </div>
                    <div class="test-steps__row">
                        <div class="test-steps__cell"><span class="num">4</span></div>
                        <div class="test-steps__cell"><a href="/listing.html">Добавление токена<br>проекта в белый список  </a></div>
                        <div class="test-steps__cell"><span class="icon icon-red">администратор W12</span></div>
                    </div>
                    <div class="test-steps__row">
                        <div class="test-steps__cell"><span class="num">5</span></div>
                        <div class="test-steps__cell"><a href="/project.html">Настройка продажи токенов </a>
                            <p>даты продажи токенов, <br>скидки и другое</p>
                        </div>
                        <div class="test-steps__cell"><span class="icon icon-blue">проект</span></div>
                    </div>
                    <div class="test-steps__row">
                        <div class="test-steps__cell"><span class="num">6</span></div>
                        <div class="test-steps__cell"><a href="/crowdsale.html">Покупка токенов  </a></div>
                        <div class="test-steps__cell"><span class="icon icon-green">покупатель токенов</span></div>
                    </div>
                    <div class="test-steps__row">
                        <div class="test-steps__cell"><span class="num">7</span></div>
                        <div class="test-steps__cell"><a href="#">Возврат средств <br>из фонда проект</a></div>
                        <div class="test-steps__cell"><span class="icon icon-green">покупатель токенов</span></div>
                    </div>
                    <div class="test-steps__row">
                        <div class="test-steps__cell"><span class="num">8</span></div>
                        <div class="test-steps__cell"><a href="#">Обмен W-tokens<br>на Original Tokens</a></div>
                        <div class="test-steps__cell"><span class="icon icon-green">покупатель токенов</span></div>
                    </div>
                    <div class="test-steps__row">
                        <div class="test-steps__cell"><span class="num">9</span></div>
                        <div class="test-steps__cell"><a href="#">Получение средств<br>проектом после окончания<br>этапа дорожной карты</a></div>
                        <div class="test-steps__cell"><span class="icon icon-blue">проект</span></div>
                    </div>
                </div>
            </div>
        </div>
        <div class="tech-adv">
            <h3 class="tech-adv__heading">Преимущества технического решения W12</h3>
            <h4 class="tech-adv__subheading">Максимальная гибкость</h4>
            <p class="tech-adv__text">The project can issue tokens independently and sell only part of its tokens on the W12 platform ac-cording to the secured model. Это позволит платформе W12 быстро начать продавать токены большого количеством ICO проектов, предоставить покупателями токенов большой ассор-тимент и быстро занять большую долю ICO рынка.</p>
            <p class="tech-adv__text">The project can implement almost any logic for its token sale (by setting any intervals for sale rounds, discounts and bonuses, of the period of freezing purchased tokens).  </p>
            <p class="tech-adv__text">The project can issue tokens on the W12 platform and sell part of the tokens independently (for ex-ample, on its website). За счет чего любой проект будет иметь возможность не писать и не ауди-ровать смарт контракты crowdsale и выпустить токены бесплатно. </p>
            <p class="tech-adv__text">В следующих версиях продукта, the project can choose which cryptocurrencies to store money in the project fund (for example, you can store money in stable coins to reduce volatility); the higher the fraction of this money that is stored as W12 tokens, the lower the platform commission for the project.</p>
            <h4 class="tech-adv__subheading">Кросс-блокчейн решение</h4>
            <p class="tech-adv__text no-points">The first product version (already developed) works based on the Ethereum blockchain. A crossblockchain solution will be implemented on the W12 platform along with the growth of populari-ty among the projects of other blockchains that allow creation of smart contracts for the ICO. </p>
            <h4 class="tech-adv__subheading">Полностью on-chain решение</h4>
            <p class="tech-adv__text no-points">При работе продукта все операции происходят в блокчейне. Это делает процесс продажи токенов прозрачным, легко аудируемым и исключает необходимость доверять третьей стороне.</p>
            <h4 class="tech-adv__subheading">Интегрируемость</h4>
            <p class="tech-adv__text no-points">Продукт W12 легко интегрируется в сайты проектов и сторонние платформы.</p>
        </div>
        <div class="versions">
            <h3 class="versions__heading">Версии продукта</h3>
            <div class="table-wrap">
                <div class="versions__table">
                    <div class="versions__row"><span class="versions__head">версия<br>продукта</span><span class="versions__head">Основные функции продукта</span></div>
                    <div class="versions__row">
                        <div class="versions__cell"><span class="version">v.1</span></div>
                        <div class="versions__cell">
                            <p>Поддерживаемые блокчейны: Ethereum </p>
                            <p>Поддерживаемые токены проектов: ERC20 </p>
                            <p>Покупка токенов с помощью: ETH </p>
                            <p>Хранение средств в фонде проекта: ETH</p>
                            <p>Выдача средств проекту: ETH</p>
                            <p>Тип фонда проекта: фонд №1 (каждый пользователь </p>
                        </div>
                    </div>
                    <div class="versions__row">
                        <div class="versions__cell"><span class="version">v.2</span></div>
                        <div class="versions__cell">
                            <h4>Дополнительные функции</h4>
                            <p>Покупка токенов с помощью: W12, ERC20 stable coins, ликвидных ECR20 tokens </p>
                            <p>Хранение средств в фонде проекта: W12 token, ERC20 stable coins, ликвидных ECR20 tokens </p>
                            <p>Выдача средств проекту: валюты в которых хранятся средства в фонде проекта</p>
                        </div>
                    </div>
                    <div class="versions__row">
                        <div class="versions__cell"><span class="version">v.3</span></div>
                        <div class="versions__cell">
                            <h4>Дополнительные функции</h4>
                            <p>Возможность для проектов хранить любую часть средств фонда в токенах W12 (и за счёт этого снижать комиссию сервиса) </p>
                        </div>
                    </div>
                    <div class="versions__row">
                        <div class="versions__cell"><span class="version">v.4</span></div>
                        <div class="versions__cell">
                            <h4>Дополнительные функции</h4>
                            <p>Покупка токенов с помощью: BTC, LTC и других популярных криптовалют с помощью встроенного криптовалютного обменника</p>
                        </div>
                    </div>
                    <div class="versions__row">
                        <div class="versions__cell"><span class="version">v.5</span></div>
                        <div class="versions__cell">
                            <h4>Дополнительные функции</h4>
                            <p>Тип фонда: фонд №2 (решение принимается оракулами)</p>
                        </div>
                    </div>
                    <div class="versions__row">
                        <div class="versions__cell"><span class="version">v.6</span></div>
                        <div class="versions__cell">
                            <h4>Дополнительные функции</h4>
                            <p>Покупка токенов с помощью: кредитных карточек (Visa, MasterCard, UnionPay, JCB), и банковских переводов (SWIFT, SEPA)</p>
                        </div>
                    </div>
                    <div class="versions__row">
                        <div class="versions__cell"><span class="version">v.7</span></div>
                        <div class="versions__cell">
                            <h4>Дополнительные функции</h4>
                            <p>Выдача средств проекту: банковский перевод на расчетный счёт компании</p>
                        </div>
                    </div>
                    <div class="versions__row">
                        <div class="versions__cell"><span class="version">v.8</span></div>
                        <div class="versions__cell">
                            <h4>Дополнительные функции</h4>
                            <p>Тип фонда: фонд №3 (решение принимается голосованием покупателей токенов)</p>
                        </div>
                    </div>
                    <div class="versions__row">
                        <div class="versions__cell"><span class="version">v.9</span></div>
                        <div class="versions__cell">
                            <h4>Дополнительные функции</h4>
                            <p>Возможность быстрой интеграции продукта в сайты проектов</p>
                        </div>
                    </div>
                    <div class="versions__row">
                        <div class="versions__cell"><span class="version">v.10</span></div>
                        <div class="versions__cell">
                            <h4>Дополнительные функции</h4>
                            <p>Возможность интеграция продукта в маркетплейсы</p>
                        </div>
                    </div>
                    <div class="versions__row">
                        <div class="versions__cell"><span class="version">v.11</span></div>
                        <div class="versions__cell">
                            <h4>Дополнительные функции</h4>
                            <p>Кросс-блокчейн решение для возможности использования токенов стандарта отличного от ERC20 (EOS, NEO, NEM, Stellar</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
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