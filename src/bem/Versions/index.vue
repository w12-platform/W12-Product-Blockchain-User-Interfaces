<template>
    <div class="Versions">{{ version }}</div>
</template>

<script>
    import './default.scss';
    import packageJson from '#/package.json';

    export default {
        name: 'Versions',
        template: '#VersionsTemplate',
        computed: {
        },
        data() {
            return {
                version: ""
            };
        },
        async created(){
            this.version = packageJson.version;
        }
    };
</script>