'use client';

import { Response as AIResponse } from '@/components/ai-elements/response';

import { Conversation, ConversationContent, ConversationScrollButton, } from '@/components/ai-elements/conversation';
import { Message, MessageContent } from '@/components/ai-elements/message';
import {
  PromptInput,
  PromptInputButton,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from '@/components/ai-elements/prompt-input';
import { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { GlobeIcon, CopyIcon, RefreshCcwIcon, ThumbsUpIcon, ThumbsDownIcon, ShareIcon } from 'lucide-react';
import { Source, Sources, SourcesContent, SourcesTrigger, } from '@/components/ai-elements/source';
import { Reasoning, ReasoningContent, ReasoningTrigger, } from '@/components/ai-elements/reasoning';
import { Loader } from '@/components/ai-elements/loader';
import { Actions, Action } from '@/components/ai-elements/actions';
import { toast } from 'sonner';

const models = [
  {
    name: 'GPT 5',
    value: 'openai/gpt-5',
  },
  {
    name: 'Claude Opus 4.1',
    value: 'claude/opus-4.1',
  },
];

const ChatBotDemo = () => {
  const [input, setInput] = useState('');
  const [model, setModel] = useState<string>(models[0].value);
  const [webSearch, setWebSearch] = useState(false);
  const [likedMessages, setLikedMessages] = useState<Set<string>>(new Set());
  const [dislikedMessages, setDislikedMessages] = useState<Set<string>>(new Set());
  const { messages, sendMessage, status } = useChat();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(
        { text: input },
        {
          body: {
            model: model,
            webSearch: webSearch,
          },
        },
      );
      setInput('');
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleShare = async (text: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AI Chat Response',
          text: text,
        });
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          toast.error('Failed to share');
        }
      }
    } else {
      // Fallback to copy
      handleCopy(text);
    }
  };

  const handleLike = (messageId: string) => {
    const newLiked = new Set(likedMessages);
    const newDisliked = new Set(dislikedMessages);
    
    if (likedMessages.has(messageId)) {
      newLiked.delete(messageId);
    } else {
      newLiked.add(messageId);
      newDisliked.delete(messageId);
    }
    
    setLikedMessages(newLiked);
    setDislikedMessages(newDisliked);
    // Here you would typically send feedback to your backend
  };

  const handleDislike = (messageId: string) => {
    const newLiked = new Set(likedMessages);
    const newDisliked = new Set(dislikedMessages);
    
    if (dislikedMessages.has(messageId)) {
      newDisliked.delete(messageId);
    } else {
      newDisliked.add(messageId);
      newLiked.delete(messageId);
    }
    
    setLikedMessages(newLiked);
    setDislikedMessages(newDisliked);
    // Here you would typically send feedback to your backend
  };

  const handleRetry = () => {
    // Find the last user message and resend it
    const lastUserMessage = messages.findLast(m => m.role === 'user');
    if (lastUserMessage) {
      const userText = lastUserMessage.parts.find(p => p.type === 'text')?.text || '';
      if (userText) {
        sendMessage(
          { text: userText },
          {
            body: {
              model: model,
              webSearch: webSearch,
            },
          },
        );
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 relative size-full h-[calc(100vh-var(--header-height)-2rem)]">
      <div className="flex flex-col h-full">
        <Conversation className="h-full">
          <ConversationContent>
            {messages.map((message) => (
              <div key={message.id}>
                {message.role === 'assistant' && (
                  <Sources>
                    {message.parts.map((part, i) => {
                      switch (part.type) {
                        case 'source-url':
                          return (
                            <>
                              <SourcesTrigger
                                count={
                                  message.parts.filter(
                                    (part) => part.type === 'source-url',
                                  ).length
                                }
                              />
                              <SourcesContent key={`${message.id}-${i}`}>
                                <Source
                                  key={`${message.id}-${i}`}
                                  href={part.url}
                                  title={part.url}
                                />
                              </SourcesContent>
                            </>
                          );
                      }
                    })}
                  </Sources>
                )}
                <Message from={message.role} key={message.id}>
                  <MessageContent>
                    {message.parts.map((part, i) => {
                      switch (part.type) {
                        case 'text':
                          return (
                            <AIResponse key={`${message.id}-${i}`}>
                              {part.text}
                            </AIResponse>
                          );
                        case 'reasoning':
                          return (
                            <Reasoning
                              key={`${message.id}-${i}`}
                              className="w-full"
                              isStreaming={status === 'streaming'}
                            >
                              <ReasoningTrigger />
                              <ReasoningContent>{part.text}</ReasoningContent>
                            </Reasoning>
                          );
                        default:
                          return null;
                      }
                    })}
                  </MessageContent>
                </Message>
                {message.role === 'assistant' && (
                  <Actions>
                    <Action 
                      onClick={() => handleCopy(message.parts.filter(p => p.type === 'text').map(p => p.text).join(''))} 
                      tooltip="Copy"
                    >
                      <CopyIcon size={16} />
                    </Action>
                    <Action 
                      onClick={handleRetry} 
                      tooltip="Retry"
                    >
                      <RefreshCcwIcon size={16} />
                    </Action>
                    <Action 
                      onClick={() => handleLike(message.id)} 
                      tooltip="Like"
                      variant={likedMessages.has(message.id) ? 'default' : 'ghost'}
                    >
                      <ThumbsUpIcon size={16} />
                    </Action>
                    <Action 
                      onClick={() => handleDislike(message.id)} 
                      tooltip="Dislike"
                      variant={dislikedMessages.has(message.id) ? 'default' : 'ghost'}
                    >
                      <ThumbsDownIcon size={16} />
                    </Action>
                    <Action 
                      onClick={() => handleShare(message.parts.filter(p => p.type === 'text').map(p => p.text).join(''))} 
                      tooltip="Share"
                    >
                      <ShareIcon size={16} />
                    </Action>
                  </Actions>
                )}
              </div>
            ))}
            {status === 'submitted' && <Loader />}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <PromptInput onSubmit={handleSubmit} className="mt-4">
          <PromptInputTextarea
            onChange={(e) => setInput(e.target.value)}
            value={input}
          />
          <PromptInputToolbar>
            <PromptInputTools>
              <PromptInputButton
                variant={webSearch ? 'default' : 'ghost'}
                onClick={() => setWebSearch(!webSearch)}
              >
                <GlobeIcon size={16} />
                <span>Search</span>
              </PromptInputButton>
              <PromptInputModelSelect
                onValueChange={(value) => {
                  setModel(value);
                }}
                value={model}
              >
                <PromptInputModelSelectTrigger>
                  <PromptInputModelSelectValue />
                </PromptInputModelSelectTrigger>
                <PromptInputModelSelectContent>
                  {models.map((model) => (
                    <PromptInputModelSelectItem key={model.value} value={model.value}>
                      {model.name}
                    </PromptInputModelSelectItem>
                  ))}
                </PromptInputModelSelectContent>
              </PromptInputModelSelect>
            </PromptInputTools>
            <PromptInputSubmit disabled={!input} status={status} />
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </div>
  );
};

export default ChatBotDemo;