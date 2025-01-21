import React, { useEffect, useRef, useState } from 'react'
import Chat from './Chat'
import { CoreStoreState } from '../../../reducers'
import { connect } from 'react-redux'
import { getActiveInstance } from '../../../reducers/instances'
import { diff } from 'jsondiffpatch'

type WhisperProps = ReturnType<typeof mapStateToProps>;
export type TActionsMapStates = { action: string, jsonDiff: string }[]

const WhisperChat = ({ aiConfig, actionsById, computedStates, activeState }: WhisperProps) => {
  const [actionsMapStates, setActionsMapStates] = useState<TActionsMapStates>([])
  const lastTimestamp = useRef(-1)
  
  useEffect(() => {
    lastTimestamp.current = -1 ;
  }, [activeState])
  
  useEffect(() => {
    if(lastTimestamp.current === -1 && actionsById['0']){
      lastTimestamp.current = actionsById['0'].timestamp;
    }
  }, [])

  useEffect(() => {
    const actionsMapState: TActionsMapStates = []

    computedStates.forEach((computedState, index) => {
      if(actionsById[index].timestamp < lastTimestamp.current){
        return;
      }

      let strAction = '', strState = '';
      strAction = JSON.stringify(actionsById[index])
      if(index === 0){
        strState = JSON.stringify(computedState)
      }
      else{
        strState = JSON.stringify(diff(computedState, computedStates[index - 1]))
      }

      actionsMapState.push({ action: strAction, jsonDiff: strState })
    })

    setActionsMapStates(actionsMapState)
    
    const lastAction = actionsById[ `${computedStates.length}` ];
    if(lastAction && lastAction.timestamp){
      lastTimestamp.current = actionsById[ `${computedStates.length}` ].timestamp;
    }

  }, [actionsById, computedStates])

  return (
    <Chat actionsMapStates={actionsMapStates} config={aiConfig} />
  )
}
const mapStateToProps = (state: CoreStoreState) => {
  const activeState = getActiveInstance(state.instances)
  const { actionsById, computedStates } = state.instances.states[activeState]
  return {
    actionsById,
    computedStates,
    aiConfig: state.whisper.config,
    activeState,
  }
}


export default connect(mapStateToProps)(WhisperChat)