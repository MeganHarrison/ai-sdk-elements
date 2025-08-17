import React, { useState } from 'react';
import { AIAgentChat } from './AIAgentChat';
import { ChatHistory } from './ChatHistory';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, History } from 'lucide-react';

interface AIAssistantWithHistoryProps {
  projectId?: string;
  userId?: string;
  className?: string;
}

export function AIAssistantWithHistory({ 
  projectId, 
  userId, 
  className 
}: AIAssistantWithHistoryProps) {
  const [activeTab, setActiveTab] = useState('chat');

  return (
    <Card className={className}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="chat" className="p-0 h-full">
          <AIAgentChat 
            projectId={projectId} 
            className="border-0 shadow-none"
          />
        </TabsContent>
        
        <TabsContent value="history" className="p-0 h-full">
          <ChatHistory 
            userId={userId}
            className="border-0 shadow-none"
            onSelectSession={(sessionId) => {
              // Switch back to chat tab when selecting a session
              setActiveTab('chat');
              // TODO: Load the selected session into the chat
              console.log('Selected session:', sessionId);
            }}
          />
        </TabsContent>
      </Tabs>
    </Card>
  );
}

// Example usage in a full-page layout
export function AIAssistantPage() {
  return (
    <div className="container mx-auto p-4">
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Main content area */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h1 className="text-2xl font-bold mb-4">Project Dashboard</h1>
            <p className="text-muted-foreground">
              Your project information and analytics would go here.
            </p>
          </Card>
        </div>
        
        {/* AI Assistant Sidebar */}
        <div className="lg:col-span-1">
          <AIAssistantWithHistory 
            className="h-[600px]"
            // projectId="specific-project-id" // Optional: focus on specific project
            // userId="user-123" // Optional: filter history by user
          />
        </div>
      </div>
    </div>
  );
}

// Example standalone full-width assistant
export function FullWidthAIAssistant() {
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center">AI Project Assistant</h1>
      <AIAssistantWithHistory 
        className="h-[700px]"
      />
    </div>
  );
}