import { CoreStoreAction } from '../actions'

export const aiConfigReducer = (state = {} , action: CoreStoreAction) => {
  
  if(action.type === 'save_ai_config'){
    const { payload: {provider, apiKey, model, baseURL} } = action
    
    return {
      provider,
      apiKey,
      model,
      baseURL,
    }
  }

  if(action.type === 'clear_ai_config'){
    return {
      provider: '',
      apiKey: '',
      model: '',
      baseURL: '',
    }
  }

  return state
}