import React, { FC, useState } from 'react';
import { useAIModel } from './Model';

import styled from 'styled-components';
import { TActionsMapStates } from '.';
import { TModel } from '../../../components/Settings/AIConfig';
import { FaUser } from 'react-icons/fa';
import { PiWaveformBold } from 'react-icons/pi';

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
  width: 80%;
  padding: 15px;
  column-gap: 20px;
`

const ModelMessage = styled(MessageContianer)``

const UserMessage = styled(MessageContianer)``

const TextMessage = styled.div`
  font-size: 15px;
`;

const Message = ({ sender, text }: { sender: TSender; text: string }) => {
  if (sender === 'model') {
    return (
      <ModelMessage>
        <PiWaveformBold
          style={{
            width: '25px',
            height: '25px',
            flexShrink: '0',
          }}
        />

        <TextMessage>{text}</TextMessage>
      </ModelMessage>
    );
  }

  return (
    <UserMessage>
      <FaUser
        style={{
          width: '25px',
          height: '25px',
          flexShrink: '0',
        }}
      />
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

  return (
    <ChatContainer>
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
    console.log({ evkey: ev.key, ev });
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
