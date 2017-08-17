import { State, Actions, Effect } from 'jumpstate';
import api from 'services/Api';
import chartList from 'utils/chartList';
import { createYTotalsList, createPartialsList, formattedSeries, compareDates, fillMissingDates } from 'helpers/chartsHelpers';

/* ------------- State Management ------------- */

Effect('filterDesk', (filterObj) => {
    Actions.updateFilter(filterObj);
    Actions.toggleIsUpdatingCharts(true);
    const { startDate, endDate, desk } = filterObj;
    chartList.map(chart => {
        api[`get${chart}`](startDate, endDate, desk)
            .then(chartData => {
                Actions.toggleIsUpdatingCharts(false);
                Actions[`update${chart}`]({ chartData, startDate, endDate });
            })
            .catch(error => {
                Actions.toggleIsUpdatingCharts(false);
                Actions[`get${chart}Failed`](error);
            });
    });
});

const chartsRedux = State({
    initial: {
        composerVsInCopy: {
            data: []
        }
    },

    updateComposerVsIncopy(state, { chartData, startDate, endDate }) {
        const { composerResponse, inCopyResponse } = chartData;
        const range = endDate.diff(startDate, 'days');
        const composerData = composerResponse.data.length < range ?  fillMissingDates(startDate, endDate, composerResponse.data).sort(compareDates) : composerResponse.data;
        const inCopyData = inCopyResponse.data.length < range ?  fillMissingDates(startDate, endDate, inCopyResponse.data).sort(compareDates) : inCopyResponse.data;
        const composerVsInCopyData = [{ data: composerData }, { data: inCopyData }];
        const seriesWithLabels = composerVsInCopyData.map(series => {
            return { data: series.data.map((dataPoint, index) => {
                return {
                    x: dataPoint['x'],
                    y: dataPoint['y'],
                    label: `Created in Composer: ${composerVsInCopyData[0]['data'][index]['y']}\nCreated in InCopy: ${composerVsInCopyData[1]['data'][index]['y']}`
                };
            })
            };
        });
        const totals = createYTotalsList(createPartialsList(seriesWithLabels));
        const percentSeries = formattedSeries(seriesWithLabels, totals);

        return { 
            composerVsInCopy: {
                data: percentSeries
            }
        };
    },

    getComposerVsIncopyFailed(state, error) {
        return {
            composerVsInCopy: {
                data: state.composerVsInCopy.data,
                error: error.message
            }
        };
    }
});

export default chartsRedux;