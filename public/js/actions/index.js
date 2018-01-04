import { CHART_LIST, CHART_FILTERS_MAP } from 'utils/chartList';
import {
    updateComposerVsIncopy, 
    getComposerVsIncopyFailed, 
    updateInWorkflowVsNotInWorkflow,
    getInWorkflowVsNotInWorkflowFailed,
    updateForkTime,
    getForkTimeFailed

} from './chartsActions';
import { toggleIsUpdatingCharts } from './uiActions';
import {
  updateFilter,
  updateCommissioningDesks,
  getCommissioningDesksFailed,
  updateNewspaperBooks,
  getNewspaperBooksFailed
} from "./filtersActions";
import api from 'services/Api';
import moment from "moment";

const chartsActions = { 
    updateComposerVsIncopy,
    getComposerVsIncopyFailed,
    updateInWorkflowVsNotInWorkflow,
    getInWorkflowVsNotInWorkflowFailed,
    updateForkTime,
    getForkTimeFailed
};

/*-------- HELPERS --------*/

const updateAttemptActions = (chartData, chart, startDate, endDate, dispatch) => {
    dispatch(toggleIsUpdatingCharts(false));
    dispatch(chartsActions[`update${chart}`]({ chartData, startDate, endDate }));
};

const responseFailActions = (chart, error, dispatch) => {
    dispatch(toggleIsUpdatingCharts(false));
    dispatch(chartsActions[`get${chart}Failed`](error));
};

/*-------- DISPATCHABLE --------*/

// Maps the filters to argument positions
const filtersToArgs = (chart, filterObj) =>
    CHART_FILTERS_MAP[chart].map(filter => filterObj[filter]);

// Test whether any of the changed filters are used for this chart
const chartNeedsUpdate = (chart, filterChangeset = {}) => {
    const changedFilters = Object.keys(filterChangeset);
    const chartFilters = CHART_FILTERS_MAP[chart];

    return changedFilters.some(filter => chartFilters.includes(filter));
};

export const runFilter = (filterChangeset = {}) => {
    return (dispatch, getState) => {
        const { filterVals } = getState();
        const updatedFilters = { ...filterVals, ...filterChangeset };
        dispatch(updateFilter(updatedFilters));
        dispatch(toggleIsUpdatingCharts(true));
        
        const startDate = moment(updatedFilters.startDate);
        const endDate = moment(updatedFilters.endDate);
        CHART_LIST
            .filter(chart => chartNeedsUpdate(chart, filterChangeset))
            .map(chart => {
                api[`get${chart}`](...filtersToArgs(chart, updatedFilters))
                    .then(chartData => updateAttemptActions(chartData, chart, startDate, endDate, dispatch))
                    .catch(error => responseFailActions(chart, error, dispatch));
            });
    };
};

export const fetchCommissioningDesks = () => {
    return (dispatch) => {
        api.getCommissioningDesks()
            .then(response => {
                const desksList = response.data;
                desksList.push('tracking/commissioningdesk/all');
                dispatch(updateCommissioningDesks(desksList));
            })
            .catch(dispatch(getCommissioningDesksFailed));
    };
};

export const fetchNewspaperBooks = () => {
    return (dispatch) => {
        api.getNewspaperBooks()
            .then(response => {
                const booksList = response.data;
                dispatch(updateNewspaperBooks(booksList));
            })
            .catch(dispatch(getNewspaperBooksFailed));
    };
};

export const toggleStackChart = (isStacked) => ({
    type: 'TOGGLE_STACK_CHART',
    isStacked
});

const actions = { runFilter, fetchCommissioningDesks, fetchNewspaperBooks, toggleStackChart };

export default actions;