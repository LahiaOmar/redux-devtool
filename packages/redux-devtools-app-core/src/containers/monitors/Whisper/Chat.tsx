import React, { FC, useEffect, useRef, useState } from 'react';
import { useAIModel } from './Model';

import styled from 'styled-components';
import { TActionsMapStates } from '.';
import { TModel } from '../../../components/Settings/AIConfig';
import { FaUser } from 'react-icons/fa';
import { PiWaveformBold } from 'react-icons/pi';
import { IconType } from 'react-icons';
import { useDispatch, useSelector } from 'react-redux';
import { CoreStoreState } from '../../../reducers'
import { getActiveInstance } from '../../../reducers/instances';
import { TWhisperMessages } from '../../../reducers/aiconfig';
import { clearMessages, saveMessages } from '../../../actions';
import { IoMdSend } from "react-icons/io";
import { AiOutlineClear } from "react-icons/ai";
import { Button } from '@redux-devtools/ui';


const ChatContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 10px;
  position: relative;
`;

const MessageContianer = styled.div`
  display: flex;
  width: 90%;
  padding: 5px;
  column-gap: 20px;
`

const LoadingState = styled.div`
  width: 30px;
  aspect-ratio: 4;
  background: radial-gradient(circle closest-side, #fff 90%, #ffffff00) 0/calc(100%/3) 100% space;
  clip-path: inset(0 100% 0 0);
  animation: l1 1s steps(4) infinite;
  @keyframes l1 {to{clip-path: inset(0 -34% 0 0)}}
`
const ModelMessage = styled(MessageContianer)``

const UserMessage = styled(MessageContianer)``

const createMessageIcon = (icon: IconType) => styled(icon)`
  width: 25px;
  height: 25px;
  flex-shrink: 0;
  padding: 10px;
  border: white 1px solid;
  border-radius: 50%;
`
const UserMessageIcon = createMessageIcon(FaUser)

const ModelMessageIcon = createMessageIcon(PiWaveformBold)

const TextMessage = styled.div`
  font-size: 15px;
  margin-top: 8px;
`;

const Message = ({ sender, message }: { sender: TWhisperMessages['sender']; message: string }) => {
  if (sender === 'model') {
    if(!message){
      return (
        <ModelMessage>
          <ModelMessageIcon />
          <LoadingState />
        </ModelMessage>
      )
    }

    return (
      <ModelMessage>
        <ModelMessageIcon />
        <TextMessage>{message}</TextMessage>
      </ModelMessage>
    );
  }

  return (
    <UserMessage>
      <UserMessageIcon />
      <TextMessage>{message}</TextMessage>
    </UserMessage>
  );
};

interface IChatWhisper {
  config: TModel;
  actionsMapStates: TActionsMapStates;
}

const Chat: FC<IChatWhisper> = ({ config, actionsMapStates }) => {
  const { modelAnswer } = useAIModel(config);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dispatch = useDispatch()
  const { instanceId, currentMessage, validConfig } = useSelector((state: CoreStoreState) => {
    const { messages, config } = state.whisper
    const instanceId = getActiveInstance(state.instances)
    const currentMessage = messages[instanceId] || []
    const validConfig = config.provider && config.model && config.model

    return {
      currentMessage,
      instanceId: String(instanceId),
      validConfig
    }
  });
  const [messages, setMessages] = useState<TWhisperMessages[]>([]);
  const [needModelResponse, setNeedModelResponse] = useState('')

  const handleSend = (msg: string) => {
    if (msg.trim()) {
      const userMessage = { sender: 'user', message: msg } as TWhisperMessages;
      const modelMessage = { sender: 'model', message: ''} as TWhisperMessages
      const _messages = [...messages, userMessage, modelMessage ] 

      setMessages(_messages)
      setNeedModelResponse(msg)
    }
  };
  
  const clearAllMessages = () => {
    dispatch(clearMessages(instanceId))
    setMessages([])
  }

  useEffect(()=> {
    if(currentMessage.length){
      setMessages(currentMessage)
    }
  }, [])

  useEffect(() => {
    const getModelResponse = async () => {
      if(needModelResponse){
        const modelResponse = await modelAnswer(needModelResponse, actionsMapStates);
        
        let _messages = [...messages]
        const modelMessage = _messages.pop();
        
        if(modelMessage){
          modelMessage.message = modelResponse
          _messages = _messages.concat(modelMessage)
          setMessages(_messages);
          dispatch(saveMessages(instanceId, _messages))
        }
        
        setNeedModelResponse('')
      }
    }

    getModelResponse().catch(console.error)
  }, [needModelResponse, actionsMapStates, messages])

  useEffect(() => {
    setMessages(currentMessage)
  }, [instanceId])

  useEffect(() => {
    if(containerRef.current){
      containerRef.current.scrollIntoView(false)
    }
  }, [messages])

  if(!validConfig){
    return (
      <ChatContainer>
        <h2>Please Provide the a Model Configuration</h2>
        <h3>Go to settings/redux-whisper</h3>
      </ChatContainer>
    )
  }

  return (
    <ChatContainer ref={containerRef}>
      {!messages.length && <h1>How can i help you ?</h1>}
      {messages.map((msg, index) => {
        return <Message key={index} sender={msg.sender} message={msg.message} />;
      })}
      <UserInput
        sendMessage={(msg) => {
          handleSend(msg);
        }}

        clearAllMessages={clearAllMessages}
      />
    </ChatContainer>
  );
};

const UserInputContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  row-gap: 10px;
  position: sticky;
  bottom: 0px;
  width: 100%;
  padding: 5px;
  column-gap: 20px;
`;

const Input = styled.input`
  width: 60%;
  height: 40px;
`;

const createChatIcon = (icon: IconType) => styled(icon)`
  width: 50px;
  height: 30px;
` 
const SendIcon = createChatIcon(IoMdSend)
const ClearIcon = createChatIcon(AiOutlineClear)

interface IUserInput {
  sendMessage: (msg: string) => void;
  clearAllMessages: () => void;
}
const UserInput: FC<IUserInput> = ({ sendMessage, clearAllMessages }) => {
  const [message, setMesage] = useState('');

  const userInputChange = (text: string) => {
    setMesage(text);
  };

  const onKeyUp = (ev: React.KeyboardEvent<HTMLInputElement>) => {
    if (ev.key === 'Enter') {
      sendHandler();
    }
  };

  const sendHandler = () => {
    sendMessage(message);
    setMesage('');
  };

  const clearMessagesHandler = () => {
    clearAllMessages()
  }

  return (
    <UserInputContainer>
      <Input
        value={message}
        onKeyUp={onKeyUp}
        onChange={(ev) => userInputChange(ev.target.value)}
      />
      <Button title='Send' onClick={sendHandler}> 
        <SendIcon />        
      </Button>
      <Button title='Clear Messages' onClick={clearMessagesHandler}>
        <ClearIcon />
      </Button>
    </UserInputContainer>
  );
};

export default Chat;
