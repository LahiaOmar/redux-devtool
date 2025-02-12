import React, { useEffect, useRef, useState } from 'react';
import Chat from './Chat';
import { CoreStoreState } from '../../../reducers';
import { connect } from 'react-redux';
import { getActiveInstance } from '../../../reducers/instances';
import { diff } from 'jsondiffpatch';
import { cleanDiff, flattenObject } from './utils';

type WhisperProps = ReturnType<typeof mapStateToProps>;
export type TActionsMapStates = { action: string; jsonDiff: string }[];

const WhisperChat = ({
  aiConfig,
  actionsById,
  clientStore,
  computedStates,
}: WhisperProps) => {
  const [actionsMapStates, setActionsMapStates] = useState<TActionsMapStates>(
    [],
  );

  useEffect(() => {
    const actionsMapState: TActionsMapStates = [];

    computedStates.forEach((computedState, index) => {
      let strAction = '', strState = '';
      const action = actionsById[index];
      
      if(!action) return;

      strAction = JSON.stringify({ name : action.action?.type, timestamp: action.timestamp , id: index});

      if (index === 0) {
        strState = JSON.stringify(flattenObject(computedState));
      } else {
        const left = computedStates[index - 1]; // the prev one
        const right = computedState; // the new one.

        const delta = diff(left, right);

        if(delta){
          const cleanedDelta = cleanDiff(delta);
          if(cleanedDelta){
            const flattend = flattenObject(cleanedDelta);
            strState = JSON.stringify(flattend)
          }
        }
      }

      if (strState) {
        actionsMapState.push({ action: strAction, jsonDiff: strState });
      }
    });

    setActionsMapStates(actionsMapState);
  }, [actionsById, computedStates]);

  return (
    <Chat
      actionsMapStates={actionsMapStates}
      config={aiConfig}
      computedStore={clientStore}
    />
  );
};
const mapStateToProps = (state: CoreStoreState) => {
  const activeState = getActiveInstance(state.instances);
  const { actionsById, computedStates } = state.instances.states[activeState];
  const lastComputedStateIndex = Math.max(0, computedStates.length - 1);
  const clientStore = computedStates[lastComputedStateIndex]; 

  return {
    actionsById,
    computedStates,
    clientStore,
    aiConfig: state.whisper.config,
  };
};

export default connect(mapStateToProps)(WhisperChat);
