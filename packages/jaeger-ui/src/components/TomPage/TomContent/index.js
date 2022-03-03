// Copyright (c) 2017 The Jaeger Authors.
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
/* eslint-disable react/require-default-props */
import * as React from 'react';
import PropTypes from 'prop-types';

const TomContent = ({ trace }) => {
    return (
        <section id="tomContent" className="t-content-wrapper">
            <nav id='tomSidebarL' className='t-sidebar-l'>
                left sidebar
            </nav>
            <section id="tomTrace" className="t-trace scrollbar-hidden">
                <pre>{trace ? JSON.stringify(trace.data.spans, null, 2) : 'No Data'}</pre>
            </section>
            <nav id='tomSidebarR' className='t-sidebar-r'>
                right sidebar
            </nav>

        </section>
    )
};


TomContent.propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    trace: PropTypes.object
}

export default TomContent;