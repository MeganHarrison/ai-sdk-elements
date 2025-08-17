import { useState, useCallback, useEffect } from 'react';

export interface ChatSession {
  id: string;
  session_title: string;
  context_type: string;
  context_id: string | null;
  message_count: number;
  started_at: string;
  last_activity: string;
}

export interface ChatHistoryMessage {
  role: 'user' | 'assistant';
  content: string;
  model_used?: string;
  created_at: string;
}

export interface UseChatHistoryOptions {
  userId?: string;
  autoLoad?: boolean;
}

export interface UseChatHistoryReturn {
  sessions: ChatSession[];
  isLoading: boolean;
  error: Error | null;
  loadSessions: () => Promise<void>;
  loadSessionMessages: (sessionId: string) => Promise<ChatHistoryMessage[]>;
  deleteSession?: (sessionId: string) => Promise<void>;
}

export function useChatHistory(options: UseChatHistoryOptions = {}): UseChatHistoryReturn {
  const { userId, autoLoad = true } = options;
  
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadSessions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      
      const response = await fetch(`/api/v1/ai-agent/sessions?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to load chat sessions');
      }
      
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to load chat sessions:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const loadSessionMessages = useCallback(async (sessionId: string): Promise<ChatHistoryMessage[]> => {
    try {
      const response = await fetch(`/api/v1/ai-agent/sessions/${sessionId}/messages`);
      
      if (!response.ok) {
        throw new Error('Failed to load session messages');
      }
      
      const data = await response.json();
      return data.messages || [];
    } catch (err) {
      console.error('Failed to load session messages:', err);
      throw err;
    }
  }, []);

  // Auto-load sessions on mount if enabled
  useEffect(() => {
    if (autoLoad) {
      loadSessions();
    }
  }, [autoLoad, loadSessions]);

  return {
    sessions,
    isLoading,
    error,
    loadSessions,
    loadSessionMessages,
  };
}