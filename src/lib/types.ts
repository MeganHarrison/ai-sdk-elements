export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: Date;
  parts?: Array<{
    type: string;
    text?: string;
    [key: string]: any;
  }>;
  metadata?: {
    [key: string]: any;
  };
}

export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Chat {
  id: string;
  title: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  messages: ChatMessage[];
}

export interface Document {
  id: string;
  title: string;
  content: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type MessageRole = 'user' | 'assistant' | 'system';

export type ArtifactStatus = 'idle' | 'streaming' | 'complete';

export interface ArtifactData {
  status: ArtifactStatus;
  isVisible: boolean;
  content?: string;
  title?: string;
  type?: string;
  documentId?: string;
}

export interface CustomUIDataTypes {
  'code': {
    code: string;
  };
  'text': {
    text: string;
  };
  'sheet': {
    csv: string;
  };
  'codeDelta': {
    data: string;
  };
  'textDelta': {
    data: string;
  };
  'sheetDelta': {
    data: string;
  };
  'imageDelta': {
    data: string;
  };
  'suggestion': {
    data: any;
  };
}

export interface Attachment {
  id: string;
  name: string;
  contentType: string;
  size: number;
  url?: string;
  data?: ArrayBuffer;
}