import { useState, useCallback, useRef } from 'react';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface UseAIAgentOptions {
  projectId?: string;
  mode?: 'recall' | 'strategy' | 'balanced';
  onError?: (error: Error) => void;
}

export interface UseAIAgentReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  sessionId: string | null;
  sendMessage: (message: string) => Promise<void>;
  clearMessages: () => void;
  submitFeedback: (queryId: string, rating: number, feedback?: string) => Promise<void>;
}

export function useAIAgent(options: UseAIAgentOptions = {}): UseAIAgentReturn {
  const { projectId, mode = 'balanced', onError } = options;
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (message: string) => {
    // Cancel any pending requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    
    // Add user message
    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/v1/ai-agent/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: message,
          projectId,
          sessionId,
          chatHistory: messages.map(m => ({
            role: m.role,
            content: m.content,
          })),
          mode,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`Chat request failed: ${response.status}`);
      }

      // Handle streaming response
      if (response.headers.get('content-type')?.includes('text/event-stream')) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let assistantMessage = '';
        let streamSessionId = sessionId;

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') continue;
                
                try {
                  const parsed = JSON.parse(data);
                  
                  // Check for session ID in response
                  if (parsed.sessionId && !streamSessionId) {
                    streamSessionId = parsed.sessionId;
                    setSessionId(streamSessionId);
                  }
                  
                  // Handle regular response content
                  if (parsed.response) {
                    assistantMessage += parsed.response;
                    
                    // Update message in real-time
                    setMessages(prev => {
                      const newMessages = [...prev];
                      const lastMessage = newMessages[newMessages.length - 1];
                      
                      if (lastMessage?.role === 'assistant') {
                        lastMessage.content = assistantMessage;
                      } else {
                        newMessages.push({
                          role: 'assistant',
                          content: assistantMessage,
                          timestamp: new Date(),
                        });
                      }
                      
                      return newMessages;
                    });
                  }
                } catch (e) {
                  // Ignore parsing errors
                }
              }
            }
          }
        }
      } else {
        // Handle regular JSON response
        const data = await response.json();
        
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        
        // Update session ID if provided
        if (data.sessionId) {
          setSessionId(data.sessionId);
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Chat error:', error);
        onError?.(error);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [messages, projectId, sessionId, mode, onError]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setSessionId(null);
  }, []);

  const submitFeedback = useCallback(async (
    queryId: string,
    rating: number,
    feedback?: string
  ) => {
    try {
      const response = await fetch('/api/v1/ai-agent/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          queryId,
          rating,
          feedback,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }
    } catch (error) {
      console.error('Feedback error:', error);
      onError?.(error as Error);
    }
  }, [onError]);

  return {
    messages,
    isLoading,
    sessionId,
    sendMessage,
    clearMessages,
    submitFeedback,
  };
}

// Hook for project insights
interface ProjectInsights {
  project?: {
    id: string;
    title: string;
    status: string;
    client?: string;
  };
  sentiment?: {
    current: number;
    trend: 'improving' | 'stable' | 'declining';
  };
  activeTasks?: Array<{
    description: string;
    assignedTo?: string;
    dueDate?: string;
    priority: string;
  }>;
  recentInsights?: Array<{
    category: string;
    text: string;
    meetingDate: string;
  }>;
  recentMeetings?: Array<{
    title: string;
    date: string;
    summary: string;
    keyPoints: string[];
  }>;
}

export function useProjectInsights(projectId: string) {
  const [insights, setInsights] = useState<ProjectInsights | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchInsights = useCallback(async () => {
    if (!projectId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/v1/ai-agent/project/${projectId}/summary`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch project insights');
      }
      
      const data = await response.json();
      setInsights(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  return {
    insights,
    isLoading,
    error,
    refetch: fetchInsights,
  };
}