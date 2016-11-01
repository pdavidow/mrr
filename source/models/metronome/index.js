import {
  dropRight,
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

const calc_baseTicks = ({
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

const calc_ticks = ({
  beat = {rh: 1, lh: 1},
  metronomeSetting = {classicTicksPerMinute: 60, classicTicksPerBeat: 1},
  onEndedWithLoop
} = {}) => {
  const baseTicks =  calc_baseTicks({beat, metronomeSetting});
  const spacerTick = asSpacer({tick: last(baseTicks), onEndedWithLoop});

  const ticksWithSpacer = dropRight(baseTicks);
  ticksWithSpacer.push(spacerTick);

  return ticksWithSpacer;
};

const addTicks = ({ticks, beat, metronomeSetting, onEndedWithLoop}) => {
  const contents = calc_ticks({beat, metronomeSetting, onEndedWithLoop});
  Array.prototype.push.apply(ticks, contents);
};

const asSpacer = ({tick, onEndedWithLoop}) => {
  const extra = {isSpacer: true};
  if (onEndedWithLoop != undefined) extra.spacerOnEnded = onEndedWithLoop;
  return {...tick, ...extra};
};

const play = ({
  beat = {rh: 1, lh: 1},
  metronomeSetting = {classicTicksPerMinute: 60, classicTicksPerBeat: 1},
  isLooping = false,
  onLoopCounting,
  onEnded
} = {}) => {
  isStopped = false;
  const ticks = [];
  const onEndedWithLoop = createOnEndedWithLoop({ticks, isLooping, onLoopCounting, onEnded});
  addTicks({ticks, beat, metronomeSetting, onEndedWithLoop});
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
