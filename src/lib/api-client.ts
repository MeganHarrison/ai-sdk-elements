const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8787';

export const apiClient = {
  chat: {
    async sendMessage(messages: any[], model: string, webSearch: boolean) {
      const response = await fetch(`${API_BASE_URL}/api/v1/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages, model, webSearch }),
      });
      return response;
    },
  },
  
  citation: {
    async generate(prompt: string) {
      const response = await fetch(`${API_BASE_URL}/api/v1/citation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });
      return response;
    },
  },
  
  rag: {
    async query(query: string, chatHistory: any[] = []) {
      const response = await fetch(`${API_BASE_URL}/api/v1/rag/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, chatHistory }),
      });
      return response;
    },
    
    async uploadDocument(content: string, metadata?: any) {
      const response = await fetch(`${API_BASE_URL}/api/v1/rag/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, metadata }),
      });
      return response.json();
    },
    
    async listDocuments() {
      const response = await fetch(`${API_BASE_URL}/api/v1/rag/documents`);
      return response.json();
    },
  },
};