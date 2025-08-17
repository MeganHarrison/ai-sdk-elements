const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8787';

export const apiClient = {
  chat: {
    async sendMessage(messages: Array<{ role: string; content: string }>, model: string, webSearch: boolean) {
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
    async query(query: string, chatHistory: Array<{ role: string; content: string }> = []) {
      const response = await fetch(`${API_BASE_URL}/api/v1/rag/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, chatHistory }),
      });
      return response;
    },
    
    async uploadDocument(content: string, metadata?: Record<string, unknown>) {
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
  
  meetings: {
    async list() {
      const response = await fetch(`${API_BASE_URL}/api/v1/meetings`);
      return response.json();
    },
    
    async get(id: string) {
      const response = await fetch(`${API_BASE_URL}/api/v1/meetings/${id}`);
      return response.json();
    },
    
    async create(meeting: Record<string, unknown>) {
      const response = await fetch(`${API_BASE_URL}/api/v1/meetings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(meeting),
      });
      return response.json();
    },
    
    async update(id: string, meeting: Record<string, unknown>) {
      const response = await fetch(`${API_BASE_URL}/api/v1/meetings/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(meeting),
      });
      return response.json();
    },
    
    async delete(id: string) {
      const response = await fetch(`${API_BASE_URL}/api/v1/meetings/${id}`, {
        method: 'DELETE',
      });
      return response.json();
    },
  },
  
  database: {
    async getTables() {
      const response = await fetch(`${API_BASE_URL}/api/v1/database/tables`);
      return response.json();
    },
    
    async getTableSchema(tableName: string) {
      const response = await fetch(`${API_BASE_URL}/api/v1/database/tables/${tableName}/schema`);
      return response.json();
    },
    
    async getTableData(tableName: string, options: {
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      search?: string;
    } = {}) {
      const params = new URLSearchParams();
      if (options.page) params.append('page', options.page.toString());
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.sortBy) params.append('sortBy', options.sortBy);
      if (options.sortOrder) params.append('sortOrder', options.sortOrder);
      if (options.search) params.append('search', options.search);
      
      const response = await fetch(`${API_BASE_URL}/api/v1/database/tables/${tableName}/data?${params}`);
      return response.json();
    },
    
    async getColumnValues(tableName: string, columnName: string) {
      const response = await fetch(`${API_BASE_URL}/api/v1/database/tables/${tableName}/column/${columnName}/values`);
      return response.json();
    },
  },
};