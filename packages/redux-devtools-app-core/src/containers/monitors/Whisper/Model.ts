import OpenAI from 'openai';
import { TActionsMapStates } from './index';
import { TModel } from '../../../components/Settings/AIConfig';
import { useEffect, useState } from 'react';
import { CohereClientV2 } from 'cohere-ai';
import { TWhisperMessages } from '../../../reducers/aiconfig';
import { flattenObject } from './utils';
type TInstance = OpenAI | CohereClientV2 | null;


const useAIModel = (config: TModel) => {
  const [instance, setInstance] = useState<TInstance>(null);

  const buildModelPrompt = (
    actionsList: TActionsMapStates,
    history: TWhisperMessages[],
  ) => {
    const flattenActions = JSON.stringify(actionsList);
    const flattenHistory = JSON.stringify(history);

    console.log({ actionsList });
    return `
      You are a debugging assistant for a Redux application. 
      I will provide you with:
        - Mapping of Actions and the jsonDiff: list of pairs, each pair is [action, jsonDiff] where action is the name of the dispatched action, and jsonDiff containe the diffrence between the new store and the last store content.
        - History conversation.

      Your task is to analyze the provided json stringify data,
      and answer questions about the Redux store and its modifications, a modification in store state is any CRUD operation to the store state.

  
      ###  Mapping of Actions and the jsonDiff.
      [${flattenActions}]

      ### History conversation
      [${flattenHistory}]

      ### Instructions for the Answer
      1. The Answer should be based (mostly) on the last actions, analyse them carefully, with deep reasoning.
      1. Provide the **minimal possible answer** that directly addresses the user's question.
      3. If multiple actions or diffs are relevant, list them succinctly.
      4. If the question cannot be answered with the provided data, specify that and suggest what additional information or clarification might be needed.
  
      ### Example Output:  
      *"The action \`REMOVE_ITEM\` triggered the removal of an item from the cart."*   
      *"The last modification was caused by the \`UPDATE_USER\` action, which changed the user's name from 'John' to 'Jane'."*]
      ---
    `
  }

  const createAnswer = async (
    modelPrompt: string,
    userPrompt: string,
  ): Promise<string> => {
    switch (true) {
      case instance instanceof OpenAI: {
        const completion = await instance?.chat.completions.create({
          model: config.model as unknown as string,
          messages: [
            {
              role: 'system',
              content: modelPrompt,
            },
            {
              role: 'user',
              content: userPrompt,
            },
          ],
        });

        return (
          completion?.choices[0].message.content || "i can't an answer :( !!!"
        );
      }
      case instance instanceof CohereClientV2: {
        const response = await instance.chat({
          model: config.model as unknown as string,
          messages: [
            {
              role: 'system',
              content: modelPrompt,
            },
            {
              role: 'user',
              content: userPrompt,
            },
          ],
        });
        const content = response.message.content;

        if (!content) return "i can't an answer :( !!!";
        return content[0].text;
      }
      default:
        return 'ERROR MODEL RESPOSE!!';
    }
  };

  const modelAnswer = async (
    userMessage: string,
    actionsMapStates: TActionsMapStates,
    history: TWhisperMessages[],
  ) => {
    try {
      if (!instance) return 'Error in Model initialization!';

      const modelPrompt = buildModelPrompt(actionsMapStates, history);

      return await createAnswer(modelPrompt, userMessage);
    } catch (ex: any) {
      console.error(ex);
      return `Something wrong with your provider!!!, ${ex.message}`;
    }
  };

  useEffect(() => {
    switch (config.provider) {
      case 'xAI': {
        const _instance = new OpenAI({
          apiKey: config.apiKey,
          dangerouslyAllowBrowser: true,
          baseURL: 'https://api.x.ai/v1',
        });

        setInstance(_instance);
        return;
      }
      case 'OpenAI': {
        const _instance = new OpenAI({
          apiKey: config.apiKey,
          dangerouslyAllowBrowser: true,
        });

        setInstance(_instance);
        return;
      }
      case 'Cohere': {
        const _instance = new CohereClientV2({
          token: config.apiKey,
        });

        setInstance(_instance);
        return;
      }
      case 'Deepseek': {
        const _instance = new OpenAI({
          apiKey: config.apiKey,
          dangerouslyAllowBrowser: true,
          baseURL: 'https://api.deepseek.com',
        });

        setInstance(_instance);
        return;
      }
      default: {
        // setInstance(null) // TODO:we should not set the instance to null
      }
    }
  }, [config]);

  return {
    modelAnswer,
  };
};

export { useAIModel };
