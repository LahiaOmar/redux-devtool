import OpenAI from 'openai'
import { TActionsMapStates } from './index'
import { TModel } from '../../../components/Settings/AIConfig'
import { useEffect, useState } from 'react'
import { CohereClient, CohereClientV2 } from 'cohere-ai'
type TInstance = OpenAI | CohereClientV2 | null

const useAIModel  = (config: TModel) => {
  const [instance, setInstance] = useState<TInstance>(null)

  const buildModelPrompt = (actionsList: TActionsMapStates) => {
    return `
      You are a debugging assistant for a Redux application. 
      I will provide you with a list of actions that have occurred and the differences (diffs) between the previous state and the current state of the Redux store. 
      Your task is to analyze the provided data and answer questions about the Redux store and its modifications.
  
      ### Actions and State Differences.
      [${JSON.stringify(actionsList)}]
    
      ### Instructions for the Answer
      1. Provide the **minimal possible answer** that directly addresses the user's question.
      2. Ensure the answer is as **clear and precise** as possible.
      3. If multiple actions or diffs are relevant, list them succinctly.
      4. If the question cannot be answered with the provided data, specify that and suggest what additional information or clarification might be needed.
  
      ### Example Output:  
      *"The action \`REMOVE_ITEM\` triggered the removal of an item from the cart."*   
      *"The last modification was caused by the \`UPDATE_USER\` action, which changed the user's name from 'John' to 'Jane'."*]
  
      ---
  
      **How it Works in Practice:**
  
      For a question like:  
      *"Which actions caused items to be removed from the store?"*
  
      You should respond with:  
      - \`"REMOVE_ITEM"\` removed an item with the \`inventory\`.  
      - *"No actions in the log triggered the removal of items from the store."*
      ---
    `
  }

  const createAnswer = async (modelPrompt: string, userPrompt: string): Promise<string> => {

    switch(true){
      case instance instanceof OpenAI: {
        const completion = await instance?.chat.completions.create({
          model: (config.model) as unknown as string,
          messages: [
            {
              role: 'system',
              content: modelPrompt,
            },
            {
              role: 'user',
              content: userPrompt
            }
          ]
        })
    
        return completion?.choices[0].message.content || 'i can\'t an answer :( !!!'
      }
      case instance instanceof CohereClientV2 : {
        const response = await instance.chat({
          model: (config.model) as unknown as string,
          messages: [
            {
              role: 'system',
              content: modelPrompt
            },
            {
              role: 'user',
              content: userPrompt
            }
          ]
        })
        const content = response.message.content

        if(!content) return 'i can\'t an answer :( !!!'
        return content[0].text
      }
      default:
        return 'ERROR MODEL RESPOSE!!'
    }
  }

  const modelAnswer = async (userMessage: string, actionsMapStates: TActionsMapStates) => {
    if(!instance) return 'Error in Model initialization!'

    const modelPrompt = buildModelPrompt(actionsMapStates)
  
    return await createAnswer(modelPrompt, userMessage)
  }

  useEffect(() => {
    switch(config.provider){
      case 'xAI': {
        const _instance  = new OpenAI({
          apiKey: config.apiKey,
          dangerouslyAllowBrowser: true,
          baseURL: "https://api.x.ai/v1"
        })

        setInstance(_instance)
        return;
      }
      case 'OpenAI' : {
        const _instance = new OpenAI()

        setInstance(_instance)
        return ;
      }
      case 'Cohere': {
        const _instance = new CohereClientV2({
          token: config.apiKey
        })

        setInstance(_instance)
        return ;
      }
      default:{
        // setInstance(null) // TODO:we should not set the instance to null
      }
    }
  }, [config])

  return {
    modelAnswer
  }
}

export { useAIModel }