<template>
    <div class="Calculator">
        калькулятор рыба
    </div>
</template>

<script>
    import './default.scss';

    export default {
        name: 'Calculator',
        template: '#CalculatorTemplate',
        components: { },
        props: {
            selected: null
        },
        data() {
            return {
            };
        },
        watch: {},
        computed: {
            saleTableData() {
                const list = this.selected.stages.map(stage => {
                    console.log(stage);
                    return {
                        'date': stage.endDate,
                        'sale': stage.discount,
                        'bonus': "---"
                    }
                });
                return list.filter(Boolean);
            }
        },
        methods: {
        },
        async created() {
        }
    };

</script>