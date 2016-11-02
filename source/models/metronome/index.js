import {
  flatten,
  includes,
  last,
  range
} from 'lodash';
import {lcm} from 'mathjs';

import {
  playTicks,
  stopTicks
} from '../audio';
////////////////////////////////////

let isStopped = true;

const calc_tickCount = ({
  rh = 1,
  lh = 1
} = {}) => lcm(rh, lh);

const calc_tickIndices = ({
  focus = 'rh',
  beat = {rh:1, lh:1}
} = {}) => {
  const noteCount = beat[focus];
  const tickCount = calc_tickCount(beat);
  const interval = tickCount / noteCount;
  const indicies = [];
  let index = 0;

  while (index < tickCount) {
    indicies.push(index);
    index += interval;
  }
  return indicies;
};

const calc_rhTickIndices = ({
  beat = {rh:1, lh:1}
} = {}) => calc_tickIndices({focus: 'rh', beat});

const calc_lhTickIndices = ({
  beat = {rh:1, lh:1}
} = {}) => calc_tickIndices({focus: 'lh', beat});

const calc_tickDuration = ({
  beat = {rh: 1, lh: 1},
  metronomeSetting = {classicTicksPerMinute: 60, classicTicksPerBeat: 1}
} = {}) => {
  const {classicTicksPerMinute, classicTicksPerBeat} = metronomeSetting;
  const tickCount = calc_tickCount({...beat});
  const ticksPerSec = calc_ticksPerSec({classicTicksPerMinute});

  return classicTicksPerBeat / (tickCount * ticksPerSec);
};

const calc_beatDuration = ({metronomeSetting}) => { // sec
  const {classicTicksPerMinute, classicTicksPerBeat} = metronomeSetting;
  const ticksPerSec = calc_ticksPerSec({classicTicksPerMinute});

  return classicTicksPerBeat * ticksPerSec;
};

const calc_tickStartTimeOffsets = ({
  tickCount = 1,
  duration = 1
} = {}) => {
  let offset = 0;

  return range(tickCount).map(() => {
    const result = offset;
    offset += duration;
    return result;
  });
};

const calc_ticksPerSec = ({
  classicTicksPerMinute = 1
} = {}) => classicTicksPerMinute / 60;

const timeShiftTick = ({tick, amount}) => {
  tick.startOffset += amount;
};

const timeShiftTickArray = ({tickArray, amount}) => {
  tickArray.forEach((tick) => timeShiftTick({tick, amount}));
};

const timeShiftTicksPerBeat = ({ticksPerBeat, beatDuration}) => {
  ticksPerBeat.forEach((tickArray, index) => {
    const amount = beatDuration * index;
    timeShiftTickArray({tickArray, amount});
  });
};

const calc_baseTicksForBeats = ({
  beats = [],
  metronomeSetting = {classicTicksPerMinute: 60, classicTicksPerBeat: 1}
} = {}) => {
  const beatDuration = calc_beatDuration({metronomeSetting});
  const ticksPerBeat =  beats.map((beat) => calc_baseTicksForBeat({beat, metronomeSetting}));
  timeShiftTicksPerBeat({ticksPerBeat, beatDuration});

  return flatten(ticksPerBeat);
};

const calc_baseTicksForBeat = ({
  beat = {rh: 1, lh: 1},
  metronomeSetting = {classicTicksPerMinute: 60, classicTicksPerBeat: 1}
} = {}) => {
  const tickCount = calc_tickCount({...beat});
  const duration = calc_tickDuration({beat, metronomeSetting});
  const tickStartTimeOffsets = calc_tickStartTimeOffsets({tickCount, duration});

  const tick = ({startOffset, index, rhTickIndices, lhTickIndices}) => {
    const isRH = includes(rhTickIndices, index);
    const isLH = includes(lhTickIndices, index);
    return {isRH, isLH, startOffset, duration};
  };

  return tickStartTimeOffsets.map((startOffset, index) => {
    const rhTickIndices = calc_rhTickIndices({beat});
    const lhTickIndices = calc_lhTickIndices({beat});
    return tick({startOffset, index, rhTickIndices, lhTickIndices});
  });
};

const spacerize = ({tick, onEndedWithLoop}) => {
  if (!tick) return;
  const extra = {isSpacer: true};
  if (onEndedWithLoop != undefined) extra.spacerOnEnded = onEndedWithLoop;
  Object.assign(tick, extra);
};

const calc_ticks = ({
  beats = [{rh: 1, lh: 1}],
  metronomeSetting = {classicTicksPerMinute: 60, classicTicksPerBeat: 1},
  onEndedWithLoop
} = {}) => {
  const ticks = calc_baseTicksForBeats({beats, metronomeSetting});
  spacerize({tick: last(ticks), onEndedWithLoop});
  return ticks;
};

const addTicks = ({ticks, beats, metronomeSetting, onEndedWithLoop}) => {
  const contents = calc_ticks({beats, metronomeSetting, onEndedWithLoop});
  Array.prototype.push.apply(ticks, contents);
};

const populateTicks = ({ticks, beats, metronomeSetting, onEndedWithLoop}) =>
  addTicks({ticks, beats, metronomeSetting, onEndedWithLoop});

const play = ({
  beats = [{rh: 1, lh: 1}],
  metronomeSetting = {classicTicksPerMinute: 60, classicTicksPerBeat: 1},
  isLooping = false,
  onLoopCounting,
  onEnded
} = {}) => {
  isStopped = false;
  const ticks = [];
  const onEndedWithLoop = createOnEndedWithLoop({ticks, isLooping, onLoopCounting, onEnded});
  populateTicks({ticks, beats, metronomeSetting, onEndedWithLoop});
  playTicks({ticks});
};

const createOnEndedWithLoop = ({ticks, isLooping, onLoopCounting, onEnded}) => {
  return () => {
    if (!isLooping || isStopped) return onEnded();
    onLoopCounting();
    playTicks({ticks});
  };
};

const stop = () => {
  isStopped = true;
  stopTicks();
};

export {
  calc_tickCount,
  calc_rhTickIndices,
  calc_lhTickIndices,
  calc_tickDuration,
  calc_tickStartTimeOffsets,
  calc_ticks,
  play,
  playTicks,
  stop
};
