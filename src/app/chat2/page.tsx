'use client';

import { useChat } from '@ai-sdk/react';

export default function Page() {
  const { messages, sendMessage, status } =
    useChat();

  return (
    <div>
      {messages.map(message => (
        <div key={message.id}>
          <strong>{`${message.role}: `}</strong>
          {message.parts.map((part, index) => {
            switch (part.type) {
              case 'text':
                return <span key={index}>{part.text}</span>;

              // other cases can handle images, tool calls, etc
            }
          })}
        </div>
      ))}

      <form onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const input = formData.get('message') as string;
        if (input.trim()) {
          sendMessage({ text: input });
          e.currentTarget.reset();
        }
      }}>
        <input
          name="message"
          placeholder="Send a message..."
          disabled={status !== 'ready'}
        />
        <button type="submit" disabled={status !== 'ready'}>
          Send
        </button>
      </form>
    </div>
  );
}