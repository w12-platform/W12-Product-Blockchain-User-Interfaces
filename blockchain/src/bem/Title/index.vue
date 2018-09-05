<template>
    <h1 v-if="!langMeta.loading" class='text-center purchase-heading'>{{ $t('GeneralTitle') }}</h1>
</template>

<script>
    import {createNamespacedHelpers} from "vuex";

    const LangNS = createNamespacedHelpers("Lang");

    export default {
        name: 'Title',
        template: '#TitleTemplate',
        computed: {
            ...LangNS.mapState({
                langMeta: 'meta'
            })
        },
    };
</script>