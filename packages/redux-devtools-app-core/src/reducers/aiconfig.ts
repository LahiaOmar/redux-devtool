import { CoreStoreAction } from '../actions'
import { TModel } from '../components/Settings/AIConfig'


export type TWhisperMessages = { message: string, sender: 'model' | 'user' }
export type TStoreWhisper = { config: TModel, messages: { [key: string]: TWhisperMessages[] } }

const initialState: TStoreWhisper = {
  config: {
    provider: '', model: '', apiKey: '', baseURL: ''
  }, messages: {}
} 

export const whisperReducer = (state: TStoreWhisper = initialState , action: CoreStoreAction): TStoreWhisper => {
  
  if(action.type === 'save_ai_config'){
    const { payload: {provider, apiKey, model, baseURL} } = action
    
    return {
      ...state,
      config: {
        provider, apiKey, model, baseURL
      }
    }
  }

  if(action.type === 'clear_ai_config'){
    return {
      ...state, 
      config: {
        provider: '', model: '', apiKey: '', baseURL: ''
      }
    }
  }

  if(action.type === 'clear_ai_messages'){
    const { instanceId } = action.payload
    return {
      ...state,
      messages: {
        ...state.messages,
        [instanceId]: []
      }
    }
  }

  if(action.type === 'save_ai_messages'){
    const { instanceId, messages } = action.payload
    return {
      ...state,
      messages: {
        ...state.messages,
        [instanceId]: messages
      }
    }
  }

  return state
}