import { useState, useCallback } from 'react';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: Date;
}

export function useMessages(initialMessages: Message[] = []) {
  const [messages, setMessagesState] = useState<Message[]>(initialMessages);

  const addMessage = useCallback((message: Message) => {
    setMessagesState((prev) => [...prev, message]);
  }, []);

  const updateMessage = useCallback((id: string, updates: Partial<Message>) => {
    setMessagesState((prev) =>
      prev.map((msg) =>
        msg.id === id ? { ...msg, ...updates } : msg
      )
    );
  }, []);

  const removeMessage = useCallback((id: string) => {
    setMessagesState((prev) => prev.filter((msg) => msg.id !== id));
  }, []);

  const clearMessages = useCallback(() => {
    setMessagesState([]);
  }, []);

  return {
    messages,
    addMessage,
    updateMessage,
    removeMessage,
    clearMessages,
    setMessages: setMessagesState,
  };
}