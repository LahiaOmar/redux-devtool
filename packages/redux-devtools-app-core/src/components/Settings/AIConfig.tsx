import { Container, Form } from '@redux-devtools/ui';
import { IChangeEvent } from '@rjsf/core';
import { JSONSchema7Definition, JSONSchema7TypeName } from 'json-schema';
import React, { useState } from 'react';

interface IStateConfig {
  provider: string;
  apiKey: string;
}
interface Schema {
  type: JSONSchema7TypeName;
  required?: string[];
  title: string;
  properties: {
    [key: string]: JSONSchema7Definition;
  };
}

interface FormData {
  provider: string;
  apiKey: string;
}

const defaultSchema: Schema = {
  type: 'object',
  title: 'Select your provider, and insert your API key.',
  required: ['apiKey', 'provider'],
  properties: {
    provider: {
      type: 'string',
      title: 'Provider name',
      enum: ['xAI', 'OpenAI'],
    },
    apiKey: {
      type: 'string',
      title: 'API KEY',
    }
  },
};

const defaultFormData: FormData = {
  provider: '',
  apiKey: '',
};

const AIConfig = () => {
  const [formConfig, setFormConfig] = useState({
    schema: defaultSchema,
    formData: defaultFormData,
  });

  const formChange = (data: IChangeEvent<FormData>) => {
    if (data.formData) {
      setFormConfig({
        formData: data.formData,
        schema: data.schema as Schema,
      });
    }
  };

  const handleSave = () => {
    console.log('should save the config', { formConfig })
  }

  return (
    <Container>
      <Form
        noSubmit={true}
        formData={formConfig.formData}
        schema={formConfig.schema}
        onChange={formChange}
      />
      <div
        style={{
          padding: '10px',
        }}
      >
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
      </div>
    </Container>
  );
};

export default AIConfig;
