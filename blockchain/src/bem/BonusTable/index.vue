<template>
    <b-table class="BonusTable" :data="saleTableData">
        <template slot-scope="props">
            <b-table-column field="date" label="Sum of tokens">{{ props.row.date }}</b-table-column>
            <b-table-column field="sale" label="Sale" centered>{{ props.row.sale }} %</b-table-column>
            <b-table-column field="bonus" label="Bonus" centered>{{ props.row.bonus }}</b-table-column>
        </template>
    </b-table>
</template>

<script>
    import './default.scss';

    export default {
        name: 'BonusTable',
        template: '#BonusTableTemplate',
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