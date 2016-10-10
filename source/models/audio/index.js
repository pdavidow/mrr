import {
  AUDIO_FREQ_RH,
  AUDIO_FREQ_LH,
  AUDIO_FREQ_RH_LH,
  AUDIO_FREQ_BACKGROUND,
  TICK_DURATION_RH,
  TICK_DURATION_LH,
  TICK_DURATION_RH_LH,
  TICK_DURATION_BACKGROUND
} from '../../constants/audio';

import {
  isTick_Rh,
  isTick_Lh,
  isTick_RhLh,
  isTick_Background
} from '../tick';

import {getDestination} from './destination'; // todo ...

import {audioTest} from '../../test/browser/utils';
////////////////////////////////////

let audioContext;
let oscillators = [];

const initialize = () => {
  try {
  // NOTE: THIS RELIES ON THE MONKEYPATCH LIBRARY BEING LOADED FROM
  // Http://cwilso.github.io/AudioContext-MonkeyPatch/AudioContextMonkeyPatch.js
  // TO WORK ON CURRENT CHROME!!  But this means our code can be properly
  // spec-compliant, and work on Chrome, Safari and Firefox.
    if (audioContext == undefined) audioContext = new AudioContext();
  }
  catch (e) {
    alert('Web Audio API is not supported in current browser');
  };
};

const initializedAudioContext = () => {
  initialize();
  return audioContext;
};

const playTicks = ({
  ticks = []
} = {}) => {
  oscillators = [];
  ticks.forEach((each) => {
    const {startOffset, onEnded} = each;

    if (isTick_Background(each)) return playTick_Background({startOffset, onEnded});
    if (isTick_Rh(each)) return playTick_Rh({startOffset, onEnded});
    if (isTick_Lh(each)) return playTick_Lh({startOffset, onEnded});
    if (isTick_RhLh(each)) return playTick_RhLh({startOffset, onEnded});
    }
  )
};

const playTick_Rh = ({startOffset, onEnded}) => {
  const oscillator = oscillator_Rh();
  const duration = TICK_DURATION_RH;
  playOscillator({oscillator, startOffset, duration, onEnded});
};
const playTick_Lh = ({startOffset, onEnded}) => {
  const oscillator = oscillator_Lh();
  const duration = TICK_DURATION_LH;
  playOscillator({oscillator, startOffset, duration, onEnded});
};
const playTick_RhLh = ({startOffset, onEnded}) => {
  const oscillator = oscillator_RhLh();
  const duration = TICK_DURATION_RH_LH;
  playOscillator({oscillator, startOffset, duration, onEnded});
};
const playTick_Background = ({startOffset, onEnded}) => {
  const oscillator = oscillator_Background();
  const duration = TICK_DURATION_BACKGROUND;
  playOscillator({oscillator, startOffset, duration, onEnded});
};

const playOscillator = ({oscillator, startOffset = 0, duration = 1, onEnded}) => {
  oscillators.push(oscillator);
  if (onEnded != undefined) oscillator.onended = onEnded;

  if (audioTest({audioContext, oscillator})) return; //////////////////////////

  const startTime = audioContext.currentTime + startOffset;
  const destination = getDestination({audioContext}); // todo still needed?

  oscillator.connect(destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration);
};

const oscillator_Rh = () => {
  const freq = AUDIO_FREQ_RH;
  return oscillator({freq});
};
const oscillator_Lh = () => {
  const freq = AUDIO_FREQ_LH;
  return oscillator({freq});
};
const oscillator_RhLh = () => {
  const freq = AUDIO_FREQ_RH_LH;
  return oscillator({freq});
};
const oscillator_Background = () => {
  const freq = AUDIO_FREQ_BACKGROUND;
  return oscillator({freq});
};

const oscillator = ({
  freq = 0
} = {}) => {
  const oscillator = audioContext.createOscillator();
  oscillator.frequency.value = freq;
  return oscillator;
};

const stopTicks = () => oscillators.forEach((each) => each.stop());

export {
  initialize,
  initializedAudioContext,
  playTicks,
  stopTicks
};



