import React, { useState } from 'react';
import { useAIAgent } from '@/hooks/useAIAgent';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, Bot, User } from 'lucide-react';

interface AIAgentChatProps {
  projectId?: string;
  className?: string;
}

export function AIAgentChat({ projectId, className }: AIAgentChatProps) {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'recall' | 'strategy' | 'balanced'>('balanced');
  
  const { 
    messages, 
    isLoading, 
    sendMessage, 
    clearMessages 
  } = useAIAgent({ 
    projectId, 
    mode,
    onError: (error) => {
      console.error('AI Agent error:', error);
      // You could show a toast notification here
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const message = input;
    setInput('');
    await sendMessage(message);
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          AI Project Assistant
        </CardTitle>
        <div className="flex items-center gap-2">
          <Select value={mode} onValueChange={(v) => setMode(v as 'recall' | 'strategy' | 'balanced')}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recall">Recall Mode</SelectItem>
              <SelectItem value="strategy">Strategy Mode</SelectItem>
              <SelectItem value="balanced">Balanced</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="sm"
            onClick={clearMessages}
          >
            Clear
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col h-[500px]">
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Ask me anything about your meetings and projects!</p>
                <p className="text-sm mt-2">
                  {mode === 'recall' && "I'll help you recall specific details from meetings."}
                  {mode === 'strategy' && "I'll provide strategic insights and recommendations."}
                  {mode === 'balanced' && "I'll balance factual recall with strategic guidance."}
                </p>
              </div>
            )}
            
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div className={`flex gap-3 max-w-[80%] ${
                  message.role === 'user' ? 'flex-row-reverse' : ''
                }`}>
                  <div className="flex-shrink-0">
                    {message.role === 'user' ? (
                      <User className="h-8 w-8 rounded-full bg-primary text-primary-foreground p-1.5" />
                    ) : (
                      <Bot className="h-8 w-8 rounded-full bg-secondary text-secondary-foreground p-1.5" />
                    )}
                  </div>
                  <div className={`rounded-lg px-4 py-2 ${
                    message.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-secondary'
                  }`}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <Bot className="h-8 w-8 rounded-full bg-secondary text-secondary-foreground p-1.5" />
                <div className="bg-secondary rounded-lg px-4 py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              projectId 
                ? "Ask about this project..." 
                : "Ask about any project or meeting..."
            }
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
        
        <div className="mt-2 text-xs text-muted-foreground">
          {projectId && `Focused on current project • `}
          {mode === 'recall' && "Factual mode - I'll stick to what was discussed"}
          {mode === 'strategy' && "Strategic mode - I'll provide insights and recommendations"}
          {mode === 'balanced' && "Balanced mode - Facts with strategic context"}
        </div>
      </CardContent>
    </Card>
  );
}

// Example usage in a project page
export function ProjectPageExample({ projectId }: { projectId: string }) {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Project Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-2">
        {/* Other project components */}
        <div>
          {/* Project details, tasks, etc. */}
        </div>
        
        {/* AI Agent Chat */}
        <AIAgentChat projectId={projectId} />
      </div>
    </div>
  );
}