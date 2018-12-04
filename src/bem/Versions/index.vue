<template>
    <div class="Versions">{{ version }}</div>
</template>

<script>
    import './default.scss';
    import packageJson from '../../../package';

    export default {
        name: 'Versions',
        template: '#VersionsTemplate',
        computed: {
        },
        data() {
            return {
                version: packageJson.version
            };
        }
    };
</script>
