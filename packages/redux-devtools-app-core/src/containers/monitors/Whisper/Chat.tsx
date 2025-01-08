import React, { FC, useState } from 'react'
import { useAIModel } from './Model'

import styled from 'styled-components';
import { TActionsMapStates } from '.';
import { TModel } from '../../../components/Settings/AIConfig';

const ChatContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 10px;
  position: relative;
`
const Message = styled.div`
  width: 80%;
`

interface IChatWhisper {
  config: TModel,
  actionsMapStates: TActionsMapStates
}

const Chat: FC<IChatWhisper> = ({ config , actionsMapStates }) => {
  const [messages, setMessages] = useState<{sender: string, text: string}[]>([]);
  const { modelAnswer } = useAIModel(config)

  const handleSend = async (msg: string) => {
    if (msg.trim()) {
      const userMessage = { sender: 'user', text: msg };
      setMessages([...messages, userMessage]);

      const modelResponse = await modelAnswer(msg, actionsMapStates);

      const modelMessage = { sender: 'model', text: modelResponse };
      setMessages([...messages, userMessage, modelMessage]);
    }
  };

  return (
    <ChatContainer>
      {
        !messages.length && (
          <h1>How can i help you ?</h1>
        )
      }
      {
        messages.map((msg, index) => {
          return (
            <Message key={index}>
              { msg.text }
            </Message>
          )
        })
      }
      <UserInput sendMessage={async (msg) => {
        await handleSend(msg)
      }} />
    </ChatContainer>
  );
}

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
`
const SendButton = styled.button`
  height: 40px;
  padding: 10px 15px 10px 15px;
  font-size: 15px;
  text-align: center;
`

const Input = styled.input`
  width: 60%;
  height: 40px;
`

interface IUserInput {
  sendMessage: (msg: string) => void;
}
const UserInput: FC<IUserInput> = ({ sendMessage }) => {
  const [message, setMesage] = useState('')
  const userInputChange = (text: string) => {
    setMesage(text)
  }
  
  return (
    <UserInputContainer>
      <Input value={message} onChange={(ev) => userInputChange(ev.target.value)}/>
      <SendButton onClick={() => {
        sendMessage(message) 
        setMesage('')
      }}>
        Send
      </SendButton>
    </UserInputContainer>
  )
}

export default Chat