import moment from 'moment';

export function getStartDate(stages) {
    return stages.length ? stages[0].startDate : null;
}

export function getEndDate(stages) {
    return stages.length ? stages[stages.length - 1].endDate : null;
}

export function getCurrentStage(stages) {
    if (stages.length) {
        const startDate = getStartDate(stages);
        const ranges = [
            {
                range: [startDate],
                stage: null
            }
        ];

        let endDate = 0;

        for (let stage of stages) {
            const last = ranges[ranges.length - 1];
            const endDateUnix = stage.endDate;

            if (last.range.length === 1) {
                last.range.push(endDateUnix);
                last.stage = stage;
            }

            ranges.push({
                range: [endDateUnix],
                stage: null
            });

            const stageEndDate = stage.endDate;
            endDate = endDate < stageEndDate ? stageEndDate : endDate;
        }

        ranges.pop();

        const currentDateUnix = moment.utc().unix();
        const found = ranges.find(item => {
            return (
                currentDateUnix >= item.range[0]
                && currentDateUnix <= item.range[1]
            );
        });

        return found ? found.stage : null;
    }

    return null;
}
