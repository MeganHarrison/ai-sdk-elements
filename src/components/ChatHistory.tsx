import React, { useState } from 'react';
import { useChatHistory } from '@/hooks/useChatHistory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Clock, 
  MessageSquare, 
  ChevronRight, 
  Bot, 
  User,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import type { ChatHistoryMessage } from '@/hooks/useChatHistory';

interface ChatHistoryProps {
  userId?: string;
  onSelectSession?: (sessionId: string) => void;
  className?: string;
}

export function ChatHistory({ userId, onSelectSession, className }: ChatHistoryProps) {
  const { sessions, isLoading, error, loadSessions, loadSessionMessages } = useChatHistory({ userId });
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [sessionMessages, setSessionMessages] = useState<ChatHistoryMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);

  const handleViewSession = async (sessionId: string) => {
    setSelectedSession(sessionId);
    setIsLoadingMessages(true);
    setMessageDialogOpen(true);
    
    try {
      const messages = await loadSessionMessages(sessionId);
      setSessionMessages(messages);
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const formatSessionDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return formatDistanceToNow(date, { addSuffix: true });
    }
    return format(date, 'MMM d, yyyy h:mm a');
  };

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <p>Failed to load chat history</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadSessions}
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Chat History
          </CardTitle>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={loadSessions}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-3 border rounded-lg">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))}
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No chat history yet</p>
                <p className="text-sm mt-2">Your conversations will appear here</p>
              </div>
            ) : (
              <div className="space-y-2">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-3 border rounded-lg hover:bg-accent transition-colors cursor-pointer group"
                    onClick={() => onSelectSession ? onSelectSession(session.id) : handleViewSession(session.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate pr-2">
                          {session.session_title}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {session.message_count} messages
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatSessionDate(session.last_activity)}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Chat Session</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[500px] pr-4">
            {isLoadingMessages ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className={`flex gap-3 ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                    <Skeleton className="h-16 w-3/4" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {sessionMessages.map((message, index) => (
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
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs opacity-70">
                            {format(new Date(message.created_at), 'h:mm a')}
                          </p>
                          {message.model_used && (
                            <span className="text-xs opacity-70">
                              • {message.model_used}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Example usage in a dashboard
export function DashboardWithChatHistory() {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  return (
    <div className="container mx-auto p-4">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          {/* Main content area */}
          <Card>
            <CardHeader>
              <CardTitle>Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedSessionId ? (
                <p>Viewing session: {selectedSessionId}</p>
              ) : (
                <p>Select a chat session from the history</p>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Chat History Sidebar */}
        <div>
          <ChatHistory 
            onSelectSession={(sessionId) => {
              setSelectedSessionId(sessionId);
              // You could load the session into AIAgentChat here
            }}
          />
        </div>
      </div>
    </div>
  );
}