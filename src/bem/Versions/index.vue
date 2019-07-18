<template>
    <div class="Versions">{{ version }}</div>
</template>

<script>
    import './default.scss';

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
            this.version = (await fetch(PACKAGE_JSON_PATH).then(data => data.json())).version;
        }
    };
</script>