<template>
    <div class="Steps buefy mt-5">
        <section class="container">
            <div class="row align-items-center">
                <div class="Steps__text column text-left">{{ $t('StepsText', { number }) }}</div>
                <div class="Steps__btn column text-right" v-if="number !== all">
                    <div class="labelTooltip" v-if="blocked" v-tooltip="blocked">
                        <button class="Steps__btn btn btn-primary py-2 my-2" @click="next" disabled>{{ $t('StepsNext') }}</button>
                    </div>
                    <button v-else class="Steps__btn btn btn-primary py-2 my-2" @click="next">{{ $t('StepsNext') }}</button>
                </div>
            </div>
        </section>
    </div>
</template>

<script>
    import './default.scss';

    export default {
        name: 'Steps',
        template: '#StepsTemplate',
        props: {
            number: {
                required: true
            },
            blocked: {
            },
            link: {
                type: String,
            },
            all: {
                default: 10
            }
        },
        methods: {
            next(){
                document.location.href = this.link.toString();
            }
        },
    };
</script>
