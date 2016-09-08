import {connect} from 'react-redux';

import createBeat from '__mySource/components/beat';
import createTickAssignment from '__mySource/components/tickAssignment';
import createTempPlayer from '__mySource/components/tempPlayer';
import {setBeat} from '__mySource/actions';
import {
  calc_tickCount,
  calc_rhTickIndices,
  calc_lhTickIndices
} from '__mySource/models/metronome';

export default (React) => {
  const Metronome = (props) => {
    const Beat = createBeat(React);
    const TickAssignment = createTickAssignment(React);
    const TempPlayer = createTempPlayer(React);

    return (
      <div>
        <Beat {...props}/>
        <p>=========================</p>
        <TickAssignment {...props}/>
        <p>=========================</p>
        <TempPlayer />
      </div>
    );
   };

  const mapStateToProps = (state) => {
    const beat = state;
    const tickCount = calc_tickCount(beat);
    const rhTickIndices = calc_rhTickIndices(beat);
    const lhTickIndices = calc_lhTickIndices(beat);

    return {
      ...beat,
      tickCount,
      rhTickIndices,
      lhTickIndices
    };
  };

  const mapDispatchToProps = (dispatch) => (
    {onSubmit: ({rh, lh}) => dispatch(setBeat({rh, lh}))}
  );

  return connect(
    mapStateToProps,
    mapDispatchToProps
  )(Metronome);
};

