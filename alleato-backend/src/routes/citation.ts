import { Hono } from 'hono';
import { streamObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import type { Env } from '../types/env';

export const citationSchema = z.object({
  content: z.string(),
  citations: z.array(
    z.object({
      number: z.string(),
      title: z.string(),
      url: z.string(),
      description: z.string().optional(),
      quote: z.string().optional(),
    }),
  ),
});

export const citationRoutes = new Hono<{ Bindings: Env }>();

citationRoutes.post('/', async (c) => {
  const { prompt } = await c.req.json();

  const result = streamObject({
    model: openai('gpt-4o', { apiKey: c.env.OPENAI_API_KEY }),
    schema: citationSchema,
    prompt: `Generate a well-researched paragraph about ${prompt} with proper citations. 
    
    Include:
    - A comprehensive paragraph with inline citations marked as [1], [2], etc.
    - 2-3 citations with realistic source information
    - Each citation should have a title, URL, and optional description/quote
    - Make the content informative and the sources credible
    
    Format citations as numbered references within the text.`,
  });

  const response = result.toTextStreamResponse();
  
  return new Response(response.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
});