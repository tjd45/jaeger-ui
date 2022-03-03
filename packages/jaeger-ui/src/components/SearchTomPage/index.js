// Copyright (c) 2017 Uber Technologies, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/* eslint-disable import/first */

/* eslint-disable react/require-default-props */
/* eslint-disable no-unused-vars */
import React, { Component } from 'react';
import { Col, Row, Tabs } from 'antd';
// import { Tabs } from 'antd';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import store from 'store';
import memoizeOne from 'memoize-one';

// import DAG from '../DependencyGraph/DAG';
// import ErrorMessage from '../common/ErrorMessage';
import SearchTomForm from './SearchTomForm';
import SearchForm from '../SearchTracePage/SearchForm'
import LoadingIndicator from '../common/LoadingIndicator';
import * as jaegerApiActions from '../../actions/jaeger-api';
import * as fileReaderActions from '../../actions/file-reader-api';
import { actions as traceDiffActions } from '../TraceDiff/duck';
import { fetchedState } from '../../constants';
import { sortTraces } from '../../model/search';
import FileLoader from '../SearchTracePage/FileLoader';

import './index.css';
import JaegerLogo from '../../img/jaeger-logo.svg';

const TabPane = Tabs.TabPane;

// export for tests
export class SearchTomPageImpl extends Component {


    componentDidMount() {


        const {
            fetchServices,
            fetchServiceOperations
        } = this.props;
        fetchServices();
        const { service } = store.get('lastSearch') || {};
        if (service && service !== '-') {
            fetchServiceOperations(service);
        }


    }


    render() {
        const {
            services,
            traceResults,
            loadJsonTraces
        } = this.props;

        console.log("TOM TRACE RESULTS");
        console.log(traceResults);

        const hasTraceResults = traceResults && traceResults.length > 0;

        return (
            <Row className="SearchTomPage--row">
                <Col span={6} className="SearchTracePage--column">
                    <div className="SearchTracePage--find">
                        <Tabs size="large">
                            {/* <TabPane tab="Search" key="searchForm">
                                <SearchTomForm services={services} />
                                <LoadingIndicator />
                                {!loadingServices && services ? <SearchForm services={services} /> : <LoadingIndicator />}
                            </TabPane> */}
                            <TabPane tab="JSON File" key="fileLoader">
                                <FileLoader
                                    loadJsonTraces={fileList => {
                                        loadJsonTraces(fileList);
                                    }}
                                />
                            </TabPane>
                        </Tabs>
                    </div>
                </Col>
                <Col span={18} className="SearchTomPage--column">
                    {/* <iframe title="test" src="https://lichess.org/tv/frame?theme=brown&bg=dark" frameBorder="0" /> */}
                    <img
                        className="SearchTracePage--logo js-test-logo"
                        alt="presentation"
                        src={JaegerLogo}
                        width="400"
                    />

                </Col>
            </Row>
        );
    }
}

SearchTomPageImpl.propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    traceResults: PropTypes.array,
    fetchServices: PropTypes.func,
    services: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string,
            operations: PropTypes.arrayOf(PropTypes.string),
        })
    ),
    fetchServiceOperations: PropTypes.func,
    loadJsonTraces: PropTypes.func,
}

const stateTraceXformer = memoizeOne(stateTrace => {
    const { traces: traceMap, search } = stateTrace;
    const { query, results, state, error: traceError } = search;

    const loadingTraces = state === fetchedState.LOADING;
    const traces = results.map(id => traceMap[id].data);
    const maxDuration = Math.max.apply(null, traces.map(tr => tr.duration));
    return { traces, maxDuration, traceError, loadingTraces, query };
});

const sortedTracesXformer = memoizeOne((traces, sortBy) => {
    const traceResults = traces.slice();
    sortTraces(traceResults, sortBy);
    return traceResults;
});

const stateServicesXformer = memoizeOne(stateServices => {
    const {
        loading: loadingServices,
        services: serviceList,
        operationsForService: opsBySvc,
        error: serviceError,
    } = stateServices;
    const services =
        serviceList &&
        serviceList.map(name => ({
            name,
            operations: opsBySvc[name] || [],
        }));
    return { loadingServices, services, serviceError };
});

// export for tests
export function mapStateToProps(state) {
    const { services: stServices } = state;
    const { services } = stateServicesXformer(stServices);
    const sortBy = 'MOST_RECENT';
    const { traces } = stateTraceXformer(
        state.trace
    );
    const traceResults = sortedTracesXformer(traces, sortBy);

    return {
        services,
        // traceResults
    };
}

// export for tests
export function mapDispatchToProps(dispatch) {
    console.log("TOM DISPATCH");

    const { fetchMultipleTraces, fetchServiceOperations, fetchServices, searchTraces } = bindActionCreators(jaegerApiActions, dispatch);
    const { loadJsonTraces } = bindActionCreators(fileReaderActions, dispatch);
    console.log(loadJsonTraces);
    const { cohortAddTrace, cohortRemoveTrace } = bindActionCreators(traceDiffActions, dispatch);
    return {
        cohortAddTrace,
        cohortRemoveTrace,
        fetchMultipleTraces,
        fetchServiceOperations,
        fetchServices,
        searchTraces,
        loadJsonTraces,
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SearchTomPageImpl);