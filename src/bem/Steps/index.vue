<template>
    <div class="Steps buefy mt-5">
        <section class="container">
            <div class="row align-items-center">
                <div class="Steps__text column text-left">{{ $t('StepsText', { number }) }}</div>
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
            }
        },
    };
</script>
