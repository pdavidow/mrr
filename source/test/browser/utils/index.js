import React from 'react';
import {Provider} from 'react-redux';
import {createStore} from 'redux';
import {renderIntoDocument} from 'react-addons-test-utils';
import reactDom from 'react-dom';
import {forOwn} from 'lodash';

import createApp from '../../../App';
import combinedReducers from '../../../store/reducers';
import {
  setBeat,
  setMetronomeSetting,
  setPlayerSetting
} from '../../../actions';
////////////////////////////////////

const defaultStore = () => createStore(combinedReducers);

const setStore = ({
  store = defaultStore(),
  beat,
  metronomeSetting,
  playerSetting
}) => {
  const newStore = {...store};
  if (beat != undefined) newStore.dispatch(setBeat({...beat}));
  if (metronomeSetting != undefined) newStore.dispatch(setMetronomeSetting({...metronomeSetting}));
  if (playerSetting != undefined) newStore.dispatch(setPlayerSetting({...playerSetting}));
  return newStore;
};

const getDomNode = ({
  store = defaultStore()
} = {}) => {
  const App = createApp(React);

  const element =
    <Provider store={store}>
      <App />
    </Provider>;

  const renderedComp = renderIntoDocument(element);
  return reactDom.findDOMNode(renderedComp);
};

const getElementBySelector = ({domNode, selector}) => domNode.querySelector(selector);

const waitInAudioTime = ({waitTime, audioContext, startTime}) => {
  // all times in seconds
  while ((audioContext.currentTime - startTime) <= waitTime) {/* do nothing */};
};

const embeddedAudioTest = {};

const audioTest = ({audioContext, oscillator, startOffset, playDuration}) => {
  // if (production) return false; // todo

  let result = false;

  forOwn(embeddedAudioTest, ((test) => { // only one test should be defined at any given time
    if (test) {
      test({audioContext, oscillator, startOffset, playDuration});
      result = true;
      return false; // exit iteration early by explicitly returning false. https://lodash.com/docs/4.16.4#forOwn
    };
  }));

  return result;
};

export {
  getDomNode,
  getElementBySelector,
  defaultStore,
  setStore,
  waitInAudioTime,
  embeddedAudioTest,
  audioTest
};
