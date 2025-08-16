import { Hono } from 'hono';
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import type { Env } from '../types/env';

export const ragRoutes = new Hono<{ Bindings: Env }>();

// Simple in-memory document store for demo
// In production, this would be stored in D1 or vector database
const documents = [
  {
    id: '1',
    content: 'Alleato is an AI-powered chat assistant that helps users with various tasks.',
    metadata: { source: 'about.md' }
  },
  {
    id: '2', 
    content: 'The RAG pipeline retrieves relevant documents and uses them to generate contextual responses.',
    metadata: { source: 'rag-overview.md' }
  }
];

ragRoutes.post('/query', async (c) => {
  const { query, chatHistory = [] } = await c.req.json();

  // Simple keyword search for demo
  // In production, use embeddings and vector search
  const relevantDocs = documents.filter(doc => 
    doc.content.toLowerCase().includes(query.toLowerCase())
  );

  const context = relevantDocs.length > 0
    ? `Context:\n${relevantDocs.map(doc => doc.content).join('\n\n')}`
    : 'No relevant documents found.';

  const messages = [
    ...chatHistory,
    {
      role: 'system',
      content: `You are a helpful AI assistant with access to a knowledge base. Use the following context to answer questions:

${context}

If the context doesn't contain relevant information, say so and provide a general response.`
    },
    {
      role: 'user',
      content: query
    }
  ];

  const result = streamText({
    model: openai('gpt-4o', { apiKey: c.env.OPENAI_API_KEY }),
    messages,
  });

  const response = result.toDataStreamResponse();
  
  return new Response(response.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
});

// Upload document endpoint
ragRoutes.post('/documents', async (c) => {
  const { content, metadata } = await c.req.json();
  
  // In production, store in D1 or vector database
  const newDoc = {
    id: String(documents.length + 1),
    content,
    metadata: metadata || {}
  };
  
  documents.push(newDoc);
  
  return c.json({ 
    message: 'Document uploaded successfully',
    document: newDoc 
  });
});

// List documents endpoint
ragRoutes.get('/documents', async (c) => {
  return c.json({ documents });
});