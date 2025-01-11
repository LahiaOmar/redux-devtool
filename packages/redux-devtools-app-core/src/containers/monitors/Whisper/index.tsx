import React, { useEffect, useState } from 'react'
import Chat from './Chat'
import { CoreStoreState } from '../../../reducers'
import { connect } from 'react-redux'
import { getActiveInstance } from '../../../reducers/instances'
import { diff } from 'jsondiffpatch'

type WhisperProps = ReturnType<typeof mapStateToProps>;
export type TActionsMapStates = { action: string, stateDiff: string }[]

const WhisperChat = ({ aiConfig, actionsById, computedStates }: WhisperProps) => {
  const [actionsMapStates, setActionsMapStates] = useState<TActionsMapStates>([])

  useEffect(() => {
    const actionsMapState: TActionsMapStates = []

    computedStates.forEach((computedState, index) => {
      let strAction = '', strState = '';
      strAction = JSON.stringify(actionsById[index])
      if(index === 0){
        strState = JSON.stringify(computedState)
      }
      else{
        strState = JSON.stringify(diff(computedState, computedStates[index - 1]))
      }

      actionsMapState.push({ action: strAction, stateDiff: strState })
    })

    setActionsMapStates(actionsMapState)

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
    aiConfig: state.whisper.config
  }
}


export default connect(mapStateToProps)(WhisperChat)