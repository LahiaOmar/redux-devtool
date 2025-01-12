import { Button, Container, Form, Notification } from '@redux-devtools/ui';
import { IChangeEvent } from '@rjsf/core';
import { JSONSchema7Definition, JSONSchema7TypeName } from 'json-schema';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CoreStoreState } from '../../reducers';
import { clearConfig, saveConfig } from '../../actions';
import styled from 'styled-components';
import { LuSave } from 'react-icons/lu';
import { MdClear } from 'react-icons/md';
import { IconType } from 'react-icons';

interface Schema {
  type: JSONSchema7TypeName;
  required?: string[];
  title: string;
  properties: {
    [key: string]: JSONSchema7Definition;
  };
}

const PROVIDERS_AND_MODELS = {
  OpenAI: {
    models: ['gpt-4o', 'gpt-4o-mini'],
  },
  xAI: {
    models: ['grok-2-1212'],
    baseURL: 'https://api.x.ai/v1',
  },
  Ollama: {
    models: ['llama2:13b'],
  },
  Cohere: {
    models: ['command-r-plus'],
  },
};

const PROVIDERS = ['xAI', 'OpenAI', /**'Ollama' ,*/ 'Cohere'];

export type TProviders = keyof typeof PROVIDERS_AND_MODELS;
export type TProvidersModels = {
  [k in TProviders]: (typeof PROVIDERS_AND_MODELS)[k]['models'][number];
};
interface FormData {
  provider: TProviders | '';
  model: TProvidersModels | '';
  apiKey: string;
}

export type TModel = {
  model: TProvidersModels | '';
  provider: TProviders | '';
  apiKey: string;
  baseURL: string;
};

const ERRORS = {
  apiKey: 'Insert an API KEY!',
  model: 'Select a Model Name!',
  provider: 'Selct a Provider!',
};

const defaultSchema: Schema = {
  type: 'object',
  title: 'Model Configuration',
  properties: {
    provider: {
      type: 'string',
      title: 'Provider',
      enum: PROVIDERS,
    },
    model: {
      type: 'string',
      title: 'Model Name',
      enum: [],
    },
    apiKey: {
      type: 'string',
      title: 'API KEY',
    },
  },
};

const defaultFormData: FormData = {
  provider: '',
  model: '',
  apiKey: '',
};

type TConfig = Partial<Omit<TModel, 'baseURL'>>;

const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: row;
  column-gap: 10px;
`;
const createConfigButton = (icon: IconType) => styled(icon)`
  width: '60px';
  height: '40px';
`;

const SaveConfig = createConfigButton(LuSave);
const ClearConfig = createConfigButton(MdClear);
const SAVE_SUCCESSFULLY_MESSAGE = 'Saved Successfully'
const CLEAR_SUCCESSFULLY_MESSAGE = 'Cleared Successfully'

const AIConfig = () => {
  const [config, setConfig] = useState<TConfig | null>();
  const [uiFeedbackMessage, setUiFeedbackMessage]= useState('');

  const [formConfig, setFormConfig] = useState<{
    schema: Schema;
    formData: FormData;
    errors: string[];
  }>({
    schema: defaultSchema,
    formData: defaultFormData,
    errors: [],
  });
  const dispatch = useDispatch();
  const storeAiConfig = useSelector(
    (state: CoreStoreState) => state.whisper.config,
  );

  useEffect(() => {
    const storeConfig = storeAiConfig;

    setConfig(storeConfig);
    setFormConfig({
      ...formConfig,
      formData: {
        ...formConfig.formData,
        provider: storeConfig.provider,
        model: storeConfig.model,
        apiKey: storeConfig.apiKey,
      },
      schema: {
        ...formConfig.schema,
        properties: {
          ...formConfig.schema.properties,
          model: {
            type: 'string',
            title: 'Model Name',
            enum: storeConfig.provider ? PROVIDERS_AND_MODELS[storeConfig.provider].models : [],
          },
        },
      },
    });
  }, [storeAiConfig?.provider]);

  const formChange = ({ formData, schema }: IChangeEvent<FormData>) => {
    if (formData) {
      let _schema = {
        ...schema,
      };
      let _formData = {
        ...formData,
      };

      if (
        formData.provider &&
        formData.provider !== formConfig.formData.provider
      ) {
        _schema = {
          ...schema,
          properties: {
            ...schema.properties,
            model: {
              type: 'string',
              title: 'Model Name',
              enum: PROVIDERS_AND_MODELS[formData.provider].models,
            },
          },
        };
        // clear the previous model selected.
        _formData = {
          ..._formData,
          model: '',
        };
      }

      setFormConfig({
        ...formConfig,
        formData: _formData,
        schema: _schema as Schema,
      });

      setConfig({
        model: _formData.model,
        apiKey: _formData.apiKey,
        provider: _formData.provider,
      } as TConfig);
    }
  };

  const actionUIFeedback = (message: string) => {
    setUiFeedbackMessage(message)
    setTimeout(() => {
      setUiFeedbackMessage('')
    }, 2000)
  }

  const handleSave = () => {
    const errors: string[] = [];

    if (!config || !config.model) {
      errors.push(ERRORS.model);
    }
    if (!config || !config.provider) {
      errors.push(ERRORS.provider);
    }
    if (!config || !config.apiKey) {
      errors.push(ERRORS.apiKey);
    }

    setFormConfig({
      ...formConfig,
      errors,
    });
    if (!errors.length && config) {
      // should save a config with some redux actions.
      dispatch(
        saveConfig({
          ...config,
          baseURL: '',
        } as TModel),
      );

      //UI feedback
      actionUIFeedback(SAVE_SUCCESSFULLY_MESSAGE)
    }
  };

  const clearPreviousConfig = () => {
    if (storeAiConfig) {
      dispatch(clearConfig());
      actionUIFeedback(CLEAR_SUCCESSFULLY_MESSAGE)

    }
  };

  return (
    <Container>
      <Form
        noSubmit={true}
        formData={formConfig.formData}
        schema={formConfig.schema}
        uiSchema={{
          apiKey: {
            'ui:widget': 'password',
          },
        }}
        onChange={formChange}
      />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          padding: '10px',
        }}
      >
        <ButtonsContainer>
          <Button
            title="Save Config"
            tooltipPosition="top-right"
            onClick={handleSave}
          >
            <SaveConfig />
          </Button>
          <Button
            title="Clear Previous Config!"
            tooltipPosition="top-right"
            onClick={clearPreviousConfig}
          >
            <ClearConfig />
          </Button>
        </ButtonsContainer>
        {formConfig.errors.map((error, index) => {
          return (
            <Notification key={index} type="error">
              {error}
            </Notification>
          );
        })}
        {
          uiFeedbackMessage && (
            <Notification type='success'> { uiFeedbackMessage } </Notification>
          )
        }
      </div>
    </Container>
  );
};

export default AIConfig;
