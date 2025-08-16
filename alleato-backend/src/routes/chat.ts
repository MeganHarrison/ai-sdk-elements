import { Hono } from 'hono';
import { streamText, UIMessage, convertToModelMessages } from 'ai';
import { openai } from '@ai-sdk/openai';
import type { Env } from '../types/env';

export const chatRoutes = new Hono<{ Bindings: Env }>();

chatRoutes.post('/', async (c) => {
  const {
    messages,
    model,
    webSearch,
  }: { messages: UIMessage[]; model: string; webSearch: boolean } = await c.req.json();

  // For now, use OpenAI for all requests
  // TODO: Add Perplexity support when perplexity SDK is available
  const aiModel = openai(webSearch ? 'gpt-4o' : model, { 
    apiKey: c.env.OPENAI_API_KEY 
  });

  const result = streamText({
    model: aiModel,
    messages: convertToModelMessages(messages),
    system: 'You are a helpful assistant that can answer questions and help with tasks',
  });

  // Return the stream response
  const response = result.toDataStreamResponse({
    sendSources: true,
    sendReasoning: true,
  });

  return new Response(response.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
});