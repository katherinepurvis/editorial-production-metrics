import React, { Component } from 'react';
import { Grid, Row, Col } from 'react-flexbox-grid';
import moment from 'moment';
import { DateRangePicker } from 'react-dates';
import { formatDeskName } from 'helpers/chartsHelpers';

const renderDesks = (desks) => desks.sort().map((desk, key) => <option value={desk} key={`desk-filter-key-${key}`}>{formatDeskName(desk)}</option>);

export default class Filters extends Component {
    state = { focusedInput: null };

    render() {
        const { filterVals, isUpdating, desks, filterDesk } = this.props;
        return (
            <form className="form">
                <Grid fluid>
                    <Row>
                        <Col xs={12} md={4}>
                            <div className="form__row">
                                <label>
                                    <div>Filter by Desk:</div>
                                    <select
                                        className="form__field form__field--select"
                                        onChange={event => filterDesk({ ...filterVals, desk: event.target.value })}
                                        value={filterVals.desk}
                                        disabled={isUpdating}
                                    >
                                        {renderDesks(desks)}
                                    </select>
                                </label>
                            </div>
                        </Col>
                        <Col xs={12} md={4}>
                            <div className="form__row">
                                <label>
                                    <div>Filter by Office:</div>
                                    <select
                                        className="form__field form__field--select"
                                        onChange={event => filterDesk({ ...filterVals, productionOffice: event.target.value })}
                                        value={filterVals.productionOffice}
                                        disabled={isUpdating}
                                    >   
                                        <option value='all'>All</option>
                                        <option value='uk'>UK</option>
                                        <option value='us'>US</option>
                                        <option value='aus'>Australia</option>
                                    </select>
                                </label>
                            </div>
                        </Col>
                        <Col xs={12} md={4}>
                            <div className="form__row">
                                <label>
                                    <div>Time Range:</div>
                                    <div className='date-picker-container'>
                                        <DateRangePicker
                                            hideKeyboardShortcutsPanel
                                            initialVisibleMonth={() => moment().subtract(1, 'months')}
                                            orientation={window.innerWidth > 640 ? 'horizontal' : 'vertical'}
                                            displayFormat='DD/MM/YYYY'
                                            disabled={isUpdating}
                                            startDate={filterVals.startDate}
                                            endDate={filterVals.endDate}
                                            onDatesChange={({ startDate, endDate }) => endDate > startDate ? filterDesk({ ...filterVals, startDate: startDate.utc().startOf('day'), endDate: endDate.utc().endOf('day') }) : false }
                                            focusedInput={this.state.focusedInput}
                                            onFocusChange={focusedInput => this.setState({ focusedInput })}
                                            isOutsideRange={(day) => day.isAfter(moment())}
                                        />
                                    </div>
                                </label>
                            </div>
                        </Col>
                    </Row>
                </Grid>
            </form>
        );
    }
}