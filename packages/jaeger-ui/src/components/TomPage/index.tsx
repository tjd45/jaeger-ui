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
import * as React from 'react';
import { Input } from 'antd';
import { Location, History as RouterHistory } from 'history';
import _clamp from 'lodash/clamp';
import _get from 'lodash/get';
import _mapValues from 'lodash/mapValues';
import _memoize from 'lodash/memoize';
import { connect, Dispatch } from 'react-redux';
import { match as Match } from 'react-router-dom';
import { bindActionCreators } from 'redux';

import { TUpdateViewRangeTimeFunction, IViewRange, ViewRangeTimeUpdate, ETraceViewType } from './types';
import { getLocation, getUrl } from './url';
import ErrorMessage from '../common/ErrorMessage';
import LoadingIndicator from '../common/LoadingIndicator';
import { extractUiFindFromState } from '../common/UiFindInput';
import * as jaegerApiActions from '../../actions/jaeger-api';
import { getUiFindVertexKeys } from '../TraceDiff/TraceDiffGraph/traceDiffGraphUtils';
import { fetchedState } from '../../constants';
import { FetchedTrace, ReduxState, TNil } from '../../types';
import { Trace } from '../../types/trace';
import { TraceArchive } from '../../types/archive';
import { EmbeddedState } from '../../types/embedded';
import filterSpans from '../../utils/filter-spans';
import updateUiFind from '../../utils/update-ui-find';

import TomHeader from './TomHeader';
import TomContent from './TomContent';

import './index.css';

type TDispatchProps = {
  fetchTrace: (id: string) => void;
};

type TOwnProps = {
  history: RouterHistory;
  location: Location;
  match: Match<{ id: string }>;
};

type TReduxProps = {
  archiveEnabled: boolean;
  archiveTraceState: TraceArchive | TNil;
  embedded: null | EmbeddedState;
  id: string;
  searchUrl: null | string;
  trace: FetchedTrace | TNil;
  uiFind: string | TNil;
};

type TProps = TDispatchProps & TOwnProps & TReduxProps;

type TState = {
  headerHeight: number | TNil;
  slimView: boolean;
  viewType: ETraceViewType;
  viewRange: IViewRange;
};

export class TomPageImpl extends React.PureComponent<TProps, TState> {
  state: TState;
  _filterSpans: typeof filterSpans;

  constructor(props: TProps) {
    super(props);
    const { embedded, trace } = props;
    this.state = {
      headerHeight: null,
      slimView: Boolean(embedded && embedded.timeline.collapseTitle),
      viewType: ETraceViewType.TraceTimelineViewer,
      viewRange: {
        time: {
          current: [0, 1],
        },
      },
    };

    this._filterSpans = _memoize(
      filterSpans,
      // Do not use the memo if the filter text or trace has changed.
      // trace.data.spans is populated after the initial render via mutation.
      textFilter =>
        `${textFilter} ${_get(this.props.trace, 'traceID')} ${_get(this.props.trace, 'data.spans.length')}`
    );
  }

  componentDidMount() {}

  render() {
    const trace = this.props.trace;
    return (
      <div className="t-wrapper">
        <TomHeader />
        <TomContent trace={trace} />
        <div className="traceData">Footer</div>
      </div>
    );
  }
}

export function mapStateToProps(state: ReduxState, ownProps: TOwnProps): TReduxProps {
  const { id } = ownProps.match.params;
  const { archive, config, embedded, router } = state;
  const { traces } = state.trace;
  const trace = id ? traces[id] : null;
  const archiveTraceState = id ? archive[id] : null;
  const archiveEnabled = Boolean(config.archiveEnabled);
  const { state: locationState } = router.location;
  const searchUrl = (locationState && locationState.fromSearch) || null;

  return {
    ...extractUiFindFromState(state),
    archiveEnabled,
    archiveTraceState,
    embedded,
    id,
    searchUrl,
    trace,
  };
}

// export for tests
export function mapDispatchToProps(dispatch: Dispatch<ReduxState>): TDispatchProps {
  const { fetchTrace } = bindActionCreators(jaegerApiActions, dispatch);

  return { fetchTrace };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TomPageImpl);
