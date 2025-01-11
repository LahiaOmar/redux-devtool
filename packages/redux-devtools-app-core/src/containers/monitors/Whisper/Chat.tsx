import React, { FC, useEffect, useRef, useState } from 'react';
import { useAIModel } from './Model';

import styled from 'styled-components';
import { TActionsMapStates } from '.';
import { TModel } from '../../../components/Settings/AIConfig';
import { FaUser } from 'react-icons/fa';
import { PiWaveformBold } from 'react-icons/pi';
import { IconType } from 'react-icons';

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

const ModelMessage = styled(MessageContianer)``

const UserMessage = styled(MessageContianer)``

const createMessageIcon = (icon: IconType) => styled(icon)`
  width: 25px;
  height: 25px;
  flex-shrink: 0;
  padding: 10px;
  border: rgb(153 163 177) 1px solid;
  border-radius: 50%;
`
const UserMessageIcon = createMessageIcon(FaUser)

const ModelMessageIcon = createMessageIcon(PiWaveformBold)

const TextMessage = styled.div`
  font-size: 15px;
  margin-top: 8px;
`;

const Message = ({ sender, text }: { sender: TSender; text: string }) => {
  if (sender === 'model') {
    return (
      <ModelMessage>
        <ModelMessageIcon />
        <TextMessage>{text}</TextMessage>
      </ModelMessage>
    );
  }

  return (
    <UserMessage>
      <UserMessageIcon />
      <TextMessage>{text}</TextMessage>
    </UserMessage>
  );
};

interface IChatWhisper {
  config: TModel;
  actionsMapStates: TActionsMapStates;
}
type TSender = 'user' | 'model';
type TChatMessage = { sender: TSender; text: string };
const Chat: FC<IChatWhisper> = ({ config, actionsMapStates }) => {
  const [messages, setMessages] = useState<TChatMessage[]>([]);
  const { modelAnswer } = useAIModel(config);
  const containerRef = useRef<HTMLDivElement | null>(null)

  const handleSend = async (msg: string) => {
    if (msg.trim()) {
      const userMessage = { sender: 'user', text: msg } as TChatMessage;
      setMessages([...messages, userMessage]);

      const modelResponse = await modelAnswer(msg, actionsMapStates);

      const modelMessage = {
        sender: 'model',
        text: modelResponse,
      } as TChatMessage;
      setMessages([...messages, userMessage, modelMessage]);
    }
  };

  useEffect(() => {
    if(containerRef.current){
      containerRef.current.scrollIntoView(false)
    }
  }, [messages])

  return (
    <ChatContainer ref={containerRef}>
      {!messages.length && <h1>How can i help you ?</h1>}
      {messages.map((msg, index) => {
        return <Message key={index} sender={msg.sender} text={msg.text} />;
      })}
      <UserInput
        sendMessage={async (msg) => {
          await handleSend(msg);
        }}
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
const SendButton = styled.button`
  height: 40px;
  padding: 10px 15px 10px 15px;
  font-size: 15px;
  text-align: center;
`;

const Input = styled.input`
  width: 60%;
  height: 40px;
`;

interface IUserInput {
  sendMessage: (msg: string) => void;
}
const UserInput: FC<IUserInput> = ({ sendMessage }) => {
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

  return (
    <UserInputContainer>
      <Input
        value={message}
        onKeyUp={onKeyUp}
        onChange={(ev) => userInputChange(ev.target.value)}
      />
      <SendButton onClick={sendHandler}>Send</SendButton>
    </UserInputContainer>
  );
};

export default Chat;
