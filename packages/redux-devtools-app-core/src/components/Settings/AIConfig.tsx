import { Container, Form, Notification } from '@redux-devtools/ui';
import { IChangeEvent } from '@rjsf/core';
import { JSONSchema7Definition, JSONSchema7TypeName } from 'json-schema';
import { type } from 'os';
import React, { useState } from 'react';

interface Schema {
  type: JSONSchema7TypeName;
  required?: string[];
  title: string;
  properties: {
    [key: string]: JSONSchema7Definition;
  };
}

interface FormData {
  model: string;
  apiKey: string;
}

export type TModel = { model: string, provider: string, apiKey: string }

const MODELS: Pick<TModel, 'model' | 'provider'>[] = [
  { model: 'grok-2-1212', provider: 'OpenAI' },
  { model: 'gpt-4o', provider: 'OpenAI'},
  { model: 'gpt-40-mini', provider: 'OpenAI'}
]

const ERRORS = {
  apiKey: 'Insert an API KEY!',
  model: 'Select a Model Name!'
}

const defaultSchema: Schema = {
  type: 'object',
  title: 'Select your provider, and insert your API key.',
  required: ['apiKey', 'provider'],
  properties: {
    model: {
      type: 'string',
      title: 'Model Name',
      enum: MODELS.map(({ model }) => model),
    },
    apiKey: {
      type: 'string',
      title: 'API KEY',
    }
  },
};

const defaultFormData: FormData = {
  model: '',
  apiKey: '',
};

const AIConfig = () => {
  const [config, setConfig] = useState<TModel>({ model: '', provider: '',  apiKey: '' })
  const [formConfig, setFormConfig] = useState<{
    schema: Schema, formData: FormData, errors: string[]
  }>({
    schema: defaultSchema,
    formData: defaultFormData,
    errors: []
  });

  const formChange = ({ formData, schema}: IChangeEvent<FormData>) => {
    if (formData) {
      setFormConfig({
        ...formConfig,
        formData: formData,
        schema: schema as Schema,
      });

      setConfig({
        model: formData.model,
        apiKey: formData.apiKey,
        provider: MODELS.find(({ model }) => model === formData.model)?.provider || 'OpenAI',
      })
    }
  };

  const handleSave = () => {
    const errors: string[] = []
    if(!config.apiKey){
      errors.push(ERRORS.apiKey)
    }
    if(!config.model){
      errors.push(ERRORS.model)
    }

    setFormConfig({
      ...formConfig,
      errors
    })

    if(!errors.length){
      // should save a config with some redux actions.
    }
  }

  return (
    <Container>
      <Form
        noSubmit={true}
        formData={formConfig.formData}
        schema={formConfig.schema}
        onChange={formChange}
      />  
      <div style={{
        display:'flex',
        flexDirection: 'column',
        gap:'10px',
        padding: '10px'
      }}>
        <button
          onClick={handleSave}
          style={{
            padding: '10px',
            width: '60px',
            height: '40px',
            textAlign: 'center',
            fontSize: '13px',
            transform: 'CAPITALIZE',
          }}
        >
          save
        </button>
        {
          formConfig.errors.map((error, index) => {
            return (
              <Notification key={index} type='error'>{error}</Notification>
            )
          })
        }
      </div>
    </Container>
  );
};

export default AIConfig;
