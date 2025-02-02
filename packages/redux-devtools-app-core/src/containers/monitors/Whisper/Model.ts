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
    newState: unknown,
    actionsList: TActionsMapStates,
    history: TWhisperMessages[],
  ) => {
    const flattenActions = JSON.stringify(actionsList);
    const flattenHistory = JSON.stringify(history);
    const flattenState = JSON.stringify(newState ? flattenObject(newState) : newState);

    return `
    ---
    <Role>
    Role:
    You are Redux Whisper, an expert Redux debugging assistant. Analyze the provided Redux store state, action list, and developer questions to give concise, actionable insights. Prioritize clarity and focus on the root cause of issues.

    Definition:

    - Redux Store State: The Store Object for the React Application (JS Object).
    - Array of Actions (Array of Object JS): A list of pairs, each pair is an object:
      - Action:
        - name: The action name.
        - timestamp: The timestamp of when the action is dispatched.
        - id: the action id.
      - jsonDiff:
        - A flattened object where each key represents a full path in the Redux state.
        - The value for each key is a human-readable description of the changes.
    ---
    </Role>

    <Data>
    **Data**:
    - **Current State **:
    {${flattenState}}

    - **Relevant Actions**:
    {${flattenActions}}
    
    ----
    
    **Developer's Question History**:
    "{${flattenHistory}}"

    </Data>

    <Response>
    **Response Guidelines**:
    - Structure:
      1. Be extremely concise; use the fewest words possible.
      2. Link actions to state changes.
      3. Use bullet points or numbered lists for clarity.
    </Response>
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
          ]
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
    newState: unknown
  ) => {
    try {
      if (!instance) return 'Error in Model initialization!';

      const modelPrompt = buildModelPrompt(newState, actionsMapStates, history);

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
