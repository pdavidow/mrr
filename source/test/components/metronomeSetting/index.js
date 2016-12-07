import React from 'react';
import reactDom from 'react-dom/server';
import test from 'tape';
import dom from 'cheerio';
import {Provider} from 'react-redux';
import {createStore} from 'redux';

import createMetronomeContainer from '../../../containers/metronome';
import combinedReducers from '../../../store/reducers';
////////////////////////////////////

const MetronomeContainer = createMetronomeContainer(React);
const render = reactDom.renderToStaticMarkup;

test('MetronomeSetting component', nest => {
  nest.test('Tags', assert => {
    const msg = 'Should have classicTicksPerMinute, classicTicksPerBeat classes';

    const store = createStore(combinedReducers);

    const el =
      <Provider store={store}>
        <MetronomeContainer />
      </Provider>;
    const $ = dom.load(render(el));

    const actual = {
      classicTicksPerMinute: Boolean($('.classicTicksPerMinute').html()),
      classicTicksPerBeat: Boolean($('.classicTicksPerBeat').html())
    };

    const expected = {
      classicTicksPerMinute: true,
      classicTicksPerBeat: true
    };

    assert.deepEqual(actual, expected, msg);
    assert.end();
  });
});

