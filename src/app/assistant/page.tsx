'use client';

import { AIAssistantWithHistory } from '@/components/AIAssistantWithHistory';

export default function AssistantPage() {
  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">AI Project Assistant</h1>
      <p className="text-muted-foreground mb-8">
        Ask questions about your meetings and projects. View your chat history to continue previous conversations.
      </p>
      
      <AIAssistantWithHistory 
        className="h-[700px]"
      />
    </div>
  );
}